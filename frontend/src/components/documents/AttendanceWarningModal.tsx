import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  Users,
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ShieldAlert,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
  UserX,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

const SHEETAL_BEDI_SIGNATURE_DATA_URL =
  'data:image/png;base64,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';

export interface AttendanceRecordItem {
  id: string;
  date: string;
  nature: string;
  details: string;
}

interface AttendanceWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const AttendanceWarningModal: React.FC<AttendanceWarningModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    initialEmployee?.id || null
  );
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Header & References
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/ATT/${yyyy}/${rand}`;
  });

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Vikramaditya Roy');
  const [salutationPrefix, setSalutationPrefix] = useState<string>('Dear');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Vikramaditya');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1042');
  const [designation, setDesignation] = useState<string>('Senior Technical Recruiter');
  const [department, setDepartment] = useState<string>('HR Operations');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat No. 402, Lotus Towers, Mayur Vihar Phase 1, Delhi – 110091'
  );

  // Irregular Period
  const [periodStartDate, setPeriodStartDate] = useState<string>('1 October 2026');
  const [periodEndDate, setPeriodEndDate] = useState<string>('24 October 2026');

  // Breakdown options
  const [absentDays, setAbsentDays] = useState<string>('3');
  const [lateOccasions, setLateOccasions] = useState<string>('2');
  const [earlyExitOccasions, setEarlyExitOccasions] = useState<string>('1');
  const [includeAbsent, setIncludeAbsent] = useState<boolean>(true);
  const [includeLate, setIncludeLate] = useState<boolean>(true);
  const [includeEarlyExit, setIncludeEarlyExit] = useState<boolean>(true);

  // Records Table
  const [records, setRecords] = useState<AttendanceRecordItem[]>([
    {
      id: 'rec-1',
      date: '06 October 2026',
      nature: 'Absent without leave',
      details: 'No advance leave applied; unreachable during working hours',
    },
    {
      id: 'rec-2',
      date: '14 October 2026',
      nature: 'Late arrival',
      details: 'Reported at 11:45 AM (scheduled start 09:30 AM) without intimation',
    },
    {
      id: 'rec-3',
      date: '21 October 2026',
      nature: 'Early exit without approval',
      details: 'Left workstation at 02:30 PM prior to shift completion',
    },
  ]);

  // Clause 1: Policy
  const [appointmentClause, setAppointmentClause] = useState<string>('4.2');
  const [policyRequirement, setPolicyRequirement] = useState<string>(
    'report by 09:30 AM, inform your reporting manager before any absence or late arrival, and apply for leave in advance'
  );

  // Clause 2: Explanation
  const [explanationType, setExplanationType] = useState<'NOT_PROVIDED' | 'SUBMIT_WITHIN_DAYS'>('NOT_PROVIDED');
  const [explanationDays, setExplanationDays] = useState<string>('3');

  // Clause 3: Warning & Loss of Pay
  const [includeLossOfPay, setIncludeLossOfPay] = useState<boolean>(true);

  // Closing / Representation Days
  const [contestDays, setContestDays] = useState<string>('3');

  // Signatory & Acknowledgement
  const [signatoryName, setSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>(
    'Chief Executive Officer (CEO)'
  );
  const [signatoryDate, setSignatoryDate] = useState<string>(() => formatDateString(new Date()));
  const [signatoryPlace, setSignatoryPlace] = useState<string>('Delhi, India');
  const [ackDate, setAckDate] = useState<string>(() => formatDateString(new Date()));
  const [ackCity, setAckCity] = useState<string>('Delhi');

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
      console.warn('Could not load employees for Attendance Warning:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    const name = emp.fullName || 'Employee';
    setEmployeeFullName(name);
    setEmployeeSalutation(name.split(' ')[0] || name);
    if (emp.employeeId) setEmployeeId(emp.employeeId);
    if (emp.designation) setDesignation(emp.designation);
    if (emp.department) setDepartment(emp.department);
    const addr = (emp as any).address || (emp as any).residentialAddress || '';
    if (addr) setResidentialAddress(addr);
  };

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return ['ALL', ...Array.from(depts)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = selectedDeptFilter === 'ALL' || emp.department === selectedDeptFilter;
      const q = employeeSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        emp.fullName?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [employees, selectedDeptFilter, employeeSearch]);

  const addRecordRow = () => {
    setRecords([
      ...records,
      {
        id: `rec-${Date.now()}`,
        date: formatDateString(new Date()),
        nature: 'Late arrival',
        details: 'Late by 45 minutes',
      },
    ]);
  };

  const removeRecordRow = (id: string) => {
    if (records.length <= 1) return;
    setRecords(records.filter((r) => r.id !== id));
  };

  const updateRecordRow = (id: string, field: keyof AttendanceRecordItem, val: string) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  // Compile paragraph for absence phrases
  const computedSummaryPhrases = useMemo(() => {
    const parts: string[] = [];
    if (includeAbsent) parts.push(`absent without approved leave on ${absentDays} day(s)`);
    if (includeLate) parts.push(`late on ${lateOccasions} occasion(s)`);
    if (includeEarlyExit) parts.push(`leaving early without approval on ${earlyExitOccasions} occasion(s)`);
    if (parts.length === 0) return 'absent without approved leave on 1 day(s)';
    return parts.join(' / ');
  }, [includeAbsent, absentDays, includeLate, lateOccasions, includeEarlyExit, earlyExitOccasions]);

  const renderHighlighted = (text: React.ReactNode) => {
    if (!highlightPlaceholders) return text;
    return (
      <mark
        style={{
          backgroundColor: '#fef08a',
          color: '#854d0e',
          padding: '1px 3px',
          borderRadius: 3,
        }}
      >
        {text}
      </mark>
    );
  };

  const handleDownloadPdf = () => {
    const el = document.getElementById('printable-attendance-warning-sheet');
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
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Warning_Irregular_Attendance_${employeeFullName.replace(/\\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 16mm 14mm 16mm;
            }
            body {
              font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            [contenteditable] {
              outline: none !important;
              border: none !important;
              background: transparent !important;
              box-shadow: none !important;
            }
            mark {
              background: transparent !important;
              color: inherit !important;
            }
            .page-container {
              box-sizing: border-box;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #1e293b;
              padding: 6px 10px;
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            ${el.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 250);
  };

  const handleSaveToDocumentsGenerated = async () => {
    setIsSaving(true);
    try {
      const selectedEmp = employees.find((e) => e.id === selectedEmployeeId);
      const recipientEmail =
        selectedEmp?.personalEmail ||
        selectedEmp?.officialEmail ||
        `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'TERMINATION_LETTER',
          title: `Warning – Irregular Attendance — ${employeeFullName}`,
          recipientName: employeeFullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle: signatoryDesignation,
          effectiveDate: letterDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber,
            employeeFullName,
            employeeId,
            designation,
            department,
            periodStartDate,
            periodEndDate,
            computedSummaryPhrases,
            records,
            signatoryName,
            signatoryDesignation,
          });
        }
      } catch (err) {
        console.warn('Backend sync not fully available; writing to local storage cache.', err);
      }

      // Also persist to TASKNERA_HR_DOCUMENTS for instant list hydration
      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-att-${Date.now()}`,
          documentTypeCode: 'TERMINATION_LETTER',
          title: `Warning – Irregular Attendance — ${employeeFullName}`,
          referenceNumber,
          recipientName: employeeFullName,
          recipientEmail,
          status: 'ISSUED',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          effectiveDate: letterDate,
          signatoryName,
          signatoryTitle: signatoryDesignation,
        };
        docs.unshift(localDoc);
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      success('Warning Letter (Irregular Attendance) issued & saved successfully!');
      if (onSuccess) onSuccess(createdDoc || undefined);
    } catch (err: any) {
      error(err.message || 'Failed to save attendance warning letter.');
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
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        ref={scrollContainerRef}
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: '#fff1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48',
                border: '1px solid #fecdd3',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Warning Letter &ndash; Irregular Attendance
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: '#ffe4e6',
                    color: '#be123c',
                    border: '1px solid #fecdd3',
                  }}
                >
                  TN/HR/ATT Format
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official 1-page disciplinary letter documenting attendance irregularities, breach of policy, loss-of-pay notification &amp; warnings.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 2 && (
              <Button
                variant="secondary"
                icon={<ArrowLeft size={15} />}
                onClick={() => setStep(1)}
                style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
              >
                Back to Edit
              </Button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
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

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {step === 1 ? (
            /* STEP 1: FORM CONFIGURATION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection Quick Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '18px 20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#e11d48" />
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      1. Select Employee from Directory
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search employee..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '4px 10px', width: 200 }}
                    />
                    <select
                      className="form-input"
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: 10,
                    maxHeight: 140,
                    overflowY: 'auto',
                    padding: 2,
                  }}
                >
                  {filteredEmployees.slice(0, 12).map((emp) => {
                    const isSel = selectedEmployeeId === emp.id;
                    return (
                      <div
                        key={emp.id}
                        onClick={() => applyEmployee(emp)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: isSel ? '1.5px solid #e11d48' : '1px solid #e2e8f0',
                          backgroundColor: isSel ? '#fff1f2' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: isSel ? '#e11d48' : '#e2e8f0',
                            color: isSel ? '#ffffff' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {emp.fullName?.charAt(0) || 'E'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.employeeId || 'No ID'} &bull; {emp.department || 'Staff'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reference & Employee Particulars */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  2. Reference &amp; Employee Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Ref. No.</label>
                    <input
                      type="text"
                      className="form-input"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Date of Letter</label>
                    <input
                      type="text"
                      className="form-input"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={employeeFullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmployeeFullName(val);
                        const prevFirst = employeeFullName.trim().split(' ')[0] || employeeFullName;
                        if (!employeeSalutation || employeeSalutation === prevFirst || employeeSalutation === 'Vikramaditya') {
                          setEmployeeSalutation(val.trim().split(' ')[0] || val);
                        }
                      }}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Salutation Prefix</label>
                    <input
                      type="text"
                      className="form-input"
                      value={salutationPrefix}
                      onChange={(e) => setSalutationPrefix(e.target.value)}
                      placeholder="e.g. Dear"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Greeting / Salutation Name ({salutationPrefix || 'Dear'} [Name])
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={employeeSalutation}
                      onChange={(e) => setEmployeeSalutation(e.target.value)}
                      placeholder="e.g. Vikramaditya or Mr. Roy"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Attendance Period & Irregularity Breakdown */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  3. Period Under Review &amp; Violation Summary
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Period From</label>
                    <input
                      type="text"
                      className="form-input"
                      value={periodStartDate}
                      onChange={(e) => setPeriodStartDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Period To</label>
                    <input
                      type="text"
                      className="form-input"
                      value={periodEndDate}
                      onChange={(e) => setPeriodEndDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Occurrences Breakdown:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                      <input
                        type="checkbox"
                        checked={includeAbsent}
                        onChange={(e) => setIncludeAbsent(e.target.checked)}
                      />
                      <span>Absent without approved leave:</span>
                      <input
                        type="text"
                        style={{ width: 45, padding: '2px 6px', fontSize: '0.8rem' }}
                        value={absentDays}
                        onChange={(e) => setAbsentDays(e.target.value)}
                      />
                      <span>day(s)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                      <input
                        type="checkbox"
                        checked={includeLate}
                        onChange={(e) => setIncludeLate(e.target.checked)}
                      />
                      <span>Late arrival:</span>
                      <input
                        type="text"
                        style={{ width: 45, padding: '2px 6px', fontSize: '0.8rem' }}
                        value={lateOccasions}
                        onChange={(e) => setLateOccasions(e.target.value)}
                      />
                      <span>occasion(s)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                      <input
                        type="checkbox"
                        checked={includeEarlyExit}
                        onChange={(e) => setIncludeEarlyExit(e.target.checked)}
                      />
                      <span>Leaving early without approval:</span>
                      <input
                        type="text"
                        style={{ width: 45, padding: '2px 6px', fontSize: '0.8rem' }}
                        value={earlyExitOccasions}
                        onChange={(e) => setEarlyExitOccasions(e.target.value)}
                      />
                      <span>occasion(s)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Specific Incident Log Table */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    4. Incident Records Table (As follows in Letter)
                  </h4>
                  <Button
                    variant="secondary"
                    icon={<Plus size={14} />}
                    onClick={addRecordRow}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    Add Incident
                  </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {records.map((rec, idx) => (
                    <div
                      key={rec.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '150px 200px 1fr 36px',
                        gap: 8,
                        alignItems: 'center',
                        padding: '6px 8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Date (e.g. 12 Oct 2026)"
                        value={rec.date}
                        onChange={(e) => updateRecordRow(rec.id, 'date', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nature (e.g. Late / Absent)"
                        value={rec.nature}
                        onChange={(e) => updateRecordRow(rec.id, 'nature', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Details (e.g. Time in / leave status)"
                        value={rec.details}
                        onChange={(e) => updateRecordRow(rec.id, 'details', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeRecordRow(rec.id)}
                        disabled={records.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: records.length <= 1 ? '#cbd5e1' : '#ef4444',
                          cursor: records.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Policy & Explanation Clauses */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  5. Clauses &amp; Legal Warnings
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Clause No.</label>
                    <input
                      type="text"
                      className="form-input"
                      value={appointmentClause}
                      onChange={(e) => setAppointmentClause(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Policy Attendance Requirements</label>
                    <input
                      type="text"
                      className="form-input"
                      value={policyRequirement}
                      onChange={(e) => setPolicyRequirement(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Clause 2: Explanation Status</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="explanationType"
                        checked={explanationType === 'NOT_PROVIDED'}
                        onChange={() => setExplanationType('NOT_PROVIDED')}
                      />
                      <span><strong>Option A:</strong> You have not provided a satisfactory explanation for the above.</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="explanationType"
                        checked={explanationType === 'SUBMIT_WITHIN_DAYS'}
                        onChange={() => setExplanationType('SUBMIT_WITHIN_DAYS')}
                      />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <strong>Option B:</strong> You are requested to submit your written explanation to HR within
                        <input
                          type="text"
                          value={explanationDays}
                          onChange={(e) => setExplanationDays(e.target.value)}
                          style={{ width: 40, padding: '2px 4px', fontSize: '0.8rem' }}
                        />
                        days of receiving this letter.
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                    <input
                      type="checkbox"
                      checked={includeLossOfPay}
                      onChange={(e) => setIncludeLossOfPay(e.target.checked)}
                    />
                    <span><strong>Loss of Pay Notice (Clause 3):</strong> Unauthorised absence will be treated as loss of pay for the days concerned, as per Company policy.</span>
                  </label>
                </div>
              </div>

              {/* Signatory Authority */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  6. Signatory Authority &amp; Acknowledgement
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Authorised Signatory</label>
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
                      value={signatoryDesignation}
                      onChange={(e) => setSignatoryDesignation(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Place</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryPlace}
                      onChange={(e) => setSignatoryPlace(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Acknowledgement City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ackCity}
                      onChange={(e) => setAckCity(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    backgroundColor: '#e11d48',
                    borderColor: '#e11d48',
                    boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
                  }}
                >
                  Preview Warning Letter
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL PREVIEW & PRINT */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Toolbar */}
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(1)}
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
                      backgroundColor: highlightPlaceholders ? '#fef08a' : '#f1f5f9',
                    }}
                  >
                    <Highlighter size={13} />
                    <input
                      type="checkbox"
                      checked={highlightPlaceholders}
                      onChange={(e) => setHighlightPlaceholders(e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    Highlight Placeholders
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    variant="secondary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                  >
                    Download / Print PDF
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{
                      padding: '6px 16px',
                      fontSize: '0.8125rem',
                      backgroundColor: '#e11d48',
                      borderColor: '#e11d48',
                    }}
                  >
                    {isSaving ? 'Issuing...' : 'Issue & Save Document'}
                  </Button>
                </div>
              </div>

              {/* Printable Official Tasknera Letter Preview Sheet (A4) */}
              <div
                id="printable-attendance-warning-sheet"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  padding: '36px 48px 24px 48px',
                  maxWidth: '820px',
                  margin: '0 auto',
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  color: '#1e293b',
                  fontSize: '9.5pt',
                  lineHeight: 1.48,
                  border: '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                  width: '100%',
                  minHeight: '1040px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Official Header */}
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 4 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ width: 42, height: 42, objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        letterSpacing: '0.35em',
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        marginBottom: 3,
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      T A S K N E R A
                    </div>
                    <div
                      style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.12em',
                        color: '#64748b',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                    </div>
                  </div>

                  {/* Ref & Date Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '9.5pt',
                      fontWeight: 600,
                      marginBottom: 14,
                      color: '#0f172a',
                    }}
                  >
                    <div>
                      <strong>Ref. No.:</strong> {renderHighlighted(referenceNumber)}
                    </div>
                    <div>
                      <strong>Date:</strong> {renderHighlighted(letterDate)}
                    </div>
                  </div>

                  {/* To Block */}
                  <div style={{ fontSize: '9.5pt', lineHeight: 1.35, marginBottom: 14, color: '#0f172a' }}>
                    <div style={{ fontWeight: 700 }}>To,</div>
                    <div style={{ fontWeight: 700 }}>{renderHighlighted(employeeFullName)}</div>
                    <div>
                      Employee ID: {renderHighlighted(employeeId)} | {renderHighlighted(designation)}, {renderHighlighted(department)}
                    </div>
                    <div style={{ color: '#475569' }}>
                      {renderHighlighted(residentialAddress)}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                    Subject: Warning &ndash; Irregular Attendance
                  </div>

                  {/* Salutation */}
                  <div style={{ fontSize: '9.5pt', marginBottom: 8, color: '#0f172a' }}>
                    {salutationPrefix ? `${salutationPrefix} ` : 'Dear '}
                    {renderHighlighted(employeeSalutation || employeeFullName)},
                  </div>

                  {/* Opening Statement */}
                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: '0 0 10px 0', textAlign: 'justify', fontSize: '9.5pt', padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    Our attendance records show that, during the period {renderHighlighted(periodStartDate)} to {renderHighlighted(periodEndDate)}, you were {renderHighlighted(computedSummaryPhrases)}, as follows:
                  </p>

                  {/* Incident Table */}
                  <div style={{ marginBottom: 12 }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1.5px solid #0f172a',
                        fontSize: '8.5pt',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                          <th style={{ width: '25%', padding: '6px 10px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                            Date
                          </th>
                          <th style={{ width: '38%', padding: '6px 10px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                            Nature (absent / late / early exit)
                          </th>
                          <th style={{ width: '37%', padding: '6px 10px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                            Details (time in / leave status)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r, i) => (
                          <tr key={r.id} style={{ backgroundColor: i % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                              {renderHighlighted(r.date)}
                            </td>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                              {renderHighlighted(r.nature)}
                            </td>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                              {renderHighlighted(r.details)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Numbered Clauses */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: '9pt', color: '#1e293b', textAlign: 'justify' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>1.</span>
                      <div contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this clause directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}>
                        <strong>Policy.</strong> Under Clause {renderHighlighted(appointmentClause)} of your appointment letter and the Company&rsquo;s Attendance and Leave Policy, you are required to {renderHighlighted(policyRequirement)}.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>2.</span>
                      <div contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this clause directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}>
                        <strong>Explanation.</strong>{' '}
                        {explanationType === 'NOT_PROVIDED' ? (
                          renderHighlighted('You have not provided a satisfactory explanation for the above.')
                        ) : (
                          <>
                            You are requested to submit your written explanation to HR within {renderHighlighted(explanationDays)} days of receiving this letter.
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>3.</span>
                      <div contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this clause directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}>
                        <strong>Warning.</strong> You are hereby warned to maintain regular and punctual attendance.{' '}
                        {includeLossOfPay && (
                          <span>
                            Unauthorised absence will be treated as loss of pay for the days concerned, as per Company policy.
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>4.</span>
                      <div contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this clause directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}>
                        <strong>Consequences.</strong> Continued irregular attendance or unauthorised absence may lead to further disciplinary action, which may extend to termination of employment, in accordance with Company policy and applicable law.
                      </div>
                    </div>
                  </div>

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: '10px 0 14px 0', fontSize: '9pt', textAlign: 'justify', padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    Please sign and return a copy of this letter as acknowledgement of receipt. If any of the above records is incorrect, please inform HR in writing within {renderHighlighted(contestDays)} days.
                  </p>

                  {/* Signatory & Employee Acknowledgement */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                    {/* Left: Authorised Signatory */}
                    <div style={{ flex: 1, maxWidth: 240 }}>
                      <div style={{ fontSize: '9pt', color: '#0f172a', marginBottom: 2 }}>
                        Yours sincerely,
                      </div>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                        For and on behalf of TASKNERA
                      </div>
                      <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                        <img
                          src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                          alt="Sheetal Bedi Signature"
                          style={{ maxHeight: 34, objectFit: 'contain' }}
                        />
                      </div>
                      <div
                        style={{
                          borderBottom: '1px solid #94a3b8',
                          width: '100%',
                          paddingBottom: 2,
                          marginBottom: 4,
                          fontSize: '7.5pt',
                          color: '#94a3b8',
                        }}
                      >
                        Signature of Authorised Signatory
                      </div>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a' }}>
                        Name: {renderHighlighted(signatoryName)}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#0f172a' }}>
                        Designation: {renderHighlighted(signatoryDesignation)}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#0f172a' }}>
                        Date: {renderHighlighted(signatoryDate)}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#0f172a' }}>
                        Place: {renderHighlighted(signatoryPlace)}
                      </div>
                    </div>

                    {/* Right: Acknowledgement of Receipt */}
                    <div style={{ flex: 1, maxWidth: 250 }}>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        ACKNOWLEDGEMENT OF RECEIPT
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#334155', marginBottom: 28, lineHeight: 1.35 }}>
                        I, {renderHighlighted(employeeFullName)}, acknowledge receipt of this letter.
                      </div>
                      <div
                        style={{
                          borderBottom: '1px solid #94a3b8',
                          width: '100%',
                          paddingBottom: 2,
                          marginBottom: 4,
                          fontSize: '7.5pt',
                          color: '#94a3b8',
                        }}
                      >
                        Signature of Employee
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#0f172a' }}>
                        Date: {renderHighlighted(ackDate)}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#0f172a' }}>
                        Place: {renderHighlighted(ackCity)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 8,
                    marginTop: 12,
                    textAlign: 'center',
                    fontSize: '7.5pt',
                    color: '#64748b',
                    lineHeight: 1.35,
                  }}
                >
                  <div>
                    TASKNERA | D-57, Dilshad Colony, Delhi &ndash; 110095, India | careers@tasknera.com
                  </div>
                  <div style={{ fontSize: '7pt', color: '#94a3b8', marginTop: 2 }}>
                    Confidential | Page 1 of 1
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
