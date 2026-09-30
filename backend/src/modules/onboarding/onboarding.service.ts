// =============================================================================
// REUSABLE ONBOARDING ENGINE: ONBOARDING MANAGEMENT SERVICE
// =============================================================================
// Handles:
// 1. Configurable Onboarding Form schema (sections, fields, required documents)
// 2. Candidate Onboarding initiation and tracking
// 3. Multi-section data collection and validation
// 4. Document collection and HR verification
// 5. Candidate declaration & consent
// 6. Configurable Joining Checklist (IT, HR, Facilities, Manager, Employee)
// 7. Full lifecycle status flow with audit ledger integration
// =============================================================================

import crypto from 'crypto';
import {
  OnboardingFormConfig,
  OnboardingCandidateRecord,
  CandidateOnboardingData,
  OnboardingStatus,
  CollectedDocument,
  JoiningChecklistItemInstance,
} from '../../../../shared/types/onboarding-engine.js';
import { DEFAULT_ONBOARDING_CONFIG } from './onboarding.default-config.js';
import { AuditService } from '../audit/audit.service.js';
import { NotFoundError, ValidationError } from '../../errors/app-error.js';

export interface InitiateOnboardingDto {
  companyId: string;
  candidateName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  joiningDate: string;
  offerId?: string;
  creatorId: string;
}

export class OnboardingService {
  // In-memory persistent stores
  private configStore: Map<string, OnboardingFormConfig> = new Map();
  private candidateStore: Map<string, OnboardingCandidateRecord> = new Map();

  constructor() {
    // Initialize default config for company
    this.configStore.set(DEFAULT_ONBOARDING_CONFIG.companyId, JSON.parse(JSON.stringify(DEFAULT_ONBOARDING_CONFIG)));

    // Seed realistic demo candidate matching TaskNera HRMS portal
    this.seedDemoCandidate();
  }

