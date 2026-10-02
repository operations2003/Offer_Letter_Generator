// =============================================================================
// PRELOADED HR DOCUMENT TEMPLATE CATALOG (13 CATEGORIES)
// =============================================================================
// Standard, corporate templates with reusable placeholders:
// {{employee_name}}, {{employee_id}}, {{designation}}, {{department}},
// {{joining_date}}, {{reporting_manager}}, {{employment_type}}, {{annual_ctc}},
// {{company_name}}, {{issue_date}}, {{work_location}}, {{official_email}}, etc.
// =============================================================================

export interface PreloadedTemplate {
  code: string;
  category: string;
  name: string;
  description: string;
  supportedFormats: ('PDF' | 'DOCX')[];
  defaultDocxAvailable: boolean;
  requiredEmployeePlaceholders: string[];
  docSpecificFields: {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'select' | 'textarea';
    defaultValue?: any;
    placeholder?: string;
    options?: { label: string; value: string }[];
  }[];
  contentMarkup: string;
}

export const PRELOADED_HR_TEMPLATES: Record<string, PreloadedTemplate> = {
  // 1. OFFER LETTER
  OFFER_LETTER: {
    code: 'OFFER_LETTER',
    category: 'Offer Letter',
    name: 'Standard Corporate Employment Offer Letter',
    description: 'Comprehensive employment offer covering role, compensation, benefits, joining date, and policies.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'designation', 'department', 'joining_date', 'annual_ctc'],
    docSpecificFields: [
      { key: 'signatory_name', label: 'Authorized Signatory Name', type: 'string', defaultValue: 'Sarah Jenkins' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'VP of People Operations' },
      { key: 'probation_period', label: 'Probation Duration', type: 'string', defaultValue: '90 days' },
      { key: 'notice_period', label: 'Notice Period', type: 'string', defaultValue: '30 days' },
      { key: 'offer_valid_until', label: 'Offer Validity Expiration', type: 'date' },
    ],
    contentMarkup: `DATE: {{issue_date}}

CONFIDENTIAL & PERSONAL

To,
{{employee_name}}
Employee ID (Provisional): {{employee_id}}
Email: {{personal_email}}
Phone: {{phone}}

Dear {{employee_name}},

On behalf of {{company_name}}, we are delighted to offer you the position of {{designation}} in the {{department}} department, based at our {{work_location}} office.

1. COMMENCEMENT & REPORTING
Your employment will commence on {{joining_date}}. You will report directly to {{reporting_manager}}. Your employment model will be {{employment_type}}.

2. COMPENSATION & REWARDS
Your total annualized Cost-to-Company (CTC) will be {{annual_ctc}} ({{currency}}). This comprises your fixed base compensation, standard statutory benefits, and applicable performance incentives. Detailed salary annexures will be provided with your onboarding kit.

3. PROBATION & NOTICE PERIOD
You will be subject to a probation period of {{probation_period}} from your date of joining. Upon confirmation, either party may terminate this agreement by providing {{notice_period}} prior written notice or equivalent salary in lieu thereof.

4. TERMS & CONFIDENTIALITY
You agree to comply with all corporate policies, proprietary information safeguards, and code of business ethics of {{company_name}}.

Please sign and return the duplicate copy of this letter on or before {{offer_valid_until}} to confirm your acceptance.

We warmly welcome you to {{company_name}} and look forward to an impactful association!

Sincerely,
For {{company_name}}

{{signatory_name}}
{{signatory_title}}

--------------------------------------------------
CANDIDATE ACCEPTANCE RECEIPT:
I, {{employee_name}}, have read, understood, and accept the terms and conditions outlined in this offer letter.

Candidate Signature: __________________________
Date of Acceptance: __________________________`,
  },

  // 2. INTERNSHIP LETTER
  INTERNSHIP_LETTER: {
    code: 'INTERNSHIP_LETTER',
    category: 'Internship Letter',
    name: 'Academic & Professional Internship Engagement Letter',
    description: 'Specifies internship role, tenure, monthly stipend, assigned mentor, and training deliverables.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'designation', 'department', 'joining_date'],
    docSpecificFields: [
      { key: 'internship_end_date', label: 'Internship End Date', type: 'date' },
      { key: 'monthly_stipend', label: 'Monthly Stipend Amount', type: 'string', defaultValue: '$3,500 / month' },
      { key: 'mentor_name', label: 'Assigned Mentor', type: 'string', defaultValue: 'Elena Rostova (Principal Scientist)' },
      { key: 'signatory_name', label: 'Signatory Name', type: 'string', defaultValue: 'Sarah Jenkins' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'Director of Talent' },
    ],
    contentMarkup: `DATE: {{issue_date}}

To,
{{employee_name}}
Intern ID: {{employee_id}}
Email: {{personal_email}}

SUBJECT: APPOINTMENT FOR PROFESSIONAL INTERNSHIP

Dear {{employee_name}},

We are pleased to offer you an internship engagement as {{designation}} with {{company_name}} in the {{department}} department at our {{work_location}} center.

1. TENURE & WORKING MODEL
Your internship commences on {{joining_date}} and concludes on {{internship_end_date}}. This is a {{employment_type}} engagement designed for academic enrichment and practical software development experience.

2. MENTORSHIP & GUIDANCE
You will be mentored by {{mentor_name}}, who will guide your training plan and evaluate milestone deliverables.

3. STIPEND & ALLOWANCES
During this tenure, you will receive a monthly stipend of {{monthly_stipend}}, payable through standard payroll cycles.

4. CODE OF CONDUCT & CONFIDENTIALITY
You will have access to proprietary systems and intellectual property of {{company_name}}. You are required to maintain strict confidentiality of all data, designs, and source code.

We wish you an engaging and fruitful learning experience with us.

Yours sincerely,
For {{company_name}}

{{signatory_name}}
{{signatory_title}}`,
  },

  // 3. EMPLOYMENT CONTRACT
  EMPLOYMENT_CONTRACT: {
    code: 'EMPLOYMENT_CONTRACT',
    category: 'Employment Contract',
    name: 'Formal Indefinite Employment Agreement',
    description: 'Comprehensive legal contract establishing covenants, obligations, IP assignment, and dispute resolution.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department', 'annual_ctc', 'joining_date'],
    docSpecificFields: [
      { key: 'contract_duration', label: 'Contract Duration', type: 'string', defaultValue: 'Indefinite / Permanent' },
      { key: 'governing_jurisdiction', label: 'Governing Law / Jurisdiction', type: 'string', defaultValue: 'State of California, USA' },
      { key: 'notice_period', label: 'Contract Notice Period', type: 'string', defaultValue: '30 days' },
      { key: 'signatory_name', label: 'Employer Signatory Name', type: 'string', defaultValue: 'Marcus Sterling' },
      { key: 'signatory_title', label: 'Employer Signatory Title', type: 'string', defaultValue: 'Chief People Officer' },
    ],
    contentMarkup: `EMPLOYMENT AGREEMENT & SERVICE CONTRACT

THIS AGREEMENT is entered into on {{issue_date}}, between:
EMPLOYER: {{company_name}}, having its principal offices at {{work_location}}
AND
EMPLOYEE: {{employee_name}} (Employee ID: {{employee_id}}), residing at contact address registered on file.

1. APPOINTMENT & SCOPE
The Employer hereby employs the Employee in the capacity of {{designation}} within the {{department}} organization, starting from {{joining_date}}.

2. DURATION
The term of this employment shall be {{contract_duration}}, subject to termination provisions herein.

3. REMUNERATION
Employee shall receive an annualized compensation of {{annual_ctc}} ({{currency}}), subject to mandatory statutory tax withholdings.

4. INTELLECTUAL PROPERTY ASSIGNMENT
All inventions, discoveries, software code, and creative works authored or conceived by Employee during employment shall remain the sole and exclusive property of {{company_name}}.

5. NOTICE & TERMINATION
Either party may terminate this Agreement by providing {{notice_period}} prior written notice.

6. GOVERNING LAW
This contract is governed by and construed under the laws of {{governing_jurisdiction}}.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of {{issue_date}}.

EMPLOYER:                               EMPLOYEE:
For {{company_name}}

___________________________             ___________________________
{{signatory_name}}                       {{employee_name}}
{{signatory_title}}                      Employee ID: {{employee_id}}`,
  },

  // 4. INCREMENT LETTER
  INCREMENT_LETTER: {
    code: 'INCREMENT_LETTER',
    category: 'Increment Letter',
    name: 'Annual Merit & Compensation Revision Letter',
    description: 'Official notice celebrating performance, detailing base salary enhancement, revised band, and effective date.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department', 'annual_ctc'],
    docSpecificFields: [
      { key: 'revised_ctc', label: 'Revised Annual CTC', type: 'string', defaultValue: '$180,000' },
      { key: 'increment_percentage', label: 'Increment Percentage', type: 'string', defaultValue: '15%' },
      { key: 'revised_designation', label: 'Revised Designation (if promoted)', type: 'string', defaultValue: 'Staff Software Engineer' },
      { key: 'effective_date', label: 'Effective Date of Revision', type: 'date' },
      { key: 'performance_cycle', label: 'Performance Appraisal Cycle', type: 'string', defaultValue: 'FY 2026 Annual Merit Review' },
      { key: 'signatory_name', label: 'Signatory Name', type: 'string', defaultValue: 'David Sterling' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'Head of People Systems' },
    ],
    contentMarkup: `DATE: {{issue_date}}

CONFIDENTIAL

To,
{{employee_name}}
Employee ID: {{employee_id}}
Department: {{department}}
Designation: {{designation}}

SUBJECT: COMPENSATION REVISION & PERFORMANCE RECOGNITION

Dear {{employee_name}},

In recognition of your exceptional contributions, dedication, and technical leadership during the {{performance_cycle}}, we are delighted to announce the revision of your compensation terms.

COMPENSATION REVISION SUMMARY:
- Current Designation: {{designation}}
- Revised Designation: {{revised_designation}}
- Previous Annual CTC: {{annual_ctc}}
- Revised Annual CTC: {{revised_ctc}}
- Increment Percentage: {{increment_percentage}}
- Effective Date: {{effective_date}}

All other terms and covenants of your employment contract remain unchanged and in full force.

We congratulate you on your achievements and look forward to your sustained contribution toward our shared company milestones!

Sincerely,
For {{company_name}}

{{signatory_name}}
{{signatory_title}}`,
  },

  // 5. EXPERIENCE LETTER
  EXPERIENCE_LETTER: {
    code: 'EXPERIENCE_LETTER',
    category: 'Experience Letter',
    name: 'Formal Certificate of Service & Experience',
    description: 'Attests employee tenure, designation history, duties executed, and conduct record.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department', 'joining_date'],
    docSpecificFields: [
      { key: 'last_working_date', label: 'Last Working Day', type: 'date' },
      { key: 'conduct_summary', label: 'Conduct Assessment', type: 'string', defaultValue: 'Exemplary, diligent, and professionally committed' },
      { key: 'key_deliverables', label: 'Key Responsibilities & Deliverables', type: 'textarea', defaultValue: 'Spearheaded core software architecture, collaborated across cross-functional product teams, and upheld rigorous engineering standards.' },
      { key: 'signatory_name', label: 'Signatory Name', type: 'string', defaultValue: 'Sarah Jenkins' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'VP of Human Resources' },
    ],
    contentMarkup: `TO WHOMSOEVER IT MAY CONCERN

DATE OF ISSUANCE: {{issue_date}}

This is to certify that {{employee_name}} (Employee ID: {{employee_id}}) was employed with {{company_name}} from {{joining_date}} to {{last_working_date}}.

At the time of leaving, {{employee_name}} was holding the position of {{designation}} in the {{department}} department.

CORE RESPONSIBILITIES:
{{key_deliverables}}

During their tenure with {{company_name}}, {{employee_name}} demonstrated outstanding technical capabilities, integrity, and proactive collaboration. Their conduct was {{conduct_summary}}.

We thank {{employee_name}} for their valuable service and wish them every success in their future professional endeavors.

Authorized Signatory,
For {{company_name}}

{{signatory_name}}
{{signatory_title}}`,
  },

  // 6. RELIEVING LETTER
  RELIEVING_LETTER: {
    code: 'RELIEVING_LETTER',
    category: 'Relieving Letter',
    name: 'Official Relieving & Clearance Certificate',
    description: 'Confirms resignation acceptance, handover completion, and formal discharge from company duties.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department'],
    docSpecificFields: [
      { key: 'resignation_date', label: 'Resignation Submission Date', type: 'date' },
      { key: 'relieving_date', label: 'Official Relieving Date', type: 'date' },
      { key: 'clearance_status', label: 'Clearance Status', type: 'string', defaultValue: 'All company assets, access credentials, and project documentation surrendered satisfactorily' },
      { key: 'signatory_name', label: 'Signatory Name', type: 'string', defaultValue: 'Jennifer Holt' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'Lead People Partner' },
    ],
    contentMarkup: `DATE: {{issue_date}}

To,
{{employee_name}}
Employee ID: {{employee_id}}
Department: {{department}}

SUBJECT: RELIEVING LETTER & FORMAL RELEASE OF SERVICE

Dear {{employee_name}},

This has reference to your formal resignation letter dated {{resignation_date}}, requesting release from your services as {{designation}}.

We hereby confirm that you have been formally relieved of your duties and contractual obligations with {{company_name}} with effect from the close of business hours on {{relieving_date}}.

All departmental handovers, intellectual property clearances, and hardware asset returns have been verified ({{clearance_status}}).

Your Full & Final Settlement (FNF) will be processed and credited to your account as per statutory guidelines.

We appreciate the dedication you exhibited during your association with {{company_name}} and wish you the best in all future undertakings.

Yours sincerely,
For {{company_name}}

{{signatory_name}}
{{signatory_title}}`,
  },

  // 7. TERMINATION LETTER
  TERMINATION_LETTER: {
    code: 'TERMINATION_LETTER',
    category: 'Termination Letter',
    name: 'Formal Separation & Discontinuation Letter',
    description: 'Document specifying separation terms, final working day, handover instructions, and settlement guidelines.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department'],
    docSpecificFields: [
      { key: 'effective_termination_date', label: 'Effective Termination Date', type: 'date' },
      { key: 'last_working_day', label: 'Last Working Day', type: 'date' },
      { key: 'severance_terms', label: 'Severance & Notice Pay Terms', type: 'string', defaultValue: 'One month salary in lieu of notice, subject to clearance' },
      { key: 'handover_instructions', label: 'Handover & Asset Return Instructions', type: 'textarea', defaultValue: 'Please surrender all company laptops, security fobs, ID badges, and corporate confidential records to HR Operations.' },
      { key: 'signatory_name', label: 'Signatory Name', type: 'string', defaultValue: 'Katherine Ward' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'VP of Human Resources' },
    ],
    contentMarkup: `DATE: {{issue_date}}

PRIVATE & CONFIDENTIAL

To,
{{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Department: {{department}}

SUBJECT: NOTICE OF EMPLOYMENT CONCLUSION

Dear {{employee_name}},

This letter serves as formal notification that your employment with {{company_name}} will conclude effective {{effective_termination_date}}. Your last working day will be {{last_working_day}}.

SEPARATION TERMS:
1. Severance / Notice Payment: {{severance_terms}}.
2. Handover & Surrender of Property: {{handover_instructions}}
3. Full & Final Settlement: All accrued earned compensation, statutory benefits, and approved reimbursements will be audited and disbursed following complete departmental clearance.
4. Continuing Covenants: You are reminded of your continuing legal obligations regarding non-disclosure of confidential information and intellectual property belonging to {{company_name}}.

Sincerely,
For {{company_name}}

{{signatory_name}}
{{signatory_title}}`,
  },

  // 8. FULL AND FINAL SETTLEMENT (FNF)
  FNF_SETTLEMENT: {
    code: 'FNF_SETTLEMENT',
    category: 'Full and Final Settlement Statement',
    name: 'Full & Final Financial Settlement Statement',
    description: 'Structured financial reconciliation statement itemizing payable salary, leave encashment, statutory deductions, and net amount.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department'],
    docSpecificFields: [
      { key: 'settlement_date', label: 'Settlement Date', type: 'date' },
      { key: 'payable_salary', label: 'Earned Salary Payable', type: 'string', defaultValue: '$8,500.00' },
      { key: 'leave_encashment', label: 'Leave Encashment Payout', type: 'string', defaultValue: '$2,400.00' },
      { key: 'other_credits', label: 'Other Credits / Gratuity', type: 'string', defaultValue: '$1,200.00' },
      { key: 'statutory_deductions', label: 'Statutory Taxes & PF Deductions', type: 'string', defaultValue: '$2,100.00' },
      { key: 'other_recoveries', label: 'Asset / Notice Recoveries', type: 'string', defaultValue: '$0.00' },
      { key: 'net_payable', label: 'Net Disbursable Amount', type: 'string', defaultValue: '$10,000.00' },
      { key: 'settlement_remarks', label: 'Auditor Remarks', type: 'string', defaultValue: 'Full & final reconciliation approved without dispute.' },
      { key: 'signatory_name', label: 'Payroll Authority Name', type: 'string', defaultValue: 'Raymond Vance' },
      { key: 'signatory_title', label: 'Payroll Authority Title', type: 'string', defaultValue: 'Head of Global Payroll' },
    ],
    contentMarkup: `FULL & FINAL FINANCIAL SETTLEMENT STATEMENT

STATEMENT DATE: {{issue_date}}
ORGANIZATION: {{company_name}}

EMPLOYEE DETAILS:
- Employee Name: {{employee_name}}
- Employee ID: {{employee_id}}
- Designation: {{designation}}
- Department: {{department}}
- Settlement Date: {{settlement_date}}

=======================================================
EARNINGS & CREDITS:
(+) Earned Salary & Arrears:             {{payable_salary}}
(+) Accrued Leave Encashment:           {{leave_encashment}}
(+) Other Approved Credits / Bonus:     {{other_credits}}
-------------------------------------------------------
TOTAL GROSS EARNINGS:                   {{payable_salary}} + {{leave_encashment}} + {{other_credits}}

DEDUCTIONS & RECOVERIES:
(-) Statutory Taxes / Withholdings:     {{statutory_deductions}}
(-) Notice Period / Other Recoveries:   {{other_recoveries}}
-------------------------------------------------------
TOTAL DEDUCTIONS:                       {{statutory_deductions}} + {{other_recoveries}}

=======================================================
NET DISBURSABLE AMOUNT:                 {{net_payable}}
=======================================================

Settlement Remarks: {{settlement_remarks}}

DISCLAIMER & DISCHARGE:
Upon receipt of the net payable amount, {{employee_name}} acknowledges that all claims, dues, and remuneration against {{company_name}} have been settled in full.

Authorized Payroll Signatory:
{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
  },

  // 9. PAYSLIP
  PAYSLIP: {
    code: 'PAYSLIP',
    category: 'Payslip',
    name: 'Monthly Employee Earnings & Deductions Payslip',
    description: 'Itemized monthly salary slip displaying base earnings, allowances, statutory deductions, and net take-home pay.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department', 'annual_ctc'],
    docSpecificFields: [
      { key: 'pay_period', label: 'Salary Period / Month', type: 'string', defaultValue: 'October 2026' },
      { key: 'basic_salary', label: 'Basic Salary', type: 'string', defaultValue: '$6,250.00' },
      { key: 'hra_allowance', label: 'House Rent Allowance (HRA)', type: 'string', defaultValue: '$2,500.00' },
      { key: 'special_allowance', label: 'Special Allowance', type: 'string', defaultValue: '$1,650.00' },
      { key: 'pf_deduction', label: 'Provident Fund / 401(k)', type: 'string', defaultValue: '$750.00' },
      { key: 'tax_deduction', label: 'Income Tax Withholding', type: 'string', defaultValue: '$1,400.00' },
      { key: 'net_pay', label: 'Net Take-Home Pay', type: 'string', defaultValue: '$8,250.00' },
      { key: 'bank_account_masked', label: 'Bank Account (Masked)', type: 'string', defaultValue: 'XXXX-XXXX-4819' },
      { key: 'signatory_name', label: 'Authorized Signatory', type: 'string', defaultValue: 'Finance Operations' },
      { key: 'signatory_title', label: 'Title', type: 'string', defaultValue: 'Payroll Department' },
    ],
    contentMarkup: `PAYSLIP FOR THE MONTH OF {{pay_period}}

