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
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

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
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.' | 'Dr.'>('Mr.');
  const [fullName, setFullName] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [associationType, setAssociationType] = useState<'employment' | 'internship'>('employment');
  const [genderPronoun, setGenderPronoun] = useState<'male' | 'female'>('male');

  // Dates
  const [startDate, setStartDate] = useState<string>('January 15, 2024');
  const [endDate, setEndDate] = useState<string>('September 30, 2026');
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [referenceNumber, setReferenceNumber] = useState<string>(
    `TASK/${new Date().getFullYear()}/CC-${Math.floor(100 + Math.random() * 900)}`
  );
  const [place, setPlace] = useState<string>('Delhi');

  // Custom Content Fields (Give authority to edit manually)
  const [areaOfWork, setAreaOfWork] = useState<string>('talent acquisition, process automation, and HR operations');
  const [responsibilityLevel, setResponsibilityLevel] = useState<'assisted with' | 'was responsible for'>('was responsible for');
  const [keyResponsibilities, setKeyResponsibilities] = useState<string>(
    'candidate sourcing, technical screening coordination, employee lifecycle maintenance, and compliance documentation'
  );
  const [demonstratedQualities, setDemonstratedQualities] = useState<string>(
    'professionalism, sincerity, adaptability, willingness to learn, teamwork, and responsibility'
  );
  const [conductEvaluation, setConductEvaluation] = useState<string>('satisfactory and professional');
  const [characterTraits, setCharacterTraits] = useState<string>('cooperative, respectful, and committed');
  const [includeDisciplinaryClause, setIncludeDisciplinaryClause] = useState<boolean>(true);
  const [futureEndeavours, setFutureEndeavours] = useState<string>('academic and professional');
  const [issuanceReason, setIssuanceReason] = useState<string>('separation from employment');

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
            areaOfWork,
            keyResponsibilities,
            demonstratedQualities,
            conductEvaluation,
            characterTraits,
            includeDisciplinaryClause,
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
          areaOfWork,
          keyResponsibilities,
          demonstratedQualities,
          conductEvaluation,
          characterTraits,
          includeDisciplinaryClause,
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
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Generate Character Certificate
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                TaskNera HR Solutions official conduct and character certification document
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

                  {/* Responsibility Level */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Responsibility Role
                    </label>
                    <select
                      className="form-input"
                      value={responsibilityLevel}
                      onChange={(e) => setResponsibilityLevel(e.target.value as any)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    >
                      <option value="was responsible for">Was responsible for</option>
                      <option value="assisted with">Assisted with</option>
                    </select>
                  </div>
                </div>

                {/* Detailed Narrative Customizations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Area of Work / Contribution Scope
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={areaOfWork}
                      onChange={(e) => setAreaOfWork(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Key Responsibilities & Activities
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={keyResponsibilities}
                      onChange={(e) => setKeyResponsibilities(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Demonstrated Qualities & Work Ethic
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={demonstratedQualities}
                      onChange={(e) => setDemonstratedQualities(e.target.value)}
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                        Conduct Evaluation
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
                        Character Traits Found
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

                  {/* Disciplinary Action Checkbox Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      backgroundColor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="disciplinary_clause"
                      checked={includeDisciplinaryClause}
                      onChange={(e) => setIncludeDisciplinaryClause(e.target.checked)}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                    <label htmlFor="disciplinary_clause" style={{ fontSize: '0.8125rem', color: '#1e293b', cursor: 'pointer', fontWeight: 600 }}>
                      Include verified clause: "No disciplinary action or complaint relating to misconduct was recorded against {pronounHimHer} during the period of association."
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Issuance Ground / Reason
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
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  borderRadius: 8,
                  padding: '36px 48px',
                  maxWidth: '820px',
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  color: '#1e293b',
                  lineHeight: 1.55,
                  fontSize: '0.9375rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  {/* Official Top Header: TaskNera Logo Left + Address & Email Right */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="TaskNera Logo"
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                        TaskNera
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                        D-57 F1 Dilshad Colony, Shahdara, Delhi – 110095
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                        Email: careers@tasknera.com
                      </div>
                    </div>
                  </div>

                  {/* Reference & Date Block */}
                  <div style={{ marginBottom: 16, fontFamily: 'Arial, sans-serif', fontSize: '0.82rem', color: '#334155' }}>
                    <div>
                      <strong>Reference:</strong> {hl(referenceNumber)}
                    </div>
                    <div>
                      <strong>Date:</strong> {hl(issueDate)}
                    </div>
                  </div>

                  {/* Centered Document Title */}
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <h1
                      style={{
                        margin: '0 0 4px',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        letterSpacing: '0.01em',
                        fontFamily: '"Times New Roman", Times, serif',
                      }}
                    >
                      Character Certificate
                    </h1>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      To Whomsoever It May Concern
                    </div>
                  </div>

                  {/* Certificate Body Paragraphs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'justify' }}>
                    <p style={{ margin: 0 }}>
                      This is to certify that {hl(`${salutation} ${fullName}`)} was associated with TaskNera HR Solutions as {hl(designationArticle)} {hl(designation)}, contributing to the {hl(department)}, from {hl(startDate)} to {hl(endDate)}.
                    </p>

                    <p style={{ margin: 0 }}>
                      During the period of {hl(pronounHisHer)} {hl(associationType)}, {hl(fullName)} was part of the {hl(department)} and contributed to {hl(areaOfWork)} activities throughout {hl(pronounHisHer)} association with the organization.
                    </p>

                    <p style={{ margin: 0 }}>
                      As part of the {hl(department)}, {hl(pronounHeShe)} {hl(responsibilityLevel)} {hl(keyResponsibilities)}, and supporting other {hl(department)} activities as assigned.
                    </p>

                    <p style={{ margin: 0 }}>
                      Throughout {hl(pronounHisHer)} association with TaskNera HR Solutions, {hl(fullName)} demonstrated {hl(demonstratedQualities)} in carrying out {hl(pronounHisHer)} responsibilities.
                    </p>

                    <p style={{ margin: 0 }}>
                      To the best of our knowledge, {hl(pronounHisHer)} conduct and character during the {hl(associationType)} period were {hl(conductEvaluation)}. We found {hl(pronounHimHer)} to be {hl(characterTraits)} to the responsibilities entrusted to {hl(pronounHimHer)}.
                    </p>

                    {includeDisciplinaryClause && (
                      <p style={{ margin: 0 }}>
                        {hl(`No disciplinary action or complaint relating to misconduct was recorded against ${pronounHimHer} during the period of association.`)}
                      </p>
                    )}

                    <p style={{ margin: 0 }}>
                      We appreciate {hl(pronounHisHer)} contribution to the {hl(department)} function and wish {hl(pronounHimHer)} continued success and growth in {hl(pronounHisHer)} future {hl(futureEndeavours)} endeavours.
                    </p>

                    <p style={{ margin: 0 }}>
                      This certificate is being issued upon {hl(issuanceReason)} with TaskNera HR Solutions.
                    </p>
                  </div>

                  {/* Signatory Section */}
                  <div style={{ marginTop: 24, display: 'inline-block' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 22 }}>
                      For TaskNera HR Solutions
                    </div>
                    <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
                      <div>Name: {hl(signatoryName)}</div>
                      <div>Designation: {hl(signatoryTitle)}</div>
                      <div>Date of Issue: {hl(issueDate)}</div>
                      <div>Place: {hl(place)}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Page Numbering */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: 10,
                    marginTop: 20,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  TaskNera | Page 1 of 1
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
