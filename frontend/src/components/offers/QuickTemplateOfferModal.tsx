import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  RefreshCw,
  Eye,
  User,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  ShieldCheck,
  Plus,
  Copy,
  Check,
  Briefcase,
  Layers,
  Edit3,
  Trash2,
  Highlighter,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { offerService } from '../../services/offerService.js';
import { useToast } from '../../context/ToastContext.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { AddEmployeeModal } from '../employees/AddEmployeeModal.js';

interface QuickTemplateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: any) => void;
  initialEmployee?: Employee | null;
}

// Letter Type Definition
export type LetterTypeKey = 'employment_offer' | 'internship_offer' | 'appointment_letter' | 'custom';

export interface DocumentSectionItem {
  id: string;
  number: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  footnote?: string;
}

export interface DocumentAnnexureRow {
  label: string;
  key: string;
  defaultValue: string;
}

// Default TaskNera 18-Section Legal Structure (From Official Contract)
const DEFAULT_OFFER_SECTIONS: DocumentSectionItem[] = [
  {
    id: 'sec_1',
    number: 1,
    title: 'Appointment, Acceptance and Joining',
    paragraphs: [
      'This offer is valid until {{offer_validity_date}}. You are required to confirm acceptance in writing and join on or before {{joining_date}}. If acceptance is not received within the stipulated period, the Company may withdraw this offer.',
      'Your appointment is subject to completion of joining formalities and submission/verification of documents requested by the Company, including identity, education, previous employment and other documents reasonably required for lawful employment and background verification.',
      'Any material misrepresentation, concealment, falsification or submission of false/forged documents may result in withdrawal of the offer or termination of employment, subject to applicable law and due process where required.',
    ],
  },
  {
    id: 'sec_2',
    number: 2,
    title: 'Position, Reporting and Duties',
    paragraphs: [
      'You will be employed as {{designation}} and will report to the person designated by the Company. You shall diligently, professionally and faithfully perform the duties assigned to you and comply with lawful and reasonable directions of your Reporting Manager and authorised representatives of the Company.',
    ],
  },
  {
    id: 'sec_3',
    number: 3,
    title: 'Place of Work and Working Hours',
    paragraphs: [
      'Your primary work location will be {{work_location}}. Your working schedule, shift, weekly working days, breaks and any approved remote/hybrid arrangement will be communicated by the Company and may be determined by business/client requirements, subject to applicable law and Company policy.',
    ],
  },
  {
    id: 'sec_4',
    number: 4,
    title: 'Probation and Confirmation',
    paragraphs: [
      'You will remain on probation for {{probation_period}} from your date of joining, unless otherwise stated in writing. During probation, the Company will assess performance, productivity, attendance, punctuality, professional behaviour, communication, teamwork, accountability, discipline and compliance with Company policies. Confirmation is not automatic and will be communicated in writing by the Company.',
    ],
  },
  {
    id: 'sec_5',
    number: 5,
    title: 'Compensation and Payroll',
    paragraphs: [
      'Your compensation will be INR {{annual_ctc}} per annum (CTC), with the detailed structure set out in Annexure III. Salary and other benefits are subject to applicable statutory deductions and contributions. Salary is payable in accordance with the Company\'s payroll cycle and applicable law.',
      'The Company\'s HR Policy provides that salary is calculated on approved attendance and payable working days recorded in the Company\'s attendance system, subject to lawful requirements. Unauthorized absence, leave without pay and other non-payable attendance may therefore affect salary for the relevant period.',
    ],
  },
  {
    id: 'sec_6',
    number: 6,
    title: 'Code of Conduct \u2013 Zero Tolerance for Serious Behavioural Misconduct',
    paragraphs: [
      'TaskNera maintains a strict zero-tolerance standard for serious behavioural misconduct. Every employee is required to maintain professional, respectful, ethical and disciplined conduct. The following are examples of conduct that may constitute misconduct, depending on the facts and circumstances:',
    ],
    bullets: [
      'Threatening, abusive, violent, intimidating, disorderly or indecent behaviour toward any employee, manager, client, candidate, vendor or other person connected with the Company.',
      'Harassment, sexual harassment, bullying, discrimination, retaliation or other prohibited workplace conduct.',
      'Willful insubordination, refusal to follow lawful and reasonable instructions, or deliberate disruption of workplace operations.',
      'Dishonesty, fraud, falsification, manipulation of attendance or work records, misrepresentation, theft or misuse of Company/client property.',
      'Unauthorized disclosure or misuse of confidential, personal, client, candidate, commercial or security information.',
      'Deliberate work avoidance, repeated refusal to perform assigned duties, or conduct that materially disrupts business operations.',
      'Sleeping during working hours, repeated unauthorized breaks, habitual unauthorised absence, or other conduct expressly prohibited by Company policy.',
      'Any other conduct which, after appropriate assessment, is found to constitute serious misconduct or a material breach of the Company\'s policies, applicable law, or the terms of employment.',
    ],
    footnote: 'The examples above are illustrative and do not limit the Company\'s rights under the applicable HR policies, employment terms or law.',
  },
  {
    id: 'sec_7',
    number: 7,
    title: 'Disciplinary Action and Termination for Misconduct',
    paragraphs: [
      'Where an allegation of misconduct is raised, the Company may investigate the matter and take proportionate disciplinary action based on the facts, evidence, seriousness of the conduct, prior record and applicable law. Depending on the circumstances, disciplinary action may include counselling, warning, performance/behavioural improvement measures, suspension where legally permissible, recovery of proven losses where legally permissible, or termination.',
      'In cases of serious misconduct, the Company may terminate employment without notice or payment in lieu where permitted by the employment terms and applicable law. Where a disciplinary enquiry, show-cause opportunity, hearing, statutory approval or other procedural safeguard is required by applicable law, the Company will follow the applicable procedure.',
      'Where serious misconduct, negligence, default, unauthorised conduct or breach causes proven loss or damage to TaskNera, the Company may seek recovery and/or make deductions only to the extent permitted by applicable law, after following any required notice or opportunity to respond. Any recovery shall be limited to the amount lawfully recoverable and shall not be an arbitrary or punitive deduction.',
      'Salary and dues on termination: Termination for misconduct does not, by itself, extinguish wages or other statutory/contractual amounts that have already been legally earned. The Company will pay amounts legally due for work/attendance up to the effective date of separation, subject to lawful deductions, statutory adjustments, recoveries permitted by law, and applicable payroll/F&F procedures. No provision of this Offer Letter shall be interpreted as waiving an employee\'s non-waivable statutory rights.',
    ],
  },
  {
    id: 'sec_8',
    number: 8,
    title: 'Notice Period and Separation',
    paragraphs: [
      'During probation, either party may terminate employment by giving {{probation_notice_days}} days\' written notice or salary in lieu thereof, subject to applicable law and the Company\'s rights under the employment terms. After confirmation, the notice period shall be {{notice_period}} unless otherwise specified in writing. Termination for misconduct may be effected without notice where legally permissible and in accordance with the applicable disciplinary process.',
      'On separation, the employee must immediately return Company/client property, documents, credentials, devices, records and confidential information and complete all applicable exit formalities. Wages and other amounts legally due shall be processed within the time required by applicable law. Where a statutory wage-payment deadline is shorter than an internal administrative timeline, the statutory deadline shall prevail. Non-wage administrative reconciliation may be completed separately where legally permissible. No provision of this Offer Letter authorises withholding of non-waivable statutory dues.',
    ],
  },
  {
    id: 'sec_9',
    number: 9,
    title: 'Attendance, Productivity and Work Avoidance',
    paragraphs: [
      'You are required to remain available and actively engaged during official working hours except during approved breaks or authorised absence. Refusal to perform assigned duties, deliberate delay, remaining idle without work-related activity, ignoring lawful work instructions, failure to respond to official communications without reasonable justification, or repeated unjustified claims of inability to perform assigned duties may constitute work avoidance and may result in disciplinary action, including termination during probation, in accordance with the HR Policy and applicable law.',
    ],
  },
  {
    id: 'sec_10',
    number: 10,
    title: 'Final Settlement, Recovery and Lawful Deductions',
    paragraphs: [
      'On separation, TaskNera will calculate and pay wages and other amounts that are legally due within the time required by applicable law. The Company will not contractually postpone statutory wage payments for 30–45 days where a shorter statutory deadline applies. Administrative reconciliation of non-wage items may continue separately where legally permissible.',
      'Where serious misconduct, negligence, default, unauthorised use, loss or damage causes a proven financial loss to TaskNera, the Company may seek recovery and/or make deductions only to the extent permitted by applicable law and after any required show-cause or disciplinary procedure. Deductions will not be arbitrary or punitive and will be limited to amounts lawfully recoverable, including applicable notice-pay adjustments, advances or proven damage/loss where permitted.',
    ],
  },
  {
    id: 'sec_11',
    number: 11,
    title: 'Confidentiality and Intellectual Property',
    paragraphs: [
      'You shall maintain strict confidentiality of all Company, client, candidate, employee, commercial, financial, technical and operational information. All TaskNera Project IP and other work product created in connection with employment is governed by the attached Confidentiality, Non-Disclosure & Intellectual Property Agreement, which forms part of this Offer Letter.',
    ],
  },
  {
    id: 'sec_12',
    number: 12,
    title: 'Company Property, Data and Information Security',
    paragraphs: [
      'All Company property and information must be used only for authorised business purposes. You must comply with Company information-security, data-protection, IT, acceptable-use and access-control requirements. On separation or request, all Company property and confidential information must be returned or securely deleted as directed.',
    ],
  },
  {
    id: 'sec_13',
    number: 13,
    title: 'Conflict of Interest and Outside Engagements',
    paragraphs: [
      'You must disclose actual or potential conflicts of interest and must not undertake outside employment, consulting or other engagement that conflicts with your duties, confidentiality obligations, working hours or Company interests without prior written approval, where such approval is required by Company policy.',
    ],
  },
  {
    id: 'sec_14',
    number: 14,
    title: 'Anti-Harassment, Equal Opportunity and Grievances',
    paragraphs: [
      'TaskNera expects a respectful workplace and maintains zero tolerance for discrimination and harassment. Employees may use the Company\'s grievance and complaint channels. Complaints, including those relating to sexual harassment, will be handled under the applicable law and Company procedure, including the POSH framework where applicable.',
    ],
  },
  {
    id: 'sec_15',
    number: 15,
    title: 'Company Policies and Policy Changes',
    paragraphs: [
      'You acknowledge that you have access to and agree to comply with TaskNera\'s HR policies and procedures, including the Code of Conduct, Attendance, Leave, Compensation, Confidentiality & Intellectual Property, IT & Cybersecurity, Grievance, Anti-Harassment, Employee Separation and other applicable policies. The current HR Policy Document is TaskNera \u2013 HR Policy Document (v1.2), Reference ID TASK/HR POLICY DOCUMENT/2026/0026/v1.2. The Company may amend, modify, interpret, suspend or withdraw policy provisions to meet business, operational or legal requirements, with effect from the date notified, subject always to applicable law.',
    ],
  },
  {
    id: 'sec_16',
    number: 16,
    title: 'Statutory and Legal Compliance',
    paragraphs: [
      'Nothing in this Offer Letter is intended to exclude, reduce or contract out of any mandatory requirement under applicable central or state employment, wage, social-security, workplace-safety, anti-harassment, privacy or other laws. If any provision conflicts with a mandatory legal requirement, the mandatory legal requirement will prevail to the extent of the conflict.',
    ],
  },
  {
    id: 'sec_17',
    number: 17,
    title: 'Governing Law and Jurisdiction',
    paragraphs: [
      'This Offer Letter shall be governed by the laws applicable in India. Subject to any mandatory jurisdiction or dispute-resolution requirement under applicable law, disputes shall be subject to the competent courts having jurisdiction over the Company\'s registered office.',
    ],
  },
  {
    id: 'sec_18',
    number: 18,
    title: 'Entire Understanding',
    paragraphs: [
      'This Offer Letter, its Annexures, and applicable Company policies constitute the employment terms communicated to you and supersede prior inconsistent written or oral representations concerning the matters covered herein, subject to any subsequently issued appointment letter or written amendment signed/issued by the Company.',
    ],
  },
];