ORGANIZATION: {{company_name}}
Location: {{work_location}}

EMPLOYEE PROFILE:
Name: {{employee_name}}                 Employee ID: {{employee_id}}
Designation: {{designation}}             Department: {{department}}
Joining Date: {{joining_date}}           Disbursement Account: {{bank_account_masked}}

=======================================================
EARNINGS BREAKDOWN:                     DEDUCTIONS BREAKDOWN:
-------------------------------------------------------
Basic Salary:           {{basic_salary}} Income Tax (TDS):    {{tax_deduction}}
House Rent Allowance:   {{hra_allowance}} Provident Fund:       {{pf_deduction}}
Special Allowance:      {{special_allowance}}
-------------------------------------------------------
TOTAL GROSS EARNINGS:   {{basic_salary}} + {{hra_allowance}} + {{special_allowance}}
TOTAL DEDUCTIONS:       {{tax_deduction}} + {{pf_deduction}}

=======================================================
NET TAKE-HOME SALARY:   {{net_pay}}
=======================================================

Note: This is a computer-generated salary slip and requires no physical signature under company policy.

Issued by: {{signatory_name}} ({{signatory_title}}), {{company_name}}
Issue Date: {{issue_date}}`,
  },

  // 10. COMPANY POLICIES
  POLICY: {
    code: 'POLICY',
    category: 'Company Policies',
    name: 'Corporate Code of Conduct & Information Security Policy',
    description: 'Corporate governance document setting compliance standards, confidentiality requirements, and ethical guidelines.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'department'],
    docSpecificFields: [
      { key: 'policy_title', label: 'Policy Document Title', type: 'string', defaultValue: 'Enterprise Code of Conduct & Cyber Hygiene Policy' },
      { key: 'effective_date', label: 'Policy Effective Date', type: 'date' },
      { key: 'version_tag', label: 'Policy Version', type: 'string', defaultValue: 'v4.2-2026' },
      { key: 'signatory_name', label: 'Compliance Officer Name', type: 'string', defaultValue: 'Jonathan Cruz' },
      { key: 'signatory_title', label: 'Title', type: 'string', defaultValue: 'Chief Compliance & Legal Officer' },
    ],
    contentMarkup: `POLICY GOVERNANCE DIRECTIVE: {{policy_title}}

