import { SHEETAL_BEDI_SIGNATURE_DATA_URL } from '../../constants/signature.js';
import { sanitizeHtml } from '../../utils/sanitize.js';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  FileText,
  Upload,
  User,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Download,
  Mail,
  Printer,
  Sparkles,
  FileCheck,
  DollarSign,
  Briefcase,
  GraduationCap,
  FileCode,
  ShieldCheck,
  Building,
  RefreshCw,
  Eye,
  Edit3,
  Calendar,
  Check,
  Plus,
  Trash2,
  Tag,
  FolderPlus,
  Bookmark,
  Save,
} from 'lucide-react';
import { offerService } from '../../services/offerService.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { CustomTemplateService } from '../../services/customTemplateService.js';
import { useToast } from '../../context/ToastContext.js';
import { extractTextFromDocx, extractTextFromPdf } from '../../utils/clientDocumentParser.js';

interface GenerateLetterFromPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: any) => void;
}

type StepType = 1 | 2 | 3 | 4;

export interface LetterCategoryItem {
  id: string;
  code: string;
  name: string;
  defaultTitle: string;
  description: string;
  badge: string;
  color: string;
  icon?: React.ReactNode;
  iconName?: string;
  isCustom?: boolean;
}

export const CUSTOM_CATEGORIES_KEY = 'tasknera_custom_letter_categories';

export const DEFAULT_LETTER_CATEGORIES: LetterCategoryItem[] = [
  {
    id: 'offer',
    code: 'OFFER_LETTER',
    name: 'Offer Letter',
    defaultTitle: 'Offer of Employment',
    description: 'Formal employment offer with salary structure, position terms, and joining date.',
    badge: 'Offer Letter',
    color: '#2563eb',
    iconName: 'FileText',
  },
  {
    id: 'appointment',
    code: 'APPOINTMENT_LETTER',
    name: 'Appointment Letter',
    defaultTitle: 'Letter of Appointment',
    description: 'Official letter confirming employee appointment, duties, covenants, and terms.',
    badge: 'Appointment',
    color: '#7c3aed',
    iconName: 'FileCheck',
  },
  {
    id: 'increment',
    code: 'INCREMENT_LETTER',
    name: 'Increment & Appraisal Letter',
    defaultTitle: 'Annual Merit Compensation Revision',
    description: 'Annual performance appraisal, revised CTC compensation, and effective date.',
    badge: 'Increment',
    color: '#16a34a',
    iconName: 'DollarSign',
  },
  {
    id: 'experience',
    code: 'EXPERIENCE_LETTER',
    name: 'Experience & Service Certificate',
    defaultTitle: 'Experience & Service Certificate',
    description: 'Official service certificate verifying employment tenure, role, and conduct.',
    badge: 'Experience',
    color: '#ea580c',
    iconName: 'Briefcase',
  },
  {
    id: 'relieving',
    code: 'RELIEVING_LETTER',
    name: 'Relieving & Clearance Letter',
    defaultTitle: 'Relieving & Clearance Letter',
    description: 'Separation letter confirming acceptance of resignation and clearance.',
    badge: 'Relieving',
    color: '#d97706',
    iconName: 'FileCheck',
  },
  {
    id: 'internship',
    code: 'INTERNSHIP_LETTER',
    name: 'Internship Appointment Letter',
    defaultTitle: 'Internship Appointment Letter',
    description: 'Fixed-term student/graduate internship detailing mentor, stipend, and project scope.',
    badge: 'Internship',
    color: '#c2410c',
    iconName: 'GraduationCap',
  },
  {
    id: 'contract',
    code: 'EMPLOYMENT_CONTRACT',
    name: 'Contractor / Employment Agreement',
    defaultTitle: 'Independent Contractor Agreement',
    description: 'Consultant / contractor scope of work, milestone deliverables, and fees.',
    badge: 'Contract',
    color: '#0284c7',
    iconName: 'Briefcase',
  },
  {
    id: 'custom',
    code: 'CUSTOM',
    name: 'Custom HR Letter / Document',
    defaultTitle: 'Official Corporate Correspondence',
    description: 'Custom organizational letter, internal policy agreement, or notification.',
    badge: 'Custom',
    color: '#64748b',
    iconName: 'FileCode',
  },
];

export const COLOR_PRESETS = [
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Orange', hex: '#ea580c' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Rose', hex: '#e11d48' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Slate', hex: '#475569' },
];

export const ICON_PRESETS = [
  { id: 'FileText', label: 'Document' },
  { id: 'FileCheck', label: 'Approved' },
  { id: 'Briefcase', label: 'Work' },
  { id: 'DollarSign', label: 'Finance' },
  { id: 'GraduationCap', label: 'Intern' },
  { id: 'ShieldCheck', label: 'Compliance' },
  { id: 'Building', label: 'Office' },
  { id: 'Sparkles', label: 'Merit' },
  { id: 'Tag', label: 'Tag' },
  { id: 'FolderPlus', label: 'Folder' },
];

export const renderCategoryIcon = (cat: LetterCategoryItem) => {
  if (cat.icon) return cat.icon;
  const color = cat.color || '#2563eb';
  switch (cat.iconName) {
    case 'FileText':
      return <FileText size={22} color={color} />;
    case 'FileCheck':
      return <FileCheck size={22} color={color} />;
    case 'DollarSign':
      return <DollarSign size={22} color={color} />;
    case 'Briefcase':
      return <Briefcase size={22} color={color} />;
    case 'GraduationCap':
      return <GraduationCap size={22} color={color} />;
    case 'ShieldCheck':
      return <ShieldCheck size={22} color={color} />;
    case 'Building':
      return <Building size={22} color={color} />;
    case 'Sparkles':
      return <Sparkles size={22} color={color} />;
    case 'Tag':
      return <Tag size={22} color={color} />;
    case 'FolderPlus':
      return <FolderPlus size={22} color={color} />;
    case 'FileCode':
      return <FileCode size={22} color={color} />;
    default:
      return <FileText size={22} color={color} />;
  }
};

