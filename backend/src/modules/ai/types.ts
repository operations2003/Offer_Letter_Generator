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
  confidenceScore: number;     // 0.00 to 1.00
  sourceSnippet?: string;      // Verbatim text from resume/document
  validationWarning?: string;  // e.g. "Missing country code on phone"
}

export interface AiCandidateExtractionData {
  candidateName: AiExtractedField<string>;
  email: AiExtractedField<string>;
  phone: AiExtractedField<string>;
  currentEmployer: AiExtractedField<string>;
  currentTitle: AiExtractedField<string>;
  offeredRole: AiExtractedField<string>;
  department: AiExtractedField<string>;
  experienceYears: AiExtractedField<number>;
  proposedJoiningDate: AiExtractedField<string>;
  currency: AiExtractedField<string>;
  baseSalary: AiExtractedField<number>;
  hraAllowance: AiExtractedField<number>;
  specialAllowances: AiExtractedField<number>;
  performanceBonus: AiExtractedField<number>;
  joiningBonus: AiExtractedField<number>;
  totalCtc: AiExtractedField<number>;
  overallConfidenceScore: number;
  warnings: string[];
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
  marketPercentile: number; // e.g. 50, 75
  recommendedRange: {
    min: number;
    median: number;
    max: number;
    currency: string;
  };
  evaluationSummary: string;
  isWithinBudget: boolean;
}
