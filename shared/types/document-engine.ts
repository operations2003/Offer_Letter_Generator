// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: SHARED TYPE DEFINITIONS & SCHEMAS
// =============================================================================
// Extensible architecture supporting multiple HR & Legal document types
// without rebuilding or duplicating application logic.
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
  | 'DRAFT_AI'           // Initial draft populated with AI extraction/assistance
  | 'HR_REVIEW'          // In review by HR personnel; human edits/overrides logged
  | 'PENDING_APPROVAL'   // Awaiting manager / finance / legal sign-off
  | 'APPROVED'           // Approved for official issuance
  | 'ISSUED'             // Compiled into final legal PDF and dispatched
  | 'ACCEPTED'           // Signed / accepted / acknowledged by recipient
  | 'DECLINED'           // Rejected by recipient
  | 'EXPIRED'            // Validity window passed
  | 'WITHDRAWN'          // Revoked by organization prior to execution
  | 'REVISED';           // Superseded by newer version

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

// =============================================================================
// CONFIGURATION-DRIVEN FIELD DEFINITION
// =============================================================================

export interface DocumentFieldDefinition {
  key: string;
  label: string;
  dataType: FieldDataType;
  description: string;
  placeholder?: string;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>; // For SELECT types
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
  tag: string;                    // e.g. {{employee_name}}
  fieldKey: string;               // maps to field definition key
  description: string;
  sampleValue: string;
  isRequired: boolean;
}

export interface DocumentValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'ERROR' | 'WARNING';
  validate: string;               // Evaluation expression or rule name
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
  confidenceThreshold: number;   // e.g. 0.85
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
  isImplemented: boolean;         // true for Core 9; false for Future 6
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

// =============================================================================
// RUNTIME DOCUMENT INSTANCE WITH STRICT DATA SEGREGATION
// =============================================================================

export interface AiExtractedFieldInfo<T = unknown> {
  value: T | null;
  confidenceScore: number;        // 0.00 to 1.00
  sourceSnippet?: string;         // Verbatim text evidence
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

// The Universal HR Document Interface
export interface HrDocument {
  id: string;
  companyId: string;
  documentTypeCode: DocumentTypeCode;
  referenceNumber: string;
  title: string;
  currentStatus: DocumentLifecycleStatus;
  currentVersionNumber: number;

  // Template link
  templateId: string;
  templateVersionId: string;

  // Recipient / Candidate / Employee / Counterparty
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientExternalId?: string;

  // ---------------------------------------------------------------------------
  // STRICT DATA SEGREGATION: AI ADVISORY vs HR CONFIRMED
  // ---------------------------------------------------------------------------
  // 1. AI Extracted / Advisory Data (Untrusted, Advisory, Confidence-Tagged)
  aiExtractedData: Record<string, AiExtractedFieldInfo>;
  aiConfidenceScore: number;
  aiExtractionWarnings: string[];
  aiReviewStatus?: 'PENDING_AI_REVIEW' | 'VERIFIED_BY_HR' | 'OVERRIDDEN';
  isAiGenerated?: boolean;

  // 2. HR-Confirmed Data (Legal Authority - ONLY this is used to render final PDFs!)
  hrConfirmedData: Record<string, unknown>;

  // 3. Human Override Audit Trail
  humanOverrides: HumanOverrideEntry[];

  // ---------------------------------------------------------------------------
  // VERSIONING & SNAPSHOTS
  // ---------------------------------------------------------------------------
  versions: DocumentVersionSnapshot[];

  // ---------------------------------------------------------------------------
  // GENERATED ARTIFACTS
  // ---------------------------------------------------------------------------
  generatedFiles: GeneratedFileMetadata[];

  // ---------------------------------------------------------------------------
  // LIFECYCLE & AUDIT
  // ---------------------------------------------------------------------------
  statusHistory: DocumentStatusLogItem[];

  // Signatory Authority
  signatoryName: string;
  signatoryTitle: string;

  // Validity and Schedule
  effectiveDate?: string;
  validUntil?: string;
  issuedAt?: string;

  // Future HRMS / ATS Integration Ports
  externalHrmsDocumentId?: string;
  externalHrmsEmployeeId?: string;
  externalAtsId?: string;

  // Timestamps & Soft Deletion
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
