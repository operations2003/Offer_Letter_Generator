// =============================================================================
// HR POLICY ENGINE: POLICY TYPE REGISTRY
// =============================================================================
// Authoritative catalog for all 19 Core Organizational HR Policies.
// Provides metadata, categorization, recommended review cycles, and standard sections.
// =============================================================================

import { PolicyTypeCode, PolicyTypeDefinition } from '../../../../shared/types/policy-engine.js';

export const POLICY_TYPE_REGISTRY: Record<PolicyTypeCode, PolicyTypeDefinition> = {
  // 0. INTELLECTUAL PROPERTY & WORK PRODUCT POLICY
  INTELLECTUAL_PROPERTY_POLICY: {
    code: 'INTELLECTUAL_PROPERTY_POLICY',
    name: 'Intellectual Property & Work Product Policy',
    category: 'WORKPLACE_CONDUCT',
    description: 'Clear and balanced framework for identifying, creating, using, protecting, documenting and transferring intellectual property and work product.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Purpose & Policy Statement', description: 'Intent and ethical obligations regarding Company IP', sampleGuidance: 'Protects innovation and business continuity while respecting employees lawful rights.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Scope & Applicability', description: 'Workforce segments covered by IP standards', sampleGuidance: 'Applies to full-time, part-time, contractors, interns, and business partners.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Definitions', description: 'Authoritative IP terminology', sampleGuidance: 'Defines IP, Company IP, Work Product, Pre-Existing IP, and Confidential Information.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Ownership of Company Work Product', description: 'Assignment of deliverables created in assigned duties', sampleGuidance: 'Work created as part of job duties is treated as Company Work Product.', isMandatory: true },
      { sectionNumber: '5.0', title: 'Employee-Created IP & Fair Treatment', description: 'Protections for personal skills and unrelated creations', sampleGuidance: 'Personal skills and unrelated personal creations remain the employees.', isMandatory: true },
      { sectionNumber: '6.0', title: 'Pre-Existing IP & Personal Projects', description: 'Disclosure of pre-existing materials and personal work', sampleGuidance: 'Ordinary laptop use does not convert personal work into Company IP.', isMandatory: true },
      { sectionNumber: '7.0', title: 'Third-Party IP & Open-Source Materials', description: 'Licensing, attribution, and open-source compliance', sampleGuidance: 'Do not introduce unvetted open-source code or violate licenses.', isMandatory: true },
      { sectionNumber: '8.0', title: 'Client, Candidate & Partner IP', description: 'Respecting external partner and client IP rights', sampleGuidance: 'Client-owned IP remains client-owned per contract.', isMandatory: true },
      { sectionNumber: '9.0', title: 'Use, Protection & Confidentiality', description: 'Safeguarding source files, credentials, and systems', sampleGuidance: 'Store in approved systems; do not transfer to personal accounts.', isMandatory: true },
      { sectionNumber: '10.0', title: 'Disclosure, Registration & Records', description: 'Procedures for registering and recording valuable IP', sampleGuidance: 'Timely disclosure to management before public dissemination.', isMandatory: true },
      { sectionNumber: '11.0', title: 'Contractors, Interns & Vendors', description: 'IP terms for external consultants and suppliers', sampleGuidance: 'Payment does not replace explicit contractual IP assignment terms.', isMandatory: true },
      { sectionNumber: '12.0', title: 'Separation & Continuing Obligations', description: 'Return of IP and materials upon offboarding', sampleGuidance: 'Return devices and delete proprietary materials upon departure.', isMandatory: true },
      { sectionNumber: '13.0', title: 'Reporting, Review & Non-Retaliation', description: 'Hotline for reporting IP infringement or loss', sampleGuidance: 'Good-faith reporting without fear of workplace retaliation.', isMandatory: true },
      { sectionNumber: '14.0', title: 'Breach & Disciplinary Action', description: 'Sanctions for deliberate policy violations', sampleGuidance: 'Misconduct may result in formal warnings or termination with prejudice.', isMandatory: true },
      { sectionNumber: '15.0', title: 'Policy Governance & Legal Framework', description: 'Indian legislation (Copyright Act, Patents Act) & governance', sampleGuidance: 'Operates under Copyright Act 1957 and Patents Act 1970.', isMandatory: true },
      { sectionNumber: '16.0', title: 'Employee Acknowledgement', description: 'Formal employee signature and acknowledgement record', sampleGuidance: 'Signed declaration acknowledging receipt and compliance.', isMandatory: true },
    ],
  },

  // 1. LEAVE POLICY
  LEAVE_POLICY: {
    code: 'LEAVE_POLICY',
    name: 'Leave Policy',
    category: 'ATTENDANCE_LEAVE',
    description: 'Comprehensive guidelines governing annual paid time off, sick leave, parental leave, bereavement, and sabbatical provisions.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Purpose & Scope', description: 'Intent of leave framework and eligible workforce segments', sampleGuidance: 'Establishes statutory and discretionary paid and unpaid leave entitlements.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Annual Paid Time Off (PTO) & Accrual', description: 'Accrual rates, rollover limits, and encashment rules', sampleGuidance: 'Employees accrue leave per pay cycle with a maximum carry-over ceiling.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Sick & Medical Leave', description: 'Self-certification, medical certificate requirement, and extended medical leave', sampleGuidance: 'Absences exceeding 3 consecutive calendar days require certified practitioner note.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Parental, Maternity & Paternity Provisions', description: 'Childbirth, adoption, and primary/secondary caregiver entitlements', sampleGuidance: 'Full salary continuation during statutory parental leave periods.', isMandatory: true },
      { sectionNumber: '5.0', title: 'Leave Application & Approval Workflow', description: 'Notice window requirements and manager sign-off protocol', sampleGuidance: 'Requests must be submitted through the portal at least 14 days in advance.', isMandatory: true },
    ],
  },

  // 2. ATTENDANCE POLICY
  ATTENDANCE_POLICY: {
    code: 'ATTENDANCE_POLICY',
    name: 'Attendance Policy',
    category: 'ATTENDANCE_LEAVE',
    description: 'Guidelines regarding standard core working hours, punctuality, absence reporting, and shift schedules.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Core Working Hours & Collaboration Windows', description: 'Expected core availability for meetings and team responsiveness', sampleGuidance: 'Core operating collaboration window is 10:00 AM to 4:00 PM local time.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Time Tracking & Log In Protocol', description: 'Timesheet submission, biometric/portal check-in, and overtime pre-approval', sampleGuidance: 'Non-exempt employees must accurately log hours worked per daily schedule.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Unplanned Absences & Tardiness', description: 'Notification expectations and escalating corrective milestones', sampleGuidance: 'Unplanned absence requires manager notice at least 1 hour prior to shift start.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Job Abandonment', description: 'Consecutive unreported absences triggering automatic administrative review', sampleGuidance: 'Three consecutive days of No-Call/No-Show is considered voluntary resignation.', isMandatory: true },
    ],
  },

  // 3. WORK FROM HOME (WFH) POLICY
  WORK_FROM_HOME_POLICY: {
    code: 'WORK_FROM_HOME_POLICY',
    name: 'Work From Home Policy',
    category: 'WORK_ARRANGEMENTS',
    description: 'Ad-hoc and short-term work from home authorization for personal errands, weather events, or minor health recovery.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Eligibility for Occasional WFH', description: 'Roles amenable to remote task execution and minimum tenure', sampleGuidance: 'Subject to role suitability, manager pre-approval, and good performance standing.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Request & Notification Process', description: 'Advance notice timeline and emergency notification', sampleGuidance: 'Submit request 24 hours prior to scheduled work from home day.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Connectivity & Availability Standards', description: 'Internet uptime, Slack/Teams presence, and video participation', sampleGuidance: 'Employee must remain reachable via enterprise communication platforms during work hours.', isMandatory: true },
    ],
  },

  // 4. REMOTE WORK POLICY
  REMOTE_WORK_POLICY: {
    code: 'REMOTE_WORK_POLICY',
    name: 'Remote Work Policy',
    category: 'WORK_ARRANGEMENTS',
    description: 'Comprehensive guidelines for full-time 100% remote employees working across distributed regional geographies.',
    defaultApplicability: 'REMOTE_WORKERS',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Designated Remote Workplace & Ergonomics', description: 'Home office requirements, quiet workspace, and ergonomic safety', sampleGuidance: 'Employee maintains a secure, private, ergonomically sound workspace.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Tax & Jurisdictional Relocation Compliance', description: 'Residency reporting and pre-approval for moving between states/countries', sampleGuidance: 'Relocating primary tax domicile requires 45-day advance written People Ops authorization.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Equipment Provisioning & Expense Reimbursement', description: 'Laptop, monitors, and monthly broadband stipends', sampleGuidance: 'Company provides standard hardware and monthly remote broadband stipend.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Data Security in Remote Environments', description: 'VPN usage, clean-desk policy, and physical device security', sampleGuidance: 'All network traffic must traverse authorized corporate VPN with full-disk encryption.', isMandatory: true },
    ],
  },

  // 5. HYBRID WORK POLICY
  HYBRID_WORK_POLICY: {
    code: 'HYBRID_WORK_POLICY',
    name: 'Hybrid Work Policy',
    category: 'WORK_ARRANGEMENTS',
    description: 'Structured balance between scheduled onsite office days and remote work days to foster collaboration.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Weekly Onsite Cadence', description: 'Required days in office (e.g. 3 days onsite, 2 days remote)', sampleGuidance: 'Employees participate in 3 mandatory onsite collaboration days weekly.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Anchor Days & Team Rituals', description: 'Department anchor days for sprint planning and executive all-hands', sampleGuidance: 'Tuesday and Thursday are designated engineering department anchor days.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Hot-Desking & Workplace Reservation', description: 'Desk booking system and shared collaborative workspace etiquette', sampleGuidance: 'Reserve workstations at least 24 hours prior through workplace portal.', isMandatory: true },
    ],
  },

  // 6. CODE OF CONDUCT
  CODE_OF_CONDUCT: {
    code: 'CODE_OF_CONDUCT',
    name: 'Code of Conduct',
    category: 'WORKPLACE_CONDUCT',
    description: 'Core organizational values, ethical standards, professional integrity, conflicts of interest, and anti-bribery rules.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Core Organizational Values & Ethics', description: 'Honesty, transparency, respect, and mutual dignity in the workplace', sampleGuidance: 'All staff must act with uncompromising personal integrity and professional excellence.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Conflicts of Interest & Outside Activities', description: 'Secondary employment, advisory roles, and family/personal investments', sampleGuidance: 'Employees must disclose any external business interest that may conflict with duties.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Gifts, Entertainment & Anti-Bribery (FCPA/UKBA)', description: 'Strict limits on hospitality and prohibition of improper inducements', sampleGuidance: 'Gifts exceeding $100 in value must be declared and pre-approved by compliance.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Reporting Misconduct & Whistleblower Protections', description: 'Confidential reporting hotline and non-retaliation guarantee', sampleGuidance: 'Reports of misconduct are handled confidentially with zero tolerance for retaliation.', isMandatory: true },
    ],
  },

  // 7. ANTI-HARASSMENT POLICY
  ANTI_HARASSMENT_POLICY: {
    code: 'ANTI_HARASSMENT_POLICY',
    name: 'Anti-Harassment Policy',
    category: 'WORKPLACE_CONDUCT',
    description: 'Zero-tolerance policy against sexual harassment, verbal abuse, discrimination, bullying, and hostile work environments.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Zero Tolerance Commitment', description: 'Uncompromising prohibition of harassment and discrimination on any protected basis', sampleGuidance: 'The company maintains zero tolerance for harassment of any individual on any protected trait.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Definition & Examples of Prohibited Conduct', description: 'Quid pro quo, unwelcome advances, offensive jokes, and microaggressions', sampleGuidance: 'Harassment includes unwelcome physical contact, suggestive remarks, or visual intimidation.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Formal Complaint & Investigation Procedure', description: 'Timely, impartial investigation procedures led by independent investigators', sampleGuidance: 'Complaints trigger an objective inquiry within 48 hours led by HR Employee Relations.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Strict Non-Retaliation Guarantee', description: 'Protections for complainants, witnesses, and participants in good-faith reports', sampleGuidance: 'Any form of retaliation against a reporting party constitutes grounds for immediate termination.', isMandatory: true },
    ],
  },

  // 8. IT / ACCEPTABLE USE POLICY
  IT_ACCEPTABLE_USE_POLICY: {
    code: 'IT_ACCEPTABLE_USE_POLICY',
    name: 'IT / Acceptable Use Policy',
    category: 'IT_DATA_SECURITY',
    description: 'Authorized usage standards for corporate networks, laptops, email accounts, software licensing, and cloud services.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Permitted & Incidental Personal Use', description: 'Guidelines on reasonable personal communication during off-hours', sampleGuidance: 'Corporate IT assets are provided primarily for authorized business execution.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Prohibited Activities & Unapproved Software', description: 'Shadow IT, torrenting, hacking tools, and unlicensed software installation', sampleGuidance: 'Installation of unauthorized software or third-party cloud synchronization tools is forbidden.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Network Security & Endpoint Protection', description: 'Antivirus requirements, automatic patching, and password complexity standards', sampleGuidance: 'Endpoints must enforce multi-factor authentication (MFA) and automatic screen locks.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Monitoring & Expectation of Privacy', description: 'Employer right to monitor corporate network traffic and corporate communications', sampleGuidance: 'Employees have no expectation of personal privacy regarding communications on company systems.', isMandatory: true },
    ],
  },

  // 9. DATA PRIVACY POLICY
  DATA_PRIVACY_POLICY: {
    code: 'DATA_PRIVACY_POLICY',
    name: 'Data Privacy Policy',
    category: 'IT_DATA_SECURITY',
    description: 'Internal handling of personal employee and customer data in accordance with privacy frameworks (GDPR, CCPA/CPRA, DPDP).',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Data Minimization & Lawful Processing', description: 'Collection limits and purpose limitation for personal identifiable information (PII)', sampleGuidance: 'Personal data is collected strictly for legitimate, specified operational purposes.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Subject Access Rights & Privacy Requests', description: 'Procedures for handling right-to-be-forgotten, correction, and access inquiries', sampleGuidance: 'Data subject access requests must be routed to the Data Protection Officer within 24 hours.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Cross-Border Data Transfers', description: 'Standard contractual clauses and data localization benchmarks', sampleGuidance: 'Personal data transfers outside origin jurisdictions require legal transfer mechanisms.', isMandatory: true },
    ],
  },

  // 10. INFORMATION SECURITY POLICY
  INFORMATION_SECURITY_POLICY: {
    code: 'INFORMATION_SECURITY_POLICY',
    name: 'Information Security Policy',
    category: 'IT_DATA_SECURITY',
    description: 'Enterprise information classification, access control, encryption, key management, and incident response obligations.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Data Classification Framework', description: 'Public, Internal, Confidential, and Restricted classification tiers', sampleGuidance: 'All corporate information must be tagged according to sensitivity and risk impact.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Access Control & Principle of Least Privilege', description: 'Role-based access controls (RBAC) and quarterly privilege attestation', sampleGuidance: 'Access is granted on a strict need-to-know basis and audited on a quarterly basis.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Security Incident Detection & Breach Notification', description: 'Immediate notification protocols for lost devices or suspicious phishing attempts', sampleGuidance: 'Security incidents must be escalated immediately to the SecOps incident hotline.', isMandatory: true },
    ],
  },

  // 11. EXPENSE POLICY
  EXPENSE_POLICY: {
    code: 'EXPENSE_POLICY',
    name: 'Expense Policy',
    category: 'FINANCE_TRAVEL',
    description: 'Rules for corporate expense reimbursement, eligible business deductions, receipt retention, and approval limits.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Eligible Business Expenses & Pre-Approval', description: 'Permissible operational costs, team dinners, software, and office supplies', sampleGuidance: 'Expenses exceeding $250 require advance manager written authorization.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Documentation & Receipt Retention', description: 'Itemized receipts, currency conversion, and electronic submission deadlines', sampleGuidance: 'Itemized receipts must be submitted via the expense portal within 30 days of incurrence.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Corporate Credit Card Responsibilities', description: 'Authorized charges, reconciliation deadlines, and personal charge repayment', sampleGuidance: 'Personal charges on corporate cards are strictly prohibited and subject to payroll deduction.', isMandatory: true },
    ],
  },

  // 12. TRAVEL POLICY
  TRAVEL_POLICY: {
    code: 'TRAVEL_POLICY',
    name: 'Travel Policy',
    category: 'FINANCE_TRAVEL',
    description: 'Guidelines for domestic and international corporate travel, airfare class, lodging limits, meals, and safety assistance.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Travel Booking & Fare Class Standards', description: 'Economy class standard, rail alternatives, and flight booking timelines', sampleGuidance: 'Standard travel is Economy Class; flights over 8 continuous hours eligible for Premium.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Lodging & Hotel Per Diem Guidelines', description: 'Nightly lodging rate caps per metropolitan market and approved hotel chains', sampleGuidance: 'Hotel rates must not exceed approved tier caps for the destination market.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Daily Meal Allowance (Per Diem)', description: 'Standard daily meal budget and alcohol reimbursement restrictions', sampleGuidance: 'Meal per diem covers breakfast, lunch, and dinner up to daily local city limits.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Duty of Care & Emergency Assistance', description: 'Travel medical insurance, SOS emergency hotlines, and risk alerts', sampleGuidance: 'Company furnishes global 24/7 medical and evacuation insurance during business travel.', isMandatory: true },
    ],
  },

  // 13. RECRUITMENT POLICY
  RECRUITMENT_POLICY: {
    code: 'RECRUITMENT_POLICY',
    name: 'Recruitment Policy',
    category: 'TALENT_ACQUISITION',
    description: 'Fair hiring standards, candidate interview benchmarks, anti-bias protocols, and employee referral incentives.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Equal Opportunity & Structured Hiring', description: 'Objective rubric scoring and diversity sourcing commitments', sampleGuidance: 'Recruitment decisions are grounded in standardized, competency-based interview rubrics.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Interview Panel Calibration & Anti-Bias', description: 'Trained interviewers, structured feedback, and unconscious bias training', sampleGuidance: 'All interview panel members must complete annual inclusive hiring training.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Employee Referral Program & Payout Terms', description: 'Referral eligibility, candidate submission rules, and payout schedule', sampleGuidance: 'Referral rewards are disbursed in two tranches: upon joining and after 90 days tenure.', isMandatory: false },
    ],
  },

  // 14. ONBOARDING POLICY
  ONBOARDING_POLICY: {
    code: 'ONBOARDING_POLICY',
    name: 'Onboarding Policy',
    category: 'TALENT_ACQUISITION',
    description: 'Framework for welcoming new employees, IT provisioning, mentor assignment, and 30-60-90 day milestone alignment.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Pre-Boarding & First Day Preparedness', description: 'Hardware shipment, credentials provisioning, and introductory welcome itinerary', sampleGuidance: 'Hardware and system credentials must be delivered 2 business days prior to start date.', isMandatory: true },
      { sectionNumber: '2.0', title: '30-60-90 Day Success Roadmap', description: 'Structured milestone alignment between manager and new hire', sampleGuidance: 'Managers conduct documented check-ins at days 30, 60, and 90 of employment.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Mandatory Compliance & Safety Courses', description: 'Required training on anti-harassment, cybersecurity, and code of conduct', sampleGuidance: 'Compliance coursework must be completed within 14 calendar days of joining.', isMandatory: true },
    ],
  },

  // 15. PERFORMANCE MANAGEMENT POLICY
  PERFORMANCE_MANAGEMENT_POLICY: {
    code: 'PERFORMANCE_MANAGEMENT_POLICY',
    name: 'Performance Management Policy',
    category: 'PERFORMANCE_CAREER',
    description: 'Continuous feedback, goal setting (OKRs/KPIs), annual performance reviews, and promotion cycles.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Goal Setting & Continuous Alignment (OKRs)', description: 'Bi-annual objective setting linked to organizational strategic pillars', sampleGuidance: 'Employees establish measurable quarterly performance outcomes in coordination with managers.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Performance Review Cycles & 360 Feedback', description: 'Self-appraisal, peer input, and manager rating calibration', sampleGuidance: 'Formal performance evaluations occur bi-annually with peer 360 reviews.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Promotion & Merit Review Procedures', description: 'Promotion criteria, tenure expectations, and compensation committee sign-off', sampleGuidance: 'Promotions require evidence of sustained performance at the next career level.', isMandatory: true },
    ],
  },

  // 16. PROBATION POLICY
  PROBATION_POLICY: {
    code: 'PROBATION_POLICY',
    name: 'Probation Policy',
    category: 'PERFORMANCE_CAREER',
    description: 'Guidelines on probationary evaluation periods, formal confirmation reviews, and extension criteria.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Standard Probationary Tenure', description: 'Duration of initial evaluation period (e.g. 90 days or 6 months)', sampleGuidance: 'All newly appointed employees undergo an initial 90-day probationary review term.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Confirmation Assessment & Sign-Off', description: 'Formal assessment of technical competency and cultural fit', sampleGuidance: 'HR and manager conduct formal confirmation review 14 days prior to probationary conclusion.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Extension & Separation Terms During Probation', description: 'Criteria for single extension or shortened notice termination', sampleGuidance: 'Probation may be extended once for up to 60 days if performance requires further evaluation.', isMandatory: true },
    ],
  },

  // 17. GRIEVANCE POLICY
  GRIEVANCE_POLICY: {
    code: 'GRIEVANCE_POLICY',
    name: 'Grievance Policy',
    category: 'EMPLOYEE_RELATIONS',
    description: 'Formal escalation pathway for employees to resolve workplace concerns, disputes, and fairness issues.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Informal Dispute Resolution', description: 'Encouraging direct, facilitated dialogue with immediate manager or HR partner', sampleGuidance: 'Employees are encouraged to resolve interpersonal disputes informally where feasible.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Formal Grievance Lodging & Timeline', description: 'Filing formal written statement of grievance with specific evidence', sampleGuidance: 'Formal grievances must be submitted in writing to Employee Relations within 30 days of incident.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Hearing & Final Grievance Appeal', description: 'Formal hearing panel, representation rights, and binding executive resolution', sampleGuidance: 'Employees possess the right to appeal initial grievance findings to an executive committee.', isMandatory: true },
    ],
  },

  // 18. DISCIPLINARY POLICY
  DISCIPLINARY_POLICY: {
    code: 'DISCIPLINARY_POLICY',
    name: 'Disciplinary Policy',
    category: 'EMPLOYEE_RELATIONS',
    description: 'Progressive disciplinary procedures for misconduct or performance deficits (verbal warning, written PIP, suspension, termination).',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Progressive Disciplinary Stages', description: 'Verbal counseling, formal written warning, performance improvement plan (PIP)', sampleGuidance: 'Disciplinary progression follows documented verbal warning, formal written warning, and PIP.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Performance Improvement Plan (PIP) Guidelines', description: 'Duration, clear measurable targets, and bi-weekly milestone check-ins', sampleGuidance: 'A PIP spans 30 to 60 calendar days with explicit, measurable remediation deliverables.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Gross Misconduct & Summary Dismissal', description: 'Theft, violence, severe insubordination, or critical safety violations', sampleGuidance: 'Acts of gross misconduct may bypass progressive discipline and result in summary termination.', isMandatory: true },
    ],
  },

  // 19. EXIT / OFFBOARDING POLICY
  EXIT_OFFBOARDING_POLICY: {
    code: 'EXIT_OFFBOARDING_POLICY',
    name: 'Exit / Offboarding Policy',
    category: 'EMPLOYEE_RELATIONS',
    description: 'Protocols for voluntary resignation, notice periods, knowledge transfer, IT asset return, and post-employment covenants.',
    defaultApplicability: 'ALL_EMPLOYEES',
    recommendedReviewFrequencyMonths: 12,
    standardSections: [
      { sectionNumber: '1.0', title: 'Resignation Submission & Notice Period Fulfillment', description: 'Formal written notice, waiver protocols, and buyout guidelines', sampleGuidance: 'Employees must provide contractual notice in writing to their reporting manager and HR.', isMandatory: true },
      { sectionNumber: '2.0', title: 'Knowledge Transfer & Project Handover', description: 'Comprehensive documentation, credential handover, and client transition', sampleGuidance: 'A formal knowledge transfer plan must be executed and approved before last working day.', isMandatory: true },
      { sectionNumber: '3.0', title: 'Asset Recovery & Access Revocation', description: 'Return of laptops, security badges, access tokens, and cloud de-provisioning', sampleGuidance: 'Corporate IT access is revoked at 5:00 PM on the employee’s effective separation date.', isMandatory: true },
      { sectionNumber: '4.0', title: 'Exit Interview & Full and Final Settlement (FNF)', description: 'Confidential exit interview, separation feedback, and disbursement timeline', sampleGuidance: 'Full and final dues are computed and disbursed in accordance with statutory guidelines.', isMandatory: true },
    ],
  },
};

export class PolicyRegistry {
  static getAll(): PolicyTypeDefinition[] {
    return Object.values(POLICY_TYPE_REGISTRY);
  }

  static getByCode(code: PolicyTypeCode): PolicyTypeDefinition | undefined {
    return POLICY_TYPE_REGISTRY[code];
  }

  static getByCategory(category: string): PolicyTypeDefinition[] {
    return Object.values(POLICY_TYPE_REGISTRY).filter((p) => p.category === category);
  }
}