ORGANIZATION: {{company_name}}
POLICY VERSION: {{version_tag}} | EFFECTIVE DATE: {{effective_date}}

1. OBJECTIVE & APPLICABILITY
This policy sets forth ethical conduct, data privacy standards, and workplace responsibilities applicable to all employees of {{company_name}}, including {{employee_name}} (ID: {{employee_id}}) in the {{department}} department.

2. CONFIDENTIALITY & DATA PROTECTION
Employees shall handle all proprietary algorithms, client data, and business strategies strictly on a need-to-know basis. Unauthorized disclosure or export of confidential records is strictly prohibited.

3. WORKPLACE INTEGRITY & INCLUSION
{{company_name}} maintains an environment founded on mutual respect, meritocracy, and non-discrimination.

4. COMPLIANCE & ACKNOWLEDGMENT
Failure to adhere to these provisions may result in disciplinary action up to and including termination of employment.

POLICY ACKNOWLEDGMENT RECORD:
I, {{employee_name}}, hereby acknowledge receipt and understanding of the {{policy_title}}.

Employee Signature: _______________________
Date: {{issue_date}}

Authorized by:
{{signatory_name}} ({{signatory_title}})
{{company_name}}`,
  },

  // 11. SERVICE AGREEMENT (MSA)
  MSA: {
    code: 'MSA',
    category: 'Service Agreement (MSA)',
    name: 'Master Services Agreement (Enterprise Standard)',
    description: 'Bilateral master agreement establishing service terms, intellectual property assignment, and commercial terms.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'company_name', 'issue_date'],
    docSpecificFields: [
      { key: 'client_legal_name', label: 'Client Legal Entity Name', type: 'string', defaultValue: 'Apex Global Logistics Inc.' },
      { key: 'service_scope', label: 'Scope of Services Summary', type: 'textarea', defaultValue: 'Provision of cloud modernization, high-availability architecture engineering, and API integration services.' },
      { key: 'commercial_terms', label: 'Commercial & Billing Terms', type: 'string', defaultValue: 'Time & Materials based on Statement of Work (SOW) rate card, Net 30 days.' },
      { key: 'governing_jurisdiction', label: 'Governing Law Jurisdiction', type: 'string', defaultValue: 'State of Delaware, United States' },
      { key: 'signatory_name', label: 'Provider Signatory Name', type: 'string', defaultValue: 'Alexander Pierce' },
      { key: 'signatory_title', label: 'Provider Signatory Title', type: 'string', defaultValue: 'Managing Director & General Counsel' },
    ],
    contentMarkup: `MASTER SERVICES AGREEMENT (MSA)

