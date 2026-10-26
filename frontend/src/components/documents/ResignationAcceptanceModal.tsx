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
  FileText,
  Clock,
  ShieldCheck,
  Award,
  Check,
  UserMinus,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface ResignationAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export type NoticePeriodMode = 'SERVE_NOTICE' | 'WAIVE_SHORTEN' | 'RECOVER_SHORTFALL';

export const ResignationAcceptanceModal: React.FC<ResignationAcceptanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Edit Details & Formalities, 2 = Official 2-Page Letter Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee Selection State
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
    return `TN/HR/RES/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Rahul Sharma');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Rahul');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1048');
  const [designation, setDesignation] = useState<string>('Senior Technical Recruiter');
  const [department, setDepartment] = useState<string>('Talent Acquisition');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat 302, Palm Grove Apartments, Sector 62, Noida – 201301, Uttar Pradesh'
  );
  const [employeeEmail, setEmployeeEmail] = useState<string>('rahul.sharma@example.com');

  // Resignation Timeline
  const [resignationLetterDate, setResignationLetterDate] = useState<string>(() =>
    formatDateString(addDays(new Date(), -14))
  );
  const [lastWorkingDay, setLastWorkingDay] = useState<string>(() =>
    formatDateString(addDays(new Date(), 16))
  );

  // Notice Period Option (Point 3)
  const [noticePeriodMode, setNoticePeriodMode] = useState<NoticePeriodMode>('SERVE_NOTICE');
  const [noticePeriodDays, setNoticePeriodDays] = useState<string>('30');
  const [noticeClauseNumber, setNoticeClauseNumber] = useState<string>('8.2');

  // Handover & Formalities (Point 4 & 6)
  const [handoverRecipient, setHandoverRecipient] = useState<string>(
    'Ms. Priya Patel / Lead - Talent Operations'
  );
  const [fnfSettlementDays, setFnfSettlementDays] = useState<string>('30');

  // Signatory (Tasknera)
  const [taskneraSignatoryName, setTaskneraSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [taskneraSignatoryTitle, setTaskneraSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [taskneraSignatoryPlace, setTaskneraSignatoryPlace] = useState<string>('Delhi, India');
  const [taskneraSignDate, setTaskneraSignDate] = useState<string>(() => formatDateString(new Date()));

  // Acknowledgement (Employee)
  const [employeeSignDate, setEmployeeSignDate] = useState<string>(() => formatDateString(new Date()));
  const [employeeSignPlace, setEmployeeSignPlace] = useState<string>('Noida');

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
        console.warn('Failed to load employee roster for resignation autofill:', err);
      } finally {
        if (isMounted) setLoadingEmployees(false);
      }
    };
    loadRoster();
    return () => {
      isMounted = false;
    };
  }, []);

  // Autofill on initialEmployee or selecting an employee
  useEffect(() => {
    if (initialEmployee) {
      handleSelectEmployee(initialEmployee);
    }
  }, [initialEmployee]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(emp.fullName);
    const firstName = emp.fullName.trim().split(' ')[0] || emp.fullName;
    setEmployeeSalutation(firstName);
    setEmployeeId(emp.employeeId || 'EMP-1001');
    setDesignation(emp.designation || 'Specialist');
    setDepartment(emp.department || 'Operations');
    if (emp.personalEmail || emp.officialEmail) {
      setEmployeeEmail(emp.personalEmail || emp.officialEmail || '');
    }
    const addrParts: string[] = [];
    if (emp.addressLine) addrParts.push(emp.addressLine);
    if (emp.city) addrParts.push(emp.city);
    if (emp.state) addrParts.push(emp.state);
    if (emp.pinCode) addrParts.push(emp.pinCode);
    if (addrParts.length > 0) {
      setResidentialAddress(addrParts.join(', '));
    } else if (emp.workLocation) {
      setResidentialAddress(`${emp.workLocation}, India`);
    }
    if (emp.city) {
      setEmployeeSignPlace(emp.city);
    } else if (emp.workLocation) {
      setEmployeeSignPlace(emp.workLocation.split(',')[0].trim());
    }
    success(`Selected ${emp.fullName} - employee resignation details populated!`);
  };

  // Filtered employees
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

  // Hidden Iframe PDF Print
  const handleDownloadPdf = () => {
    const letterElement = document.getElementById('printable-resignation-acceptance-letter');
    if (!letterElement) {
      window.print();
      return;
    }

    const docTitle = `Tasknera_Resignation_Acceptance_${employeeFullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
            .page-break {
              page-break-after: always;
              break-after: page;
              height: 0;
              margin: 0;
              padding: 0;
            }
            .resignation-page {
              width: 100%;
              min-height: 265mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 6mm 4mm;
              background: #ffffff;
            }
            p {
              margin: 0 0 10px 0;
            }
            strong {
              color: #0f172a;
            }
            mark {
              background-color: #fef08a;
              color: #854d0e;
              padding: 1px 4px;
              border-radius: 2px;
            }
          </style>
        </head>
        <body>
          ${letterElement.innerHTML}
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
          documentTypeCode: 'RELIEVING_LETTER',
          title: `Acceptance of Resignation - ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: employeeEmail,
          recipientExternalId: selectedEmployeeId || employeeId,
          signatoryName: taskneraSignatoryName,
          signatoryTitle: taskneraSignatoryTitle,
          effectiveDate: lastWorkingDay,
        });
      } catch (backendErr) {
        console.warn('Backend API note:', backendErr);
      }
      success(`Resignation Acceptance letter for ${employeeFullName} saved successfully to Documents Registry!`);
      if (createdDoc && onSuccess) {
        onSuccess(createdDoc);
      }
    } catch (err: any) {
      error(err.message || 'Failed to record document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1160px',
          height: '94vh',
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Top App Bar */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
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
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <UserMinus size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Acceptance of Resignation
                </h2>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  TN/HR/RES/YYYY/000
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                  }}
                >
                  Official 2-Page Format
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Acknowledges resignation, sets Last Working Day, notice period terms, handover & FNF settlement timeline.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step Pills */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '3px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#0f172a' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                1. Edit Resignation & Terms
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#0f172a' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                2. Official 2-Page Preview
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {step === 1 ? (
            /* =========================================================================
               STEP 1: EDIT DETAILS, NOTICE PERIOD & FORMALITIES
               ========================================================================= */
            <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection Quick Card */}
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
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} style={{ color: '#2563eb' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Quick Select Resigning Employee
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ({filteredEmployees.length} profiles found)
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: 240 }}>
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
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s ease',
                          minWidth: 210,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                            color: isSelected ? '#1d4ed8' : '#475569',
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

              {/* Grid 1: Reference, Employee & Resignation Dates */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                  gap: 20,
                }}
              >
                {/* Column 1: Reference & Letter Dates */}
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
                    <FileText size={17} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Reference &amp; Key Timeline
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
                          color: '#0f172a',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Letter Date
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
                        Resignation Letter Received Date (Point 1)
                      </label>
                      <input
                        type="text"
                        value={resignationLetterDate}
                        onChange={(e) => setResignationLetterDate(e.target.value)}
                        placeholder="e.g. 15 October 2026"
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
                        Last Working Day (Point 2)
                      </label>
                      <input
                        type="text"
                        value={lastWorkingDay}
                        onChange={(e) => setLastWorkingDay(e.target.value)}
                        placeholder="e.g. 14 November 2026"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 600,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Resigning Employee Profile */}
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
                    <User size={17} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Resigning Employee Details
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Full Name (To block)
                      </label>
                      <input
                        type="text"
                        value={employeeFullName}
                        onChange={(e) => {
                          setEmployeeFullName(e.target.value);
                          setEmployeeSalutation(e.target.value.trim().split(' ')[0] || e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
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
                        Designation
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
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
                        Department
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
                      Residential Address (To block)
                    </label>
                    <input
                      type="text"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
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

              {/* Notice Period Clause (Point 3 Select One) */}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={17} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Point 3: Notice Period Determination
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Select one of the 3 statutory options</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Option A: Serve notice */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: noticePeriodMode === 'SERVE_NOTICE' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: noticePeriodMode === 'SERVE_NOTICE' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="noticeOption"
                      checked={noticePeriodMode === 'SERVE_NOTICE'}
                      onChange={() => setNoticePeriodMode('SERVE_NOTICE')}
                      style={{ marginTop: 3 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        Option A: Full Notice Period Served
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                        "You are required to serve a notice period of <strong>{noticePeriodDays}</strong> days as per Clause <strong>{noticeClauseNumber}</strong> of your appointment letter, and your Last Working Day has been determined accordingly."
                      </div>

                      {noticePeriodMode === 'SERVE_NOTICE' && (
                        <div style={{ display: 'flex', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px dashed #bfdbfe' }}>
                          <div style={{ width: 140 }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#1e3a8a', marginBottom: 2 }}>
                              Notice Days
                            </label>
                            <input
                              type="text"
                              value={noticePeriodDays}
                              onChange={(e) => setNoticePeriodDays(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #93c5fd' }}
                            />
                          </div>
                          <div style={{ width: 140 }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#1e3a8a', marginBottom: 2 }}>
                              Clause Number
                            </label>
                            <input
                              type="text"
                              value={noticeClauseNumber}
                              onChange={(e) => setNoticeClauseNumber(e.target.value)}
                              style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #93c5fd' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option B: Waive or shorten */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: noticePeriodMode === 'WAIVE_SHORTEN' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: noticePeriodMode === 'WAIVE_SHORTEN' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="noticeOption"
                      checked={noticePeriodMode === 'WAIVE_SHORTEN'}
                      onChange={() => setNoticePeriodMode('WAIVE_SHORTEN')}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        Option B: Notice Waived / Shortened
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                        "The Company has agreed to waive or shorten the notice period."
                      </div>
                    </div>
                  </label>

                  {/* Option C: Shortfall recovered */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: noticePeriodMode === 'RECOVER_SHORTFALL' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: noticePeriodMode === 'RECOVER_SHORTFALL' ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="noticeOption"
                      checked={noticePeriodMode === 'RECOVER_SHORTFALL'}
                      onChange={() => setNoticePeriodMode('RECOVER_SHORTFALL')}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                        Option C: Shortfall in Notice Recovered
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>
                        "The shortfall in notice will be recovered as per your appointment letter."
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Handover & Settlement Terms (Points 4, 5, 6, 8) */}
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
                  <ShieldCheck size={17} style={{ color: '#2563eb' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Handover &amp; Full and Final Settlement (Points 4 &amp; 6)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Handover Recipient (Name / Designation - Point 4)
                    </label>
                    <input
                      type="text"
                      value={handoverRecipient}
                      onChange={(e) => setHandoverRecipient(e.target.value)}
                      placeholder="e.g. Ms. Sheetal Bedi / Operations Lead"
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
                      Full &amp; Final Settlement Days (Point 6)
                    </label>
                    <input
                      type="text"
                      value={fnfSettlementDays}
                      onChange={(e) => setFnfSettlementDays(e.target.value)}
                      placeholder="e.g. 30"
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

                <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                  &bull; <strong>Point 5:</strong> Mandates return of all Company property (laptop, ID, access credentials) and systems access withdrawal at close of business on the Last Working Day.
                  <br />
                  &bull; <strong>Point 7:</strong> Enforces post-employment confidentiality, non-solicitation and data protection.
                  <br />
                  &bull; <strong>Point 8:</strong> Official Relieving Letter will be issued upon completion of exit formalities and settlement.
                </div>
              </div>

              {/* Signatories & Acknowledgement */}
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
                  <Building2 size={17} style={{ color: '#2563eb' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Dual Signatory Details &amp; Acknowledgement Block
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
                      Signatory Designation
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
                      Employee Acknowledgement Place
                    </label>
                    <input
                      type="text"
                      value={employeeSignPlace}
                      onChange={(e) => setEmployeeSignPlace(e.target.value)}
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
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                >
                  Proceed to Official 2-Page Preview
                </Button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               STEP 2: OFFICIAL 2-PAGE PREVIEW (MATCHING USER PDF)
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* Preview Action Bar */}
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
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
                    style={{ fontSize: '0.8125rem', background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocuments}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#059669', borderColor: '#059669' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents'}
                  </Button>
                </div>
              </div>

              {/* Printable Document Container (Exact 2-Page Tasknera Format) */}
              <div
                id="printable-resignation-acceptance-letter"
                style={{
                  width: '100%',
                  maxWidth: 820,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}
              >
                {/* ===================================================================
                    PAGE 1: Header, Ref, Recipient, Subject & Clauses 1 to 8
                    =================================================================== */}
                <div
                  className="resignation-page"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '48px 56px 40px 56px',
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
                        paddingBottom: 18,
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
                        marginTop: 8,
                        marginBottom: 14,
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
                        {highlightPlaceholders ? <mark>{employeeFullName}</mark> : employeeFullName}
                      </div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>
                        Employee ID: {highlightPlaceholders ? <mark>{employeeId}</mark> : employeeId} &nbsp;|&nbsp;{' '}
                        {highlightPlaceholders ? <mark>{designation}</mark> : designation},{' '}
                        {highlightPlaceholders ? <mark>{department}</mark> : department}
                      </div>
                      <div style={{ color: '#334155', whiteSpace: 'pre-line', marginTop: 1 }}>
                        {highlightPlaceholders ? <mark>{residentialAddress}</mark> : residentialAddress}
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
                      Subject: Acceptance of Resignation
                    </div>

                    {/* Salutation */}
                    <div style={{ marginBottom: 10, color: '#0f172a' }}>
                      Dear {highlightPlaceholders ? <mark>{employeeSalutation}</mark> : employeeSalutation},
                    </div>

                    {/* Point 1: Reference */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>1. Reference.</strong> We acknowledge receipt of your resignation letter dated{' '}
                      {highlightPlaceholders ? <mark>{resignationLetterDate}</mark> : resignationLetterDate} from the
                      position of {highlightPlaceholders ? <mark>{designation}</mark> : designation} in the{' '}
                      {highlightPlaceholders ? <mark>{department}</mark> : department} team.
                    </p>

                    {/* Point 2: Acceptance */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>2. Acceptance.</strong> Your resignation is accepted. Your last working day with the
                      Company will be{' '}
                      {highlightPlaceholders ? <mark>{lastWorkingDay}</mark> : lastWorkingDay} (the “Last Working
                      Day”).
                    </p>

                    {/* Point 3: Notice period */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>3. Notice period.</strong>{' '}
                      {noticePeriodMode === 'SERVE_NOTICE' && (
                        <>
                          You are required to serve a notice period of{' '}
                          {highlightPlaceholders ? <mark>{noticePeriodDays}</mark> : noticePeriodDays} days as per
                          Clause {highlightPlaceholders ? <mark>{noticeClauseNumber}</mark> : noticeClauseNumber} of
                          your appointment letter, and your Last Working Day has been determined accordingly.
                        </>
                      )}
                      {noticePeriodMode === 'WAIVE_SHORTEN' && (
                        <>The Company has agreed to waive or shorten the notice period.</>
                      )}
                      {noticePeriodMode === 'RECOVER_SHORTFALL' && (
                        <>The shortfall in notice will be recovered as per your appointment letter.</>
                      )}
                    </p>

                    {/* Point 4: Handover */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>4. Handover.</strong> Please hand over all work, files and responsibilities to{' '}
                      {highlightPlaceholders ? <mark>{handoverRecipient}</mark> : handoverRecipient} before the Last
                      Working Day, and keep your reporting manager informed of the status of open tasks.
                    </p>

                    {/* Point 5: Exit formalities */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>5. Exit formalities.</strong> Please return all Company property (laptop, ID and access
                      cards, documents and credentials) and complete the exit clearance process with HR, Accounts and
                      your reporting manager by the Last Working Day. Your access to Company and Client systems will be
                      withdrawn at the close of business on the Last Working Day.
                    </p>

                    {/* Point 6: Full and final settlement */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>6. Full and final settlement.</strong> Your full and final settlement, covering salary up to
                      the Last Working Day, leave encashment (if any) as per policy, and statutory dues (if any), less
                      amounts due to the Company, will be processed within{' '}
                      {highlightPlaceholders ? <mark>{fnfSettlementDays}</mark> : fnfSettlementDays} working days of
                      the Last Working Day, subject to completion of the exit formalities.
                    </p>

                    {/* Point 7: Confidentiality */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>7. Confidentiality.</strong> Your confidentiality, data-protection, non-solicitation and
                      other post-employment obligations under your appointment letter and Company policies continue
                      after you leave the Company.
                    </p>

                    {/* Point 8: Relieving letter */}
                    <p style={{ textAlign: 'justify', marginBottom: 12 }}>
                      <strong>8. Relieving letter.</strong> Your Relieving Letter will be issued after completion of the
                      exit formalities and settlement.
                    </p>

                    {/* Closing Note */}
                    <p style={{ textAlign: 'justify', marginBottom: 0 }}>
                      We thank you for your contribution to Tasknera and wish you every success in the future. Please
                      sign and return a copy of this letter as acknowledgement.
                    </p>
                  </div>

                  {/* Page 1 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 12,
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      fontSize: '7.5pt',
                      color: '#64748b',
                    }}
                  >
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div style={{ marginTop: 2 }}>Confidential | Page 1 of 2</div>
                  </div>
                </div>

                {/* Print Page Break */}
                <div className="page-break" />

                {/* ===================================================================
                    PAGE 2: Header, Signatures, Seal & Acknowledgement
                    =================================================================== */}
                <div
                  className="resignation-page"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '48px 56px 40px 56px',
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
                    {/* Page 2 Top Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 10,
                        paddingBottom: 14,
                        marginBottom: 28,
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <img
                        src="/logo.png"
                        alt="Tasknera"
                        style={{ width: 22, height: 22, objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span
                        style={{
                          fontSize: '8.5pt',
                          color: '#64748b',
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                        }}
                      >
                        Resignation Acceptance Letter
                      </span>
                    </div>

                    {/* Signoff Line */}
                    <div style={{ marginBottom: 16 }}>
                      <div>Yours sincerely,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        For and on behalf of TASKNERA
                      </div>
                    </div>

                    {/* Side-by-side: Authorised Signatory | Company Seal | Acknowledgement of Receipt */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 130px 1.2fr',
                        gap: 20,
                        alignItems: 'flex-start',
                        marginTop: 20,
                        paddingTop: 8,
                      }}
                    >
                      {/* Left: Authorised Signatory */}
                      <div>
                        <div
                          style={{
                            borderBottom: '1px solid #cbd5e1',
                            height: 52,
                            marginBottom: 8,
                          }}
                        />
                        <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: 8 }}>
                          Signature of Authorised Signatory
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          Name: {highlightPlaceholders ? <mark>{taskneraSignatoryName}</mark> : taskneraSignatoryName}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Designation: {taskneraSignatoryTitle}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Date: {highlightPlaceholders ? <mark>{taskneraSignDate}</mark> : taskneraSignDate}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Place: {taskneraSignatoryPlace}
                        </div>
                      </div>

                      {/* Middle: Company Seal Box */}
                      <div
                        style={{
                          height: 104,
                          border: '1.5px solid #cbd5e1',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: '8.5pt',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: 8,
                        }}
                      >
                        Company Seal
                      </div>

                      {/* Right: Acknowledgement of Receipt */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '9pt', marginBottom: 4 }}>
                          ACKNOWLEDGEMENT OF RECEIPT
                        </div>
                        <p style={{ fontSize: '8.5pt', color: '#334155', margin: '0 0 10px 0' }}>
                          I,{' '}
                          <strong>
                            {highlightPlaceholders ? <mark>{employeeFullName}</mark> : employeeFullName}
                          </strong>
                          , acknowledge receipt of this letter.
                        </p>
                        <div
                          style={{
                            borderBottom: '1px solid #cbd5e1',
                            height: 38,
                            marginBottom: 8,
                          }}
                        />
                        <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: 8 }}>
                          Signature of Employee
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Date: {highlightPlaceholders ? <mark>{employeeSignDate}</mark> : employeeSignDate}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Place: {highlightPlaceholders ? <mark>{employeeSignPlace}</mark> : employeeSignPlace}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 12,
                      marginTop: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      fontSize: '7.5pt',
                      color: '#64748b',
                    }}
                  >
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div style={{ marginTop: 2 }}>Confidential | Page 2 of 2</div>
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
