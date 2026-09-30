// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: MULTI-DOCUMENT QUALITY AUDIT SERVICE
// =============================================================================
// Comprehensive quality audit verifying:
// - Missing fields (required vs optional)
// - Contradictions
// - Date inconsistencies
// - Salary inconsistencies & arithmetic parity
// - Missing sections & signatory authority
// - Unreplaced placeholders ({{tokens}}, TODOs, TBDs)
// - Formatting/content issues & unlawful compliance claims
//
// GUARANTEE: Does NOT silently modify HR-confirmed data under any circumstances.
// Returns: PASS | WARNING | REVIEW_REQUIRED
// =============================================================================

import { DocumentTypeCode, DocumentTypeDefinition } from '../../../../../shared/types/document-engine.js';
import { DOCUMENT_TYPE_REGISTRY } from './document-type.registry.js';

export type DocumentQualityStatus = 'PASS' | 'WARNING' | 'REVIEW_REQUIRED';

export type DocumentQualityCategory =
  | 'MISSING_FIELDS'
  | 'CONTRADICTIONS'
  | 'DATE_INCONSISTENCIES'
  | 'SALARY_INCONSISTENCIES'
  | 'MISSING_SECTIONS'
  | 'UNREPLACED_PLACEHOLDERS'
  | 'FORMATTING_CONTENT_ISSUES';

export interface DocumentQualityIssue {
  id: string;
  category: DocumentQualityCategory;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  fieldKey?: string;
  detectedValue?: unknown;
  expectedCondition?: string;
  recommendation: string;
}

export interface DocumentQualityReport {
  documentTypeCode: DocumentTypeCode;
  documentTypeName: string;
  status: DocumentQualityStatus;
  canProceed: boolean;
  overallScore: number; // 0 - 100
  summary: string;
  issues: DocumentQualityIssue[];
  metrics: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    passedChecksCount: number;
  };
  passedChecks: string[];
  disclaimer: string;
  checkedAt: string;
}