EFFECTIVE DATE: {{issue_date}}
BETWEEN:
PROVIDER: {{company_name}} (Represented by {{employee_name}})
AND
CLIENT: {{client_legal_name}}

1. APPOINTMENT & STATEMENTS OF WORK (SOW)
Provider shall deliver software engineering, technical advisory, and implementation services as specified in sequentially numbered SOWs executed hereunder.

2. SCOPE OF ENGAGEMENT
{{service_scope}}

3. COMMERCIALS & PAYMENT
{{commercial_terms}}

4. INTELLECTUAL PROPERTY & INDEMNITY
Client shall own all bespoke deliverables developed exclusively for Client. Provider retains ownership of its pre-existing core libraries and background IP.

5. GOVERNING LAW
This agreement is governed by the laws of {{governing_jurisdiction}}.

EXECUTED BY AUTHORIZED REPRESENTATIVES:

FOR PROVIDER:                           FOR CLIENT:
{{company_name}}                        {{client_legal_name}}

___________________________             ___________________________
{{signatory_name}}                       Authorized Signatory
{{signatory_title}}`,
  },

  // 12. ONBOARDING FORMS
  ONBOARDING_FORM: {
    code: 'ONBOARDING_FORM',
    category: 'Onboarding Forms',
    name: 'Employee Joining Dossier & Onboarding Declaration',
    description: 'Official record capturing emergency contacts, bank details, statutory declarations, and hardware requisitions.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department', 'joining_date'],
    docSpecificFields: [
      { key: 'emergency_contact_name', label: 'Emergency Contact Person', type: 'string', defaultValue: 'Jane Doe (Spouse)' },
      { key: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'string', defaultValue: '+1 (555) 987-6543' },
      { key: 'bank_name', label: 'Salary Bank Name', type: 'string', defaultValue: 'Silicon Valley Commercial Bank' },
      { key: 'account_number', label: 'Bank Account Number', type: 'string', defaultValue: '98721498124' },
      { key: 'it_hardware_provisioned', label: 'Provisioned Hardware', type: 'string', defaultValue: 'Apple MacBook Pro M3 Max (Asset Tag: ACME-HW-4091)' },
      { key: 'signatory_name', label: 'HR Onboarding Officer', type: 'string', defaultValue: 'David Sterling' },
      { key: 'signatory_title', label: 'Title', type: 'string', defaultValue: 'Head of People Operations' },
    ],
    contentMarkup: `EMPLOYEE ONBOARDING & ENROLLMENT DOSSIER

