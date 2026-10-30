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
  Percent,
  Clock,
  MapPin,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Award,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface FreelancerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const FreelancerOnboardingModal: React.FC<FreelancerOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error, info } = useToast();

  // Navigation steps: 1 = Details & Freelancer Terms, 2 = Official 2-Page Letter Preview
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

  // Form Fields - Basic Reference & Dates
  const [letterDate, setLetterDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TSK/ONB/${yyyy}/${rand}`;
  });

  // Freelancer Personal Details
  const [freelancerName, setFreelancerName] = useState<string>('Aarav Mehta');
  const [salutationName, setSalutationName] = useState<string>('Aarav');
  const [address, setAddress] = useState<string>('Flat 402, Sunshine Heights, Malad West, Mumbai – 400064, Maharashtra');
  const [email, setEmail] = useState<string>('aarav.mehta@freelancegrowth.com');
  const [mobile, setMobile] = useState<string>('+91 98765 43210');

  // Engagement Terms (Table: Engagement at a glance)
  const [role, setRole] = useState<string>('Strategic Growth Manager');
  const [engagementType, setEngagementType] = useState<string>(
    'Independent contractor (freelance). This is not an employment relationship.'
  );
  const [startDate, setStartDate] = useState<string>('01 November 2026');
  const [pointOfContact, setPointOfContact] = useState<string>(
    'Sheetal Bedi, Chief Executive Officer, careers@tasknera.com'
  );
  const [territoryFocus, setTerritoryFocus] = useState<string>(
    'Enterprise Recruitment, GCC Expansion & Strategic Talent Partnerships'
  );
  const [governingAgreementDate, setGoverningAgreementDate] = useState<string>('October 26, 2026');

  // Revenue-Based Compensation
  const [revenueSharePercent, setRevenueSharePercent] = useState<string>('15');
  const [paymentTimeline, setPaymentTimeline] = useState<string>(
    'Within fourteen (14) calendar days after Tasknera receives the corresponding payment, subject to a valid invoice or payment request (where required), your bank details and tax documents.'
  );
  const [durationOfShare, setDurationOfShare] = useState<string>(
    'recurring revenue for 12 months from the Growth Outcome'
  );
  const [payoutNotes, setPayoutNotes] = useState<string>(
    'This letter records the revenue-based payout expressly agreed in writing for your assignments. Where it differs from the Agreement on how payout is calculated, this letter applies to that extent; every other term of the Agreement continues to apply.'
  );

  // Signatory (Tasknera)
  const [taskneraSignatoryName, setTaskneraSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [taskneraSignatoryTitle, setTaskneraSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [taskneraSignatoryPlace, setTaskneraSignatoryPlace] = useState<string>('Delhi, India');

  // Acceptance (Freelancer)
  const [acceptanceDate, setAcceptanceDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });
  const [acceptanceCity, setAcceptanceCity] = useState<string>('Mumbai');

  // Load employee directory for quick auto-fill
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
      }
    } catch (err) {
      console.warn('Could not load candidates for freelancer letter:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    if (emp.fullName) {
      setFreelancerName(emp.fullName);
      const firstName = emp.fullName.trim().split(' ')[0] || emp.fullName;
      setSalutationName(firstName);
    }
    if (emp.officialEmail || emp.personalEmail) {
      setEmail(emp.personalEmail || emp.officialEmail || '');
    }
    if (emp.phone) {
      setMobile(emp.phone);
    }
    if (emp.department) {
      setTerritoryFocus(`${emp.department} Partnerships & Client Growth`);
    }
    if (emp.workLocation) {
      setAcceptanceCity(emp.workLocation);
    }
  };

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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to top on step change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchDept = selectedDeptFilter === 'ALL' || emp.department === selectedDeptFilter;
      const q = employeeSearch.toLowerCase();
      const matchSearch =
        !q ||
        emp.fullName?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.officialEmail?.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [employees, selectedDeptFilter, employeeSearch]);

  // Download PDF through seamless hidden iframe
  const handleDownloadPdf = () => {
    const letterElement = document.getElementById('printable-freelancer-letter');
    if (!letterElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Freelancer_Onboarding_Letter_${freelancerName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
              margin: 12mm 15mm 12mm 15mm;
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
            .onboarding-page {
              width: 100%;
              min-height: 270mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0 14px 0;
            }
            table th {
              background-color: #0f2744 !important;
              color: #ffffff !important;
              font-weight: 600;
              text-align: left;
              padding: 7px 12px;
              font-size: 9.25pt;
              border: 1px solid #0f2744;
            }
            table td {
              padding: 7px 12px;
              border: 1px solid #d1d5db;
              font-size: 9.25pt;
              vertical-align: top;
            }
            table td.bold-col {
              font-weight: 600;
              color: #0f172a;
              width: 28%;
            }
            p {
              margin: 0 0 8px 0;
              line-height: 1.5;
            }
            ol {
              margin: 4px 0 10px 0;
              padding-left: 20px;
            }
            ol li {
              margin-bottom: 6px;
              line-height: 1.45;
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
          documentTypeCode: 'CONTRACT_LETTER',
          title: `Freelancer Onboarding Letter (${role}) — ${freelancerName}`,
          recipientName: freelancerName,
          recipientEmail: email,
          signatoryName: taskneraSignatoryName,
          signatoryTitle: taskneraSignatoryTitle,
          effectiveDate: startDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber,
            letterDate,
            freelancerName,
            address,
            email,
            mobile,
            role,
            engagementType,
            startDate,
            pointOfContact,
            territoryFocus,
            governingAgreementDate,
            revenueSharePercent,
            durationOfShare,
            paymentTimeline,
            taskneraSignatoryName,
            taskneraSignatoryTitle,
            taskneraSignatoryPlace,
            acceptanceCity,
            acceptanceDate,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_fl_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'CONTRACT_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Freelancer Onboarding Letter (${role}) — ${freelancerName}`,
        templateId: 'tpl_freelancer_onboarding_official',
        templateVersionId: 'v1.0',
        recipientName: freelancerName,
        recipientEmail: email,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName: taskneraSignatoryName,
        signatoryTitle: taskneraSignatoryTitle,
        effectiveDate: startDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any as HrDocument;

      try {
        const stored = localStorage.getItem('tasknera_mock_hr_documents');
        const existingDocs: HrDocument[] = stored ? JSON.parse(stored) : [];
        const updatedDocs = [localDoc, ...existingDocs.filter((d) => d.id !== localDoc.id)];
        localStorage.setItem('tasknera_mock_hr_documents', JSON.stringify(updatedDocs));
      } catch (storageErr) {
        console.warn('LocalStorage save failed:', storageErr);
      }

      success(`Freelancer Onboarding Letter for ${freelancerName} generated and recorded successfully!`);

      if (onSuccess) {
        onSuccess(localDoc);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save document:', err);
      error('Failed to register the generated letter in document records.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          maxHeight: '94vh',
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
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
                border: '1px solid #a7f3d0',
                color: '#059669',
              }}
            >
              <FileCheck2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Freelancer Onboarding Letter Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                  }}
                >
                  Revenue-Based Engagement
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Generate official 2-page Tasknera Freelance Strategic Growth Manager onboarding letter with revenue share
                terms and dual signatures.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step navigation tabs */}
            <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#059669' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                1. Freelancer & Terms Details
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#059669' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                2. Official 2-Page Letter Preview
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#f8fafc',
          }}
        >
          {step === 1 ? (
            /* STEP 1: FORM CONFIGURATION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Quick Preset / Employee Auto-fill Pill Header */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: '#059669' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill from Talent Directory (Optional)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Select an employee or candidate to populate personal details
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
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
                      className="form-input"
                      placeholder="Search talent by name, ID or email..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{ paddingLeft: 32, fontSize: '0.8125rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '100%', paddingBottom: 2 }}>
                    {filteredEmployees.slice(0, 5).map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => applyEmployee(emp)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: 20,
                          border: selectedEmployeeId === emp.id ? '1px solid #059669' : '1px solid #cbd5e1',
                          backgroundColor: selectedEmployeeId === emp.id ? '#ecfdf5' : '#ffffff',
                          color: selectedEmployeeId === emp.id ? '#059669' : '#334155',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {emp.fullName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. Letter Metadata & Dates */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Calendar size={18} style={{ color: '#0284c7' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    1. Letter Details & Reference
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Date of Letter
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      placeholder="e.g. October 26, 2026"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Reference Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g. TSK/ONB/2026/001"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Role Title
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Strategic Growth Manager"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Freelancer Personal & Contact Info */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <User size={18} style={{ color: '#059669' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    2. Freelancer Personal & Contact Information
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Freelancer Full Legal Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={freelancerName}
                      onChange={(e) => {
                        setFreelancerName(e.target.value);
                        if (!salutationName || salutationName === freelancerName.split(' ')[0]) {
                          setSalutationName(e.target.value.split(' ')[0]);
                        }
                      }}
                      placeholder="e.g. Aarav Mehta"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Greeting / Salutation Name (Dear [Name])
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={salutationName}
                      onChange={(e) => setSalutationName(e.target.value)}
                      placeholder="e.g. Aarav"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav.mehta@example.com"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Mobile / Telephone
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Correspondence Address
                  </label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Sunshine Heights, Malad West, Mumbai – 400064, Maharashtra"
                    style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* 3. Engagement at a Glance Terms */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Briefcase size={18} style={{ color: '#7c3aed' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    3. Engagement Terms Table (Key Parameters)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Start Date
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="e.g. 01 November 2026"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Point of Contact
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={pointOfContact}
                      onChange={(e) => setPointOfContact(e.target.value)}
                      placeholder="e.g. Sheetal Bedi, CEO, careers@tasknera.com"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Governing Agreement Date
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={governingAgreementDate}
                      onChange={(e) => setGoverningAgreementDate(e.target.value)}
                      placeholder="e.g. October 26, 2026"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Territory / Focus (Markets, partnerships, accounts or growth initiative)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={territoryFocus}
                    onChange={(e) => setTerritoryFocus(e.target.value)}
                    placeholder="e.g. Enterprise Recruitment, GCC Expansion & Strategic Talent Partnerships"
                    style={{ width: '100%', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* 4. Revenue-Based Compensation Terms */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <DollarSign size={18} style={{ color: '#16a34a' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    4. Revenue-Based Compensation Structure
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Revenue Share Percentage (%)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={revenueSharePercent}
                        onChange={(e) => setRevenueSharePercent(e.target.value)}
                        placeholder="e.g. 15"
                        style={{ width: '100%', fontSize: '0.8125rem', paddingRight: 30 }}
                      />
                      <Percent
                        size={14}
                        style={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Duration of Share
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={durationOfShare}
                      onChange={(e) => setDurationOfShare(e.target.value)}
                      placeholder="e.g. recurring revenue for 12 months"
                      style={{ width: '100%', fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    Payment Timeline & Terms (Clause 4)
                  </label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={paymentTimeline}
                    onChange={(e) => setPaymentTimeline(e.target.value)}
                    style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* 5. Signatures & Acceptance Block */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '20px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ShieldCheck size={18} style={{ color: '#ea580c' }} />
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    5. Signatories & Formal Acceptance
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Tasknera Column */}
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                      For and on behalf of TASKNERA
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
                          Authorised Signatory
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={taskneraSignatoryName}
                          onChange={(e) => setTaskneraSignatoryName(e.target.value)}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
                          Designation
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={taskneraSignatoryTitle}
                          onChange={(e) => setTaskneraSignatoryTitle(e.target.value)}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
                          Place
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={taskneraSignatoryPlace}
                          onChange={(e) => setTaskneraSignatoryPlace(e.target.value)}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Freelancer Column */}
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                      Accepted by the Freelancer
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
                          Freelancer Name
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={freelancerName}
                          onChange={(e) => setFreelancerName(e.target.value)}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
                          Date of Acceptance
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={acceptanceDate}
                          onChange={(e) => setAcceptanceDate(e.target.value)}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>
                          City / Place
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={acceptanceCity}
                          onChange={(e) => setAcceptanceCity(e.target.value)}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Proceed Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                  }}
                >
                  Proceed to Official 2-Page Letter Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL 2-PAGE LETTER PREVIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Action Toolbar */}
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(1)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Edit Details
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
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: highlightPlaceholders ? '1px solid #eab308' : '1px solid #cbd5e1',
                      background: highlightPlaceholders ? '#fef9c3' : '#ffffff',
                      color: highlightPlaceholders ? '#854d0e' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <Highlighter size={14} />
                    <span>{highlightPlaceholders ? 'Yellow Highlights: ON' : 'Yellow Highlights: OFF'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem', background: '#059669', borderColor: '#059669' }}
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
                    {isSaving ? 'Saving...' : 'Save to Documents Generated'}
                  </Button>
                </div>
              </div>

              {/* PRINTABLE CONTAINER HOLDING BOTH PAGES */}
              <div id="printable-freelancer-letter"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  maxWidth: 816,
                  margin: '0 auto',
                  width: '100%',
                }}
               contentEditable={true} suppressContentEditableWarning={true}>
                {/* ========================================================================= */}
                {/* PAGE 1: ONBOARDING LETTER                                                */}
                {/* ========================================================================= */}
                <div
                  className="onboarding-page"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    padding: '48px 56px 36px 56px',
                    borderRadius: 6,
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '9.75pt',
                    lineHeight: 1.5,
                    border: '1px solid #e2e8f0',
                    minHeight: 1080,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header: Tasknera Logo & Subtitle */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        paddingBottom: 22,
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          backgroundColor: '#ffedd5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src="/logo.png"
                          alt="Tasknera"
                          style={{ width: 40, height: 40, objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: '1.45rem',
                            color: '#0f172a',
                            letterSpacing: '0.08em',
                            lineHeight: 1.1,
                          }}
                        >
                          TASKNERA
                        </div>
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color: '#94a3b8',
                            letterSpacing: '0.09em',
                            fontWeight: 600,
                            marginTop: 4,
                            textTransform: 'uppercase',
                          }}
                        >
                          GLOBAL HR SOLUTIONS &nbsp;|&nbsp; RECRUITMENT &nbsp;|&nbsp; WORKFORCE SUPPORT
                        </div>
                      </div>
                    </div>

                    {/* Date & Ref */}
                    <div style={{ marginTop: 22, marginBottom: 16 }}>
                      <div style={{ color: '#0f172a', fontSize: '9.5pt' }}>
                        {highlightPlaceholders ? <mark>{letterDate}</mark> : letterDate}
                      </div>
                      <div style={{ color: '#0f172a', fontSize: '9.5pt', marginTop: 3 }}>
                        Ref: {highlightPlaceholders ? <mark>{referenceNumber}</mark> : referenceNumber}
                      </div>
                    </div>

                    {/* Recipient Address Block */}
                    <div style={{ marginBottom: 18, lineHeight: 1.45 }}>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>To,</div>
                      <div style={{ color: '#0f172a', fontWeight: 700 }}>
                        {highlightPlaceholders ? <mark>{freelancerName}</mark> : freelancerName}
                      </div>
                      <div style={{ color: '#475569', whiteSpace: 'pre-line' }}>
                        {highlightPlaceholders ? <mark>{address}</mark> : address}
                      </div>
                      <div style={{ color: '#475569', marginTop: 2 }}>
                        {highlightPlaceholders ? <mark>{email}</mark> : email} &nbsp;|&nbsp;{' '}
                        {highlightPlaceholders ? <mark>{mobile}</mark> : mobile}
                      </div>
                    </div>

                    {/* Subject */}
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: '10pt',
                        marginBottom: 16,
                      }}
                    >
                      Subject: Onboarding as Freelance {role} – Revenue-Based Engagement
                    </div>

                    {/* Dear [Name] */}
                    <div style={{ marginBottom: 12, color: '#0f172a' }}>
                      Dear {highlightPlaceholders ? <mark>{salutationName}</mark> : salutationName},
                    </div>

                    {/* Intro paragraph */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ color: '#334155', textAlign: 'justify', marginBottom: 16, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      Welcome to Tasknera. We are pleased to onboard you as an independent freelancer, and we look
                      forward to working with you. This letter confirms the key terms of your engagement and the steps
                      to get you started.
                    </p>

                    {/* Table: Engagement at a glance */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '10pt', marginBottom: 6 }}>
                        Engagement at a glance
                      </div>

                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '9.25pt',
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: '#0f2744', color: '#ffffff' }}>
                            <th
                              style={{
                                padding: '6px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                width: '28%',
                                border: '1px solid #0f2744',
                              }}
                            >
                              Particulars
                            </th>
                            <th
                              style={{
                                padding: '6px 12px',
                                textAlign: 'left',
                                fontWeight: 700,
                                border: '1px solid #0f2744',
                              }}
                            >
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              Role
                            </td>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1' }}>
                              {highlightPlaceholders ? <mark>{role}</mark> : role}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fcfcfc' }}>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              Engagement type
                            </td>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1' }}>
                              {engagementType}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              Start date
                            </td>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1' }}>
                              {highlightPlaceholders ? <mark>{startDate}</mark> : startDate}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fcfcfc' }}>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              Point of contact
                            </td>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1' }}>
                              {highlightPlaceholders ? <mark>{pointOfContact}</mark> : pointOfContact}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              Territory / focus
                            </td>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1' }}>
                              {highlightPlaceholders ? <mark>{territoryFocus}</mark> : territoryFocus}
                            </td>
                          </tr>
                          <tr style={{ backgroundColor: '#fcfcfc' }}>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700 }}>
                              Governing agreement
                            </td>
                            <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1' }}>
                              Freelance {role} Services Agreement dated{' '}
                              {highlightPlaceholders ? <mark>{governingAgreementDate}</mark> : governingAgreementDate},
                              between Tasknera and the Freelancer (the “Agreement”), including Annexure A.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Revenue-based compensation heading */}
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '10pt', marginBottom: 4 }}>
                      Revenue-based compensation
                    </div>
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ color: '#334155', marginBottom: 10, fontSize: '9.25pt', padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      You will be compensated on a revenue basis, as set out below. You will not receive a salary, retainer
                      or minimum guaranteed earnings.
                    </p>

                    {/* Clauses 1 to 5 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '9.25pt', color: '#1e293b' }}>
                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>1.</span>
                        <div>
                          <strong>Revenue share.</strong> You will earn{' '}
                          {highlightPlaceholders ? <mark>{revenueSharePercent}%</mark> : `${revenueSharePercent}%`}{' '}
                          of Net Revenue received by Tasknera from each Client or partner arrangement that results in a
                          Growth Outcome arising from an Opportunity you introduce or develop under an approved
                          assignment.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>2.</span>
                        <div>
                          <strong>Net Revenue.</strong> “Net Revenue” means the amount actually received by Tasknera in
                          cleared funds from that Client or partner under the Growth Outcome, excluding GST and other
                          indirect taxes, refunds, credits and any third-party costs approved in writing in advance.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>3.</span>
                        <div>
                          <strong>Payment trigger.</strong> Revenue share becomes payable only when the Growth Outcome (for
                          example a new Client contract or a signed partnership) is achieved and verified, and Tasknera has
                          received the corresponding payment in cleared funds, unless your Assignment Confirmation records a
                          different trigger. Where the Client pays in instalments, your share is paid proportionately on
                          each receipt.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>4.</span>
                        <div>
                          <strong>Payment timeline.</strong> {paymentTimeline}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>5.</span>
                        <div>
                          <strong>Duration of share.</strong> Revenue share applies to{' '}
                          {highlightPlaceholders ? <mark>{durationOfShare}</mark> : durationOfShare}.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer on Page 1 */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 12,
                      marginTop: 20,
                      textAlign: 'center',
                      fontSize: '7.5pt',
                      color: '#64748b',
                      lineHeight: 1.4,
                    }}
                  >
                    <div>
                      TASKNERA &nbsp;|&nbsp; D-57, Dilshad Colony, Delhi – 110095, India &nbsp;|&nbsp;{' '}
                      careers@tasknera.com
                    </div>
                    <div style={{ marginTop: 2, color: '#94a3b8' }}>Confidential &nbsp;|&nbsp; Page 1 of 2</div>
                  </div>
                </div>

                {/* Print Page Break Indicator */}
                <div className="page-break" />

                {/* ========================================================================= */}
                {/* PAGE 2: ONBOARDING LETTER (CONTINUATION & SIGNATURES)                    */}
                {/* ========================================================================= */}
                <div
                  className="onboarding-page"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    padding: '48px 56px 36px 56px',
                    borderRadius: 6,
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: '9.75pt',
                    lineHeight: 1.5,
                    border: '1px solid #e2e8f0',
                    minHeight: 1080,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header on Page 2: Small logo + Running title */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: 20,
                        borderBottom: '1px solid #f1f5f9',
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: '#ffedd5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src="/logo.png"
                          alt="Tasknera"
                          style={{ width: 26, height: 26, objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '8.5pt',
                          color: '#64748b',
                          fontStyle: 'italic',
                          fontWeight: 500,
                        }}
                      >
                        {role} Onboarding Letter
                      </div>
                    </div>

                    {/* Clauses 6 & 7 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '9.25pt', color: '#1e293b', marginBottom: 18 }}>
                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>6.</span>
                        <div>
                          <strong>Taxes.</strong> Tax will be deducted at source where the law requires, and a certificate
                          will be issued within the statutory timeline. GST applies only where you are registered and it is
                          legally applicable.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, textAlign: 'justify' }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>7.</span>
                        <div>
                          <strong>Expenses.</strong> You bear your own expenses. Any expense is reimbursed only if Tasknera
                          approved it in writing before it was incurred.
                        </div>
                      </div>
                    </div>

                    {/* Payout reconciliation clause */}
                    <p style={{ color: '#334155', textAlign: 'justify', fontSize: '9.25pt', marginBottom: 18, lineHeight: 1.5 }}>
                      {payoutNotes}
                    </p>

                    {/* Getting Started Section */}
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '10pt', marginBottom: 8 }}>
                      Getting started
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '9.25pt', color: '#1e293b', marginBottom: 18 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>1.</span>
                        <div>Return the signed Agreement and Annexure A (Integrity and Information Security Undertaking).</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>2.</span>
                        <div>Share your PAN, bank account details, and GSTIN if registered, through Tasknera’s secure onboarding process.</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>3.</span>
                        <div>Complete orientation covering our offerings, pricing and packaging, approved tools and data-protection rules.</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontWeight: 700, minWidth: 16 }}>4.</span>
                        <div>Receive CRM access and your first growth brief (market, partnership or initiative) in writing from your point of contact.</div>
                      </div>
                    </div>

                    {/* Closing Instructions & Confidentiality */}
                    <p style={{ color: '#334155', textAlign: 'justify', fontSize: '9.25pt', marginBottom: 28, lineHeight: 1.5 }}>
                      Please keep all Tasknera, Client, partner and Opportunity information confidential, use only approved
                      systems and channels, record every Opportunity in the CRM, and do not agree pricing, partnership terms
                      or other commitments on behalf of Tasknera without written approval. Opportunities you introduce are
                      attributed to you for twelve (12) months, as set out in the Agreement. Please sign and return a copy of
                      this letter within seven (7) days to confirm your acceptance. If you have any questions, write to{' '}
                      <span style={{ color: '#0284c7' }}>careers@tasknera.com</span>.
                    </p>

                    {/* Sign-off Greeting */}
                    <div style={{ color: '#0f172a', fontWeight: 600, marginBottom: 24, fontSize: '9.5pt' }}>
                      Warm regards,
                    </div>

                    {/* Dual Signatures Block */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 32,
                        marginTop: 10,
                        fontSize: '9.25pt',
                      }}
                    >
                      {/* Column 1: For Tasknera */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 36 }}>
                          For and on behalf of TASKNERA
                        </div>

                        <div style={{ borderTop: '1px solid #94a3b8', width: '80%', marginBottom: 6 }} />
                        <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: 6 }}>
                          Signature of Authorised Signatory
                        </div>
                        <div style={{ color: '#0f172a' }}>
                          <strong>Name:</strong> {taskneraSignatoryName}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          <strong>Designation:</strong> {taskneraSignatoryTitle}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          <strong>Place:</strong> {taskneraSignatoryPlace}
                        </div>
                      </div>

                      {/* Column 2: Accepted by the Freelancer */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 36 }}>
                          Accepted by the Freelancer
                        </div>

                        <div style={{ borderTop: '1px solid #94a3b8', width: '80%', marginBottom: 6 }} />
                        <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: 6 }}>
                          Signature of Freelancer
                        </div>
                        <div style={{ color: '#0f172a' }}>
                          <strong>Name:</strong> {highlightPlaceholders ? <mark>{freelancerName}</mark> : freelancerName}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          <strong>Date:</strong> {highlightPlaceholders ? <mark>{acceptanceDate}</mark> : acceptanceDate}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          <strong>Place:</strong> {highlightPlaceholders ? <mark>{acceptanceCity}</mark> : acceptanceCity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer on Page 2 */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 12,
                      marginTop: 20,
                      textAlign: 'center',
                      fontSize: '7.5pt',
                      color: '#64748b',
                      lineHeight: 1.4,
                    }}
                  >
                    <div>
                      TASKNERA &nbsp;|&nbsp; D-57, Dilshad Colony, Delhi – 110095, India &nbsp;|&nbsp;{' '}
                      careers@tasknera.com
                    </div>
                    <div style={{ marginTop: 2, color: '#94a3b8' }}>Confidential &nbsp;|&nbsp; Page 2 of 2</div>
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
