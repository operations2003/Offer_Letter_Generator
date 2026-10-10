import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  Calendar,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface CertificateOfCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

const POPULAR_COURSES = [
  'Email Etiquette',
  'POSH (Prevention of Sexual Harassment) Compliance',
  'Information Security & Cyber Hygiene',
  'Leadership & Team Management Fundamentals',
  'Business Communication & Client Engagement',
  'Agile Project Execution & Scrum Delivery',
  'Data Privacy, GDPR & Confidentiality Standards',
  'Diversity, Equity & Inclusion in Workplace',
  'Full-Stack Modern Web Engineering',
  'Product Lifecycle & Quality Operations',
];

export const CertificateOfCompletionModal: React.FC<CertificateOfCompletionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Step 1 = Dynamic Form Inputs, Step 2 = Official Certificate Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Reset to step 1 whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  // Employee Selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');

  // Primary Required Dynamic Fields
  const [name, setName] = useState<string>('Shubham Jamdar');
  const [courseName, setCourseName] = useState<string>('Email Etiquette');
  const [issueDate, setIssueDate] = useState<string>('24 September 2026');

  // Supporting Certificate Details
  const [certificateNo, setCertificateNo] = useState<string>(() => {
    return `TSK-LND-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000).toString().slice(0, 4)}`;
  });
  const [conductingTeam, setConductingTeam] = useState<string>('Learning & Development Team, Tasknera');
  const [signatoryName, setSignatoryName] = useState<string>('Sheetal Bedi');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Chief Executive Officer, Tasknera');

  // UI state
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load employees
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await EmployeeService.listEmployees();
      const list = data || [];
      setEmployees(list);

      if (initialEmployee) {
        setSelectedEmployeeId(initialEmployee.id);
        setName(initialEmployee.fullName || 'Shubham Jamdar');
      }
    } catch (err) {
      console.warn('Could not load employees for certificate of completion:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setName(emp.fullName || 'Shubham Jamdar');
  };

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase().trim();
    return employees.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        (e.officialEmail || e.personalEmail)?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  // Print / Download PDF
  const handleDownloadPdf = () => {
    const certElement = document.getElementById('printable-completion-certificate');
    if (!certElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Certificate_of_Completion_${name.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
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
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              width: 100%;
              height: 100%;
            }
            #printable-completion-certificate {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 auto !important;
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          ${certElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, fallback:', err);
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

  // Save to Documents Generated
  const handleSaveToDocumentsGenerated = async () => {
    setIsSaving(true);
    try {
      const selectedEmp = employees.find((e) => e.id === selectedEmployeeId);
      const recipientEmail =
        selectedEmp?.personalEmail ||
        selectedEmp?.officialEmail ||
        `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'CERTIFICATE',
          title: `Certificate of Completion — ${courseName} (${name})`,
          recipientName: name,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle,
          effectiveDate: issueDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            name,
            courseName,
            issueDate,
            certificateNo,
            conductingTeam,
            signatoryName,
            signatoryTitle,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_comp_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'CERTIFICATE',
        referenceNumber: createdDoc?.referenceNumber || certificateNo,
        title: `Certificate of Completion — ${courseName} (${name})`,
        templateId: 'tpl_completion_certificate_official',
        templateVersionId: 'v1.0',
        recipientName: name,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName,
        signatoryTitle,
        effectiveDate: issueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any as HrDocument;

      try {
        const stored = localStorage.getItem('tasknera_mock_hr_documents');
        const existingDocs: HrDocument[] = stored ? JSON.parse(stored) : [];
        const updatedDocs = [localDoc, ...existingDocs.filter((d) => d.id !== localDoc.id)];
        localStorage.setItem('tasknera_mock_hr_documents', JSON.stringify(updatedDocs));
      } catch (storageErr) {
        console.warn('LocalStorage save failed:', storageErr);
      }

      success(`Certificate of Completion issued successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save certificate of completion.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderHighlighted = (value: string, fallback: string = '') => {
    const val = value || fallback;
    if (highlightPlaceholders) {
      return (
        <mark
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
    return <span>{val}</span>;
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          width: '100%',
          maxWidth: step === 1 ? '940px' : '1060px',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: '#fff7ed',
                border: '1px solid #fed7aa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Certificate
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    border: '1px solid #fed7aa',
                  }}
                >
                  Official Credential
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {step === 1 ? 'Configure dynamic fields (Name, Course Name, Date of Issue)' : 'Real-time landscape certificate preview & print export'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step Selector Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                padding: 3,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78125rem',
                  fontWeight: step === 1 ? 700 : 500,
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#ea580c' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>1. Edit Fields</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78125rem',
                  fontWeight: step === 2 ? 700 : 500,
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#ea580c' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>2. Certificate View</span>
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '22px 24px',
          }}
        >
          {step === 1 ? (
            /* STEP 1: DYNAMIC FIELDS CONFIGURATION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Primary 3 Dynamic Fields Requested by User */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                  padding: '22px',
                  borderRadius: 14,
                  border: '1.5px solid #fed7aa',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#9a3412', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} color="#ea580c" />
                      Dynamic Certificate Fields
                    </h4>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#7c2d12' }}>
                      These three dynamic fields update the Certificate of Completion in real time.
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      padding: '3px 10px',
                      borderRadius: 12,
                    }}
                  >
                    3 Core Fields
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {/* Field 1: Recipient Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>1. Recipient Name</span>
                      <span style={{ color: '#ea580c' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Shubham Jamdar"
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderColor: '#fed7aa',
                        backgroundColor: '#ffffff',
                        padding: '10px 12px',
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Printed prominently in elegant cursive calligraphy.
                    </span>
                  </div>

                  {/* Field 2: Course Name (Source Name) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>2. Course / Source Name</span>
                      <span style={{ color: '#ea580c' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. Email Etiquette"
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderColor: '#fed7aa',
                        backgroundColor: '#ffffff',
                        padding: '10px 12px',
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Training programme title completed by the recipient.
                    </span>
                  </div>

                  {/* Field 3: Date of Issue */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>3. Date of Issue</span>
                      <span style={{ color: '#ea580c' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      placeholder="e.g. 24 September 2026"
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        borderColor: '#fed7aa',
                        backgroundColor: '#ffffff',
                        padding: '10px 12px',
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Formatted date appearing in bottom left issue block.
                    </span>
                  </div>
                </div>

                {/* Quick Course Suggestions */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #fed7aa' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9a3412', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={13} />
                    Popular Training Programme Presets:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {POPULAR_COURSES.map((course) => (
                      <button
                        key={course}
                        type="button"
                        onClick={() => setCourseName(course)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          border: courseName === course ? '1px solid #ea580c' : '1px solid #e2e8f0',
                          backgroundColor: courseName === course ? '#ffedd5' : '#ffffff',
                          color: courseName === course ? '#9a3412' : '#475569',
                          fontSize: '0.72rem',
                          fontWeight: courseName === course ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Select Employee from Directory */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#2563eb" />
                    Quick Populate from Employee Directory
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Click an employee to auto-fill their full name
                  </span>
                </div>

                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search employee directory by name..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    style={{ paddingLeft: 32, fontSize: '0.8125rem' }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 8,
                    maxHeight: 140,
                    overflowY: 'auto',
                  }}
                >
                  {filteredEmployees.slice(0, 8).map((emp) => {
                    const isSelected = name.toLowerCase() === emp.fullName?.toLowerCase();
                    return (
                      <div
                        key={emp.id}
                        onClick={() => applyEmployee(emp)}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 8,
                          border: isSelected ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#ea580c' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          {emp.fullName?.[0] || 'E'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.78125rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                            {emp.designation || 'Team Member'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Supporting Credentials & Signatory Settings */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} color="#059669" />
                  Certificate Authority &amp; Numbering
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Certificate Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={certificateNo}
                      onChange={(e) => setCertificateNo(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Conducting Authority</label>
                    <input
                      type="text"
                      className="form-input"
                      value={conductingTeam}
                      onChange={(e) => setConductingTeam(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryTitle}
                      onChange={(e) => setSignatoryTitle(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{
                    padding: '11px 26px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ea580c',
                    borderColor: '#ea580c',
                  }}
                >
                  View Live Certificate
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL CERTIFICATE OF COMPLETION (EXACT USER SPECIFICATION) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Action Toolbar */}
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(1)}
                    style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                  >
                    Edit Dynamic Fields
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
                    <span>Highlight Dynamic Data</span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    variant="secondary"
                    icon={<Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Generated'}
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{
                      padding: '6px 18px',
                      fontSize: '0.8125rem',
                      backgroundColor: '#ea580c',
                      borderColor: '#ea580c',
                    }}
                  >
                    Download Certificate / Print
                  </Button>
                </div>
              </div>

              {/* Exact Certificate Canvas (A4 Landscape Proportions) */}
              <div
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '10px 0',
                }}
              >
                <div
                  id="printable-completion-certificate"
                  style={{
                    width: '920px',
                    minWidth: '920px',
                    aspectRatio: '1.414',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    position: 'relative',
                    padding: '24px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    color: '#2d2727',
                  }}
                >
                  {/* Outer Certificate Border Box */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '16px',
                      border: '1.5px solid #524747',
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  {/* Inner Secondary Border Box */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: '20px',
                      border: '1px solid #e5937f',
                      pointerEvents: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  {/* Corner Ribbon Triangular Accents (4 Corners, matching user screenshot) */}
                  {/* Top-Left Ribbon */}
                  <svg
                    style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, pointerEvents: 'none' }}
                    viewBox="0 0 44 44"
                  >
                    <polygon points="0,0 44,0 0,44" fill="#e79380" />
                    <polygon points="0,0 28,0 0,28" fill="#d97762" />
                    <line x1="0" y1="44" x2="44" y2="0" stroke="#524747" strokeWidth="1.5" />
                  </svg>

                  {/* Top-Right Ribbon */}
                  <svg
                    style={{ position: 'absolute', top: 16, right: 16, width: 44, height: 44, pointerEvents: 'none' }}
                    viewBox="0 0 44 44"
                  >
                    <polygon points="44,0 0,0 44,44" fill="#e79380" />
                    <polygon points="44,0 16,0 44,28" fill="#d97762" />
                    <line x1="0" y1="0" x2="44" y2="44" stroke="#524747" strokeWidth="1.5" />
                  </svg>

                  {/* Bottom-Left Ribbon */}
                  <svg
                    style={{ position: 'absolute', bottom: 16, left: 16, width: 44, height: 44, pointerEvents: 'none' }}
                    viewBox="0 0 44 44"
                  >
                    <polygon points="0,44 44,44 0,0" fill="#e79380" />
                    <polygon points="0,44 28,44 0,16" fill="#d97762" />
                    <line x1="0" y1="0" x2="44" y2="44" stroke="#524747" strokeWidth="1.5" />
                  </svg>

                  {/* Bottom-Right Ribbon */}
                  <svg
                    style={{ position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, pointerEvents: 'none' }}
                    viewBox="0 0 44 44"
                  >
                    <polygon points="44,44 0,44 44,0" fill="#e79380" />
                    <polygon points="44,44 16,44 44,16" fill="#d97762" />
                    <line x1="0" y1="44" x2="44" y2="0" stroke="#524747" strokeWidth="1.5" />
                  </svg>

                  {/* Inner Certificate Content Container */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 10,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '24px 44px 18px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Header Section: Logo + Brand */}
                    <div style={{ textAlign: 'center', marginTop: 4 }}>
                      {/* Stylized TaskNera Logo Icon */}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                        <svg width="48" height="40" viewBox="0 0 54 44" fill="none">
                          <path
                            d="M6 6 L48 6 L44 14 L24 14 L24 38 L14 38 L14 14 L6 14 Z"
                            fill="#e5937f"
                          />
                          <path
                            d="M20 10 L48 10 L38 24 L28 24 Z"
                            fill="#8c7e7b"
                            opacity="0.85"
                          />
                          <path
                            d="M28 24 L34 32 L46 16 L48 20 L34 38 L24 28 Z"
                            fill="#e5937f"
                          />
                        </svg>
                      </div>

                      {/* Brand Title */}
                      <div
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          letterSpacing: '0.22em',
                          color: '#2a2222',
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: 1.1,
                        }}
                      >
                        TASKNERA
                      </div>
                      <div
                        style={{
                          fontSize: '0.625rem',
                          letterSpacing: '0.14em',
                          color: '#786c6b',
                          fontFamily: 'Arial, sans-serif',
                          marginTop: 3,
                          textTransform: 'uppercase',
                        }}
                      >
                        HR SOLUTIONS • NEW DELHI
                      </div>
                    </div>

                    {/* Certificate Title Section */}
                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                      <div
                        style={{
                          fontSize: '2.1rem',
                          fontWeight: 400,
                          letterSpacing: '0.36em',
                          color: '#2e2626',
                          fontFamily: 'Arial, "Times New Roman", sans-serif',
                          textTransform: 'uppercase',
                          marginRight: '-0.36em', // offset last letter spacing
                        }}
                      >
                        CERTIFICATE
                      </div>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          letterSpacing: '0.28em',
                          color: '#5a4f4e',
                          fontFamily: 'Arial, "Times New Roman", sans-serif',
                          textTransform: 'uppercase',
                          marginTop: 4,
                          marginRight: '-0.28em',
                        }}
                      >
                        OF COMPLETION
                      </div>

                      {/* Decorative Line with Center Diamond */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 12,
                          marginTop: 8,
                        }}
                      >
                        <div style={{ width: 120, height: 1, backgroundColor: '#e5937f' }} />
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            backgroundColor: '#e5937f',
                            transform: 'rotate(45deg)',
                          }}
                        />
                        <div style={{ width: 120, height: 1, backgroundColor: '#e5937f' }} />
                      </div>
                    </div>

                    {/* Middle Section: Recipient & Course Details */}
                    <div style={{ textAlign: 'center', margin: '14px 0 10px' }}>
                      <div
                        style={{
                          fontSize: '0.98rem',
                          fontStyle: 'italic',
                          color: '#554948',
                          marginBottom: 8,
                        }}
                      >
                        This is to proudly certify that
                      </div>

                      {/* Recipient Name (Dynamic Field 1) */}
                      <div
                        style={{
                          display: 'inline-block',
                          minWidth: '400px',
                          borderBottom: '1px solid #786c6b',
                          paddingBottom: '4px',
                          marginBottom: '12px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '2.4rem',
                            fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
                            fontStyle: 'italic',
                            fontWeight: 600,
                            color: '#1e1818',
                            letterSpacing: '0.01em',
                          }}
                        >
                          {renderHighlighted(name, 'Shubham Jamdar')}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: '0.98rem',
                          fontStyle: 'italic',
                          color: '#554948',
                          marginBottom: 8,
                        }}
                      >
                        has successfully completed the training programme
                      </div>

                      {/* Course / Source Name (Dynamic Field 2) */}
                      <div
                        style={{
                          fontSize: '1.9rem',
                          fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif',
                          fontStyle: 'italic',
                          fontWeight: 500,
                          color: '#655554',
                          letterSpacing: '0.01em',
                          marginBottom: 10,
                        }}
                      >
                        {renderHighlighted(courseName, 'Email Etiquette')}
                      </div>

                      {/* Concluding Attestation Narrative */}
                      <div
                        style={{
                          maxWidth: '680px',
                          margin: '0 auto',
                          fontSize: '0.9rem',
                          fontStyle: 'italic',
                          color: '#554948',
                          lineHeight: 1.45,
                        }}
                      >
                        conducted by the {renderHighlighted(conductingTeam, 'Learning & Development Team, Tasknera')},
                        and is hereby awarded this certificate in recognition of their dedication and achievement.
                      </div>
                    </div>

                    {/* Bottom Footer Section: Issue Date, Circular Seal Badge, Signatory */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        marginTop: 14,
                        paddingTop: 8,
                      }}
                    >
                      {/* Left: Date of Issue (Dynamic Field 3) & Certificate Number */}
                      <div style={{ textAlign: 'left', minWidth: 200 }}>
                        <div
                          style={{
                            borderBottom: '1px solid #786c6b',
                            paddingBottom: 2,
                            marginBottom: 4,
                            minWidth: 160,
                            display: 'inline-block',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              color: '#2d2524',
                              fontFamily: 'Arial, sans-serif',
                            }}
                          >
                            {renderHighlighted(issueDate, '24 September 2026')}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: '#786c6b',
                            fontFamily: 'Arial, sans-serif',
                          }}
                        >
                          Date of Issue
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: '#786c6b',
                            fontFamily: 'Arial, sans-serif',
                            marginTop: 3,
                          }}
                        >
                          Certificate No: {renderHighlighted(certificateNo, 'TSK-LND-2026-0180')}
                        </div>
                      </div>

                      {/* Center: Official TaskNera Circular Seal / Certified Badge */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: '50%',
                            backgroundColor: '#e78a74',
                            border: '2px solid #ffffff',
                            boxShadow: '0 0 0 2px #e78a74, 0 3px 10px rgba(231, 138, 116, 0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            textAlign: 'center',
                            position: 'relative',
                            padding: 4,
                            boxSizing: 'border-box',
                          }}
                        >
                          {/* Inner Dashed Ring */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 4,
                              borderRadius: '50%',
                              border: '1px dashed rgba(255, 255, 255, 0.7)',
                              pointerEvents: 'none',
                            }}
                          />
                          <div
                            style={{
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              letterSpacing: '0.12em',
                              fontFamily: 'Arial, sans-serif',
                              lineHeight: 1.1,
                            }}
                          >
                            TASKNERA
                          </div>
                          <div
                            style={{
                              fontSize: '0.45rem',
                              letterSpacing: '0.06em',
                              fontFamily: 'Arial, sans-serif',
                              opacity: 0.95,
                              lineHeight: 1.1,
                              margin: '2px 0',
                            }}
                          >
                            LEARNING &amp;<br />DEVELOPMENT
                          </div>
                          <div
                            style={{
                              fontSize: '0.48rem',
                              fontWeight: 800,
                              letterSpacing: '0.08em',
                              backgroundColor: 'rgba(255, 255, 255, 0.25)',
                              padding: '1px 6px',
                              borderRadius: 6,
                              fontFamily: 'Arial, sans-serif',
                              marginTop: 1,
                            }}
                          >
                            CERTIFIED
                          </div>
                        </div>
                      </div>

                      {/* Right: Handwritten Signature + Signatory Name */}
                      <div style={{ textAlign: 'right', minWidth: 200 }}>
                        {/* Fluid Signature Stroke SVG */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: -4 }}>
                          <svg width="120" height="52" viewBox="0 0 140 60" fill="none">
                            <path
                              d="M10 42 C 25 10, 35 15, 42 38 C 45 48, 55 12, 60 22 C 65 32, 68 45, 78 30 C 85 20, 95 10, 110 25 C 118 32, 125 40, 132 36"
                              stroke="#1e293b"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M32 28 C 45 26, 75 22, 105 24"
                              stroke="#1e293b"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                            <path
                              d="M20 48 C 50 44, 90 40, 125 42"
                              stroke="#1e293b"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        {/* Signatory Line */}
                        <div
                          style={{
                            borderBottom: '1px solid #786c6b',
                            paddingBottom: 2,
                            minWidth: 180,
                            display: 'inline-block',
                          }}
                        />

                        {/* Signatory Name */}
                        <div
                          style={{
                            fontSize: '0.98rem',
                            fontWeight: 700,
                            fontStyle: 'italic',
                            color: '#2d2524',
                            marginTop: 4,
                            fontFamily: 'Georgia, serif',
                          }}
                        >
                          {renderHighlighted(signatoryName, 'Sheetal Bedi')}
                        </div>

                        {/* Signatory Designation */}
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: '#786c6b',
                            fontFamily: 'Arial, sans-serif',
                            marginTop: 2,
                          }}
                        >
                          {renderHighlighted(signatoryTitle, 'Chief Executive Officer, Tasknera')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
