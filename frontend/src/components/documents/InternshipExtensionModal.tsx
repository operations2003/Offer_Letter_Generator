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
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface InternshipExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const InternshipExtensionModal: React.FC<InternshipExtensionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Edit Details, 2 = Official Letter Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee/Intern Selection State
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

  // Reference & Date
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(10 + Math.random() * 90);
    return `TN/HR/INTX/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Intern Details
  const [internFullName, setInternFullName] = useState<string>('Aarav Mehta');
  const [internSalutation, setInternSalutation] = useState<string>('Aarav');
  const [internId, setInternId] = useState<string>('INT-8092');
  const [internshipRole, setInternshipRole] = useState<string>('Software Engineering Intern');
  const [department, setDepartment] = useState<string>('Engineering');
  const [addressOrEmail, setAddressOrEmail] = useState<string>(
    'aarav.mehta@example.com | B-304, Green Meadows, Rohini Sector 13, Delhi – 110085'
  );

  // Dates & Duration
  const [originalCommencedDate, setOriginalCommencedDate] = useState<string>('1 June 2026');
  const [originalConcludeDate, setOriginalConcludeDate] = useState<string>('31 August 2026');
  const [extensionReason, setExtensionReason] = useState<string>(
    'based on your exceptional performance and the ongoing requirements of the team'
  );
  const [extendedStartDate, setExtendedStartDate] = useState<string>('1 September 2026');
  const [extendedEndDate, setExtendedEndDate] = useState<string>('30 November 2026');
  const [extensionDuration, setExtensionDuration] = useState<string>('3 months');

  // Terms Clauses
  const [stipendAmount, setStipendAmount] = useState<string>('₹25,000');
  const [stipendFrequency, setStipendFrequency] = useState<string>('month');
  const [includeStipend, setIncludeStipend] = useState<boolean>(true);
  const [reportingTo, setReportingTo] = useState<string>('Sheetal Bedi / Chief Executive Officer');
  const [responsibilitiesChange, setResponsibilitiesChange] = useState<string>('');

  // Signatory & Location (Ms. Sheetal Bedi, CEO, Delhi)
  const [signatoryName, setSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('Chief Executive Officer (CEO)');
  const [signatoryDate, setSignatoryDate] = useState<string>(() => formatDateString(new Date()));
  const [signatoryPlace, setSignatoryPlace] = useState<string>('Delhi, India');

  // Intern Acknowledgement
  const [ackDate, setAckDate] = useState<string>(() => formatDateString(new Date()));
  const [ackCity, setAckCity] = useState<string>('Delhi');

  // Load employees
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
      console.warn('Could not load employees for internship extension:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    const name = emp.fullName || 'Intern';
    setInternFullName(name);
    setInternSalutation(name.split(' ')[0] || name);
    if (emp.employeeId) setInternId(emp.employeeId);
    if (emp.designation) setInternshipRole(emp.designation);
    if (emp.department) setDepartment(emp.department);
    const email = emp.personalEmail || emp.officialEmail || '';
    const address = (emp as any).address || '';
    setAddressOrEmail([email, address].filter(Boolean).join(' | ') || `${name.toLowerCase().replace(/\s+/g, '')}@tasknera.com`);
  };

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Departments list for filter
  const departments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return ['ALL', ...Array.from(depts)];
  }, [employees]);

  // Filtered list
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

  const handleDownloadPdf = () => {
    const el = document.getElementById('printable-internship-extension-sheet');
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
          <title>Internship_Extension_${internFullName.replace(/\\s+/g, '_')}</title>
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
              page-break-after: avoid;
              box-sizing: border-box;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .company-seal-box {
              border: 1.5px solid #0f172a;
              width: 130px;
              height: 74px;
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
        `${internFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'INTERNSHIP_LETTER',
          title: `Extension of Internship — ${internFullName}`,
          recipientName: internFullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle: signatoryDesignation,
          effectiveDate: extendedStartDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            internFullName,
            internId,
            internshipRole,
            department,
            addressOrEmail,
            originalCommencedDate,
            originalConcludeDate,
            extensionReason,
            extendedStartDate,
            extendedEndDate,
            extensionDuration,
            stipendAmount,
            reportingTo,
            referenceNumber,
            letterDate,
            signatoryName,
            signatoryDesignation,
            signatoryPlace,
            signatoryDate,
            ackDate,
            ackCity,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_intx_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'INTERNSHIP_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Extension of Internship — ${internFullName}`,
        templateId: 'tpl_internship_extension_official',
        templateVersionId: 'v1.0',
        recipientName: internFullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName,
        signatoryTitle: signatoryDesignation,
        effectiveDate: extendedStartDate,
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

      success(`Extension of Internship saved successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save internship extension.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderHighlighted = (value: string, fallback: string = '') => {
    const val = value || fallback;
    if (highlightPlaceholders) {
      return (
        <mark
          style={{
            backgroundColor: '#fef08a',
            color: '#854d0e',
            padding: '1px 4px',
            borderRadius: 3,
            fontWeight: 600,
          }}
        >
          {val}
        </mark>
      );
    }
    return <span>{val}</span>;
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          width: '100%',
          maxWidth: step === 1 ? '960px' : '980px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
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
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Extension of Internship Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  TN/HR/INTX Format
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Step {step} of 2 — {step === 1 ? 'Tenure Extension & Terms Configuration' : 'Official Letter Preview & Print'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                padding: 3,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: step === 1 ? 700 : 500,
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#2563eb' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                1. Edit Details
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: step === 2 ? 700 : 500,
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#2563eb' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                2. Preview Letter
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
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
          }}
        >
          {step === 1 ? (
            /* STEP 1: FORM CONFIGURATION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Intern Selection Section */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#2563eb" />
                    1. Select Intern for Extension
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {employees.length} records in roster
                  </span>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search by intern name, intern ID, or role..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{ paddingLeft: 32, fontSize: '0.8125rem' }}
                    />
                  </div>
                  <select
                    className="form-input"
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    style={{ width: 180, fontSize: '0.8125rem' }}
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d === 'ALL' ? 'All Departments' : d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interns Quick Picker Chips */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 10,
                    maxHeight: 140,
                    overflowY: 'auto',
                    padding: 4,
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
                          border: isSel ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSel ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: isSel ? '#2563eb' : '#e2e8f0',
                            color: isSel ? '#ffffff' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {emp.fullName?.charAt(0) || 'I'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.employeeId || 'INT-ID'} &bull; {emp.designation || 'Intern'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reference & Intern Fields */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GraduationCap size={16} color="#2563eb" />
                  2. Reference &amp; Intern Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
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
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Intern Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={internFullName}
                      onChange={(e) => setInternFullName(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Intern ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={internId}
                      onChange={(e) => setInternId(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Internship Role</label>
                    <input
                      type="text"
                      className="form-input"
                      value={internshipRole}
                      onChange={(e) => setInternshipRole(e.target.value)}
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

                <div style={{ marginTop: 14 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Address / Email Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={addressOrEmail}
                    onChange={(e) => setAddressOrEmail(e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Extension Dates & Terms */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="#2563eb" />
                  3. Extension Period &amp; Applicable Terms
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Original Commenced Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={originalCommencedDate}
                      onChange={(e) => setOriginalCommencedDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Original Due Conclude Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={originalConcludeDate}
                      onChange={(e) => setOriginalConcludeDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Extended Period Start Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extendedStartDate}
                      onChange={(e) => setExtendedStartDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Extended Period End Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={extendedEndDate}
                      onChange={(e) => setExtendedEndDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Further Duration</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 3 months"
                      value={extensionDuration}
                      onChange={(e) => setExtensionDuration(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Reporting Manager (Name / Role)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={reportingTo}
                      onChange={(e) => setReportingTo(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Extension Reason</label>
                  <input
                    type="text"
                    className="form-input"
                    value={extensionReason}
                    onChange={(e) => setExtensionReason(e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>

                {/* Stipend Details */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={includeStipend}
                        onChange={(e) => setIncludeStipend(e.target.checked)}
                      />
                      <span>Include Stipend Term (Clause 1)</span>
                    </label>
                  </div>

                  {includeStipend && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginLeft: 22 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stipend Amount</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. ₹25,000"
                          value={stipendAmount}
                          onChange={(e) => setStipendAmount(e.target.value)}
                          style={{ fontSize: '0.8125rem' }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Stipend Frequency</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="month"
                          value={stipendFrequency}
                          onChange={(e) => setStipendFrequency(e.target.value)}
                          style={{ fontSize: '0.8125rem' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional Changes in Responsibilities */}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Optional: Change in Responsibilities (Clause 2)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Leave blank or specify any new modules / project responsibilities..."
                    value={responsibilitiesChange}
                    onChange={(e) => setResponsibilitiesChange(e.target.value)}
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>
              </div>

              {/* Signatory Details */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  4. Signatory Authority &amp; Intern Acknowledgement
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Authorised Signatory Name</label>
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
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryDate}
                      onChange={(e) => setSignatoryDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Intern Acceptance Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ackDate}
                      onChange={(e) => setAckDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Intern Acceptance City</label>
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
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                  }}
                >
                  Preview Extension Letter
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
                      background: highlightPlaceholders ? '#fef08a' : '#f1f5f9',
                    }}
                  >
                    <Highlighter size={13} />
                    <input
                      type="checkbox"
                      checked={highlightPlaceholders}
                      onChange={(e) => setHighlightPlaceholders(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>Highlight Fields</span>
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button
                    variant="secondary"
                    icon={<Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                  >
                    {isSaving ? 'Saving...' : 'Save Document'}
                  </Button>
                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{
                      padding: '6px 16px',
                      fontSize: '0.8125rem',
                      backgroundColor: '#2563eb',
                      borderColor: '#2563eb',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    Print PDF
                  </Button>
                </div>
              </div>

              {/* Printable Sheet (Single A4 Page matching PDF) */}
              <div
                id="printable-internship-extension-sheet"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  padding: '40px 50px 28px 50px',
                  maxWidth: '820px',
                  margin: '0 auto',
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  color: '#1e293b',
                  fontSize: '9.5pt',
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
                  {/* Official Header */}
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    {/* Official Tasknera Logo Mark */}
                    <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 6 }}>
                      <svg width="42" height="42" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 18C12 15.7909 13.7909 14 16 14H56C58.2091 14 60 15.7909 60 18V24C60 26.2091 58.2091 28 56 28H42V56C42 58.2091 40.2091 60 38 60H30C27.7909 60 26 58.2091 26 56V28H16C13.7909 28 12 26.2091 12 24V18Z"
                          fill="url(#tn_grad_intx)"
                        />
                        <path
                          d="M26 28L46 48M46 28L26 48"
                          stroke="#ffffff"
                          strokeWidth="4"
                          strokeLinecap="round"
                          opacity="0.3"
                        />
                        <defs>
                          <linearGradient id="tn_grad_intx" x1="12" y1="14" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F97316" />
                            <stop offset="0.5" stopColor="#FB923C" />
                            <stop offset="1" stopColor="#94A3B8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        letterSpacing: '0.35em',
                        color: '#0f172a',
                        textTransform: 'uppercase',
                        marginBottom: 4,
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
                      marginBottom: 16,
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

                  {/* Recipient Block */}
                  <div style={{ fontSize: '9.5pt', lineHeight: 1.4, marginBottom: 16, color: '#0f172a' }}>
                    <div style={{ fontWeight: 700 }}>To,</div>
                    <div style={{ fontWeight: 700 }}>{renderHighlighted(internFullName)}</div>
                    <div>
                      Intern ID: {renderHighlighted(internId)} | {renderHighlighted(internshipRole)}, {renderHighlighted(department)}
                    </div>
                    <div style={{ color: '#475569' }}>
                      {renderHighlighted(addressOrEmail)}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    Subject: Extension of Internship
                  </div>

                  {/* Salutation */}
                  <div style={{ fontSize: '9.5pt', marginBottom: 10, color: '#0f172a' }}>
                    Dear {renderHighlighted(internSalutation || internFullName)},
                  </div>

                  {/* Body Paragraphs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: '9.5pt', color: '#1e293b', textAlign: 'justify' }}>
                    <p style={{ margin: 0 }}>
                      We refer to your internship with Tasknera as {renderHighlighted(internshipRole)} in the {renderHighlighted(department)} team, which commenced on {renderHighlighted(originalCommencedDate)} and was due to conclude on {renderHighlighted(originalConcludeDate)}.
                    </p>

                    <p style={{ margin: 0 }}>
                      We are pleased to inform you that, {renderHighlighted(extensionReason)}, your internship has been extended. The extended internship period will run from {renderHighlighted(extendedStartDate)} to {renderHighlighted(extendedEndDate)} (a further period of {renderHighlighted(extensionDuration)}).
                    </p>

                    <p style={{ margin: 0 }}>
                      The following terms apply to the extended period:
                    </p>

                    {/* Numbered Terms */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                      {includeStipend && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 700, flexShrink: 0 }}>1.</span>
                          <div>
                            <strong>Stipend.</strong> Your stipend for the extended period will be INR {renderHighlighted(stipendAmount)} per {renderHighlighted(stipendFrequency)}, payable as per Company policy, subject to applicable deductions.
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{includeStipend ? '2.' : '1.'}</span>
                        <div>
                          <strong>Role and reporting.</strong> Your role will remain {renderHighlighted(internshipRole)}, reporting to {renderHighlighted(reportingTo)}.
                          {responsibilitiesChange && (
                            <span> Responsibilities: {renderHighlighted(responsibilitiesChange)}.</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{includeStipend ? '3.' : '2.'}</span>
                        <div>
                          <strong>Other terms.</strong> All other terms and conditions of your internship, including your confidentiality and data-protection obligations and Company policies, remain unchanged and continue to apply.
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: 700, flexShrink: 0 }}>{includeStipend ? '4.' : '3.'}</span>
                        <div>
                          <strong>Nature of internship.</strong> This extension is for a fixed period and does not by itself create any right to employment or continued engagement with Tasknera.
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: '4px 0 0 0' }}>
                      We appreciate your contribution so far and look forward to your continued efforts. Please sign and return a copy of this letter to confirm your acceptance.
                    </p>
                  </div>

                  {/* Signatory, Company Seal & Intern Acknowledgement */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginTop: 22 }}>
                    {/* Left: Authorised Signatory */}
                    <div style={{ flex: 1, maxWidth: 250 }}>
                      <div style={{ fontSize: '9pt', color: '#0f172a', marginBottom: 2 }}>
                        Yours sincerely,
                      </div>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                        For and on behalf of TASKNERA
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
                    <div style={{ flex: 1, maxWidth: 260 }}>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        ACKNOWLEDGEMENT OF RECEIPT
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#334155', marginBottom: 12, lineHeight: 1.35 }}>
                        I, {renderHighlighted(internFullName)}, acknowledge receipt of this letter and accept the extension on the terms stated.
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
                        Signature of Intern
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
