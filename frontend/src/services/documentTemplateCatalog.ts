// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: TEMPLATE CATALOG & PRE-CONFIGURED SAMPLE DATA
// =============================================================================
// Production templates and realistic sample presets for all 9 core document types.
// Supports dynamic placeholder interpolation and 1-click test populating.
// =============================================================================

import { DocumentTypeCode } from '../types/document-engine.js';

export interface DocumentTemplateItem {
  id: string;
  documentTypeCode: DocumentTypeCode;
  name: string;
  description: string;
  version: string;
  category: string;
  content: string;
  isDefault?: boolean;
  sampleInputText: string;
  sampleHrData: Record<string, any>;
  sampleAiExtractions: Record<string, {
    value: any;
    confidence: number;
    sourceQuote?: string;
  }>;
}

export const DOCUMENT_TEMPLATES_CATALOG: Partial<Record<DocumentTypeCode, DocumentTemplateItem[]>> = {
  // 1. OFFER LETTER
  OFFER_LETTER: [
    {
      id: 'tmpl_offer_standard',
      documentTypeCode: 'OFFER_LETTER',
      name: 'Standard Corporate Employment Offer',
      description: 'Formal employment offer covering compensation, reporting structure, joining date, and policies.',
      version: 'v2.1',
      category: 'EMPLOYMENT',
      isDefault: true,
      content: `Dear {{candidate_name}},

On behalf of our leadership team, we are delighted to offer you the position of {{designation}} in the {{department}} department at our {{location}} office.

Your employment will officially commence on {{joining_date}}. You will be reporting directly to {{reporting_manager}}.

COMPENSATION DETAILS:
- Annual Fixed Base Salary: {{salary}}
- Total Annual Cost-to-Company (CTC): {{total_ctc}}

TERMS OF EMPLOYMENT:
This offer is contingent upon satisfactory completion of background verification. You will be subject to a probation period of {{probation_period}} and a mutual notice period of {{notice_period}}. Your standard working hours will be {{working_hours}}.

Please confirm your acceptance of this offer on or before {{offer_valid_until}} by signing and returning this letter.

Sincerely,
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `CANDIDATE DOSSIER: Jane Alexandra Doe | jane.doe@example.com | +1 (555) 234-5678
742 Evergreen Terrace, Springfield, OR
Applying for: Lead Platform Architect | Cloud Infrastructure Department | San Francisco, CA (Hybrid)
Target Joining: November 16, 2026 | Manager: Marcus Vance (VP of Engineering)
Agreed Terms: Base Salary $165,000 USD | Total CTC $234,750 USD | 90-day probation | 30-day notice
Signatory: Sarah Jenkins (VP of Global Talent) | Offer Validity: October 15, 2026`,
      sampleHrData: {
        candidateName: 'Jane Alexandra Doe',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Terrace, Springfield, OR',
        jobTitle: 'Lead Platform Architect',
        department: 'Cloud Infrastructure',
        workLocation: 'San Francisco, CA (Hybrid)',
        proposedJoiningDate: '2026-11-16',
        employmentType: 'FULL_TIME',
        bandGrade: 'L6',
        reportingManagerName: 'Marcus Vance',
        reportingManagerTitle: 'VP of Engineering',
        baseSalary: 165000,
        hraAllowance: 24000,
        specialAllowances: 16000,
        performanceBonus: 29750,
        totalCtc: 234750,
        currency: 'USD',
        probationPeriod: '90 days',
        noticePeriod: '30 days',
        workingHoursSummary: '40 hours per week (Monday to Friday)',
        offerValidUntil: '2026-10-15',
        signatoryName: 'Sarah Jenkins',
        signatoryTitle: 'VP of Global Talent',
      },
      sampleAiExtractions: {
        candidateName: { value: 'Jane Alexandra Doe', confidence: 0.98, sourceQuote: 'CANDIDATE DOSSIER: Jane Alexandra Doe' },
        email: { value: 'jane.doe@example.com', confidence: 0.99, sourceQuote: 'jane.doe@example.com' },
        phone: { value: '+1 (555) 234-5678', confidence: 0.95, sourceQuote: '+1 (555) 234-5678' },
        jobTitle: { value: 'Lead Platform Architect', confidence: 0.96, sourceQuote: 'Applying for: Lead Platform Architect' },
        department: { value: 'Cloud Infrastructure', confidence: 0.94, sourceQuote: 'Cloud Infrastructure Department' },
        workLocation: { value: 'San Francisco, CA (Hybrid)', confidence: 0.92, sourceQuote: 'San Francisco, CA (Hybrid)' },
        proposedJoiningDate: { value: '2026-11-16', confidence: 0.95, sourceQuote: 'Target Joining: November 16, 2026' },
        baseSalary: { value: 165000, confidence: 0.96, sourceQuote: 'Base Salary $165,000 USD' },
        totalCtc: { value: 234750, confidence: 0.97, sourceQuote: 'Total CTC $234,750 USD' },
        currency: { value: 'USD', confidence: 0.99, sourceQuote: 'USD' },
        signatoryName: { value: 'Sarah Jenkins', confidence: 0.94, sourceQuote: 'Signatory: Sarah Jenkins' },
        signatoryTitle: { value: 'VP of Global Talent', confidence: 0.94, sourceQuote: 'VP of Global Talent' },
      },
    },
  ],

  // 2. INTERNSHIP LETTER
  INTERNSHIP_LETTER: [
    {
      id: 'tmpl_internship_standard',
      documentTypeCode: 'INTERNSHIP_LETTER',
      name: 'Engineering & Research Internship Appointment',
      description: 'Engagement letter specifying internship duration, monthly stipend, mentor, and learning goals.',
      version: 'v1.4',
      category: 'EMPLOYMENT',
      isDefault: true,
      content: `Dear {{candidate_name}},

We are pleased to offer you an internship engagement as {{internship_role}} in the {{department}} department at {{location}}.

INTERNSHIP TENURE & ARRANGEMENT:
- Start Date: {{start_date}}
- End Date: {{end_date}}
- Working Model: {{working_arrangement}}
- Reporting Mentor: {{mentor_name}} ({{mentor_title}})

STIPEND & TERMS:
You will receive a monthly stipend of {{stipend}}. You will be expected to dedicate {{weekly_hours}} to your project deliverables. This engagement is for academic and professional training and does not constitute permanent employment.

We look forward to a mutually enriching learning journey!

Authorized Signatory,
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `INTERNSHIP MEMO:
Student: Liam Alexander Vance | liam.vance@stanford.edu | +1 (555) 789-0123
University: Stanford University (B.S. Symbolic Systems, Class of 2027)
Role: Machine Learning Research Intern | Department: Applied AI Labs | Location: Palo Alto, CA (Hybrid)
Tenure: June 01, 2026 to August 31, 2026 (3 months)
Stipend: $6,500 USD per month | Schedule: 40 hours per week
Mentor: Dr. Elena Rostova (Principal AI Scientist)
Signatory: Michael Chang (Head of Academic Partnerships)`,
      sampleHrData: {
        candidateName: 'Liam Alexander Vance',
        email: 'liam.vance@stanford.edu',
        phone: '+1 (555) 789-0123',
        address: 'Stanford Campus Box 1420, Stanford, CA',
        academicInstitution: 'Stanford University',
        degreePursued: 'B.S. in Symbolic Systems',
        internshipRole: 'Machine Learning Research Intern',
        department: 'Applied AI Labs',
        location: 'Palo Alto, CA (Hybrid)',
        startDate: '2026-06-01',
        endDate: '2026-08-31',
        workingArrangement: 'HYBRID',
        monthlyStipend: 6500,
        currency: 'USD',
        mentorName: 'Dr. Elena Rostova',
        mentorTitle: 'Principal AI Scientist',
        weeklyHoursCommitment: 40,
        signatoryName: 'Michael Chang',
        signatoryTitle: 'Head of Academic Partnerships',
      },
      sampleAiExtractions: {
        candidateName: { value: 'Liam Alexander Vance', confidence: 0.99, sourceQuote: 'Student: Liam Alexander Vance' },
        email: { value: 'liam.vance@stanford.edu', confidence: 0.98, sourceQuote: 'liam.vance@stanford.edu' },
        internshipRole: { value: 'Machine Learning Research Intern', confidence: 0.97, sourceQuote: 'Role: Machine Learning Research Intern' },
        department: { value: 'Applied AI Labs', confidence: 0.96, sourceQuote: 'Department: Applied AI Labs' },
        location: { value: 'Palo Alto, CA (Hybrid)', confidence: 0.95, sourceQuote: 'Location: Palo Alto, CA (Hybrid)' },
        startDate: { value: '2026-06-01', confidence: 0.95, sourceQuote: 'June 01, 2026' },
        endDate: { value: '2026-08-31', confidence: 0.95, sourceQuote: 'August 31, 2026' },
        monthlyStipend: { value: 6500, confidence: 0.96, sourceQuote: 'Stipend: $6,500 USD per month' },
        currency: { value: 'USD', confidence: 0.99, sourceQuote: 'USD' },
        mentorName: { value: 'Dr. Elena Rostova', confidence: 0.97, sourceQuote: 'Mentor: Dr. Elena Rostova' },
        signatoryName: { value: 'Michael Chang', confidence: 0.94, sourceQuote: 'Signatory: Michael Chang' },
        signatoryTitle: { value: 'Head of Academic Partnerships', confidence: 0.94, sourceQuote: 'Head of Academic Partnerships' },
      },
    },
  ],

  // 3. INCREMENT LETTER
  INCREMENT_LETTER: [
    {
      id: 'tmpl_increment_merit',
      documentTypeCode: 'INCREMENT_LETTER',
      name: 'Annual Merit & Compensation Revision',
      description: 'Formal notification of salary enhancement, revised band level, and effective date.',
      version: 'v2.0',
      category: 'COMPENSATION',
      isDefault: true,
      content: `Dear {{employee_name}},

In recognition of your exceptional contributions and dedication to the {{department}} organization, we are pleased to inform you of your compensation revision effective {{effective_date}}.

REVISED TERMS & COMPENSATION:
- Employee ID: {{employee_id}}
- Current Designation: {{current_designation}}
- Revised Designation: {{revised_designation}}
- Previous Base Salary: {{previous_salary}}
- Revised Base Salary: {{revised_salary}}
- Percentage Revision: {{increment_percentage}}
- Total Revised Annual CTC: {{revised_ctc}}

Your commitment to engineering excellence and teamwork has played a vital role in our shared milestones. We look forward to your continued leadership.

Warm regards,
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `COMPENSATION COMMITTEE RESOLUTION:
Employee: Sophia Chen (Emp ID: EMP-88219) | sophia.chen@example.com
Role: Senior Distributed Systems Engineer -> Staff Distributed Systems Engineer
Department: Core Infrastructure Engineering | Grade: L5 -> L6
Effective Date: 2026-10-01
Previous Compensation: $140,000 USD Base | $168,000 USD Total CTC
Revised Compensation: $165,000 USD Base (+17.86%) | $198,000 USD Total CTC
Signatory: David Sterling (Chief People Officer)`,
      sampleHrData: {
        employeeName: 'Sophia Chen',
        employeeId: 'EMP-88219',
        email: 'sophia.chen@example.com',
        department: 'Core Infrastructure Engineering',
        currentDesignation: 'Senior Distributed Systems Engineer',
        revisedDesignation: 'Staff Distributed Systems Engineer',
        effectiveDate: '2026-10-01',
        previousBaseSalary: 140000,
        revisedBaseSalary: 165000,
        incrementPercentage: 17.86,
        revisedTotalCtc: 198000,
        currency: 'USD',
        performanceCycle: 'FY2026 Annual Merit Review',
        signatoryName: 'David Sterling',
        signatoryTitle: 'Chief People Officer',
      },
      sampleAiExtractions: {
        employeeName: { value: 'Sophia Chen', confidence: 0.99, sourceQuote: 'Employee: Sophia Chen' },
        employeeId: { value: 'EMP-88219', confidence: 0.98, sourceQuote: 'Emp ID: EMP-88219' },
        email: { value: 'sophia.chen@example.com', confidence: 0.97, sourceQuote: 'sophia.chen@example.com' },
        currentDesignation: { value: 'Senior Distributed Systems Engineer', confidence: 0.96, sourceQuote: 'Senior Distributed Systems Engineer' },
        revisedDesignation: { value: 'Staff Distributed Systems Engineer', confidence: 0.96, sourceQuote: 'Staff Distributed Systems Engineer' },
        effectiveDate: { value: '2026-10-01', confidence: 0.95, sourceQuote: 'Effective Date: 2026-10-01' },
        previousBaseSalary: { value: 140000, confidence: 0.98, sourceQuote: '$140,000 USD Base' },
        revisedBaseSalary: { value: 165000, confidence: 0.98, sourceQuote: '$165,000 USD Base' },
        incrementPercentage: { value: 17.86, confidence: 0.99, sourceQuote: '+17.86%' },
        revisedTotalCtc: { value: 198000, confidence: 0.97, sourceQuote: '$198,000 USD Total CTC' },
        currency: { value: 'USD', confidence: 0.99, sourceQuote: 'USD' },
        signatoryName: { value: 'David Sterling', confidence: 0.95, sourceQuote: 'David Sterling' },
        signatoryTitle: { value: 'Chief People Officer', confidence: 0.95, sourceQuote: 'Chief People Officer' },
      },
    },
  ],

  // 4. TERMINATION LETTER
  TERMINATION_LETTER: [
    {
      id: 'tmpl_termination_standard',
      documentTypeCode: 'TERMINATION_LETTER',
      name: 'Formal Separation & Discontinuation Letter',
      description: 'Authorized separation notification with last working day, notice pay, and settlement instructions.',
      version: 'v1.8',
      category: 'SEPARATION',
      isDefault: true,
      content: `Dear {{employee_name}},

This letter serves as formal notice that your employment as {{designation}} with the company will conclude effective {{termination_effective_date}}.

SEPARATION SPECIFICATIONS:
- Employee ID: {{employee_id}}
- Last Working Day: {{last_working_day}}
- Notice Period / Payment Terms: {{notice_terms}}
- Clearance & Asset Return: {{handover_instructions}}

Your Full & Final Settlement (FNF) Statement, comprising outstanding earned salary, accrued leaves, and statutory encashments, will be disbursed pursuant to company guidelines within statutory timelines.

Please ensure all company hardware, credentials, and confidential records are surrendered to HR Operations on or before your last working day.

Sincerely,
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `HR SEPARATION RECORD:
Employee: Arthur Pendelton (Emp ID: EMP-40192) | arthur.p@example.com
Designation: Senior Account Manager | Department: Enterprise Sales
Termination Date: 2026-09-30 | Last Working Date: 2026-10-31
Notice Terms: 30 days served with standard salary continuation
Handover: Transfer customer CRM accounts to Sarah Lin and surrender laptop to IT Ops
Signatory: Katherine Ward (VP of Human Resources)`,
      sampleHrData: {
        employeeName: 'Arthur Pendelton',
        employeeId: 'EMP-40192',
        email: 'arthur.p@example.com',
        designation: 'Senior Account Manager',
        department: 'Enterprise Sales',
        noticeServedOrPaid: 'NOTICE_SERVED',
        terminationNoticeDate: '2026-09-30',
        effectiveTerminationDate: '2026-10-31',
        lastWorkingDate: '2026-10-31',
        severanceAmount: 0,
        currency: 'USD',
        clearanceRequirementsSummary: 'Transfer customer CRM accounts to Sarah Lin and surrender MacBook and access badge to IT Operations',
        signatoryName: 'Katherine Ward',
        signatoryTitle: 'VP of Human Resources',
      },
      sampleAiExtractions: {
        employeeName: { value: 'Arthur Pendelton', confidence: 0.99, sourceQuote: 'Employee: Arthur Pendelton' },
        employeeId: { value: 'EMP-40192', confidence: 0.98, sourceQuote: 'Emp ID: EMP-40192' },
        email: { value: 'arthur.p@example.com', confidence: 0.97, sourceQuote: 'arthur.p@example.com' },
        designation: { value: 'Senior Account Manager', confidence: 0.96, sourceQuote: 'Designation: Senior Account Manager' },
        department: { value: 'Enterprise Sales', confidence: 0.95, sourceQuote: 'Enterprise Sales' },
        effectiveTerminationDate: { value: '2026-10-31', confidence: 0.95, sourceQuote: 'Last Working Date: 2026-10-31' },
        lastWorkingDate: { value: '2026-10-31', confidence: 0.96, sourceQuote: 'Last Working Date: 2026-10-31' },
        signatoryName: { value: 'Katherine Ward', confidence: 0.96, sourceQuote: 'Katherine Ward' },
        signatoryTitle: { value: 'VP of Human Resources', confidence: 0.96, sourceQuote: 'VP of Human Resources' },
      },
    },
  ],

  // 5. EXPERIENCE LETTER
  EXPERIENCE_LETTER: [
    {
      id: 'tmpl_experience_standard',
      documentTypeCode: 'EXPERIENCE_LETTER',
      name: 'Certificate of Service & Experience',
      description: 'Formal credential certifying employee tenure, designation history, and duties performed.',
      version: 'v1.6',
      category: 'SEPARATION',
      isDefault: true,
      content: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employee_name}} (Employee ID: {{employee_id}}) was employed with our organization from {{date_of_joining}} to {{last_working_date}}.

At the time of departure, {{employee_name}} was serving as {{designation}} in the {{department}} department.

ROLE & KEY DELIVERABLES:
{{roles_and_responsibilities}}

During their tenure, {{employee_name}} exhibited professional diligence, technical capability, and exemplary conduct. We wish them continued success in all future professional endeavors.

Authorized Signatory,
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `SERVICE RECORD ARCHIVE:
Employee: Maya Lin (Emp ID: EMP-55018) | maya.lin@alumni.org
Designation: Principal Product Designer | Department: User Experience & Design
Date of Joining: 2021-03-15 | Last Working Date: 2026-08-31
Responsibilities: Spearheaded enterprise design system overhaul, governed multi-platform accessibility guidelines, and led a 6-person design team delivering core SaaS workflows.
Conduct: Exemplary. Left voluntarily to pursue new entrepreneurial ventures.
Signatory: Jonathan Cruz (Senior Director of People Operations)`,
      sampleHrData: {
        employeeName: 'Maya Lin',
        employeeId: 'EMP-55018',
        email: 'maya.lin@alumni.org',
        designationAtExit: 'Principal Product Designer',
        department: 'User Experience & Design',
        dateOfJoining: '2021-03-15',
        lastWorkingDate: '2026-08-31',
        summaryOfResponsibilities: 'Spearheaded enterprise design system overhaul across web and mobile products, governed multi-platform accessibility guidelines, and led a 6-person design team delivering core SaaS analytics workflows.',
        conductAssessment: 'Exemplary',
        signatoryName: 'Jonathan Cruz',
        signatoryTitle: 'Senior Director of People Operations',
      },
      sampleAiExtractions: {
        employeeName: { value: 'Maya Lin', confidence: 0.99, sourceQuote: 'Employee: Maya Lin' },
        employeeId: { value: 'EMP-55018', confidence: 0.98, sourceQuote: 'EMP-55018' },
        designationAtExit: { value: 'Principal Product Designer', confidence: 0.97, sourceQuote: 'Principal Product Designer' },
        department: { value: 'User Experience & Design', confidence: 0.96, sourceQuote: 'User Experience & Design' },
        dateOfJoining: { value: '2021-03-15', confidence: 0.95, sourceQuote: '2021-03-15' },
        lastWorkingDate: { value: '2026-08-31', confidence: 0.96, sourceQuote: '2026-08-31' },
        summaryOfResponsibilities: { value: 'Spearheaded enterprise design system overhaul, governed multi-platform accessibility guidelines, and led a 6-person design team delivering core SaaS workflows.', confidence: 0.94 },
        signatoryName: { value: 'Jonathan Cruz', confidence: 0.95, sourceQuote: 'Jonathan Cruz' },
        signatoryTitle: { value: 'Senior Director of People Operations', confidence: 0.95, sourceQuote: 'Senior Director of People Operations' },
      },
    },
  ],

  // 6. RELIEVING LETTER
  RELIEVING_LETTER: [
    {
      id: 'tmpl_relieving_standard',
      documentTypeCode: 'RELIEVING_LETTER',
      name: 'Official Relieving & Clearance Certificate',
      description: 'Separation certificate validating resignation acceptance and clearance from company obligations.',
      version: 'v1.5',
      category: 'SEPARATION',
      isDefault: true,
      content: `Dear {{employee_name}},

This has reference to your resignation letter dated {{resignation_date}}.

We hereby confirm that you have been formally relieved of your duties and contractual obligations as {{designation}} with effect from the close of business hours on {{relieving_date}}.

All organizational clearance processes, including asset return, credential revocation, and departmental handovers, have been completed satisfactorily.

We thank you for your contributions during your tenure and wish you the very best in your future career.

Sincerely,
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `RELIEVING DISPATCH MEMO:
Employee: Devraj Patel (Emp ID: EMP-72014) | devraj.patel@example.com
Designation: Senior DevOps Engineer | Department: Cloud Infrastructure
Resignation Date: 2026-08-15 | Relieving Date: 2026-09-30
Clearance Status: FULLY_CLEARED (All IT credentials revoked, equipment surrendered, knowledge handover signed off)
Signatory: Jennifer Holt (Manager, People Operations)`,
      sampleHrData: {
        employeeName: 'Devraj Patel',
        employeeId: 'EMP-72014',
        email: 'devraj.patel@example.com',
        designation: 'Senior DevOps Engineer',
        department: 'Cloud Infrastructure',
        resignationSubmissionDate: '2026-08-15',
        lastWorkingDate: '2026-09-30',
        officialRelievingDate: '2026-09-30',
        clearanceStatus: 'FULLY_CLEARED',
        signatoryName: 'Jennifer Holt',
        signatoryTitle: 'Manager, People Operations',
      },
      sampleAiExtractions: {
        employeeName: { value: 'Devraj Patel', confidence: 0.99, sourceQuote: 'Employee: Devraj Patel' },
        employeeId: { value: 'EMP-72014', confidence: 0.98, sourceQuote: 'EMP-72014' },
        designation: { value: 'Senior DevOps Engineer', confidence: 0.97, sourceQuote: 'Senior DevOps Engineer' },
        department: { value: 'Cloud Infrastructure', confidence: 0.96, sourceQuote: 'Cloud Infrastructure' },
        resignationSubmissionDate: { value: '2026-08-15', confidence: 0.95, sourceQuote: '2026-08-15' },
        lastWorkingDate: { value: '2026-09-30', confidence: 0.96, sourceQuote: '2026-09-30' },
        officialRelievingDate: { value: '2026-09-30', confidence: 0.96, sourceQuote: '2026-09-30' },
        signatoryName: { value: 'Jennifer Holt', confidence: 0.95, sourceQuote: 'Jennifer Holt' },
        signatoryTitle: { value: 'Manager, People Operations', confidence: 0.95, sourceQuote: 'Manager, People Operations' },
      },
    },
  ],

  // 7. FNF SETTLEMENT
  FNF_SETTLEMENT: [
    {
      id: 'tmpl_fnf_standard',
      documentTypeCode: 'FNF_SETTLEMENT',
      name: 'Full & Final Settlement Clearance Statement',
      description: 'Detailed financial reconciliation of earned pay, encashments, recoveries, and net payable amount.',
      version: 'v2.2',
      category: 'COMPENSATION',
      isDefault: true,
      content: `FULL & FINAL FINANCIAL SETTLEMENT STATEMENT

EMPLOYEE INFORMATION:
- Name: {{employee_name}}
- Employee ID: {{employee_id}}
- Designation: {{designation}}
- Settlement Date: {{settlement_date}}

FINANCIAL BREAKDOWN:
(+) Earned Salary & Arrears: {{payable_salary}}
(+) Leave Encashment / Gratuity: {{leave_encashment}}
(+) Other Approved Credits: {{other_credits}}
= GROSS PAYABLE EARNINGS: {{gross_earnings}}

(-) Statutory & Tax Deductions: {{statutory_deductions}}
(-) Notice Period / Asset Recovery: {{recoveries}}
= TOTAL DEDUCTIONS: {{total_deductions}}

==================================================
NET PAYABLE AMOUNT: {{net_payable}}
==================================================

Settlement Remarks: {{settlement_remarks}}

Certified by Finance & Payroll Authority:
{{signatory_name}} ({{signatory_title}})`,
      sampleInputText: `PAYROLL FINAL AUDIT SHEET:
Employee: Marcus Thorne (Emp ID: EMP-10928) | marcus.t@example.com
Designation: Staff Security Engineer | Last Working Day: 2026-09-30
Settlement Date: 2026-10-05
Earnings: Earned salary $12,500 + Leave encashment (14 days) $4,200 + Variable incentive $2,500 = $19,200
Deductions: Income tax withholding $3,400 + Medical insurance recovery $300 = $3,700
Net Disbursable: $19,200 - $3,700 = $15,500 USD
Payroll Auditor: Raymond Vance (Head of Global Payroll)`,
      sampleHrData: {
        employeeName: 'Marcus Thorne',
        employeeId: 'EMP-10928',
        email: 'marcus.t@example.com',
        designation: 'Staff Security Engineer',
        lastWorkingDate: '2026-09-30',
        settlementDate: '2026-10-05',
        earnedSalaryPayable: 12500,
        leaveEncashmentAmount: 4200,
        gratuityOrSeverance: 2500,
        payableEarningsTotal: 19200,
        statutoryTaxesDeductions: 3400,
        noticeRecoveryAmount: 0,
        otherDeductions: 300,
        deductionsTotal: 3700,
        netPayableAmount: 15500,
        currency: 'USD',
        settlementRemarks: 'Full and final financial reconciliation approved without dispute.',
        signatoryName: 'Raymond Vance',
        signatoryTitle: 'Head of Global Payroll',
      },
      sampleAiExtractions: {
        employeeName: { value: 'Marcus Thorne', confidence: 0.99, sourceQuote: 'Employee: Marcus Thorne' },
        employeeId: { value: 'EMP-10928', confidence: 0.98, sourceQuote: 'EMP-10928' },
        designation: { value: 'Staff Security Engineer', confidence: 0.96, sourceQuote: 'Staff Security Engineer' },
        settlementDate: { value: '2026-10-05', confidence: 0.95, sourceQuote: 'Settlement Date: 2026-10-05' },
        payableEarningsTotal: { value: 19200, confidence: 0.98, sourceQuote: 'Earnings: $19,200' },
        deductionsTotal: { value: 3700, confidence: 0.98, sourceQuote: 'Deductions: $3,700' },
        netPayableAmount: { value: 15500, confidence: 0.99, sourceQuote: 'Net Disbursable: $15,500' },
        currency: { value: 'USD', confidence: 0.99, sourceQuote: 'USD' },
        signatoryName: { value: 'Raymond Vance', confidence: 0.95, sourceQuote: 'Raymond Vance' },
        signatoryTitle: { value: 'Head of Global Payroll', confidence: 0.95, sourceQuote: 'Head of Global Payroll' },
      },
    },
  ],

  // 8. CONTRACT LETTER
  CONTRACT_LETTER: [
    {
      id: 'tmpl_contract_standard',
      documentTypeCode: 'CONTRACT_LETTER',
      name: 'Independent Contractor Services Agreement',
      description: 'Binding professional contract specifying deliverables, billing rates, milestone deadlines, and IP assignment.',
      version: 'v2.0',
      category: 'LEGAL_COMMERCIAL',
      isDefault: true,
      content: `INDEPENDENT CONTRACTOR & PROFESSIONAL SERVICES AGREEMENT

PARTIES:
- Client: {{company_name}}
- Contractor: {{contractor_name}} ({{contractor_entity}})
- Contact: {{contractor_email}}

STATEMENT OF WORK & DELIVERABLES:
{{service_scope}}

COMMERCIAL TERMS:
- Contract Tenure: {{start_date}} to {{end_date}}
- Compensation Rate / Fee: {{compensation_terms}}
- Invoicing Cycle: {{invoicing_terms}}

LEGAL COVENANTS:
Contractor acknowledges independent contractor status. All work product and intellectual property created under this agreement are assigned exclusively to Client. Either party may terminate with {{termination_notice}} written notice.

Executed by Authorized Representatives:
{{signatory_name}}
{{signatory_title}}`,
      sampleInputText: `CONTRACTOR STATEMENT OF WORK:
Contractor: Alex Mercer (Mercer Cloud Consulting LLC) | alex.mercer@mercercloud.io | +1 (555) 998-1122
Contract Scope: Lead Kubernetes security hardening and ISO 27001 audit remediation
Contract Term: 2026-10-15 to 2027-04-14 (6 months)
Commercials: $125 USD per hour (Not to exceed $20,000 monthly) | Invoicing: Bi-weekly Net 15
Notice Period: 14 days written notice
Signatory: Robert Sterling (VP of Engineering Operations)`,
      sampleHrData: {
        contractorName: 'Alex Mercer',
        contractorEntityName: 'Mercer Cloud Consulting LLC',
        email: 'alex.mercer@mercercloud.io',
        phone: '+1 (555) 998-1122',
        serviceScopeSummary: 'Lead Kubernetes security hardening, IAM least-privilege refactoring, and ISO 27001 technical audit remediation.',
        startDate: '2026-10-15',
        endDate: '2027-04-14',
        feeStructureSummary: '$125 USD per hour (Capped at $20,000 USD monthly)',
        currency: 'USD',
        terminationNoticeDays: 14,
        signatoryName: 'Robert Sterling',
        signatoryTitle: 'VP of Engineering Operations',
      },
      sampleAiExtractions: {
        contractorName: { value: 'Alex Mercer', confidence: 0.99, sourceQuote: 'Contractor: Alex Mercer' },
        contractorEntityName: { value: 'Mercer Cloud Consulting LLC', confidence: 0.98, sourceQuote: 'Mercer Cloud Consulting LLC' },
        email: { value: 'alex.mercer@mercercloud.io', confidence: 0.98, sourceQuote: 'alex.mercer@mercercloud.io' },
        startDate: { value: '2026-10-15', confidence: 0.95, sourceQuote: '2026-10-15' },
        endDate: { value: '2027-04-14', confidence: 0.95, sourceQuote: '2027-04-14' },
        feeStructureSummary: { value: '$125 USD per hour (Not to exceed $20,000 monthly)', confidence: 0.96 },
        currency: { value: 'USD', confidence: 0.99, sourceQuote: 'USD' },
        terminationNoticeDays: { value: 14, confidence: 0.95, sourceQuote: '14 days written notice' },
        signatoryName: { value: 'Robert Sterling', confidence: 0.95, sourceQuote: 'Robert Sterling' },
        signatoryTitle: { value: 'VP of Engineering Operations', confidence: 0.95, sourceQuote: 'VP of Engineering Operations' },
      },
    },
  ],

  // 9. MSA
  MSA: [
    {
      id: 'tmpl_msa_standard',
      documentTypeCode: 'MSA',
      name: 'Master Services Agreement (Enterprise Standard)',
      description: 'Comprehensive master contract establishing commercial framework, warranties, IP rights, and liability limits.',
      version: 'v3.0',
      category: 'LEGAL_COMMERCIAL',
      isDefault: true,
      content: `MASTER SERVICES AGREEMENT (MSA)

This Master Services Agreement is entered into effective {{effective_date}} between {{service_provider_name}} ("Provider") and {{client_legal_name}} ("Client").

1. SCOPE OF SERVICES:
Provider shall provide enterprise software development and consulting services as specified in Statements of Work (SOWs) executed under this MSA.

2. COMMERCIAL TERMS:
{{commercial_summary}}

3. INTELLECTUAL PROPERTY & CONFIDENTIALITY:
All bespoke deliverables created pursuant to an SOW shall belong exclusively to Client. Both parties agree to hold confidential proprietary business information inviolate.

4. LIABILITY & INDEMNIFICATION:
Each party's aggregate liability under this agreement shall be limited to {{liability_cap}}.

5. GOVERNING LAW & DISPUTES:
This agreement shall be governed by and construed under the laws of {{governing_jurisdiction}}.

EXECUTED BY AUTHORIZED SIGNATORIES:
Client Representative: {{client_signatory_name}} ({{client_signatory_title}})
Provider Representative: {{signatory_name}} ({{signatory_title}})`,
      sampleInputText: `ENTERPRISE MSA TERM SHEET:
Client: Apex Global Logistics Inc. (apex-logistics.com) | legal@apex-logistics.com
Client Signatory: Veronica Scott (Chief Legal Officer)
Effective Date: 2026-11-01
Scope: Enterprise cloud infrastructure modernization, automated supply-chain API orchestration, and 24/7 reliability engineering.
Commercial Terms: Time & Materials billing based on SOW rate card; Net 30 payment terms.
Liability Cap: $2,000,000 USD or 2x fees paid in preceding 12 months.
Governing Jurisdiction: State of Delaware, United States
Provider Signatory: Alexander Pierce (Managing Director & General Counsel)`,
      sampleHrData: {
        clientLegalName: 'Apex Global Logistics Inc.',
        clientContactEmail: 'legal@apex-logistics.com',
        clientAddress: '500 Harbor Boulevard, Suite 1200, Seattle, WA',
        effectiveDate: '2026-11-01',
        masterScopeDescription: 'Enterprise cloud infrastructure modernization, automated supply-chain API orchestration, and 24/7 site reliability engineering.',
        commercialPaymentTermsSummary: 'Time & Materials billing based on SOW rate card; invoices payable Net 30 days.',
        liabilityCapTerms: '$2,000,000 USD or 2x fees paid in preceding 12 months, whichever is greater',
        governingLawJurisdiction: 'State of Delaware, United States',
        clientSignatoryName: 'Veronica Scott',
        clientSignatoryTitle: 'Chief Legal Officer',
        signatoryName: 'Alexander Pierce',
        signatoryTitle: 'Managing Director & General Counsel',
      },
      sampleAiExtractions: {
        clientLegalName: { value: 'Apex Global Logistics Inc.', confidence: 0.99, sourceQuote: 'Client: Apex Global Logistics Inc.' },
        clientContactEmail: { value: 'legal@apex-logistics.com', confidence: 0.98, sourceQuote: 'legal@apex-logistics.com' },
        effectiveDate: { value: '2026-11-01', confidence: 0.96, sourceQuote: 'Effective Date: 2026-11-01' },
        masterScopeDescription: { value: 'Enterprise cloud infrastructure modernization, automated supply-chain API orchestration, and 24/7 reliability engineering.', confidence: 0.94 },
        governingLawJurisdiction: { value: 'State of Delaware, United States', confidence: 0.97, sourceQuote: 'State of Delaware' },
        clientSignatoryName: { value: 'Veronica Scott', confidence: 0.96, sourceQuote: 'Veronica Scott' },
        clientSignatoryTitle: { value: 'Chief Legal Officer', confidence: 0.96, sourceQuote: 'Chief Legal Officer' },
        signatoryName: { value: 'Alexander Pierce', confidence: 0.95, sourceQuote: 'Alexander Pierce' },
        signatoryTitle: { value: 'Managing Director & General Counsel', confidence: 0.95, sourceQuote: 'Managing Director & General Counsel' },
      },
    },
  ],
};
