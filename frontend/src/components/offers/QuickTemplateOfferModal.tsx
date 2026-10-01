import React, { useState, useRef, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { offerService } from '../../services/offerService.js';
import { useToast } from '../../context/ToastContext.js';

interface QuickTemplateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: any) => void;
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

// Default TaskNera 7-Section Legal Structure (From Official Contract)
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

export const QuickTemplateOfferModal: React.FC<QuickTemplateOfferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
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

  // Step 1 Editor sub-tab
  const [editorTab, setEditorTab] = useState<'structured' | 'smart_paste'>('structured');
  const [pastedText, setPastedText] = useState('');

  // Step 3 controls
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(true);
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
      notice_period: values['notice_period'] || '45 days',
      reporting_manager: values['reporting_manager'] || 'Sheetal Bedi (CEO & Founder)',
      employment_type: values['employment_type'] || 'Full-Time',
      working_days_shift: values['working_days_shift'] || '6 working days and a 9-hour shift (may vary depending on business requirements)',
      reference_number: values['reference_number'] || 'TASK/2026/102',
      date: values['date'] || '01/10/2026',
    };

    // Replace {{key}}
    for (const [k, v] of Object.entries(allMap)) {
      const val = v || '';
      const displayVal = highlight
        ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${val}</mark>`
        : `<strong>${val}</strong>`;
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
      [/\[9\]/gi, '9'],
      [/\[TASK\/YYYY\/000\]/gi, allMap.reference_number],
      [/\[DD\/MM\/YYYY\]/gi, allMap.date],
    ];

    for (const [pattern, val] of bracketReplacements) {
      const displayVal = highlight
        ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${val}</mark>`
        : `<strong>${val}</strong>`;
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

          {/* STEP 2: DYNAMIC MEMBER VARIABLES */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Step 2: Enter Member-Specific Dynamic Values
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    These fields will replace all bracketed tags (<code style={{ background: '#fef08a', color: '#854d0e', padding: '1px 4px', borderRadius: 3 }}>[Employee Full Name]</code>, <code style={{ background: '#fef08a', color: '#854d0e', padding: '1px 4px', borderRadius: 3 }}>[Designation]</code>, <code style={{ background: '#fef08a', color: '#854d0e', padding: '1px 4px', borderRadius: 3 }}>[Annual CTC]</code>) in the letterhead and Annexure I table.
                  </p>
                </div>

                {/* Auto-fill from resume button */}
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
              </div>

              {/* Form Grid */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: '20px' }}>
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
                        onChange={(e) =>
                          setValues({
                            ...values,
                            annual_ctc: e.target.value,
                            salary: e.target.value,
                          })
                        }
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

              {/* MULTI-PAGE PRINTABLE CONTAINER */}
              <div id="printable-offer-document" className="printable-letterhead-paper">
                {/* ========================================================
                    PAGE 1: LETTERHEAD BANNER, TOP META, CLAUSES 1 TO 5
                    ======================================================== */}
                <div className="document-page-sheet">
                  {/* Official TaskNera Top Header Banner */}
                  <div style={{ position: 'relative', marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ width: 280, height: 18, background: '#fae1c3', borderRadius: '0 0 14px 0' }}></div>
                      <div style={{ width: 220, height: 8, background: '#9c7a82' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src="/logo.png" alt="TaskNera" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                        <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                          TASKNERA
                        </span>
                      </div>
                      <div style={{ borderLeft: '2px solid #0f172a', paddingLeft: 14, fontSize: '11px', lineHeight: 1.5, color: '#1e293b' }}>
                        <div><strong>Phone:</strong> +91 7065278229</div>
                        <div><strong>Email:</strong> careers@tasknera.com</div>
                        <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
                      </div>
                    </div>
                    <div style={{ height: 3, background: '#1e293b', width: '100%' }}></div>
                  </div>

                  {/* Top Metadata */}
                  <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: 18, color: '#1e293b' }}>
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
                    <p style={{ margin: '12px 0 2px' }}>
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
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '24px 0 20px',
                      fontFamily: "'Georgia', serif",
                      letterSpacing: '0.02em',
                    }}
                  >
                    {docTitle}
                  </h2>

                  {/* Salutation & Subject */}
                  <p style={{ marginBottom: 12, fontSize: '13.5px', color: '#1e293b' }}>
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
                          ? `<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">${values['employee_name']}</mark>`
                          : values['employee_name'],
                      }}
                    />
                    ,
                  </p>

                  <p style={{ marginBottom: 14, fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                    {subjectText}
                  </p>

                  <p
                    style={{ marginBottom: 20, fontSize: '13px', lineHeight: 1.65, textAlign: 'justify', color: '#334155' }}
                    dangerouslySetInnerHTML={{ __html: interpolateText(introParagraph, highlightPlaceholders) }}
                  />

                  {/* Sections 1 to 5 */}
                  {sections.slice(0, 5).map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 18 }}>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 4,
                          marginBottom: 8,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sec.number}. {sec.title}
                      </h3>
                      {sec.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{
                            fontSize: '13px',
                            lineHeight: 1.65,
                            color: '#334155',
                            marginBottom: pIdx === sec.paragraphs.length - 1 ? 0 : 8,
                            textAlign: 'justify',
                          }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                    </div>
                  ))}

                  {/* Page 1 Footer */}
                  <div
                    style={{
                      marginTop: 36,
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 10,
                      textAlign: 'center',
                      fontSize: '11px',
                      color: '#94a3b8',
                    }}
                  >
                    TaskNera | Page 1 of 3
                  </div>
                </div>

                {/* ========================================================
                    PAGE 2: SECONDARY HEADER, CLAUSES 6 & 7, SIGNATURES
                    ======================================================== */}
                <div className="document-page-sheet">
                  {/* Official Secondary Page Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 12,
                      marginBottom: 20,
                      borderBottom: '1px solid #e2d3ca',
                    }}
                  >
                    <img src="/logo.png" alt="TaskNera" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#a35d39', fontFamily: 'Georgia, serif' }}>
                        TaskNera
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        D-57 F1 Dilshad Colony, Shahdara, Delhi &ndash; 110095
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Email: careers@tasknera.com
                      </div>
                    </div>
                  </div>

                  {/* Sections 6 & 7 */}
                  {sections.slice(5).map((sec) => (
                    <div key={sec.id} style={{ marginBottom: 20 }}>
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#a35d39',
                          borderBottom: '1px solid #e2d3ca',
                          paddingBottom: 4,
                          marginBottom: 8,
                          fontFamily: "'Georgia', serif",
                        }}
                      >
                        {sec.number}. {sec.title}
                      </h3>
                      {sec.paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          style={{
                            fontSize: '13px',
                            lineHeight: 1.65,
                            color: '#334155',
                            marginBottom: 8,
                            textAlign: 'justify',
                          }}
                          dangerouslySetInnerHTML={{ __html: interpolateText(p, highlightPlaceholders) }}
                        />
                      ))}
                      {sec.bullets && (
                        <ul style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.65, paddingLeft: 22, margin: '6px 0 10px' }}>
                          {sec.bullets.map((b, bIdx) => (
                            <li key={bIdx} style={{ marginBottom: 4 }}>
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                      {sec.footnote && (
                        <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                          {sec.footnote}
                        </p>
                      )}
                    </div>
                  ))}

                  {/* Dual Signatures Block */}
                  <div style={{ marginTop: 36, marginBottom: 28 }}>
                    <div style={{ marginBottom: 36 }}>
                      <p style={{ fontWeight: 700, color: '#a35d39', fontSize: '14px', margin: '0 0 20px', fontFamily: "'Georgia', serif" }}>
                        For TaskNera
                      </p>
                      <div style={{ width: 280, borderBottom: '1px solid #334155', marginBottom: 10 }}></div>
                      <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: '#1e293b' }}>
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
                      <p style={{ fontWeight: 700, color: '#a35d39', fontSize: '14px', margin: '0 0 20px', fontFamily: "'Georgia', serif" }}>
                        Accepted and Agreed by Employee
                      </p>
                      <div style={{ width: 280, borderBottom: '1px solid #334155', marginBottom: 10 }}></div>
                      <div style={{ fontSize: '12.5px', lineHeight: 1.6, color: '#1e293b' }}>
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

                  {/* Page 2 Footer */}
                  <div
                    style={{
                      marginTop: 36,
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 10,
                      textAlign: 'center',
                      fontSize: '11px',
                      color: '#94a3b8',
                    }}
                  >
                    TaskNera | Page 2 of 3
                  </div>
                </div>

                {/* ========================================================
                    PAGE 3: ANNEXURE I TABLE & MANDATORY JOINING DOCUMENTS
                    ======================================================== */}
                <div className="document-page-sheet">
                  {/* Official Secondary Page Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 12,
                      marginBottom: 20,
                      borderBottom: '1px solid #e2d3ca',
                    }}
                  >
                    <img src="/logo.png" alt="TaskNera" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#a35d39', fontFamily: 'Georgia, serif' }}>
                        TaskNera
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        D-57 F1 Dilshad Colony, Shahdara, Delhi &ndash; 110095
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Email: careers@tasknera.com
                      </div>
                    </div>
                  </div>

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
                      fontSize: '13px',
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
                                padding: '10px 14px',
                                fontWeight: 700,
                                color: '#334155',
                                width: '34%',
                                background: '#fdfbf9',
                                borderRight: '1px solid #dfcfc7',
                              }}
                            >
                              {row.label}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#0f172a' }}>
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
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#a35d39',
                      margin: '22px 0 10px',
                      fontFamily: "'Georgia', serif",
                    }}
                  >
                    Mandatory Joining Documents
                  </h4>
                  <ul style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.65, paddingLeft: 22, margin: '0 0 28px' }}>
                    {MANDATORY_DOCS.map((doc, dIdx) => (
                      <li key={dIdx} style={{ marginBottom: 4 }}>
                        {doc}
                      </li>
                    ))}
                  </ul>

                  {/* Official Bottom Bar Accent */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                    <div style={{ width: 220, height: 14, background: '#9c7a82', borderRadius: '10px 10px 0 0' }}></div>
                  </div>

                  {/* Page 3 Footer */}
                  <div
                    style={{
                      marginTop: 20,
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 10,
                      textAlign: 'center',
                      fontSize: '11px',
                      color: '#94a3b8',
                    }}
                  >
                    TaskNera | Page 3 of 3
                  </div>
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
                  error('Please enter the Employee Full Name.');
                  return;
                }
                setStep(3);
                success('Letter generated into structure-wise TaskNera pages!');
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
    </div>
  );
};
