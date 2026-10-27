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
  ClipboardCheck,
  CheckSquare,
  Clock,
  Trash2,
  Plus,
  Edit3,
  Building,
  User,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

export interface ExitTaskItem {
  id: string;
  no: number;
  section: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  sectionTitle: string;
  clearanceItem: string;
  responsible: string;
  done: boolean;
  date: string;
  signRemarks: string;
}

const DEFAULT_EXIT_TASKS: ExitTaskItem[] = [
  // A. Human Resources
  {
    id: 'exit-1',
    no: 1,
    section: 'A',
    sectionTitle: 'Human Resources',
    clearanceItem: 'Resignation letter received and acceptance issued',
    responsible: 'HR',
    done: true,
    date: '15/09/2026',
    signRemarks: 'Formal acceptance letter TN/HR/RES issued',
  },
  {
    id: 'exit-2',
    no: 2,
    section: 'A',
    sectionTitle: 'Human Resources',
    clearanceItem: 'Notice period and Last Working Day confirmed',
    responsible: 'HR',
    done: true,
    date: '18/09/2026',
    signRemarks: '30 days served; LWD confirmed',
  },
  {
    id: 'exit-3',
    no: 3,
    section: 'A',
    sectionTitle: 'Human Resources',
    clearanceItem: 'Exit interview conducted',
    responsible: 'HR',
    done: true,
    date: '10/10/2026',
    signRemarks: 'Exit feedback documented in HR portal',
  },
  {
    id: 'exit-4',
    no: 4,
    section: 'A',
    sectionTitle: 'Human Resources',
    clearanceItem: 'Leave balance reconciled',
    responsible: 'HR',
    done: true,
    date: '12/10/2026',
    signRemarks: '6 days earned leave approved for encashment',
  },
  {
    id: 'exit-5',
    no: 5,
    section: 'A',
    sectionTitle: 'Human Resources',
    clearanceItem: 'PF / UAN exit date updated',
    responsible: 'HR / Payroll',
    done: true,
    date: '15/10/2026',
    signRemarks: 'EPFO portal marked with DOE',
  },

  // B. Reporting Manager / Department
  {
    id: 'exit-6',
    no: 6,
    section: 'B',
    sectionTitle: 'Reporting Manager / Department',
    clearanceItem: 'Knowledge-transfer and handover document prepared',
    responsible: 'Manager',
    done: true,
    date: '08/10/2026',
    signRemarks: 'KT dossier reviewed & signed off',
  },
  {
    id: 'exit-7',
    no: 7,
    section: 'B',
    sectionTitle: 'Reporting Manager / Department',
    clearanceItem: 'Pending work, files and projects handed over to Neha Kapoor',
    responsible: 'Manager',
    done: true,
    date: '12/10/2026',
    signRemarks: 'All active recruitment assignments reassigned',
  },
  {
    id: 'exit-8',
    no: 8,
    section: 'B',
    sectionTitle: 'Reporting Manager / Department',
    clearanceItem: 'Clients, vendors and stakeholders informed of the transition',
    responsible: 'Manager',
    done: true,
    date: '14/10/2026',
    signRemarks: 'Client transition emails completed',
  },

  // C. IT
  {
    id: 'exit-9',
    no: 9,
    section: 'C',
    sectionTitle: 'IT',
    clearanceItem: 'Email, system, VPN and tool access revoked',
    responsible: 'IT',
    done: true,
    date: '15/10/2026',
    signRemarks: 'Google Workspace & VPN credentials disabled',
  },
  {
    id: 'exit-10',
    no: 10,
    section: 'C',
    sectionTitle: 'IT',
    clearanceItem: 'Data backed up; devices returned and wiped (Asset Handover Form signed)',
    responsible: 'IT',
    done: true,
    date: '15/10/2026',
    signRemarks: 'ThinkPad T14 & charger returned in good order',
  },
  {
    id: 'exit-11',
    no: 11,
    section: 'C',
    sectionTitle: 'IT',
    clearanceItem: 'Software licences reclaimed; email auto-reply set',
    responsible: 'IT',
    done: true,
    date: '15/10/2026',
    signRemarks: 'Software licenses reallocated; forwarding active',
  },

  // D. Admin
  {
    id: 'exit-12',
    no: 12,
    section: 'D',
    sectionTitle: 'Admin',
    clearanceItem: 'ID card and access card returned',
    responsible: 'Admin',
    done: true,
    date: '15/10/2026',
    signRemarks: 'RFID card #1088 returned to reception',
  },
  {
    id: 'exit-13',
    no: 13,
    section: 'D',
    sectionTitle: 'Admin',
    clearanceItem: 'Desk, locker and key clearance; other Company property returned',
    responsible: 'Admin',
    done: true,
    date: '15/10/2026',
    signRemarks: 'Workstation 3-B cleared & inspected',
  },

  // E. Finance / Payroll
  {
    id: 'exit-14',
    no: 14,
    section: 'E',
    sectionTitle: 'Finance / Payroll',
    clearanceItem: 'Advances, loans and reimbursements reconciled',
    responsible: 'Finance',
    done: true,
    date: '16/10/2026',
    signRemarks: 'No outstanding personal loans or advances',
  },
  {
    id: 'exit-15',
    no: 15,
    section: 'E',
    sectionTitle: 'Finance / Payroll',
    clearanceItem: 'Full-and-final settlement computed and statement issued',
    responsible: 'Finance',
    done: true,
    date: '16/10/2026',
    signRemarks: 'FNF Statement TN/HR/FNF finalized',
  },
  {
    id: 'exit-16',
    no: 16,
    section: 'E',
    sectionTitle: 'Finance / Payroll',
    clearanceItem: 'Settlement paid; tax (TDS) details updated',
    responsible: 'Finance',
    done: true,
    date: '18/10/2026',
    signRemarks: 'Transferred via NEFT; TDS challan mapped',
  },

  // F. Final Clearance
  {
    id: 'exit-17',
    no: 17,
    section: 'F',
    sectionTitle: 'Final Clearance',
    clearanceItem: 'All departments have signed off',
    responsible: 'HR',
    done: true,
    date: '18/10/2026',
    signRemarks: 'All 6 department clearances verified',
  },
  {
    id: 'exit-18',
    no: 18,
    section: 'F',
    sectionTitle: 'Final Clearance',
    clearanceItem: 'Relieving letter issued',
    responsible: 'HR',
    done: true,
    date: '18/10/2026',
    signRemarks: 'Relieving & Experience letter released',
  },
];

