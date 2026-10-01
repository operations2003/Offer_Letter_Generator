import { DocumentTypeCode } from './document-engine.js';
export interface HrmsPersonalInfo {
    employeeId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    workEmail: string;
    personalEmail?: string;
    phone?: string;
    address?: string;
    panOrTaxId?: string;
}
export interface HrmsEmploymentInfo {
    designation: string;
    department: string;
    roleLevel?: string;
    reportingManager: string;
    reportingManagerTitle?: string;
    dateOfJoining: string;
    workLocation: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
    status: 'ACTIVE' | 'ON_NOTICE' | 'PROBATION' | 'SEPARATED';
}
export interface HrmsPayrollInfo {
    currency: string;
    annualCtc: number;
    monthlyGross: number;
    baseSalary: number;
    hraAllowance: number;
    specialAllowances: number;
    performanceBonus: number;
    joiningBonus?: number;
    bankName?: string;
    bankAccountNumber?: string;
    ifscOrSwiftCode?: string;
}
export interface HrmsAttendanceLeaveInfo {
    casualLeavesBalance: number;
    sickLeavesBalance: number;
    earnedLeavesBalance: number;
    totalWorkingDaysInPeriod: number;
    daysPresent: number;
    unexcusedAbsenceDays: number;
    lossOfPayDays: number;
    attendanceRatePercent: number;
}
export interface HrmsPerformanceInfo {
    currentRating: string;
    ratingScore: number;
    lastAppraisalDate: string;
    nextReviewDate?: string;
    appraisalPeriod: string;
    recommendedNewDesignation?: string;
    recommendedNewCtc?: number;
    pipStatus?: 'NONE' | 'ACTIVE' | 'COMPLETED_SUCCESS';
    appraisalNotes: string;
}
export interface HrmsExitInfo {
    resignationDate?: string;
    noticePeriodDays: number;
    lastWorkingDay?: string;
    relievingDate?: string;
    reasonForLeaving?: string;
    conductRemarks?: string;
    assetClearanceCompleted: boolean;
    financeNoDuesCompleted: boolean;
    gratuityEligible: boolean;
    gratuityAmount: number;
    leaveEncashmentDays: number;
    leaveEncashmentAmount: number;
    noticeShortfallDeduction: number;
    pendingExpenseReimbursement: number;
    totalSettlementDeductions: number;
    netFinalPayable: number;
}
export interface TaskNeraHrmsProfile {
    personal: HrmsPersonalInfo;
    employment: HrmsEmploymentInfo;
    payroll: HrmsPayrollInfo;
    attendance: HrmsAttendanceLeaveInfo;
    performance: HrmsPerformanceInfo;
    exit: HrmsExitInfo;
    rawSourceJson?: string;
}
/**
 * Authoritative default profile matching the live TaskNera HRMS portal:
 * User: Sakshi Koparde | sakshi@tasknera.com | Employee
 */
export declare const TASKNERA_SAMPLE_PROFILE: TaskNeraHrmsProfile;
/**
 * Intelligent field mapper translating normalized HRMS records into target document fields
 */
export declare function mapHrmsToDocumentForm(profile: TaskNeraHrmsProfile, docType: DocumentTypeCode): Record<string, any>;
//# sourceMappingURL=hrms-bridge.d.ts.map