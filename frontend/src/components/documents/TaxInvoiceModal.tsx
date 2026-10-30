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
  FileSpreadsheet,
  Receipt,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface TaxInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InvoiceItem {
  id: string;
  sNo: number;
  description: string;
  sac: string;
  qty: number;
  rate: number;
}

export const TaxInvoiceModal: React.FC<TaxInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success } = useToast();
  const printId = useId();

  // Invoice Metadata
  const currentYear = new Date().getFullYear();
  const [invoiceNo, setInvoiceNo] = useState(`TN/INV/${currentYear}-${(currentYear + 1).toString().slice(-2)}/089`);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000 * 15).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [placeOfSupply, setPlaceOfSupply] = useState('Delhi (07)');
  const [poReference, setPoReference] = useState('PO-NX-2026-1182');
  const [billingPeriod, setBillingPeriod] = useState(`01 October ${currentYear} – 31 October ${currentYear}`);
  const [paymentTerms, setPaymentTerms] = useState('Net 15 days');

  // Billed By (Tasknera)
  const [sellerGstin, setSellerGstin] = useState('07AABCT9982Q1Z4');
  const [sellerPan, setSellerPan] = useState('AABCT9982Q');

  // Billed To (Client)
  const [clientLegalName, setClientLegalName] = useState('AuraSphere Digital Commerce India Pvt. Ltd.');
  const [clientAddress, setClientAddress] = useState('Unit 504, 5th Floor, Ambience Corporate Tower, Vasant Kunj, New Delhi – 110070');
  const [clientGstin, setClientGstin] = useState('07AAKCA1289P1ZV');
  const [clientPan, setClientPan] = useState('AAKCA1289P');
  const [clientContactPerson, setClientContactPerson] = useState('Ms. Priyadarshini Sen (accounts@aurasphere.in)');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      sNo: 1,
      description: 'Retained Executive Search & Recruitment Services – VP of Engineering',
      sac: '998311',
      qty: 1,
      rate: 150000,
    },
    {
      id: '2',
      sNo: 2,
      description: 'End-to-End Candidate Background Verification & Credential Authentication',
      sac: '998312',
      qty: 8,
      rate: 3500,
    },
    {
      id: '3',
      sNo: 3,
      description: 'Tasknera ATS Enterprise Platform Access & Dedicated Tenant Hosting',
      sac: '998313',
      qty: 1,
      rate: 30000,
    },
  ]);

  const [taxMode, setTaxMode] = useState<'CGST_SGST' | 'IGST'>('CGST_SGST');

  // Bank & Payment Details
  const [bankNameBranch, setBankNameBranch] = useState('HDFC Bank Ltd., Dilshad Garden Branch, Delhi');
  const [accountNumber, setAccountNumber] = useState('50200088921455');
  const [ifscCode, setIfscCode] = useState('HDFC0001248');
  const [upiId, setUpiId] = useState('tasknera.business@hdfcbank');

  // Notes & Signatory
  const [lateFeePercent, setLateFeePercent] = useState('1.5');
  const [supportEmail, setSupportEmail] = useState('billing@tasknera.com');
  const [ceoName, setCeoName] = useState('Ms. Sheetal Bedi');
  const [ceoDesignation, setCeoDesignation] = useState('Chief Executive Officer (CEO)');
  const [ceoPlace, setCeoPlace] = useState('Delhi, India');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const cgst = taxMode === 'CGST_SGST' ? Math.round(subTotal * 0.09) : 0;
  const sgst = taxMode === 'CGST_SGST' ? Math.round(subTotal * 0.09) : 0;
  const igst = taxMode === 'IGST' ? Math.round(subTotal * 0.18) : 0;
  const totalAmountDue = subTotal + cgst + sgst + igst;

  const numberToWords = (num: number) => {
    return `${num.toLocaleString('en-IN')} Indian Rupees`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `TASKNERA - Tax Invoice
Invoice No: ${invoiceNo} | Date: ${invoiceDate}
Billed To: ${clientLegalName}
Total Amount Due: INR ${totalAmountDue.toLocaleString('en-IN')}
Due Date: ${dueDate}
Bank: ${bankNameBranch} | A/C: ${accountNumber} | IFSC: ${ifscCode}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Invoice summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddItem = () => {
    const nextSno = items.length + 1;
    setItems([
      ...items,
      {
        id: String(Date.now()),
        sNo: nextSno,
        description: 'Recruitment Advisory & Workforce Consultation',
        sac: '998311',
        qty: 1,
        rate: 25000,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    const filtered = items.filter((item) => item.id !== id);
    const renumbered = filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
    setItems(renumbered);
  };

  return (
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
                backgroundColor: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  GST Tax Invoice
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(5, 150, 105, 0.25)',
                    color: '#6ee7b7',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  TN/INV Format &bull; 2 Pages
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Invoice No: {invoiceNo} &bull; Total: INR {totalAmountDue.toLocaleString('en-IN')}
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
                  backgroundColor: activeTab === 'editor' ? '#059669' : 'transparent',
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
                  backgroundColor: activeTab === 'preview' ? '#059669' : 'transparent',
                  color: activeTab === 'preview' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Invoice Preview (2 Pages)
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
              {/* Card 1: Invoice Header & Parties */}
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
                  <Building size={16} style={{ color: '#059669' }} />
                  Invoice Numbers &amp; Billed To Particulars
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Invoice Date
                    </label>
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Payment Due Date
                    </label>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Place of Supply
                    </label>
                    <input
                      type="text"
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      PO / Order Reference
                    </label>
                    <input
                      type="text"
                      value={poReference}
                      onChange={(e) => setPoReference(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Billing Period
                    </label>
                    <input
                      type="text"
                      value={billingPeriod}
                      onChange={(e) => setBillingPeriod(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client Legal Name
                    </label>
                    <input
                      type="text"
                      value={clientLegalName}
                      onChange={(e) => setClientLegalName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client Registered Address
                    </label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client GSTIN
                    </label>
                    <input
                      type="text"
                      value={clientGstin}
                      onChange={(e) => setClientGstin(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client PAN
                    </label>
                    <input
                      type="text"
                      value={clientPan}
                      onChange={(e) => setClientPan(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Line Items */}
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
                    <FileSpreadsheet size={16} style={{ color: '#059669' }} />
                    Invoice Particulars &amp; SAC Line Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
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
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '36px 3fr 1fr 1fr 1.2fr 1.2fr 36px',
                        gap: 8,
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderRadius: 6,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>
                        {item.sNo}
                      </span>
                      <input
                        type="text"
                        value={item.description}
                        placeholder="Service Description"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].description = e.target.value;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={item.sac}
                        placeholder="SAC Code"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].sac = e.target.value;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="number"
                        value={item.qty}
                        placeholder="Qty"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].qty = Number(e.target.value) || 0;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="number"
                        value={item.rate}
                        placeholder="Rate (INR)"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].rate = Number(e.target.value) || 0;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textAlign: 'right', paddingRight: 4 }}>
                        INR {(item.qty * item.rate).toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      GST Structure
                    </label>
                    <select
                      value={taxMode}
                      onChange={(e) => setTaxMode(e.target.value as any)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    >
                      <option value="CGST_SGST">Intra-State (CGST 9% + SGST 9%)</option>
                      <option value="IGST">Inter-State (IGST 18%)</option>
                    </select>
                  </div>
                  <div style={{ backgroundColor: '#ecfdf5', padding: '10px 14px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, display: 'block' }}>
                      Total Amount Due (Incl. Taxes)
                    </span>
                    <span style={{ fontSize: '1.15rem', color: '#065f46', fontWeight: 800 }}>
                      INR {totalAmountDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Bank & Settlement Particulars */}
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
                  <DollarSign size={16} style={{ color: '#059669' }} />
                  Tasknera Remittance Bank Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Bank &amp; Branch
                    </label>
                    <input
                      type="text"
                      value={bankNameBranch}
                      onChange={(e) => setBankNameBranch(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PRINT PREVIEW (2 PAGES) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
              {/* PAGE 1 */}
              <div
                id={`print-invoice-p1-${printId}`}
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
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
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

                  {/* Invoice Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Invoice No.: </span>
                      <span style={{ fontSize: '0.85rem' }}>{invoiceNo}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Invoice Date: </span>
                      <span style={{ fontSize: '0.85rem' }}>{invoiceDate}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.06em', marginBottom: 12, textAlign: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: 6 }}>
                    TAX INVOICE
                  </div>

                  {/* Billed By & Billed To Box */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', marginBottom: 12 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                        <th style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '50%' }}>Billed by</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '50%' }}>Billed to</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', verticalAlign: 'top', lineHeight: 1.45 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>TASKNERA</div>
                          <div>D-57, Dilshad Colony, Delhi – 110095, India</div>
                          <div>GSTIN: {sellerGstin} | PAN: {sellerPan}</div>
                          <div>careers@tasknera.com</div>
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', verticalAlign: 'top', lineHeight: 1.45 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{clientLegalName}</div>
                          <div>{clientAddress}</div>
                          <div>GSTIN: {clientGstin} | PAN: {clientPan}</div>
                          <div>{clientContactPerson}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 4 Box Metadata Grid */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', marginBottom: 12 }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, width: '25%' }}>Due date</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', width: '25%', fontWeight: 700 }}>{dueDate}</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600, width: '25%' }}>Place of supply</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', width: '25%' }}>{placeOfSupply}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600 }}>PO / Order Ref.</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1' }}>{poReference}</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600 }}>Billing period</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1' }}>{billingPeriod}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600 }}>Payment terms</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1' }}>{paymentTerms}</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 600 }}>Currency</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>INR</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Line Items */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', marginBottom: 10 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #94a3b8', width: '6%' }}>S.No</th>
                        <th style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '48%' }}>Description</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #94a3b8', width: '10%' }}>SAC</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #94a3b8', width: '8%' }}>Qty</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #94a3b8', width: '14%' }}>Rate (INR)</th>
                        <th style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #94a3b8', width: '14%' }}>Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>{item.sNo}</td>
                          <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1' }}>{item.description}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.sac}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.qty}</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>{item.rate.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>{(item.qty * item.rate).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}

                      {/* Sub-total */}
                      <tr>
                        <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>Sub-total</td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>INR {subTotal.toLocaleString('en-IN')}</td>
                      </tr>

                      {/* Taxes */}
                      {taxMode === 'CGST_SGST' ? (
                        <>
                          <tr>
                            <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>CGST @ 9%</td>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>INR {cgst.toLocaleString('en-IN')}</td>
                          </tr>
                          <tr>
                            <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>SGST @ 9%</td>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>INR {sgst.toLocaleString('en-IN')}</td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>IGST @ 18%</td>
                          <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>INR {igst.toLocaleString('en-IN')}</td>
                        </tr>
                      )}

                      {/* Total Amount Due */}
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td colSpan={5} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          Total Amount Due (INR)
                        </td>
                        <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                          INR {totalAmountDue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Amount in Words */}
                  <div style={{ fontSize: '0.75rem', color: '#1e293b', marginBottom: 12 }}>
                    <strong>Amount in words: </strong>
                    <span style={{ fontStyle: 'italic', color: '#0f172a' }}>
                      INR {numberToWords(totalAmountDue)} only
                    </span>
                  </div>

                  {/* Payment Details Box */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 12px', backgroundColor: '#f8fafc', marginBottom: 10, fontSize: '0.72rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Payment Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                      <div><strong>Account name: </strong>TASKNERA</div>
                      <div><strong>Bank &amp; branch: </strong>{bankNameBranch}</div>
                      <div><strong>Account number: </strong>{accountNumber}</div>
                      <div><strong>IFSC Code: </strong>{ifscCode}</div>
                      {upiId && <div style={{ gridColumn: 'span 2' }}><strong>UPI ID (optional): </strong>{upiId}</div>}
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.45 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>Notes</div>
                    <ol style={{ margin: 0, paddingLeft: 16 }}>
                      <li><strong>Payment.</strong> Please pay by the due date and quote the invoice number as the payment reference.</li>
                      <li><strong>Late payment.</strong> Overdue amounts may attract {lateFeePercent}% per month as per the agreed terms.</li>
                      <li><strong>TDS.</strong> If tax is deducted at source, please share the TDS certificate.</li>
                      <li><strong>Queries.</strong> Any query on this invoice should be raised within 7 days of receipt at {supportEmail}.</li>
                    </ol>
                    <div style={{ fontStyle: 'italic', color: '#64748b', marginTop: 4 }}>
                      This is a computer-generated invoice.
                    </div>
                  </div>
                </div>

                {/* Footer Page 1 */}
                <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 10, textAlign: 'center', fontSize: '0.6875rem', color: '#64748b' }}>
                  <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                  <div style={{ marginTop: 2, fontStyle: 'italic' }}>Confidential | Page 1 of 2</div>
                </div>
              </div>

              {/* PAGE 2 */}
              <div
                id={`print-invoice-p2-${printId}`}
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
                      Tax Invoice
                    </span>
                  </div>

                  {/* Signatory Block */}
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

                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
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
                          Date: {invoiceDate}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                          Place: {ceoPlace}
                        </div>
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
  );
};
