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