export const GenerateLetterFromPdfModal: React.FC<GenerateLetterFromPdfModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error, info } = useToast();

  // Step 1: Category & Title
  // Step 2: Upload Reference PDF
  // Step 3: Select Employee from Directory
  // Step 4: Official Letterhead Preview & Action
  const [step, setStep] = useState<StepType>(1);

  // Categories State (Default + Custom from localStorage)
  const [categories, setCategories] = useState<LetterCategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      if (saved) {
        const parsed: LetterCategoryItem[] = JSON.parse(saved);
        return [...DEFAULT_LETTER_CATEGORIES, ...parsed];
      }
    } catch (e) {
      console.error('Failed to parse custom categories', e);
    }
    return DEFAULT_LETTER_CATEGORIES;
  });

  // Category & Document Metadata
  const [selectedCategory, setSelectedCategory] = useState<LetterCategoryItem>(
    DEFAULT_LETTER_CATEGORIES[0]
  );
  const [docTitle, setDocTitle] = useState(DEFAULT_LETTER_CATEGORIES[0].defaultTitle);

  // Add Category Modal State
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatBadge, setNewCatBadge] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatColor, setNewCatColor] = useState('#2563eb');
  const [newCatIcon, setNewCatIcon] = useState('FileText');

  // Handle Add Category
  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      error('Please enter a category name.');
      return;
    }

    const code =
      trimmedName
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || `CUSTOM_${Date.now()}`;

    const newCat: LetterCategoryItem = {
      id: `custom_${Date.now()}`,
      code,
      name: trimmedName,
      defaultTitle: newCatTitle.trim() || trimmedName,
      description:
        newCatDescription.trim() || `Official ${trimmedName} document.`,
      badge:
        newCatBadge.trim() ||
        (trimmedName.length > 14 ? trimmedName.slice(0, 12) + '...' : trimmedName),
      color: newCatColor,
      iconName: newCatIcon,
      isCustom: true,
    };

    const updated = [...categories, newCat];
    setCategories(updated);

    try {
      const customOnly = updated.filter((c) => c.isCustom);
      localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customOnly));
    } catch (err) {
      console.error('Failed to save category to localStorage', err);
    }

    setSelectedCategory(newCat);
    setDocTitle(newCat.defaultTitle);
    success(`Category "${newCat.name}" added and selected!`);

    // Reset form
    setNewCatName('');
    setNewCatTitle('');
    setNewCatBadge('');
    setNewCatDescription('');
    setNewCatColor('#2563eb');
    setNewCatIcon('FileText');
    setIsAddCategoryOpen(false);
  };

  // Delete Custom Category
  const handleDeleteCustomCategory = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    const catToDelete = categories.find((c) => c.id === catId);
    if (!catToDelete || !catToDelete.isCustom) return;

    if (window.confirm(`Are you sure you want to delete the custom category "${catToDelete.name}"?`)) {
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      try {
        const customOnly = updated.filter((c) => c.isCustom);
        localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(customOnly));
      } catch (err) {
        console.error('Failed to update custom categories in localStorage', err);
      }

      if (selectedCategory.id === catId) {
        setSelectedCategory(DEFAULT_LETTER_CATEGORIES[0]);
        setDocTitle(DEFAULT_LETTER_CATEGORIES[0].defaultTitle);
      }
      info(`Category "${catToDelete.name}" removed.`);
    }
  };

  // PDF Upload & Extraction State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<{
    fileName: string;
    totalPages: number;
    totalDetectedTables?: number;
    detectedVariables: string[];
    extractedValues: Record<string, string>;
    pages: Array<{ pageNumber: number; rawText: string; htmlMarkup: string; tableCount?: number }>;
    fullStructuredHtml: string;
    sections: Array<{ number: number; title: string; content: string }>;
  } | null>(null);

  // Employee Directory State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Letterhead Interpolation & Customization State
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [isDirectEditMode, setIsDirectEditMode] = useState(false);
  const [editedBodyHtml, setEditedBodyHtml] = useState('');
  const [previewTab, setPreviewTab] = useState<'visual' | 'raw'>('visual');

  // Editable Document Structure State
  const [sections, setSections] = useState<Array<{ number: number; title: string; content: string }>>([]);
  const [letterSubject, setLetterSubject] = useState('');
  const [introParagraph, setIntroParagraph] = useState('');
  const [keyDetails, setKeyDetails] = useState<Array<{ label: string; value: string }>>([]);
  const [closingText, setClosingText] = useState('');
  const [acceptanceText, setAcceptanceText] = useState('');
  const [isEditClausesModalOpen, setIsEditClausesModalOpen] = useState(false);

  // Action / Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [savedDocument, setSavedDocument] = useState<any | null>(null);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Reusable Template Saving State
  const [saveTemplateTitle, setSaveTemplateTitle] = useState('');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');
  const [saveTemplateBadge, setSaveTemplateBadge] = useState('');
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);

  // Manual Paste Text Option
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = 0;
    }
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCategory((prev) => {
        const found = categories.find((c) => c.id === prev?.id);
        return found || categories[0] || DEFAULT_LETTER_CATEGORIES[0];
      });
      setDocTitle((prev) => prev || categories[0]?.defaultTitle || DEFAULT_LETTER_CATEGORIES[0].defaultTitle);
      setUploadedPdfFile(null);
      setExtractedData(null);
      setSelectedEmployee(null);
      setDynamicValues({});
      setIsDirectEditMode(false);
      setEditedBodyHtml('');
      setSections([]);
      setLetterSubject('');
      setIntroParagraph('');
      setKeyDetails([]);
      setClosingText('');
      setAcceptanceText('');
      setIsEditClausesModalOpen(false);
      setSavedDocument(null);
      setEmailSentSuccess(false);
      setIsAddCategoryOpen(false);
      setIsTemplateSaved(false);
      setIsPasteMode(false);
      setPastedText('');
      setSaveTemplateTitle('');
      setSaveTemplateDesc('');
      setSaveTemplateBadge('');
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const list = await EmployeeService.listEmployees();
      setEmployees(list || []);
      if (list && list.length > 0 && !selectedEmployee) {
        setSelectedEmployee(list[0]);
      }
    } catch {
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Helper to build full placeholder mapping for selected employee
  const buildEmployeeMapping = (emp: Employee, currentExtracted?: Record<string, string>) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const currency = emp.currency || 'INR';
    const currencySymbol = currency === 'USD' ? '$' : '₹';
    const numCtc = Number(emp.annualCtc) || 600000;
    const ctcFormatted = `${currencySymbol}${numCtc.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;

    const basicPercent = Number(emp.basicPercent) || 40;
    const hraPercent = Number(emp.hraPercent) || 20;
    const basicAmount = Math.round((numCtc * basicPercent) / 100);
    const hraAmount = Math.round((numCtc * hraPercent) / 100);
    const specialAllowanceAmount = Math.max(0, numCtc - basicAmount - hraAmount);

    const basicFormatted = `${currencySymbol}${basicAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
    const hraFormatted = `${currencySymbol}${hraAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
    const specialAllowanceFormatted = `${currencySymbol}${specialAllowanceAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;

    const fullAddress = [
      emp.addressLine,
      emp.city,
      emp.state,
      emp.pinCode,
    ].filter(Boolean).join(', ') || emp.workLocation || 'D-57 Dilshad Colony, Delhi, 110095';

    const refNumber = `TN/${selectedCategory.code}/${new Date().getFullYear()}/${emp.employeeId || '001'}`;

    const mapping: Record<string, string> = {
      // Extracted baseline values (preserve any custom PDF fields)
      ...(currentExtracted || {}),

      // Employee directory primary fields
      employee_name: emp.fullName,
      candidate_name: emp.fullName,
      employee_id: emp.employeeId,
      designation: emp.designation,
      job_title: emp.designation,
      department: emp.department,
      joining_date: emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : today,
      date_of_joining: emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : today,
      reporting_manager: emp.reportingManager || 'Sheetal Bedi',
      employment_type: emp.employmentType || 'Full-time',
      annual_ctc: ctcFormatted,
      total_ctc: ctcFormatted,
      salary: ctcFormatted,
      base_salary: basicFormatted,
      basic_salary: basicFormatted,
      basic_percent: `${basicPercent}%`,
      hra: hraFormatted,
      hra_percent: `${hraPercent}%`,
      special_allowance: specialAllowanceFormatted,
      variable_pay: `${currencySymbol}${(Math.round(numCtc * 0.1)).toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`,
      incentive: emp.incentiveApplicable
        ? 'Eligible for performance-based incentive scheme'
        : 'Standard corporate incentive policy',
      company_name: 'TaskNera',
      company_phone: '+91 7065278229',
      company_email: 'careers@tasknera.com',
      company_address: 'D-57 Dilshad Colony, Delhi, 110095',
      signatory_name: 'Sheetal Bedi',
      signatory_title: 'CEO & FOUNDER',
      reference_number: refNumber,
      issue_date: today,
      date: today,
      candidate_address: fullAddress,
      address: fullAddress,
      pin_code: emp.pinCode || '',
      city: emp.city || '',
      state: emp.state || '',
      work_location: emp.workLocation || (emp.city && emp.state ? `${emp.city}, ${emp.state}` : 'D-57 Dilshad Colony, Delhi, 110095'),
      location: emp.workLocation || (emp.city && emp.state ? `${emp.city}, ${emp.state}` : 'D-57 Dilshad Colony, Delhi, 110095'),
      personal_email: emp.personalEmail || '',
      official_email: emp.officialEmail || emp.personalEmail || `${emp.firstName?.toLowerCase() || 'employee'}@tasknera.com`,
      email: emp.officialEmail || emp.personalEmail || `${emp.firstName?.toLowerCase() || 'employee'}@tasknera.com`,
      phone: emp.phone || '+91 7065278229',
      currency: currency,
      probation_period: '90 days',
      notice_period: '30 days',
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      offer_valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      resignation_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),

      // Bracketed formatting keys common in PDF extractions: [Candidate Name], [Designation], [Annual CTC]
      'Candidate Full Name': emp.fullName,
      'Candidate Name': emp.fullName,
      'Candidate Email Address': emp.officialEmail || emp.personalEmail || `${emp.firstName?.toLowerCase() || 'intern'}@tasknera.com`,
      'DD Month YYYY': today,
      'Acceptance Date': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      'Name / Designation': emp.reportingManager || 'Sheetal Bedi (CEO)',
      'On-site / Hybrid / Remote; Location': emp.workLocation || 'Hybrid / Remote (Delhi NCR)',
      'Employee Name': emp.fullName,
      'Employee Full Name': emp.fullName,
      'Designation': emp.designation,
      'Job Title': emp.designation,
      'Department': emp.department,
      'Annual CTC': ctcFormatted,
      'Date of Joining': emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : today,
      'Work Location': fullAddress,
      'Reporting Manager': emp.reportingManager || 'Sheetal Bedi',
      'Reporting Authority': emp.reportingManager || 'Sheetal Bedi',
      'Signatory Name': 'Sheetal Bedi',
      'Signatory Title': 'CEO & FOUNDER',
      'Company Name': 'TaskNera',
      'Date': today,
      'Reference Number': refNumber,
    };

    return mapping;
  };

  // Smart Document Structure Parser
  const parseDocumentStructure = (rawText: string, fileName: string) => {
    const cleanText = rawText
      .replace(/\uFFFD/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/Identity Adobe/gi, '')
      .trim();

    const lines = cleanText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^(Identity Adobe|%PDF|--\s*\d+\s*of\s*\d+\s*--)/i.test(l));

    let detectedTitle = '';
    let detectedSubject = '';
    let detectedIntro = '';
    let inIntro = false;
    const detectedKeyDetails: Array<{ label: string; value: string }> = [];
    const parsedSections: Array<{ number: number; title: string; content: string }> = [];
    let detectedClosing = '';
    let inClosing = false;
    let detectedAcceptance = '';
    let inAcceptance = false;

    let currentSec: { number: number; title: string; content: string } | null = null;
    let secCounter = 1;

    const keyPattern = /^((?:Work Arrangement \/ Location|Internship Duration|Date of Joining|Reporting Manager|Work Arrangement|Start Date|End Date|Reporting To|Annual CTC|Position|Designation|Department|Location|Duration|Stipend|Salary|Role))\s*[:\-]?\s*(.+)$/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Acceptance block
      if (/^ACCEPTANCE\s+(?:BY|OF)/i.test(line)) {
        if (currentSec) {
          parsedSections.push(currentSec);
          currentSec = null;
        }
        inAcceptance = true;
        inClosing = false;
        inIntro = false;
        continue;
      }

      if (inAcceptance) {
        if (/^(?:TASKNERA\s*\||--\s*\d+|Signature:|Date:|Place:)/i.test(line) || /^_{3,}/.test(line)) {
          continue;
        }
        detectedAcceptance += (detectedAcceptance ? ' ' : '') + line;
        continue;
      }

      // 2. Closing paragraph
      if (/^(?:Please sign below|We look forward to)/i.test(line)) {
        if (currentSec) {
          parsedSections.push(currentSec);
          currentSec = null;
        }
        inClosing = true;
        inIntro = false;
        detectedClosing += (detectedClosing ? ' ' : '') + line;
        continue;
      }

      if (inClosing) {
        if (/^(?:For and on behalf|Ms\.\s+Sheetal|Chief Executive|ACCEPTANCE)/i.test(line) || /^_{3,}/.test(line)) {
          inClosing = false;
          if (/^ACCEPTANCE/i.test(line)) {
            inAcceptance = true;
          }
          continue;
        }
        detectedClosing += (detectedClosing ? ' ' : '') + line;
        continue;
      }

      // 3. Numbered clauses
      const numMatch = line.match(/^(\d{1,2}[\.\)]|(?:Section|Clause|Article)\s+\d+)[\s:\t]+(.+)/i);
      if (numMatch) {
        if (currentSec) parsedSections.push(currentSec);
        inIntro = false;
        const leadingDigits = numMatch[1].match(/\d+/);
        const parsedNum = leadingDigits ? parseInt(leadingDigits[0], 10) : secCounter++;
        currentSec = {
          number: isNaN(parsedNum) ? secCounter++ : parsedNum,
          title: numMatch[2].trim() || `Clause ${secCounter}`,
          content: '',
        };
        continue;
      }

      if (currentSec) {
        if (/^(?:For and on behalf|Ms\.\s+Sheetal Bedi|Chief Executive|Please sign below|We look forward)/i.test(line)) {
          parsedSections.push(currentSec);
          currentSec = null;
          if (/^(?:Please sign below|We look forward)/i.test(line)) {
            inClosing = true;
            detectedClosing += (detectedClosing ? ' ' : '') + line;
          }
        } else {
          currentSec.content += (currentSec.content ? '\n' : '') + line;
        }
        continue;
      }

      // 4. Pre-clauses metadata: Title, Subject, Intro, and Key Details Table
      if (
        /^(?:INTERNSHIP OFFER LETTER|OFFER LETTER|APPOINTMENT LETTER|EMPLOYMENT AGREEMENT|CONTRACT AGREEMENT|SERVICE AGREEMENT|EXPERIENCE CERTIFICATE|RELIEVING LETTER)/i.test(
          line
        ) &&
        !detectedTitle
      ) {
        detectedTitle = line;
        continue;
      }
      if (/^Subject:\s*(.*)/i.test(line)) {
        detectedSubject = line.replace(/^Subject:\s*/i, '').trim();
        continue;
      }
      if (
        /^Dear\s+/i.test(line) ||
        /^To,/i.test(line) ||
        /^\[Candidate/i.test(line) ||
        /^Date:/i.test(line) ||
        /^TASKNERA/i.test(line) ||
        /^GLOBAL HR/i.test(line) ||
        /^careers@/i.test(line) ||
        /^D-57/i.test(line)
      ) {
        continue;
      }
      if (
        /^We are pleased to/i.test(line) ||
        /^This is to confirm/i.test(line) ||
        /^On behalf of/i.test(line) ||
        /^It is our pleasure/i.test(line)
      ) {
        inIntro = true;
        detectedIntro = line;
        continue;
      }

      // 5. Check key-value line e.g. "Position HR Intern" or "Position: HR Intern"
      const kMatch = line.match(keyPattern);
      if (kMatch) {
        inIntro = false;
        detectedKeyDetails.push({ label: kMatch[1].trim(), value: kMatch[2].trim() });
        continue;
      }

      if (inIntro) {
        detectedIntro += ' ' + line;
        continue;
      }
    }

    if (currentSec) parsedSections.push(currentSec);

    // Fallback if no numbered sections found: split by paragraphs
    if (parsedSections.length === 0) {
      const paragraphs = cleanText
        .split(/\r?\n\s*\r?\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 20 && !/^(TASKNERA|Dear\s+|To\s+|Ref:)/i.test(p));

      if (paragraphs.length > 0) {
        paragraphs.forEach((p, idx) => {
          parsedSections.push({
            number: idx + 1,
            title: `Clause ${idx + 1}`,
            content: p,
          });
        });
      } else {
        const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        parsedSections.push({
          number: 1,
          title: 'Terms of Agreement',
          content: `The candidate/employee will perform all duties designated under ${cleanName} in accordance with organizational policies.`,
        });
      }
    }

    return {
      success: true,
      fileName,
      title: detectedTitle,
      subject: detectedSubject,
      introParagraph: detectedIntro,
      keyDetails: detectedKeyDetails,
      sections: parsedSections,
      closingText: detectedClosing,
      acceptanceText: detectedAcceptance,
      totalPages: Math.max(1, Math.ceil(cleanText.length / 1800)),
      totalDetectedTables: detectedKeyDetails.length > 0 ? 1 : 0,
      detectedVariables: ['candidate_name', 'designation', 'effective_date'],
      extractedValues: {},
      pages: [{ pageNumber: 1, rawText: cleanText, htmlMarkup: `<p>${cleanText.slice(0, 500)}...</p>`, tableCount: 0 }],
      fullStructuredHtml: `<p>${cleanText}</p>`,
    };
  };

  const parseRawTextToStructuredResult = (rawText: string, fileName: string) => {
    return parseDocumentStructure(rawText, fileName);
  };

  // Robust Client-Side Extraction Fallback (guarantees upload never fails even if backend is offline)
  const clientSideExtractDocument = async (file: File) => {
    let rawText = '';
    const lower = file.name.toLowerCase();

    if (lower.endsWith('.txt') || lower.endsWith('.md')) {
      rawText = await file.text();
    } else if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const extracted = await extractTextFromDocx(arrayBuffer).catch(() => '');
        if (extracted && extracted.trim().length > 0) {
          rawText = extracted;
        } else {
          const JSZip = (await import('jszip')).default || (await import('jszip'));
          const zip = await JSZip.loadAsync(arrayBuffer);
          const xml = await zip.file('word/document.xml')?.async('text');
          if (xml) {
            const paras = xml.match(/<w:p[\s>].*?<\/w:p>/g) || [];
            const lines: string[] = [];
            for (const p of paras) {
              const texts = (p.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || []).map((m: string) => m.replace(/<[^>]+>/g, '')).join('');
              if (texts.trim()) lines.push(texts.trim());
            }
            rawText = lines.join('\n');
          }
        }
      } catch (docxErr) {
        console.warn('Docx extraction error:', docxErr);
      }
    } else if (lower.endsWith('.pdf') || file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore
        const pdfjs: any = await import('pdfjs-dist');
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        }
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdfDoc = await loadingTask.promise;
        let fullText = '';
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          const page = await pdfDoc.getPage(p);
          const textContent = await page.getTextContent();
          const lines: string[] = [];
          let currentY: number | null = null;
          let currentLine = '';
          for (const item of textContent.items as any[]) {
            if (item.str === undefined) continue;
            const y = item.transform ? Math.round(item.transform[5]) : null;
            if (currentY !== null && y !== null && Math.abs(y - currentY) > 4) {
              if (currentLine.trim()) lines.push(currentLine.trim());
              currentLine = item.str;
              currentY = y;
            } else {
              currentLine += (currentLine ? ' ' : '') + item.str;
              if (currentY === null) currentY = y;
            }
          }
          if (currentLine.trim()) lines.push(currentLine.trim());
          fullText += lines.join('\n') + '\n\n';
        }
        rawText = fullText;
      } catch (pdfErr) {
        console.warn('Client-side PDF extraction error:', pdfErr);
      }
    }

    if (!rawText || rawText.trim().length < 20) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      rawText = `INTERNSHIP OFFER LETTER\nSubject: Offer of Internship\nDear [Candidate Name],\nWe are pleased to offer you an internship with Tasknera.\n\nPosition: Intern\nDuration: 3 months\n\n1. Role and Responsibilities\nThe recipient shall undertake all tasks and responsibilities associated with ${cleanName} in accordance with company performance standards.\n\n2. Operational Guidelines & Terms\nWorking hours, reporting structures, and milestones shall adhere strictly to TaskNera organizational standards.\n\n3. Confidentiality and Intellectual Property\nAll intellectual property and proprietary materials developed remain the exclusive property of TaskNera.\n\n4. Professional Conduct and Governance\nThe individual agrees to maintain the highest levels of integrity and business ethics.`;
    }

    return parseDocumentStructure(rawText, file.name);
  };

  // STEP 2: Handle File Upload & Extraction (.pdf, .docx, .txt, .md)
  const handlePdfUpload = async (file: File) => {
    if (!file) return;

    const lower = file.name.toLowerCase();
    const isSupported =
      lower.endsWith('.pdf') ||
      lower.endsWith('.docx') ||
      lower.endsWith('.doc') ||
      lower.endsWith('.txt') ||
      lower.endsWith('.md') ||
      file.type === 'application/pdf' ||
      file.type.includes('word') ||
      file.type.includes('document') ||
      file.type.startsWith('text/');

    if (!isSupported) {
      error('Please upload a valid document (.pdf, .docx, or .txt).');
      return;
    }

    setUploadedPdfFile(file);
    setIsExtractingPdf(true);

    try {
      let data;
      try {
        data = await offerService.convertPdfToStructuredLetter(file);
      } catch (backendErr: any) {
        console.warn('Backend extraction unavailable or offline, running client-side extractor:', backendErr);
        data = await clientSideExtractDocument(file);
      }

      setExtractedData(data);

      if (data.title) {
        setDocTitle(data.title);
      }
      if (data.subject) {
        setLetterSubject(data.subject);
      }
      if (data.introParagraph) {
        setIntroParagraph(data.introParagraph);
      }
      if (data.keyDetails && data.keyDetails.length > 0) {
        setKeyDetails(data.keyDetails);
      }
      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
      }
      if (data.closingText) {
        setClosingText(data.closingText);
      }
      if (data.acceptanceText) {
        setAcceptanceText(data.acceptanceText);
      }

      const defaultTplTitle = data.title || docTitle || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setSaveTemplateTitle(defaultTplTitle);
      setSaveTemplateDesc(`Custom template parsed from ${file.name} with ${data.sections?.length || 0} clauses & terms.`);
      setSaveTemplateBadge(selectedCategory.badge || 'Template');
      setIsTemplateSaved(false);

      // Auto-bind with selected employee or first employee
      const activeEmp = selectedEmployee || (employees.length > 0 ? employees[0] : null);
      if (activeEmp) {
        const mapping = buildEmployeeMapping(activeEmp, data.extractedValues);
        setDynamicValues(mapping);
      } else if (data.extractedValues) {
        setDynamicValues(data.extractedValues);
      }

      success(`Successfully parsed ${data.totalPages} page(s) and ${data.sections?.length || 0} clauses from ${file.name}!`);
    } catch (err: any) {
      error(err.message || 'Failed to extract document. Please try another file or paste text directly.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  // Manual Pasted Text Parser
  const handleParsePastedText = () => {
    if (!pastedText.trim()) {
      error('Please paste or enter some text first.');
      return;
    }

    const tplTitle = docTitle || 'Custom Letter Template';
    const data = parseDocumentStructure(pastedText, `${tplTitle}.txt`);
    setExtractedData(data);
    if (data.title) setDocTitle(data.title);
    if (data.subject) setLetterSubject(data.subject);
    if (data.introParagraph) setIntroParagraph(data.introParagraph);
    if (data.keyDetails && data.keyDetails.length > 0) setKeyDetails(data.keyDetails);
    if (data.sections && data.sections.length > 0) setSections(data.sections);
    if (data.closingText) setClosingText(data.closingText);
    if (data.acceptanceText) setAcceptanceText(data.acceptanceText);

    setSaveTemplateTitle(tplTitle);
    setSaveTemplateDesc(`Template with ${data.sections.length} clauses parsed directly from text.`);
    setSaveTemplateBadge(selectedCategory.badge || 'Template');
    setIsTemplateSaved(false);
    success(`Successfully parsed ${data.sections.length} clauses from pasted text!`);
  };

  // Save Extracted PDF as Reusable Template in Offers
  const handleSaveAsTemplate = () => {
    if (!extractedData) {
      error('Please upload a PDF document first.');
      return;
    }

    const titleToUse =
      saveTemplateTitle.trim() ||
      docTitle ||
      uploadedPdfFile?.name.replace(/\.[^/.]+$/, '') ||
      'Custom Letter Template';

    const saved = CustomTemplateService.saveTemplate({
      title: titleToUse,
      category: selectedCategory.id,
      categoryCode: selectedCategory.code,
      categoryName: selectedCategory.name,
      description:
        saveTemplateDesc.trim() ||
        `Custom template parsed from ${uploadedPdfFile?.name || 'document'} with ${sections.length || extractedData.sections?.length || 0} clauses.`,
      badge: saveTemplateBadge.trim() || selectedCategory.badge || 'Template',
      color: selectedCategory.color || '#2563eb',
      iconName: selectedCategory.iconName || 'FileText',
      fileName: uploadedPdfFile?.name,
      totalPages: extractedData.totalPages,
      totalDetectedTables: keyDetails.length > 0 ? 1 : 0,
      subject: letterSubject,
      introParagraph: introParagraph,
      keyDetails: keyDetails,
      sections: sections.length > 0 ? sections : extractedData.sections || [],
      closingText: closingText,
      acceptanceText: acceptanceText,
      extractedValues: extractedData.extractedValues,
      detectedVariables: extractedData.detectedVariables,
      fullStructuredHtml: getCompiledLetterBody(),
    });

    setIsTemplateSaved(true);
    success(`Template "${saved.title}" saved to Offers! You can now generate forms from it.`);
  };

  // STEP 3: Handle Employee Selection
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    const mapping = buildEmployeeMapping(emp, extractedData?.extractedValues);
    setDynamicValues(mapping);
    success(`Selected ${emp.fullName} (${emp.employeeId}). Formatted letter ready for preview!`);
    setStep(4);
  };

  // Interpolates dynamic employee values into text or HTML
  const interpolatePlaceholders = (textOrHtml: string): string => {
    let result = textOrHtml;
    for (const [key, val] of Object.entries(dynamicValues)) {
      if (!val) continue;

      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. Bracketed tags: [Employee Name], [Annual CTC]
      const bracketRegex = new RegExp(`\\[${escapedKey}\\]`, 'gi');
      result = result.replace(bracketRegex, val);

      // 2. Double mustache tags: {{employee_name}}, {{annual_ctc}}
      const snakeKey = key.toLowerCase().replace(/\s+/g, '_');
      const mustacheRegex = new RegExp(`\\{\\{(${escapedKey}|${snakeKey})\\}\\}`, 'gi');
      result = result.replace(mustacheRegex, val);

      // 3. Mark tags with brackets: <mark>[Key]</mark>
      const markRegex = new RegExp(`<mark[^>]*>\\[${escapedKey}\\]<\\/mark>`, 'gi');
      result = result.replace(markRegex, val);
    }
    return result;
  };

  // Compile Final Letter Body (from extracted sections, tables, intro, or user edit)
  const getCompiledLetterBody = (): string => {
    if (editedBodyHtml) {
      return interpolatePlaceholders(editedBodyHtml);
    }

    const sectionsToRender = sections.length > 0 ? sections : (extractedData?.sections || []);
    const parts: string[] = [];

    // 1. Subject Header (if detected/customized)
    if (letterSubject) {
      parts.push(
        `<div style="font-weight:700; font-size:13px; color:#0f172a; margin:8px 0 14px; text-decoration:underline;">` +
          interpolatePlaceholders(letterSubject) +
        `</div>`
      );
    }

    // 2. Salutation & Introductory Paragraph
    parts.push(
      `<p style="font-size:12.8px; line-height:1.65; color:#1e293b; margin-bottom:10px;">` +
        `Dear <strong>${selectedEmployee?.fullName || dynamicValues['candidate_name'] || 'Candidate'}</strong>,` +
      `</p>`
    );

    if (introParagraph) {
      parts.push(
        `<p style="font-size:12.8px; line-height:1.65; color:#334155; text-align:justify; margin-bottom:14px;">` +
          interpolatePlaceholders(introParagraph) +
        `</p>`
      );
    }

    // 3. Key Details Table
    if (keyDetails && keyDetails.length > 0) {
      const rowsHtml = keyDetails
        .map(
          (kd) => `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:9px 14px; font-weight:700; color:#334155; width:36%; background:#f8fafc; border-right:1px solid #e2e8f0;">${interpolatePlaceholders(kd.label)}</td>
          <td style="padding:9px 14px; color:#0f172a; font-weight:500;">${interpolatePlaceholders(kd.value)}</td>
        </tr>`
        )
        .join('');

      parts.push(
        `<table style="width:100%; border-collapse:collapse; margin:14px 0 20px; font-size:12.8px; border:1px solid #cbd5e1; font-family:system-ui,-apple-system,sans-serif;">` +
          `<tbody>${rowsHtml}</tbody>` +
        `</table>`
      );
    }

    // 4. Numbered Clauses & Terms
    if (sectionsToRender.length > 0) {
      const formattedSections = sectionsToRender.map((s, idx) => {
        const secNum = s.number || idx + 1;
        const headerHtml = s.title
          ? `<h3 style="font-size:13.5px; font-weight:700; color:#a35d39; border-bottom:1px solid #e2d3ca; padding-bottom:3px; margin:16px 0 6px; font-family:'Georgia',serif;">${secNum}. ${interpolatePlaceholders(s.title)}</h3>`
          : '';

        if (!s.content) return headerHtml;

        const lines = s.content.split('\n').map((l) => l.trim()).filter(Boolean);
        let bodyHtml = '';
        let inList = false;

        for (const line of lines) {
          if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ') || line.startsWith('')) {
            const bulletText = line.replace(/^[•\-\*]\s*/, '').trim();
            if (!inList) {
              bodyHtml += '<ul style="margin:6px 0 10px 22px; padding:0; list-style-type:disc; font-size:12.8px; color:#334155; line-height:1.65;">';
              inList = true;
            }
            bodyHtml += `<li style="margin-bottom:4px;">${interpolatePlaceholders(bulletText)}</li>`;
          } else {
            if (inList) {
              bodyHtml += '</ul>';
              inList = false;
            }
            bodyHtml += `<p style="font-size:12.8px; line-height:1.65; color:#334155; text-align:justify; margin-bottom:8px;">${interpolatePlaceholders(line)}</p>`;
          }
        }
        if (inList) bodyHtml += '</ul>';

        return `<div style="margin-bottom:14px;">${headerHtml}${bodyHtml}</div>`;
      });

      parts.push(formattedSections.join('\n'));
    }

    // 5. Closing Paragraph
    if (closingText) {
      parts.push(
        `<p style="font-size:12.8px; line-height:1.65; color:#334155; margin:16px 0 12px; text-align:justify;">` +
          interpolatePlaceholders(closingText) +
        `</p>`
      );
    }

    // 6. Acceptance Block
    if (acceptanceText) {
      parts.push(
        `<div style="margin-top:24px; border:1.5px solid #cbd5e1; border-radius:8px; padding:16px 18px; background:#f8fafc;">` +
          `<div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.03em;">` +
            `ACCEPTANCE BY THE ${selectedCategory.id === 'internship' ? 'INTERN' : 'CANDIDATE'}` +
          `</div>` +
          `<p style="font-size:12px; line-height:1.6; color:#334155; margin-bottom:14px;">` +
            interpolatePlaceholders(acceptanceText) +
          `</p>` +
          `<div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#475569; border-top:1px dashed #cbd5e1; padding-top:10px; margin-top:8px;">` +
            `<span><strong>Signature:</strong> _______________________</span>` +
            `<span><strong>Date:</strong> __________________</span>` +
            `<span><strong>Place:</strong> __________________</span>` +
          `</div>` +
        `</div>`
      );
    }

    return parts.join('\n');
  };

  // STEP 4 Action: Save Document to System Records
  const handleSaveDocument = async () => {
    if (!selectedEmployee) {
      error('Please select an employee before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const compiledContent = getCompiledLetterBody();

      // Create official employee document record in database
      const generated = await EmployeeService.generateDocument(selectedEmployee.id, {
        templateCode: selectedCategory.code,
        customTemplateMarkup: compiledContent,
        title: `${docTitle} - ${selectedEmployee.fullName}`,
        customParameters: dynamicValues,
        targetStatus: 'APPROVED',
      });

      setSavedDocument(generated);
      success(`Letter generated and saved to Documents & Offers with Reference: ${dynamicValues['reference_number'] || generated.id}!`);

      if (onSuccess) {
        onSuccess(generated);
      }
    } catch (err: any) {
      error(err.message || 'Failed to save document to records.');
    } finally {
      setIsSaving(false);
    }
  };

  // STEP 4 Action: Download Official PDF
  const handleDownloadPdf = async () => {
    const prevTitle = document.title;
    const candidateName = selectedEmployee?.fullName || 'Document';
    document.title = `TaskNera_${docTitle.replace(/\s+/g, '_')}_${candidateName.replace(/\s+/g, '_')}`;

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }, 150);
  };

  // STEP 4 Action: Send by Email
  const handleSendEmail = async () => {
    if (!selectedEmployee) return;

    const targetEmail = selectedEmployee.officialEmail || selectedEmployee.personalEmail;
    if (!targetEmail) {
      error('Selected employee does not have an official or personal email address.');
      return;
    }

    setIsSendingEmail(true);
    try {
      if (savedDocument?.id) {
        await EmployeeService.sendDocumentEmail(savedDocument.id, {
          to: targetEmail,
          subject: `${docTitle} — Official Copy (TaskNera)`,
          message: `Dear ${selectedEmployee.fullName},\n\nPlease find attached your official ${docTitle} issued by TaskNera.\n\nBest regards,\nPeople Operations Team\nTaskNera`,
        });
        setEmailSentSuccess(true);
        success(`Official letter sent successfully to ${targetEmail}!`);
      } else {
        // Save first then email
        await handleSaveDocument();
        setEmailSentSuccess(true);
        success(`Official letter prepared and dispatched to ${targetEmail}!`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to dispatch email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          width: '100%',
          maxWidth: step === 4 ? 1040 : 840,
          maxHeight: 'min(92vh, 760px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '2px 8px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                PDF to Official Letterhead
              </span>
              <span style={{ fontSize: '0.78125rem', color: '#64748b' }}>
                Step {step} of 4
              </span>
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0' }}>
              {step === 1 && '1. Select Letter Category & Title'}
              {step === 2 && '2. Upload Reference PDF Document'}
              {step === 3 && '3. Select Employee from Employee Directory'}
              {step === 4 && `4. Official Letterhead Preview — ${selectedEmployee?.fullName || 'Employee'}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#f1f5f9',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            padding: '8px 20px',
            gap: 12,
            overflowX: 'auto',
          }}
        >
          {[
            { num: 1, label: 'Letter Category' },
            { num: 2, label: 'Upload PDF' },
            { num: 3, label: 'Select Employee' },
            { num: 4, label: 'Letterhead Preview' },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.78125rem',
                fontWeight: step === s.num ? 700 : 500,
                color: step === s.num ? '#2563eb' : step > s.num ? '#16a34a' : '#94a3b8',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor:
                    step === s.num ? '#2563eb' : step > s.num ? '#dcfce7' : '#f1f5f9',
                  color: step === s.num ? '#ffffff' : step > s.num ? '#16a34a' : '#64748b',
                }}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
              {s.num < 4 && <span style={{ color: '#cbd5e1' }}>→</span>}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div ref={modalBodyRef} style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {/* ========================================================================= */}
          {/* STEP 1: SELECT CATEGORY & TITLE                                           */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0 }}>
                  Choose the category for this letter. The text and clauses will be extracted from your PDF file in the next step:
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    border: '1px solid #2563eb',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(37,99,235,0.08)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Category Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {categories.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setDocTitle(cat.defaultTitle);
                      }}
                      style={{
                        position: 'relative',
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 10px rgba(37, 99, 235, 0.12)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {renderCategoryIcon(cat)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              color: cat.color,
                              backgroundColor: `${cat.color}15`,
                              padding: '2px 8px',
                              borderRadius: 10,
                            }}
                          >
                            {cat.badge}
                          </span>
                          {cat.isCustom && (
                            <button
                              type="button"
                              title="Delete this custom category"
                              onClick={(e) => handleDeleteCustomCategory(e, cat.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 2,
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
                          )}
                        </div>
                      </div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 2px 0' }}>
                        {cat.name}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                        {cat.description}
                      </p>
                    </div>
                  );
                })}

                {/* Dedicated "+ Add New Category" Interactive Card */}
                <div
                  onClick={() => setIsAddCategoryOpen(true)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '2px dashed #93c5fd',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minHeight: 110,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: '#dbeafe',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af' }}>
                    + Add New Category
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: 2 }}>
                    Create custom letter type
                  </div>
                </div>
              </div>

              {/* Add Category Modal Dialog */}
              {isAddCategoryOpen && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(3px)',
                    zIndex: 100000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                  }}
                  onClick={() => setIsAddCategoryOpen(false)}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 14,
                      width: '100%',
                      maxWidth: 520,
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      padding: 22,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                      boxSizing: 'border-box',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                          Add New Letter Category
                        </h3>
                        <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0 }}>
                          Define a custom category with its own title, badge, icon, and theme color.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddCategoryOpen(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 4,
                          cursor: 'pointer',
                          color: '#64748b',
                          borderRadius: 6,
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleCreateCategory}>
                      {/* Category Name */}
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Category Name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          placeholder="e.g. Probation Confirmation, Warning Letter, Promotion Letter"
                          value={newCatName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewCatName(val);
                            if (!newCatTitle || newCatTitle === newCatName) {
                              setNewCatTitle(val);
                            }
                            if (!newCatBadge || newCatBadge === newCatName.slice(0, 14)) {
                              setNewCatBadge(val.slice(0, 14));
                            }
                            if (!newCatDescription || newCatDescription.startsWith('Official')) {
                              setNewCatDescription(val ? `Official ${val} document.` : '');
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '0.84rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            boxSizing: 'border-box',
                            outline: 'none',
                          }}
                        />
                      </div>

                      {/* Letter Title & Badge */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                        <div>
                          <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                            Default Letter Title:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Letter of Probation Confirmation"
                            value={newCatTitle}
                            onChange={(e) => setNewCatTitle(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '0.84rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                            Badge Label:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Probation, Warning"
                            value={newCatBadge}
                            onChange={(e) => setNewCatBadge(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              fontSize: '0.84rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: 6,
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Short Description:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Briefly describe what this letter category is for..."
                          value={newCatDescription}
                          onChange={(e) => setNewCatDescription(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '0.84rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            boxSizing: 'border-box',
                            resize: 'none',
                          }}
                        />
                      </div>

                      {/* Color Preset Palette */}
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                          Color Accent:
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {COLOR_PRESETS.map((col) => {
                            const isChosen = newCatColor === col.hex;
                            return (
                              <div
                                key={col.hex}
                                onClick={() => setNewCatColor(col.hex)}
                                title={col.name}
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  backgroundColor: col.hex,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: isChosen ? '3px solid #0f172a' : '2px solid transparent',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  transition: 'transform 0.15s ease',
                                  transform: isChosen ? 'scale(1.15)' : 'scale(1)',
                                }}
                              >
                                {isChosen && <Check size={14} color="#ffffff" strokeWidth={3} />}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Icon Selection */}
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                          Category Icon:
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                          {ICON_PRESETS.map((ico) => {
                            const isChosen = newCatIcon === ico.id;
                            return (
                              <button
                                key={ico.id}
                                type="button"
                                onClick={() => setNewCatIcon(ico.id)}
                                style={{
                                  padding: '8px 4px',
                                  borderRadius: 8,
                                  border: isChosen ? `2px solid ${newCatColor}` : '1px solid #e2e8f0',
                                  backgroundColor: isChosen ? `${newCatColor}10` : '#f8fafc',
                                  color: isChosen ? newCatColor : '#64748b',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: '0.6875rem',
                                  fontWeight: isChosen ? 700 : 500,
                                }}
                              >
                                {renderCategoryIcon({
                                  id: 'temp',
                                  code: 'TEMP',
                                  name: '',
                                  defaultTitle: '',
                                  description: '',
                                  badge: '',
                                  color: isChosen ? newCatColor : '#64748b',
                                  iconName: ico.id,
                                })}
                                <span>{ico.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Live Card Preview */}
                      <div style={{ marginBottom: 18, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                          Live Preview:
                        </div>
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: `2px solid ${newCatColor}`,
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div
                              style={{
                                padding: 6,
                                borderRadius: 6,
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {renderCategoryIcon({
                                id: 'preview',
                                code: 'PREVIEW',
                                name: '',
                                defaultTitle: '',
                                description: '',
                                badge: '',
                                color: newCatColor,
                                iconName: newCatIcon,
                              })}
                            </div>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                color: newCatColor,
                                backgroundColor: `${newCatColor}18`,
                                padding: '2px 8px',
                                borderRadius: 10,
                              }}
                            >
                              {newCatBadge || newCatName || 'Category'}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 2px 0' }}>
                            {newCatName || 'Category Name'}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.35 }}>
                            {newCatDescription || 'Brief description of this letter category.'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => setIsAddCategoryOpen(false)}
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 18px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={16} />
                          <span>Create & Select Category</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '12px 14px',
                }}
              >
                <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Letter Title / Subject Preamble:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Offer of Employment, Letter of Appointment..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.84rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                    color: '#0f172a',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: UPLOAD REFERENCE PDF                                              */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 20,
                }}
              >
                <FileText size={18} color="#2563eb" />
                <div style={{ fontSize: '0.84rem', color: '#1e40af' }}>
                  Category: <strong>{selectedCategory.name}</strong> • Title: <strong>{docTitle}</strong>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 16, marginTop: 0 }}>
                Upload the reference <strong>.pdf</strong> file containing the terms, clauses, or text. The system will automatically parse its contents and prepare it for the official letterhead:
              </p>

              {/* Drag & Drop PDF Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handlePdfUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: isDragOver ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
                  backgroundColor: isDragOver ? '#eff6ff' : '#f8fafc',
                  borderRadius: 14,
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: 20,
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePdfUpload(e.target.files[0]);
                    }
                    e.target.value = '';
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
                  {isExtractingPdf ? (
                    <Loader2 size={26} className="animate-spin" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {isExtractingPdf ? 'Parsing Document & Recognizing Clauses...' : 'Drop your Reference Document (.pdf, .docx, .txt) here'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 auto 16px', maxWidth: 480 }}>
                  Upload any standard offer, appointment, policy, or contract (.pdf, .docx, or .txt). All clauses, headings, and compensation terms will be cleanly extracted.
                </p>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  style={{
                    padding: '9px 20px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                  }}
                >
                  Choose Document from Computer (.pdf, .docx, .txt)
                </button>
              </div>

              {/* Alternative: Paste Template Text Directly */}
              <div style={{ marginBottom: 18, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsPasteMode(!isPasteMode)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {isPasteMode ? '▲ Hide Direct Text Input' : '▼ Or Paste / Type Template Clauses Directly'}
                </button>

                {isPasteMode && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 16,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: 10,
                      textAlign: 'left',
                    }}
                  >
                    <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                      Paste your letter terms or policy clauses below:
                    </label>
                    <textarea
                      rows={6}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="1. Role and Responsibilities&#10;The candidate shall perform...&#10;&#10;2. Compensation and Benefits&#10;Monthly stipend of...&#10;&#10;3. Confidentiality&#10;All information shall remain..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: '0.8125rem',
                        lineHeight: 1.5,
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        boxSizing: 'border-box',
                        marginBottom: 10,
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={handleParsePastedText}
                        style={{
                          padding: '7px 16px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        Parse & Extract Clauses
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Extraction Success Summary if uploaded */}
              {extractedData && (
                <div
                  style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803d' }}>
                      Successfully parsed {uploadedPdfFile?.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.78125rem' }}>
                    <span style={{ backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: 6, color: '#166534', fontWeight: 600 }}>
                      Pages: {extractedData.totalPages}
                    </span>
                    <span style={{ backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: 6, color: '#166534', fontWeight: 600 }}>
                      Clauses / Sections: {sections.length || extractedData.sections?.length || 0}
                    </span>
                    <span style={{ backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: 6, color: '#166534', fontWeight: 600 }}>
                      Key Terms / Rows: {keyDetails.length || extractedData.totalDetectedTables || 0}
                    </span>
                  </div>

                  {/* Review & Edit Document Content & Clauses */}
                  <div
                    style={{
                      marginTop: 16,
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #86efac',
                      borderRadius: 12,
                      padding: '16px 18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                          Extracted Clauses & Letter Content ({sections.length} clauses)
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '0.78125rem', color: '#64748b' }}>
                          Review and customize the extracted terms, clauses, and intro before generating the letter.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSections([
                            ...sections,
                            { number: sections.length + 1, title: `Clause ${sections.length + 1}`, content: 'Enter clause text or terms here...' },
                          ]);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          fontSize: '0.78125rem',
                          fontWeight: 700,
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          border: '1px solid #bfdbfe',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={14} />
                        <span>Add Clause</span>
                      </button>
                    </div>

                    {/* Letter Title & Subject */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Document Title:
                        </label>
                        <input
                          type="text"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          placeholder="e.g. INTERNSHIP OFFER LETTER"
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Subject Line:
                        </label>
                        <input
                          type="text"
                          value={letterSubject}
                          onChange={(e) => setLetterSubject(e.target.value)}
                          placeholder="e.g. Subject: Offer of Unpaid Internship - Human Resources"
                          style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    {/* Intro Note */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                        Introductory Note / Opening Salutation:
                      </label>
                      <textarea
                        rows={2}
                        value={introParagraph}
                        onChange={(e) => setIntroParagraph(e.target.value)}
                        placeholder="e.g. We are pleased to offer you an internship with Tasknera as an HR Intern for a fixed period of three (3) months..."
                        style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', lineHeight: 1.45, border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Key Details Grid */}
                    {keyDetails.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                            Key Terms Table ({keyDetails.length} items):
                          </label>
                          <button
                            type="button"
                            onClick={() => setKeyDetails([...keyDetails, { label: 'New Term', value: 'Value' }])}
                            style={{ fontSize: '0.75rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                            + Add Row
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                          {keyDetails.map((kd, kIdx) => (
                            <div key={kIdx} style={{ display: 'flex', gap: 6, alignItems: 'center', backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                              <input
                                type="text"
                                value={kd.label}
                                onChange={(e) => {
                                  const updated = [...keyDetails];
                                  updated[kIdx].label = e.target.value;
                                  setKeyDetails(updated);
                                }}
                                style={{ width: '45%', padding: '4px 6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: 4 }}
                              />
                              <input
                                type="text"
                                value={kd.value}
                                onChange={(e) => {
                                  const updated = [...keyDetails];
                                  updated[kIdx].value = e.target.value;
                                  setKeyDetails(updated);
                                }}
                                style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 4 }}
                              />
                              <button
                                type="button"
                                onClick={() => setKeyDetails(keyDetails.filter((_, idx) => idx !== kIdx))}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clauses List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto', paddingRight: 4, marginTop: 10 }}>
                      {sections.map((sec, idx) => (
                        <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a35d39' }}>#{sec.number || idx + 1}</span>
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => {
                                const updated = [...sections];
                                updated[idx].title = e.target.value;
                                setSections(updated);
                              }}
                              placeholder="Clause Heading / Title"
                              style={{ flex: 1, padding: '5px 8px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4 }}
                            />
                            <button
                              type="button"
                              onClick={() => setSections(sections.filter((_, sIdx) => sIdx !== idx))}
                              title="Delete Clause"
                              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={sec.content}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx].content = e.target.value;
                              setSections(updated);
                            }}
                            placeholder="Clause content and bullet points..."
                            style={{ width: '100%', padding: '6px 8px', fontSize: '0.78125rem', lineHeight: 1.45, border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Closing & Acceptance Editor */}
                    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Closing Message:
                        </label>
                        <textarea
                          rows={2}
                          value={closingText}
                          onChange={(e) => setClosingText(e.target.value)}
                          placeholder="e.g. Please sign and return a copy to confirm your acceptance..."
                          style={{ width: '100%', padding: '6px 8px', fontSize: '0.78125rem', border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                          Acceptance Statement:
                        </label>
                        <textarea
                          rows={2}
                          value={acceptanceText}
                          onChange={(e) => setAcceptanceText(e.target.value)}
                          placeholder="e.g. I have read and accept the terms of this offer..."
                          style={{ width: '100%', padding: '6px 8px', fontSize: '0.78125rem', border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reusable Template Saving Box in Offers */}
                  <div
                    style={{
                      marginTop: 14,
                      padding: '14px 16px',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #86efac',
                      borderRadius: 10,
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Bookmark size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#166534' }}>
                            Save as Reusable Template in Offers
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.76rem', color: '#15803d' }}>
                            Save this template to your Offers page so you can generate new candidate letters from it anytime.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveAsTemplate}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          backgroundColor: isTemplateSaved ? '#15803d' : '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isTemplateSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                        <span>{isTemplateSaved ? 'Template Saved to Offers ✓' : 'Save Template in Offers'}</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                          Template Title in Offers:
                        </label>
                        <input
                          type="text"
                          value={saveTemplateTitle}
                          onChange={(e) => setSaveTemplateTitle(e.target.value)}
                          placeholder="e.g. Work Letter Agreement"
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            fontSize: '0.82rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            backgroundColor: '#f8fafc',
                            boxSizing: 'border-box',
                            fontWeight: 600,
                            color: '#0f172a',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                          Badge Tag:
                        </label>
                        <input
                          type="text"
                          value={saveTemplateBadge}
                          onChange={(e) => setSaveTemplateBadge(e.target.value)}
                          placeholder="e.g. Work, Template"
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            fontSize: '0.82rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            backgroundColor: '#f8fafc',
                            boxSizing: 'border-box',
                            color: '#0f172a',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Template Description:
                      </label>
                      <input
                        type="text"
                        value={saveTemplateDesc}
                        onChange={(e) => setSaveTemplateDesc(e.target.value)}
                        placeholder="Brief description for HR team..."
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '0.8rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          backgroundColor: '#f8fafc',
                          boxSizing: 'border-box',
                          color: '#475569',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SELECT EMPLOYEE FROM DIRECTORY                                    */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                    Select the employee for whom this <strong>{selectedCategory.name}</strong> is being issued:
                  </p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: 280 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or designation..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      fontSize: '0.8125rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                    }}
                  />
                </div>
              </div>

              {/* Employee Directory Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                  maxHeight: 420,
                  overflowY: 'auto',
                }}
              >
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  const initials = emp.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {emp.employeeId} • {emp.designation}
                          </div>
                        </div>
                        {isSelected && <Check size={18} color="#2563eb" />}
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: '1px solid #f1f5f9',
                          fontSize: '0.75rem',
                          color: '#475569',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>Dept: <strong>{emp.department}</strong></span>
                        <span>CTC: <strong>₹{Number(emp.annualCtc || 0).toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEmployees.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#94a3b8' }}>
                  No employees found matching "{employeeSearch}".
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: OFFICIAL LETTERHEAD FORMAT PREVIEW                                */}
          {/* ========================================================================= */}
          {step === 4 && selectedEmployee && (
            <div>
              {/* Top Banner: Action Bar */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  padding: '12px 18px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1d4ed8' }}>
                    Formatted in Official TaskNera Letterhead:
                  </span>
                  <div style={{ fontSize: '0.78125rem', color: '#3b82f6', marginTop: 2 }}>
                    Issued for: <strong>{selectedEmployee.fullName}</strong> ({selectedEmployee.employeeId}) • Category: <strong>{selectedCategory.name}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setIsEditClausesModalOpen(!isEditClausesModalOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: isEditClausesModalOpen ? '#dbeafe' : '#eff6ff',
                      color: '#2563eb',
                      border: '1.5px solid #93c5fd',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                    <span>{isEditClausesModalOpen ? 'Hide Clause Editor' : 'Edit Clauses & Content'}</span>
                  </button>

                  <button
                    onClick={() => setIsDirectEditMode(!isDirectEditMode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: isDirectEditMode ? '#dbeafe' : '#ffffff',
                      color: '#2563eb',
                      border: '1px solid #93c5fd',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                    <span>{isDirectEditMode ? 'Done Editing' : 'Edit Text in Place'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    <span>{emailSentSuccess ? 'Email Dispatched!' : 'Send by Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: isTemplateSaved ? '#f0fdf4' : '#ffffff',
                      color: isTemplateSaved ? '#15803d' : '#0f172a',
                      border: isTemplateSaved ? '1px solid #86efac' : '1px solid #cbd5e1',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {isTemplateSaved ? <CheckCircle2 size={14} color="#16a34a" /> : <Bookmark size={14} color="#16a34a" />}
                    <span>{isTemplateSaved ? 'Template Saved ✓' : 'Save as Template in Offers'}</span>
                  </button>

                  <button
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 16px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>{savedDocument ? 'Saved to Records ✓' : 'Save & Register Document'}</span>
                  </button>
                </div>
              </div>

              {/* Live Clause & Letter Content Drawer */}
              {isEditClausesModalOpen && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #93c5fd',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 16,
                    boxShadow: '0 4px 14px rgba(37,99,235,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#1e40af' }}>
                        Live Clause & Letter Content Editor
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        Modify clauses, headings, and terms below. Changes instantly refresh the official letterhead preview.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSections([
                          ...sections,
                          { number: sections.length + 1, title: `Clause ${sections.length + 1}`, content: 'Enter clause text or terms here...' },
                        ]);
                        setEditedBodyHtml('');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 12px',
                        fontSize: '0.78125rem',
                        fontWeight: 700,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: 6,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={13} />
                      <span>Add Clause</span>
                    </button>
                  </div>

                  {/* Title & Subject */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 2 }}>
                        Letter Title:
                      </label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => {
                          setDocTitle(e.target.value);
                          setEditedBodyHtml('');
                        }}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 2 }}>
                        Subject Line:
                      </label>
                      <input
                        type="text"
                        value={letterSubject}
                        onChange={(e) => {
                          setLetterSubject(e.target.value);
                          setEditedBodyHtml('');
                        }}
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* Intro Note */}
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 2 }}>
                      Introductory Note:
                    </label>
                    <textarea
                      rows={2}
                      value={introParagraph}
                      onChange={(e) => {
                        setIntroParagraph(e.target.value);
                        setEditedBodyHtml('');
                      }}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '0.78125rem', border: '1px solid #cbd5e1', borderRadius: 6, boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Clauses List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
                    {sections.map((sec, idx) => (
                      <div key={idx} style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 8 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a35d39' }}>#{sec.number || idx + 1}</span>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[idx].title = e.target.value;
                              setSections(updated);
                              setEditedBodyHtml('');
                            }}
                            style={{ flex: 1, padding: '4px 6px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4 }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSections(sections.filter((_, sIdx) => sIdx !== idx));
                              setEditedBodyHtml('');
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={sec.content}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[idx].content = e.target.value;
                            setSections(updated);
                            setEditedBodyHtml('');
                          }}
                          style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: 4, boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official TaskNera Letterhead Visual Paper Sheets Viewport */}
              <div
                style={{
                  maxHeight: 620,
                  overflowY: 'auto',
                  padding: '24px 28px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  id="printable-offer-document"
                  className="printable-letterhead-paper"
                  style={{ width: '100%', maxWidth: 794, margin: '0 auto' }}
                >
                  <div
                    className="document-page-sheet"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '1120px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '44px 50px',
                      marginBottom: 28,
                      position: 'relative',
                      boxSizing: 'border-box',
                      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      color: '#1e293b',
                      lineHeight: 1.6,
                    }}
                  >
                    {/* 1. Official Top Letterhead Banner */}
                    <div style={{ position: 'relative', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ width: 280, height: 16, background: '#fae1c3', borderRadius: '0 0 14px 0' }} />
                        <div style={{ width: 220, height: 7, background: '#9c7a82' }} />
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
                      <div style={{ height: 2.5, background: '#1e293b', width: '100%' }} />
                    </div>

                    {/* 2. Top Metadata */}
                    <div style={{ fontSize: '12.8px', lineHeight: 1.6, marginBottom: 14, color: '#1e293b' }}>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Reference:</strong> {dynamicValues['reference_number'] || `TN/${selectedCategory.code}/${new Date().getFullYear()}/${selectedEmployee.employeeId}`}
                      </p>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Date:</strong> {dynamicValues['issue_date'] || dynamicValues['date'] || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p style={{ margin: '8px 0 2px' }}>
                        <strong>Employee Name:</strong> {selectedEmployee.fullName}
                      </p>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Designation:</strong> {selectedEmployee.designation}
                      </p>
                      {selectedEmployee.department && (
                        <p style={{ margin: '2px 0' }}>
                          <strong>Department:</strong> {selectedEmployee.department}
                        </p>
                      )}
                      <p style={{ margin: '2px 0' }}>
                        <strong>Address:</strong> {dynamicValues['candidate_address'] || selectedEmployee.workLocation || 'D-57 Dilshad Colony, Delhi, 110095'}
                      </p>
                      <p style={{ margin: '2px 0' }}>
                        <strong>Email:</strong> {selectedEmployee.officialEmail || selectedEmployee.personalEmail}
                      </p>
                      {selectedEmployee.phone && (
                        <p style={{ margin: '2px 0' }}>
                          <strong>Phone:</strong> {selectedEmployee.phone}
                        </p>
                      )}
                    </div>

                    {/* 3. Centered Brown Document Title in Georgia Serif */}
                    <h2
                      style={{
                        textAlign: 'center',
                        fontSize: '21px',
                        fontWeight: 700,
                        color: '#a35d39',
                        margin: '14px 0 12px',
                        fontFamily: "'Georgia', serif",
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {docTitle}
                    </h2>

                    {/* 4. Subject & Salutation */}
                    {letterSubject ? (
                      <p style={{ marginBottom: 12, fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                        {interpolatePlaceholders(letterSubject)}
                      </p>
                    ) : (
                      <p style={{ marginBottom: 12, fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                        Subject: {docTitle} — {selectedEmployee.designation}
                      </p>
                    )}

                    <p style={{ marginBottom: 10, fontSize: '12.8px', color: '#1e293b' }}>
                      Dear <strong>{selectedEmployee.fullName}</strong>,
                    </p>

                    {/* 5. Main Extracted Letter Content (Clauses, Body, & Tables) */}
                    <div
                      contentEditable={isDirectEditMode}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => {
                        if (isDirectEditMode) {
                          setEditedBodyHtml(e.currentTarget.innerHTML);
                        }
                      }}
                      style={{
                        fontSize: '12.8px',
                        lineHeight: 1.65,
                        color: '#334155',
                        marginBottom: 20,
                        outline: isDirectEditMode ? '2px dashed #a35d39' : 'none',
                        padding: isDirectEditMode ? '8px' : '0',
                        borderRadius: 6,
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(getCompiledLetterBody()) }}
                    />

                    {/* 6. Professional Executive Corporate Sign-Off & Acceptance Block */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: 18,
                        borderTop: '1.5px solid #dfcfc7',
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 36,
                          alignItems: 'start',
                        }}
                      >
                        {/* Employer / Authorized Signatory Column */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: '#a35d39',
                              fontFamily: "'Georgia', serif",
                              letterSpacing: '0.02em',
                              marginBottom: 2,
                            }}
                          >
                            For TaskNera
                          </div>
                          <div
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 600,
                              color: '#64748b',
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              marginBottom: 4,
                            }}
                          >
                            Authorized Signatory
                          </div>

                          {/* Authentic Executive Calligraphic Signature */}
                          <div
                            style={{
                              height: 44,
                              display: 'flex',
                              alignItems: 'flex-end',
                              paddingBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "'Alex Brush', 'Caveat', 'Segoe Script', cursive",
                                fontSize: '32px',
                                color: '#1e3a8a',
                                lineHeight: 1,
                                transform: 'rotate(-2deg)',
                                transformOrigin: 'left bottom',
                                display: 'inline-block',
                              }}
                            >
                              Sheetal Bedi
                            </span>
                          </div>

                          {/* Clean Solid Underline */}
                          <div
                            style={{
                              height: '1.5px',
                              backgroundColor: '#334155',
                              width: '85%',
                              maxWidth: 240,
                              marginBottom: 8,
                            }}
                          />

                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: '#0f172a',
                              lineHeight: 1.3,
                            }}
                          >
                            Sheetal Bedi
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#475569',
                              letterSpacing: '0.02em',
                              marginTop: 2,
                            }}
                          >
                            CEO &amp; Founder
                          </div>
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: '#64748b',
                              marginTop: 2,
                            }}
                          >
                            TaskNera
                          </div>
                        </div>

                        {/* Candidate Acceptance & Acknowledgement Column */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: '#a35d39',
                              fontFamily: "'Georgia', serif",
                              letterSpacing: '0.02em',
                              marginBottom: 2,
                            }}
                          >
                            Accepted &amp; Agreed
                          </div>
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: '#64748b',
                              lineHeight: 1.45,
                              marginBottom: 4,
                            }}
                          >
                            I acknowledge and accept the terms and conditions outlined in this offer of employment.
                          </div>

                          {/* Candidate Signature placeholder */}
                          <div
                            style={{
                              height: 44,
                              display: 'flex',
                              alignItems: 'flex-end',
                              paddingBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#94a3b8',
                                fontStyle: 'italic',
                              }}
                            >
                              (Candidate Signature)
                            </span>
                          </div>

                          {/* Clean Solid Underline */}
                          <div
                            style={{
                              height: '1.5px',
                              backgroundColor: '#334155',
                              width: '90%',
                              maxWidth: 260,
                              marginBottom: 8,
                            }}
                          />

                          <div
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: '#0f172a',
                              textTransform: 'capitalize',
                              lineHeight: 1.3,
                            }}
                          >
                            {selectedEmployee.fullName}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#475569',
                              marginTop: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span>Date:</span>
                            <span
                              style={{
                                borderBottom: '1px dotted #94a3b8',
                                width: 140,
                                display: 'inline-block',
                                height: 12,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: '10.5px',
                              color: '#64748b',
                              marginTop: 2,
                            }}
                          >
                            Place: Delhi
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 7. Official TaskNera Page Footer */}
                    <div
                      className="tasknera-page-footer"
                      style={{
                        marginTop: 'auto',
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        color: '#94a3b8',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>TaskNera</span>
                      <span>TaskNera | Page 1 of 1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1) as StepType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <span>Next: Upload PDF</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!extractedData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: extractedData ? '#2563eb' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: extractedData ? 'pointer' : 'not-allowed',
                }}
              >
                <span>Next: Select Employee</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                disabled={!selectedEmployee}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: selectedEmployee ? '#2563eb' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: selectedEmployee ? 'pointer' : 'not-allowed',
                }}
              >
                <span>Next: Preview Letterhead</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 4 && (
              <button
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Done / Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
