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
  GraduationCap,
  FileText,
  Clock,
  ShieldCheck,
  Award,
  ArrowUp,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface InternshipConcludingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const InternshipConcludingModal: React.FC<InternshipConcludingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Details & Intern Selection, 2 = Official Concluding Letter Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref & State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Employee / Intern Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Preview options
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields State
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.'>('Mr.');
  const [internName, setInternName] = useState<string>('Rohan Verma');
  const [internshipRole, setInternshipRole] = useState<string>('Full-Stack Web Development Intern');
  const [department, setDepartment] = useState<string>('Technology & Engineering');
  const [commencedDate, setCommencedDate] = useState<string>('01/06/2026');
  const [concludedDate, setConcludedDate] = useState<string>('31/08/2026');
  const [issueDate, setIssueDate] = useState<string>(() => {
    const now = new Date();
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${d}/${m}/${now.getFullYear()}`;
  });
  const [offerLetterRef, setOfferLetterRef] = useState<string>('TASK/2026/INT-042');
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    return `TASK/${new Date().getFullYear()}/ICL-${Math.floor(100 + Math.random() * 900)}`;
  });

  // Signatory State
  const [signatoryName, setSignatoryName] = useState<string>('Sheetal Bedi');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('CEO & Founder');

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

  // Load employees/interns from database
  useEffect(() => {
    if (isOpen) {
      setLoadingEmployees(true);
      EmployeeService.listEmployees()
        .then((emps) => {
          setEmployees(emps);
          if (emps.length > 0 && !selectedEmployeeId) {
            handleSelectEmployee(emps[0]);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingEmployees(false));
    }
  }, [isOpen]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setInternName(emp.fullName);

    // Salutation detection if name looks typical
    const firstName = emp.fullName.split(' ')[0].toLowerCase();
    if (['ananya', 'priya', 'sneha', 'neha', 'pooja', 'sheetal', 'tanya', 'simran'].includes(firstName)) {
      setSalutation('Ms.');
    } else {
      setSalutation('Mr.');
    }

    if (emp.designation) {
      setInternshipRole(
        emp.designation.toLowerCase().includes('intern')
          ? emp.designation
          : `${emp.designation} Intern`
      );
    }
    if (emp.department) setDepartment(emp.department);

    if (emp.joiningDate) {
      const d = new Date(emp.joiningDate);
      if (!isNaN(d.getTime())) {
        const startDay = d.getDate().toString().padStart(2, '0');
        const startMonth = (d.getMonth() + 1).toString().padStart(2, '0');
        setCommencedDate(`${startDay}/${startMonth}/${d.getFullYear()}`);

        // Set concluded date 3 months after commenced date as default internship tenure
        const endD = new Date(d);
        endD.setMonth(endD.getMonth() + 3);
        const endDay = endD.getDate().toString().padStart(2, '0');
        const endMonth = (endD.getMonth() + 1).toString().padStart(2, '0');
        setConcludedDate(`${endDay}/${endMonth}/${endD.getFullYear()}`);
      }
    }

    if (emp.employeeId) {
      setOfferLetterRef(`TASK/${new Date().getFullYear()}/OFF-${emp.employeeId.replace(/[^0-9]/g, '').slice(-3) || '088'}`);
    }
  };

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

  // Filtered employees for list
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

  // Highlight helper for placeholders
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

  // High-fidelity Print / PDF Export
  const handleDownloadPdf = () => {
    const letterElement = document.getElementById('printable-internship-concluding-letter');
    if (!letterElement) {
      error('Could not find letter preview to print');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const docTitle = `TaskNera_Internship_Concluding_${internName.replace(/\s+/g, '_')}`;

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
              margin: 18mm 20mm 18mm 20mm;
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
              color: #0f172a;
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              font-size: 10pt;
              line-height: 1.55;
            }
            #printable-internship-concluding-letter {
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
            .terracotta-title {
              color: #8f422b !important;
              font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
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
          ${letterElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print fallback:', err);
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
  const handleSaveToDocuments = async () => {
    setIsSaving(true);
    try {
      const selectedEmp = employees.find((e) => e.id === selectedEmployeeId);
      const recipientEmail =
        selectedEmp?.personalEmail ||
        selectedEmp?.officialEmail ||
        `${internName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'INTERNSHIP_LETTER',
          title: `Internship Concluding Letter — ${internName}`,
          recipientName: internName,
          recipientEmail: recipientEmail,
          templateId: 'tpl_internship_concluding_official',
          signatoryName,
          signatoryTitle,
          effectiveDate: concludedDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            salutation,
            internName,
            internshipRole,
            department,
            commencedDate,
            concludedDate,
            offerLetterRef,
            referenceNumber,
            issueDate,
            signatoryName,
            signatoryTitle,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      // Local storage backup for immediate listing
      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_intern_conclude_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'INTERNSHIP_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Internship Concluding Letter — ${internName}`,
        templateId: 'tpl_internship_concluding_official',
        templateVersionId: 'v1.0',
        recipientName: internName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        currentVersionNumber: 1,
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: false,
        aiConfidenceScore: 1.0,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: {
          salutation,
          internName,
          internshipRole,
          department,
          commencedDate,
          concludedDate,
          offerLetterRef,
          referenceNumber,
          issueDate,
          signatoryName,
          signatoryTitle,
        },
        humanOverrides: [],
        versions: [],
        generatedFiles: [],
        statusHistory: [],
        signatoryName,
        signatoryTitle,
        effectiveDate: concludedDate,
        issuedAt: new Date().toISOString(),
        createdByUserId: 'usr_current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs: HrDocument[] = stored ? JSON.parse(stored) : [];
        const existingIdx = docs.findIndex((d) => d.id === localDoc.id);
        if (existingIdx >= 0) {
          docs[existingIdx] = localDoc;
        } else {
          docs.unshift(localDoc);
        }
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch {
        // LocalStorage fallback
      }

      success(`Successfully generated and issued Internship Concluding Letter for ${internName}!`);
      if (onSuccess) onSuccess(createdDoc || localDoc);
      onClose();
    } catch (err: any) {
      error(`Failed to save internship concluding letter: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '90vh',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
          position: 'relative',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c2410c',
                border: '1px solid #ffedd5',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#8f422b',
                    color: '#ffffff',
                  }}
                >
                  OFFICIAL LETTER
                </span>
                <span style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 700 }}>
                  A4 Single-Page • System Generated
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                TaskNera Internship Concluding Letter Generator
              </h3>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 1 ? (
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                icon={<ArrowRight size={15} />}
                style={{
                  backgroundColor: '#8f422b',
                  borderColor: '#8f422b',
                }}
              >
                Preview Official Letter
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  icon={<ArrowLeft size={15} />}
                  style={{ borderColor: '#cbd5e1' }}
                >
                  Edit Details
                </Button>

                <button
                  onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: highlightPlaceholders ? '#f59e0b' : '#cbd5e1',
                    backgroundColor: highlightPlaceholders ? '#fef3c7' : '#ffffff',
                    color: highlightPlaceholders ? '#92400e' : '#475569',
                    cursor: 'pointer',
                  }}
                  title="Highlight placeholders for quick review"
                >
                  <Highlighter size={14} />
                  Highlight Fields
                </button>

                <Button
                  variant="secondary"
                  onClick={handleDownloadPdf}
                  icon={<Download size={15} />}
                  style={{
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                  }}
                >
                  Print / Export PDF
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSaveToDocuments}
                  disabled={isSaving}
                  icon={isSaving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
                  style={{
                    backgroundColor: '#8f422b',
                    borderColor: '#8f422b',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save & Issue Letter'}
                </Button>
              </>
            )}

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
              backgroundColor: '#8f422b',
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
            /* ================================================================= */
            /* STEP 1: INTERN SELECTION & FORM CONFIGURATION                     */
            /* ================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Intern Selection Section */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      Step 1: Select Intern / Team Member
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                      Auto-populates intern identity, role title, department, and tenure timeline.
                    </p>
                  </div>

                  {/* Search and Dept Filter */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 220 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Search intern name or ID..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 30px',
                          fontSize: '0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Intern Cards Row */}
                {loadingEmployees ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    <RefreshCw size={16} className="spin" style={{ display: 'inline', marginRight: 8 }} />
                    Loading team members...
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No members match search query. You can fill details manually below.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: 10,
                      maxHeight: 180,
                      overflowY: 'auto',
                      padding: '4px',
                    }}
                  >
                    {filteredEmployees.map((emp) => {
                      const isSelected = emp.id === selectedEmployeeId;
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectEmployee(emp)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: isSelected ? '1.5px solid #8f422b' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                              {emp.fullName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {emp.designation || 'Intern'} • {emp.department || 'Operations'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>
                              ID: {emp.employeeId || 'N/A'}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 size={18} style={{ color: '#8f422b', flexShrink: 0 }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Concluding Details Form */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={18} color="#8f422b" />
                  Step 2: Letter Details & Formal Clauses
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                  {/* Salutation */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Salutation
                    </label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['Mr.', 'Ms.'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSalutation(s)}
                          style={{
                            flex: 1,
                            padding: '7px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            borderRadius: 6,
                            border: salutation === s ? '1.5px solid #8f422b' : '1px solid #cbd5e1',
                            backgroundColor: salutation === s ? '#fff7ed' : '#ffffff',
                            color: salutation === s ? '#8f422b' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intern Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Intern Full Name
                    </label>
                    <input
                      type="text"
                      value={internName}
                      onChange={(e) => setInternName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Internship Role / Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Designation / Role
                    </label>
                    <input
                      type="text"
                      value={internshipRole}
                      onChange={(e) => setInternshipRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Department / Function */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Department / Function
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Letter Reference Number
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  {/* Offer Letter Reference */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Original Offer Letter Reference
                    </label>
                    <input
                      type="text"
                      value={offerLetterRef}
                      onChange={(e) => setOfferLetterRef(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  {/* Commenced Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Commenced On (DD/MM/YYYY)
                    </label>
                    <input
                      type="text"
                      value={commencedDate}
                      onChange={(e) => setCommencedDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Concluded Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Concluded On (DD/MM/YYYY)
                    </label>
                    <input
                      type="text"
                      value={concludedDate}
                      onChange={(e) => setConcludedDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Letter Issue Date (DD/MM/YYYY)
                    </label>
                    <input
                      type="text"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Signatory Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>

                  {/* Signatory Title */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                      Signatory Designation
                    </label>
                    <input
                      type="text"
                      value={signatoryTitle}
                      onChange={(e) => setSignatoryTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                      }}
                    />
                  </div>
                </div>

                {/* Bottom Step 1 Action */}
                <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    onClick={() => setStep(2)}
                    icon={<ArrowRight size={15} />}
                    style={{ backgroundColor: '#8f422b', borderColor: '#8f422b' }}
                  >
                    Continue to Preview
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* STEP 2: HIGH-FIDELITY OFFICIAL TASKNERA LETTER PREVIEW (A4)       */
            /* ================================================================= */
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 30px' }}>
              <div
                id="printable-internship-concluding-letter"
                style={{
                  width: '100%',
                  maxWidth: '780px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  padding: '42px 48px',
                  color: '#0f172a',
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  fontSize: '13.5px',
                  lineHeight: '1.6',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '1020px',
                }}
              >
                <div>
                  {/* Top Header: TaskNera Logo Left + Contact Right */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 24,
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="TaskNera"
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#334155', lineHeight: 1.45 }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                        TaskNera
                      </div>
                      <div>D-57 F1 Dilshad Colony, Shahdara, Delhi – 110095</div>
                      <div>Email: careers@tasknera.com</div>
                    </div>
                  </div>

                  {/* Metadata Block (Left) */}
                  <div
                    style={{
                      marginBottom: 24,
                      fontSize: '13px',
                      color: '#0f172a',
                      lineHeight: 1.6,
                    }}
                  >
                    <div>
                      <strong>Reference:</strong> {hl(referenceNumber)}
                    </div>
                    <div>
                      <strong>Date:</strong> {hl(issueDate)}
                    </div>
                    <div>
                      <strong>Intern Name:</strong> {hl(internName)}
                    </div>
                    <div>
                      <strong>Designation / Role:</strong> {hl(internshipRole)}
                    </div>
                  </div>

                  {/* Centered Document Title */}
                  <div style={{ textAlign: 'center', margin: '28px 0 24px 0' }}>
                    <h1
                      className="terracotta-title"
                      style={{
                        margin: 0,
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#8f422b',
                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      Internship Concluding Letter
                    </h1>
                  </div>

                  {/* Salutation */}
                  <div style={{ marginBottom: 14, fontWeight: 600 }}>
                    Dear {hl(`${salutation} ${internName}`)},
                  </div>

                  {/* Subject Line */}
                  <div style={{ marginBottom: 16, fontWeight: 700 }}>
                    Subject: Conclusion of Internship with TaskNera
                  </div>

                  {/* Body Paragraph 1: Reference to Offer Letter */}
                  <p style={{ margin: '0 0 14px 0', textAlign: 'justify', lineHeight: 1.6 }}>
                    With reference to the Offer Letter bearing reference number {hl(offerLetterRef)}, issued to you by
                    TaskNera, this letter formally confirms the conclusion of your internship engagement with the Company.
                  </p>

                  {/* Body Paragraph 2: Commencement and Role */}
                  <p style={{ margin: '0 0 18px 0', textAlign: 'justify', lineHeight: 1.6 }}>
                    As per the terms communicated in your Offer Letter, your internship commenced on {hl(commencedDate)} and
                    concluded on {hl(concludedDate)}. Your internship was undertaken in the role of {hl(internshipRole)} with{' '}
                    {hl(department)}.
                  </p>

                  {/* Section 1: Internship Completion */}
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      className="terracotta-title"
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#8f422b',
                        margin: '0 0 6px 0',
                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                      }}
                    >
                      Internship Completion
                    </h3>
                    <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.6 }}>
                      This letter is issued to formally acknowledge that the above internship period has been completed and the
                      engagement stands concluded with effect from {hl(concludedDate)}. Any applicable completion
                      formalities, including the return of Company property and closure of access to Company systems and
                      information, shall be completed in accordance with Company policy.
                    </p>
                  </div>

                  {/* Section 2: Continuing Obligations */}
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      className="terracotta-title"
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#8f422b',
                        margin: '0 0 6px 0',
                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                      }}
                    >
                      Continuing Obligations
                    </h3>
                    <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.6 }}>
                      The confidentiality, intellectual property, data protection, information security and other
                      obligations that are expressly stated to survive the end of the engagement shall continue to apply in
                      accordance with the Offer Letter, its annexures and applicable Company policies.
                    </p>
                  </div>

                  {/* Section 3: Acknowledgement */}
                  <div style={{ marginBottom: 28 }}>
                    <h3
                      className="terracotta-title"
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#8f422b',
                        margin: '0 0 6px 0',
                        fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                      }}
                    >
                      Acknowledgement
                    </h3>
                    <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.6 }}>
                      We appreciate your time, efforts and contributions during your internship with TaskNera and thank you
                      for your association with the Company. We wish you continued learning, growth and success in your
                      future endeavours.
                    </p>
                  </div>

                  {/* Signatory Block */}
                  <div style={{ marginTop: 24, fontSize: '13px', lineHeight: 1.55 }}>
                    <div style={{ fontWeight: 600, marginBottom: 20 }}>For TaskNera</div>
                    <div style={{ width: 220, borderBottom: '1px solid #64748b', marginBottom: 8 }} />
                    <div>
                      <strong>Name:</strong> {signatoryName}
                    </div>
                    <div>
                      <strong>Designation:</strong> {signatoryTitle}
                    </div>
                    <div>
                      <strong>Date:</strong> {hl(issueDate)}
                    </div>
                  </div>
                </div>

                {/* Footer: TaskNera | Page 1 of 1 */}
                <div
                  style={{
                    marginTop: 36,
                    paddingTop: 12,
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#64748b',
                    letterSpacing: '0.02em',
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
