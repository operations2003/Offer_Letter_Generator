import { OfferStatus, TemplateCategory } from '@prisma/client';

export interface CandidateDetailsInput {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentEmployer?: string;
  currentLocation?: string;
  experienceYears?: number;
}

export interface CompensationInput {
  currency: string;
  baseSalary: number;
  hraAllowance?: number;
  specialAllowances?: number;
  performanceBonus?: number;
  joiningBonus?: number;
  totalCtc?: number;
  equityDetails?: {
    sharesCount?: number;
    vestingPeriodMonths?: number;
    cliffMonths?: number;
    schemeType?: string;
    notes?: string;
  };
  benefitsSummary?: string[];
}

export interface ProbationInput {
  durationMonths?: number;
  durationDays?: number;
  terms?: string;
  reviewCriteria?: string[];
  isConfirmedByHr?: boolean;
}

export interface NoticePeriodInput {
  days?: number;
  probationDays?: number;
  terms?: string;
  isConfirmedByHr?: boolean;
}

export interface WorkingHoursInput {
  hoursPerWeek?: number;
  schedule?: string;
  workModel?: 'ON_SITE' | 'HYBRID' | 'REMOTE';
  terms?: string;
  isConfirmedByHr?: boolean;
}

export interface OfferClauseItem {
  id?: string;
  title: string;
  content: string;
  isMandatory?: boolean;
  isCustom?: boolean;
  isAiGenerated?: boolean;
  isConfirmedByHr?: boolean;
  displayOrder?: number;
}

export interface CreateOfferInput {
  candidateId?: string;
  candidateDetails?: CandidateDetailsInput;
  templateVersionId?: string;
  jobTitle: string;
  department: string;
  bandGrade?: string;
  workLocation: string;
  employmentType: TemplateCategory;
  proposedJoiningDate: string; // ISO Date string
  reportingManagerName?: string;
  reportingManagerTitle?: string;
  compensation: CompensationInput;
  probation?: ProbationInput;
  noticePeriod?: NoticePeriodInput;
  workingHours?: WorkingHoursInput;
  offerValidUntil?: string; // ISO Date string
  termsAndClauses?: OfferClauseItem[];
  additionalHrTerms?: Record<string, unknown>;
  aiExtractedDataId?: string;
  aiSuggestedTerms?: Record<string, unknown>;
  humanOverrides?: Array<{
    fieldName: string;
    previousValue: unknown;
    newValue: unknown;
    reason?: string;
    timestamp?: string;
  }>;
}

export interface SaveDraftInput {
  candidateId?: string;
  candidateDetails?: Partial<CandidateDetailsInput>;
  templateVersionId?: string;
  jobTitle?: string;
  department?: string;
  bandGrade?: string;
  workLocation?: string;
  employmentType?: TemplateCategory;
  proposedJoiningDate?: string;
  reportingManagerName?: string;
  reportingManagerTitle?: string;
  compensation?: Partial<CompensationInput>;
  probation?: ProbationInput;
  noticePeriod?: NoticePeriodInput;
  workingHours?: WorkingHoursInput;
  offerValidUntil?: string;
  termsAndClauses?: OfferClauseItem[];
  additionalHrTerms?: Record<string, unknown>;
  aiExtractedDataId?: string;
  aiSuggestedTerms?: Record<string, unknown>;
  changeReason?: string;
}

export interface UpdateOfferInput extends SaveDraftInput {
  changeReason?: string;
}

export interface OfferStatusTransitionInput {
  targetStatus: OfferStatus;
  reasonNotes?: string;
}

export interface AiClauseGenerationInput {
  clauseType: string;
  instruction: string;
  context?: {
    jobTitle?: string;
    department?: string;
    workLocation?: string;
    employmentType?: string;
    customParameters?: Record<string, unknown>;
  };
}

export interface AiSuggestionsInput {
  role?: string;
  department?: string;
  seniorityLevel?: string;
  workLocation?: string;
  focusAreas?: ('welcome_wording' | 'benefits_recommendation' | 'clauses_recommendation' | 'role_perks')[];
}

export interface OfferPreviewResult {
  offerId: string;
  offerReferenceNumber: string;
  currentStatus: OfferStatus;
  versionNumber: number;
  renderedHtml: string;
  plainText: string;
  styleCss: string;
  placeholders: Record<string, unknown>;
  validation: {
    isReadyForIssuance: boolean;
    missingRequiredFields: string[];
    warnings: string[];
  };
}
