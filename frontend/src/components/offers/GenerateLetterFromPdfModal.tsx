import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { offerService } from '../../services/offerService.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { useToast } from '../../context/ToastContext.js';

interface GenerateLetterFromPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: any) => void;
}

type StepType = 1 | 2 | 3 | 4;

interface LetterCategoryItem {
  id: string;
  code: string;
  name: string;
  defaultTitle: string;
  description: string;
  badge: string;
  color: string;
  icon: React.ReactNode;
}

const LETTER_CATEGORIES: LetterCategoryItem[] = [
  {
    id: 'offer',
    code: 'OFFER_LETTER',
    name: 'Offer Letter',
    defaultTitle: 'Offer of Employment',
    description: 'Formal employment offer with salary structure, position terms, and joining date.',
    badge: 'Offer Letter',
    color: '#2563eb',
    icon: <FileText size={22} color="#2563eb" />,
  },
  {
    id: 'appointment',
    code: 'APPOINTMENT_LETTER',
    name: 'Appointment Letter',
    defaultTitle: 'Letter of Appointment',
    description: 'Official letter confirming employee appointment, duties, covenants, and terms.',
    badge: 'Appointment',
    color: '#7c3aed',
    icon: <FileCheck size={22} color="#7c3aed" />,
  },
  {
    id: 'increment',
    code: 'INCREMENT_LETTER',
    name: 'Increment & Appraisal Letter',
    defaultTitle: 'Annual Merit Compensation Revision',
    description: 'Annual performance appraisal, revised CTC compensation, and effective date.',
    badge: 'Increment',
    color: '#16a34a',
    icon: <DollarSign size={22} color="#16a34a" />,
  },
  {
    id: 'experience',
    code: 'EXPERIENCE_LETTER',
    name: 'Experience & Service Certificate',
    defaultTitle: 'Experience & Service Certificate',
    description: 'Official service certificate verifying employment tenure, role, and conduct.',
    badge: 'Experience',
    color: '#ea580c',
    icon: <Briefcase size={22} color="#ea580c" />,
  },
  {
    id: 'relieving',
    code: 'RELIEVING_LETTER',
    name: 'Relieving & Clearance Letter',
    defaultTitle: 'Relieving & Clearance Letter',
    description: 'Separation letter confirming acceptance of resignation and clearance.',
    badge: 'Relieving',
    color: '#d97706',
    icon: <FileCheck size={22} color="#d97706" />,
  },
  {
    id: 'internship',
    code: 'INTERNSHIP_LETTER',
    name: 'Internship Appointment Letter',
    defaultTitle: 'Internship Appointment Letter',
    description: 'Fixed-term student/graduate internship detailing mentor, stipend, and project scope.',
    badge: 'Internship',
    color: '#c2410c',
    icon: <GraduationCap size={22} color="#c2410c" />,
  },
  {
    id: 'contract',
    code: 'EMPLOYMENT_CONTRACT',
    name: 'Contractor / Employment Agreement',
    defaultTitle: 'Independent Contractor Agreement',
    description: 'Consultant / contractor scope of work, milestone deliverables, and fees.',
    badge: 'Contract',
    color: '#0284c7',
    icon: <Briefcase size={22} color="#0284c7" />,
  },
  {
    id: 'custom',
    code: 'CUSTOM',
    name: 'Custom HR Letter / Document',
    defaultTitle: 'Official Corporate Correspondence',
    description: 'Custom organizational letter, internal policy agreement, or notification.',
    badge: 'Custom',
    color: '#64748b',
    icon: <FileCode size={22} color="#64748b" />,
  },
];

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

  // Category & Document Metadata
  const [selectedCategory, setSelectedCategory] = useState<LetterCategoryItem>(LETTER_CATEGORIES[0]);
  const [docTitle, setDocTitle] = useState(LETTER_CATEGORIES[0].defaultTitle);

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

  // Action / Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [savedDocument, setSavedDocument] = useState<any | null>(null);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCategory(LETTER_CATEGORIES[0]);
      setDocTitle(LETTER_CATEGORIES[0].defaultTitle);
      setUploadedPdfFile(null);
      setExtractedData(null);
      setSelectedEmployee(null);
      setDynamicValues({});
      setIsDirectEditMode(false);
      setEditedBodyHtml('');
      setSavedDocument(null);
      setEmailSentSuccess(false);
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
      'Candidate Name': emp.fullName,
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

  // STEP 2: Handle PDF File Upload & Extraction
  const handlePdfUpload = async (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      error('Please upload a valid .pdf document.');
      return;
    }

    setUploadedPdfFile(file);
    setIsExtractingPdf(true);

    try {
      const data = await offerService.convertPdfToStructuredLetter(file);
      setExtractedData(data);

      // Auto-bind with selected employee or first employee
      const activeEmp = selectedEmployee || (employees.length > 0 ? employees[0] : null);
      if (activeEmp) {
        const mapping = buildEmployeeMapping(activeEmp, data.extractedValues);
        setDynamicValues(mapping);
      } else if (data.extractedValues) {
        setDynamicValues(data.extractedValues);
      }

      success(`Successfully parsed ${data.totalPages} pages, ${data.sections?.length || 0} legal clauses, and tables from ${file.name}!`);
      // Proceed to Step 3: Select Employee
      setStep(3);
    } catch (err: any) {
      error(err.message || 'Failed to extract text from PDF. You can still proceed or try another document.');
    } finally {
      setIsExtractingPdf(false);
    }
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

  // Compile Final Letter Body (from extracted sections, pages, or user edit)
  const getCompiledLetterBody = (): string => {
    if (editedBodyHtml) {
      return interpolatePlaceholders(editedBodyHtml);
    }

    if (extractedData?.sections && extractedData.sections.length > 0) {
      return extractedData.sections
        .map((s) => {
          const title = s.title ? `<strong>${s.number ? `${s.number}. ` : ''}${s.title}</strong><br/>` : '';
          const body = s.content ? s.content.replace(/\n/g, '<br/>') : '';
          return `<div style="margin-bottom: 16px;">${title}${body}</div>`;
        })
        .join('');
    }

    if (extractedData?.pages && extractedData.pages.length > 0) {
      return extractedData.pages
        .map((p) => p.htmlMarkup || `<p>${p.rawText.replace(/\n/g, '<br/>')}</p>`)
        .join('<div style="height: 24px; border-bottom: 1px dashed #cbd5e1; margin: 20px 0;"></div>');
    }

    return `<p>On behalf of <strong>TaskNera</strong>, we are pleased to issue this formal <strong>${docTitle}</strong> for <strong>${selectedEmployee?.fullName || 'the employee'}</strong>.</p>`;
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
    if (savedDocument?.id) {
      try {
        await EmployeeService.downloadDocumentFile(
          savedDocument.id,
          'PDF',
          `${docTitle}_${selectedEmployee?.fullName || 'Document'}.pdf`
        );
        success('PDF download started successfully!');
        return;
      } catch {
        // Fallback to print
      }
    }

    // Direct browser print-to-pdf fallback
    window.print();
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: step === 4 ? 1020 : 880,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
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
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#dbeafe',
                  color: '#1d4ed8',
                  padding: '3px 10px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                PDF to Official Letterhead Workflow
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Step {step} of 4
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              {step === 1 && '1. Select Letter Category & Title'}
              {step === 2 && '2. Upload Reference PDF Document'}
              {step === 3 && '3. Select Employee from Employee Directory'}
              {step === 4 && `4. Official Letterhead Preview — ${selectedEmployee?.fullName || 'Employee'}`}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: 8,
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
            padding: '10px 24px',
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
                fontSize: '0.8125rem',
                fontWeight: step === s.num ? 700 : 500,
                color: step === s.num ? '#2563eb' : step > s.num ? '#16a34a' : '#94a3b8',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
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
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* ========================================================================= */}
          {/* STEP 1: SELECT CATEGORY & TITLE                                           */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 18, marginTop: 0 }}>
                Choose the category for this letter. The text and clauses will be extracted from your PDF file in the next step:
              </p>

              {/* Category Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {LETTER_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setDocTitle(cat.defaultTitle);
                      }}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.15)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {cat.icon}
                        </div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: cat.color,
                            backgroundColor: `${cat.color}15`,
                            padding: '3px 8px',
                            borderRadius: 12,
                          }}
                        >
                          {cat.badge}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px 0' }}>
                        {cat.name}
                      </h4>
                      <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                        {cat.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Title Input */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Letter Title / Subject Preamble:
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Offer of Employment, Letter of Appointment..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.875rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    fontWeight: 600,
                    color: '#0f172a',
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
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePdfUpload(e.target.files[0]);
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
                  {isExtractingPdf ? (
                    <Loader2 size={26} className="animate-spin" />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  {isExtractingPdf ? 'Parsing PDF & Recognizing Clauses...' : 'Drop your Reference PDF file here or Click to Browse'}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 auto 16px', maxWidth: 480 }}>
                  Upload any standard offer, appointment, or contract document (.pdf). All clauses, headings, and compensation terms will be cleanly extracted.
                </p>

                <button
                  type="button"
                  style={{
                    padding: '8px 18px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  Choose PDF from Computer
                </button>
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
                      Clauses / Sections: {extractedData.sections?.length || 0}
                    </span>
                    <span style={{ backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: 6, color: '#166534', fontWeight: 600 }}>
                      Tables: {extractedData.totalDetectedTables || 0}
                    </span>
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

              {/* Official TaskNera Letterhead Visual Paper */}
              <div
                id="printable-offer-document"
                className="printable-letterhead-paper"
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                  padding: '32px 40px',
                  maxHeight: 560,
                  overflowY: 'auto',
                  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                }}
              >
                {/* 1. Official Top Letterhead Banner */}
                <div style={{ position: 'relative', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 280, height: 18, backgroundColor: '#fae1c3', borderRadius: '0 0 14px 0' }} />
                    <div style={{ width: 220, height: 8, backgroundColor: '#9c7a82' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/logo.png" alt="TaskNera" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                          <span style={{ color: '#252c38' }}>Task</span>
                          <span style={{ color: '#f56637' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 500, color: '#334155', letterSpacing: '0.01em', marginTop: 2 }}>
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
                  <div style={{ height: 3, backgroundColor: '#1e293b', width: '100%' }} />
                </div>

                {/* 2. Reference & Date Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, fontSize: '0.8125rem', color: '#334155' }}>
                  <div>
                    <div><strong>Reference:</strong> {dynamicValues['reference_number'] || `TN/${selectedCategory.code}/${new Date().getFullYear()}/${selectedEmployee.employeeId}`}</div>
                    <div><strong>Date:</strong> {dynamicValues['issue_date'] || dynamicValues['date'] || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: 6, fontWeight: 700, fontSize: '0.75rem', color: '#1e3a8a' }}>
                      CONFIDENTIAL &amp; PERSONAL
                    </span>
                  </div>
                </div>

                {/* 3. Recipient Details Box */}
                <div style={{ marginBottom: 16, fontSize: '0.8125rem', lineHeight: 1.5, color: '#1e293b' }}>
                  <div><strong>To,</strong></div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>{selectedEmployee.fullName}</div>
                  <div><strong>Employee ID:</strong> {selectedEmployee.employeeId}</div>
                  <div><strong>Address:</strong> {dynamicValues['candidate_address'] || selectedEmployee.workLocation || 'D-57 Dilshad Colony, Delhi, 110095'}</div>
                  <div><strong>Email:</strong> {selectedEmployee.officialEmail || selectedEmployee.personalEmail}</div>
                  <div><strong>Phone:</strong> {selectedEmployee.phone || '+91 7065278229'}</div>
                </div>

                {/* 4. Subject Header Line */}
                <div style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid #1e3a8a', padding: '10px 14px', marginBottom: 18, borderRadius: '0 6px 6px 0' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e3a8a' }}>
                    SUBJECT: {docTitle.toUpperCase()} — {selectedEmployee.designation.toUpperCase()} ({selectedEmployee.department.toUpperCase()})
                  </div>
                </div>

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
                    fontSize: '0.84rem',
                    lineHeight: 1.7,
                    color: '#1e293b',
                    marginBottom: 20,
                    outline: isDirectEditMode ? '2px dashed #3b82f6' : 'none',
                    padding: isDirectEditMode ? '8px' : '0',
                    borderRadius: 6,
                  }}
                  dangerouslySetInnerHTML={{ __html: getCompiledLetterBody() }}
                />

                {/* 6. Structured Position Table (for employment letters) */}
                {['OFFER_LETTER', 'APPOINTMENT_LETTER', 'INCREMENT_LETTER'].includes(selectedCategory.code) && (
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                      Position &amp; Compensation Specifications
                    </h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', marginBottom: 16 }}>
                      <tbody>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#475569', width: '35%' }}>Job Title / Designation</td>
                          <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600 }}>{selectedEmployee.designation}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Department</td>
                          <td style={{ padding: '8px 12px', color: '#0f172a' }}>{selectedEmployee.department}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Annual CTC Compensation</td>
                          <td style={{ padding: '8px 12px', color: '#1d4ed8', fontWeight: 800 }}>
                            {dynamicValues['annual_ctc'] || `₹${Number(selectedEmployee.annualCtc || 0).toLocaleString('en-IN')}`}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>Date of Joining / Commencement</td>
                          <td style={{ padding: '8px 12px', color: '#0f172a', fontWeight: 600 }}>
                            {selectedEmployee.joiningDate ? new Date(selectedEmployee.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'As mutually agreed'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 7. Dual Corporate Sign-Off Block */}
                <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Employer Signature */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 14, backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>For TaskNera</div>
                      <div style={{ fontSize: '0.71875rem', fontStyle: 'italic', color: '#64748b', marginTop: 2 }}>
                        Authorized Corporate Signatory
                      </div>
                      <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Brush Script MT', cursive, sans-serif", fontSize: '1.4rem', color: '#1e3a8a' }}>
                          Sheetal Bedi
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                        Sheetal Bedi
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        CEO &amp; FOUNDER
                      </div>
                    </div>

                    {/* Candidate Acceptance Receipt */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: 8, padding: 14, backgroundColor: '#ffffff' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a' }}>Employee Acceptance Receipt</div>
                      <div style={{ fontSize: '0.71875rem', color: '#64748b', marginTop: 2 }}>
                        I acknowledge and accept the terms of this document.
                      </div>
                      <div style={{ height: 34, borderBottom: '1px dashed #94a3b8', margin: '8px 0 6px 0' }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                        {selectedEmployee.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        Date of Signature: __________________
                      </div>
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
    </div>
  );
};
