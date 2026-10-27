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
  ReceiptText,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface CommercialQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface QuoteItem {
  id: string;
  sNo: number;
  description: string;
  sac: string;
  qty: number;
  rate: number;
}

export const CommercialQuotationModal: React.FC<CommercialQuotationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success } = useToast();
  const printId = useId();

  // Quotation Metadata
  const currentYear = new Date().getFullYear();
  const [quotationNo, setQuotationNo] = useState(`TN/BD/QTN/${currentYear}/001`);
  const [quoteDate, setQuoteDate] = useState(
    new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [enquiryRef, setEnquiryRef] = useState('ENQ/2026/10/4482 dated 18 October 2026');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 86400000 * 30).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );

  // Client Details
  const [clientContactName, setClientContactName] = useState('Mr. Anirudh Kulkarni');
  const [clientDesignation, setClientDesignation] = useState('Head of Talent Acquisition & HR');
  const [clientCompanyName, setClientCompanyName] = useState('Horizon Global FinTech Services India Pvt. Ltd.');
  const [clientAddress, setClientAddress] = useState('Level 7, Mindspace IT Park, Hitec City, Hyderabad – 500081');

  // Scope & Service Subject
  const [serviceDescription, setServiceDescription] = useState('Comprehensive HR Recruitment & Pre-Employment Verification Services');
  const [enquiryDate, setEnquiryDate] = useState('18 October 2026');

  // Line Items
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: '1',
      sNo: 1,
      description: 'End-to-end Senior Engineering Recruitment (Lead & Principal roles)',
      sac: '998311',
      qty: 3,
      rate: 45000,
    },
    {
      id: '2',
      sNo: 2,
      description: 'Comprehensive Pre-Employment Background Screening & Verification',
      sac: '998312',
      qty: 15,
      rate: 3200,
    },
    {
      id: '3',
      sNo: 3,
      description: 'Global Contractor Onboarding, Compliance & Dedicated Payroll Retainer',
      sac: '998313',
      qty: 1,
      rate: 35000,
    },
  ]);

  const [discountAmount, setDiscountAmount] = useState(10000);
  const [taxMode, setTaxMode] = useState<'CGST_SGST' | 'IGST'>('IGST');

  // Terms & Conditions
  const [paymentTerms, setPaymentTerms] = useState('50% advance upon PO issuance and balance within 15 days of invoice date');
  const [commencementDays, setCommencementDays] = useState('3');
  const [poNumber, setPoNumber] = useState('PO-HGF-2026-992');

  // Signatories
  const [ceoName, setCeoName] = useState('Ms. Sheetal Bedi');
  const [ceoDesignation, setCeoDesignation] = useState('Chief Executive Officer (CEO)');
  const [ceoPlace, setCeoPlace] = useState('Delhi, India');
  const [clientSignatoryName, setClientSignatoryName] = useState('Mr. Anirudh Kulkarni');
  const [clientSignatoryDesignation, setClientSignatoryDesignation] = useState('Head of Talent Acquisition & HR');
  const [clientCity, setClientCity] = useState('Hyderabad, India');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const taxableValue = Math.max(0, subTotal - discountAmount);
  const cgstAmount = taxMode === 'CGST_SGST' ? Math.round(taxableValue * 0.09) : 0;
  const sgstAmount = taxMode === 'CGST_SGST' ? Math.round(taxableValue * 0.09) : 0;
  const igstAmount = taxMode === 'IGST' ? Math.round(taxableValue * 0.18) : 0;
  const totalQuotationValue = taxableValue + cgstAmount + sgstAmount + igstAmount;

  // Number to words helper (simple format)
  const numberToWords = (num: number) => {
    return `${num.toLocaleString('en-IN')} Indian Rupees`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `TASKNERA - Commercial Quotation
Quote No.: ${quotationNo} | Date: ${quoteDate}
Client: ${clientCompanyName} (Attn: ${clientContactName})
Subject: Quotation for ${serviceDescription}
Total Quotation Value: INR ${totalQuotationValue.toLocaleString('en-IN')}
Valid until: ${validUntil}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Quotation summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddItem = () => {
    const nextSno = items.length + 1;
    setItems([
      ...items,
      {
        id: String(Date.now()),
        sNo: nextSno,
        description: 'HR Consultancy & Talent Acquisition Service',
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
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <ReceiptText size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Commercial Quotation
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(37, 99, 235, 0.25)',
                    color: '#93c5fd',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  TN/BD/QTN Format &bull; 2 Pages
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Quotation No: {quotationNo} &bull; Client: {clientCompanyName}
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
                Quotation Preview (2 Pages)
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
              {/* Card 1: Reference & Client Particulars */}
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
                  <Building size={16} style={{ color: '#2563eb' }} />
                  Quotation Metadata &amp; Client Address
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Quotation Number
                    </label>
                    <input
                      type="text"
                      value={quotationNo}
                      onChange={(e) => setQuotationNo(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Quotation Date
                    </label>
                    <input
                      type="text"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Enquiry Ref.
                    </label>
                    <input
                      type="text"
                      value={enquiryRef}
                      onChange={(e) => setEnquiryRef(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Valid Until Date
                    </label>
                    <input
                      type="text"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
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
                  <div style={{ gridColumn: 'span 2' }}>
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
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client Address
                    </label>
                    <input
                      type="text"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Subject / Service Description
                    </label>
                    <input
                      type="text"
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
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
                    <ReceiptText size={16} style={{ color: '#059669' }} />
                    Quotation Line Items (SAC, Qty, Rate &amp; Amount)
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
                    <Plus size={13} /> Add Line Item
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

                {/* Tax & Discount Bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Discount Amount (INR)
                    </label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      GST Configuration
                    </label>
                    <select
                      value={taxMode}
                      onChange={(e) => setTaxMode(e.target.value as any)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    >
                      <option value="IGST">Inter-state (IGST @ 18%)</option>
                      <option value="CGST_SGST">Intra-state (CGST 9% + SGST 9%)</option>
                    </select>
                  </div>
                  <div style={{ backgroundColor: '#ecfdf5', padding: '10px 14px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                    <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, display: 'block' }}>
                      Calculated Total Quotation Value
                    </span>
                    <span style={{ fontSize: '1.15rem', color: '#065f46', fontWeight: 800 }}>
                      INR {totalQuotationValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Terms & Acceptance */}
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
                  <FileCheck2 size={16} style={{ color: '#2563eb' }} />
                  Terms, Conditions &amp; Client Purchase Order
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Payment Terms Clause
                    </label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Service Commencement (Days)
                    </label>
                    <input
                      type="text"
                      value={commencementDays}
                      onChange={(e) => setCommencementDays(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Client PO Number (Page 2 Acceptance)
                    </label>
                    <input
                      type="text"
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
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
                id={`print-quote-p1-${printId}`}
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

                  {/* Ref & Date Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8, fontSize: '0.8125rem', marginBottom: 14 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Quotation No.: </span>
                      <span>{quotationNo}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Date: </span>
                      <span>{quoteDate}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Enquiry Ref.: </span>
                      <span>{enquiryRef}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Valid until: </span>
                      <span>{validUntil}</span>
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
                    Subject: Quotation for {serviceDescription}
                  </div>

                  {/* Salutation & Intro */}
                  <div style={{ fontSize: '0.8125rem', color: '#1e293b', marginBottom: 6 }}>
                    Dear {clientContactName},
                  </div>

                  <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: '#334155', margin: '0 0 14px 0' }}>
                    Thank you for your enquiry dated {enquiryDate}. We are pleased to quote as set out below:
                  </p>

                  {/* Line Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', marginBottom: 12 }}>
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
                        <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                          Sub-total
                        </td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                          INR {subTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>

                      {/* Discount */}
                      {discountAmount > 0 && (
                        <tr>
                          <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#dc2626' }}>
                            Discount (if any)
                          </td>
                          <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', color: '#dc2626' }}>
                            - INR {discountAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}

                      {/* Taxable Value */}
                      <tr>
                        <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                          Taxable Value
                        </td>
                        <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                          INR {taxableValue.toLocaleString('en-IN')}
                        </td>
                      </tr>

                      {/* Taxes */}
                      {taxMode === 'CGST_SGST' ? (
                        <>
                          <tr>
                            <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                              CGST @ 9%
                            </td>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                              INR {cgstAmount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                              SGST @ 9%
                            </td>
                            <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                              INR {sgstAmount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                            IGST @ 18%
                          </td>
                          <td style={{ padding: '5px 10px', border: '1px solid #cbd5e1', textAlign: 'right' }}>
                            INR {igstAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}

                      {/* Total Quotation Value */}
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td colSpan={5} style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          Total Quotation Value (INR)
                        </td>
                        <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#047857' }}>
                          INR {totalQuotationValue.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Amount in words */}
                  <div style={{ fontSize: '0.78rem', color: '#1e293b', marginBottom: 14 }}>
                    <strong>Amount in words: </strong>
                    <span style={{ fontStyle: 'italic', color: '#0f172a' }}>
                      INR {numberToWords(totalQuotationValue)} only
                    </span>
                  </div>

                  {/* Terms and Conditions */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                      Terms and Conditions
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.75rem', lineHeight: 1.5, color: '#334155' }}>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Validity.</strong> This quotation is valid until the date shown above; rates may be revised thereafter.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Taxes.</strong> GST and other applicable taxes are charged as shown; TDS, if applicable, is to be deducted as per law and a certificate shared.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Payment terms.</strong> {paymentTerms}.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Timeline.</strong> Services will commence within {commencementDays} days of acceptance and receipt of the advance, if any.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Scope changes.</strong> Work outside the scope above will be quoted separately.
                      </li>
                      <li style={{ marginBottom: 6 }}>
                        <strong>Confidentiality.</strong> This quotation is confidential and intended solely for the addressee.
                      </li>
                    </ol>
                    <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: '#475569', margin: '4px 0 0 0' }}>
                      To accept, please sign and return a copy of this quotation along with your purchase order.
                    </p>
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
                id={`print-quote-p2-${printId}`}
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
                      Quotation
                    </span>
                  </div>

                  {/* Dual Signatures & Acceptance Block */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'flex-start' }}>
                    {/* Left: Tasknera Signatory */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: '#1e293b', marginBottom: 4 }}>
                        Yours sincerely,
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 36 }}>
                        For and on behalf of TASKNERA
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
                            Date: {quoteDate}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Place: {ceoPlace}
                          </div>
                        </div>

                        {/* Company Seal Box */}
                        <div
                          style={{
                            width: 88,
                            height: 88,
                            border: '1.5px solid #64748b',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6875rem',
                            color: '#64748b',
                            textAlign: 'center',
                            padding: 6,
                            fontStyle: 'italic',
                          }}
                        >
                          Company Seal
                        </div>
                      </div>
                    </div>

                    {/* Right: Client Acceptance */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '0.04em' }}>
                        ACCEPTANCE OF QUOTATION
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, marginBottom: 30 }}>
                        We, {clientCompanyName}, accept this quotation. PO No.: {poNumber}.
                      </div>

                      <div style={{ borderBottom: '1px solid #94a3b8', width: '100%', marginBottom: 8 }} />
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginBottom: 8 }}>
                        Signature of Authorised Signatory (Client)
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                        Name: {clientSignatoryName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                        Designation: {clientSignatoryDesignation}
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
  );
};
