import { PolicyDefinition } from '../components/policies/PolicyViewerModal.js';

export const OFFICIAL_POLICIES: PolicyDefinition[] = [
  {
    code: 'INTELLECTUAL_PROPERTY_POLICY',
    name: 'Intellectual Property & Work Product Policy',
    subtitle: 'Employee, Contractor & Business Partner IP Standards',
    category: 'WORKPLACE_CONDUCT',
    categoryLabel: 'IP & Workplace Conduct',
    policyNumber: 'TASK/HR-IP/2026/0001/v1.0',
    version: '1.0',
    effectiveDate: 'Effective from the date of issue',
    reviewCycle: 'Annual / Internal Governance',
    applicability: 'All Full-Time, Part-Time, Probationary, Contractors & Business Partners',
    description: 'Clear and balanced framework for identifying, creating, using, protecting, documenting and transferring intellectual property and work product.',
    summary: 'TaskNera respects legitimate employee creativity, professional attribution and lawful personal work. This policy protects Company interests while avoiding an unnecessarily broad claim over work that is genuinely unrelated to employment.',
    color: '#1e293b',
    sections: [
      {
        number: '1.0',
        title: 'Purpose & Policy Statement',
        content: `The Intellectual Property & Work Product Policy establishes a clear and balanced framework for identifying, creating, using, protecting, documenting and transferring intellectual property (“IP”) and other work product connected with TaskNera. It supports innovation and business continuity while respecting employees’ lawful rights and professional contributions.

TaskNera expects all employees and covered persons to act ethically, protect confidential information, respect third-party rights, and avoid using or disclosing IP without appropriate authority. Ownership will be determined by applicable law, the individual’s written agreement, the nature of the work, and the circumstances in which it was created.

[CORE_STANDARD]
TaskNera will not treat every idea, document, design or creation produced by an employee as Company property merely because it was created during employment. The key considerations are the person’s role, assigned duties, contractual terms, connection to the Company’s business, use of confidential information or substantial Company resources, and applicable law.`,
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Scope & Applicability',
        content: `This policy applies to all full-time, part-time, probationary and contract employees, interns, consultants, trainees and other persons who create, access, receive, manage or use TaskNera IP or third-party IP on behalf of the Company, across all locations and client engagements, unless a specific written agreement or law provides otherwise.

Where an employment agreement, client contract, vendor agreement, assignment document or other written instrument contains a valid IP provision that differs from this policy, the specific agreement will apply to the extent of the inconsistency, subject always to applicable law.`,
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Definitions',
        content: `The following authoritative terms apply across all TaskNera governance, contracts, and IP management:

[DEFINITIONS_TABLE]
• Intellectual Property (IP): Rights and interests in creations and business assets such as copyright, patents, designs, trademarks, trade secrets, confidential know-how, databases, documentation, software, processes, methodologies and other protectable subject matter.
• Company IP: IP owned by, assigned to, licensed to or otherwise lawfully controlled by TaskNera.
• Work Product: Deliverables, documents, reports, templates, training materials, research, processes, software, workflows, designs, content or other outputs created for TaskNera or its clients.
• Pre-Existing IP: IP that was created, acquired or owned by a person before joining TaskNera or independently of their TaskNera duties, subject to any prior contractual obligations.
• Confidential Information: Non-public information relating to TaskNera, its clients, candidates, employees, vendors, operations, technology, commercial terms or strategy, whether or not formally marked confidential.
• Third-Party IP: IP owned by another person or organization, including clients, vendors, software providers, candidates, content owners or other external parties.
• Substantial Company Resources: Material use of Company funding, proprietary tools, confidential information, specialized equipment, paid development time, or other resources beyond ordinary workplace access.`,
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Ownership of Company Work Product',
        content: `Subject to applicable law and any written agreement, TaskNera will own or be entitled to receive the applicable rights in Work Product created in the course of assigned duties, specifically commissioned by TaskNera, or otherwise created for a defined Company purpose where the relevant rights are lawfully transferable or assignable.

• Work created as part of normal job responsibilities, including recruitment materials, HR documentation, client deliverables, training content, operational workflows, business templates, process documentation, reports and software developed for TaskNera, will ordinarily be treated as Company Work Product.
• Where a written assignment, licence or other document is required to give effect to ownership or rights, the concerned person will cooperate in completing it within a reasonable time.
• Patent inventorship and similar personal status rights are distinct from ownership. The Company will identify and document rights in accordance with applicable law rather than assuming that employment alone settles every IP question.`,
        mandatory: true,
      },
      {
        number: '5.0',
        title: 'Employee-Created IP & Fair Treatment',
        content: `TaskNera encourages employees to contribute ideas and innovations. The Company will apply the following fair and transparent approach when reviewing employee-created work:

• Work that is directly connected to assigned duties, a Company project, a client deliverable or a specifically authorised initiative will normally fall within Company Work Product, subject to law and contract.
• An employee’s general skills, knowledge, experience, professional learning and non-confidential know-how remain personal capabilities and are not treated as Company property merely because they were developed or used at work.
• An employee’s lawful personal work that is genuinely unrelated to TaskNera’s business, created outside assigned duties, and not based on Company confidential information or substantial Company resources will generally remain the employee’s, subject to applicable law and contractual obligations.
• Where ownership is unclear, employees should disclose the facts to HR or the designated management representative before external publication, commercialisation or transfer. Good-faith disclosure will be handled fairly and will not by itself be treated as misconduct.`,
        mandatory: true,
      },
      {
        number: '6.0',
        title: 'Pre-Existing IP & Personal Projects',
        content: `Employees should identify material Pre-Existing IP that is relevant to their role or that they intend to use in Company deliverables. TaskNera does not intend to acquire ownership of genuine Pre-Existing IP merely because an employee joins the Company.

Before using Pre-Existing IP in Company or client work, the employee should inform the reporting manager or HR and, where appropriate, document whether the Company is receiving a licence or other right to use it. Employees must ensure that personal projects do not use or disclose TaskNera or client confidential information, create a conflict of interest, or breach a third party’s rights.

[REASONABLENESS_PRINCIPLE]
Ordinary use of a Company laptop, email account or workplace does not, by itself, convert an otherwise unrelated personal creation into Company IP. Ownership depends on the substance and circumstances of the work and on applicable law or contract.`,
        mandatory: true,
      },
      {
        number: '7.0',
        title: 'Third-Party IP & Open-Source Materials',
        content: `Respect for third-party IP is a condition of professional conduct at TaskNera. Employees must not copy, reproduce, modify, publish, distribute or incorporate third-party material where they do not have a lawful basis or appropriate permission to do so.

• Use licensed stock images, fonts, software, datasets, templates, code and other materials only within the permissions granted by the applicable licence or contract.
• Do not remove copyright, trademark, licence or attribution notices where they are required to remain.
• Do not introduce open-source software into a Company or client product where the applicable licence creates obligations that have not been reviewed or approved by the appropriate technical/business owner.
• Escalate uncertainty about ownership or licensing before publishing or delivering the material externally.`,
        mandatory: true,
      },
      {
        number: '8.0',
        title: 'Client, Candidate & Partner IP',
        content: `TaskNera supports clients and partners across recruitment, HR operations and workforce solutions. Client and partner agreements may allocate ownership, licences, deliverables, data and usage rights differently. Employees must therefore follow the relevant contract and authorised delivery instructions.

• Client-owned IP remains client-owned unless the governing agreement expressly provides otherwise.
• TaskNera-created tools, templates or methodologies used in client engagements remain subject to the rights allocated by the applicable agreement; employees must not assume that client access means client ownership.
• Candidate and employee information, personal data, assessments and submissions must be handled under applicable privacy, confidentiality and information-security requirements. Possession or processing of such data does not by itself make the data Company-owned IP.`,
        mandatory: true,
      },
      {
        number: '9.0',
        title: 'Use, Protection & Confidentiality',
        content: `Company IP and confidential know-how must be used only for legitimate business purposes and only by persons who have a business need and appropriate authorisation. Employees must take reasonable steps to prevent unauthorised access, copying, alteration, publication or loss.

• Store Company and client materials only in approved systems and locations.
• Do not send source files, internal templates, code, credentials, confidential processes or client deliverables to personal accounts or unapproved platforms.
• Do not publish work on social media, portfolios, public repositories or professional websites unless the Company and, where relevant, the client have approved the publication.
• Follow TaskNera information-security and confidentiality requirements when using third-party tools, including AI-enabled tools, especially where confidential or personal data may be involved.`,
        mandatory: true,
      },
      {
        number: '10.0',
        title: 'Disclosure, Registration & Records',
        content: `Potentially valuable inventions, software, designs, branded assets, proprietary processes, original content and other IP that may be commercially relevant should be disclosed to the reporting manager, HR, or another designated Company representative as soon as reasonably practicable and before public disclosure where protection could be affected.

[DISCLOSURE_TABLE]
• Initial disclosure | Responsible: Employee / creator | Expected standard: Provide a clear description, date, contributors and relevant project context.
• Ownership review | Responsible: Management / HR / designated reviewer | Expected standard: Check role, contract, client terms, pre-existing rights and applicable law.
• Registration / protection | Responsible: Authorised Company representative | Expected standard: Use appropriate filing, licensing, assignment or confidentiality measures where justified.
• Records | Responsible: Company / relevant function | Expected standard: Maintain approvals, assignments, licences and material correspondence in an accessible record.`,
        mandatory: true,
      },
      {
        number: '11.0',
        title: 'Contractors, Interns & Vendors',
        content: `Where non-employees create material for TaskNera, IP ownership and permitted use should be addressed in the applicable engagement or work order. Payment for a deliverable does not, by itself, replace the need for clear contractual terms where ownership or licensing is important.

• Relevant agreements should address ownership or licence rights, confidentiality, third-party materials and rights to deliver work to the client.
• Teams engaging external resources should avoid giving them access to more Company or client IP than is necessary for the assignment.
• Where an external contributor brings Pre-Existing IP, the scope of any licence needed by TaskNera should be clear before the material is used in a deliverable.`,
        mandatory: true,
      },
      {
        number: '12.0',
        title: 'Separation & Continuing Obligations',
        content: `On separation from TaskNera, employees and covered persons must return or securely transfer Company and client materials as instructed and must not retain, copy, publish or use confidential Company or client IP except where expressly authorised or required by law.

• Return or securely delete Company and client files, devices, credentials and storage containing protected material, subject to lawful retention requirements.
• Continue to protect confidential information after separation for as long as the obligation applies under law, contract or the nature of the information.
• Do not represent Company-created materials, client deliverables or proprietary processes as independently owned personal work.

[NO_UNFAIR_RESTRICTION]
This policy is not intended to prevent an individual from using their general professional skills, experience and lawful non-confidential knowledge in future employment, subject to valid confidentiality, IP, non-solicitation or other contractual obligations that apply to them.`,
        mandatory: true,
      },
      {
        number: '13.0',
        title: 'Reporting, Review & Non-Retaliation',
        content: `Employees should promptly report suspected misuse, unauthorised copying, infringement, loss, disclosure or uncertain ownership of TaskNera or third-party IP to their reporting manager, HR, or the designated reporting channel.

• Reports made honestly and in good faith will be treated respectfully and reviewed on the facts available.
• TaskNera prohibits retaliation against a person who raises a concern in good faith or cooperates with a review, subject to appropriate action where a report is knowingly false or malicious.
• Information relating to an IP concern should be shared only with persons who need it for investigation or decision-making.`,
        mandatory: true,
      },
      {
        number: '14.0',
        title: 'Breach & Disciplinary Action',
        content: `A breach of this policy may be treated as misconduct where supported by the facts and applicable law. Depending on seriousness, intent, impact, repetition and surrounding circumstances, TaskNera may take proportionate corrective or disciplinary action in accordance with the employment agreement and applicable law.

• Corrective guidance, training or written direction.
• Formal warning or other disciplinary action under the Company’s Misconduct & Disciplinary Policy.
• Suspension, termination or other lawful action where warranted by the circumstances.
• Recovery of losses or other remedies only to the extent legally permissible.

Before significant disciplinary action is taken, the Company should consider the available evidence, the person’s explanation, the relevant agreement, the nature of the IP involved, and applicable legal requirements.`,
        mandatory: true,
      },
      {
        number: '15.0',
        title: 'Policy Governance & Legal Framework',
        content: `This policy is part of TaskNera’s internal HR and governance framework and should be read together with the HR Policy Manual, Code of Conduct, Confidentiality requirements, Information Security and Data Protection requirements, employment agreements, and client/vendor contracts.

The policy is intended to operate consistently with applicable laws of India and, where relevant, the laws governing a client or cross-border engagement. Depending on the subject matter, relevant Indian IP legislation may include the Copyright Act, 1957, the Patents Act, 1970, the Trade Marks Act, 1999, the Designs Act, 2000, and other applicable laws and regulations. These statutes address different IP rights and should be considered according to the specific issue.

Nothing in this policy is intended to transfer, waive, restrict or extinguish a statutory right that cannot lawfully be transferred, waived or restricted. Where the law provides a different mandatory rule, the law prevails. Where a contract provides additional protections or obligations, the contract will apply to the extent legally valid.

Policy Amendment: TaskNera may amend, interpret, update, suspend or withdraw this policy as business, operational or legal requirements change. Changes will take effect from the date communicated by the Company unless otherwise stated.

[IMPLEMENTATION_NOTE]
For new hires, roles involving software, product development, research, content, branding, proprietary processes or client deliverables, HR and the relevant business owner should ensure that the employment/engagement documentation contains any role-specific IP assignment, licence or confidentiality terms that are actually required.`,
        mandatory: true,
      },
      {
        number: '16.0',
        title: 'Employee Acknowledgement',
        content: `I confirm that I have received, read and understood the TaskNera Intellectual Property & Work Product Policy (Reference ID: TASK/HR-IP/2026/0001/v1.0). I understand my responsibilities to protect Company and client IP, respect third-party rights, disclose relevant IP issues in good faith, and comply with applicable agreements and law. I also understand that the policy is intended to be applied fairly and that genuine personal work unrelated to my employment is not automatically treated as Company property.

Employee Name: {{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Signature: _____________________________________
Date: {{date}}

For queries or clarification regarding this policy, please contact the Human Resources department of TaskNera.`,
        mandatory: true,
      },
    ],
  },
  {
    code: 'LEAVE_POLICY',
    name: 'Leave & Time Off Policy',
    category: 'ATTENDANCE_LEAVE',
    categoryLabel: 'Attendance & Leave',
    policyNumber: 'POL-LVE-001',
    version: '1.3',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Global Full-Time & Probationary Employees',
    description: 'Comprehensive guidelines governing annual paid time off, sick leave, parental leave, bereavement, and sabbatical provisions.',
    summary: 'TaskNera is committed to supporting work-life integration and wellness. This policy sets forth statutory and discretionary leave entitlements, accrual equations, notice timelines, and manager approval workflows across all business entities.',
    color: '#2563eb',
    sections: [
      {
        number: '1.0',
        title: 'Purpose & Eligibility',
        content: 'This policy outlines the principles and procedures for requesting and taking paid and unpaid leave. All full-time and probationary employees are eligible for leave entitlements pro-rated from their confirmed date of joining.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Annual Paid Time Off (PTO) & Accrual Ceiling',
        content: 'Employees accrue 1.75 days of paid time off per calendar month worked (equivalent to 21 days annually). A maximum of 10 unused PTO days may roll over into the following calendar year. Unused leave beyond the rollover cap is subject to statutory encashment rules or forfeiture.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Sick & Medical Leave',
        content: 'Employees are granted 10 days of paid sick leave annually for personal illness or caring for immediate family members. Any continuous absence exceeding three (3) consecutive business days mandates submission of a recognized medical practitioner certificate.',
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Parental, Maternity & Paternity Provisions',
        content: 'Eligible primary caregivers receive twenty-six (26) weeks of fully paid maternity leave in accordance with statutory guidelines. Secondary caregivers receive four (4) weeks of fully paid paternity leave, usable within the first six months of birth or adoption.',
        mandatory: true,
      },
      {
        number: '5.0',
        title: 'Application & Approval Workflow',
        content: 'Planned leave of 3 or more days requires 14 calendar days advance notice submitted through the employee self-service portal. Unplanned absences must be reported to the reporting manager within one hour of scheduled shift start.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'ATTENDANCE_POLICY',
    name: 'Attendance & Working Hours Policy',
    category: 'ATTENDANCE_LEAVE',
    categoryLabel: 'Attendance & Leave',
    policyNumber: 'POL-ATT-002',
    version: '1.2',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Full-Time, Remote & Hybrid Personnel',
    description: 'Guidelines regarding standard core working hours, punctuality, absence reporting, and shift schedules.',
    summary: 'Ensures equitable collaboration and predictable business availability across distributed and onsite teams while respecting local statutory working hour limitations and flexibility.',
    color: '#0891b2',
    sections: [
      {
        number: '1.0',
        title: 'Core Working Hours & Collaboration Windows',
        content: 'Standard work hours encompass 9 hours per day (inclusive of meal breaks), with mandatory core collaboration hours observed between 10:00 AM and 4:00 PM local time to facilitate synchronous team communications.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Time Tracking & Log-In Protocol',
        content: 'Employees must accurately record check-in and check-out timestamps through the official portal or biometric systems. Any discrepancy must be resolved with manager approval within 48 hours of the pay cycle cutoff.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Punctuality & Habitual Tardiness',
        content: 'Tardiness exceeding 15 minutes without prior notice on more than three occasions in a single calendar month will trigger informal coaching, escalating to formal corrective counseling if unaddressed.',
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Job Abandonment',
        content: 'Three (3) consecutive days of unexcused, unreported absence (No-Call / No-Show) is deemed job abandonment and treated as voluntary separation from employment under corporate bylaws.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'CODE_OF_CONDUCT',
    name: 'Code of Business Conduct & Ethics',
    category: 'WORKPLACE_CONDUCT',
    categoryLabel: 'Workplace Conduct',
    policyNumber: 'POL-ETH-003',
    version: '2.0',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Employees, Directors, Officers & Contractors',
    description: 'Core organizational values, ethical standards, professional integrity, conflicts of interest, and anti-bribery rules.',
    summary: 'Defines the uncompromising ethical baseline expected of all representatives of TaskNera in daily dealings with clients, coworkers, vendors, and the public interest.',
    color: '#7c3aed',
    sections: [
      {
        number: '1.0',
        title: 'Professional Integrity & Mutual Respect',
        content: 'TaskNera expects every team member to foster an inclusive, honest, and collaborative atmosphere free from prejudice, disparagement, or hostile rhetoric.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Conflicts of Interest & Secondary Employment',
        content: 'Employees must not engage in outside business activities, consulting, or moonlighting that creates competing interests with TaskNera or impairs full job performance without prior written Chief People Officer sign-off.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Gifts, Anti-Bribery & Anti-Corruption (FCPA)',
        content: 'No employee may offer or accept gifts, hospitality, or improper inducements valued in excess of $100 USD. Cash gifts or equivalents are strictly forbidden in all circumstances.',
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Whistleblower Safeguards & Non-Retaliation',
        content: 'Reports of wrongdoing or regulatory non-compliance submitted to the confidential ethics hotline will be investigated objectively. Any retaliatory act against a whistleblower results in immediate summary dismissal.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'HYBRID_REMOTE_POLICY',
    name: 'Remote & Hybrid Work Policy',
    category: 'WORK_ARRANGEMENTS',
    categoryLabel: 'Work Arrangements',
    policyNumber: 'POL-WFA-004',
    version: '1.4',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Remote, Hybrid & Office-Eligible Personnel',
    description: 'Structured balance between scheduled onsite office days, remote work days, home ergonomics, and connectivity stipends.',
    summary: 'Provides a productive, flexible operating framework for distributed teams while upholding data protection, ergonomic safety, and department collaboration rituals.',
    color: '#059669',
    sections: [
      {
        number: '1.0',
        title: 'Hybrid In-Office Cadence & Anchor Days',
        content: 'Hybrid employees adhere to a standard 3-day onsite / 2-day remote weekly rhythm. Tuesday and Thursday are designated engineering and department anchor days for all-hands and collaborative sprint ceremonies.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Dedicated Workspace & Ergonomic Safety',
        content: 'Remote employees must maintain a private, secure, and ergonomically sound workspace equipped with high-speed internet (minimum 50 Mbps down / 20 Mbps up) to participate effectively in video conferences.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Hardware Provisioning & Monthly Internet Stipend',
        content: 'The company provides an enterprise-managed laptop, monitor setup, and a monthly technology reimbursement stipend to offset broadband expenses.',
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Tax Domicile & Cross-Border Relocation',
        content: 'Employees must not alter their primary residence or work from an alternate state or country for more than 14 consecutive calendar days without prior written People Operations and Legal tax clearance.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'ANTI_HARASSMENT_POLICY',
    name: 'Anti-Harassment & POSH Policy',
    category: 'WORKPLACE_CONDUCT',
    categoryLabel: 'Workplace Conduct',
    policyNumber: 'POL-HAR-005',
    version: '2.1',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Global Employees, Interns & Third-Party Contractors',
    description: 'Zero-tolerance policy against sexual harassment, verbal abuse, discrimination, bullying, and hostile work environments.',
    summary: 'Codifies our commitment to an environment of absolute psychological and physical safety where all individuals are treated with dignity, fairness, and mutual respect.',
    color: '#e11d48',
    sections: [
      {
        number: '1.0',
        title: 'Zero Tolerance Statement',
        content: 'TaskNera maintains zero tolerance for harassment, sexual harassment, verbal abuse, discrimination, intimidation, or bullying based on gender, race, religion, sexual orientation, disability, or age.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Definition of Prohibited Behaviors',
        content: 'Harassment includes unwelcome advances, quid pro quo requests, offensive humor, derogatory remarks, microaggressions, visual displays, and hostile physical contact in physical or digital workspaces.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Internal Complaints Committee (ICC) & Investigation',
        content: 'All formal complaints are immediately reviewed by the presiding Internal Complaints Committee within 48 hours. Investigations are concluded impartially within 30 calendar days.',
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Disciplinary Consequences & Protection',
        content: 'Substantiated harassment claims will lead to swift disciplinary sanctions up to and including termination with prejudice. Complainants and witnesses receive statutory immunity from workplace reprisal.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'IT_ACCEPTABLE_USE_POLICY',
    name: 'IT Security & Acceptable Use Policy',
    category: 'IT_DATA_SECURITY',
    categoryLabel: 'IT & Data Security',
    policyNumber: 'POL-SEC-006',
    version: '2.2',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Bi-Annual (6 Months)',
    applicability: 'All Users with Access to Company Networks or Data',
    description: 'Authorized usage standards for corporate networks, laptops, email accounts, software licensing, and cloud services.',
    summary: 'Governs the protection of confidential organizational data, client assets, intellectual property, and computing infrastructure from security vulnerabilities and unauthorized disclosure.',
    color: '#4f46e5',
    sections: [
      {
        number: '1.0',
        title: 'Hardware & Access Credentials Protection',
        content: 'Company devices must remain encrypted with BitLocker/FileVault. Multi-Factor Authentication (MFA) is strictly mandatory on all accounts. Credentials must never be shared or reused.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Prohibited Software & Shadow IT',
        content: 'Installing unauthorized software, peer-to-peer torrents, unauthorized AI model scrapers, or third-party cloud synchronization tools on corporate assets is strictly prohibited.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Incident Notification Protocol',
        content: 'Any lost device, suspicious phishing email, credential leak, or system anomaly must be reported to the IT Security Response Center within two (2) hours of discovery.',
        mandatory: true,
      },
      {
        number: '4.0',
        title: 'Corporate Monitoring Notice',
        content: 'To safeguard corporate systems and client confidentiality, employees acknowledge that corporate network transmissions and systems are subject to administrative monitoring in accordance with applicable laws.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'DATA_PRIVACY_POLICY',
    name: 'Data Privacy & Protection Policy',
    category: 'IT_DATA_SECURITY',
    categoryLabel: 'IT & Data Security',
    policyNumber: 'POL-PRV-007',
    version: '1.8',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Personnel Handling Personal Identifiable Information (PII)',
    description: 'Internal handling of employee, candidate, and client data under global privacy frameworks (GDPR, CCPA/CPRA, DPDP).',
    summary: 'Sets the gold standard for collecting, storing, processing, and transferring sensitive employee and customer information in compliance with international data privacy regulations.',
    color: '#0284c7',
    sections: [
      {
        number: '1.0',
        title: 'Data Minimization & Lawful Basis',
        content: 'Personal Identifiable Information (PII) is gathered strictly for legitimate operational purposes. Unnecessary data hoarding or retention beyond statutory limits is forbidden.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Access Control & Principle of Least Privilege',
        content: 'Access to candidate and employee databases is provisioned on a strict role-based access control (RBAC) foundation and audited quarterly by Information Security.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Subject Access Rights & Corrections',
        content: 'Data subjects maintain legal rights to access, inspect, rectify, or request erasure of personal data. Requests must be escalated to the Data Protection Officer within 24 hours.',
        mandatory: true,
      },
    ],
  },
  {
    code: 'EXPENSE_TRAVEL_POLICY',
    name: 'Expense & Corporate Travel Policy',
    category: 'FINANCE_TRAVEL',
    categoryLabel: 'Finance & Travel',
    policyNumber: 'POL-FIN-008',
    version: '1.5',
    effectiveDate: 'October 1, 2026',
    reviewCycle: 'Annual (12 Months)',
    applicability: 'All Traveling Employees & Expense-Incurring Staff',
    description: 'Rules for corporate expense reimbursement, eligible business deductions, receipt retention, and approval limits.',
    summary: 'Establishes clear, consistent fiscal guidelines for business travel, client entertainment, meal per diems, and timely expense reconciliations.',
    color: '#d97706',
    sections: [
      {
        number: '1.0',
        title: 'Permissible Business Expenditures',
        content: 'Expenditures incurred directly, necessarily, and reasonably in the execution of company business are eligible for reimbursement upon submission of itemized receipts.',
        mandatory: true,
      },
      {
        number: '2.0',
        title: 'Travel Standards & Accommodation Limits',
        content: 'Domestic and international flights under 8 hours require economy class booking. Nightly hotel rates must adhere to metropolitan tier caps approved in the finance matrix.',
        mandatory: true,
      },
      {
        number: '3.0',
        title: 'Submission Deadlines & Payment Cycle',
        content: 'Expense claims must be submitted with valid GST/tax invoices within 30 calendar days of expense date. Approved reimbursements are processed in the next scheduled bi-weekly payroll cycle.',
        mandatory: true,
      },
    ],
  },
];
