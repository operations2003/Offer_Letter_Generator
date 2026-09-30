// =============================================================================
// HRMS INTEGRATION BRIDGE: TYPES, SCHEMAS & DATA NORMALIZER
// =============================================================================
// Standardized HRMS ingestion contract compatible with:
// - TaskNera HRMS Portal (tasknera.com)
// - Workday, BambooHR, Darwinbox, Zoho People, and custom webhook payloads
// =============================================================================

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
export const TASKNERA_SAMPLE_PROFILE: TaskNeraHrmsProfile = {
  personal: {
    employeeId: 'TN-ENG-1048',
    fullName: 'Sakshi Koparde',
    firstName: 'Sakshi',
    lastName: 'Koparde',
    workEmail: 'sakshi@tasknera.com',
    personalEmail: 'sakshi.koparde@example.com',
    phone: '+91 98765 43210',
    address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
    panOrTaxId: 'ABCDE1234F',
  },
  employment: {
    designation: 'Senior Full Stack & AI Solutions Architect',
    department: 'Applied AI & Core Engineering',
    roleLevel: 'L5 - Staff Specialist',
    reportingManager: 'Marcus Vance, VP of Global Engineering',
    reportingManagerTitle: 'Vice President of Global Engineering',
    dateOfJoining: '2023-04-15',
    workLocation: 'Mumbai Innovation Hub (Hybrid / Remote)',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
  },
  payroll: {
    currency: 'INR',
    annualCtc: 3200000,
    monthlyGross: 266667,
    baseSalary: 1600000,
    hraAllowance: 800000,
    specialAllowances: 480000,
    performanceBonus: 320000,
    joiningBonus: 150000,
    bankName: 'HDFC Bank Ltd',
    bankAccountNumber: '50100294827104',
    ifscOrSwiftCode: 'HDFC0000128',
  },
  attendance: {
    casualLeavesBalance: 6,
    sickLeavesBalance: 8,
    earnedLeavesBalance: 16,
    totalWorkingDaysInPeriod: 240,
    daysPresent: 236,
    unexcusedAbsenceDays: 0,
    lossOfPayDays: 0,
    attendanceRatePercent: 98.3,
  },
  performance: {
    currentRating: 'Outstanding Performer (4.9 / 5.0)',
    ratingScore: 4.9,
    lastAppraisalDate: '2026-03-31',
    nextReviewDate: '2026-09-30',
    appraisalPeriod: 'FY 2025-2026 Annual Cycle',
    recommendedNewDesignation: 'Lead AI & Platform Architect',
    recommendedNewCtc: 3900000,
    pipStatus: 'NONE',
    appraisalNotes:
      'Spearheaded enterprise AI document orchestration, automated quality verification pipelines, and cross-module HRMS data consolidation with zero production downtime.',
  },
  exit: {
    resignationDate: '2026-08-31',
    noticePeriodDays: 30,
    lastWorkingDay: '2026-09-30',
    relievingDate: '2026-09-30',
    reasonForLeaving: 'Pursuing Advanced Leadership & Global Architectural Responsibilities',
    conductRemarks: 'Exemplary character, exceptional technical integrity, and diligent handover of all critical systems.',
    assetClearanceCompleted: true,
    financeNoDuesCompleted: true,
    gratuityEligible: true,
    gratuityAmount: 184615,
    leaveEncashmentDays: 16,
    leaveEncashmentAmount: 98462,
    noticeShortfallDeduction: 0,
    pendingExpenseReimbursement: 12500,
    totalSettlementDeductions: 18000,
    netFinalPayable: 277577,
  },
};

/**
 * Intelligent field mapper translating normalized HRMS records into target document fields
 */