COMPANY: {{company_name}}
DATE OF ENROLLMENT: {{issue_date}}

SECTION 1: EMPLOYEE ESSENTIALS
- Full Legal Name: {{employee_name}}
- Employee ID: {{employee_id}}
- Official Designation: {{designation}}
- Assigned Department: {{department}}
- Date of Joining: {{joining_date}}
- Work Location: {{work_location}}
- Official Email: {{official_email}}
- Personal Contact: {{phone}} / {{personal_email}}

SECTION 2: EMERGENCY CONTACTS
- Contact Person: {{emergency_contact_name}}
- Phone Number: {{emergency_contact_phone}}

SECTION 3: DIRECT DEPOSIT BANK DETAILS
- Financial Institution: {{bank_name}}
- Account Number: {{account_number}}

SECTION 4: IT HARDWARE & CREDENTIAL HANDOVER
- Provisioned Assets: {{it_hardware_provisioned}}

EMPLOYEE DECLARATION:
I, {{employee_name}}, confirm that the information provided above is accurate and true to the best of my knowledge.

Employee Signature: _______________________ Date: {{issue_date}}

Verified by HR Operations:
{{signatory_name}} ({{signatory_title}}), {{company_name}}`,
  },

  // 13. TRAINING CERTIFICATES
  CERTIFICATE: {
    code: 'CERTIFICATE',
    category: 'Training Certificates',
    name: 'Certificate of Professional Training & Achievement',
    description: 'Formal credential certifying completion of specialized technical, compliance, or leadership training programs.',
    supportedFormats: ['PDF', 'DOCX'],
    defaultDocxAvailable: true,
    requiredEmployeePlaceholders: ['employee_name', 'employee_id', 'designation', 'department'],
    docSpecificFields: [
      { key: 'training_program_name', label: 'Training Course / Program Title', type: 'string', defaultValue: 'Advanced Distributed Systems & Cyber Hygiene' },
      { key: 'completion_date', label: 'Date of Completion', type: 'date' },
      { key: 'certificate_id', label: 'Certificate Credential ID', type: 'string', defaultValue: 'CERT-2026-88192' },
      { key: 'trainer_name', label: 'Trainer / Program Director', type: 'string', defaultValue: 'Dr. Elena Rostova' },
      { key: 'trainer_title', label: 'Trainer Title', type: 'string', defaultValue: 'Chief Learning Architect' },
      { key: 'signatory_name', label: 'HR Leadership Signatory', type: 'string', defaultValue: 'Sarah Jenkins' },
      { key: 'signatory_title', label: 'Signatory Title', type: 'string', defaultValue: 'VP of Global Talent' },
    ],
    contentMarkup: `CERTIFICATE OF ACHIEVEMENT & PROFESSIONAL TRAINING

THIS CERTIFICATE IS PROUDLY CONFERRED UPON:

{{employee_name}}
(Employee ID: {{employee_id}} | {{designation}}, {{department}})

In formal recognition of successful completion of the executive training program:

"{{training_program_name}}"

Conducted by {{company_name}} Corporate Learning & Development Institute.
Credential ID: {{certificate_id}}
Completion Date: {{completion_date}}
Issuance Date: {{issue_date}}

IN TESTIMONY WHEREOF, WE AFFIX OUR OFFICIAL SIGNATURES:

___________________________             ___________________________
{{trainer_name}}                        {{signatory_name}}
{{trainer_title}}                       {{signatory_title}}
{{company_name}} L&D Academy            {{company_name}}`,
  },
};
