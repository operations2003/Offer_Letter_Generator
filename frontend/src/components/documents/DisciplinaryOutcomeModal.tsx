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
  ShieldCheck,
  Scale,
  FileCheck,
  AlertOctagon,
  Clock,
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

type DecisionOptionType =
  | 'CLOSED'
  | 'WARNING'
  | 'SUSPENSION'
  | 'WITHHOLDING'
  | 'TERMINATION';

interface DisciplinaryOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const DisciplinaryOutcomeModal: React.FC<DisciplinaryOutcomeModalProps> = ({
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
    return `TN/HR/DISC/${yyyy}/${rand}`;
  });

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Rohan Malhotra');
  const [salutationPrefix, setSalutationPrefix] = useState<string>('Dear');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Rohan');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1089');
  const [designation, setDesignation] = useState<string>('Talent Acquisition Specialist');
  const [department, setDepartment] = useState<string>('Recruitment');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'House No. 128, Sector 15, Noida, Uttar Pradesh – 201301'
  );

  // Subject / Case Reference
  const [matterSubject, setMatterSubject] = useState<string>(
    'Unauthorised External Engagement & Non-Disclosure Breach (Case Ref: TN-DISC-2026-04)'
  );

  // Clause 1: Reference
  const [showCauseDate, setShowCauseDate] = useState<string>('5 October 2026');
  const [hasEmployeeReply, setHasEmployeeReply] = useState<boolean>(true);
  const [replyDate, setReplyDate] = useState<string>('9 October 2026');
  const [inquiryDate, setInquiryDate] = useState<string>('16 October 2026');

  // Clause 2: Findings
  const [findingsText, setFindingsText] = useState<string>(
    'Charge 1 (Unauthorised external communication with client partners without prior approval) is established based on system correspondence and stakeholder records. Charge 2 (Willful negligence in candidate profile processing) is partly established with mitigations noted regarding technical downtime.'
  );

  // Clause 3: Decision
  const [decisionType, setDecisionType] = useState<DecisionOptionType>('WARNING');
  const [suspensionDays, setSuspensionDays] = useState<string>('7');
  const [suspensionPayStatus, setSuspensionPayStatus] = useState<'without' | 'with'>('without');
  const [suspensionStart, setSuspensionStart] = useState<string>('28 October 2026');
  const [suspensionEnd, setSuspensionEnd] = useState<string>('3 November 2026');
  const [withholdingMonths, setWithholdingMonths] = useState<string>('6');
  const [withholdingBenefit, setWithholdingBenefit] = useState<string>('increment and annual appraisal review');

  // Clause 4: Effective Date
  const [effectiveDate, setEffectiveDate] = useState<string>(() => formatDateString(new Date()));

  // Clause 5: Conduct Expected
  const [conductExpected, setConductExpected] = useState<string>(
    'strictly adhere to all client protocol policies, maintain complete confidentiality of candidate data, and obtain written approval from your Department Head prior to any external correspondence'
  );

  // Clause 6: Representation
  const [appealAuthority, setAppealAuthority] = useState<string>('HR Appellate Committee');
  const [appealDays, setAppealDays] = useState<string>('5');

  // Clause 7: Record on File Duration
  const [recordFileMonths, setRecordFileMonths] = useState<string>('12');

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
      console.warn('Could not load employees for Disciplinary Outcome:', err);
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
    const el = document.getElementById('printable-disciplinary-outcome-sheet');
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
          <title>Disciplinary_Outcome_${employeeFullName.replace(/\\s+/g, '_')}</title>
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
            .page-container {
              box-sizing: border-box;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
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
          title: `Outcome of Disciplinary Proceedings — ${employeeFullName}`,
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
            matterSubject,
            decisionType,
            effectiveDate,
            conductExpected,
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
          id: createdDoc?.id || `doc-disc-${Date.now()}`,
          documentTypeCode: 'TERMINATION_LETTER',
          title: `Outcome of Disciplinary Proceedings — ${employeeFullName}`,
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

      success('Disciplinary Outcome Letter issued & saved successfully!');
      if (onSuccess) onSuccess(createdDoc || undefined);
    } catch (err: any) {
      error(err.message || 'Failed to save disciplinary outcome letter.');
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
                backgroundColor: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Outcome of Disciplinary Proceedings
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    backgroundColor: '#ede9fe',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe',
                  }}
                >
                  TN/HR/DISC Format
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official 1-page formal findings and decision notice following show-cause and inquiry proceedings.
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
                    <Users size={16} color="#7c3aed" />
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
                          border: isSel ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                          backgroundColor: isSel ? '#ede9fe' : '#ffffff',
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
                            backgroundColor: isSel ? '#7c3aed' : '#e2e8f0',
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
                  2. Reference, Case Matter &amp; Recipient
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
                        if (!employeeSalutation || employeeSalutation === prevFirst || employeeSalutation === 'Rohan') {
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
                </div>

                {/* Greeting / Salutation (Dear [Name]) */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12, marginTop: 12 }}>
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
                      placeholder="e.g. Rohan or Mr. Malhotra"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Matter / Case Reference (Subject)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={matterSubject}
                    onChange={(e) => setMatterSubject(e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                  />
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

              {/* Clause 1: Reference Dates */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  3. Clause 1: Prior Notices &amp; Inquiry Reference
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Show-Cause Notice Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={showCauseDate}
                      onChange={(e) => setShowCauseDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Reply Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 36 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        <input
                          type="radio"
                          name="replyStatus"
                          checked={hasEmployeeReply}
                          onChange={() => setHasEmployeeReply(true)}
                        />
                        <span>Reply received</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                        <input
                          type="radio"
                          name="replyStatus"
                          checked={!hasEmployeeReply}
                          onChange={() => setHasEmployeeReply(false)}
                        />
                        <span>Absence of reply</span>
                      </label>
                    </div>
                  </div>
                  {hasEmployeeReply && (
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Reply Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={replyDate}
                        onChange={(e) => setReplyDate(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Inquiry / Hearing Held Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Clause 2: Findings */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  4. Clause 2: Findings on Record
                </h4>
                <textarea
                  className="form-input"
                  rows={3}
                  value={findingsText}
                  onChange={(e) => setFindingsText(e.target.value)}
                  style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                  placeholder="State the finding on each charge: established / partly established / not established, with brief reasons..."
                />
              </div>

              {/* Clause 3: Decision */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  5. Clause 3: Company Decision (Select One)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem' }}>
                    <input
                      type="radio"
                      name="decisionType"
                      checked={decisionType === 'CLOSED'}
                      onChange={() => setDecisionType('CLOSED')}
                      style={{ marginTop: 2 }}
                    />
                    <span><strong>(a)</strong> No further action; the matter is closed.</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem' }}>
                    <input
                      type="radio"
                      name="decisionType"
                      checked={decisionType === 'WARNING'}
                      onChange={() => setDecisionType('WARNING')}
                      style={{ marginTop: 2 }}
                    />
                    <span><strong>(b)</strong> A written warning is issued (see separate letter).</span>
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="decisionType"
                        checked={decisionType === 'SUSPENSION'}
                        onChange={() => setDecisionType('SUSPENSION')}
                        style={{ marginTop: 2 }}
                      />
                      <span><strong>(c) Suspension:</strong> Suspension for designated days as permitted by appointment letter.</span>
                    </label>
                    {decisionType === 'SUSPENSION' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 24, alignItems: 'center' }}>
                        <span>Suspension for</span>
                        <input
                          type="text"
                          value={suspensionDays}
                          onChange={(e) => setSuspensionDays(e.target.value)}
                          style={{ width: 45, padding: '2px 4px', fontSize: '0.8rem' }}
                        />
                        <span>days,</span>
                        <select
                          value={suspensionPayStatus}
                          onChange={(e) => setSuspensionPayStatus(e.target.value as any)}
                          style={{ padding: '2px 6px', fontSize: '0.8rem' }}
                        >
                          <option value="without">without pay</option>
                          <option value="with">with pay</option>
                        </select>
                        <span>from</span>
                        <input
                          type="text"
                          value={suspensionStart}
                          onChange={(e) => setSuspensionStart(e.target.value)}
                          style={{ width: 120, padding: '2px 6px', fontSize: '0.8rem' }}
                        />
                        <span>to</span>
                        <input
                          type="text"
                          value={suspensionEnd}
                          onChange={(e) => setSuspensionEnd(e.target.value)}
                          style={{ width: 120, padding: '2px 6px', fontSize: '0.8rem' }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="decisionType"
                        checked={decisionType === 'WITHHOLDING'}
                        onChange={() => setDecisionType('WITHHOLDING')}
                        style={{ marginTop: 2 }}
                      />
                      <span><strong>(d) Withholding:</strong> Withholding of increment / promotion or other penalty permitted by Company policy.</span>
                    </label>
                    {decisionType === 'WITHHOLDING' && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 24, alignItems: 'center' }}>
                        <span>Withholding of</span>
                        <input
                          type="text"
                          value={withholdingBenefit}
                          onChange={(e) => setWithholdingBenefit(e.target.value)}
                          style={{ width: 220, padding: '2px 6px', fontSize: '0.8rem' }}
                        />
                        <span>for</span>
                        <input
                          type="text"
                          value={withholdingMonths}
                          onChange={(e) => setWithholdingMonths(e.target.value)}
                          style={{ width: 45, padding: '2px 4px', fontSize: '0.8rem' }}
                        />
                        <span>months.</span>
                      </div>
                    )}
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.8125rem' }}>
                    <input
                      type="radio"
                      name="decisionType"
                      checked={decisionType === 'TERMINATION'}
                      onChange={() => setDecisionType('TERMINATION')}
                      style={{ marginTop: 2 }}
                    />
                    <span><strong>(e)</strong> Termination of employment (see separate letter).</span>
                  </label>
                </div>
              </div>

              {/* Clauses 4 to 7 */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  6. Effective Date, Conduct Expected &amp; Appeals
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Effective Date (Clause 4)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Appellate Authority (Clause 6)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={appealAuthority}
                      onChange={(e) => setAppealAuthority(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Appeal Window (Days)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={appealDays}
                      onChange={(e) => setAppealDays(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Personnel File Duration (Months - Clause 7)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={recordFileMonths}
                      onChange={(e) => setRecordFileMonths(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Conduct Expected (Clause 5)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={conductExpected}
                    onChange={(e) => setConductExpected(e.target.value)}
                    style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Signatory Authority */}
              <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  7. Signatory Authority &amp; Acknowledgement
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
                    backgroundColor: '#7c3aed',
                    borderColor: '#7c3aed',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                  }}
                >
                  Preview Disciplinary Outcome Letter
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
                      backgroundColor: '#7c3aed',
                      borderColor: '#7c3aed',
                    }}
                  >
                    {isSaving ? 'Issuing...' : 'Issue & Save Document'}
                  </Button>
                </div>
              </div>

              {/* Printable Official Tasknera Letter Preview Sheet (A4) */}
              <div
                id="printable-disciplinary-outcome-sheet"
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
                  lineHeight: 1.45,
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
                  <div style={{ fontSize: '9.75pt', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                    Subject: Outcome of Disciplinary Proceedings &ndash; {renderHighlighted(matterSubject)}
                  </div>

                  {/* Salutation */}
                  <div style={{ fontSize: '9.5pt', marginBottom: 8, color: '#0f172a' }}>
                    {salutationPrefix ? `${salutationPrefix} ` : 'Dear '}
                    {renderHighlighted(employeeSalutation || employeeFullName)},
                  </div>

                  {/* Numbered Clauses */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '9pt', color: '#1e293b', textAlign: 'justify' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>1.</span>
                      <div>
                        <strong>Reference.</strong> We refer to the show-cause notice dated {renderHighlighted(showCauseDate)}, {hasEmployeeReply ? <>your reply dated {renderHighlighted(replyDate)}</> : <>(the absence of a reply)</>}, and the inquiry / hearing held on {renderHighlighted(inquiryDate)}.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>2.</span>
                      <div>
                        <strong>Findings.</strong> After considering the material on record and your explanation, the Company has found that {renderHighlighted(findingsText)}.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>3.</span>
                      <div>
                        <strong>Decision.</strong> In view of the above, the Company has decided as follows:{' '}
                        {decisionType === 'CLOSED' && (
                          <span>(a) No further action; the matter is closed.</span>
                        )}
                        {decisionType === 'WARNING' && (
                          <span>(b) A written warning is issued (see separate letter).</span>
                        )}
                        {decisionType === 'SUSPENSION' && (
                          <span>
                            (c) Suspension for {renderHighlighted(suspensionDays)} days, {renderHighlighted(suspensionPayStatus)} pay as permitted by your appointment letter and applicable law, from {renderHighlighted(suspensionStart)} to {renderHighlighted(suspensionEnd)}.
                          </span>
                        )}
                        {decisionType === 'WITHHOLDING' && (
                          <span>
                            (d) Withholding of {renderHighlighted(withholdingBenefit)} for {renderHighlighted(withholdingMonths)} months, as permitted by Company policy.
                          </span>
                        )}
                        {decisionType === 'TERMINATION' && (
                          <span>(e) Termination of employment (see separate letter).</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>4.</span>
                      <div>
                        <strong>Effective date.</strong> This decision takes effect from {renderHighlighted(effectiveDate)}.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>5.</span>
                      <div>
                        <strong>Conduct expected.</strong> You are required to {renderHighlighted(conductExpected)}. Any further breach may lead to stricter action in accordance with Company policy and applicable law.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>6.</span>
                      <div>
                        <strong>Representation.</strong> If you wish to challenge this decision, you may submit a written representation to {renderHighlighted(appealAuthority)} within {renderHighlighted(appealDays)} days of receiving this letter.
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>7.</span>
                      <div>
                        <strong>Record and confidentiality.</strong> A copy of this letter will be placed on your personnel file for {renderHighlighted(recordFileMonths)} months. Please keep this communication confidential.
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: '10px 0 14px 0', fontSize: '9pt', textAlign: 'justify' }}>
                    Please sign and return a copy of this letter as acknowledgement of receipt.
                  </p>

                  {/* Signatory, Company Seal & Employee Acknowledgement */}
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

                    {/* Center: Company Seal Box */}
                    <div
                      className="company-seal-box"
                      style={{
                        border: '1.5px solid #0f172a',
                        width: 125,
                        height: 72,
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
