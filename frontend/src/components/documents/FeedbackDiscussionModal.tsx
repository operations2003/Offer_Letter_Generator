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
  MessageSquare,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Video,
  UserCheck,
  Building,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

const SHEETAL_BEDI_SIGNATURE_DATA_URL =
  'data:image/png;base64,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';

export interface FeedbackActionItem {
  id: string;
  action: string;
  owner: string;
  dueDate: string;
}

interface FeedbackDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const FeedbackDiscussionModal: React.FC<FeedbackDiscussionModalProps> = ({
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
    return `TN/HR/FBK/${yyyy}/${rand}`;
  });

  // Employee Particulars
  const [employeeFullName, setEmployeeFullName] = useState<string>('Meera Nair');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Meera');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1062');
  const [designation, setDesignation] = useState<string>('Technical Recruiter');
  const [department, setDepartment] = useState<string>('Recruitment & Talent Solutions');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat 502, Orchid Heights, Indirapuram, Ghaziabad, UP – 201014'
  );

  // Particulars Table Fields
  const [feedbackGivenBy, setFeedbackGivenBy] = useState<string>(
    'Ms. Sheetal Bedi, Chief Executive Officer (CEO)'
  );
  const [discussionDateMode, setDiscussionDateMode] = useState<string>(() => {
    return `${formatDateString(new Date())} | in person`;
  });
  const [othersPresent, setOthersPresent] = useState<string>('None');
  const [feedbackType, setFeedbackType] = useState<string>('Performance / Conduct');
  const [periodCovered, setPeriodCovered] = useState<string>('September – October 2026');

  // Point 1: What was observed
  const [observedDescription, setObservedDescription] = useState<string>(
    'During the recruitment cycle for enterprise accounts, candidate submissions were delayed past the agreed SLA of 48 hours on 3 client requirements. Several candidate screening dossiers lacked complete educational verification documents, resulting in client escalations.'
  );

  // Point 2: Expectation
  const [expectationDescription, setExpectationDescription] = useState<string>(
    'Candidate profiles must be screened and submitted within the 48-hour SLA window with complete 3-point credential checks as mandated in the Quality Assurance and Client Delivery Policy.'
  );

  // Point 3: Employee's response
  const [employeeResponse, setEmployeeResponse] = useState<string>(
    'Employee explained that delays were partly due to external verification turnaround time and multiple overlapping enterprise job orders. Acknowledged the need to communicate blockers earlier and prioritize high-urgency mandates.'
  );

  // Point 4: Agreed Actions & Support Table
  const [actions, setActions] = useState<FeedbackActionItem[]>([
    {
      id: 'act-1',
      action: 'Implement daily pipeline triage and flag external verification delays within 4 hours',
      owner: 'Employee',
      dueDate: '31 October 2026',
    },
    {
      id: 'act-2',
      action: 'Provide access to expedited third-party background screening portal & weekly mentor check-in',
      owner: 'Manager',
      dueDate: '28 October 2026',
    },
  ]);

  // Point 5: Follow-up & Next Steps
  const [followUpDate, setFollowUpDate] = useState<string>('15 November 2026');
  const [includeFollowUpConsequence, setIncludeFollowUpConsequence] = useState<boolean>(true);
  const [followUpConsequence, setFollowUpConsequence] = useState<string>(
    'If the expectation is not met by the follow-up date, a formal Performance Improvement Plan (PIP) or further action may be initiated as per Company policy.'
  );

  // Page 2: Comments Window
  const [commentDays, setCommentDays] = useState<string>('3');

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
      console.warn('Could not load employees for Feedback Discussion:', err);
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

  const addActionRow = () => {
    setActions([
      ...actions,
      {
        id: `act-${Date.now()}`,
        action: 'Follow agreed quality checklist and daily pipeline review',
        owner: 'Employee',
        dueDate: followUpDate,
      },
    ]);
  };

  const removeActionRow = (id: string) => {
    if (actions.length <= 1) return;
    setActions(actions.filter((a) => a.id !== id));
  };

  const updateActionRow = (id: string, field: keyof FeedbackActionItem, val: string) => {
    setActions(actions.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

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
    const el = document.getElementById('printable-feedback-discussion-sheet');
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
          <title>Feedback_Discussion_Record_${employeeFullName.replace(/\\s+/g, '_')}</title>
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
            mark {
              background: transparent !important;
              color: inherit !important;
            }
            .feedback-page-container {
              box-sizing: border-box;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-after: always;
            }
            .feedback-page-container:last-child {
              page-break-after: avoid;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #1e293b;
              padding: 5px 8px;
            }
            .company-seal-box {
              border: 1.5px solid #0f172a;
              width: 125px;
              height: 72px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #64748b;
              font-size: 11px;
              font-weight: 500;
              font-family: Arial, sans-serif;
              background-color: #ffffff;
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
          documentTypeCode: 'EXPERIENCE_LETTER',
          title: `Written Record of Feedback Discussion — ${employeeFullName}`,
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
            feedbackType,
            actions,
            signatoryName,
            signatoryDesignation,
          });
        }
      } catch (err) {
        console.warn('Backend sync not fully available; writing to local storage cache.', err);
      }

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-fbk-${Date.now()}`,
          documentTypeCode: 'EXPERIENCE_LETTER',
          title: `Written Record of Feedback Discussion — ${employeeFullName}`,
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

      success('Written Record of Feedback Discussion issued & saved successfully!');
      if (onSuccess) onSuccess(createdDoc || undefined);
    } catch (err: any) {
      error(err.message || 'Failed to save feedback discussion record.');
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
          maxWidth: '1100px',
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
                backgroundColor: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
              }}
            >
              <MessageSquare size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Written Record of Feedback Discussion
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  TN/HR/FBK Format &bull; Non-Disciplinary Record
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Constructive 2-page documentation capturing observed behaviors, expected standards, employee explanation, and agreed action milestones.
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
                    <Users size={16} color="#16a34a" />
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
                          border: isSel ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                          backgroundColor: isSel ? '#f0fdf4' : '#ffffff',
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
                            backgroundColor: isSel ? '#16a34a' : '#e2e8f0',
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
                      onChange={(e) => setEmployeeFullName(e.target.value)}
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

              {/* Particulars Table Details */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  3. Feedback Discussion Particulars Table
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Feedback given by (Name &amp; Designation)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={feedbackGivenBy}
                      onChange={(e) => setFeedbackGivenBy(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Date and mode</label>
                    <input
                      type="text"
                      className="form-input"
                      value={discussionDateMode}
                      onChange={(e) => setDiscussionDateMode(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                      placeholder="e.g. 26 October 2026 | in person / video call"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Others present</label>
                    <input
                      type="text"
                      className="form-input"
                      value={othersPresent}
                      onChange={(e) => setOthersPresent(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                      placeholder="Name(s), or “None”"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Type</label>
                    <input
                      type="text"
                      className="form-input"
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                      placeholder="Performance / Conduct / Attendance / Behaviour / Skills"
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Occurrence or period covered</label>
                    <input
                      type="text"
                      className="form-input"
                      value={periodCovered}
                      onChange={(e) => setPeriodCovered(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                      placeholder="Date(s) or period, e.g. September – October 2026"
                    />
                  </div>
                </div>
              </div>

              {/* Points 1, 2, 3: Observations, Expectations & Employee Response */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  4. Discussion Content: Observations, Expectations &amp; Response
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      1. What was observed (factual observations with dates &amp; examples; avoid opinions)
                    </label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={observedDescription}
                      onChange={(e) => setObservedDescription(e.target.value)}
                      style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      2. Expectation (standard or behaviour expected with reference to role/policy/target)
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={expectationDescription}
                      onChange={(e) => setExpectationDescription(e.target.value)}
                      style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      3. Employee&rsquo;s response (summarise employee comments or explanation)
                    </label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={employeeResponse}
                      onChange={(e) => setEmployeeResponse(e.target.value)}
                      style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* Point 4: Agreed Actions & Support Table */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    5. Agreed Actions and Support Table (Point 4)
                  </h4>
                  <Button
                    variant="secondary"
                    icon={<Plus size={14} />}
                    onClick={addActionRow}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    Add Action
                  </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {actions.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 180px 150px 36px',
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
                        placeholder="Agreed action item..."
                        value={act.action}
                        onChange={(e) => updateActionRow(act.id, 'action', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Owner (Employee / Manager)"
                        value={act.owner}
                        onChange={(e) => updateActionRow(act.id, 'owner', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Due date"
                        value={act.dueDate}
                        onChange={(e) => updateActionRow(act.id, 'dueDate', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeActionRow(act.id)}
                        disabled={actions.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: actions.length <= 1 ? '#cbd5e1' : '#ef4444',
                          cursor: actions.length <= 1 ? 'not-allowed' : 'pointer',
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

              {/* Point 5: Follow-Up & Page 2 Settings */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  6. Follow-up Check-in (Point 5) &amp; Comments Window
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Next Check-in Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Written Comments Window (Days - Page 2)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={commentDays}
                      onChange={(e) => setCommentDays(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={includeFollowUpConsequence}
                      onChange={(e) => setIncludeFollowUpConsequence(e.target.checked)}
                    />
                    <span>Include clause on next steps if expectation not met (e.g. formal PIP)</span>
                  </label>
                  {includeFollowUpConsequence && (
                    <textarea
                      className="form-input"
                      rows={2}
                      value={followUpConsequence}
                      onChange={(e) => setFollowUpConsequence(e.target.value)}
                      style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                    />
                  )}
                </div>
              </div>

              {/* Signatory Authority */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  7. Signatory Authority &amp; Acknowledgement (Page 2)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Authorised Signatory / Recorded By</label>
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
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a',
                    boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                  }}
                >
                  Preview 2-Page Feedback Record
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
                      backgroundColor: '#16a34a',
                      borderColor: '#16a34a',
                    }}
                  >
                    {isSaving ? 'Issuing...' : 'Issue & Save Document'}
                  </Button>
                </div>
              </div>

              {/* Printable Official Tasknera Feedback Record Sheets (2 Pages) */}
              <div id="printable-feedback-discussion-sheet" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* =================================================================
                    PAGE 1: Official Header, Particulars Table, Points 1-5
                    ================================================================= */}
                <div
                  className="feedback-page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    borderRadius: 4,
                    padding: '36px 48px 20px 48px',
                    maxWidth: '820px',
                    margin: '0 auto',
                    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                    color: '#1e293b',
                    fontSize: '8.85pt',
                    lineHeight: 1.42,
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
                    <div style={{ textAlign: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 3 }}>
                        <img
                          src="/logo.png"
                          alt="Tasknera Logo"
                          style={{ width: 40, height: 40, objectFit: 'contain' }}
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
                          marginBottom: 2,
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
                        fontSize: '9pt',
                        fontWeight: 600,
                        marginBottom: 12,
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
                    <div style={{ fontSize: '9pt', lineHeight: 1.3, marginBottom: 12, color: '#0f172a' }}>
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
                    <div style={{ fontSize: '9.75pt', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                      Subject: Written Record of Feedback Discussion
                    </div>

                    {/* Salutation */}
                    <div style={{ fontSize: '9pt', marginBottom: 6, color: '#0f172a' }}>
                      Dear {renderHighlighted(employeeSalutation || employeeFullName)},
                    </div>

                    {/* Non-Disciplinary Clarification Opening */}
                    <p style={{ margin: '0 0 10px 0', fontSize: '8.85pt', textAlign: 'justify' }}>
                      This is a written record of the feedback discussion held with you. It is a record of the discussion and is not a disciplinary action.
                    </p>

                    {/* Particulars Table matching PDF */}
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
                            <th style={{ width: '32%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                              Particulars
                            </th>
                            <th style={{ width: '68%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ backgroundColor: '#ffffff' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Employee</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(`${employeeFullName}, ${employeeId}, ${designation}`)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Feedback given by</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(feedbackGivenBy)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#ffffff' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Date and mode</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(discussionDateMode)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Others present</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(othersPresent)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#ffffff' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Type</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(feedbackType)}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>Occurrence or period covered</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1' }}>
                              {renderHighlighted(periodCovered)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Numbered Points 1 to 3 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.65pt', color: '#1e293b', textAlign: 'justify' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>1.</span>
                        <div>
                          <strong>What was observed.</strong> {renderHighlighted(observedDescription)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>2.</span>
                        <div>
                          <strong>Expectation.</strong> {renderHighlighted(expectationDescription)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>3.</span>
                        <div>
                          <strong>Employee&rsquo;s response.</strong> {renderHighlighted(employeeResponse)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>4.</span>
                        <div>
                          <strong>Agreed actions and support.</strong> The following actions were agreed, along with any support from the Company:
                        </div>
                      </div>
                    </div>

                    {/* Agreed Action Table */}
                    <div style={{ margin: '6px 0 8px 0' }}>
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
                            <th style={{ width: '56%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                              Agreed action
                            </th>
                            <th style={{ width: '24%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                              Owner
                            </th>
                            <th style={{ width: '20%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, border: '1px solid #0f172a' }}>
                              Due date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {actions.map((act, i) => (
                            <tr key={act.id} style={{ backgroundColor: i % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                              <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                                {renderHighlighted(act.action)}
                              </td>
                              <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                                {renderHighlighted(act.owner)}
                              </td>
                              <td style={{ padding: '4px 8px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                                {renderHighlighted(act.dueDate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Point 5: Follow-up */}
                    <div style={{ fontSize: '8.65pt', color: '#1e293b', textAlign: 'justify' }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>5.</span>
                        <div>
                          <strong>Follow-up.</strong> The next check-in will be held on {renderHighlighted(followUpDate)}.{' '}
                          {includeFollowUpConsequence && (
                            <span>{renderHighlighted(followUpConsequence)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 8,
                      marginTop: 10,
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
                      Confidential | Page 1 of 2
                    </div>
                  </div>
                </div>

                {/* =================================================================
                    PAGE 2: Header, Comments Notice, Signatures, Seal & Acknowledgement
                    ================================================================= */}
                <div
                  className="feedback-page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    borderRadius: 4,
                    padding: '36px 48px 24px 48px',
                    maxWidth: '820px',
                    margin: '0 auto',
                    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                    color: '#1e293b',
                    fontSize: '9.25pt',
                    lineHeight: 1.5,
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
                    {/* Page 2 Small Brand Running Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        paddingBottom: 16,
                        marginBottom: 32,
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ width: 24, height: 24, objectFit: 'contain' }}
                      />
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: '#64748b',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                        }}
                      >
                        Written Feedback Record
                      </span>
                    </div>

                    <p style={{ margin: '0 0 28px 0', fontSize: '9.5pt', textAlign: 'justify', lineHeight: 1.6 }}>
                      Please sign below to confirm that this discussion took place. Your signature does not mean you agree with every point; you may add written comments within {renderHighlighted(commentDays)} days.
                    </p>

                    {/* Signatory, Company Seal & Employee Acknowledgement */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginTop: 40 }}>
                      {/* Left: Recorded By */}
                      <div style={{ flex: 1, maxWidth: 250 }}>
                        <div style={{ fontSize: '9pt', color: '#0f172a', marginBottom: 2 }}>
                          Recorded by,
                        </div>
                        <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                          For and on behalf of TASKNERA
                        </div>
                        <div style={{ height: 42, display: 'flex', alignItems: 'center' }}>
                          <img
                            src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                            alt="Sheetal Bedi Signature"
                            style={{ maxHeight: 38, objectFit: 'contain' }}
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
                        <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a' }}>
                          Name: {renderHighlighted(signatoryName)}
                        </div>
                        <div style={{ fontSize: '9pt', color: '#0f172a' }}>
                          Designation: {renderHighlighted(signatoryDesignation)}
                        </div>
                        <div style={{ fontSize: '9pt', color: '#0f172a' }}>
                          Date: {renderHighlighted(signatoryDate)}
                        </div>
                        <div style={{ fontSize: '9pt', color: '#0f172a' }}>
                          Place: {renderHighlighted(signatoryPlace)}
                        </div>
                      </div>

                      {/* Center: Company Seal Box */}
                      <div
                        className="company-seal-box"
                        style={{
                          border: '1.5px solid #0f172a',
                          width: 130,
                          height: 74,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          fontFamily: 'Arial, sans-serif',
                          backgroundColor: '#ffffff',
                          flexShrink: 0,
                          alignSelf: 'center',
                        }}
                      >
                        Company Seal
                      </div>

                      {/* Right: Acknowledgement of Receipt */}
                      <div style={{ flex: 1, maxWidth: 260 }}>
                        <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          ACKNOWLEDGEMENT OF RECEIPT
                        </div>
                        <div style={{ fontSize: '9pt', color: '#334155', marginBottom: 32, lineHeight: 1.35 }}>
                          I, {renderHighlighted(employeeFullName)}, acknowledge receipt of this letter and confirm the discussion took place.
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
                        <div style={{ fontSize: '9pt', color: '#0f172a' }}>
                          Date: {renderHighlighted(ackDate)}
                        </div>
                        <div style={{ fontSize: '9pt', color: '#0f172a' }}>
                          Place: {renderHighlighted(ackCity)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 8,
                      marginTop: 14,
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
                      Confidential | Page 2 of 2
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
