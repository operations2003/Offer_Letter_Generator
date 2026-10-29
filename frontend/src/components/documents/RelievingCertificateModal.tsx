import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  Users,
  Search,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface RelievingCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const RelievingCertificateModal: React.FC<RelievingCertificateModalProps> = ({
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

  // Form Fields State
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(10 + Math.random() * 90);
    return `TN/HR/REL/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Vikramaditya Roy');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Vikramaditya');
  const [employeeId, setEmployeeId] = useState<string>('EMP-2041');
  const [designation, setDesignation] = useState<string>('Senior Product Operations Lead');
  const [department, setDepartment] = useState<string>('Product Experience');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat 402, Signature Residency, Mayur Vihar Phase 1, New Delhi – 110091'
  );

  // Relieving Details
  const [resignationDate, setResignationDate] = useState<string>('15 October 2026');
  const [lastWorkingDay, setLastWorkingDay] = useState<string>('31 October 2026');
  const [joiningDate, setJoiningDate] = useState<string>('1 August 2023');

  // Dues & Settlement Options
  const [duesType, setDuesType] = useState<'NO_DUES' | 'ADJUSTED'>('NO_DUES');
  const [duesDetails, setDuesDetails] = useState<string>('₹14,500 towards notice shortfall adjustment');

  // Performance Clause
  const [includePerformanceClause, setIncludePerformanceClause] = useState<boolean>(true);
  const [performanceRating, setPerformanceRating] = useState<'satisfactory' | 'commendable'>('commendable');

  // Signatory & Location
  const [signatoryName, setSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('Chief Executive Officer (CEO)');
  const [signatoryPlace, setSignatoryPlace] = useState<string>('Delhi, India');
  const [signatoryDate, setSignatoryDate] = useState<string>(() => formatDateString(new Date()));

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
      console.warn('Could not load employees for relieving letter:', err);
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
    if ((emp as any).address) setResidentialAddress((emp as any).address);

    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        setJoiningDate(formatDateString(d));
      } catch {
        setJoiningDate(emp.joiningDate);
      }
    }
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
    const el = document.getElementById('printable-relieving-sheet');
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
          <title>Relieving_Letter_${employeeFullName.replace(/\\s+/g, '_')}</title>
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
          documentTypeCode: 'RELIEVING_LETTER',
          title: `Relieving Letter — ${employeeFullName}`,
          recipientName: employeeFullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle: signatoryDesignation,
          effectiveDate: lastWorkingDay,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            employeeFullName,
            employeeId,
            designation,
            department,
            residentialAddress,
            resignationDate,
            lastWorkingDay,
            joiningDate,
            duesType,
            duesDetails,
            performanceRating: includePerformanceClause ? performanceRating : 'N/A',
            referenceNumber,
            letterDate,
            signatoryName,
            signatoryDesignation,
            signatoryPlace,
            signatoryDate,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_rel_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'RELIEVING_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Relieving Letter — ${employeeFullName}`,
        templateId: 'tpl_relieving_letter_official',
        templateVersionId: 'v1.0',
        recipientName: employeeFullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        signatoryName,
        signatoryTitle: signatoryDesignation,
        effectiveDate: lastWorkingDay,
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

      success(`Relieving Letter saved successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save relieving letter.');
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
              <FileCheck2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  Relieving Letter Generator
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
                  TN/HR/REL Format
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Step {step} of 2 — {step === 1 ? 'Separation & Exit Clearance Configuration' : 'Official Letter Preview & Print'}
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
                    1. Select Relieved Employee
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
                      placeholder="Search by name, employee ID, or role..."
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
                  <FileCheck2 size={16} color="#2563eb" />
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

              {/* Separation & Dues Details */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color="#2563eb" />
                  3. Separation Dates &amp; Exit Clearance
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Resignation Submission Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={resignationDate}
                      onChange={(e) => setResignationDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Relieving Date (Last Working Day)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={lastWorkingDay}
                      onChange={(e) => setLastWorkingDay(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Original Joining Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                </div>

                {/* Dues Status Radio Options */}
                <div style={{ marginTop: 12, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
                    Full &amp; Final Dues Status (Select One)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: duesType === 'NO_DUES' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: duesType === 'NO_DUES' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="duesType"
                        checked={duesType === 'NO_DUES'}
                        onChange={() => setDuesType('NO_DUES')}
                      />
                      <span><strong>No outstanding dues</strong> — "you have no outstanding dues to the Company"</span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: duesType === 'ADJUSTED' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: duesType === 'ADJUSTED' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <input
                        type="radio"
                        name="duesType"
                        checked={duesType === 'ADJUSTED'}
                        onChange={() => setDuesType('ADJUSTED')}
                      />
                      <span><strong>Dues adjusted</strong> — "the following dues were adjusted in your full and final settlement: [details]"</span>
                    </label>

                    {duesType === 'ADJUSTED' && (
                      <div style={{ marginTop: 4, marginLeft: 26 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. ₹14,500 towards notice shortfall adjustment"
                          value={duesDetails}
                          onChange={(e) => setDuesDetails(e.target.value)}
                          style={{ fontSize: '0.8125rem' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Conduct & Performance Rating Clause */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={includePerformanceClause}
                      onChange={(e) => setIncludePerformanceClause(e.target.checked)}
                    />
                    <span>Include optional Conduct &amp; Performance Clause</span>
                  </label>

                  {includePerformanceClause && (
                    <div style={{ marginTop: 10, marginLeft: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Rating:</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="performanceRating"
                          checked={performanceRating === 'satisfactory'}
                          onChange={() => setPerformanceRating('satisfactory')}
                        />
                        <span>Satisfactory</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="performanceRating"
                          checked={performanceRating === 'commendable'}
                          onChange={() => setPerformanceRating('commendable')}
                        />
                        <span>Commendable</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Signatory Details */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={16} color="#2563eb" />
                  4. Signatory Authority
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
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={signatoryDesignation}
                      onChange={(e) => setSignatoryDesignation(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Place</label>
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
                  Preview Relieving Letter
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

              {/* Printable Relieving Letter Sheet (Single A4 Page matching PDF) */}
              <div
                id="printable-relieving-sheet"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  borderRadius: 4,
                  padding: '44px 52px 32px 52px',
                  maxWidth: '820px',
                  margin: '0 auto',
                  fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
                  color: '#1e293b',
                  fontSize: '10pt',
                  lineHeight: 1.55,
                  border: '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                  width: '100%',
                  minHeight: '1050px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Official Header */}
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    {/* Official Tasknera Logo Mark */}
                    <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 6 }}>
                      <svg width="42" height="42" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 18C12 15.7909 13.7909 14 16 14H56C58.2091 14 60 15.7909 60 18V24C60 26.2091 58.2091 28 56 28H42V56C42 58.2091 40.2091 60 38 60H30C27.7909 60 26 58.2091 26 56V28H16C13.7909 28 12 26.2091 12 24V18Z"
                          fill="url(#tn_grad_rel)"
                        />
                        <path
                          d="M26 28L46 48M46 28L26 48"
                          stroke="#ffffff"
                          strokeWidth="4"
                          strokeLinecap="round"
                          opacity="0.3"
                        />
                        <defs>
                          <linearGradient id="tn_grad_rel" x1="12" y1="14" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F97316" />
                            <stop offset="0.5" stopColor="#FB923C" />
                            <stop offset="1" stopColor="#94A3B8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div
                      style={{
                        fontSize: '1.28rem',
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
                      marginBottom: 18,
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
                  <div style={{ fontSize: '9.5pt', lineHeight: 1.45, marginBottom: 18, color: '#0f172a' }}>
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
                  <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                    Subject: Relieving Letter
                  </div>

                  {/* Salutation */}
                  <div style={{ fontSize: '9.5pt', marginBottom: 12, color: '#0f172a' }}>
                    Dear {renderHighlighted(employeeSalutation || employeeFullName)},
                  </div>

                  {/* Body Paragraphs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '9.5pt', color: '#1e293b', textAlign: 'justify' }}>
                    <p style={{ margin: 0 }}>
                      This is with reference to your resignation dated {renderHighlighted(resignationDate)}, which was accepted by the Company. You have been relieved from the services of Tasknera at the close of business on {renderHighlighted(lastWorkingDay)} (the &ldquo;<strong>Last Working Day</strong>&rdquo;).
                    </p>

                    <p style={{ margin: 0 }}>
                      You joined the Company on {renderHighlighted(joiningDate)} and last held the position of {renderHighlighted(designation)} in the {renderHighlighted(department)} team.
                    </p>

                    <p style={{ margin: 0 }}>
                      The Company confirms that you have completed the exit formalities, including handover of your work and return of Company property, and that, as on the date of this letter,{' '}
                      {duesType === 'NO_DUES' ? (
                        <span>you have no outstanding dues to the Company.</span>
                      ) : (
                        <span>the following dues were adjusted in your full and final settlement: {renderHighlighted(duesDetails || 'None')}.</span>
                      )}
                    </p>

                    <p style={{ margin: 0 }}>
                      Your confidentiality, data-protection and other post-employment obligations under your appointment letter and Company policies continue to apply after your relief.
                    </p>

                    {includePerformanceClause && (
                      <p style={{ margin: 0 }}>
                        During your tenure, your conduct and performance were {renderHighlighted(performanceRating)}.
                      </p>
                    )}

                    <p style={{ margin: 0 }}>
                      We thank you for your contribution to Tasknera and wish you every success in your future endeavours.
                    </p>
                  </div>

                  {/* Signatory Block */}
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: '9.5pt', color: '#0f172a', marginBottom: 4 }}>
                      Yours faithfully,
                    </div>
                    <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      For and on behalf of TASKNERA
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                      {/* Left: Authorised Signatory */}
                      <div style={{ minWidth: 260 }}>
                        <div
                          style={{
                            borderBottom: '1px solid #94a3b8',
                            width: 220,
                            paddingBottom: 2,
                            marginBottom: 6,
                            fontSize: '8pt',
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
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 10,
                    marginTop: 20,
                    textAlign: 'center',
                    fontSize: '7.5pt',
                    color: '#64748b',
                    lineHeight: 1.4,
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
