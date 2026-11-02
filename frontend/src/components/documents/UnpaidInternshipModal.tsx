import { SHEETAL_BEDI_SIGNATURE_DATA_URL } from '../../constants/signature.js';
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
  GraduationCap,
  Briefcase,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface UnpaidInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const UnpaidInternshipModal: React.FC<UnpaidInternshipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Details Configuration, 2 = Official Letterhead Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Candidate / Intern Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Preview options
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Helper date format
  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // Form Fields - Reference & Date
  const [issueDate, setIssueDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/INT/${yyyy}/${rand}`;
  });

  // Candidate Details
  const [candidateFullName, setCandidateFullName] = useState<string>('Ananya Sharma');
  const [candidateSalutation, setCandidateSalutation] = useState<string>('Ananya');
  const [candidateEmail, setCandidateEmail] = useState<string>('ananya.sharma@example.com');
  const [candidatePhone, setCandidatePhone] = useState<string>('+91 98765 43210');

  // Internship Parameters
  const [position, setPosition] = useState<string>('HR Intern');
  const [internshipDuration, setInternshipDuration] = useState<string>('Three (3) months');
  const [startDate, setStartDate] = useState<string>(() => formatDateString(addDays(new Date(), 7)));
  const [endDate, setEndDate] = useState<string>(() => formatDateString(addMonths(addDays(new Date(), 7), 3)));
  const [workArrangementLocation, setWorkArrangementLocation] = useState<string>('Hybrid / Delhi NCR, India');
  const [reportingTo, setReportingTo] = useState<string>('Rashmi Sharma / HR Operations Partner');
  const [acceptanceDeadline, setAcceptanceDeadline] = useState<string>(() => formatDateString(addDays(new Date(), 5)));

  // Signatory & Authority
  const [signatoryName, setSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('Chief Executive Officer');
  const [companyName, setCompanyName] = useState<string>('Tasknera');
  const [companyEmail, setCompanyEmail] = useState<string>('careers@tasknera.com');

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Load employee directory for 1-click candidate selection
  useEffect(() => {
    if (!isOpen) return;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await EmployeeService.listEmployees();
        setEmployees(data || []);
      } catch (err) {
        console.warn('Failed to load employee directory:', err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [isOpen]);

  // Handle employee autofill
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    if (emp.fullName) {
      setCandidateFullName(emp.fullName);
      const firstName = emp.fullName.trim().split(' ')[0];
      setCandidateSalutation(firstName);
    }
    if (emp.personalEmail || emp.officialEmail) {
      setCandidateEmail(emp.personalEmail || emp.officialEmail || '');
    }
    if (emp.phone) {
      setCandidatePhone(emp.phone);
    }
    if (emp.workLocation) {
      setWorkArrangementLocation(`${emp.workLocation} (Hybrid)`);
    }
    if (emp.reportingManager) {
      setReportingTo(emp.reportingManager);
    }
    success(`Selected ${emp.fullName}! Form auto-populated.`);
  };

  // Filtered employees for dropdown
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = employeeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q));
      const matchesDept = selectedDeptFilter === 'ALL' || e.department === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, employeeSearch, selectedDeptFilter]);

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  // Highlight helper
  const renderHighlighted = (text: React.ReactNode) => {
    if (!highlightPlaceholders) return text;
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
        {text}
      </span>
    );
  };

  // High-Fidelity Printable Export
  const handlePrint = () => {
    const printElement = document.getElementById('printable-unpaid-internship-sheet');
    if (!printElement) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
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
          <title>Unpaid_HR_Internship_Offer_${candidateFullName.replace(/\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 14mm 16mm 14mm 16mm;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            mark {
              background: transparent !important;
              color: inherit !important;
            }
            .terms-table {
              width: 100%;
              border-collapse: collapse;
              margin: 14px 0;
              font-size: 10pt;
            }
            .terms-table td, .terms-table th {
              border: 1px solid #94a3b8;
              padding: 6px 12px;
            }
            .terms-table td:first-child {
              font-weight: 700;
              width: 38%;
              color: #0f172a;
              background-color: #f8fafc;
            }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 400);
  };

  // Save to Document Engine
  const handleSaveDocument = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'INTERNSHIP_LETTER',
          title: `Unpaid HR Internship Offer — ${candidateFullName}`,
          recipientName: candidateFullName,
          recipientEmail: candidateEmail,
          recipientPhone: candidatePhone,
          signatoryName,
          signatoryTitle: signatoryDesignation,
          effectiveDate: startDate,
          validUntil: acceptanceDeadline,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            candidateFullName,
            candidateEmail,
            candidatePhone,
            position,
            internshipDuration,
            startDate,
            endDate,
            workArrangementLocation,
            reportingTo,
            acceptanceDeadline,
            issueDate,
            referenceNumber,
            signatoryName,
            signatoryDesignation,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_int_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'INTERNSHIP_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Unpaid HR Internship Offer — ${candidateFullName}`,
        templateId: 'tmpl_internship_unpaid_hr_tasknera',
        templateVersionId: 'v1.0',
        recipientName: candidateFullName,
        recipientEmail: candidateEmail,
        currentStatus: 'APPROVED',
        currentVersionNumber: 1,
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: false,
        aiConfidenceScore: 1.0,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: {
          candidateFullName,
          candidateEmail,
          candidatePhone,
          position,
          internshipDuration,
          startDate,
          endDate,
          workArrangementLocation,
          reportingTo,
          acceptanceDeadline,
          issueDate,
          signatoryName,
          signatoryDesignation,
        },
        signatoryName,
        signatoryTitle: signatoryDesignation,
        effectiveDate: startDate,
        validUntil: acceptanceDeadline,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any as HrDocument;

      try {
        const storedDocs = JSON.parse(localStorage.getItem('offergen_generated_documents') || '[]');
        storedDocs.unshift(localDoc);
        localStorage.setItem('offergen_generated_documents', JSON.stringify(storedDocs));
      } catch (storeErr) {
        console.warn('Failed to save to local document storage:', storeErr);
      }

      success('Unpaid HR Internship Offer Letter saved to Document Ledger!');
      if (onSuccess) {
        onSuccess(localDoc);
      }
    } catch (err: any) {
      error(`Saved locally (Backend notice: ${err?.message || 'offline mode'})`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyText = () => {
    const plainText = `Date: ${issueDate}
To,
${candidateFullName}
${candidateEmail}

INTERNSHIP OFFER LETTER
Subject: Offer of Unpaid Internship - Human Resources

Dear ${candidateSalutation},

We are pleased to offer you an internship with Tasknera as an HR Intern for a fixed period of three (3) months. The internship is intended to provide practical exposure to human resources operations and help you develop relevant professional skills.

| Position | ${position} |
| Internship Duration | ${internshipDuration} |
| Start Date | ${startDate} |
| End Date | ${endDate} |
| Work Arrangement / Location | ${workArrangementLocation} |
| Reporting To | ${reportingTo} |

1. Role and Responsibilities
You will support the Human Resources function. Your responsibilities may include:
Candidate sourcing, resume screening, shortlisting and recruitment coordination.
Scheduling interviews and communicating with candidates and interviewers.
Supporting candidate documentation, onboarding and maintenance of HR records.
Assisting with employee engagement, HR reports and other assigned HR activities.

2. Internship Terms
The internship will run for the three-month period stated above. You are expected to maintain regular attendance, follow the schedule communicated by your reporting manager, complete assigned tasks responsibly and participate in review discussions.

3. Unpaid Internship
This is an unpaid internship. No salary, stipend or other monetary remuneration will be payable during the internship. Work-related expenses may be reimbursed only if approved by Tasknera in writing in advance and supported by receipts. Any extension or subsequent paid engagement will require a separate written offer or agreement.

4. Professional Conduct and Confidentiality
You must act professionally and follow Tasknera’s workplace instructions and policies. Candidate resumes, contact details, employee records and other non-public business information must be used only for authorised work, kept secure, and not disclosed or transferred to unauthorised persons, accounts or platforms. These confidentiality and information-security obligations continue after the internship ends.

5. Company Information and Completion
Company documents, records, credentials and other materials must be handled responsibly and returned or securely deleted as instructed when the internship ends. A completion certificate may be issued subject to satisfactory completion and handover of assigned work and Company property.

Please sign below and return a copy to ${companyEmail} by ${acceptanceDeadline} to confirm your acceptance. We look forward to welcoming you to Tasknera.

For and on behalf of TASKNERA
______________________________
Ms. Sheetal Bedi
Chief Executive Officer

ACCEPTANCE BY THE INTERN
I, ${candidateFullName}, have read and understood the terms of this offer and accept the unpaid HR internship on the terms stated above.
Signature: __________________________     Date: __________________     Place: __________________`;

    navigator.clipboard.writeText(plainText);
    success('Template text copied to clipboard!');
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
        backdropFilter: 'blur(4px)',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: step === 1 ? '760px' : '960px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Modal Top Header */}
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
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Offer of Unpaid Internship - Human Resources
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  3-Month HR Internship
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Official TaskNera HR Intern Offer with role terms, confidentiality covenants & executive sign-off
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step === 2 && (
              <>
                <Button
                  variant="secondary"
                  icon={<Highlighter size={14} />}
                  onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '6px 12px',
                    backgroundColor: highlightPlaceholders ? '#fef9c3' : '#ffffff',
                    color: highlightPlaceholders ? '#854d0e' : '#475569',
                    borderColor: highlightPlaceholders ? '#facc15' : '#e2e8f0',
                  }}
                >
                  {highlightPlaceholders ? 'Hide Highlights' : 'Highlight Fields'}
                </Button>
                <Button
                  variant="secondary"
                  icon={<Copy size={14} />}
                  onClick={handleCopyText}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Copy Text
                </Button>
                <Button
                  variant="secondary"
                  icon={<Download size={14} />}
                  onClick={handlePrint}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  Print / PDF
                </Button>
                <Button
                  variant="primary"
                  icon={<Save size={14} />}
                  onClick={handleSaveDocument}
                  isLoading={isSaving}
                  style={{ fontSize: '0.8rem', padding: '6px 14px', backgroundColor: '#2563eb' }}
                >
                  Save Letter
                </Button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: 4,
                borderRadius: 6,
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
            backgroundColor: step === 1 ? '#f8fafc' : '#e2e8f0',
          }}
        >
          {/* STEP 1: CONFIGURATION & INTERN DETAILS FORM */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Autofill from Candidate Directory */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '16px 20px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      Quick 1-Click Select Candidate / Intern
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {employees.length} candidates available
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search candidate by name..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 30px',
                        fontSize: '0.8125rem',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <select
                    value={selectedEmployeeId || ''}
                    onChange={(e) => handleSelectEmployee(e.target.value)}
                    style={{
                      flex: 1.5,
                      minWidth: 240,
                      padding: '7px 10px',
                      fontSize: '0.8125rem',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">-- Choose Candidate to Auto-fill --</option>
                    {filteredEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.designation || 'Intern'} — {e.department || 'HR'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Grid */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Letter Date
                  </label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Candidate Full Name [Candidate Full Name]
                  </label>
                  <input
                    type="text"
                    value={candidateFullName}
                    onChange={(e) => {
                      setCandidateFullName(e.target.value);
                      setCandidateSalutation(e.target.value.trim().split(' ')[0] || '');
                    }}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Candidate Email Address [Candidate Email Address]
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Position
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Internship Duration
                  </label>
                  <input
                    type="text"
                    value={internshipDuration}
                    onChange={(e) => setInternshipDuration(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Start Date [Start Date]
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    End Date [End Date]
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Work Arrangement / Location
                  </label>
                  <input
                    type="text"
                    value={workArrangementLocation}
                    onChange={(e) => setWorkArrangementLocation(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Reporting To [Name / Designation]
                  </label>
                  <input
                    type="text"
                    value={reportingTo}
                    onChange={(e) => setReportingTo(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Acceptance Deadline [Acceptance Date]
                  </label>
                  <input
                    type="text"
                    value={acceptanceDeadline}
                    onChange={(e) => setAcceptanceDeadline(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Executive Signatory
                  </label>
                  <input
                    type="text"
                    value={`${signatoryName} — ${signatoryDesignation}`}
                    readOnly
                    style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#64748b' }}
                  />
                </div>
              </div>

              {/* Bottom Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{ padding: '9px 20px', fontSize: '0.875rem', backgroundColor: '#2563eb' }}
                >
                  Generate Official Letter Preview
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: HIGH-FIDELITY OFFICIAL TASKNERA LETTERHEAD PREVIEW */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                id="printable-unpaid-internship-sheet"
                style={{
                  width: '100%',
                  maxWidth: '794px', // Standard A4 width in px
                  minHeight: '1123px', // Standard A4 height in px
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  padding: '48px 56px',
                  boxSizing: 'border-box',
                  color: '#1e293b',
                  fontSize: '10pt',
                  lineHeight: 1.55,
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* TaskNera Official Letterhead Header */}
                  <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera Logo"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                        <div>
                          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            TASKNERA
                          </div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            Workforce & HR Solutions Platform
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                        <div><strong>TaskNera Technologies</strong></div>
                        <div>Dilshad Colony, Shahdara, Delhi 110095</div>
                        <div>Email: {companyEmail} | Web: tasknera.com</div>
                      </div>
                    </div>
                  </div>

                  {/* Date & Recipient Details */}
                  <div style={{ marginBottom: 18 }}>
                    <p style={{ margin: '0 0 10px', fontSize: '9.5pt' }}>
                      <strong>Date:</strong> {renderHighlighted(issueDate)}
                    </p>
                    <p style={{ margin: 0, fontSize: '9.5pt', lineHeight: 1.45 }}>
                      <strong>To,</strong><br />
                      <strong>{renderHighlighted(candidateFullName)}</strong><br />
                      {renderHighlighted(candidateEmail)}
                    </p>
                  </div>

                  {/* Letter Headings */}
                  <div style={{ textAlign: 'center', margin: '22px 0 18px' }}>
                    <h2 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                      INTERNSHIP OFFER LETTER
                    </h2>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                      Subject: Offer of Unpaid Internship - Human Resources
                    </h3>
                  </div>

                  {/* Salutation & Opening Paragraph */}
                  <div style={{ fontSize: '9.5pt', color: '#1e293b', textAlign: 'justify', marginBottom: 14 }}>
                    <p style={{ margin: '0 0 10px' }}>
                      Dear {renderHighlighted(candidateSalutation)},
                    </p>
                    <p style={{ margin: 0 }}>
                      We are pleased to offer you an internship with <strong>{companyName}</strong> as an <strong>{position}</strong> for a fixed period of <strong>{internshipDuration}</strong>. The internship is intended to provide practical exposure to human resources operations and help you develop relevant professional skills.
                    </p>
                  </div>

                  {/* Structured Table */}
                  <table
                    className="terms-table"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      margin: '14px 0 18px',
                      fontSize: '9pt',
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', fontWeight: 700, width: '38%', backgroundColor: '#f8fafc', color: '#0f172a' }}>
                          Position
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', color: '#1e293b' }}>
                          {renderHighlighted(position)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', fontWeight: 700, backgroundColor: '#f8fafc', color: '#0f172a' }}>
                          Internship Duration
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', color: '#1e293b' }}>
                          {renderHighlighted(internshipDuration)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', fontWeight: 700, backgroundColor: '#f8fafc', color: '#0f172a' }}>
                          Start Date
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', color: '#1e293b' }}>
                          {renderHighlighted(startDate)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', fontWeight: 700, backgroundColor: '#f8fafc', color: '#0f172a' }}>
                          End Date
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', color: '#1e293b' }}>
                          {renderHighlighted(endDate)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', fontWeight: 700, backgroundColor: '#f8fafc', color: '#0f172a' }}>
                          Work Arrangement / Location
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', color: '#1e293b' }}>
                          {renderHighlighted(workArrangementLocation)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', fontWeight: 700, backgroundColor: '#f8fafc', color: '#0f172a' }}>
                          Reporting To
                        </td>
                        <td style={{ border: '1px solid #94a3b8', padding: '6px 12px', color: '#1e293b' }}>
                          {renderHighlighted(reportingTo)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Numbered Sections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '9pt', color: '#1e293b', textAlign: 'justify' }}>
                    <div>
                      <strong style={{ color: '#0f172a' }}>1. Role and Responsibilities</strong>
                      <div style={{ marginTop: 2 }}>You will support the Human Resources function. Your responsibilities may include:</div>
                      <ul style={{ margin: '3px 0 0', paddingLeft: 18 }}>
                        <li>Candidate sourcing, resume screening, shortlisting and recruitment coordination.</li>
                        <li>Scheduling interviews and communicating with candidates and interviewers.</li>
                        <li>Supporting candidate documentation, onboarding and maintenance of HR records.</li>
                        <li>Assisting with employee engagement, HR reports and other assigned HR activities.</li>
                      </ul>
                    </div>

                    <div>
                      <strong style={{ color: '#0f172a' }}>2. Internship Terms</strong>
                      <div style={{ marginTop: 2 }}>
                        The internship will run for the three-month period stated above. You are expected to maintain regular attendance, follow the schedule communicated by your reporting manager, complete assigned tasks responsibly and participate in review discussions.
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: '#0f172a' }}>3. Unpaid Internship</strong>
                      <div style={{ marginTop: 2 }}>
                        This is an unpaid internship. No salary, stipend or other monetary remuneration will be payable during the internship. Work-related expenses may be reimbursed only if approved by Tasknera in writing in advance and supported by receipts. Any extension or subsequent paid engagement will require a separate written offer or agreement.
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: '#0f172a' }}>4. Professional Conduct and Confidentiality</strong>
                      <div style={{ marginTop: 2 }}>
                        You must act professionally and follow Tasknera’s workplace instructions and policies. Candidate resumes, contact details, employee records and other non-public business information must be used only for authorised work, kept secure, and not disclosed or transferred to unauthorised persons, accounts or platforms. These confidentiality and information-security obligations continue after the internship ends.
                      </div>
                    </div>

                    <div>
                      <strong style={{ color: '#0f172a' }}>5. Company Information and Completion</strong>
                      <div style={{ marginTop: 2 }}>
                        Company documents, records, credentials and other materials must be handled responsibly and returned or securely deleted as instructed when the internship ends. A completion certificate may be issued subject to satisfactory completion and handover of assigned work and Company property.
                      </div>
                    </div>

                    <div style={{ marginTop: 4 }}>
                      Please sign below and return a copy to <strong>{companyEmail}</strong> by <strong>{renderHighlighted(acceptanceDeadline)}</strong> to confirm your acceptance. We look forward to welcoming you to Tasknera.
                    </div>
                  </div>

                  {/* Sign-off Block with Pre-attached Sheetal Bedi Signature */}
                  <div style={{ marginTop: 18, minWidth: 260 }}>
                    <div style={{ fontSize: '9pt', color: '#0f172a', marginBottom: 4 }}>
                      Yours sincerely,<br />
                      <strong>For and on behalf of TASKNERA</strong>
                    </div>

                    <div style={{ height: 42, display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                      <img
                        src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                        alt="Ms. Sheetal Bedi Signature"
                        style={{ maxHeight: 38, objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ borderBottom: '1px solid #94a3b8', width: 220, marginBottom: 4 }}></div>
                    <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a' }}>
                      {signatoryName}
                    </div>
                    <div style={{ fontSize: '8.5pt', color: '#475569' }}>
                      {signatoryDesignation}
                    </div>
                  </div>
                </div>

                {/* ACCEPTANCE BY THE INTERN BOX (Matching prompt) */}
                <div
                  style={{
                    marginTop: 20,
                    border: '1.5px solid #0f172a',
                    padding: '12px 16px',
                    borderRadius: 4,
                    backgroundColor: '#ffffff',
                    fontSize: '8.5pt',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 4, letterSpacing: '0.04em' }}>
                    ACCEPTANCE BY THE INTERN
                  </div>
                  <div style={{ color: '#1e293b', marginBottom: 12 }}>
                    I, <strong>{renderHighlighted(candidateFullName)}</strong>, have read and understood the terms of this offer and accept the unpaid HR internship on the terms stated above.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#334155' }}>
                    <span>Signature: __________________________</span>
                    <span>Date: __________________</span>
                    <span>Place: __________________</span>
                  </div>
                </div>
              </div>

              {/* Bottom Back Button */}
              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <Button
                  variant="secondary"
                  icon={<ArrowLeft size={16} />}
                  onClick={() => setStep(1)}
                  style={{ padding: '8px 18px', fontSize: '0.8125rem' }}
                >
                  Back to Edit Details
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
