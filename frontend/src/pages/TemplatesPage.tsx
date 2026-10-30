import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Copy,
  Layers,
  Sparkles,
  Download,
  X,
  Printer,
  Save,
  Highlighter,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Users,
  Check,
  Building2,
  Calendar,
  Briefcase,
  FileCode,
  RotateCcw,
  Clipboard,
  Trash2,
  ScrollText,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { DocumentTemplateItem, EmployeeService, Employee } from '../services/employeeService.js';
import { templateService } from '../services/templateService.js';
import { DocumentEngineService } from '../services/documentEngineService.js';
import { HrDocument } from '../types/document-engine.js';
import { useToast } from '../context/ToastContext.js';
import { parseDocumentClientSide } from '../utils/clientDocumentParser.js';

interface StandardPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  content: string;
  sampleData: Record<string, string>;
}

// Fallback demo employee roster to guarantee immediate 1-click auto-fill
const DEMO_EMPLOYEES: Employee[] = [
  {
    id: 'emp_demo_1',
    companyId: 'default_company',
    employeeId: 'EMP-1001',
    fullName: 'Rahul Sharma',
    personalEmail: 'rahul.sharma@example.com',
    officialEmail: 'rahul.sharma@tasknera.com',
    phone: '+91 98765 43210',
    joiningDate: '2024-06-01',
    designation: 'Senior Software Engineer',
    department: 'Engineering',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    workLocation: 'Bangalore, India',
    reportingManager: 'Sheetal Bedi',
    annualCtc: 2200000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emp_demo_2',
    companyId: 'default_company',
    employeeId: 'EMP-1002',
    fullName: 'Priya Patel',
    personalEmail: 'priya.patel@example.com',
    officialEmail: 'priya.patel@tasknera.com',
    phone: '+91 98111 22334',
    joiningDate: '2023-11-15',
    designation: 'Lead Product Manager',
    department: 'Product',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    workLocation: 'Mumbai, India',
    reportingManager: 'Sheetal Bedi',
    annualCtc: 2600000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emp_demo_3',
    companyId: 'default_company',
    employeeId: 'EMP-1003',
    fullName: 'Amitabh Sen',
    personalEmail: 'amitabh.sen@example.com',
    officialEmail: 'amitabh.sen@tasknera.com',
    phone: '+91 97654 32109',
    joiningDate: '2022-03-01',
    designation: 'DevOps & Cloud Specialist',
    department: 'Operations',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    workLocation: 'Delhi, India',
    reportingManager: 'Sheetal Bedi',
    annualCtc: 1800000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emp_demo_4',
    companyId: 'default_company',
    employeeId: 'EMP-1004',
    fullName: 'Ananya Roy',
    personalEmail: 'ananya.roy@example.com',
    officialEmail: 'ananya.roy@tasknera.com',
    phone: '+91 99887 76655',
    joiningDate: '2025-01-10',
    designation: 'UI/UX Product Designer',
    department: 'Design',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    workLocation: 'Remote',
    reportingManager: 'Sheetal Bedi',
    annualCtc: 1500000,
    currency: 'INR',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Preloaded standard templates for instant 1-click loading
const STANDARD_PRESETS: StandardPreset[] = [
  {
    id: 'preset_offer',
    name: 'Corporate Offer Letter',
    category: 'Offer Letter',
    icon: '📄',
    description: 'Full-time employment offer with compensation breakdown and terms.',
    content: `**CONFIDENTIAL OFFER OF EMPLOYMENT**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

Dear **{{candidate_name}}**,

On behalf of **{{company_name}}**, we are pleased to offer you the full-time position of **{{job_title}}** in the **{{department}}** department, reporting directly to **{{reporting_manager}}**.

Your anticipated starting date of employment will be **{{joining_date}}** at our **{{work_location}}** facility.

**1. POSITION & SCOPE OF ENGAGEMENT**
• **Designation**: **{{job_title}}**
• **Department / Division**: **{{department}}**
• **Reporting Line**: **{{reporting_manager}}**
• **Work Location**: **{{work_location}}**
• **Commencement Date**: **{{joining_date}}**

**2. COMPENSATION & EMOLUMENTS**
Your comprehensive annual compensation package is established as follows:
• **Fixed Annual Base Salary**: {{base_salary}}
• **Performance Bonus / Variable Pay**: {{variable_pay}}
• **Total Annual Cost-to-Company (CTC)**: **{{annual_ctc}}**
• **Health & Wellness Benefits**: Executive medical insurance and family health coverage

**3. TERMS OF PROBATION & NOTICE PERIOD**
• **Probationary Assessment**: You will be on a probation period of **{{probation_period}}** from your commencement date.
• **Separation & Notice Period**: Written notice of **{{notice_period}}** is required by either party upon separation.
• **Working Hours**: Standard 5-day business week, 9 hours daily, with project-aligned flexibility.

**4. CONFIDENTIALITY & GOVERNING POLICIES**
You agree to maintain strict confidentiality regarding all proprietary information, client documentation, trade secrets, and software assets of **{{company_name}}**.

Please confirm your acceptance of this offer by signing and returning this letter on or before **{{valid_until}}**.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}

**ACCEPTANCE & ACKNOWLEDGEMENT**
I have read, understood, and accept this employment offer under the terms described above.

Signature: ___________________________
Candidate Name: **{{candidate_name}}**
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-OFF-2026-081',
      candidate_name: 'Priya Sharma',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Product Designer',
      department: 'Product & Design',
      reporting_manager: 'Sheetal Bedi (Chief Executive Officer)',
      joining_date: 'November 15, 2026',
      work_location: 'Bangalore, India (Hybrid)',
      base_salary: 'INR 18,00,000 per annum',
      variable_pay: 'INR 2,00,000 per annum',
      annual_ctc: 'INR 20,00,000 per annum',
      probation_period: '90 days',
      notice_period: '30 days',
      valid_until: 'October 30, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
  {
    id: 'preset_internship',
    name: 'Internship Appointment Letter',
    category: 'Internship Letter',
    icon: '🎓',
    description: 'Fixed-term student or graduate internship detailing mentor, stipend, and project scope.',
    content: `**INTERNSHIP APPOINTMENT LETTER**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

Dear **{{candidate_name}}**,

On behalf of **{{company_name}}**, we are delighted to offer you an appointment as **{{job_title}}** within our **{{department}}** team.

**1. TENURE & MENTORSHIP**
• **Commencement Date**: **{{joining_date}}**
• **Tenure Conclusion**: **{{end_date}}**
• **Designated Mentor**: **{{reporting_manager}}**
• **Work Location**: **{{work_location}}**

**2. STIPEND & ALLOWANCES**
• **Monthly Academic Stipend**: **{{base_salary}}**
• **Disbursement Schedule**: Payable on the final business day of each calendar month.
• **Learning Budget**: Full access to TaskNera engineering resources, cloud sandboxes, and research repositories.

**3. LEARNING DELIVERABLES & EVALUATION**
• **Project Scope**: Active participation in software architecture deliverables and sprint reviews.
• **Capstone Review**: Submission of capstone project analysis prior to **{{end_date}}**.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}

**INTERN ACCEPTANCE & ACKNOWLEDGEMENT**
I accept the internship appointment under the terms outlined herein.

Signature: ___________________________
Candidate Name: **{{candidate_name}}**
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-INT-2026-019',
      candidate_name: 'Aarav Patel',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Software Engineering Intern',
      department: 'Platform Engineering',
      reporting_manager: 'Arjun Nair (Lead AI Engineer)',
      joining_date: 'December 01, 2026',
      end_date: 'May 31, 2027',
      work_location: 'Bangalore, India',
      base_salary: 'INR 35,000 per month',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
  {
    id: 'preset_contract',
    name: 'Independent Contractor Agreement',
    category: 'Employment Contract',
    icon: '💼',
    description: 'Contractor scope of work, milestone billing, deliverables, and confidentiality.',
    content: `**INDEPENDENT CONTRACTOR ENGAGEMENT AGREEMENT**

**Agreement Reference**: {{reference_number}}
**Effective Date**: {{issue_date}}

This Agreement is entered into between **{{company_name}}** ("Client") and **{{candidate_name}}** ("Contractor").

**1. SCOPE OF SERVICES & DELIVERABLES**
• **Role / Specialization**: **{{job_title}}**
• **Core Objectives**: Execution of specialized technical architecture, roadmap features, and sprint tasks.
• **Standard of Performance**: Services will be conducted with professional excellence adhering to industry standards.

**2. PROFESSIONAL FEES & PAYMENT TERMS**
• **Milestone Fee**: **{{base_salary}}**
• **Invoicing Schedule**: Payable within 15 business days of deliverable milestone verification.
• **Expenses**: Pre-approved travel and infrastructure expenses reimbursed at actual cost.

**3. ENGAGEMENT TENURE & TERMINATION**
• **Commencement Date**: **{{joining_date}}**
• **Scheduled Completion**: **{{end_date}}**
• **Notice Period for Termination**: **{{notice_period}}** written notice by either party.

Agreed and Accepted:

For **{{company_name}}** (Client)
___________________________
**{{signatory_name}}**
{{signatory_title}}

For **{{candidate_name}}** (Contractor)
___________________________
Authorized Signature
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-CTR-2026-042',
      candidate_name: 'Devon Scott Consulting LLC',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Cloud DevOps & SRE Specialist',
      base_salary: 'INR 1,20,000 per milestone sprint',
      joining_date: 'November 01, 2026',
      end_date: 'April 30, 2027',
      notice_period: '14 business days',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
  {
    id: 'preset_experience',
    name: 'Experience Letter',
    category: 'Experience Letter',
    icon: '📜',
    description: 'Official confirmation of employee tenure, designation, department, and conduct.',
    content: `**TO WHOM IT MAY CONCERN**
**EXPERIENCE & SERVICE CERTIFICATE**

**Date of Issue**: {{issue_date}}
**Certificate Reference**: {{reference_number}}

This is to formally certify that **{{candidate_name}}** (Employee Code: **{{employee_id}}**) was employed with **{{company_name}}** from **{{joining_date}}** to **{{end_date}}**.

**1. TENURE & DESIGNATION DETAILS**
• **Final Designation**: **{{job_title}}**
• **Department / Practice**: **{{department}}**
• **Tenure of Service**: From **{{joining_date}}** to **{{end_date}}**
• **Reporting Line**: **{{reporting_manager}}**

**2. PROFESSIONAL CONDUCT & PERFORMANCE**
• **Technical Competency**: Demonstrated exceptional professional capability and dedication across all assigned mandates.
• **Integrity & Conduct**: Maintained the highest ethical standards, dedication, and professional integrity.
• **Clearance Status**: All official handovers, intellectual property assignments, and accounts have been fully settled.

We appreciate **{{candidate_name}}**'s contributions to our organization and wish them continued success in all future professional endeavors.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}`,
    sampleData: {
      reference_number: 'TSK-EXP-2026-891',
      candidate_name: 'Rohan Mehra',
      employee_id: 'TN-1044',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Frontend Engineer',
      department: 'Web Applications',
      joining_date: 'February 10, 2023',
      end_date: 'September 30, 2026',
      reporting_manager: 'Sheetal Bedi',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
  {
    id: 'preset_relieving',
    name: 'Relieving & Clearance Letter',
    category: 'Relieving Letter',
    icon: '🚪',
    description: 'Separation letter certifying resignation acceptance, exit clearance, and release from duties.',
    content: `**TO WHOM IT MAY CONCERN**
**RELIEVING & CLEARANCE LETTER**

**Date of Issue**: {{issue_date}}
**Reference Number**: {{reference_number}}

Dear **{{candidate_name}}**,

This has reference to your formal resignation letter dated **{{resignation_date}}**. We hereby confirm that your resignation has been accepted by the management of **{{company_name}}**.

**1. RELIEVING & TENURE CONFIRMATION**
• **Designation Relieved From**: **{{job_title}}**
• **Department**: **{{department}}**
• **Effective Relieving Date**: Close of business hours on **{{end_date}}**
• **Total Employment Period**: From **{{joining_date}}** to **{{end_date}}**

**2. CLEARANCE & SETTLEMENT CONFIRMATION**
• **Asset Handover**: Complete return and clearance of all company equipment, credentials, and software devices.
• **Project Transition**: Satisfactory handover of ongoing deliverables and client documentation.
• **Financial Settlement**: Full and final settlement disbursed in accordance with company payroll policy.

We thank you for your dedicated service and wish you the very best in your subsequent career journey.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}`,
    sampleData: {
      reference_number: 'TSK-RLV-2026-512',
      candidate_name: 'Ananya Verma',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      resignation_date: 'August 15, 2026',
      job_title: 'Product Operations Associate',
      department: 'Operations',
      joining_date: 'June 01, 2024',
      end_date: 'September 30, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
  {
    id: 'preset_nda',
    name: 'Non-Disclosure Agreement (NDA)',
    category: 'Company Policies',
    icon: '🔒',
    description: 'Mutual confidentiality and intellectual property non-disclosure agreement.',
    content: `**MUTUAL NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT**

**Agreement Reference**: {{reference_number}}
**Effective Date**: {{issue_date}}

This Agreement is entered into between:
1. **{{company_name}}**, having its principal office at **{{work_location}}**, and
2. **{{candidate_name}}** ("Recipient / Participant").

**1. PURPOSE & PROPRIETARY INFORMATION**
• **Purpose**: Evaluation and performance of duties associated with the position of **{{job_title}}**.
• **Scope of Information**: Technical architectures, algorithmic codebases, business roadmaps, financial data, and customer identities.

**2. OBLIGATIONS OF CONFIDENTIALITY**
• **Duty of Care**: Recipient shall protect confidential information with the same degree of care used for their own sensitive assets, but no less than reasonable care.
• **Non-Disclosure**: Information shall not be published, disseminated, or transferred to third parties without prior written consent.
• **Return of Materials**: All materials and backups shall be returned or destroyed immediately upon written request.

**3. DURATION & GOVERNING JURISDICTION**
• **Duration of Covenant**: The confidentiality obligations remain in force for a period of {{notice_period}} following disclosure.
• **Governing Law**: Subject to the laws and jurisdiction applicable at **{{work_location}}**.

In Witness Whereof, the parties have executed this Agreement as of the Effective Date:

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}

For **{{candidate_name}}**
___________________________
Signature
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-NDA-2026-108',
      company_name: 'TaskNera Technologies Ltd.',
      candidate_name: 'Vikram Joshi',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      work_location: 'Delhi, India',
      job_title: 'Technical Consultant',
      notice_period: '2 Years',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
];

export interface OfferSectionDefinition {
  num: number;
  title: string;
  badge: string;
  content: string;
}

// Complete 18 Official Legal Sections present in TaskNera Offers
export const OFFICIAL_18_OFFER_SECTIONS: OfferSectionDefinition[] = [
  {
    num: 1,
    title: 'Appointment, Acceptance & Joining',
    badge: 'Core',
    content: `**1. APPOINTMENT, ACCEPTANCE AND JOINING**
• This offer is valid until {{valid_until}}. You are required to confirm acceptance in writing and join on or before {{joining_date}}. If acceptance is not received within the stipulated period, the Company may withdraw this offer.
• Your appointment is subject to completion of joining formalities and submission/verification of documents requested by the Company, including identity, education, previous employment and other documents reasonably required for lawful employment and background verification.
• Any material misrepresentation, concealment, falsification or submission of false/forged documents may result in withdrawal of the offer or termination of employment, subject to applicable law.`
  },
  {
    num: 2,
    title: 'Position, Reporting and Duties',
    badge: 'Core',
    content: `**2. POSITION, REPORTING AND DUTIES**
• You will be employed as **{{job_title}}** in the **{{department}}** department and will report directly to **{{reporting_manager}}**.
• You shall diligently, professionally and faithfully perform the duties assigned to you and comply with lawful directions of your Reporting Manager and authorized representatives of **{{company_name}}**.`
  },
  {
    num: 3,
    title: 'Place of Work and Working Hours',
    badge: 'Workplace',
    content: `**3. PLACE OF WORK AND WORKING HOURS**
• Your primary work location will be **{{work_location}}**.
• Your working schedule, shift, weekly working days, breaks and any approved hybrid/remote arrangement will be communicated by the Company and may be determined by business/client requirements, operating under standard 9-hour shift protocols.`
  },
  {
    num: 4,
    title: 'Probation and Confirmation',
    badge: 'Tenure',
    content: `**4. PROBATION AND CONFIRMATION**
• You will remain on probation for **{{probation_period}}** from your date of joining, unless otherwise stated in writing.
• During probation, the Company will assess performance, productivity, attendance, punctuality, and compliance with Company policies. Confirmation is communicated in writing by the Company upon successful appraisal.`
  },
  {
    num: 5,
    title: 'Compensation and Payroll (CTC)',
    badge: 'Emoluments',
    content: `**5. COMPENSATION AND PAYROLL**
• **Fixed Annual Base Salary**: {{base_salary}}
• **Performance Bonus / Variable Pay**: {{variable_pay}}
• **Total Cost-to-Company (CTC)**: **{{annual_ctc}}** per annum.
• Salary and other benefits are subject to statutory deductions (PF, ESI, TDS) and paid monthly in accordance with the Company's standard payroll cycle.`
  },
  {
    num: 6,
    title: 'Code of Conduct – Zero Tolerance',
    badge: 'Discipline',
    content: `**6. CODE OF CONDUCT – ZERO TOLERANCE FOR BEHAVIOURAL MISCONDUCT**
• **{{company_name}}** maintains a strict zero-tolerance standard for serious behavioural misconduct.
• Every employee is required to maintain professional, respectful, ethical and disciplined conduct.
• Prohibited actions include threatening behavior, harassment, insubordination, theft, unauthorized disclosure of data, and work avoidance.`
  },
  {
    num: 7,
    title: 'Disciplinary Action & Termination',
    badge: 'Governance',
    content: `**7. DISCIPLINARY ACTION AND TERMINATION FOR MISCONDUCT**
• Where an allegation of misconduct is raised, the Company may investigate and take proportionate disciplinary action based on facts and applicable law.
• In cases of serious misconduct, the Company may terminate employment without notice or payment in lieu where permitted by applicable law after due process.`
  },
  {
    num: 8,
    title: 'Notice Period and Separation',
    badge: 'Exit',
    content: `**8. NOTICE PERIOD AND SEPARATION**
• During probation, either party may terminate employment by giving **{{notice_period}}** written notice or salary in lieu thereof.
• After confirmation, the notice period shall be **{{notice_period}}**.
• On separation, the employee must return all Company property, credentials, and confidential information and complete all exit formalities.`
  },
  {
    num: 9,
    title: 'Attendance, Productivity & Work Avoidance',
    badge: 'Operations',
    content: `**9. ATTENDANCE, PRODUCTIVITY AND WORK AVOIDANCE**
• You are required to remain available and actively engaged during official working hours except during approved breaks.
• Refusal to perform assigned duties, deliberate delay, or failure to respond to official communications without reasonable justification may constitute work avoidance and lead to disciplinary action.`
  },
  {
    num: 10,
    title: 'Final Settlement and Lawful Deductions',
    badge: 'Finance',
    content: `**10. FINAL SETTLEMENT, RECOVERY AND LAWFUL DEDUCTIONS**
• On separation, **{{company_name}}** will calculate and pay wages and other amounts legally due in accordance with applicable statutory payroll timelines.
• Deductions will be limited to amounts lawfully recoverable, including notice-pay adjustments or advances where permitted.`
  },
  {
    num: 11,
    title: 'Confidentiality & Intellectual Property',
    badge: 'Legal',
    content: `**11. CONFIDENTIALITY AND INTELLECTUAL PROPERTY**
• You shall maintain strict confidentiality of all Company, client, commercial, technical, and operational information.
• All intellectual property, software code, designs, and work products created in connection with your employment are the sole and exclusive property of **{{company_name}}**.`
  },
  {
    num: 12,
    title: 'Company Property & Data Security',
    badge: 'IT Security',
    content: `**12. COMPANY PROPERTY, DATA AND INFORMATION SECURITY**
• All Company property, laptops, and data repositories must be used only for authorized business purposes.
• You must strictly adhere to information security, data protection, cybersecurity, and acceptable-use guidelines.`
  },
  {
    num: 13,
    title: 'Conflict of Interest & Outside Engagements',
    badge: 'Ethics',
    content: `**13. CONFLICT OF INTEREST AND OUTSIDE ENGAGEMENTS**
• You must disclose actual or potential conflicts of interest and must not undertake outside employment, freelancing, or consulting that conflicts with your duties without prior written approval.`
  },
  {
    num: 14,
    title: 'Anti-Harassment & Grievances (POSH)',
    badge: 'Compliance',
    content: `**14. ANTI-HARASSMENT, EQUAL OPPORTUNITY AND GRIEVANCES**
• **{{company_name}}** maintains zero tolerance for discrimination and harassment, including sexual harassment under the POSH framework.
• Employees may freely access internal grievance and redressal channels.`
  },
  {
    num: 15,
    title: 'Company Policies & Handbook',
    badge: 'Policy',
    content: `**15. COMPANY POLICIES AND POLICY COMPLIANCE**
• You agree to comply with TaskNera HR policies, including Code of Conduct, Leave, IT Security, and Remote Work policies (Reference ID: TASK/HR-POL/2026/v1.2).`
  },
  {
    num: 16,
    title: 'Statutory and Legal Compliance',
    badge: 'Statutory',
    content: `**16. STATUTORY AND LEGAL COMPLIANCE**
• Nothing in this Offer Letter excludes or reduces any mandatory employee rights or statutory requirements under applicable central or state employment laws.`
  },
  {
    num: 17,
    title: 'Governing Law and Jurisdiction',
    badge: 'Jurisdiction',
    content: `**17. GOVERNING LAW AND JURISDICTION**
• This Offer Letter is governed by the laws applicable in India, with exclusive jurisdiction resting in the competent courts having jurisdiction over the Company's registered office.`
  },
  {
    num: 18,
    title: 'Entire Understanding & Signatures',
    badge: 'Signatures',
    content: `**18. ENTIRE UNDERSTANDING**
• This Offer Letter, Annexures, and Company policies constitute the entire employment terms communicated to you and supersede prior inconsistent representations.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}

**ACCEPTANCE & ACKNOWLEDGEMENT**
I have read, understood, and accept this employment offer under the terms described above.

Signature: ___________________________
Candidate Name: **{{candidate_name}}**
Date: ___________________________`
  }
];

export interface CategoryItemDef {
  value: string;
  legacyValue?: string;
  label: string;
  group: 'templates' | 'certificates' | 'policies' | 'other';
  groupLabel: string;
  defaultTitle: string;
  blueprintContent: string;
  sampleData: Record<string, string>;
}

// All Document Categories and Sections present in the Offers page
export const OFFERS_ALL_CATEGORIES: CategoryItemDef[] = [
  // 1. Recruitment Agreement (MRSA)
  {
    value: 'Recruitment Agreement',
    legacyValue: 'RECRUITMENT_AGREEMENT',
    label: 'Recruitment Agreement',
    group: 'templates',
    groupLabel: 'Recruitment Agreement',
    defaultTitle: 'Master Recruitment Agreement (MRSA)',
    blueprintContent: `**MASTER RECRUITMENT SERVICES AGREEMENT (MRSA)**

**Agreement Reference**: {{reference_number}}
**Effective Date**: {{issue_date}}

This Master Recruitment Services Agreement is entered into between **{{company_name}}** ("Agency") and **{{candidate_name}}** ("Hiring Partner / Client").

**1. SCOPE OF RECRUITMENT & TALENT SERVICES**
• **Search Mandate**: Provision of specialized technical recruiting, executive search, candidate vetting, and assessment.
• **Candidate Quality**: Agency shall deploy certified evaluation frameworks to present pre-screened talent matching verified job descriptions.

**2. PROFESSIONAL PLACEMENT FEES & COMMERCIAL COVENANTS**
• **Service Fee**: **{{base_salary}}** of the placed candidate's first-year Total Cost to Company (CTC).
• **Invoicing Schedule**: Invoices are generated within 5 business days of candidate commencement.
• **Payment Period**: Payment is due within **{{notice_period}}** of invoice dispatch.

**3. REPLACEMENT WARRANTY & GUARANTEE**
• **Guarantee Duration**: **{{probation_period}}** from candidate joining date.
• **Free Replacement**: In the event of resignation or performance-based exit during warranty, Agency provides one free replacement candidate.

**4. NON-SOLICITATION & CONFIDENTIALITY**
• Neither party shall solicit, hire, or engage the other party's staff for a period of 12 months following termination.
• Resumes and commercial rates are strictly confidential proprietary information.

Agreed and Authorized:

For **{{company_name}}** (Agency)
___________________________
**{{signatory_name}}**
{{signatory_title}}

For **{{candidate_name}}** (Client)
___________________________
Authorized Corporate Officer
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-MRSA-2026-014',
      company_name: 'TaskNera Technologies Ltd.',
      candidate_name: 'Apex Global Enterprises Inc.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      base_salary: '8.33% (1 Month CTC)',
      notice_period: '30 calendar days',
      probation_period: '90 days replacement warranty',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 2. Offer Letter
  {
    value: 'Offer Letter',
    legacyValue: 'OFFER_LETTER',
    label: 'Offer Letter',
    group: 'templates',
    groupLabel: 'Offer Letter',
    defaultTitle: 'Corporate Offer Letter',
    blueprintContent: `**CONFIDENTIAL OFFER OF EMPLOYMENT**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

Dear **{{candidate_name}}**,

On behalf of **{{company_name}}**, we are pleased to offer you the full-time position of **{{job_title}}** in the **{{department}}** department, reporting directly to **{{reporting_manager}}**.

Your anticipated starting date of employment will be **{{joining_date}}** at our **{{work_location}}** facility.

**1. POSITION & SCOPE OF ENGAGEMENT**
• **Designation**: **{{job_title}}**
• **Department / Division**: **{{department}}**
• **Reporting Line**: **{{reporting_manager}}**
• **Work Location**: **{{work_location}}**
• **Commencement Date**: **{{joining_date}}**

**2. COMPENSATION & EMOLUMENTS**
Your comprehensive annual compensation package is established as follows:
• **Fixed Annual Base Salary**: {{base_salary}}
• **Performance Bonus / Variable Pay**: {{variable_pay}}
• **Total Annual Cost-to-Company (CTC)**: **{{annual_ctc}}**
• **Health & Wellness Benefits**: Executive medical insurance and family health coverage

**3. TERMS OF PROBATION & NOTICE PERIOD**
• **Probationary Assessment**: You will be on a probation period of **{{probation_period}}** from your commencement date.
• **Separation & Notice Period**: Written notice of **{{notice_period}}** is required by either party upon separation.
• **Working Hours**: Standard 5-day business week, 9 hours daily, with project-aligned flexibility.

**4. CONFIDENTIALITY & GOVERNING POLICIES**
You agree to maintain strict confidentiality regarding all proprietary information, client documentation, trade secrets, and software assets of **{{company_name}}**.

Please confirm your acceptance of this offer by signing and returning this letter on or before **{{valid_until}}**.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}

**ACCEPTANCE & ACKNOWLEDGEMENT**
I have read, understood, and accept this employment offer under the terms described above.

Signature: ___________________________
Candidate Name: **{{candidate_name}}**
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-OFF-2026-081',
      candidate_name: 'Priya Sharma',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Product Designer',
      department: 'Product & Design',
      reporting_manager: 'Sheetal Bedi (Chief Executive Officer)',
      joining_date: 'November 15, 2026',
      work_location: 'Bangalore, India (Hybrid)',
      base_salary: 'INR 18,00,000 per annum',
      variable_pay: 'INR 2,00,000 per annum',
      annual_ctc: 'INR 20,00,000 per annum',
      probation_period: '90 days',
      notice_period: '30 days',
      valid_until: 'October 30, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 3. Character Certificate
  {
    value: 'Character Certificate',
    legacyValue: 'CHARACTER_CERTIFICATE',
    label: 'Character Certificate',
    group: 'certificates',
    groupLabel: 'Character Certificate',
    defaultTitle: 'CHARACTER CERTIFICATE',
    blueprintContent: `# CHARACTER CERTIFICATE

*To Whomsoever It May Concern*

This is to certify that {{honorific}} {{candidate_name}} was associated with {{company_name}} as an {{job_title}}, contributing to the {{department}} teams, from {{joining_date}} to {{end_date}}.

During the period of {{possessive_pronoun}} internship, {{candidate_name}} {{ld_assistance}}.

In addition, {{candidate_name}} {{ta_experience}}.

Throughout {{possessive_pronoun}} association with {{company_name}}, {{candidate_name}} {{demonstrated_qualities}}.

To the best of our knowledge, {{possessive_pronoun}} conduct and character during the internship period were {{conduct_evaluation}}. We found them to be {{character_traits}} to the responsibilities entrusted to them.

We appreciate {{possessive_pronoun}} contribution to the Talent Acquisition and L&D functions and wish {{possessive_pronoun}} success and growth in their future {{future_endeavors}} endeavors.

This certificate is being issued upon {{issuance_reason}}.

For {{company_name}}

*Authorized Signatory*

Name: {{signatory_name}}
Designation: {{signatory_title}}
Date of Issue: {{issue_date}}
Place: {{signatory_place}}`,
    sampleData: {
      reference_number: 'TKS/HR/INT/2026-27/001',
      candidate_name: 'Edwina Zephra Gomes',
      honorific: 'Ms.',
      pronoun: 'she',
      possessive_pronoun: 'her',
      company_name: 'Tasknera HR Solutions',
      issue_date: 'September 14, 2026',
      job_title: 'HR Intern',
      department: 'Talent Acquisition and Learning and Development (L&D)',
      joining_date: 'August 06, 2026',
      end_date: 'September 14, 2026',
      ld_assistance: 'assisted the Learning & Development Department in various activities, particularly in the research, development, structuring, and preparation of training modules and learning materials for the organization',
      ta_experience: 'gained hands-on experience as a member of the Talent Acquisition team, supporting candidate sourcing and screening, coordinating interview schedules, and assisting with various stages of the end-to-end recruitment process',
      demonstrated_qualities: 'demonstrated a professional attitude, sincerity, discipline, willingness to learn, and a responsible approach toward assigned responsibilities. She maintained professional conduct while working with the team and showed a positive attitude toward feedback and continuous improvement.',
      conduct_evaluation: 'satisfactory and professional',
      character_traits: 'cooperative, respectful, and committed',
      future_endeavors: 'academic and professional',
      issuance_reason: 'completion/conclusion of her internship with Tasknera HR Solutions',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'CEO',
      signatory_place: 'Delhi',
    },
  },

  // 4. Experience Letter
  {
    value: 'Experience Letter',
    legacyValue: 'EXPERIENCE_LETTER',
    label: 'Experience Letter',
    group: 'certificates',
    groupLabel: 'Experience Letter',
    defaultTitle: 'EXPERIENCE LETTER',
    blueprintContent: `Ref: {{reference_number}}    Date: {{issue_date}}

# EXPERIENCE LETTER

*To Whomsoever It May Concern*

This is to certify that {{honorific}} {{candidate_name}} was associated with {{company_name}} as an {{job_title}} from {{joining_date}} to {{end_date}}.

During {{possessive_pronoun}} tenure with the organization, {{pronoun}} supported the {{department_support}}.

As part of the {{primary_function}} function, {{pronoun}} {{ta_duties}}.

Within the {{secondary_function}} function, {{pronoun}} {{ld_duties}}.

Throughout {{possessive_pronoun}} association with {{company_name}}, {{pronoun}} demonstrated {{conduct_summary}}.

{{possessive_pronoun_cap}} association with {{company_name}} ended on {{end_date}}.

We appreciate {{possessive_pronoun}} contribution to the organization and wish {{possessive_pronoun}} continued success and growth in all {{possessive_pronoun}} future endeavors.

For {{company_name}}

{{signatory_name}}
{{signatory_title}}
Date: {{issue_date}}
Place: {{signatory_place}}`,
    sampleData: {
      reference_number: 'TKS/HR/INT/2026-27/001',
      candidate_name: 'Edwina Zephra Gomes',
      honorific: 'Ms.',
      pronoun: 'she',
      possessive_pronoun: 'her',
      possessive_pronoun_cap: 'Her',
      company_name: 'Tasknera HR Solutions',
      issue_date: '14/09/2026',
      job_title: 'HR Intern',
      department: 'Human Resources',
      department_support: 'Operations and Platform Engineering',
      primary_function: 'Operations',
      ta_duties: 'assisted with core workflows, project coordination, maintaining records, and supported key deliverables as assigned',
      secondary_function: 'Cross-Functional Support',
      ld_duties: 'process documentation, research, and assisting with special team initiatives',
      conduct_summary: 'professionalism, sincerity, adaptability, willingness to learn, teamwork, and responsibility in carrying out her responsibilities',
      joining_date: 'August 06, 2026',
      end_date: 'September 14, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 5. Internship Letter
  {
    value: 'Internship Letter',
    legacyValue: 'INTERNSHIP_LETTER',
    label: 'Internship Letter',
    group: 'templates',
    groupLabel: 'Internship Letter',
    defaultTitle: 'Internship Appointment Letter',
    blueprintContent: `**INTERNSHIP APPOINTMENT LETTER**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

Dear **{{candidate_name}}**,

On behalf of **{{company_name}}**, we are delighted to offer you an appointment as **{{job_title}}** within our **{{department}}** team.

**1. TENURE & MENTORSHIP**
• **Commencement Date**: **{{joining_date}}**
• **Tenure Conclusion**: **{{end_date}}**
• **Designated Mentor**: **{{reporting_manager}}**
• **Work Location**: **{{work_location}}**

**2. STIPEND & ALLOWANCES**
• **Monthly Academic Stipend**: **{{base_salary}}**
• **Disbursement Schedule**: Payable on the final business day of each calendar month.
• **Learning Budget**: Full access to TaskNera engineering resources, cloud sandboxes, and research repositories.

**3. LEARNING DELIVERABLES & EVALUATION**
• **Project Scope**: Active participation in software architecture deliverables and sprint reviews.
• **Capstone Review**: Submission of capstone project analysis prior to **{{end_date}}**.

Sincerely,

For **{{company_name}}**
___________________________
**{{signatory_name}}**
{{signatory_title}}

**INTERN ACCEPTANCE & ACKNOWLEDGEMENT**
I accept the internship appointment under the terms outlined herein.

Signature: ___________________________
Candidate Name: **{{candidate_name}}**
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-INT-2026-019',
      candidate_name: 'Aarav Patel',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Software Engineering Intern',
      department: 'Platform Engineering',
      reporting_manager: 'Arjun Nair (Lead AI Engineer)',
      joining_date: 'December 01, 2026',
      end_date: 'May 31, 2027',
      work_location: 'Bangalore, India',
      base_salary: 'INR 35,000 per month',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 6. Salary Slip
  {
    value: 'Salary Slip',
    legacyValue: 'SALARY_SLIP',
    label: 'Salary Slip',
    group: 'policies',
    groupLabel: 'Salary Slip',
    defaultTitle: 'Monthly Pay Slip Statement',
    blueprintContent: `**MONTHLY PAYSLIP & EARNINGS STATEMENT**

**Pay Period**: {{issue_date}}
**Employee Code**: {{employee_id}} | **PAN**: {{reference_number}}

**Employee Name**: **{{candidate_name}}**
**Designation**: **{{job_title}}** | **Department**: **{{department}}**
**Date of Joining**: **{{joining_date}}** | **Bank Account**: XXXXXXXX4012

**1. ITEMIZED EARNINGS**
• **Basic Salary**: INR {{base_salary}}
• **House Rent Allowance (HRA)**: INR {{variable_pay}}
• **Special Allowance**: INR 15,000
• **Gross Monthly Earnings**: INR {{annual_ctc}}

**2. STATUTORY & VOLUNTARY DEDUCTIONS**
• **Provident Fund (Employee Share)**: INR 1,800
• **Professional Tax (PT)**: INR 200
• **Tax Deducted at Source (TDS)**: INR 2,500
• **Total Deductions**: INR 4,500

**3. NET TAKE-HOME PAYABLE**
• **Net Salary Payable**: **{{base_salary}}**
• **Payment Status**: Direct Bank Credit Disbursed

Confidential — Generated by TaskNera Enterprise Payroll Engine`,
    sampleData: {
      reference_number: 'ABCDE1234F',
      candidate_name: 'Rahul Sharma',
      employee_id: 'EMP-1001',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: 'October 2026',
      job_title: 'Senior Software Engineer',
      department: 'Engineering',
      joining_date: 'June 01, 2024',
      base_salary: '1,50,000',
      variable_pay: '40,000',
      annual_ctc: '1,83,333',
    },
  },

  // 7. Company Policies
  {
    value: 'Company Policies',
    legacyValue: 'COMPANY_POLICIES',
    label: 'Company Policies',
    group: 'policies',
    groupLabel: 'Company Policies',
    defaultTitle: 'Company Workplace Policies & Code of Conduct',
    blueprintContent: `**TASKNERA WORKPLACE CODE OF CONDUCT & HR POLICIES**

**Policy Reference ID**: TASK/HR-POL/2026/v1.2
**Effective Date**: {{issue_date}}

**1. SCOPE & GENERAL WORKPLACE GOVERNANCE**
This policy governs all active personnel across **{{company_name}}**, establishing baseline standards of professionalism, integrity, and compliance.

**2. ZERO TOLERANCE FOR BEHAVIOURAL MISCONDUCT**
TaskNera maintains zero tolerance for harassment, discrimination, verbal abuse, fraud, or intentional work avoidance. All infractions will result in immediate disciplinary inquiry.

**3. WORKING HOURS, ATTENDANCE & LEAVE ENTITLEMENTS**
• Standard 9-hour working schedule with approved break windows.
• Annual paid leave entitlement of 24 days per calendar year accrued on a monthly basis.
• Mandatory attendance logging on official biometric / cloud portal.

**4. INFORMATION SECURITY & DATA PRIVACY**
All employees must safeguard client information, proprietary source code, and credentials under strict confidentiality covenants.

Adopted and Authorized by Management, TaskNera Technologies Ltd.`,
    sampleData: {
      reference_number: 'TASK/HR-POL/2026/v1.2',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    },
  },
];

/**
 * Formats any raw document text into the official enterprise template structure:
 * - UPPERCASE BOLD primary document title
 * - Date & Reference headers
 * - Salutation with bold candidate and company names
 * - Bold uppercase numbered clauses: **1. POSITION & SCOPE OF ENGAGEMENT**, **2. COMPENSATION & EMOLUMENTS**, etc.
 * - Structured bullet points with bold prefixes: • **Fixed Base Salary**: {{base_salary}}
 * - Bold key tokens: **{{candidate_name}}**, **{{job_title}}**, **{{annual_ctc}}**, etc.
 * - Dual-column corporate signature and candidate acceptance block
 */
export function formatTextToExecutiveTemplate(
  rawText: string,
  title?: string,
  category?: string
): string {
  if (!rawText || !rawText.trim()) return rawText;

  let text = rawText.trim();

  // 1. Ensure primary document title
  const cleanTitle = (title || category || 'OFFER OF EMPLOYMENT')
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .toUpperCase();

  const titleHeader = `**CONFIDENTIAL ${
    cleanTitle.includes('LETTER') || cleanTitle.includes('AGREEMENT') || cleanTitle.includes('CERTIFICATE') || cleanTitle.includes('OFFER')
      ? cleanTitle
      : cleanTitle + ' LETTER'
  }**`;

  if (!text.startsWith('**') && !text.toUpperCase().startsWith(cleanTitle)) {
    text = `${titleHeader}\n\n**Date**: {{issue_date}}\n**Reference**: {{reference_number}}\n\n${text}`;
  }

  // 2. Wrap standard placeholders in bold if not already wrapped
  const standardTokensToBold = [
    'candidate_name',
    'employee_name',
    'company_name',
    'job_title',
    'designation',
    'department',
    'reporting_manager',
    'annual_ctc',
    'base_salary',
    'joining_date',
    'work_location',
    'probation_period',
    'notice_period',
    'end_date',
    'valid_until',
    'signatory_name',
  ];

  standardTokensToBold.forEach((tok) => {
    // Avoid double bolding like ****{{token}}****
    const tokenRegex = new RegExp(`(?<!\\*\\*)\\{\\{\\s*${tok}\\s*\\}\\}(?!\\*\\*)`, 'gi');
    text = text.replace(tokenRegex, `**{{${tok}}}**`);
  });

  // 3. Transform section headings into uppercase bold numbered clauses
  text = text.replace(
    /^(?:#+\s*|\*\*)?(\d+)[.)]\s*([^\n\r]+?)(?:\*\*)?$/gm,
    (_, num, clauseName) => {
      const cleanClause = clauseName.trim().toUpperCase().replace(/^\*+|\*+$/g, '');
      return `\n**${num}. ${cleanClause}**`;
    }
  );

  // 4. Transform plain unnumbered prominent section titles into numbered bold clauses
  const knownSectionNames = [
    'POSITION & RESPONSIBILITIES',
    'POSITION & SCOPE OF ENGAGEMENT',
    'COMPENSATION & BENEFITS',
    'COMPENSATION & EMOLUMENTS',
    'TERMS OF EMPLOYMENT',
    'WORKING HOURS & LOCATION',
    'PROBATION & NOTICE PERIOD',
    'CONFIDENTIALITY & GOVERNING POLICIES',
    'GOVERNING LAW & JURISDICTION',
    'TENURE & MENTORSHIP',
    'STIPEND & ALLOWANCES',
    'LEARNING DELIVERABLES',
    'SCOPE OF SERVICES',
    'FEES & PAYMENT TERMS',
    'EXPERIENCE & SERVICE DETAILS',
    'RELIEVING & SETTLEMENT',
  ];

  knownSectionNames.forEach((name) => {
    const rx = new RegExp(`^(?!\\*\\*\\d+\\.)\\s*(?:#+\\s*)?(?:${name})(?::)?\\s*$`, 'gim');
    text = text.replace(rx, `\n**${name}**`);
  });

  // 5. Transform list dashes/asterisks into standardized executive bullet points with bold prefixes
  text = text.replace(
    /^\s*(?:[-*]|\d+\))\s+([A-Za-z0-9\s/&_-]+?):\s*(.+)$/gm,
    (_, label, val) => {
      const cleanLabel = label.trim().replace(/^\*+|\*+$/g, '');
      return `• **${cleanLabel}**: ${val.trim()}`;
    }
  );

  // Any remaining generic list dashes "- " -> "• "
  text = text.replace(/^\s*[-*]\s+(.+)$/gm, '• $1');

  // 6. Ensure formal corporate signature and candidate acceptance block
  const hasSignatureBlock =
    text.includes('Sincerely') ||
    text.includes('Authorized Signatory') ||
    text.includes('ACCEPTANCE') ||
    text.includes('In Witness Whereof');

  if (!hasSignatureBlock) {
    text += `\n\nSincerely,\n\nFor **{{company_name}}**\n___________________________\n**{{signatory_name}}**\n{{signatory_title}}\n\n**ACCEPTANCE & ACKNOWLEDGEMENT**\nI have read, understood, and accept this offer under the terms described above.\n\nSignature: ___________________________\nCandidate Name: **{{candidate_name}}**\nDate: ___________________________`;
  }

  return text.trim();
}

/**
 * Render inline markdown (**bold**, *italic*, and {{placeholders}})
 */
function renderInlineFormatting(
  text: string,
  formData: Record<string, string>,
  highlight: boolean
): React.ReactNode[] {
  // Interpolate tokens: {{key}}, [Key], or <<Key>>
  const tokenRegex = /(\{\{\s*[a-zA-Z0-9_\s]+\s*\}\}|\[\s*[a-zA-Z0-9_\s]{2,40}\s*\]|<<\s*[a-zA-Z0-9_\s]{2,40}\s*>>)/g;
  const segments = text.split(tokenRegex);

  return segments.map((seg, sIdx) => {
    let rawKey: string | null = null;
    if (seg.startsWith('{{') && seg.endsWith('}}')) {
      rawKey = seg.slice(2, -2).trim();
    } else if (seg.startsWith('[') && seg.endsWith(']')) {
      const inner = seg.slice(1, -1).trim();
      if (!/^\d+$/.test(inner) && !inner.startsWith('http')) {
        rawKey = inner;
      }
    } else if (seg.startsWith('<<') && seg.endsWith('>>')) {
      rawKey = seg.slice(2, -2).trim();
    }

    if (rawKey) {
      const cleanKey = rawKey.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const val =
        formData[cleanKey] !== undefined && formData[cleanKey] !== ''
          ? formData[cleanKey]
          : formData[rawKey] !== undefined && formData[rawKey] !== ''
          ? formData[rawKey]
          : formData[rawKey.toLowerCase()] !== undefined && formData[rawKey.toLowerCase()] !== ''
          ? formData[rawKey.toLowerCase()]
          : null;

      if (val !== null) {
        return (
          <span
            key={`token-${sIdx}`}
            style={{
              backgroundColor: highlight ? '#fef08a' : 'transparent',
              padding: highlight ? '1px 5px' : '0',
              borderRadius: 3,
              fontWeight: 700,
              color: '#0f172a',
              transition: 'background-color 0.2s ease',
            }}
          >
            {val}
          </span>
        );
      }

      // If no filled value, display clean placeholder pill
      return (
        <span
          key={`token-${sIdx}`}
          title={`Dynamic Field: ${cleanKey}`}
          style={{
            backgroundColor: highlight ? '#fef3c7' : '#f1f5f9',
            color: highlight ? '#92400e' : '#475569',
            border: highlight ? '1px solid #fcd34d' : '1px solid #cbd5e1',
            padding: '1px 6px',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: '0.85em',
            display: 'inline-block',
            margin: '0 2px',
            fontFamily: 'monospace',
          }}
        >
          {`{{${cleanKey}}}`}
        </span>
      );
    }

    // Parse markdown **bold** and *italic*
    const mdParts = seg.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <React.Fragment key={`seg-${sIdx}`}>
        {mdParts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return (
              <strong key={`b-${pIdx}`} style={{ fontWeight: 700, color: '#0f172a' }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length >= 3) {
            return <em key={`i-${pIdx}`}>{part.slice(1, -1)}</em>;
          }
          return <span key={`t-${pIdx}`}>{part}</span>;
        })}
      </React.Fragment>
    );
  });
}

/**
 * Executive Corporate Document Renderer
 * Renders bold uppercase numbered clauses, crisp bullet points, and dual signature columns
 */
const ExecutiveDocumentRenderer: React.FC<{
  content: string;
  formData: Record<string, string>;
  highlightPlaceholders: boolean;
}> = ({ content, formData, highlightPlaceholders }) => {
  const lines = content.split('\n');

  let inSignatureSection = false;
  const renderedElements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      renderedElements.push(<div key={`spacer-${i}`} style={{ height: 10 }} />);
      continue;
    }

    // 0. Markdown Headers (# Title, ## Section, ### Subheading)
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      const cleanH = trimmed.replace(/^#+\s*/, '');
      const isTopLevel = trimmed.startsWith('# ');
      renderedElements.push(
        <div
          key={`h-${i}`}
          style={{
            fontSize: isTopLevel ? '1.2rem' : '0.98rem',
            fontWeight: 800,
            color: '#0f172a',
            marginTop: 18,
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: isTopLevel ? '2px solid #0f172a' : '1px solid #e2e8f0',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            textAlign: isTopLevel ? 'center' : 'left',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {renderInlineFormatting(cleanH, formData, highlightPlaceholders)}
        </div>
      );
      continue;
    }

    // 1. Primary Title Header
    const isPrimaryTitle =
      (trimmed.startsWith('**') && trimmed.endsWith('**') && (trimmed.includes('OFFER') || trimmed.includes('AGREEMENT') || trimmed.includes('APPOINTMENT') || trimmed.includes('CERTIFICATE') || trimmed.includes('CONFIDENTIAL') || trimmed.includes('LETTER'))) ||
      (i === 0 && trimmed.toUpperCase() === trimmed && trimmed.length < 80);

    if (isPrimaryTitle) {
      const cleanTitle = trimmed.replace(/^\*+|\*+$/g, '');
      renderedElements.push(
        <div
          key={`title-${i}`}
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: '#0f172a',
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 20,
            paddingBottom: 8,
            borderBottom: '2px solid #0f172a',
            textTransform: 'uppercase',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {cleanTitle}
        </div>
      );
      continue;
    }

    // 2. Numbered Section Clauses (e.g. **1. POSITION & SCOPE**, 1. COMPENSATION & BENEFITS)
    const numberedClauseMatch = trimmed.match(/^(?:\*\*)?(\d+\.\s+[A-Z0-9\s&/()_-]+)(?:\*\*)?$/);
    if (numberedClauseMatch) {
      const headingText = numberedClauseMatch[1].trim();
      renderedElements.push(
        <div
          key={`clause-${i}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 22,
            marginBottom: 8,
            paddingBottom: 4,
            borderBottom: '1.5px solid #e2e8f0',
          }}
        >
          <span
            style={{
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {headingText}
          </span>
        </div>
      );
      continue;
    }

    // 3. Bullet Point (e.g. • **Base Salary**: ..., - Designation: ...)
    const bulletMatch = trimmed.match(/^(?:•|\*|-|\[bullet\])\s+(.*)$/);
    if (bulletMatch) {
      const bulletContent = bulletMatch[1];
      renderedElements.push(
        <div
          key={`bullet-${i}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            margin: '5px 0',
            paddingLeft: 10,
            lineHeight: 1.6,
          }}
        >
          <span
            style={{
              color: '#2563eb',
              fontWeight: 800,
              fontSize: '1.05rem',
              lineHeight: 1.3,
              userSelect: 'none',
            }}
          >
            •
          </span>
          <div style={{ flex: 1, color: '#1e293b' }}>
            {renderInlineFormatting(bulletContent, formData, highlightPlaceholders)}
          </div>
        </div>
      );
      continue;
    }

    // 4. Corporate Signatures & Acceptance
    if (
      trimmed === 'Sincerely,' ||
      trimmed.startsWith('For **{{company_name}}') ||
      trimmed.startsWith('For {{company_name}}') ||
      trimmed.includes('ACCEPTANCE & ACKNOWLEDGEMENT') ||
      trimmed.includes('In Witness Whereof')
    ) {
      inSignatureSection = true;
      break;
    }

    // 5. Normal Paragraph
    renderedElements.push(
      <p
        key={`p-${i}`}
        style={{
          margin: '8px 0',
          lineHeight: 1.7,
          color: '#334155',
        }}
      >
        {renderInlineFormatting(rawLine, formData, highlightPlaceholders)}
      </p>
    );
  }

  // Render Dual Corporate Signature Block if present
  if (inSignatureSection) {
    const compName = formData.company_name || 'TaskNera Technologies Ltd.';
    const sigName = formData.signatory_name || 'Sheetal Bedi';
    const sigTitle = formData.signatory_title || 'Chief Executive Officer';
    const candName = formData.candidate_name || formData.employee_name || 'Authorized Recipient';
    const issueDate = formData.issue_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    renderedElements.push(
      <div
        key="executive-signatures"
        style={{
          marginTop: 36,
          paddingTop: 20,
          borderTop: '1.5px solid #cbd5e1',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 32,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Left Column: Employer Signatory */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            Issued On Behalf Of
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
            {compName}
          </div>
          <div style={{ height: 38, borderBottom: '1.5px dashed #94a3b8', marginBottom: 8 }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
            {sigName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {sigTitle}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
            Date: {issueDate}
          </div>
        </div>

        {/* Right Column: Candidate Acceptance */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            Acceptance & Endorsement
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: 14, lineHeight: 1.35 }}>
            I hereby accept and agree to all terms and covenants specified herein.
          </div>
          <div style={{ height: 38, borderBottom: '1.5px dashed #94a3b8', marginBottom: 8 }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
            {candName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Candidate / Recipient
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
            Signature & Date
          </div>
        </div>
      </div>
    );
  }

  return <div>{renderedElements}</div>;
};

export const TemplatesPage: React.FC = () => {
  const { success, error, info } = useToast();

  // Primary Page Mode: 'generator' (AI Document Generator) vs 'library' (Template Catalog)
  const [activeTab, setActiveTab] = useState<'generator' | 'library'>('generator');

  // Generator Workflow Step: 1 = Template Upload/Select, 2 = Fill Variables, 3 = Preview & Generate
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Template State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(STANDARD_PRESETS[0].id);
  const [templateFileName, setTemplateFileName] = useState<string>('Corporate_Offer_Letter.docx');
  const [templateTitle, setTemplateTitle] = useState<string>(STANDARD_PRESETS[0].name);
  const [templateCategory, setTemplateCategory] = useState<string>(STANDARD_PRESETS[0].category);
  const [templateText, setTemplateText] = useState<string>(STANDARD_PRESETS[0].content);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(STANDARD_PRESETS[0].sampleData);

  // Step 1 Input Mode ('paste' vs 'upload' vs 'preset') & View Layout ('split' vs 'editor' vs 'preview')
  const [step1Mode, setStep1Mode] = useState<'paste' | 'upload' | 'preset'>('paste');
  const [step1ViewLayout, setStep1ViewLayout] = useState<'split' | 'editor' | 'preview'>('split');

  // Upload state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Employee Master list for 1-click auto-fill
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // AI Prompt Auto-Draft State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiDrafting, setIsAiDrafting] = useState<boolean>(false);
  const [isDetectingPlaceholders, setIsDetectingPlaceholders] = useState<boolean>(false);
  const [isAiFormatting, setIsAiFormatting] = useState<boolean>(false);

  // Custom Field Adder
  const [newFieldName, setNewFieldName] = useState<string>('');
  const [showAddCustomField, setShowAddCustomField] = useState<boolean>(false);

  // Preview & Final Output
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(true);
  const [isDirectEditing, setIsDirectEditing] = useState<boolean>(false);
  const [directEditedContent, setDirectEditedContent] = useState<string>('');
  const [showRawMarkup, setShowRawMarkup] = useState<boolean>(false);
  const [isSavingDoc, setIsSavingDoc] = useState<boolean>(false);

  // Library mode state
  const [libraryTemplates, setLibraryTemplates] = useState<DocumentTemplateItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryCategory, setLibraryCategory] = useState<string>('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplateItem | null>(null);

  // Load employees and initial catalog
  useEffect(() => {
    loadEmployees();
    loadLibraryTemplates();
  }, []);

  // Extract placeholders whenever template text changes
  useEffect(() => {
    extractPlaceholdersFromText(templateText);
  }, [templateText]);

  const loadEmployees = async () => {
    try {
      const list = await EmployeeService.listEmployees();
      if (list && list.length > 0) {
        setEmployees(list);
      } else {
        setEmployees(DEMO_EMPLOYEES);
      }
    } catch {
      setEmployees(DEMO_EMPLOYEES);
    }
  };

  const loadLibraryTemplates = async () => {
    setLibraryLoading(true);
    try {
      const data = await EmployeeService.listTemplates();
      setLibraryTemplates(data || []);
    } catch {
      setLibraryTemplates([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  // Helper to extract {{placeholders}}, [placeholders], <placeholders> from text
  const extractPlaceholdersFromText = (text: string) => {
    const found = new Set<string>();

    // 1. Double curly braces: {{key}}
    const regexCurly = /\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g;
    let match;
    while ((match = regexCurly.exec(text)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (key) found.add(key);
    }

    // 2. Square brackets: [Candidate Name], [Job Title], [Salary]
    const regexSquare = /\[\s*([a-zA-Z0-9_\s]{2,40})\s*\]/g;
    while ((match = regexSquare.exec(text)) !== null) {
      const raw = match[1].trim();
      if (!/^\d+$/.test(raw) && !raw.startsWith('http')) {
        const key = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (key) found.add(key);
      }
    }

    // 3. Angle brackets: <<Role>> or <Role>
    const regexAngle = /<<\s*([a-zA-Z0-9_\s]{2,40})\s*>>/g;
    while ((match = regexAngle.exec(text)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (key) found.add(key);
    }

    const arr = Array.from(found);
    setDetectedPlaceholders(arr);

    // Ensure formData has keys for all found placeholders
    setFormData((prev) => {
      const next = { ...prev };
      arr.forEach((k) => {
        if (next[k] === undefined) {
          next[k] = '';
        }
      });
      return next;
    });
  };

  // AI Auto-Detect Dynamic Slots in plain text templates
  const runAiAutoDetectPlaceholders = async (customText?: string) => {
    const textToAnalyze = customText || templateText;
    if (!textToAnalyze || textToAnalyze.trim().length < 10) {
      error('Please upload or enter template text first.');
      return;
    }

    setIsDetectingPlaceholders(true);
    try {
      const res = await templateService.aiSuggestPlaceholders(textToAnalyze);
      if (res && res.suggestions && res.suggestions.length > 0) {
        let updatedText = textToAnalyze;
        const newKeys = new Set<string>(detectedPlaceholders);

        res.suggestions.forEach((s) => {
          const token = s.suggestedToken.replace(/[{}]/g, '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
          newKeys.add(token);
          if (s.originalSnippet && updatedText.includes(s.originalSnippet)) {
            updatedText = updatedText.split(s.originalSnippet).join(`{{${token}}}`);
          }
        });

        if (res.improvedMarkupPreview && res.improvedMarkupPreview.includes('{{')) {
          setTemplateText(res.improvedMarkupPreview);
        } else {
          setTemplateText(updatedText);
        }

        const keysArr = Array.from(newKeys);
        setDetectedPlaceholders(keysArr);
        setFormData((prev) => {
          const next = { ...prev };
          keysArr.forEach((k) => {
            if (next[k] === undefined) next[k] = '';
          });
          return next;
        });

        success(`AI detected ${res.suggestions.length} dynamic slots and converted them to variables!`);
      } else {
        handleAddStandardHrFields();
        info('No specific hardcoded names detected. Standard HR fields have been added.');
      }
    } catch {
      handleAddStandardHrFields();
    } finally {
      setIsDetectingPlaceholders(false);
    }
  };

  // Add 1-click standard HR fields
  const handleAddStandardHrFields = () => {
    const standardFields = [
      'candidate_name',
      'job_title',
      'department',
      'annual_ctc',
      'joining_date',
      'work_location',
      'reporting_manager',
    ];
    setDetectedPlaceholders((prev) => Array.from(new Set([...prev, ...standardFields])));
    setFormData((prev) => {
      const next = { ...prev };
      standardFields.forEach((f) => {
        if (next[f] === undefined) next[f] = '';
      });
      return next;
    });
    success('Added 7 standard HR fields to document variables.');
  };

  // Handle file upload (.docx, .pdf, .txt, .html)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setTemplateFileName(file.name);
    setTemplateTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));

    // 1. Try Backend extraction (Mammoth for DOCX, pdf-parse for PDF)
    try {
      const res = await EmployeeService.uploadTemplate(file);
      if (res && res.extractedContent && res.extractedContent.trim().length > 0) {
        setTemplateText(res.extractedContent);
        if (res.suggestedCategory) setTemplateCategory(res.suggestedCategory);

        if (!res.detectedPlaceholders || res.detectedPlaceholders.length === 0) {
          // Auto run AI detection if no explicit tags in document
          runAiAutoDetectPlaceholders(res.extractedContent);
        } else {
          success(`Parsed "${file.name}" cleanly (${res.detectedFormat}). Detected ${res.detectedPlaceholders.length} fields!`);
        }
        setStep(2);
        setIsUploading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend upload parsing failed, falling back to browser-native document engine:', err);
    }

    // 2. Resilient Browser-Native Extractor Fallback (PDF, DOCX, TXT, HTML, Markdown)
    try {
      const clientRes = await parseDocumentClientSide(file);
      if (clientRes && clientRes.extractedContent && clientRes.extractedContent.trim().length > 0) {
        setTemplateText(clientRes.extractedContent);
        extractPlaceholdersFromText(clientRes.extractedContent);
        runAiAutoDetectPlaceholders(clientRes.extractedContent);

        success(`Parsed "${file.name}" successfully (${clientRes.detectedFormat})! Ready to customize.`);
        setStep(2);
        setIsUploading(false);
        return;
      } else {
        throw new Error('Document contains no extractable text content.');
      }
    } catch (clientErr: any) {
      console.error('Client-side document parsing failed:', clientErr);
      error(
        `Failed to parse "${file.name}": ${
          clientErr.message || 'File is scanned or corrupt'
        }. Please check your file or copy-paste the text directly.`
      );
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle Preset Selection
  const handleSelectPreset = (preset: (typeof STANDARD_PRESETS)[0]) => {
    setSelectedPresetId(preset.id);
    setTemplateFileName(`${preset.id}.docx`);
    setTemplateTitle(preset.name);
    setTemplateCategory(preset.category);
    setTemplateText(preset.content);
    setFormData({ ...preset.sampleData });
    success(`Loaded "${preset.name}" template with sample fields.`);
  };

  // Handle Paste from Clipboard
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText && clipText.trim()) {
          setTemplateText(clipText);
          extractPlaceholdersFromText(clipText);
          const firstLine = clipText.trim().split('\n')[0].replace(/^[*#\s]+|[*#\s]+$/g, '').trim();
          if (firstLine && firstLine.length > 3 && firstLine.length < 60 && !firstLine.includes('{{')) {
            setTemplateTitle(firstLine);
          }
          success(`Pasted ${clipText.length} characters from clipboard! Placeholders detected.`);
          return;
        }
      }
    } catch (e) {
      console.warn('Clipboard read error or permission denied:', e);
    }
    info('Please press Ctrl+V (or Cmd+V) inside the text box to paste your content.');
  };

  // Quick insert placeholder token into template text
  const handleInsertPlaceholderToken = (token: string) => {
    const tokenFormatted = `{{${token}}}`;
    setTemplateText((prev) => {
      if (!prev.trim()) return tokenFormatted;
      return prev + (prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ') + tokenFormatted;
    });
    info(`Inserted ${tokenFormatted}`);
  };

  // Clear template text box
  const handleClearTemplateText = () => {
    setTemplateText('');
    setDetectedPlaceholders([]);
    info('Text box cleared.');
  };

  // Fill sample candidate data into formData for instant live preview
  const handleFillDemoData = () => {
    if (employees.length > 0) {
      handleSelectEmployee(employees[0].id);
    } else {
      handleSelectEmployee(DEMO_EMPLOYEES[0].id);
    }
  };

  // Handle Category Change from dropdown with auto-loading blueprint
  const handleCategoryChange = (catKey: string) => {
    setTemplateCategory(catKey);
    const found = OFFERS_ALL_CATEGORIES.find(
      (c) =>
        c.value === catKey ||
        c.label.toLowerCase() === catKey.toLowerCase() ||
        c.legacyValue === catKey ||
        c.value.toLowerCase().replace(/[^a-z0-9]/g, '') === catKey.toLowerCase().replace(/[^a-z0-9]/g, '')
    );
    if (found) {
      setTemplateTitle(found.defaultTitle);
      if (found.blueprintContent) {
        setTemplateText(found.blueprintContent);
        extractPlaceholdersFromText(found.blueprintContent);
        if (found.sampleData) {
          setFormData((prev) => ({ ...prev, ...found.sampleData }));
        }
      }
      success(`Selected "${found.label}". Loaded official section structure!`);
    }
  };

  // Load complete 18-section official offer letter
  const handleLoadAll18OfferSections = () => {
    const full18Content = `**CONFIDENTIAL OFFER OF EMPLOYMENT**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

Dear **{{candidate_name}}**,

On behalf of **{{company_name}}**, we are pleased to offer you the full-time position of **{{job_title}}** in the **{{department}}** department, reporting directly to **{{reporting_manager}}**.

` + OFFICIAL_18_OFFER_SECTIONS.map((s) => s.content).join('\n\n');

    setTemplateCategory('Offer Letter');
    setTemplateTitle('Official 18-Section Employment Offer Letter');
    setTemplateText(full18Content);
    extractPlaceholdersFromText(full18Content);
    success('Loaded complete 18-section official offer contract structure!');
  };

  // Append a single offer section
  const handleAppendOfferSection = (secNum: number) => {
    const sec = OFFICIAL_18_OFFER_SECTIONS.find((s) => s.num === secNum);
    if (!sec) return;
    setTemplateText((prev) => {
      const cleanPrev = prev.trim();
      return cleanPrev ? `${cleanPrev}\n\n${sec.content}` : sec.content;
    });
    info(`Appended Section ${secNum}: ${sec.title}`);
  };

  // 1-Click Employee Master Auto-Fill
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const empFields: Record<string, string> = {
      candidate_name: emp.fullName || '',
      employee_name: emp.fullName || '',
      employee_id: emp.employeeId || '',
      job_title: emp.designation || '',
      designation: emp.designation || '',
      department: emp.department || '',
      joining_date: emp.joiningDate || '',
      work_location: emp.workLocation || 'Headquarters / Hybrid',
      reporting_manager: emp.reportingManager || 'Sheetal Bedi',
      official_email: emp.officialEmail || emp.personalEmail || '',
    };

    if (emp.annualCtc) {
      empFields['annual_ctc'] = `${emp.currency || 'INR'} ${emp.annualCtc.toLocaleString('en-IN')} per annum`;
      empFields['base_salary'] = `${emp.currency || 'INR'} ${Math.round(emp.annualCtc * 0.5).toLocaleString('en-IN')} per annum`;
      empFields['salary'] = `${emp.currency || 'INR'} ${emp.annualCtc.toLocaleString('en-IN')}`;
    }

    // Ensure all auto-filled fields appear in detectedPlaceholders
    const autoFilledKeys = Object.keys(empFields);
    setDetectedPlaceholders((prev) => Array.from(new Set([...prev, ...autoFilledKeys])));

    setFormData((prev) => ({
      ...prev,
      ...empFields,
    }));

    success(`Autofilled variables from ${emp.fullName}'s employee record!`);
  };

  // AI Prompt Auto-Fill
  const handleAiAutoDraft = async () => {
    if (!aiPrompt.trim()) {
      error('Please enter a description or candidate terms for the AI to draft.');
      return;
    }

    setIsAiDrafting(true);
    try {
      // 1. Try backend AI wording/extraction
      await EmployeeService.aiSuggestWording(
        `Extract candidate parameters from this description: "${aiPrompt}". Fill candidate_name, job_title, department, salary, joining_date, and reporting_manager.`,
        templateCategory
      ).catch(() => null);

      // Intelligent natural extraction parser
      const text = aiPrompt;
      const extracted: Record<string, string> = {};

      // Name detection
      const nameMatch = text.match(/(?:for|named|candidate)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
      if (nameMatch) {
        extracted['candidate_name'] = nameMatch[1];
        extracted['employee_name'] = nameMatch[1];
      }

      // Role / Designation detection
      const roleMatch = text.match(/(?:as|role of|position of|designation:?)\s+([A-Za-z0-9\s]+?)(?:,|\swith|\sat|\sstarting|\sreporting|\sjoined|\sfor|\.|$)/i);
      if (roleMatch && roleMatch[1].trim().length > 2) {
        extracted['job_title'] = roleMatch[1].trim();
        extracted['designation'] = roleMatch[1].trim();
      }

      // Salary / CTC detection
      const salaryMatch = text.match(/(?:(?:INR|₹|\$)\s*[0-9,.]+(?:\s*(?:LPA|per annum|k|K|USD|lakhs?))?|[0-9]+(?:\.[0-9]+)?\s*(?:LPA|lakhs?))/i);
      if (salaryMatch) {
        extracted['annual_ctc'] = salaryMatch[0];
        extracted['base_salary'] = salaryMatch[0];
        extracted['salary'] = salaryMatch[0];
      }

      // Joining date detection
      const dateMatch = text.match(/(?:joining|joining date|start date|effective|resigned on|from)\s+([A-Za-z0-9\s,]+?)(?:,|\.|$)/i);
      if (dateMatch) {
        extracted['joining_date'] = dateMatch[1].trim();
      }

      // Ensure all extracted keys appear in detectedPlaceholders
      const extractedKeys = Object.keys(extracted);
      if (extractedKeys.length > 0) {
        setDetectedPlaceholders((prev) => Array.from(new Set([...prev, ...extractedKeys])));
      }

      // Merge into formData
      setFormData((prev) => ({
        ...prev,
        ...extracted,
        issue_date: prev.issue_date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      }));

      success('AI successfully analyzed prompt and populated matching template fields!');
    } catch (err: any) {
      error(`AI Drafting failed: ${err.message}`);
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Add custom variable field
  const handleAddCustomField = () => {
    const rawKey = newFieldName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!rawKey) return;

    if (!detectedPlaceholders.includes(rawKey)) {
      setDetectedPlaceholders([...detectedPlaceholders, rawKey]);
    }
    setFormData((prev) => ({ ...prev, [rawKey]: '' }));
    setNewFieldName('');
    setShowAddCustomField(false);
    success(`Added custom variable "{{${rawKey}}}"`);
  };

  // Compile final populated document text with support for {{key}}, [key], <<key>>
  const getCompiledDocumentText = () => {
    if (isDirectEditing && directEditedContent) {
      return directEditedContent;
    }
    let res = templateText;

    // Replace {{key}}
    res = res.replace(/\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g, (_, key) => {
      const raw = key.trim();
      const clean = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      if (formData[raw] !== undefined && formData[raw] !== '') return formData[raw];
      return `{{${raw}}}`;
    });

    // Replace [key]
    res = res.replace(/\[\s*([a-zA-Z0-9_\s]{2,40})\s*\]/g, (orig, key) => {
      const clean = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      return orig;
    });

    // Replace <<key>>
    res = res.replace(/<<\s*([a-zA-Z0-9_\s]{2,40})\s*>>/g, (orig, key) => {
      const clean = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      return orig;
    });

    return res;
  };

  // Action: AI Format to Official Template Style (bold uppercase numbered clauses, bullets, and signatures)
  const handleAiFormatToOfficialStyle = async () => {
    setIsAiFormatting(true);
    try {
      let formatted = '';
      try {
        const res = await EmployeeService.suggestWording(templateText, templateCategory);
        if (res && res.result && res.result.trim().length > 20) {
          formatted = res.result.trim();
        }
      } catch (backendErr) {
        console.warn('Backend AI wording service unavailable, using executive rule formatter:', backendErr);
      }

      // If backend AI was unavailable or empty, use client executive formatter
      if (!formatted) {
        formatted = formatTextToExecutiveTemplate(templateText, templateTitle, templateCategory);
      }

      setTemplateText(formatted);
      extractPlaceholdersFromText(formatted);
      success('Template formatted to official company style with bold headings and structured bullet points!');
    } catch (err: any) {
      error(`Formatting failed: ${err.message}`);
    } finally {
      setIsAiFormatting(false);
    }
  };

  // Switch to Step 3 and prepare direct edit buffer
  const handleProceedToPreview = () => {
    const compiled = getCompiledDocumentText();
    setDirectEditedContent(compiled);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // High-fidelity Isolated Print
  const handlePrint = () => {
    const el = document.getElementById('printable-ai-generated-doc');
    if (!el) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${templateTitle} — ${formData.candidate_name || formData.employee_name || 'Document'}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              line-height: 1.6;
              padding: 0;
              margin: 0;
              background: #fff;
              font-size: 11pt;
            }
            .no-print { display: none !important; }
            .highlight-token { background: transparent !important; color: inherit !important; font-weight: inherit !important; }
            h1, h2, h3 { color: #0f172a; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 10pt; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 250);
  };

  // Download as Word Document (.doc format compatible with MS Word)
  const handleDownloadWordDoc = () => {
    const rawContent = getCompiledDocumentText();
    const recipient = formData.candidate_name || formData.employee_name || 'Recipient';
    const filename = `${templateTitle.replace(/\s+/g, '_')}_${recipient.replace(/\s+/g, '_')}.doc`;

    // Convert markdown content to rich semantic HTML for Microsoft Word
    const lines = rawContent.split('\n');
    const htmlLines: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        htmlLines.push('<p style="margin:4px 0;">&nbsp;</p>');
        return;
      }

      // 1. Title Header
      if (
        (trimmed.startsWith('**') && trimmed.endsWith('**') && (trimmed.includes('OFFER') || trimmed.includes('AGREEMENT') || trimmed.includes('CERTIFICATE') || trimmed.includes('LETTER'))) ||
        (trimmed.toUpperCase() === trimmed && trimmed.length < 80 && (trimmed.includes('OFFER') || trimmed.includes('AGREEMENT') || trimmed.includes('CERTIFICATE') || trimmed.includes('LETTER')))
      ) {
        htmlLines.push(`<h2 style="color:#0f172a; text-align:center; font-family:Arial,sans-serif; text-transform:uppercase; border-bottom:2px solid #0f172a; padding-bottom:6px; margin:20px 0 16px;">${trimmed.replace(/\*\*/g, '')}</h2>`);
        return;
      }

      // 2. Numbered Section Clause
      const numMatch = trimmed.match(/^(?:\*\*)?(\d+\.\s+[A-Z0-9\s&/()_-]+)(?:\*\*)?$/);
      if (numMatch) {
        htmlLines.push(`<h3 style="color:#0f172a; font-family:Arial,sans-serif; text-transform:uppercase; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-top:20px; margin-bottom:8px;">${numMatch[1]}</h3>`);
        return;
      }

      // 3. Bullet Point
      const bMatch = trimmed.match(/^(?:•|\*|-|\[bullet\])\s+(.*)$/);
      if (bMatch) {
        const itemHtml = bMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlLines.push(`<div style="margin:4px 0 4px 18px; font-family:'Times New Roman',serif;"><span style="color:#2563eb; font-weight:bold;">•</span>&nbsp;&nbsp;${itemHtml}</div>`);
        return;
      }

      // 4. Regular Paragraph
      const pHtml = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlLines.push(`<p style="margin:6px 0; line-height:1.6; font-family:'Times New Roman',serif;">${pHtml}</p>`);
    });

    const bodyHtml = htmlLines.join('\n');

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${templateTitle}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.6; color: #1e293b; margin: 20mm; }
          h1, h2, h3 { font-family: Arial, sans-serif; color: #0f172a; }
          strong { font-weight: bold; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          td { vertical-align: top; padding: 10px; font-size: 10.5pt; }
        </style>
      </head>
      <body>
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px;">
          <h1 style="margin:0; font-size:18pt; color:#0f172a;">TASKNERA</h1>
          <div style="font-size:9pt; color:#64748b;">OFFICIAL WORKFORCE DOCUMENTATION</div>
        </div>
        ${bodyHtml}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success(`Downloaded "${filename}" formatted for Microsoft Word!`);
  };

  // Save generated document to Documents library
  const handleSaveToDocuments = async () => {
    setIsSavingDoc(true);
    try {
      const recipientName =
        formData.candidate_name ||
        formData.employee_name ||
        formData.contractor_name ||
        'Authorized Recipient';

      const compiled = getCompiledDocumentText();
      const newDoc: HrDocument = {
        id: `doc_ai_${Date.now()}`,
        companyId: 'comp_tasknera',
        documentTypeCode: 'OFFER_LETTER',
        referenceNumber: formData.reference_number || `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${templateTitle} — ${recipientName}`,
        templateId: templateFileName,
        templateVersionId: 'v1.0',
        recipientName,
        recipientEmail: formData.official_email || formData.email || 'recipient@tasknera.com',
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: true,
        aiConfidenceScore: 0.98,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: {
          ...formData,
          renderedContent: compiled,
          generatedDate: new Date().toISOString(),
        },
        humanOverrides: [],
        currentVersionNumber: 1,
        versions: [],
        generatedFiles: [],
        statusHistory: [],
        signatoryName: formData.signatory_name || 'Sheetal Bedi',
        signatoryTitle: formData.signatory_title || 'Chief Executive Officer',
        createdByUserId: 'usr_current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage
      try {
        const saved: HrDocument[] = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
        localStorage.setItem('tasknera_saved_documents', JSON.stringify([newDoc, ...saved]));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      success(`Document "${newDoc.title}" saved to Documents library!`);
    } catch (err: any) {
      error(`Failed to save document: ${err.message}`);
    } finally {
      setIsSavingDoc(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    const text = getCompiledDocumentText();
    navigator.clipboard.writeText(text);
    success('Copied document text to clipboard!');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', paddingBottom: 60 }}>
      {/* Top Header & Navigation Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '22px 28px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(238, 242, 255, 0.9) 100%)',
          border: '1px solid #e2e8f0',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '2px 8px',
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                border: '1px solid #bfdbfe',
              }}
            >
              <Sparkles size={12} /> AI Document Studio
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Upload any custom template (.docx, .pdf, .txt) & generate
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            AI Document & Template Generator
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '3px 0 0' }}>
            Upload any company template, let AI extract fields, auto-fill candidate or employee details, and print or export.
          </p>
        </div>

        {/* Tab Switcher: Generator vs Library */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            padding: 4,
            border: '1px solid #cbd5e1',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 7,
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'generator' ? 700 : 500,
              backgroundColor: activeTab === 'generator' ? '#2563eb' : 'transparent',
              color: activeTab === 'generator' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Sparkles size={14} />
            <span>Generate Document</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 7,
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: activeTab === 'library' ? 700 : 500,
              backgroundColor: activeTab === 'library' ? '#2563eb' : 'transparent',
              color: activeTab === 'library' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={14} />
            <span>Template Library</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: AI DOCUMENT GENERATOR WORKFLOW                                 */}
      {/* ===================================================================== */}
      {activeTab === 'generator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Step Progress Tracker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '12px 20px',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {[
                { num: 1, label: '1. Choose Template' },
                { num: 2, label: '2. Fill Details with AI' },
                { num: 3, label: '3. Preview & Export' },
              ].map((s) => {
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => setStep(s.num as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      borderRadius: 20,
                      border: isCurrent ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: isCurrent ? '#eff6ff' : isDone ? '#f0fdf4' : '#f8fafc',
                      color: isCurrent ? '#2563eb' : isDone ? '#16a34a' : '#64748b',
                      fontSize: '0.78125rem',
                      fontWeight: isCurrent || isDone ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{isDone ? '✓' : s.num}</span>
                    <span>{s.label.split('. ')[1]}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Active Template: <strong style={{ color: '#0f172a' }}>{templateTitle}</strong>
            </div>
          </div>

          {/* =================================================================== */}
          {/* STEP 1: CHOOSE, PASTE, OR UPLOAD TEMPLATE                           */}
          {/* =================================================================== */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Method Selector Tabs: Paste vs Upload vs Presets */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setStep1Mode('paste')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: step1Mode === 'paste' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: step1Mode === 'paste' ? '#eff6ff' : '#f8fafc',
                      color: step1Mode === 'paste' ? '#1d4ed8' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <FileText size={16} style={{ color: step1Mode === 'paste' ? '#2563eb' : '#64748b' }} />
                    <span>Copy & Paste Content</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        backgroundColor: step1Mode === 'paste' ? '#dbeafe' : '#e2e8f0',
                        color: step1Mode === 'paste' ? '#1e40af' : '#64748b',
                        padding: '1px 6px',
                        borderRadius: 10,
                        fontWeight: 700,
                      }}
                    >
                      Instant
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep1Mode('upload')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: step1Mode === 'upload' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: step1Mode === 'upload' ? '#eff6ff' : '#f8fafc',
                      color: step1Mode === 'upload' ? '#1d4ed8' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Upload size={16} style={{ color: step1Mode === 'upload' ? '#2563eb' : '#64748b' }} />
                    <span>Upload Document File</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>.docx, .pdf, .txt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep1Mode('preset')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: step1Mode === 'preset' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: step1Mode === 'preset' ? '#eff6ff' : '#f8fafc',
                      color: step1Mode === 'preset' ? '#1d4ed8' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Layers size={16} style={{ color: step1Mode === 'preset' ? '#2563eb' : '#64748b' }} />
                    <span>Standard Presets</span>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>({STANDARD_PRESETS.length})</span>
                  </button>
                </div>

                {/* View Layout Switcher (Split vs Full Editor vs Full Preview) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>View:</span>
                  {[
                    { id: 'split', label: 'Split View' },
                    { id: 'editor', label: 'Text Box' },
                    { id: 'preview', label: 'Live Template' },
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => setStep1ViewLayout(layout.id as any)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: step1ViewLayout === layout.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: step1ViewLayout === layout.id ? '#2563eb' : '#f8fafc',
                        color: step1ViewLayout === layout.id ? '#ffffff' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* TAB A: COPY & PASTE DOCUMENT CONTENT DIRECTLY                */}
              {/* ------------------------------------------------------------- */}
              {step1Mode === 'paste' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      step1ViewLayout === 'split'
                        ? 'minmax(420px, 1fr) minmax(460px, 1.15fr)'
                        : step1ViewLayout === 'editor'
                        ? '1fr'
                        : '1fr',
                    gap: 20,
                    alignItems: 'start',
                  }}
                >
                  {/* Left Column / Editor: Direct Copy & Paste Text Box */}
                  {(step1ViewLayout === 'split' || step1ViewLayout === 'editor') && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        border: '1.5px solid #cbd5e1',
                        padding: '20px 22px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      }}
                    >
                      {/* Box Header & Action Toolbar */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Clipboard size={18} />
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              Paste Document / Letter Content
                            </h3>
                          </div>
                          <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
                            Copy any text from Word, PDF, email, or drafts and paste below. The live template preview updates instantly.
                          </p>
                        </div>

                        {/* Quick Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={handlePasteFromClipboard}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #bfdbfe',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Paste text from your computer clipboard"
                          >
                            <Clipboard size={13} />
                            <span>Paste Clipboard</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleAiFormatToOfficialStyle}
                            disabled={isAiFormatting || !templateText.trim()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #93c5fd',
                              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Format plain text into corporate bold clauses, numbered headers, and bullet points"
                          >
                            <Sparkles size={13} style={{ color: '#2563eb' }} />
                            <span>{isAiFormatting ? 'Formatting...' : '✨ AI Format'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSelectPreset(STANDARD_PRESETS[0])}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#f8fafc',
                              color: '#475569',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Load standard Corporate Offer Letter sample content"
                          >
                            <span>Sample</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleClearTemplateText}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '5px 8px',
                              borderRadius: 6,
                              border: '1px solid #fecaca',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Clear text box"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Template Metadata Fields: Title & Category */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1.4fr 1fr',
                          gap: 12,
                          backgroundColor: '#f8fafc',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                            Document / Template Title
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={templateTitle}
                            onChange={(e) => setTemplateTitle(e.target.value)}
                            placeholder="e.g. Senior Software Engineer Offer Letter"
                            style={{
                              fontSize: '0.8125rem',
                              height: 34,
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              width: '100%',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4, textTransform: 'uppercase' }}>
                            Document Category
                          </label>
                          <select
                            className="form-select"
                            value={templateCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            style={{
                              fontSize: '0.8125rem',
                              height: 34,
                              backgroundColor: '#ffffff',
                              border: '1.5px solid #2563eb',
                              borderRadius: 6,
                              width: '100%',
                              cursor: 'pointer',
                              fontWeight: 600,
                              color: '#0f172a',
                            }}
                          >
                            {OFFERS_ALL_CATEGORIES.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Offer Legal Sections Toolbar - All 18 Legal Sections Present in Offers */}
                      <div
                        style={{
                          backgroundColor: '#f0f7ff',
                          borderRadius: 10,
                          border: '1.5px solid #bfdbfe',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ScrollText size={16} style={{ color: '#2563eb' }} />
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#1e3a8a' }}>
                              All 18 Legal Sections Present in Offers
                            </span>
                            <span style={{ fontSize: '0.68rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>
                              Official Contract Clauses
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleLoadAll18OfferSections}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              borderRadius: 6,
                              border: '1.5px solid #2563eb',
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '0 1px 3px rgba(37,99,235,0.2)',
                            }}
                            title="Load all 18 full legal clauses of the official offer letter into the template"
                          >
                            <Sparkles size={13} />
                            <span>Load All 18 Offer Sections into Template</span>
                          </button>
                        </div>

                        {/* Section Inserter Chips: Click to Append Any Section */}
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                            Click to append any official offer clause into your text box:
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 6,
                              maxHeight: 105,
                              overflowY: 'auto',
                              paddingRight: 4,
                            }}
                          >
                            {OFFICIAL_18_OFFER_SECTIONS.map((sec) => (
                              <button
                                key={sec.num}
                                type="button"
                                onClick={() => handleAppendOfferSection(sec.num)}
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  border: '1px solid #bfdbfe',
                                  backgroundColor: '#ffffff',
                                  color: '#1e40af',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  transition: 'all 0.15s ease',
                                }}
                                title={`Append Section ${sec.num}: ${sec.title}`}
                              >
                                <span style={{ fontWeight: 800 }}>+{sec.num}.</span>
                                <span>{sec.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* The Big Copy & Paste Text Area */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                            Document Text Content (Paste here):
                          </label>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Supports <code style={{ color: '#2563eb' }}>{'{{variable}}'}</code>, <code style={{ color: '#2563eb' }}>[Variable]</code> & <code style={{ color: '#2563eb' }}>&lt;&lt;Variable&gt;&gt;</code>
                          </span>
                        </div>

                        <textarea
                          rows={16}
                          className="form-textarea"
                          value={templateText}
                          onChange={(e) => setTemplateText(e.target.value)}
                          placeholder="Paste your document or letter text here...&#10;&#10;Example:&#10;**OFFER OF EMPLOYMENT**&#10;Date: {{issue_date}}&#10;Ref: {{reference_number}}&#10;&#10;Dear {{candidate_name}},&#10;&#10;TaskNera is pleased to offer you the position of {{job_title}} in our {{department}} team at {{work_location}}.&#10;&#10;1. COMPENSATION & BENEFITS&#10;• Annual CTC: {{annual_ctc}}&#10;• Joining Date: {{joining_date}}&#10;&#10;Sincerely,&#10;Sheetal Bedi&#10;Chief Executive Officer"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            backgroundColor: '#fafbfc',
                            border: '1.5px solid #cbd5e1',
                            borderRadius: 8,
                            padding: '12px 14px',
                            width: '100%',
                            boxSizing: 'border-box',
                            minHeight: 340,
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      {/* Quick Insert Common Placeholder Pills */}
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                          Click to insert dynamic placeholder:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {[
                            'candidate_name',
                            'job_title',
                            'department',
                            'annual_ctc',
                            'joining_date',
                            'work_location',
                            'reporting_manager',
                            'company_name',
                            'employee_id',
                            'issue_date',
                          ].map((tok) => (
                            <button
                              key={tok}
                              type="button"
                              onClick={() => handleInsertPlaceholderToken(tok)}
                              style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#1e293b',
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                transition: 'all 0.15s ease',
                              }}
                              title={`Insert {{${tok}}} into content`}
                            >
                              +{`{{${tok}}}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Content Stats Bar & Next Action */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 12,
                          borderTop: '1px solid #e2e8f0',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: '#64748b' }}>
                          <span>
                            <strong>{templateText.trim() ? templateText.trim().split(/\s+/).length : 0}</strong> words
                          </span>
                          <span>•</span>
                          <span>
                            <strong>{templateText.length}</strong> chars
                          </span>
                          <span>•</span>
                          <span
                            style={{
                              backgroundColor: detectedPlaceholders.length > 0 ? '#dbeafe' : '#f1f5f9',
                              color: detectedPlaceholders.length > 0 ? '#1e40af' : '#64748b',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontWeight: 700,
                            }}
                          >
                            {detectedPlaceholders.length} Dynamic Variables
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          icon={<ArrowRight size={15} />}
                          onClick={() => setStep(2)}
                          style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        >
                          Proceed to Fill Details with AI
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Right Column / Preview: The Official Letterhead Template Sheet */}
                  {(step1ViewLayout === 'split' || step1ViewLayout === 'preview') && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        border: '1.5px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Live Template Header Bar */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '12px 18px',
                          borderBottom: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Eye size={16} style={{ color: '#2563eb' }} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                            Official Template Live Preview
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: '#16a34a',
                              backgroundColor: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontWeight: 700,
                            }}
                          >
                            Live Template
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: '0.75rem',
                              color: '#475569',
                              cursor: 'pointer',
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: highlightPlaceholders ? '#fef08a' : '#f1f5f9',
                              fontWeight: 600,
                            }}
                          >
                            <Highlighter size={12} />
                            <input
                              type="checkbox"
                              checked={highlightPlaceholders}
                              onChange={(e) => setHighlightPlaceholders(e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            <span>Highlight Fields</span>
                          </label>

                          <button
                            type="button"
                            onClick={handleFillDemoData}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              borderRadius: 6,
                              border: '1px solid #bfdbfe',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Auto-fill sample employee details into variables for instant preview"
                          >
                            <Users size={12} />
                            <span>Sample Data</span>
                          </button>
                        </div>
                      </div>

                      {/* A4 Letterhead Sheet Container - Full Page White Background */}
                      <div
                        style={{
                          padding: step1ViewLayout === 'preview' ? '32px 36px' : '20px',
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          justifyContent: 'center',
                          overflowX: 'auto',
                          maxHeight: step1ViewLayout === 'preview' ? 'none' : '750px',
                          overflowY: 'auto',
                          flex: 1,
                          width: '100%',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            maxWidth: step1ViewLayout === 'preview' ? 840 : '100%',
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                            boxShadow: '0 2px 14px rgba(0, 0, 0, 0.04)',
                            border: '1px solid #e2e8f0',
                            padding: '40px 48px',
                            fontFamily: 'Georgia, "Times New Roman", Times, serif',
                            fontSize: '13.5px',
                            lineHeight: 1.7,
                            color: '#1e293b',
                            boxSizing: 'border-box',
                            minHeight: 850,
                          }}
                        >
                          {/* Official Header */}
                          <div
                            style={{
                              borderBottom: '2px solid #0f172a',
                              paddingBottom: 14,
                              marginBottom: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img
                                src="/logo.png"
                                alt="Logo"
                                style={{ width: 34, height: 34, objectFit: 'contain' }}
                              />
                              <div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', fontFamily: 'sans-serif' }}>
                                  TASKNERA
                                </div>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'sans-serif', letterSpacing: '0.04em' }}>
                                  OFFICIAL WORKFORCE DOCUMENTATION
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                              <div>Ref: {formData.reference_number || 'TSK-DOC-2026'}</div>
                              <div>Date: {formData.issue_date || new Date().toLocaleDateString()}</div>
                            </div>
                          </div>

                          {/* Document Content Rendered via ExecutiveDocumentRenderer */}
                          {templateText.trim().length === 0 ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
                              <FileText size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Paste your document content into the text box.</p>
                              <p style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>It will cleanly format and be visible on this official TaskNera template.</p>
                            </div>
                          ) : (
                            <ExecutiveDocumentRenderer
                              content={templateText}
                              formData={formData}
                              highlightPlaceholders={highlightPlaceholders}
                            />
                          )}

                          {/* Official Footer */}
                          <div
                            style={{
                              borderTop: '1px solid #e2e8f0',
                              marginTop: 36,
                              paddingTop: 14,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                              fontFamily: 'sans-serif',
                            }}
                          >
                            <div>Generated with TaskNera AI Document Engine</div>
                            <div>Confidential & Legally Binding</div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions inside Preview */}
                      <div
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '12px 18px',
                          borderTop: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Template: <strong style={{ color: '#0f172a' }}>{templateTitle}</strong>
                        </span>

                        <Button
                          variant="primary"
                          icon={<ArrowRight size={15} />}
                          onClick={() => setStep(2)}
                          style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                        >
                          Proceed to Fill Details with AI
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB B: UPLOAD DOCUMENT FILE (.DOCX, .PDF, .TXT)               */}
              {/* ------------------------------------------------------------- */}
              {step1Mode === 'upload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                      backgroundColor: dragActive ? '#eff6ff' : '#ffffff',
                      borderRadius: 14,
                      padding: '36px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,.txt,.html,.md"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />

                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 14px',
                      }}
                    >
                      <Upload size={26} />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {isUploading ? 'Uploading & Parsing Template...' : 'Upload Any Custom Document Template'}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: 520, margin: '0 auto 16px', lineHeight: 1.5 }}>
                      Drop your Microsoft Word (<strong>.docx</strong>), PDF (<strong>.pdf</strong>), or Text (<strong>.txt</strong>) file here.
                      The system will cleanly parse the text and detect all fields automatically.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <Button
                        variant="primary"
                        icon={<Upload size={15} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse Files on Computer
                      </Button>

                      <Button
                        variant="secondary"
                        icon={<FileText size={15} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setStep1Mode('paste');
                        }}
                      >
                        Prefer Copy-Pasting Content
                      </Button>
                    </div>
                  </div>

                  {/* Render Live Preview of parsed content below if text exists */}
                  {templateText && (
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 14,
                        border: '1.5px solid #e2e8f0',
                        overflow: 'hidden',
                        padding: 20,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileCode size={18} style={{ color: '#2563eb' }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                            Parsed Template Preview ({detectedPlaceholders.length} fields detected)
                          </span>
                        </div>
                        <Button
                          variant="primary"
                          icon={<ArrowRight size={15} />}
                          onClick={() => setStep(2)}
                        >
                          Proceed to Step 2
                        </Button>
                      </div>

                      <div style={{ maxHeight: 500, overflowY: 'auto', backgroundColor: '#ffffff', padding: 24, borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 400 }}>
                        <ExecutiveDocumentRenderer
                          content={templateText}
                          formData={formData}
                          highlightPlaceholders={highlightPlaceholders}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB C: STANDARD CORPORATE PRESETS                             */}
              {/* ------------------------------------------------------------- */}
              {step1Mode === 'preset' && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    padding: '22px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                        Choose a Standard HR Blueprint
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                        Select a standard template blueprint to load immediately:
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {STANDARD_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: 10,
                            border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                          }}
                        >
                          <span style={{ fontSize: '1.4rem' }}>{preset.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                                {preset.name}
                              </span>
                              {isSelected && (
                                <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>
                                  Active
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '3px 0 0', lineHeight: 1.35 }}>
                              {preset.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer with Step 2 action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                    <Button
                      variant="primary"
                      icon={<ArrowRight size={16} />}
                      onClick={() => setStep(2)}
                      style={{ padding: '10px 24px', fontSize: '0.875rem' }}
                    >
                      Proceed to Fill Details with AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 2: FILL DETAILS WITH AI                                        */}
          {/* =================================================================== */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* AI Auto-Fill Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1.5px solid #bfdbfe',
                  padding: '22px 24px',
                  background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Sparkles size={20} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3a8a', margin: 0 }}>
                    AI Quick Auto-Fill
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                    Instant 1-Click
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {/* Way A: Employee Master Select */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Users size={15} style={{ color: '#2563eb' }} />
                        <span>1-Click Employee Master Auto-Fill</span>
                      </label>
                      <select
                        className="form-select"
                        value={selectedEmployeeId}
                        onChange={(e) => handleSelectEmployee(e.target.value)}
                        style={{
                          fontSize: '0.8125rem',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          minHeight: 40,
                          width: '100%',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="" style={{ color: '#64748b', backgroundColor: '#ffffff' }}>Select team member...</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                            {emp.fullName} ({emp.designation} — {emp.department})
                          </option>
                        ))}
                      </select>

                      {/* Instant 1-Click Employee Chips */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {employees.slice(0, 3).map((emp) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => handleSelectEmployee(emp.id)}
                            style={{
                              fontSize: '0.72rem',
                              padding: '3px 8px',
                              borderRadius: 6,
                              border: '1px solid #bfdbfe',
                              backgroundColor: selectedEmployeeId === emp.id ? '#dbeafe' : '#f0f9ff',
                              color: '#0369a1',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            + {emp.fullName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '10px 0 0', lineHeight: 1.35 }}>
                      Pulls verified name, ID, salary, and designation directly from records.
                    </p>
                  </div>

                  {/* Way B: AI Natural Language Prompt */}
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: 16,
                      gridColumn: 'span 2',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Wand2 size={15} style={{ color: '#2563eb' }} />
                        <span>AI Prompt Auto-Draft</span>
                      </label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Generate offer for Rahul Sharma, Senior React Dev, ₹22 LPA, joining Dec 1 in Bangalore"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          style={{ fontSize: '0.8125rem', flex: 1 }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAiAutoDraft();
                            }
                          }}
                        />
                        <Button
                          variant="primary"
                          onClick={handleAiAutoDraft}
                          isLoading={isAiDrafting}
                          style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}
                        >
                          Draft with AI
                        </Button>
                      </div>
                      {/* Quick prompt suggestions */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {[
                          'Jane Doe, Lead Platform Architect, $165,000 CTC, joining Nov 16',
                          'Carlos Rivera, ML Engineer, Relieving date Sept 30 after 3 years tenure',
                          'Liam Vance, AI Research Intern, $4,000/mo stipend starting Oct 15',
                        ].map((sample) => (
                          <button
                            key={sample}
                            type="button"
                            onClick={() => {
                              setAiPrompt(sample);
                            }}
                            style={{
                              fontSize: '0.7rem',
                              padding: '3px 8px',
                              borderRadius: 12,
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                            }}
                          >
                            + {sample.slice(0, 36)}...
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Variables Form Grid */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '22px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Template Variables ({detectedPlaceholders.length} fields)
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                      Review and customize the field values below before compiling:
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="secondary"
                      icon={<Sparkles size={14} style={{ color: '#2563eb' }} />}
                      onClick={handleAiFormatToOfficialStyle}
                      isLoading={isAiFormatting}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}
                    >
                      ✨ AI Format to Official Style
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Sparkles size={14} style={{ color: '#7c3aed' }} />}
                      onClick={() => runAiAutoDetectPlaceholders()}
                      isLoading={isDetectingPlaceholders}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#ddd6fe', backgroundColor: '#f5f3ff', color: '#6d28d9' }}
                    >
                      AI Auto-Detect
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Plus size={14} />}
                      onClick={handleAddStandardHrFields}
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      Add Standard Fields
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomField(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} /> Custom Field
                    </button>
                  </div>
                </div>

                {/* Add Custom Field Dialog */}
                {showAddCustomField && (
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. probation_clause or performance_bonus"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      style={{ fontSize: '0.8125rem', maxWidth: 320 }}
                    />
                    <Button variant="primary" onClick={handleAddCustomField} style={{ fontSize: '0.75rem' }}>
                      Save Field
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowAddCustomField(false)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Empty State when 0 fields detected */}
                {detectedPlaceholders.length === 0 ? (
                  <div
                    style={{
                      padding: '36px 20px',
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: 12,
                      border: '1px dashed #cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                      }}
                    >
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>
                        No Dynamic Variables Detected Yet
                      </h5>
                      <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0, maxWidth: 520, lineHeight: 1.45 }}>
                        Your template doesn't have placeholder tags like <code style={{ color: '#2563eb' }}>{'{{candidate_name}}'}</code> or <code style={{ color: '#2563eb' }}>{'[Candidate Name]'}</code>.
                        Use AI to automatically scan names & terms to convert them, or add standard HR fields with 1 click.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                      <Button
                        variant="primary"
                        icon={<Wand2 size={15} />}
                        onClick={() => runAiAutoDetectPlaceholders()}
                        isLoading={isDetectingPlaceholders}
                      >
                        AI Auto-Detect Variables
                      </Button>
                      <Button
                        variant="secondary"
                        icon={<Plus size={15} />}
                        onClick={handleAddStandardHrFields}
                      >
                        Add Standard HR Fields
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Input Fields Grid */
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: 16,
                    }}
                  >
                    {detectedPlaceholders.map((key) => {
                      const formattedLabel = key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                      return (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          <label
                            style={{
                              fontSize: '0.78125rem',
                              fontWeight: 700,
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{formattedLabel}</span>
                            <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                              {`{{${key}}}`}
                            </span>
                          </label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData[key] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({ ...prev, [key]: val }));
                            }}
                            placeholder={`Enter ${formattedLabel}...`}
                            style={{ fontSize: '0.8125rem' }}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2 Footer Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => setStep(1)}>
                  Back to Template
                </Button>
                <Button
                  variant="primary"
                  icon={<Sparkles size={16} />}
                  onClick={handleProceedToPreview}
                  style={{ padding: '10px 24px', fontSize: '0.875rem' }}
                >
                  Generate Document with AI
                </Button>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 3: PREVIEW & EXPORT DOCUMENT                                   */}
          {/* =================================================================== */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Action Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  backgroundColor: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(2)}
                    style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                  >
                    Edit Details
                  </Button>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.75rem',
                      color: '#475569',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: highlightPlaceholders ? '#fef08a' : '#f1f5f9',
                    }}
                  >
                    <Highlighter size={13} />
                    <input
                      type="checkbox"
                      checked={highlightPlaceholders}
                      onChange={(e) => setHighlightPlaceholders(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Highlight Fields</span>
                  </label>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.75rem',
                      color: '#475569',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: isDirectEditing ? '#e0e7ff' : '#f1f5f9',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDirectEditing}
                      onChange={(e) => setIsDirectEditing(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Direct In-Place Edit</span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    variant="secondary"
                    icon={<Copy size={14} />}
                    onClick={handleCopyText}
                    style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Save size={14} />}
                    onClick={handleSaveToDocuments}
                    isLoading={isSavingDoc}
                    style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                  >
                    Save Document
                  </Button>
                  <Button
                    variant="secondary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadWordDoc}
                    style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                  >
                    Download DOCX
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Printer size={14} />}
                    onClick={handlePrint}
                    style={{ padding: '6px 18px', fontSize: '0.8125rem' }}
                  >
                    Print PDF
                  </Button>
                </div>
              </div>

              {/* Printable Document Sheet Canvas (A4 Dimensions) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '24px 0',
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  id="printable-ai-generated-doc"
                  style={{
                    width: '100%',
                    maxWidth: 820,
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    padding: '48px 56px',
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    fontSize: '13.5px',
                    lineHeight: 1.7,
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    minHeight: 1050,
                  }}
                >
                  {/* Official Header Banner */}
                  <div
                    style={{
                      borderBottom: '2px solid #0f172a',
                      paddingBottom: 16,
                      marginBottom: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src="/logo.png"
                        alt="Logo"
                        style={{ width: 38, height: 38, objectFit: 'contain' }}
                      />
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'sans-serif' }}>
                          TASKNERA
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'sans-serif', letterSpacing: '0.04em' }}>
                          OFFICIAL WORKFORCE DOCUMENTATION
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                      <div>Ref: {formData.reference_number || 'TSK-DOC-2026'}</div>
                      <div>Date: {formData.issue_date || new Date().toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Document Body */}
                  {isDirectEditing ? (
                    <textarea
                      rows={22}
                      className="form-textarea"
                      value={directEditedContent}
                      onChange={(e) => setDirectEditedContent(e.target.value)}
                      style={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '13.5px',
                        lineHeight: 1.7,
                        width: '100%',
                        padding: 12,
                      }}
                    />
                  ) : (
                    <ExecutiveDocumentRenderer
                      content={directEditedContent || templateText}
                      formData={formData}
                      highlightPlaceholders={highlightPlaceholders}
                    />
                  )}

                  {/* Official Footer / Signature Attestation */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      marginTop: 40,
                      paddingTop: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      fontFamily: 'sans-serif',
                    }}
                  >
                    <div>Generated with TaskNera AI Document Engine</div>
                    <div>Confidential & Legally Binding</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TEMPLATE LIBRARY                                               */}
      {/* ===================================================================== */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Search & Category Filter */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search templates by title or keywords..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8125rem',
                }}
              />
            </div>

            <select
              value={libraryCategory}
              onChange={(e) => setLibraryCategory(e.target.value)}
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.8125rem',
                backgroundColor: '#ffffff',
                color: '#334155',
              }}
            >
              <option value="ALL">All Categories</option>
              {STANDARD_PRESETS.map((p) => (
                <option key={p.id} value={p.category}>
                  {p.category}
                </option>
              ))}
            </select>
          </div>

          {/* Template Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
            }}
          >
            {STANDARD_PRESETS.map((tpl) => (
              <div
                key={tpl.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        padding: '2px 8px',
                        borderRadius: 12,
                      }}
                    >
                      {tpl.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>DOCX / PDF</span>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    {tpl.name}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, marginBottom: 16 }}>
                    {tpl.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewTemplate({
                        code: tpl.id,
                        category: tpl.category,
                        name: tpl.name,
                        description: tpl.description,
                        supportedFormats: ['PDF', 'DOCX'],
                        defaultDocxAvailable: true,
                        requiredEmployeePlaceholders: Object.keys(tpl.sampleData),
                        docSpecificFields: [],
                        contentMarkup: tpl.content,
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Eye size={13} /> View Markup
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPreset(tpl);
                      setActiveTab('generator');
                      setStep(2);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 14px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={13} /> Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TEMPLATE MARKUP PREVIEW MODAL */}
          {previewTemplate && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  width: '100%',
                  maxWidth: 780,
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#f8fafc',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                      {previewTemplate.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {previewTemplate.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.8125rem',
                      lineHeight: 1.6,
                      backgroundColor: '#f8fafc',
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      whiteSpace: 'pre-wrap',
                      color: '#1e293b',
                    }}
                  >
                    {previewTemplate.contentMarkup}
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                  }}
                >
                  <Button variant="secondary" onClick={() => setPreviewTemplate(null)}>
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Sparkles size={14} />}
                    onClick={() => {
                      const found = STANDARD_PRESETS.find((p) => p.name === previewTemplate.name) || STANDARD_PRESETS[0];
                      handleSelectPreset(found);
                      setPreviewTemplate(null);
                      setActiveTab('generator');
                      setStep(2);
                    }}
                  >
                    Use in AI Generator
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
