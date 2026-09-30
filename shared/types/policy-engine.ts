// =============================================================================
// HR POLICY ENGINE: SHARED TYPE DEFINITIONS
// =============================================================================
// Standalone Policy Management Module supporting 19 core organizational policies,
// structured sections, approval workflows, version histories, and acknowledgments.
// =============================================================================

export type PolicyTypeCode =
  | 'LEAVE_POLICY'
  | 'ATTENDANCE_POLICY'
  | 'WORK_FROM_HOME_POLICY'
  | 'REMOTE_WORK_POLICY'
  | 'HYBRID_WORK_POLICY'
  | 'CODE_OF_CONDUCT'
  | 'ANTI_HARASSMENT_POLICY'
  | 'IT_ACCEPTABLE_USE_POLICY'
  | 'DATA_PRIVACY_POLICY'
  | 'INFORMATION_SECURITY_POLICY'
  | 'EXPENSE_POLICY'
  | 'TRAVEL_POLICY'
  | 'RECRUITMENT_POLICY'
  | 'ONBOARDING_POLICY'
  | 'PERFORMANCE_MANAGEMENT_POLICY'
  | 'PROBATION_POLICY'
  | 'GRIEVANCE_POLICY'
  | 'DISCIPLINARY_POLICY'
  | 'EXIT_OFFBOARDING_POLICY';

export type PolicyCategory =
  | 'WORKPLACE_CONDUCT'
  | 'ATTENDANCE_LEAVE'
  | 'WORK_ARRANGEMENTS'
  | 'IT_DATA_SECURITY'
  | 'FINANCE_TRAVEL'
  | 'TALENT_ACQUISITION'
  | 'EMPLOYEE_RELATIONS'
  | 'PERFORMANCE_CAREER';

export type PolicyStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type PolicyApplicability =
  | 'ALL_EMPLOYEES'
  | 'FULL_TIME_ONLY'
  | 'REMOTE_WORKERS'
  | 'DEPARTMENT_SPECIFIC'
  | 'MANAGEMENT_ONLY'
  | 'CONTRACTORS_VENDORS';

export interface PolicySection {
  id: string;
  sectionNumber: string; // e.g. "1.0", "2.1"
  title: string;
  content: string;
  orderIndex: number;
  isMandatory?: boolean;
}

export interface PolicyApprovalRecord {
  id: string;
  approverUserId: string;
  approverName: string;
  approverTitle: string;
  decision: 'APPROVED' | 'REJECTED' | 'REQUESTED_CHANGES';
  notes?: string;
  approvedAt: string;
}

export interface EmployeeAcknowledgment {
  id: string;
  employeeUserId: string;
  employeeName: string;
  employeeEmail: string;
  department?: string;
  acknowledgedVersionNumber: string; // e.g. "v1.0"
  acknowledgedAt: string;
  ipAddress?: string;
}

export interface PolicyVersionSnapshot {
  versionNumber: string; // e.g. "v1.0", "v2.0"
  effectiveDate: string;
  reviewDate?: string;
  sections: PolicySection[];
  changeSummary: string;
  publishedByUserId?: string;
  publishedAt?: string;
  approvalHistory: PolicyApprovalRecord[];
}

export interface HrPolicy {
  id: string;
  companyId: string;
  policyTypeCode: PolicyTypeCode;
  policyNumber: string; // e.g. "POL-LVE-001"
  title: string;
  description: string;
  department: string;
  policyOwner: string; // e.g. "Director of People & Culture"
  policyOwnerUserId?: string;
  applicability: PolicyApplicability;
  applicabilityScope?: string; // e.g. "All Global Employees across all entities"

  currentStatus: PolicyStatus;
  currentVersionNumber: string; // e.g. "v1.0"

  effectiveDate: string;
  reviewDate: string; // Mandatory scheduled annual or semi-annual review date

  sections: PolicySection[];

  approvalHistory: PolicyApprovalRecord[];
  acknowledgments: EmployeeAcknowledgment[];

  // Version snapshot lineage
  versionHistory: PolicyVersionSnapshot[];

  isArchived: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PolicyTypeDefinition {
  code: PolicyTypeCode;
  name: string;
  category: PolicyCategory;
  description: string;
  defaultApplicability: PolicyApplicability;
  recommendedReviewFrequencyMonths: number;
  standardSections: Array<{
    sectionNumber: string;
    title: string;
    description: string;
    sampleGuidance: string;
    isMandatory: boolean;
  }>;
}

export interface PolicyAiAssistanceRequest {
  policyTypeCode: PolicyTypeCode;
  task: 'DRAFT_POLICY' | 'IMPROVE_SECTION' | 'STRUCTURE_POLICY' | 'IDENTIFY_MISSING_SECTIONS' | 'CHECK_CONSISTENCY' | 'SUGGEST_WORDING';
  currentTitle?: string;
  currentSections?: PolicySection[];
  sectionToImprove?: {
    title: string;
    content: string;
  };
  customInstructions?: string;
}

export interface PolicyAiAssistanceResponse {
  task: string;
  policyTypeCode: PolicyTypeCode;
  title: string;
  content?: string;
  sections?: PolicySection[];
  missingSectionsIdentified?: Array<{
    title: string;
    importance: 'CRITICAL' | 'RECOMMENDED';
    rationale: string;
    suggestedOutline: string;
  }>;
  consistencyIssues?: Array<{
    severity: 'HIGH' | 'MEDIUM' | 'INFO';
    description: string;
    location: string;
    recommendation: string;
  }>;
  wordingSuggestions?: Array<{
    originalText: string;
    suggestedText: string;
    rationale: string;
  }>;
  isAiGenerated: true;
  isAdvisoryOnly: true;
  legalDisclaimer: string;
}
