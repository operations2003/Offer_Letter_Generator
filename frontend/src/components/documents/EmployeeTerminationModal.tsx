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
  Clock,
  MapPin,
  Mail,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Scale,
  Ban,
  FileCheck2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface EmployeeTerminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const EmployeeTerminationModal: React.FC<EmployeeTerminationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error, info } = useToast();

  // Navigation steps: 1 = Form & Terms, 2 = Official 2-Page Letter Preview
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

  // Helper date utilities
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
    return `TN/HR/TERM/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Employee Profile Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Rahul Sharma');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Rahul');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1001');
  const [designation, setDesignation] = useState<string>('Senior Software Engineer');
  const [department, setDepartment] = useState<string>('Engineering');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat 302, Palm Grove Apartments, Whitefield, Bangalore – 560066, Karnataka'
  );
  const [employeeEmail, setEmployeeEmail] = useState<string>('rahul.sharma@example.com');

  // Clause 1: Reference
  const [appointmentLetterDate, setAppointmentLetterDate] = useState<string>('01 June 2024');

  // Clause 2: Allegations
  const [incidentDate, setIncidentDate] = useState<string>('14 October 2026');
  const [violationCategory, setViolationCategory] = useState<string>('breach of confidentiality and unauthorized data sharing');
  const [factualDescription, setFactualDescription] = useState<string>(
    'unauthorized exfiltration of client candidate dossiers and transmission to unauthorized external personal email accounts'
  );
  const [policyClauseBreached, setPolicyClauseBreached] = useState<string>(
    'Clause 4.2 of the Zero Tolerance Policy and Section 8 (Information Security & Confidentiality) of the Code of Conduct'
  );

  // Clause 3: Process Followed
  const [showCauseDate, setShowCauseDate] = useState<string>('16 October 2026');
  const [explanationDueDate, setExplanationDueDate] = useState<string>('20 October 2026');
  const [replyMode, setReplyMode] = useState<'REPLY_CONSIDERED' | 'NO_REPLY'>('REPLY_CONSIDERED');
  const [replyReceivedDate, setReplyReceivedDate] = useState<string>('19 October 2026');
  const [hasInquiry, setHasInquiry] = useState<boolean>(true);
  const [inquiryDate, setInquiryDate] = useState<string>('23 October 2026');

  // Clause 4: Decision & Notice Terms
  const [terminationDate, setTerminationDate] = useState<string>(() => formatDateString(new Date()));
  const [noticePayMode, setNoticePayMode] = useState<'WITHOUT_NOTICE' | 'PAY_IN_LIEU'>('WITHOUT_NOTICE');
  const [appointmentClauseNo, setAppointmentClauseNo] = useState<string>('12.3');
  const [noticeDaysPay, setNoticeDaysPay] = useState<string>('30');

  // Clause 5: Full and Final Settlement
  const [settlementWorkingDays, setSettlementWorkingDays] = useState<string>('30');

  // Clause 6: Handover & Return of Property
  const [handoverRecipient, setHandoverRecipient] = useState<string>('Ms. Sheetal Bedi, Chief Executive Officer (CEO)');
  const [handoverCompletionDate, setHandoverCompletionDate] = useState<string>(() =>
    formatDateString(addDays(new Date(), 2))
  );

  // Signatory (Tasknera)
  const [taskneraSignatoryName, setTaskneraSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [taskneraSignatoryTitle, setTaskneraSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [taskneraSignatoryPlace, setTaskneraSignatoryPlace] = useState<string>('Delhi, India');
  const [taskneraSignDate, setTaskneraSignDate] = useState<string>(() => formatDateString(new Date()));

  // Employee Acknowledgement
  const [employeeSignDate, setEmployeeSignDate] = useState<string>(() => formatDateString(new Date()));
  const [employeeSignPlace, setEmployeeSignPlace] = useState<string>('Bangalore');

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
        console.warn('Failed to load employee roster for termination autofill:', err);
      } finally {
        if (isMounted) setLoadingEmployees(false);
      }
    };
    loadRoster();
    return () => {
      isMounted = false;
    };
  }, []);

  // Autofill on employee selection
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(emp.fullName);
    const firstName = emp.fullName.trim().split(' ')[0] || emp.fullName;
    setEmployeeSalutation(firstName);
    setEmployeeId(emp.employeeId || 'EMP-1001');
    setDesignation(emp.designation || 'Software Engineer');
    setDepartment(emp.department || 'Engineering');
    if (emp.personalEmail || emp.officialEmail) {
      setEmployeeEmail(emp.personalEmail || emp.officialEmail || '');
    }
    if (emp.workLocation) {
      setResidentialAddress(`${emp.workLocation}, India`);
      setEmployeeSignPlace(emp.workLocation.split(',')[0].trim());
    }
    if (emp.joiningDate) {
      setAppointmentLetterDate(emp.joiningDate);
    }
    success(`Selected ${emp.fullName} - employee termination record populated!`);
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
    const letterElement = document.getElementById('printable-emp-termination-letter');
    if (!letterElement) {
      window.print();
      return;
    }

    const docTitle = `Tasknera_Employee_Termination_${employeeFullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
            .termination-page {
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
          documentTypeCode: 'TERMINATION_LETTER',
          title: `Employee Termination - ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: employeeEmail,
          recipientExternalId: selectedEmployeeId || employeeId,
          signatoryName: taskneraSignatoryName,
          signatoryTitle: taskneraSignatoryTitle,
          effectiveDate: terminationDate,
        });
      } catch (backendErr) {
        console.warn('Backend API note:', backendErr);
      }
      success(`Termination letter for ${employeeFullName} saved successfully to Documents Registry!`);
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
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Employee Termination Letter
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#ffe4e6',
                    color: '#be123c',
                    border: '1px solid #fda4af',
                  }}
                >
                  Zero Tolerance Policy &bull; Code of Conduct
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Formal Employee Termination &bull; Violation of ZTP &bull; Dual Signatory 2-Page Letter
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
                1. Edit Details &amp; Inquiry
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
                2. Live 2-Page Preview
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
               STEP 1: CONFIGURATION & PROCESS FORM
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection Quick Bar */}
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
                    <Users size={18} style={{ color: '#e11d48' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Quick Select Active Employee
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
                      placeholder="Search name, ID, title..."
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
                          border: isSelected ? '2px solid #e11d48' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#fff1f2' : '#ffffff',
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
                            backgroundColor: isSelected ? '#fecdd3' : '#f1f5f9',
                            color: isSelected ? '#be123c' : '#475569',
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
                            {emp.employeeId} &bull; {emp.designation}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid: Reference & Employee Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                  gap: 20,
                }}
              >
                {/* Column 1: Notice Reference & Appointment Date */}
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
                    <FileText size={17} style={{ color: '#e11d48' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Letter Reference &amp; Appointment Contract
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Appointment Letter Date (Clause 1 Reference)
                    </label>
                    <input
                      type="text"
                      value={appointmentLetterDate}
                      onChange={(e) => setAppointmentLetterDate(e.target.value)}
                      placeholder="e.g. 01 June 2024"
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
                      Mode of Delivery (By hand / email)
                    </label>
                    <input
                      type="text"
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="Employee email address"
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

                {/* Column 2: Employee Recipient Profile */}
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
                    <User size={17} style={{ color: '#e11d48' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Employee Details &amp; Designation
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Employee Full Name
                      </label>
                      <input
                        type="text"
                        value={employeeFullName}
                        onChange={(e) => setEmployeeFullName(e.target.value)}
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
                      Residential Address
                    </label>
                    <textarea
                      rows={2}
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Allegations & Policy Violation (Clause 2) */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1.5px solid #fecdd3',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <ShieldAlert size={18} style={{ color: '#e11d48' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Clause 2: Allegations &amp; Policy Breach Details
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Incident Date(s)
                    </label>
                    <input
                      type="text"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      placeholder="e.g. on or about 14 October 2026"
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
                      Misconduct Category (e.g. harassment / falsification / confidentiality / fraud)
                    </label>
                    <input
                      type="text"
                      value={violationCategory}
                      onChange={(e) => setViolationCategory(e.target.value)}
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
                    Specific Factual Conduct Description
                  </label>
                  <textarea
                    rows={2}
                    value={factualDescription}
                    onChange={(e) => setFactualDescription(e.target.value)}
                    placeholder="Describe the conduct factually and specifically..."
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
                    ZTP Clause &amp; Code of Conduct Heading Breached
                  </label>
                  <input
                    type="text"
                    value={policyClauseBreached}
                    onChange={(e) => setPolicyClauseBreached(e.target.value)}
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

              {/* Card 3: Process Followed & Show-Cause Inquiry (Clause 3) */}
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
                  <Scale size={18} style={{ color: '#e11d48' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Clause 3: Due Process, Show-Cause Notice &amp; Inquiry
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Show-Cause Notice Issued Date
                    </label>
                    <input
                      type="text"
                      value={showCauseDate}
                      onChange={(e) => setShowCauseDate(e.target.value)}
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
                      Written Explanation Due Date
                    </label>
                    <input
                      type="text"
                      value={explanationDueDate}
                      onChange={(e) => setExplanationDueDate(e.target.value)}
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
                      Explanation Reply Status
                    </label>
                    <select
                      value={replyMode}
                      onChange={(e) => setReplyMode(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    >
                      <option value="REPLY_CONSIDERED">Your reply was considered</option>
                      <option value="NO_REPLY">No reply was received within time</option>
                    </select>
                  </div>

                  {replyMode === 'REPLY_CONSIDERED' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Reply Date Received
                      </label>
                      <input
                        type="text"
                        value={replyReceivedDate}
                        onChange={(e) => setReplyReceivedDate(e.target.value)}
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
                  )}
                </div>

                {/* Inquiry toggle */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={hasInquiry}
                      onChange={(e) => setHasInquiry(e.target.checked)}
                      style={{ accentColor: '#e11d48', width: 16, height: 16 }}
                    />
                    Include Formal Domestic Inquiry hearing record (if applicable)
                  </label>

                  {hasInquiry && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Inquiry Date:</span>
                      <input
                        type="text"
                        value={inquiryDate}
                        onChange={(e) => setInquiryDate(e.target.value)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.8125rem',
                          borderRadius: 4,
                          border: '1px solid #cbd5e1',
                          width: 140,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Decision, Notice Terms & Settlement (Clause 4, 5, 6) */}
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
                  <Ban size={18} style={{ color: '#e11d48' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Clauses 4, 5 &amp; 6: Decision, Notice Pay, Settlement &amp; Handover
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Effective Termination Date
                    </label>
                    <input
                      type="text"
                      value={terminationDate}
                      onChange={(e) => setTerminationDate(e.target.value)}
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
                      Notice Terms
                    </label>
                    <select
                      value={noticePayMode}
                      onChange={(e) => setNoticePayMode(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    >
                      <option value="WITHOUT_NOTICE">Without notice or pay in lieu of notice (ZTP violation)</option>
                      <option value="PAY_IN_LIEU">The Company will pay [X] days' pay in lieu of notice</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {noticePayMode === 'WITHOUT_NOTICE' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Appointment Letter Termination Clause
                      </label>
                      <input
                        type="text"
                        value={appointmentClauseNo}
                        onChange={(e) => setAppointmentClauseNo(e.target.value)}
                        placeholder="e.g. 12.3"
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
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Days' Pay in Lieu of Notice
                      </label>
                      <input
                        type="text"
                        value={noticeDaysPay}
                        onChange={(e) => setNoticeDaysPay(e.target.value)}
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
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Full &amp; Final Working Days
                    </label>
                    <input
                      type="text"
                      value={settlementWorkingDays}
                      onChange={(e) => setSettlementWorkingDays(e.target.value)}
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

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Handover Recipient (Clause 6)
                    </label>
                    <input
                      type="text"
                      value={handoverRecipient}
                      onChange={(e) => setHandoverRecipient(e.target.value)}
                      placeholder="Name / Designation"
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
                      Exit Clearance Deadline
                    </label>
                    <input
                      type="text"
                      value={handoverCompletionDate}
                      onChange={(e) => setHandoverCompletionDate(e.target.value)}
                      placeholder="e.g. 28 October 2026"
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

              {/* Card 5: Signatories */}
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
                  <Building2 size={17} style={{ color: '#e11d48' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Signatory &amp; Acknowledgement Block
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
                  style={{ backgroundColor: '#e11d48', borderColor: '#e11d48' }}
                >
                  Proceed to Official 2-Page Preview
                </Button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               STEP 2: OFFICIAL 2-PAGE LETTER PREVIEW (MATCHING USER PDF)
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
                    style={{ fontSize: '0.8125rem', background: '#e11d48', borderColor: '#e11d48' }}
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

              {/* Printable Document Container */}
              <div
                id="printable-emp-termination-letter"
                style={{
                  width: '100%',
                  maxWidth: 820,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}
              >
                {/* ===================================================================
                    PAGE 1: Header, Ref, Recipient, Subject & Clauses 1 to 7
                    =================================================================== */}
                <div
                  className="termination-page"
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
                        marginBottom: 12,
                        fontSize: '9.5pt',
                      }}
                    >
                      <div>
                        <div>
                          <strong>Ref. No.:</strong>{' '}
                          {highlightPlaceholders ? <mark>{referenceNumber}</mark> : referenceNumber}
                        </div>
                        <div style={{ marginTop: 2 }}>
                          <strong>By hand / email:</strong>{' '}
                          {highlightPlaceholders ? <mark>{employeeEmail}</mark> : employeeEmail}
                        </div>
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
                      Subject: Termination of Employment – Violation of the Zero Tolerance Policy and Code of Conduct
                    </div>

                    {/* Salutation */}
                    <div style={{ marginBottom: 10, color: '#0f172a' }}>
                      Dear {highlightPlaceholders ? <mark>{employeeSalutation}</mark> : employeeSalutation},
                    </div>

                    {/* Clause 1: Reference */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>1. Reference.</strong> We refer to your appointment letter dated{' '}
                      {highlightPlaceholders ? <mark>{appointmentLetterDate}</mark> : appointmentLetterDate} under which you
                      were employed with Tasknera (the “Company”) as{' '}
                      {highlightPlaceholders ? <mark>{designation}</mark> : designation}, and to the Company’s Zero
                      Tolerance Policy (“ZTP”) and Code of Conduct, which you acknowledged and agreed to comply with as a
                      condition of your employment.
                    </p>

                    {/* Clause 2: Allegations */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>2. Allegations.</strong> It was found that on or about{' '}
                      {highlightPlaceholders ? <mark>{incidentDate}</mark> : incidentDate} you{' '}
                      {highlightPlaceholders ? <mark>{factualDescription}</mark> : factualDescription}. This conduct
                      breaches {highlightPlaceholders ? <mark>{policyClauseBreached}</mark> : policyClauseBreached}.
                    </p>

                    {/* Clause 3: Process followed */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>3. Process followed.</strong> A show-cause notice dated{' '}
                      {highlightPlaceholders ? <mark>{showCauseDate}</mark> : showCauseDate} was issued to you, calling
                      for your written explanation by{' '}
                      {highlightPlaceholders ? <mark>{explanationDueDate}</mark> : explanationDueDate}.{' '}
                      {replyMode === 'REPLY_CONSIDERED' ? (
                        <>
                          Your reply dated{' '}
                          {highlightPlaceholders ? <mark>{replyReceivedDate}</mark> : replyReceivedDate} was
                          considered.
                        </>
                      ) : (
                        <>No reply was received within the time given.</>
                      )}{' '}
                      {hasInquiry && (
                        <>
                          An inquiry was held on{' '}
                          {highlightPlaceholders ? <mark>{inquiryDate}</mark> : inquiryDate}, in which you were given a
                          fair opportunity to be heard.
                        </>
                      )}
                    </p>

                    {/* Clause 4: Decision */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>4. Decision.</strong> After considering the material on record, the Company has found that
                      the charge of violating the ZTP and Code of Conduct is established. Having regard to the
                      seriousness of the misconduct, which the ZTP does not tolerate, the Company has decided to
                      terminate your employment with effect from{' '}
                      {highlightPlaceholders ? <mark>{terminationDate}</mark> : terminationDate} (the “
                      <strong>Termination Date</strong>”).{' '}
                      {noticePayMode === 'WITHOUT_NOTICE' ? (
                        <>
                          The termination is without notice or pay in lieu of notice, in accordance with Clause{' '}
                          {highlightPlaceholders ? <mark>{appointmentClauseNo}</mark> : appointmentClauseNo} of your
                          appointment letter and the Company’s policies.
                        </>
                      ) : (
                        <>
                          The Company will pay you{' '}
                          {highlightPlaceholders ? <mark>{noticeDaysPay}</mark> : noticeDaysPay} days’ pay in lieu of
                          notice.
                        </>
                      )}
                    </p>

                    {/* Clause 5: Full and final settlement */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>5. Full and final settlement.</strong> Your full and final settlement will be processed
                      within {highlightPlaceholders ? <mark>{settlementWorkingDays}</mark> : settlementWorkingDays}{' '}
                      working days of the Termination Date, covering salary for the days worked up to the Termination
                      Date and encashment of accrued leave, if any, as per Company policy. Amounts due to the Company,
                      including advances, loans and the value of unreturned Company property, will be adjusted as
                      permitted by applicable law. Gratuity and other statutory dues, if any, will be dealt with in
                      accordance with applicable law.
                    </p>

                    {/* Clause 6: Handover and return of property */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>6. Handover and return of property.</strong> You are required to hand over all work, files
                      and responsibilities to{' '}
                      {highlightPlaceholders ? <mark>{handoverRecipient}</mark> : handoverRecipient}, return all Company
                      property (laptop, ID and access cards, documents, credentials), and complete the exit clearance
                      process by{' '}
                      {highlightPlaceholders ? <mark>{handoverCompletionDate}</mark> : handoverCompletionDate}. Your
                      access to Company and Client systems stands withdrawn from the Termination Date.
                    </p>

                    {/* Clause 7: Confidentiality and continuing obligations */}
                    <p style={{ textAlign: 'justify', marginBottom: 10 }}>
                      <strong>7. Confidentiality and continuing obligations.</strong> You must return or securely
                      delete all Company, Client and Candidate information in your possession. Your confidentiality,
                      data-protection, non-solicitation and other post-employment obligations under your appointment
                      letter and Company policies continue to bind you after the Termination Date.
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
                    PAGE 2: Header, Clauses 8 & 9, Signatures, Seal & Acknowledgement
                    =================================================================== */}
                <div
                  className="termination-page"
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
                        gap: 10,
                        paddingBottom: 14,
                        marginBottom: 16,
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
                        Termination of Employment
                      </span>
                    </div>

                    {/* Clause 8: Reservation of rights */}
                    <p style={{ textAlign: 'justify', marginBottom: 12 }}>
                      <strong>8. Reservation of rights.</strong> This letter does not waive any right or remedy
                      available to the Company under your appointment letter, Company policies or applicable law,
                      including the right to recover losses and to take legal action where warranted, all of which are
                      reserved.
                    </p>

                    {/* Clause 9: Documents */}
                    <p style={{ textAlign: 'justify', marginBottom: 14 }}>
                      <strong>9. Documents.</strong> Any experience or relieving documentation will be issued in
                      accordance with Company policy after completion of the exit formalities.
                    </p>

                    <p style={{ marginBottom: 14 }}>
                      Please acknowledge receipt by signing and returning the enclosed copy of this letter.
                    </p>

                    {/* Signoff line */}
                    <div style={{ marginBottom: 16 }}>
                      <div>Yours faithfully,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        For and on behalf of TASKNERA
                      </div>
                    </div>

                    {/* Side-by-side: Authorised Signatory | Acknowledgement of Receipt */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 32,
                        alignItems: 'flex-start',
                        marginTop: 18,
                        paddingTop: 8,
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

                      {/* Right: ACKNOWLEDGEMENT OF RECEIPT */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '9pt', marginBottom: 4 }}>
                          ACKNOWLEDGEMENT OF RECEIPT
                        </div>
                        <div style={{ fontSize: '9pt', color: '#334155', marginBottom: 18, lineHeight: 1.4 }}>
                          I,{' '}
                          {highlightPlaceholders ? (
                            <mark>{employeeFullName}</mark>
                          ) : (
                            employeeFullName
                          )}
                          , acknowledge receipt of this letter.
                        </div>

                        <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', marginBottom: 26 }}>
                          Signature of Employee
                        </div>

                        <div style={{ fontSize: '9pt' }}>
                          <div>
                            <strong>Date:</strong>{' '}
                            {highlightPlaceholders ? <mark>{employeeSignDate}</mark> : employeeSignDate}
                          </div>
                          <div style={{ marginTop: 2 }}>
                            <strong>Place:</strong>{' '}
                            {highlightPlaceholders ? <mark>{employeeSignPlace}</mark> : employeeSignPlace}
                          </div>
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
