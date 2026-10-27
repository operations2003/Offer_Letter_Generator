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
  Laptop,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  UserCheck,
  Building,
  Briefcase,
  User,
  ShieldCheck,
  Edit3,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

export interface AssetRowItem {
  id: string;
  no: number;
  asset: string;
  makeModel: string;
  serialNo: string;
  qty: string;
  condition: string;
  remarks: string;
}

const DEFAULT_ASSET_ROWS: AssetRowItem[] = [
  {
    id: 'ast-1',
    no: 1,
    asset: 'Laptop / desktop',
    makeModel: 'Lenovo ThinkPad T14 Gen 4',
    serialNo: 'PF-491A29X',
    qty: '1',
    condition: 'Good',
    remarks: 'Pre-configured with dev stack & VPN',
  },
  {
    id: 'ast-2',
    no: 2,
    asset: 'Charger / power adapter',
    makeModel: 'Lenovo 65W Type-C AC Adapter',
    serialNo: 'LN-65W-8812',
    qty: '1',
    condition: 'Good',
    remarks: 'Original 3-pin cable included',
  },
  {
    id: 'ast-3',
    no: 3,
    asset: 'Mobile phone / SIM',
    makeModel: 'Airtel Corporate 5G SIM',
    serialNo: '899100092837192',
    qty: '1',
    condition: 'Good',
    remarks: 'Postpaid corporate voice & data',
  },
  {
    id: 'ast-4',
    no: 4,
    asset: 'ID card / access card',
    makeModel: 'RFID Smart Badge',
    serialNo: 'TN-ACC-1088',
    qty: '1',
    condition: 'Good',
    remarks: 'Floor 3 & 4 turnstile clearance',
  },
  {
    id: 'ast-5',
    no: 5,
    asset: 'Peripherals (mouse, keyboard, headset)',
    makeModel: 'Logitech MK295 Wireless Combo',
    serialNo: 'LG-MK295-8831',
    qty: '1 Set',
    condition: 'Good',
    remarks: 'Wireless USB receiver attached',
  },
  {
    id: 'ast-6',
    no: 6,
    asset: 'Other: Laptop Backpack',
    makeModel: 'Tasknera Branded Water-Resistant Bag',
    serialNo: 'TN-BP-402',
    qty: '1',
    condition: 'Good',
    remarks: 'Issued with padded compartment',
  },
  {
    id: 'ast-7',
    no: 7,
    asset: 'Other: Multi-Port Hub',
    makeModel: 'Anker 7-in-1 USB-C Hub',
    serialNo: 'AK-HUB-7712',
    qty: '1',
    condition: 'Good',
    remarks: 'HDMI / USB 3.0 / SD Card reader',
  },
];

