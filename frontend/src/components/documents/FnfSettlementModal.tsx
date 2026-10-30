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
  Receipt,
  DollarSign,
  Calculator,
  Edit3,
  Building,
  User,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface FnfSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const FnfSettlementModal: React.FC<FnfSettlementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    initialEmployee?.id || null
  );
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState<string>('');

  const formatDateString = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Header Details
  const [refNumber, setRefNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/FNF/${year}/${rand}`;
  });
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Aarav Sharma');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1088');
  const [designation, setDesignation] = useState<string>('Associate Talent Consultant');
  const [department, setDepartment] = useState<string>('Workforce & Recruitment Solutions');
  const [residentialAddress, setResidentialAddress] = useState<string>(
    'Flat 402, Royal Palms, Dilshad Garden, Delhi – 110095'
  );

  // Resignation & Service Details
  const [resignationDate, setResignationDate] = useState<string>('15 September 2026');
  const [lastWorkingDay, setLastWorkingDay] = useState<string>('15 October 2026');
  const [dateOfJoining, setDateOfJoining] = useState<string>('10 June 2024');
  const [noticePeriodDays, setNoticePeriodDays] = useState<string>('30');
  const [noticeServedDays, setNoticeServedDays] = useState<string>('30');
  const [totalService, setTotalService] = useState<string>('2 years 4 months');
  const [monthlyGrossSalary, setMonthlyGrossSalary] = useState<number>(65000);

  // A. Earnings
  const [salaryWorkedMonth, setSalaryWorkedMonth] = useState<string>('October 2026');
  const [salaryWorkedDays, setSalaryWorkedDays] = useState<string>('15');
  const [salaryWorkedAmt, setSalaryWorkedAmt] = useState<number>(32500);

  const [leaveEncashDays, setLeaveEncashDays] = useState<string>('6');
  const [leaveEncashAmt, setLeaveEncashAmt] = useState<number>(13000);

  const [bonusDetails, setBonusDetails] = useState<string>('Q2 Pro-rata performance bonus');
  const [bonusAmt, setBonusAmt] = useState<number>(8500);

  const [gratuityDetails, setGratuityDetails] = useState<string>('Not applicable (< 5 years tenure)');
  const [gratuityAmt, setGratuityAmt] = useState<number>(0);

  const [reimburseDetails, setReimburseDetails] = useState<string>('Internet & client conveyance bills');
  const [reimburseAmt, setReimburseAmt] = useState<number>(2450);

  const [otherEarningsDetails, setOtherEarningsDetails] = useState<string>('Special transition allowance');
  const [otherEarningsAmt, setOtherEarningsAmt] = useState<number>(2000);

  // B. Deductions
  const [noticeShortfallDays, setNoticeShortfallDays] = useState<string>('0');
  const [noticeShortfallAmt, setNoticeShortfallAmt] = useState<number>(0);

  const [advanceDetails, setAdvanceDetails] = useState<string>('Nil');
  const [advanceAmt, setAdvanceAmt] = useState<number>(0);

  const [unreturnedAssetsDetails, setUnreturnedAssetsDetails] = useState<string>('All assets returned & verified (AST cleared)');
  const [unreturnedAssetsAmt, setUnreturnedAssetsAmt] = useState<number>(0);

  const [statutoryDeductionsDetails, setStatutoryDeductionsDetails] = useState<string>('PF Employee share (1,800) + Prof. Tax (200)');
  const [statutoryDeductionsAmt, setStatutoryDeductionsAmt] = useState<number>(2000);

  const [tdsDetails, setTdsDetails] = useState<string>('Income Tax TDS as per IT Act 1961');
  const [tdsAmt, setTdsAmt] = useState<number>(3150);

  const [otherDeductionsDetails, setOtherDeductionsDetails] = useState<string>('Nil');
  const [otherDeductionsAmt, setOtherDeductionsAmt] = useState<number>(0);

  // Payment Settlement
  const [paymentMode, setPaymentMode] = useState<string>('NEFT / bank transfer');
  const [accountEnding, setAccountEnding] = useState<string>('4829');
  const [paymentDate, setPaymentDate] = useState<string>(() => formatDateString(new Date()));
  const [preparedByName, setPreparedByName] = useState<string>('Kunal Saxena (Senior Finance Analyst)');
  const [preparedByDate, setPreparedByDate] = useState<string>(() => formatDateString(new Date()));
  const [employeeAckDate, setEmployeeAckDate] = useState<string>(() => formatDateString(new Date()));
  const [employeeAckPlace, setEmployeeAckPlace] = useState<string>('Delhi');

  // Preview & Highlighting
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Computations
  const totalEarnings = useMemo(() => {
    return (
      (Number(salaryWorkedAmt) || 0) +
      (Number(leaveEncashAmt) || 0) +
      (Number(bonusAmt) || 0) +
      (Number(gratuityAmt) || 0) +
      (Number(reimburseAmt) || 0) +
      (Number(otherEarningsAmt) || 0)
    );
  }, [salaryWorkedAmt, leaveEncashAmt, bonusAmt, gratuityAmt, reimburseAmt, otherEarningsAmt]);

  const totalDeductions = useMemo(() => {
    return (
      (Number(noticeShortfallAmt) || 0) +
      (Number(advanceAmt) || 0) +
      (Number(unreturnedAssetsAmt) || 0) +
      (Number(statutoryDeductionsAmt) || 0) +
      (Number(tdsAmt) || 0) +
      (Number(otherDeductionsAmt) || 0)
    );
  }, [noticeShortfallAmt, advanceAmt, unreturnedAssetsAmt, statutoryDeductionsAmt, tdsAmt, otherDeductionsAmt]);

  const netPayable = useMemo(() => {
    return Math.max(0, totalEarnings - totalDeductions);
  }, [totalEarnings, totalDeductions]);

  // Convert numbers to Indian Rupees Words
  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero Rupees';
    const a = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
      } else if (n > 0) {
        str += a[n];
      }
      return str.trim();
    };

    let crore = Math.floor(num / 10000000);
    num %= 10000000;
    let lakh = Math.floor(num / 100000);
    num %= 100000;
    let thousand = Math.floor(num / 1000);
    num %= 1000;
    let remaining = num;

    let res = '';
    if (crore > 0) res += inWords(crore) + ' Crore ';
    if (lakh > 0) res += inWords(lakh) + ' Lakh ';
    if (thousand > 0) res += inWords(thousand) + ' Thousand ';
    if (remaining > 0) res += inWords(remaining);

    return `Rupees ${res.trim()} only`;
  };

  const netAmountWords = useMemo(() => numberToWords(netPayable), [netPayable]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingEmployees(true);
    EmployeeService.listEmployees()
      .then((data) => {
        setEmployees(data);
        if (initialEmployee) {
          applyEmployee(initialEmployee);
        }
      })
      .catch((err) => console.warn('Failed to load employees:', err))
      .finally(() => setLoadingEmployees(false));
  }, [isOpen, initialEmployee]);

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(
      emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Aarav Sharma'
    );
    setEmployeeId(emp.employeeId || emp.id.slice(0, 8).toUpperCase());
    setDesignation(emp.designation || 'Staff Member');
    setDepartment(emp.department || 'Operations');
    if (emp.joiningDate) {
      setDateOfJoining(formatDateString(new Date(emp.joiningDate)));
    }
  };

  const handleSelectEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) applyEmployee(emp);
    else setSelectedEmployeeId(null);
  };

  const renderHighlighted = (val: string | number) => {
    if (!highlightVariables) return val;
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
        {val}
      </span>
    );
  };

  const handleDownloadPdf = () => {
    const el = document.getElementById('printable-fnf-statement-sheet');
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
          <title>FNF_Settlement_Statement_${employeeFullName.replace(/\\s+/g, '_')}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 14mm 10mm 14mm;
            }
            body {
              font-family: "Times New Roman", Times, Georgia, serif;
              color: #0f172a;
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
            .page-container {
              box-sizing: border-box;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-after: always;
            }
            .page-container:last-child {
              page-break-after: avoid;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #94a3b8;
              padding: 5px 8px;
            }
          </style>
        </head>
        <body>
          ${el.innerHTML}
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

  const handleSaveToRecords = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'FNF_SETTLEMENT',
          title: `Full and Final Settlement Statement — ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          signatoryName: 'Ms. Sheetal Bedi',
          signatoryTitle: 'Chief Executive Officer (CEO)',
          effectiveDate: lastWorkingDay,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber: refNumber,
            employeeFullName,
            employeeId,
            designation,
            department,
            totalEarnings,
            totalDeductions,
            netPayable,
            lastWorkingDay,
          });
        }
      } catch (backendErr) {
        console.warn('Backend sync not fully available; writing to local storage cache.', backendErr);
      }

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-fnf-${Date.now()}`,
          documentTypeCode: 'FNF_SETTLEMENT',
          title: `Full and Final Settlement Statement — ${employeeFullName} (${employeeId})`,
          referenceNumber: refNumber,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          status: 'ISSUED',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          effectiveDate: lastWorkingDay,
          signatoryName: 'Ms. Sheetal Bedi',
          signatoryTitle: 'Chief Executive Officer (CEO)',
        };
        docs.unshift(localDoc);
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      success(`FNF Settlement Statement saved successfully for ${employeeFullName}!`);
      if (onSuccess) onSuccess(createdDoc || undefined);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save FNF Settlement record.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: step === 1 ? 950 : 1100,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Header */}
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
                backgroundColor: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
              }}
            >
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Full and Final (FNF) Settlement Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ede9fe',
                    color: '#6d28d9',
                    border: '1px solid #ddd6fe',
                  }}
                >
                  TN/HR/FNF &bull; 2-Page Official Statement
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Net Payable: ₹{netPayable.toLocaleString('en-IN')}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                {step === 1
                  ? 'Calculate earned salary, encashments, bonuses, recoveries, statutory deductions & dues'
                  : 'High-fidelity A4 printable preview matching official Tasknera FNF Statement standard'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => setHighlightVariables(!highlightVariables)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: highlightVariables ? '#fef08a' : '#f1f5f9',
                    color: highlightVariables ? '#854d0e' : '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                >
                  <Highlighter size={14} />
                  <span>Highlight Fields</span>
                </button>

                <Button
                  variant="secondary"
                  icon={<Edit3 size={14} />}
                  onClick={() => setStep(1)}
                  style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                >
                  Edit Data
                </Button>

                <Button
                  variant="secondary"
                  icon={<Download size={14} />}
                  onClick={handleDownloadPdf}
                  style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
                >
                  Print / Save PDF
                </Button>

                <Button
                  variant="primary"
                  icon={<Save size={14} />}
                  onClick={handleSaveToRecords}
                  disabled={isSaving}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '6px 12px',
                    backgroundColor: '#7c3aed',
                    borderColor: '#7c3aed',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save to Records'}
                </Button>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: 'none',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: step === 1 ? '24px' : '20px',
            backgroundColor: step === 1 ? '#ffffff' : '#f1f5f9',
          }}
        >
          {step === 1 ? (
            /* STEP 1: FORM CONTROLS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={16} style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill from Employee Directory
                    </span>
                  </div>
                  {loadingEmployees && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Loading employees...</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Select Employee
                    </label>
                    <select
                      value={selectedEmployeeId || ''}
                      onChange={(e) => handleSelectEmployee(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <option value="">-- Choose employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} ({emp.employeeId || emp.id.slice(0, 4)}) - {emp.designation || 'Staff'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Search Directory
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={15}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                      />
                      <input
                        type="text"
                        placeholder="Search employee directory..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px 8px 32px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.875rem',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Particulars & Address */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Statement Details &amp; Addressee
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Statement Date
                    </label>
                    <input
                      type="text"
                      value={letterDate}
                      onChange={(e) => setLetterDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee Full Name
                    </label>
                    <input
                      type="text"
                      value={employeeFullName}
                      onChange={(e) => setEmployeeFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={residentialAddress}
                    onChange={(e) => setResidentialAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              {/* Service Details Table Inputs */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Service &amp; Separation Particulars
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Date of Joining
                    </label>
                    <input
                      type="text"
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Resignation Date
                    </label>
                    <input
                      type="text"
                      value={resignationDate}
                      onChange={(e) => setResignationDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Last Working Day
                    </label>
                    <input
                      type="text"
                      value={lastWorkingDay}
                      onChange={(e) => setLastWorkingDay(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Notice Period (Days)
                    </label>
                    <input
                      type="text"
                      value={noticePeriodDays}
                      onChange={(e) => setNoticePeriodDays(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Notice Served (Days)
                    </label>
                    <input
                      type="text"
                      value={noticeServedDays}
                      onChange={(e) => setNoticeServedDays(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Total Service Tenure
                    </label>
                    <input
                      type="text"
                      value={totalService}
                      onChange={(e) => setTotalService(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Monthly Gross Salary (INR)
                    </label>
                    <input
                      type="number"
                      value={monthlyGrossSalary}
                      onChange={(e) => setMonthlyGrossSalary(Number(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Part A: Earnings */}
                <div
                  style={{
                    border: '1px solid #a7f3d0',
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: '#f0fdf4',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#047857', margin: 0 }}>
                      A. Earnings &amp; Payable Components
                    </h4>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857' }}>
                      Total: ₹{totalEarnings.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#047857', marginBottom: 2 }}>
                        1. Salary for worked days in {salaryWorkedMonth} ({salaryWorkedDays} days)
                      </label>
                      <input
                        type="number"
                        value={salaryWorkedAmt}
                        onChange={(e) => setSalaryWorkedAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#047857', marginBottom: 2 }}>
                        2. Leave encashment ({leaveEncashDays} days)
                      </label>
                      <input
                        type="number"
                        value={leaveEncashAmt}
                        onChange={(e) => setLeaveEncashAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#047857', marginBottom: 2 }}>
                        3. Bonus / Incentive / Variable Pay
                      </label>
                      <input
                        type="number"
                        value={bonusAmt}
                        onChange={(e) => setBonusAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#047857', marginBottom: 2 }}>
                        4. Gratuity (if eligible)
                      </label>
                      <input
                        type="number"
                        value={gratuityAmt}
                        onChange={(e) => setGratuityAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#047857', marginBottom: 2 }}>
                        5. Reimbursements and claims
                      </label>
                      <input
                        type="number"
                        value={reimburseAmt}
                        onChange={(e) => setReimburseAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#047857', marginBottom: 2 }}>
                        6. Other earnings ({otherEarningsDetails})
                      </label>
                      <input
                        type="number"
                        value={otherEarningsAmt}
                        onChange={(e) => setOtherEarningsAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Part B: Deductions */}
                <div
                  style={{
                    border: '1px solid #fed7aa',
                    borderRadius: 12,
                    padding: 16,
                    backgroundColor: '#fff7ed',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#c2410c', margin: 0 }}>
                      B. Deductions &amp; Recoveries
                    </h4>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c2410c' }}>
                      Total: ₹{totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', marginBottom: 2 }}>
                        1. Notice-period shortfall recovery ({noticeShortfallDays} days)
                      </label>
                      <input
                        type="number"
                        value={noticeShortfallAmt}
                        onChange={(e) => setNoticeShortfallAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', marginBottom: 2 }}>
                        2. Outstanding advances / loans
                      </label>
                      <input
                        type="number"
                        value={advanceAmt}
                        onChange={(e) => setAdvanceAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', marginBottom: 2 }}>
                        3. Unreturned Company assets
                      </label>
                      <input
                        type="number"
                        value={unreturnedAssetsAmt}
                        onChange={(e) => setUnreturnedAssetsAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', marginBottom: 2 }}>
                        4. Statutory deductions (PF / ESI / Professional Tax)
                      </label>
                      <input
                        type="number"
                        value={statutoryDeductionsAmt}
                        onChange={(e) => setStatutoryDeductionsAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', marginBottom: 2 }}>
                        5. Income tax (TDS)
                      </label>
                      <input
                        type="number"
                        value={tdsAmt}
                        onChange={(e) => setTdsAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#c2410c', marginBottom: 2 }}>
                        6. Other recoveries ({otherDeductionsDetails})
                      </label>
                      <input
                        type="number"
                        value={otherDeductionsAmt}
                        onChange={(e) => setOtherDeductionsAmt(Number(e.target.value) || 0)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Mode & Bank Account */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Disbursement Mode &amp; Account Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Mode of Payment
                    </label>
                    <input
                      type="text"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Bank Account Ending In
                    </label>
                    <input
                      type="text"
                      value={accountEnding}
                      onChange={(e) => setAccountEnding(e.target.value)}
                      placeholder="e.g. 4829"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Disbursement Date
                    </label>
                    <input
                      type="text"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Prepared By (Finance / HR)
                    </label>
                    <input
                      type="text"
                      value={preparedByName}
                      onChange={(e) => setPreparedByName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Proceed */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#7c3aed',
                    borderColor: '#7c3aed',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Generate 2-Page FNF Statement Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: HIGH-FIDELITY PRINT PREVIEW */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <div id="printable-fnf-statement-sheet"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  width: '100%',
                  maxWidth: '794px',
                }}
               contentEditable={true} suppressContentEditableWarning={true}>
                {/* PAGE 1: HEADER, SERVICE DETAILS, EARNINGS & DEDUCTIONS */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px',
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                    fontSize: '9pt',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ height: 42, objectFit: 'contain', marginBottom: 4 }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <h1
                        style={{
                          fontSize: '19pt',
                          letterSpacing: '0.35em',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '2px 0 0 0',
                          textTransform: 'uppercase',
                        }}
                      >
                        T A S K N E R A
                      </h1>
                      <p
                        style={{
                          fontSize: '7.5pt',
                          letterSpacing: '0.12em',
                          color: '#64748b',
                          margin: '3px 0 0 0',
                          textTransform: 'uppercase',
                        }}
                      >
                        GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                      </p>
                    </div>

                    {/* Ref & Date */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 600,
                        margin: '10px 0 8px 0',
                        fontSize: '9.5pt',
                      }}
                    >
                      <div>
                        <span>Ref. No.: </span>
                        <span>{renderHighlighted(refNumber)}</span>
                      </div>
                      <div>
                        <span>Date: </span>
                        <span>{renderHighlighted(letterDate)}</span>
                      </div>
                    </div>

                    {/* To Address */}
                    <div style={{ marginBottom: 10, fontSize: '9pt', lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 700 }}>To,</div>
                      <div style={{ fontWeight: 700 }}>{renderHighlighted(employeeFullName)}</div>
                      <div>
                        <span>Employee ID: </span>
                        <span>{renderHighlighted(employeeId)}</span>
                        <span> | </span>
                        <span>{renderHighlighted(designation)}</span>
                        <span>, </span>
                        <span>{renderHighlighted(department)}</span>
                      </div>
                      <div>{renderHighlighted(residentialAddress)}</div>
                    </div>

                    {/* Subject */}
                    <div style={{ margin: '8px 0', fontWeight: 700, fontSize: '10pt' }}>
                      Subject: Full and Final Settlement Statement
                    </div>

                    {/* Salutation & Intro */}
                    <div style={{ marginBottom: 8 }}>
                      Dear {renderHighlighted(employeeFullName.split(' ')[0] || employeeFullName)},
                    </div>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: '0 0 10px 0', textAlign: 'justify', lineHeight: 1.4, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      Further to your resignation dated {renderHighlighted(resignationDate)} and your relief from the services of Tasknera at the close of business on {renderHighlighted(lastWorkingDay)} (the “<strong>Last Working Day</strong>”), please find below the statement of your full and final settlement, computed in accordance with your appointment letter and Company policies.
                    </p>

                    {/* Service Details Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8.5pt',
                        marginBottom: 12,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={4} style={{ padding: '4px 8px', textAlign: 'left', fontWeight: 700 }}>
                            Service Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Date of joining
                          </td>
                          <td style={{ width: '28%', padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(dateOfJoining)}
                          </td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Last Working Day
                          </td>
                          <td style={{ width: '28%', padding: '4px 8px' }}>
                            {renderHighlighted(lastWorkingDay)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Notice period
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(noticePeriodDays)} days
                          </td>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Notice served
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            {renderHighlighted(noticeServedDays)} days
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Total service
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(totalService)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '4px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Monthly gross salary
                          </td>
                          <td style={{ padding: '4px 8px' }}>
                            ₹{monthlyGrossSalary.toLocaleString('en-IN')} INR
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Earnings & Deductions Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8.5pt',
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '5px 6px', width: '28px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>
                            No.
                          </th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '44%', borderRight: '1px solid #94a3b8' }}>
                            Description
                          </th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '30%', borderRight: '1px solid #94a3b8' }}>
                            Basis / remarks
                          </th>
                          <th style={{ padding: '5px 8px', textAlign: 'right' }}>
                            Amount (INR)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* A. Earnings Header */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={4} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            A. Earnings
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>1</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            Salary for days worked in {salaryWorkedMonth}
                          </td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {salaryWorkedDays} days
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {salaryWorkedAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>2</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Leave encashment</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {leaveEncashDays} days
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {leaveEncashAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>3</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Bonus / incentive / variable pay</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{bonusDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {bonusAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>4</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Gratuity (if eligible)</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{gratuityDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {gratuityAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>5</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Reimbursements and claims</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{reimburseDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {reimburseAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>6</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Other earnings</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{otherEarningsDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {otherEarningsAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700, borderBottom: '1.5px solid #94a3b8' }}>
                          <td colSpan={3} style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            Total earnings (A)
                          </td>
                          <td style={{ textAlign: 'right', padding: '5px 8px' }}>
                            {totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>

                        {/* B. Deductions Header */}
                        <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 700 }}>
                          <td colSpan={4} style={{ padding: '4px 8px', borderBottom: '1px solid #cbd5e1' }}>
                            B. Deductions
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>1</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Notice-period shortfall recovery</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {noticeShortfallDays} days
                          </td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {noticeShortfallAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>2</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Outstanding advances / loans</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{advanceDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {advanceAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>3</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Unreturned Company assets</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{unreturnedAssetsDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {unreturnedAssetsAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>4</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Statutory deductions (PF / ESI / Professional Tax)</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{statutoryDeductionsDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {statutoryDeductionsAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>5</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Income tax (TDS)</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{tdsDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {tdsAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>6</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>Other recoveries</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{otherDeductionsDetails}</td>
                          <td style={{ textAlign: 'right', padding: '4px 8px' }}>
                            {otherDeductionsAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc', fontWeight: 700 }}>
                          <td colSpan={3} style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            Total deductions (B)
                          </td>
                          <td style={{ textAlign: 'right', padding: '5px 8px' }}>
                            {totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Page 1 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: '7.5pt',
                      color: '#64748b',
                    }}
                  >
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div>Confidential | Page 1 of 2</div>
                  </div>
                </div>

                {/* PAGE 2: NET AMOUNT, PAYMENT MODE, SIGNATURES & ACKNOWLEDGEMENT */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px',
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                    fontSize: '9pt',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    {/* Header Page 2 */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: '8.5pt',
                        color: '#64748b',
                        paddingBottom: 8,
                        borderBottom: '1px solid #cbd5e1',
                        marginBottom: 16,
                      }}
                    >
                      <span>TASKNERA | Full and Final Settlement Statement</span>
                    </div>

                    {/* Net Amount Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '9pt',
                        marginBottom: 16,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <tbody>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff', fontWeight: 700 }}>
                          <td style={{ width: '28px', textAlign: 'center', padding: '6px', borderRight: '1px solid #94a3b8' }}></td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #94a3b8' }}>
                            Net amount payable (A – B)
                          </td>
                          <td style={{ padding: '6px 8px', borderRight: '1px solid #94a3b8', width: '30%' }}></td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '10.5pt' }}>
                            ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td colSpan={2} style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Net amount in words
                          </td>
                          <td colSpan={2} style={{ padding: '6px 8px', fontStyle: 'italic', fontWeight: 600 }}>
                            {renderHighlighted(netAmountWords)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td colSpan={2} style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Mode of payment
                          </td>
                          <td colSpan={2} style={{ padding: '6px 8px' }}>
                            {renderHighlighted(paymentMode)} to account ending {renderHighlighted(accountEnding)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Date of payment
                          </td>
                          <td colSpan={2} style={{ padding: '6px 8px' }}>
                            {renderHighlighted(paymentDate)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Clauses */}
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: '0 0 10px 0', textAlign: 'justify', lineHeight: 1.45, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      Your confidentiality, data-protection and other post-employment obligations under your appointment letter and Company policies continue to apply. Any statutory documents, including Form 16, will be issued as per applicable timelines.
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: '0 0 16px 0', textAlign: 'justify', lineHeight: 1.45, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      We thank you for your contribution to Tasknera and wish you every success in your future endeavours.
                    </p>

                    {/* Sign-off for Tasknera */}
                    <div style={{ marginBottom: 20 }}>
                      <div>Yours faithfully,</div>
                      <div style={{ fontWeight: 700, margin: '2px 0 12px 0' }}>
                        For and on behalf of TASKNERA
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', maxWidth: 440 }}>
                        <div>
                          <div style={{ height: 42, display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                            <img
                              src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                              alt="Sheetal Bedi Signature"
                              style={{ maxHeight: 38, objectFit: 'contain' }}
                            />
                          </div>
                          <div
                            style={{
                              borderBottom: '1px solid #0f172a',
                              width: 200,
                              display: 'flex',
                              alignItems: 'flex-end',
                              paddingBottom: 4,
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ fontSize: '8pt', color: '#94a3b8', fontStyle: 'italic' }}>
                              Signature of Authorised Signatory
                            </span>
                          </div>
                          <div style={{ fontWeight: 700 }}>Name: Ms. Sheetal Bedi</div>
                          <div>Designation: Chief Executive Officer (CEO)</div>
                          <div>Date: {renderHighlighted(paymentDate)}</div>
                          <div>Place: Delhi, India</div>
                        </div>
                      </div>
                    </div>

                    {/* Employee Acknowledgement Block */}
                    <div
                      style={{
                        borderTop: '1px solid #94a3b8',
                        paddingTop: 12,
                        marginTop: 12,
                      }}
                    >
                      <h4 style={{ fontSize: '9.5pt', fontWeight: 700, margin: '0 0 6px 0' }}>
                        Employee Acknowledgement
                      </h4>
                      <p style={{ margin: '0 0 16px 0', textAlign: 'justify', lineHeight: 1.4 }}>
                        I, {renderHighlighted(employeeFullName)} (Employee ID: {renderHighlighted(employeeId)}), acknowledge receipt of the net amount of INR {renderHighlighted(netPayable.toLocaleString('en-IN'))} as full and final settlement of all my dues from Tasknera. I confirm that I have no further claim of any nature against the Company.
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 10 }}>
                        <div>
                          <div style={{ borderBottom: '1px solid #0f172a', height: 40, marginBottom: 4 }} />
                          <div style={{ fontWeight: 700 }}>Signature of Employee</div>
                          <div>Date: {renderHighlighted(employeeAckDate)}</div>
                          <div>Place: {renderHighlighted(employeeAckPlace)}</div>
                        </div>

                        <div>
                          <div style={{ borderBottom: '1px solid #0f172a', height: 40, marginBottom: 4 }} />
                          <div style={{ fontWeight: 700 }}>Prepared by (Finance / HR)</div>
                          <div>Name: {renderHighlighted(preparedByName)}</div>
                          <div>Date: {renderHighlighted(preparedByDate)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #cbd5e1',
                      paddingTop: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: '7.5pt',
                      color: '#64748b',
                    }}
                  >
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div>Confidential | Page 2 of 2</div>
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