export class DocumentQualityService {
  /**
   * Executes a comprehensive 7-category quality audit for ANY of the 9 core HR document types.
   * GUARANTEE: Input `data` is treated as immutable and is never altered.
   */
  static auditDocument(
    documentTypeCode: DocumentTypeCode,
    data: Record<string, unknown>
  ): DocumentQualityReport {
    const typeDef = DOCUMENT_TYPE_REGISTRY[documentTypeCode];
    if (!typeDef) {
      throw new Error(`Unregistered document type: ${documentTypeCode}`);
    }

    const issues: DocumentQualityIssue[] = [];
    const passedChecks: string[] = [];

    // -------------------------------------------------------------------------
    // 1. MISSING FIELDS CHECK
    // -------------------------------------------------------------------------
    for (const reqField of typeDef.requiredFields || []) {
      const val = data[reqField.key];
      if (val === undefined || val === null || val === '') {
        issues.push({
          id: `MISSING_REQ_${reqField.key.toUpperCase()}`,
          category: 'MISSING_FIELDS',
          severity: 'CRITICAL',
          title: `Mandatory Field Omitted: ${reqField.label}`,
          description: `Required parameter "${reqField.label}" (${reqField.key}) has not been populated.`,
          fieldKey: reqField.key,
          expectedCondition: 'Must be explicitly provided and confirmed by HR',
          recommendation: `Provide the confirmed ${reqField.label}. Under the Non-Assumption Rule, AI cannot fabricate this value.`,
        });
      } else {
        passedChecks.push(`Required field present: ${reqField.label}`);
      }
    }

    for (const optField of typeDef.optionalFields || []) {
      const val = data[optField.key];
      if (val === undefined || val === null || val === '') {
        // Log as informational
        issues.push({
          id: `OPT_UNFILLED_${optField.key.toUpperCase()}`,
          category: 'MISSING_FIELDS',
          severity: 'INFO',
          title: `Optional Field Unfilled: ${optField.label}`,
          description: `Optional parameter "${optField.label}" is currently blank. Default provisions will apply if omitted.`,
          fieldKey: optField.key,
          recommendation: `Verify if ${optField.label} is applicable for this recipient.`,
        });
      }
    }

    // -------------------------------------------------------------------------
    // 2. CONTRADICTIONS CHECK
    // -------------------------------------------------------------------------
    // 2a. Employment Type vs Working Hours Contradiction (Offer Letter / Contract)
    const empType = String(data.employmentType || '').toUpperCase();
    const hours = String(data.workingHoursSummary || '').toLowerCase();
    if (empType === 'PART_TIME' && (hours.includes('40 hours') || hours.includes('full-time') || hours.includes('full time'))) {
      issues.push({
        id: 'CONTRA_PART_TIME_HOURS',
        category: 'CONTRADICTIONS',
        severity: 'CRITICAL',
        title: 'Employment Type & Working Hours Contradiction',
        description: 'Document indicates Part-Time status but working hours schedule specifies full-time 40 hours per week.',
        fieldKey: 'workingHoursSummary',
        detectedValue: hours,
        expectedCondition: 'Part-time schedule must not prescribe full-time 40-hour commitment',
        recommendation: 'Align working hours with agreed part-time allotment (e.g. 20 hours/week).',
      });
    } else {
      passedChecks.push('Employment classification and hours consistency');
    }

    // 2b. Separation Notice vs Severance / Handover Contradiction (Termination Letter)
    const noticeTerms = String(data.noticeServedOrPaid || '').toUpperCase();
    const severance = Number(data.severanceAmount || 0);
    const noticeDays = String(data.noticePeriod || data.terminationNoticeDate || '');
    if (noticeTerms === 'IMMEDIATE_TERMINATION' && noticeDays.toLowerCase().includes('30 days notice served')) {
      issues.push({
        id: 'CONTRA_TERMINATION_NOTICE',
        category: 'CONTRADICTIONS',
        severity: 'CRITICAL',
        title: 'Separation Category & Notice Contradiction',
        description: 'Designated as Immediate Termination but narrative specifies 30 days notice served.',
        fieldKey: 'noticeServedOrPaid',
        recommendation: 'Select Notice Served or adjust separation clause to reflect payment in lieu of notice.',
      });
    }

    // 2c. Independent Contractor vs Employee Wording (Contract Letter / MSA)
    if (documentTypeCode === 'CONTRACT_LETTER' || documentTypeCode === 'MSA') {
      const scope = String(data.serviceScopeSummary || data.masterScopeDescription || '').toLowerCase();
      if (scope.includes('employee benefits') || scope.includes('w-2') || scope.includes('annual paid leave')) {
        issues.push({
          id: 'CONTRA_CONTRACTOR_EMPLOYEE_STATUS',
          category: 'CONTRADICTIONS',
          severity: 'CRITICAL',
          title: 'Commercial Contractor vs Employee Benefits Conflict',
          description: 'Independent commercial agreement includes employment perquisite references (benefits/leave), creating misclassification risk.',
          fieldKey: documentTypeCode === 'MSA' ? 'masterScopeDescription' : 'serviceScopeSummary',
          recommendation: 'Remove statutory employment perquisites from commercial service agreement.',
        });
      } else {
        passedChecks.push('Independent contractor commercial status alignment');
      }
    }

    // -------------------------------------------------------------------------
    // 3. DATE INCONSISTENCIES CHECK
    // -------------------------------------------------------------------------
    // 3a. Start Date vs End Date (Internship, Contract, SOW)
    const startDate = data.startDate ? new Date(String(data.startDate)) : null;
    const endDate = data.endDate ? new Date(String(data.endDate)) : null;
    if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (endDate <= startDate) {
        issues.push({
          id: 'DATE_END_BEFORE_START',
          category: 'DATE_INCONSISTENCIES',
          severity: 'CRITICAL',
          title: 'Chronological Inversion: End Date Precedes Start Date',
          description: `Scheduled completion date (${data.endDate}) occurs before or on commencement date (${data.startDate}).`,
          fieldKey: 'endDate',
          detectedValue: data.endDate,
          expectedCondition: 'End date must strictly succeed start date',
          recommendation: 'Correct end date to a subsequent calendar date.',
        });
      } else {
        passedChecks.push('Commencement and completion chronological sequence');
      }
    }