interface AssetHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const AssetHandoverModal: React.FC<AssetHandoverModalProps> = ({
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

  // Handover Reference Number
  const [refNumber, setRefNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/AST/${year}/${rand}`;
  });

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

  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));

  // Employee Details
  const [employeeFullName, setEmployeeFullName] = useState<string>('Aarav Sharma');
  const [employeeId, setEmployeeId] = useState<string>('EMP-1088');
  const [designation, setDesignation] = useState<string>('Associate Talent Consultant');
  const [department, setDepartment] = useState<string>('Workforce & Recruitment Solutions');

  // Transaction Particulars
  const [transactionType, setTransactionType] = useState<'ISSUE' | 'RETURN'>('ISSUE');
  const [transactionDate, setTransactionDate] = useState<string>(() => formatDateString(new Date()));
  const [handledBy, setHandledBy] = useState<string>('Vikram Malhotra (IT / Admin Representative)');

  // Asset Rows
  const [assetRows, setAssetRows] = useState<AssetRowItem[]>(DEFAULT_ASSET_ROWS);

  // IT Clearance Checkboxes (Relevant for Return)
  const [dataBackedUp, setDataBackedUp] = useState<boolean>(false);
  const [accessRevoked, setAccessRevoked] = useState<boolean>(false);
  const [inspectionCompleted, setInspectionCompleted] = useState<boolean>(false);

  // Signatures on Page 2
  const [employeeSignDate, setEmployeeSignDate] = useState<string>(() => formatDateString(new Date()));
  const [itRepName, setItRepName] = useState<string>('Vikram Malhotra');
  const [itRepSignDate, setItRepSignDate] = useState<string>(() => formatDateString(new Date()));
  const [hrRepName, setHrRepName] = useState<string>('Pooja Malhotra');
  const [hrRepSignDate, setHrRepSignDate] = useState<string>(() => formatDateString(new Date()));

  // Preview & Highlighting
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load Employees on Mount
  useEffect(() => {
    if (!isOpen) return;
    setLoadingEmployees(true);
    EmployeeService.listEmployees()
      .then((data) => {
        setEmployees(data);
        if (initialEmployee) {
          applyEmployeeDetails(initialEmployee);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch employee list:', err);
      })
      .finally(() => {
        setLoadingEmployees(false);
      });
  }, [isOpen, initialEmployee]);

  const applyEmployeeDetails = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeFullName(
      emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Aarav Sharma'
    );
    setEmployeeId(emp.employeeId || emp.id.slice(0, 8).toUpperCase());
    setDesignation(emp.designation || 'Staff Member');
    setDepartment(emp.department || 'Operations');
  };

  const handleSelectEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      applyEmployeeDetails(emp);
    } else {
      setSelectedEmployeeId(null);
    }
  };

  const filteredEmployees = useMemo(() => {
    if (!employeeSearchTerm) return employees;
    const term = employeeSearchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(term) ||
        e.employeeId?.toLowerCase().includes(term) ||
        e.designation?.toLowerCase().includes(term) ||
        e.department?.toLowerCase().includes(term)
    );
  }, [employees, employeeSearchTerm]);

  // Asset row management
  const handleUpdateAssetRow = (id: string, field: keyof AssetRowItem, val: any) => {
    setAssetRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const handleAddAssetRow = () => {
    const newNo = assetRows.length + 1;
    const newRow: AssetRowItem = {
      id: `ast-${Date.now()}`,
      no: newNo,
      asset: 'Other: [specify]',
      makeModel: '',
      serialNo: '',
      qty: '1',
      condition: 'Good',
      remarks: '',
    };
    setAssetRows((prev) => [...prev, newRow]);
  };

  const handleDeleteAssetRow = (id: string) => {
    setAssetRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.map((r, idx) => ({ ...r, no: idx + 1 }));
    });
  };

  const handleResetAssetRows = () => {
    setAssetRows(DEFAULT_ASSET_ROWS);
  };

  // Highlighting helper
  const renderHighlighted = (val: string) => {
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

  // Hidden iframe printable PDF generation
  const handleDownloadPdf = () => {
    const el = document.getElementById('printable-asset-handover-sheet');
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
          <title>Asset_Handover_Form_${employeeFullName.replace(/\\s+/g, '_')}</title>
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

  // Save to records
  const handleSaveToRecords = async () => {
    setIsSaving(true);
    try {
      const typeLabel = transactionType === 'ISSUE' ? 'Issue / Allocation' : 'Return / Clearance';
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'ASSET_HANDOVER',
          title: `Asset Handover Form (${typeLabel}) — ${employeeFullName} (${employeeId})`,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          signatoryName: itRepName,
          signatoryTitle: 'IT / Admin Representative',
          effectiveDate: transactionDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber: refNumber,
            employeeFullName,
            employeeId,
            designation,
            department,
            transactionType,
            transactionDate,
            handledBy,
            assetRows,
            dataBackedUp,
            accessRevoked,
            inspectionCompleted,
            itRepName,
            hrRepName,
          });
        }
      } catch (backendErr) {
        console.warn('Backend sync not fully available; writing to local storage cache.', backendErr);
      }

      // Local storage cache persistence
      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-ast-${Date.now()}`,
          documentTypeCode: 'ASSET_HANDOVER',
          title: `Asset Handover Form (${typeLabel}) — ${employeeFullName} (${employeeId})`,
          referenceNumber: refNumber,
          recipientName: employeeFullName,
          recipientEmail: `${employeeFullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`,
          status: 'ISSUED',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          effectiveDate: transactionDate,
          signatoryName: itRepName,
          signatoryTitle: 'IT / Admin Representative',
        };
        docs.unshift(localDoc);
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      success(`Asset Handover Form saved successfully for ${employeeFullName}!`);
      if (onSuccess) onSuccess(createdDoc || undefined);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save Asset Handover record.');
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
          maxWidth: step === 1 ? 940 : 1100,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Modal Header */}
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
                backgroundColor: '#ecfeff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0891b2',
                border: '1px solid #a5f3fc',
              }}
            >
              <Laptop size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Asset Handover Form Generator
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ecfeff',
                    color: '#0891b2',
                    border: '1px solid #a5f3fc',
                  }}
                >
                  TN/HR/AST &bull; 2-Page Official Form
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: transactionType === 'ISSUE' ? '#f0fdf4' : '#fff7ed',
                    color: transactionType === 'ISSUE' ? '#16a34a' : '#ea580c',
                    border: transactionType === 'ISSUE' ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                  }}
                >
                  {transactionType === 'ISSUE' ? 'Hardware Issuance' : 'Exit Return & Clearance'}
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                {step === 1
                  ? 'Configure employee details, hardware serial numbers, condition status, and IT return clearance'
                  : 'High-fidelity A4 printable preview matching official Tasknera Asset Handover Form standard'}
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
                    backgroundColor: '#0891b2',
                    borderColor: '#0891b2',
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

        {/* Modal Body */}
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
            /* ========================================================================= */
            /* STEP 1: FORM DATA CONTROLS                                                */
            /* ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Employee Quick Select */}
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
                    <Users size={16} style={{ color: '#0891b2' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill from Employee Database
                    </span>
                  </div>
                  {loadingEmployees && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Loading employees...</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Select Existing Employee
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
                      <option value="">-- Choose employee to pre-fill --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} ({emp.employeeId || emp.id.slice(0, 4)}) - {emp.designation || 'Staff'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Search by Name / ID
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

              {/* Reference & Transaction Particulars */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Handover Particulars &amp; Transaction Mode
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
                      Document Date
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
                      Transaction Type
                    </label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: transactionType === 'ISSUE' ? '#f0fdf4' : '#f8fafc',
                          color: transactionType === 'ISSUE' ? '#16a34a' : '#475569',
                          border: transactionType === 'ISSUE' ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: 8,
                        }}
                      >
                        <input
                          type="radio"
                          name="transactionType"
                          checked={transactionType === 'ISSUE'}
                          onChange={() => setTransactionType('ISSUE')}
                          style={{ accentColor: '#16a34a' }}
                        />
                        <span>Issue (New Joiner)</span>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          backgroundColor: transactionType === 'RETURN' ? '#fff7ed' : '#f8fafc',
                          color: transactionType === 'RETURN' ? '#ea580c' : '#475569',
                          border: transactionType === 'RETURN' ? '1.5px solid #fdba74' : '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: 8,
                        }}
                      >
                        <input
                          type="radio"
                          name="transactionType"
                          checked={transactionType === 'RETURN'}
                          onChange={() => setTransactionType('RETURN')}
                          style={{ accentColor: '#ea580c' }}
                        />
                        <span>Return (Exit / Transfer)</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Date of Transaction
                    </label>
                    <input
                      type="text"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
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
                      Handled By (IT / Admin)
                    </label>
                    <input
                      type="text"
                      value={handledBy}
                      onChange={(e) => setHandledBy(e.target.value)}
                      placeholder="e.g. Vikram Malhotra (IT Support)"
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

              {/* Employee Details Form */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Employee Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
              </div>

              {/* Hardware Asset Particulars Table Editor */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Hardware &amp; Equipment Particulars ({assetRows.length} Assets Listed)
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                      Itemized hardware equipment, serial numbers / asset tags, quantities, condition &amp; notes.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="secondary"
                      icon={<Plus size={13} />}
                      onClick={handleAddAssetRow}
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      Add Custom Asset
                    </Button>
                    <button
                      type="button"
                      onClick={handleResetAssetRows}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '6px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <RefreshCw size={12} />
                      <span>Reset Standard 7 Assets</span>
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', width: '38px', textAlign: 'center' }}>No.</th>
                        <th style={{ padding: '8px 10px', width: '22%' }}>Asset</th>
                        <th style={{ padding: '8px 10px', width: '20%' }}>Make / model</th>
                        <th style={{ padding: '8px 10px', width: '18%' }}>Serial no. / asset tag</th>
                        <th style={{ padding: '8px 10px', width: '10%', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px 10px', width: '12%' }}>Condition</th>
                        <th style={{ padding: '8px 10px' }}>Remarks</th>
                        <th style={{ padding: '8px 10px', width: '38px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetRows.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b', padding: '6px 4px' }}>
                            {row.no}
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={row.asset}
                              onChange={(e) => handleUpdateAssetRow(row.id, 'asset', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={row.makeModel}
                              onChange={(e) => handleUpdateAssetRow(row.id, 'makeModel', e.target.value)}
                              placeholder="Make / model"
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={row.serialNo}
                              onChange={(e) => handleUpdateAssetRow(row.id, 'serialNo', e.target.value)}
                              placeholder="Serial / Tag #"
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                                fontFamily: 'monospace',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={row.qty}
                              onChange={(e) => handleUpdateAssetRow(row.id, 'qty', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                                textAlign: 'center',
                              }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <select
                              value={row.condition}
                              onChange={(e) => handleUpdateAssetRow(row.id, 'condition', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                                backgroundColor: '#ffffff',
                              }}
                            >
                              <option value="Good">Good</option>
                              <option value="Fair">Fair</option>
                              <option value="New">New</option>
                              <option value="Damaged">Damaged</option>
                            </select>
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(e) => handleUpdateAssetRow(row.id, 'remarks', e.target.value)}
                              placeholder="Remarks"
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                borderRadius: 6,
                                border: '1px solid #cbd5e1',
                                fontSize: '0.8125rem',
                              }}
                            />
                          </td>
                          <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssetRow(row.id)}
                              title="Delete asset row"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: 2,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* IT Clearance & Acknowledgement */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <HardDrive size={18} style={{ color: '#0891b2' }} />
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    IT Clearance Checklist (On Return / Separation)
                  </h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 14px 0' }}>
                  Verification of hardware data wipe, software licence revocation, and physical inspection.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: dataBackedUp ? '#f0fdf4' : '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={dataBackedUp}
                      onChange={(e) => setDataBackedUp(e.target.checked)}
                      style={{ width: 17, height: 17, accentColor: '#0891b2', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: dataBackedUp ? 600 : 500 }}>
                      Data backed up and device reset / wiped as per IT policy
                    </span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: accessRevoked ? '#f0fdf4' : '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={accessRevoked}
                      onChange={(e) => setAccessRevoked(e.target.checked)}
                      style={{ width: 17, height: 17, accentColor: '#0891b2', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: accessRevoked ? 600 : 500 }}>
                      Email, system, VPN and software licence access revoked
                    </span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      backgroundColor: inspectionCompleted ? '#f0fdf4' : '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={inspectionCompleted}
                      onChange={(e) => setInspectionCompleted(e.target.checked)}
                      style={{ width: 17, height: 17, accentColor: '#0891b2', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.84rem', color: '#0f172a', fontWeight: inspectionCompleted ? 600 : 500 }}>
                      Physical inspection completed; damage, if any, noted in Remarks
                    </span>
                  </label>
                </div>
              </div>

              {/* Signatures Dates Configuration */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  Signatures &amp; Execution Sign-off (Page 2)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Employee Signature Date
                    </label>
                    <input
                      type="text"
                      value={employeeSignDate}
                      onChange={(e) => setEmployeeSignDate(e.target.value)}
                      placeholder="e.g. 26 October 2026"
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
                      IT / Admin Representative Name
                    </label>
                    <input
                      type="text"
                      value={itRepName}
                      onChange={(e) => setItRepName(e.target.value)}
                      placeholder="e.g. Vikram Malhotra"
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
                      IT / Admin Sign Date
                    </label>
                    <input
                      type="text"
                      value={itRepSignDate}
                      onChange={(e) => setItRepSignDate(e.target.value)}
                      placeholder="e.g. 26 October 2026"
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
                      HR Representative Name
                    </label>
                    <input
                      type="text"
                      value={hrRepName}
                      onChange={(e) => setHrRepName(e.target.value)}
                      placeholder="e.g. Pooja Malhotra"
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
                      HR Sign Date
                    </label>
                    <input
                      type="text"
                      value={hrRepSignDate}
                      onChange={(e) => setHrRepSignDate(e.target.value)}
                      placeholder="e.g. 26 October 2026"
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

              {/* Bottom Proceed Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#0891b2',
                    borderColor: '#0891b2',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Generate 2-Page Form Preview
                </Button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* STEP 2: HIGH-FIDELITY 2-PAGE PRINT PREVIEW                                */
            /* ========================================================================= */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {/* Printable Wrapper (Used for iframe print & on-screen preview) */}
              <div
                id="printable-asset-handover-sheet"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  width: '100%',
                  maxWidth: '794px', // standard A4 width at 96 DPI
                }}
              >
                {/* ==================================================================== */}
                {/* PAGE 1: HEADER, EMPLOYEE DETAILS, ASSETS TABLE, IT CLEARANCE & ACK   */}
                {/* ==================================================================== */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px', // standard A4 height at 96 DPI
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Header Logo & Brand */}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ height: 42, objectFit: 'contain', marginBottom: 4 }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
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

                    {/* Reference & Date Bar */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '9.5pt',
                        color: '#0f172a',
                        fontWeight: 600,
                        margin: '12px 0 8px 0',
                        paddingBottom: '4px',
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

                    {/* Form Title */}
                    <div style={{ margin: '8px 0 14px 0' }}>
                      <h2
                        style={{
                          fontSize: '13pt',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: 0,
                          letterSpacing: '0.02em',
                        }}
                      >
                        Asset Handover Form
                      </h2>
                    </div>

                    {/* Section 1: Employee Details Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '9pt',
                        color: '#0f172a',
                        marginBottom: 14,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th
                            colSpan={4}
                            style={{
                              padding: '5px 8px',
                              textAlign: 'left',
                              fontWeight: 700,
                              fontSize: '9.5pt',
                              color: '#0f172a',
                            }}
                          >
                            Employee Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Employee name
                          </td>
                          <td style={{ width: '28%', padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(employeeFullName)}
                          </td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Employee ID
                          </td>
                          <td style={{ width: '28%', padding: '5px 8px' }}>
                            {renderHighlighted(employeeId)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Designation
                          </td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(designation)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Department
                          </td>
                          <td style={{ padding: '5px 8px' }}>
                            {renderHighlighted(department)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Transaction type
                          </td>
                          <td colSpan={3} style={{ padding: '5px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '12pt', lineHeight: 1 }}>
                                  {transactionType === 'ISSUE' ? '☑' : '☐'}
                                </span>
                                <span>Issue to employee (new joiner / replacement)</span>
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: '12pt', lineHeight: 1 }}>
                                  {transactionType === 'RETURN' ? '☑' : '☐'}
                                </span>
                                <span>Return by employee (exit / transfer)</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Date of transaction
                          </td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            {renderHighlighted(transactionDate)}
                          </td>
                          <td style={{ fontWeight: 700, padding: '5px 8px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>
                            Handled by
                          </td>
                          <td style={{ padding: '5px 8px' }}>
                            {renderHighlighted(handledBy)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 2: Assets Table */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8.5pt',
                        color: '#0f172a',
                        marginBottom: 14,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '6px 4px', width: '28px', textAlign: 'center', borderRight: '1px solid #94a3b8' }}>
                            No.
                          </th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '24%', borderRight: '1px solid #94a3b8' }}>
                            Asset
                          </th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '21%', borderRight: '1px solid #94a3b8' }}>
                            Make / model
                          </th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '20%', borderRight: '1px solid #94a3b8' }}>
                            Serial no. / asset tag
                          </th>
                          <th style={{ padding: '6px 6px', textAlign: 'center', width: '38px', borderRight: '1px solid #94a3b8' }}>
                            Qty
                          </th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '13%', borderRight: '1px solid #94a3b8' }}>
                            Condition
                          </th>
                          <th style={{ padding: '6px 8px', textAlign: 'left' }}>
                            Remarks
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetRows.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 4px', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>
                              {item.no}
                            </td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1', fontWeight: 600 }}>
                              {renderHighlighted(item.asset)}
                            </td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {renderHighlighted(item.makeModel || '—')}
                            </td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '8pt' }}>
                              {renderHighlighted(item.serialNo || '—')}
                            </td>
                            <td style={{ padding: '5px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                              {renderHighlighted(item.qty || '1')}
                            </td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {renderHighlighted(item.condition || 'Good')}
                            </td>
                            <td style={{ padding: '5px 8px' }}>
                              {renderHighlighted(item.remarks || '—')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Section 3: IT Clearance (on return only) */}
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '8.5pt',
                        color: '#0f172a',
                        marginBottom: 14,
                        border: '1px solid #94a3b8',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, borderRight: '1px solid #94a3b8' }}>
                            IT clearance (on return only)
                          </th>
                          <th style={{ padding: '6px 8px', textAlign: 'center', width: '70px', fontWeight: 700 }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            Data backed up and device reset / wiped as per IT policy
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '11pt' }}>
                            {dataBackedUp ? '☑' : '☐'}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            Email, system, VPN and software licence access revoked
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '11pt' }}>
                            {accessRevoked ? '☑' : '☐'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>
                            Physical inspection completed; damage, if any, noted in Remarks
                          </td>
                          <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: '11pt' }}>
                            {inspectionCompleted ? '☑' : '☐'}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Section 4: Acknowledgement */}
                    <div style={{ marginTop: 10 }}>
                      <h4
                        style={{
                          fontSize: '9.5pt',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '0 0 6px 0',
                        }}
                      >
                        Acknowledgement
                      </h4>

                      <p
                        style={{
                          fontSize: '8.5pt',
                          lineHeight: 1.45,
                          color: '#0f172a',
                          margin: '0 0 8px 0',
                          textAlign: 'justify',
                        }}
                      >
                        <strong style={{ fontWeight: 700 }}>On issue: </strong>
                        I acknowledge receipt of the above assets in the condition recorded. I will use them only for official
                        purposes, keep them secure, not install unauthorised software, report any loss or damage immediately, and
                        return them on request or at the time of separation. I understand that the cost of loss or damage caused by
                        negligence may be recovered in accordance with Company policy.
                      </p>

                      <p
                        style={{
                          fontSize: '8.5pt',
                          lineHeight: 1.45,
                          color: '#0f172a',
                          margin: 0,
                          textAlign: 'justify',
                        }}
                      >
                        <strong style={{ fontWeight: 700 }}>On return: </strong>
                        I confirm that I have returned the above assets to the Company, and that no Company data has
                        been retained by me on any personal device or account.
                      </p>
                    </div>
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
                    <div>
                      TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com
                    </div>
                    <div>
                      Confidential | Page 1 of 2
                    </div>
                  </div>
                </div>

                {/* ==================================================================== */}
                {/* PAGE 2: HEADER, SIGNATURES & EXECUTION DETAILS                       */}
                {/* ==================================================================== */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px', // standard A4 height at 96 DPI
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                  }}
                >
                  <div>
                    {/* Page 2 Top Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: '8.5pt',
                        color: '#64748b',
                        paddingBottom: 8,
                        borderBottom: '1px solid #cbd5e1',
                        marginBottom: 44,
                      }}
                    >
                      <span>TASKNERA | Asset Handover Form</span>
                    </div>

                    {/* Signatures Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 28,
                        marginTop: 20,
                      }}
                    >
                      {/* Column 1: Signature of Employee */}
                      <div>
                        <div
                          style={{
                            borderBottom: '1.5px solid #0f172a',
                            marginBottom: 8,
                            height: 60,
                            display: 'flex',
                            alignItems: 'flex-end',
                            paddingBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: '8pt', color: '#94a3b8', fontStyle: 'italic' }}>
                            [Employee Signature]
                          </span>
                        </div>
                        <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          Signature of Employee
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#334155' }}>
                          <span style={{ fontWeight: 600 }}>Date: </span>
                          <span>{renderHighlighted(employeeSignDate)}</span>
                        </div>
                      </div>

                      {/* Column 2: IT / Admin Representative */}
                      <div>
                        <div
                          style={{
                            borderBottom: '1.5px solid #0f172a',
                            marginBottom: 8,
                            height: 60,
                            display: 'flex',
                            alignItems: 'flex-end',
                            paddingBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: '8pt', color: '#94a3b8', fontStyle: 'italic' }}>
                            [Authorized IT Signature]
                          </span>
                        </div>
                        <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          IT / Admin Representative
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#334155', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600 }}>Name: </span>
                          <span>{renderHighlighted(itRepName)}</span>
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#334155' }}>
                          <span style={{ fontWeight: 600 }}>Date: </span>
                          <span>{renderHighlighted(itRepSignDate)}</span>
                        </div>
                      </div>

                      {/* Column 3: HR Representative */}
                      <div>
                        <div
                          style={{
                            borderBottom: '1.5px solid #0f172a',
                            marginBottom: 8,
                            height: 60,
                            display: 'flex',
                            alignItems: 'flex-end',
                            paddingBottom: 4,
                          }}
                        >
                          <span style={{ fontSize: '8pt', color: '#94a3b8', fontStyle: 'italic' }}>
                            [Authorized HR Signature]
                          </span>
                        </div>
                        <div style={{ fontSize: '9pt', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          HR Representative
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#334155', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600 }}>Name: </span>
                          <span>{renderHighlighted(hrRepName)}</span>
                        </div>
                        <div style={{ fontSize: '8.5pt', color: '#334155' }}>
                          <span style={{ fontWeight: 600 }}>Date: </span>
                          <span>{renderHighlighted(hrRepSignDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Notes / Seal box */}
                    <div
                      style={{
                        marginTop: 70,
                        border: '1px dashed #cbd5e1',
                        borderRadius: 8,
                        padding: '16px 20px',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <div style={{ fontSize: '8.5pt', fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                        Administrative &amp; Record-keeping Instructions:
                      </div>
                      <ul
                        style={{
                          fontSize: '8pt',
                          color: '#64748b',
                          margin: 0,
                          paddingLeft: 18,
                          lineHeight: 1.5,
                        }}
                      >
                        <li>
                          The original signed copy of this form must be deposited with HR Operations for employee personnel records.
                        </li>
                        <li>
                          A digital scan must be uploaded to the IT Asset Management portal within 24 hours of issuance or clearance.
                        </li>
                        <li>
                          In the event of hardware damage or missing accessories, an incident report must be attached alongside.
                        </li>
                      </ul>
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
                    <div>
                      TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com
                    </div>
                    <div>
                      Confidential | Page 2 of 2
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