export function mapHrmsToDocumentForm(
  profile: TaskNeraHrmsProfile,
  docType: DocumentTypeCode
): Record<string, any> {
  const p = profile.personal;
  const e = profile.employment;
  const pay = profile.payroll;
  const perf = profile.performance;
  const ex = profile.exit;

  switch (docType) {
    case 'OFFER_LETTER':
      return {
        candidateName: p.fullName,
        email: p.personalEmail || p.workEmail,
        phone: p.phone || '',
        designation: e.designation,
        department: e.department,
        joiningDate: e.dateOfJoining,
        location: e.workLocation,
        employmentType: e.employmentType === 'FULL_TIME' ? 'Full-time' : 'Contract',
        reportingManager: e.reportingManager,
        currency: pay.currency,
        baseSalary: pay.baseSalary,
        hraAllowance: pay.hraAllowance,
        specialAllowances: pay.specialAllowances,
        performanceBonus: pay.performanceBonus,
        joiningBonus: pay.joiningBonus || 0,
        totalCtc: pay.annualCtc,
        probationPeriodMonths: 3,
        noticePeriodDays: 60,
      };

    case 'INTERNSHIP_LETTER':
      return {
        candidateName: p.fullName,
        email: p.personalEmail || p.workEmail,
        phone: p.phone || '',
        internshipRole: e.designation,
        department: e.department,
        startDate: e.dateOfJoining,
        endDate: '2026-10-15',
        durationMonths: 6,
        stipendAmount: 50000,
        currency: pay.currency,
        mentorName: e.reportingManager,
        location: e.workLocation,
        workingArrangement: 'Hybrid',
      };

    case 'INCREMENT_LETTER':
      return {
        employeeName: p.fullName,
        employeeId: p.employeeId,
        currentDesignation: e.designation,
        newDesignation: perf.recommendedNewDesignation || e.designation,
        department: e.department,
        effectiveDate: '2026-10-01',
        appraisalPeriod: perf.appraisalPeriod,
        performanceRating: perf.currentRating,
        currentCtc: pay.annualCtc,
        newCtc: perf.recommendedNewCtc || Math.round(pay.annualCtc * 1.2),
        currency: pay.currency,
        incrementPercentage: perf.recommendedNewCtc
          ? Math.round(((perf.recommendedNewCtc - pay.annualCtc) / pay.annualCtc) * 100)
          : 20,
      };

    case 'EXPERIENCE_LETTER':
      return {
        employeeName: p.fullName,
        employeeId: p.employeeId,
        designation: e.designation,
        department: e.department,
        dateOfJoining: e.dateOfJoining,
        relievingDate: ex.lastWorkingDay || '2026-09-30',
        conductRemarks: ex.conductRemarks || 'Exemplary service and professional conduct.',
        summaryOfResponsibilities: `Architected scalable cloud software modules, mentored engineering staff, and orchestrated multi-service data integrations.`,
      };

    case 'RELIEVING_LETTER':
      return {
        employeeName: p.fullName,
        employeeId: p.employeeId,
        designation: e.designation,
        department: e.department,
        resignationDate: ex.resignationDate || '2026-08-31',
        lastWorkingDay: ex.lastWorkingDay || '2026-09-30',
        noticePeriodServed: true,
        clearanceStatus: 'COMPLETED',
        clearanceRequirementsSummary: 'All laptop assets, access credentials, and financial liabilities cleared.',
      };

    case 'FNF_SETTLEMENT': {
      const payableSalary = Math.round(pay.monthlyGross);
      const encashment = ex.leaveEncashmentAmount;
      const gratuity = ex.gratuityAmount;
      const otherEarnings = ex.pendingExpenseReimbursement;
      const totalEarnings = payableSalary + encashment + gratuity + otherEarnings;
      const totalDeductions = ex.totalSettlementDeductions;
      const netPayable = totalEarnings - totalDeductions;

      return {
        employeeName: p.fullName,
        employeeId: p.employeeId,
        designation: e.designation,
        department: e.department,
        dateOfJoining: e.dateOfJoining,
        lastWorkingDay: ex.lastWorkingDay || '2026-09-30',
        currency: pay.currency,
        payableSalaryDays: 30,
        payableSalaryAmount: payableSalary,
        earnedLeaveEncashmentDays: ex.leaveEncashmentDays,
        earnedLeaveEncashmentAmount: encashment,
        gratuityAmount: gratuity,
        bonusOrIncentivePayable: 0,
        otherEarningsAmount: otherEarnings,
        totalEarningsAmount: totalEarnings,
        noticeShortfallDeductionAmount: ex.noticeShortfallDeduction,
        taxDeductionsAmount: 15000,
        assetDeductionsAmount: 0,
        otherDeductionsAmount: 3000,
        totalDeductionsAmount: totalDeductions,
        netPayableAmount: netPayable,
        settlementRemarks: 'Full and final settlement computed and verified against TaskNera HRMS payroll ledgers.',
      };
    }

    case 'TERMINATION_LETTER':
      return {
        employeeName: p.fullName,
        employeeId: p.employeeId,
        designation: e.designation,
        department: e.department,
        terminationDate: ex.lastWorkingDay || '2026-09-30',
        terminationType: 'MUTUAL_SEPARATION',
        severanceMonths: 2,
        severanceAmount: Math.round(pay.monthlyGross * 2),
        currency: pay.currency,
        benefitsContinuationUntil: '2026-12-31',
        assetReturnDeadline: '2026-10-05',
      };

    case 'CONTRACT_LETTER':
      return {
        contractorName: p.fullName,
        serviceScopeSummary: `Provision of Senior Architecture Consultation and Engineering Systems Integration.`,
        contractStartDate: '2026-10-01',
        contractEndDate: '2027-09-30',
        serviceFeeAmount: Math.round(pay.annualCtc / 12),
        paymentFrequency: 'MONTHLY',
        currency: pay.currency,
        deliverablesSummary: 'Quarterly architecture blueprints, AI workflow integration, and code audits.',
        noticePeriodDays: 30,
      };

    case 'MSA':
      return {
        clientLegalName: 'TaskNera Enterprise Systems Ltd',
        clientAuthorizedSignatory: p.fullName,
        clientSignatoryTitle: e.designation,
        governingLawJurisdiction: 'Delaware, USA / Maharashtra, India',
        paymentTermDays: 30,
        liabilityCapMultiple: 2,
        effectiveDate: '2026-10-01',
        serviceDescriptionSummary: 'Enterprise HR Document Generation & Intelligent Automation Consulting',
      };

    default:
      return {
        name: p.fullName,
        email: p.workEmail,
        department: e.department,
        designation: e.designation,
      };
  }
}