  private seedDemoCandidate() {
    const candidateId = 'onb_cand_1048';
    const joiningDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const config = this.getFormConfigSync('cmp_tasknera_001');

    const checklist: JoiningChecklistItemInstance[] = config.defaultChecklist.map((tpl) => {
      const offsetMs = tpl.dueDateOffsetDays * 24 * 60 * 60 * 1000;
      const targetDate = new Date(new Date(joiningDate).getTime() + offsetMs).toISOString().split('T')[0];
      return {
        id: `chk_inst_${crypto.randomUUID().slice(0, 8)}`,
        templateId: tpl.id,
        title: tpl.title,
        description: tpl.description,
        assigneeRole: tpl.assigneeRole,
        isMandatory: tpl.isMandatory,
        dueDate: targetDate,
        isCompleted: false,
      };
    });

    const demoCandidate: OnboardingCandidateRecord = {
      id: candidateId,
      companyId: 'cmp_tasknera_001',
      offerId: 'off_tn_2026_0042',
      candidateName: 'Sakshi Koparde',
      email: 'sakshi@tasknera.com',
      phone: '+91 98765 43210',
      designation: 'Senior Lead Architect',
      department: 'Engineering',
      joiningDate,
      status: 'UNDER_HR_REVIEW',
      progressPercent: 88,
      formConfigVersion: config.version,
      submittedData: {
        personalInfo: {
          firstName: 'Sakshi',
          lastName: 'Koparde',
          dateOfBirth: '1996-05-14',
          gender: 'Female',
          bloodGroup: 'O+',
          maritalStatus: 'Single',
          nationality: 'Indian',
          fatherOrSpouseName: 'Rajesh Koparde',
        },
        contactInfo: {
          personalEmail: 'sakshi@tasknera.com',
          mobileNumber: '+91 98765 43210',
          currentAddress: 'Tower 4, Blue Ridge, Hinjewadi Phase 1',
          permanentAddress: 'Shivaji Nagar, Pune',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411057',
          country: 'India',
        },
        education: [
          {
            degree: 'Bachelor of Technology (Computer Science)',
            institution: 'Pune Institute of Computer Technology (PICT)',
            universityOrBoard: 'Savitribai Phule Pune University',
            endYear: '2018',
            gradeOrPercentage: '8.8 CGPA',
          },
        ],
        previousEmployment: [
          {
            companyName: 'NexGen Cloud Systems Pvt Ltd',
            designation: 'Senior Software Engineer',
            employmentType: 'FULL_TIME',
            startDate: '2021-02-01',
            endDate: '2026-08-31',
            reasonForLeaving: 'Career advancement and enterprise architectural growth',
            lastDrawnCtc: '22,00,000 INR',
          },
        ],
        emergencyContact: {
          primaryName: 'Rajesh Koparde',
          relationship: 'Parent',
          primaryPhone: '+91 98765 99999',
          address: 'Shivaji Nagar, Pune',
        },
        bankDetails: {
          accountHolderName: 'SAKSHI KOPARDE',
          bankName: 'HDFC Bank',
          accountNumber: '50100234567890',
          ifscOrRoutingCode: 'HDFC0001234',
          branchName: 'Hinjewadi Phase 1, Pune',
          accountType: 'SAVINGS',
          panNumber: 'ABCDE1234F',
        },
        documents: [
          {
            id: 'doc_pan_01',
            documentCode: 'PAN_CARD',
            fileName: 'pan_card_sakshi_koparde.pdf',
            fileSize: 420000,
            mimeType: 'application/pdf',
            uploadedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'VERIFIED',
          },
          {
            id: 'doc_aadhaar_02',
            documentCode: 'AADHAAR_OR_PASSPORT',
            fileName: 'aadhaar_card_masked.pdf',
            fileSize: 680000,
            mimeType: 'application/pdf',
            uploadedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'VERIFIED',
          },
          {
            id: 'doc_degree_03',
            documentCode: 'DEGREE_CERTIFICATE',
            fileName: 'btech_convocation_degree.pdf',
            fileSize: 1200000,
            mimeType: 'application/pdf',
            uploadedAt: new Date(Date.now() - 3600000).toISOString(),
            status: 'VERIFIED',
          },
        ],
        declaration: {
          hasConsentedBgv: true,
          hasConfirmedAccuracy: true,
          agreedToPolicies: true,
          electronicSignature: 'Sakshi Koparde',
          signatureDate: new Date().toISOString().split('T')[0],
        },
      },
      checklist,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.candidateStore.set(candidateId, demoCandidate);
  }

  // ---------------------------------------------------------------------------
  // 1. Configurable Form Schema Methods
  // ---------------------------------------------------------------------------

  public async getFormConfig(companyId: string): Promise<OnboardingFormConfig> {
    return this.getFormConfigSync(companyId);
  }

  private getFormConfigSync(companyId: string): OnboardingFormConfig {
    const existing = this.configStore.get(companyId);
    if (existing) {
      return JSON.parse(JSON.stringify(existing));
    }
    const copy: OnboardingFormConfig = {
      ...JSON.parse(JSON.stringify(DEFAULT_ONBOARDING_CONFIG)),
      companyId,
    };
    this.configStore.set(companyId, copy);
    return copy;
  }

  public async updateFormConfig(
    companyId: string,
    updates: Partial<OnboardingFormConfig>,
    userId: string
  ): Promise<OnboardingFormConfig> {
    const current = await this.getFormConfig(companyId);
    const previousState = JSON.parse(JSON.stringify(current));

    const updated: OnboardingFormConfig = {
      ...current,
      ...updates,
      id: current.id,
      companyId,
      version: updates.version || (parseFloat(current.version) + 0.1).toFixed(1),
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
    };

    this.configStore.set(companyId, updated);

    await AuditService.record({
      companyId,
      actorType: 'USER',
      actorId: userId,
      entityType: 'ONBOARDING_CONFIG',
      entityId: updated.id,
      action: 'UPDATE',
      actionDescription: `Updated onboarding form configuration to v${updated.version}`,
      previousState,
      newState: updated as any,
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // 2. Candidate Onboarding Initiation & Retrieval
  // ---------------------------------------------------------------------------

  public async initiateOnboarding(dto: InitiateOnboardingDto): Promise<OnboardingCandidateRecord> {
    if (!dto.candidateName || !dto.email || !dto.joiningDate) {
      throw new ValidationError('Candidate Name, Email, and Joining Date are required');
    }

    const config = await this.getFormConfig(dto.companyId || 'cmp_tasknera_001');
    const candidateId = `onb_${crypto.randomUUID().slice(0, 10)}`;

    // Build checklist instance from template with dynamically calculated due dates
    const checklist: JoiningChecklistItemInstance[] = (config.defaultChecklist || []).map((tpl) => {
      const offsetMs = (tpl.dueDateOffsetDays || 0) * 24 * 60 * 60 * 1000;
      const targetDate = new Date(new Date(dto.joiningDate).getTime() + offsetMs).toISOString().split('T')[0];
      return {
        id: `chk_${crypto.randomUUID().slice(0, 8)}`,
        templateId: tpl.id,
        title: tpl.title,
        description: tpl.description,
        assigneeRole: tpl.assigneeRole,
        isMandatory: tpl.isMandatory,
        dueDate: targetDate,
        isCompleted: false,
      };
    });

    const record: OnboardingCandidateRecord = {
      id: candidateId,
      companyId: dto.companyId || 'cmp_tasknera_001',
      offerId: dto.offerId,
      candidateName: dto.candidateName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone || '',
      designation: dto.designation || 'Software Engineer',
      department: dto.department || 'Engineering',
      joiningDate: dto.joiningDate,
      status: 'INVITED',
      progressPercent: 0,
      formConfigVersion: config.version,
      submittedData: {},
      checklist,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.candidateStore.set(candidateId, record);

    await AuditService.record({
      companyId: record.companyId,
      actorType: 'USER',
      actorId: dto.creatorId,
      entityType: 'ONBOARDING_CANDIDATE',
      entityId: record.id,
      action: 'CREATE',
      actionDescription: `Initiated onboarding for ${record.candidateName} (${record.designation})`,
      newState: record as any,
    });

    return record;
  }

  public async listCandidates(filters?: {
    companyId?: string;
    status?: OnboardingStatus;
    search?: string;
  }): Promise<OnboardingCandidateRecord[]> {
    let list = Array.from(this.candidateStore.values());

    if (filters?.companyId) {
      list = list.filter((c) => c.companyId === filters.companyId);
    }

    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.candidateName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.designation.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getCandidateById(id: string): Promise<OnboardingCandidateRecord> {
    const candidate = this.candidateStore.get(id);
    if (!candidate) {
      throw new NotFoundError(`Onboarding candidate record not found for id: ${id}`);
    }
    return JSON.parse(JSON.stringify(candidate));
  }

  // ---------------------------------------------------------------------------
  // 3. Multi-Section Data Collection & Progress Tracking
  // ---------------------------------------------------------------------------

  public async saveDraft(
    id: string,
    partialData: Partial<CandidateOnboardingData>,
    updatedBy: string
  ): Promise<OnboardingCandidateRecord> {
    const candidate = await this.getCandidateById(id);
    const previousState = JSON.parse(JSON.stringify(candidate));

    const updatedSubmittedData: Partial<CandidateOnboardingData> = {
      ...candidate.submittedData,
      ...partialData,
    };

    const config = await this.getFormConfig(candidate.companyId);
    const progress = this.computeProgressPercentage(updatedSubmittedData, config);

    candidate.submittedData = updatedSubmittedData;
    candidate.progressPercent = progress;
    if (candidate.status === 'INVITED') {
      candidate.status = 'IN_PROGRESS';
    }
    candidate.updatedAt = new Date().toISOString();

    this.candidateStore.set(id, candidate);

    await AuditService.record({
      companyId: candidate.companyId,
      actorType: 'USER',
      actorId: updatedBy,
      entityType: 'ONBOARDING_CANDIDATE',
      entityId: id,
      action: 'UPDATE',
      actionDescription: `Saved onboarding draft progress (${progress}%)`,
      previousState,
      newState: candidate as any,
    });

    return candidate;
  }

  public async submitForm(
    id: string,
    submission: CandidateOnboardingData,
    submittedBy: string
  ): Promise<OnboardingCandidateRecord> {
    const candidate = await this.getCandidateById(id);
    const config = await this.getFormConfig(candidate.companyId);

    // Validate submission against configurable sections & required fields
    this.validateCandidateSubmission(submission, config);

    const previousState = JSON.parse(JSON.stringify(candidate));

    candidate.submittedData = submission;
    candidate.status = 'SUBMITTED';
    candidate.progressPercent = 100;
    candidate.updatedAt = new Date().toISOString();

    this.candidateStore.set(id, candidate);

    await AuditService.record({
      companyId: candidate.companyId,
      actorType: 'USER',
      actorId: submittedBy,
      entityType: 'ONBOARDING_CANDIDATE',
      entityId: id,
      action: 'UPDATE',
      actionDescription: `Candidate submitted all required onboarding details and documents`,
      previousState,
      newState: candidate as any,
    });

    return candidate;
  }

  // ---------------------------------------------------------------------------
  // 4. Document Collection & HR Document Verification
  // ---------------------------------------------------------------------------

  public async uploadDocument(
    candidateId: string,
    docData: {
      documentCode: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      fileUrl?: string;
    }
  ): Promise<CollectedDocument> {
    const candidate = await this.getCandidateById(candidateId);
    const documents = candidate.submittedData?.documents || [];

    const newDoc: CollectedDocument = {
      id: `doc_${crypto.randomUUID().slice(0, 8)}`,
      documentCode: docData.documentCode,
      fileName: docData.fileName,
      fileSize: docData.fileSize,
      mimeType: docData.mimeType,
      fileUrl: docData.fileUrl || `/mock-storage/${docData.fileName}`,
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    // Filter out old version of same documentCode if present
    const updatedDocs = documents.filter((d) => d.documentCode !== docData.documentCode);
    updatedDocs.push(newDoc);

    candidate.submittedData = {
      ...candidate.submittedData,
      documents: updatedDocs,
    };
    candidate.updatedAt = new Date().toISOString();

    this.candidateStore.set(candidateId, candidate);
    return newDoc;
  }

  public async verifyDocument(
    candidateId: string,
    documentId: string,
    decision: 'VERIFIED' | 'REJECTED',
    reason?: string,
    reviewerId?: string
  ): Promise<OnboardingCandidateRecord> {
    const candidate = await this.getCandidateById(candidateId);
    const documents = candidate.submittedData?.documents || [];
    const doc = documents.find((d) => d.id === documentId);

    if (!doc) {
      throw new NotFoundError(`Document not found: ${documentId}`);
    }

    doc.status = decision;
    if (decision === 'REJECTED') {
      doc.rejectionReason = reason || 'Document image is blurred or illegible';
    } else {
      doc.rejectionReason = undefined;
    }

    candidate.updatedAt = new Date().toISOString();
    this.candidateStore.set(candidateId, candidate);

    await AuditService.record({
      companyId: candidate.companyId,
      actorType: 'USER',
      actorId: reviewerId,
      entityType: 'ONBOARDING_DOCUMENT',
      entityId: documentId,
      action: decision === 'VERIFIED' ? 'APPROVE' : 'REJECT',
      actionDescription: `HR verified document ${doc.documentCode} with decision ${decision}`,
    });

    return candidate;
  }

  // ---------------------------------------------------------------------------
  // 5. Joining Checklist Execution
  // ---------------------------------------------------------------------------

  public async updateChecklistItem(
    candidateId: string,
    itemId: string,
    updates: { isCompleted: boolean; notes?: string },
    actorId: string
  ): Promise<OnboardingCandidateRecord> {
    const candidate = await this.getCandidateById(candidateId);
    const item = candidate.checklist.find((c) => c.id === itemId);

    if (!item) {
      throw new NotFoundError(`Checklist item not found: ${itemId}`);
    }

    item.isCompleted = updates.isCompleted;
    if (updates.isCompleted) {
      item.completedAt = new Date().toISOString();
      item.completedBy = actorId;
    } else {
      item.completedAt = undefined;
      item.completedBy = undefined;
    }
    if (updates.notes !== undefined) {
      item.notes = updates.notes;
    }

    // Auto-advance status if all mandatory items are done and candidate is verified
    const allMandatoryDone = candidate.checklist
      .filter((c) => c.isMandatory)
      .every((c) => c.isCompleted);

    if (allMandatoryDone && candidate.status === 'VERIFIED') {
      candidate.status = 'READY_FOR_JOINING';
    }

    candidate.updatedAt = new Date().toISOString();
    this.candidateStore.set(candidateId, candidate);

    return candidate;
  }

  // ---------------------------------------------------------------------------
  // 6. HR Review & Onboarding Status Transitions
  // ---------------------------------------------------------------------------

  public async reviewCandidate(
    id: string,
    decision: 'VERIFY' | 'REQUEST_CHANGES' | 'COMPLETE',
    notes: string,
    reviewerId: string
  ): Promise<OnboardingCandidateRecord> {
    const candidate = await this.getCandidateById(id);
    const previousState = JSON.parse(JSON.stringify(candidate));

    if (decision === 'REQUEST_CHANGES') {
      candidate.status = 'CHANGES_REQUESTED';
      candidate.changesRequestedNotes = notes;
    } else if (decision === 'VERIFY') {
      candidate.status = 'VERIFIED';
      candidate.hrNotes = notes;

      const allMandatoryDone = candidate.checklist
        .filter((c) => c.isMandatory)
        .every((c) => c.isCompleted);

      if (allMandatoryDone) {
        candidate.status = 'READY_FOR_JOINING';
      }
    } else if (decision === 'COMPLETE') {
      candidate.status = 'COMPLETED';
      candidate.completedAt = new Date().toISOString();
      candidate.hrNotes = notes;
    }

    candidate.updatedAt = new Date().toISOString();
    this.candidateStore.set(id, candidate);

    await AuditService.record({
      companyId: candidate.companyId,
      actorType: 'USER',
      actorId: reviewerId,
      entityType: 'ONBOARDING_CANDIDATE',
      entityId: id,
      action: decision === 'REQUEST_CHANGES' ? 'REJECT' : 'APPROVE',
      actionDescription: `HR reviewed candidate onboarding with decision ${decision}. New status: ${candidate.status}`,
      previousState,
      newState: candidate as any,
    });

    return candidate;
  }

  // ---------------------------------------------------------------------------
  // Validation Helpers
  // ---------------------------------------------------------------------------

  private computeProgressPercentage(
    data: Partial<CandidateOnboardingData>,
    config: OnboardingFormConfig
  ): number {
    const enabledSections = config.sections.filter((s) => s.isEnabled);
    if (enabledSections.length === 0) return 100;

    let completedSections = 0;

    for (const section of enabledSections) {
      if (section.key === 'personal_info') {
        if (data.personalInfo?.firstName && data.personalInfo?.lastName && data.personalInfo?.dateOfBirth) {
          completedSections++;
        }
      } else if (section.key === 'contact_info') {
        if (data.contactInfo?.personalEmail && data.contactInfo?.mobileNumber && data.contactInfo?.city) {
          completedSections++;
        }
      } else if (section.key === 'education') {
        if (Array.isArray(data.education) && data.education.length > 0) {
          completedSections++;
        }
      } else if (section.key === 'previous_employment') {
        if (!section.isRequired || (Array.isArray(data.previousEmployment) && data.previousEmployment.length > 0)) {
          completedSections++;
        }
      } else if (section.key === 'emergency_contact') {
        if (data.emergencyContact?.primaryName && data.emergencyContact?.primaryPhone) {
          completedSections++;
        }
      } else if (section.key === 'bank_details') {
        if (data.bankDetails?.accountNumber && data.bankDetails?.ifscOrRoutingCode) {
          completedSections++;
        }
      } else if (section.key === 'document_collection') {
        const requiredDocCodes = config.requiredDocuments.filter((d) => d.required).map((d) => d.code);
        const uploadedCodes = (data.documents || []).map((d) => d.documentCode);
        const allUploaded = requiredDocCodes.every((c) => uploadedCodes.includes(c));
        if (allUploaded) {
          completedSections++;
        }
      } else if (section.key === 'declaration') {
        if (data.declaration?.hasConsentedBgv && data.declaration?.electronicSignature) {
          completedSections++;
        }
      }
    }

    return Math.min(100, Math.round((completedSections / enabledSections.length) * 100));
  }

  private validateCandidateSubmission(submission: CandidateOnboardingData, config: OnboardingFormConfig): void {
    if (!submission) {
      throw new ValidationError('Onboarding submission payload is required');
    }

    // 1. Personal Info validation
    const personalSection = config.sections.find((s) => s.key === 'personal_info' && s.isEnabled);
    if (personalSection?.isRequired) {
      if (!submission.personalInfo?.firstName || !submission.personalInfo?.lastName) {
        throw new ValidationError('Personal Information: First and Last Name are required');
      }
      if (!submission.personalInfo?.dateOfBirth) {
        throw new ValidationError('Personal Information: Date of Birth is required');
      }
    }

    // 2. Contact Info validation
    const contactSection = config.sections.find((s) => s.key === 'contact_info' && s.isEnabled);
    if (contactSection?.isRequired) {
      if (!submission.contactInfo?.personalEmail || !submission.contactInfo?.mobileNumber) {
        throw new ValidationError('Contact Information: Email and Mobile Number are required');
      }
    }

    // 3. Emergency Contact validation
    const emergencySection = config.sections.find((s) => s.key === 'emergency_contact' && s.isEnabled);
    if (emergencySection?.isRequired) {
      if (!submission.emergencyContact?.primaryName || !submission.emergencyContact?.primaryPhone) {
        throw new ValidationError('Emergency Contact: Contact Name and Phone are required');
      }
    }

    // 4. Bank Details validation
    const bankSection = config.sections.find((s) => s.key === 'bank_details' && s.isEnabled);
    if (bankSection?.isRequired) {
      if (!submission.bankDetails?.accountNumber || !submission.bankDetails?.ifscOrRoutingCode) {
        throw new ValidationError('Bank Details: Account Number and IFSC / Routing Code are required');
      }
    }

    // 5. Document Collection validation
    const requiredDocs = config.requiredDocuments.filter((d) => d.required);
    const uploadedDocs = submission.documents || [];
    for (const req of requiredDocs) {
      const isPresent = uploadedDocs.some((d) => d.documentCode === req.code);
      if (!isPresent) {
        throw new ValidationError(`Required Document Missing: Please upload ${req.name}`);
      }
    }

    // 6. Declaration validation
    const declarationSection = config.sections.find((s) => s.key === 'declaration' && s.isEnabled);
    if (declarationSection?.isRequired) {
      if (!submission.declaration?.hasConsentedBgv) {
        throw new ValidationError('Declaration: Background verification consent is required');
      }
      if (!submission.declaration?.hasConfirmedAccuracy) {
        throw new ValidationError('Declaration: Accuracy certification is required');
      }
      if (!submission.declaration?.electronicSignature) {
        throw new ValidationError('Declaration: Electronic signature is required');
      }
    }
  }
}