// Internship Specific Structure
const INTERNSHIP_SECTIONS: DocumentSectionItem[] = [
  {
    id: 'int_1',
    number: 1,
    title: 'Internship Term and Schedule',
    paragraphs: [
      'Your internship will commence on {{joining_date}} and conclude on {{offer_validity_date}}, unless extended or concluded earlier by mutual written agreement.',
      'Your designated weekly commitment will be {{working_days_shift}} operating under {{work_location}} protocols.',
    ],
  },
  {
    id: 'int_2',
    number: 2,
    title: 'Stipend and Learning Allowances',
    paragraphs: [
      'You will receive a monthly stipend of INR {{annual_ctc}} subject to applicable taxes. You will not be entitled to standard employee retirement benefits or permanent leave accumulations.',
    ],
  },
  {
    id: 'int_3',
    number: 3,
    title: 'Mentorship and Deliverables',
    paragraphs: [
      'You will report directly to {{reporting_manager}} in {{department}}. Regular reviews will assess skill progress, project milestones, and collaboration standards.',
    ],
  },
  {
    id: 'int_4',
    number: 4,
    title: 'Intellectual Property and Confidentiality',
    paragraphs: [
      'All code, designs, artifacts, and documentation produced during this internship are the sole and exclusive proprietary property of TaskNera.',
    ],
  },
  {
    id: 'int_5',
    number: 5,
    title: 'Code of Conduct and Early Conclusion',
    paragraphs: [
      'Interns must observe the highest standards of professional decorum and confidentiality. Either party may conclude this internship with 7 calendar days written notice.',
    ],
  },
];

// Appointment Letter Specific Structure
const APPOINTMENT_SECTIONS: DocumentSectionItem[] = [
  {
    id: 'app_1',
    number: 1,
    title: 'Formal Confirmation of Appointment',
    paragraphs: [
      'Consequent to our offer and your formal acceptance, we are pleased to confirm your appointment as {{designation}} at TaskNera with effect from {{joining_date}}.',
    ],
  },
  {
    id: 'app_2',
    number: 2,
    title: 'Department, Role and Reporting',
    paragraphs: [
      'You will be part of the {{department}} department, reporting to {{reporting_manager}}. Your place of posting will be {{work_location}}.',
    ],
  },
  {
    id: 'app_3',
    number: 3,
    title: 'Compensation Package',
    paragraphs: [
      'Your total annual cost to company (CTC) is confirmed at INR {{annual_ctc}}, payable monthly in accordance with TaskNera standard payroll cycles.',
    ],
  },
  {
    id: 'app_4',
    number: 4,
    title: 'Probation Period and Notice Terms',
    paragraphs: [
      'You will be on probation for {{probation_period}}. Upon successful evaluation, confirmation will be communicated in writing. The applicable notice period is {{notice_period}}.',
    ],
  },
  {
    id: 'app_5',
    number: 5,
    title: 'Corporate Policies & Disciplinary Code',
    paragraphs: [
      'You agree to abide by TaskNera code of conduct, non-disclosure agreements, data protection mandates, and workplace safety guidelines.',
    ],
  },
];

const DEFAULT_ANNEXURE_ROWS: DocumentAnnexureRow[] = [
  { label: 'Employee Name', key: 'employee_name', defaultValue: 'Aarav Sharma' },
  { label: 'Designation', key: 'designation', defaultValue: 'Senior Platform Engineer' },
  { label: 'Department', key: 'department', defaultValue: 'Platform Engineering' },
  { label: 'Reporting Manager', key: 'reporting_manager', defaultValue: 'Sheetal Bedi (CEO & Founder)' },
  { label: 'Date of Joining', key: 'joining_date', defaultValue: '15/10/2026' },
  { label: 'Employment Type', key: 'employment_type', defaultValue: 'Full-Time' },
  { label: 'Work Location', key: 'work_location', defaultValue: 'Remote / On-site / Hybrid' },
  { label: 'Probation Period', key: 'probation_period', defaultValue: '6 Months' },
  { label: 'Notice Period', key: 'notice_period', defaultValue: '45 days' },
  { label: 'Working Days / Shift', key: 'working_days_shift', defaultValue: '6 working days and a 9-hour shift (may vary depending on business requirements)' },
];

const MANDATORY_DOCS = [
  'Government-issued identity/address proof and PAN, as applicable.',
  'Education/qualification documents relevant to the role.',
  'Previous employment/relieving or resignation documentation, where applicable.',
  'Passport-size photograph/soft copy, where required.',
  'Any additional documents reasonably required for lawful onboarding or background verification.',
];

