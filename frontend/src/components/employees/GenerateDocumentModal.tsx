// =============================================================================
// COMPLETE DOCUMENT GENERATION WORKFLOW MODAL
// =============================================================================
// Flowchart Implementation:
// Admin/HR Login
//   -> Add New Employee -> Enter Employee Information -> Employee Database
//   -> Document Generation
//   -> Select Template (Offer Letter | Increment Letter | Appointment Letter | Upload Custom Template)
//   -> Select Employee (Select: Ajay)
//   -> Fetch Ajay's Employee Data
//   -> Template Placeholder Mapping
//   -> Generate Document
//   -> Document Preview
//   -> HR Action: [Edit / Regenerate] or [Generate Final PDF]
//   -> Action:
//        ├─► [Download] -> Save Document History
//        └─► [Send by Email] -> Attach Generated PDF -> Send to Employee Email
//              -> Save Email Log -> Save Document History
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Search,
  Upload,
  Mail,
  Send,
  User,
  Check,
  RefreshCw,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  FileCheck,
  Clock,
  Paperclip,
} from 'lucide-react';
import {
  Employee,
  EmployeeService,
  DocumentTemplateItem,
  EmployeeDocument,
} from '../../services/employeeService.js';

interface GenerateDocumentModalProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onDocumentGenerated?: () => void;
}

type FlowStep = 1 | 2 | 3 | 4 | 5;
// Step 1: Select Template
// Step 2: Select Employee (Select: Ajay)
// Step 3: Fetch Employee Data & Template Placeholder Mapping
// Step 4: Generate Document -> Document Preview (HR Action: Edit/Regenerate or Generate Final PDF)
// Step 5: Action (Download -> Save Document History | Send by Email -> Attach PDF -> Send to Employee Email -> Save Email Log -> Save Document History)

