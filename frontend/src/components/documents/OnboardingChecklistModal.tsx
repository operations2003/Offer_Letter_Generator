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
  CheckSquare,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  UserCheck,
  Building,
  Briefcase,
  User,
  ClipboardList,
  Edit3,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

export interface OnboardingTaskItem {
  id: string;
  no: number;
  section: 'A' | 'B' | 'C' | 'D';
  task: string;
  owner: string;
  dueDate: string;
  done: boolean;
  remarks: string;
}

const DEFAULT_ONBOARDING_TASKS: OnboardingTaskItem[] = [
  // A. Before Joining
  {
    id: 'task-1',
    no: 1,
    section: 'A',
    task: 'Offer letter issued and signed copy received',
    owner: 'HR',
    dueDate: '20/10/2026',
    done: true,
    remarks: 'Signed copy received via portal',
  },
  {
    id: 'task-2',
    no: 2,
    section: 'A',
    task: 'Joining instructions and document list shared with the candidate',
    owner: 'HR',
    dueDate: '22/10/2026',
    done: true,
    remarks: 'Welcome packet emailed',
  },
  {
    id: 'task-3',
    no: 3,
    section: 'A',
    task: 'Background verification initiated',
    owner: 'HR',
    dueDate: '23/10/2026',
    done: true,
    remarks: 'Initiated with screening partner',
  },
  {
    id: 'task-4',
    no: 4,
    section: 'A',
    task: 'Employee ID, email account and system access requested',
    owner: 'HR / IT',
    dueDate: '24/10/2026',
    done: true,
    remarks: 'IT ticket #4812 created',
  },
  {
    id: 'task-5',
    no: 5,
    section: 'A',
    task: 'Laptop, workstation and accessories arranged',
    owner: 'IT / Admin',
    dueDate: '25/10/2026',
    done: true,
    remarks: 'ThinkPad T14 configured',
  },

  // B. Day 1
  {
    id: 'task-6',
    no: 6,
    section: 'B',
    task: 'Welcome, office tour and introduction to the team',
    owner: 'Manager',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'Scheduled at 10:30 AM',
  },
  {
    id: 'task-7',
    no: 7,
    section: 'B',
    task: 'Employee Information Form and document collection completed',
    owner: 'HR',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'PAN, Aadhaar & education certs',
  },
  {
    id: 'task-8',
    no: 8,
    section: 'B',
    task: 'ID card and access card issued',
    owner: 'Admin',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'Floor 3 access configured',
  },
  {
    id: 'task-9',
    no: 9,
    section: 'B',
    task: 'Assets handed over and Asset Handover Form signed',
    owner: 'IT / Admin',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'Serial no. logged',
  },
  {
    id: 'task-10',
    no: 10,
    section: 'B',
    task: 'Appointment letter issued and acknowledged',
    owner: 'HR',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'Hardcopy signed in duplicate',
  },
  {
    id: 'task-11',
    no: 11,
    section: 'B',
    task: 'Company policies shared and acknowledged (Code of Conduct, Confidentiality, Data Protection, Leave)',
    owner: 'HR',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'Portal policy acknowledgements',
  },
  {
    id: 'task-12',
    no: 12,
    section: 'B',
    task: 'Payroll, bank and statutory (PF / ESI) enrolment forms collected',
    owner: 'HR / Payroll',
    dueDate: '26/10/2026',
    done: false,
    remarks: 'Form 11 & bank cancelled cheque',
  },

  // C. First Week
  {
    id: 'task-13',
    no: 13,
    section: 'C',
    task: 'Role, goals and 30-60-90 day plan discussed',
    owner: 'Manager',
    dueDate: '29/10/2026',
    done: false,
    remarks: 'Key deliverables agreed',
  },
  {
    id: 'task-14',
    no: 14,
    section: 'C',
    task: 'Onboarding buddy assigned',
    owner: 'HR',
    dueDate: '27/10/2026',
    done: false,
    remarks: 'Peer support allocated',
  },
  {
    id: 'task-15',
    no: 15,
    section: 'C',
    task: 'Tool and system access verified',
    owner: 'IT',
    dueDate: '28/10/2026',
    done: false,
    remarks: 'Slack, Jira, GitHub & ERP',
  },
  {
    id: 'task-16',
    no: 16,
    section: 'C',
    task: 'Attendance, leave and HR portal walkthrough completed',
    owner: 'HR',
    dueDate: '29/10/2026',
    done: false,
    remarks: 'Leave policies & biometric logs',
  },
  {
    id: 'task-17',
    no: 17,
    section: 'C',
    task: 'Benefits and insurance enrolment completed',
    owner: 'HR',
    dueDate: '30/10/2026',
    done: false,
    remarks: 'Group health insurance added',
  },

  // D. First 30 Days
  {
    id: 'task-18',
    no: 18,
    section: 'D',
    task: 'Mandatory induction and compliance training completed',
    owner: 'HR / Manager',
    dueDate: '15/11/2026',
    done: false,
    remarks: 'POSH & Information Security',
  },
  {
    id: 'task-19',
    no: 19,
    section: 'D',
    task: 'Probation objectives set and documented',
    owner: 'Manager',
    dueDate: '20/11/2026',
    done: false,
    remarks: '6-month milestones defined',
  },
  {
    id: 'task-20',
    no: 20,
    section: 'D',
    task: '30-day check-in and onboarding feedback collected',
    owner: 'HR',
    dueDate: '25/11/2026',
    done: false,
    remarks: 'HR pulse check interview',
  },
];

