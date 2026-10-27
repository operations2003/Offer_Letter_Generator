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
  Calendar,
  CalendarCheck,
  Edit3,
  Clock,
  CheckCircle2,
  User,
  Briefcase,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface LeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
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
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>('');

  const formatDateString = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Header Details
  const [refNumber, setRefNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/LVA/${year}/${rand}`;
  });
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Aarav Sharma');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1088');
  const [designation, setDesignation] = useState<string>('Associate Talent Consultant');
  const [department, setDepartment] = useState<string>('Workforce & Recruitment Solutions');

  // Leave Specifics
  const [applicationDate, setApplicationDate] = useState<string>('20 October 2026');
  const [leaveType, setLeaveType] = useState<string>('Earned');
  const [startDate, setStartDate] = useState<string>('02 November 2026');
  const [endDate, setEndDate] = useState<string>('06 November 2026');
  const [totalDays, setTotalDays] = useState<string>('5');
  const [resumptionDate, setResumptionDate] = useState<string>('09 November 2026');
  const [leaveBalanceAfter, setLeaveBalanceAfter] = useState<string>('12');
  const [approvedBy, setApprovedBy] = useState<string>('Rohit Verma, Operations Lead');
  const [coveragePerson, setCoveragePerson] = useState<string>('Neha Kapoor, Senior Talent Associate');
  const [isPaidLeave, setIsPaidLeave] = useState<boolean>(true);
  const [salaryMonth, setSalaryMonth] = useState<string>('November 2026');
  const [additionalRemarks, setAdditionalRemarks] = useState<string>(
    'Ensure all client recruitment pipeline handovers are completed prior to departure.'
  );

  // Signatory Particulars
  const [signatoryName, setSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [signPlace, setSignPlace] = useState<string>('Delhi, India');
  const [signDate, setSignDate] = useState<string>(() => formatDateString(new Date()));

  // Preview & Highlighting
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingEmployees(true);
    EmployeeService.listEmployees()
      .then((data) => {
        setEmployees(data);
        if (initialEmployee) {
          applyEmployee(initialEmployee);
        }
      })
      .catch((err) => console.warn('Failed to fetch employee list:', err))
      .finally(() => setLoadingEmployees(false));
  }, [isOpen, initialEmployee]);

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(
      emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Aarav Sharma'
    );
    setEmployeeId(emp.employeeId || emp.id.slice(0, 8).toUpperCase());
    setDesignation(emp.designation || 'Staff Member');
    setDepartment(emp.department || 'Operations');
  };

  const handleSelectEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      applyEmployee(emp);
    } else {
      setSelectedEmployeeId(null);
    }
  };

  const renderHighlighted = (val: string) => {
    if (!highlightVariables) return val;
    return (
      <span
        style={{
          backgroundColor: '#fef08a',
          color: '#854d0e',
          padding: '1px 4px',
          borderRadius: 3,
          fontWeight: 600,
        }}
      >
        {val}
      </span>
    );
  };

  const handleDownloadPdf = () => {
    const el = document.getElementById('printable-leave-approval-sheet');
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
          <title>Approval_of_Leave_${employeeFullName.replace(/\\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm 14mm 16mm;
            }
            body {
              font-family: "Times New Roman", Times, Georgia, serif;
              color: #0f172a;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #94a3b8;
              padding: 5px 8px;
            }
          </style>
        </head>
        <body>
          ${el.innerHTML}
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

  const handleSaveToRecords = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'LEAVE_APPROVAL',
          title: `Approval of Leave (${leaveType}) — ${employeeFullName}`,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          signatoryName,
          signatoryTitle,
          effectiveDate: letterDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber: refNumber,
            employeeFullName,
            employeeId,
            designation,
            department,
            leaveType,
            startDate,
            endDate,
            totalDays,
            resumptionDate,
            leaveBalanceAfter,
            approvedBy,
          });
        }
      } catch (backendErr) {
        console.warn('Backend sync not fully available; writing to local storage cache.', backendErr);
      }

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-lva-${Date.now()}`,
          documentTypeCode: 'LEAVE_APPROVAL',
          title: `Approval of Leave (${leaveType}) — ${employeeFullName}`,
          referenceNumber: refNumber,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          status: 'ISSUED',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          effectiveDate: letterDate,
          signatoryName,
          signatoryTitle,
        };
        docs.unshift(localDoc);
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      success(`Approval of Leave letter saved successfully for ${employeeFullName}!`);
      if (onSuccess) onSuccess(createdDoc || undefined);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save Leave Approval letter.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: step === 1 ? 920 : 1080,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
                border: '1px solid #a7f3d0',
              }}
            >
              <CalendarCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Approval of Leave Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  TN/HR/LVA &bull; 1-Page Official Letter
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: isPaidLeave ? '#eff6ff' : '#fff7ed',
                    color: isPaidLeave ? '#1d4ed8' : '#ea580c',
                    border: isPaidLeave ? '1px solid #bfdbfe' : '1px solid #fed7aa',
                  }}
                >
                  {leaveType} ({isPaidLeave ? 'Paid' : 'Unpaid'})
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                {step === 1
                  ? 'Configure leave schedule, coverage handovers, balance deductions & CEO authorization'
                  : 'High-fidelity A4 printable preview matching official Tasknera Leave Approval standard'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setHighlightVariables(!highlightVariables)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: highlightVariables ? '#fef08a' : '#f1f5f9',
                    color: highlightVariables ? '#854d0e' : '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <Highlighter size={14} />
                  <span>Highlight Fields</span>
                </button>

                <Button
                  variant="secondary"
                  icon={<Edit3 size={14} />}
                  onClick={() => setStep(1)}
                  style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                >
                  Edit Data
                </Button>

                <Button
                  variant="secondary"
                  icon={<Download size={14} />}
                  onClick={handleDownloadPdf}
                  style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                >
                  Print / Save PDF
                </Button>

                <Button
                  variant="primary"
                  icon={<Save size={14} />}
                  onClick={handleSaveToRecords}
                  disabled={isSaving}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '6px 12px',
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save to Records'}
                </Button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: step === 1 ? '24px' : '20px',
            backgroundColor: step === 1 ? '#ffffff' : '#f1f5f9',
          }}
        >
          {step === 1 ? (
            /* STEP 1: FORM CONTROLS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill from Employee Directory
                    </span>
                  </div>
                  {loadingEmployees && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Loading employees...</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Select Employee
                    </label>
                    <select
                      value={selectedEmployeeId || ''}
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">-- Choose employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} ({emp.employeeId || emp.id.slice(0, 4)}) - {emp.designation || 'Staff'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Search Directory
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={15}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                      />
                      <input
                        type="text"
                        placeholder="Search employee..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 32px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference & Employee Fields */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Letter Particulars &amp; Addressee
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Document Date
                    </label>
                    <input
                      type="text"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee Full Name
                    </label>
                    <input
                      type="text"
                      value={employeeFullName}
                      onChange={(e) => setEmployeeFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Leave Breakdown Table Controls */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Leave Schedule &amp; Approval Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Application Date
                    </label>
                    <input
                      type="text"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
                      placeholder="e.g. 20 October 2026"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Type of Leave
                    </label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Earned">Earned / Privilege Leave</option>
                      <option value="Sick">Sick / Medical Leave</option>
                      <option value="Maternity">Maternity Leave</option>
                      <option value="Paternity">Paternity Leave</option>
                      <option value="Unpaid">Unpaid / Loss of Pay (LOP)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Leave Period From
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="e.g. 02 November 2026"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Leave Period To
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="e.g. 06 November 2026"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Total Days
                    </label>
                    <input
                      type="text"
                      value={totalDays}
                      onChange={(e) => setTotalDays(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Date of Resumption
                    </label>
                    <input
                      type="text"
                      value={resumptionDate}
                      onChange={(e) => setResumptionDate(e.target.value)}
                      placeholder="e.g. 09 November 2026"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Leave Balance After Approval
                    </label>
                    <input
                      type="text"
                      value={leaveBalanceAfter}
                      onChange={(e) => setLeaveBalanceAfter(e.target.value)}
                      placeholder="e.g. 12"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Approved By
                    </label>
                    <input
                      type="text"
                      value={approvedBy}
                      onChange={(e) => setApprovedBy(e.target.value)}
                      placeholder="Manager Name, Designation"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Responsibilities Handled By (Backup Contact)
                    </label>
                    <input
                      type="text"
                      value={coveragePerson}
                      onChange={(e) => setCoveragePerson(e.target.value)}
                      placeholder="Name, Designation"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Compensation / Salary Treatment
                    </label>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paidTreatment"
                          checked={isPaidLeave}
                          onChange={() => setIsPaidLeave(true)}
                          style={{ accentColor: '#059669' }}
                        />
                        <span>Paid Leave</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paidTreatment"
                          checked={!isPaidLeave}
                          onChange={() => setIsPaidLeave(false)}
                          style={{ accentColor: '#ea580c' }}
                        />
                        <span>Unpaid (Deducted for Month)</span>
                      </label>
                      {!isPaidLeave && (
                        <input
                          type="text"
                          value={salaryMonth}
                          onChange={(e) => setSalaryMonth(e.target.value)}
                          placeholder="e.g. November 2026"
                          style={{
                            flex: 1,
                            padding: '4px 8px',
                            borderRadius: 6,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.8125rem',
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Additional Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={additionalRemarks}
                    onChange={(e) => setAdditionalRemarks(e.target.value)}
                    placeholder="e.g. Client handovers completed; reachable on mobile for emergencies."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Proceed */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Generate Leave Approval Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: HIGH-FIDELITY PRINT PREVIEW */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <div
                id="printable-leave-approval-sheet"
                style={{
                  backgroundColor: '#ffffff',
                  width: '100%',
                  maxWidth: '794px',
                  minHeight: '1122px',
                  boxSizing: 'border-box',
                  padding: '44px 50px 36px 50px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  position: 'relative',
                  fontSize: '10.5pt',
                  lineHeight: 1.5,
                  color: '#0f172a',
                }}
              >
                <div>
                  {/* Brand Header */}
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <img
                      src="/logo.png"
                      alt="Tasknera Logo"
                      style={{ height: 44, objectFit: 'contain', marginBottom: 4 }}
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <h1
                      style={{
                        fontSize: '20pt',
                        letterSpacing: '0.35em',
                        fontWeight: 700,
                        color: '#0f172a',
                        margin: '2px 0 0 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      T A S K N E R A
                    </h1>
                    <p
                      style={{
                        fontSize: '7.5pt',
                        letterSpacing: '0.12em',
                        color: '#64748b',
                        margin: '3px 0 0 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                    </p>
                  </div>

                  {/* Ref & Date */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontWeight: 600,
                      marginBottom: 16,
                      fontSize: '10pt',
                    }}
                  >
                    <div>
                      <span>Ref. No.: </span>
                      <span>{renderHighlighted(refNumber)}</span>
                    </div>
                    <div>
                      <span>Date: </span>
                      <span>{renderHighlighted(letterDate)}</span>
                    </div>
                  </div>

                  {/* To Address */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontWeight: 700 }}>To,</div>
                    <div style={{ fontWeight: 700 }}>{renderHighlighted(employeeFullName)}</div>
                    <div>
                      <span>Employee ID: </span>
                      <span>{renderHighlighted(employeeId)}</span>
                      <span> | </span>
                      <span>{renderHighlighted(designation)}</span>
                      <span>, </span>
                      <span>{renderHighlighted(department)}</span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: 14, fontWeight: 700 }}>
                    Subject: Approval of Leave
                  </div>

                  {/* Salutation */}
                  <div style={{ marginBottom: 12 }}>
                    Dear {renderHighlighted(employeeFullName.split(' ')[0] || employeeFullName)},
                  </div>

                  {/* Body Intro */}
                  <p style={{ margin: '0 0 14px 0', textAlign: 'justify' }}>
                    This is with reference to your leave application dated {renderHighlighted(applicationDate)}. We are pleased to inform you that your request for leave has been approved by the Company, as detailed below:
                  </p>

                  {/* Table */}
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '9.5pt',
                      marginBottom: 16,
                      border: '1px solid #94a3b8',
                    }}
                  >
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ width: '38%', fontWeight: 700, padding: '6px 10px', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                          Type of leave
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          {renderHighlighted(leaveType)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ fontWeight: 700, padding: '6px 10px', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                          Leave period
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          From {renderHighlighted(startDate)} to {renderHighlighted(endDate)} (both days inclusive)
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ fontWeight: 700, padding: '6px 10px', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                          Total days
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          {renderHighlighted(totalDays)} days
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ fontWeight: 700, padding: '6px 10px', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                          Date of resumption
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          {renderHighlighted(resumptionDate)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ fontWeight: 700, padding: '6px 10px', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                          Leave balance after approval
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          {renderHighlighted(leaveBalanceAfter)} days
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700, padding: '6px 10px', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                          Approved by
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          {renderHighlighted(approvedBy)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Body Paragraphs */}
                  <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                    During your absence, your responsibilities will be handled by {renderHighlighted(coveragePerson)}. Please ensure that all pending work is handed over before you proceed on leave and that you remain reachable, as far as practicable, for any urgent matters.
                  </p>

                  <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                    {isPaidLeave
                      ? 'This leave will be treated as paid leave.'
                      : `This leave will be treated as unpaid leave and adjusted against your salary for the month of ${renderHighlighted(salaryMonth)}.`}
                  </p>

                  <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                    Should you be unable to resume duty on the date mentioned above, you are requested to inform your reporting manager and the HR team in advance and obtain approval for any extension. Absence beyond the approved period is subject to Company policies.
                  </p>

                  {additionalRemarks && (
                    <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                      <strong>Additional remarks: </strong>
                      {renderHighlighted(additionalRemarks)}
                    </p>
                  )}

                  <p style={{ margin: '0 0 20px 0' }}>
                    We wish you a pleasant and restful leave.
                  </p>

                  {/* Sign-off */}
                  <div style={{ marginTop: 14 }}>
                    <div>Yours faithfully,</div>
                    <div style={{ fontWeight: 700, margin: '2px 0 16px 0' }}>
                      For and on behalf of TASKNERA
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', maxWidth: 440 }}>
                      <div>
                        <div
                          style={{
                            borderBottom: '1px solid #0f172a',
                            width: 220,
                            height: 48,
                            display: 'flex',
                            alignItems: 'flex-end',
                            paddingBottom: 4,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: '8.5pt', color: '#94a3b8', fontStyle: 'italic' }}>
                            Signature of Authorised Signatory
                          </span>
                        </div>
                        <div style={{ fontWeight: 700 }}>Name: {signatoryName}</div>
                        <div>Designation: {signatoryTitle}</div>
                        <div>Date: {renderHighlighted(signDate)}</div>
                        <div>Place: {signPlace}</div>
                      </div>

                      {/* Company Seal Box */}
                      <div
                        style={{
                          border: '1.5px solid #0f172a',
                          width: 120,
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: '8.5pt',
                        }}
                      >
                        Company Seal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: '7.5pt',
                    color: '#64748b',
                  }}
                >
                  <div>
                    TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com
                  </div>
                  <div>
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