    // 3b. Joining Date vs Last Working Date (Experience Letter, Relieving Letter, FNF)
    const joiningDate = data.dateOfJoining ? new Date(String(data.dateOfJoining)) : null;
    const rawExit = data.lastWorkingDay || data.lastWorkingDate || data.dateOfRelieving || data.relievingDate;
    const exitDate = rawExit ? new Date(String(rawExit)) : null;
    if (joiningDate && exitDate && !isNaN(joiningDate.getTime()) && !isNaN(exitDate.getTime())) {
      if (exitDate < joiningDate) {
        issues.push({
          id: 'DATE_EXIT_BEFORE_JOINING',
          category: 'DATE_INCONSISTENCIES',
          severity: 'CRITICAL',
          title: 'Chronological Inversion: Last Working Date Precedes Joining Date',
          description: `Last working date (${rawExit}) is prior to recorded date of joining (${data.dateOfJoining}).`,
          fieldKey: data.lastWorkingDay ? 'lastWorkingDay' : 'lastWorkingDate',
          detectedValue: rawExit,
          expectedCondition: 'Last working date must follow date of joining',
          recommendation: 'Verify official personnel history dates.',
        });
      } else {
        passedChecks.push('Tenure chronology (Joining to Separation)');
      }
    }

    // 3c. Proposed Joining Date on Weekend (Offer Letter Quality Check)
    if (data.proposedJoiningDate) {
      const pjd = new Date(String(data.proposedJoiningDate));
      if (!isNaN(pjd.getTime())) {
        const dayOfWeek = pjd.getUTCDay(); // 0 = Sun, 6 = Sat
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          issues.push({
            id: 'DATE_WEEKEND_JOINING',
            category: 'DATE_INCONSISTENCIES',
            severity: 'WARNING',
            title: 'Commencement Scheduled on Weekend',
            description: `Proposed start date (${data.proposedJoiningDate}) falls on a ${dayOfWeek === 0 ? 'Sunday' : 'Saturday'}.`,
            fieldKey: 'proposedJoiningDate',
            recommendation: 'Standard practice is to schedule joining on Monday or first business day of the week.',
          });
        } else {
          passedChecks.push('Business day commencement schedule');
        }
      }
    }

    // -------------------------------------------------------------------------
    // 4. SALARY & ARITHMETIC INCONSISTENCIES CHECK
    // -------------------------------------------------------------------------
    // 4a. Base Salary Positive & Non-Zero
    if (data.baseSalary !== undefined && data.baseSalary !== null && data.baseSalary !== '') {
      const base = Number(data.baseSalary);
      if (isNaN(base) || base <= 0) {
        issues.push({
          id: 'SALARY_NON_POSITIVE_BASE',
          category: 'SALARY_INCONSISTENCIES',
          severity: 'CRITICAL',
          title: 'Non-Positive Base Salary',
          description: `Base salary value (${data.baseSalary}) is zero, negative, or invalid.`,
          fieldKey: 'baseSalary',
          detectedValue: data.baseSalary,
          expectedCondition: 'Base salary must be a positive monetary figure',
          recommendation: 'Enter approved annualized base compensation.',
        });
      } else {
        passedChecks.push('Base salary numerical validity');
      }
    }

    // 4b. Total CTC vs Base Salary Parity
    if (data.totalCtc !== undefined && data.baseSalary !== undefined) {
      const ctc = Number(data.totalCtc);
      const base = Number(data.baseSalary);
      if (!isNaN(ctc) && !isNaN(base) && ctc < base) {
        issues.push({
          id: 'SALARY_CTC_LESS_THAN_BASE',
          category: 'SALARY_INCONSISTENCIES',
          severity: 'CRITICAL',
          title: 'Total CTC Below Base Salary',
          description: `Total annualized Cost-to-Company (${ctc}) cannot be less than fixed base salary (${base}).`,
          fieldKey: 'totalCtc',
          detectedValue: ctc,
          expectedCondition: 'Total CTC >= Base Salary',
          recommendation: 'Reconcile Total CTC to encompass fixed base pay plus allowances.',
        });
      } else {
        passedChecks.push('CTC-to-Base package arithmetic alignment');
      }
    }

    // 4c. Increment Letter: Revised > Previous
    if (documentTypeCode === 'INCREMENT_LETTER') {
      const prev = Number(data.previousBaseSalary || 0);
      const rev = Number(data.revisedBaseSalary || 0);
      if (rev <= prev) {
        issues.push({
          id: 'SALARY_INCREMENT_REVISED_NOT_HIGHER',
          category: 'SALARY_INCONSISTENCIES',
          severity: 'CRITICAL',
          title: 'Revised Salary Not Greater Than Previous Salary',
          description: `Revised base salary (${rev}) must exceed previous base salary (${prev}) for an increment.`,
          fieldKey: 'revisedBaseSalary',
          detectedValue: rev,
          expectedCondition: 'Revised Base > Previous Base',
          recommendation: 'Confirm revised salary grade with Compensation Committee.',
        });
      } else {
        passedChecks.push('Merit revision compensation advancement');
      }

      // Percentage parity
      if (data.incrementPercentage !== undefined && prev > 0) {
        const expectedPct = ((rev - prev) / prev) * 100;
        const statedPct = Number(data.incrementPercentage);
        if (Math.abs(expectedPct - statedPct) > 0.5) {
          issues.push({
            id: 'SALARY_INCREMENT_PCT_MISMATCH',
            category: 'SALARY_INCONSISTENCIES',
            severity: 'WARNING',
            title: 'Increment Percentage Arithmetic Variance',
            description: `Stated increment (${statedPct}%) differs from computed increase (${expectedPct.toFixed(2)}%).`,
            fieldKey: 'incrementPercentage',
            detectedValue: statedPct,
            expectedCondition: `Expected approximately ${expectedPct.toFixed(2)}%`,
            recommendation: 'Synchronize stated increment percentage with computed delta.',
          });
        }
      }
    }

    // 4d. Full & Final Settlement (FNF) Arithmetic Parity
    if (documentTypeCode === 'FNF_SETTLEMENT') {
      const earnings = Number(data.payableEarningsTotal || 0);
      const deductions = Number(data.deductionsTotal || 0);
      const net = Number(data.netPayableAmount || 0);
      const expectedNet = earnings - deductions;
      const discrepancy = Math.abs(net - expectedNet);

      if (discrepancy > 0.01) {
        issues.push({
          id: 'SALARY_FNF_MATH_PARITY_VIOLATION',
          category: 'SALARY_INCONSISTENCIES',
          severity: 'CRITICAL',
          title: 'Full & Final Balance Sheet Mismatch',
          description: `Stated Net Payable (${net}) does not balance with Gross Earnings (${earnings}) minus Total Deductions (${deductions}). Discrepancy is ${discrepancy}.`,
          fieldKey: 'netPayableAmount',
          detectedValue: net,
          expectedCondition: `Net Payable must equal Earnings (${earnings}) - Deductions (${deductions}) = ${expectedNet}`,
          recommendation: 'Recalculate Net Payable Amount to restore mathematical parity.',
        });
      } else {
        passedChecks.push('Full & Final Settlement balance sheet parity');
      }

      if (net < 0) {
        issues.push({
          id: 'SALARY_FNF_NEGATIVE_NET',
          category: 'SALARY_INCONSISTENCIES',
          severity: 'WARNING',
          title: 'Negative Net Payable (Employee Recovery Due)',
          description: `Deductions exceed earnings by ${Math.abs(net)}, resulting in an outstanding recovery from employee.`,
          fieldKey: 'netPayableAmount',
          recommendation: 'Ensure employee clearance protocol accounts for recovery disbursement.',
        });
      }
    }

    // -------------------------------------------------------------------------
    // 5. MISSING SECTIONS & AUTHORIZATION
    // -------------------------------------------------------------------------
    // 5a. Signatory Authorization
    const signatoryName = String(data.signatoryName || '').trim();
    const signatoryTitle = String(data.signatoryTitle || '').trim();
    if (!signatoryName || !signatoryTitle) {
      issues.push({
        id: 'SECTION_SIGNATORY_MISSING',
        category: 'MISSING_SECTIONS',
        severity: 'CRITICAL',
        title: 'Signatory Authority Incomplete',
        description: 'Document lacks complete authorized signatory credentials (name and official designation).',
        fieldKey: !signatoryName ? 'signatoryName' : 'signatoryTitle',
        expectedCondition: 'Legal document must bear explicit issuing authority',
        recommendation: 'Specify the authorized HR/executive officer signing this document.',
      });
    } else {
      passedChecks.push('Issuing signatory authority credentials');
    }

    // 5b. Commercial Scope Sections for MSA / Contract
    if (documentTypeCode === 'MSA' && !data.masterScopeDescription) {
      issues.push({
        id: 'SECTION_MSA_SCOPE_MISSING',
        category: 'MISSING_SECTIONS',
        severity: 'CRITICAL',
        title: 'Master Scope of Services Omitted',
        description: 'Master Services Agreement requires overarching scope of deliverables description.',
        fieldKey: 'masterScopeDescription',
        recommendation: 'Provide concise summary of professional services governed under this MSA.',
      });
    }

    // -------------------------------------------------------------------------
    // 6. UNREPLACED PLACEHOLDERS CHECK
    // -------------------------------------------------------------------------
    // Scans all string values in data for lingering tokens like {{...}}, [INSERT_...], TODO, TBD
    const placeholderRegex = /\{\{[a-zA-Z0-9_]+\}\}|\[INSERT_[A-Z0-9_]+\]|\b(TODO|TBD|PLACEHOLDER)\b/i;
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string') {
        const match = val.match(placeholderRegex);
        if (match) {
          const isReq = (typeDef.requiredFields || []).some((f) => f.key === key);
          issues.push({
            id: `PLACEHOLDER_UNREPLACED_${key.toUpperCase()}`,
            category: 'UNREPLACED_PLACEHOLDERS',
            severity: isReq ? 'CRITICAL' : 'WARNING',
            title: `Unreplaced Template Token in "${key}"`,
            description: `Lingering placeholder or draft token "${match[0]}" detected in ${key}.`,
            fieldKey: key,
            detectedValue: match[0],
            expectedCondition: 'All template tokens must be replaced with final confirmed terms',
            recommendation: `Replace "${match[0]}" with the actual confirmed information before compilation.`,
          });
        }
      }
    }

    if (!issues.some((i) => i.category === 'UNREPLACED_PLACEHOLDERS')) {
      passedChecks.push('Template placeholder substitution complete');
    }

    // -------------------------------------------------------------------------
    // 7. FORMATTING & CONTENT ISSUES (INCLUDING LEGAL DISCLAIMER AUDIT)
    // -------------------------------------------------------------------------
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string' && val.length > 20) {
        // 7a. All-Caps check
        if (val === val.toUpperCase() && /[A-Z]/.test(val) && !key.toLowerCase().includes('id') && !key.toLowerCase().includes('code')) {
          issues.push({
            id: `FORMAT_ALL_CAPS_${key.toUpperCase()}`,
            category: 'FORMATTING_CONTENT_ISSUES',
            severity: 'WARNING',
            title: `Excessive Capitalization in "${key}"`,
            description: 'Entire text block is formatted in ALL CAPS, which violates professional executive document standards.',
            fieldKey: key,
            recommendation: 'Convert to standard sentence/title case.',
          });
        }

        // 7b. Truncated sentence check (ends with comma or incomplete conjunction)
        const trimmed = val.trim();
        if (trimmed.endsWith(',') || trimmed.endsWith(' and') || trimmed.endsWith(' with') || trimmed.endsWith(' of')) {
          issues.push({
            id: `FORMAT_TRUNCATED_${key.toUpperCase()}`,
            category: 'FORMATTING_CONTENT_ISSUES',
            severity: 'WARNING',
            title: `Incomplete / Truncated Sentence in "${key}"`,
            description: `Field ends abruptly with "${trimmed.slice(-6)}". Content appears incomplete.`,
            fieldKey: key,
            recommendation: 'Complete the sentence or remove trailing conjunction.',
          });
        }

        // 7c. Prohibited Unlawful / Absolute Legal Claims
        // AI or templates must NEVER claim 100% legal immunity or statutory waiver
        const lower = val.toLowerCase();
        if (
          lower.includes('100% legally compliant') ||
          lower.includes('guaranteed legal immunity') ||
          lower.includes('waives all statutory labor rights')
        ) {
          issues.push({
            id: `LEGAL_PROHIBITED_CLAIM_${key.toUpperCase()}`,
            category: 'FORMATTING_CONTENT_ISSUES',
            severity: 'CRITICAL',
            title: 'Unenforceable Legal Warranty Claim',
            description: 'Clause purports to guarantee legal compliance or forfeit non-waivable statutory rights.',
            fieldKey: key,
            recommendation: 'Remove absolute legal guarantee claims. Document terms are subject to local labor laws.',
          });
        }
      }
    }

    if (!issues.some((i) => i.category === 'FORMATTING_CONTENT_ISSUES')) {
      passedChecks.push('Formatting standards and legal tone compliance');
    }

    // -------------------------------------------------------------------------
    // OVERALL STATUS DETERMINATION
    // -------------------------------------------------------------------------
    const criticalCount = issues.filter((i) => i.severity === 'CRITICAL').length;
    const warningCount = issues.filter((i) => i.severity === 'WARNING').length;
    const infoCount = issues.filter((i) => i.severity === 'INFO').length;

    let status: DocumentQualityStatus = 'PASS';
    let canProceed = true;
    let summary = 'All legal, mathematical, and formatting quality checks passed.';

    if (criticalCount > 0) {
      status = 'REVIEW_REQUIRED';
      canProceed = false;
      summary = `Quality audit identified ${criticalCount} blocking issue(s) that require HR intervention before generation.`;
    } else if (warningCount > 0) {
      status = 'WARNING';
      canProceed = true;
      summary = `Document is viable for generation, but ${warningCount} advisory warning(s) should be reviewed.`;
    }

    // Calculate quality score (starts at 100, drops per issue)
    const overallScore = Math.max(
      15,
      Math.min(100, 100 - criticalCount * 25 - warningCount * 8)
    );

    return {
      documentTypeCode,
      documentTypeName: typeDef.name,
      status,
      canProceed,
      overallScore,
      summary,
      issues,
      metrics: {
        criticalCount,
        warningCount,
        infoCount,
        passedChecksCount: passedChecks.length,
      },
      passedChecks,
      disclaimer:
        'AI Quality Audits provide advisory risk identification only and do not constitute formal legal counsel. All terms remain subject to managerial authorization.',
      checkedAt: new Date().toISOString(),
    };
  }
}
