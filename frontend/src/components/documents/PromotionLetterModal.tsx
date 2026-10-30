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
  Award,
  TrendingUp,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface PromotionLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const PromotionLetterModal: React.FC<PromotionLetterModalProps> = ({
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

  // Employee Selection State
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

  // Form Fields State - Reference & Dates
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(10 + Math.random() * 90);
    return `TN/HR/PRO/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Rohan Mehra');
  const [salutationPrefix, setSalutationPrefix] = useState<string>('Dear');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Rohan');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1048');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Plot 18, Block B, Preet Vihar, Delhi – 110092'
  );

  // Promotion Particulars Table Fields
  const [currentDesignation, setCurrentDesignation] = useState<string>('Talent Acquisition Specialist');
  const [newDesignation, setNewDesignation] = useState<string>('Senior Talent Acquisition Lead');
  const [department, setDepartment] = useState<string>('Recruitment & Workforce Support');
  const [reportingTo, setReportingTo] = useState<string>('Sheetal Bedi / Chief Executive Officer');
  const [effectiveDate, setEffectiveDate] = useState<string>(() => formatDateString(new Date()));

  // Revised Compensation Type
  const [compensationOption, setCompensationOption] = useState<'ANNEXED' | 'EXPLICIT'>('EXPLICIT');
  const [explicitGrossMonthly, setExplicitGrossMonthly] = useState<string>('₹85,000');

  // Role & Responsibilities Clause
  const [roleResponsibilitiesDescription, setRoleResponsibilitiesDescription] = useState<string>(
    'leading high-volume tech recruitment pipelines, client stakeholder management, mentoring junior recruiters, and executing quarterly talent acquisition targets'
  );

  // Inner Content Paragraphs (Fully Editable)
  const [customOpeningPara, setCustomOpeningPara] = useState<string>('');
  const [customClause1, setCustomClause1] = useState<string>('');
  const [customClause2, setCustomClause2] = useState<string>('');
  const [customClause3, setCustomClause3] = useState<string>('');
  const [customClosingPara, setCustomClosingPara] = useState<string>('');

  const defaultOpeningPara = `We are pleased to inform you that, in recognition of your performance and contribution to Tasknera, you have been promoted with effect from ${effectiveDate} (the “Effective Date”). The details are as follows:`;
  const defaultClause1 = `Role and responsibilities. Your new role carries the responsibilities of ${roleResponsibilitiesDescription}. Further details will be shared by your reporting manager.`;
  const defaultClause2 = `Compensation. Your revised compensation is stated above and is subject to deductions and withholdings required by applicable law and Company policy.`;
  const defaultClause3 = `Other terms. All other terms and conditions of your employment, as set out in your appointment letter and Company policies, remain unchanged and continue to apply to you in your new role.`;
  const defaultClosingPara = `Congratulations on your promotion. We wish you continued success. Please sign and return a copy of this letter as acknowledgement.`;

  // Signatory & Location (Ms. Sheetal Bedi, CEO, Delhi)
  const [signatoryName, setSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('Chief Executive Officer (CEO)');
  const [signatoryDate, setSignatoryDate] = useState<string>(() => formatDateString(new Date()));
  const [signatoryPlace, setSignatoryPlace] = useState<string>('Delhi, India');

  // Employee Acknowledgement Block
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
      console.warn('Could not load employees for promotion letter:', err);
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
    if (emp.designation) {
      setCurrentDesignation(emp.designation);
      setNewDesignation(`Senior ${emp.designation}`);
    }
    if (emp.department) setDepartment(emp.department);
    if ((emp as any).address) setResidentialAddress((emp as any).address);
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

  // Filtered employees list
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
    const el = document.getElementById('printable-promotion-sheet');
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
          <title>Promotion_Letter_${employeeFullName.replace(/\\s+/g, '_')}</title>
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
            [contenteditable] {
              outline: none !important;
              border: none !important;
              background: transparent !important;
              box-shadow: none !important;
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
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #0f172a;
              padding: 6px 12px;
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
          documentTypeCode: 'INCREMENT_LETTER',
          title: `Promotion Letter — ${employeeFullName}`,
          recipientName: employeeFullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle: signatoryDesignation,
          effectiveDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            employeeFullName,
            employeeId,
            currentDesignation,
            newDesignation,
            department,
            reportingTo,
            effectiveDate,
            compensationOption,
            explicitGrossMonthly,
            roleResponsibilitiesDescription,
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
        id: createdDoc?.id || `doc_pro_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'INCREMENT_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Promotion Letter — ${employeeFullName}`,
        templateId: 'tpl_promotion_letter_official',
        templateVersionId: 'v1.0',
        recipientName: employeeFullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName,
        signatoryTitle: signatoryDesignation,
        effectiveDate,
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

      success(`Promotion Letter saved successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save promotion letter.');
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

  const revisedCompensationDisplay =
    compensationOption === 'ANNEXED'
      ? 'As per the annexed salary structure'
      : `${explicitGrossMonthly} per month, Gross`;

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
              <Award size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Promotion Letter Generator
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
                  TN/HR/PRO Format
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Step {step} of 2 — {step === 1 ? 'Designation & Particulars Configuration' : 'Official Letter Preview & Print'}
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
              {/* Employee Selection Section */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#2563eb" />
                    1. Select Promoted Employee
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
                      placeholder="Search by name, employee ID, or current role..."
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

                {/* Employees Quick Picker Chips */}
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
                          {emp.fullName?.charAt(0) || 'E'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.employeeId || 'No ID'} &bull; {emp.designation || 'Staff'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reference & Employee Fields */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={16} color="#2563eb" />
                  2. Reference &amp; Employee Details
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
                      placeholder="e.g. Rohan or Mr. Mehra"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
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

              {/* Promotion Particulars Table Fields */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Briefcase size={16} color="#2563eb" />
                  3. Promotion Particulars Table Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Current Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={currentDesignation}
                      onChange={(e) => setCurrentDesignation(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>New Designation (Promoted)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Department / Team</label>
                    <input
                      type="text"
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Reporting To (Name / Designation)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={reportingTo}
                      onChange={(e) => setReportingTo(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Effective Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* Revised Compensation Option */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
                    Revised Compensation Format
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: compensationOption === 'EXPLICIT' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: compensationOption === 'EXPLICIT' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="compensationOption"
                        checked={compensationOption === 'EXPLICIT'}
                        onChange={() => setCompensationOption('EXPLICIT')}
                      />
                      <span><strong>Explicit Monthly Amount</strong> — e.g. [INR __ per month, Gross]</span>
                    </label>

                    {compensationOption === 'EXPLICIT' && (
                      <div style={{ marginLeft: 26, maxWidth: 280 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. ₹85,000"
                          value={explicitGrossMonthly}
                          onChange={(e) => setExplicitGrossMonthly(e.target.value)}
                          style={{ fontSize: '0.8125rem' }}
                        />
                      </div>
                    )}

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: compensationOption === 'ANNEXED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: compensationOption === 'ANNEXED' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="compensationOption"
                        checked={compensationOption === 'ANNEXED'}
                        onChange={() => setCompensationOption('ANNEXED')}
                      />
                      <span><strong>Annexed Structure</strong> — "As per the annexed salary structure"</span>
                    </label>
                  </div>
                </div>

                {/* Role & Responsibilities */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                    Clause 1: Key Responsibilities and Targets (Inserted in Clause 1)
                  </label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={roleResponsibilitiesDescription}
                    onChange={(e) => setRoleResponsibilitiesDescription(e.target.value)}
                    style={{ fontSize: '0.8125rem', resize: 'vertical' }}
                    placeholder="Enter brief description of the role, key responsibilities and targets..."
                  />
                </div>
              </div>

              {/* Card 4: Edit Inner Content & Paragraphs */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1.5px solid #3b82f6',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Briefcase size={17} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      4. Edit Letter Inner Content &amp; Paragraphs
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomOpeningPara('');
                      setCustomClause1('');
                      setCustomClause2('');
                      setCustomClause3('');
                      setCustomClosingPara('');
                    }}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    Reset to Default Text
                  </button>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  You can edit the wording of every paragraph here or click any paragraph directly in the preview (Step 2).
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Opening Paragraph (Promotion Confirmation)
                  </label>
                  <textarea
                    rows={2}
                    value={customOpeningPara !== '' ? customOpeningPara : defaultOpeningPara}
                    onChange={(e) => setCustomOpeningPara(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Clause 1: Role and Responsibilities
                  </label>
                  <textarea
                    rows={2}
                    value={customClause1 !== '' ? customClause1 : defaultClause1}
                    onChange={(e) => setCustomClause1(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Clause 2: Compensation Terms
                  </label>
                  <textarea
                    rows={2}
                    value={customClause2 !== '' ? customClause2 : defaultClause2}
                    onChange={(e) => setCustomClause2(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Clause 3: Other Terms
                  </label>
                  <textarea
                    rows={2}
                    value={customClause3 !== '' ? customClause3 : defaultClause3}
                    onChange={(e) => setCustomClause3(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Concluding Paragraph (Congratulations &amp; Acknowledgement)
                  </label>
                  <textarea
                    rows={2}
                    value={customClosingPara !== '' ? customClosingPara : defaultClosingPara}
                    onChange={(e) => setCustomClosingPara(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1', color: '#0f172a', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Signatory & Acknowledgement Details */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  4. Signatory Authority &amp; Acknowledgement
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
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Receipt Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={ackDate}
                      onChange={(e) => setAckDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Acknowledgement City</label>
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
                  Preview Promotion Letter
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

              {/* Printable Promotion Letter Sheet (Single A4 Page matching PDF) */}
              <div id="printable-promotion-sheet"
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
               contentEditable={true} suppressContentEditableWarning={true}>
                <div>
                  {/* Official Header */}
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    {/* Official Tasknera Logo Mark */}
                    <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 6 }}>
                      <svg width="42" height="42" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 18C12 15.7909 13.7909 14 16 14H56C58.2091 14 60 15.7909 60 18V24C60 26.2091 58.2091 28 56 28H42V56C42 58.2091 40.2091 60 38 60H30C27.7909 60 26 58.2091 26 56V28H16C13.7909 28 12 26.2091 12 24V18Z"
                          fill="url(#tn_grad_pro)"
                        />
                        <path
                          d="M26 28L46 48M46 28L26 48"
                          stroke="#ffffff"
                          strokeWidth="4"
                          strokeLinecap="round"
                          opacity="0.3"
                        />
                        <defs>
                          <linearGradient id="tn_grad_pro" x1="12" y1="14" x2="60" y2="60" gradientUnits="userSpaceOnUse">
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
                    <div style={{ fontWeight: 700 }}>{renderHighlighted(employeeFullName)}</div>
                    <div>
                      Employee ID: {renderHighlighted(employeeId)} | {renderHighlighted(currentDesignation)}, {renderHighlighted(department)}
                    </div>
                    <div style={{ color: '#475569' }}>
                      {renderHighlighted(residentialAddress)}
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    Subject: Promotion
                  </div>

                  {/* Salutation */}
                  <div style={{ fontSize: '9.5pt', marginBottom: 10, color: '#0f172a' }}>
                    {salutationPrefix ? `${salutationPrefix} ` : 'Dear '}
                    {renderHighlighted(employeeSalutation || employeeFullName)},
                  </div>

                  {/* Opening Statement */}
                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => setCustomOpeningPara(e.currentTarget.innerText)}
                    title="Click to edit this paragraph directly"
                    style={{
                      margin: '0 0 14px 0',
                      textAlign: 'justify',
                      fontSize: '9.5pt',
                      padding: '2px 4px',
                      borderRadius: 4,
                      outline: 'none',
                      cursor: 'text',
                    }}
                  >
                    {customOpeningPara !== '' ? customOpeningPara : (
                      <>
                        We are pleased to inform you that, in recognition of your performance and contribution to Tasknera, you have been promoted with effect from {renderHighlighted(effectiveDate)} (the &ldquo;<strong>Effective Date</strong>&rdquo;). The details are as follows:
                      </>
                    )}
                  </p>

                  {/* Particulars Table matching PDF */}
                  <div style={{ marginBottom: 16 }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        border: '1.5px solid #1e3a8a',
                        fontSize: '9pt',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a8a', color: '#ffffff' }}>
                          <th style={{ width: '38%', padding: '7px 12px', textAlign: 'left', fontWeight: 700, border: '1px solid #1e3a8a' }}>
                            Particulars
                          </th>
                          <th style={{ width: '62%', padding: '7px 12px', textAlign: 'left', fontWeight: 700, border: '1px solid #1e3a8a' }}>
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ backgroundColor: '#ffffff' }}>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            Current designation
                          </td>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                            {renderHighlighted(currentDesignation)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            New designation
                          </td>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#1d4ed8' }}>
                            {renderHighlighted(newDesignation)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#ffffff' }}>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            Department / Team
                          </td>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                            {renderHighlighted(department)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            Reporting to
                          </td>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                            {renderHighlighted(reportingTo)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#ffffff' }}>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            Effective date
                          </td>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                            {renderHighlighted(effectiveDate)}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            Revised compensation
                          </td>
                          <td style={{ padding: '6px 12px', border: '1px solid #cbd5e1', fontWeight: 600, color: '#0f172a' }}>
                            {renderHighlighted(revisedCompensationDisplay)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Numbered Clauses matching PDF */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: '9pt', color: '#1e293b', textAlign: 'justify' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>1.</span>
                      <div
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setCustomClause1(e.currentTarget.innerText)}
                        title="Click to edit this clause directly"
                        style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}
                      >
                        {customClause1 !== '' ? customClause1 : (
                          <>
                            <strong>Role and responsibilities.</strong> Your new role carries the responsibilities of {renderHighlighted(roleResponsibilitiesDescription)}. Further details will be shared by your reporting manager.
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>2.</span>
                      <div
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setCustomClause2(e.currentTarget.innerText)}
                        title="Click to edit this clause directly"
                        style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}
                      >
                        {customClause2 !== '' ? customClause2 : (
                          <>
                            <strong>Compensation.</strong> Your revised compensation is stated above and is subject to deductions and withholdings required by applicable law and Company policy.
                          </>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>3.</span>
                      <div
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => setCustomClause3(e.currentTarget.innerText)}
                        title="Click to edit this clause directly"
                        style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text', flex: 1 }}
                      >
                        {customClause3 !== '' ? customClause3 : (
                          <>
                            <strong>Other terms.</strong> All other terms and conditions of your employment, as set out in your appointment letter and Company policies, remain unchanged and continue to apply to you in your new role.
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <p
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => setCustomClosingPara(e.currentTarget.innerText)}
                    title="Click to edit this paragraph directly"
                    style={{
                      margin: '12px 0 16px 0',
                      fontSize: '9pt',
                      textAlign: 'justify',
                      padding: '2px 4px',
                      borderRadius: 4,
                      outline: 'none',
                      cursor: 'text',
                    }}
                  >
                    {customClosingPara !== '' ? customClosingPara : (
                      <>
                        Congratulations on your promotion. We wish you continued success. Please sign and return a copy of this letter as acknowledgement.
                      </>
                    )}
                  </p>

                  {/* Signatory & Employee Acknowledgement */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    {/* Left: Authorised Signatory */}
                    <div style={{ flex: 1, maxWidth: 250 }}>
                      <div style={{ fontSize: '9pt', color: '#0f172a', marginBottom: 2 }}>
                        Yours sincerely,
                      </div>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                        For and on behalf of TASKNERA
                      </div>
                      <div style={{ height: 42, display: 'flex', alignItems: 'center', marginBottom: 2 }}>
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

                    {/* Right: Acknowledgement of Receipt */}
                    <div style={{ flex: 1, maxWidth: 260 }}>
                      <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                        ACKNOWLEDGEMENT OF RECEIPT
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#334155', marginBottom: 12, lineHeight: 1.35 }}>
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