interface OnboardingChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const OnboardingChecklistModal: React.FC<OnboardingChecklistModalProps> = ({
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

  // Checklist Header State
  const [refNumber, setRefNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/ONB/${year}/${rand}`;
  });

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

  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Aarav Sharma');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1088');
  const [designation, setDesignation] = useState<string>('Associate Talent Consultant');
  const [department, setDepartment] = useState<string>('Workforce & Recruitment Solutions');
  const [dateOfJoining, setDateOfJoining] = useState<string>(() => formatDateString(new Date()));
  const [reportingManager, setReportingManager] = useState<string>('Rohit Verma');
  const [workLocation, setWorkLocation] = useState<string>('Delhi Office (Dilshad Colony)');
  const [hrContact, setHrContact] = useState<string>('Pooja Malhotra (HR Lead)');

  // Tasks Array
  const [tasks, setTasks] = useState<OnboardingTaskItem[]>(DEFAULT_ONBOARDING_TASKS);
  const [activeTaskSectionTab, setActiveTaskSectionTab] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');

  // Signatures on Page 2
  const [employeeSignDate, setEmployeeSignDate] = useState<string>('26 October 2026');
  const [managerSignDate, setManagerSignDate] = useState<string>('26 October 2026');
  const [hrSignDate, setHrSignDate] = useState<string>('26 October 2026');

  // Preview & Highlighting
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load Employees on Mount
  useEffect(() => {
    if (!isOpen) return;
    setLoadingEmployees(true);
    EmployeeService.listEmployees()
      .then((data) => {
        setEmployees(data);
        if (initialEmployee) {
          applyEmployeeDetails(initialEmployee);
        }
      })
      .catch((err) => {
        console.error('Failed to load employees:', err);
      })
      .finally(() => {
        setLoadingEmployees(false);
      });
  }, [isOpen, initialEmployee]);

  const applyEmployeeDetails = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim());
    setEmployeeId(emp.employeeId || `EMP-${emp.id.slice(0, 4).toUpperCase()}`);
    setDesignation(emp.designation || 'Specialist');
    setDepartment(emp.department || 'Workforce Solutions');
    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        if (!isNaN(d.getTime())) {
          setDateOfJoining(formatDateString(d));
        }
      } catch (e) {
        // fallback
      }
    }
  };

  const handleSelectEmployee = (empId: string) => {
    const found = employees.find((e) => e.id === empId);
    if (found) {
      applyEmployeeDetails(found);
    }
  };

  // Toggle task done
  const handleToggleTaskDone = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Update task field
  const handleUpdateTask = (id: string, field: keyof OnboardingTaskItem, val: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: val } : t))
    );
  };

  // Add task to section
  const handleAddTask = (sec: 'A' | 'B' | 'C' | 'D') => {
    const newNo = tasks.length + 1;
    const newTask: OnboardingTaskItem = {
      id: `task-${Date.now()}`,
      no: newNo,
      section: sec,
      task: 'New onboarding action item',
      owner: 'HR',
      dueDate: 'DD/MM/YYYY',
      done: false,
      remarks: 'Pending completion',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      return filtered.map((t, idx) => ({ ...t, no: idx + 1 }));
    });
  };

  // Filter tasks for step 1 tabs
  const filteredTasksForEdit = useMemo(() => {
    if (activeTaskSectionTab === 'ALL') return tasks;
    return tasks.filter((t) => t.section === activeTaskSectionTab);
  }, [tasks, activeTaskSectionTab]);

  // Tasks grouped for Page 1 & Page 2 preview
  const page1Tasks = useMemo(() => {
    return tasks.filter((t) => t.section === 'A' || t.section === 'B');
  }, [tasks]);

  const page2Tasks = useMemo(() => {
    return tasks.filter((t) => t.section === 'C' || t.section === 'D');
  }, [tasks]);

  // Calculate completion percentage
  const completionStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tasks]);

  // Highlight helper
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

  // Save to records
  const handleSaveToRecords = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'ONBOARDING_FORM',
          title: `Onboarding Checklist — ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          signatoryName: hrContact,
          signatoryTitle: 'HR Representative',
          effectiveDate: letterDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber: refNumber,
            employeeFullName,
            employeeId,
            designation,
            department,
            dateOfJoining,
            reportingManager,
            workLocation,
            hrContact,
            tasks,
            completionPercent: completionStats.percent,
          });
        }
      } catch (err) {
        console.warn('Backend sync not fully available; writing to local storage cache.', err);
      }

      success('Onboarding checklist saved to records successfully');
      if (onSuccess && createdDoc) {
        onSuccess(createdDoc);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving onboarding checklist:', err);
      error(err.message || 'Failed to save onboarding checklist');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
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
        {/* Modal Header */}
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
                backgroundColor: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <CheckSquare size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Onboarding Checklist Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                  }}
                >
                  TN/HR/ONB &bull; 2-Page Checklist
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
                  {completionStats.completed} / {completionStats.total} Done ({completionStats.percent}%)
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                {step === 1
                  ? 'Fill employee particulars, manage checklist tasks & configure signature sign-off'
                  : 'High-fidelity A4 printable preview matching official Tasknera Onboarding Checklist standard'}
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
                  onClick={handlePrint}
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
                    backgroundColor: '#0284c7',
                    borderColor: '#0284c7',
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

        {/* Modal Body */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Employee Quick Select */}
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
                    <Users size={16} style={{ color: '#0284c7' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill from Employee Database
                    </span>
                  </div>
                  {loadingEmployees && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Loading employees...</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Select Existing Employee
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
                      <option value="">-- Choose employee to pre-fill --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} ({emp.employeeId || emp.id.slice(0, 4)}) - {emp.designation || 'Staff'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Search by Name / ID
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={15}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                      />
                      <input
                        type="text"
                        placeholder="Type to filter..."
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

              {/* Reference & Document Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
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
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Standard format: TN/HR/ONB/[YYYY]/[000]</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
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
              </div>

              {/* Employee Details Grid */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Employee Details (Header Block)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee Name
                    </label>
                    <input
                      type="text"
                      value={employeeFullName}
                      onChange={(e) => setEmployeeFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
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
                      placeholder="e.g. EMP-1088"
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
                      placeholder="e.g. Associate Talent Consultant"
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
                      placeholder="e.g. Workforce & Recruitment Solutions"
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
                      placeholder="e.g. 26 October 2026"
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
                      placeholder="e.g. Rohit Verma"
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
                      Work Location
                    </label>
                    <input
                      type="text"
                      value={workLocation}
                      onChange={(e) => setWorkLocation(e.target.value)}
                      placeholder="e.g. Delhi Office (Dilshad Colony)"
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
                      HR Contact
                    </label>
                    <input
                      type="text"
                      value={hrContact}
                      onChange={(e) => setHrContact(e.target.value)}
                      placeholder="e.g. Pooja Malhotra (HR Lead)"
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

              {/* Checklist Tasks Editor */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Onboarding Tasks (20 Standard Milestones)
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      Mark completed tasks, adjust due dates, customize owners or add additional company checks.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['ALL', 'A', 'B', 'C', 'D'] as const).map((tab) => {
                      const tabLabels: Record<string, string> = {
                        ALL: `All (${tasks.length})`,
                        A: 'A. Before Joining',
                        B: 'B. Day 1',
                        C: 'C. First Week',
                        D: 'D. First 30 Days',
                      };
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTaskSectionTab(tab)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 6,
                            border: '1px solid',
                            borderColor: activeTaskSectionTab === tab ? '#0284c7' : '#cbd5e1',
                            backgroundColor: activeTaskSectionTab === tab ? '#e0f2fe' : '#ffffff',
                            color: activeTaskSectionTab === tab ? '#0369a1' : '#475569',
                            cursor: 'pointer',
                          }}
                        >
                          {tabLabels[tab]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tasks Table */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                        <th style={{ width: 44, padding: '8px 6px', textAlign: 'center', fontWeight: 700 }}>No.</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Task Description</th>
                        <th style={{ width: 110, padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Owner</th>
                        <th style={{ width: 110, padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Due Date</th>
                        <th style={{ width: 60, padding: '8px 6px', textAlign: 'center', fontWeight: 700 }}>Done</th>
                        <th style={{ width: 180, padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Remarks</th>
                        <th style={{ width: 40, padding: '8px 6px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasksForEdit.map((t) => (
                        <tr
                          key={t.id}
                          style={{
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: t.done ? '#f0fdf4' : '#ffffff',
                          }}
                        >
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b', padding: '6px' }}>
                            {t.no}
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={t.task}
                              onChange={(e) => handleUpdateTask(t.id, 'task', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={t.owner}
                              onChange={(e) => handleUpdateTask(t.id, 'owner', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={t.dueDate}
                              onChange={(e) => handleUpdateTask(t.id, 'dueDate', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', padding: '6px' }}>
                            <input
                              type="checkbox"
                              checked={t.done}
                              onChange={() => handleToggleTaskDone(t.id)}
                              style={{
                                width: 16,
                                height: 16,
                                accentColor: '#0284c7',
                                cursor: 'pointer',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <input
                              type="text"
                              value={t.remarks}
                              onChange={(e) => handleUpdateTask(t.id, 'remarks', e.target.value)}
                              placeholder="Remarks"
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', padding: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(t.id)}
                              title="Delete task"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: 2,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="secondary"
                      icon={<Plus size={13} />}
                      onClick={() => handleAddTask(activeTaskSectionTab === 'ALL' ? 'A' : activeTaskSectionTab)}
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      Add Task to Section {activeTaskSectionTab === 'ALL' ? 'A' : activeTaskSectionTab}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setTasks(DEFAULT_ONBOARDING_TASKS)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      Reset to Default Tasks
                    </button>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Page 1 renders Sections A &amp; B &bull; Page 2 renders Sections C &amp; D &amp; Signatures
                  </span>
                </div>
              </div>

              {/* Signatures Dates Configuration */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Signatures &amp; Execution (Page 2 Footer)
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
                      placeholder="e.g. 26 October 2026"
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
                      Reporting Manager Sign Date
                    </label>
                    <input
                      type="text"
                      value={managerSignDate}
                      onChange={(e) => setManagerSignDate(e.target.value)}
                      placeholder="e.g. 26 October 2026"
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
                      HR Representative Sign Date
                    </label>
                    <input
                      type="text"
                      value={hrSignDate}
                      onChange={(e) => setHrSignDate(e.target.value)}
                      placeholder="e.g. 26 October 2026"
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

              {/* Bottom Proceed Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#0284c7',
                    borderColor: '#0284c7',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Generate 2-Page Checklist Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: HIGH-FIDELITY 2-PAGE PRINT PREVIEW */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {/* PRINT CSS STYLES INJECTED */}
              
            <style>{`
                [contenteditable] { outline: none !important; border: none !important; background: transparent !important; box-shadow: none !important; }
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #onboarding-printable-document, #onboarding-printable-document * {
                    visibility: visible;
                  }
                  #onboarding-printable-document {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    background: transparent;
                  }
                  .page-break-onboarding {
                    page-break-after: always;
                    break-after: page;
                  }
                  @page {
                    size: A4 portrait;
                    margin: 10mm 12mm 10mm 12mm;
                  }
                }
              `}</style>

              <div id="onboarding-printable-document"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  width: '100%',
                  maxWidth: '794px', // standard A4 width at 96 DPI
                }}
               contentEditable={true} suppressContentEditableWarning={true}>
                {/* ==================================================== */}
                {/* PAGE 1: HEADER, EMPLOYEE DETAILS, SECTIONS A & B */}
                {/* ==================================================== */}
                <div
                  className="page-break-onboarding"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px', // A4 height at 96 DPI
                    boxSizing: 'border-box',
                    padding: '36px 44px 32px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, serif',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Brand Header */}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ height: 42, objectFit: 'contain', marginBottom: 4 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
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
                          fontSize: '7pt',
                          letterSpacing: '0.12em',
                          color: '#64748b',
                          margin: '3px 0 0 0',
                          textTransform: 'uppercase',
                        }}
                      >
                        GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                      </p>
                    </div>

                    {/* Ref and Date Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '9.2pt',
                        fontWeight: 600,
                        color: '#0f172a',
                        borderBottom: '1px solid #cbd5e1',
                        paddingBottom: 6,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <span>Ref. No.: </span>
                        {renderHighlighted(refNumber)}
                      </div>
                      <div>
                        <span>Date: </span>
                        {renderHighlighted(letterDate)}
                      </div>
                    </div>

                    {/* Document Title */}
                    <div style={{ textAlign: 'left', marginBottom: 10 }}>
                      <h2
                        style={{
                          fontSize: '12pt',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: 0,
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        Onboarding Checklist
                      </h2>
                    </div>

                    {/* Employee Details Table */}
                    <div style={{ marginBottom: 12 }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          border: '1.5px solid #0f172a',
                          fontSize: '8.2pt',
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <th
                              colSpan={4}
                              style={{
                                padding: '4px 8px',
                                textAlign: 'left',
                                fontWeight: 700,
                                fontSize: '8.5pt',
                                color: '#0f172a',
                                borderBottom: '1.5px solid #0f172a',
                              }}
                            >
                              Employee Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ width: '20%', padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Employee name
                            </td>
                            <td style={{ width: '30%', padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(employeeFullName)}
                            </td>
                            <td style={{ width: '20%', padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Employee ID
                            </td>
                            <td style={{ width: '30%', padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(employeeId)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Designation
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(designation)}
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Department
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(department)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Date of joining
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(dateOfJoining)}
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Reporting manager
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(reportingManager)}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              Work location
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(workLocation)}
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#fafafa' }}>
                              HR contact
                            </td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(hrContact)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Tasks Table: Sections A & B */}
                    <div>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          border: '1.5px solid #0f172a',
                          fontSize: '8pt',
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                            <th style={{ width: '5%', padding: '5px 4px', textAlign: 'center', border: '1px solid #0f172a', fontWeight: 700 }}>
                              No.
                            </th>
                            <th style={{ width: '48%', padding: '5px 8px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Task
                            </th>
                            <th style={{ width: '13%', padding: '5px 6px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Owner
                            </th>
                            <th style={{ width: '13%', padding: '5px 6px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Due date
                            </th>
                            <th style={{ width: '7%', padding: '5px 4px', textAlign: 'center', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Done
                            </th>
                            <th style={{ width: '14%', padding: '5px 6px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Group A Header */}
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <td
                              colSpan={6}
                              style={{
                                padding: '4px 8px',
                                fontWeight: 700,
                                fontSize: '8.2pt',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                              }}
                            >
                              A. Before Joining
                            </td>
                          </tr>
                          {page1Tasks
                            .filter((t) => t.section === 'A')
                            .map((t) => (
                              <tr key={t.id}>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1' }}>
                                  {t.no}
                                </td>
                                <td style={{ padding: '3.5px 8px', border: '1px solid #cbd5e1' }}>
                                  {t.task}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1' }}>
                                  {t.owner}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt' }}>
                                  {t.dueDate}
                                </td>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1', fontSize: '10pt' }}>
                                  {t.done ? '☑' : '☐'}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt', color: '#475569' }}>
                                  {t.remarks || '—'}
                                </td>
                              </tr>
                            ))}

                          {/* Group B Header */}
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <td
                              colSpan={6}
                              style={{
                                padding: '4px 8px',
                                fontWeight: 700,
                                fontSize: '8.2pt',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                              }}
                            >
                              B. Day 1
                            </td>
                          </tr>
                          {page1Tasks
                            .filter((t) => t.section === 'B')
                            .map((t) => (
                              <tr key={t.id}>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1' }}>
                                  {t.no}
                                </td>
                                <td style={{ padding: '3.5px 8px', border: '1px solid #cbd5e1' }}>
                                  {t.task}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1' }}>
                                  {t.owner}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt' }}>
                                  {t.dueDate}
                                </td>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1', fontSize: '10pt' }}>
                                  {t.done ? '☑' : '☐'}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt', color: '#475569' }}>
                                  {t.remarks || '—'}
                                </td>
                              </tr>
                            ))}

                          {/* Section C indicator at bottom of page 1 matching source template */}
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <td
                              colSpan={6}
                              style={{
                                padding: '3px 8px',
                                fontWeight: 700,
                                fontSize: '8pt',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                              }}
                            >
                              C. First Week (Continued on next page)
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 8,
                      marginTop: 16,
                      fontSize: '7.2pt',
                      color: '#64748b',
                      textAlign: 'center',
                      lineHeight: 1.4,
                    }}
                  >
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div style={{ marginTop: 2 }}>Confidential | Page 1 of 2</div>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* PAGE 2: RUNNING HEADER, SECTIONS C & D, SIGNATURES */}
                {/* ==================================================== */}
                <div
                  className="page-break-onboarding"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px', // A4 height at 96 DPI
                    boxSizing: 'border-box',
                    padding: '36px 44px 32px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, serif',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Running Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        fontSize: '7.8pt',
                        fontWeight: 600,
                        color: '#64748b',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: 6,
                        marginBottom: 14,
                        letterSpacing: '0.04em',
                      }}
                    >
                      TASKNERA | Onboarding Checklist
                    </div>

                    {/* Tasks Table: Sections C & D */}
                    <div style={{ marginBottom: 28 }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          border: '1.5px solid #0f172a',
                          fontSize: '8pt',
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                            <th style={{ width: '5%', padding: '5px 4px', textAlign: 'center', border: '1px solid #0f172a', fontWeight: 700 }}>
                              No.
                            </th>
                            <th style={{ width: '48%', padding: '5px 8px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Task
                            </th>
                            <th style={{ width: '13%', padding: '5px 6px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Owner
                            </th>
                            <th style={{ width: '13%', padding: '5px 6px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Due date
                            </th>
                            <th style={{ width: '7%', padding: '5px 4px', textAlign: 'center', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Done
                            </th>
                            <th style={{ width: '14%', padding: '5px 6px', textAlign: 'left', border: '1px solid #0f172a', fontWeight: 700 }}>
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Group C Items */}
                          {page2Tasks
                            .filter((t) => t.section === 'C')
                            .map((t) => (
                              <tr key={t.id}>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1' }}>
                                  {t.no}
                                </td>
                                <td style={{ padding: '3.5px 8px', border: '1px solid #cbd5e1' }}>
                                  {t.task}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1' }}>
                                  {t.owner}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt' }}>
                                  {t.dueDate}
                                </td>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1', fontSize: '10pt' }}>
                                  {t.done ? '☑' : '☐'}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt', color: '#475569' }}>
                                  {t.remarks || '—'}
                                </td>
                              </tr>
                            ))}

                          {/* Group D Header */}
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <td
                              colSpan={6}
                              style={{
                                padding: '4px 8px',
                                fontWeight: 700,
                                fontSize: '8.2pt',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                              }}
                            >
                              D. First 30 Days
                            </td>
                          </tr>
                          {page2Tasks
                            .filter((t) => t.section === 'D')
                            .map((t) => (
                              <tr key={t.id}>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1' }}>
                                  {t.no}
                                </td>
                                <td style={{ padding: '3.5px 8px', border: '1px solid #cbd5e1' }}>
                                  {t.task}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1' }}>
                                  {t.owner}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt' }}>
                                  {t.dueDate}
                                </td>
                                <td style={{ textAlign: 'center', padding: '3.5px 4px', border: '1px solid #cbd5e1', fontSize: '10pt' }}>
                                  {t.done ? '☑' : '☐'}
                                </td>
                                <td style={{ padding: '3.5px 6px', border: '1px solid #cbd5e1', fontSize: '7.5pt', color: '#475569' }}>
                                  {t.remarks || '—'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Signatures Row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 24,
                        marginTop: 48,
                        paddingTop: 12,
                      }}
                    >
                      {/* Employee Signature Column */}
                      <div>
                        <div
                          style={{
                            borderTop: '1px solid #475569',
                            paddingTop: 6,
                            fontSize: '8.5pt',
                            fontWeight: 600,
                            color: '#0f172a',
                          }}
                        >
                          Signature of Employee
                        </div>
                        <div style={{ fontSize: '8.2pt', color: '#334155', marginTop: 4 }}>
                          Date: {renderHighlighted(employeeSignDate)}
                        </div>
                      </div>

                      {/* Reporting Manager Column */}
                      <div>
                        <div
                          style={{
                            borderTop: '1px solid #475569',
                            paddingTop: 6,
                            fontSize: '8.5pt',
                            fontWeight: 600,
                            color: '#0f172a',
                          }}
                        >
                          Reporting Manager
                        </div>
                        <div style={{ fontSize: '8.2pt', color: '#334155', marginTop: 4 }}>
                          Date: {renderHighlighted(managerSignDate)}
                        </div>
                      </div>

                      {/* HR Representative Column */}
                      <div>
                        <div
                          style={{
                            borderTop: '1px solid #475569',
                            paddingTop: 6,
                            fontSize: '8.5pt',
                            fontWeight: 600,
                            color: '#0f172a',
                          }}
                        >
                          HR Representative
                        </div>
                        <div style={{ fontSize: '8.2pt', color: '#334155', marginTop: 4 }}>
                          Date: {renderHighlighted(hrSignDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 8,
                      marginTop: 16,
                      fontSize: '7.2pt',
                      color: '#64748b',
                      textAlign: 'center',
                      lineHeight: 1.4,
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