export const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({
  employee: initialEmployee,
  isOpen,
  onClose,
  onDocumentGenerated,
}) => {
  const [step, setStep] = useState<FlowStep>(1);

  // Templates
  const [templates, setTemplates] = useState<DocumentTemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateItem | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Custom Template Upload
  const [isCustomTemplateMode, setIsCustomTemplateMode] = useState(false);
  const [customTemplateMarkup, setCustomTemplateMarkup] = useState('');
  const [customTemplateTitle, setCustomTemplateTitle] = useState('Custom HR Letter Template');

  // Employees
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(initialEmployee || null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Placeholder Mapping
  const [mappedPlaceholders, setMappedPlaceholders] = useState<Record<string, string>>({});
  const [docTitle, setDocTitle] = useState('');
  const [docParams, setDocParams] = useState<Record<string, any>>({});

  // Preview & Generation
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<EmployeeDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Email Dispatch State (Action step)
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const [emailLogInfo, setEmailLogInfo] = useState<any | null>(null);
  const [downloadSuccessBadge, setDownloadSuccessBadge] = useState(false);

  // Optional AI Assistant
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiCompleteness, setAiCompleteness] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (initialEmployee) {
        setSelectedEmployee(initialEmployee);
      }
      setStep(1);
      setError(null);
      setGeneratedDoc(null);
      setEmailSentSuccess(false);
      setEmailLogInfo(null);
      setDownloadSuccessBadge(false);
      setAiFeedback(null);
      setAiCompleteness(null);
    }
  }, [isOpen, initialEmployee]);

  const loadInitialData = async () => {
    try {
      const [tplList, empList] = await Promise.all([
        EmployeeService.listTemplates(),
        EmployeeService.listEmployees(),
      ]);
      setTemplates(tplList);
      setEmployees(empList);

      // If no employee was passed, look for Ajay Sharma or default to first
      if (!initialEmployee && empList.length > 0) {
        const ajay = empList.find((e) => e.fullName.toLowerCase().includes('ajay'));
        if (ajay) {
          setSelectedEmployee(ajay);
        } else {
          setSelectedEmployee(empList[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load templates or employees');
    }
  };

  // Helper: auto build placeholder mapping for selected employee
  const buildPlaceholderMapping = (emp: Employee, tpl: DocumentTemplateItem, customMarkup?: string) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const ctcFormatted = emp.annualCtc
      ? `$${Number(emp.annualCtc).toLocaleString('en-US')} USD`
      : '$120,000 USD';

    const baseMap: Record<string, string> = {
      employee_name: emp.fullName,
      candidate_name: emp.fullName,
      employee_id: emp.employeeId,
      designation: emp.designation,
      job_title: emp.designation,
      department: emp.department,
      joining_date: emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'October 15, 2026',
      date_of_joining: emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'October 15, 2026',
      reporting_manager: emp.reportingManager || 'Sarah Jenkins',
      employment_type: emp.employmentType || 'Full-time',
      annual_ctc: ctcFormatted,
      total_ctc: ctcFormatted,
      salary: ctcFormatted,
      company_name: 'Acme Technologies Inc.',
      issue_date: today,
      date: today,
      work_location: emp.workLocation || 'New York, NY (Hybrid)',
      location: emp.workLocation || 'New York, NY (Hybrid)',
      personal_email: emp.personalEmail || '',
      official_email: emp.officialEmail || emp.personalEmail || 'ajay@acme.com',
      email: emp.officialEmail || emp.personalEmail || 'ajay@acme.com',
      phone: emp.phone || '+1 (555) 234-5678',
      currency: emp.currency || 'USD',
      probation_period: '90 days',
      notice_period: '30 days',
      signatory_name: 'Sarah Jenkins',
      signatory_title: 'VP of People Operations',
    };

    // If template has specific docFields with defaults, merge them
    if (tpl.docSpecificFields) {
      tpl.docSpecificFields.forEach((f) => {
        if (f.defaultValue && !baseMap[f.key]) {
          baseMap[f.key] = String(f.defaultValue);
        }
      });
    }

    // Extract any additional {{placeholders}} present in markup
    const markupToScan = customMarkup || tpl.contentMarkup;
    const matches = markupToScan.match(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g);
    if (matches) {
      matches.forEach((m) => {
        const cleanKey = m.replace(/[\{\}\s]/g, '');
        if (baseMap[cleanKey] === undefined) {
          baseMap[cleanKey] = cleanKey.replace(/_/g, ' ').toUpperCase();
        }
      });
    }

    return baseMap;
  };

  // STEP 1: Select Template
  const handleSelectTemplate = (template: DocumentTemplateItem) => {
    setSelectedTemplate(template);
    setIsCustomTemplateMode(template.code === 'CUSTOM_TEMPLATE');
    if (template.code === 'CUSTOM_TEMPLATE' && !customTemplateMarkup) {
      setCustomTemplateMarkup(template.contentMarkup);
    }

    if (selectedEmployee) {
      const mapping = buildPlaceholderMapping(selectedEmployee, template);
      setMappedPlaceholders(mapping);
      setDocParams(mapping);
      setDocTitle(`${template.name} - ${selectedEmployee.fullName}`);
    }

    // Proceed to Step 2: Select Employee
    setStep(2);
  };

  // Upload custom template file handler
  const handleCustomTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomTemplateTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCustomTemplateMarkup(text);
      }
    };
    reader.readAsText(file);
  };

  // STEP 2: Select Employee
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    if (selectedTemplate) {
      const mapping = buildPlaceholderMapping(emp, selectedTemplate, isCustomTemplateMode ? customTemplateMarkup : undefined);
      setMappedPlaceholders(mapping);
      setDocParams(mapping);
      setDocTitle(`${selectedTemplate.name} - ${emp.fullName}`);
    }
    // Proceed to Step 3: Fetch Employee Data & Template Placeholder Mapping
    setStep(3);
  };

  // STEP 3: Generate Document (Interpolates and triggers preview)
  const handleGeneratePreview = async () => {
    if (!selectedTemplate || !selectedEmployee) return;
    setPreviewLoading(true);
    setError(null);

    try {
      const preview = await EmployeeService.previewDocument(
        selectedEmployee.id,
        selectedTemplate.code,
        mappedPlaceholders
      );
      setPreviewContent(preview.renderedContent);
      setStep(4);
    } catch (err: any) {
      // Fallback local interpolation if server endpoint is busy
      let localRendered = isCustomTemplateMode && customTemplateMarkup
        ? customTemplateMarkup
        : selectedTemplate.contentMarkup;

      Object.entries(mappedPlaceholders).forEach(([k, v]) => {
        localRendered = localRendered.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
      });
      setPreviewContent(localRendered);
      setStep(4);
    } finally {
      setPreviewLoading(false);
    }
  };

  // STEP 4 -> HR Action: Generate Final PDF
  const handleGenerateFinalPdf = async () => {
    if (!selectedTemplate || !selectedEmployee) return;
    setGenerating(true);
    setError(null);
    try {
      const created = await EmployeeService.generateDocument(selectedEmployee.id, {
        templateCode: selectedTemplate.code,
        customTemplateMarkup: isCustomTemplateMode ? customTemplateMarkup : undefined,
        title: docTitle || `${selectedTemplate.name} - ${selectedEmployee.fullName}`,
        customParameters: mappedPlaceholders,
        targetStatus: 'APPROVED',
      });

      setGeneratedDoc(created);

      // Pre-fill email action details
      const primaryEmail = selectedEmployee.officialEmail || selectedEmployee.personalEmail || 'ajay@acme.com';
      setEmailTo(primaryEmail);
      setEmailSubject(`${created.title} - Official Copy`);
      setEmailMessage(
        `Dear ${selectedEmployee.fullName},\n\nPlease find attached your official ${selectedTemplate.name} issued by Acme Technologies Inc.\n\nBest regards,\nPeople Operations Team\nAcme Technologies Inc.`
      );

      // Advance to Step 5: Action (Download / Send by Email)
      setStep(5);
      if (onDocumentGenerated) {
        onDocumentGenerated();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate official final PDF');
    } finally {
      setGenerating(false);
    }
  };

  // STEP 5 Action: Download PDF -> Save Document History
  const handleDownloadPdf = async () => {
    if (!generatedDoc) return;
    try {
      await EmployeeService.downloadDocumentFile(
        generatedDoc.id,
        'PDF',
        generatedDoc.title,
        generatedDoc.currentVersion
      );
      setDownloadSuccessBadge(true);
    } catch (err: any) {
      setError(err.message || 'Failed to download PDF');
    }
  };

  // STEP 5 Action: Send by Email -> Attach Generated PDF -> Send to Employee Email -> Save Email Log -> Save Document History
  const handleSendEmail = async () => {
    if (!generatedDoc) return;
    setEmailSending(true);
    setError(null);
    try {
      const result = await EmployeeService.sendDocumentEmail(generatedDoc.id, {
        to: emailTo,
        subject: emailSubject,
        message: emailMessage,
      });

      setEmailSentSuccess(true);
      setEmailLogInfo(result.emailLog);
      if (result.document) {
        setGeneratedDoc(result.document);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch document by email');
    } finally {
      setEmailSending(false);
    }
  };

  if (!isOpen) return null;

  // Filter templates
  const primaryTemplates = [
    {
      code: 'OFFER_LETTER',
      label: 'Predefined Offer Letter',
      category: 'Offer Letter',
      desc: 'Standard employment offer with role, compensation, and joining terms.',
      badge: 'Offer Letter',
      badgeColor: '#2563eb',
      icon: <FileText size={22} color="#2563eb" />,
    },
    {
      code: 'INCREMENT_LETTER',
      label: 'Predefined Increment Letter',
      category: 'Increment Letter',
      desc: 'Annual merit appraisal, revised CTC compensation, and effective date.',
      badge: 'Increment',
      badgeColor: '#16a34a',
      icon: <DollarSign size={22} color="#16a34a" />,
    },
    {
      code: 'APPOINTMENT_LETTER',
      label: 'Predefined Appointment Letter',
      category: 'Appointment Letter',
      desc: 'Formal letter of appointment confirming role, duties, and covenants.',
      badge: 'Appointment',
      badgeColor: '#7c3aed',
      icon: <FileCheck size={22} color="#7c3aed" />,
    },
    {
      code: 'CUSTOM_TEMPLATE',
      label: 'Upload Custom Template',
      category: 'Custom Template',
      desc: 'Upload a custom .docx / .txt file or write custom text with {{placeholders}}.',
      badge: 'Upload / Custom',
      badgeColor: '#ea580c',
      icon: <Upload size={22} color="#ea580c" />,
    },
  ];

  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      e.fullName.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 1000,
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
          maxWidth: step >= 4 ? 980 : 860,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
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
                Document Generation Flow
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Step {step} of 5
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
              {step === 1 && 'Select Template'}
              {step === 2 && 'Select Employee (Select: Ajay)'}
              {step === 3 && `Template Placeholder Mapping — ${selectedEmployee?.fullName || 'Employee'}`}
              {step === 4 && 'Document Preview & HR Action'}
              {step === 5 && 'Action: Download or Send by Email'}
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

        {/* Step Indicator Bar */}
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
            { num: 1, label: 'Select Template' },
            { num: 2, label: 'Select Employee' },
            { num: 3, label: 'Placeholder Mapping' },
            { num: 4, label: 'Preview & HR Action' },
            { num: 5, label: 'Action & Dispatch' },
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
              {s.num < 5 && <span style={{ color: '#cbd5e1' }}>→</span>}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: SELECT TEMPLATE                                                  */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 16, marginTop: 0 }}>
                Choose one of the 4 document templates shown in your flow, or upload a custom template:
              </p>

              {/* 4 Prominent Diagram Template Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 14,
                  marginBottom: 20,
                }}
              >
                {primaryTemplates.map((pt) => {
                  const isSelected = selectedTemplate?.code === pt.code;
                  return (
                    <div
                      key={pt.code}
                      onClick={() => {
                        const fullTpl = templates.find((t) => t.code === pt.code) || {
                          code: pt.code,
                          category: pt.category,
                          name: pt.label,
                          description: pt.desc,
                          supportedFormats: ['PDF', 'DOCX'],
                          defaultDocxAvailable: true,
                          requiredEmployeePlaceholders: ['employee_name', 'designation', 'annual_ctc'],
                          docSpecificFields: [],
                          contentMarkup: '',
                        };
                        handleSelectTemplate(fullTpl);
                      }}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none',
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
                          {pt.icon}
                        </div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: pt.badgeColor,
                            backgroundColor: `${pt.badgeColor}15`,
                            padding: '3px 8px',
                            borderRadius: 12,
                          }}
                        >
                          {pt.badge}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '12px 0 4px 0' }}>
                        {pt.label}
                      </h4>
                      <p style={{ fontSize: '0.78125rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                        {pt.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Upload Custom Template Zone if selected */}
              {selectedTemplate?.code === 'CUSTOM_TEMPLATE' && (
                <div
                  style={{
                    backgroundColor: '#fff7ed',
                    border: '1px dashed #ea580c',
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Upload size={18} color="#ea580c" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#9a3412' }}>
                      Upload Custom Template (.DOCX / .TXT) or Edit Markup
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".docx,.txt,.html,.md"
                    onChange={handleCustomTemplateFileUpload}
                    style={{ fontSize: '0.8125rem', marginBottom: 12 }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#7c2d12', display: 'block', marginBottom: 4 }}>
                      Template Markup with Placeholders (e.g. &#123;&#123;employee_name&#125;&#125;, &#123;&#123;designation&#125;&#125;, &#123;&#123;annual_ctc&#125;&#125;):
                    </label>
                    <textarea
                      rows={5}
                      value={customTemplateMarkup}
                      onChange={(e) => setCustomTemplateMarkup(e.target.value)}
                      style={{
                        width: '100%',
                        fontSize: '0.8125rem',
                        fontFamily: 'monospace',
                        padding: 10,
                        border: '1px solid #fdba74',
                        borderRadius: 6,
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: SELECT EMPLOYEE (Select: Ajay)                                   */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  Select an employee from the Employee Database.
                </p>
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search Ajay or employee..."
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

              {/* Employee Selection Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                {filteredEmployees.map((emp) => {
                  const isAjay = emp.fullName.toLowerCase().includes('ajay');
                  const isSelected = selectedEmployee?.id === emp.id;

                  return (
                    <div
                      key={emp.id}
                      onClick={() => handleSelectEmployee(emp)}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: isSelected
                          ? '2px solid #2563eb'
                          : isAjay
                          ? '2px solid #3b82f6'
                          : '1px solid #e2e8f0',
                        backgroundColor: isSelected ? '#eff6ff' : isAjay ? '#f8fafc' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      {isAjay && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '3px 9px',
                            borderRadius: 12,
                            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                          }}
                        >
                          Select: Ajay ★
                        </span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: isAjay ? '#dbeafe' : '#f1f5f9',
                            color: isAjay ? '#1d4ed8' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.875rem',
                          }}
                        >
                          {emp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {emp.employeeId} • {emp.department}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 12, fontSize: '0.78125rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div><strong>Role:</strong> {emp.designation}</div>
                        <div><strong>Email:</strong> {emp.personalEmail}</div>
                        <div><strong>Annual CTC:</strong> ${Number(emp.annualCtc || 120000).toLocaleString()} USD</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: FETCH EMPLOYEE DATA & TEMPLATE PLACEHOLDER MAPPING               */}
          {/* ========================================================================= */}
          {step === 3 && selectedEmployee && selectedTemplate && (
            <div>
              {/* Fetched Employee Data Overview Card */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1rem',
                    }}
                  >
                    {selectedEmployee.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        {selectedEmployee.fullName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          padding: '2px 8px',
                          borderRadius: 10,
                        }}
                      >
                        Fetched from Employee DB
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {selectedEmployee.employeeId} • {selectedEmployee.designation} ({selectedEmployee.department})
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8125rem', color: '#334155', textAlign: 'right' }}>
                  <div><strong>Template:</strong> {selectedTemplate.name}</div>
                  <div><strong>Joining Date:</strong> {new Date(selectedEmployee.joiningDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Template Placeholder Mapping Table */}
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Template Placeholder Mapping
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 12px 0' }}>
                  All placeholders in the selected template are auto-filled from Ajay's employee record. You can edit any mapped value below prior to document generation:
                </p>

                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    overflow: 'hidden',
                    maxHeight: 280,
                    overflowY: 'auto',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                          Template Placeholder
                        </th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                          Mapped Value (Editable)
                        </th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#475569', width: 100 }}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(mappedPlaceholders).map(([key, value]) => (
                        <tr key={key} style={{ borderTop: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                            &#123;&#123;{key}&#125;&#125;
                          </td>
                          <td style={{ padding: '6px 12px' }}>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                setMappedPlaceholders({
                                  ...mappedPlaceholders,
                                  [key]: e.target.value,
                                })
                              }
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                fontSize: '0.8125rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                color: '#15803d',
                                backgroundColor: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                padding: '2px 6px',
                                borderRadius: 8,
                              }}
                            >
                              Auto-Mapped
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: DOCUMENT PREVIEW & HR ACTION                                     */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div>
              {/* Top Banner: HR Action Options */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1d4ed8' }}>
                    HR Action Required:
                  </span>
                  <p style={{ fontSize: '0.78125rem', color: '#3b82f6', margin: '2px 0 0 0' }}>
                    Review the preview below. Choose <strong>Edit / Regenerate</strong> to adjust values or <strong>Generate Final PDF</strong> to create the official document.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setStep(3)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: '#ffffff',
                      color: '#2563eb',
                      border: '1px solid #93c5fd',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={14} />
                    <span>Edit / Regenerate</span>
                  </button>

                  <button
                    onClick={handleGenerateFinalPdf}
                    disabled={generating}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
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
                    {generating ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
                    <span>Generate Final PDF</span>
                  </button>
                </div>
              </div>

              {/* Formatted Letter Preview Window */}
              <div
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  backgroundColor: '#ffffff',
                  padding: 24,
                  maxHeight: 380,
                  overflowY: 'auto',
                  fontFamily: "'Segoe UI', Arial, sans-serif",
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 16 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
                    Acme Technologies Inc.
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Human Resources & Talent Management Operations
                  </div>
                </div>

                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    color: '#1e293b',
                    margin: 0,
                  }}
                >
                  {previewContent}
                </pre>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: ACTION (DOWNLOAD | SEND BY EMAIL)                                 */}
          {/* ========================================================================= */}
          {step === 5 && generatedDoc && (
            <div>
              {/* Generation Success Badge */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={24} color="#16a34a" />
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#166534' }}>
                      Official Final PDF Generated Successfully!
                    </div>
                    <div style={{ fontSize: '0.78125rem', color: '#15803d' }}>
                      {generatedDoc.title} • Version {generatedDoc.currentVersion} • Status: {generatedDoc.status}
                    </div>
                  </div>
                </div>

                {/* Primary Action 1: Download */}
                <button
                  onClick={handleDownloadPdf}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 18px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  <Download size={15} />
                  <span>Download PDF</span>
                </button>
              </div>

              {downloadSuccessBadge && (
                <div
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: 8,
                    fontSize: '0.78125rem',
                    color: '#15803d',
                    marginBottom: 16,
                  }}
                >
                  ✓ PDF downloaded and recorded in Document History ledger!
                </div>
              )}

              {/* Primary Action 2: Send by Email */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Mail size={18} color="#2563eb" />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Send by Email
                  </h4>
                </div>

                {/* Attachment Badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 8,
                    fontSize: '0.78125rem',
                    color: '#1e40af',
                    fontWeight: 600,
                    marginBottom: 14,
                  }}
                >
                  <Paperclip size={14} />
                  <span>Attached: {generatedDoc.title}_v{generatedDoc.currentVersion}.pdf (Official Signed Copy)</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Send to Employee Email:
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="ajay.sharma@example.com"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Subject:
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Message:
                    </label>
                    <textarea
                      rows={3}
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <button
                      onClick={handleSendEmail}
                      disabled={emailSending || emailSentSuccess}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '9px 18px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        backgroundColor: emailSentSuccess ? '#16a34a' : '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: emailSentSuccess ? 'default' : 'pointer',
                        boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                      }}
                    >
                      {emailSending ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Sending to Employee Email...</span>
                        </>
                      ) : emailSentSuccess ? (
                        <>
                          <Check size={14} />
                          <span>Email Dispatched & Logged!</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send to Employee Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  {emailSentSuccess && emailLogInfo && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #86efac',
                        fontSize: '0.78125rem',
                        color: '#166534',
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>✓ Step Complete:</div>
                      <div>• Attached Generated PDF: {emailLogInfo.attachedPdf}</div>
                      <div>• Sent to Employee Email: {emailLogInfo.recipientEmail}</div>
                      <div>• Saved Email Log to Audit Ledger</div>
                      <div>• Saved Document History: Status transitioned to <strong>ISSUED</strong></div>
                    </div>
                  )}
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
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((step - 1) as FlowStep)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#ffffff',
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
            {step === 1 && selectedTemplate && (
              <button
                onClick={() => setStep(2)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <span>Next: Select Employee</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 2 && selectedEmployee && (
              <button
                onClick={() => handleSelectEmployee(selectedEmployee)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <span>Fetch Data & Map Placeholders</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleGeneratePreview}
                disabled={previewLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                {previewLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                <span>Generate Document & Preview</span>
              </button>
            )}

            {step === 5 && (
              <button
                onClick={() => {
                  onClose();
                  if (onDocumentGenerated) onDocumentGenerated();
                }}
                style={{
                  padding: '9px 20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Done / Return to Directory
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