const TaskNeraSecondaryHeader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 10,
      marginBottom: 16,
      borderBottom: '1px solid #e2d3ca',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="/logo.png" alt="TaskNera" style={{ width: 40, height: 40, objectFit: 'contain' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          <span style={{ color: '#252c38' }}>Task</span>
          <span style={{ color: '#f56637' }}>Nera</span>
        </div>
        <div
          style={{
            fontSize: '9.5px',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '0.02em',
            marginTop: 2,
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          People. Processes. Performance.
        </div>
      </div>
    </div>
    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
        <div>D-57 F1 Dilshad Colony, Shahdara, Delhi &ndash; 110095</div>
        <div>Email: careers@tasknera.com</div>
      </div>
    </div>
  </div>
);

const TaskNeraFooter: React.FC<{ pageNum: number }> = ({ pageNum }) => (
  <div
    className="tasknera-page-footer"
    style={{
      marginTop: 'auto',
      borderTop: '1px solid #e2e8f0',
      paddingTop: 10,
      textAlign: 'center',
      fontSize: '11px',
      color: '#94a3b8',
    }}
  >
    TaskNera | Page {pageNum} of 11
  </div>
);

export const QuickTemplateOfferModal: React.FC<QuickTemplateOfferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error, info } = useToast();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  // Handle PDF upload & extraction into structured sections
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingPdf(true);
    try {
      const data = await offerService.convertPdfToStructuredLetter(file);
      if (data.sections && data.sections.length > 0) {
        const newSecs: DocumentSectionItem[] = data.sections.map((s, idx) => ({
          id: `pdf_sec_${Date.now()}_${idx}`,
          number: s.number,
          title: s.title,
          paragraphs: s.content.split('\n').filter(Boolean),
        }));
        setSections(newSecs);
      }
      if (data.extractedValues) {
        setValues((prev) => ({
          ...prev,
          ...data.extractedValues,
        }));
      }
      setLetterType('custom');
      success(`Extracted ${data.totalPages} pages & ${data.sections.length} legal sections from ${file.name}!`);
    } catch (err: any) {
      error(err.message || 'Failed to extract PDF sections.');
    } finally {
      setIsExtractingPdf(false);
    }
  };


  // Workflow steps: 1 = Structure & Clauses, 2 = Dynamic Member Details, 3 = Multi-Page Official Preview
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Active letter type
  const [letterType, setLetterType] = useState<LetterTypeKey>('employment_offer');

  // Letter title & preamble
  const [docTitle, setDocTitle] = useState('Offer of Employment');
  const [salutationText, setSalutationText] = useState('Dear {{salutation}} {{employee_name}},');
  const [subjectText, setSubjectText] = useState('Subject: Offer of Employment with TaskNera');
  const [introParagraph, setIntroParagraph] = useState(
    'Further to our discussions and subject to satisfactory completion of the Company\'s joining and verification requirements, TaskNera (the \u201CCompany\u201D) is pleased to offer you employment for the position of {{designation}}, on the terms and conditions set out in this Offer Letter, its Annexures, and the Company\'s applicable policies as amended from time to time.'
  );

  // Document sections list
  const [sections, setSections] = useState<DocumentSectionItem[]>(DEFAULT_OFFER_SECTIONS);

  // Annexure I table rows
  const [annexureRows, setAnnexureRows] = useState<DocumentAnnexureRow[]>(DEFAULT_ANNEXURE_ROWS);

  // Dynamic field values
  const [values, setValues] = useState<Record<string, string>>({
    salutation: 'Mr.',
    employee_name: 'Aarav Sharma',
    candidate_name: 'Aarav Sharma',
    designation: 'Senior Platform Engineer',
    department: 'Platform Engineering',
    annual_ctc: '18,00,000',
    salary: '18,00,000',
    ctc_per_month: '1,50,000',
    basic_salary: '60,000',
    hra: '30,000',
    special_allowance: '60,000',
    gross_monthly: '1,50,000',
    employer_contributions: 'NA',
    total_ctc_per_annum: '18,00,000',
    work_location: 'Remote / On-site / Hybrid',
    location: 'Remote / On-site / Hybrid',
    probation_period: '6 Months',
    notice_period: '45 days',
    reporting_manager: 'Sheetal Bedi (CEO & Founder)',
    employment_type: 'Full-Time',
    working_days_shift: '6 working days and a 9-hour shift (may vary depending on business requirements)',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    joining_date: new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    offer_validity_date: new Date(Date.now() + 86400000 * 14).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    reference_number: `TASK/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
  });

  // Automatically recalculate monthly breakdown when annual CTC changes
  const handleCtcChange = (ctcStr: string) => {
    const numeric = parseFloat(ctcStr.replace(/[^0-9.]/g, '')) || 0;
    const formatINR = (n: number) => new Intl.NumberFormat('en-IN').format(n);
    const monthly = Math.round(numeric / 12);
    const basic = Math.round(monthly * 0.40);
    const hra = Math.round(monthly * 0.20);
    const special = Math.max(0, monthly - (basic + hra));

    setValues((prev) => ({
      ...prev,
      annual_ctc: ctcStr,
      salary: ctcStr,
      ctc_per_month: formatINR(monthly),
      basic_salary: formatINR(basic),
      hra: formatINR(hra),
      special_allowance: formatINR(special),
      gross_monthly: formatINR(monthly),
      total_ctc_per_annum: ctcStr,
    }));
  };

  // Added Employees state for Step 2 Selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [inputMode, setInputMode] = useState<'select_employee' | 'manual'>('select_employee');
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  // Fetch employees from database whenever modal opens
  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await EmployeeService.listEmployees();
      const list = data || [];
      setEmployees(list);

      // Pre-select initialEmployee if provided, or first employee if nothing selected yet
      if (initialEmployee) {
        handleSelectEmployee(initialEmployee);
      } else if (!selectedEmployeeId && list.length > 0) {
        handleSelectEmployee(list[0]);
      }
    } catch (err: any) {
      console.warn('Failed to load employees for offer modal:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  // When an employee is picked, auto-populate all dynamic values into the offer letter
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);

    const numericCtc = Number(emp.annualCtc) || 0;
    const formatINR = (n: number) => new Intl.NumberFormat('en-IN').format(n);
    const formattedCtc = numericCtc > 0 ? formatINR(numericCtc) : (values['annual_ctc'] || '18,00,000');

    const monthly = Math.round(numericCtc / 12);
    const basicPct = (emp.basicPercent != null ? emp.basicPercent : 40) / 100;
    const hraPct = (emp.hraPercent != null ? emp.hraPercent : 20) / 100;
    const basic = Math.round(monthly * basicPct);
    const hra = Math.round(monthly * hraPct);
    const special = Math.max(0, monthly - (basic + hra));

    let salutation = emp.title || 'Mr.';
    if (!['Mr.', 'Ms.', 'Mrs.', 'Dr.'].includes(salutation)) {
      salutation = 'Mr.';
    }

    let formattedJoiningDate = values['joining_date'] || '';
    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        if (!isNaN(d.getTime())) {
          formattedJoiningDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
      } catch {
        // ignore
      }
    }

    setValues((prev) => ({
      ...prev,
      salutation,
      employee_name: emp.fullName,
      candidate_name: emp.fullName,
      designation: emp.designation || prev.designation,
      department: emp.department || prev.department,
      annual_ctc: formattedCtc,
      salary: formattedCtc,
      total_ctc_per_annum: formattedCtc,
      ctc_per_month: formatINR(monthly),
      gross_monthly: formatINR(monthly),
      basic_salary: formatINR(basic),
      hra: formatINR(hra),
      special_allowance: formatINR(special),
      employer_contributions: 'NA',
      work_location: emp.workLocation || prev.work_location || 'Remote / On-site / Hybrid',
      location: emp.workLocation || prev.location || 'Remote / On-site / Hybrid',
      joining_date: formattedJoiningDate || prev.joining_date,
      reporting_manager: emp.reportingManager || prev.reporting_manager || 'Sheetal Bedi (CEO & Founder)',
      employment_type: emp.employmentType || prev.employment_type || 'Full-Time',
    }));
  };

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = employeeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q)) ||
        (e.personalEmail && e.personalEmail.toLowerCase().includes(q));

      const matchesDept = selectedDeptFilter === 'ALL' || e.department === selectedDeptFilter;

      return matchesSearch && matchesDept;
    });
  }, [employees, employeeSearch, selectedDeptFilter]);

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmployeeId) || null;
  }, [employees, selectedEmployeeId]);

  // Step 1 Editor sub-tab
  const [editorTab, setEditorTab] = useState<'structured' | 'smart_paste'>('structured');
  const [pastedText, setPastedText] = useState('');

  // Step 3 controls
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(false);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>('sec_1');
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Switch Letter Type Presets
  const handleLetterTypeChange = (type: LetterTypeKey) => {
    setLetterType(type);
    if (type === 'employment_offer') {
      setDocTitle('Offer of Employment');
      setSubjectText('Subject: Offer of Employment with TaskNera');
      setIntroParagraph(
        'Further to our discussions and subject to satisfactory completion of the Company\'s joining and verification requirements, TaskNera (the \u201CCompany\u201D) is pleased to offer you employment for the position of {{designation}}, on the terms and conditions set out in this Offer Letter, its Annexures, and the Company\'s applicable policies as amended from time to time.'
      );
      setSections(DEFAULT_OFFER_SECTIONS);
      setAnnexureRows(DEFAULT_ANNEXURE_ROWS);
    } else if (type === 'internship_offer') {
      setDocTitle('Internship Offer Letter');
      setSubjectText('Subject: Offer of Internship with TaskNera');
      setIntroParagraph(
        'We are pleased to extend an offer for an Internship position as {{designation}} at TaskNera. This agreement outlines your mentorship scope, project deliverables, and operational parameters.'
      );
      setSections(INTERNSHIP_SECTIONS);
      setAnnexureRows(DEFAULT_ANNEXURE_ROWS.slice(0, 7));
    } else if (type === 'appointment_letter') {
      setDocTitle('Letter of Appointment');
      setSubjectText('Subject: Letter of Appointment \u2013 TaskNera');
      setIntroParagraph(
        'Further to your acceptance of our offer, TaskNera is pleased to confirm your appointment as {{designation}}. Please find the confirmed terms of employment detailed below.'
      );
      setSections(APPOINTMENT_SECTIONS);
      setAnnexureRows(DEFAULT_ANNEXURE_ROWS);
    } else {
      setDocTitle('Employment Agreement / Letter');
      setSubjectText('Subject: Official Employment Communication');
    }
  };

  // Smart Parser: Takes raw unstructured text and parses into numbered sections
  const handleSmartParseText = () => {
    if (!pastedText.trim()) {
      error('Please paste text to auto-structure.');
      return;
    }

    const lines = pastedText.split('\n').map((l) => l.trim()).filter(Boolean);
    const newSections: DocumentSectionItem[] = [];
    let currentSec: DocumentSectionItem | null = null;
    let secCounter = 1;

    for (const line of lines) {
      // Check for numbered section headers: "1. ...", "Section 1", "Clause 1"
      const match = line.match(/^(\d+)[\.\)]\s+(.*)/i) || line.match(/^(?:Section|Clause)\s+(\d+)[:\s]+(.*)/i);
      if (match) {
        if (currentSec) newSections.push(currentSec);
        currentSec = {
          id: `sec_${Date.now()}_${secCounter}`,
          number: secCounter++,
          title: match[2]?.trim() || `Section ${match[1]}`,
          paragraphs: [],
          bullets: [],
        };
      } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const bulletText = line.replace(/^[•\-\*]\s*/, '').trim();
        if (currentSec) {
          if (!currentSec.bullets) currentSec.bullets = [];
          currentSec.bullets.push(bulletText);
        }
      } else {
        if (currentSec) {
          currentSec.paragraphs.push(line);
        } else {
          // If before first section, update intro paragraph
          setIntroParagraph((prev) => (prev ? `${prev} ${line}` : line));
        }
      }
    }

    if (currentSec) newSections.push(currentSec);

    if (newSections.length > 0) {
      setSections(newSections);
      setEditorTab('structured');
      success(`Successfully structured text into ${newSections.length} legal sections!`);
    } else {
      error('Could not auto-detect numbered sections. Try using standard numbering (e.g. "1. Section Title").');
    }
  };

  // Add a new blank section
  const handleAddSection = () => {
    const nextNum = sections.length + 1;
    const newSec: DocumentSectionItem = {
      id: `sec_${Date.now()}`,
      number: nextNum,
      title: `New Section Title`,
      paragraphs: ['Enter clause text here with dynamic tokens like {{employee_name}} or {{annual_ctc}}.'],
    };
    setSections([...sections, newSec]);
    setExpandedSectionId(newSec.id);
  };

  // Remove section
  const handleRemoveSection = (id: string) => {
    const filtered = sections.filter((s) => s.id !== id);
    const renumbered = filtered.map((s, idx) => ({ ...s, number: idx + 1 }));
    setSections(renumbered);
  };

  // Handle resume auto-fill
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingResume(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('offergen_token');
      const res = await fetch('/api/v1/candidates/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const extracted = json.data?.extractedData || json.data;
        if (extracted) {
          const name = extracted.fullName || extracted.candidateName || file.name.replace(/\.[^/.]+$/, '');
          setValues((prev) => ({
            ...prev,
            employee_name: name,
            candidate_name: name,
            designation: extracted.currentPosition || extracted.position || prev.designation,
          }));
          success('Candidate details auto-filled from resume!');
        }
      } else {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setValues((prev) => ({ ...prev, employee_name: cleanName, candidate_name: cleanName }));
        info(`Auto-detected candidate name: "${cleanName}"`);
      }
    } catch {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setValues((prev) => ({ ...prev, employee_name: cleanName, candidate_name: cleanName }));
      info(`Auto-detected candidate name: "${cleanName}"`);
    } finally {
      setIsExtractingResume(false);
    }
  };

  // Universal text interpolator: replaces {{key}} and [Key]
  const interpolateText = (raw: string, highlight: boolean = false): string => {
    if (!raw) return '';
    let result = raw;

    const allMap: Record<string, string> = {
      ...values,
      salutation: values['salutation'] || 'Mr.',
      employee_name: values['employee_name'] || values['candidate_name'] || 'Aarav Sharma',
      candidate_name: values['employee_name'] || values['candidate_name'] || 'Aarav Sharma',
      designation: values['designation'] || 'Senior Platform Engineer',
      department: values['department'] || 'Platform Engineering',
      annual_ctc: values['annual_ctc'] || values['salary'] || '18,00,000',
      work_location: values['work_location'] || 'Remote / On-site / Hybrid',
      joining_date: values['joining_date'] || '15/10/2026',
      offer_validity_date: values['offer_validity_date'] || '05/10/2026',
      probation_period: values['probation_period'] || '6 Months',
      probation_notice_days: values['probation_notice_days'] || '15',
      notice_period: values['notice_period'] || '45 days',
      reporting_manager: values['reporting_manager'] || 'Sheetal Bedi (CEO & Founder)',
      employment_type: values['employment_type'] || 'Full-Time',
      working_days_shift: values['working_days_shift'] || '6 working days and a 9-hour shift (may vary depending on business requirements)',
      reference_number: values['reference_number'] || 'TASK/2026/102',
      date: values['date'] || '01/10/2026',
      basic_salary: values['basic_salary'] || '60,000',
      hra: values['hra'] || '30,000',
      special_allowance: values['special_allowance'] || '60,000',
      gross_monthly: values['gross_monthly'] || '1,50,000',
      ctc_per_month: values['ctc_per_month'] || '1,50,000',
      employer_contributions: values['employer_contributions'] || 'NA',
    };

    // Replace {{key}}
    for (const [k, v] of Object.entries(allMap)) {
      const val = v || '';
      const displayVal = highlight
        ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${val}</mark>`
        : val;
      result = result.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), displayVal);
    }

    // Replace square bracketed placeholders: [Employee Full Name], [Designation], [Annual CTC], etc.
    const bracketReplacements: Array<[RegExp, string]> = [
      [/\[Employee Full Name\]/gi, allMap.employee_name],
      [/\[Designation\]/gi, allMap.designation],
      [/\[Department\]/gi, allMap.department],
      [/\[Annual CTC\]/gi, allMap.annual_ctc],
      [/\[Reporting Manager\]/gi, allMap.reporting_manager],
      [/\[Remote \/ On-site \/ Hybrid\]/gi, allMap.work_location],
      [/\[Full-Time\]/gi, allMap.employment_type],
      [/\[Mr\.\/Ms\.\]/gi, allMap.salutation],
      [/\[6\]/gi, allMap.probation_period.replace(/[^0-9]/g, '') || '6'],
      [/\[45\]/gi, allMap.notice_period.replace(/[^0-9]/g, '') || '45'],
      [/\[2\]/gi, '2'],
      [/\[30\]/gi, '30'],
      [/\[9\]/gi, '9'],
      [/\[TASK\/YYYY\/000\]/gi, allMap.reference_number],
      [/\[DD\/MM\/YYYY\]/gi, allMap.date],
      [/\[Basic Salary\]/gi, allMap.basic_salary],
      [/\[HRA\]/gi, allMap.hra],
      [/\[Special \/ Other Allowance\]/gi, allMap.special_allowance],
      [/\[Gross Monthly Salary\]/gi, allMap.gross_monthly],
      [/\[Employer Contributions\]/gi, allMap.employer_contributions],
      [/\[Total Fixed CTC \(Per Month\)\]/gi, allMap.ctc_per_month],
      [/\[Total Fixed CTC \(Per Annum\)\]/gi, allMap.annual_ctc],
    ];

    for (const [pattern, val] of bracketReplacements) {
      const displayVal = highlight
        ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${val}</mark>`
        : val;
      result = result.replace(pattern, displayVal);
    }

    return result;
  };

  // Print & PDF Download Handler
  const handleDownloadPdf = () => {
    const prevTitle = document.title;
    const candidateName = values['employee_name'] || 'Candidate';
    document.title = `TaskNera_Offer_Letter_${candidateName.replace(/\s+/g, '_')}_${values['reference_number'].replace(/[\/\\]/g, '_')}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  // Copy Plain Text Handler
  const handleCopyText = () => {
    const plainSections = sections
      .map(
        (s) =>
          `${s.number}. ${s.title}\n` +
          s.paragraphs.map((p) => interpolateText(p, false).replace(/<[^>]+>/g, '')).join('\n') +
          (s.bullets ? '\n' + s.bullets.map((b) => `• ${b}`).join('\n') : '')
      )
      .join('\n\n');

    const fullPlainText = `Reference: ${values['reference_number']}\nDate: ${values['date']}\nEmployee Name: ${values['employee_name']}\nDesignation: ${values['designation']}\n\n${docTitle}\n\nDear ${values['salutation']} ${values['employee_name']},\n\n${subjectText}\n\n${introParagraph}\n\n${plainSections}\n\nFor TaskNera\nSheetal Bedi (CEO & Founder)\n\nAccepted and Agreed by Employee:\nName: ${values['employee_name']}\nSignature: __________________\nDate: __________________`;

    navigator.clipboard.writeText(fullPlainText);
    setCopied(true);
    success('Structured letter text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to DB Pipeline
  const handleSaveToPipeline = async () => {
    setIsSaving(true);
    try {
      const candidateName = values['employee_name'] || 'Candidate';
      const parts = candidateName.trim().split(' ');
      const firstName = parts[0] || 'Candidate';
      const lastName = parts.slice(1).join(' ') || '';
      const numericSalary = parseFloat(String(values['annual_ctc'] || '1800000').replace(/[^0-9.]/g, '')) || 1800000;

      const created = await offerService.generateFinalOffer({
        templateId: 'tpl_tasknera_official_001',
        candidate: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}@taskneracandidate.com`,
          phone: '+91 9876543210',
          address: 'Delhi, India',
        },
        jobDetails: {
          jobTitle: values['designation'] || 'Senior Engineer',
          department: values['department'] || 'Engineering',
          bandGrade: 'Standard Professional',
          workLocation: values['work_location'] || 'Delhi (Hybrid)',
          employmentType: 'FULL_TIME',
          proposedJoiningDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
          reportingManagerName: values['reporting_manager'] || 'Sheetal Bedi',
          reportingManagerTitle: 'CEO & FOUNDER',
        },
        compensation: {
          currency: 'INR',
          baseSalary: numericSalary * 0.7,
          hraAllowance: numericSalary * 0.2,
          specialAllowances: numericSalary * 0.1,
          performanceBonus: 0,
          joiningBonus: 0,
          totalCtc: numericSalary,
        },
        terms: {
          probationDurationDays: 180,
          noticePeriodDays: 45,
          workingHoursPerWeek: 45,
          workSchedule: 'Monday to Saturday',
          offerValidUntil: values['offer_validity_date'] || 'October 15, 2026',
          clauses: [],
        },
        humanOverrides: [],
      });

      success(`Offer letter registered in pipeline with Ref: ${created.referenceNumber}!`);
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: step === 3 ? 1040 : 920,
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '18px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #090e1d 0%, #1e1b4b 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="/logo.png"
              alt="TaskNera"
              style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 8, background: '#ffffff', padding: 2 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  TaskNera Structured Letter Generator
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    fontSize: '0.75rem',
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  Step {step} of 3: {step === 1 ? 'Structure & Clauses' : step === 2 ? 'Member Details' : 'Multi-Page Letterhead Preview'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
                Generates exact statutory multi-page format with brown headers, dual signatures & Annexure I table.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: '50%',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#f8fafc' }}>
          {/* STEP 1: STRUCTURE & SECTIONS CONFIGURATION */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Preset Letter Type Selector */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 10 }}>
                  Select Letter Template Type:
                </label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { key: 'employment_offer', label: 'Offer of Employment (7 Sections)', desc: 'Official standard with dual signatures & Annexure I' },
                    { key: 'internship_offer', label: 'Internship Offer Letter (5 Sections)', desc: 'Mentorship scope, stipend & IP clauses' },
                    { key: 'appointment_letter', label: 'Appointment / Confirmation', desc: 'Formal confirmation of appointment' },
                    { key: 'custom', label: 'Custom Letter / Paste Text', desc: 'Define your own sections or paste raw text' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleLetterTypeChange(t.key as any)}
                      style={{
                        flex: '1 1 200px',
                        padding: '12px 16px',
                        borderRadius: 10,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: letterType === t.key ? '2px solid #a35d39' : '1px solid #cbd5e1',
                        background: letterType === t.key ? '#fdfbf9' : '#ffffff',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: letterType === t.key ? '#a35d39' : '#0f172a' }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 3 }}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* View Switcher: Section-by-Section Cards vs Smart Paste Parser */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6, background: '#e2e8f0', padding: 3, borderRadius: 8 }}>
                  <button
                    type="button"
                    onClick={() => setEditorTab('structured')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: editorTab === 'structured' ? '#ffffff' : 'transparent',
                      color: editorTab === 'structured' ? '#0f172a' : '#64748b',
                      boxShadow: editorTab === 'structured' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Structured Sections View ({sections.length} Clauses)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('smart_paste')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: editorTab === 'smart_paste' ? '#ffffff' : 'transparent',
                      color: editorTab === 'smart_paste' ? '#0f172a' : '#64748b',
                      boxShadow: editorTab === 'smart_paste' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    Paste Text &amp; Auto-Structure
                  </button>
                </div>

                {editorTab === 'structured' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="file"
                      ref={pdfInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf"
                      style={{ display: 'none' }}
                    />
                    <Button
                      variant="secondary"
                      icon={isExtractingPdf ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isExtractingPdf}
                      style={{ fontSize: '0.8125rem', padding: '6px 12px', borderColor: '#a35d39', color: '#a35d39' }}
                    >
                      {isExtractingPdf ? 'Extracting with Python...' : 'Import from PDF (AI)'}
                    </Button>
                    <Button
                      variant="secondary"
                      icon={<Plus size={14} />}
                      onClick={handleAddSection}
                      style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                    >
                      Add Numbered Section
                    </Button>
                  </div>
                )}
              </div>


              {/* SECTION-BY-SECTION STRUCTURED EDITOR */}
              {editorTab === 'structured' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Top Metadata Header Card */}
                  <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a35d39', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Document Top Header &amp; Metadata
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Reference Format:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={values['reference_number']}
                          onChange={(e) => setValues({ ...values, reference_number: e.target.value })}
                          style={{ fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Issue Date Format:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={values['date']}
                          onChange={(e) => setValues({ ...values, date: e.target.value })}
                          style={{ fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Centered Title:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a35d39' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Opening Salutation &amp; Subject:</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <input
                          type="text"
                          className="form-input"
                          value={salutationText}
                          onChange={(e) => setSalutationText(e.target.value)}
                          style={{ fontSize: '0.8125rem' }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          value={subjectText}
                          onChange={(e) => setSubjectText(e.target.value)}
                          style={{ fontSize: '0.8125rem', fontWeight: 700 }}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Introduction Paragraph:</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={introParagraph}
                        onChange={(e) => setIntroParagraph(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>

                  {/* Numbered Legal Sections List */}
                  {sections.map((sec) => {
                    const isExpanded = expandedSectionId === sec.id;
                    return (
                      <div
                        key={sec.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: 10,
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                      >
                        {/* Section Header Accordion */}
                        <div
                          onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                          style={{
                            padding: '12px 18px',
                            background: isExpanded ? '#fdfbf9' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: isExpanded ? '1px solid #e2d3ca' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: '#fae1c3',
                                color: '#a35d39',
                                fontWeight: 800,
                                fontSize: '0.8125rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {sec.number}
                            </span>
                            <div>
                              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#a35d39', fontFamily: 'Georgia, serif' }}>
                                {sec.number}. {sec.title}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 10 }}>
                                ({sec.paragraphs.length} paragraph{sec.paragraphs.length > 1 ? 's' : ''}
                                {sec.bullets ? `, ${sec.bullets.length} bullets` : ''})
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSection(sec.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: 4,
                              }}
                              title="Delete section"
                            >
                              <Trash2 size={16} />
                            </button>
                            {isExpanded ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                          </div>
                        </div>

                        {/* Section Edit Form */}
                        {isExpanded && (
                          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Section Title:</label>
                              <input
                                type="text"
                                className="form-input"
                                value={sec.title}
                                onChange={(e) => {
                                  const updated = sections.map((s) => (s.id === sec.id ? { ...s, title: e.target.value } : s));
                                  setSections(updated);
                                }}
                                style={{ fontWeight: 700, fontSize: '0.875rem', color: '#a35d39' }}
                              />
                            </div>

                            {/* Paragraphs */}
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Paragraph Content:</label>
                              {sec.paragraphs.map((p, pIdx) => (
                                <textarea
                                  key={pIdx}
                                  className="form-input"
                                  rows={3}
                                  value={p}
                                  onChange={(e) => {
                                    const newP = [...sec.paragraphs];
                                    newP[pIdx] = e.target.value;
                                    const updated = sections.map((s) => (s.id === sec.id ? { ...s, paragraphs: newP } : s));
                                    setSections(updated);
                                  }}
                                  style={{ fontSize: '0.8125rem', marginBottom: 6 }}
                                />
                              ))}
                            </div>

                            {/* Bullets (If any) */}
                            {sec.bullets && (
                              <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Bullet Points (Zero Tolerance / Non-Negotiables):</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {sec.bullets.map((b, bIdx) => (
                                    <div key={bIdx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                      <span style={{ color: '#a35d39', fontWeight: 800 }}>•</span>
                                      <input
                                        type="text"
                                        className="form-input"
                                        value={b}
                                        onChange={(e) => {
                                          const newB = [...(sec.bullets || [])];
                                          newB[bIdx] = e.target.value;
                                          const updated = sections.map((s) => (s.id === sec.id ? { ...s, bullets: newB } : s));
                                          setSections(updated);
                                        }}
                                        style={{ fontSize: '0.8125rem' }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Signatures & Annexure Information */}
                  <div style={{ background: '#fdfbf9', border: '1px solid #e2d3ca', borderRadius: 10, padding: '16px 20px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a35d39', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Execution Signatures &amp; Annexure I Table
                    </span>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '6px 0 10px' }}>
                      The generated letter will automatically append:
                    </p>
                    <ul style={{ fontSize: '0.8125rem', color: '#334155', margin: 0, paddingLeft: 20 }}>
                      <li><strong>For TaskNera:</strong> Sheetal Bedi (CEO &amp; Founder)</li>
                      <li><strong>Accepted and Agreed by Employee:</strong> Signature lines for Name, Signature &amp; Date</li>
                      <li><strong>Annexure I:</strong> 10-point employment schedule table &amp; Mandatory Joining Documents checklist</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* SMART TEXT PASTE & AUTO-STRUCTURE TAB */}
              {editorTab === 'smart_paste' && (
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <h5 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                      Paste Any Unstructured Text or Email:
                    </h5>
                    <Button
                      variant="primary"
                      icon={<Sparkles size={14} />}
                      onClick={handleSmartParseText}
                      style={{ fontSize: '0.8125rem', background: '#a35d39', borderColor: '#a35d39' }}
                    >
                      Auto-Structure into Sections
                    </Button>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 12px' }}>
                    Paste contract text from Microsoft Word, PDF, or email. The parser will detect numbered points ("1.", "2."), bullet points, and title clauses, formatting them into official TaskNera structure.
                  </p>
                  <textarea
                    rows={12}
                    className="form-input"
                    placeholder={`Paste text here, for example:\n\n1. Appointment, Acceptance and Joining\nThis offer is valid until [DD/MM/YYYY]...\n\n2. Position, Reporting and Duties\nYou will be employed as [Designation]...`}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    style={{ fontSize: '0.8125rem', lineHeight: 1.5, fontFamily: 'monospace' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MEMBER SELECTION & DYNAMIC VALUES */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header & Mode Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Step 2: Choose Employee &amp; Member Dynamic Values
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Select an employee you have added to auto-populate contract terms, letterhead, and Annexure III salary breakdown.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Mode Toggle: Added Employees vs Manual */}
                  <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: 3, borderRadius: 8 }}>
                    <button
                      type="button"
                      onClick={() => setInputMode('select_employee')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: inputMode === 'select_employee' ? '#ffffff' : 'transparent',
                        color: inputMode === 'select_employee' ? '#a35d39' : '#64748b',
                        boxShadow: inputMode === 'select_employee' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      <Users size={14} />
                      Choose Added Employee ({employees.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('manual')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        backgroundColor: inputMode === 'manual' ? '#ffffff' : 'transparent',
                        color: inputMode === 'manual' ? '#a35d39' : '#64748b',
                        boxShadow: inputMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      <Edit3 size={14} />
                      Enter Manually
                    </button>
                  </div>

                  {inputMode === 'select_employee' && (
                    <Button
                      variant="secondary"
                      icon={<UserPlus size={14} />}
                      onClick={() => setIsAddEmployeeModalOpen(true)}
                      style={{ fontSize: '0.8125rem', padding: '7px 12px' }}
                    >
                      + Add New Employee
                    </Button>
                  )}

                  {inputMode === 'manual' && (
                    <>
                      <input
                        type="file"
                        ref={resumeInputRef}
                        onChange={handleResumeUpload}
                        accept=".pdf,.docx,.txt"
                        style={{ display: 'none' }}
                      />
                      <Button
                        variant="secondary"
                        icon={isExtractingResume ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={isExtractingResume}
                        style={{ fontSize: '0.8125rem', padding: '7px 12px' }}
                      >
                        {isExtractingResume ? 'Auto-Extracting...' : 'Auto-Fill from Resume (AI)'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 1. EMPLOYEE PICKER SECTION (When select_employee mode is active) */}
              {inputMode === 'select_employee' && (
                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Search and Filters Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
                      <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search employee by name, ID, role, or department..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
                      />
                      {employeeSearch && (
                        <button
                          type="button"
                          onClick={() => setEmployeeSearch('')}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Department Quick Filter Pills */}
                    {availableDepartments.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Dept:</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDeptFilter('ALL')}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: selectedDeptFilter === 'ALL' ? 700 : 500,
                            padding: '3px 10px',
                            borderRadius: 14,
                            border: selectedDeptFilter === 'ALL' ? '1px solid #a35d39' : '1px solid #e2e8f0',
                            backgroundColor: selectedDeptFilter === 'ALL' ? '#fdfbf9' : '#f8fafc',
                            color: selectedDeptFilter === 'ALL' ? '#a35d39' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          All ({employees.length})
                        </button>
                        {availableDepartments.map((dept) => {
                          const count = employees.filter((e) => e.department === dept).length;
                          const isSel = selectedDeptFilter === dept;
                          return (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => setSelectedDeptFilter(dept)}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: isSel ? 700 : 500,
                                padding: '3px 10px',
                                borderRadius: 14,
                                border: isSel ? '1px solid #a35d39' : '1px solid #e2e8f0',
                                backgroundColor: isSel ? '#fdfbf9' : '#f8fafc',
                                color: isSel ? '#a35d39' : '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              {dept} ({count})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Employee Cards Grid */}
                  {loadingEmployees ? (
                    <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', color: '#a35d39' }} />
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading added employees from database...</p>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div style={{ padding: '24px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 10, border: '1px dashed #cbd5e1' }}>
                      <Users size={28} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                      <h5 style={{ margin: '0 0 4px', fontSize: '0.9375rem', color: '#334155' }}>
                        {employeeSearch ? 'No employees match your search query.' : 'No employees added yet.'}
                      </h5>
                      <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: '#64748b' }}>
                        {employeeSearch
                          ? 'Try clearing your search keyword or selecting a different department.'
                          : 'Add your team members to generate structured offer letters in one click.'}
                      </p>
                      <Button
                        variant="secondary"
                        icon={<UserPlus size={14} />}
                        onClick={() => setIsAddEmployeeModalOpen(true)}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        + Add New Employee
                      </Button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: 12,
                        maxHeight: 250,
                        overflowY: 'auto',
                        paddingRight: 4,
                      }}
                    >
                      {filteredEmployees.map((emp) => {
                        const isSelected = selectedEmployeeId === emp.id;
                        const numericCtc = Number(emp.annualCtc) || 0;
                        const formattedCtc = numericCtc > 0 ? new Intl.NumberFormat('en-IN').format(numericCtc) : null;

                        return (
                          <div
                            key={emp.id}
                            onClick={() => handleSelectEmployee(emp)}
                            style={{
                              position: 'relative',
                              padding: '12px 14px',
                              borderRadius: 10,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              border: isSelected ? '2px solid #a35d39' : '1px solid #e2e8f0',
                              backgroundColor: isSelected ? '#fdfbf9' : '#ffffff',
                              boxShadow: isSelected ? '0 4px 12px rgba(163, 93, 57, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                            }}
                          >
                            {/* Selected Badge */}
                            {isSelected && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 3,
                                  backgroundColor: '#a35d39',
                                  color: '#ffffff',
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: 12,
                                }}
                              >
                                <Check size={11} />
                                Selected
                              </div>
                            )}

                            {/* Top row: Avatar + Name + ID */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, paddingRight: isSelected ? 65 : 0 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  backgroundColor: isSelected ? '#a35d39' : '#334155',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.8125rem',
                                  flexShrink: 0,
                                }}
                              >
                                {emp.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    color: isSelected ? '#a35d39' : '#0f172a',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {emp.fullName}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontWeight: 600 }}>{emp.employeeId || 'EMP'}</span>
                                  <span>•</span>
                                  <span>{emp.department || 'General'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Designation */}
                            <div style={{ fontSize: '0.75rem', color: '#334155', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                              <Briefcase size={12} color="#64748b" style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                                {emp.designation || 'Staff'}
                              </span>
                            </div>

                            {/* Annual CTC and Location */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.71875rem', color: '#64748b', marginTop: 6, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#0f172a' }}>
                                <DollarSign size={12} color="#16a34a" />
                                {formattedCtc ? `₹${formattedCtc}` : 'Not Specified'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={11} color="#94a3b8" />
                                <span style={{ maxWidth: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {emp.workLocation || 'Remote'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Banner */}
                  {selectedEmployee && (
                    <div
                      style={{
                        backgroundColor: '#fdfbf9',
                        border: '1px solid #e2d3ca',
                        borderRadius: 8,
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={16} color="#a35d39" />
                        <span style={{ fontSize: '0.8125rem', color: '#334155' }}>
                          Generating Letter for: <strong style={{ color: '#0f172a' }}>{selectedEmployee.fullName}</strong> ({selectedEmployee.employeeId}) &ndash; <strong>{selectedEmployee.designation}</strong> ({selectedEmployee.department})
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#854d0e', backgroundColor: '#fef08a', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                        Auto-Filled Below
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* 2. DYNAMIC VALUES REVIEW & CUSTOMIZER FORM */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, overflow: 'hidden' }}>
                {/* Section Header with Collapse Toggle */}
                <div
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                  style={{
                    padding: '14px 20px',
                    backgroundColor: '#f8fafc',
                    borderBottom: isDetailsExpanded ? '1px solid #e2e8f0' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Edit3 size={15} color="#a35d39" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Review &amp; Customize Dynamic Values
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      (Letterhead placeholders &amp; Annexure I &amp; III)
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#64748b' }}>
                    <span>{isDetailsExpanded ? 'Hide Fields' : 'Show / Edit Fields'}</span>
                    {isDetailsExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                {isDetailsExpanded && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>
                          Salutation
                        </label>
                        <select
                          className="form-input"
                          value={values['salutation'] || 'Mr.'}
                          onChange={(e) => setValues({ ...values, salutation: e.target.value })}
                        >
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Dr.">Dr.</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>
                          Employee Full Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Aarav Sharma"
                            value={values['employee_name'] || ''}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                employee_name: e.target.value,
                                candidate_name: e.target.value,
                              })
                            }
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>
                          Designation / Role Title <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Briefcase size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Senior Platform Engineer"
                            value={values['designation'] || ''}
                            onChange={(e) => setValues({ ...values, designation: e.target.value })}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Department</label>
                        <div style={{ position: 'relative' }}>
                          <Building2 size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Platform Engineering"
                            value={values['department'] || ''}
                            onChange={(e) => setValues({ ...values, department: e.target.value })}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>
                          Annual CTC (INR) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <DollarSign size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 18,00,000"
                            value={values['annual_ctc'] || ''}
                            onChange={(e) => handleCtcChange(e.target.value)}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Work Location &amp; Model</label>
                        <div style={{ position: 'relative' }}>
                          <MapPin size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. Remote / On-site / Hybrid"
                            value={values['work_location'] || ''}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                work_location: e.target.value,
                                location: e.target.value,
                              })
                            }
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </div>

                      {/* Salary Breakdown (Annexure III) Preview & Customizer */}
                      <div
                        style={{
                          gridColumn: '1 / -1',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: 16,
                          marginTop: 4,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                            Annexure III &ndash; Salary Breakdown (Auto-Calculated)
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Formula: Basic (40%), HRA (20%), Special Allowance (Balance)
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Monthly CTC</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              value={values['ctc_per_month'] || ''}
                              onChange={(e) => setValues({ ...values, ctc_per_month: e.target.value, gross_monthly: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Basic Salary (40%)</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              value={values['basic_salary'] || ''}
                              onChange={(e) => setValues({ ...values, basic_salary: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>HRA (20%)</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              value={values['hra'] || ''}
                              onChange={(e) => setValues({ ...values, hra: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Special Allowance</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              value={values['special_allowance'] || ''}
                              onChange={(e) => setValues({ ...values, special_allowance: e.target.value })}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Employer Contrib.</label>
                            <input
                              type="text"
                              className="form-input"
                              style={{ fontSize: '12px', padding: '6px 10px' }}
                              value={values['employer_contributions'] || 'NA'}
                              onChange={(e) => setValues({ ...values, employer_contributions: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Date of Joining</label>
                        <div style={{ position: 'relative' }}>
                          <Calendar size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="DD/MM/YYYY"
                            value={values['joining_date'] || ''}
                            onChange={(e) => setValues({ ...values, joining_date: e.target.value })}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Offer Validity Date</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="DD/MM/YYYY"
                          value={values['offer_validity_date'] || ''}
                          onChange={(e) => setValues({ ...values, offer_validity_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Probation Period</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 6 Months"
                          value={values['probation_period'] || '6 Months'}
                          onChange={(e) => setValues({ ...values, probation_period: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Notice Period</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 45 days"
                          value={values['notice_period'] || '45 days'}
                          onChange={(e) => setValues({ ...values, notice_period: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Reporting Manager</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Sheetal Bedi (CEO & Founder)"
                          value={values['reporting_manager'] || 'Sheetal Bedi (CEO & Founder)'}
                          onChange={(e) => setValues({ ...values, reporting_manager: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="form-label" style={{ fontWeight: 700 }}>Working Days / Shift</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="6 working days and a 9-hour shift"
                          value={values['working_days_shift'] || '6 working days and a 9-hour shift (may vary depending on business requirements)'}
                          onChange={(e) => setValues({ ...values, working_days_shift: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: STRUCTURE-WISE MULTI-PAGE DOCUMENT PREVIEW (EXACT MATCH TO SCREENSHOTS!) */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Top Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#059669' }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Document Formatted in Structure-Wise TaskNera Pages
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                    Ref: <strong>{values['reference_number']}</strong> • Employee: <strong>{values['employee_name']}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Highlight Placeholders Toggle */}
                  <button
                    type="button"
                    onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.8125rem',
                      background: highlightPlaceholders ? '#fef08a' : '#ffffff',
                      color: highlightPlaceholders ? '#854d0e' : '#475569',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <Highlighter size={14} />
                    <span>{highlightPlaceholders ? 'Yellow Highlights: ON' : 'Yellow Highlights: OFF'}</span>
                  </button>

                  <Button
                    variant="secondary"
                    icon={copied ? <Check size={14} /> : <Copy size={14} />}
                    onClick={handleCopyText}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {copied ? 'Copied!' : 'Copy Text'}
                  </Button>

                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem', background: '#a35d39', borderColor: '#a35d39' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="secondary"
                    icon={<Printer size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Print
                  </Button>

                  <Button
                    variant="secondary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <ShieldCheck size={14} />}
                    onClick={handleSaveToPipeline}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Pipeline'}
                  </Button>
                </div>
              </div>

              {/* MULTI-PAGE PRINTABLE CONTAINER (EXACT 11-PAGE OFFICIAL TASKNERA CONTRACT) */}
              <div id="printable-offer-document" className="printable-letterhead-paper">
                {/* ========================================================
                    PAGE 1: LETTERHEAD BANNER, TOP META, CLAUSES 1 TO 5 (PART 1)
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  {/* Official TaskNera Top Header Banner */}
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ width: 280, height: 16, background: '#fae1c3', borderRadius: '0 0 14px 0' }}></div>
                      <div style={{ width: 220, height: 7, background: '#9c7a82' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src="/logo.png" alt="TaskNera" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div
                            style={{
                              fontSize: '24px',
                              fontWeight: 800,
                              letterSpacing: '-0.02em',
                              lineHeight: 1.1,
                              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                            }}
                          >
                            <span style={{ color: '#252c38' }}>Task</span>
                            <span style={{ color: '#f56637' }}>Nera</span>
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#475569',
                              letterSpacing: '0.02em',
                              marginTop: 2,
                              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                            }}
                          >
                            People. Processes. Performance.
                          </div>
                        </div>
                      </div>
                      <div style={{ borderLeft: '2px solid #0f172a', paddingLeft: 14, fontSize: '11px', lineHeight: 1.5, color: '#1e293b' }}>
                        <div><strong>Phone:</strong> +91 7065278229</div>
                        <div><strong>Email:</strong> careers@tasknera.com</div>
                        <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
                      </div>
                    </div>
                    <div style={{ height: 2.5, background: '#1e293b', width: '100%' }}></div>
                  </div>

                  {/* Top Metadata */}
                  <div style={{ fontSize: '12.8px', lineHeight: 1.6, marginBottom: 14, color: '#1e293b' }}>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Reference:</strong>{' '}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightPlaceholders
                            ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['reference_number']}</mark>`
                            : values['reference_number'],
                        }}
                      />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Date:</strong>{' '}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightPlaceholders
                            ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['date']}</mark>`
                            : values['date'],
                        }}
                      />
                    </p>
                    <p style={{ margin: '8px 0 2px' }}>
                      <strong>Employee Name:</strong>{' '}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightPlaceholders
                            ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['employee_name']}</mark>`
                            : values['employee_name'],
                        }}
                      />
                    </p>
                    <p style={{ margin: '2px 0' }}>
                      <strong>Designation:</strong>{' '}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: highlightPlaceholders
                            ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['designation']}</mark>`
                            : values['designation'],
                        }}
                      />
                    </p>
                  </div>

                  {/* Centered Brown Title */}
                  <h2
                    style={{
                      textAlign: 'center',
                      fontSize: '21px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '14px 0 12px',
                      fontFamily: "'Georgia', serif",
                      letterSpacing: '0.02em',
                    }}
                  >
                    {docTitle}
                  </h2>

                  {/* Salutation & Subject */}
                  <p style={{ marginBottom: 8, fontSize: '12.8px', color: '#1e293b' }}>
                    Dear{' '}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightPlaceholders
                          ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['salutation']}</mark>`
                          : values['salutation'],
                      }}
                    />{' '}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightPlaceholders
                          ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${(values['employee_name'] || '').replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, '')}</mark>`
                          : (values['employee_name'] || '').replace(/^(?:Mr\.|Ms\.|Mrs\.|Dr\.)\s+/i, ''),
                      }}
                    />
                    ,
                  </p>

                  <p style={{ marginBottom: 10, fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                    {subjectText}
                  </p>

                  <p
                    style={{ marginBottom: 14, fontSize: '12.8px', lineHeight: 1.65, textAlign: 'justify', color: '#334155' }}
                    dangerouslySetInnerHTML={{ __html: interpolateText(introParagraph, highlightPlaceholders) }}
                  />

                  {/* Sections 1 to 4 */}
                  {sections.slice(0, 4).map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 14 }}>
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 3,
                          marginBottom: 5,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sec.number}. {sec.title}
                      </h3>
                      {sec.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{
                            fontSize: '12.8px',
                            lineHeight: 1.65,
                            color: '#334155',
                            marginBottom: pIdx === sec.paragraphs.length - 1 ? 0 : 6,
                            textAlign: 'justify',
                          }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Section 5: Compensation and Payroll */}
                  {sections[4] && (
                    <div style={{ marginBottom: 14 }}>
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 3,
                          marginBottom: 5,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sections[4].number}. {sections[4].title}
                      </h3>
                      {sections[4].paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{
                            fontSize: '12.8px',
                            lineHeight: 1.65,
                            color: '#334155',
                            marginBottom: pIdx === sections[4].paragraphs.length - 1 ? 0 : 6,
                            textAlign: 'justify',
                          }}
                          dangerouslySetInnerHTML={{
                            __html: interpolateText(p, highlightPlaceholders),
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Page 1 Footer */}
                  <TaskNeraFooter pageNum={1} />
                </div>

                {/* ========================================================
                    PAGE 2: SECONDARY HEADER, SECTION 6 (CODE OF CONDUCT), SECTION 7 (DISCIPLINARY)
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Section 6: Code of Conduct – Zero Tolerance */}
                  {sections[5] && (
                    <div style={{ marginBottom: 16 }}>
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 3,
                          marginBottom: 5,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sections[5].number}. {sections[5].title}
                      </h3>
                      {sections[5].paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{ fontSize: '12.8px', lineHeight: 1.65, color: '#334155', marginBottom: 6, textAlign: 'justify' }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                      {sections[5].bullets && (
                        <ul style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, paddingLeft: 22, margin: '6px 0 8px' }}>
                          {sections[5].bullets.map((b, bIdx) => (
                            <li key={bIdx} style={{ marginBottom: 3 }}>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {sections[5].footnote && (
                        <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: '4px 0 0' }}>
                          {sections[5].footnote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Section 7: Disciplinary Action & Misconduct */}
                  {sections[6] && (
                    <div style={{ marginBottom: 14 }}>
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 3,
                          marginBottom: 5,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sections[6].number}. {sections[6].title}
                      </h3>
                      {sections[6].paragraphs.slice(0, 3).map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{ fontSize: '12.8px', lineHeight: 1.65, color: '#334155', marginBottom: 6, textAlign: 'justify' }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                      <div style={{ marginTop: 10 }}>
                        <p style={{ fontWeight: 700, fontSize: '12.8px', color: '#0f172a', margin: '4px 0' }}>
                          Salary and dues on termination:
                        </p>
                        <p style={{ fontSize: '12.8px', lineHeight: 1.65, color: '#334155', margin: 0, textAlign: 'justify' }}>
                          Termination for misconduct does not, by itself, extinguish wages or other statutory/contractual amounts that have already been legally earned. The Company will pay amounts legally due for work/attendance up to the effective date of separation, subject to lawful deductions, statutory adjustments, recoveries permitted by law, and applicable payroll/F&amp;F procedures. No provision of this Offer Letter shall be interpreted as waiving an employee's non-waivable statutory rights.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Page 2 Footer */}
                  <TaskNeraFooter pageNum={2} />
                </div>

                {/* ========================================================
                    PAGE 3: SECONDARY HEADER, CLAUSES 8, 9, 10, 11, 12
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Sections 8 to 12 */}
                  {sections.slice(7, 12).map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 14 }}>
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 3,
                          marginBottom: 6,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sec.number}. {sec.title}
                      </h3>
                      {sec.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{
                            fontSize: '12.5px',
                            lineHeight: 1.6,
                            color: '#334155',
                            marginBottom: pIdx === sec.paragraphs.length - 1 ? 0 : 6,
                            textAlign: 'justify',
                          }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Page 3 Footer */}
                  <TaskNeraFooter pageNum={3} />
                </div>

                {/* ========================================================
                    PAGE 4: SECONDARY HEADER, CLAUSES 13, 14, 15, 16, 17, 18
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Sections 13 to 18 */}
                  {sections.slice(12, 18).map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 16 }}>
                      <h3
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 3,
                          marginBottom: 6,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sec.number}. {sec.title}
                      </h3>
                      {sec.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{
                            fontSize: '12.5px',
                            lineHeight: 1.6,
                            color: '#334155',
                            marginBottom: pIdx === sec.paragraphs.length - 1 ? 0 : 6,
                            textAlign: 'justify',
                          }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Page 4 Footer */}
                  <TaskNeraFooter pageNum={4} />
                </div>

                {/* ========================================================
                    PAGE 5: SECONDARY HEADER, DUAL SIGNATURES BLOCK
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  <div style={{ marginTop: 20 }}>
                    <div style={{ marginBottom: 44 }}>
                      <p style={{ fontWeight: 700, color: '#a35d39', fontSize: '14px', margin: '0 0 24px', fontFamily: "'Georgia', serif" }}>
                        For TaskNera
                      </p>
                      <div style={{ width: 300, borderBottom: '1px solid #334155', marginBottom: 12 }}></div>
                      <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#1e293b' }}>
                        <div><strong>Name:</strong> Sheetal Bedi</div>
                        <div><strong>Designation:</strong> CEO &amp; Founder</div>
                        <div>
                          <strong>Date:</strong>{' '}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightPlaceholders
                                ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['date']}</mark>`
                                : values['date'],
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontWeight: 700, color: '#a35d39', fontSize: '14px', margin: '0 0 24px', fontFamily: "'Georgia', serif" }}>
                        Accepted and Agreed by Employee
                      </p>
                      <div style={{ width: 300, borderBottom: '1px solid #334155', marginBottom: 12 }}></div>
                      <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#1e293b' }}>
                        <div>
                          <strong>Name:</strong>{' '}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightPlaceholders
                                ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['employee_name']}</mark>`
                                : values['employee_name'],
                            }}
                          />
                        </div>
                        <div><strong>Signature:</strong> ___________________________________</div>
                        <div><strong>Date:</strong> ___________________________________</div>
                      </div>
                    </div>
                  </div>

                  {/* Page 5 Footer */}
                  <TaskNeraFooter pageNum={5} />
                </div>

                {/* ========================================================
                    PAGE 6: SECONDARY HEADER, ANNEXURE I (EMPLOYEE INFO & JOINING DETAILS)
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Annexure I Title */}
                  <h3
                    style={{
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '10px 0 20px',
                      fontFamily: "'Georgia', serif",
                      letterSpacing: '0.02em',
                    }}
                  >
                    Annexure I &ndash; Employee Information &amp; Joining Details
                  </h3>

                  {/* 10-Row Schedule Table */}
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginBottom: 24,
                      fontSize: '12.5px',
                      border: '1px solid #dfcfc7',
                    }}
                  >
                    <tbody>
                      {annexureRows.map((row, rIdx) => {
                        const cellVal = values[row.key] || row.defaultValue;
                        return (
                          <tr key={rIdx} style={{ borderBottom: '1px solid #dfcfc7' }}>
                            <td
                              style={{
                                padding: '9px 14px',
                                fontWeight: 700,
                                color: '#334155',
                                width: '34%',
                                background: '#fdfbf9',
                                borderRight: '1px solid #dfcfc7',
                              }}
                            >
                              {row.label}
                            </td>
                            <td style={{ padding: '9px 14px', color: '#0f172a' }}>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: highlightPlaceholders
                                    ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${cellVal}</mark>`
                                    : cellVal,
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mandatory Joining Documents */}
                  <h4
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '18px 0 10px',
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    Mandatory Joining Documents
                  </h4>
                  <ul style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.65, paddingLeft: 22, margin: '0 0 24px' }}>
                    {MANDATORY_DOCS.map((doc, dIdx) => (
                      <li key={dIdx} style={{ marginBottom: 4 }}>
                        {doc}
                      </li>
                    ))}
                  </ul>

                  {/* Page 6 Footer */}
                  <TaskNeraFooter pageNum={6} />
                </div>

                {/* ========================================================
                    PAGE 7: SECONDARY HEADER, ANNEXURE III (COMPENSATION STRUCTURE)
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Annexure III Title */}
                  <h3
                    style={{
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '10px 0 24px',
                      fontFamily: "'Georgia', serif",
                      letterSpacing: '0.02em',
                    }}
                  >
                    Annexure III &ndash; Compensation Structure
                  </h3>

                  {/* Compensation Table */}
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginBottom: 24,
                      fontSize: '13px',
                      border: '1px solid #dfcfc7',
                    }}
                  >
                    <tbody>
                      {[
                        { label: 'Basic Salary', val: values['basic_salary'] || '60,000', prefix: 'INR ' },
                        { label: 'HRA', val: values['hra'] || '30,000', prefix: 'INR ' },
                        { label: 'Special / Other Allowance', val: values['special_allowance'] || '60,000', prefix: 'INR ' },
                        { label: 'Gross Monthly Salary', val: values['gross_monthly'] || '1,50,000', prefix: 'INR ' },
                        { label: 'Employer Contributions', val: values['employer_contributions'] || 'NA', prefix: '' },
                        { label: 'Total Fixed CTC (Per Month)', val: values['ctc_per_month'] || '1,50,000', prefix: 'INR ' },
                        { label: 'Total Fixed CTC (Per Annum)', val: values['annual_ctc'] || '18,00,000', prefix: 'INR ' },
                      ].map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #dfcfc7' }}>
                          <td
                            style={{
                              padding: '10px 16px',
                              fontWeight: 700,
                              color: '#334155',
                              width: '45%',
                              background: '#fdfbf9',
                              borderRight: '1px solid #dfcfc7',
                            }}
                          >
                            {item.label}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#0f172a' }}>
                            {item.prefix}
                            <span
                              dangerouslySetInnerHTML={{
                                __html: highlightPlaceholders
                                  ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${item.val}</mark>`
                                  : item.val,
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Compensation Note */}
                  <p style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.6, fontStyle: 'italic', margin: '0 0 20px', textAlign: 'justify' }}>
                    Note: Salary, statutory contributions, deductions, incentives/bonuses and benefits, if any, will be administered in accordance with the applicable compensation plan, Company policy and law. Any performance-linked incentive is payable only when the applicable eligibility and performance conditions are satisfied.
                  </p>

                  {/* Page 7 Footer */}
                  <TaskNeraFooter pageNum={7} />
                </div>

                {/* ========================================================
                    PAGE 8: SECONDARY HEADER, ANNEXURE - CONFIDENTIALITY, NDA & IP AGREEMENT (CLAUSES 1 TO 5 START)
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* IP Agreement Header Title */}
                  <h3
                    style={{
                      textAlign: 'center',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '10px 0 20px',
                      fontFamily: "'Georgia', serif",
                      letterSpacing: '0.02em',
                    }}
                  >
                    Annexure &ndash; Confidentiality, Non-Disclosure &amp; Intellectual Property Agreement
                  </h3>

                  {/* Clause 1 */}
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      1. Purpose and Scope
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      This Annexure forms an integral part of the TaskNera engagement document and applies to all confidential information, work product, project materials, inventions, developments and other intellectual property accessed, conceived, created, developed, authored, designed, tested or reduced to practice by the Intern/Employee in connection with TaskNera, its clients, candidates, vendors, operations, products, services or assigned work.
                    </p>
                  </div>

                  {/* Clause 2 */}
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      2. Confidential Information
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      &ldquo;Confidential Information&rdquo; means all non-public information disclosed or made available by TaskNera, whether oral, written, electronic, visual or otherwise, including business plans, pricing, proposals, client and candidate information, databases, credentials, processes, SOPs, financial information, source code, software, algorithms, product plans, designs, prompts, models, datasets, reports, templates, strategies, trade secrets, know-how and information marked or reasonably understood to be confidential.
                    </p>
                  </div>

                  {/* Clause 3 */}
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      3. Non-Disclosure and Restricted Use
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      The Intern/Employee shall use Confidential Information solely for authorised TaskNera work and shall not disclose, copy, publish, upload, sell, licence, transfer, reproduce, reverse engineer, exploit or otherwise make it available to any unauthorised person or third party. Confidential Information shall not be uploaded to personal cloud storage, public repositories, generative-AI tools or other third-party services unless expressly authorised in writing by TaskNera.
                    </p>
                  </div>

                  {/* Clause 4 */}
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      4. TaskNera Project Work Product and Intellectual Property Ownership
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 6, textAlign: 'justify' }}>
                      All Work Product created, developed, authored, designed, coded, documented, researched, tested or otherwise produced by the Intern/Employee, individually or jointly with others, during the engagement that (a) is created in the course of or in connection with assigned duties or projects; (b) relates to TaskNera's actual or reasonably contemplated business, products, services, operations or projects; (c) uses TaskNera Confidential Information, systems, equipment, data, materials or resources; or (d) is specifically commissioned or requested by TaskNera (collectively, &ldquo;TaskNera Project IP&rdquo;), shall be the exclusive property of TaskNera to the fullest extent permitted by applicable law.
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a', margin: '6px 0 2px' }}>
                      TaskNera Project IP includes:
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#475569', margin: 0, textAlign: 'justify' }}>
                      Software, source code, object code, scripts, websites, applications, product features, workflows, automations, databases, datasets, documentation, UI/UX designs, graphics, content, reports, research, analyses, recruitment tools, ATS/HR technology, AI prompts and configurations, models or model-related materials, business processes, inventions, discoveries, improvements, methods, concepts, specifications and prototypes.
                    </p>
                  </div>

                  {/* Clause 5 (Start) */}
                  <div style={{ marginBottom: 10 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      5. Assignment of Rights
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 6, textAlign: 'justify' }}>
                      To the extent any rights in TaskNera Project IP do not automatically vest in TaskNera, the Intern/Employee hereby assigns and agrees to assign to TaskNera, on creation and without further payment except where mandatory law requires otherwise, all transferable rights, title and interest in and to such TaskNera Project IP, including copyright and other intellectual-property rights, for the full period and throughout the world, to the extent legally assignable. The parties intend this clause to constitute a written assignment of rights in present and future works to the extent permitted by applicable law.
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      The remuneration/stipend and other consideration stated in the principal engagement document shall constitute consideration for the services and this assignment, subject always to any mandatory statutory right to royalty,
                    </p>
                  </div>

                  {/* Page 8 Footer */}
                  <TaskNeraFooter pageNum={8} />
                </div>

                {/* ========================================================
                    PAGE 9: SECONDARY HEADER, CLAUSE 5 (CONT), CLAUSES 6, 7, 8, 9, 10 (START)
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Clause 5 Continued */}
                  <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 8, textAlign: 'justify' }}>
                    remuneration or other payment that cannot lawfully be waived. Where applicable law requires a separate form, instrument, registration or execution for an assignment, the Intern/Employee shall execute the required document.
                  </p>
                  <p style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a', margin: '6px 0 2px' }}>
                    Patentable inventions and registrable rights:
                  </p>
                  <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 14, textAlign: 'justify' }}>
                    The Intern/Employee shall promptly disclose relevant inventions or developments to TaskNera and execute reasonable documents required to confirm TaskNera's ownership or entitlement. Any patent assignment shall be documented and executed in the form required by applicable law. Nothing in this agreement removes any statutory right that cannot lawfully be assigned.
                  </p>

                  {/* Clause 6 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      6. No Personal or Commercial Rights in TaskNera Project IP
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      The Intern/Employee shall not claim ownership of, register, commercialise, licence, sell, publish, distribute, reuse or create a competing product from TaskNera Project IP, except with TaskNera's prior written permission. The Intern/Employee shall not represent to any person that he/she owns or controls TaskNera Project IP.
                    </p>
                  </div>

                  {/* Clause 7 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      7. Pre-Existing / Independent Materials
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      Intellectual property demonstrably owned by the Intern/Employee before the engagement and specifically identified in writing to TaskNera before it is used in a TaskNera project (&ldquo;Pre-Existing IP&rdquo;) remains the property of the Intern/Employee. If Pre-Existing IP is incorporated into TaskNera Project IP, the Intern/Employee grants TaskNera a perpetual, worldwide, transferable, sublicensable, royalty-free licence to use, reproduce, modify, distribute and commercialise that incorporated Pre-Existing IP to the extent necessary to use and exploit the resulting TaskNera Project IP.
                    </p>
                  </div>

                  {/* Clause 8 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      8. Disclosure of Developments
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      The Intern/Employee shall promptly disclose to TaskNera any invention, improvement, software, design, process, document, discovery or other development that may constitute TaskNera Project IP and shall provide reasonable assistance, during and after the engagement, for documentation, registration, protection or enforcement of TaskNera's rights, subject to reimbursement of reasonable out-of-pocket expenses where required by law.
                    </p>
                  </div>

                  {/* Clause 9 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      9. Return, Deletion and Certification
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      Upon TaskNera's request or on completion/termination of the engagement, the Intern/Employee shall return or permanently delete TaskNera Confidential Information and Company property, including copies held on personal devices or accounts, except where retention is required by law. TaskNera may request written confirmation of compliance.
                    </p>
                  </div>

                  {/* Clause 10 (Start) */}
                  <div style={{ marginBottom: 10 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      10. Social Media, Defamation and Protection of TaskNera Information
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 6, textAlign: 'justify' }}>
                      The Intern/Employee shall not knowingly publish, post, circulate, forward or communicate false, fabricated or materially misleading statements concerning TaskNera, its founders, directors, employees, clients, candidates, vendors, products, services, technology, operations or business, including through social media, websites, messaging platforms, review platforms or other public or private channels, where such conduct is unlawful or materially harms the Company or its legitimate business interests. Nothing in this clause restricts truthful statements, lawful complaints, reporting to regulators or law-enforcement authorities, participation in investigations, truthful evidence, protected disclosures, or any other right that cannot lawfully be waived. If unlawful defamation, impersonation, disclosure, publication, misuse of confidential information or other actionable conduct occurs, TaskNera may pursue civil, criminal, injunctive, contractual or other remedies available under applicable law, including recovery of proven losses where legally permitted.
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      Any unauthorised copying, extraction, transfer, publication, sale, licensing, commercialisation or misuse of TaskNera data, credentials, source code, databases, client/candidate information, intellectual property or Confidential Information
                    </p>
                  </div>

                  {/* Page 9 Footer */}
                  <TaskNeraFooter pageNum={9} />
                </div>

                {/* ========================================================
                    PAGE 10: SECONDARY HEADER, CLAUSE 10 (CONT), CLAUSES 11, 12, 13, 14, 15, 16
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Clause 10 Continued */}
                  <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 12, textAlign: 'justify' }}>
                    may constitute a material breach and may result in disciplinary action, termination and legal proceedings, subject to applicable law.
                  </p>

                  {/* Clause 11 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      11. No Personal or Commercial Use of Company Data
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      Company and client/candidate data, records, databases, credentials, source code, project materials and Confidential Information shall remain exclusively for authorised Company purposes. The Employee shall not retain, copy, download, transfer to personal accounts, upload to public repositories or external AI tools, sell, licence, publish, disclose or commercially exploit such information during or after employment.
                    </p>
                  </div>

                  {/* Clause 12 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      12. Duration and Survival
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      Confidentiality obligations apply during the engagement and for five (5) years after it ends; however, obligations relating to trade secrets and information that remains confidential under applicable law continue for so long as the information remains a trade secret or legally protected confidential information. Intellectual-property ownership and assignment provisions survive termination. Return, deletion, data-protection, confidentiality and enforcement obligations survive to the extent necessary to give them effect.
                    </p>
                  </div>

                  {/* Clause 13 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      13. No Waiver of Mandatory Rights
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      Nothing in this Annexure is intended to waive, restrict or contract out of any non-waivable right or obligation under applicable Indian law. If any provision is unenforceable, it shall be enforced to the maximum extent permitted by law and the remaining provisions shall continue.
                    </p>
                  </div>

                  {/* Clause 14 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      14. Lawful Recovery and Final Settlement
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      TaskNera may adjust or recover amounts only where a valid contractual, statutory or other lawful basis exists, including authorised advances, lawful notice-period recovery, or proven loss/damage where applicable. Any deduction from wages shall comply with applicable wage law, including statutory limits and procedural safeguards. TaskNera will not impose a blanket or punitive forfeiture of earned salary or statutory dues because of ZTP termination.
                    </p>
                  </div>

                  {/* Clause 15 */}
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      15. Data Protection, Cybersecurity and Personal Data
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      The Employee shall process personal data and other protected information only for authorised TaskNera purposes and in accordance with TaskNera's instructions, applicable data-protection law, information-security requirements and client requirements. The Employee shall use reasonable security measures, protect credentials, immediately report any suspected loss, unauthorised access, disclosure or data breach, and cooperate with TaskNera in containment, investigation, notification and remediation where required by law. The Employee shall not copy, export, scrape, photograph, screen-record, forward, download or transfer TaskNera, client, candidate or employee personal data to personal devices, personal accounts, removable media, public repositories or unauthorised third-party or AI services except where expressly authorised in writing or required by law.
                    </p>
                  </div>

                  {/* Clause 16 */}
                  <div style={{ marginBottom: 10 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      16. Remedies and Enforcement
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      A breach of confidentiality, intellectual-property, data-security, unauthorised-use or other material obligations may cause irreparable or difficult-to-quantify harm. Subject to applicable law, TaskNera may seek appropriate contractual, civil, injunctive, equitable, statutory or criminal remedies and recovery of proven losses, costs and expenses where legally recoverable. Nothing in this clause guarantees any particular remedy or prevents a court or competent authority from applying the remedy permitted by law.
                    </p>
                  </div>

                  {/* Page 10 Footer */}
                  <TaskNeraFooter pageNum={10} />
                </div>

                {/* ========================================================
                    PAGE 11: SECONDARY HEADER, CLAUSE 17, PRE-EXISTING IP DISCLOSURE, ACKNOWLEDGEMENT, DUAL SIGNATURES
                    ======================================================== */}
                <div className="document-page-sheet" style={{ display: 'flex', flexDirection: 'column', minHeight: '1120px' }}>
                  <TaskNeraSecondaryHeader />

                  {/* Clause 17 */}
                  <div style={{ marginBottom: 14 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 4px', fontFamily: "'Georgia', serif" }}>
                      17. Severability and No Waiver
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      If any provision is held invalid or unenforceable, it shall be modified or enforced to the maximum extent legally permissible and the remaining provisions shall continue in effect. A failure or delay by TaskNera to enforce any provision shall not constitute a waiver of that provision or any other right.
                    </p>
                  </div>

                  {/* Pre-Existing IP Disclosure */}
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 6px', fontFamily: "'Georgia', serif" }}>
                      Pre-Existing IP Disclosure
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', marginBottom: 10, textAlign: 'justify' }}>
                      Before using any pre-existing material in TaskNera work, the Employee must identify it in writing below. If no item is listed, the Employee represents that no pre-existing material owned by the Employee is being contributed to a TaskNera project, except ordinary general skills, knowledge and experience that do not embody TaskNera Confidential Information.
                    </p>

                    {/* Pre-Existing IP Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '12px',
                        border: '1px solid #dfcfc7',
                        marginBottom: 8,
                      }}
                    >
                      <thead>
                        <tr style={{ background: '#f6d5bf', borderBottom: '1px solid #dfcfc7' }}>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#431407', borderRight: '1px solid #dfcfc7' }}>
                            Description of Pre-Existing IP
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#431407', borderRight: '1px solid #dfcfc7' }}>
                            Date / Evidence of Prior Ownership
                          </th>
                          <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#431407' }}>
                            TaskNera Approval / Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 12px', color: '#1e293b', borderRight: '1px solid #dfcfc7' }}>None</td>
                          <td style={{ padding: '8px 12px', color: '#1e293b', borderRight: '1px solid #dfcfc7' }}>None</td>
                          <td style={{ padding: '8px 12px', color: '#1e293b' }}>None</td>
                        </tr>
                      </tbody>
                    </table>
                    <p style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: 0, textAlign: 'justify' }}>
                      Any material not disclosed before being incorporated into TaskNera work may be treated as TaskNera Project IP to the extent permitted by applicable law, subject to the rights that cannot lawfully be waived.
                    </p>
                  </div>

                  {/* Acknowledgement and Execution */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#a35d39', margin: '0 0 6px', fontFamily: "'Georgia', serif" }}>
                      Acknowledgement and Execution
                    </h4>
                    <p style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', margin: 0, textAlign: 'justify' }}>
                      The Employee confirms that this Annexure has been read, understood and accepted and forms an integral part of the TaskNera engagement terms.
                    </p>
                  </div>

                  {/* Dual Signatures */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ marginBottom: 30 }}>
                      <p style={{ fontWeight: 700, color: '#a35d39', fontSize: '13px', margin: '0 0 16px', fontFamily: "'Georgia', serif" }}>
                        For TaskNera
                      </p>
                      <div style={{ width: 260, borderBottom: '1px solid #334155', marginBottom: 8 }}></div>
                      <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                        <div><strong>Name:</strong> Sheetal Bedi</div>
                        <div><strong>Designation:</strong> CEO &amp; Founder</div>
                        <div>
                          <strong>Date:</strong>{' '}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightPlaceholders
                                ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['date']}</mark>`
                                : values['date'],
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p style={{ fontWeight: 700, color: '#a35d39', fontSize: '13px', margin: '0 0 16px', fontFamily: "'Georgia', serif" }}>
                        Accepted and Agreed by Employee
                      </p>
                      <div style={{ width: 260, borderBottom: '1px solid #334155', marginBottom: 8 }}></div>
                      <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#1e293b' }}>
                        <div>
                          <strong>Name:</strong>{' '}
                          <span
                            dangerouslySetInnerHTML={{
                              __html: highlightPlaceholders
                                ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['employee_name']}</mark>`
                                : values['employee_name'],
                            }}
                          />
                        </div>
                        <div><strong>Signature:</strong> ___________________________________</div>
                        <div><strong>Date:</strong> ___________________________________</div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <div style={{ width: 200, height: 10, background: '#9c7a82', borderRadius: '8px 8px 0 0' }}></div>
                  </div>

                  {/* Page 11 Footer */}
                  <TaskNeraFooter pageNum={11} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          {step > 1 ? (
            <Button
              variant="secondary"
              icon={<ArrowLeft size={16} />}
              onClick={() => setStep((step - 1) as any)}
            >
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step === 1 && (
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              onClick={() => setStep(2)}
              style={{ background: '#a35d39', borderColor: '#a35d39' }}
            >
              Continue to Member Details
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="primary"
              icon={<Sparkles size={16} />}
              onClick={() => {
                const candidateName = values['employee_name'] || '';
                if (!candidateName.trim()) {
                  error('Please choose an employee or enter the Employee Full Name.');
                  return;
                }
                setStep(3);
                success(`Letter generated for ${candidateName} in TaskNera structure!`);
              }}
              style={{ background: '#a35d39', borderColor: '#a35d39' }}
            >
              Generate into TaskNera Structure
            </Button>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="secondary"
                icon={<ArrowLeft size={15} />}
                onClick={() => setStep(2)}
              >
                Edit Member Details
              </Button>
              <Button
                variant="primary"
                onClick={onClose}
                style={{ background: '#0f172a', borderColor: '#0f172a' }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* On-the-fly Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <AddEmployeeModal
          isOpen={isAddEmployeeModalOpen}
          onClose={() => setIsAddEmployeeModalOpen(false)}
          onEmployeeAdded={async () => {
            setIsAddEmployeeModalOpen(false);
            success('Employee added successfully!');
            await loadEmployees();
          }}
        />
      )}
    </div>
  );
};
