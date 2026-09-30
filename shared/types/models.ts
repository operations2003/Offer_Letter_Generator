// =============================================================================
// SHARED DOMAIN INTERFACES & SCHEMAS
// =============================================================================
// Used by both Backend API and Frontend SPA for end-to-end type safety.
// =============================================================================

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type CandidateDocumentType = 
  | 'RESUME' 
  | 'INTERVIEW_FEEDBACK' 
  | 'COMPENSATION_PROOF' 
  | 'APPROVAL_MEMO' 
  | 'OTHER';

export type DocumentProcessingStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED';

export type AiExtractionStatus = 
  | 'SUCCESS' 
  | 'LOW_CONFIDENCE' 
  | 'PARTIAL' 
  | 'FAILED';

export type AiTaskType = 
  | 'CANDIDATE_DATA_EXTRACTION'
  | 'SALARY_BENCHMARK_CHECK'
  | 'POLICY_COMPLIANCE_CHECK'
  | 'CUSTOM_CLAUSE_DRAFTING'
  | 'COMPENSATION_ANOMALY_DETECTION';

export type TemplateCategory = 
  | 'FULL_TIME' 
  | 'PART_TIME' 
  | 'CONTRACT' 
  | 'INTERNSHIP' 
  | 'EXECUTIVE' 
  | 'CONSULTANT';

export type OfferStatus = 
  | 'DRAFT_AI'
  | 'HR_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ISSUED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN'
  | 'REVISED';

export type GeneratedDocType = 
  | 'OFFER_LETTER_PDF'
  | 'COMPENSATION_ANNEXURE_PDF'
  | 'NDA_DOCUMENT_PDF'
  | 'SIGNED_OFFER_LETTER_PDF';

export type AuditActorType = 'USER' | 'SYSTEM' | 'AI_WORKER' | 'CANDIDATE';

export type AuditAction = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'OVERRIDE'
  | 'APPROVE'
  | 'REJECT'
  | 'ISSUE'
  | 'DOWNLOAD'
  | 'ACCEPT'
  | 'DECLINE'
  | 'REVOKE'
  | 'DELETE';

// =============================================================================
// DATA SEPARATION: AI EXTRACTED vs. HR CONFIRMED
// =============================================================================

export interface AiExtractedField<T> {
  value: T | null;
  confidenceScore: number;     // 0.00 to 1.00
  sourceSnippet?: string;      // Verbatim text from resume/document
  boundingPage?: number;       // Page number for visual highlight in split view
  validationWarning?: string;  // e.g. "Below market standard for Grade L5"
}

export interface AiExtractedTermsPayload {
  candidateName?: AiExtractedField<string>;
  email?: AiExtractedField<string>;
  phone?: AiExtractedField<string>;
  currentEmployer?: AiExtractedField<string>;
  currentTitle?: AiExtractedField<string>;
  offeredRole?: AiExtractedField<string>;
  department?: AiExtractedField<string>;
  proposedJoiningDate?: AiExtractedField<string>;
  currency?: AiExtractedField<string>;
  baseSalary?: AiExtractedField<number>;
  hraAllowance?: AiExtractedField<number>;
  specialAllowances?: AiExtractedField<number>;
  performanceBonus?: AiExtractedField<number>;
  joiningBonus?: AiExtractedField<number>;
  totalCtc?: AiExtractedField<number>;
  equityDetails?: AiExtractedField<string>;
}

export interface HrConfirmedTermsPayload {
  jobTitle: string;
  department: string;
  bandGrade?: string;
  reportingManagerName?: string;
  reportingManagerTitle?: string;
  workLocation: string;
  employmentType: TemplateCategory;
  proposedJoiningDate: string; // ISO Date YYYY-MM-DD
  currency: string;
  
  // Confirmed Compensation (Legal Authority)
  baseSalary: number;
  hraAllowance: number;
  specialAllowances: number;
  performanceBonus: number;
  joiningBonus: number;
  totalCtc: number;
  equityDetails?: {
    grantType: 'RSU' | 'ESOP' | 'STOCK_OPTIONS';
    totalUnits: number;
    vestingPeriodMonths: number;
    cliffMonths: number;
  } | null;
  benefitsSummary: string[];
}

export interface HumanOverrideRecord {
  fieldName: string;
  aiSuggestedValue: unknown;
  aiConfidenceScore: number;
  hrConfirmedValue: unknown;
  overrideReason?: string;
  overriddenByUserId: string;
  timestamp: string;
}

// =============================================================================
// FUTURE HRMS / ATS INTEGRATION PAYLOAD CONTRACTS
// =============================================================================

export interface FutureAtsCandidateImport {
  atsProvider: 'GREENHOUSE' | 'LEVER' | 'WORKDAY' | 'CUSTOM';
  externalCandidateId: string;
  externalJobApplicationId: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  attachments: Array<{
    documentType: CandidateDocumentType;
    downloadUrl: string;
    fileName: string;
  }>;
}

export interface FutureHrmsEmployeeExportPayload {
  event: 'offer.accepted';
  timestamp: string;
  companyId: string;
  externalHrmsCompanyId?: string;
  offerId: string;
  offerReferenceNumber: string;
  candidate: {
    candidateId: string;
    externalHrmsEmployeeId?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  jobDetails: {
    title: string;
    department: string;
    grade?: string;
    joiningDate: string;
    reportingManager?: string;
    workLocation: string;
    employmentType: string;
  };
  compensation: {
    currency: string;
    baseSalary: number;
    totalCtc: number;
    joiningBonus: number;
  };
  legalDocument: {
    signedPdfUrl: string;
    sha256Checksum: string;
    signedAt: string;
  };
}

export * from './document-engine.js';
