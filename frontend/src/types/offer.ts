import { TemplateCategory } from './template.js';
import {
  AiCandidateExtractionData,
  FieldDecision,
  HumanOverrideItem,
  HrConfirmedTerms,
} from './index.js';

export interface OfferClauseItem {
  id: string;
  title: string;
  content: string;
  isMandatory?: boolean;
  isCustom?: boolean;
  isAiGenerated?: boolean;
  isConfirmedByHr?: boolean;
  category?: 'TERMS' | 'IP' | 'BENEFITS' | 'CONFIDENTIALITY' | 'CUSTOM';
}

export interface CandidateDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  currentTitle?: string;
  currentEmployer?: string;
  currentLocation?: string;
  experienceYears?: number;
  qualification?: string;
}

export interface CompensationData {
  currency: string;
  baseSalary: number;
  hraAllowance: number;
  specialAllowances: number;
  performanceBonus: number;
  joiningBonus: number;
  totalCtc: number;
  equityDetails?: {
    sharesCount?: number;
    vestingPeriodMonths?: number;
    cliffMonths?: number;
    schemeType?: string;
    notes?: string;
  };
  benefitsSummary?: string[];
}

export interface JobEmploymentDetails {
  jobTitle: string;
  department: string;
  bandGrade: string;
  workLocation: string;
  employmentType: TemplateCategory;
  proposedJoiningDate: string;
  reportingManagerName: string;
  reportingManagerTitle: string;
}

export interface TermsAndPolicies {
  probationDurationDays: number;
  noticePeriodDays: number;
  workingHoursPerWeek: number;
  workSchedule: string;
  offerValidUntil: string;
  clauses: OfferClauseItem[];
}

export interface AiQualityCheckResult {
  overallQualityScore: number; // 0 - 100
  isReadyForIssuance: boolean;
  readabilityScore: string;
  completenessScore: number;
  compensationCheck: {
    isMathConsistent: boolean;
    breakdownSum: number;
    statedTotalCtc: number;
    discrepancy: number;
  };
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
  missingFields: string[];
}

export interface AiPerkSuggestion {
  id: string;
  category: string;
  title: string;
  suggestedWording: string;
  rationale: string;
  requiresHumanConfirmation: boolean;
}

export interface GeneratedOfferResult {
  id: string;
  referenceNumber: string;
  currentStatus: string;
  versionNumber: number;
  renderedHtml: string;
  plainText: string;
  verificationToken: string;
  sha256Checksum?: string;
  fileSizeBytes?: number;
  fileName?: string;
  downloadUrl?: string;
  verificationUrl?: string;
  documentId?: string;
  createdAt: string;
}

export interface GeneratedDocumentItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  verificationToken: string;
  isFinalLegalDocument: boolean;
  generatedBy?: { id: string; firstName: string; lastName: string; email: string };
  createdAt: string;
  downloadUrl: string;
  verificationUrl: string;
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
