import { prisma } from '../../prisma/client.js';
import { OfferStatus, TemplateCategory, AuditAction, AiTaskType } from '@prisma/client';
import { AppError, NotFoundError, ValidationError, ForbiddenError } from '../../errors/app-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AiService } from '../ai/ai.service.js';
import { computeSnapshotDiff } from './offer-diff.util.js';
import { OfferTemplateUtil } from './offer-template.util.js';
import {
  CreateOfferInput,
  SaveDraftInput,
  UpdateOfferInput,
  OfferStatusTransitionInput,
  AiClauseGenerationInput,
  AiSuggestionsInput,
  OfferPreviewResult,
} from './offer.types.js';

export class OfferService {
  /**
   * Generates a sequential reference number: OFF-YYYYMM-XXXX
   */
  private static async generateReferenceNumber(companyId: string): Promise<string> {
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const count = await prisma.offer.count({ where: { companyId } });
    const suffix = String(count + 1).padStart(4, '0');
    return `OFF-${datePrefix}-${suffix}`;
  }

  /**
   * Retrieves or automatically seeds a default company template version if none exists
   */
  private static async getOrCreateDefaultTemplateVersion(
    companyId: string,
    userId: string
  ): Promise<string> {
    const existing = await prisma.templateVersion.findFirst({
      where: { template: { companyId, isActive: true } },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return existing.id;
    }

    // Auto-create a default template & version
    const defaultMarkup = OfferTemplateUtil.getDefaultTemplateMarkup();
    const template = await prisma.offerTemplate.create({
      data: {
        companyId,
        title: 'Standard Employment Agreement Template',
        description: 'Default organization template with full compensation and terms schedule',
        category: TemplateCategory.FULL_TIME,
        isActive: true,
        createdBy: userId,
      },
    });

    const version = await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        versionNumber: 1,
        contentMarkup: defaultMarkup.contentMarkup,
        headerMarkup: defaultMarkup.headerMarkup,
        footerMarkup: defaultMarkup.footerMarkup,
        styleCss: defaultMarkup.styleCss,
        changeSummary: 'Initial default template version',
        isPublished: true,
        createdBy: userId,
      },
    });

    await prisma.offerTemplate.update({
      where: { id: template.id },
      data: { currentVersionId: version.id },
    });

    return version.id;
  }

  /**
   * Helper: Resolves candidate ID, creating or updating candidate details if necessary
   */
  private static async resolveCandidate(
    companyId: string,
    candidateId?: string,
    candidateDetails?: any
  ): Promise<string> {
    if (candidateId) {
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, companyId, deletedAt: null },
      });
      if (!candidate) throw new NotFoundError('Candidate');
      return candidate.id;
    }

    if (!candidateDetails || !candidateDetails.email) {
      throw new ValidationError('Candidate details with valid email are required');
    }

    // Resolve candidate by companyId and email
    let candidate = await prisma.candidate.findFirst({
      where: {
        companyId,
        email: candidateDetails.email,
        deletedAt: null,
      },
    });

    if (candidate) {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          firstName: candidateDetails.firstName || candidate.firstName,
          lastName: candidateDetails.lastName || candidate.lastName,
          phone: candidateDetails.phone !== undefined ? candidateDetails.phone : candidate.phone,
          currentTitle: candidateDetails.currentTitle !== undefined ? candidateDetails.currentTitle : candidate.currentTitle,
          currentEmployer: candidateDetails.currentEmployer !== undefined ? candidateDetails.currentEmployer : candidate.currentEmployer,
          currentLocation: candidateDetails.currentLocation !== undefined ? candidateDetails.currentLocation : candidate.currentLocation,
          experienceYears: candidateDetails.experienceYears !== undefined ? candidateDetails.experienceYears : candidate.experienceYears,
        },
      });
    } else {
      candidate = await prisma.candidate.create({
        data: {
          companyId,
          email: candidateDetails.email,
          firstName: candidateDetails.firstName || 'Candidate',
          lastName: candidateDetails.lastName || '',
          phone: candidateDetails.phone || null,
          currentTitle: candidateDetails.currentTitle || null,
          currentEmployer: candidateDetails.currentEmployer || null,
          currentLocation: candidateDetails.currentLocation || null,
          experienceYears: candidateDetails.experienceYears !== undefined ? candidateDetails.experienceYears : null,
        },
      });
    }

    return candidate.id;
  }

  /**
   * 1. CREATE OFFER (Strict validation, sets initial version and status)
   */
  static async createOffer(
    companyId: string,
    userId: string,
    input: CreateOfferInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const candidateId = await this.resolveCandidate(companyId, input.candidateId, input.candidateDetails);

    const templateVersionId =
      input.templateVersionId || (await this.getOrCreateDefaultTemplateVersion(companyId, userId));

    const offerReferenceNumber = await this.generateReferenceNumber(companyId);

    // Calculate total CTC if omitted
    const base = Number(input.compensation.baseSalary || 0);
    const hra = Number(input.compensation.hraAllowance || 0);
    const special = Number(input.compensation.specialAllowances || 0);
    const bonus = Number(input.compensation.performanceBonus || 0);
    const joinBonus = Number(input.compensation.joiningBonus || 0);
    const totalCtc = input.compensation.totalCtc !== undefined ? Number(input.compensation.totalCtc) : base + hra + special + bonus + joinBonus;

    // Build structured HR-confirmed terms
    const hrConfirmedTerms: Record<string, unknown> = {
      probation: input.probation || {
        durationMonths: 3,
        terms: 'Standard 3 months probation period',
        isConfirmedByHr: true,
      },
      noticePeriod: input.noticePeriod || {
        days: 30,
        probationDays: 15,
        terms: '30 days standard notice period',
        isConfirmedByHr: true,
      },
      workingHours: input.workingHours || {
        hoursPerWeek: 40,
        schedule: 'Monday to Friday, 9:00 AM - 6:00 PM',
        workModel: 'HYBRID',
        isConfirmedByHr: true,
      },
      termsAndClauses: input.termsAndClauses || [],
      additionalTerms: input.additionalHrTerms || {},
      sensitiveFieldsVerifiedByHuman: true,
    };

    const initialStatus = OfferStatus.HR_REVIEW;

    const offer = await prisma.$transaction(async (tx) => {
      const createdOffer = await tx.offer.create({
        data: {
          companyId,
          candidateId,
          templateVersionId,
          offerReferenceNumber,
          currentStatus: initialStatus,
          currentVersionNumber: 1,
          jobTitle: input.jobTitle,
          department: input.department,
          bandGrade: input.bandGrade || null,
          reportingManagerName: input.reportingManagerName || null,
          reportingManagerTitle: input.reportingManagerTitle || null,
          workLocation: input.workLocation,
          employmentType: input.employmentType || TemplateCategory.FULL_TIME,
          proposedJoiningDate: new Date(input.proposedJoiningDate),
          currency: input.compensation.currency || 'USD',
          baseSalary: base,
          hraAllowance: hra,
          specialAllowances: special,
          performanceBonus: bonus,
          joiningBonus: joinBonus,
          totalCtc: totalCtc,
          equityDetails: (input.compensation.equityDetails as any) || undefined,
          benefitsSummary: input.compensation.benefitsSummary || [],
          hrConfirmedTerms: hrConfirmedTerms as any,
          humanOverrides: (input.humanOverrides as any) || [],
          aiExtractedDataId: input.aiExtractedDataId || null,
          aiSuggestedTerms: (input.aiSuggestedTerms as any) || {},
          assignedRecruiterId: userId,
          offerValidUntil: input.offerValidUntil ? new Date(input.offerValidUntil) : null,
          createdBy: userId,
        },
        include: {
          candidate: true,
          templateVersion: { include: { template: true } },
        },
      });

      // Create snapshot for Version 1
      const snapshotTerms = {
        offerReferenceNumber,
        jobTitle: input.jobTitle,
        department: input.department,
        workLocation: input.workLocation,
        employmentType: input.employmentType,
        proposedJoiningDate: input.proposedJoiningDate,
        compensation: {
          currency: input.compensation.currency || 'USD',
          baseSalary: base,
          hraAllowance: hra,
          specialAllowances: special,
          performanceBonus: bonus,
          joiningBonus: joinBonus,
          totalCtc: totalCtc,
          equityDetails: input.compensation.equityDetails,
          benefitsSummary: input.compensation.benefitsSummary,
        },
        hrConfirmedTerms,
        offerValidUntil: input.offerValidUntil,
      };

      await tx.offerVersion.create({
        data: {
          offerId: createdOffer.id,
          versionNumber: 1,
          templateVersionId,
          snapshotTerms: snapshotTerms as any,
          diffFromPrevious: { _initial: { from: null, to: 'Version 1 created' } } as any,
          changeReason: 'Initial offer creation',
          createdBy: userId,
        },
      });

      // Create status log
      await tx.offerStatusLog.create({
        data: {
          offerId: createdOffer.id,
          fromStatus: OfferStatus.DRAFT_AI,
          toStatus: initialStatus,
          changedByUserId: userId,
          reasonNotes: 'Offer created and moved to HR Review',
        },
      });

      return createdOffer;
    });

    // Record audit log
    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offer.id,
      action: 'CREATE',
      actionDescription: `Created offer ${offer.offerReferenceNumber} for ${offer.candidate.firstName} ${offer.candidate.lastName}`,
      newState: { id: offer.id, reference: offer.offerReferenceNumber, status: offer.currentStatus },
      ipAddress,
      userAgent,
    });

    return offer;
  }

  /**
   * 2. SAVE DRAFT (Permissive validation for work-in-progress, supports creating or updating a draft)
   */
  static async saveDraft(
    companyId: string,
    userId: string,
    offerId: string | null,
    input: SaveDraftInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (offerId) {
      // Update existing draft
      return this.updateOffer(companyId, userId, offerId, {
        ...input,
        changeReason: input.changeReason || 'Saved draft changes',
      }, ipAddress, userAgent);
    }

    // Create new draft
    let candidateId: string;
    if (input.candidateId) {
      candidateId = input.candidateId;
    } else if (input.candidateDetails?.email) {
      candidateId = await this.resolveCandidate(companyId, undefined, input.candidateDetails);
    } else {
      // Create a placeholder draft candidate
      const defaultCandidate = await prisma.candidate.create({
        data: {
          companyId,
          email: `draft.${Date.now()}@draft-internal.local`,
          firstName: input.candidateDetails?.firstName || 'Draft',
          lastName: input.candidateDetails?.lastName || 'Candidate',
        },
      });
      candidateId = defaultCandidate.id;
    }

    const templateVersionId =
      input.templateVersionId || (await this.getOrCreateDefaultTemplateVersion(companyId, userId));

    const offerReferenceNumber = await this.generateReferenceNumber(companyId);

    const base = Number(input.compensation?.baseSalary || 0);
    const hra = Number(input.compensation?.hraAllowance || 0);
    const special = Number(input.compensation?.specialAllowances || 0);
    const bonus = Number(input.compensation?.performanceBonus || 0);
    const joinBonus = Number(input.compensation?.joiningBonus || 0);
    const totalCtc = input.compensation?.totalCtc !== undefined ? Number(input.compensation.totalCtc) : base + hra + special + bonus + joinBonus;

    const hrConfirmedTerms: Record<string, unknown> = {
      probation: input.probation || { durationMonths: 3, terms: 'Standard probation' },
      noticePeriod: input.noticePeriod || { days: 30, probationDays: 15 },
      workingHours: input.workingHours || { hoursPerWeek: 40, schedule: 'Standard 40 hours/week' },
      termsAndClauses: input.termsAndClauses || [],
      additionalTerms: input.additionalHrTerms || {},
      isDraft: true,
    };

    const draftStatus = OfferStatus.DRAFT_AI;

    const offer = await prisma.$transaction(async (tx) => {
      const createdDraft = await tx.offer.create({
        data: {
          companyId,
          candidateId,
          templateVersionId,
          offerReferenceNumber,
          currentStatus: draftStatus,
          currentVersionNumber: 1,
          jobTitle: input.jobTitle || 'Draft Offer',
          department: input.department || 'General',
          bandGrade: input.bandGrade || null,
          reportingManagerName: input.reportingManagerName || null,
          reportingManagerTitle: input.reportingManagerTitle || null,
          workLocation: input.workLocation || 'Remote / TBD',
          employmentType: input.employmentType || TemplateCategory.FULL_TIME,
          proposedJoiningDate: input.proposedJoiningDate ? new Date(input.proposedJoiningDate) : new Date(Date.now() + 30 * 86400000),
          currency: input.compensation?.currency || 'USD',
          baseSalary: base,
          hraAllowance: hra,
          specialAllowances: special,
          performanceBonus: bonus,
          joiningBonus: joinBonus,
          totalCtc: totalCtc,
          equityDetails: (input.compensation?.equityDetails as any) || undefined,
          benefitsSummary: input.compensation?.benefitsSummary || [],
          hrConfirmedTerms: hrConfirmedTerms as any,
          humanOverrides: [],
          aiExtractedDataId: input.aiExtractedDataId || null,
          aiSuggestedTerms: (input.aiSuggestedTerms as any) || {},
          assignedRecruiterId: userId,
          offerValidUntil: input.offerValidUntil ? new Date(input.offerValidUntil) : null,
          createdBy: userId,
        },
        include: {
          candidate: true,
          templateVersion: true,
        },
      });

      await tx.offerVersion.create({
        data: {
          offerId: createdDraft.id,
          versionNumber: 1,
          templateVersionId,
          snapshotTerms: {
            isDraft: true,
            jobTitle: createdDraft.jobTitle,
            department: createdDraft.department,
            totalCtc,
            hrConfirmedTerms,
          } as any,
          diffFromPrevious: { _initial: { from: null, to: 'Draft created' } } as any,
          changeReason: input.changeReason || 'Initial draft saved',
          createdBy: userId,
        },
      });

      await tx.offerStatusLog.create({
        data: {
          offerId: createdDraft.id,
          fromStatus: OfferStatus.DRAFT_AI,
          toStatus: draftStatus,
          changedByUserId: userId,
          reasonNotes: 'Draft offer created',
        },
      });

      return createdDraft;
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offer.id,
      action: 'CREATE',
      actionDescription: `Saved new draft offer ${offer.offerReferenceNumber}`,
      newState: { id: offer.id, isDraft: true },
      ipAddress,
      userAgent,
    });

    return offer;
  }

  /**
   * 3. UPDATE OFFER (Creates new version with snapshot & diff, updates current values)
   */
  static async updateOffer(
    companyId: string,
    userId: string,
    offerId: string,
    input: UpdateOfferInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
      },
    });

    if (!existing) {
      throw new NotFoundError('Offer');
    }

    if (([OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.EXPIRED] as string[]).includes(existing.currentStatus)) {
      throw new ForbiddenError(`Cannot update an offer in ${existing.currentStatus} status`);
    }

    // Update candidate details if provided
    if (input.candidateDetails) {
      await prisma.candidate.update({
        where: { id: existing.candidateId },
        data: {
          firstName: input.candidateDetails.firstName !== undefined ? input.candidateDetails.firstName : undefined,
          lastName: input.candidateDetails.lastName !== undefined ? input.candidateDetails.lastName : undefined,
          email: input.candidateDetails.email !== undefined ? input.candidateDetails.email : undefined,
          phone: input.candidateDetails.phone !== undefined ? input.candidateDetails.phone : undefined,
          currentTitle: input.candidateDetails.currentTitle !== undefined ? input.candidateDetails.currentTitle : undefined,
          currentEmployer: input.candidateDetails.currentEmployer !== undefined ? input.candidateDetails.currentEmployer : undefined,
          currentLocation: input.candidateDetails.currentLocation !== undefined ? input.candidateDetails.currentLocation : undefined,
          experienceYears: input.candidateDetails.experienceYears !== undefined ? input.candidateDetails.experienceYears : undefined,
        },
      });
    }

    // Recompute financials
    const base = input.compensation?.baseSalary !== undefined ? Number(input.compensation.baseSalary) : Number(existing.baseSalary);
    const hra = input.compensation?.hraAllowance !== undefined ? Number(input.compensation.hraAllowance) : Number(existing.hraAllowance);
    const special = input.compensation?.specialAllowances !== undefined ? Number(input.compensation.specialAllowances) : Number(existing.specialAllowances);
    const bonus = input.compensation?.performanceBonus !== undefined ? Number(input.compensation.performanceBonus) : Number(existing.performanceBonus);
    const joinBonus = input.compensation?.joiningBonus !== undefined ? Number(input.compensation.joiningBonus) : Number(existing.joiningBonus);
    const totalCtc = input.compensation?.totalCtc !== undefined ? Number(input.compensation.totalCtc) : base + hra + special + bonus + joinBonus;

    // Merge confirmed terms
    const previousConfirmed = (existing.hrConfirmedTerms as Record<string, unknown>) || {};
    const updatedHrConfirmedTerms: Record<string, unknown> = {
      ...previousConfirmed,
      probation: input.probation || previousConfirmed.probation,
      noticePeriod: input.noticePeriod || previousConfirmed.noticePeriod,
      workingHours: input.workingHours || previousConfirmed.workingHours,
      termsAndClauses: input.termsAndClauses || previousConfirmed.termsAndClauses || [],
      additionalTerms: input.additionalHrTerms || previousConfirmed.additionalTerms || {},
      sensitiveFieldsVerifiedByHuman: true,
    };

    const nextVersionNumber = existing.currentVersionNumber + 1;
    const templateVersionId = input.templateVersionId || existing.templateVersionId;

    const newSnapshot = {
      offerReferenceNumber: existing.offerReferenceNumber,
      jobTitle: input.jobTitle || existing.jobTitle,
      department: input.department || existing.department,
      bandGrade: input.bandGrade !== undefined ? input.bandGrade : existing.bandGrade,
      workLocation: input.workLocation || existing.workLocation,
      employmentType: input.employmentType || existing.employmentType,
      proposedJoiningDate: input.proposedJoiningDate || existing.proposedJoiningDate.toISOString(),
      reportingManagerName: input.reportingManagerName !== undefined ? input.reportingManagerName : existing.reportingManagerName,
      reportingManagerTitle: input.reportingManagerTitle !== undefined ? input.reportingManagerTitle : existing.reportingManagerTitle,
      compensation: {
        currency: input.compensation?.currency || existing.currency,
        baseSalary: base,
        hraAllowance: hra,
        specialAllowances: special,
        performanceBonus: bonus,
        joiningBonus: joinBonus,
        totalCtc: totalCtc,
      },
      hrConfirmedTerms: updatedHrConfirmedTerms,
      offerValidUntil: input.offerValidUntil !== undefined ? input.offerValidUntil : existing.offerValidUntil?.toISOString(),
    };

    const previousSnapshot = (existing.versions[0]?.snapshotTerms as Record<string, unknown>) || null;
    const diff = computeSnapshotDiff(previousSnapshot, newSnapshot);

    const updatedOffer = await prisma.$transaction(async (tx) => {
      const updated = await tx.offer.update({
        where: { id: offerId },
        data: {
          jobTitle: input.jobTitle !== undefined ? input.jobTitle : undefined,
          department: input.department !== undefined ? input.department : undefined,
          bandGrade: input.bandGrade !== undefined ? input.bandGrade : undefined,
          workLocation: input.workLocation !== undefined ? input.workLocation : undefined,
          employmentType: input.employmentType !== undefined ? input.employmentType : undefined,
          proposedJoiningDate: input.proposedJoiningDate ? new Date(input.proposedJoiningDate) : undefined,
          reportingManagerName: input.reportingManagerName !== undefined ? input.reportingManagerName : undefined,
          reportingManagerTitle: input.reportingManagerTitle !== undefined ? input.reportingManagerTitle : undefined,
          currency: input.compensation?.currency !== undefined ? input.compensation.currency : undefined,
          baseSalary: base,
          hraAllowance: hra,
          specialAllowances: special,
          performanceBonus: bonus,
          joiningBonus: joinBonus,
          totalCtc: totalCtc,
          equityDetails: input.compensation?.equityDetails !== undefined ? (input.compensation.equityDetails as any) : undefined,
          benefitsSummary: input.compensation?.benefitsSummary !== undefined ? input.compensation.benefitsSummary : undefined,
          hrConfirmedTerms: updatedHrConfirmedTerms as any,
          templateVersionId,
          offerValidUntil: input.offerValidUntil !== undefined ? (input.offerValidUntil ? new Date(input.offerValidUntil) : null) : undefined,
          currentVersionNumber: nextVersionNumber,
          currentStatus: existing.currentStatus === OfferStatus.APPROVED ? OfferStatus.REVISED : existing.currentStatus,
        },
        include: {
          candidate: true,
          templateVersion: true,
          versions: { orderBy: { versionNumber: 'desc' } },
        },
      });

      await tx.offerVersion.create({
        data: {
          offerId,
          versionNumber: nextVersionNumber,
          templateVersionId,
          snapshotTerms: newSnapshot as any,
          diffFromPrevious: diff as any,
          changeReason: input.changeReason || `Revision to version ${nextVersionNumber}`,
          createdBy: userId,
        },
      });

      return updated;
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offerId,
      action: 'UPDATE',
      actionDescription: `Updated offer ${existing.offerReferenceNumber} to Version ${nextVersionNumber}: ${input.changeReason || 'Offer updated'}`,
      previousState: previousSnapshot,
      newState: newSnapshot,
      ipAddress,
      userAgent,
    });

    return updatedOffer;
  }

  /**
   * GET OFFER BY ID
   */
  static async getOfferById(companyId: string, offerId: string) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        templateVersion: { include: { template: true } },
        recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
        approver: { select: { id: true, firstName: true, lastName: true, email: true } },
        versions: { orderBy: { versionNumber: 'desc' } },
        statusLogs: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, firstName: true, lastName: true } } },
        },
        aiSuggestions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!offer) throw new NotFoundError('Offer');
    return offer;
  }

  /**
   * LIST OFFERS with filtering & pagination
   */
  static async listOffers(
    companyId: string,
    query: {
      status?: OfferStatus;
      candidateId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { companyId, deletedAt: null };

    if (query.status) where.currentStatus = query.status;
    if (query.candidateId) where.candidateId = query.candidateId;
    if (query.search) {
      where.OR = [
        { offerReferenceNumber: { contains: query.search, mode: 'insensitive' } },
        { jobTitle: { contains: query.search, mode: 'insensitive' } },
        { candidate: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { candidate: { lastName: { contains: query.search, mode: 'insensitive' } } },
        { candidate: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const limit = Math.min(query.limit || 20, 100);
    const offset = query.offset || 0;

    const [total, offers] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.offer.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          candidate: true,
          recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    return { total, limit, offset, items: offers };
  }

  /**
   * 4. AI EXTRACTION (Advisory only; flags sensitive fields)
   */
  static async extractFromDocument(
    companyId: string,
    userId: string,
    documentText: string,
    candidateId?: string
  ) {
    const result = await AiService.extractCandidateData(documentText);

    // Save advisory extraction record in DB
    let extractionRecordId: string | null = null;
    if (candidateId) {
      // Find candidate document or default
      const candDoc = await prisma.candidateDocument.findFirst({
        where: { candidateId, companyId },
        orderBy: { createdAt: 'desc' },
      });

      if (candDoc) {
        const record = await prisma.aiExtractedData.create({
          data: {
            companyId,
            documentId: candDoc.id,
            candidateId,
            providerName: result.metadata.provider,
            modelName: result.metadata.model,
            latencyMs: result.metadata.latencyMs,
            promptTokens: result.metadata.promptTokens,
            completionTokens: result.metadata.completionTokens,
            overallConfidenceScore: result.extraction.overallConfidenceScore,
            structuredFields: result.extraction as any,
          },
        });
        extractionRecordId = record.id;
      }
    }

    return {
      aiExtractedDataId: extractionRecordId,
      isAdvisoryOnly: true,
      requiresHumanConfirmation: true,
      sensitiveFieldsNotice:
        'Sensitive fields (compensation numbers, probation duration, notice period, joining date) are advisory and must be verified by HR before issuance.',
      extraction: result.extraction,
      metadata: result.metadata,
    };
  }

  /**
   * 5. AI SUGGESTIONS (Wording, welcome messaging, perks, clauses)
   * GUARDRAIL: strictly advisory, sensitive fields locked
   */
  static async generateAiSuggestions(
    companyId: string,
    userId: string,
    offerId?: string,
    input?: AiSuggestionsInput
  ) {
    let context: Record<string, unknown> = { ...input };

    if (offerId) {
      const offer = await prisma.offer.findFirst({
        where: { id: offerId, companyId },
        include: { candidate: true },
      });
      if (offer) {
        context = {
          jobTitle: offer.jobTitle,
          department: offer.department,
          workLocation: offer.workLocation,
          employmentType: offer.employmentType,
          candidateName: `${offer.candidate.firstName} ${offer.candidate.lastName}`,
          focusAreas: input?.focusAreas,
        };
      }
    }

    const result = await AiService.generateOfferSuggestions(context);

    // Persist suggestions in DB if offerId is present
    if (offerId) {
      await prisma.aiProcessingSuggestion.create({
        data: {
          companyId,
          offerId,
          taskType: AiTaskType.CUSTOM_CLAUSE_DRAFTING,
          providerName: 'AI_COPILOT',
          modelName: 'llama-3.3-70b-versatile',
          promptContext: context as any,
          aiSuggestion: result as any,
        },
      });
    }

    return result;
  }

  /**
   * Review AI Suggestion (Accept / Reject with feedback)
   */
  static async reviewAiSuggestion(
    companyId: string,
    userId: string,
    suggestionId: string,
    isAccepted: boolean,
    hrFeedbackNotes?: string
  ) {
    const suggestion = await prisma.aiProcessingSuggestion.findFirst({
      where: { id: suggestionId, companyId },
    });

    if (!suggestion) throw new NotFoundError('AI Suggestion');

    return prisma.aiProcessingSuggestion.update({
      where: { id: suggestionId },
      data: {
        isAcceptedByHr: isAccepted,
        hrFeedbackNotes: hrFeedbackNotes || null,
        hrReviewedBy: userId,
        hrReviewedAt: new Date(),
      },
    });
  }

  /**
   * 6. AI CLAUSE GENERATION (Wording assistance for specific terms)
   */
  static async generateAiClause(
    companyId: string,
    userId: string,
    input: AiClauseGenerationInput
  ) {
    const result = await AiService.draftCustomClause(input.instruction, {
      clauseType: input.clauseType,
      ...input.context,
    });

    return {
      ...result,
      isAdvisory: true,
      legalDisclaimer:
        'This clause was drafted by AI for wording assistance. Legal and financial parameters must be reviewed and approved by authorized HR personnel.',
    };
  }

  /**
   * 7. AI QUALITY CHECK (Audits completeness, math consistency, and sensitive fields guardrails)
   */
  static async performQualityCheck(
    companyId: string,
    userId: string,
    offerId: string
  ) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId },
      include: { candidate: true },
    });

    if (!offer) throw new NotFoundError('Offer');

    const confirmedTerms = (offer.hrConfirmedTerms as Record<string, unknown>) || {};

    const auditPayload = {
      offerReferenceNumber: offer.offerReferenceNumber,
      candidate: {
        firstName: offer.candidate.firstName,
        lastName: offer.candidate.lastName,
        email: offer.candidate.email,
        phone: offer.candidate.phone,
      },
      jobTitle: offer.jobTitle,
      department: offer.department,
      workLocation: offer.workLocation,
      employmentType: offer.employmentType,
      proposedJoiningDate: offer.proposedJoiningDate,
      offerValidUntil: offer.offerValidUntil,
      currency: offer.currency,
      baseSalary: Number(offer.baseSalary),
      hraAllowance: Number(offer.hraAllowance),
      specialAllowances: Number(offer.specialAllowances),
      performanceBonus: Number(offer.performanceBonus),
      joiningBonus: Number(offer.joiningBonus),
      totalCtc: Number(offer.totalCtc),
      probation: confirmedTerms.probation,
      noticePeriod: confirmedTerms.noticePeriod,
      workingHours: confirmedTerms.workingHours,
      termsAndClauses: confirmedTerms.termsAndClauses || [],
      sensitiveFieldsVerifiedByHuman: Boolean(confirmedTerms.sensitiveFieldsVerifiedByHuman),
    };

    const aiCheck = await AiService.performOfferQualityCheck(auditPayload);

    // Rule-based completeness validation
    const missingFields: string[] = [];
    if (!offer.jobTitle) missingFields.push('Job Title');
    if (!offer.department) missingFields.push('Department');
    if (!offer.workLocation) missingFields.push('Work Location');
    if (!offer.proposedJoiningDate) missingFields.push('Joining Date');
    if (!offer.baseSalary || Number(offer.baseSalary) <= 0) missingFields.push('Base Salary');
    if (!offer.totalCtc || Number(offer.totalCtc) <= 0) missingFields.push('Total CTC');

    const isReady = aiCheck.isReadyForIssuance && missingFields.length === 0;

    return {
      ...aiCheck,
      offerId,
      offerReferenceNumber: offer.offerReferenceNumber,
      currentStatus: offer.currentStatus,
      isReadyForIssuance: isReady,
      missingFields,
    };
  }

  /**
   * 8. PREVIEW OFFER (Interpolates placeholders, generates responsive HTML and text)
   */
  static async getOfferPreview(
    companyId: string,
    offerId: string
  ): Promise<OfferPreviewResult> {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        company: true,
        templateVersion: true,
      },
    });

    if (!offer) throw new NotFoundError('Offer');

    const confirmed = (offer.hrConfirmedTerms as any) || {};

    const probationText = confirmed.probation?.terms
      ? confirmed.probation.terms
      : confirmed.probation?.durationMonths
      ? `${confirmed.probation.durationMonths} months probationary appraisal period`
      : 'Standard 90 days probation period';

    const noticeText = confirmed.noticePeriod?.terms
      ? confirmed.noticePeriod.terms
      : confirmed.noticePeriod?.days
      ? `${confirmed.noticePeriod.days} days written notice required`
      : '30 days written notice';

    const workingHoursText = confirmed.workingHours?.schedule
      ? confirmed.workingHours.schedule
      : `${confirmed.workingHours?.hoursPerWeek || 40} hours per week (${confirmed.workingHours?.workModel || 'HYBRID'})`;

    const clauses = Array.isArray(confirmed.termsAndClauses)
      ? confirmed.termsAndClauses.map((c: any) => ({
          title: c.title || 'Terms',
          content: c.content || '',
        }))
      : [];

    const renderContext = {
      company: {
        name: offer.company.name,
        legalName: offer.company.legalName,
        domain: offer.company.domain,
      },
      candidate: {
        name: `${offer.candidate.firstName} ${offer.candidate.lastName}`.trim(),
        email: offer.candidate.email,
        phone: offer.candidate.phone,
        location: offer.candidate.currentLocation,
      },
      offer: {
        referenceNumber: offer.offerReferenceNumber,
        jobTitle: offer.jobTitle,
        department: offer.department,
        workLocation: offer.workLocation,
        employmentType: offer.employmentType,
        proposedJoiningDate: offer.proposedJoiningDate.toISOString(),
        reportingManagerName: offer.reportingManagerName,
        reportingManagerTitle: offer.reportingManagerTitle,
        currency: offer.currency,
        baseSalary: Number(offer.baseSalary),
        hraAllowance: Number(offer.hraAllowance),
        specialAllowances: Number(offer.specialAllowances),
        performanceBonus: Number(offer.performanceBonus),
        joiningBonus: Number(offer.joiningBonus),
        totalCtc: Number(offer.totalCtc),
        probationSummary: probationText,
        noticePeriodSummary: noticeText,
        workingHoursSummary: workingHoursText,
        offerValidUntil: offer.offerValidUntil ? offer.offerValidUntil.toISOString() : null,
        clauses,
      },
    };

    const customMarkup = offer.templateVersion
      ? {
          contentMarkup: offer.templateVersion.contentMarkup,
          headerMarkup: offer.templateVersion.headerMarkup || undefined,
          footerMarkup: offer.templateVersion.footerMarkup || undefined,
          styleCss: offer.templateVersion.styleCss || undefined,
        }
      : undefined;

    const rendered = OfferTemplateUtil.render(renderContext, customMarkup);

    // Validation completeness
    const missing: string[] = [];
    if (!offer.jobTitle) missing.push('Job Title');
    if (!offer.proposedJoiningDate) missing.push('Proposed Joining Date');
    if (!offer.baseSalary || Number(offer.baseSalary) <= 0) missing.push('Base Salary');

    return {
      offerId: offer.id,
      offerReferenceNumber: offer.offerReferenceNumber,
      currentStatus: offer.currentStatus,
      versionNumber: offer.currentVersionNumber,
      renderedHtml: rendered.renderedHtml,
      plainText: rendered.plainText,
      styleCss: rendered.styleCss,
      placeholders: rendered.placeholders,
      validation: {
        isReadyForIssuance: missing.length === 0,
        missingRequiredFields: missing,
        warnings: offer.offerValidUntil && new Date(offer.offerValidUntil) < new Date() ? ['Offer validity date has expired'] : [],
      },
    };
  }

  /**
   * 9. STATUS MANAGEMENT (Allowed transitions, status logs, approval records)
   */
  static async getOfferStatus(companyId: string, offerId: string) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId },
      include: {
        statusLogs: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
        approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!offer) throw new NotFoundError('Offer');

    const allowedTransitions: Record<OfferStatus, OfferStatus[]> = {
      [OfferStatus.DRAFT_AI]: [OfferStatus.HR_REVIEW, OfferStatus.WITHDRAWN],
      [OfferStatus.HR_REVIEW]: [OfferStatus.PENDING_APPROVAL, OfferStatus.APPROVED, OfferStatus.WITHDRAWN],
      [OfferStatus.PENDING_APPROVAL]: [OfferStatus.APPROVED, OfferStatus.HR_REVIEW, OfferStatus.WITHDRAWN],
      [OfferStatus.APPROVED]: [OfferStatus.ISSUED, OfferStatus.REVISED, OfferStatus.WITHDRAWN],
      [OfferStatus.ISSUED]: [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.EXPIRED, OfferStatus.WITHDRAWN, OfferStatus.REVISED],
      [OfferStatus.ACCEPTED]: [],
      [OfferStatus.DECLINED]: [OfferStatus.REVISED],
      [OfferStatus.EXPIRED]: [OfferStatus.REVISED],
      [OfferStatus.WITHDRAWN]: [OfferStatus.REVISED],
      [OfferStatus.REVISED]: [OfferStatus.HR_REVIEW, OfferStatus.PENDING_APPROVAL],
    };

    return {
      offerId: offer.id,
      offerReferenceNumber: offer.offerReferenceNumber,
      currentStatus: offer.currentStatus,
      allowedNextStatuses: allowedTransitions[offer.currentStatus] || [],
      approvedAt: offer.approvedAt,
      approvedBy: offer.approver,
      issuedAt: offer.issuedAt,
      respondedAt: offer.respondedAt,
      statusHistory: offer.statusLogs,
    };
  }

  static async updateOfferStatus(
    companyId: string,
    userId: string,
    offerId: string,
    transition: OfferStatusTransitionInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
    });

    if (!offer) throw new NotFoundError('Offer');

    const fromStatus = offer.currentStatus;
    const toStatus = transition.targetStatus;

    if (fromStatus === toStatus) {
      return offer;
    }

    const updateData: any = {
      currentStatus: toStatus,
    };

    if (toStatus === OfferStatus.APPROVED) {
      updateData.approvedByUserId = userId;
      updateData.approvedAt = new Date();
      updateData.approvalNotes = transition.reasonNotes || 'Approved for candidate issuance';
    }

    if (toStatus === OfferStatus.ISSUED) {
      updateData.issuedAt = new Date();
    }

    if (([OfferStatus.ACCEPTED, OfferStatus.DECLINED] as string[]).includes(toStatus)) {
      updateData.respondedAt = new Date();
      updateData.candidateResponseNotes = transition.reasonNotes || null;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.offer.update({
        where: { id: offerId },
        data: updateData,
        include: { candidate: true },
      });

      await tx.offerStatusLog.create({
        data: {
          offerId,
          fromStatus,
          toStatus,
          changedByUserId: userId,
          reasonNotes: transition.reasonNotes || `Status changed from ${fromStatus} to ${toStatus}`,
        },
      });

      return result;
    });

    let auditAction: AuditAction = 'UPDATE';
    if (toStatus === OfferStatus.APPROVED) auditAction = 'APPROVE';
    else if (toStatus === OfferStatus.ISSUED) auditAction = 'ISSUE';
    else if (toStatus === OfferStatus.ACCEPTED) auditAction = 'ACCEPT';
    else if (toStatus === OfferStatus.DECLINED) auditAction = 'DECLINE';
    else if (toStatus === OfferStatus.WITHDRAWN) auditAction = 'REVOKE';

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offerId,
      action: auditAction,
      actionDescription: `Transitioned offer ${offer.offerReferenceNumber} from ${fromStatus} to ${toStatus}: ${transition.reasonNotes || ''}`,
      previousState: { status: fromStatus },
      newState: { status: toStatus },
      ipAddress,
      userAgent,
    });

    return updated;
  }

  /**
   * 10. VERSION / HISTORY
   */
  static async getOfferVersions(companyId: string, offerId: string) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          include: { creator: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });

    if (!offer) throw new NotFoundError('Offer');

    return {
      offerId: offer.id,
      offerReferenceNumber: offer.offerReferenceNumber,
      currentVersionNumber: offer.currentVersionNumber,
      versions: offer.versions.map((v) => ({
        versionNumber: v.versionNumber,
        createdAt: v.createdAt,
        createdBy: v.creator,
        changeReason: v.changeReason,
        diffSummary: v.diffFromPrevious,
      })),
    };
  }

  static async getOfferVersionByNumber(
    companyId: string,
    offerId: string,
    versionNumber: number
  ) {
    const version = await prisma.offerVersion.findFirst({
      where: {
        offerId,
        versionNumber,
        offer: { companyId },
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        templateVersion: true,
      },
    });

    if (!version) throw new NotFoundError(`Offer Version ${versionNumber}`);
    return version;
  }

  static async restoreOfferVersion(
    companyId: string,
    userId: string,
    offerId: string,
    versionNumber: number,
    ipAddress?: string,
    userAgent?: string
  ) {
    const targetVersion = await this.getOfferVersionByNumber(companyId, offerId, versionNumber);
    const snapshot = targetVersion.snapshotTerms as any;

    if (!snapshot) {
      throw new ValidationError('Target version does not have snapshot terms');
    }

    return this.updateOffer(
      companyId,
      userId,
      offerId,
      {
        jobTitle: snapshot.jobTitle,
        department: snapshot.department,
        bandGrade: snapshot.bandGrade,
        workLocation: snapshot.workLocation,
        employmentType: snapshot.employmentType,
        proposedJoiningDate: snapshot.proposedJoiningDate,
        compensation: snapshot.compensation,
        probation: snapshot.hrConfirmedTerms?.probation,
        noticePeriod: snapshot.hrConfirmedTerms?.noticePeriod,
        workingHours: snapshot.hrConfirmedTerms?.workingHours,
        termsAndClauses: snapshot.hrConfirmedTerms?.termsAndClauses,
        changeReason: `Restored to Version ${versionNumber}`,
      },
      ipAddress,
      userAgent
    );
  }
}
