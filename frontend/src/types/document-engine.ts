// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: FRONTEND TYPES
// =============================================================================

export type CoreDocumentTypeCode =
  | 'OFFER_LETTER'
  | 'INTERNSHIP_LETTER'
  | 'INCREMENT_LETTER'
  | 'TERMINATION_LETTER'
  | 'EXPERIENCE_LETTER'
  | 'RELIEVING_LETTER'
  | 'FNF_SETTLEMENT'
  | 'CONTRACT_LETTER'
  | 'MSA';

export type FutureDocumentTypeCode =
  | 'POLICY'
  | 'ONBOARDING_FORM'
  | 'LD_COURSE'
  | 'CERTIFICATE'
  | 'APTITUDE_TEST'
  | 'QUIZ';

export type DocumentTypeCode = CoreDocumentTypeCode | FutureDocumentTypeCode;

export type DocumentCategory =
  | 'EMPLOYMENT'
  | 'LIFECYCLE'
  | 'LEGAL'
  | 'EXIT'
  | 'COMPENSATION'
  | 'POLICY_LEARNING';

export type DocumentLifecycleStatus =
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

export type FieldDataType =
  | 'STRING'
  | 'NUMBER'
  | 'CURRENCY'
  | 'DATE'
  | 'BOOLEAN'
  | 'SELECT'
  | 'TEXTAREA'
  | 'ARRAY'
  | 'OBJECT';

export interface DocumentFieldDefinition {
  key: string;
  label: string;
  dataType: FieldDataType;
  description: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  validationRule?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidatorName?: string;
    errorMessage?: string;
  };
  aiExtractable?: boolean;
  sectionKey: string;
}

export interface DocumentSectionDefinition {
  key: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface DocumentPlaceholderDefinition {
  tag: string;
  fieldKey: string;
  description: string;
  sampleValue: string;
  isRequired: boolean;
}

export interface DocumentValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'ERROR' | 'WARNING';
  validate: string;
  errorMessage: string;
}

export interface DocumentAiCapabilities {
  supportsResumeExtraction: boolean;
  supportsDocumentExtraction: boolean;
  extractionTasks: string[];
  draftingAssistanceTasks: Array<{
    taskCode: string;
    label: string;
    description: string;
  }>;
  confidenceThreshold: number;
}

export interface DocumentQualityCheckDefinition {
  id: string;
  title: string;
  description: string;
  category: 'COMPENSATION' | 'COMPLIANCE' | 'TIMELINE' | 'LEGAL';
  isBlocking: boolean;
}

export interface DocumentStatusFlowStep {
  status: DocumentLifecycleStatus;
  label: string;
  description: string;
  order: number;
}

export interface DocumentStatusFlowDefinition {
  initialStatus: DocumentLifecycleStatus;
  terminalStatuses: DocumentLifecycleStatus[];
  steps: DocumentStatusFlowStep[];
}

export interface DocumentTypeDefinition {
  code: DocumentTypeCode;
  name: string;
  category: DocumentCategory;
  description: string;
  iconName: string;
  isImplemented: boolean;
  version: number;
  sections: DocumentSectionDefinition[];
  requiredFields: DocumentFieldDefinition[];
  optionalFields: DocumentFieldDefinition[];
  placeholders: DocumentPlaceholderDefinition[];
  validationRules: DocumentValidationRule[];
  statusFlow: DocumentStatusFlowDefinition;
  aiCapabilities: DocumentAiCapabilities;
  qualityChecks: DocumentQualityCheckDefinition[];
}

export interface AiExtractedFieldInfo<T = unknown> {
  value: T | null;
  confidenceScore: number;
  sourceSnippet?: string;
  boundingPage?: number;
  isDetected: boolean;
  warning?: string;
}

export interface HumanOverrideEntry {
  fieldKey: string;
  aiSuggestedValue: unknown;
  aiConfidenceScore: number;
  hrConfirmedValue: unknown;
  overrideReason?: string;
  overriddenByUserId: string;
  timestamp: string;
}

export interface DocumentVersionSnapshot {
  versionNumber: number;
  snapshotTerms: Record<string, unknown>;
  diffFromPrevious: Record<string, { from: unknown; to: unknown }>;
  changeReason?: string;
  createdByUserId: string;
  createdAt: string;
}

export interface GeneratedFileMetadata {
  fileId: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  verificationToken: string;
  isFinalLegalDocument: boolean;
  generatedByUserId: string;
  generatedAt: string;
}

export interface DocumentStatusLogItem {
  id: string;
  fromStatus: DocumentLifecycleStatus;
  toStatus: DocumentLifecycleStatus;
  changedByUserId: string;
  reasonNotes?: string;
  timestamp: string;
}

export interface HrDocument {
  id: string;
  companyId: string;
  documentTypeCode: DocumentTypeCode;
  referenceNumber: string;
  title: string;
  currentStatus: DocumentLifecycleStatus;
  currentVersionNumber: number;
  templateId: string;
  templateVersionId: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientExternalId?: string;

  aiExtractedData: Record<string, AiExtractedFieldInfo>;
  aiConfidenceScore: number;
  aiExtractionWarnings: string[];
  aiReviewStatus?: 'PENDING_AI_REVIEW' | 'VERIFIED_BY_HR' | 'OVERRIDDEN';
  isAiGenerated?: boolean;

  hrConfirmedData: Record<string, unknown>;
  humanOverrides: HumanOverrideEntry[];

  versions: DocumentVersionSnapshot[];
  generatedFiles: GeneratedFileMetadata[];
  statusHistory: DocumentStatusLogItem[];

  signatoryName: string;
  signatoryTitle: string;
  effectiveDate?: string;
  validUntil?: string;
  issuedAt?: string;

  externalHrmsDocumentId?: string;
  externalHrmsEmployeeId?: string;
  externalAtsId?: string;

  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
