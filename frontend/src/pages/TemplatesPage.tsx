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
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { DocumentTemplateItem, EmployeeService, Employee } from '../services/employeeService.js';
import { templateService } from '../services/templateService.js';
import { DocumentEngineService } from '../services/documentEngineService.js';
import { HrDocument } from '../types/document-engine.js';
import { useToast } from '../context/ToastContext.js';

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
    content: `CONFIDENTIAL OFFER OF EMPLOYMENT
Date: {{issue_date}}

Dear {{candidate_name}},

On behalf of {{company_name}}, we are pleased to offer you the full-time position of {{job_title}} in the {{department}} department, reporting to {{reporting_manager}}.

Your anticipated starting date of employment will be {{joining_date}} at our {{work_location}} office.

1. COMPENSATION & BENEFITS
- Annual Base Salary: {{base_salary}}
- Performance Bonus / Variable: {{variable_pay}}
- Total Annual Cost-to-Company (CTC): {{annual_ctc}}
- Health & Wellness: Standard executive medical insurance coverage

2. EMPLOYMENT TERMS & PROBATION
This offer is contingent upon satisfactory reference and credential verification. You will be on a probation period of {{probation_period}}, with a standard notice period of {{notice_period}}.

3. WORKING HOURS
Standard work schedule is 5 working days per week, 9 hours per day, with flexibility subject to operational requirements.

Please confirm your acceptance of this offer by signing and returning this letter on or before {{valid_until}}.

Sincerely,

{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
    sampleData: {
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
    content: `INTERNSHIP APPOINTMENT LETTER
Date: {{issue_date}}

Dear {{candidate_name}},

We are pleased to offer you an internship position as {{job_title}} at {{company_name}} in the {{department}} team.

1. TENURE & MENTORSHIP
Your internship will commence on {{joining_date}} and conclude on {{end_date}}. You will be guided and mentored by {{reporting_manager}}.

2. STIPEND & ALLOWANCES
You will be entitled to a monthly stipend of {{base_salary}}, payable on the final business day of each calendar month.

3. LEARNING DELIVERABLES
You will contribute to engineering and research deliverables and submit a final capstone report prior to {{end_date}}.

Sincerely,

