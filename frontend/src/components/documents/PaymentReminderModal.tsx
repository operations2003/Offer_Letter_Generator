import { SHEETAL_BEDI_SIGNATURE_DATA_URL } from '../../constants/signature.js';
import React, { useState, useId } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Building,
  Calendar,
  Layers,
  Sparkles,
  FileCheck2,
  DollarSign,
  ClockAlert,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface OverdueInvoice {
  id: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success } = useToast();
  const printId = useId();

  // Notice Metadata
  const currentYear = new Date().getFullYear();
  const [refNumber, setRefNumber] = useState(`TN/FIN/PRN/${currentYear}/001`);
  const [docDate, setDocDate] = useState(
    new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );

  // Notice Stage
  const [noticeStage, setNoticeStage] = useState<'STAGE_1' | 'STAGE_2' | 'STAGE_3'>('STAGE_1');

  // Client Details
  const [clientContactName, setClientContactName] = useState('Mr. Siddharth Mehra');
  const [clientDesignation, setClientDesignation] = useState('Director – Finance & Accounts');
  const [clientCompanyName, setClientCompanyName] = useState('Zenith Infotech Solutions Ltd.');
  const [clientAddress, setClientAddress] = useState('Building 12B, Manyata Tech Park, Nagavara, Bengaluru – 560045');

  // Outstanding Invoices
  const [invoices, setInvoices] = useState<OverdueInvoice[]>([
    {
      id: '1',
      invoiceNo: `TN/INV/${currentYear}-27/044`,
      invoiceDate: '15 September 2026',
      dueDate: '30 September 2026',
      amount: 145000,
      daysOverdue: 27,
    },
    {
      id: '2',
      invoiceNo: `TN/INV/${currentYear}-27/058`,
      invoiceDate: '01 October 2026',
      dueDate: '15 October 2026',
      amount: 85000,
      daysOverdue: 12,
    },
  ]);

  // Payment Terms & Deadlines
  const [paymentDeadlineDate, setPaymentDeadlineDate] = useState(
    new Date(Date.now() + 86400000 * 7).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [lateFeeRate, setLateFeeRate] = useState('2.0');
  const [disputeDays, setDisputeDays] = useState('7');
  const [financeEmail, setFinanceEmail] = useState('billing@tasknera.com');

  // Page 2: Client Acknowledgement
  const [promisedPaymentDate, setPromisedPaymentDate] = useState(
    new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );

  // Signatories
  const [ceoName, setCeoName] = useState('Ms. Sheetal Bedi');
  const [ceoDesignation, setCeoDesignation] = useState('Chief Executive Officer (CEO)');
  const [ceoPlace, setCeoPlace] = useState('Delhi, India');
  const [clientSignatoryName, setClientSignatoryName] = useState('Mr. Siddharth Mehra');
  const [clientSignatoryTitle, setClientSignatoryTitle] = useState('Director – Finance & Accounts');
  const [clientCity, setClientCity] = useState('Bengaluru, India');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Stage details
  const getStageSubject = () => {
    const invList = invoices.map((i) => i.invoiceNo).join(', ');
    switch (noticeStage) {
      case 'STAGE_1':
        return `Payment Reminder – Outstanding Invoice(s) ${invList}`;
      case 'STAGE_2':
        return `Second Reminder: Overdue Payment Notice – Outstanding Invoice(s) ${invList}`;
      case 'STAGE_3':
        return `FINAL NOTICE: Demand for Immediate Payment – Outstanding Invoice(s) ${invList}`;
    }
  };

  const getStageSalutationText = () => {
    switch (noticeStage) {
      case 'STAGE_1':
        return 'We hope you are well. This is a gentle reminder that the invoice below remains unpaid.';
      case 'STAGE_2':
        return 'Despite our earlier reminder, the invoice below remains unpaid. We request your urgent attention to clear this balance.';
      case 'STAGE_3':
        return 'This is a final notice regarding the unpaid invoice below. Failure to settle outstanding dues immediately will lead to formal recovery action.';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `TASKNERA - Payment Follow-up Notice (${noticeStage})
Ref: ${refNumber} | Date: ${docDate}
Client: ${clientCompanyName} (Attn: ${clientContactName})
Total Outstanding: INR ${totalOutstanding.toLocaleString('en-IN')}
Payment Deadline: ${paymentDeadlineDate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Notice summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddInvoice = () => {
    setInvoices([
      ...invoices,
      {
        id: String(Date.now()),
        invoiceNo: `TN/INV/${currentYear}-27/0${invoices.length + 60}`,
        invoiceDate: '10 October 2026',
        dueDate: '25 October 2026',
        amount: 50000,
        daysOverdue: 2,
      },
    ]);
  };

  const handleRemoveInvoice = (id: string) => {
    setInvoices(invoices.filter((i) => i.id !== id));
  };

  return (
    <>
      <style>{`
        @media print {
          [contenteditable] {
            outline: none !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: '1020px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: noticeStage === 'STAGE_3' ? '#dc2626' : noticeStage === 'STAGE_2' ? '#ea580c' : '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ClockAlert size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Payment Follow-up Notice
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor:
                      noticeStage === 'STAGE_3'
                        ? 'rgba(220, 38, 38, 0.25)'
                        : noticeStage === 'STAGE_2'
                        ? 'rgba(234, 88, 12, 0.25)'
                        : 'rgba(37, 99, 235, 0.25)',
                    color: noticeStage === 'STAGE_3' ? '#fca5a5' : noticeStage === 'STAGE_2' ? '#fdba74' : '#93c5fd',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  {noticeStage === 'STAGE_1' ? 'Stage 1: Friendly Reminder' : noticeStage === 'STAGE_2' ? 'Stage 2: Second Reminder' : 'Stage 3: Final Notice'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Ref: {refNumber} &bull; Total Dues: INR {totalOutstanding.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View switcher */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#1e293b',
                padding: 3,
                borderRadius: 8,
                gap: 2,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'editor' ? '#2563eb' : 'transparent',
                  color: activeTab === 'editor' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: activeTab === 'preview' ? '#2563eb' : 'transparent',
                  color: activeTab === 'preview' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Notice Preview (2 Pages)
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              title="Copy Summary"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#e2e8f0',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {copied ? <Check size={14} style={{ color: '#22c55e' }} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#2563eb',
                border: 'none',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#1e293b',
                border: 'none',
                color: '#94a3b8',
                width: 32,
                height: 32,
                borderRadius: 6,
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
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f1f5f9', padding: '24px' }}>
          {activeTab === 'editor' ? (
            /* EDITOR FORM */
            <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Card 1: Reminder Escalation Stage */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={16} style={{ color: '#ea580c' }} />
                  Escalation Stage &amp; Notice Particulars
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  <button
                    type="button"
                    onClick={() => setNoticeStage('STAGE_1')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: noticeStage === 'STAGE_1' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: noticeStage === 'STAGE_1' ? '#eff6ff' : '#f8fafc',
                      color: noticeStage === 'STAGE_1' ? '#1d4ed8' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Stage 1: Friendly Reminder</div>
                    <div style={{ fontSize: '0.72rem', marginTop: 2, color: '#64748b' }}>Polite follow-up for recently overdue invoices</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeStage('STAGE_2')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: noticeStage === 'STAGE_2' ? '2px solid #ea580c' : '1px solid #cbd5e1',
                      backgroundColor: noticeStage === 'STAGE_2' ? '#fff7ed' : '#f8fafc',
                      color: noticeStage === 'STAGE_2' ? '#c2410c' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Stage 2: Second Reminder</div>
                    <div style={{ fontSize: '0.72rem', marginTop: 2, color: '#64748b' }}>Overdue notice with monthly late interest interest</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoticeStage('STAGE_3')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: noticeStage === 'STAGE_3' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      backgroundColor: noticeStage === 'STAGE_3' ? '#fef2f2' : '#f8fafc',
                      color: noticeStage === 'STAGE_3' ? '#b91c1c' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Stage 3: Final Notice</div>
                    <div style={{ fontSize: '0.72rem', marginTop: 2, color: '#64748b' }}>Formal legal warning &amp; service suspension threat</div>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Notice Reference
                    </label>
                    <input
                      type="text"
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Notice Date
                    </label>
                    <input
                      type="text"
                      value={docDate}
                      onChange={(e) => setDocDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Payment Required By Date
                    </label>
                    <input
                      type="text"
                      value={paymentDeadlineDate}
                      onChange={(e) => setPaymentDeadlineDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client Contact Name
                    </label>
                    <input
                      type="text"
                      value={clientContactName}
                      onChange={(e) => setClientContactName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client Designation
                    </label>
                    <input
                      type="text"
                      value={clientDesignation}
                      onChange={(e) => setClientDesignation(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client Company Name
                    </label>
                    <input
                      type="text"
                      value={clientCompanyName}
                      onChange={(e) => setClientCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Overdue Invoices Table */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DollarSign size={16} style={{ color: '#059669' }} />
                    Overdue Invoices Schedule
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddInvoice}
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Plus size={13} /> Add Invoice
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {invoices.map((inv, idx) => (
                    <div
                      key={inv.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1.4fr 1.4fr 1.4fr 1fr 36px',
                        gap: 8,
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderRadius: 6,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <input
                        type="text"
                        value={inv.invoiceNo}
                        placeholder="Invoice No"
                        onChange={(e) => {
                          const updated = [...invoices];
                          updated[idx].invoiceNo = e.target.value;
                          setInvoices(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={inv.invoiceDate}
                        placeholder="Invoice Date"
                        onChange={(e) => {
                          const updated = [...invoices];
                          updated[idx].invoiceDate = e.target.value;
                          setInvoices(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={inv.dueDate}
                        placeholder="Due Date"
                        onChange={(e) => {
                          const updated = [...invoices];
                          updated[idx].dueDate = e.target.value;
                          setInvoices(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="number"
                        value={inv.amount}
                        placeholder="Amount (INR)"
                        onChange={(e) => {
                          const updated = [...invoices];
                          updated[idx].amount = Number(e.target.value) || 0;
                          setInvoices(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="number"
                        value={inv.daysOverdue}
                        placeholder="Days Overdue"
                        onChange={(e) => {
                          const updated = [...invoices];
                          updated[idx].daysOverdue = Number(e.target.value) || 0;
                          setInvoices(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveInvoice(inv.id)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: 4,
                          height: 30,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ backgroundColor: '#fef2f2', padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca' }}>
                    <span style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600 }}>Total Outstanding Balance: </span>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>
                      INR {totalOutstanding.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PRINT PREVIEW (2 PAGES) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
              {/* PAGE 1 */}
              <div
                id={`print-notice-p1-${printId}`}
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '48px 56px 42px 56px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                  color: '#1e293b',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Letterhead Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 4 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 900,
                          fontSize: '1.2rem',
                        }}
                      >
                        T
                      </div>
                      <h1
                        style={{
                          fontSize: '1.6rem',
                          fontWeight: 900,
                          letterSpacing: '0.35em',
                          color: '#0f172a',
                          margin: 0,
                          textTransform: 'uppercase',
                        }}
                      >
                        TASKNERA
                      </h1>
                    </div>
                    <p
                      style={{
                        fontSize: '0.66rem',
                        letterSpacing: '0.18em',
                        color: '#64748b',
                        margin: 0,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                    </p>
                  </div>

                  {/* Ref & Date Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 14 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Ref. No.: </span>
                      <span>{refNumber}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Date: </span>
                      <span>{docDate}</span>
                    </div>
                  </div>

                  {/* To Address Block */}
                  <div style={{ fontSize: '0.8125rem', lineHeight: 1.45, marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>To,</div>
                    <div style={{ fontWeight: 700 }}>{clientContactName}</div>
                    <div style={{ color: '#475569' }}>{clientDesignation}, {clientCompanyName}</div>
                    <div style={{ color: '#475569' }}>{clientAddress}</div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                    Subject: {getStageSubject()}
                  </div>

                  {/* Salutation & Intro */}
                  <div style={{ fontSize: '0.8125rem', color: '#1e293b', marginBottom: 8 }}>
                    Dear {clientContactName},
                  </div>

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: '#334155', margin: '0 0 16px 0', padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    {getStageSalutationText()}
                  </p>

                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>
                    Our records show the following amounts outstanding as of {docDate}:
                  </div>

                  {/* Outstanding Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', marginBottom: 18 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #94a3b8' }}>Invoice No.</th>
                        <th style={{ padding: '6px 10px', textAlign: 'center', border: '1px solid #94a3b8' }}>Invoice date</th>
                        <th style={{ padding: '6px 10px', textAlign: 'center', border: '1px solid #94a3b8' }}>Due date</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #94a3b8' }}>Amount (INR)</th>
                        <th style={{ padding: '6px 10px', textAlign: 'center', border: '1px solid #94a3b8' }}>Days overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{inv.invoiceNo}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{inv.invoiceDate}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{inv.dueDate}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>INR {inv.amount.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{inv.daysOverdue} days</td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td colSpan={3} style={{ padding: '7px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800 }}>
                          Total outstanding
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#dc2626', fontSize: '0.85rem' }}>
                          INR {totalOutstanding.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1' }} />
                      </tr>
                    </tbody>
                  </table>

                  {/* 6 Numbered Points */}
                  <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.78rem', lineHeight: 1.55, color: '#334155' }}>
                    <li style={{ marginBottom: 5 }}>
                      <strong>Request for payment.</strong> Please arrange payment of INR {totalOutstanding.toLocaleString('en-IN')} on or before {paymentDeadlineDate}.
                    </li>
                    <li style={{ marginBottom: 5 }}>
                      <strong>Payment details.</strong> Payment may be made to the bank account stated on the invoice; please quote the invoice number as the reference.
                    </li>
                    <li style={{ marginBottom: 5 }}>
                      <strong>If already paid.</strong> Please share the payment reference (UTR) and date so that we can reconcile our records, and disregard this notice.
                    </li>
                    <li style={{ marginBottom: 5 }}>
                      <strong>Late payment charges.</strong>{' '}
                      {noticeStage !== 'STAGE_1' ? (
                        <span style={{ color: '#b91c1c' }}>
                          In line with the agreed terms, interest of {lateFeeRate}% per month applies to overdue amounts.
                        </span>
                      ) : (
                        <span>Applicable as per mutually agreed contract terms if unpaid beyond standard grace timelines.</span>
                      )}
                    </li>
                    <li style={{ marginBottom: 5 }}>
                      <strong>Further action.</strong>{' '}
                      {noticeStage === 'STAGE_3' ? (
                        <span style={{ color: '#b91c1c', fontWeight: 600 }}>
                          If payment is not received by the date above, we may suspend ongoing services and pursue formal legal recovery in accordance with the agreement.
                        </span>
                      ) : (
                        <span>Continued delays may require elevation to administrative holds and account suspension.</span>
                      )}
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <strong>Queries.</strong> If you dispute any item, please write to us at {financeEmail} within {disputeDays} days so that we can resolve it promptly.
                    </li>
                  </ol>

                  <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ fontSize: '0.8125rem', color: '#1e293b', margin: '10px 0 0 0', padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                    We value our relationship with {clientCompanyName} and appreciate your prompt attention to this matter.
                  </p>
                </div>

                {/* Footer Page 1 */}
                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 10, textAlign: 'center', fontSize: '0.6875rem', color: '#64748b' }}>
                  <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                  <div style={{ marginTop: 2, fontStyle: 'italic' }}>Confidential | Page 1 of 2</div>
                </div>
              </div>

              {/* PAGE 2 */}
              <div
                id={`print-notice-p2-${printId}`}
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  padding: '48px 56px 42px 56px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
                  color: '#1e293b',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Running Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 36 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          background: '#f97316',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 900,
                        }}
                      >
                        T
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                        TASKNERA
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Payment Follow-up Notice
                    </span>
                  </div>

                  {/* Dual Signatures & Acknowledgement Block */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'flex-start' }}>
                    {/* Left: Tasknera Signatory */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#1e293b', marginBottom: 4 }}>
                        Yours sincerely,
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                        For and on behalf of TASKNERA
                      </div>
                      <div style={{ height: 42, display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <img
                          src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                          alt="Sheetal Bedi Signature"
                          style={{ maxHeight: 38, objectFit: 'contain' }}
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
                        <div>
                          <div style={{ borderBottom: '1px solid #94a3b8', width: 220, marginBottom: 8 }} />
                          <div style={{ fontSize: '0.6875rem', color: '#64748b', marginBottom: 8 }}>
                            Signature of Authorised Signatory
                          </div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                            Name: {ceoName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Designation: {ceoDesignation}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Date: {docDate}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Place: {ceoPlace}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Client Acknowledgement */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '0.04em' }}>
                        ACKNOWLEDGEMENT OF NOTICE
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, marginBottom: 30 }}>
                        We, {clientCompanyName}, acknowledge receipt of this notice and confirm payment will be made on {promisedPaymentDate}.
                      </div>

                      <div style={{ borderBottom: '1px solid #94a3b8', width: '100%', marginBottom: 8 }} />
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginBottom: 8 }}>
                        Signature of Authorised Signatory (Client)
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                        Name: {clientSignatoryName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Designation: {clientSignatoryTitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Date: [Select date]
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Place: {clientCity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Page 2 */}
                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 10, textAlign: 'center', fontSize: '0.6875rem', color: '#64748b' }}>
                  <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                  <div style={{ marginTop: 2, fontStyle: 'italic' }}>Confidential | Page 2 of 2</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  );
};
