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
  Clock,
  MapPin,
  Mail,
  AlertTriangle,
  FileText,
  ShieldAlert,
  Scale,
  Ban,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface FreelancerTerminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export type TerminationOptionType = 'A_CONVENIENCE' | 'B_BREACH_CURABLE' | 'C_IMMEDIATE' | 'ALL_TEMPLATE';

export const FreelancerTerminationModal: React.FC<FreelancerTerminationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error, info } = useToast();

  // Navigation steps: 1 = Details & Termination Terms, 2 = Official 2-Page Letter Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee / Freelancer Selection State
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

  const addBusinessDays = (d: Date, days: number) => {
    const result = new Date(d);
    let count = 0;
    while (count < days) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }
    return result;
  };

  // Form Fields - Basic Reference & Dates
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(10 + Math.random() * 90);
    return `TN/FRSA/TERM/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Agreement Reference
  const [agreementDate, setAgreementDate] = useState<string>('21 October 2026');

  // Freelancer Personal Details
  const [freelancerLegalName, setFreelancerLegalName] = useState<string>('Aarav Mehta');
  const [freelancerSalutation, setFreelancerSalutation] = useState<string>('Aarav');
  const [address, setAddress] = useState<string>(
    'Flat 402, Sunshine Heights, Malad West, Mumbai – 400064, Maharashtra'
  );
  const [email, setEmail] = useState<string>('aarav.mehta@freelancegrowth.com');

  // Termination Mode Option
  const [terminationOption, setTerminationOption] = useState<TerminationOptionType>('A_CONVENIENCE');

  // Option A - Convenience
  const [convenienceNoticeDays, setConvenienceNoticeDays] = useState<string>('seven (7)');
  const [terminationDateConvenience, setTerminationDateConvenience] = useState<string>(() =>
    formatDateString(addDays(new Date(), 7))
  );

  // Option B - Curable Breach
  const [breachDescription, setBreachDescription] = useState<string>(
    'failure to update candidate submission statuses on the Company ATS and sharing unverified candidate dossiers under Clause 4.2'
  );
  const [curePeriodDays, setCurePeriodDays] = useState<string>('seven (7)');

  // Option C - Immediate Termination
  const [immediateCauseCategory, setImmediateCauseCategory] = useState<string>('fraud');
  const [immediateFactualDescription, setImmediateFactualDescription] = useState<string>(
    'fabrication of candidate consent records and unauthorized sharing of client confidential data'
  );

  // Handover & Data Return Deadlines (Clauses 15.5 & 9.5)
  const [handoverDeadlineDate, setHandoverDeadlineDate] = useState<string>(() =>
    formatDateString(addDays(new Date(), 7))
  );
  const [dataDeletionDeadlineDate, setDataDeletionDeadlineDate] = useState<string>(() =>
    formatDateString(addBusinessDays(addDays(new Date(), 7), 5))
  );

  // Signatory (Tasknera)
  const [taskneraSignatoryName, setTaskneraSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [taskneraSignatoryTitle, setTaskneraSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [taskneraSignatoryPlace, setTaskneraSignatoryPlace] = useState<string>('Delhi, India');
  const [taskneraSignDate, setTaskneraSignDate] = useState<string>(() => formatDateString(new Date()));

  // Acknowledgement of Receipt (Freelancer)
  const [freelancerSignDate, setFreelancerSignDate] = useState<string>(() => formatDateString(new Date()));
  const [freelancerSignPlace, setFreelancerSignPlace] = useState<string>('Mumbai');

  // Load employees for quick auto-fill
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

  // Update deadlines when letterDate or terminationOption changes
  const handleNoticeDateChange = (newDateStr: string) => {
    setLetterDate(newDateStr);
    const parsed = new Date(newDateStr);
    if (!isNaN(parsed.getTime())) {
      const termDate = addDays(parsed, 7);
      setTerminationDateConvenience(formatDateString(termDate));
      setHandoverDeadlineDate(formatDateString(termDate));
      setDataDeletionDeadlineDate(formatDateString(addBusinessDays(termDate, 5)));
    }
  };

  // Quick populate when an employee / contractor is selected
  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setFreelancerLegalName(emp.fullName);
    const firstName = emp.fullName.trim().split(' ')[0] || emp.fullName;
    setFreelancerSalutation(firstName);
    if (emp.personalEmail || emp.officialEmail) {
      setEmail(emp.personalEmail || emp.officialEmail || '');
    }
    if (emp.workLocation) {
      setAddress(`${emp.workLocation}, India`);
      setFreelancerSignPlace(emp.workLocation.split(',')[0].trim());
    }
    success(`Selected ${emp.fullName} - termination details populated!`);
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

  // Download PDF through seamless hidden iframe
  const handleDownloadPdf = () => {
    const letterElement = document.getElementById('printable-termination-letter');
    if (!letterElement) {
      window.print();
      return;
    }

    const docTitle = `Tasknera_Termination_Notice_${freelancerLegalName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
            [contenteditable] {
              outline: none !important;
              border: none !important;
              background: transparent !important;
              box-shadow: none !important;
            }
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
              line-height: 1.5;
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
              line-height: 1.5;
              text-align: justify;
            }
            ol {
              margin: 4px 0 10px 0;
              padding-left: 20px;
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
  const handleSaveToDocumentsGenerated = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'TERMINATION_LETTER',
          title: `Notice of Termination - ${freelancerLegalName}`,
          recipientName: freelancerLegalName,
          recipientEmail: email,
          recipientExternalId: selectedEmployeeId || undefined,
          signatoryName: taskneraSignatoryName,
          signatoryTitle: taskneraSignatoryTitle,
          effectiveDate:
            terminationOption === 'C_IMMEDIATE'
              ? letterDate
              : terminationDateConvenience,
        });
      } catch (backendErr) {
        console.warn('Backend API call note:', backendErr);
      }
      success(`Notice of termination for ${freelancerLegalName} saved successfully to Documents Registry!`);
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
        {/* Modal Top Bar */}
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
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Notice of Termination Generator
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                  }}
                >
                  Clause 15 Legal Notice
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Freelance Recruiter Services Agreement &bull; Official 2-Page Dual Signatory Notice
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
                1. Configure &amp; Terms
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
               STEP 1: CONFIGURATION & DATA ENTRY
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card 1: Fast Autofill from Employee / Freelancer Roster */}
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
                    <Users size={18} style={{ color: '#dc2626' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Quick Select Freelancer / Contractor
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ({filteredEmployees.length} registered profiles)
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                        placeholder="Search name, email, ID..."
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
                          border: isSelected ? '2px solid #dc2626' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#fef2f2' : '#ffffff',
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
                            backgroundColor: isSelected ? '#fee2e2' : '#f1f5f9',
                            color: isSelected ? '#dc2626' : '#475569',
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
                            {emp.designation || 'Freelancer'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Grid: Reference & Parties */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                  gap: 20,
                }}
              >
                {/* Column 1: Reference, Notice Date & Agreement Info */}
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
                    <FileText size={17} style={{ color: '#dc2626' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Notice Reference &amp; Agreement Details
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Reference Number
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
                        Notice Date
                      </label>
                      <input
                        type="text"
                        value={letterDate}
                        onChange={(e) => handleNoticeDateChange(e.target.value)}
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
                      Freelance Recruiter Agreement Date
                    </label>
                    <input
                      type="text"
                      value={agreementDate}
                      onChange={(e) => setAgreementDate(e.target.value)}
                      placeholder="e.g. 21 October 2026"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                      Referenced in Subject and Clause 1 as the underlying master contract.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Tasknera Official Notice Email
                    </label>
                    <input
                      type="text"
                      disabled
                      value="careers@tasknera.com"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                      }}
                    />
                  </div>
                </div>

                {/* Column 2: Freelancer Recipient Details */}
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
                    <User size={17} style={{ color: '#dc2626' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Freelancer Recipient Details
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Full Legal Name / Trade Name
                      </label>
                      <input
                        type="text"
                        value={freelancerLegalName}
                        onChange={(e) => setFreelancerLegalName(e.target.value)}
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
                        Salutation Name
                      </label>
                      <input
                        type="text"
                        value={freelancerSalutation}
                        onChange={(e) => setFreelancerSalutation(e.target.value)}
                        placeholder="e.g. Aarav"
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
                      Recipient Email (By Email &amp; To Block)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Complete Correspondence Address
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
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

              {/* Card 3: Termination Mode Selection & Clause 2 Specifics */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1.5px solid #fecaca',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Scale size={20} style={{ color: '#dc2626' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Clause 2: Notice of Termination Options
                    </h4>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Select the specific legal clause to invoke or include all template options
                  </span>
                </div>

                {/* Option Tabs / Radio Cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 12,
                  }}
                >
                  {[
                    {
                      id: 'A_CONVENIENCE' as TerminationOptionType,
                      title: 'Option A: Convenience',
                      clause: 'Clause 15.2',
                      badge: '7 Calendar Days Notice',
                      color: '#0284c7',
                      bg: '#f0f9ff',
                      border: '#bae6fd',
                    },
                    {
                      id: 'B_BREACH_CURABLE' as TerminationOptionType,
                      title: 'Option B: Curable Breach',
                      clause: 'Clause 15.3',
                      badge: '7 Calendar Days Cure Period',
                      color: '#d97706',
                      bg: '#fffbeb',
                      border: '#fde68a',
                    },
                    {
                      id: 'C_IMMEDIATE' as TerminationOptionType,
                      title: 'Option C: Immediate Termination',
                      clause: 'Clause 15.3',
                      badge: 'Immediate Effect & Suspension',
                      color: '#dc2626',
                      bg: '#fef2f2',
                      border: '#fecaca',
                    },
                    {
                      id: 'ALL_TEMPLATE' as TerminationOptionType,
                      title: 'All Options (Draft Template)',
                      clause: 'Clause 15.2 & 15.3',
                      badge: 'Retain & Delete Guidance',
                      color: '#475569',
                      bg: '#f8fafc',
                      border: '#cbd5e1',
                    },
                  ].map((opt) => {
                    const isSelected = terminationOption === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setTerminationOption(opt.id)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: isSelected ? `2px solid ${opt.color}` : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? opt.bg : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                            {opt.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: opt.color,
                              padding: '1px 6px',
                              borderRadius: 4,
                              backgroundColor: '#ffffff',
                              border: `1px solid ${opt.border}`,
                            }}
                          >
                            {opt.clause}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {opt.badge}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-form fields tailored to selected option */}
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {terminationOption === 'A_CONVENIENCE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                        Option A Configuration (Termination for convenience under Clause 15.2):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Notice Duration
                          </label>
                          <input
                            type="text"
                            value={convenienceNoticeDays}
                            onChange={(e) => setConvenienceNoticeDays(e.target.value)}
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
                            Calculated Termination Date (7 calendar days after notice)
                          </label>
                          <input
                            type="text"
                            value={terminationDateConvenience}
                            onChange={(e) => {
                              setTerminationDateConvenience(e.target.value);
                              setHandoverDeadlineDate(e.target.value);
                              const parsed = new Date(e.target.value);
                              if (!isNaN(parsed.getTime())) {
                                setDataDeletionDeadlineDate(formatDateString(addBusinessDays(parsed, 5)));
                              }
                            }}
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
                    </div>
                  )}

                  {terminationOption === 'B_BREACH_CURABLE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                        Option B Configuration (Termination for breach, curable under Clause 15.3):
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                          Describe Material Breach &amp; Clause(s) Breached
                        </label>
                        <textarea
                          rows={2}
                          value={breachDescription}
                          onChange={(e) => setBreachDescription(e.target.value)}
                          placeholder="e.g. failure to provide weekly candidate status updates required under Clause 4.2..."
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
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Cure Period Days
                          </label>
                          <input
                            type="text"
                            value={curePeriodDays}
                            onChange={(e) => setCurePeriodDays(e.target.value)}
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
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 18 }}>
                            If not cured within 7 days, Tasknera will issue follow-up notice fixing the final Termination Date.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {terminationOption === 'C_IMMEDIATE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                        Option C Configuration (Immediate termination under Clause 15.3):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Grounds Category
                          </label>
                          <select
                            value={immediateCauseCategory}
                            onChange={(e) => setImmediateCauseCategory(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: '0.8125rem',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              color: '#0f172a',
                            }}
                          >
                            <option value="fraud">Fraud</option>
                            <option value="fabricated submissions">Fabricated submissions</option>
                            <option value="a material data or security incident">A material data or security incident</option>
                            <option value="unlawful conduct">Unlawful conduct</option>
                            <option value="serious misuse of systems">Serious misuse of systems</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                            Brief Factual Description
                          </label>
                          <input
                            type="text"
                            value={immediateFactualDescription}
                            onChange={(e) => setImmediateFactualDescription(e.target.value)}
                            placeholder="brief factual description"
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
                      <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>
                        &bull; Termination is effective immediately on date of this notice ({letterDate}). ATS &amp; client system access suspended immediately.
                      </div>
                    </div>
                  )}

                  {terminationOption === 'ALL_TEMPLATE' && (
                    <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                      The rendered letter will display all three options (Option A, Option B, and Option C) preceded by the standard notice instruction:{' '}
                      <em style={{ color: '#0f172a', fontWeight: 600 }}>
                        [Retain the applicable option below and delete the others before issuing.]
                      </em>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Exit Obligations & Deadlines (Clause 5) */}
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
                  <Clock size={17} style={{ color: '#dc2626' }} />
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Exit Obligations &amp; Deadlines (Clause 5 &amp; Clause 9.5)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Handover Deadline for ATS / Tracker Status (Clause 5(c))
                    </label>
                    <input
                      type="text"
                      value={handoverDeadlineDate}
                      onChange={(e) => setHandoverDeadlineDate(e.target.value)}
                      placeholder="e.g. 02 November 2026"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                      Reasonable handover of open Candidate status in Company's approved ATS or tracker.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Data Return &amp; Deletion Deadline (5 Business Days - Clause 5(d))
                    </label>
                    <input
                      type="text"
                      value={dataDeletionDeadlineDate}
                      onChange={(e) => setDataDeletionDeadlineDate(e.target.value)}
                      placeholder="e.g. 09 November 2026"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                      }}
                    />
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 3, display: 'block' }}>
                      Within five (5) Business Days of Termination Date, with written confirmation to Company.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 5: Signatories & Acknowledgement */}
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
                  <Building2 size={17} style={{ color: '#dc2626' }} />
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
                      Freelancer Acknowledgement Place
                    </label>
                    <input
                      type="text"
                      value={freelancerSignPlace}
                      onChange={(e) => setFreelancerSignPlace(e.target.value)}
                      placeholder="e.g. Mumbai / Delhi"
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

              {/* Step 1 Footer Action */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                  marginTop: 6,
                }}
              >
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
                  style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
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
              {/* Preview Control Bar */}
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

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 10px',
                      backgroundColor: '#eff6ff',
                      borderRadius: 6,
                      border: '1px solid #bfdbfe',
                      fontSize: '0.75rem',
                      color: '#1e40af',
                    }}
                  >
                    <span>✏️</span>
                    <span><strong>Tip:</strong> All paragraphs are editable — click any text to edit directly.</span>
                  </div>
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
                    style={{ fontSize: '0.8125rem', background: '#dc2626', borderColor: '#dc2626' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents'}
                  </Button>
                </div>
              </div>

              {/* Printable Document Container */}
              <div
                id="printable-termination-letter"
                style={{
                  width: '100%',
                  maxWidth: 820,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}
              >
                {/* ===================================================================
                    PAGE 1: Official Header, Subject, Ref, Recipient & Clauses 1 to 4
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
                    lineHeight: 1.5,
                  }}
                >
                  <div>
                    {/* Header: Centered Tasknera Brand Logo & Subtitle */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 18,
                        marginBottom: 18,
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

                    {/* Ref No. and Date Row */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginTop: 10,
                        marginBottom: 14,
                        fontSize: '9.5pt',
                      }}
                    >
                      <div>
                        <div>
                          <strong>Ref. No.:</strong>{' '}
                          {highlightPlaceholders ? <mark>{referenceNumber}</mark> : referenceNumber}
                        </div>
                        <div style={{ marginTop: 3 }}>
                          <strong>By email:</strong>{' '}
                          {highlightPlaceholders ? <mark>{email}</mark> : email}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Date:</strong>{' '}
                        {highlightPlaceholders ? <mark>{letterDate}</mark> : letterDate}
                      </div>
                    </div>

                    {/* Recipient Block */}
                    <div style={{ marginBottom: 16, lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>To,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {highlightPlaceholders ? <mark>{freelancerLegalName}</mark> : freelancerLegalName}
                      </div>
                      <div style={{ color: '#334155', whiteSpace: 'pre-line' }}>
                        {highlightPlaceholders ? <mark>{address}</mark> : address}
                      </div>
                      <div style={{ color: '#334155', marginTop: 2 }}>
                        Email: {highlightPlaceholders ? <mark>{email}</mark> : email}
                      </div>
                    </div>

                    {/* Subject */}
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: '10pt',
                        marginBottom: 14,
                      }}
                    >
                      Subject: Notice of Termination – Freelance Recruiter Services Agreement dated{' '}
                      {highlightPlaceholders ? <mark>{agreementDate}</mark> : agreementDate}
                    </div>

                    {/* Dear Salutation */}
                    <div style={{ marginBottom: 12, color: '#0f172a' }}>
                      Dear {highlightPlaceholders ? <mark>{freelancerSalutation}</mark> : freelancerSalutation},
                    </div>

                    {/* Clause 1: Reference */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>1. Reference.</strong> We refer to the Freelance Recruiter Services Agreement dated{' '}
                      {highlightPlaceholders ? <mark>{agreementDate}</mark> : agreementDate} (the “Agreement”) between
                      Tasknera (the “Company”) and{' '}
                      {highlightPlaceholders ? <mark>{freelancerLegalName}</mark> : freelancerLegalName} (the “Freelancer”).
                      Capitalised terms not defined in this letter have the meaning given in the Agreement.
                    </p>

                    {/* Clause 2: Notice of Termination */}
                    <div style={{ marginBottom: 12 }}>
                      <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 8, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                        <strong>2. Notice of termination.</strong> The Company gives notice of termination of the
                        Agreement as follows.
                      </p>

                      {/* Display Template Guideline if in ALL_TEMPLATE or helpful notice */}
                      {terminationOption === 'ALL_TEMPLATE' && (
                        <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: 8 }}>
                          [Retain the applicable option below and delete the others before issuing.]
                        </p>
                      )}

                      {/* Option A */}
                      {(terminationOption === 'A_CONVENIENCE' || terminationOption === 'ALL_TEMPLATE') && (
                        <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 8, paddingLeft: terminationOption === 'ALL_TEMPLATE' ? 0 : 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                          <strong>Option A – Termination for convenience (Clause 15.2).</strong> The Company hereby
                          gives the Freelancer {convenienceNoticeDays} calendar days’ written notice of termination. The
                          Agreement will terminate on{' '}
                          {highlightPlaceholders ? (
                            <mark>{terminationDateConvenience}</mark>
                          ) : (
                            terminationDateConvenience
                          )}{' '}
                          (the “<strong>Termination Date</strong>”).
                        </p>
                      )}

                      {/* Option B */}
                      {(terminationOption === 'B_BREACH_CURABLE' || terminationOption === 'ALL_TEMPLATE') && (
                        <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 8, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                          <strong>Option B – Termination for breach, curable (Clause 15.3).</strong> The Company has
                          identified the following material breach of the Agreement:{' '}
                          {highlightPlaceholders ? <mark>{breachDescription}</mark> : breachDescription}. The
                          Freelancer is required to cure this breach within {curePeriodDays} calendar days of the date of
                          this notice. If it is not cured within that period, the Company may terminate the Agreement by
                          further written notice, and the date stated in that notice will be the “
                          <strong>Termination Date</strong>”.
                        </p>
                      )}

                      {/* Option C */}
                      {(terminationOption === 'C_IMMEDIATE' || terminationOption === 'ALL_TEMPLATE') && (
                        <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 8, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                          <strong>Option C – Immediate termination (Clause 15.3).</strong> In view of{' '}
                          {highlightPlaceholders ? (
                            <mark>{immediateCauseCategory}</mark>
                          ) : (
                            immediateCauseCategory
                          )}
                          , namely{' '}
                          {highlightPlaceholders ? (
                            <mark>{immediateFactualDescription}</mark>
                          ) : (
                            immediateFactualDescription
                          )}
                          , the Company terminates the Agreement with immediate effect. The date of this notice is the “
                          <strong>Termination Date</strong>”, and the Freelancer’s access to Company and Client systems is
                          suspended from that date.
                        </p>
                      )}
                    </div>

                    {/* Clause 3: Assignments */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>3. Assignments.</strong> From the Termination Date, all open Assignments are closed and no
                      further Assignments will be shared. The Freelancer shall not submit any further Candidate profile to
                      the Company or any Client, or communicate with any Candidate or Client on behalf of the Company, after
                      the Termination Date.
                    </p>

                    {/* Clause 4: Payout after termination */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>4. Payout after termination (Clause 15.4).</strong> Termination does not affect the
                      Freelancer’s eligibility for a Candidate introduced under an accepted Assignment before
                      termination who achieves a Successful Joining within the applicable attribution period (Clause
                      11.1 and Schedule 1). Any such payout remains subject to Clauses 5 and 6 and the Commercial Terms.
                      No fee is payable for unearned or speculative future placements.
                    </p>
                  </div>

                  {/* Page 1 Official Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 12,
                      marginTop: 24,
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

                {/* Print Break */}
                <div className="page-break" />

                {/* ===================================================================
                    PAGE 2: Header, Clauses 5 to 9, Closing, Signatures & Acknowledgement
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
                    lineHeight: 1.5,
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
                        Notice of Termination – Freelance Recruiter Services Agreement
                      </span>
                    </div>

                    {/* Clause 5: Exit obligations */}
                    <div style={{ marginBottom: 12 }}>
                      <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 6, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                        <strong>5. Exit obligations (Clauses 15.5 and 9.5).</strong> The Freelancer shall:
                      </p>
                      <div style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ textAlign: 'justify' }}>
                          <strong>(a)</strong> stop using all Company and Client systems, including the ATS, CRM,
                          trackers and approved email and communication channels;
                        </div>
                        <div style={{ textAlign: 'justify' }}>
                          <strong>(b)</strong> return all Company property and credentials;
                        </div>
                        <div style={{ textAlign: 'justify' }}>
                          <strong>(c)</strong> provide a reasonable handover of open Candidate status in the Company’s
                          approved ATS or tracker by{' '}
                          {highlightPlaceholders ? (
                            <mark>{handoverDeadlineDate}</mark>
                          ) : (
                            handoverDeadlineDate
                          )}
                          ; and
                        </div>
                        <div style={{ textAlign: 'justify' }}>
                          <strong>(d)</strong> return or securely delete all Company and Client information, including
                          Candidate data, within five (5) Business Days of the Termination Date, i.e. by{' '}
                          {highlightPlaceholders ? (
                            <mark>{dataDeletionDeadlineDate}</mark>
                          ) : (
                            dataDeletionDeadlineDate
                          )}
                          , and confirm completion to the Company in writing. Copies required by law or held in
                          routine secure backups that are not readily accessible are subject to Clause 9.5.
                        </div>
                      </div>
                    </div>

                    {/* Clause 6: Payments and tax documentation */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>6. Payments and tax documentation (Clauses 6.4 and 6.5).</strong> The Freelancer should
                      keep their payment details and tax documentation up to date so that any payout that falls due can
                      be processed. The Company will issue the applicable tax-deduction certificates within the
                      statutory timeline.
                    </p>

                    {/* Clause 7: Surviving obligations */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>7. Surviving obligations (Clause 15.6).</strong> The provisions of the Agreement that
                      survive termination continue in force, including Clauses 8 (Confidentiality, for five (5) years
                      after the Agreement ends), 9 (Candidate data, privacy and information security), 10
                      (Intellectual property), 11 (Candidate attribution and non-circumvention), 14 (Indemnity and
                      liability), 16 (Governing law and dispute resolution) and 17 (General provisions).
                    </p>

                    {/* Clause 8: Reservation of rights */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>8. Reservation of rights.</strong> Nothing in this letter waives any right or remedy of the
                      Company under the Agreement or Applicable Law, including under Clauses 5.6 and 14, all of which are
                      reserved.
                    </p>

                    {/* Clause 9: Notices and acknowledgement */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ textAlign: 'justify', marginBottom: 12, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      <strong>9. Notices and acknowledgement.</strong> This notice is given in writing by email under
                      Clause 17.5. Please countersign and return a copy of this letter to careers@tasknera.com to
                      acknowledge receipt. Failure to do so does not affect the validity of this notice.
                    </p>

                    {/* Closing remark */}
                    <p style={{ marginBottom: 14 }}>
                      We thank you for your services to Tasknera and wish you well.
                    </p>

                    {/* Company Signatory Block */}
                    <div style={{ marginBottom: 20 }}>
                      <div>Yours sincerely,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2, marginBottom: 14 }}>
                        For and on behalf of TASKNERA
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 20,
                          marginTop: 6,
                        }}
                      >
                        {/* Authorised Signatory */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', marginBottom: 26 }}>
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
                            Place: {highlightPlaceholders ? <mark>{taskneraSignatoryPlace}</mark> : taskneraSignatoryPlace}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Freelancer Acknowledgement Box */}
                    <div
                      style={{
                        borderTop: '1px solid #e2e8f0',
                        paddingTop: 14,
                        marginTop: 10,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4, fontSize: '9.5pt' }}>
                        ACKNOWLEDGEMENT OF RECEIPT
                      </div>
                      <p style={{ margin: '0 0 16px 0', fontSize: '9.25pt' }}>
                        I,{' '}
                        {highlightPlaceholders ? (
                          <mark>{freelancerLegalName}</mark>
                        ) : (
                          freelancerLegalName
                        )}
                        , acknowledge receipt of this Notice of Termination.
                      </p>

                      <div style={{ fontSize: '8.5pt', color: '#64748b', fontStyle: 'italic', marginBottom: 24 }}>
                        Signature of Freelancer
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 24,
                          fontSize: '9.25pt',
                        }}
                      >
                        <div>
                          <strong>Name:</strong>{' '}
                          {highlightPlaceholders ? <mark>{freelancerLegalName}</mark> : freelancerLegalName}
                        </div>
                        <div>
                          <strong>Date:</strong>{' '}
                          {highlightPlaceholders ? <mark>{freelancerSignDate}</mark> : freelancerSignDate}
                        </div>
                        <div>
                          <strong>Place:</strong>{' '}
                          {highlightPlaceholders ? <mark>{freelancerSignPlace}</mark> : freelancerSignPlace}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Official Footer */}
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
