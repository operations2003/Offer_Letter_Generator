export type CourseCategory = 'COMPLIANCE' | 'TECHNICAL' | 'LEADERSHIP' | 'SECURITY' | 'ONBOARDING' | 'SOFT_SKILLS' | 'PRODUCT';
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CourseCompletionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export interface CourseAssignment {
    id: string;
    title: string;
    description: string;
    passingScorePercent: number;
    submissionCriteria?: string;
}
export interface CourseItem {
    id: string;
    companyId: string;
    title: string;
    category: CourseCategory;
    description: string;
    instructorName: string;
    instructorEmail?: string;
    materialUrl: string;
    duration: string;
    startDate: string;
    endDate: string;
    isMandatory: boolean;
    assignment?: CourseAssignment;
    isCertificateEligible: boolean;
    status: CourseStatus;
    enrolledCount: number;
    completedCount: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface AssignmentSubmission {
    submittedAt: string;
    submissionTextOrUrl: string;
    scorePercent?: number;
    isPassed?: boolean;
    feedback?: string;
    reviewedBy?: string;
}
export interface CourseEnrollment {
    id: string;
    courseId: string;
    courseTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    department: string;
    enrolledAt: string;
    completionStatus: CourseCompletionStatus;
    progressPercent: number;
    completedAt?: string;
    assignmentSubmission?: AssignmentSubmission;
    certificateId?: string;
    certificateRefNumber?: string;
}
export type CertificateTypeCode = 'COURSE_COMPLETION' | 'TRAINING_CERTIFICATE' | 'INTERNSHIP_CERTIFICATE' | 'PARTICIPATION_CERTIFICATE' | 'ACHIEVEMENT_CERTIFICATE' | 'APPRECIATION_CERTIFICATE';
export type CertificateStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ISSUED' | 'REVOKED';
export interface CertificateTemplate {
    id: string;
    certificateTypeCode: CertificateTypeCode;
    title: string;
    description: string;
    headerText: string;
    subHeaderText: string;
    bodyTemplate: string;
    signatoryName: string;
    signatoryTitle: string;
    secondarySignatoryName?: string;
    secondarySignatoryTitle?: string;
    badgeTitle: string;
    styleTheme: 'ROYAL_BLUE' | 'EMERALD_GOLD' | 'CLASSIC_SLATE' | 'CORPORATE_PURPLE';
}
export interface CertificateHistoryEntry {
    timestamp: string;
    action: 'CREATED' | 'SUBMITTED_FOR_REVIEW' | 'APPROVED' | 'ISSUED' | 'REVOKED' | 'REGENERATED';
    performedBy: string;
    notes?: string;
}
export interface IssuedCertificate {
    id: string;
    referenceNumber: string;
    companyId: string;
    certificateTypeCode: CertificateTypeCode;
    templateId: string;
    recipientName: string;
    recipientEmail: string;
    recipientDepartment: string;
    courseId?: string;
    courseTitle: string;
    achievementDescription?: string;
    issueDate: string;
    expiryDate?: string;
    signatoryName: string;
    signatoryTitle: string;
    secondarySignatoryName?: string;
    secondarySignatoryTitle?: string;
    status: CertificateStatus;
    verificationHash: string;
    history: CertificateHistoryEntry[];
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=learning-engine.d.ts.map