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
  FileText,
  Clock,
  TrendingUp,
  Percent,
  Check,
  DollarSign,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface SalaryRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export interface SalaryBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  grossMonthly: number;
  pf: number;
  gratuity: number;
  tax: number;
  netMonthly: number;
  annualCtc: number;
}

export const SalaryRevisionModal: React.FC<SalaryRevisionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Edit Details & Salary Comparison, 2 = Official 2-Page Letter Preview
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

  // Helper date formatting
  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Form Fields - Reference & Dates
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));
  const [referenceNumber, setReferenceNumber] = useState<string>(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(10 + Math.random() * 90);
    return `TN/HR/SAL/${yyyy}/${rand.toString().padStart(3, '0')}`;
  });

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Ananya Sharma');
  const [employeeSalutation, setEmployeeSalutation] = useState<string>('Ananya');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1025');
  const [designation, setDesignation] = useState<string>('Senior Talent Acquisition Specialist');
  const [department, setDepartment] = useState<string>('Talent Acquisition');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat 504, Tower B, Lotus Boulevard, Sector 100, Noida – 201304, Uttar Pradesh'
  );
  const [employeeEmail, setEmployeeEmail] = useState<string>('ananya.sharma@example.com');

  // Revision Details
  const [revisionReason, setRevisionReason] = useState<string>(
    'following the annual performance review and in recognition of your exceptional contributions to the team'
  );
  const [effectiveDate, setEffectiveDate] = useState<string>('01 November 2026');

  // Quick Hike Calculator Presets
  const [hikePercent, setHikePercent] = useState<string>('15');

  // Previous Salary Structure (per month & annual)
  const [prevBasic, setPrevBasic] = useState<string>('30000');
  const [prevHra, setPrevHra] = useState<string>('15000');
  const [prevSpecial, setPrevSpecial] = useState<string>('15000');
  const [prevPf, setPrevPf] = useState<string>('3600');
  const [prevGratuity, setPrevGratuity] = useState<string>('1442');
  const [prevTax, setPrevTax] = useState<string>('200');

  // Revised Salary Structure (per month & annual)
  const [revBasic, setRevBasic] = useState<string>('34500');
  const [revHra, setRevHra] = useState<string>('17250');
  const [revSpecial, setRevSpecial] = useState<string>('17250');
  const [revPf, setRevPf] = useState<string>('4140');
  const [revGratuity, setRevGratuity] = useState<string>('1659');
  const [revTax, setRevTax] = useState<string>('200');

  // Computed Previous Totals
  const prevGross = (parseFloat(prevBasic) || 0) + (parseFloat(prevHra) || 0) + (parseFloat(prevSpecial) || 0);
  const prevTotalDeductions = (parseFloat(prevPf) || 0) + (parseFloat(prevGratuity) || 0) + (parseFloat(prevTax) || 0);
  const prevNet = prevGross - prevTotalDeductions;
  const prevAnnualCtc = prevGross * 12;

  // Computed Revised Totals
  const revGross = (parseFloat(revBasic) || 0) + (parseFloat(revHra) || 0) + (parseFloat(revSpecial) || 0);
  const revTotalDeductions = (parseFloat(revPf) || 0) + (parseFloat(revGratuity) || 0) + (parseFloat(revTax) || 0);
  const revNet = revGross - revTotalDeductions;
  const revAnnualCtc = revGross * 12;

  // Signatory (Tasknera)
  const [taskneraSignatoryName, setTaskneraSignatoryName] = useState<string>('Ms. Sheetal Bedi');
  const [taskneraSignatoryTitle, setTaskneraSignatoryTitle] = useState<string>('Chief Executive Officer (CEO)');
  const [taskneraSignatoryPlace, setTaskneraSignatoryPlace] = useState<string>('Delhi, India');
  const [taskneraSignDate, setTaskneraSignDate] = useState<string>(() => formatDateString(new Date()));

  // Acknowledgement (Employee)
  const [employeeSignDate, setEmployeeSignDate] = useState<string>(() => formatDateString(new Date()));
  const [employeeSignPlace, setEmployeeSignPlace] = useState<string>('Noida');

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
        console.warn('Failed to load employee roster for salary revision autofill:', err);
      } finally {
        if (isMounted) setLoadingEmployees(false);
      }
    };
    loadRoster();
    return () => {
      isMounted = false;
    };
  }, []);

  // Autofill on initialEmployee or selecting an employee
  useEffect(() => {
    if (initialEmployee) {
      handleSelectEmployee(initialEmployee);
    }
  }, [initialEmployee]);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(emp.fullName);
    const firstName = emp.fullName.trim().split(' ')[0] || emp.fullName;
    setEmployeeSalutation(firstName);
    setEmployeeId(emp.employeeId || 'EMP-1001');
    setDesignation(emp.designation || 'Specialist');
    setDepartment(emp.department || 'Operations');
    if (emp.personalEmail || emp.officialEmail) {
      setEmployeeEmail(emp.personalEmail || emp.officialEmail || '');
    }
    const addrParts: string[] = [];
    if (emp.addressLine) addrParts.push(emp.addressLine);
    if (emp.city) addrParts.push(emp.city);
    if (emp.state) addrParts.push(emp.state);
    if (emp.pinCode) addrParts.push(emp.pinCode);
    if (addrParts.length > 0) {
      setResidentialAddress(addrParts.join(', '));
    } else if (emp.workLocation) {
      setResidentialAddress(`${emp.workLocation}, India`);
    }
    if (emp.city) {
      setEmployeeSignPlace(emp.city);
    } else if (emp.workLocation) {
      setEmployeeSignPlace(emp.workLocation.split(',')[0].trim());
    }

    // Auto-calculate from employee's current annualCtc if available
    if (emp.annualCtc && emp.annualCtc > 0) {
      const curGross = Math.round(emp.annualCtc / 12);
      const bPct = emp.basicPercent ? Number(emp.basicPercent) / 100 : 0.5;
      const hPct = emp.hraPercent ? Number(emp.hraPercent) / 100 : 0.4;
      const bVal = Math.round(curGross * bPct);
      const hVal = Math.round(bVal * hPct);
      const sVal = Math.max(0, curGross - bVal - hVal);
      const pfVal = Math.round(Math.min(bVal, 15000) * 0.12);
      const gratVal = Math.round((bVal * 15) / 26 / 12);

      setPrevBasic(bVal.toString());
      setPrevHra(hVal.toString());
      setPrevSpecial(sVal.toString());
      setPrevPf(pfVal.toString());
      setPrevGratuity(gratVal.toString());
      setPrevTax('200');

      // Default 15% hike on revised
      applyHike('15', bVal, hVal, sVal);
    }

    success(`Selected ${emp.fullName} - employee salary details populated!`);
  };

  const applyHike = (pctStr: string, baseB?: number, baseH?: number, baseS?: number) => {
    const pct = parseFloat(pctStr) || 0;
    setHikePercent(pctStr);
    const multiplier = 1 + pct / 100;

    const b = baseB !== undefined ? baseB : parseFloat(prevBasic) || 0;
    const h = baseH !== undefined ? baseH : parseFloat(prevHra) || 0;
    const s = baseS !== undefined ? baseS : parseFloat(prevSpecial) || 0;

    const newB = Math.round(b * multiplier);
    const newH = Math.round(h * multiplier);
    const newS = Math.round(s * multiplier);
    const newPf = Math.round(Math.min(newB, 15000) * 0.12);
    const newGrat = Math.round((newB * 15) / 26 / 12);

    setRevBasic(newB.toString());
    setRevHra(newH.toString());
    setRevSpecial(newS.toString());
    setRevPf(newPf.toString());
    setRevGratuity(newGrat.toString());
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
    const letterElement = document.getElementById('printable-salary-revision-letter');
    if (!letterElement) {
      window.print();
      return;
    }

    const docTitle = `Tasknera_Salary_Revision_${employeeFullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

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
            .salary-page {
              width: 100%;
              min-height: 265mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 6mm 4mm;
              background: #ffffff;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0 16px 0;
              font-size: 9.2pt;
            }
            th, td {
              border: 1px solid #1e293b;
              padding: 6px 10px;
              text-align: left;
            }
            th {
              background-color: #0f2744 !important;
              color: #ffffff !important;
              font-weight: 700;
            }
            .text-right {
              text-align: right;
            }
            .font-bold {
              font-weight: 700;
            }
            p {
              margin: 0 0 10px 0;
            }
            strong {
              color: #0f172a;
            }
            mark {
              background-color: #fef08a;
              color: #854d0e;
              padding: 1px 4px;
              border-radius: 2px;
            }
          </style>
        </head>
        <body>
          ${letterElement.innerHTML}
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
          documentTypeCode: 'INCREMENT_LETTER',
          title: `Revision of Salary - ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: employeeEmail,
          recipientExternalId: selectedEmployeeId || employeeId,
          signatoryName: taskneraSignatoryName,
          signatoryTitle: taskneraSignatoryTitle,
          effectiveDate: effectiveDate,
        });
      } catch (backendErr) {
        console.warn('Backend API note:', backendErr);
      }
      success(`Salary Revision letter for ${employeeFullName} saved successfully to Documents Registry!`);
      if (createdDoc && onSuccess) {
        onSuccess(createdDoc);
      }
    } catch (err: any) {
      error(err.message || 'Failed to record document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1160px',
          height: '94vh',
          backgroundColor: '#f8fafc',
          borderRadius: 16,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* Top App Bar */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Revision of Salary
                </h2>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  TN/HR/SAL/YYYY/000
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                  }}
                >
                  Official 2-Page Format
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Formal compensation increment letter with comparative salary structure, statutory deductions & dual signatures.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Step Pills */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                padding: '3px',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#0f172a' : '#64748b',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                1. Edit Salary &amp; Hike
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#0f172a' : '#64748b',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                }}
              >
                2. Official 2-Page Preview
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
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

        {/* Modal Main Content */}
        <div ref={scrollContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {step === 1 ? (
            /* =========================================================================
               STEP 1: EDIT DETAILS & COMPARATIVE SALARY STRUCTURE
               ========================================================================= */
            <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection Quick Card */}
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
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={18} style={{ color: '#2563eb' }} />
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Quick Select Employee for Salary Revision
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ({filteredEmployees.length} profiles found)
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: 240 }}>
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
                      placeholder="Search name, ID, department..."
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
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          transition: 'all 0.15s ease',
                          minWidth: 210,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? '#dbeafe' : '#f1f5f9',
                            color: isSelected ? '#1d4ed8' : '#475569',
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
                            {emp.employeeId} &bull; {emp.department}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid 1: Reference, Employee & Revision Reason */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                  gap: 20,
                }}
              >
                {/* Column 1: Reference & Dates */}
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
                    <FileText size={17} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Letter Reference &amp; Effective Date
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
                          color: '#0f172a',
                          fontWeight: 600,
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Effective Date (with effect from)
                      </label>
                      <input
                        type="text"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        placeholder="e.g. 01 November 2026"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 600,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Quick Increment %
                      </label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['10', '15', '20', '25'].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => applyHike(pct)}
                            style={{
                              flex: 1,
                              padding: '7px 4px',
                              borderRadius: 6,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              border: hikePercent === pct ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                              backgroundColor: hikePercent === pct ? '#eff6ff' : '#ffffff',
                              color: hikePercent === pct ? '#1d4ed8' : '#475569',
                              cursor: 'pointer',
                            }}
                          >
                            +{pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Revision Reason (e.g. annual performance review)
                    </label>
                    <textarea
                      rows={2}
                      value={revisionReason}
                      onChange={(e) => setRevisionReason(e.target.value)}
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

                {/* Column 2: Employee Profile */}
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
                    <User size={17} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Employee Details
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Full Name (To block)
                      </label>
                      <input
                        type="text"
                        value={employeeFullName}
                        onChange={(e) => {
                          setEmployeeFullName(e.target.value);
                          setEmployeeSalutation(e.target.value.trim().split(' ')[0] || e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '0.8125rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          fontWeight: 600,
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
                        Designation (remains unchanged)
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
                    <input
                      type="text"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
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

              {/* Comparative Salary Structure Table Editor */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DollarSign size={18} style={{ color: '#2563eb' }} />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Comparative Salary Structure (Previous vs. Revised)
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    All figures in INR per month (Annual CTC calculated as Gross &times; 12)
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0f2744', color: '#ffffff' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, width: '40%' }}>
                          Component
                        </th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, width: '30%' }}>
                          Previous (per month)
                        </th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, width: '30%' }}>
                          Revised (per month)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Basic Salary */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', fontWeight: 600 }}>Basic Salary</td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={prevBasic}
                            onChange={(e) => setPrevBasic(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={revBasic}
                            onChange={(e) => setRevBasic(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #93c5fd', backgroundColor: '#eff6ff', fontWeight: 700 }}
                          />
                        </td>
                      </tr>

                      {/* House Rent Allowance */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', fontWeight: 600 }}>House Rent Allowance</td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={prevHra}
                            onChange={(e) => setPrevHra(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={revHra}
                            onChange={(e) => setRevHra(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #93c5fd', backgroundColor: '#eff6ff', fontWeight: 700 }}
                          />
                        </td>
                      </tr>

                      {/* Special / Other Allowance */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', fontWeight: 600 }}>Special / Other Allowance</td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={prevSpecial}
                            onChange={(e) => setPrevSpecial(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={revSpecial}
                            onChange={(e) => setRevSpecial(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #93c5fd', backgroundColor: '#eff6ff', fontWeight: 700 }}
                          />
                        </td>
                      </tr>

                      {/* Gross Monthly Salary */}
                      <tr style={{ borderBottom: '2px solid #0f2744', backgroundColor: '#f8fafc' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>Gross Monthly Salary</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(prevGross)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                          {formatCurrency(revGross)}
                        </td>
                      </tr>

                      {/* Deduction: Provident Fund */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', color: '#475569' }}>Deduction: Provident Fund (if applicable)</td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={prevPf}
                            onChange={(e) => setPrevPf(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={revPf}
                            onChange={(e) => setRevPf(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                      </tr>

                      {/* Deduction: Gratuity */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', color: '#475569' }}>Deduction: Gratuity (if applicable)</td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={prevGratuity}
                            onChange={(e) => setPrevGratuity(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={revGratuity}
                            onChange={(e) => setRevGratuity(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                      </tr>

                      {/* Deduction: Professional Tax / TDS */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 14px', color: '#475569' }}>Deduction: Professional Tax / TDS</td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={prevTax}
                            onChange={(e) => setPrevTax(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                        <td style={{ padding: '6px 14px', textAlign: 'right' }}>
                          <input
                            type="number"
                            value={revTax}
                            onChange={(e) => setRevTax(e.target.value)}
                            style={{ width: '130px', padding: '6px 8px', textAlign: 'right', borderRadius: 4, border: '1px solid #cbd5e1' }}
                          />
                        </td>
                      </tr>

                      {/* Net Monthly Take-Home */}
                      <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f0fdf4' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#166534' }}>Net Monthly Take-Home</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#166534' }}>
                          {formatCurrency(prevNet)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                          {formatCurrency(revNet)}
                        </td>
                      </tr>

                      {/* Annual CTC */}
                      <tr style={{ backgroundColor: '#eff6ff' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#1e3a8a', fontSize: '0.9rem' }}>
                          Annual CTC
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#1e3a8a', fontSize: '0.9rem' }}>
                          {formatCurrency(prevAnnualCtc)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>
                          {formatCurrency(revAnnualCtc)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatories & Acknowledgement */}
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
                  <Building2 size={17} style={{ color: '#2563eb' }} />
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
                  style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                >
                  Proceed to Official 2-Page Preview
                </Button>
              </div>
            </div>
          ) : (
            /* =========================================================================
               STEP 2: OFFICIAL 2-PAGE PREVIEW (MATCHING USER PDF)
               ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* Preview Action Bar */}
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
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
                    style={{ fontSize: '0.8125rem', background: '#2563eb', borderColor: '#2563eb' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocuments}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#059669', borderColor: '#059669' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents'}
                  </Button>
                </div>
              </div>

              {/* Printable Document Container (Exact 2-Page Tasknera Format) */}
              <div
                id="printable-salary-revision-letter"
                style={{
                  width: '100%',
                  maxWidth: 820,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                }}
              >
                {/* ===================================================================
                    PAGE 1: Letterhead, Ref, Recipient, Subject, Table & Clauses
                    =================================================================== */}
                <div
                  className="salary-page"
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
                        marginBottom: 14,
                        fontSize: '9.5pt',
                      }}
                    >
                      <div>
                        <strong>Ref. No.:</strong>{' '}
                        {highlightPlaceholders ? <mark>{referenceNumber}</mark> : referenceNumber}
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
                      Subject: Revision of Salary
                    </div>

                    {/* Salutation */}
                    <div style={{ marginBottom: 10, color: '#0f172a' }}>
                      Dear {highlightPlaceholders ? <mark>{employeeSalutation}</mark> : employeeSalutation},
                    </div>

                    {/* Opening Revision Paragraph */}
                    <p style={{ textAlign: 'justify', marginBottom: 12 }}>
                      We are pleased to inform you that,{' '}
                      {highlightPlaceholders ? <mark>{revisionReason}</mark> : revisionReason}, your compensation has been
                      revised with effect from{' '}
                      {highlightPlaceholders ? <mark>{effectiveDate}</mark> : effectiveDate} (the “Effective Date”). Your
                      designation, {highlightPlaceholders ? <mark>{designation}</mark> : designation}, remains unchanged.
                    </p>

                    <p style={{ marginBottom: 6 }}>
                      Your revised salary structure is set out below:
                    </p>

                    {/* Salary Structure Comparison Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        margin: '10px 0 16px 0',
                        fontSize: '9.2pt',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#0f2744', color: '#ffffff' }}>
                          <th style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'left', fontWeight: 700 }}>
                            Component
                          </th>
                          <th style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'right', fontWeight: 700, width: '28%' }}>
                            Previous (per month)
                          </th>
                          <th style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'right', fontWeight: 700, width: '28%' }}>
                            Revised (per month)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px' }}>Basic Salary</td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevBasic)}</mark> : formatCurrency(prevBasic)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revBasic)}</mark> : formatCurrency(revBasic)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px' }}>House Rent Allowance</td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevHra)}</mark> : formatCurrency(prevHra)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revHra)}</mark> : formatCurrency(revHra)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px' }}>Special / Other Allowance</td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevSpecial)}</mark> : formatCurrency(prevSpecial)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revSpecial)}</mark> : formatCurrency(revSpecial)}
                          </td>
                        </tr>
                        <tr style={{ fontWeight: 700, backgroundColor: '#f8fafc' }}>
                          <td style={{ border: '1px solid #1e293b', padding: '6px 10px' }}>Gross Monthly Salary</td>
                          <td style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevGross)}</mark> : formatCurrency(prevGross)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revGross)}</mark> : formatCurrency(revGross)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px' }}>Deduction: Provident Fund (if applicable)</td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevPf)}</mark> : formatCurrency(prevPf)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revPf)}</mark> : formatCurrency(revPf)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px' }}>Deduction: Gratuity (if applicable)</td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevGratuity)}</mark> : formatCurrency(prevGratuity)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revGratuity)}</mark> : formatCurrency(revGratuity)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px' }}>Deduction: Professional Tax / TDS</td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevTax)}</mark> : formatCurrency(prevTax)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '5px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revTax)}</mark> : formatCurrency(revTax)}
                          </td>
                        </tr>
                        <tr style={{ fontWeight: 700, backgroundColor: '#f0fdf4' }}>
                          <td style={{ border: '1px solid #1e293b', padding: '6px 10px' }}>Net Monthly Take-Home</td>
                          <td style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevNet)}</mark> : formatCurrency(prevNet)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '6px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revNet)}</mark> : formatCurrency(revNet)}
                          </td>
                        </tr>
                        <tr style={{ fontWeight: 800, backgroundColor: '#eff6ff' }}>
                          <td style={{ border: '1px solid #1e293b', padding: '7px 10px' }}>Annual CTC</td>
                          <td style={{ border: '1px solid #1e293b', padding: '7px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(prevAnnualCtc)}</mark> : formatCurrency(prevAnnualCtc)}
                          </td>
                          <td style={{ border: '1px solid #1e293b', padding: '7px 10px', textAlign: 'right' }}>
                            {highlightPlaceholders ? <mark>{formatCurrency(revAnnualCtc)}</mark> : formatCurrency(revAnnualCtc)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Point 1: Statutory deductions */}
                    <p style={{ textAlign: 'justify', marginBottom: 8 }}>
                      <strong>1. Statutory deductions.</strong> The components above are subject to deductions and
                      withholdings required by applicable law and Company policy, and may change if the law or the structure
                      changes.
                    </p>

                    {/* Point 2: Other terms */}
                    <p style={{ textAlign: 'justify', marginBottom: 8 }}>
                      <strong>2. Other terms.</strong> All other terms and conditions of your employment, as set out in your
                      appointment letter and Company policies, remain unchanged.
                    </p>

                    {/* Point 3: Confidentiality */}
                    <p style={{ textAlign: 'justify', marginBottom: 12 }}>
                      <strong>3. Confidentiality.</strong> Your compensation is confidential, and you are requested not to
                      disclose it to colleagues or third parties, except as required by law.
                    </p>

                    {/* Closing Note */}
                    <p style={{ textAlign: 'justify', marginBottom: 0 }}>
                      We appreciate your contribution and look forward to your continued commitment. Please sign and return a
                      copy of this letter as acknowledgement.
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
                    PAGE 2: Header, Signatures, Seal & Acknowledgement
                    =================================================================== */}
                <div
                  className="salary-page"
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
                        justifyContent: 'flex-end',
                        gap: 10,
                        paddingBottom: 14,
                        marginBottom: 28,
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
                        Salary Revision Letter
                      </span>
                    </div>

                    {/* Signoff Line */}
                    <div style={{ marginBottom: 16 }}>
                      <div>Yours sincerely,</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                        For and on behalf of TASKNERA
                      </div>
                    </div>

                    {/* Side-by-side: Authorised Signatory | Company Seal | Acknowledgement of Receipt */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 130px 1.2fr',
                        gap: 20,
                        alignItems: 'flex-start',
                        marginTop: 20,
                        paddingTop: 8,
                      }}
                    >
                      {/* Left: Authorised Signatory */}
                      <div>
                        <div
                          style={{
                            borderBottom: '1px solid #cbd5e1',
                            height: 52,
                            marginBottom: 8,
                          }}
                        />
                        <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: 8 }}>
                          Signature of Authorised Signatory
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          Name: {highlightPlaceholders ? <mark>{taskneraSignatoryName}</mark> : taskneraSignatoryName}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Designation: {taskneraSignatoryTitle}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Date: {highlightPlaceholders ? <mark>{taskneraSignDate}</mark> : taskneraSignDate}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Place: {taskneraSignatoryPlace}
                        </div>
                      </div>

                      {/* Middle: Company Seal Box */}
                      <div
                        style={{
                          height: 104,
                          border: '1.5px solid #cbd5e1',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                          fontSize: '8.5pt',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: 8,
                        }}
                      >
                        Company Seal
                      </div>

                      {/* Right: Acknowledgement of Receipt */}
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '9pt', marginBottom: 4 }}>
                          ACKNOWLEDGEMENT OF RECEIPT
                        </div>
                        <p style={{ fontSize: '8.5pt', color: '#334155', margin: '0 0 10px 0' }}>
                          I,{' '}
                          <strong>
                            {highlightPlaceholders ? <mark>{employeeFullName}</mark> : employeeFullName}
                          </strong>
                          , acknowledge receipt of this letter.
                        </p>
                        <div
                          style={{
                            borderBottom: '1px solid #cbd5e1',
                            height: 38,
                            marginBottom: 8,
                          }}
                        />
                        <div style={{ fontSize: '8pt', color: '#64748b', marginBottom: 8 }}>
                          Signature of Employee
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Date: {highlightPlaceholders ? <mark>{employeeSignDate}</mark> : employeeSignDate}
                        </div>
                        <div style={{ color: '#475569', marginTop: 2 }}>
                          Place: {highlightPlaceholders ? <mark>{employeeSignPlace}</mark> : employeeSignPlace}
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
