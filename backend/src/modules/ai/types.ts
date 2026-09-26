export interface AiCompletionRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AiCompletionResponse {
  rawContent: string;
  modelName: string;
  providerName: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

export interface AiExtractedField<T> {
  value: T | null;
  confidenceScore: number;     // 0.00 to 1.00 (0 if missing)
  sourceSnippet?: string;      // Verbatim text from resume/document
  validationWarning?: string;  // e.g. "Not mentioned in document"
  isDetected: boolean;         // True if explicitly found in document
}

export interface AiCandidateExtractionData {
  // Candidate Personal & Contact Information
  candidateName: AiExtractedField<string>;
  email: AiExtractedField<string>;
  phone: AiExtractedField<string>;
  address: AiExtractedField<string>;

  // Professional Background
  qualification: AiExtractedField<string>;
  experience: AiExtractedField<string>;
  currentEmployer?: AiExtractedField<string>;
  currentTitle?: AiExtractedField<string>;

  // Proposed Role & Organization
  designation: AiExtractedField<string>;
  department: AiExtractedField<string>;
  location: AiExtractedField<string>;
  joiningDate: AiExtractedField<string>;
  employmentType: AiExtractedField<string>;
  reportingManager: AiExtractedField<string>;

  // Additional Context
  otherDetails: AiExtractedField<string>;

  // Compensation Breakdown (if mentioned)
  currency: AiExtractedField<string>;
  baseSalary: AiExtractedField<number>;
  hraAllowance: AiExtractedField<number>;
  specialAllowances: AiExtractedField<number>;
  performanceBonus: AiExtractedField<number>;
  joiningBonus: AiExtractedField<number>;
  totalCtc: AiExtractedField<number>;

  // Metadata & Audit
  overallConfidenceScore: number;
  warnings: string[];
  missingFields: string[]; // Explicit list of fields NOT detected in document
}

export interface AiPolicyComplianceResult {
  isCompliant: boolean;
  overallRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  findings: Array<{
    ruleName: string;
    isViolated: boolean;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    detail: string;
    suggestedRemedy?: string;
  }>;
}

export interface AiSalaryBenchmarkResult {
  marketPercentile: number;
  recommendedRange: {
    min: number;
    median: number;
    max: number;
    currency: string;
  };
  evaluationSummary: string;
  isWithinBudget: boolean;
}

export type AiAssistanceType =
  | 'professional_offer_wording'
  | 'welcome_intro_text'
  | 'job_description_wording'
  | 'general_clauses'
  | 'custom_hr_clauses'
  | 'grammar_improvement'
  | 'content_improvement';

export type AiImprovementGoal =
  | 'grammar'
  | 'clarity'
  | 'concise'
  | 'professional_legal'
  | 'warm_culture';

export type AiReviewStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface AiAssistantItem {
  id: string;
  type: AiAssistanceType;
  title: string;
  originalText?: string;
  content: string;
  keyPoints?: string[];
  changesSummary?: string;
  isAiGenerated: true;
  isEditable: true;
  requiresHrReview: true;
  reviewStatus: AiReviewStatus;
  guardrailNotice: string;
  isPolicyInvented: false;
  context?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  hrFeedbackNotes?: string;
  rejectionReason?: string;
  variationNumber?: number;
}

export interface AiAssistantGenerateInput {
  type: AiAssistanceType;
  instruction: string;
  context?: Record<string, unknown>;
  offerId?: string;
}

export interface AiAssistantImproveInput {
  type?: AiAssistanceType;
  text: string;
  goal?: AiImprovementGoal;
  instruction?: string;
  context?: Record<string, unknown>;
  offerId?: string;
}

export interface AiAssistantRegenerateInput {
  generationId?: string;
  type: AiAssistanceType;
  previousContent: string;
  instruction?: string;
  context?: Record<string, unknown>;
  offerId?: string;
  variationNumber?: number;
}

export interface AiAssistantAcceptInput {
  generationId: string;
  content: string; // The edited or accepted text
  offerId?: string;
  targetField?: string;
  hrFeedbackNotes?: string;
}

export interface AiAssistantRejectInput {
  generationId: string;
  rejectionReason?: string;
  offerId?: string;
}

// ---------------------------------------------------------------------------
// PRE-GENERATION AUDIT & QUALITY ASSURANCE TYPES
// ---------------------------------------------------------------------------
export type PreGenerationStatus = 'PASS' | 'WARNING' | 'REVIEW_REQUIRED';

export type PreGenerationCheckCategory =
  | 'missing_required_fields'
  | 'missing_candidate_company_info'
  | 'date_inconsistencies'
  | 'designation_inconsistencies'
  | 'salary_inconsistencies'
  | 'missing_clauses'
  | 'unreplaced_placeholders'
  | 'content_formatting_issues'
  | 'contradictions';

export interface PreGenerationCheckIssue {
  id: string;
  category: PreGenerationCheckCategory;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  issue: string;
  fieldOrLocation?: string;
  recommendation: string;
  detectedValue?: unknown;
  expectedCondition?: string;
}

export interface CategoryAuditResult {
  category: PreGenerationCheckCategory;
  categoryTitle: string;
  status: PreGenerationStatus;
  issues: PreGenerationCheckIssue[];
  passedChecks: string[];
}

export interface PreGenerationCheckResult {
  status: PreGenerationStatus;
  canProceed: boolean;
  summary: string;
  totalIssuesCount: number;
  criticalIssuesCount: number;
  warningsCount: number;
  checks: Record<PreGenerationCheckCategory, CategoryAuditResult>;
  allIssues: PreGenerationCheckIssue[];
  aiAssistanceNotice: string;
  checkedAt: string;
}
