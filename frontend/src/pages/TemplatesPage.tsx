import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  Sparkles,
  Download,
  Printer,
  Save,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Users,
  Check,
  Building2,
  Calendar,
  Briefcase,
  RotateCcw,
  Plus,
  Eye,
  FileCheck,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { EmployeeService, Employee, DocumentTemplateItem } from '../services/employeeService.js';
import { templateService } from '../services/templateService.js';
import { DocumentEngineService } from '../services/documentEngineService.js';
import { HrDocument } from '../types/document-engine.js';
import { useToast } from '../context/ToastContext.js';
import { parseDocumentClientSide } from '../utils/clientDocumentParser.js';

export interface CategoryItemDef {
  value: string;
  legacyValue?: string;
  label: string;
  group: 'templates' | 'policies' | 'certificates';
  groupLabel: string;
  defaultTitle: string;
  blueprintContent: string;
  sampleData: Record<string, string>;
}

// Fallback demo employee roster for 1-click auto-fill
export const DEMO_EMPLOYEES: Employee[] = [
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

// Document Templates & Blueprints
export const OFFERS_ALL_CATEGORIES: CategoryItemDef[] = [
  // 1. Offer Letter
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
• **Working Hours**: Standard 5-day business week, 9 hours daily.

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
      candidate_name: 'Rahul Sharma',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Software Engineer',
      department: 'Engineering',
      reporting_manager: 'Sheetal Bedi (Chief Executive Officer)',
      joining_date: 'November 15, 2026',
      work_location: 'Bangalore, India (Hybrid)',
      base_salary: 'INR 18,00,000 per annum',
      variable_pay: 'INR 4,00,000 per annum',
      annual_ctc: 'INR 22,00,000 per annum',
      probation_period: '90 days',
      notice_period: '30 days',
      valid_until: 'October 30, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 2. Appointment Letter
  {
    value: 'Appointment Letter',
    legacyValue: 'APPOINTMENT_LETTER',
    label: 'Appointment Letter',
    group: 'templates',
    groupLabel: 'Appointment Letter',
    defaultTitle: 'Formal Letter of Appointment',
    blueprintContent: `**LETTER OF APPOINTMENT**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

To,
**{{candidate_name}}**
Employee ID: {{employee_id}}
Email: {{official_email}}

Dear **{{candidate_name}}**,

We are pleased to appoint you as **{{job_title}}** in the **{{department}}** department at **{{company_name}}**, effective from **{{joining_date}}**.

**1. REMUNERATION & BENEFITS**
Your total annualized compensation (Cost-to-Company) will be **{{annual_ctc}}**, payable in accordance with the standard monthly company payroll cycle and subject to statutory tax withholdings.

**2. REPORTING & LOCATION**
You will report directly to **{{reporting_manager}}** and will be based out of our **{{work_location}}** office.

**3. PROBATION & NOTICE PERIOD**
You will be on probation for a period of **{{probation_period}}** from your date of joining. Upon successful completion of probation, your appointment will be formally confirmed. The standard notice period for separation shall be **{{notice_period}}**.

**4. TERMS & CONDITIONS**
Your employment is governed by the code of conduct, non-disclosure covenants, and HR governance policies of **{{company_name}}**.

Please sign and return the duplicate copy of this letter as a token of your formal acceptance.

Sincerely,
For **{{company_name}}**

___________________________
**{{signatory_name}}**
{{signatory_title}}

**ACCEPTED AND CONFIRMED:**
Signature: ___________________________
Date: ___________________________`,
    sampleData: {
      reference_number: 'TSK-APP-2026-042',
      candidate_name: 'Priya Patel',
      employee_id: 'EMP-1002',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Lead Product Manager',
      department: 'Product Management',
      reporting_manager: 'Sheetal Bedi (CEO)',
      joining_date: 'November 15, 2026',
      work_location: 'Mumbai, India',
      official_email: 'priya.patel@tasknera.com',
      annual_ctc: 'INR 26,00,000 per annum',
      probation_period: '90 days',
      notice_period: '60 days',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 3. Experience Letter
  {
    value: 'Experience Letter',
    legacyValue: 'EXPERIENCE_LETTER',
    label: 'Experience Letter',
    group: 'certificates',
    groupLabel: 'Experience Letter',
    defaultTitle: 'EXPERIENCE LETTER',
    blueprintContent: `Ref: {{reference_number}}    Date: {{issue_date}}

**EXPERIENCE LETTER**
*To Whom It May Concern*

This is to certify that **{{honorific}} {{candidate_name}}** was associated with **{{company_name}}** as a **{{job_title}}** from **{{joining_date}}**, to **{{end_date}}**.

During {{possessive_pronoun}} tenure with the organization, {{pronoun}} contributed to the development and enhancement of the company's software solutions, particularly in the areas of Human Resource Management Systems (HRMS), Applicant Tracking Systems (ATS), recruitment automation, and business application development.

{{possessive_pronoun_cap}} key responsibilities and contributions included:
• Developing and enhancing HRMS modules and functionalities.
• Contributing to the development of HireIQ, an AI-powered Applicant Tracking System (ATS), including resume parsing, candidate screening, and job description matching.
• Developing email automation functionalities for recruitment and business communication.
• Building automated document generation functionalities, including offer letters, experience letters, and certificates.
• Developing and maintaining company website components and application interfaces.
• Working on frontend and backend integration, database management, API development, and application functionality.
• Supporting the Talent Acquisition (TA) Team with recruitment-related activities and process improvements.
• Contributing to research, preparation, and development of training materials for Learning & Development (L&D) initiatives.

Throughout {{possessive_pronoun}} association with **{{company_name}}**, {{pronoun}} demonstrated professionalism, technical aptitude, sincerity, adaptability, teamwork, willingness to learn, and responsibility in carrying out {{possessive_pronoun}} assigned duties.

{{possessive_pronoun_cap}} association with **{{company_name}}** concluded on **{{end_date}}**.

We appreciate {{possessive_pronoun}} contributions to the organization and wish {{possessive_pronoun}} continued success and growth in {{possessive_pronoun}} future professional endeavors.

For **{{company_name}}**

___________________________
**{{signatory_name}}**
{{signatory_title}}
Authorized Signature: __________________
Date: {{issue_date}}
Place: {{signatory_place}}

Registered Office:
D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
Email: operations@tasknera.com | Website: https://tasknera.com`,
    sampleData: {
      reference_number: 'TKS/HR/INT/2026-27/001',
      candidate_name: 'Maurya Ajay Munnalal',
      honorific: 'Mr.',
      pronoun: 'he',
      possessive_pronoun: 'his',
      possessive_pronoun_cap: 'His',
      company_name: 'Tasknera HR Solutions',
      issue_date: '14/09/2026',
      job_title: 'Full Stack Developer',
      department: 'Engineering',
      joining_date: 'October 25, 2025',
      end_date: 'September 14, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 4. Relieving Letter
  {
    value: 'Relieving Letter',
    legacyValue: 'RELIEVING_LETTER',
    label: 'Relieving Letter',
    group: 'templates',
    groupLabel: 'Relieving Letter',
    defaultTitle: 'Official Relieving & Clearance Certificate',
    blueprintContent: `**RELIEVING LETTER & FORMAL RELEASE OF SERVICE**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

To,
**{{candidate_name}}**
Employee ID: {{employee_id}}
Department: {{department}}

**SUBJECT: RELIEVING LETTER & FORMAL RELEASE OF SERVICE**

Dear **{{candidate_name}}**,

This has reference to your formal resignation dated **{{resignation_date}}**, requesting release from your services as **{{job_title}}**.

We hereby confirm that you have been formally relieved of your duties and contractual obligations with **{{company_name}}** with effect from the close of business hours on **{{end_date}}** (the "Last Working Day").

All departmental handovers, intellectual property clearances, access credentials, and hardware assets have been surrendered and verified satisfactorily.

Your Full & Final Settlement (FNF) has been processed and disbursed in accordance with statutory guidelines.

We appreciate the dedication you exhibited during your association with **{{company_name}}** and wish you every success in your future professional endeavors.

Yours sincerely,
For **{{company_name}}**

___________________________
**{{signatory_name}}**
{{signatory_title}}
Date: {{issue_date}}
Place: {{signatory_place}}`,
    sampleData: {
      reference_number: 'TSK-REL-2026-055',
      candidate_name: 'Amitabh Sen',
      employee_id: 'EMP-1003',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'DevOps & Cloud Specialist',
      department: 'Operations & Infrastructure',
      resignation_date: 'September 15, 2026',
      end_date: 'October 31, 2026',
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

On behalf of **{{company_name}}**, we are delighted to offer you an appointment as a **{{job_title}}** within our **{{department}}** team.

**1. TENURE & MENTORSHIP**
• **Commencement Date**: **{{joining_date}}**
• **Tenure Conclusion**: **{{end_date}}**
• **Designated Mentor**: **{{reporting_manager}}**
• **Work Location**: **{{work_location}}**

**2. STIPEND & ALLOWANCES**
• **Monthly Academic Stipend**: **{{base_salary}}**
• **Disbursement Schedule**: Payable on the final business day of each calendar month.
• **Learning Resources**: Full access to TaskNera engineering resources and development sandboxes.

**3. LEARNING DELIVERABLES & CONFIDENTIALITY**
You will participate actively in project deliverables and sprint reviews under mentor guidance. You agree to maintain strict confidentiality regarding all client data and proprietary source code.

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

  // 6. Recruitment Agreement (MRSA) / NDA
  {
    value: 'Recruitment Agreement',
    legacyValue: 'RECRUITMENT_AGREEMENT',
    label: 'Non-Disclosure & Recruitment Agreement (MRSA)',
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
• **Service Fee**: **{{base_salary}}** of placed candidate's first-year Total Cost to Company (CTC).
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

  // 7. Salary Revision / Increment Letter
  {
    value: 'Increment Letter',
    legacyValue: 'INCREMENT_LETTER',
    label: 'Salary Revision & Increment Letter',
    group: 'templates',
    groupLabel: 'Increment Letter',
    defaultTitle: 'Predefined Increment Letter',
    blueprintContent: `**COMPENSATION REVISION & PERFORMANCE RECOGNITION**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

To,
**{{candidate_name}}**
Employee ID: {{employee_id}}
Department: {{department}}
Designation: {{job_title}}

Dear **{{candidate_name}}**,

In recognition of your exceptional contributions, dedication, and technical leadership, we are delighted to announce the revision of your compensation terms.

**COMPENSATION REVISION SUMMARY:**
• **Current Designation**: {{job_title}}
• **Previous Annual CTC**: {{base_salary}}
• **Revised Annual CTC**: **{{annual_ctc}}**
• **Effective Date of Revision**: **{{joining_date}}**

All other terms and covenants of your employment contract remain unchanged and in full force.

We congratulate you on your achievements and look forward to your sustained contribution toward our shared company milestones!

Sincerely,
For **{{company_name}}**

___________________________
**{{signatory_name}}**
{{signatory_title}}`,
    sampleData: {
      reference_number: 'TSK-INC-2026-102',
      candidate_name: 'Ananya Roy',
      employee_id: 'EMP-1004',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'UI/UX Product Designer',
      department: 'Product & Design',
      joining_date: 'December 01, 2026',
      base_salary: 'INR 15,00,000 per annum',
      annual_ctc: 'INR 18,50,000 per annum',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 8. Termination / Separation Letter
  {
    value: 'Termination Letter',
    legacyValue: 'TERMINATION_LETTER',
    label: 'Separation & Termination Letter',
    group: 'templates',
    groupLabel: 'Termination Letter',
    defaultTitle: 'Formal Separation & Discontinuation Letter',
    blueprintContent: `**NOTICE OF EMPLOYMENT CONCLUSION**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

PRIVATE & CONFIDENTIAL

To,
**{{candidate_name}}**
Employee ID: {{employee_id}}
Designation: {{job_title}}
Department: {{department}}

Dear **{{candidate_name}}**,

This letter serves as formal notification that your employment with **{{company_name}}** will conclude effective **{{end_date}}**. Your last working day will be **{{end_date}}**.

**SEPARATION TERMS:**
1. **Notice / Severance**: Compensation will be settled as per your employment agreement covenants.
2. **Handover & Surrender of Property**: Please surrender all company laptops, security access credentials, ID badges, and corporate records to HR Operations on or before your last working day.
3. **Full & Final Settlement**: All accrued compensation and statutory benefits will be audited and disbursed following complete departmental clearance.
4. **Continuing Covenants**: You are reminded of your continuing legal obligations regarding non-disclosure of confidential information and intellectual property belonging to **{{company_name}}**.

Sincerely,
For **{{company_name}}**

___________________________
**{{signatory_name}}**
{{signatory_title}}`,
    sampleData: {
      reference_number: 'TSK-SEP-2026-031',
      candidate_name: 'Employee Name',
      employee_id: 'EMP-1099',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Software Developer',
      department: 'Engineering',
      end_date: 'November 30, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 9. Monthly Salary Slip
  {
    value: 'Salary Slip',
    legacyValue: 'SALARY_SLIP',
    label: 'Monthly Salary Slip Statement',
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

  // 10. Certificate of Completion
  {
    value: 'Certificate',
    legacyValue: 'CERTIFICATE',
    label: 'Certificate of Completion / Training',
    group: 'certificates',
    groupLabel: 'Certificate',
    defaultTitle: 'Certificate of Professional Achievement',
    blueprintContent: `**CERTIFICATE OF PROFESSIONAL TRAINING & ACHIEVEMENT**

This certificate is proudly conferred upon:

# **{{candidate_name}}**
(Employee ID: {{employee_id}} | **{{job_title}}**, {{department}})

In formal recognition of successful completion of the executive training program:

## **{{course_name}}**

Conducted by **{{company_name}}** Corporate Learning & Development Team.

Credential ID: **{{reference_number}}**
Completion Date: **{{end_date}}**
Date of Issue: **{{issue_date}}**

IN TESTIMONY WHEREOF, WE AFFIX OUR OFFICIAL CORPORATE ENDORSEMENT:

___________________________             ___________________________
**{{signatory_name}}**                   Authorized Executive
{{signatory_title}}                      Learning & Development
**{{company_name}}**                     **{{company_name}}**`,
    sampleData: {
      reference_number: 'TSK-CERT-2026-881',
      candidate_name: 'Rahul Sharma',
      employee_id: 'EMP-1001',
      company_name: 'TaskNera HR Solutions',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Software Engineer',
      department: 'Engineering',
      course_name: 'Advanced Distributed Systems & High-Availability Architecture',
      end_date: 'October 24, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },
];

// Document Renderer helper
const ExecutiveDocumentRenderer: React.FC<{
  content: string;
  formData: Record<string, string>;
  highlightPlaceholders: boolean;
}> = ({ content, formData, highlightPlaceholders }) => {
  const lines = content.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'justify', lineHeight: 1.65 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} style={{ height: 8 }} />;
        }

        // Title headings
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '14px 0 8px 0', textTransform: 'uppercase' }}>
              {trimmed.replace(/^#s+/, '')}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: '10px 0 6px 0' }}>
              {trimmed.replace(/^##s+/, '')}
            </h2>
          );
        }

        // Section headings with **num. Title**
        const sectionMatch = trimmed.match(/^\*\*(\d+\.\s+[^*]+)\*\*$/);
        if (sectionMatch) {
          return (
            <div key={idx} style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', marginTop: 12, marginBottom: 4, textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>
              {sectionMatch[1]}
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith('• ') || trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.replace(/^[•*-]\s+/, '');
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, paddingLeft: 12, margin: '2px 0' }}>
              <span style={{ color: '#0284c7', fontWeight: 700 }}>•</span>
              <span style={{ flex: 1 }}>{renderLineWithFormatting(itemText, formData, highlightPlaceholders)}</span>
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: 0 }}>
            {renderLineWithFormatting(trimmed, formData, highlightPlaceholders)}
          </p>
        );
      })}
    </div>
  );
};

function renderLineWithFormatting(text: string, formData: Record<string, string>, highlight: boolean) {
  // Replace tokens and render strong elements
  const parts = text.split(/(\*\*.*?\*\*|\{\{.*?\}\})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p) return null;
        if (p.startsWith('**') && p.endsWith('**')) {
          const inner = p.slice(2, -2);
          return <strong key={i} style={{ color: '#0f172a' }}>{inner}</strong>;
        }
        if (p.startsWith('{{') && p.endsWith('}}')) {
          const key = p.slice(2, -2).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
          const val = formData[key] || p;
          if (highlight) {
            return (
              <mark key={i} style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '1px 4px', borderRadius: 3, fontWeight: 600 }}>
                {val}
              </mark>
            );
          }
          return <strong key={i} style={{ color: '#0f172a' }}>{val}</strong>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export const TemplatesPage: React.FC = () => {
  const { success, error, info } = useToast();

  // Mode: Generator vs Library
  const [activeTab, setActiveTab] = useState<'generator' | 'library'>('generator');

  // 4 CLEAR WORKFLOW STEPS:
  // Step 1: Select Document Type
  // Step 2: Enter Details
  // Step 3: Generate & Preview
  // Step 4: Download
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Active Document Configuration
  const [templateCategory, setTemplateCategory] = useState<string>(OFFERS_ALL_CATEGORIES[0].value);
  const [templateTitle, setTemplateTitle] = useState<string>(OFFERS_ALL_CATEGORIES[0].defaultTitle);
  const [templateText, setTemplateText] = useState<string>(OFFERS_ALL_CATEGORIES[0].blueprintContent);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(OFFERS_ALL_CATEGORIES[0].sampleData);
  const [templateFileName, setTemplateFileName] = useState<string>('Corporate_Offer_Letter.docx');

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Employee Directory for 1-Click Autofill
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

  // Preview & Direct Editing
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isDirectEditing, setIsDirectEditing] = useState<boolean>(false);
  const [directEditedContent, setDirectEditedContent] = useState<string>('');
  const [isSavingDoc, setIsSavingDoc] = useState<boolean>(false);

  // Library State
  const [libraryTemplates, setLibraryTemplates] = useState<DocumentTemplateItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState<boolean>(false);
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [libraryCategory, setLibraryCategory] = useState<string>('ALL');

  // Load initial employees & library
  useEffect(() => {
    loadEmployees();
    loadLibraryTemplates();
  }, []);

  // Sync detected placeholders whenever template text changes
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

  // Helper to extract tokens: {{key}}, [key], <<key>>
  const extractPlaceholdersFromText = (text: string) => {
    const found = new Set<string>();

    const regexCurly = /\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g;
    let match;
    while ((match = regexCurly.exec(text)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (key) found.add(key);
    }

    const regexSquare = /\[\s*([a-zA-Z0-9_\s]{2,40})\s*\]/g;
    while ((match = regexSquare.exec(text)) !== null) {
      const raw = match[1].trim();
      if (!/^\d+$/.test(raw) && !raw.startsWith('http')) {
        const key = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (key) found.add(key);
      }
    }

    const arr = Array.from(found);
    setDetectedPlaceholders(arr);

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

  // Handle Category Change from Dropdown
  const handleCategoryChange = (catKey: string) => {
    if (catKey === 'CUSTOM') {
      fileInputRef.current?.click();
      return;
    }

    setTemplateCategory(catKey);
    const found = OFFERS_ALL_CATEGORIES.find((c) => c.value === catKey || c.label === catKey);
    if (found) {
      setTemplateTitle(found.defaultTitle);
      setTemplateFileName(`${found.value.replace(/\s+/g, '_')}.docx`);
      setTemplateText(found.blueprintContent);
      extractPlaceholdersFromText(found.blueprintContent);
      if (found.sampleData) {
        setFormData((prev) => ({ ...prev, ...found.sampleData }));
      }
      success(`Loaded "${found.label}" blueprint.`);
    }
  };

  // Handle File Upload (.docx, .pdf, .txt)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setTemplateFileName(file.name);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setTemplateTitle(cleanTitle);

    try {
      const res = await EmployeeService.uploadTemplate(file);
      if (res && res.extractedContent && res.extractedContent.trim().length > 0) {
        setTemplateText(res.extractedContent);
        if (res.suggestedCategory) setTemplateCategory(res.suggestedCategory);
        extractPlaceholdersFromText(res.extractedContent);
        success(`Uploaded "${file.name}" cleanly (${res.detectedFormat}). Detected fields ready!`);
        setStep(2);
        setIsUploading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend parsing fallback to client-side:', err);
    }

    try {
      const clientRes = await parseDocumentClientSide(file);
      if (clientRes && clientRes.extractedContent && clientRes.extractedContent.trim().length > 0) {
        setTemplateText(clientRes.extractedContent);
        extractPlaceholdersFromText(clientRes.extractedContent);
        success(`Parsed "${file.name}" successfully (${clientRes.detectedFormat})!`);
        setStep(2);
        setIsUploading(false);
        return;
      } else {
        throw new Error('Document contains no extractable text content.');
      }
    } catch (clientErr: any) {
      error(`Failed to parse "${file.name}": ${clientErr.message || 'Scanned or corrupt file'}`);
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
      email: emp.personalEmail || emp.officialEmail || '',
      phone: emp.phone || '',
    };

    if (emp.annualCtc) {
      empFields['annual_ctc'] = `${emp.currency || 'INR'} ${emp.annualCtc.toLocaleString('en-IN')} per annum`;
      empFields['base_salary'] = `${emp.currency || 'INR'} ${Math.round(emp.annualCtc * 0.7).toLocaleString('en-IN')} per annum`;
    }

    const autoKeys = Object.keys(empFields);
    setDetectedPlaceholders((prev) => Array.from(new Set([...prev, ...autoKeys])));
    setFormData((prev) => ({ ...prev, ...empFields }));
    success(`Autofilled details from ${emp.fullName}'s profile!`);
  };

  // Compile final populated document text
  const getCompiledDocumentText = () => {
    if (isDirectEditing && directEditedContent) {
      return directEditedContent;
    }
    let res = templateText;

    res = res.replace(/\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g, (_, key) => {
      const raw = key.trim();
      const clean = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      if (formData[raw] !== undefined && formData[raw] !== '') return formData[raw];
      return `{{${raw}}}`;
    });

    res = res.replace(/\[\s*([a-zA-Z0-9_\s]{2,40})\s*\]/g, (orig, key) => {
      const clean = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      return orig;
    });

    return res;
  };

  // Transition from Step 2 to Step 3: Compile Document
  const handleGenerateDocument = () => {
    const compiled = getCompiledDocumentText();
    setDirectEditedContent(compiled);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    success('Document generated successfully! You can preview and edit below.');
  };

  // High-Fidelity Isolated Print (PDF Export)
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
              size: A4 portrait;
              margin: 15mm 18mm 15mm 18mm;
            }
            body {
              font-family: Georgia, "Times New Roman", Times, serif;
              color: #1e293b;
              line-height: 1.55;
              padding: 0;
              margin: 0;
              background: #fff;
              font-size: 10.5pt;
            }
            .no-print { display: none !important; }
            h1, h2, h3 { color: #0f172a; margin-top: 0; }
            p { margin: 6px 0; text-align: justify; }
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

  // Download Word Document (.doc format compatible with Microsoft Word)
  const handleDownloadWordDoc = () => {
    const rawContent = getCompiledDocumentText();
    const recipient = formData.candidate_name || formData.employee_name || 'Recipient';
    const filename = `${templateTitle.replace(/\s+/g, '_')}_${recipient.replace(/\s+/g, '_')}.doc`;

    const lines = rawContent.split('\n');
    const htmlLines: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        htmlLines.push('<p style="margin:4px 0;">&nbsp;</p>');
        return;
      }
      if (trimmed.startsWith('# ')) {
        htmlLines.push(`<h2 style="color:#0f172a; text-align:center; font-family:Arial,sans-serif; text-transform:uppercase; border-bottom:2px solid #0f172a; padding-bottom:6px; margin:20px 0 16px;">${trimmed.replace(/^#\s+/, '')}</h2>`);
        return;
      }
      const bMatch = trimmed.match(/^(?:•|\*|-)\s+(.*)$/);
      if (bMatch) {
        const itemHtml = bMatch[1].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlLines.push(`<div style="margin:4px 0 4px 18px; font-family:'Times New Roman',serif;"><span style="color:#0284c7; font-weight:bold;">•</span>&nbsp;&nbsp;${itemHtml}</div>`);
        return;
      }
      const pHtml = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      htmlLines.push(`<p style="margin:6px 0; line-height:1.6; font-family:'Times New Roman',serif; text-align:justify;">${pHtml}</p>`);
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
        </style>
      </head>
      <body>
        <div style="border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px;">
          <h1 style="margin:0; font-size:18pt; color:#0f172a;">TASKNERA</h1>
          <div style="font-size:9pt; color:#64748b;">GLOBAL HR • RECRUITMENT • WORKFORCE SOLUTIONS</div>
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

  const handleCopyText = () => {
    const text = getCompiledDocumentText();
    navigator.clipboard.writeText(text);
    success('Copied document text to clipboard!');
  };

  // Helper to get categorized fields for Step 2
  const getCategorizedFields = () => {
    const allKeys = Array.from(new Set([...detectedPlaceholders, ...Object.keys(formData)]));

    const recipientKeys = ['candidate_name', 'employee_name', 'contractor_name', 'honorific', 'email', 'personal_email', 'official_email', 'phone', 'candidate_address', 'address', 'employee_id'];
    const roleKeys = ['job_title', 'designation', 'department', 'work_location', 'reporting_manager', 'mentor_name'];
    const termsKeys = ['joining_date', 'end_date', 'last_working_day', 'resignation_date', 'annual_ctc', 'base_salary', 'variable_pay', 'notice_period', 'probation_period', 'valid_until', 'course_name'];
    const signatoryKeys = ['signatory_name', 'signatory_title', 'signatory_place', 'issue_date', 'reference_number'];

    const recipientFields = allKeys.filter((k) => recipientKeys.includes(k));
    const roleFields = allKeys.filter((k) => roleKeys.includes(k));
    const termsFields = allKeys.filter((k) => termsKeys.includes(k));
    const signatoryFields = allKeys.filter((k) => signatoryKeys.includes(k));
    const otherFields = allKeys.filter(
      (k) =>
        !recipientKeys.includes(k) &&
        !roleKeys.includes(k) &&
        !termsKeys.includes(k) &&
        !signatoryKeys.includes(k) &&
        k !== 'company_name' &&
        k !== 'pronoun' &&
        k !== 'possessive_pronoun' &&
        k !== 'possessive_pronoun_cap'
    );

    return {
      recipientFields,
      roleFields,
      termsFields,
      signatoryFields,
      otherFields,
    };
  };

  const formatFieldLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const isMandatoryField = (key: string) => {
    return ['candidate_name', 'employee_name', 'job_title', 'designation', 'department', 'joining_date'].includes(key);
  };

  const { recipientFields, roleFields, termsFields, signatoryFields, otherFields } = getCategorizedFields();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 80px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Top Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          backgroundColor: '#ffffff',
          padding: '20px 24px',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Sparkles size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              AI Document Generator
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: '#64748b' }}>
            Generate, customize, and download official HR letters and agreements in 4 simple steps.
          </p>
        </div>

        {/* Tab switch: Generator vs Library */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              backgroundColor: activeTab === 'generator' ? '#ffffff' : 'transparent',
              color: activeTab === 'generator' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              boxShadow: activeTab === 'generator' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            AI Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: 6,
              border: 'none',
              backgroundColor: activeTab === 'library' ? '#ffffff' : 'transparent',
              color: activeTab === 'library' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              boxShadow: activeTab === 'library' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Template Library ({libraryTemplates.length || OFFERS_ALL_CATEGORIES.length})
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div>
          {/* =================================================================== */}
          {/* 4-STEP WORKFLOW PROGRESS BAR                                        */}
          {/* =================================================================== */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '16px 24px',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
              overflowX: 'auto',
              gap: 12,
            }}
          >
            {[
              { num: 1, label: '1. Select Document', desc: 'Choose type' },
              { num: 2, label: '2. Enter Details', desc: 'Fill required variables' },
              { num: 3, label: '3. Generate & Preview', desc: 'Review & edit content' },
              { num: 4, label: '4. Download', desc: 'Export PDF or Word' },
            ].map((s, idx) => {
              const isCurrent = step === s.num;
              const isDone = step > s.num;
              return (
                <React.Fragment key={s.num}>
                  <div
                    onClick={() => {
                      if (isDone) setStep(s.num as any);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: isDone ? 'pointer' : 'default',
                      opacity: isCurrent || isDone ? 1 : 0.6,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        backgroundColor: isCurrent ? '#0f172a' : isDone ? '#16a34a' : '#f1f5f9',
                        color: isCurrent || isDone ? '#ffffff' : '#64748b',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isDone ? '✓' : s.num}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isCurrent ? '#0f172a' : isDone ? '#16a34a' : '#475569' }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {s.desc}
                      </div>
                    </div>
                  </div>
                  {idx < 3 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        backgroundColor: isDone ? '#16a34a' : '#e2e8f0',
                        margin: '0 8px',
                        minWidth: 24,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* =================================================================== */}
          {/* STEP 1: SELECT DOCUMENT TYPE                                        */}
          {/* =================================================================== */}
          {step === 1 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: '32px 36px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Select Document Type
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                    Choose the type of official HR document you want to generate.
                  </p>
                </div>

                {/* Primary Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                    Document Type
                  </label>
                  <select
                    value={templateCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.925rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    {OFFERS_ALL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                    <option value="CUSTOM">Upload Custom Document Template (.docx, .pdf, .txt)</option>
                  </select>
                </div>

                {/* Template Active Summary Badge */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Active Document Blueprint
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {templateTitle}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                      {detectedPlaceholders.length} dynamic variables • Formatted for official Tasknera letterhead
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    icon={<Eye size={14} />}
                    onClick={() => setStep(3)}
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    Quick Preview
                  </Button>
                </div>

                {/* Optional Custom Template Upload Dropzone */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                      Or Upload Custom Document Template (Optional)
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Supports Word (.docx), PDF, or Text (.txt)</span>
                  </div>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: dragActive ? '2px dashed #2563eb' : '1.5px dashed #cbd5e1',
                      backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                      borderRadius: 10,
                      padding: '24px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,.txt,.html"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <Upload size={24} style={{ color: '#64748b', margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      {isUploading ? 'Parsing document content...' : 'Drop your Word or PDF file here, or browse computer'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                      AI automatically detects placeholders while preserving original formatting.
                    </div>
                  </div>
                </div>

                {/* Collapsible Advanced Text Input */}
                <details style={{ marginTop: -4 }}>
                  <summary style={{ fontSize: '0.78rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                    Advanced: View or modify raw template text
                  </summary>
                  <div style={{ marginTop: 10 }}>
                    <textarea
                      rows={5}
                      value={templateText}
                      onChange={(e) => {
                        setTemplateText(e.target.value);
                        extractPlaceholdersFromText(e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </details>

                {/* Proceed Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    variant="primary"
                    icon={<ArrowRight size={16} />}
                    onClick={() => setStep(2)}
                    style={{ padding: '11px 26px', fontSize: '0.875rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Continue to Enter Details
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 2: ENTER DETAILS                                               */}
          {/* =================================================================== */}
          {step === 2 && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: '28px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Header & 1-Click Employee Autofill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: 16,
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                      Step 2: Enter Details for {templateTitle}
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                      Provide recipient and role information. Mandatory fields are marked with <span style={{ color: '#ef4444', fontWeight: 700 }}>*</span>.
                    </p>
                  </div>

                  {/* Autofill from Employee Directory */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#2563eb" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>Autofill from Profile:</span>
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Choose Employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName} ({emp.designation || 'Staff'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Group 1: Recipient Information */}
                {recipientFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>👤 Recipient / Employee Information</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                      {recipientFields.map((key) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            {formatFieldLabel(key)} {isMandatoryField(key) && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>
                          <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Enter ${formatFieldLabel(key)}...`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Group 2: Role & Department */}
                {roleFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>💼 Role &amp; Organization Details</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                      {roleFields.map((key) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            {formatFieldLabel(key)} {isMandatoryField(key) && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>
                          <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Enter ${formatFieldLabel(key)}...`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Group 3: Terms, Dates & Compensation */}
                {termsFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📅 Terms, Dates &amp; Compensation</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                      {termsFields.map((key) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            {formatFieldLabel(key)} {isMandatoryField(key) && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>
                          <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Enter ${formatFieldLabel(key)}...`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Form Group 4: Authority & Signatory */}
                {signatoryFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>✍️ Authority, Signatory &amp; Reference</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                      {signatoryFields.map((key) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            {formatFieldLabel(key)}
                          </label>
                          <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Enter ${formatFieldLabel(key)}...`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Custom Fields if any */}
                {otherFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      📋 Additional Document Fields
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                      {otherFields.map((key) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                            {formatFieldLabel(key)}
                          </label>
                          <input
                            type="text"
                            value={formData[key] || ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                            placeholder={`Enter ${formatFieldLabel(key)}...`}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8125rem',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => setStep(1)}
                  >
                    Back to Select Document
                  </Button>

                  <Button
                    variant="primary"
                    icon={<Sparkles size={16} />}
                    onClick={handleGenerateDocument}
                    style={{ padding: '11px 26px', fontSize: '0.875rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Generate Document
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 3: GENERATE & PREVIEW                                          */}
          {/* =================================================================== */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Step 3 Toolbar */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(2)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Edit Details
                  </Button>

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: isDirectEditing ? '#1e40af' : '#475569',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      borderRadius: 6,
                      backgroundColor: isDirectEditing ? '#eff6ff' : '#f8fafc',
                      border: isDirectEditing ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isDirectEditing}
                      onChange={(e) => setIsDirectEditing(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Click-to-Edit Mode</span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    variant="secondary"
                    icon={<Copy size={14} />}
                    onClick={handleCopyText}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Copy Text
                  </Button>

                  <Button
                    variant="primary"
                    icon={<ArrowRight size={16} />}
                    onClick={() => {
                      setStep(4);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ padding: '8px 20px', fontSize: '0.85rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Proceed to Download
                  </Button>
                </div>
              </div>

              {/* Printable Document Sheet Canvas (A4 Dimensions) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '16px 0',
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  id="printable-ai-generated-doc"
                  contentEditable={isDirectEditing}
                  suppressContentEditableWarning={true}
                  style={{
                    width: '100%',
                    maxWidth: 820,
                    backgroundColor: '#ffffff',
                    padding: '44px 52px',
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    fontSize: '10.5pt',
                    lineHeight: 1.6,
                    color: '#1e293b',
                    boxSizing: 'border-box',
                    minHeight: 1000,
                    outline: isDirectEditing ? '1px dashed #94a3b8' : 'none',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ width: 44, height: 44, objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          TASKNERA
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.04em' }}>
                          GLOBAL HR • RECRUITMENT • WORKFORCE SOLUTIONS
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      <div>Ref: <strong>{formData.reference_number || 'TSK-DOC-2026'}</strong></div>
                      <div>Date: <strong>{formData.issue_date || new Date().toLocaleDateString()}</strong></div>
                    </div>
                  </div>

                  {/* Document Body */}
                  <ExecutiveDocumentRenderer
                    content={directEditedContent || templateText}
                    formData={formData}
                    highlightPlaceholders={highlightPlaceholders}
                  />

                  {/* Official Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      marginTop: 36,
                      paddingTop: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    <div>Tasknera HR Solutions Private Limited — Confidential</div>
                    <div>Page 1 of 1</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 4: DOWNLOAD & FINAL EXPORT                                     */}
          {/* =================================================================== */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Success & Ready Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '28px 32px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                      Document Ready for Download
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                      Your {templateTitle} has been formatted and compiled with all variables.
                    </p>
                  </div>
                </div>

                {/* Summary Particulars */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 12,
                    backgroundColor: '#f8fafc',
                    padding: '16px 20px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DOCUMENT TITLE</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{templateTitle}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>RECIPIENT NAME</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {formData.candidate_name || formData.employee_name || 'Recipient'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>REFERENCE NUMBER</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {formData.reference_number || 'TSK-DOC-2026'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>ISSUE DATE</div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {formData.issue_date || new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Download Action Buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    icon={<Printer size={16} />}
                    onClick={handlePrint}
                    style={{ padding: '12px 24px', fontSize: '0.9rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Download PDF
                  </Button>

                  <Button
                    variant="secondary"
                    icon={<Download size={16} />}
                    onClick={handleDownloadWordDoc}
                    style={{ padding: '12px 22px', fontSize: '0.9rem' }}
                  >
                    Download Word (.doc)
                  </Button>

                  <Button
                    variant="secondary"
                    icon={<Save size={16} />}
                    onClick={handleSaveToDocuments}
                    isLoading={isSavingDoc}
                    style={{ padding: '12px 22px', fontSize: '0.9rem' }}
                  >
                    Save to Generated Documents
                  </Button>

                  <div style={{ flex: 1 }} />

                  <Button
                    variant="secondary"
                    icon={<RotateCcw size={15} />}
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ padding: '10px 18px', fontSize: '0.825rem' }}
                  >
                    Create Another Document
                  </Button>
                </div>
              </div>

              {/* Read-Only Document Inspection View */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '24px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    Document Inspection Preview
                  </span>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(3)}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    Edit in Preview
                  </Button>
                </div>

                <div
                  id="printable-ai-generated-doc"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '40px 48px',
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    fontSize: '10pt',
                    lineHeight: 1.6,
                    color: '#1e293b',
                    boxSizing: 'border-box',
                  }}
                >
                  <ExecutiveDocumentRenderer
                    content={directEditedContent || templateText}
                    formData={formData}
                    highlightPlaceholders={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* TAB 2: TEMPLATE LIBRARY (Retained cleanly for existing access)       */
        /* =================================================================== */
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
                placeholder="Search templates by title or category..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Template Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 16,
            }}
          >
            {OFFERS_ALL_CATEGORIES.map((cat) => (
              <div
                key={cat.value}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cat.groupLabel}
                    </span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                      Preloaded
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {cat.label}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    {cat.defaultTitle}
                  </p>
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    icon={<Sparkles size={14} />}
                    onClick={() => {
                      handleCategoryChange(cat.value);
                      setActiveTab('generator');
                      setStep(2);
                    }}
                    style={{ fontSize: '0.78rem', padding: '7px 14px', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Use in AI Generator
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
