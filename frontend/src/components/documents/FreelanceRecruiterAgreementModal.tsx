import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
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
  ChevronDown,
  ChevronUp,
  Scale,
  Highlighter,
  Users,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';
import {
  FreelanceRecruiterAgreementData,
  INITIAL_FREELANCE_RECRUITER_DATA,
  getDeepCloneFreelanceRecruiterData,
} from '../../services/freelanceRecruiterCatalog.js';

interface FreelanceRecruiterAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialFreelancerName?: string;
}

export const FreelanceRecruiterAgreementModal: React.FC<FreelanceRecruiterAgreementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialFreelancerName,
}) => {
  const { success, error, info } = useToast();

  // Navigation steps: 1 = Editor / Customizer, 2 = Official Agreement Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Editor sub-tabs
  const [editorTab, setEditorTab] = useState<'PARTIES' | 'SECTIONS' | 'COMMERCIAL' | 'ANNEXURE_A' | 'SIGNATURES'>('PARTIES');

  // Main agreement state
  const [data, setData] = useState<FreelanceRecruiterAgreementData>(() => {
    const initial = getDeepCloneFreelanceRecruiterData();
    if (initialFreelancerName) {
      initial.freelancer.legalName = initialFreelancerName;
      initial.freelancer.tradeName = initialFreelancerName;
      initial.freelancer.signatoryName = initialFreelancerName;
    }
    return initial;
  });

  // Section search / filter in editor
  const [clauseSearch, setClauseSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sec_1: true,
    sec_2: true,
    sec_5: true,
    sec_6: true,
    sec_11: true,
  });

  // Directory Auto-Fill State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');

  // UI state
  const [highlightPlaceholders, setHighlightPlaceholders] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load employee directory for quick auto-fill
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const list = await EmployeeService.listEmployees();
      setEmployees(list || []);
    } catch (err) {
      console.warn('Could not load candidates for agreement:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as FreelanceRecruiterAgreementData;
      if (emp.fullName) {
        next.freelancer.legalName = emp.fullName;
        next.freelancer.tradeName = emp.fullName;
        next.freelancer.signatoryName = emp.fullName;
      }
      if (emp.personalEmail || emp.officialEmail) {
        next.freelancer.email = emp.personalEmail || emp.officialEmail || next.freelancer.email;
      }
      if (emp.phone) {
        next.freelancer.phone = emp.phone;
      }
      if (emp.workLocation) {
        next.freelancer.place = emp.workLocation;
      }
      if ((emp as any).panNumber) {
        next.freelancer.pan = (emp as any).panNumber;
      }
      return next;
    });
    info(`Populated freelancer details for ${emp.fullName}`);
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

  // Toggle section accordion
  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  // Filtered clauses for editor
  const filteredSections = useMemo(() => {
    if (!clauseSearch.trim()) return data.sections;
    const q = clauseSearch.toLowerCase();
    return data.sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.clauses.some((c) => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q))
    );
  }, [data.sections, clauseSearch]);

  // Download PDF via iframe print
  const handleDownloadPdf = () => {
    const agreementElement = document.getElementById('printable-freelance-recruiter-agreement');
    if (!agreementElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Freelance_Recruiter_Services_Agreement_${data.freelancer.legalName.replace(/\s+/g, '_')}`;

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
              margin: 14mm 16mm 14mm 16mm;
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
              font-size: 9.25pt;
              line-height: 1.5;
            }
            .page-break {
              page-break-after: always;
              break-after: page;
              height: 0;
              margin: 0;
              padding: 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0 14px 0;
            }
            table th {
              background-color: #0f2744 !important;
              color: #ffffff !important;
              font-weight: 700;
              text-align: left;
              padding: 6px 10px;
              font-size: 8.75pt;
              border: 1px solid #0f2744;
            }
            table td {
              padding: 6px 10px;
              border: 1px solid #cbd5e1;
              font-size: 8.75pt;
              vertical-align: top;
            }
            .particulars-table, .particulars-subtable {
              width: 100% !important;
              border-collapse: collapse !important;
              border: 1.5px solid #000000 !important;
              margin: 8px 0 0 0 !important;
            }
            .particulars-table th {
              background-color: #ffffff !important;
              color: #000000 !important;
              border: 1.5px solid #000000 !important;
              padding: 6px 8px !important;
              vertical-align: middle !important;
            }
            .particulars-table td, .particulars-subtable td {
              border: 1.5px solid #000000 !important;
              padding: 7px 8px !important;
              font-size: 8.75pt !important;
              vertical-align: top !important;
            }
            .particulars-badge {
              background-color: #163b65 !important;
              color: #ffffff !important;
              padding: 3px 8px !important;
              font-weight: 700 !important;
              display: inline-block !important;
              font-size: 9pt !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            p {
              margin: 0 0 8px 0;
              line-height: 1.5;
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
          ${agreementElement.outerHTML}
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
      const refNo = `TSK/REC-AGR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'MSA',
          title: `Freelance Recruiter Services Agreement — ${data.freelancer.legalName}`,
          recipientName: data.freelancer.legalName,
          recipientEmail: data.freelancer.email,
          signatoryName: data.company.signatoryName,
          signatoryTitle: data.company.signatoryTitle,
          effectiveDate: data.effectiveDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            ...data,
            referenceNumber: refNo,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_rec_agr_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'MSA',
        referenceNumber: createdDoc?.referenceNumber || refNo,
        title: `Freelance Recruiter Services Agreement — ${data.freelancer.legalName}`,
        templateId: 'tpl_freelance_recruiter_agreement_official',
        templateVersionId: 'v1.0',
        recipientName: data.freelancer.legalName,
        recipientEmail: data.freelancer.email,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName: data.company.signatoryName,
        signatoryTitle: data.company.signatoryTitle,
        effectiveDate: data.effectiveDate,
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

      success(`Freelance Recruiter Services Agreement for ${data.freelancer.legalName} saved successfully!`);

      if (onSuccess) {
        onSuccess(localDoc);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save agreement:', err);
      error('Failed to register the agreement in document records.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1140,
          maxHeight: '95vh',
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
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
              }}
            >
              <Scale size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Freelance Recruiter Services Agreement
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 10,
                    backgroundColor: '#f5f3ff',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                  }}
                >
                  Master 14-Page Engagement
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Complete legal agreement governing independent recruiter sourcing mandates, fixed payouts, attribution, confidentiality, and security undertakings.
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
                  color: step === 1 ? '#2563eb' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                1. Editor & Terms
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
                  color: step === 2 ? '#2563eb' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                2. Official Agreement Preview
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
            /* STEP 1: CONFIGURATION & EDITOR */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Directory Auto-fill Bar */}
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
                    <Users size={16} style={{ color: '#2563eb' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill Freelancer from Directory
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Click an employee or recruiter to pre-fill legal name, PAN, and contact details
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
                      placeholder="Search talent..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{ paddingLeft: 32, fontSize: '0.8125rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '100%' }}>
                    {employees.slice(0, 5).map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => applyEmployee(emp)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: 20,
                          border: selectedEmployeeId === emp.id ? '1px solid #2563eb' : '1px solid #cbd5e1',
                          backgroundColor: selectedEmployeeId === emp.id ? '#eff6ff' : '#ffffff',
                          color: selectedEmployeeId === emp.id ? '#2563eb' : '#334155',
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

              {/* Subtabs Selector */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
                {[
                  { key: 'PARTIES', label: '1. Parties & Details', icon: <Users size={14} /> },
                  { key: 'SECTIONS', label: '2. 17 Legal Clauses', icon: <Scale size={14} /> },
                  { key: 'COMMERCIAL', label: '3. Schedule 1 (Commercial Terms)', icon: <DollarSign size={14} /> },
                  { key: 'ANNEXURE_A', label: '4. Annexure A (Security & Integrity)', icon: <ShieldCheck size={14} /> },
                  { key: 'SIGNATURES', label: '5. Signatures & Witnesses', icon: <CheckCircle2 size={14} /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setEditorTab(tab.key as any)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 16px',
                      borderRadius: 8,
                      fontSize: '0.8125rem',
                      fontWeight: editorTab === tab.key ? 700 : 500,
                      backgroundColor: editorTab === tab.key ? '#2563eb' : '#ffffff',
                      color: editorTab === tab.key ? '#ffffff' : '#475569',
                      border: editorTab === tab.key ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* SUBTAB 1: PARTIES & DETAILS */}
              {editorTab === 'PARTIES' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Effective Date & Metadata */}
                  <div style={{ backgroundColor: '#ffffff', padding: '18px 20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                      Agreement Effective Date
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={data.effectiveDate}
                      onChange={(e) => setData({ ...data, effectiveDate: e.target.value })}
                      placeholder="e.g. 21 October 2026"
                      style={{ maxWidth: 320, fontSize: '0.8125rem' }}
                    />
                  </div>

                  {/* Dual Parties Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
                    {/* The Company (Tasknera) */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Building2 size={18} style={{ color: '#2563eb' }} />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          The Company (Party A)
                        </h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Name / Trade Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.company.legalName}
                            onChange={(e) => setData({ ...data, company: { ...data.company, legalName: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Legal Status</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.company.legalStatus}
                            onChange={(e) => setData({ ...data, company: { ...data.company, legalStatus: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Authorised Signatory</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.company.signatoryName}
                            onChange={(e) => setData({ ...data, company: { ...data.company, signatoryName: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Address</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.company.address}
                            onChange={(e) => setData({ ...data, company: { ...data.company, address: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Email</label>
                            <input
                              type="text"
                              className="form-input"
                              value={data.company.email}
                              onChange={(e) => setData({ ...data, company: { ...data.company, email: e.target.value } })}
                              style={{ width: '100%', fontSize: '0.8125rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>GSTIN</label>
                            <input
                              type="text"
                              className="form-input"
                              value={data.company.gstin}
                              onChange={(e) => setData({ ...data, company: { ...data.company, gstin: e.target.value } })}
                              style={{ width: '100%', fontSize: '0.8125rem' }}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Udyam Registration</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.company.udyam}
                            onChange={(e) => setData({ ...data, company: { ...data.company, udyam: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* The Freelancer (Party B) */}
                    <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <Briefcase size={18} style={{ color: '#059669' }} />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                          The Freelancer (Party B)
                        </h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Full Legal Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.freelancer.legalName}
                            onChange={(e) =>
                              setData({
                                ...data,
                                freelancer: { ...data.freelancer, legalName: e.target.value, signatoryName: e.target.value },
                              })
                            }
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Legal Status</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.freelancer.legalStatus}
                            onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, legalStatus: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Correspondence Address</label>
                          <input
                            type="text"
                            className="form-input"
                            value={data.freelancer.address}
                            onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, address: e.target.value } })}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Email</label>
                            <input
                              type="text"
                              className="form-input"
                              value={data.freelancer.email}
                              onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, email: e.target.value } })}
                              style={{ width: '100%', fontSize: '0.8125rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Phone</label>
                            <input
                              type="text"
                              className="form-input"
                              value={data.freelancer.phone || ''}
                              onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, phone: e.target.value } })}
                              style={{ width: '100%', fontSize: '0.8125rem' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>PAN</label>
                            <input
                              type="text"
                              className="form-input"
                              value={data.freelancer.pan || ''}
                              onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, pan: e.target.value } })}
                              style={{ width: '100%', fontSize: '0.8125rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>GSTIN</label>
                            <input
                              type="text"
                              className="form-input"
                              value={data.freelancer.gstin}
                              onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, gstin: e.target.value } })}
                              style={{ width: '100%', fontSize: '0.8125rem' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: 17 LEGAL CLAUSES */}
              {editorTab === 'SECTIONS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ position: 'relative', width: 320 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search clause by keyword..."
                        value={clauseSearch}
                        onChange={(e) => setClauseSearch(e.target.value)}
                        style={{ paddingLeft: 32, fontSize: '0.8125rem', width: '100%' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Showing {filteredSections.length} of {data.sections.length} core sections
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredSections.map((sec) => {
                      const isExpanded = expandedSections[sec.id] ?? false;
                      return (
                        <div
                          key={sec.id}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            onClick={() => toggleSection(sec.id)}
                            style={{
                              padding: '12px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
                              borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{sec.number}.</span>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{sec.title}</span>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>
                                {sec.clauses.length} clauses
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                          </div>

                          {isExpanded && (
                            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {sec.clauses.map((c, cIdx) => (
                                <div key={c.id} style={{ padding: '10px 12px', background: '#fcfcfc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', marginBottom: 4 }}>
                                    {c.number} {c.title}
                                  </div>
                                  <textarea
                                    rows={3}
                                    className="form-input"
                                    value={c.content}
                                    onChange={(e) => {
                                      const newSections = [...data.sections];
                                      const targetSec = newSections.find((s) => s.id === sec.id);
                                      if (targetSec) {
                                        targetSec.clauses[cIdx].content = e.target.value;
                                        setData({ ...data, sections: newSections });
                                      }
                                    }}
                                    style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: SCHEDULE 1 (COMMERCIAL TERMS) */}
              {editorTab === 'COMMERCIAL' && (
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Schedule 1 — Commercial Terms
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {data.commercialTerms.map((row, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a', marginBottom: 6 }}>
                          {row.particulars}
                        </div>
                        <textarea
                          rows={3}
                          className="form-input"
                          value={row.terms}
                          onChange={(e) => {
                            const newTerms = [...data.commercialTerms];
                            newTerms[idx].terms = e.target.value;
                            setData({ ...data, commercialTerms: newTerms });
                          }}
                          style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 4: ANNEXURE A */}
              {editorTab === 'ANNEXURE_A' && (
                <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      Annexure A — Recruitment Integrity and Information Security Undertaking
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Standard candidate privacy, data protection, and anti-fraud undertakings.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {data.annexureAItems.map((item, idx) => (
                      <div key={item.number} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', marginBottom: 4 }}>
                          {item.number}. {item.title}
                        </div>
                        <textarea
                          rows={2}
                          className="form-input"
                          value={item.content}
                          onChange={(e) => {
                            const nextItems = [...data.annexureAItems];
                            nextItems[idx].content = e.target.value;
                            setData({ ...data, annexureAItems: nextItems });
                          }}
                          style={{ width: '100%', fontSize: '0.8125rem', resize: 'vertical' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 5: SIGNATURES & WITNESSES */}
              {editorTab === 'SIGNATURES' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                  {/* Company & Freelancer Execution */}
                  <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      18. Execution Signatures
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Company Signatory</label>
                        <input
                          type="text"
                          className="form-input"
                          value={data.company.signatoryName}
                          onChange={(e) => setData({ ...data, company: { ...data.company, signatoryName: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Company Place</label>
                        <input
                          type="text"
                          className="form-input"
                          value={data.company.place || 'Delhi, India'}
                          onChange={(e) => setData({ ...data, company: { ...data.company, place: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Freelancer Signatory</label>
                        <input
                          type="text"
                          className="form-input"
                          value={data.freelancer.signatoryName}
                          onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, signatoryName: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Freelancer City</label>
                        <input
                          type="text"
                          className="form-input"
                          value={data.freelancer.place || 'City'}
                          onChange={(e) => setData({ ...data, freelancer: { ...data.freelancer, place: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Witnesses */}
                  <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      Witness Details
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#2563eb', marginBottom: 4 }}>Witness 1</div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Witness 1 Name"
                          value={data.witness1.name}
                          onChange={(e) => setData({ ...data, witness1: { ...data.witness1, name: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem', marginBottom: 6 }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Witness 1 Address"
                          value={data.witness1.address}
                          onChange={(e) => setData({ ...data, witness1: { ...data.witness1, address: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#2563eb', marginBottom: 4 }}>Witness 2</div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Witness 2 Name"
                          value={data.witness2.name}
                          onChange={(e) => setData({ ...data, witness2: { ...data.witness2, name: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem', marginBottom: 6 }}
                        />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Witness 2 Address"
                          value={data.witness2.address}
                          onChange={(e) => setData({ ...data, witness2: { ...data.witness2, address: e.target.value } })}
                          style={{ width: '100%', fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Proceed Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                  }}
                >
                  Proceed to Official Agreement Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL AGREEMENT PREVIEW */
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
                    Edit Terms
                  </Button>

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
                    style={{ fontSize: '0.8125rem', background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#059669', borderColor: '#059669' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents Generated'}
                  </Button>
                </div>
              </div>

              {/* PRINTABLE AGREEMENT CONTAINER */}
              <div
                id="printable-freelance-recruiter-agreement"
                style={{
                  maxWidth: 820,
                  margin: '0 auto',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  padding: '48px 56px',
                  borderRadius: 6,
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontSize: '9.25pt',
                  lineHeight: 1.5,
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* PAGE 1: COVER HEADER */}
                <div style={{ textAlign: 'center', paddingBottom: 40, borderBottom: '1px solid #e2e8f0', marginBottom: 28 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 12, backgroundColor: '#ffedd5', marginBottom: 12 }}>
                    <img src="/logo.png" alt="Tasknera" style={{ width: 52, height: 52, objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.75rem', letterSpacing: '0.12em', color: '#0f172a' }}>TASKNERA</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.08em', fontWeight: 600, marginTop: 4 }}>
                    GLOBAL HR SOLUTIONS &nbsp;|&nbsp; RECRUITMENT &nbsp;|&nbsp; WORKFORCE SUPPORT
                  </div>

                  <div style={{ marginTop: 36, marginBottom: 8 }}>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f2744', letterSpacing: '0.04em', margin: 0 }}>
                      FREELANCE RECRUITER SERVICES AGREEMENT
                    </h1>
                    <div style={{ fontSize: '1rem', fontStyle: 'italic', color: '#475569', marginTop: 4 }}>
                      Independent Contractor Engagement
                    </div>
                  </div>

                  <div style={{ marginTop: 32, fontSize: '9.5pt', color: '#475569' }}>
                    <div style={{ letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>BETWEEN</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>TASKNERA</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>(the Company)</div>
                    <div style={{ letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', margin: '14px 0 6px 0' }}>AND</div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
                      {highlightPlaceholders ? <mark>{data.freelancer.legalName}</mark> : data.freelancer.legalName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>(the Freelancer)</div>
                  </div>

                  <div style={{ marginTop: 28, fontWeight: 700, color: '#0f172a', fontSize: '9.5pt' }}>
                    Effective Date: {highlightPlaceholders ? <mark>{data.effectiveDate}</mark> : data.effectiveDate}
                  </div>
                </div>

                {/* PREAMBLE & PARTICULARS TABLE */}
                <div style={{ marginBottom: 24 }}>
                  <p>
                    (A) <strong>TASKNERA</strong>, a sole proprietorship carried on by Ms. Sheetal Bedi, having its place of business at D-57, Dilshad Colony, Delhi – 110095, India, GSTIN 07GAAPB5906A1ZD, Udyam Registration No. UDYAM-DL-07-0024711 (the “Company”); and
                  </p>
                  <p>
                    (B) the individual or business whose details are set out below (the “Freelancer”).
                  </p>
                  <p>The Company and the Freelancer are each a “Party” and together the “Parties”.</p>

                  <div style={{ fontWeight: 700, fontSize: '11pt', color: '#163b65', margin: '18px 0 8px 0' }}>
                    Particulars of the Parties
                  </div>

                  {/* TABLE 1: MAIN PARTICULARS (3 COLUMNS) */}
                  <table
                    className="particulars-table"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1.5px solid #000000',
                      fontSize: '8.75pt',
                      backgroundColor: '#ffffff',
                      marginBottom: 0,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            border: '1.5px solid #000000',
                            padding: '6px 8px',
                            textAlign: 'left',
                            width: '24%',
                            backgroundColor: '#ffffff',
                            verticalAlign: 'middle',
                          }}
                        >
                          <span
                            className="particulars-badge"
                            style={{
                              backgroundColor: '#163b65',
                              color: '#ffffff',
                              padding: '3px 8px',
                              fontWeight: 700,
                              display: 'inline-block',
                              fontSize: '9pt',
                            }}
                          >
                            Particulars
                          </span>
                        </th>
                        <th
                          style={{
                            border: '1.5px solid #000000',
                            padding: '6px 8px',
                            textAlign: 'left',
                            width: '34%',
                            backgroundColor: '#ffffff',
                            verticalAlign: 'middle',
                          }}
                        >
                          <span
                            className="particulars-badge"
                            style={{
                              backgroundColor: '#163b65',
                              color: '#ffffff',
                              padding: '3px 8px',
                              fontWeight: 700,
                              display: 'inline-block',
                              fontSize: '9pt',
                            }}
                          >
                            The Company
                          </span>
                        </th>
                        <th
                          style={{
                            border: '1.5px solid #000000',
                            padding: '6px 8px',
                            textAlign: 'left',
                            width: '42%',
                            backgroundColor: '#ffffff',
                            verticalAlign: 'middle',
                          }}
                        >
                          <span
                            className="particulars-badge"
                            style={{
                              backgroundColor: '#163b65',
                              color: '#ffffff',
                              padding: '3px 8px',
                              fontWeight: 700,
                              display: 'inline-block',
                              fontSize: '9pt',
                            }}
                          >
                            The Freelancer
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          Name / trade name
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.tradeName}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.tradeName || data.freelancer.legalName || 'Full legal name / trade name'}</mark>
                          ) : (
                            data.freelancer.tradeName || data.freelancer.legalName || 'Full legal name / trade name'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          Legal status
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.legalStatus}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.legalStatus || 'Individual / Proprietorship / Firm / Company'}</mark>
                          ) : (
                            data.freelancer.legalStatus || 'Individual / Proprietorship / Firm / Company'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          Authorised signatory
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.signatoryName}, {data.company.signatoryTitle}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.signatoryName || 'Name and designation (if not an individual)'}</mark>
                          ) : (
                            data.freelancer.signatoryName || 'Name and designation (if not an individual)'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          Address
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.address}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.address || 'Complete correspondence address'}</mark>
                          ) : (
                            data.freelancer.address || 'Complete correspondence address'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          Email
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.email}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.email || 'Email address'}</mark>
                          ) : (
                            data.freelancer.email || 'Email address'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          GSTIN
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.gstin}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.gstin || 'GSTIN, or “Not registered”'}</mark>
                          ) : (
                            data.freelancer.gstin || 'GSTIN, or “Not registered”'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', fontWeight: 700, color: '#000000' }}>
                          Udyam Registration No.
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#000000' }}>
                          {data.company.udyam}
                        </td>
                        <td style={{ border: '1.5px solid #000000', padding: '7px 8px', color: '#556987' }}>
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.udyam || 'Udyam No., if any'}</mark>
                          ) : (
                            data.freelancer.udyam || 'Udyam No., if any'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* SEPARATOR GAP BETWEEN TABLES */}
                  <div style={{ height: 26 }} />

                  {/* TABLE 2: FREELANCER PHONE & PAN (2 COLUMNS) */}
                  <table
                    className="particulars-subtable"
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      border: '1.5px solid #000000',
                      fontSize: '8.75pt',
                      backgroundColor: '#ffffff',
                      marginBottom: 16,
                    }}
                  >
                    <tbody>
                      <tr>
                        <td
                          style={{
                            border: '1.5px solid #000000',
                            padding: '7px 8px',
                            fontWeight: 700,
                            width: '24%',
                            color: '#000000',
                          }}
                        >
                          Freelancer’s phone
                        </td>
                        <td
                          style={{
                            border: '1.5px solid #000000',
                            padding: '7px 8px',
                            color: '#556987',
                          }}
                        >
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.phone || '8238308758'}</mark>
                          ) : (
                            data.freelancer.phone || '8238308758'
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            border: '1.5px solid #000000',
                            padding: '7px 8px',
                            fontWeight: 700,
                            width: '24%',
                            color: '#000000',
                          }}
                        >
                          Freelancer’s PAN
                        </td>
                        <td
                          style={{
                            border: '1.5px solid #000000',
                            padding: '7px 8px',
                            color: '#556987',
                          }}
                        >
                          {highlightPlaceholders ? (
                            <mark>{data.freelancer.pan || 'DUUPM7403L'}</mark>
                          ) : (
                            data.freelancer.pan || 'DUUPM7403L'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p>This Agreement takes effect on {data.effectiveDate} (the “Effective Date”).</p>
                </div>

                {/* ALL 17 LEGAL SECTIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data.sections.map((sec) => (
                    <div key={sec.id}>
                      <div style={{ fontWeight: 700, fontSize: '9.75pt', color: '#0f172a', marginBottom: 6 }}>
                        {sec.number}. {sec.title}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sec.clauses.map((c) => (
                          <div key={c.id} style={{ textAlign: 'justify' }}>
                            <strong>{c.number} “{c.title}”</strong> {c.content.replace(/^“[^”]+”\s*/, '')}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 18. EXECUTION */}
                <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: 700, fontSize: '9.75pt', color: '#0f172a', marginBottom: 8 }}>
                    18. EXECUTION
                  </div>
                  <p>
                    The Parties have read and understood this Agreement, including Schedule 1 and Annexure A, and agree to be bound by it with effect from the Effective Date.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 18 }}>
                    {/* For Tasknera */}
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 28 }}>
                        For and on behalf of TASKNERA
                      </div>
                      <div style={{ borderTop: '1px solid #94a3b8', width: '80%', marginBottom: 6 }} />
                      <div style={{ fontSize: '8pt', color: '#64748b' }}>Signature of Authorised Signatory</div>
                      <div style={{ color: '#0f172a', marginTop: 4 }}><strong>Name:</strong> {data.company.signatoryName}</div>
                      <div style={{ color: '#475569' }}><strong>Designation:</strong> {data.company.signatoryTitle}</div>
                      <div style={{ color: '#475569' }}><strong>Place:</strong> {data.company.place || 'Delhi, India'}</div>
                      <div style={{ color: '#475569' }}><strong>Date:</strong> {data.effectiveDate}</div>
                    </div>

                    {/* Company Seal Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 140, height: 90, border: '1.5px dashed #94a3b8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '8pt', textAlign: 'center', padding: 8 }}>
                        Company Seal / Stamp
                      </div>
                    </div>
                  </div>

                  {/* Freelancer & Witnesses */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 28, paddingTop: 18, borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 28 }}>The Freelancer</div>
                      <div style={{ borderTop: '1px solid #94a3b8', width: '80%', marginBottom: 6 }} />
                      <div style={{ fontSize: '8pt', color: '#64748b' }}>Signature of Freelancer</div>
                      <div style={{ color: '#0f172a', marginTop: 4 }}><strong>Name:</strong> {data.freelancer.legalName}</div>
                      <div style={{ color: '#475569' }}><strong>Date:</strong> {data.effectiveDate}</div>
                      <div style={{ color: '#475569' }}><strong>Place:</strong> {data.freelancer.place || 'City'}</div>
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>Witnesses</div>
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: '8pt', fontWeight: 700, color: '#2563eb' }}>Witness 1</div>
                        <div style={{ fontSize: '8.5pt', color: '#0f172a' }}><strong>Name:</strong> {data.witness1.name}</div>
                        <div style={{ fontSize: '8pt', color: '#64748b' }}><strong>Address:</strong> {data.witness1.address}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '8pt', fontWeight: 700, color: '#2563eb' }}>Witness 2</div>
                        <div style={{ fontSize: '8.5pt', color: '#0f172a' }}><strong>Name:</strong> {data.witness2.name}</div>
                        <div style={{ fontSize: '8pt', color: '#64748b' }}><strong>Address:</strong> {data.witness2.address}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCHEDULE 1: COMMERCIAL TERMS */}
                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '2px solid #0f2744' }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2744' }}>SCHEDULE 1</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>Commercial Terms</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Freelance Recruiter Services Agreement</div>
                  </div>
                  <p style={{ fontSize: '8.5pt', color: '#475569' }}>
                    These terms apply to all Assignments under this Agreement and may be changed only in accordance with Clauses 5.3 and 17.3.
                  </p>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.75pt', marginTop: 8 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f2744', color: '#ffffff' }}>
                        <th style={{ padding: '6px 10px', width: '28%' }}>Particulars</th>
                        <th style={{ padding: '6px 10px' }}>Terms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.commercialTerms.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{row.particulars}</td>
                          <td style={{ textAlign: 'justify' }}>{row.terms}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ANNEXURE A */}
                <div style={{ marginTop: 32, paddingTop: 20, borderTop: '2px solid #0f2744' }}>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f2744' }}>ANNEXURE A</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>
                      Recruitment Integrity and Information Security Undertaking
                    </div>
                  </div>
                  <p style={{ fontSize: '8.5pt', color: '#475569', marginBottom: 10 }}>
                    The Freelancer undertakes to observe the following safeguards while performing any Assignment:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '8.75pt' }}>
                    {data.annexureAItems.map((item) => (
                      <div key={item.number} style={{ textAlign: 'justify' }}>
                        <strong>{item.number}. {item.title}.</strong> {item.content}
                      </div>
                    ))}
                  </div>

                  {/* Acknowledgment Block */}
                  <div style={{ marginTop: 24, paddingTop: 14, borderTop: '1px solid #e2e8f0', width: 280 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
                      Acknowledged by the Freelancer
                    </div>
                    <div style={{ borderTop: '1px solid #94a3b8', width: '80%', marginBottom: 4 }} />
                    <div style={{ fontSize: '7.5pt', color: '#64748b' }}>Signature of Freelancer</div>
                    <div style={{ color: '#0f172a', fontSize: '8.5pt', marginTop: 2 }}><strong>Name:</strong> {data.freelancer.legalName}</div>
                    <div style={{ color: '#475569', fontSize: '8.5pt' }}><strong>Date:</strong> {data.effectiveDate}</div>
                  </div>
                </div>

                {/* Global Footer */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 12,
                    marginTop: 32,
                    textAlign: 'center',
                    fontSize: '7.5pt',
                    color: '#64748b',
                    lineHeight: 1.4,
                  }}
                >
                  <div>
                    TASKNERA &nbsp;|&nbsp; D-57, Dilshad Colony, Delhi – 110095, India &nbsp;|&nbsp; careers@tasknera.com
                  </div>
                  <div style={{ marginTop: 2, color: '#94a3b8' }}>
                    Confidential &nbsp;|&nbsp; Freelance Recruiter Services Agreement &nbsp;|&nbsp; Master Document
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
