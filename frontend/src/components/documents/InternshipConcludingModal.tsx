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
  Building2,
  Calendar,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  FileText,
  Clock,
  ShieldCheck,
  Award,
  DollarSign,
  FileCheck2,
  Check,
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

  // Navigation steps: 1 = Edit Details & Formalities, 2 = Official Letter Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee / Intern Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Preview options
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Helper date formatting
  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Form Fields - Reference & Dates
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(10 + Math.random() * 90);
    return `TN/HR/INT/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Intern Personal & Role Details
  const [internFullName, setInternFullName] = useState<string>('Rohan Verma');
  const [internSalutation, setInternSalutation] = useState<string>('Rohan');
  const [internId, setInternId] = useState<string>('INT-2026-042');
  const [internshipRole, setInternshipRole] = useState<string>('Talent Acquisition & Sourcing Intern');
  const [department, setDepartment] = useState<string>('HR & Recruitment');
  const [contactAddress, setContactAddress] = useState<string>(
    'Flat 102, Green Meadows, Koramangala, Bangalore – 560034 | rohan.verma@example.com'
  );

  // Tenure & Engagement
  const [commencedDate, setCommencedDate] = useState<string>('01 August 2026');
  const [lastWorkingDay, setLastWorkingDay] = useState<string>(() => formatDateString(new Date()));
  const [duration, setDuration] = useState<string>('3 months');
  const [workDescription, setWorkDescription] = useState<string>(
    'candidate sourcing, initial resume screening, interview coordination, and ATS pipeline tracking'
  );
  const [performanceConductNote, setPerformanceConductNote] = useState<string>(
    'Your dedication, proactive initiative, and consistent professionalism were deeply appreciated by the team.'
  );

  // Formalities (Points 1 to 5)
  const [handoverRecipient, setHandoverRecipient] = useState<string>('Ms. Sheetal Bedi / Operations Lead');
  const [hasStipend, setHasStipend] = useState<boolean>(true);
  const [stipendPaymentDate, setStipendPaymentDate] = useState<string>(() =>
    formatDateString(addDays(new Date(), 7))
  );

  // Signatory (Tasknera)
  const [taskneraSignatoryName, setTaskneraSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [taskneraSignatoryTitle, setTaskneraSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [taskneraSignatoryPlace, setTaskneraSignatoryPlace] = useState<string>('Delhi, India');
  const [taskneraSignDate, setTaskneraSignDate] = useState<string>(() => formatDateString(new Date()));

  // Acknowledgement (Intern)
  const [internSignDate, setInternSignDate] = useState<string>(() => formatDateString(new Date()));
  const [internSignPlace, setInternSignPlace] = useState<string>('Delhi');

  // Load employee roster
  useEffect(() => {
    let isMounted = true;
    const loadRoster = async () => {
      setLoadingEmployees(true);
      try {
        const list = await EmployeeService.listEmployees();
        if (isMounted) {
          setEmployees(list || []);
        }
      } catch (err) {
        console.warn('Failed to load employee roster for internship autofill:', err);
      } finally {
        if (isMounted) setLoadingEmployees(false);
      }
    };
    loadRoster();
    return () => {
      isMounted = false;
    };
  }, []);

  // Autofill on selecting intern / employee
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setInternFullName(emp.fullName);
    const firstName = emp.fullName.trim().split(' ')[0] || emp.fullName;
    setInternSalutation(firstName);
    setInternId(emp.employeeId || 'INT-1001');
    setInternshipRole(emp.designation || 'Intern');
    setDepartment(emp.department || 'Operations');
    const emailStr = emp.personalEmail || emp.officialEmail || '';
    const locStr = emp.workLocation ? `${emp.workLocation}, India` : '';
    setContactAddress([locStr, emailStr].filter(Boolean).join(' | '));
    if (emp.workLocation) {
      setInternSignPlace(emp.workLocation.split(',')[0].trim());
    }
    if (emp.joiningDate) {
      setCommencedDate(emp.joiningDate);
    }
    success(`Selected ${emp.fullName} - intern details populated!`);
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = selectedDeptFilter === 'ALL' || emp.department === selectedDeptFilter;
      const q = employeeSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        (emp.officialEmail && emp.officialEmail.toLowerCase().includes(q));
      return matchDept && matchSearch;
    });
  }, [employees, selectedDeptFilter, employeeSearch]);

  // Download PDF via clean iframe
  const handleDownloadPdf = () => {
    const letterElement = document.getElementById('printable-internship-concluding-letter');
    if (!letterElement) {
      window.print();
      return;
    }

    const docTitle = `Tasknera_Conclusion_of_Internship_${internFullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
              margin: 12mm 16mm 12mm 16mm;
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
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 9.75pt;
              line-height: 1.48;
            }
            .internship-page {
              width: 100%;
              min-height: 270mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            p {
              margin: 0 0 9px 0;
              line-height: 1.48;
              text-align: justify;
            }
            ol {
              margin: 4px 0 10px 0;
              padding-left: 18px;
            }
            ol li {
              margin-bottom: 6px;
              line-height: 1.48;
              padding-left: 4px;
            }
            mark {
              background-color: #fef08a !important;
              color: #854d0e !important;
              padding: 1px 3px;
              border-radius: 2px;
              font-weight: 600;
            }
            .company-seal-box {
              width: 130px;
              height: 120px;
              border: 1.5px solid #475569;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #64748b;
              font-size: 8.5pt;
              font-weight: 600;
              text-align: center;
              background-color: #ffffff;
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
        console.warn('Iframe print failed, falling back:', err);
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

  // Save to generated documents registry
  const handleSaveToDocuments = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'INTERNSHIP_LETTER',
          title: `Conclusion of Internship - ${internFullName} (${internId})`,
          recipientName: internFullName,
          recipientEmail: contactAddress.includes('@') ? contactAddress.split('|').pop()?.trim() || '' : '',
          recipientExternalId: selectedEmployeeId || internId,
          signatoryName: taskneraSignatoryName,
          signatoryTitle: taskneraSignatoryTitle,
          effectiveDate: lastWorkingDay,
        });
      } catch (backendErr) {
        console.warn('Backend API note:', backendErr);
      }
      success(`Conclusion of Internship letter for ${internFullName} saved successfully to Documents Registry!`);
      if (createdDoc && onSuccess) {
        onSuccess(createdDoc);
      }
    } catch (err: any) {
      error(err.message || 'Failed to record document.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          width: '100%',
          maxWidth: step === 1 ? '1060px' : '1160px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Top Header Bar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#fff7ed',
                border: '1px solid #ffedd5',
                color: '#ea580c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Conclusion of Internship Generator
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#ffedd5',
                    color: '#c2410c',
                    border: '1px solid #fed7aa',
                  }}
                >
                  TN/HR/INT Format
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official Tasknera Fixed-Term Internship Conclusion Letter &bull; 1-Page Dual Signatory Format
              </p>
            </div>
          </div>

          {/* Stepper & Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                padding: '3px',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#0f172a' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                1. Edit Details &amp; Formalities
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#0f172a' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                2. Live Official Preview
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                borderRadius: 6,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: step === 1 ? '#f8fafc' : '#475569',
          }}
        >
          {step === 1 ? (
            /* =========================================================================
               STEP 1: CONFIGURATION & INTERNSHIP FORM
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Intern Selection Quick Bar */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '18px 20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} style={{ color: '#ea580c' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Quick Select Intern / Employee
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ({filteredEmployees.length} registered profiles)
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: 220 }}>
                    <Search
                      size={14}
                      style={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search name, ID, department..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Horizontal scroll cards */}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    overflowX: 'auto',
                    paddingBottom: 6,
                  }}
                >
                  {filteredEmployees.slice(0, 10).map((emp) => {
                    const isSelected = selectedEmployeeId === emp.id;
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        style={{
                          flexShrink: 0,
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #ea580c' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#fff7ed' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s ease',
                          minWidth: 200,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#ffedd5' : '#f1f5f9',
                            color: isSelected ? '#c2410c' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                          }}
                        >
                          {emp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {emp.employeeId} &bull; {emp.department}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Reference & Intern Profile */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                  gap: 20,
                }}
              >
                {/* Column 1: Reference & Dates */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                    <FileText size={17} style={{ color: '#ea580c' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Letter Reference &amp; Dates
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Reference Number (Ref. No.)
                      </label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Issue Date
                      </label>
                      <input
                        type="text"
                        value={letterDate}
                        onChange={(e) => setLetterDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Commenced On (Start Date)
                      </label>
                      <input
                        type="text"
                        value={commencedDate}
                        onChange={(e) => setCommencedDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Last Working Day (Conclusion Date)
                      </label>
                      <input
                        type="text"
                        value={lastWorkingDay}
                        onChange={(e) => setLastWorkingDay(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Internship Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 3 months / 6 months"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                {/* Column 2: Intern Profile */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                    <User size={17} style={{ color: '#ea580c' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Intern Recipient Profile
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Intern Full Name
                      </label>
                      <input
                        type="text"
                        value={internFullName}
                        onChange={(e) => setInternFullName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Intern ID
                      </label>
                      <input
                        type="text"
                        value={internId}
                        onChange={(e) => setInternId(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Internship Role
                      </label>
                      <input
                        type="text"
                        value={internshipRole}
                        onChange={(e) => setInternshipRole(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Department Team
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Address / Email Address
                    </label>
                    <input
                      type="text"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      placeholder="Address / Email address"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Engagement Scope & Performance Praise */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <Briefcase size={17} style={{ color: '#ea580c' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Work Engagement Scope &amp; Performance Note
                  </h4>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Brief Description of Work Engaged (e.g. sourcing, screening, coordination, HR operations)
                  </label>
                  <textarea
                    rows={2}
                    value={workDescription}
                    onChange={(e) => setWorkDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Optional: Performance or Conduct Line
                  </label>
                  <input
                    type="text"
                    value={performanceConductNote}
                    onChange={(e) => setPerformanceConductNote(e.target.value)}
                    placeholder="e.g. Your dedication, proactive initiative, and consistent professionalism were appreciated."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                    }}
                  />
                </div>
              </div>

              {/* Card 3: Formalities (Handover, Stipend & Certificate) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1px solid #fed7aa',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <ShieldCheck size={18} style={{ color: '#ea580c' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Conclusion Formalities (Points 1 to 5)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Point 1: Handover Recipient (Name / Designation)
                    </label>
                    <input
                      type="text"
                      value={handoverRecipient}
                      onChange={(e) => setHandoverRecipient(e.target.value)}
                      placeholder="e.g. Ms. Sheetal Bedi / Team Lead"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Point 4: Stipend Disbursal Date (If applicable)
                    </label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        type="text"
                        disabled={!hasStipend}
                        value={stipendPaymentDate}
                        onChange={(e) => setStipendPaymentDate(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: hasStipend ? '#ffffff' : '#f1f5f9',
                          color: '#0f172a',
                        }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={hasStipend}
                          onChange={(e) => setHasStipend(e.target.checked)}
                          style={{ accentColor: '#ea580c' }}
                        />
                        Applicable
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  &bull; Point 2 enforces complete access withdrawal &amp; equipment return at close of business on the Last Working Day.
                  <br />
                  &bull; Point 5 promises the official Internship Completion Certificate upon clearance.
                </div>
              </div>

              {/* Card 4: Signatories & Acknowledgement */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <Building2 size={17} style={{ color: '#ea580c' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Dual Signatory Details &amp; Acknowledgement
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Tasknera Authorised Signatory
                    </label>
                    <input
                      type="text"
                      value={taskneraSignatoryName}
                      onChange={(e) => setTaskneraSignatoryName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      value={taskneraSignatoryTitle}
                      onChange={(e) => setTaskneraSignatoryTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Signatory Place
                    </label>
                    <input
                      type="text"
                      value={taskneraSignatoryPlace}
                      onChange={(e) => setTaskneraSignatoryPlace(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Intern Acknowledgement Place
                    </label>
                    <input
                      type="text"
                      value={internSignPlace}
                      onChange={(e) => setInternSignPlace(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 6 }}>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={14} />}
                  onClick={() => {
                    setStep(2);
                    if (scrollContainerRef.current) {
                      scrollContainerRef.current.scrollTop = 0;
                    }
                  }}
                  style={{ backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                >
                  Proceed to Official 1-Page Preview
                </Button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               STEP 2: OFFICIAL 1-PAGE PREVIEW (MATCHING USER PDF)
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* Preview Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 820,
                  backgroundColor: '#ffffff',
                  borderRadius: 10,
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(1)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Back to Edit
                  </Button>

                  <button
                    type="button"
                    onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: highlightPlaceholders ? '1.5px solid #ca8a04' : '1px solid #cbd5e1',
                      backgroundColor: highlightPlaceholders ? '#fef08a' : '#ffffff',
                      color: highlightPlaceholders ? '#854d0e' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Highlighter size={14} />
                    {highlightPlaceholders ? 'Fields Highlighted' : 'Highlight Fields'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem', background: '#ea580c', borderColor: '#ea580c' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocuments}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents'}
                  </Button>
                </div>
              </div>

              {/* Printable Document Container (Exact 1-Page Tasknera Format) */}
              <div
                id="printable-internship-concluding-letter"
                style={{
                  width: '100%',
                  maxWidth: 820,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  className="internship-page"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '44px 56px 36px 56px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                    borderRadius: 4,
                    minHeight: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    color: '#1e293b',
                    fontSize: '9.75pt',
                    lineHeight: 1.48,
                  }}
                >
                  <div>
                    {/* Centered Tasknera Brand Letterhead */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 16,
                        marginBottom: 16,
                        textAlign: 'center',
                      }}
                    >
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 6 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1.45rem',
                          color: '#0f2744',
                          letterSpacing: '0.32em',
                          lineHeight: 1.2,
                          textTransform: 'uppercase',
                        }}
                      >
                        T A S K N E R A
                      </div>
                      <div
                        style={{
                          fontSize: '0.675rem',
                          color: '#64748b',
                          letterSpacing: '0.08em',
                          fontWeight: 600,
                          marginTop: 3,
                          textTransform: 'uppercase',
                        }}
                      >
                        GLOBAL HR SOLUTIONS &nbsp;|&nbsp; RECRUITMENT &nbsp;|&nbsp; WORKFORCE SUPPORT
                      </div>
                    </div>

                    {/* Reference & Date Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginTop: 6,
                        marginBottom: 12,
                        fontSize: '9.5pt',
                      }}
                    >
                      <div>
                        <strong>Ref. No.:</strong>{' '}
                        {highlightPlaceholders ? <mark>{referenceNumber}</mark> : referenceNumber}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Date:</strong>{' '}
                        {highlightPlaceholders ? <mark>{letterDate}</mark> : letterDate}
                      </div>
                    </div>

                    {/* Recipient Block */}
                    <div style={{ marginBottom: 14, lineHeight: 1.42 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>To,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {highlightPlaceholders ? <mark>{internFullName}</mark> : internFullName}
                      </div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>
                        Intern ID: {highlightPlaceholders ? <mark>{internId}</mark> : internId} &nbsp;|&nbsp; [
                        {highlightPlaceholders ? <mark>{internshipRole}</mark> : internshipRole} /{' '}
                        {highlightPlaceholders ? <mark>{department}</mark> : department}]
                      </div>
                      <div style={{ color: '#334155', marginTop: 1 }}>
                        {highlightPlaceholders ? <mark>{contactAddress}</mark> : contactAddress}
                      </div>
                    </div>

                    {/* Subject */}
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: '9.75pt',
                        marginBottom: 12,
                      }}
                    >
                      Subject: Conclusion of Internship
                    </div>

                    {/* Salutation */}
                    <div style={{ marginBottom: 10, color: '#0f172a' }}>
                      Dear {highlightPlaceholders ? <mark>{internSalutation}</mark> : internSalutation},
                    </div>

                    {/* Paragraph 1 */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      This letter confirms that your internship with Tasknera as{' '}
                      {highlightPlaceholders ? <mark>{internshipRole}</mark> : internshipRole} in the{' '}
                      {highlightPlaceholders ? <mark>{department}</mark> : department} team, which commenced on{' '}
                      {highlightPlaceholders ? <mark>{commencedDate}</mark> : commencedDate}, will conclude on{' '}
                      {highlightPlaceholders ? <mark>{lastWorkingDay}</mark> : lastWorkingDay} (the “
                      <strong>Last Working Day</strong>”), on completion of the internship period of{' '}
                      {highlightPlaceholders ? <mark>{duration}</mark> : duration}.
                    </p>

                    {/* Paragraph 2 */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      During this period you were engaged in{' '}
                      {highlightPlaceholders ? <mark>{workDescription}</mark> : workDescription}.{' '}
                      {performanceConductNote && (
                        <span>
                          {highlightPlaceholders ? (
                            <mark>{performanceConductNote}</mark>
                          ) : (
                            performanceConductNote
                          )}
                        </span>
                      )}
                    </p>

                    <p style={{ marginBottom: 6 }}>
                      The following formalities apply on conclusion of your internship:
                    </p>

                    {/* Ordered Formalities (1 to 5) */}
                    <ol style={{ margin: '0 0 12px 0', paddingLeft: 18 }}>
                      <li style={{ textAlign: 'justify', marginBottom: 5 }}>
                        <strong>Handover.</strong> Please hand over all work, files, trackers and responsibilities to{' '}
                        {highlightPlaceholders ? <mark>{handoverRecipient}</mark> : handoverRecipient} on or before the
                        Last Working Day.
                      </li>
                      <li style={{ textAlign: 'justify', marginBottom: 5 }}>
                        <strong>Company property and access.</strong> Please return all Company property, and
                        credentials, if any, issued to you. Your access to Company and Client systems, including the
                        ATS, CRM, email and communication channels, will be withdrawn at the close of business on the
                        Last Working Day.
                      </li>
                      <li style={{ textAlign: 'justify', marginBottom: 5 }}>
                        <strong>Confidentiality and data.</strong> You are required to return or securely delete all
                        Company, Client and Candidate information in your possession and to keep all such information
                        confidential after the Last Working Day. Your confidentiality and data-protection obligations
                        continue after your internship ends, as set out in your internship terms.
                      </li>
                      <li style={{ textAlign: 'justify', marginBottom: 5 }}>
                        <strong>Stipend and dues.</strong>{' '}
                        {hasStipend ? (
                          <>
                            Your stipend, if any, for the period up to the Last Working Day will be paid by{' '}
                            {highlightPlaceholders ? <mark>{stipendPaymentDate}</mark> : stipendPaymentDate}, subject to
                            completion of the above formalities and applicable deductions.
                          </>
                        ) : (
                          <>
                            [Retain if applicable:] Your stipend, if any, for the period up to the Last Working Day will
                            be paid by [DD Month YYYY], subject to completion of the above formalities and applicable
                            deductions.
                          </>
                        )}
                      </li>
                      <li style={{ textAlign: 'justify', marginBottom: 5 }}>
                        <strong>Certificate.</strong> An Internship Completion Certificate will be issued to you once the
                        above formalities are complete.
                      </li>
                    </ol>

                    {/* Disclaimer paragraph */}
                    <p style={{ textAlign: 'justify', marginBottom: 12 }}>
                      This internship was for a fixed period and does not by itself create any right to employment or
                      continued engagement with Tasknera. We thank you for your contribution to Tasknera and wish you
                      every success in your academic and professional journey.
                    </p>

                    {/* Closing signoff */}
                    <div style={{ marginBottom: 14 }}>
                      <div>Yours sincerely,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        For and on behalf of TASKNERA
                      </div>
                    </div>

                    {/* 3-column Signatures & Acknowledgement Block */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 130px 1.2fr',
                        gap: 20,
                        alignItems: 'flex-start',
                        marginTop: 14,
                        paddingTop: 6,
                      }}
                    >
                      {/* Left: Authorised Signatory */}
                      <div>
                        <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', marginBottom: 28 }}>
                          Signature of Authorised Signatory
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          Name: {highlightPlaceholders ? <mark>{taskneraSignatoryName}</mark> : taskneraSignatoryName}
                        </div>
                        <div>
                          Designation:{' '}
                          {highlightPlaceholders ? <mark>{taskneraSignatoryTitle}</mark> : taskneraSignatoryTitle}
                        </div>
                        <div>
                          Date: {highlightPlaceholders ? <mark>{taskneraSignDate}</mark> : taskneraSignDate}
                        </div>
                        <div>
                          Place:{' '}
                          {highlightPlaceholders ? <mark>{taskneraSignatoryPlace}</mark> : taskneraSignatoryPlace}
                        </div>
                      </div>

                      {/* Center: Company Seal Box */}
                      <div className="company-seal-box">
                        Company Seal
                      </div>

                      {/* Right: ACKNOWLEDGEMENT OF RECEIPT */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '9pt', marginBottom: 4 }}>
                          ACKNOWLEDGEMENT OF RECEIPT
                        </div>
                        <div style={{ fontSize: '9pt', color: '#334155', marginBottom: 18, lineHeight: 1.4 }}>
                          I,{' '}
                          {highlightPlaceholders ? (
                            <mark>{internFullName}</mark>
                          ) : (
                            internFullName
                          )}
                          , acknowledge receipt of this letter.
                        </div>

                        <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', marginBottom: 26 }}>
                          Signature of Intern
                        </div>

                        <div style={{ fontSize: '9pt' }}>
                          <div>
                            <strong>Date:</strong>{' '}
                            {highlightPlaceholders ? <mark>{internSignDate}</mark> : internSignDate}
                          </div>
                          <div style={{ marginTop: 2 }}>
                            <strong>Place:</strong>{' '}
                            {highlightPlaceholders ? <mark>{internSignPlace}</mark> : internSignPlace}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Official 1-Page Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 10,
                      marginTop: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      fontSize: '7.5pt',
                      color: '#64748b',
                    }}
                  >
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div style={{ marginTop: 2 }}>Confidential | Page 1 of 1</div>
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