interface ExitChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const ExitChecklistModal: React.FC<ExitChecklistModalProps> = ({
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
    return `TN/HR/EXC/${year}/${rand}`;
  });
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Aarav Sharma');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1088');
  const [designation, setDesignation] = useState<string>('Associate Talent Consultant');
  const [department, setDepartment] = useState<string>('Workforce & Recruitment Solutions');
  const [dateOfJoining, setDateOfJoining] = useState<string>('10 June 2024');
  const [reportingManager, setReportingManager] = useState<string>('Rohit Verma (Operations Lead)');
  const [resignationDate, setResignationDate] = useState<string>('15 September 2026');
  const [lastWorkingDay, setLastWorkingDay] = useState<string>('15 October 2026');
  const [noticePeriod, setNoticePeriod] = useState<string>('30 days');
  const [noticeServed, setNoticeServed] = useState<string>('30 days (Fully served)');

  // Tasks Array
  const [tasks, setTasks] = useState<ExitTaskItem[]>(DEFAULT_EXIT_TASKS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'>('ALL');

  // Signatures
  const [employeeSignDate, setEmployeeSignDate] = useState<string>('15 October 2026');
  const [managerSignDate, setManagerSignDate] = useState<string>('15 October 2026');
  const [hrSignDate, setHrSignDate] = useState<string>('18 October 2026');

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
      .catch((err) => console.warn('Failed to load employees:', err))
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
    if (emp.joiningDate) {
      setDateOfJoining(formatDateString(new Date(emp.joiningDate)));
    }
  };

  const handleSelectEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) applyEmployee(emp);
    else setSelectedEmployeeId(null);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleUpdateTask = (id: string, field: keyof ExitTaskItem, val: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  // Grouped tasks for Page 1 & Page 2
  const page1Tasks = useMemo(() => {
    return tasks.filter((t) => t.section === 'A' || t.section === 'B');
  }, [tasks]);

  const page2Tasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.section === 'C' ||
        t.section === 'D' ||
        t.section === 'E' ||
        t.section === 'F'
    );
  }, [tasks]);

  const completionStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tasks]);

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
    const el = document.getElementById('printable-exit-checklist-sheet');
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
          <title>Exit_Checklist_${employeeFullName.replace(/\\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 14mm 10mm 14mm;
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
            .page-container {
              box-sizing: border-box;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-after: always;
            }
            .page-container:last-child {
              page-break-after: avoid;
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
          documentTypeCode: 'EXIT_CHECKLIST',
          title: `Exit Clearance Checklist — ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          signatoryName: 'HR Representative',
          signatoryTitle: 'HR Operations',
          effectiveDate: lastWorkingDay,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber: refNumber,
            employeeFullName,
            employeeId,
            designation,
            department,
            lastWorkingDay,
            completedTasks: completionStats.completed,
          });
        }
      } catch (backendErr) {
        console.warn('Backend sync not fully available; writing to local storage cache.', backendErr);
      }

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-exc-${Date.now()}`,
          documentTypeCode: 'EXIT_CHECKLIST',
          title: `Exit Clearance Checklist — ${employeeFullName} (${employeeId})`,
          referenceNumber: refNumber,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          status: 'ISSUED',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          effectiveDate: lastWorkingDay,
          signatoryName: 'HR Representative',
          signatoryTitle: 'HR Operations',
        };
        docs.unshift(localDoc);
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      success(`Exit Clearance Checklist saved successfully for ${employeeFullName}!`);
      if (onSuccess) onSuccess(createdDoc || undefined);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save Exit Checklist record.');
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
          maxWidth: step === 1 ? 950 : 1100,
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
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                border: '1px solid #fecaca',
              }}
            >
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Exit Checklist Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fecaca',
                  }}
                >
                  TN/HR/EXC &bull; 2-Page Clearance Checklist
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: completionStats.percent === 100 ? '#ecfdf5' : '#fef9c3',
                    color: completionStats.percent === 100 ? '#15803d' : '#854d0e',
                    border: completionStats.percent === 100 ? '1px solid #bbf7d0' : '1px solid #fde047',
                  }}
                >
                  {completionStats.completed} / {completionStats.total} Cleared ({completionStats.percent}%)
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                {step === 1
                  ? 'Track 18 clearance items across HR, Manager, IT, Admin, Finance, and Final Release'
                  : 'High-fidelity A4 printable preview matching official Tasknera Exit Checklist standard'}
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
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626',
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
                    <Users size={16} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill Departing Employee
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

              {/* Employee & Separation Details */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Employee Details &amp; Separation Milestones
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
                      Checklist Date
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Date of Joining
                    </label>
                    <input
                      type="text"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
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
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      value={reportingManager}
                      onChange={(e) => setReportingManager(e.target.value)}
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
                      Resignation Date
                    </label>
                    <input
                      type="text"
                      value={resignationDate}
                      onChange={(e) => setResignationDate(e.target.value)}
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
                      Last Working Day
                    </label>
                    <input
                      type="text"
                      value={lastWorkingDay}
                      onChange={(e) => setLastWorkingDay(e.target.value)}
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
                      Notice Period
                    </label>
                    <input
                      type="text"
                      value={noticePeriod}
                      onChange={(e) => setNoticePeriod(e.target.value)}
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
                      Notice Served
                    </label>
                    <input
                      type="text"
                      value={noticeServed}
                      onChange={(e) => setNoticeServed(e.target.value)}
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

              {/* Tasks Table */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    18-Point Clearance Tasks Checklist
                  </h4>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['ALL', 'A', 'B', 'C', 'D', 'E', 'F'] as const).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setActiveTab(sec)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          borderRadius: 6,
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: activeTab === sec ? '#dc2626' : '#f1f5f9',
                          color: activeTab === sec ? '#ffffff' : '#475569',
                          border: activeTab === sec ? '1px solid #dc2626' : '1px solid #cbd5e1',
                        }}
                      >
                        {sec === 'ALL' ? 'All Sections' : `Sec ${sec}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                        <th style={{ padding: '8px 6px', width: '32px', textAlign: 'center' }}>No.</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', width: '42%' }}>Clearance item</th>
                        <th style={{ padding: '8px 10px', width: '14%' }}>Responsible</th>
                        <th style={{ padding: '8px 6px', width: '45px', textAlign: 'center' }}>Done</th>
                        <th style={{ padding: '8px 10px', width: '14%' }}>Date</th>
                        <th style={{ padding: '8px 10px' }}>Sign / remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks
                        .filter((t) => activeTab === 'ALL' || t.section === activeTab)
                        .map((t) => (
                          <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ textAlign: 'center', padding: '6px 4px', fontWeight: 600, color: '#64748b' }}>
                              {t.no}
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={t.clearanceItem}
                                onChange={(e) => handleUpdateTask(t.id, 'clearanceItem', e.target.value)}
                                style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={t.responsible}
                                onChange={(e) => handleUpdateTask(t.id, 'responsible', e.target.value)}
                                style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => handleToggleTask(t.id)}
                                style={{ width: 16, height: 16, accentColor: '#dc2626', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={t.date}
                                onChange={(e) => handleUpdateTask(t.id, 'date', e.target.value)}
                                style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={t.signRemarks}
                                onChange={(e) => handleUpdateTask(t.id, 'signRemarks', e.target.value)}
                                style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures Dates */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Execution Signatures (Page 2)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee Signature Date
                    </label>
                    <input
                      type="text"
                      value={employeeSignDate}
                      onChange={(e) => setEmployeeSignDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Reporting Manager Sign Date
                    </label>
                    <input
                      type="text"
                      value={managerSignDate}
                      onChange={(e) => setManagerSignDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      HR Representative Sign Date
                    </label>
                    <input
                      type="text"
                      value={hrSignDate}
                      onChange={(e) => setHrSignDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Proceed */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#dc2626',
                    borderColor: '#dc2626',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Generate 2-Page Exit Checklist Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: HIGH-FIDELITY PRINT PREVIEW */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <div
                id="printable-exit-checklist-sheet"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  width: '100%',
                  maxWidth: '794px',
                }}
              >
                {/* PAGE 1: HEADER, EMPLOYEE DETAILS, SECTIONS A & B */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px',
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                    fontSize: '9pt',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ height: 42, objectFit: 'contain', marginBottom: 4 }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <h1
                        style={{
                          fontSize: '19pt',
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
                        margin: '10px 0 8px 0',
                        fontSize: '9.5pt',
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

                    <div style={{ margin: '8px 0 12px 0' }}>
                      <h2 style={{ fontSize: '13pt', fontWeight: 700, margin: 0 }}>
                        Exit Checklist
                      </h2>
                    </div>

                    {/* Employee Details Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8.5pt',
                        marginBottom: 14,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={4} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 700 }}>
                            Employee Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Employee name
                          </td>
                          <td style={{ width: '28%', padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(employeeFullName)}
                          </td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Employee ID
                          </td>
                          <td style={{ width: '28%', padding: '4px 8px' }}>
                            {renderHighlighted(employeeId)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Designation
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(designation)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Department
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            {renderHighlighted(department)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Date of joining
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(dateOfJoining)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Reporting manager
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            {renderHighlighted(reportingManager)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Resignation date
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(resignationDate)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Last Working Day
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            {renderHighlighted(lastWorkingDay)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Notice period
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(noticePeriod)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Notice served
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            {renderHighlighted(noticeServed)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table for Sections A & B */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8pt',
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '5px 4px', width: '28px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>No.</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '42%', borderRight: '1px solid #94a3b8' }}>Clearance item</th>
                          <th style={{ padding: '5px 6px', textAlign: 'left', width: '13%', borderRight: '1px solid #94a3b8' }}>Responsible</th>
                          <th style={{ padding: '5px 4px', width: '38px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>Done</th>
                          <th style={{ padding: '5px 6px', textAlign: 'left', width: '14%', borderRight: '1px solid #94a3b8' }}>Date</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left' }}>Sign / remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Section A */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            A. Human Resources
                          </td>
                        </tr>
                        {page1Tasks
                          .filter((t) => t.section === 'A')
                          .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{t.no}</td>
                              <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.clearanceItem)}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{t.responsible}</td>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontSize: '11pt' }}>
                                {t.done ? '☑' : '☐'}
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.date)}</td>
                              <td style={{ padding: '4px 8px' }}>{renderHighlighted(t.signRemarks)}</td>
                            </tr>
                          ))}

                        {/* Section B */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            B. Reporting Manager / Department
                          </td>
                        </tr>
                        {page1Tasks
                          .filter((t) => t.section === 'B')
                          .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{t.no}</td>
                              <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.clearanceItem)}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{t.responsible}</td>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontSize: '11pt' }}>
                                {t.done ? '☑' : '☐'}
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.date)}</td>
                              <td style={{ padding: '4px 8px' }}>{renderHighlighted(t.signRemarks)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Page 1 Footer */}
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
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div>Confidential | Page 1 of 2</div>
                  </div>
                </div>

                {/* PAGE 2: SECTIONS C, D, E, F & SIGNATURES */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px',
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                    fontSize: '9pt',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    {/* Page 2 Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: '8.5pt',
                        color: '#64748b',
                        paddingBottom: 8,
                        borderBottom: '1px solid #cbd5e1',
                        marginBottom: 16,
                      }}
                    >
                      <span>TASKNERA | Exit Checklist</span>
                    </div>

                    {/* Table for Sections C, D, E & F */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8pt',
                        marginBottom: 36,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '5px 4px', width: '28px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>No.</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '42%', borderRight: '1px solid #94a3b8' }}>Clearance item</th>
                          <th style={{ padding: '5px 6px', textAlign: 'left', width: '13%', borderRight: '1px solid #94a3b8' }}>Responsible</th>
                          <th style={{ padding: '5px 4px', width: '38px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>Done</th>
                          <th style={{ padding: '5px 6px', textAlign: 'left', width: '14%', borderRight: '1px solid #94a3b8' }}>Date</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left' }}>Sign / remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Section C: IT */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            C. IT
                          </td>
                        </tr>
                        {page2Tasks
                          .filter((t) => t.section === 'C')
                          .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{t.no}</td>
                              <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.clearanceItem)}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{t.responsible}</td>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontSize: '11pt' }}>
                                {t.done ? '☑' : '☐'}
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.date)}</td>
                              <td style={{ padding: '4px 8px' }}>{renderHighlighted(t.signRemarks)}</td>
                            </tr>
                          ))}

                        {/* Section D: Admin */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            D. Admin
                          </td>
                        </tr>
                        {page2Tasks
                          .filter((t) => t.section === 'D')
                          .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{t.no}</td>
                              <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.clearanceItem)}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{t.responsible}</td>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontSize: '11pt' }}>
                                {t.done ? '☑' : '☐'}
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.date)}</td>
                              <td style={{ padding: '4px 8px' }}>{renderHighlighted(t.signRemarks)}</td>
                            </tr>
                          ))}

                        {/* Section E: Finance / Payroll */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            E. Finance / Payroll
                          </td>
                        </tr>
                        {page2Tasks
                          .filter((t) => t.section === 'E')
                          .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{t.no}</td>
                              <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.clearanceItem)}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{t.responsible}</td>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontSize: '11pt' }}>
                                {t.done ? '☑' : '☐'}
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.date)}</td>
                              <td style={{ padding: '4px 8px' }}>{renderHighlighted(t.signRemarks)}</td>
                            </tr>
                          ))}

                        {/* Section F: Final Clearance */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={6} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            F. Final Clearance
                          </td>
                        </tr>
                        {page2Tasks
                          .filter((t) => t.section === 'F')
                          .map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>{t.no}</td>
                              <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.clearanceItem)}</td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{t.responsible}</td>
                              <td style={{ textAlign: 'center', padding: '4px', borderRight: '1px solid #cbd5e1', fontSize: '11pt' }}>
                                {t.done ? '☑' : '☐'}
                              </td>
                              <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(t.date)}</td>
                              <td style={{ padding: '4px 8px' }}>{renderHighlighted(t.signRemarks)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>

                    {/* Tripartite Signatures */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 28,
                        marginTop: 40,
                      }}
                    >
                      <div>
                        <div style={{ borderBottom: '1.5px solid #0f172a', height: 44, marginBottom: 6 }} />
                        <div style={{ fontWeight: 700 }}>Signature of Employee</div>
                        <div>Date: {renderHighlighted(employeeSignDate)}</div>
                      </div>

                      <div>
                        <div style={{ borderBottom: '1.5px solid #0f172a', height: 44, marginBottom: 6 }} />
                        <div style={{ fontWeight: 700 }}>Reporting Manager</div>
                        <div>Date: {renderHighlighted(managerSignDate)}</div>
                      </div>

                      <div>
                        <div style={{ borderBottom: '1.5px solid #0f172a', height: 44, marginBottom: 6 }} />
                        <div style={{ fontWeight: 700 }}>HR Representative</div>
                        <div>Date: {renderHighlighted(hrSignDate)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
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
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div>Confidential | Page 2 of 2</div>
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
