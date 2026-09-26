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
  createdAt: string;
}
