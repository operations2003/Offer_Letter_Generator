import crypto from 'crypto';
import { prisma } from '../../prisma/client.js';
import { OfferStatus, TemplateCategory, AuditAction, AiTaskType } from '@prisma/client';
import { AppError, NotFoundError, ValidationError, ForbiddenError } from '../../errors/app-error.js';
import { AuditService } from '../audit/audit.service.js';
import { AiService } from '../ai/ai.service.js';
import { computeSnapshotDiff } from './offer-diff.util.js';
import { OfferTemplateUtil } from './offer-template.util.js';
import { PreGenerationAuditService, PreGenerationAuditPayload } from './pre-generation-audit.service.js';
import { PdfGeneratorService } from '../documents/pdf-generator.service.js';
import { DocumentStorageService } from '../documents/document-storage.service.js';
import {
  CreateOfferInput,
  SaveDraftInput,
  UpdateOfferInput,
  OfferStatusTransitionInput,
  AiClauseGenerationInput,
  AiSuggestionsInput,
  OfferPreviewResult,
  GenerateDocumentOptions,
  GeneratedDocumentResult,
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
   * DASHBOARD STATISTICS:
   * Aggregates live pipeline metrics for the company:
   * - Total
   * - Draft
   * - AI Processing
   * - Awaiting Review
   * - Generated
   * - Sent
   * - Accepted
   * - Rejected
   * - Expired
   */
  static async getDashboardStatistics(companyId: string) {
    const now = new Date();

    const [
      total,
      draftCount,
      aiProcessingCount,
      awaitingReviewCount,
      generatedCount,
      sentCount,
      acceptedCount,
      rejectedCount,
      expiredCount,
    ] = await Promise.all([
      // Total non-deleted offers
      prisma.offer.count({
        where: { companyId, deletedAt: null },
      }),

      // Draft: DRAFT_AI status without active AI extraction or pending AI reviews
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          currentStatus: OfferStatus.DRAFT_AI,
          aiExtractedDataId: null,
          aiSuggestions: { none: { hrReviewedAt: null } },
        },
      }),

      // AI Processing: DRAFT_AI with AI extraction OR offers with unreviewed AI suggestions
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          OR: [
            {
              currentStatus: OfferStatus.DRAFT_AI,
              aiExtractedDataId: { not: null },
            },
            {
              aiSuggestions: {
                some: { hrReviewedAt: null },
              },
            },
          ],
        },
      }),

      // Awaiting Review: HR_REVIEW or PENDING_APPROVAL
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          currentStatus: { in: [OfferStatus.HR_REVIEW, OfferStatus.PENDING_APPROVAL] },
        },
      }),

      // Generated: APPROVED status (or has minted legal PDF ready for issuance)
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          currentStatus: OfferStatus.APPROVED,
        },
      }),

      // Sent: ISSUED status
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          currentStatus: OfferStatus.ISSUED,
        },
      }),

      // Accepted: ACCEPTED status
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          currentStatus: OfferStatus.ACCEPTED,
        },
      }),

      // Rejected: DECLINED or WITHDRAWN
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          currentStatus: { in: [OfferStatus.DECLINED, OfferStatus.WITHDRAWN] },
        },
      }),

      // Expired: EXPIRED status or validUntil < now (and not accepted/declined/withdrawn)
      prisma.offer.count({
        where: {
          companyId,
          deletedAt: null,
          OR: [
            { currentStatus: OfferStatus.EXPIRED },
            {
              offerValidUntil: { lt: now },
              currentStatus: {
                notIn: [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.WITHDRAWN],
              },
            },
          ],
        },
      }),
    ]);

    return {
      total,
      draft: draftCount,
      aiProcessing: aiProcessingCount,
      awaitingReview: awaitingReviewCount,
      generated: generatedCount,
      sent: sentCount,
      accepted: acceptedCount,
      rejected: rejectedCount,
      expired: expiredCount,
    };
  }

  /**
   * LIST OFFERS with advanced filtering (status, department, template, AI review status), search & pagination
   */
  static async listOffers(
    companyId: string,
    query: {
      status?: OfferStatus | string;
      candidateId?: string;
      search?: string;
      department?: string;
      templateId?: string;
      aiReviewStatus?: string;
      page?: number;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { companyId, deletedAt: null };

    if (query.status && query.status !== 'ALL') {
      if (query.status === 'REJECTED') {
        where.currentStatus = { in: [OfferStatus.DECLINED, OfferStatus.WITHDRAWN] };
      } else if (query.status === 'AWAITING_REVIEW') {
        where.currentStatus = { in: [OfferStatus.HR_REVIEW, OfferStatus.PENDING_APPROVAL] };
      } else if (query.status === 'EXPIRED') {
        const now = new Date();
        where.OR = [
          { currentStatus: OfferStatus.EXPIRED },
          {
            offerValidUntil: { lt: now },
            currentStatus: { notIn: [OfferStatus.ACCEPTED, OfferStatus.DECLINED, OfferStatus.WITHDRAWN] },
          },
        ];
      } else {
        where.currentStatus = query.status as OfferStatus;
      }
    }

    if (query.department && query.department !== 'ALL') {
      where.department = { contains: query.department, mode: 'insensitive' };
    }

    if (query.templateId && query.templateId !== 'ALL') {
      where.templateVersion = { templateId: query.templateId };
    }

    if (query.candidateId) where.candidateId = query.candidateId;

    if (query.search && query.search.trim().length > 0) {
      const q = query.search.trim();
      where.AND = where.AND || [];
      where.AND.push({
        OR: [
          { offerReferenceNumber: { contains: q, mode: 'insensitive' } },
          { jobTitle: { contains: q, mode: 'insensitive' } },
          { department: { contains: q, mode: 'insensitive' } },
          { candidate: { firstName: { contains: q, mode: 'insensitive' } } },
          { candidate: { lastName: { contains: q, mode: 'insensitive' } } },
          { candidate: { email: { contains: q, mode: 'insensitive' } } },
          { candidate: { phone: { contains: q, mode: 'insensitive' } } },
        ],
      });
    }

    const limit = Math.min(query.limit || 20, 100);
    const page = query.page ? Math.max(1, query.page) : query.offset !== undefined ? Math.floor(query.offset / limit) + 1 : 1;
    const offset = query.offset !== undefined ? query.offset : (page - 1) * limit;

    const [total, offers] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.offer.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          candidate: true,
          templateVersion: {
            include: {
              template: true,
            },
          },
          recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
          generatedDocuments: {
            select: { id: true, documentType: true, fileName: true, isFinalLegalDocument: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          aiSuggestions: {
            select: { id: true, isAcceptedByHr: true, hrReviewedAt: true },
          },
        },
      }),
    ]);

    const items = offers.map((o) => {
      // Determine AI review status
      let aiReviewStatus: 'VERIFIED_BY_HR' | 'PENDING_AI_REVIEW' | 'OVERRIDDEN' | 'STANDARD' = 'STANDARD';
      const humanOverrides = Array.isArray(o.humanOverrides) ? (o.humanOverrides as any[]) : [];

      if (humanOverrides.length > 0) {
        aiReviewStatus = 'OVERRIDDEN';
      } else if (o.aiSuggestions && o.aiSuggestions.some((s) => s.hrReviewedAt === null)) {
        aiReviewStatus = 'PENDING_AI_REVIEW';
      } else if (o.aiSuggestions && o.aiSuggestions.length > 0) {
        aiReviewStatus = 'VERIFIED_BY_HR';
      } else if (o.aiExtractedDataId) {
        aiReviewStatus = 'VERIFIED_BY_HR';
      }

      return {
        id: o.id,
        referenceNumber: o.offerReferenceNumber,
        offerReferenceNumber: o.offerReferenceNumber,
        candidate: o.candidate,
        candidateName: `${o.candidate.firstName} ${o.candidate.lastName}`,
        email: o.candidate.email,
        phone: o.candidate.phone,
        position: o.jobTitle,
        jobTitle: o.jobTitle,
        department: o.department,
        bandGrade: o.bandGrade,
        workLocation: o.workLocation,
        employmentType: o.employmentType,
        offerDate: o.issuedAt ? o.issuedAt.toISOString() : o.createdAt.toISOString(),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        joiningDate: o.proposedJoiningDate ? o.proposedJoiningDate.toISOString() : null,
        proposedJoiningDate: o.proposedJoiningDate ? o.proposedJoiningDate.toISOString() : null,
        offerValidUntil: o.offerValidUntil ? o.offerValidUntil.toISOString() : null,
        template: o.templateVersion?.template?.title || 'Standard Employment Agreement',
        templateCode: o.templateVersion?.template?.category || o.employmentType,
        templateVersionId: o.templateVersionId,
        status: o.currentStatus,
        currentStatus: o.currentStatus,
        currentVersionNumber: o.currentVersionNumber,
        aiReviewStatus,
        totalCtc: Number(o.totalCtc),
        baseSalary: Number(o.baseSalary),
        currency: o.currency,
        hasGeneratedDocument: Boolean(o.generatedDocuments && o.generatedDocuments.length > 0),
        generatedDocumentId: o.generatedDocuments?.[0]?.id || null,
        recruiter: o.recruiter,
      };
    });

    const filteredItems = query.aiReviewStatus && query.aiReviewStatus !== 'ALL'
      ? items.filter((item) => item.aiReviewStatus === query.aiReviewStatus)
      : items;

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      total,
      page,
      limit,
      totalPages,
      offset,
      items: filteredItems,
    };
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
    const effectiveInstruction = input.instruction || (input as any).customInstructions || `Draft standard terms for ${input.clauseType}`;
    const result = await AiService.draftCustomClause(effectiveInstruction, {
      clauseType: input.clauseType,
      ...input.context,
    });

    return {
      ...result,
      clause: {
        title: result.clauseTitle,
        content: result.clauseText,
      },
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
   * 7b. PRE-GENERATION AUDIT
   * Audits all 9 required compliance and consistency checks:
   * - Missing required fields
   * - Missing candidate/company information
   * - Date inconsistencies
   * - Designation inconsistencies
   * - Salary inconsistencies
   * - Missing clauses
   * - Unreplaced placeholders
   * - Content/formatting issues
   * - Contradictions
   * Returns PASS, WARNING, or REVIEW_REQUIRED.
   * STRICT GUARDRAIL: AI flags issues, never silently modifies the offer.
   */
  static async performPreGenerationCheck(
    companyId: string,
    userId: string,
    offerId?: string,
    inFlightData?: PreGenerationAuditPayload
  ) {
    let auditPayload: PreGenerationAuditPayload = inFlightData || {};

    if (offerId) {
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

      // Render preview to evaluate placeholder interpolation and formatting
      const preview = await this.getOfferPreview(companyId, offerId);

      auditPayload = {
        candidate: {
          firstName: offer.candidate.firstName,
          lastName: offer.candidate.lastName,
          email: offer.candidate.email,
          phone: offer.candidate.phone || undefined,
          address: offer.candidate.currentLocation || undefined,
          currentLocation: offer.candidate.currentLocation || undefined,
          currentTitle: offer.candidate.currentTitle || undefined,
          currentEmployer: offer.candidate.currentEmployer || undefined,
          experienceYears: offer.candidate.experienceYears ? Number(offer.candidate.experienceYears) : undefined,
        },
        company: {
          name: offer.company.name,
          legalName: offer.company.legalName || offer.company.name,
          domain: offer.company.domain || undefined,
          signatoryName: 'Authorized Corporate Officer',
          signatoryTitle: 'VP of Human Resources',
        },
        jobDetails: {
          jobTitle: offer.jobTitle,
          department: offer.department,
          bandGrade: offer.bandGrade || undefined,
          workLocation: offer.workLocation,
          employmentType: offer.employmentType,
          proposedJoiningDate: offer.proposedJoiningDate,
          reportingManagerName: offer.reportingManagerName || undefined,
          reportingManagerTitle: offer.reportingManagerTitle || undefined,
        },
        compensation: {
          currency: offer.currency,
          baseSalary: Number(offer.baseSalary),
          hraAllowance: Number(offer.hraAllowance),
          specialAllowances: Number(offer.specialAllowances),
          performanceBonus: Number(offer.performanceBonus),
          joiningBonus: Number(offer.joiningBonus),
          totalCtc: Number(offer.totalCtc),
          equityDetails: (offer.equityDetails as any) || undefined,
          benefitsSummary: Array.isArray(offer.benefitsSummary) ? (offer.benefitsSummary as string[]) : [],
        },
        terms: {
          probationDurationMonths: confirmed.probation?.durationMonths,
          probationDurationDays: confirmed.probation?.durationDays || (confirmed.probation?.durationMonths ? confirmed.probation.durationMonths * 30 : 90),
          noticePeriodDays: confirmed.noticePeriod?.days || 30,
          probationNoticePeriodDays: confirmed.noticePeriod?.probationDays,
          workingHoursPerWeek: confirmed.workingHours?.hoursPerWeek || 40,
          workSchedule: confirmed.workingHours?.schedule,
          offerValidUntil: offer.offerValidUntil || undefined,
          clauses: Array.isArray(confirmed.termsAndClauses) ? confirmed.termsAndClauses : [],
        },
        renderedHtml: preview.renderedHtml,
        plainText: preview.plainText,
      };
    } else {
      // For wizard in-flight checks, fetch company details from DB if available
      const company = await prisma.company.findUnique({ where: { id: companyId } });
      if (company && (!auditPayload.company || !auditPayload.company.name)) {
        auditPayload.company = {
          name: company.name,
          legalName: company.legalName || company.name,
          domain: company.domain || undefined,
          signatoryName: auditPayload.company?.signatoryName || 'Sarah Jenkins',
          signatoryTitle: auditPayload.company?.signatoryTitle || 'VP of Global Talent Operations',
        };
      }
    }

    return PreGenerationAuditService.performAudit(auditPayload);
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
      status: offer.currentStatus,
      allowedNextStatuses: allowedTransitions[offer.currentStatus] || [],
      allowedTransitions: allowedTransitions[offer.currentStatus] || [],
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
    const toStatus = transition.targetStatus || (transition as any).status;
    const reasonNotes = transition.reasonNotes || (transition as any).reason;

    if (fromStatus === toStatus) {
      return offer;
    }

    const updateData: any = {
      currentStatus: toStatus,
    };

    if (toStatus === OfferStatus.APPROVED) {
      updateData.approvedByUserId = userId;
      updateData.approvedAt = new Date();
      updateData.approvalNotes = reasonNotes || 'Approved for candidate issuance';
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

  // ---------------------------------------------------------------------------
  // 11. DOCUMENT GENERATION, PDF MINTING & SECURE STORAGE
  // ---------------------------------------------------------------------------
  /**
   * Flow: HR Approved Data -> Template -> Placeholder Replacement -> Document Generation -> PDF -> Secure Storage
   * STRICT PRINCIPLE: Only HR-confirmed data should be used for the final PDF.
   */
  static async generateFinalDocument(
    companyId: string,
    userId: string,
    offerId: string,
    options?: GenerateDocumentOptions,
    ipAddress?: string,
    userAgent?: string
  ): Promise<GeneratedDocumentResult> {
    // 1. Fetch Offer with all related entities
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        company: true,
        templateVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!offer) throw new NotFoundError('Offer');

    // 2. HR Approved Data Extraction (Strict Isolation: Only HR-confirmed data used)
    const confirmed = (offer.hrConfirmedTerms as any) || {};

    const candidateName = `${offer.candidate.firstName} ${offer.candidate.lastName}`.trim();
    const candidateEmail = offer.candidate.email;
    const candidatePhone = offer.candidate.phone || null;
    const candidateAddress = offer.candidate.currentLocation || null;

    const companyName = offer.company.name;
    const companyLegalName = offer.company.legalName || offer.company.name;
    const companyDomain = offer.company.domain || null;
    const signatoryName = options?.signatoryName || 'Sarah Jenkins';
    const signatoryTitle = options?.signatoryTitle || 'VP of Global Talent Operations';

    const jobTitle = offer.jobTitle;
    const department = offer.department;
    const bandGrade = offer.bandGrade || null;
    const workLocation = offer.workLocation;
    const employmentType = offer.employmentType;
    const proposedJoiningDate = OfferTemplateUtil.formatDate(offer.proposedJoiningDate);
    const reportingManagerName = offer.reportingManagerName || null;
    const reportingManagerTitle = offer.reportingManagerTitle || null;

    const currency = offer.currency || 'USD';
    const baseSalary = Number(offer.baseSalary || 0);
    const hraAllowance = Number(offer.hraAllowance || 0);
    const specialAllowances = Number(offer.specialAllowances || 0);
    const performanceBonus = Number(offer.performanceBonus || 0);
    const joiningBonus = Number(offer.joiningBonus || 0);
    const totalCtc = Number(offer.totalCtc || 0);

    const probationSummary = confirmed.probation?.terms
      ? confirmed.probation.terms
      : confirmed.probation?.durationMonths
      ? `${confirmed.probation.durationMonths} months probationary appraisal period`
      : 'Standard 90 days probation period';

    const noticePeriodSummary = confirmed.noticePeriod?.terms
      ? confirmed.noticePeriod.terms
      : confirmed.noticePeriod?.days
      ? `${confirmed.noticePeriod.days} days written notice required`
      : '30 days written notice';

    const workingHoursSummary = confirmed.workingHours?.schedule
      ? confirmed.workingHours.schedule
      : `${confirmed.workingHours?.hoursPerWeek || 40} hours per week (${confirmed.workingHours?.workModel || 'HYBRID'})`;

    const offerValidUntil = offer.offerValidUntil ? OfferTemplateUtil.formatDate(offer.offerValidUntil) : null;

    const clauses: Array<{ title: string; content: string }> = Array.isArray(confirmed.termsAndClauses)
      ? confirmed.termsAndClauses.map((c: any) => ({
          title: c.title || 'Agreement Terms',
          content: c.content || '',
        }))
      : [];

    // Generate Compensation Table HTML
    const compTable = `
      <table class="compensation-table">
        <thead>
          <tr>
            <th>Component</th>
            <th style="text-align: right;">Annual Amount (${currency})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base Salary</td>
            <td style="text-align: right;">${OfferTemplateUtil.formatCurrency(baseSalary, currency)}</td>
          </tr>
          ${hraAllowance > 0 ? `
          <tr>
            <td>Housing Rent Allowance (HRA)</td>
            <td style="text-align: right;">${OfferTemplateUtil.formatCurrency(hraAllowance, currency)}</td>
          </tr>` : ''}
          ${specialAllowances > 0 ? `
          <tr>
            <td>Special Allowances</td>
            <td style="text-align: right;">${OfferTemplateUtil.formatCurrency(specialAllowances, currency)}</td>
          </tr>` : ''}
          ${performanceBonus > 0 ? `
          <tr>
            <td>Performance Bonus</td>
            <td style="text-align: right;">${OfferTemplateUtil.formatCurrency(performanceBonus, currency)}</td>
          </tr>` : ''}
          ${joiningBonus > 0 ? `
          <tr>
            <td>Joining Bonus</td>
            <td style="text-align: right;">${OfferTemplateUtil.formatCurrency(joiningBonus, currency)}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td>Total Cost to Company (CTC)</td>
            <td style="text-align: right;">${OfferTemplateUtil.formatCurrency(totalCtc, currency)}</td>
          </tr>
        </tbody>
      </table>
    `;

    const clausesHtml = clauses.length > 0
      ? clauses.map((c, i) => `<div class="clause-box"><div class="clause-title">${i + 1}. ${c.title}</div><div class="clause-content">${c.content}</div></div>`).join('\n')
      : '<p>Standard terms and employment conditions apply.</p>';

    const headerMarkup = offer.templateVersion?.headerMarkup || `
      <div class="offer-header">
        <h1 class="company-title">${companyName}</h1>
        <div class="offer-meta">Ref: ${offer.offerReferenceNumber} | Date: ${OfferTemplateUtil.formatDate(new Date())}</div>
      </div>
    `;

    const footerMarkup = offer.templateVersion?.footerMarkup || `
      <div class="offer-footer">
        <p style="font-size: 11px; color: #64748b; text-align: center;">${companyLegalName} • Confidential Offer Letter</p>
      </div>
    `;

    // 3. Placeholder Validation: Ensure no unresolved placeholders
    const placeholders: Record<string, string> = {
      candidate_name: candidateName,
      candidate_email: candidateEmail,
      candidate_phone: candidatePhone || '',
      candidate_address: candidateAddress || '',
      candidateLocation: candidateAddress || 'Standard Location',
      designation: jobTitle,
      job_title: jobTitle,
      department: department,
      band_grade: bandGrade || 'Standard Grade',
      location: workLocation,
      work_location: workLocation,
      employment_type: employmentType.replace(/_/g, ' '),
      joining_date: proposedJoiningDate,
      proposed_joining_date: proposedJoiningDate,
      reporting_manager: reportingManagerName || 'Executive Committee',
      reporting_manager_title: reportingManagerTitle || 'Department Head',
      reportingManagerName: reportingManagerName || 'Executive Committee',
      reportingManagerTitle: reportingManagerTitle || 'Department Head',
      salary: OfferTemplateUtil.formatCurrency(baseSalary, currency),
      base_salary: OfferTemplateUtil.formatCurrency(baseSalary, currency),
      hra_allowance: OfferTemplateUtil.formatCurrency(hraAllowance, currency),
      special_allowances: OfferTemplateUtil.formatCurrency(specialAllowances, currency),
      performance_bonus: OfferTemplateUtil.formatCurrency(performanceBonus, currency),
      joining_bonus: OfferTemplateUtil.formatCurrency(joiningBonus, currency),
      total_ctc: OfferTemplateUtil.formatCurrency(totalCtc, currency),
      currency: currency,
      probation_period: probationSummary,
      probationSummary: probationSummary,
      notice_period: noticePeriodSummary,
      noticePeriodSummary: noticePeriodSummary,
      working_hours: workingHoursSummary,
      workingHoursSummary: workingHoursSummary,
      offer_validity_date: offerValidUntil || 'Within 14 days of receipt',
      offerValidUntil: offerValidUntil || 'Within 14 days of receipt',
      company_name: companyName,
      company_legal_name: companyLegalName,
      signatory_name: signatoryName,
      signatory_title: signatoryTitle,
      offer_reference_number: offer.offerReferenceNumber,
      currentDate: OfferTemplateUtil.formatDate(new Date()),
      compensationTableHtml: compTable,
      compensation_table_html: compTable,
      clausesHtml: clausesHtml,
      clauses_html: clausesHtml,
      headerMarkup: headerMarkup,
      header_markup: headerMarkup,
      footerMarkup: footerMarkup,
      footer_markup: footerMarkup,
    };

    // Sub in camelCase versions as well
    for (const [k, v] of Object.entries({ ...placeholders })) {
      const camel = k.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
      placeholders[camel] = v;
    }

    // Load template markup
    const rawTemplate = offer.templateVersion?.contentMarkup || OfferTemplateUtil.getDefaultTemplateMarkup().contentMarkup;
    let renderedHtml = rawTemplate;
    for (let pass = 0; pass < 3; pass++) {
      for (const [k, v] of Object.entries(placeholders)) {
        renderedHtml = renderedHtml.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      }
    }

    // STRICT PLACEHOLDER VALIDATION: Detect any unreplaced {{tags}}
    const unreplacedMatches = renderedHtml.match(/\{\{([a-zA-Z0-9_\-\.]+)\}\}/g);
    if (unreplacedMatches && unreplacedMatches.length > 0) {
      const distinct = Array.from(new Set(unreplacedMatches));
      throw new ValidationError(
        `Document generation rejected: Found unreplaced placeholder tag(s) in template: ${distinct.join(', ')}. All parameters must be HR-confirmed.`
      );
    }

    // 4. Generate Unique Verification Token & Build Professional PDF
    const verificationToken = DocumentStorageService.generateVerificationToken();
    const currentVersionNumber = offer.currentVersionNumber || 1;

    const pdfBuffer = await PdfGeneratorService.generateOfferPdf({
      company: {
        name: companyName,
        legalName: companyLegalName,
        domain: companyDomain,
        signatoryName,
        signatoryTitle,
      },
      candidate: {
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        address: candidateAddress,
      },
      job: {
        referenceNumber: offer.offerReferenceNumber,
        jobTitle,
        department,
        bandGrade,
        workLocation,
        employmentType,
        proposedJoiningDate,
        reportingManagerName,
        reportingManagerTitle,
      },
      compensation: {
        currency,
        baseSalary,
        hraAllowance,
        specialAllowances,
        performanceBonus,
        joiningBonus,
        totalCtc,
      },
      terms: {
        probationSummary,
        noticePeriodSummary,
        workingHoursSummary,
        offerValidUntil,
        clauses,
      },
      verificationToken,
      versionNumber: currentVersionNumber,
    });

    // 5. Secure Storage: Store in company & offer isolated directory with SHA-256 checksum
    const fileName = `OFFER_${offer.offerReferenceNumber}_v${currentVersionNumber}.pdf`;
    const stored = await DocumentStorageService.saveGeneratedPdf(
      companyId,
      offerId,
      fileName,
      pdfBuffer
    );

    const latestOfferVersion = offer.versions[0];

    // 6. DB Persistence: Mark previous documents as archived, create new legal document
    const createdDoc = await prisma.$transaction(async (tx) => {
      await tx.generatedDocument.updateMany({
        where: { offerId, isFinalLegalDocument: true },
        data: { isFinalLegalDocument: false },
      });

      return tx.generatedDocument.create({
        data: {
          companyId,
          offerId,
          offerVersionId: latestOfferVersion ? latestOfferVersion.id : null,
          fileName: stored.fileName,
          storagePath: stored.storagePath,
          storageProvider: stored.storageProvider,
          fileSizeBytes: stored.fileSizeBytes,
          sha256Checksum: stored.sha256Checksum,
          verificationToken,
          isFinalLegalDocument: true,
          generatedBy: userId,
        },
      });
    });

    // 7. Audit Log Entry
    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'GENERATED_DOCUMENT',
      entityId: createdDoc.id,
      action: 'CREATE',
      actionDescription: `Generated legal offer letter PDF (v${currentVersionNumber}) for candidate ${candidateName} (Ref: ${offer.offerReferenceNumber})`,
      newState: {
        documentId: createdDoc.id,
        fileName: createdDoc.fileName,
        sha256Checksum: createdDoc.sha256Checksum,
        verificationToken,
        fileSizeBytes: Number(createdDoc.fileSizeBytes),
      },
      ipAddress,
      userAgent,
    });

    return {
      documentId: createdDoc.id,
      offerId: offer.id,
      offerReferenceNumber: offer.offerReferenceNumber,
      versionNumber: currentVersionNumber,
      fileName: createdDoc.fileName,
      fileSizeBytes: Number(createdDoc.fileSizeBytes),
      sha256Checksum: createdDoc.sha256Checksum,
      verificationToken: createdDoc.verificationToken,
      downloadUrl: `/api/v1/offers/${offer.id}/document/download`,
      verificationUrl: `/api/v1/offers/document/verify/${createdDoc.verificationToken}`,
      isFinalLegalDocument: true,
      generatedAt: createdDoc.createdAt.toISOString(),
      renderedHtml,
    };
  }

  /**
   * Regenerates final offer document with incremented version and immutable audit trail.
   */
  static async regenerateFinalDocument(
    companyId: string,
    userId: string,
    offerId: string,
    options?: GenerateDocumentOptions,
    ipAddress?: string,
    userAgent?: string
  ): Promise<GeneratedDocumentResult> {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
    });

    if (!offer) throw new NotFoundError('Offer');

    const nextVersion = (offer.currentVersionNumber || 1) + 1;

    // Update offer version
    await prisma.offer.update({
      where: { id: offerId },
      data: { currentVersionNumber: nextVersion },
    });

    await prisma.offerVersion.create({
      data: {
        offerId,
        versionNumber: nextVersion,
        templateVersionId: offer.templateVersionId,
        snapshotTerms: {
          jobTitle: offer.jobTitle,
          department: offer.department,
          totalCtc: Number(offer.totalCtc),
          hrConfirmedTerms: offer.hrConfirmedTerms as any,
          regenerationReason: options?.regenerationReason || 'Regenerated official offer letter document',
        } as any,
        diffFromPrevious: {
          document: { from: `Version ${nextVersion - 1}`, to: `Version ${nextVersion}` },
        } as any,
        changeReason: options?.regenerationReason || `Regenerated Document v${nextVersion}`,
        createdBy: userId,
      },
    });

    return this.generateFinalDocument(
      companyId,
      userId,
      offerId,
      options,
      ipAddress,
      userAgent
    );
  }

  /**
   * Retrieves the stored PDF binary stream and file metadata for secure download
   */
  static async getGeneratedDocumentDownload(
    companyId: string,
    userId: string,
    offerId: string,
    documentId?: string
  ): Promise<{ buffer: Buffer; fileName: string; fileSizeBytes: number; sha256Checksum: string }> {
    const docQuery: any = {
      offerId,
      companyId,
      deletedAt: null,
    };

    if (documentId) {
      docQuery.id = documentId;
    } else {
      docQuery.isFinalLegalDocument = true;
    }

    const doc = await prisma.generatedDocument.findFirst({
      where: docQuery,
      orderBy: { createdAt: 'desc' },
    });

    if (!doc) {
      throw new NotFoundError('Generated offer document');
    }

    // Read binary from isolated storage
    const buffer = await DocumentStorageService.getPdfBuffer(doc.storagePath);

    // Verify cryptographic integrity
    const checksum = DocumentStorageService.computeSha256(buffer);
    if (checksum !== doc.sha256Checksum) {
      console.warn(`[SECURITY WARNING] Integrity checksum mismatch on document ${doc.id}`);
    }

    return {
      buffer,
      fileName: doc.fileName,
      fileSizeBytes: Number(doc.fileSizeBytes),
      sha256Checksum: doc.sha256Checksum,
    };
  }

  /**
   * Cryptographic Verification Endpoint: Validates public verification token
   */
  static async verifyDocumentByToken(token: string) {
    const doc = await prisma.generatedDocument.findUnique({
      where: { verificationToken: token },
      include: {
        offer: {
          select: {
            offerReferenceNumber: true,
            jobTitle: true,
            department: true,
            currentStatus: true,
            proposedJoiningDate: true,
          },
        },
        company: {
          select: {
            name: true,
            legalName: true,
            domain: true,
          },
        },
      },
    });

    if (!doc) {
      return {
        isValid: false,
        message: 'Invalid or unknown document verification token.',
      };
    }

    return {
      isValid: true,
      verificationToken: doc.verificationToken,
      offerReferenceNumber: doc.offer.offerReferenceNumber,
      companyName: doc.company.name,
      jobTitle: doc.offer.jobTitle,
      department: doc.offer.department,
      issuedAt: doc.createdAt.toISOString(),
      isFinalLegalDocument: doc.isFinalLegalDocument,
      sha256Checksum: doc.sha256Checksum,
      verificationStatus: 'CRYPTOGRAPHICALLY_VERIFIED',
    };
  }

  /**
   * Lists all generated documents (versions and regeneration history) for an offer
   */
  static async listOfferDocuments(companyId: string, offerId: string) {
    const docs = await prisma.generatedDocument.findMany({
      where: { offerId, companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        generator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return docs.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileSizeBytes: Number(d.fileSizeBytes),
      sha256Checksum: d.sha256Checksum,
      verificationToken: d.verificationToken,
      isFinalLegalDocument: d.isFinalLegalDocument,
      generatedBy: d.generator,
      createdAt: d.createdAt.toISOString(),
      downloadUrl: `/api/v1/offers/${offerId}/document/download?documentId=${d.id}`,
      verificationUrl: `/api/v1/offers/document/verify/${d.verificationToken}`,
    }));
  }

  /**
   * DUPLICATE OFFER:
   * Clones an existing offer into a new Draft offer with a fresh reference number.
   */
  static async duplicateOffer(companyId: string, userId: string, offerId: string) {
    const existing = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        templateVersion: true,
      },
    });

    if (!existing) {
      throw new NotFoundError('Source offer to duplicate');
    }

    const offerReferenceNumber = await this.generateReferenceNumber(companyId);

    // Calculate dates: joining date defaulting to source or 30 days from now
    const joiningDate = existing.proposedJoiningDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const duplicatedOffer = await prisma.$transaction(async (tx) => {
      const newOffer = await tx.offer.create({
        data: {
          companyId,
          candidateId: existing.candidateId,
          templateVersionId: existing.templateVersionId,
          offerReferenceNumber,
          currentStatus: OfferStatus.DRAFT_AI,
          currentVersionNumber: 1,

          jobTitle: existing.jobTitle,
          department: existing.department,
          bandGrade: existing.bandGrade,
          reportingManagerName: existing.reportingManagerName,
          reportingManagerTitle: existing.reportingManagerTitle,
          workLocation: existing.workLocation,
          employmentType: existing.employmentType,
          proposedJoiningDate: joiningDate,
          currency: existing.currency,

          baseSalary: existing.baseSalary,
          hraAllowance: existing.hraAllowance,
          specialAllowances: existing.specialAllowances,
          performanceBonus: existing.performanceBonus,
          joiningBonus: existing.joiningBonus,
          totalCtc: existing.totalCtc,
          equityDetails: existing.equityDetails || undefined,
          benefitsSummary: existing.benefitsSummary as any,

          hrConfirmedTerms: existing.hrConfirmedTerms as any,
          humanOverrides: existing.humanOverrides as any,

          assignedRecruiterId: userId,
          createdBy: userId,
        },
        include: {
          candidate: true,
          templateVersion: { include: { template: true } },
          recruiter: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      // Create initial version record for version 1
      await tx.offerVersion.create({
        data: {
          offerId: newOffer.id,
          templateVersionId: newOffer.templateVersionId,
          versionNumber: 1,
          createdBy: userId,
          changeReason: `Cloned from offer ${existing.offerReferenceNumber}`,
          snapshotTerms: {
            jobTitle: newOffer.jobTitle,
            department: newOffer.department,
            totalCtc: Number(newOffer.totalCtc),
            baseSalary: Number(newOffer.baseSalary),
            currency: newOffer.currency,
            workLocation: newOffer.workLocation,
            proposedJoiningDate: newOffer.proposedJoiningDate,
            duplicatedFrom: existing.offerReferenceNumber,
          },
        },
      });

      // Status log
      await tx.offerStatusLog.create({
        data: {
          offerId: newOffer.id,
          fromStatus: OfferStatus.DRAFT_AI,
          toStatus: OfferStatus.DRAFT_AI,
          changedByUserId: userId,
          reasonNotes: `Offer duplicated from ${existing.offerReferenceNumber}`,
        },
      });

      return newOffer;
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: duplicatedOffer.id,
      action: 'CREATE',
      actionDescription: `Duplicated offer ${duplicatedOffer.offerReferenceNumber} from ${existing.offerReferenceNumber}`,
      newState: {
        id: duplicatedOffer.id,
        reference: duplicatedOffer.offerReferenceNumber,
        sourceReference: existing.offerReferenceNumber,
      },
    });

    return duplicatedOffer;
  }

  /**
   * SEND OFFER:
   * Formally issues the offer to the candidate (generates candidate portal token, marks ISSUED, records audit log).
   */
  static async sendOffer(
    companyId: string,
    userId: string,
    offerId: string,
    options?: { message?: string; sendEmail?: boolean }
  ) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: { candidate: true },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    if (offer.currentStatus === OfferStatus.ISSUED) {
      throw new ValidationError('Offer has already been sent to the candidate');
    }

    // Generate candidate portal token if not already generated
    const portalToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(portalToken).digest('hex');
    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days validity

    const fromStatus = offer.currentStatus;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.offer.update({
        where: { id: offerId },
        data: {
          currentStatus: OfferStatus.ISSUED,
          issuedAt: new Date(),
          candidatePortalTokenHash: tokenHash,
          candidatePortalTokenExpiresAt: tokenExpiresAt,
        },
        include: {
          candidate: true,
          templateVersion: { include: { template: true } },
        },
      });

      await tx.offerStatusLog.create({
        data: {
          offerId,
          fromStatus,
          toStatus: OfferStatus.ISSUED,
          changedByUserId: userId,
          reasonNotes: options?.message || 'Offer letter formally issued and sent to candidate',
        },
      });

      return result;
    });

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'OFFER',
      entityId: offerId,
      action: 'ISSUE',
      actionDescription: `Offer ${offer.offerReferenceNumber} sent to candidate ${offer.candidate.firstName} ${offer.candidate.lastName} (${offer.candidate.email})`,
      newState: {
        id: updated.id,
        status: updated.currentStatus,
        issuedAt: updated.issuedAt,
        candidateEmail: offer.candidate.email,
      },
    });

    return {
      offer: updated,
      portalToken,
      portalUrl: `/candidate-portal/offers/${offer.id}?token=${portalToken}`,
      message: `Offer ${offer.offerReferenceNumber} sent successfully to ${offer.candidate.firstName} ${offer.candidate.lastName}`,
    };
  }

  /**
   * GET OFFER HISTORY:
   * Returns comprehensive audit history: version changes, status transition logs, and audit trail.
   */
  static async getOfferHistory(companyId: string, offerId: string) {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, companyId, deletedAt: null },
      include: {
        candidate: true,
        templateVersion: { include: { template: true } },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer');
    }

    const [versions, statusLogs, auditLogs] = await Promise.all([
      prisma.offerVersion.findMany({
        where: { offerId },
        orderBy: { versionNumber: 'desc' },
        include: {
          creator: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.offerStatusLog.findMany({
        where: { offerId },
        orderBy: { createdAt: 'desc' },
        include: {
          changedBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.auditLog.findMany({
        where: {
          companyId,
          entityType: 'OFFER',
          entityId: offerId,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ]);

    return {
      offer: {
        id: offer.id,
        referenceNumber: offer.offerReferenceNumber,
        candidateName: `${offer.candidate.firstName} ${offer.candidate.lastName}`,
        currentStatus: offer.currentStatus,
        currentVersionNumber: offer.currentVersionNumber,
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
      },
      versions,
      statusLogs,
      statusTransitions: statusLogs,
      auditLogs,
    };
  }
}
