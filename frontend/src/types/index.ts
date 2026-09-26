export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface Company {
  id: string;
  name: string;
  code: string;
  domain?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
  status: UserStatus;
  company: Company;
  roles: string[];
  permissions: string[];
  lastLoginAt?: string;
}

export type OfferStatus =
  | 'DRAFT_AI'
  | 'HR_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ISSUED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface AiExtractedField<T> {
  value: T | null;
  confidenceScore: number; // 0.00 - 1.00
  sourceSnippet?: string;
  validationWarning?: string;
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

export interface HrConfirmedTerms {
  candidateName: string;
  email: string;
  phone: string;
  offeredRole: string;
  department: string;
  workLocation: string;
  employmentType: string;
  proposedJoiningDate: string;
  currency: string;
  baseSalary: number;
  hraAllowance: number;
  specialAllowances: number;
  performanceBonus: number;
  joiningBonus: number;
  totalCtc: number;
}

export interface OfferItem {
  id: string;
  referenceNumber: string;
  candidateName: string;
  email: string;
  role: string;
  department: string;
  totalCtc: number;
  currency: string;
  status: OfferStatus;
  aiConfidence: number;
  createdAt: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}
