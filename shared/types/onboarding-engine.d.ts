export type OnboardingStatus = 'INVITED' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_HR_REVIEW' | 'CHANGES_REQUESTED' | 'VERIFIED' | 'READY_FOR_JOINING' | 'COMPLETED' | 'WITHDRAWN';
export type OnboardingSectionKey = 'personal_info' | 'contact_info' | 'education' | 'previous_employment' | 'emergency_contact' | 'bank_details' | 'document_collection' | 'declaration';
export type FieldInputType = 'TEXT' | 'EMAIL' | 'PHONE' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'CHECKBOX' | 'NUMBER' | 'FILE' | 'ARRAY';
export interface ConfigurableFieldDefinition {
    key: string;
    label: string;
    type: FieldInputType;
    required: boolean;
    placeholder?: string;
    options?: string[];
    helpText?: string;
    validationRegex?: string;
    defaultValue?: any;
}
export interface ConfigurableSectionDefinition {
    key: OnboardingSectionKey;
    title: string;
    description: string;
    order: number;
    isEnabled: boolean;
    isRequired: boolean;
    fields: ConfigurableFieldDefinition[];
}
export interface RequiredDocumentDefinition {
    code: string;
    name: string;
    description: string;
    required: boolean;
    acceptedFormats: string[];
    maxSizeMb: number;
}
export interface ChecklistItemTemplate {
    id: string;
    title: string;
    description: string;
    assigneeRole: 'HR' | 'IT' | 'FACILITIES' | 'MANAGER' | 'EMPLOYEE';
    isMandatory: boolean;
    dueDateOffsetDays: number;
}
export interface OnboardingFormConfig {
    id: string;
    companyId: string;
    version: string;
    title: string;
    description: string;
    sections: ConfigurableSectionDefinition[];
    requiredDocuments: RequiredDocumentDefinition[];
    defaultChecklist: ChecklistItemTemplate[];
    updatedAt: string;
    updatedBy: string;
}
export interface EducationRecord {
    degree: string;
    institution: string;
    universityOrBoard: string;
    fieldOfStudy?: string;
    startYear?: string;
    endYear: string;
    gradeOrPercentage: string;
}
export interface EmploymentRecord {
    companyName: string;
    designation: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'INTERN' | 'CONTRACT';
    startDate: string;
    endDate: string;
    reasonForLeaving?: string;
    lastDrawnCtc?: string;
    managerName?: string;
    managerContact?: string;
}
export interface EmergencyContactData {
    primaryName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone?: string;
    address?: string;
}
export interface BankDetailsData {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscOrRoutingCode: string;
    branchName: string;
    accountType: 'SAVINGS' | 'CURRENT' | 'CHECKING';
    panNumber?: string;
}
export interface CollectedDocument {
    id: string;
    documentCode: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    rejectionReason?: string;
    fileUrl?: string;
}
export interface DeclarationData {
    hasConsentedBgv: boolean;
    hasConfirmedAccuracy: boolean;
    agreedToPolicies: boolean;
    electronicSignature: string;
    signatureDate: string;
    ipAddress?: string;
}
export interface JoiningChecklistItemInstance {
    id: string;
    templateId?: string;
    title: string;
    description: string;
    assigneeRole: 'HR' | 'IT' | 'FACILITIES' | 'MANAGER' | 'EMPLOYEE';
    isMandatory: boolean;
    dueDate: string;
    isCompleted: boolean;
    completedAt?: string;
    completedBy?: string;
    notes?: string;
}
export interface CandidateOnboardingData {
    personalInfo: Record<string, any>;
    contactInfo: Record<string, any>;
    education: EducationRecord[];
    previousEmployment: EmploymentRecord[];
    emergencyContact: EmergencyContactData;
    bankDetails: BankDetailsData;
    documents: CollectedDocument[];
    declaration: DeclarationData;
}
export interface OnboardingCandidateRecord {
    id: string;
    companyId: string;
    offerId?: string;
    candidateName: string;
    email: string;
    phone: string;
    designation: string;
    department: string;
    joiningDate: string;
    status: OnboardingStatus;
    progressPercent: number;
    formConfigVersion: string;
    submittedData: Partial<CandidateOnboardingData>;
    checklist: JoiningChecklistItemInstance[];
    hrNotes?: string;
    changesRequestedNotes?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}
//# sourceMappingURL=onboarding-engine.d.ts.map