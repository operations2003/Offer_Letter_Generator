import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  DollarSign,
  CreditCard,
  Receipt,
  FileText,
  Calculator,
  ArrowUp,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

// Helper to convert number to Indian words format
function numberToWords(amount: number): string {
  if (amount <= 0) return 'Zero';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred > 0 && rest > 0) {
      return ones[hundred] + ' Hundred ' + convertTwoDigits(rest);
    } else if (hundred > 0) {
      return ones[hundred] + ' Hundred';
    } else {
      return convertTwoDigits(rest);
    }
  }

  let num = Math.floor(amount);
  let words = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) {
    words += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (num > 0) {
    words += convertThreeDigits(num);
  }

  return words.trim();
}

// Format numbers as Indian currency representation without symbol
function formatAmount(val: number): string {
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Configuration & Calculation, 2 = Official Payslip Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Scroll Container Ref & State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Employee Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Preview options
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Employee Details Form State
  const [fullName, setFullName] = useState<string>('Aarav Sharma');
  const [employeeId, setEmployeeId] = useState<string>('TN-2024-0102');
  const [designation, setDesignation] = useState<string>('Senior Software Engineer');
  const [department, setDepartment] = useState<string>('Engineering');
  const [dateOfJoining, setDateOfJoining] = useState<string>('15/01/2024');
  const [payPeriod, setPayPeriod] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('XXXX-XXXX-4819');
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [pfUanNumber, setPfUanNumber] = useState<string>('101234567890');
  const [payableDays, setPayableDays] = useState<string>('30');
  const [lopDays, setLopDays] = useState<string>('0');

  // Earnings State
  const [basicSalary, setBasicSalary] = useState<number>(35000);
  const [hra, setHra] = useState<number>(17500);
  const [conveyanceAllowance, setConveyanceAllowance] = useState<number>(3000);
  const [medicalAllowance, setMedicalAllowance] = useState<number>(2500);
  const [specialAllowance, setSpecialAllowance] = useState<number>(12000);
  const [performanceBonus, setPerformanceBonus] = useState<number>(5000);

  // Deductions State
  const [providentFund, setProvidentFund] = useState<number>(4200);
  const [professionalTax, setProfessionalTax] = useState<number>(200);
  const [incomeTax, setIncomeTax] = useState<number>(3500);
  const [loanAdvanceRecovery, setLoanAdvanceRecovery] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

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

  // Reset scroll position on open or step change
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setShowScrollTop(false);
    }
  }, [isOpen, step]);

  // Load employees from database
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
      console.warn('Could not load employees for payslip:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setFullName(emp.fullName || 'Employee');
    if (emp.employeeId) setEmployeeId(emp.employeeId);
    if (emp.designation) setDesignation(emp.designation);
    if (emp.department) setDepartment(emp.department);

    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        setDateOfJoining(`${day}/${month}/${year}`);
      } catch {
        setDateOfJoining(emp.joiningDate);
      }
    }

    // Auto-calculate smart salary structure if annualCtc is present
    if (emp.annualCtc && emp.annualCtc > 0) {
      const monthly = Math.round(emp.annualCtc / 12);
      const basic = Math.round(monthly * 0.5);
      const computedHra = Math.round(monthly * 0.25);
      const special = Math.max(0, monthly - basic - computedHra - 3000 - 2500);
      const pf = Math.round(basic * 0.12);
      const tax = Math.round(monthly * 0.08);

      setBasicSalary(basic);
      setHra(computedHra);
      setConveyanceAllowance(3000);
      setMedicalAllowance(2500);
      setSpecialAllowance(special);
      setPerformanceBonus(0);

      setProvidentFund(pf);
      setProfessionalTax(200);
      setIncomeTax(tax);
      setLoanAdvanceRecovery(0);
      setOtherDeductions(0);
    }
  };

  // Calculations
  const grossEarnings = useMemo(() => {
    return (
      (basicSalary || 0) +
      (hra || 0) +
      (conveyanceAllowance || 0) +
      (medicalAllowance || 0) +
      (specialAllowance || 0) +
      (performanceBonus || 0)
    );
  }, [basicSalary, hra, conveyanceAllowance, medicalAllowance, specialAllowance, performanceBonus]);

  const totalDeductions = useMemo(() => {
    return (
      (providentFund || 0) +
      (professionalTax || 0) +
      (incomeTax || 0) +
      (loanAdvanceRecovery || 0) +
      (otherDeductions || 0)
    );
  }, [providentFund, professionalTax, incomeTax, loanAdvanceRecovery, otherDeductions]);

  const netPay = useMemo(() => {
    return Math.max(0, grossEarnings - totalDeductions);
  }, [grossEarnings, totalDeductions]);

  const amountInWords = useMemo(() => {
    return `Rupees ${numberToWords(netPay)} Only`;
  }, [netPay]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = employeeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
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

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollTop(el.scrollTop > 220);
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Highlight helper for placeholders
  const hl = (content: React.ReactNode) => {
    if (!highlightPlaceholders) return <>{content}</>;
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
        {content}
      </mark>
    );
  };

  // Download PDF / Print with isolated single-page iframe
  const handleDownloadPdf = () => {
    const payslipElement = document.getElementById('printable-salary-slip');
    if (!payslipElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Payslip_${fullName.replace(/\s+/g, '_')}_${payPeriod.replace(/\s+/g, '_')}`;

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
              color: #0f172a;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 10pt;
              line-height: 1.45;
            }
            #printable-salary-slip {
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
            table {
              border-collapse: collapse;
              width: 100%;
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
          ${payslipElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print fallback:', err);
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

  // Save to Documents Generated
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
          documentTypeCode: 'CERTIFICATE' as any,
          title: `Salary Slip — ${fullName} (${payPeriod})`,
          recipientName: fullName,
          recipientEmail: recipientEmail,
          signatoryName: 'Finance Operations',
          signatoryTitle: 'Payroll Department',
          effectiveDate: payPeriod,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            fullName,
            employeeId,
            designation,
            department,
            dateOfJoining,
            payPeriod,
            bankName,
            bankAccountNumber,
            panNumber,
            pfUanNumber,
            payableDays,
            lopDays,
            basicSalary,
            hra,
            conveyanceAllowance,
            medicalAllowance,
            specialAllowance,
            performanceBonus,
            providentFund,
            professionalTax,
            incomeTax,
            loanAdvanceRecovery,
            otherDeductions,
            grossEarnings,
            totalDeductions,
            netPay,
            amountInWords,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      // Local storage backup for immediate listing in Documents Generated
      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_slip_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'CERTIFICATE' as any,
        referenceNumber: createdDoc?.referenceNumber || `TASK/${new Date().getFullYear()}/PAY-${Date.now().toString().slice(-4)}`,
        title: `Salary Slip — ${fullName} (${payPeriod})`,
        templateId: 'tpl_salary_slip_official',
        templateVersionId: 'v1.0',
        recipientName: fullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        currentVersionNumber: 1,
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: false,
        aiConfidenceScore: 1.0,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: {
          fullName,
          employeeId,
          designation,
          department,
          payPeriod,
          netPay,
          amountInWords,
        },
        humanOverrides: [],
        versions: [],
        generatedFiles: [],
        statusHistory: [],
        signatoryName: 'Finance Operations',
        signatoryTitle: 'Payroll Department',
        effectiveDate: payPeriod,
        issuedAt: new Date().toISOString(),
        createdByUserId: 'usr_current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs: HrDocument[] = stored ? JSON.parse(stored) : [];
        const existingIdx = docs.findIndex((d) => d.id === localDoc.id);
        if (existingIdx >= 0) {
          docs[existingIdx] = localDoc;
        } else {
          docs.unshift(localDoc);
        }
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch {
        // LocalStorage fallback
      }

      success(`Successfully generated and saved Payslip for ${fullName} (${payPeriod})!`);
      if (onSuccess) onSuccess(createdDoc || localDoc);
      onClose();
    } catch (err: any) {
      error(`Failed to save salary slip: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
          position: 'relative',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '14px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: 12,
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
                color: '#059669',
                border: '1px solid #a7f3d0',
              }}
            >
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 6,
                    backgroundColor: '#065f46',
                    color: '#ffffff',
                  }}
                >
                  OFFICIAL PAYSLIP
                </span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>
                  A4 Single-Page • System Generated
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                TaskNera Monthly Salary Slip Generator
              </h3>
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {step === 1 ? (
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                icon={<ArrowRight size={15} />}
                style={{
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                }}
              >
                Preview Official Payslip
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  icon={<ArrowLeft size={15} />}
                >
                  Edit Details
                </Button>

                <button
                  onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: highlightPlaceholders ? '#f59e0b' : '#cbd5e1',
                    backgroundColor: highlightPlaceholders ? '#fef3c7' : '#ffffff',
                    color: highlightPlaceholders ? '#92400e' : '#475569',
                    cursor: 'pointer',
                  }}
                  title="Highlight placeholders for quick review"
                >
                  <Highlighter size={14} />
                  Highlight Fields
                </button>

                <Button
                  variant="secondary"
                  onClick={handleDownloadPdf}
                  icon={<Download size={15} />}
                  style={{
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                  }}
                >
                  Print / Export PDF
                </Button>

                <Button
                  variant="primary"
                  onClick={handleSaveToDocumentsGenerated}
                  disabled={isSaving}
                  icon={isSaving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
                  style={{
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save & Issue Payslip'}
                </Button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: '50%',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 32px',
            background: '#f8fafc',
            scrollBehavior: 'smooth',
          }}
        >
          {step === 1 ? (
            /* ================================================================= */
            /* STEP 1: FORM & EMPLOYEE SELECTION & EARNINGS/DEDUCTIONS INPUTS    */
            /* ================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection Section */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      Step 1: Select Employee
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                      Auto-populates employee details, designation, joining date, and standard salary structure.
                    </p>
                  </div>

                  {/* Search and Dept Filter */}
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: 220 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Search employee..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 30px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                        }}
                      />
                    </div>
                    {availableDepartments.length > 0 && (
                      <select
                        value={selectedDeptFilter}
                        onChange={(e) => setSelectedDeptFilter(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.78rem',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="ALL">All Departments</option>
                        {availableDepartments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {loadingEmployees ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block', color: '#059669' }} />
                    Loading employees...
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: 10,
                      maxHeight: 180,
                      overflowY: 'auto',
                      padding: 4,
                    }}
                  >
                    {filteredEmployees.map((emp) => {
                      const isSelected = emp.id === selectedEmployeeId;
                      return (
                        <div
                          key={emp.id}
                          onClick={() => applyEmployee(emp)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                            backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                              {emp.fullName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2 }}>
                              {emp.employeeId || 'ID Pending'} • {emp.designation || 'Staff'}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 size={16} style={{ color: '#059669' }} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Employee & Bank Metadata Section */}
              <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={16} style={{ color: '#059669' }} />
                  Employee & Disbursement Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
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
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
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
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Date of Joining (DD/MM/YYYY)
                    </label>
                    <input
                      type="text"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Pay Period / Month
                    </label>
                    <input
                      type="text"
                      value={payPeriod}
                      onChange={(e) => setPayPeriod(e.target.value)}
                      placeholder="e.g. October 2026"
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Bank A/C No.
                    </label>
                    <input
                      type="text"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      PF/UAN No.
                    </label>
                    <input
                      type="text"
                      value={pfUanNumber}
                      onChange={(e) => setPfUanNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Payable Days
                    </label>
                    <input
                      type="text"
                      value={payableDays}
                      onChange={(e) => setPayableDays(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      LOP (Loss of Pay) Days
                    </label>
                    <input
                      type="text"
                      value={lopDays}
                      onChange={(e) => setLopDays(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              {/* Earnings vs Deductions Breakdown Form */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                {/* Earnings Column */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CreditCard size={16} />
                      Monthly Earnings (₹)
                    </h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                      Gross: ₹{formatAmount(grossEarnings)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Basic Salary
                      </label>
                      <input
                        type="number"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        House Rent Allowance (HRA)
                      </label>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Conveyance Allowance
                      </label>
                      <input
                        type="number"
                        value={conveyanceAllowance}
                        onChange={(e) => setConveyanceAllowance(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Medical Allowance
                      </label>
                      <input
                        type="number"
                        value={medicalAllowance}
                        onChange={(e) => setMedicalAllowance(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Special Allowance
                      </label>
                      <input
                        type="number"
                        value={specialAllowance}
                        onChange={(e) => setSpecialAllowance(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Performance Bonus
                      </label>
                      <input
                        type="number"
                        value={performanceBonus}
                        onChange={(e) => setPerformanceBonus(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions Column */}
                <div style={{ background: '#ffffff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Receipt size={16} />
                      Monthly Deductions (₹)
                    </h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: 12, border: '1px solid #fecaca' }}>
                      Total: ₹{formatAmount(totalDeductions)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Provident Fund (PF)
                      </label>
                      <input
                        type="number"
                        value={providentFund}
                        onChange={(e) => setProvidentFund(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Professional Tax
                      </label>
                      <input
                        type="number"
                        value={professionalTax}
                        onChange={(e) => setProfessionalTax(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Income Tax (TDS)
                      </label>
                      <input
                        type="number"
                        value={incomeTax}
                        onChange={(e) => setIncomeTax(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Loan / Advance Recovery
                      </label>
                      <input
                        type="number"
                        value={loanAdvanceRecovery}
                        onChange={(e) => setLoanAdvanceRecovery(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 3 }}>
                        Other Deductions
                      </label>
                      <input
                        type="number"
                        value={otherDeductions}
                        onChange={(e) => setOtherDeductions(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8125rem', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    {/* Summary Callout in Step 1 */}
                    <div
                      style={{
                        marginTop: 12,
                        padding: '12px 14px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78125rem', color: '#64748b' }}>
                        <span>Net Take-Home Pay:</span>
                        <strong style={{ color: '#059669', fontSize: '0.95rem' }}>₹{formatAmount(netPay)}</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                        {amountInWords}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Continue Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <Button
                  variant="primary"
                  onClick={() => setStep(2)}
                  icon={<ArrowRight size={16} />}
                  style={{
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                    padding: '10px 20px',
                    fontSize: '0.875rem',
                  }}
                >
                  Proceed to Official Payslip Preview
                </Button>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* STEP 2: HIGH-FIDELITY OFFICIAL TASKNERA PAYSLIP PREVIEW (A4)      */
            /* ================================================================= */
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                id="printable-salary-slip"
                style={{
                  width: '100%',
                  maxWidth: '780px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  padding: '40px 48px',
                  color: '#0f172a',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  boxSizing: 'border-box',
                }}
              >
                {/* 1. Header Banner */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img
                      src="/logo.png"
                      alt="TaskNera"
                      style={{ width: 44, height: 44, objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '26px',
                          fontWeight: 800,
                          color: '#0f172a',
                          lineHeight: 1.1,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        TaskNera
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          fontStyle: 'italic',
                          color: '#64748b',
                          marginTop: 3,
                        }}
                      >
                        Payslip for the month of {hl(payPeriod)}
                      </div>
                    </div>
                  </div>

                  {/* Top Terracotta Accent Divider Line */}
                  <div
                    style={{
                      height: 2,
                      backgroundColor: '#c26d4d',
                      width: '100%',
                      marginTop: 14,
                      borderRadius: 1,
                    }}
                  />
                </div>

                {/* 2. Employee Details Grid Table */}
                <div style={{ marginBottom: 20 }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ width: '22%', padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Employee Name
                        </td>
                        <td style={{ width: '28%', padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(fullName)}
                        </td>
                        <td style={{ width: '22%', padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Employee ID
                        </td>
                        <td style={{ width: '28%', padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(employeeId)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Designation
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(designation)}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Department
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(department)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Date of Joining
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(dateOfJoining)}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Pay Period
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(payPeriod)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Bank Name
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(bankName)}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Bank A/C No.
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(bankAccountNumber)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          PAN
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(panNumber)}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          PF/UAN No.
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(pfUanNumber)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          Payable Days
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(payableDays)}
                        </td>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', border: '1px solid #cbd5e1', backgroundColor: '#fcfaf8' }}>
                          LOP Days
                        </td>
                        <td style={{ padding: '7px 10px', color: '#0f172a', border: '1px solid #cbd5e1' }}>
                          {hl(lopDays)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. Earnings & Deductions Breakdown Table */}
                <div style={{ marginBottom: 16 }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '11px',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: '#c26d4d', color: '#ffffff' }}>
                        <th style={{ width: '28%', padding: '9px 12px', textAlign: 'left', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                          EARNINGS
                        </th>
                        <th style={{ width: '22%', padding: '9px 12px', textAlign: 'right', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                          AMOUNT (₹)
                        </th>
                        <th style={{ width: '28%', padding: '9px 12px', textAlign: 'left', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                          DEDUCTIONS
                        </th>
                        <th style={{ width: '22%', padding: '9px 12px', textAlign: 'right', fontWeight: 800, letterSpacing: '0.03em', border: '1px solid #c26d4d' }}>
                          AMOUNT (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Basic Salary</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(basicSalary))}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Provident Fund (PF)</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(providentFund))}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#fcfaf8' }}>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>House Rent Allowance (HRA)</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(hra))}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Professional Tax</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(professionalTax))}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Conveyance Allowance</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(conveyanceAllowance))}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Income Tax (TDS)</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(incomeTax))}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#fcfaf8' }}>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Medical Allowance</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(medicalAllowance))}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Loan/Advance Recovery</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(loanAdvanceRecovery))}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Special Allowance</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(specialAllowance))}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Other Deductions</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(otherDeductions))}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#fcfaf8' }}>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}>Performance Bonus</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}>{hl(formatAmount(performanceBonus))}</td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', color: '#334155' }}></td>
                        <td style={{ padding: '7px 12px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#0f172a' }}></td>
                      </tr>
                      {/* Subtotals Row */}
                      <tr style={{ borderTop: '2px solid #cbd5e1', backgroundColor: '#f1f5f9' }}>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                          Gross Earnings
                        </td>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {hl(`₹ ${formatAmount(grossEarnings)}`)}
                        </td>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                          Total Deductions
                        </td>
                        <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {hl(`₹ ${formatAmount(totalDeductions)}`)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. NET PAY Callout Banner */}
                <div
                  style={{
                    backgroundColor: '#262626',
                    color: '#ffffff',
                    padding: '11px 16px',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    NET PAY (Gross Earnings − Total Deductions)
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#e07a5f' }}>
                    {hl(`₹ ${formatAmount(netPay)}`)}
                  </span>
                </div>

                {/* 5. Amount in Words */}
                <div
                  style={{
                    fontSize: '11.5px',
                    color: '#1e293b',
                    marginBottom: 28,
                  }}
                >
                  <strong>Amount in Words:</strong> {hl(amountInWords)}
                </div>

                {/* 6. Footer Disclaimers */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: 12,
                    fontSize: '9.5px',
                    color: '#64748b',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  <div>This is a system-generated payslip and does not require a signature.</div>
                  <div>TaskNera • Compensation & Benefits Policy applies to all salary computations.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Back to Top Button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            title="Scroll back to top"
            style={{
              position: 'absolute',
              bottom: 22,
              right: 26,
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 24,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#0f172a';
            }}
          >
            <ArrowUp size={14} />
            <span>Top</span>
          </button>
        )}
      </div>
    </div>
  );
};
