// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: CONFIGURATION-DRIVEN DOCUMENT TYPE REGISTRY
// =============================================================================
// Complete declarative configurations for all 9 Core HR Document Types
// + Prepared Future Extension Types (Policies, L&D, Onboarding, Assessments).
// =============================================================================

import {
  DocumentTypeDefinition,
  DocumentTypeCode,
} from '../../../../../shared/types/document-engine.js';

export const DOCUMENT_TYPE_REGISTRY: Record<DocumentTypeCode, DocumentTypeDefinition> = {
  // ===========================================================================
  // 1. OFFER LETTER
  // ===========================================================================
  OFFER_LETTER: {
    code: 'OFFER_LETTER',
    name: 'Offer Letter',
    category: 'EMPLOYMENT',
    description: 'Formal employment offer specifying title, compensation breakdown, joining date, and corporate policies.',
    iconName: 'FileText',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'candidate', title: 'Candidate Information', description: 'Personal identity, contact data and current location', displayOrder: 1 },
      { key: 'job', title: 'Job & Employment Details', description: 'Designation, department, band grade, and reporting hierarchy', displayOrder: 2 },
      { key: 'compensation', title: 'Compensation Structure', description: 'Base pay, variable bonuses, allowances, and annual CTC', displayOrder: 3 },
      { key: 'terms', title: 'Employment Terms & Policies', description: 'Probation period, notice period, working hours, and covenants', displayOrder: 4 },
      { key: 'signatories', title: 'Signatory Authority', description: 'HR leadership authorization and candidate acceptance receipt', displayOrder: 5 },
    ],
    requiredFields: [
      { key: 'candidateName', label: 'Candidate Full Name', dataType: 'STRING', description: 'Legal name of prospective employee', sectionKey: 'candidate', aiExtractable: true },
      { key: 'email', label: 'Candidate Email', dataType: 'STRING', description: 'Primary email address for dispatch', sectionKey: 'candidate', aiExtractable: true },
      { key: 'jobTitle', label: 'Job Title / Designation', dataType: 'STRING', description: 'Offered professional title', sectionKey: 'job', aiExtractable: true },
      { key: 'department', label: 'Department', dataType: 'STRING', description: 'Assigned functional business unit', sectionKey: 'job', aiExtractable: true },
      { key: 'workLocation', label: 'Work Location / Model', dataType: 'STRING', description: 'Assigned office or remote/hybrid arrangement', sectionKey: 'job', aiExtractable: true },
      { key: 'proposedJoiningDate', label: 'Proposed Joining Date', dataType: 'DATE', description: 'Official first day of employment', sectionKey: 'job', aiExtractable: true },
      { key: 'baseSalary', label: 'Annual Base Salary', dataType: 'CURRENCY', description: 'Fixed base compensation', sectionKey: 'compensation', aiExtractable: true },
      { key: 'totalCtc', label: 'Total Annual Cost-to-Company (CTC)', dataType: 'CURRENCY', description: 'Gross annualized package inclusive of perks', sectionKey: 'compensation', aiExtractable: true },
      { key: 'currency', label: 'Compensation Currency', dataType: 'SELECT', description: 'Monetary standard (e.g. USD, EUR, INR)', sectionKey: 'compensation', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'GBP (£)', value: 'GBP' }, { label: 'INR (₹)', value: 'INR' }], aiExtractable: true },
      { key: 'signatoryName', label: 'Authorized Signatory Name', dataType: 'STRING', description: 'Executive or HR leader issuing offer', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Official designation of signatory', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'phone', label: 'Phone Number', dataType: 'STRING', description: 'Mobile contact number', sectionKey: 'candidate', aiExtractable: true },
      { key: 'address', label: 'Residential Address', dataType: 'STRING', description: 'Permanent or current residence', sectionKey: 'candidate', aiExtractable: true },
      { key: 'bandGrade', label: 'Band / Job Grade', dataType: 'STRING', description: 'Internal job leveling (e.g. L5, Senior II)', sectionKey: 'job', aiExtractable: true },
      { key: 'reportingManagerName', label: 'Reporting Manager Name', dataType: 'STRING', description: 'Direct supervisor name', sectionKey: 'job', aiExtractable: true },
      { key: 'reportingManagerTitle', label: 'Reporting Manager Title', dataType: 'STRING', description: 'Direct supervisor designation', sectionKey: 'job', aiExtractable: true },
      { key: 'employmentType', label: 'Employment Type', dataType: 'SELECT', description: 'Full-time, Part-time, or Contract', sectionKey: 'job', options: [{ label: 'Full-time', value: 'FULL_TIME' }, { label: 'Part-time', value: 'PART_TIME' }, { label: 'Contract', value: 'CONTRACT' }], defaultValue: 'FULL_TIME' },
      { key: 'hraAllowance', label: 'House Rent Allowance (HRA)', dataType: 'CURRENCY', description: 'Annual housing allocation', sectionKey: 'compensation' },
      { key: 'specialAllowances', label: 'Special / Flexi Allowances', dataType: 'CURRENCY', description: 'Wellness, conveyance, or tech allowances', sectionKey: 'compensation' },
      { key: 'performanceBonus', label: 'Annual Target Performance Bonus', dataType: 'CURRENCY', description: 'Variable incentive based on KPI achievement', sectionKey: 'compensation' },
      { key: 'joiningBonus', label: 'Sign-On / Joining Bonus', dataType: 'CURRENCY', description: 'Lump-sum disbursement upon commencement', sectionKey: 'compensation' },
      { key: 'probationPeriod', label: 'Probation Period', dataType: 'STRING', description: 'Evaluation duration (e.g. 90 days, 3 months)', sectionKey: 'terms', defaultValue: '90 days' },
      { key: 'noticePeriod', label: 'Notice Period', dataType: 'STRING', description: 'Separation notice required from either party', sectionKey: 'terms', defaultValue: '30 days' },
      { key: 'workingHoursSummary', label: 'Working Hours & Schedule', dataType: 'STRING', description: 'Standard hours (e.g. 40 hours/week, Mon-Fri 9am-6pm)', sectionKey: 'terms', defaultValue: '40 hours per week (Monday to Friday)' },
      { key: 'offerValidUntil', label: 'Offer Validity Window', dataType: 'DATE', description: 'Cut-off date for candidate signature', sectionKey: 'terms' },
    ],
    placeholders: [
      { tag: '{{candidate_name}}', fieldKey: 'candidateName', description: 'Full legal name of prospective employee', sampleValue: 'Jane Alexandra Doe', isRequired: true },
      { tag: '{{designation}}', fieldKey: 'jobTitle', description: 'Offered job title', sampleValue: 'Lead Platform Architect', isRequired: true },
      { tag: '{{department}}', fieldKey: 'department', description: 'Functional team or department', sampleValue: 'Cloud Infrastructure', isRequired: true },
      { tag: '{{location}}', fieldKey: 'workLocation', description: 'Designated employment location', sampleValue: 'San Francisco, CA (Hybrid)', isRequired: true },
      { tag: '{{joining_date}}', fieldKey: 'proposedJoiningDate', description: 'Start date of employment', sampleValue: 'November 16, 2026', isRequired: true },
      { tag: '{{employment_type}}', fieldKey: 'employmentType', description: 'Employment engagement type', sampleValue: 'Full-time', isRequired: false },
      { tag: '{{salary}}', fieldKey: 'baseSalary', description: 'Annual fixed base pay', sampleValue: '$165,000 USD', isRequired: true },
      { tag: '{{total_ctc}}', fieldKey: 'totalCtc', description: 'Total annual cost-to-company', sampleValue: '$234,750 USD', isRequired: true },
      { tag: '{{probation_period}}', fieldKey: 'probationPeriod', description: 'Probationary term', sampleValue: '90 days', isRequired: false },
      { tag: '{{notice_period}}', fieldKey: 'noticePeriod', description: 'Standard notice period', sampleValue: '30 days', isRequired: false },
      { tag: '{{reporting_manager}}', fieldKey: 'reportingManagerName', description: 'Reporting manager name', sampleValue: 'Marcus Vance', isRequired: false },
      { tag: '{{working_hours}}', fieldKey: 'workingHoursSummary', description: 'Weekly working hours', sampleValue: '40 hours per week', isRequired: false },
      { tag: '{{offer_valid_until}}', fieldKey: 'offerValidUntil', description: 'Offer expiration date', sampleValue: 'October 15, 2026', isRequired: false },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Authorized executive name', sampleValue: 'Sarah Jenkins', isRequired: true },
      { tag: '{{signatory_title}}', fieldKey: 'signatoryTitle', description: 'Authorized executive title', sampleValue: 'VP of Global Talent', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_OFFER_BASE', name: 'Positive Base Salary', description: 'Base salary must exceed zero', severity: 'ERROR', validate: 'baseSalary > 0', errorMessage: 'Base salary must be greater than zero.' },
      { id: 'VAL_OFFER_CTC', name: 'CTC Consistency', description: 'Total CTC must be at least equal to base salary', severity: 'ERROR', validate: 'totalCtc >= baseSalary', errorMessage: 'Total CTC cannot be less than the base salary.' },
      { id: 'VAL_OFFER_JOINING', name: 'Future Joining Date', description: 'Joining date cannot be in the past', severity: 'WARNING', validate: 'proposedJoiningDate >= currentDate', errorMessage: 'Proposed joining date is scheduled in the past.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN'],
      steps: [
        { status: 'DRAFT_AI', label: 'AI Ingestion Draft', description: 'Initial parameters extracted or generated by AI assistant', order: 1 },
        { status: 'HR_REVIEW', label: 'HR Terms Review', description: 'HR personnel reviews and confirms parameters; overrides logged', order: 2 },
        { status: 'PENDING_APPROVAL', label: 'Approver Review', description: 'Compensation committee or department head review', order: 3 },
        { status: 'APPROVED', label: 'Authorized', description: 'Approved for formal compilation and candidate dispatch', order: 4 },
        { status: 'ISSUED', label: 'Issued to Candidate', description: 'Tamper-evident legal PDF generated and dispatched', order: 5 },
        { status: 'ACCEPTED', label: 'Accepted by Candidate', description: 'Formally signed and accepted by candidate', order: 6 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: true,
      supportsDocumentExtraction: true,
      extractionTasks: ['CANDIDATE_DATA_EXTRACTION', 'COMPENSATION_ANOMALY_DETECTION'],
      draftingAssistanceTasks: [
        { taskCode: 'welcome_note', label: 'Welcome Note', description: 'Draft warm introductory greeting' },
        { taskCode: 'job_description', label: 'Role Duties', description: 'Outline primary responsibilities' },
        { taskCode: 'custom_clauses', label: 'Restrictive Covenants', description: 'Draft IP, NDA and non-solicitation clauses' },
      ],
      confidenceThreshold: 0.85,
    },
    qualityChecks: [
      { id: 'QC_OFFER_BAND', title: 'Salary Band Compliance', description: 'Checks if proposed compensation falls within approved grade limits', category: 'COMPENSATION', isBlocking: false },
      { id: 'QC_OFFER_DATE', title: 'Weekend Commencement Guard', description: 'Alerts if proposed joining date falls on a weekend or public holiday', category: 'TIMELINE', isBlocking: false },
      { id: 'QC_OFFER_PARITY', title: 'Department Internal Parity', description: 'Compares proposed package with current department median', category: 'COMPENSATION', isBlocking: false },
    ],
  },

  // ===========================================================================
  // 2. INTERNSHIP LETTER
  // ===========================================================================
  INTERNSHIP_LETTER: {
    code: 'INTERNSHIP_LETTER',
    name: 'Internship Letter',
    category: 'EMPLOYMENT',
    description: 'Appointment letter for academic interns detailing mentorship, stipend, learning objectives, and project term.',
    iconName: 'GraduationCap',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'intern', title: 'Intern Profile', description: 'Student credentials and academic affiliation', displayOrder: 1 },
      { key: 'schedule', title: 'Duration & Schedule', description: 'Internship start, conclusion, and weekly commitment', displayOrder: 2 },
      { key: 'stipend', title: 'Stipend & Learning Perks', description: 'Financial allowance and academic credit arrangement', displayOrder: 3 },
      { key: 'mentorship', title: 'Mentorship & Projects', description: 'Supervisory assignment and evaluation criteria', displayOrder: 4 },
      { key: 'signatories', title: 'Authorization', description: 'HR authorization and university acknowledgment', displayOrder: 5 },
    ],
    requiredFields: [
      { key: 'internName', label: 'Intern Full Name', dataType: 'STRING', description: 'Legal name of appointed student/intern', sectionKey: 'intern', aiExtractable: true },
      { key: 'internEmail', label: 'Email Address', dataType: 'STRING', description: 'Primary contact email', sectionKey: 'intern', aiExtractable: true },
      { key: 'internshipRole', label: 'Internship Role / Title', dataType: 'STRING', description: 'Assigned project role (e.g. Software Engineering Intern)', sectionKey: 'schedule', aiExtractable: true },
      { key: 'department', label: 'Host Department', dataType: 'STRING', description: 'Department hosting the internship', sectionKey: 'schedule', aiExtractable: true },
      { key: 'startDate', label: 'Internship Start Date', dataType: 'DATE', description: 'Commencement date', sectionKey: 'schedule' },
      { key: 'endDate', label: 'Internship End Date', dataType: 'DATE', description: 'Scheduled conclusion date', sectionKey: 'schedule' },
      { key: 'stipendAmount', label: 'Monthly Stipend Amount', dataType: 'CURRENCY', description: 'Monthly learning allowance', sectionKey: 'stipend' },
      { key: 'currency', label: 'Stipend Currency', dataType: 'SELECT', description: 'Monetary standard', sectionKey: 'stipend', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'INR (₹)', value: 'INR' }] },
      { key: 'workingHoursPerWeek', label: 'Hours Per Week', dataType: 'NUMBER', description: 'Expected commitment (e.g. 20 for part-time, 40 for summer)', sectionKey: 'schedule', defaultValue: 40 },
      { key: 'mentorName', label: 'Assigned Mentor / Supervisor', dataType: 'STRING', description: 'Senior team member providing guidance', sectionKey: 'mentorship' },
      { key: 'signatoryName', label: 'Authorized Signatory Name', dataType: 'STRING', description: 'HR Leader issuing internship', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Official designation of signatory', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'collegeOrUniversity', label: 'University / Institute Name', dataType: 'STRING', description: 'Current educational institution', sectionKey: 'intern', aiExtractable: true },
      { key: 'degreeProgram', label: 'Degree / Major', dataType: 'STRING', description: 'Degree being pursued (e.g. B.Tech Computer Science)', sectionKey: 'intern', aiExtractable: true },
      { key: 'durationSummary', label: 'Internship Duration Summary', dataType: 'STRING', description: 'e.g. 3 Months Full-Time Summer Track', sectionKey: 'schedule', defaultValue: '3 Months' },
      { key: 'mentorTitle', label: 'Mentor Designation', dataType: 'STRING', description: 'Professional title of mentor', sectionKey: 'mentorship' },
      { key: 'stipendPaymentCycle', label: 'Stipend Payment Cycle', dataType: 'STRING', description: 'Disbursement frequency (e.g. Monthly on the 30th)', sectionKey: 'stipend', defaultValue: 'Monthly' },
      { key: 'workingArrangement', label: 'Working Arrangement', dataType: 'STRING', description: 'Remote, In-person, or Hybrid schedule', sectionKey: 'schedule', defaultValue: 'Hybrid (3 days onsite)' },
      { key: 'learningObjectives', label: 'Core Learning Objectives', dataType: 'TEXTAREA', description: 'Summary of skills and projects to be mastered', sectionKey: 'mentorship' },
      { key: 'workLocation', label: 'Work Mode / Location', dataType: 'STRING', description: 'On-site, Remote, or Hybrid arrangement', sectionKey: 'schedule', defaultValue: 'Remote / Hybrid' },
    ],
    placeholders: [
      { tag: '{{intern_name}}', fieldKey: 'internName', description: 'Full legal name of the intern', sampleValue: 'Alex Morgan', isRequired: true },
      { tag: '{{internship_role}}', fieldKey: 'internshipRole', description: 'Intern role or project track', sampleValue: 'Product Design Intern', isRequired: true },
      { tag: '{{department}}', fieldKey: 'department', description: 'Hosting team', sampleValue: 'Design & UX Research', isRequired: true },
      { tag: '{{start_date}}', fieldKey: 'startDate', description: 'Commencement date', sampleValue: 'June 1, 2026', isRequired: true },
      { tag: '{{end_date}}', fieldKey: 'endDate', description: 'Conclusion date', sampleValue: 'August 31, 2026', isRequired: true },
      { tag: '{{duration}}', fieldKey: 'durationSummary', description: 'Program duration', sampleValue: '3 Months', isRequired: false },
      { tag: '{{stipend_amount}}', fieldKey: 'stipendAmount', description: 'Monthly allowance', sampleValue: '$3,500 USD', isRequired: true },
      { tag: '{{mentor_name}}', fieldKey: 'mentorName', description: 'Designated mentor', sampleValue: 'Elena Rostova', isRequired: true },
      { tag: '{{working_hours}}', fieldKey: 'workingHoursPerWeek', description: 'Weekly hours commitment', sampleValue: '40 hours per week', isRequired: false },
      { tag: '{{university}}', fieldKey: 'collegeOrUniversity', description: 'Academic institution', sampleValue: 'Stanford University', isRequired: false },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Authorized HR signatory', sampleValue: 'Sarah Jenkins', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_INTERN_DATES', name: 'Valid Duration', description: 'End date must occur after start date', severity: 'ERROR', validate: 'endDate > startDate', errorMessage: 'Internship conclusion date must be later than the start date.' },
      { id: 'VAL_INTERN_STIPEND', name: 'Non-Negative Stipend', description: 'Stipend amount cannot be negative', severity: 'ERROR', validate: 'stipendAmount >= 0', errorMessage: 'Stipend amount cannot be less than zero.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED', 'DECLINED', 'EXPIRED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Intern Draft', description: 'Draft generated from candidate application and department request', order: 1 },
        { status: 'HR_REVIEW', label: 'Mentor & HR Confirmation', description: 'Mentor assignment and stipend confirmed by HR', order: 2 },
        { status: 'APPROVED', label: 'Authorized', description: 'Approved for university coordination and intern dispatch', order: 3 },
        { status: 'ISSUED', label: 'Dispatched to Intern', description: 'Issued with digital letterhead and verification seal', order: 4 },
        { status: 'ACCEPTED', label: 'Acknowledged & Accepted', description: 'Signed and returned by student/intern', order: 5 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: true,
      supportsDocumentExtraction: true,
      extractionTasks: ['INTERN_PROFILE_EXTRACTION'],
      draftingAssistanceTasks: [
        { taskCode: 'mentorship_plan', label: 'Mentorship Plan', description: 'Draft structured milestone objectives' },
        { taskCode: 'academic_ip', label: 'Academic Project IP', description: 'Draft proprietary code and project confidentiality terms' },
      ],
      confidenceThreshold: 0.85,
    },
    qualityChecks: [
      { id: 'QC_INTERN_TERM', title: 'Internship Term Check', description: 'Ensures duration conforms to 1–6 month guidelines', category: 'TIMELINE', isBlocking: false },
    ],
  },

  // ===========================================================================
  // 3. INCREMENT LETTER
  // ===========================================================================
  INCREMENT_LETTER: {
    code: 'INCREMENT_LETTER',
    name: 'Increment Letter',
    category: 'COMPENSATION',
    description: 'Annual appraisal or promotion notification revising employee compensation, title, and performance recognition.',
    iconName: 'TrendingUp',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'employee', title: 'Employee Credentials', description: 'Staff identity, ID number, and current designation', displayOrder: 1 },
      { key: 'appraisal', title: 'Appraisal Summary', description: 'Cycle review rating and performance commendation', displayOrder: 2 },
      { key: 'compensation', title: 'Revised Compensation Package', description: 'Previous vs new compensation breakdown and percentage change', displayOrder: 3 },
      { key: 'signatories', title: 'Executive Endorsement', description: 'Management authorization and congratulations', displayOrder: 4 },
    ],
    requiredFields: [
      { key: 'employeeName', label: 'Employee Full Name', dataType: 'STRING', description: 'Legal name of existing employee', sectionKey: 'employee', aiExtractable: true },
      { key: 'employeeId', label: 'Employee ID', dataType: 'STRING', description: 'Corporate staff identification code', sectionKey: 'employee', aiExtractable: true },
      { key: 'currentDesignation', label: 'Current Designation', dataType: 'STRING', description: 'Job title prior to revision', sectionKey: 'employee' },
      { key: 'department', label: 'Department', dataType: 'STRING', description: 'Functional business unit', sectionKey: 'employee' },
      { key: 'effectiveDate', label: 'Effective Date', dataType: 'DATE', description: 'Date the new compensation becomes active', sectionKey: 'compensation' },
      { key: 'previousBaseSalary', label: 'Previous Annual Base Salary', dataType: 'CURRENCY', description: 'Base pay prior to adjustment', sectionKey: 'compensation' },
      { key: 'newBaseSalary', label: 'New Annual Base Salary', dataType: 'CURRENCY', description: 'Adjusted base compensation', sectionKey: 'compensation' },
      { key: 'previousTotalCtc', label: 'Previous Total CTC', dataType: 'CURRENCY', description: 'Total CTC before appraisal', sectionKey: 'compensation' },
      { key: 'newTotalCtc', label: 'New Total CTC', dataType: 'CURRENCY', description: 'Revised annualized total package', sectionKey: 'compensation' },
      { key: 'currency', label: 'Currency', dataType: 'SELECT', description: 'Monetary standard', sectionKey: 'compensation', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'INR (₹)', value: 'INR' }] },
      { key: 'signatoryName', label: 'Authorized Signatory Name', dataType: 'STRING', description: 'CPO or HR Executive', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Executive designation', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'revisedDesignation', label: 'Promoted / Revised Designation', dataType: 'STRING', description: 'Updated title if accompanied by a promotion', sectionKey: 'employee' },
      { key: 'performanceRating', label: 'Performance Rating', dataType: 'STRING', description: 'Appraisal evaluation score (e.g. Exceeds Expectations)', sectionKey: 'appraisal' },
      { key: 'incrementPercentage', label: 'Calculated Increment %', dataType: 'NUMBER', description: 'Percentage increase over previous package', sectionKey: 'compensation' },
      { key: 'appraisalCycle', label: 'Review Cycle Period', dataType: 'STRING', description: 'Evaluated cycle (e.g. FY 2025-2026)', sectionKey: 'appraisal', defaultValue: 'FY 2025-2026' },
      { key: 'meritBonus', label: 'One-Time Merit Award / Bonus', dataType: 'CURRENCY', description: 'Discretionary performance recognition payment', sectionKey: 'compensation' },
    ],
    placeholders: [
      { tag: '{{employee_name}}', fieldKey: 'employeeName', description: 'Full employee legal name', sampleValue: 'Liam O’Connor', isRequired: true },
      { tag: '{{employee_id}}', fieldKey: 'employeeId', description: 'Corporate staff ID', sampleValue: 'EMP-4821', isRequired: true },
      { tag: '{{designation}}', fieldKey: 'currentDesignation', description: 'Current designation', sampleValue: 'Senior DevOps Specialist', isRequired: true },
      { tag: '{{revised_designation}}', fieldKey: 'revisedDesignation', description: 'Promoted title if applicable', sampleValue: 'Lead Infrastructure Architect', isRequired: false },
      { tag: '{{effective_date}}', fieldKey: 'effectiveDate', description: 'Effective date of increment', sampleValue: 'April 1, 2026', isRequired: true },
      { tag: '{{previous_salary}}', fieldKey: 'previousBaseSalary', description: 'Prior base salary', sampleValue: '$140,000 USD', isRequired: true },
      { tag: '{{new_salary}}', fieldKey: 'newBaseSalary', description: 'New base salary', sampleValue: '$165,000 USD', isRequired: true },
      { tag: '{{previous_ctc}}', fieldKey: 'previousTotalCtc', description: 'Prior total CTC', sampleValue: '$165,000 USD', isRequired: true },
      { tag: '{{new_ctc}}', fieldKey: 'newTotalCtc', description: 'Revised total CTC', sampleValue: '$195,000 USD', isRequired: true },
      { tag: '{{increment_pct}}', fieldKey: 'incrementPercentage', description: 'Percentage increase', sampleValue: '17.8%', isRequired: false },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Executive name', sampleValue: 'Sarah Jenkins', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_INC_POSITIVE', name: 'Positive Revision', description: 'New salary should normally be higher than previous salary', severity: 'WARNING', validate: 'newBaseSalary > previousBaseSalary', errorMessage: 'Revised salary is not greater than the previous salary.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED', 'REVISED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Appraisal Input Draft', description: 'Salary data synced from annual appraisal cycle', order: 1 },
        { status: 'HR_REVIEW', label: 'Compensation Audit', description: 'Compensation committee verifies percentage increase against departmental budget', order: 2 },
        { status: 'APPROVED', label: 'Leadership Approval', description: 'Executive endorsement logged', order: 3 },
        { status: 'ISSUED', label: 'Delivered to Staff', description: 'Official PDF issued to employee portal', order: 4 },
        { status: 'ACCEPTED', label: 'Acknowledged', description: 'Employee receives and acknowledges appraisal letter', order: 5 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['APPRAISAL_DATA_EXTRACTION'],
      draftingAssistanceTasks: [
        { taskCode: 'congratulatory_note', label: 'Commendation Note', description: 'Draft personalized appreciation for outstanding contributions' },
      ],
      confidenceThreshold: 0.9,
    },
    qualityChecks: [
      { id: 'QC_INC_CALC', title: 'Percentage Consistency Check', description: 'Validates mathematical integrity between previous and revised values', category: 'COMPENSATION', isBlocking: true },
    ],
  },

  // ===========================================================================
  // 4. TERMINATION LETTER
  // ===========================================================================
  TERMINATION_LETTER: {
    code: 'TERMINATION_LETTER',
    name: 'Termination Letter',
    category: 'EXIT',
    description: 'Formal separation notice documenting grounds, notice settlement, handover requirements, and post-employment obligations.',
    iconName: 'UserMinus',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'employee', title: 'Employee Details', description: 'Staff credentials and role identification', displayOrder: 1 },
      { key: 'grounds', title: 'Separation Notice & Grounds', description: 'Classification of separation, statutory notice, and rationale', displayOrder: 2 },
      { key: 'handover', title: 'Last Working Day & Assets', description: 'Final date of duty, project handover, and company asset returns', displayOrder: 3 },
      { key: 'settlement', title: 'Severance & Benefit Transition', description: 'Severance package, insurance continuance, and final accounts', displayOrder: 4 },
      { key: 'legal', title: 'Restrictive Covenants & NDA', description: 'Reaffirmation of non-disclosure and intellectual property protection', displayOrder: 5 },
      { key: 'signatories', title: 'Signatures', description: 'HR Director authorization', displayOrder: 6 },
    ],
    requiredFields: [
      { key: 'employeeName', label: 'Employee Full Name', dataType: 'STRING', description: 'Legal name of affected staff', sectionKey: 'employee' },
      { key: 'employeeId', label: 'Employee ID', dataType: 'STRING', description: 'Corporate identification code', sectionKey: 'employee' },
      { key: 'designation', label: 'Designation / Title', dataType: 'STRING', description: 'Official role held', sectionKey: 'employee' },
      { key: 'department', label: 'Department', dataType: 'STRING', description: 'Functional team', sectionKey: 'employee' },
      { key: 'terminationNoticeDate', label: 'Notice Delivery Date', dataType: 'DATE', description: 'Date notification is delivered', sectionKey: 'grounds' },
      { key: 'lastWorkingDay', label: 'Effective Date / Last Working Day', dataType: 'DATE', description: 'Effective final date of active employment', sectionKey: 'handover' },
      { key: 'reasonForSeparation', label: 'Grounds / Category of Separation', dataType: 'SELECT', description: 'Legal basis for termination', sectionKey: 'grounds', options: [{ label: 'Organizational Restructuring / Redundancy', value: 'REDUNDANCY' }, { label: 'Performance Below Requirement', value: 'PERFORMANCE' }, { label: 'Unsuccessful Probationary Period', value: 'PROBATION' }, { label: 'Misconduct / Policy Violation', value: 'MISCONDUCT' }, { label: 'Mutual Separation Agreement', value: 'MUTUAL' }] },
      { key: 'noticeStatus', label: 'Notice / Pay Terms', dataType: 'SELECT', description: 'How notice obligations are fulfilled', sectionKey: 'grounds', options: [{ label: 'Notice Period to be Worked', value: 'WORKED' }, { label: 'Payment in Lieu of Notice (PILON)', value: 'PAYMENT_IN_LIEU' }, { label: 'Notice Period Waived by Mutual Consent', value: 'WAIVED' }] },
      { key: 'signatoryName', label: 'Authorized Signatory Name', dataType: 'STRING', description: 'HR Executive signing notice', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Executive designation', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'severanceAmount', label: 'Severance Allowance Amount', dataType: 'CURRENCY', description: 'Ex-gratia or statutory severance compensation', sectionKey: 'settlement' },
      { key: 'finalSettlementReference', label: 'Final Settlement Reference', dataType: 'STRING', description: 'Reference ID or schedule of forthcoming FNF settlement statement', sectionKey: 'settlement' },
      { key: 'currency', label: 'Currency', dataType: 'SELECT', description: 'Currency standard', sectionKey: 'settlement', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'INR (₹)', value: 'INR' }] },
      { key: 'assetReturnDeadline', label: 'Asset Return Deadline', dataType: 'DATE', description: 'Cut-off for return of laptop, keycard and devices', sectionKey: 'handover' },
      { key: 'confidentialityReaffirmation', label: 'Confidentiality Reaffirmation', dataType: 'TEXTAREA', description: 'Reaffirmation of non-compete and trade secret obligations', sectionKey: 'legal', defaultValue: 'You remain bound by confidentiality, non-solicitation, and proprietary information obligations signed upon commencement.' },
    ],
    placeholders: [
      { tag: '{{employee_name}}', fieldKey: 'employeeName', description: 'Full employee legal name', sampleValue: 'David Miller', isRequired: true },
      { tag: '{{employee_id}}', fieldKey: 'employeeId', description: 'Staff ID', sampleValue: 'EMP-1904', isRequired: true },
      { tag: '{{designation}}', fieldKey: 'designation', description: 'Official designation', sampleValue: 'Quality Assurance Analyst', isRequired: true },
      { tag: '{{termination_date}}', fieldKey: 'terminationNoticeDate', description: 'Notice issuance date', sampleValue: 'October 1, 2026', isRequired: true },
      { tag: '{{last_working_day}}', fieldKey: 'lastWorkingDay', description: 'Final day of service', sampleValue: 'October 31, 2026', isRequired: true },
      { tag: '{{reason}}', fieldKey: 'reasonForSeparation', description: 'Grounds of separation', sampleValue: 'Redundancy due to department restructuring', isRequired: true },
      { tag: '{{severance_amount}}', fieldKey: 'severanceAmount', description: 'Severance payment', sampleValue: '$12,500 USD', isRequired: false },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Authorized executive', sampleValue: 'Sarah Jenkins', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_TERM_DATES', name: 'Notice Timeline', description: 'Last working day must be on or after notice delivery date', severity: 'ERROR', validate: 'lastWorkingDay >= terminationNoticeDate', errorMessage: 'Last working day cannot precede notice issuance date.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ISSUED', 'WITHDRAWN'],
      steps: [
        { status: 'DRAFT_AI', label: 'Notice Drafted', description: 'Draft prepared with objective grounds', order: 1 },
        { status: 'HR_REVIEW', label: 'Legal & HR Review', description: 'Vetted by Employment Counsel and HR Director', order: 2 },
        { status: 'PENDING_APPROVAL', label: 'Executive Authorization', description: 'VP HR and Department Executive sign-off', order: 3 },
        { status: 'APPROVED', label: 'Authorized', description: 'Finalized for formal notice service', order: 4 },
        { status: 'ISSUED', label: 'Notice Served', description: 'Delivered in writing with audit acknowledgment', order: 5 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['TERMINATION_TERMS_REVIEW'],
      draftingAssistanceTasks: [
        { taskCode: 'neutral_statement', label: 'Objective Neutral Wording', description: 'Ensure legal neutrality and objective phrasing to minimize legal risk' },
        { taskCode: 'reaffirm_covenants', label: 'Post-Employment Covenants', description: 'Draft non-disclosure and proprietary information reaffirmation' },
      ],
      confidenceThreshold: 0.95,
    },
    qualityChecks: [
      { id: 'QC_TERM_LEGAL', title: 'Legal Risk & Compliance Check', description: 'Audits termination text for inflammatory or discriminatory wording', category: 'LEGAL', isBlocking: true },
    ],
  },

  // ===========================================================================
  // 5. EXPERIENCE LETTER
  // ===========================================================================
  EXPERIENCE_LETTER: {
    code: 'EXPERIENCE_LETTER',
    name: 'Experience Letter',
    category: 'EXIT',
    description: 'Official corporate certificate confirming tenure, designations held, performance remarks, and duties fulfilled.',
    iconName: 'Award',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'employee', title: 'Employee Credentials', description: 'Identity, staff number, and corporate record', displayOrder: 1 },
      { key: 'tenure', title: 'Tenure & Roles Held', description: 'Date of commencement, separation date, and designations', displayOrder: 2 },
      { key: 'conduct', title: 'Conduct & Appraisal', description: 'Professionalism endorsement and character remarks', displayOrder: 3 },
      { key: 'signatories', title: 'Corporate Attestation', description: 'Authorized signatory endorsement and corporate seal', displayOrder: 4 },
    ],
    requiredFields: [
      { key: 'employeeName', label: 'Employee Full Name', dataType: 'STRING', description: 'Legal name of former staff', sectionKey: 'employee' },
      { key: 'employeeId', label: 'Employee ID', dataType: 'STRING', description: 'Staff identification code', sectionKey: 'employee' },
      { key: 'dateOfJoining', label: 'Date of Joining', dataType: 'DATE', description: 'First date of employment with organization', sectionKey: 'tenure' },
      { key: 'dateOfRelieving', label: 'Date of Relieving / Last Working Date', dataType: 'DATE', description: 'Final date of service', sectionKey: 'tenure' },
      { key: 'lastDesignationHeld', label: 'Last Designation Held', dataType: 'STRING', description: 'Title at time of departure', sectionKey: 'tenure' },
      { key: 'department', label: 'Department', dataType: 'STRING', description: 'Department served', sectionKey: 'tenure' },
      { key: 'issueDate', label: 'Certificate Issue Date', dataType: 'DATE', description: 'Date of certificate creation', sectionKey: 'signatories' },
      { key: 'signatoryName', label: 'Authorized Signatory Name', dataType: 'STRING', description: 'HR Leader signing certificate', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Official designation', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'conductRemarks', label: 'Conduct & Performance Endorsement', dataType: 'TEXTAREA', description: 'Standard recommendation text', sectionKey: 'conduct', defaultValue: 'During their tenure with our company, their conduct and performance were found to be exemplary and professional.' },
      { key: 'primaryResponsibilitiesSummary', label: 'Summary of Key Responsibilities', dataType: 'TEXTAREA', description: 'Overview of scope, deliverables, and role description', sectionKey: 'tenure' },
      { key: 'majorAccomplishments', label: 'Major Accomplishments / Projects', dataType: 'TEXTAREA', description: 'Key milestones or notable projects led', sectionKey: 'tenure' },
    ],
    placeholders: [
      { tag: '{{employee_name}}', fieldKey: 'employeeName', description: 'Full legal name', sampleValue: 'Rachel Zane', isRequired: true },
      { tag: '{{employee_id}}', fieldKey: 'employeeId', description: 'Staff ID', sampleValue: 'EMP-3041', isRequired: true },
      { tag: '{{joining_date}}', fieldKey: 'dateOfJoining', description: 'Commencement date', sampleValue: 'March 15, 2021', isRequired: true },
      { tag: '{{relieving_date}}', fieldKey: 'dateOfRelieving', description: 'Separation date', sampleValue: 'September 30, 2026', isRequired: true },
      { tag: '{{designation}}', fieldKey: 'lastDesignationHeld', description: 'Final title held', sampleValue: 'Senior Corporate Counsel', isRequired: true },
      { tag: '{{department}}', fieldKey: 'department', description: 'Department', sampleValue: 'Legal & Compliance', isRequired: true },
      { tag: '{{issue_date}}', fieldKey: 'issueDate', description: 'Date certificate is printed', sampleValue: 'October 1, 2026', isRequired: true },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Executive name', sampleValue: 'Sarah Jenkins', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_EXP_DATES', name: 'Tenure Consistency', description: 'Relieving date must be after joining date', severity: 'ERROR', validate: 'dateOfRelieving >= dateOfJoining', errorMessage: 'Relieving date cannot precede joining date.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ISSUED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Draft Prepared', description: 'Tenure dates verified against HR database', order: 1 },
        { status: 'HR_REVIEW', label: 'HR Verification', description: 'Designation history and conduct remarks audited', order: 2 },
        { status: 'APPROVED', label: 'Certified', description: 'Corporate seal attestation approved', order: 3 },
        { status: 'ISSUED', label: 'Issued to Employee', description: 'Official experience certificate generated with digital tamper seal', order: 4 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['TENURE_HISTORY_EXTRACTION'],
      draftingAssistanceTasks: [
        { taskCode: 'role_endorsement', label: 'Role Endorsement', description: 'Draft professional commendation of leadership and accomplishments' },
      ],
      confidenceThreshold: 0.9,
    },
    qualityChecks: [
      { id: 'QC_EXP_TENURE', title: 'Tenure Arithmetic Verification', description: 'Validates accurate calculation of completed years and months of service', category: 'TIMELINE', isBlocking: false },
    ],
  },

  // ===========================================================================
  // 6. RELIEVING LETTER
  // ===========================================================================
  RELIEVING_LETTER: {
    code: 'RELIEVING_LETTER',
    name: 'Relieving Letter',
    category: 'EXIT',
    description: 'Formal corporate release letter confirming acceptance of resignation and complete clearance of duties.',
    iconName: 'CheckCircle',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'employee', title: 'Employee Record', description: 'Employee identification and designation', displayOrder: 1 },
      { key: 'discharge', title: 'Formal Discharge', description: 'Resignation date, effective relieving date, and notice fulfillment', displayOrder: 2 },
      { key: 'clearance', title: 'Clearance & Good Standing', description: 'Handover verification and clearance of liabilities', displayOrder: 3 },
      { key: 'signatories', title: 'Signatures', description: 'HR Department authorization', displayOrder: 4 },
    ],
    requiredFields: [
      { key: 'employeeName', label: 'Employee Full Name', dataType: 'STRING', description: 'Legal name of departing employee', sectionKey: 'employee' },
      { key: 'employeeId', label: 'Employee ID', dataType: 'STRING', description: 'Staff identification number', sectionKey: 'employee' },
      { key: 'designation', label: 'Designation', dataType: 'STRING', description: 'Job title held upon resignation', sectionKey: 'employee' },
      { key: 'department', label: 'Department', dataType: 'STRING', description: 'Department', sectionKey: 'employee' },
      { key: 'resignationDate', label: 'Resignation Tendered Date', dataType: 'DATE', description: 'Date resignation was officially submitted', sectionKey: 'discharge' },
      { key: 'lastWorkingDay', label: 'Last Working Day', dataType: 'DATE', description: 'Final date worked in office', sectionKey: 'discharge' },
      { key: 'relievingDate', label: 'Effective Relieving Date', dataType: 'DATE', description: 'Final date and time of release from corporate service', sectionKey: 'discharge' },
      { key: 'clearanceStatus', label: 'Departmental Clearance Status', dataType: 'SELECT', description: 'Confirmation of full handover', sectionKey: 'clearance', options: [{ label: 'Fully Completed & Verified', value: 'COMPLETED' }, { label: 'Conditional Handover', value: 'CONDITIONAL' }] },
      { key: 'issueDate', label: 'Letter Issue Date', dataType: 'DATE', description: 'Date this release letter is signed', sectionKey: 'signatories' },
      { key: 'signatoryName', label: 'Authorized Signatory Name', dataType: 'STRING', description: 'HR Leader releasing employee', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Official designation', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'noticePeriodServed', label: 'Notice Period Compliance', dataType: 'SELECT', description: 'Notice fulfillment status', sectionKey: 'discharge', options: [{ label: 'Full Notice Period Served', value: 'SERVED' }, { label: 'Shortfall Adjusted / Deducted', value: 'SHORTFALL_ADJUSTED' }, { label: 'Notice Waived by Management', value: 'WAIVED' }] },
      { key: 'goodwillStatement', label: 'Corporate Goodwill Statement', dataType: 'TEXTAREA', description: 'Official appreciation and wishing success in future endeavors', sectionKey: 'clearance', defaultValue: 'We thank you for your contributions and wish you every success in your future professional endeavors.' },
    ],
    placeholders: [
      { tag: '{{employee_name}}', fieldKey: 'employeeName', description: 'Employee legal name', sampleValue: 'James Wilson', isRequired: true },
      { tag: '{{employee_id}}', fieldKey: 'employeeId', description: 'Employee ID', sampleValue: 'EMP-9021', isRequired: true },
      { tag: '{{designation}}', fieldKey: 'designation', description: 'Designation', sampleValue: 'Senior Systems Engineer', isRequired: true },
      { tag: '{{resignation_date}}', fieldKey: 'resignationDate', description: 'Resignation date', sampleValue: 'August 15, 2026', isRequired: true },
      { tag: '{{last_working_day}}', fieldKey: 'lastWorkingDay', description: 'Last working day', sampleValue: 'September 15, 2026', isRequired: true },
      { tag: '{{relieving_date}}', fieldKey: 'relievingDate', description: 'Relieving date', sampleValue: 'September 15, 2026', isRequired: true },
      { tag: '{{issue_date}}', fieldKey: 'issueDate', description: 'Letter issue date', sampleValue: 'September 16, 2026', isRequired: true },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Authorized executive', sampleValue: 'Sarah Jenkins', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_REL_DATES', name: 'Relieving After Resignation', description: 'Relieving date must follow or match resignation date', severity: 'ERROR', validate: 'relievingDate >= resignationDate', errorMessage: 'Relieving date cannot be earlier than resignation date.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ISSUED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Exit Request Initiated', description: 'Resignation registered and exit timeline configured', order: 1 },
        { status: 'HR_REVIEW', label: 'Clearance Audit', description: 'Departmental sign-offs verified (IT, Facilities, Admin)', order: 2 },
        { status: 'APPROVED', label: 'Discharge Approved', description: 'Approved by Head of HR Operations', order: 3 },
        { status: 'ISSUED', label: 'Relieving Dispatched', description: 'Official relieving letter issued to departing employee', order: 4 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['EXIT_CLEARANCE_VERIFICATION'],
      draftingAssistanceTasks: [
        { taskCode: 'release_goodwill', label: 'Goodwill Release Wording', description: 'Draft customary best-wishes and formal release of corporate duties' },
      ],
      confidenceThreshold: 0.9,
    },
    qualityChecks: [
      { id: 'QC_REL_CLEARANCE', title: 'Asset Clearance Sign-Off', description: 'Verifies all departments (IT, Finance, Admin) have completed clearance', category: 'COMPLIANCE', isBlocking: true },
    ],
  },

  // ===========================================================================
  // 7. FULL & FINAL SETTLEMENT (FNF) STATEMENT
  // ===========================================================================
  FNF_SETTLEMENT: {
    code: 'FNF_SETTLEMENT',
    name: 'Full & Final Settlement Statement',
    category: 'COMPENSATION',
    description: 'Comprehensive financial accounting of outstanding earnings, leave encashments, gratuity, and tax/asset deductions upon separation.',
    iconName: 'Receipt',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'employee', title: 'Employee Credentials', description: 'Identity, tenure, and department', displayOrder: 1 },
      { key: 'earnings', title: 'Gross Earnings & Dues', description: 'Unpaid salary, accrued leave encashment, gratuity, and bonus', displayOrder: 2 },
      { key: 'deductions', title: 'Deductions & Recoveries', description: 'Tax deductions (TDS/PAYE), notice shortfall, and loans', displayOrder: 3 },
      { key: 'net', title: 'Net Payable & Disbursement', description: 'Final net disbursement amount, bank routing, and release date', displayOrder: 4 },
      { key: 'signatories', title: 'Signatures & Receipt', description: 'Finance certification and employee acknowledgment receipt', displayOrder: 5 },
    ],
    requiredFields: [
      { key: 'employeeName', label: 'Employee Full Name', dataType: 'STRING', description: 'Legal name of separating staff', sectionKey: 'employee' },
      { key: 'employeeId', label: 'Employee ID', dataType: 'STRING', description: 'Staff ID', sectionKey: 'employee' },
      { key: 'designation', label: 'Designation', dataType: 'STRING', description: 'Role', sectionKey: 'employee' },
      { key: 'dateOfJoining', label: 'Date of Joining', dataType: 'DATE', description: 'Employment start', sectionKey: 'employee' },
      { key: 'lastWorkingDay', label: 'Last Working Day', dataType: 'DATE', description: 'Final day on payroll', sectionKey: 'employee' },
      { key: 'settlementDate', label: 'Settlement Statement Date', dataType: 'DATE', description: 'Date statement is computed', sectionKey: 'net' },
      { key: 'currency', label: 'Currency', dataType: 'SELECT', description: 'Monetary standard', sectionKey: 'net', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'INR (₹)', value: 'INR' }] },
      { key: 'payableEarningsTotal', label: 'Total Gross Earnings (A)', dataType: 'CURRENCY', description: 'Sum of all earnings, encashments, and bonuses', sectionKey: 'earnings' },
      { key: 'deductionsTotal', label: 'Total Deductions (B)', dataType: 'CURRENCY', description: 'Sum of taxes, recoveries, and liabilities', sectionKey: 'deductions' },
      { key: 'netPayableAmount', label: 'Net Payable Amount (A - B)', dataType: 'CURRENCY', description: 'Net amount disbursed to employee', sectionKey: 'net' },
      { key: 'signatoryName', label: 'Authorized Finance Signatory', dataType: 'STRING', description: 'Payroll / Finance Manager', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Signatory Title', dataType: 'STRING', description: 'Designation', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'earnedSalaryDays', label: 'Unpaid Days Earned Salary', dataType: 'CURRENCY', description: 'Salary for partial final month', sectionKey: 'earnings' },
      { key: 'leaveEncashmentAmount', label: 'Leave Encashment Value', dataType: 'CURRENCY', description: 'Pay out of accrued paid leave', sectionKey: 'earnings' },
      { key: 'gratuityAmount', label: 'Gratuity / Statutory Severance', dataType: 'CURRENCY', description: 'Statutory long-service reward', sectionKey: 'earnings' },
      { key: 'bonusPendingAmount', label: 'Pending Prorated Bonus', dataType: 'CURRENCY', description: 'Prorated performance award due', sectionKey: 'earnings' },
      { key: 'taxDeductions', label: 'Withholding Tax (TDS / PAYE)', dataType: 'CURRENCY', description: 'Mandatory government tax withholding', sectionKey: 'deductions' },
      { key: 'noticeShortfallDeduction', label: 'Notice Period Recovery', dataType: 'CURRENCY', description: 'Deduction if unworked notice was required', sectionKey: 'deductions' },
      { key: 'otherApprovedAdjustments', label: 'Other Approved Adjustments', dataType: 'CURRENCY', description: 'Adjustments approved by HR & Finance', sectionKey: 'deductions' },
      { key: 'bankAccountNumberMasked', label: 'Disbursement Bank Account (Masked)', dataType: 'STRING', description: 'e.g. Chase Bank ending in ...9821', sectionKey: 'net' },
    ],
    placeholders: [
      { tag: '{{employee_name}}', fieldKey: 'employeeName', description: 'Employee name', sampleValue: 'Amanda Cooper', isRequired: true },
      { tag: '{{employee_id}}', fieldKey: 'employeeId', description: 'Employee ID', sampleValue: 'EMP-7712', isRequired: true },
      { tag: '{{last_working_day}}', fieldKey: 'lastWorkingDay', description: 'Final date of duty', sampleValue: 'September 15, 2026', isRequired: true },
      { tag: '{{settlement_date}}', fieldKey: 'settlementDate', description: 'Settlement date', sampleValue: 'September 22, 2026', isRequired: true },
      { tag: '{{total_earnings}}', fieldKey: 'payableEarningsTotal', description: 'Gross dues', sampleValue: '$18,450.00 USD', isRequired: true },
      { tag: '{{total_deductions}}', fieldKey: 'deductionsTotal', description: 'Total deductions', sampleValue: '$3,200.00 USD', isRequired: true },
      { tag: '{{net_payable}}', fieldKey: 'netPayableAmount', description: 'Net amount', sampleValue: '$15,250.00 USD', isRequired: true },
      { tag: '{{currency}}', fieldKey: 'currency', description: 'Currency standard', sampleValue: 'USD', isRequired: true },
      { tag: '{{signatory_name}}', fieldKey: 'signatoryName', description: 'Finance manager', sampleValue: 'Marcus Vance', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_FNF_MATH', name: 'Arithmetic Parity', description: 'Net payable must strictly equal earnings minus deductions', severity: 'ERROR', validate: 'netPayableAmount == payableEarningsTotal - deductionsTotal', errorMessage: 'Net payable does not match Total Earnings minus Total Deductions.' },
      { id: 'VAL_FNF_NON_NEG', name: 'Non-Negative Dues', description: 'Earnings and deductions must be non-negative', severity: 'ERROR', validate: 'payableEarningsTotal >= 0 && deductionsTotal >= 0', errorMessage: 'Financial values must be zero or positive.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Payroll Computation', description: 'Leave balances, notice days, and deductions compiled', order: 1 },
        { status: 'HR_REVIEW', label: 'Finance & HR Reconciliation', description: 'Itemized calculations verified by Payroll Accountant', order: 2 },
        { status: 'APPROVED', label: 'Disbursement Approved', description: 'Controller and HR sign-off on net payable balance', order: 3 },
        { status: 'ISSUED', label: 'Statement Issued', description: 'Official FNF statement provided to employee', order: 4 },
        { status: 'ACCEPTED', label: 'Settled & Acknowledged', description: 'Funds wired and discharge receipt acknowledged', order: 5 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['FNF_AUDIT_EXTRACTION'],
      draftingAssistanceTasks: [
        { taskCode: 'breakdown_summary', label: 'Itemized Statement Summary', description: 'Draft clean itemized explanations for unusual deductions or adjustments' },
      ],
      confidenceThreshold: 0.95,
    },
    qualityChecks: [
      { id: 'QC_FNF_RECON', title: 'Accounting Reconciliation Audit', description: 'Validates line items against total gross sum and tax withholding rates', category: 'COMPENSATION', isBlocking: true },
    ],
  },

  // ===========================================================================
  // 8. CONTRACT LETTER
  // ===========================================================================
  CONTRACT_LETTER: {
    code: 'CONTRACT_LETTER',
    name: 'Contract Letter',
    category: 'LEGAL',
    description: 'Independent contractor agreement detailing statement of work, billing milestones, IP ownership, and non-employment terms.',
    iconName: 'Briefcase',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'contractor', title: 'Parties & Contractor Credentials', description: 'Individual or consulting entity details', displayOrder: 1 },
      { key: 'scope', title: 'Role, Scope & Deliverables', description: 'Milestones, sprint deliverables, and performance criteria', displayOrder: 2 },
      { key: 'compensation', title: 'Compensation Rates & Invoicing', description: 'Hourly, milestone, or monthly retainer billing', displayOrder: 3 },
      { key: 'legal', title: 'Obligations, IP Rights & Safe Harbor', description: 'Non-employment declaration and absolute IP assignment to company', displayOrder: 4 },
      { key: 'signatories', title: 'Execution & Signatures', description: 'Dual party legal execution', displayOrder: 5 },
    ],
    requiredFields: [
      { key: 'contractorName', label: 'Contractor / Agency Name', dataType: 'STRING', description: 'Legal name of contractor or corporate vendor', sectionKey: 'contractor' },
      { key: 'contractorEmail', label: 'Contact Email', dataType: 'STRING', description: 'Billing and project contact email', sectionKey: 'contractor' },
      { key: 'scopeOfWork', label: 'Scope of Work (SOW)', dataType: 'TEXTAREA', description: 'Specific project deliverables and responsibilities', sectionKey: 'scope' },
      { key: 'startDate', label: 'Contract Start Date', dataType: 'DATE', description: 'Commencement date of engagement', sectionKey: 'scope' },
      { key: 'endDate', label: 'Contract Completion Date', dataType: 'DATE', description: 'Conclusion date', sectionKey: 'scope' },
      { key: 'compensationRate', label: 'Rate Amount', dataType: 'CURRENCY', description: 'Remuneration rate', sectionKey: 'compensation' },
      { key: 'rateUnit', label: 'Billing Unit', dataType: 'SELECT', description: 'Rate basis', sectionKey: 'compensation', options: [{ label: 'Hourly Rate', value: 'HOURLY' }, { label: 'Daily Rate', value: 'DAILY' }, { label: 'Monthly Retainer', value: 'MONTHLY' }, { label: 'Fixed Milestone Deliverable', value: 'FIXED_PROJECT' }] },
      { key: 'currency', label: 'Currency', dataType: 'SELECT', description: 'Payment currency', sectionKey: 'compensation', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'GBP (£)', value: 'GBP' }] },
      { key: 'paymentTerms', label: 'Invoicing & Payment Terms', dataType: 'STRING', description: 'e.g. Net 30 days upon invoice approval', sectionKey: 'compensation', defaultValue: 'Net 30 days upon receipt of approved invoice' },
      { key: 'signatoryName', label: 'Company Signatory Name', dataType: 'STRING', description: 'Executive representing client company', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Company Signatory Title', dataType: 'STRING', description: 'Official designation', sectionKey: 'signatories' },
      { key: 'contractorSignatoryName', label: 'Contractor Signatory Name', dataType: 'STRING', description: 'Authorized representative for contractor', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'maximumBudgetCap', label: 'Maximum Budget Cap', dataType: 'CURRENCY', description: 'Do-not-exceed project limit', sectionKey: 'compensation' },
      { key: 'noticeTerminationDays', label: 'Termination Notice Days', dataType: 'NUMBER', description: 'Days notice for termination without cause', sectionKey: 'legal', defaultValue: 14 },
      { key: 'contractorWarranties', label: 'Contractor Warranties & Standards', dataType: 'TEXTAREA', description: 'Professional standard of service warranties', sectionKey: 'legal', defaultValue: 'Contractor warrants all deliverables will be original and perform in accordance with specifications.' },
    ],
    placeholders: [
      { tag: '{{contractor_name}}', fieldKey: 'contractorName', description: 'Contractor legal name', sampleValue: 'Apex Cloud Solutions LLC', isRequired: true },
      { tag: '{{scope_of_work}}', fieldKey: 'scopeOfWork', description: 'Summary of deliverables', sampleValue: 'Architecture migration of core payment gateway microservices to AWS EKS.', isRequired: true },
      { tag: '{{start_date}}', fieldKey: 'startDate', description: 'Start date', sampleValue: 'October 1, 2026', isRequired: true },
      { tag: '{{end_date}}', fieldKey: 'endDate', description: 'End date', sampleValue: 'March 31, 2027', isRequired: true },
      { tag: '{{rate_amount}}', fieldKey: 'compensationRate', description: 'Billing rate', sampleValue: '$145.00 USD', isRequired: true },
      { tag: '{{rate_unit}}', fieldKey: 'rateUnit', description: 'Unit of billing', sampleValue: 'Hourly', isRequired: true },
      { tag: '{{payment_terms}}', fieldKey: 'paymentTerms', description: 'Payment schedule', sampleValue: 'Net 30 days', isRequired: true },
      { tag: '{{company_signatory}}', fieldKey: 'signatoryName', description: 'Company signatory', sampleValue: 'Sarah Jenkins', isRequired: true },
      { tag: '{{contractor_signatory}}', fieldKey: 'contractorSignatoryName', description: 'Contractor representative', sampleValue: 'Michael Chang', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_CTR_DATES', name: 'Valid Contract Window', description: 'End date must follow start date', severity: 'ERROR', validate: 'endDate > startDate', errorMessage: 'Contract completion date must be later than start date.' },
      { id: 'VAL_CTR_RATE', name: 'Positive Rate', description: 'Compensation rate must be positive', severity: 'ERROR', validate: 'compensationRate > 0', errorMessage: 'Contract rate must exceed zero.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED', 'EXPIRED'],
      steps: [
        { status: 'DRAFT_AI', label: 'SOW Draft', description: 'Scope and commercial rate ingested', order: 1 },
        { status: 'HR_REVIEW', label: 'Legal & Procurement Review', description: 'Contractor classification and IP terms verified', order: 2 },
        { status: 'APPROVED', label: 'Authorized', description: 'Ready for bilateral execution', order: 3 },
        { status: 'ISSUED', label: 'Out for Signature', description: 'Dispatched to contractor representative', order: 4 },
        { status: 'ACCEPTED', label: 'Executed', description: 'Signed bilaterally with mutual legal enforceability', order: 5 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['SOW_DELIVERABLES_EXTRACTION'],
      draftingAssistanceTasks: [
        { taskCode: 'independent_contractor_shield', label: 'Independent Contractor Safe Harbor', description: 'Draft robust clauses guarding against employee misclassification' },
        { taskCode: 'ip_assignment', label: 'Work-For-Hire IP Assignment', description: 'Ensure comprehensive worldwide intellectual property assignment' },
      ],
      confidenceThreshold: 0.9,
    },
    qualityChecks: [
      { id: 'QC_CTR_MISCLASS', title: 'Worker Classification Risk Screening', description: 'Flags terms that inadvertently imply behavioral control or employment benefits', category: 'LEGAL', isBlocking: true },
    ],
  },

  // ===========================================================================
  // 9. MASTER SERVICE AGREEMENT (MSA)
  // ===========================================================================
  MSA: {
    code: 'MSA',
    name: 'Master Service Agreement (MSA)',
    category: 'LEGAL',
    description: 'Comprehensive commercial agreement governing multi-project enterprise engagements, IP, liability caps, and dispute resolution.',
    iconName: 'Shield',
    isImplemented: true,
    version: 1,
    sections: [
      { key: 'parties', title: 'Parties & Recitals', description: 'Legal entities, registration details, and master preamble', displayOrder: 1 },
      { key: 'governance', title: 'Services & Statements of Work', description: 'Ordering procedure, project acceptance, and performance warranties', displayOrder: 2 },
      { key: 'commercial', title: 'Commercial & Invoicing Terms', description: 'Billing schedules, payment grace period, and tax responsibilities', displayOrder: 3 },
      { key: 'ip_confidentiality', title: 'Confidentiality & Intellectual Property', description: 'Trade secrets, GDPR/privacy data security, and background IP', displayOrder: 4 },
      { key: 'liability', title: 'Indemnification & Liability Limits', description: 'Liability caps, mutual indemnities, and consequential damages waiver', displayOrder: 5 },
      { key: 'term_dispute', title: 'Term, Termination & Jurisdiction', description: 'Agreement term, governing law forum, and arbitration venue', displayOrder: 6 },
      { key: 'signatories', title: 'Mutual Legal Execution', description: 'Authorized corporate officer signatures and seals', displayOrder: 7 },
    ],
    requiredFields: [
      { key: 'clientOrVendorName', label: 'Counterparty Legal Entity Name', dataType: 'STRING', description: 'Full registered corporate name', sectionKey: 'parties' },
      { key: 'effectiveDate', label: 'Effective Date', dataType: 'DATE', description: 'Date the master agreement becomes binding', sectionKey: 'parties' },
      { key: 'governingLawJurisdiction', label: 'Governing Law Jurisdiction', dataType: 'STRING', description: 'State or country governing the contract (e.g. State of Delaware, USA)', sectionKey: 'term_dispute', defaultValue: 'State of Delaware, United States' },
      { key: 'servicesOverview', label: 'High-Level Services Description', dataType: 'TEXTAREA', description: 'General description of master professional services covered', sectionKey: 'governance' },
      { key: 'confidentialityTermYears', label: 'Confidentiality Duration (Years)', dataType: 'NUMBER', description: 'Years post-termination for NDA (e.g. 5 years; trade secrets perpetual)', sectionKey: 'ip_confidentiality', defaultValue: 5 },
      { key: 'liabilityCapMultiple', label: 'Limitation of Liability Cap', dataType: 'STRING', description: 'Cap on aggregate claims (e.g. 12 months fees paid under applicable SOW)', sectionKey: 'liability', defaultValue: 'Total fees paid in preceding 12 months' },
      { key: 'terminationNoticeDays', label: 'Termination for Convenience Notice (Days)', dataType: 'NUMBER', description: 'Written notice window for termination without cause', sectionKey: 'term_dispute', defaultValue: 30 },
      { key: 'signatoryName', label: 'Company Officer Name', dataType: 'STRING', description: 'Executive representing our company', sectionKey: 'signatories' },
      { key: 'signatoryTitle', label: 'Company Officer Title', dataType: 'STRING', description: 'Executive title', sectionKey: 'signatories' },
      { key: 'counterpartySignatoryName', label: 'Counterparty Officer Name', dataType: 'STRING', description: 'Authorized officer of counterparty', sectionKey: 'signatories' },
      { key: 'counterpartySignatoryTitle', label: 'Counterparty Officer Title', dataType: 'STRING', description: 'Title of counterparty officer', sectionKey: 'signatories' },
    ],
    optionalFields: [
      { key: 'disputeResolutionMechanism', label: 'Dispute Resolution Forum', dataType: 'SELECT', description: 'Arbitration or Court jurisdiction', sectionKey: 'term_dispute', options: [{ label: 'AAA Commercial Arbitration', value: 'ARBITRATION_AAA' }, { label: 'State & Federal Courts of Delaware', value: 'DELAWARE_COURTS' }, { label: 'ICC International Arbitration', value: 'ICC_ARBITRATION' }], defaultValue: 'ARBITRATION_AAA' },
      { key: 'subcontractingAllowed', label: 'Subcontracting Allowed', dataType: 'BOOLEAN', description: 'Whether pre-approved third-party subcontractors are permitted', sectionKey: 'governance', defaultValue: false },
      { key: 'schedulesIncluded', label: 'Applicable Master Schedules', dataType: 'STRING', description: 'Included schedules (e.g. Schedule A: SOW Template, Schedule B: GDPR DPA)', sectionKey: 'governance', defaultValue: 'Schedule A (SOW), Schedule B (Data Processing Addendum)' },
    ],
    placeholders: [
      { tag: '{{party_name}}', fieldKey: 'clientOrVendorName', description: 'Counterparty corporate name', sampleValue: 'Global Enterprise Corp.', isRequired: true },
      { tag: '{{effective_date}}', fieldKey: 'effectiveDate', description: 'Master effective date', sampleValue: 'November 1, 2026', isRequired: true },
      { tag: '{{services_scope}}', fieldKey: 'servicesOverview', description: 'Master services scope', sampleValue: 'Enterprise Cloud Transformation and Managed Engineering Services', isRequired: true },
      { tag: '{{jurisdiction}}', fieldKey: 'governingLawJurisdiction', description: 'Governing jurisdiction', sampleValue: 'State of Delaware', isRequired: true },
      { tag: '{{liability_cap}}', fieldKey: 'liabilityCapMultiple', description: 'Aggregate liability limit', sampleValue: '12 months fees paid', isRequired: true },
      { tag: '{{notice_days}}', fieldKey: 'terminationNoticeDays', description: 'Termination notice days', sampleValue: '30 days', isRequired: true },
      { tag: '{{company_signatory}}', fieldKey: 'signatoryName', description: 'Corporate officer', sampleValue: 'Sarah Jenkins', isRequired: true },
      { tag: '{{counterparty_signatory}}', fieldKey: 'counterpartySignatoryName', description: 'Counterparty officer', sampleValue: 'Jonathan Sterling', isRequired: true },
    ],
    validationRules: [
      { id: 'VAL_MSA_CONFID', name: 'Valid NDA Term', description: 'Confidentiality term must be positive number of years', severity: 'ERROR', validate: 'confidentialityTermYears >= 1', errorMessage: 'Confidentiality term must be at least 1 year.' },
    ],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED', 'EXPIRED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Master Drafting', description: 'Commercial terms and entity recitals defined', order: 1 },
        { status: 'HR_REVIEW', label: 'Corporate Counsel Review', description: 'Risk review of indemnities and liability ceilings', order: 2 },
        { status: 'PENDING_APPROVAL', label: 'Board / Executive Approval', description: 'Authorized officer approval', order: 3 },
        { status: 'ISSUED', label: 'Sent for Execution', description: 'Dispatched to counterparty for bilateral execution', order: 4 },
        { status: 'ACCEPTED', label: 'Executed Master Agreement', description: 'Bilateral signatures and seals verified', order: 5 },
      ],
    },
    aiCapabilities: {
      supportsResumeExtraction: false,
      supportsDocumentExtraction: true,
      extractionTasks: ['MSA_CLAUSE_RISK_AUDIT'],
      draftingAssistanceTasks: [
        { taskCode: 'mutual_indemnity', label: 'Mutual Indemnity Balancing', description: 'Draft symmetrical indemnification protecting IP infringement and breach of confidentiality' },
        { taskCode: 'gdpr_dpa', label: 'Data Processing Addendum (DPA) Terms', description: 'Include standard contractual clauses for transatlantic data transfers' },
      ],
      confidenceThreshold: 0.95,
    },
    qualityChecks: [
      { id: 'QC_MSA_UNLIMITED_LIABILITY', title: 'Unlimited Liability Guardrail', description: 'Audits terms to ensure no exposure to uncapped consequential damages', category: 'LEGAL', isBlocking: true },
    ],
  },

  // ===========================================================================
  // FUTURE MODULE TYPES (Configured & Ready for Architecture; Not Implemented Yet)
  // ===========================================================================
  POLICY: {
    code: 'POLICY',
    name: 'Corporate Policy',
    category: 'POLICY_LEARNING',
    description: 'Internal corporate governing guidelines (e.g. Remote Work, Information Security, Anti-Harassment).',
    iconName: 'BookOpen',
    isImplemented: false,
    version: 1,
    sections: [{ key: 'overview', title: 'Policy Overview', description: 'Purpose, scope and applicability', displayOrder: 1 }],
    requiredFields: [
      { key: 'policyTitle', label: 'Policy Title', dataType: 'STRING', description: 'Name of policy', sectionKey: 'overview' },
      { key: 'effectiveDate', label: 'Effective Date', dataType: 'DATE', description: 'Date in force', sectionKey: 'overview' },
    ],
    optionalFields: [],
    placeholders: [{ tag: '{{policy_title}}', fieldKey: 'policyTitle', description: 'Title', sampleValue: 'Remote Work Policy', isRequired: true }],
    validationRules: [],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['APPROVED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Draft', description: 'Policy drafting', order: 1 },
        { status: 'APPROVED', label: 'Published', description: 'Company-wide active policy', order: 2 },
      ],
    },
    aiCapabilities: { supportsResumeExtraction: false, supportsDocumentExtraction: true, extractionTasks: [], draftingAssistanceTasks: [], confidenceThreshold: 0.9 },
    qualityChecks: [],
  },

  ONBOARDING_FORM: {
    code: 'ONBOARDING_FORM',
    name: 'Onboarding Form',
    category: 'EMPLOYMENT',
    description: 'New hire intake form capturing tax withholding, emergency contacts, and hardware requirements.',
    iconName: 'ClipboardList',
    isImplemented: false,
    version: 1,
    sections: [{ key: 'intake', title: 'Intake Questionnaire', description: 'Employee data collection', displayOrder: 1 }],
    requiredFields: [
      { key: 'employeeName', label: 'Employee Name', dataType: 'STRING', description: 'Name', sectionKey: 'intake' },
    ],
    optionalFields: [],
    placeholders: [{ tag: '{{employee_name}}', fieldKey: 'employeeName', description: 'Name', sampleValue: 'Jane Doe', isRequired: true }],
    validationRules: [],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ACCEPTED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Pending Completion', description: 'Waiting for employee input', order: 1 },
        { status: 'ACCEPTED', label: 'Submitted', description: 'Verified by HR', order: 2 },
      ],
    },
    aiCapabilities: { supportsResumeExtraction: true, supportsDocumentExtraction: true, extractionTasks: [], draftingAssistanceTasks: [], confidenceThreshold: 0.85 },
    qualityChecks: [],
  },

  LD_COURSE: {
    code: 'LD_COURSE',
    name: 'L&D Course Module',
    category: 'POLICY_LEARNING',
    description: 'Learning and professional development syllabus, course objectives, and compliance training curriculum.',
    iconName: 'GraduationCap',
    isImplemented: false,
    version: 1,
    sections: [{ key: 'curriculum', title: 'Course Curriculum', description: 'Modules and milestones', displayOrder: 1 }],
    requiredFields: [
      { key: 'courseTitle', label: 'Course Title', dataType: 'STRING', description: 'Title of course', sectionKey: 'curriculum' },
    ],
    optionalFields: [],
    placeholders: [{ tag: '{{course_title}}', fieldKey: 'courseTitle', description: 'Course title', sampleValue: 'Cybersecurity Hygiene 101', isRequired: true }],
    validationRules: [],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['APPROVED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Curriculum Design', description: 'Course development', order: 1 },
        { status: 'APPROVED', label: 'Published Course', description: 'Active in LMS', order: 2 },
      ],
    },
    aiCapabilities: { supportsResumeExtraction: false, supportsDocumentExtraction: true, extractionTasks: [], draftingAssistanceTasks: [], confidenceThreshold: 0.85 },
    qualityChecks: [],
  },

  CERTIFICATE: {
    code: 'CERTIFICATE',
    name: 'Completion Certificate',
    category: 'POLICY_LEARNING',
    description: 'Formal credential certifying course completion, training compliance, or award of merit.',
    iconName: 'Award',
    isImplemented: false,
    version: 1,
    sections: [{ key: 'credential', title: 'Credential Details', description: 'Awardee and issuing credentials', displayOrder: 1 }],
    requiredFields: [
      { key: 'recipientName', label: 'Recipient Name', dataType: 'STRING', description: 'Recipient', sectionKey: 'credential' },
      { key: 'awardTitle', label: 'Award / Course Title', dataType: 'STRING', description: 'Title', sectionKey: 'credential' },
    ],
    optionalFields: [],
    placeholders: [{ tag: '{{recipient_name}}', fieldKey: 'recipientName', description: 'Recipient', sampleValue: 'Carlos Rivera', isRequired: true }],
    validationRules: [],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['ISSUED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Pending Issue', description: 'Credential prepared', order: 1 },
        { status: 'ISSUED', label: 'Issued', description: 'Credential awarded', order: 2 },
      ],
    },
    aiCapabilities: { supportsResumeExtraction: false, supportsDocumentExtraction: false, extractionTasks: [], draftingAssistanceTasks: [], confidenceThreshold: 0.9 },
    qualityChecks: [],
  },

  APTITUDE_TEST: {
    code: 'APTITUDE_TEST',
    name: 'Aptitude Test',
    category: 'POLICY_LEARNING',
    description: 'Candidate screening evaluation covering cognitive, logic, problem-solving, and role-specific assessments.',
    iconName: 'BrainCircuit',
    isImplemented: false,
    version: 1,
    sections: [{ key: 'test', title: 'Test Specification', description: 'Duration and assessment criteria', displayOrder: 1 }],
    requiredFields: [
      { key: 'testName', label: 'Test Title', dataType: 'STRING', description: 'Title', sectionKey: 'test' },
    ],
    optionalFields: [],
    placeholders: [{ tag: '{{test_name}}', fieldKey: 'testName', description: 'Title', sampleValue: 'Engineering Problem Solving Test', isRequired: true }],
    validationRules: [],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['APPROVED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Authoring', description: 'Question calibration', order: 1 },
        { status: 'APPROVED', label: 'Active Assessment', description: 'Assigned to candidates', order: 2 },
      ],
    },
    aiCapabilities: { supportsResumeExtraction: false, supportsDocumentExtraction: false, extractionTasks: [], draftingAssistanceTasks: [], confidenceThreshold: 0.9 },
    qualityChecks: [],
  },

  QUIZ: {
    code: 'QUIZ',
    name: 'Quiz Assessment',
    category: 'POLICY_LEARNING',
    description: 'Knowledge verification quiz measuring comprehension of corporate compliance and security policies.',
    iconName: 'HelpCircle',
    isImplemented: false,
    version: 1,
    sections: [{ key: 'quiz', title: 'Quiz Specification', description: 'Question bank and pass threshold', displayOrder: 1 }],
    requiredFields: [
      { key: 'quizTitle', label: 'Quiz Title', dataType: 'STRING', description: 'Title', sectionKey: 'quiz' },
    ],
    optionalFields: [],
    placeholders: [{ tag: '{{quiz_title}}', fieldKey: 'quizTitle', description: 'Title', sampleValue: 'SOC2 Security Awareness Quiz', isRequired: true }],
    validationRules: [],
    statusFlow: {
      initialStatus: 'DRAFT_AI',
      terminalStatuses: ['APPROVED'],
      steps: [
        { status: 'DRAFT_AI', label: 'Drafting', description: 'Question compilation', order: 1 },
        { status: 'APPROVED', label: 'Active Quiz', description: 'Assigned to employees', order: 2 },
      ],
    },
    aiCapabilities: { supportsResumeExtraction: false, supportsDocumentExtraction: false, extractionTasks: [], draftingAssistanceTasks: [], confidenceThreshold: 0.9 },
    qualityChecks: [],
  },
};

export class DocumentTypeRegistry {
  /**
   * Retrieve all document type definitions
   */
  static getAll(): DocumentTypeDefinition[] {
    return Object.values(DOCUMENT_TYPE_REGISTRY);
  }

  /**
   * Retrieve only implemented core document types
   */
  static getCoreTypes(): DocumentTypeDefinition[] {
    return Object.values(DOCUMENT_TYPE_REGISTRY).filter((dt) => dt.isImplemented);
  }

  /**
   * Retrieve future extension document types
   */
  static getFutureTypes(): DocumentTypeDefinition[] {
    return Object.values(DOCUMENT_TYPE_REGISTRY).filter((dt) => !dt.isImplemented);
  }

  /**
   * Get definition by document type code
   */
  static getByCode(code: DocumentTypeCode): DocumentTypeDefinition | undefined {
    return DOCUMENT_TYPE_REGISTRY[code];
  }

  /**
   * Check if code is a valid supported document type
   */
  static isValidTypeCode(code: string): code is DocumentTypeCode {
    return code in DOCUMENT_TYPE_REGISTRY;
  }
}
