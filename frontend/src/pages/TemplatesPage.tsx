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
  Award,
  Edit3,
  HelpCircle,
  FileUp,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { EmployeeService, Employee, DocumentTemplateItem } from '../services/employeeService.js';
import { templateService } from '../services/templateService.js';
import { HrDocument } from '../types/document-engine.js';
import { useToast } from '../context/ToastContext.js';
import { parseDocumentClientSide } from '../utils/clientDocumentParser.js';
import {
  CustomTemplateService,
  SavedCustomTemplate,
  TEMPLATES_UPDATED_EVENT,
} from '../services/customTemplateService.js';
import { EditTemplateModal, TemplateEditData } from '../components/templates/EditTemplateModal.js';

export interface CategoryItemDef {
  value: string;
  legacyValue?: string;
  label: string;
  group: 'templates' | 'policies' | 'certificates' | 'custom';
  groupLabel: string;
  defaultTitle: string;
  blueprintContent: string;
  sampleData: Record<string, string>;
  isCertificate?: boolean;
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
    fullName: 'Maurya Ajay Munnalal',
    personalEmail: 'ajay.maurya@example.com',
    officialEmail: 'ajay.m@tasknera.com',
    phone: '+91 97654 32109',
    joiningDate: '2025-10-25',
    designation: 'Full Stack Developer',
    department: 'Software Engineering',
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

// Document Templates, Letters, Certificates & Policies
export const OFFERS_ALL_CATEGORIES: CategoryItemDef[] = [
  // 1. Offer Letter
  {
    value: 'Offer Letter',
    legacyValue: 'OFFER_LETTER',
    label: 'Corporate Offer Letter',
    group: 'templates',
    groupLabel: 'Employment Offer',
    defaultTitle: 'CONFIDENTIAL OFFER OF EMPLOYMENT',
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
      company_name: 'Tasknera HR Solutions',
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

  // 2. Experience Letter
  {
    value: 'Experience Letter',
    legacyValue: 'EXPERIENCE_LETTER',
    label: 'Official Experience Letter',
    group: 'templates',
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
      department: 'Software Engineering',
      joining_date: 'October 25, 2025',
      end_date: 'September 14, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 3. Appointment Letter
  {
    value: 'Appointment Letter',
    legacyValue: 'APPOINTMENT_LETTER',
    label: 'Formal Appointment Letter',
    group: 'templates',
    groupLabel: 'Appointment',
    defaultTitle: 'LETTER OF APPOINTMENT',
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
      company_name: 'Tasknera HR Solutions',
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

  // 4. Relieving Letter
  {
    value: 'Relieving Letter',
    legacyValue: 'RELIEVING_LETTER',
    label: 'Relieving Letter & Service Release',
    group: 'templates',
    groupLabel: 'Relieving Letter',
    defaultTitle: 'RELIEVING LETTER & FORMAL RELEASE OF SERVICE',
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
      company_name: 'Tasknera HR Solutions',
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
    label: 'Internship Appointment Letter',
    group: 'templates',
    groupLabel: 'Internship',
    defaultTitle: 'INTERNSHIP APPOINTMENT LETTER',
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
• **Learning Resources**: Full access to Tasknera engineering sandboxes and research libraries.

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
      company_name: 'Tasknera HR Solutions',
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

  // 6. CERTIFICATE: Certificate of Internship
  {
    value: 'Certificate of Internship',
    legacyValue: 'CERTIFICATE_INTERNSHIP',
    label: 'Certificate of Internship',
    group: 'certificates',
    groupLabel: 'Certificate',
    defaultTitle: 'CERTIFICATE OF INTERNSHIP COMPLETION',
    isCertificate: true,
    blueprintContent: `# CERTIFICATE OF INTERNSHIP
## TASKNERA GLOBAL WORKFORCE SOLUTIONS

This prestigious certificate is proudly conferred upon:

# **{{candidate_name}}**
(Candidate ID: **{{employee_id}}**)

in formal recognition of outstanding dedication, exemplary professional conduct, and successful completion of the intensive internship program as:

## **{{job_title}}**
Department: **{{department}}**

**Tenure**: From **{{joining_date}}** to **{{end_date}}**
**Project Domain**: Full Stack Software Architecture, AI Integrations & Automated Systems

During this tenure, {{honorific}} {{candidate_name}} demonstrated remarkable technical dexterity, disciplined problem-solving, collaboration, and high initiative. {{possessive_pronoun_cap}} contributions have been of immense value to the engineering and product divisions.

Credential ID: **{{reference_number}}**
Date of Issue: **{{issue_date}}**
Place: **{{signatory_place}}**

___________________________             ___________________________
**{{signatory_name}}**                   Authorized Signatory
{{signatory_title}}                      Head of Human Resources & Operations
**{{company_name}}**                     **{{company_name}}**`,
    sampleData: {
      reference_number: 'TSK-CERT-INT-2026-009',
      candidate_name: 'Maurya Ajay Munnalal',
      employee_id: 'EMP-1003',
      honorific: 'Mr.',
      pronoun: 'he',
      possessive_pronoun: 'his',
      possessive_pronoun_cap: 'His',
      company_name: 'Tasknera HR Solutions',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Full Stack Developer Intern',
      department: 'Software Engineering & AI Solutions',
      joining_date: 'October 25, 2025',
      end_date: 'September 14, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 7. CERTIFICATE: Certificate of Appreciation
  {
    value: 'Certificate of Appreciation',
    legacyValue: 'CERTIFICATE_APPRECIATION',
    label: 'Certificate of Appreciation',
    group: 'certificates',
    groupLabel: 'Certificate',
    defaultTitle: 'CERTIFICATE OF APPRECIATION',
    isCertificate: true,
    blueprintContent: `# CERTIFICATE OF APPRECIATION
## TASKNERA HR SOLUTIONS

In Sincere Recognition of Exemplary Dedication & Professional Excellence

This certificate is proudly awarded to:

# **{{candidate_name}}**
{{job_title}} — {{department}}

In heartfelt appreciation for your remarkable contributions, outstanding performance, proactive teamwork, and steadfast commitment toward driving high-impact milestones at **{{company_name}}**.

Your unwavering passion and dedication set an inspiring benchmark across the entire organization.

Credential ID: **{{reference_number}}**
Date of Issue: **{{issue_date}}**
Venue: **{{signatory_place}}**

___________________________             ___________________________
**{{signatory_name}}**                   Executive Director
{{signatory_title}}                      People & Culture Operations
**{{company_name}}**                     **{{company_name}}**`,
    sampleData: {
      reference_number: 'TSK-CERT-APP-2026-104',
      candidate_name: 'Priya Patel',
      company_name: 'Tasknera HR Solutions',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Lead Product Manager',
      department: 'Product Strategy & Innovation',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 8. CERTIFICATE: Certificate of Training & Completion
  {
    value: 'Certificate of Completion',
    legacyValue: 'CERTIFICATE_COMPLETION',
    label: 'Certificate of Training & Completion',
    group: 'certificates',
    groupLabel: 'Certificate',
    defaultTitle: 'CERTIFICATE OF PROFESSIONAL COMPLETION',
    isCertificate: true,
    blueprintContent: `# CERTIFICATE OF PROFESSIONAL ACHIEVEMENT
## TASKNERA CORPORATE LEARNING & DEVELOPMENT

This certificate is proudly conferred upon:

# **{{candidate_name}}**
(Employee ID: {{employee_id}} | **{{job_title}}**, {{department}})

In formal recognition of successful completion of the executive professional training program:

## **{{course_name}}**

Conducted by **{{company_name}}** Corporate Learning & Development Team.

Credential ID: **{{reference_number}}**
Completion Date: **{{end_date}}**
Date of Issue: **{{issue_date}}**

IN TESTIMONY WHEREOF, WE AFFIX OUR OFFICIAL CORPORATE ENDORSEMENT:

___________________________             ___________________________
**{{signatory_name}}**                   Authorized Executive
{{signatory_title}}                      Learning & Development Director
**{{company_name}}**                     **{{company_name}}**`,
    sampleData: {
      reference_number: 'TSK-CERT-2026-881',
      candidate_name: 'Rahul Sharma',
      employee_id: 'EMP-1001',
      company_name: 'Tasknera HR Solutions',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Software Engineer',
      department: 'Engineering',
      course_name: 'Advanced Distributed Systems & High-Availability Architecture',
      end_date: 'October 24, 2026',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 9. CERTIFICATE: Certificate of Professional Excellence
  {
    value: 'Certificate of Excellence',
    legacyValue: 'CERTIFICATE_EXCELLENCE',
    label: 'Certificate of Professional Excellence',
    group: 'certificates',
    groupLabel: 'Certificate',
    defaultTitle: 'CERTIFICATE OF PROFESSIONAL EXCELLENCE',
    isCertificate: true,
    blueprintContent: `# CERTIFICATE OF PROFESSIONAL EXCELLENCE
## TASKNERA HONORS & AWARDS BOARD

Conferred in Celebration of Outstanding Technical Leadership and Organizational Impact

PROUDLY PRESENTED TO

# **{{candidate_name}}**
**{{job_title}}** — **{{department}}**

For demonstrating stellar innovation, unwavering integrity, and exceptional execution standards throughout the corporate milestone delivery cycle at **{{company_name}}**.

Credential Reference: **{{reference_number}}**
Awarded On: **{{issue_date}}**
Place: **{{signatory_place}}**

___________________________             ___________________________
**{{signatory_name}}**                   Executive Board Member
{{signatory_title}}                      Global Human Capital Committee
**{{company_name}}**                     **{{company_name}}**`,
    sampleData: {
      reference_number: 'TSK-AWD-EXC-2026-03',
      candidate_name: 'Maurya Ajay Munnalal',
      company_name: 'Tasknera HR Solutions',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Full Stack Developer',
      department: 'AI & Automation Engineering',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 10. General / Custom Document or Letter
  {
    value: 'Custom Document',
    legacyValue: 'CUSTOM_DOCUMENT',
    label: 'Custom Letter / Document / Certificate',
    group: 'custom',
    groupLabel: 'Custom AI Document',
    defaultTitle: 'OFFICIAL CORPORATE DOCUMENT',
    blueprintContent: `# **{{company_name}}**
## **{{document_title}}**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

To:
**{{candidate_name}}**
{{job_title}} — {{department}}
Email: {{official_email}}

**SUBJECT: {{document_title}}**

Dear **{{candidate_name}}**,

This official document is issued by **{{company_name}}** in respect of your engagement as **{{job_title}}**.

{{custom_content}}

Please contact HR Operations for any clarifications or assistance.

Sincerely,
For **{{company_name}}**

___________________________
**{{signatory_name}}**
{{signatory_title}}
Date: {{issue_date}}
Place: {{signatory_place}}`,
    sampleData: {
      document_title: 'Formal Corporate Notification',
      reference_number: `TSK-DOC-${new Date().getFullYear()}-001`,
      company_name: 'Tasknera HR Solutions',
      candidate_name: 'Recipient Full Name',
      job_title: 'Designation / Title',
      department: 'Department Name',
      official_email: 'recipient@tasknera.com',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      custom_content: 'We hereby confirm and endorse the statements, assignments, and covenants outlined herein in accordance with standard company regulations.',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_place: 'Delhi',
    },
  },

  // 11. Salary Revision / Increment Letter
  {
    value: 'Increment Letter',
    legacyValue: 'INCREMENT_LETTER',
    label: 'Salary Revision & Increment Letter',
    group: 'templates',
    groupLabel: 'Increment Letter',
    defaultTitle: 'COMPENSATION REVISION & PERFORMANCE RECOGNITION',
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
      company_name: 'Tasknera HR Solutions',
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

  // 12. Non-Disclosure & Recruitment Agreement (MRSA)
  {
    value: 'Recruitment Agreement',
    legacyValue: 'RECRUITMENT_AGREEMENT',
    label: 'Non-Disclosure & Recruitment Agreement (MRSA)',
    group: 'templates',
    groupLabel: 'Agreement',
    defaultTitle: 'MASTER RECRUITMENT SERVICES AGREEMENT (MRSA)',
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
      company_name: 'Tasknera HR Solutions',
      candidate_name: 'Apex Global Enterprises Inc.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      base_salary: '8.33% (1 Month CTC)',
      notice_period: '30 calendar days',
      probation_period: '90 days replacement warranty',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
    },
  },

  // 13. Employee Leave & Attendance Policy
  {
    value: 'Leave & Attendance Policy',
    legacyValue: 'LEAVE_ATTENDANCE_POLICY',
    label: 'Employee Leave & Attendance Policy',
    group: 'policies',
    groupLabel: 'Policy',
    defaultTitle: 'Employee Leave and Attendance Governance Standard',
    blueprintContent: `# **{{company_name}}**
## **{{policy_name}}**
### **{{category_label}} Governance & Compliance Standard**

**Policy Reference**: {{reference_number}} | **Version**: {{version}} | **Effective Date**: {{effective_date}}
**Applicability**: {{applicability}}
**Review Cycle**: {{review_cycle}} | **Governing Department**: {{department}}

---

**POLICY OBJECTIVE & MANDATE**
The purpose of this **{{policy_name}}** is to establish standardized, equitable, and enforceable operational directives governing working hours, attendance recording, statutory and discretionary leave entitlements, and workforce availability across **{{company_name}}**. Compliance with this standard is a mandatory condition of ongoing engagement.

**1. SCOPE & JURISDICTION**
• **Personnel Coverage**: Applicable to all full-time employees, part-time staff, fixed-term contractors, probationary personnel, and interns across all operating entities and branch delivery centers of **{{company_name}}**.
• **Operational Environments**: Encompasses onsite corporate offices, client locations, and approved remote/hybrid workstations.

**2. STANDARD WORKING HOURS & ATTENDANCE RECORDING**
• **Working Hours**: Standard full-time engagement consists of 5 business days per week, comprising **{{working_hours}}** daily, inclusive of a 1-hour rest and meal interval.
• **Core Collaboration Window**: All covered personnel must maintain synchronous team availability and communication reachability between **{{core_hours}}**.

**3. ANNUAL PAID TIME OFF (PTO) & ACCRUAL CEILING**
• **Accrual Rate**: Employees accrue **{{annual_leave_accrual}}** days of paid leave per completed calendar month of active service, providing an annual entitlement of **{{annual_leave_total}}** days.
• **Rollover Cap**: A maximum of **{{max_leave_carryover}}** unused paid leave days may be carried forward into the subsequent calendar year.

---

Authorized on behalf of **{{company_name}}**:

___________________________
**{{signatory_name}}** | {{signatory_title}}
Corporate Office: D-57 F1, Dilshad Colony, Shahdara, Delhi 110095`,
    sampleData: {
      policy_name: 'Employee Leave & Attendance Policy',
      category_label: 'Attendance & Leave',
      reference_number: 'POL-ATT-LVE-2026-v1.0',
      version: '1.0',
      company_name: 'Tasknera HR Solutions',
      effective_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      applicability: 'All Full-Time, Probationary, Remote & Associated Personnel',
      review_cycle: 'Annual Corporate Review',
      department: 'People Operations & Human Resources',
      working_hours: '9 hours (9:30 AM to 6:30 PM)',
      core_hours: '10:30 AM to 4:30 PM IST',
      annual_leave_accrual: '1.75',
      annual_leave_total: '21',
      max_leave_carryover: '10',
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
  isCertificate?: boolean;
}> = ({ content, formData, highlightPlaceholders, isCertificate }) => {
  const lines = content.split('\n');

  if (isCertificate) {
    return (
      <div
        style={{
          border: '4px double #1e3a8a',
          padding: '36px 32px',
          borderRadius: 8,
          backgroundColor: '#fafbfc',
          textAlign: 'center',
          position: 'relative',
          boxShadow: 'inset 0 0 20px rgba(30, 58, 138, 0.05)',
        }}
      >
        {/* Seal Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: '#1e3a8a',
            color: '#fbbf24',
            margin: '0 auto 12px auto',
          }}
        >
          <Award size={28} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, lineHeight: 1.6 }}>
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={idx} style={{ height: 6 }} />;
            }

            if (trimmed.startsWith('# ')) {
              return (
                <h1
                  key={idx}
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#1e3a8a',
                    textAlign: 'center',
                    margin: '6px 0',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {renderLineWithFormatting(trimmed.replace(/^#\s+/, ''), formData, highlightPlaceholders)}
                </h1>
              );
            }

            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    textAlign: 'center',
                    margin: '4px 0',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  {renderLineWithFormatting(trimmed.replace(/^##\s+/, ''), formData, highlightPlaceholders)}
                </h2>
              );
            }

            return (
              <p key={idx} style={{ margin: '2px 0', fontSize: '0.95rem', color: '#1e293b' }}>
                {renderLineWithFormatting(trimmed, formData, highlightPlaceholders)}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  // Standard Executive Letter & Policy view
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
            <h1
              key={idx}
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                textAlign: 'center',
                margin: '14px 0 8px 0',
                textTransform: 'uppercase',
              }}
            >
              {renderLineWithFormatting(trimmed.replace(/^#\s+/, ''), formData, highlightPlaceholders)}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f172a',
                textAlign: 'center',
                margin: '10px 0 6px 0',
              }}
            >
              {renderLineWithFormatting(trimmed.replace(/^##\s+/, ''), formData, highlightPlaceholders)}
            </h2>
          );
        }

        // Section headings with **num. Title**
        const sectionMatch = trimmed.match(/^\*\*(\d+\.\s+[^*]+)\*\*$/);
        if (sectionMatch) {
          return (
            <div
              key={idx}
              style={{
                fontWeight: 800,
                fontSize: '0.98rem',
                color: '#0f172a',
                marginTop: 12,
                marginBottom: 4,
                textTransform: 'uppercase',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: 4,
              }}
            >
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
              <mark
                key={i}
                style={{
                  backgroundColor: '#fef08a',
                  color: '#854d0e',
                  padding: '1px 4px',
                  borderRadius: 3,
                  fontWeight: 600,
                }}
              >
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

  // 4-STEP WORKFLOW:
  // Step 1: Upload or Select Template
  // Step 2: Provide Content in Template
  // Step 3: Generate & Preview Document
  // Step 4: Download
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Active Document Configuration
  const [templateCategory, setTemplateCategory] = useState<string>(OFFERS_ALL_CATEGORIES[0].value);
  const [templateTitle, setTemplateTitle] = useState<string>(OFFERS_ALL_CATEGORIES[0].defaultTitle);
  const [templateText, setTemplateText] = useState<string>(OFFERS_ALL_CATEGORIES[0].blueprintContent);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(OFFERS_ALL_CATEGORIES[0].sampleData);
  const [templateFileName, setTemplateFileName] = useState<string>('Corporate_Offer_Letter.docx');
  const [isCertificateDoc, setIsCertificateDoc] = useState<boolean>(false);

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Prompt Input
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

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

  // Uploaded & Custom Templates from Storage
  const [uploadedTemplates, setUploadedTemplates] = useState<SavedCustomTemplate[]>(() =>
    CustomTemplateService.getSavedTemplates()
  );
  const [activeUploadedTemplateId, setActiveUploadedTemplateId] = useState<string | null>(null);

  // Hidden/Deleted Built-in templates from Library
  const [deletedBuiltinValues, setDeletedBuiltinValues] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tasknera_deleted_builtin_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User-customized built-in templates
  const [customizedBuiltins, setCustomizedBuiltins] = useState<Record<string, { title?: string; blueprintContent?: string; category?: string; description?: string }>>(() => {
    try {
      const saved = localStorage.getItem('tasknera_customized_builtin_templates');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Edit Template Modal State
  const [templateToEdit, setTemplateToEdit] = useState<TemplateEditData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Listen to CustomTemplateService updates
  useEffect(() => {
    const handleTemplatesUpdate = () => {
      setUploadedTemplates(CustomTemplateService.getSavedTemplates());
    };
    window.addEventListener(TEMPLATES_UPDATED_EVENT, handleTemplatesUpdate);
    return () => window.removeEventListener(TEMPLATES_UPDATED_EVENT, handleTemplatesUpdate);
  }, []);

  // Delete an Uploaded/Custom Template
  const handleDeleteUploadedTemplate = (e: React.MouseEvent, tplId: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the uploaded template "${title}"?`)) {
      CustomTemplateService.deleteTemplate(tplId);
      if (activeUploadedTemplateId === tplId) {
        setActiveUploadedTemplateId(null);
        handleCategoryChange(OFFERS_ALL_CATEGORIES[0].value);
      }
      success(`Template "${title}" deleted successfully.`);
    }
  };

  // Delete / Hide a Built-in Template from Library
  const handleDeleteBuiltinTemplate = (e: React.MouseEvent, value: string, label: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${label}" from your template library?`)) {
      const next = [...deletedBuiltinValues, value];
      setDeletedBuiltinValues(next);
      localStorage.setItem('tasknera_deleted_builtin_templates', JSON.stringify(next));
      if (templateCategory === value) {
        const remaining = OFFERS_ALL_CATEGORIES.find((c) => !next.includes(c.value));
        if (remaining) handleCategoryChange(remaining.value);
      }
      success(`Template "${label}" removed from library.`);
    }
  };

  // Restore Hidden Built-in Templates
  const handleRestoreDefaultTemplates = () => {
    setDeletedBuiltinValues([]);
    localStorage.removeItem('tasknera_deleted_builtin_templates');
    success('Restored all default system templates to the library!');
  };

  // Open Edit Modal for Uploaded Template
  const handleOpenEditUploadedTemplate = (e: React.MouseEvent, tpl: SavedCustomTemplate) => {
    e.stopPropagation();
    const content =
      tpl.blueprintContent ||
      (tpl.sections && tpl.sections.length > 0
        ? tpl.sections.map((s) => `## ${s.title}\n${s.content}`).join('\n\n')
        : '');

    setTemplateToEdit({
      id: tpl.id,
      title: tpl.title,
      category: tpl.categoryName || tpl.category || 'Uploaded Template',
      badge: tpl.badge || 'Uploaded Template',
      description: tpl.description || '',
      blueprintContent: content,
      fileName: tpl.fileName,
      isCertificate: tpl.isCertificate,
      isCustomUploaded: true,
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal for Built-in Template
  const handleOpenEditBuiltinTemplate = (e: React.MouseEvent, cat: CategoryItemDef) => {
    e.stopPropagation();
    const custom = customizedBuiltins[cat.value];
    setTemplateToEdit({
      id: `builtin_${cat.value}`,
      title: custom?.title || cat.label,
      category: custom?.category || cat.groupLabel,
      badge: 'Preloaded',
      description: custom?.description || cat.defaultTitle,
      blueprintContent: custom?.blueprintContent || cat.blueprintContent,
      isCertificate: cat.isCertificate,
      isCustomUploaded: false,
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal for currently Active Template in Step 1
  const handleOpenEditActiveTemplate = () => {
    setTemplateToEdit({
      id: activeUploadedTemplateId || `active_${templateCategory}`,
      title: templateTitle,
      category: templateCategory,
      badge: activeUploadedTemplateId ? 'Uploaded Template' : 'Active Template',
      description: `Active template: ${templateFileName}`,
      blueprintContent: templateText,
      fileName: templateFileName,
      isCertificate: isCertificateDoc,
      isCustomUploaded: Boolean(activeUploadedTemplateId),
    });
    setIsEditModalOpen(true);
  };

  // Save changes from Edit Modal
  const handleSaveTemplateEdit = (saved: TemplateEditData, andUse: boolean = false) => {
    if (saved.isCustomUploaded && saved.id && !saved.id.startsWith('builtin_') && !saved.id.startsWith('active_')) {
      CustomTemplateService.updateTemplate(saved.id, {
        title: saved.title,
        categoryName: saved.category,
        description: saved.description,
        badge: saved.badge,
        blueprintContent: saved.blueprintContent,
        isCertificate: saved.isCertificate,
      });
      if (activeUploadedTemplateId === saved.id || andUse) {
        setTemplateTitle(saved.title);
        setTemplateText(saved.blueprintContent);
        setTemplateCategory(saved.category);
        setIsCertificateDoc(Boolean(saved.isCertificate));
        extractPlaceholdersFromText(saved.blueprintContent);
      }
    } else if (saved.id && saved.id.startsWith('builtin_')) {
      const origValue = saved.id.replace('builtin_', '');
      const nextCustom = {
        ...customizedBuiltins,
        [origValue]: {
          title: saved.title,
          category: saved.category,
          description: saved.description,
          blueprintContent: saved.blueprintContent,
        },
      };
      setCustomizedBuiltins(nextCustom);
      localStorage.setItem('tasknera_customized_builtin_templates', JSON.stringify(nextCustom));

      if (templateCategory === origValue || andUse) {
        setTemplateTitle(saved.title);
        setTemplateText(saved.blueprintContent);
        setTemplateCategory(origValue);
        setIsCertificateDoc(Boolean(saved.isCertificate));
        extractPlaceholdersFromText(saved.blueprintContent);
      }
    } else {
      setTemplateTitle(saved.title);
      setTemplateText(saved.blueprintContent);
      setTemplateCategory(saved.category);
      setIsCertificateDoc(Boolean(saved.isCertificate));
      extractPlaceholdersFromText(saved.blueprintContent);

      if (activeUploadedTemplateId) {
        CustomTemplateService.updateTemplate(activeUploadedTemplateId, {
          title: saved.title,
          categoryName: saved.category,
          description: saved.description,
          blueprintContent: saved.blueprintContent,
          isCertificate: saved.isCertificate,
        });
      }
    }

    if (andUse) {
      setActiveTab('generator');
      setStep(2);
    }
    success(`Template "${saved.title}" saved successfully!`);
  };

  // Select an uploaded template to use in the generator
  const handleSelectUploadedTemplate = (tpl: SavedCustomTemplate, advanceToStep2: boolean = false) => {
    setActiveUploadedTemplateId(tpl.id);
    setTemplateTitle(tpl.title);
    setTemplateFileName(tpl.fileName || `${tpl.title.replace(/\s+/g, '_')}.docx`);
    setTemplateCategory(tpl.categoryName || tpl.category || 'Uploaded');
    setIsCertificateDoc(Boolean(tpl.isCertificate));

    const content =
      tpl.blueprintContent ||
      (tpl.sections && tpl.sections.length > 0
        ? tpl.sections.map((s) => `## ${s.title}\n${s.content}`).join('\n\n')
        : `# **${tpl.title.toUpperCase()}**\n\nDate: {{issue_date}}\n\nTo: **{{candidate_name}}**\n\nContent...`);

    setTemplateText(content);
    extractPlaceholdersFromText(content);
    if (advanceToStep2) {
      setActiveTab('generator');
      setStep(2);
    }
    success(`Selected uploaded template "${tpl.title}".`);
  };

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

  // Helper to extract tokens: {{key}}, [key]
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

  // Handle Category Change from Dropdown or Cards
  const handleCategoryChange = (catKey: string) => {
    if (catKey === 'CUSTOM_UPLOAD') {
      fileInputRef.current?.click();
      return;
    }

    setTemplateCategory(catKey);
    setActiveUploadedTemplateId(null);
    const found = OFFERS_ALL_CATEGORIES.find((c) => c.value === catKey || c.label === catKey);
    if (found) {
      const custom = customizedBuiltins[catKey];
      setTemplateTitle(custom?.title || found.defaultTitle);
      setTemplateFileName(`${found.value.replace(/\s+/g, '_')}.docx`);
      const content = custom?.blueprintContent || found.blueprintContent;
      setTemplateText(content);
      setIsCertificateDoc(Boolean(found.isCertificate));
      extractPlaceholdersFromText(content);
      if (found.sampleData) {
        setFormData((prev) => ({ ...prev, ...found.sampleData }));
      }
      success(`Loaded "${custom?.title || found.label}" template.`);
    }
  };

  // Helper to persist uploaded template to storage so user can edit/delete/reuse anytime
  const persistUploadedTemplate = (cleanTitle: string, fileName: string, extracted: string, isCert: boolean, suggestedCat?: string) => {
    const finalCat = suggestedCat || (isCert ? 'Certificates' : 'Offer Letter');
    const saved = CustomTemplateService.saveTemplate({
      title: cleanTitle,
      category: finalCat,
      categoryCode: isCert ? 'CERTIFICATE' : 'OFFER_LETTER',
      categoryName: finalCat,
      description: `Uploaded from ${fileName}`,
      badge: 'Uploaded Template',
      color: '#2563eb',
      fileName: fileName,
      sections: [],
      blueprintContent: extracted,
      isCertificate: isCert,
    });
    setActiveUploadedTemplateId(saved.id);
    return saved;
  };

  // Handle File Upload (.docx, .pdf, .txt, .html)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setTemplateFileName(file.name);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setTemplateTitle(cleanTitle);

    // Check if filename indicates a certificate
    const lowerName = file.name.toLowerCase();
    const isCert = lowerName.includes('certificate') || lowerName.includes('award') || lowerName.includes('completion');
    setIsCertificateDoc(isCert);

    // 1. Try remote backend parsing
    try {
      const res = await EmployeeService.uploadTemplate(file);
      if (res && res.extractedContent && res.extractedContent.trim().length > 0) {
        setTemplateText(res.extractedContent);
        if (res.suggestedCategory) setTemplateCategory(res.suggestedCategory);
        extractPlaceholdersFromText(res.extractedContent);
        persistUploadedTemplate(cleanTitle, file.name, res.extractedContent, isCert, res.suggestedCategory);
        success(`Uploaded and saved "${file.name}" cleanly (${res.detectedFormat}). Structure and content ready!`);
        setStep(2);
        setIsUploading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend parsing fallback to client-side:', err);
    }

    // 2. Try client-side parsing
    try {
      const clientRes = await parseDocumentClientSide(file);
      if (clientRes && clientRes.extractedContent && clientRes.extractedContent.trim().length > 0) {
        setTemplateText(clientRes.extractedContent);
        extractPlaceholdersFromText(clientRes.extractedContent);
        persistUploadedTemplate(cleanTitle, file.name, clientRes.extractedContent, isCert);
        success(`Parsed and saved "${file.name}" successfully (${clientRes.detectedFormat})!`);
        setStep(2);
        setIsUploading(false);
        return;
      }
    } catch (clientErr: any) {
      console.warn('Client-side parsing fallback:', clientErr);
    }

    // 3. Resilient fallback: Initialize template draft so user is never blocked!
    const fallbackBlueprint = `# **TASKNERA HR SOLUTIONS**
## **${cleanTitle.toUpperCase()}**

**Date**: {{issue_date}}
**Reference**: {{reference_number}}

To:
**{{candidate_name}}**
{{job_title}} — {{department}}

Please paste or refine your document content here. AI will preserve exact formatting.

Sincerely,
For **Tasknera HR Solutions**
___________________________
**Sheetal Bedi**
Chief Executive Officer`;

    setTemplateText(fallbackBlueprint);
    extractPlaceholdersFromText(fallbackBlueprint);
    persistUploadedTemplate(cleanTitle, file.name, fallbackBlueprint, isCert);
    info(`Initialized template for "${file.name}". You can now provide or paste your content in Step 2!`);
    setStep(2);
    setIsUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // AI Prompt Processor: Parse prompt and synthesize content & details
  const handleApplyAiPrompt = () => {
    if (!aiPrompt.trim()) {
      error('Please enter a prompt or instruction first.');
      return;
    }

    setIsGeneratingAi(true);

    try {
      const promptLower = aiPrompt.toLowerCase();

      // Detect document type from prompt
      let detectedCat = templateCategory;
      if (promptLower.includes('experience') || promptLower.includes('exp letter')) {
        detectedCat = 'Experience Letter';
      } else if (promptLower.includes('internship certificate') || promptLower.includes('intern certificate')) {
        detectedCat = 'Certificate of Internship';
      } else if (promptLower.includes('appreciation') || promptLower.includes('recognition')) {
        detectedCat = 'Certificate of Appreciation';
      } else if (promptLower.includes('appointment')) {
        detectedCat = 'Appointment Letter';
      } else if (promptLower.includes('offer')) {
        detectedCat = 'Offer Letter';
      } else if (promptLower.includes('relieving') || promptLower.includes('clearance')) {
        detectedCat = 'Relieving Letter';
      } else if (promptLower.includes('completion') || promptLower.includes('course')) {
        detectedCat = 'Certificate of Completion';
      } else if (promptLower.includes('excellence') || promptLower.includes('achievement')) {
        detectedCat = 'Certificate of Excellence';
      }

      if (detectedCat !== templateCategory) {
        handleCategoryChange(detectedCat);
      }

      // Extract Name: "for [Name]", "to [Name]", "mr. [Name]", "ms. [Name]"
      const nameMatch =
        aiPrompt.match(/(?:for|to|mr\.|ms\.|mrs\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/) ||
        aiPrompt.match(/(?:candidate|employee|name is|intern)\s*[:\-]?\s*([A-Za-z\s]+?)(?:as|from|in|with|\.|\n|$)/i);
      
      // Extract Role: "as [Role]", "role of [Role]", "position of [Role]"
      const roleMatch =
        aiPrompt.match(/(?:as a|as an|as|role of|position of|designation of)\s+([A-Za-z\s]+?)(?:from|in|at|with|\.|\n|$)/i);

      // Extract Company: "at [Company]"
      const companyMatch =
        aiPrompt.match(/(?:at|for|with)\s+(Tasknera[\w\s]*|[\w\s]+(?:Solutions|Technologies|Pvt|Ltd|Inc))/i);

      // Extract Dates: "from [Date] to [Date]"
      const dateRangeMatch =
        aiPrompt.match(/from\s+([A-Za-z0-9,\s]+?)\s+to\s+([A-Za-z0-9,\s]+?)(?:at|with|\.|\n|$)/i);

      setFormData((prev) => {
        const next = { ...prev };
        if (nameMatch && nameMatch[1]) {
          next.candidate_name = nameMatch[1].trim();
        }
        if (roleMatch && roleMatch[1]) {
          next.job_title = roleMatch[1].trim();
        }
        if (companyMatch && companyMatch[1]) {
          next.company_name = companyMatch[1].trim();
        }
        if (dateRangeMatch) {
          if (dateRangeMatch[1]) next.joining_date = dateRangeMatch[1].trim();
          if (dateRangeMatch[2]) next.end_date = dateRangeMatch[2].trim();
        }

        // Set gender pronouns correctly for experience letter
        if (promptLower.includes('she') || promptLower.includes('ms.') || promptLower.includes('her')) {
          next.honorific = 'Ms.';
          next.pronoun = 'she';
          next.possessive_pronoun = 'her';
          next.possessive_pronoun_cap = 'Her';
        } else {
          next.honorific = 'Mr.';
          next.pronoun = 'he';
          next.possessive_pronoun = 'his';
          next.possessive_pronoun_cap = 'His';
        }

        return next;
      });

      success('AI parsed prompt instructions and updated template content & details!');
    } catch (err: any) {
      error(`AI processing error: ${err.message}`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // 1-Click Generate / Auto-Fill All Verified Corporate Data
  const handleAutoFillAllData = () => {
    const found = OFFERS_ALL_CATEGORIES.find((c) => c.value === templateCategory || c.label === templateCategory);
    const standardDefaults: Record<string, string> = {
      company_name: 'Tasknera HR Solutions',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      effective_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      reference_number: `TSK-DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'Chief Executive Officer',
      signatory_email: 'operations@tasknera.com',
      signatory_place: 'Delhi',
      company_address: 'D-57 F1, Dilshad Colony, Shahdara, Delhi 110095',
      version: '1.0',
      review_cycle: 'Annual Corporate Review',
      applicability: 'All Global Full-Time, Probationary & Associated Personnel',
      department: 'Software Engineering & Talent Operations',
      policy_name: templateTitle || 'Enterprise Operational Standard',
      category_label: found?.groupLabel || 'Corporate HR Standard',
    };

    setFormData((prev) => {
      const merged: Record<string, string> = { ...prev, ...standardDefaults };
      if (found && found.sampleData) {
        Object.entries(found.sampleData).forEach(([k, v]) => {
          merged[k] = v;
        });
      }
      detectedPlaceholders.forEach((k) => {
        if (!merged[k]) {
          merged[k] = standardDefaults[k] || formatFieldLabel(k);
        }
      });
      return merged;
    });

    success(`Generated all verified corporate variables for "${templateTitle}"!`);
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

  // Compile final populated document text with grammar safety
  const getCompiledDocumentText = () => {
    if (isDirectEditing && directEditedContent) {
      return directEditedContent;
    }
    let res = templateText;

    // Substitute {{key}} placeholders
    res = res.replace(/\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g, (_, key) => {
      const raw = key.trim();
      const clean = raw.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      if (formData[raw] !== undefined && formData[raw] !== '') return formData[raw];
      return `{{${raw}}}`;
    });

    // Substitute [key] placeholders
    res = res.replace(/\[\s*([a-zA-Z0-9_\s]{2,40})\s*\]/g, (orig, key) => {
      const clean = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (formData[clean] !== undefined && formData[clean] !== '') return formData[clean];
      return orig;
    });

    return res;
  };

  // Transition to Step 3: Compile Document
  const handleGenerateDocument = () => {
    const compiled = getCompiledDocumentText();
    setDirectEditedContent(compiled);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    success('Generated document successfully! Preview and edit below.');
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
        aiConfidenceScore: 0.99,
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

  // Helper to categorize form fields
  const getCategorizedFields = () => {
    const allKeys = Array.from(new Set([...detectedPlaceholders, ...Object.keys(formData)]));

    const recipientKeys = ['candidate_name', 'employee_name', 'contractor_name', 'honorific', 'email', 'personal_email', 'official_email', 'phone', 'employee_id'];
    const roleKeys = ['job_title', 'designation', 'department', 'work_location', 'reporting_manager', 'mentor_name'];
    const termsKeys = ['joining_date', 'end_date', 'last_working_day', 'resignation_date', 'annual_ctc', 'base_salary', 'variable_pay', 'notice_period', 'probation_period', 'valid_until', 'course_name'];
    const signatoryKeys = ['signatory_name', 'signatory_title', 'signatory_place', 'issue_date', 'reference_number'];
    const otherKeys = allKeys.filter(
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
      recipientFields: allKeys.filter((k) => recipientKeys.includes(k)),
      roleFields: allKeys.filter((k) => roleKeys.includes(k)),
      termsFields: allKeys.filter((k) => termsKeys.includes(k)),
      signatoryFields: allKeys.filter((k) => signatoryKeys.includes(k)),
      otherFields: otherKeys,
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
              AI Document & Certificate Generator
            </h2>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: '#64748b' }}>
            First upload or choose a template, provide your content or prompt, and generate any letter or certificate with flawless formatting.
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
            Template Library ({OFFERS_ALL_CATEGORIES.length})
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
              { num: 1, label: '1. Upload / Select Template', desc: 'Word, PDF, or preset' },
              { num: 2, label: '2. Provide Content in Template', desc: 'AI prompt & details' },
              { num: 3, label: '3. Generate & Preview', desc: 'Any letter or certificate' },
              { num: 4, label: '4. Download', desc: 'PDF or Word (.doc)' },
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
          {/* STEP 1: UPLOAD TEMPLATE FIRST (OR SELECT FROM TEMPLATES)            */}
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
              <div style={{ maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 26 }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Step 1: Upload or Choose Document Template
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    First, upload any existing company document template (Word, PDF, Text) or select from our verified blueprints.
                  </p>
                </div>

                {/* Primary Upload Dropzone Front-and-Center */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                    backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
                    borderRadius: 12,
                    padding: '36px 24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc,.pdf,.txt,.html,.md"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                    }}
                  >
                    <Upload size={24} />
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {isUploading ? 'Extracting document template structure...' : 'Click or drag & drop to upload your template'}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4, marginBottom: 12 }}>
                    Supports Microsoft Word (.docx), PDF (.pdf), or Text (.txt). Formatting and layout are preserved.
                  </p>
                  <Button
                    variant="secondary"
                    icon={<FileUp size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{ fontSize: '0.8rem', padding: '6px 16px' }}
                  >
                    Browse Files on Computer
                  </Button>
                </div>

                {/* Active Template Status Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 10,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Active Document Template
                        </span>
                        {activeUploadedTemplateId && (
                          <span style={{ fontSize: '0.68rem', backgroundColor: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                            Uploaded Template
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                        {templateTitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                        File: {templateFileName} • {detectedPlaceholders.length} placeholder{detectedPlaceholders.length === 1 ? '' : 's'} ready for content
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Button
                      variant="secondary"
                      icon={<Edit3 size={14} />}
                      onClick={handleOpenEditActiveTemplate}
                      style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                    >
                      Edit Template
                    </Button>

                    {activeUploadedTemplateId && (
                      <button
                        type="button"
                        title="Delete this uploaded template"
                        onClick={(e) => handleDeleteUploadedTemplate(e, activeUploadedTemplateId, templateTitle)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: 6,
                          border: '1px solid #fee2e2',
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}

                    <Button
                      variant="primary"
                      icon={<ArrowRight size={15} />}
                      onClick={() => setStep(2)}
                      style={{ padding: '8px 18px', fontSize: '0.85rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                    >
                      Continue to Provide Content
                    </Button>
                  </div>
                </div>

                {/* Your Uploaded Templates List (if any exist) */}
                {uploadedTemplates.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                        Your Uploaded Templates ({uploadedTemplates.length}):
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Persisted templates ready for instant re-use, editing, or deletion
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                      {uploadedTemplates.map((ut) => {
                        const isActive = activeUploadedTemplateId === ut.id;
                        return (
                          <div
                            key={ut.id}
                            onClick={() => handleSelectUploadedTemplate(ut)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 10,
                              border: isActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#dbeafe', padding: '1px 6px', borderRadius: 4 }}>
                                  {ut.badge || 'Uploaded Template'}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <button
                                    type="button"
                                    title="Edit uploaded template"
                                    onClick={(e) => handleOpenEditUploadedTemplate(e, ut)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: '3px',
                                      cursor: 'pointer',
                                      color: '#64748b',
                                      borderRadius: 4,
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                                  >
                                    <Edit3 size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete uploaded template"
                                    onClick={(e) => handleDeleteUploadedTemplate(e, ut.id, ut.title)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: '3px',
                                      cursor: 'pointer',
                                      color: '#94a3b8',
                                      borderRadius: 4,
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                                {ut.title}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                                {ut.fileName ? `File: ${ut.fileName}` : ut.category}
                              </div>
                            </div>

                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.72rem', color: isActive ? '#2563eb' : '#64748b', fontWeight: 600 }}>
                                {isActive ? '✓ Active in Generator' : 'Click to Select'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Or Select from Pre-designed Blueprints */}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: 10 }}>
                    Or Select from Pre-designed Templates, Letters &amp; Certificates:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                    {OFFERS_ALL_CATEGORIES.filter((cat) => !deletedBuiltinValues.includes(cat.value)).map((cat) => {
                      const isSelected = !activeUploadedTemplateId && templateCategory === cat.value;
                      const custom = customizedBuiltins[cat.value];
                      const displayTitle = custom?.title || cat.label;
                      return (
                        <div
                          key={cat.value}
                          onClick={() => handleCategoryChange(cat.value)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isSelected ? '#2563eb' : '#64748b', textTransform: 'uppercase' }}>
                              {cat.groupLabel}
                            </span>
                            {isSelected && <Check size={14} color="#2563eb" />}
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                            {displayTitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    variant="primary"
                    icon={<ArrowRight size={16} />}
                    onClick={() => setStep(2)}
                    style={{ padding: '12px 28px', fontSize: '0.9rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Next: Provide Content in Template
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 2: PROVIDE CONTENT IN TEMPLATE                                 */}
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
                {/* Header */}
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                      Step 2: Provide Content in Template
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                      Provide your prompt, customize the template text, or autofill employee variables.
                    </p>
                  </div>

                  {/* 1-Click Employee Autofill */}
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

                {/* 1. AI PROMPT / INSTRUCTIONS ASSISTANT (CHATGPT / GEMINI STYLE) */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '20px 22px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} color="#2563eb" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                        Generate or Customize with AI Prompt
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Zero grammatical errors guaranteed</span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Type your instructions or details in plain English. AI will extract recipient details, role, dates, and adapt the template content cleanly.
                  </p>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Generate experience letter for Maurya Ajay Munnalal as Full Stack Developer at Tasknera HR Solutions from Oct 25, 2025 to Sept 14, 2026..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyAiPrompt();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                    <Button
                      variant="primary"
                      icon={<Wand2 size={15} />}
                      onClick={handleApplyAiPrompt}
                      isLoading={isGeneratingAi}
                      style={{ padding: '10px 20px', fontSize: '0.85rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                    >
                      Apply Prompt
                    </Button>
                  </div>

                  {/* Quick Click Prompts */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Quick Suggestions:</span>
                    {[
                      'Experience Letter for Ajay as Full Stack Developer at Tasknera',
                      'Certificate of Internship in Full Stack Development with Distinction',
                      'Corporate Offer Letter for Rahul Sharma with INR 22 LPA CTC',
                      'Certificate of Appreciation for Priya Patel for Product Leadership',
                    ].map((sugg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAiPrompt(sugg);
                        }}
                        style={{
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. DIRECT IN-TEMPLATE CONTENT EDITOR */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '20px 22px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Edit3 size={16} color="#0f172a" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                        In-Template Content Editor
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Edit paragraphs or placeholder tokens directly (e.g. &#123;&#123;candidate_name&#125;&#125;)
                    </span>
                  </div>

                  <textarea
                    rows={10}
                    value={templateText}
                    onChange={(e) => {
                      setTemplateText(e.target.value);
                      extractPlaceholdersFromText(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      fontSize: '0.825rem',
                      lineHeight: 1.5,
                      outline: 'none',
                      backgroundColor: '#fcfcfd',
                    }}
                  />
                </div>

                {/* 3. DYNAMIC DETAILS & VARIABLES BANNER */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 10,
                    padding: '14px 18px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} />
                      <span>1-Click Generate All Corporate Variables</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: 2 }}>
                      Automatically populates all detected template fields with verified Tasknera data.
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    icon={<Wand2 size={14} />}
                    onClick={handleAutoFillAllData}
                    style={{ fontSize: '0.78rem', padding: '6px 14px', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                  >
                    Fill Verified Data Now
                  </Button>
                </div>

                {/* Form Group 1: Recipient Information */}
                {recipientFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      👤 Recipient / Employee Information
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

                {/* Form Group 2: Role & Organization Details */}
                {roleFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      💼 Role &amp; Organization Details
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
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      📅 Terms, Dates &amp; Compensation
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                      {termsFields.map((key) => (
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

                {/* Form Group 4: Authority & Signatory */}
                {signatoryFields.length > 0 && (
                  <div style={{ backgroundColor: '#f8fafc', padding: '18px 20px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      ✍️ Authority &amp; Corporate Signatory
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

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={16} />}
                    onClick={() => setStep(1)}
                  >
                    Back to Select Template
                  </Button>

                  <Button
                    variant="primary"
                    icon={<Sparkles size={16} />}
                    onClick={handleGenerateDocument}
                    style={{ padding: '12px 28px', fontSize: '0.9rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                  >
                    Generate Document with AI
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* STEP 3: GENERATE & PREVIEW (ANY LETTER OR CERTIFICATE)              */}
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
                    Edit Content in Template
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
                  {/* Official Header for Letters / Policies */}
                  {!isCertificateDoc && (
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
                  )}

                  {/* Document Body (renders Letters or grand Certificate layout) */}
                  <ExecutiveDocumentRenderer
                    content={directEditedContent || templateText}
                    formData={formData}
                    highlightPlaceholders={highlightPlaceholders}
                    isCertificate={isCertificateDoc}
                  />

                  {/* Official Footer */}
                  {!isCertificateDoc && (
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
                  )}
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
                      Document Generated &amp; Ready for Download
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                      Your {templateTitle} has been formatted and compiled with verified variables.
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
                  id="inspection-ai-generated-doc"
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
                    isCertificate={isCertificateDoc}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* TAB 2: TEMPLATE LIBRARY                                             */
        /* =================================================================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Search, Action & Category Filter */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 280, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
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

              <Button
                variant="secondary"
                icon={<Upload size={14} />}
                onClick={() => fileInputRef.current?.click()}
                style={{ fontSize: '0.82rem', padding: '9px 14px', flexShrink: 0 }}
              >
                Upload Template
              </Button>
            </div>

            {/* Category Filter Pills & Restore Button */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                {
                  key: 'ALL',
                  label: `All (${OFFERS_ALL_CATEGORIES.filter((c) => !deletedBuiltinValues.includes(c.value)).length + uploadedTemplates.length})`,
                },
                {
                  key: 'uploaded',
                  label: `Uploaded (${uploadedTemplates.length})`,
                },
                {
                  key: 'templates',
                  label: `Letters (${OFFERS_ALL_CATEGORIES.filter((c) => c.group === 'templates' && !deletedBuiltinValues.includes(c.value)).length})`,
                },
                {
                  key: 'certificates',
                  label: `Certificates (${OFFERS_ALL_CATEGORIES.filter((c) => c.group === 'certificates' && !deletedBuiltinValues.includes(c.value)).length})`,
                },
                {
                  key: 'policies',
                  label: `Policies (${OFFERS_ALL_CATEGORIES.filter((c) => c.group === 'policies' && !deletedBuiltinValues.includes(c.value)).length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setLibraryCategory(tab.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: libraryCategory === tab.key ? '#0f172a' : '#e2e8f0',
                    backgroundColor: libraryCategory === tab.key ? '#0f172a' : '#ffffff',
                    color: libraryCategory === tab.key ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}

              {deletedBuiltinValues.length > 0 && (
                <button
                  type="button"
                  title="Restore hidden factory templates"
                  onClick={handleRestoreDefaultTemplates}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <RotateCcw size={13} />
                  Restore Defaults ({deletedBuiltinValues.length})
                </button>
              )}
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
            {/* 1. Uploaded Templates in Library */}
            {(libraryCategory === 'ALL' || libraryCategory === 'uploaded') &&
              uploadedTemplates
                .filter((ut) => {
                  const term = librarySearch.toLowerCase();
                  return (
                    ut.title.toLowerCase().includes(term) ||
                    (ut.description && ut.description.toLowerCase().includes(term)) ||
                    (ut.fileName && ut.fileName.toLowerCase().includes(term)) ||
                    (ut.categoryName && ut.categoryName.toLowerCase().includes(term))
                  );
                })
                .map((ut) => (
                  <div
                    key={ut.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #bfdbfe',
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
                          {ut.badge || 'Uploaded Template'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            title="Edit this uploaded template"
                            onClick={(e) => handleOpenEditUploadedTemplate(e, ut)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                              color: '#64748b',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            title="Delete this uploaded template"
                            onClick={(e) => handleDeleteUploadedTemplate(e, ut.id, ut.title)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                              color: '#94a3b8',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {ut.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                        {ut.description || `Custom template uploaded from ${ut.fileName || 'file'}`}
                      </p>
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button
                        variant="primary"
                        icon={<Sparkles size={14} />}
                        onClick={() => handleSelectUploadedTemplate(ut, true)}
                        style={{ fontSize: '0.78rem', padding: '7px 14px', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
                      >
                        Use in AI Generator
                      </Button>
                    </div>
                  </div>
                ))}

            {/* 2. Built-in Templates in Library */}
            {libraryCategory !== 'uploaded' &&
              OFFERS_ALL_CATEGORIES.filter((cat) => {
                if (deletedBuiltinValues.includes(cat.value)) return false;
                const custom = customizedBuiltins[cat.value];
                const titleToMatch = custom?.title || cat.label;
                const descToMatch = custom?.description || cat.defaultTitle;
                const matchesSearch =
                  titleToMatch.toLowerCase().includes(librarySearch.toLowerCase()) ||
                  descToMatch.toLowerCase().includes(librarySearch.toLowerCase()) ||
                  cat.groupLabel.toLowerCase().includes(librarySearch.toLowerCase());
                const matchesCategory =
                  libraryCategory === 'ALL' || cat.group === libraryCategory;
                return matchesSearch && matchesCategory;
              }).map((cat) => {
                const custom = customizedBuiltins[cat.value];
                const displayTitle = custom?.title || cat.label;
                const displayDesc = custom?.description || cat.defaultTitle;
                return (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                            {custom ? 'Customized' : 'Preloaded'}
                          </span>
                          <button
                            type="button"
                            title="Edit template content & structure"
                            onClick={(e) => handleOpenEditBuiltinTemplate(e, cat)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                              color: '#64748b',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            title="Delete template from library"
                            onClick={(e) => handleDeleteBuiltinTemplate(e, cat.value, cat.label)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px',
                              cursor: 'pointer',
                              color: '#94a3b8',
                              borderRadius: 4,
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {displayTitle}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                        {displayDesc}
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
                );
              })}
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      <EditTemplateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTemplateToEdit(null);
        }}
        template={templateToEdit}
        onSave={(saved) => handleSaveTemplateEdit(saved, false)}
        onSaveAndUse={(saved) => handleSaveTemplateEdit(saved, true)}
      />
    </div>
  );
};
