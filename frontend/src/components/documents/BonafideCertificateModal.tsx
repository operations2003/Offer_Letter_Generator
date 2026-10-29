import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  Building2,
  Calendar,
  Briefcase,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface BonafideCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const BonafideCertificateModal: React.FC<BonafideCertificateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Configuration, 2 = Official Certificate Preview
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

  // Form Fields State
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.' | 'Dr.'>('Mr.');
  const [fullName, setFullName] = useState<string>('Arjun Nair');
  const [employeeCode, setEmployeeCode] = useState<string>('TN-1082');
  const [designation, setDesignation] = useState<string>('Lead AI Systems Engineer');
  const [department, setDepartment] = useState<string>('AI Research');
  const [employmentType, setEmploymentType] = useState<string>('Permanent Full-Time');
  const [genderPronoun, setGenderPronoun] = useState<'male' | 'female'>('male');

  // Purpose & Recipient
  const [addressedTo, setAddressedTo] = useState<string>('To Whom It May Concern');
  const [purposeCategory, setPurposeCategory] = useState<string>('Visa & International Travel Application');
  const [customPurposeNote, setCustomPurposeNote] = useState<string>(
    'official verification for travel visa processing and documentation formalities'
  );
  const [includeSalaryDetails, setIncludeSalaryDetails] = useState<boolean>(true);
  const [annualCtc, setAnnualCtc] = useState<string>('INR 18,50,000 per annum');

  // Dates & Reference
  const [joiningDate, setJoiningDate] = useState<string>('January 10, 2024');
  const [issueDate, setIssueDate] = useState<string>(() => {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    return `TASK/${new Date().getFullYear()}/BNF-${Math.floor(100 + Math.random() * 900)}`;
  });
  const [place, setPlace] = useState<string>('Delhi');

  // Signatory
  const [signatoryName, setSignatoryName] = useState<string>('Sheetal Bedi');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Chief Executive Officer');

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
      console.warn('Could not load employees for bonafide certificate:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setFullName(emp.fullName || 'Employee');
    if (emp.employeeId) setEmployeeCode(emp.employeeId);
    if (emp.designation) setDesignation(emp.designation);
    if (emp.department) setDepartment(emp.department);
    if (emp.employmentType) setEmploymentType(emp.employmentType);

    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        setJoiningDate(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      } catch {
        setJoiningDate(emp.joiningDate);
      }
    }

    if (emp.title === 'Ms.' || emp.title === 'Mrs.') {
      setSalutation('Ms.');
      setGenderPronoun('female');
    } else {
      setSalutation('Mr.');
      setGenderPronoun('male');
    }
  };

  const pronounHeShe = genderPronoun === 'female' ? 'she' : 'he';
  const pronounHisHer = genderPronoun === 'female' ? 'her' : 'his';
  const pronounHimHer = genderPronoun === 'female' ? 'her' : 'him';
  const pronounHeSheCap = genderPronoun === 'female' ? 'She' : 'He';
  const pronounHisHerCap = genderPronoun === 'female' ? 'Her' : 'His';

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
        (emp.officialEmail || emp.personalEmail)?.toLowerCase().includes(q) ||
        emp.designation?.toLowerCase().includes(q) ||
        emp.employeeId?.toLowerCase().includes(q);
      return matchDept && matchSearch;
    });
  }, [employees, selectedDeptFilter, employeeSearch]);

  const handleDownloadPdf = () => {
    const certElement = document.getElementById('printable-bonafide-certificate');
    if (!certElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Bonafide_Certificate_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
              margin: 10mm 15mm 10mm 15mm;
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
              font-family: "Times New Roman", Times, Georgia, serif;
              font-size: 10.5pt;
              line-height: 1.55;
            }
            #printable-bonafide-certificate {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            p {
              margin: 0;
              text-align: justify;
              line-height: 1.6;
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
          ${certElement.outerHTML}
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

  const handleSaveToDocumentsGenerated = async () => {
    setIsSaving(true);
    try {
      const selectedEmp = employees.find((e) => e.id === selectedEmployeeId);
      const recipientEmail =
        selectedEmp?.personalEmail ||
        selectedEmp?.officialEmail ||
        `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'CERTIFICATE',
          title: `Bonafide Employment Certificate — ${fullName}`,
          recipientName: fullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle,
          effectiveDate: issueDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            salutation,
            fullName,
            employeeCode,
            designation,
            department,
            employmentType,
            joiningDate,
            purposeCategory,
            addressedTo,
            referenceNumber,
            issueDate,
            place,
            signatoryName,
            signatoryTitle,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_bnf_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'CERTIFICATE',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Bonafide Employment Certificate — ${fullName}`,
        templateId: 'tpl_bonafide_certificate_official',
        templateVersionId: 'v1.0',
        recipientName: fullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName,
        signatoryTitle,
        effectiveDate: issueDate,
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

      success(`Bonafide Employment Certificate saved successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save bonafide certificate.');
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
              <Award size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Bonafide Certificate
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
                  Certificate
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Step {step} of 2 — {step === 1 ? 'Employee & Purpose Details' : 'Preview & Print'}
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
                2. Preview Certificate
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

        {/* Modal Body */}
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
              {/* Employee Selection */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} color="#2563eb" />
                    1. Select Active Employee
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {employees.length} records available
                  </span>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search by name, employee code, or designation..."
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

                {/* Quick Picker Chips */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: 10,
                    maxHeight: 160,
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
                          }}
                        >
                          {emp.fullName?.[0] || 'E'}
                        </div>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {emp.designation || 'Staff'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certificate Parameters */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  2. Bonafide Standing &amp; Purpose Parameters
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Salutation</label>
                    <select
                      className="form-input"
                      value={salutation}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSalutation(val);
                        setGenderPronoun(val === 'Ms.' ? 'female' : 'male');
                      }}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Current Designation</label>
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

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employment Status</label>
                    <input
                      type="text"
                      className="form-input"
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employment Commencement Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Addressed Authority</label>
                    <input
                      type="text"
                      className="form-input"
                      value={addressedTo}
                      onChange={(e) => setAddressedTo(e.target.value)}
                      placeholder="e.g. To Whom It May Concern or The Visa Officer"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* Purpose Selection */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Issuance Purpose Category</label>
                      <select
                        className="form-input"
                        value={purposeCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPurposeCategory(val);
                          if (val === 'Visa & International Travel Application') {
                            setCustomPurposeNote('official verification for international travel visa processing and documentation formalities');
                          } else if (val === 'Bank Loan & Financial Facilities') {
                            setCustomPurposeNote('loan application appraisal and formal employment stability verification');
                          } else if (val === 'Higher Education & Academic Verification') {
                            setCustomPurposeNote('academic enrollment and higher education background verification');
                          } else if (val === 'Residential Lease & Rental Formalities') {
                            setCustomPurposeNote('residential tenancy agreement and employment standing confirmation');
                          } else {
                            setCustomPurposeNote('official employment verification and organizational standing attestation');
                          }
                        }}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        <option value="Visa & International Travel Application">Visa &amp; International Travel Application</option>
                        <option value="Bank Loan & Financial Facilities">Bank Loan &amp; Financial Facilities</option>
                        <option value="Higher Education & Academic Verification">Higher Education &amp; Academic Verification</option>
                        <option value="Residential Lease & Rental Formalities">Residential Lease &amp; Rental Formalities</option>
                        <option value="General Official Verification">General Official Verification</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Specific Purpose Note</label>
                      <input
                        type="text"
                        className="form-input"
                        value={customPurposeNote}
                        onChange={(e) => setCustomPurposeNote(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>

                  {/* Compensation Toggle */}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includeSalaryDetails}
                        onChange={(e) => setIncludeSalaryDetails(e.target.checked)}
                      />
                      <span>Include Annual Compensation Verification Clause</span>
                    </label>

                    {includeSalaryDetails && (
                      <input
                        type="text"
                        className="form-input"
                        value={annualCtc}
                        onChange={(e) => setAnnualCtc(e.target.value)}
                        placeholder="e.g. INR 18,50,000 per annum"
                        style={{ width: 260, fontSize: '0.8125rem' }}
                      />
                    )}
                  </div>
                </div>

                {/* Signatory & Issuance */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Authorized Signatory</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryTitle}
                      onChange={(e) => setSignatoryTitle(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Issue Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Reference Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Proceed to Preview */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{ padding: '10px 24px', fontSize: '0.875rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                >
                  Preview Bonafide Certificate
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
                    style={{ padding: '6px 16px', fontSize: '0.8125rem', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                  >
                    Print PDF
                  </Button>
                </div>
              </div>

              {/* Printable Bonafide Certificate Sheet */}
              <div
                id="printable-bonafide-certificate"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  padding: '50px 60px',
                  maxWidth: '820px',
                  margin: '0 auto',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  color: '#1e293b',
                  fontSize: '11pt',
                  lineHeight: 1.6,
                  border: '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
              >
                {/* Header with Logo & Reference */}
                <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img
                      src="/logo.png"
                      alt="TaskNera Logo"
                      style={{ width: 44, height: 44, objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Arial, sans-serif' }}>
                        TaskNera HR Solutions Private Limited
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'Arial, sans-serif', marginTop: 2 }}>
                        Corporate Identity No (CIN): U74999DL2024PTC123456 | ISO 9001:2015 Certified
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'Arial, sans-serif' }}>
                        Regd. Office: Level 7, DLF Cyber City, Sector 24, Gurugram, Delhi-NCR, India
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reference Number & Issue Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26, fontSize: '10pt', fontFamily: 'Arial, sans-serif' }}>
                  <div>
                    <strong>Ref No:</strong> {renderHighlighted(referenceNumber)}
                  </div>
                  <div>
                    <strong>Date:</strong> {renderHighlighted(issueDate)}
                  </div>
                </div>

                {/* Certificate Title */}
                <div style={{ textAlign: 'center', margin: '16px 0 28px' }}>
                  <div
                    style={{
                      display: 'inline-block',
                      borderBottom: '2px solid #2563eb',
                      paddingBottom: 4,
                      fontSize: '14pt',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#0f172a',
                    }}
                  >
                    BONAFIDE EMPLOYMENT CERTIFICATE
                  </div>
                </div>

                {/* Certificate Salutation & Narrative */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'justify' }}>
                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    <strong>{renderHighlighted(addressedTo)},</strong>
                  </p>

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    This is to certify that{' '}
                    <strong>
                      {renderHighlighted(salutation)} {renderHighlighted(fullName)}
                    </strong>{' '}
                    (Employee ID: <strong>{renderHighlighted(employeeCode)}</strong>) is a bonafide, active employee of{' '}
                    <strong>TaskNera HR Solutions Private Limited</strong>.
                  </p>

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    {pronounHeSheCap} joined our organization on{' '}
                    <strong>{renderHighlighted(joiningDate)}</strong> and is currently employed on a{' '}
                    <strong>{renderHighlighted(employmentType)}</strong> basis. {pronounHeSheCap} is designated as{' '}
                    <strong>{renderHighlighted(designation)}</strong> in the{' '}
                    <strong>{renderHighlighted(department)}</strong> department.
                  </p>

                  {includeSalaryDetails && (
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      As per company records, {pronounHisHer} current remuneration package is{' '}
                      <strong>{renderHighlighted(annualCtc)}</strong>.
                    </p>
                  )}

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    This certificate is being formally issued at the specific request of the employee for the sole purpose of{' '}
                    <strong>{renderHighlighted(customPurposeNote)}</strong> without any financial or legal liability on the
                    part of TaskNera HR Solutions Private Limited or any of its signing officers.
                  </p>

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    During {pronounHisHer} period of employment with us, {pronounHisHer} conduct, professional dedication,
                    and moral standing have been exemplary and satisfactory in all respects.
                  </p>
                </div>

                {/* Signatory & Corporate Seal Block */}
                <div
                  style={{
                    marginTop: 48,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  <div style={{ fontSize: '9.5pt', color: '#64748b' }}>
                    <div><strong>Place:</strong> {renderHighlighted(place)}</div>
                    <div><strong>Credential Type:</strong> Verified Corporate Attestation</div>
                    <div><strong>Verification Portal:</strong> tasknera.com/verify-credentials</div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 220 }}>
                    <div style={{ fontSize: '9pt', color: '#475569', marginBottom: 28 }}>
                      For <strong>TaskNera HR Solutions Private Limited</strong>
                    </div>
                    {/* Authorized Signature Line */}
                    <div
                      style={{
                        borderTop: '1px solid #0f172a',
                        paddingTop: 6,
                        display: 'inline-block',
                        minWidth: 180,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '10.5pt', color: '#0f172a' }}>
                        {renderHighlighted(signatoryName)}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: '#475569', textTransform: 'uppercase' }}>
                        {renderHighlighted(signatoryTitle)}
                      </div>
                      <div style={{ fontSize: '7.5pt', color: '#2563eb', fontWeight: 700, marginTop: 2 }}>
                        [OFFICIALLY SEALED &amp; SIGNED]
                      </div>
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