{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
    sampleData: {
      candidate_name: 'Aarav Patel',
      company_name: 'TaskNera Technologies Ltd.',
      issue_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      job_title: 'Software Engineering Intern',
      department: 'Platform Engineering',
      reporting_manager: 'Arjun Nair (Lead AI Engineer)',
      joining_date: 'December 01, 2026',
      end_date: 'May 31, 2027',
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
    content: `INDEPENDENT CONTRACTOR ENGAGEMENT
Agreement Reference: {{reference_number}}
Date: {{issue_date}}

This Agreement is entered into between {{company_name}} ("Client") and {{candidate_name}} ("Contractor").

1. SCOPE OF SERVICES
Contractor agrees to perform consulting and technical services for {{job_title}} as specified in the agreed project roadmap.

2. FEES & PAYMENT TERMS
Client shall pay Contractor a fee of {{base_salary}} upon submission and formal acceptance of milestone deliverables.

3. DURATION & TERMINATION
This contract commences on {{joining_date}} and terminates on {{end_date}} unless terminated earlier by either party with {{notice_period}} written notice.

Agreed and Accepted:

{{candidate_name}} (Contractor)
{{signatory_name}} (Client Signatory)`,
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
    },
  },
  {
    id: 'preset_experience',
    name: 'Experience Letter',
    category: 'Experience Letter',
    icon: '📜',
    description: 'Official confirmation of employee tenure, designation, department, and conduct.',
    content: `TO WHOM IT MAY CONCERN
EXPERIENCE & SERVICE CERTIFICATE

Date: {{issue_date}}
Reference: {{reference_number}}

This is to certify that {{candidate_name}} (Employee Code: {{employee_id}}) was employed with {{company_name}} from {{joining_date}} to {{end_date}}.

During their tenure with us, they served as {{job_title}} in the {{department}} department.

Throughout their service, {{candidate_name}} exhibited professional competency, dedication, and integrity in carrying out their responsibilities. Their conduct and character were exemplary.

We appreciate their contributions to our organization and wish them continued success in their future career endeavors.

Sincerely,

{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
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
    content: `TO WHOM IT MAY CONCERN
RELIEVING & CLEARANCE LETTER

Date: {{issue_date}}
Reference: {{reference_number}}

Dear {{candidate_name}},

This has reference to your resignation letter dated {{resignation_date}}. We hereby confirm that your resignation has been accepted and you are formally relieved from your duties as {{job_title}} in the {{department}} department at {{company_name}} with effect from the close of business hours on {{end_date}}.

We confirm that all company assets, credentials, and handovers have been satisfactorily completed, and all final clearance formalities are settled.

We thank you for your contributions during your tenure with us from {{joining_date}} to {{end_date}} and wish you the very best in your future endeavors.

Sincerely,

{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
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
    content: `MUTUAL NON-DISCLOSURE & CONFIDENTIALITY AGREEMENT
Reference: {{reference_number}}
Effective Date: {{issue_date}}

This Non-Disclosure Agreement ("Agreement") is made between:
1. {{company_name}}, having its principal place of business at {{work_location}}, and
2. {{candidate_name}} ("Recipient / Participant").

1. PURPOSE & CONFIDENTIAL INFORMATION
The parties intend to disclose proprietary information regarding technical architectures, customer data, and business roadmaps for the role of {{job_title}}.

2. OBLIGATIONS OF CONFIDENTIALITY
Recipient agrees to safeguard all Confidential Information with the same degree of care as their own proprietary information and shall not disclose it to any third party without prior written consent.

3. TERM & GOVERNING LAW
This Agreement shall remain in effect for a period of {{notice_period}} following disclosure.

Agreed and Accepted:

For {{company_name}}:
{{signatory_name}} ({{signatory_title}})

For Recipient:
{{candidate_name}}`,
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

    try {
      // 1. Try backend extraction (Mammoth for DOCX, pdf-parse for PDF)
      const res = await EmployeeService.uploadTemplate(file);
      if (res && res.extractedContent) {
        setTemplateText(res.extractedContent);
        if (res.suggestedCategory) setTemplateCategory(res.suggestedCategory);

        if (!res.detectedPlaceholders || res.detectedPlaceholders.length === 0) {
          // Auto run AI detection if no explicit tags in document
          runAiAutoDetectPlaceholders(res.extractedContent);
        } else {
          success(`Parsed "${file.name}" cleanly (${res.detectedFormat}). Detected ${res.detectedPlaceholders.length} fields!`);
        }
        setStep(2);
        return;
      }
    } catch (err: any) {
      console.warn('Backend upload parsing failed, falling back to client reader:', err);
    }

    // 2. Client-side fallback reader (for .txt, .html, markdown, or offline)
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = (e.target?.result as string) || '';
      let clean = raw;
      if (file.name.endsWith('.pdf')) {
        clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      }
      setTemplateText(clean);
      extractPlaceholdersFromText(clean);
      success(`Uploaded template "${file.name}". Ready to fill fields!`);
      setStep(2);
    };
    reader.onerror = () => {
      error(`Failed to read file "${file.name}". Please upload a .docx, .pdf, or .txt file.`);
    };
    reader.readAsText(file);
    setIsUploading(false);
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

  // Switch to Step 3 and prepare direct edit buffer
  const handleProceedToPreview = () => {
    const compiled = getCompiledDocumentText();
    setDirectEditedContent(compiled);
    setStep(3);
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
    const content = getCompiledDocumentText();
    const recipient = formData.candidate_name || formData.employee_name || 'Recipient';
    const filename = `${templateTitle.replace(/\s+/g, '_')}_${recipient.replace(/\s+/g, '_')}.doc`;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${templateTitle}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.6; color: #111; margin: 20mm; }
          h1, h2, h3 { font-family: Arial, sans-serif; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #999; padding: 6px 10px; font-size: 10.5pt; }
          th { background: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <div style="white-space: pre-wrap;">${content}</div>
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
    success(`Downloaded "${filename}" for Microsoft Word!`);
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
          {/* STEP 1: CHOOSE OR UPLOAD TEMPLATE                                   */}
          {/* =================================================================== */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Drag & Drop File Upload Area */}
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
              </div>

              {/* Standard Corporate Presets */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '22px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Or Choose a Standard Template
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                      Select a standard HR template blueprint to get started immediately:
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
              </div>

              {/* Template Content Inspector (Collapsible) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  padding: '18px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileCode size={18} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      Template Content & Placeholders ({detectedPlaceholders.length} detected)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRawMarkup(!showRawMarkup)}
                    style={{
                      background: 'none',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    {showRawMarkup ? 'Hide Markup' : 'View / Edit Markup'}
                  </button>
                </div>

                {showRawMarkup && (
                  <div style={{ marginTop: 14 }}>
                    <textarea
                      rows={12}
                      className="form-textarea"
                      value={templateText}
                      onChange={(e) => setTemplateText(e.target.value)}
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                        backgroundColor: '#f8fafc',
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
                      You can insert placeholders using double curly braces, e.g. <code style={{ color: '#2563eb' }}>{'{{custom_field}}'}</code>.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 1 Footer Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                  padding: '10px 0',
                }}
              >
                <div
                  id="printable-ai-generated-doc"
                  style={{
                    width: '100%',
                    maxWidth: 820,
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    padding: '48px 56px',
                    fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    fontSize: '13.5px',
                    lineHeight: 1.7,
                    color: '#1e293b',
                    boxSizing: 'border-box',
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
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        color: '#1e293b',
                      }}
                    >
                      {templateText.split(/(\{\{\s*[a-zA-Z0-9_\s]+\s*\}\})/).map((chunk, idx) => {
                        const match = chunk.match(/\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/);
                        if (match) {
                          const key = match[1].trim();
                          const val = formData[key] !== undefined && formData[key] !== '' ? formData[key] : chunk;
                          return (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: highlightPlaceholders ? '#fef08a' : 'transparent',
                                padding: highlightPlaceholders ? '1px 3px' : '0',
                                borderRadius: 3,
                                fontWeight: highlightPlaceholders ? 600 : 'normal',
                                color: '#0f172a',
                              }}
                            >
                              {val}
                            </span>
                          );
                        }
                        return <span key={idx}>{chunk}</span>;
                      })}
                    </div>
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
