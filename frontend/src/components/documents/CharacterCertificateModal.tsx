import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  User,
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Building2,
  Calendar,
  Briefcase,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  ArrowUp,
  MapPin,
  Mail,
  Globe,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

const SHEETAL_BEDI_SIGNATURE_DATA_URL = 'data:image/png;base64,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';

interface CharacterCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const CharacterCertificateModal: React.FC<CharacterCertificateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Employee & Configuration, 2 = Official Certificate Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Employee Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Preview options
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields State
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.' | 'Dr.'>('Ms.');
  const [fullName, setFullName] = useState<string>('Edwina Zephra Gomes');
  const [designation, setDesignation] = useState<string>('HR Intern');
  const [department, setDepartment] = useState<string>('Talent Acquisition and Learning and Development (L&D)');
  const [associationType, setAssociationType] = useState<'employment' | 'internship'>('internship');
  const [genderPronoun, setGenderPronoun] = useState<'male' | 'female'>('female');

  // Dates
  const [startDate, setStartDate] = useState<string>('August 06, 2026');
  const [endDate, setEndDate] = useState<string>('September 14, 2026');
  const [issueDate, setIssueDate] = useState<string>('September 14, 2026');
  const [referenceNumber, setReferenceNumber] = useState<string>('TKS/HR/INT/2026-27/001');
  const [place, setPlace] = useState<string>('Delhi');

  // Custom Content Fields (Matching official Tasknera Character Certificate)
  const [ldAssistance, setLdAssistance] = useState<string>(
    'assisted the Learning & Development Department in various activities, particularly in the research, development, structuring, and preparation of training modules and learning materials for the organization'
  );
  const [taExperience, setTaExperience] = useState<string>(
    'gained hands-on experience as a member of the Talent Acquisition team, supporting candidate sourcing and screening, coordinating interview schedules, and assisting with various stages of the end-to-end recruitment process'
  );
  const [demonstratedQualities, setDemonstratedQualities] = useState<string>(
    'demonstrated a professional attitude, sincerity, discipline, willingness to learn, and a responsible approach toward assigned responsibilities. She maintained professional conduct while working with the team and showed a positive attitude toward feedback and continuous improvement.'
  );
  const [conductEvaluation, setConductEvaluation] = useState<string>('satisfactory and professional');
  const [characterTraits, setCharacterTraits] = useState<string>('cooperative, respectful, and committed');
  const [futureEndeavours, setFutureEndeavours] = useState<string>('academic and professional');
  const [issuanceReason, setIssuanceReason] = useState<string>(
    'completion/conclusion of her internship with Tasknera HR Solutions'
  );

  // Signatory
  const [signatoryName, setSignatoryName] = useState<string>('Sheetal Bedi');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('CEO');

  // Scroll Container Ref & State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset scroll position on open or step change
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setShowScrollTop(false);
      setScrollProgress(0);
    }
  }, [isOpen, step]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const total = el.scrollHeight - el.clientHeight;
    if (total > 0) {
      const progress = Math.min(100, Math.max(0, (el.scrollTop / total) * 100));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
    setShowScrollTop(el.scrollTop > 180);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load employees from database
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
        applyEmployee(initialEmployee);
      } else if (!selectedEmployeeId && list.length > 0) {
        applyEmployee(list[0]);
      }
    } catch (err) {
      console.warn('Could not load employees for character certificate:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setFullName(emp.fullName || 'Employee');
    if (emp.designation) setDesignation(emp.designation);
    if (emp.department) setDepartment(emp.department);

    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        setStartDate(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      } catch {
        setStartDate(emp.joiningDate);
      }
    }

    if (emp.title === 'Ms.' || emp.title === 'Mrs.') {
      setSalutation('Ms.');
      setGenderPronoun('female');
    } else {
      setSalutation('Mr.');
      setGenderPronoun('male');
    }

    if (emp.employmentType?.toLowerCase().includes('intern')) {
      setAssociationType('internship');
      setIssuanceReason('completion/conclusion of his/her internship');
    } else {
      setAssociationType('employment');
      setIssuanceReason('separation from employment');
    }
  };

  // Pronoun helpers
  const pronounHeShe = genderPronoun === 'female' ? 'she' : 'he';
  const pronounHisHer = genderPronoun === 'female' ? 'her' : 'his';
  const pronounHimHer = genderPronoun === 'female' ? 'her' : 'him';

  // Indefinite article helper for designation
  const designationArticle = /^[aeiou]/i.test(designation.trim()) ? 'an' : 'a';

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = employeeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q));
      const matchesDept = selectedDeptFilter === 'ALL' || e.department === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, employeeSearch, selectedDeptFilter]);

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  // Highlight wrapper
  const hl = (content: React.ReactNode) => {
    if (!highlightPlaceholders) return <>{content}</>;
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
        {content}
      </mark>
    );
  };

  // Download PDF / Print
  const handleDownloadPdf = () => {
    const certElement = document.getElementById('printable-character-certificate');
    if (!certElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Character_Certificate_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

    // Create an isolated hidden iframe for printing
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
              size: A4 portrait;
              margin: 10mm 15mm 10mm 15mm;
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
              color: #1e293b;
              font-family: "Times New Roman", Times, Georgia, serif;
              font-size: 10.5pt;
              line-height: 1.5;
            }
            #printable-character-certificate {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            p {
              margin: 0;
              text-align: justify;
              line-height: 1.5;
            }
            mark {
              background-color: #fef08a !important;
              color: #854d0e !important;
              padding: 1px 3px;
              border-radius: 2px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          ${certElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    // Allow resources to render, then print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print():', err);
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
        `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'CERTIFICATE',
          title: `Character Certificate — ${fullName}`,
          recipientName: fullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle,
          effectiveDate: issueDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            salutation,
            fullName,
            designation,
            department,
            associationType,
            startDate,
            endDate,
            ldAssistance,
            taExperience,
            demonstratedQualities,
            conductEvaluation,
            characterTraits,
            futureEndeavours,
            issuanceReason,
            referenceNumber,
            issueDate,
            place,
            signatoryName,
            signatoryTitle,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      // Local storage backup for instantaneous availability in Documents Generated
      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_cc_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'CERTIFICATE',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Character Certificate — ${fullName}`,
        templateId: 'tpl_character_certificate_official',
        templateVersionId: 'v1.0',
        recipientName: fullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: false,
        aiConfidenceScore: 1.0,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: {
          salutation,
          fullName,
          designation,
          department,
          associationType,
          startDate,
          endDate,
          ldAssistance,
          taExperience,
          demonstratedQualities,
          conductEvaluation,
          characterTraits,
          futureEndeavours,
          issuanceReason,
          referenceNumber,
          issueDate,
          place,
          signatoryName,
          signatoryTitle,
        },
        humanOverrides: [],
        currentVersionNumber: 1,
        versions: [],
        generatedFiles: [],
        statusHistory: [],
        signatoryName,
        signatoryTitle,
        effectiveDate: issueDate,
        createdByUserId: 'usr_current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingSaved: HrDocument[] = JSON.parse(
        localStorage.getItem('tasknera_saved_documents') || '[]'
      );
      const updatedList = [
        localDoc,
        ...existingSaved.filter(
          (d) => d.id !== localDoc.id && d.referenceNumber !== localDoc.referenceNumber
        ),
      ];
      localStorage.setItem('tasknera_saved_documents', JSON.stringify(updatedList));

      success(`Character Certificate saved successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save character certificate.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="tasknera-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="tasknera-modal-container glass-panel"
        style={{
          width: '100%',
          maxWidth: 1100,
          height: '90vh',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div
          className="no-print"
          style={{
            padding: '18px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#f5f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ddd6fe',
                color: '#7c3aed',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                Character Certificate
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Create and print a conduct and character certificate.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step navigation pills */}
            <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#7c3aed' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                1. Details & Fields
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#7c3aed' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                2. Official Preview
              </button>
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
        </div>

        {/* Scroll Progress Bar */}
        <div
          style={{
            width: '100%',
            height: 3,
            backgroundColor: '#e2e8f0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollProgress}%`,
              backgroundColor: '#7c3aed',
              transition: 'width 0.12s ease-out',
            }}
          />
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '24px 32px',
            background: '#f8fafc',
            scrollBehavior: 'smooth',
          }}
        >
          {step === 1 ? (
            /* STEP 1: FORM & EMPLOYEE SELECTION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection Section */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      Step 1: Select Employee
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                      Auto-populates employee name, designation, department, and tenure dates.
                    </p>
                  </div>

                  {/* Search and Dept Filter */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 220 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Search employee..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 30px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                        }}
                      />
                    </div>
                    {availableDepartments.length > 0 && (
                      <select
                        value={selectedDeptFilter}
                        onChange={(e) => setSelectedDeptFilter(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="ALL">All Departments</option>
                        {availableDepartments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {loadingEmployees ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: '#7c3aed' }} />
                    Loading employees...
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: 10,
                      maxHeight: 180,
                      overflowY: 'auto',
                      paddingRight: 4,
                    }}
                  >
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployeeId === emp.id;
                      return (
                        <div
                          key={emp.id}
                          onClick={() => applyEmployee(emp)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#f5f3ff' : '#ffffff',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: isSelected ? '#7c3aed' : '#0f172a' }}>
                              {emp.fullName}
                            </span>
                            {isSelected && <CheckCircle2 size={14} style={{ color: '#7c3aed' }} />}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                            {emp.designation || 'Staff'} • {emp.department || 'General'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Editable Fields Grid */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Step 2: Certificate Parameters & Custom Fields
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  {/* Reference Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Reference Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Date of Issue */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Date of Issue
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Salutation & Gender Pronoun */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Salutation
                      </label>
                      <select
                        className="form-input"
                        value={salutation}
                        onChange={(e) => {
                          const s = e.target.value as any;
                          setSalutation(s);
                          setGenderPronoun(s === 'Ms.' ? 'female' : 'male');
                        }}
                        style={{ width: '100%', fontSize: '0.8125rem' }}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Pronoun
                      </label>
                      <select
                        className="form-input"
                        value={genderPronoun}
                        onChange={(e) => setGenderPronoun(e.target.value as any)}
                        style={{ width: '100%', fontSize: '0.8125rem' }}
                      >
                        <option value="male">He / His / Him</option>
                        <option value="female">She / Her / Her</option>
                      </select>
                    </div>
                  </div>

                  {/* Employee Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Employee Full Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Department / Team */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Department / Team
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Association Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Association Type
                    </label>
                    <select
                      className="form-input"
                      value={associationType}
                      onChange={(e) => {
                        const t = e.target.value as any;
                        setAssociationType(t);
                        setIssuanceReason(
                          t === 'internship'
                            ? 'completion/conclusion of his/her internship'
                            : 'separation from employment'
                        );
                      }}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    >
                      <option value="employment">Employment</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Start Date (Tenure From)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      End Date (Tenure To)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                </div>

                {/* Detailed Narrative Customizations matching official Tasknera template */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Learning & Development Assistance (Paragraph 2)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={ldAssistance}
                      onChange={(e) => setLdAssistance(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Talent Acquisition Team Experience (Paragraph 3)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={taExperience}
                      onChange={(e) => setTaExperience(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Demonstrated Qualities & Work Ethic (Paragraph 4)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={demonstratedQualities}
                      onChange={(e) => setDemonstratedQualities(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Conduct & Character Evaluation (Paragraph 5)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={conductEvaluation}
                        onChange={(e) => setConductEvaluation(e.target.value)}
                        style={{ width: '100%', fontSize: '0.8125rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Character Traits Found (Paragraph 5)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={characterTraits}
                        onChange={(e) => setCharacterTraits(e.target.value)}
                        style={{ width: '100%', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Future Endeavors Scope (Paragraph 6)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={futureEndeavours}
                        onChange={(e) => setFutureEndeavours(e.target.value)}
                        style={{ width: '100%', fontSize: '0.8125rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Issuance Ground / Context (Paragraph 7)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={issuanceReason}
                        onChange={(e) => setIssuanceReason(e.target.value)}
                        style={{ width: '100%', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed to Preview Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{ padding: '10px 24px', fontSize: '0.875rem', backgroundColor: '#7c3aed', borderColor: '#7c3aed' }}
                >
                  Proceed to Official Certificate Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL CERTIFICATE PREVIEW */
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(1)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Edit Details
                  </Button>

                  <button
                    type="button"
                    onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: highlightPlaceholders ? '1px solid #eab308' : '1px solid #cbd5e1',
                      background: highlightPlaceholders ? '#fef9c3' : '#ffffff',
                      color: highlightPlaceholders ? '#854d0e' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <Highlighter size={14} />
                    <span>{highlightPlaceholders ? 'Yellow Highlights: ON' : 'Yellow Highlights: OFF'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem', background: '#a35d39', borderColor: '#a35d39' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents Generated'}
                  </Button>
                </div>
              </div>

              {/* PRINTABLE OFFICIAL TASKNERA CHARACTER CERTIFICATE SHEET */}
              <div
                id="printable-character-certificate"
                className="printable-character-sheet"
                style={{
                  maxWidth: 816,
                  margin: '0 auto',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  padding: '48px 56px 40px 56px',
                  borderRadius: 6,
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                  fontSize: '0.9125rem',
                  lineHeight: 1.65,
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div>
                  {/* Official Top Header: Tasknera Logo + Brand + Tagline */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      paddingBottom: 14,
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="Tasknera"
                        style={{ width: 56, height: 56, objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1.75rem',
                          color: '#0f2238',
                          letterSpacing: '0.03em',
                          lineHeight: 1.1,
                          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                      >
                        TASKNERA
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginTop: 4,
                          letterSpacing: '0.01em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        <span style={{ color: '#0d9488' }}>Global HR</span>
                        <span style={{ color: '#0284c7', fontSize: '0.65rem' }}>•</span>
                        <span style={{ color: '#0d9488' }}>Recruitment</span>
                        <span style={{ color: '#0284c7', fontSize: '0.65rem' }}>•</span>
                        <span style={{ color: '#0d9488' }}>Workforce Solutions</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: 1, backgroundColor: '#cbd5e1', marginBottom: 24 }} />

                  {/* Centered Document Title with Teal Underline */}
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <h1
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '1.45rem',
                        fontWeight: 700,
                        color: '#0f2238',
                        letterSpacing: '0.04em',
                        fontFamily: 'Georgia, "Times New Roman", Times, serif',
                        textTransform: 'uppercase',
                      }}
                    >
                      CHARACTER CERTIFICATE
                    </h1>
                    <div
                      style={{
                        width: 140,
                        height: 3,
                        backgroundColor: '#0f766e',
                        margin: '0 auto 16px auto',
                        borderRadius: 2,
                      }}
                    />
                    <div
                      style={{
                        fontSize: '1.05rem',
                        fontStyle: 'italic',
                        fontWeight: 700,
                        color: '#0f172a',
                        fontFamily: 'Georgia, "Times New Roman", Times, serif',
                      }}
                    >
                      To Whomsoever It May Concern
                    </div>
                  </div>

                  {/* Certificate Body Paragraphs (Exact 7 Paragraphs matching official document) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'justify' }}>
                    <p style={{ margin: 0 }}>
                      This is to certify that {hl(salutation ? `${salutation} ${fullName}` : fullName)} was associated with <strong>Tasknera HR Solutions</strong> as an <strong>{hl(designation)}</strong>, contributing to the <strong>{hl(department)}</strong> teams, from <strong>{hl(startDate)}</strong> to <strong>{hl(endDate)}</strong>.
                    </p>

                    <p style={{ margin: 0 }}>
                      During the period of {hl(pronounHisHer)} internship, {hl(fullName)} {hl(ldAssistance)}.
                    </p>

                    <p style={{ margin: 0 }}>
                      In addition, {hl(fullName)} {hl(taExperience)}.
                    </p>

                    <p style={{ margin: 0 }}>
                      Throughout {hl(pronounHisHer)} association with Tasknera HR Solutions, {hl(fullName)} {hl(demonstratedQualities)}
                    </p>

                    <p style={{ margin: 0 }}>
                      To the best of our knowledge, {hl(pronounHisHer)} conduct and character during the internship period were {hl(conductEvaluation)}. We found them to be {hl(characterTraits)} to the responsibilities entrusted to them.
                    </p>

                    <p style={{ margin: 0 }}>
                      We appreciate {hl(pronounHisHer)} contribution to the Talent Acquisition and L&D functions and wish {hl(pronounHimHer)} success and growth in their future {hl(futureEndeavours)} endeavors.
                    </p>

                    <p style={{ margin: 0 }}>
                      This certificate is being issued upon {hl(issuanceReason)}.
                    </p>
                  </div>

                  {/* Signatory Section with Authentic Sheetal Bedi Signature */}
                  <div style={{ marginTop: 24, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" }}>
                    <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f2a5c', marginBottom: 2 }}>
                      For Tasknera HR Solutions
                    </div>
                    <div style={{ margin: '2px 0 2px -4px', minHeight: 90, display: 'flex', alignItems: 'center' }}>
                      <img
                        src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                        alt="Sheetal Bedi Signature"
                        style={{
                          width: 110,
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <div style={{ fontStyle: 'italic', fontSize: '0.88rem', color: '#475569', marginBottom: 6 }}>
                      Authorized Signatory
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>Name:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(signatoryName)}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>Designation:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(signatoryTitle)}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>Date of Issue:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(issueDate)}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>Place:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(place)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Contact Bar and Geometric Corner Shape */}
                <div style={{ marginTop: 36, paddingTop: 14, borderTop: '1px solid #cbd5e1', position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 14,
                      fontSize: '0.75rem',
                      color: '#334155',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={13} style={{ color: '#0284c7' }} />
                      <span>D-57 F1, Dilshad Colony Shahdara, Delhi 110095</span>
                    </div>
                    <span style={{ color: '#94a3b8' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={13} style={{ color: '#0284c7' }} />
                      <span>operations@tasknera.com</span>
                    </div>
                    <span style={{ color: '#94a3b8' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Globe size={13} style={{ color: '#0284c7' }} />
                      <span>https://tasknera.com</span>
                    </div>
                  </div>

                  {/* Corner Accent Graphic */}
                  <div style={{ position: 'absolute', right: -56, bottom: -40, width: 140, height: 36, pointerEvents: 'none', overflow: 'hidden' }}>
                    <svg width="140" height="36" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 36 L140 36 L140 0 L40 0 Z" fill="#0f2a5c" />
                      <polygon points="10,36 45,0 75,0 40,36" fill="#f97316" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            title="Scroll back to top"
            style={{
              position: 'absolute',
              bottom: 22,
              right: 26,
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 24,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#0f172a';
            }}
          >
            <ArrowUp size={14} />
            <span>Top ({Math.round(scrollProgress)}%)</span>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};
