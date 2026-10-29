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
  FileCheck,
  Scale,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface ClientOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface OrderItem {
  id: string;
  sNo: number;
  servicePlan: string;
  description: string;
  qty: string;
  term: string;
  fee: number;
}

export const ClientOrderFormModal: React.FC<ClientOrderFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success } = useToast();
  const printId = useId();

  // Order Metadata
  const currentYear = new Date().getFullYear();
  const [orderNo, setOrderNo] = useState(`TN/BD/ORD/${currentYear}/019`);
  const [orderDate, setOrderDate] = useState(
    new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [serviceSubscriptionName, setServiceSubscriptionName] = useState('Enterprise Global Recruitment & ATS Cloud Platform');
  const [masterAgreementRef, setMasterAgreementRef] = useState(`Master Recruitment Services Agreement Ref. TN/BD/MRSA/${currentYear}/008`);

  // Section A. Customer Details
  const [customerLegalName, setCustomerLegalName] = useState('Vanguard Global Technologies India Pvt. Ltd.');
  const [registeredAddress, setRegisteredAddress] = useState('Infinity Tower B, 11th Floor, DLF Cyber City, Gurugram, Haryana – 122002');
  const [gstinPan, setGstinPan] = useState('06AAECV9912Q1ZR / AAECV9912Q');
  const [authorisedContact, setAuthorisedContact] = useState('Mr. Raghavendra Rao, VP – Human Resources');
  const [contactEmailPhone, setContactEmailPhone] = useState('raghav.rao@vanguardtech.in | +91 98112 44920');
  const [billingContactEmail, setBillingContactEmail] = useState('Ms. Neha Kapoor (finance@vanguardtech.in)');
  const [customerPoNumber, setCustomerPoNumber] = useState('VG-PO-2026-8841');

  // Section B. Order Details
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: '1',
      sNo: 1,
      servicePlan: 'Plan C – Enterprise ATS Suite',
      description: 'Dedicated cloud tenant, unlimited user licenses, AI sourcing & ATS workflow sync',
      qty: '1 Tenant',
      term: '12 months',
      fee: 599990,
    },
    {
      id: '2',
      sNo: 2,
      servicePlan: 'Executive Sourcing Retainer',
      description: 'Quarterly specialized senior executive talent headhunting allocation',
      qty: '4 Qtrs',
      term: '12 months',
      fee: 240000,
    },
  ]);

  // Section C. Commercial Terms
  const [orderEffectiveDate, setOrderEffectiveDate] = useState(
    new Date(Date.now() + 86400000 * 3).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [initialTerm, setInitialTerm] = useState('12 months');
  const [renewalTerms, setRenewalTerms] = useState('Auto-renews for consecutive 12-month terms unless 30 days written notice provided');
  const [billingFrequency, setBillingFrequency] = useState('Annual in advance');
  const [paymentTerms, setPaymentTerms] = useState('Within 15 days of invoice date');
  const [specialTerms, setSpecialTerms] = useState('Includes complimentary priority onboarding & 2-day on-site HR admin training workshop');

  // Terms Clauses
  const [lateFeePercent, setLateFeePercent] = useState('1.5');

  // Signatories
  const [ceoName, setCeoName] = useState('Ms. Sheetal Bedi');
  const [ceoDesignation, setCeoDesignation] = useState('Chief Executive Officer (CEO)');
  const [ceoPlace, setCeoPlace] = useState('Delhi, India');
  const [clientSignatoryName, setClientSignatoryName] = useState('Mr. Raghavendra Rao');
  const [clientSignatoryTitle, setClientSignatoryTitle] = useState('VP – Human Resources');
  const [clientCity, setClientCity] = useState('Gurugram, India');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + item.fee, 0);
  const gstAmount = Math.round(subTotal * 0.18);
  const totalOrderValue = subTotal + gstAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `TASKNERA - Order Form
Order No: ${orderNo} | Date: ${orderDate}
Customer: ${customerLegalName}
Service: ${serviceSubscriptionName}
Total Order Value: INR ${totalOrderValue.toLocaleString('en-IN')} (Incl. 18% GST)
Effective Date: ${orderEffectiveDate}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Order Form summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddItem = () => {
    const nextSno = items.length + 1;
    setItems([
      ...items,
      {
        id: String(Date.now()),
        sNo: nextSno,
        servicePlan: 'Custom HR Consulting Module',
        description: 'Bespoke workforce restructuring and talent benchmarking assessment',
        qty: '1 Module',
        term: 'Annual',
        fee: 80000,
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
                backgroundColor: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <FileCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Client Order Form
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(124, 58, 237, 0.25)',
                    color: '#c4b5fd',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  TN/BD/ORD Format &bull; 2 Pages
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Order No: {orderNo} &bull; Customer: {customerLegalName}
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
                  backgroundColor: activeTab === 'editor' ? '#7c3aed' : 'transparent',
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
                  backgroundColor: activeTab === 'preview' ? '#7c3aed' : 'transparent',
                  color: activeTab === 'preview' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Order Preview (2 Pages)
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
              {/* Card 1: Order Metadata & Preamble */}
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
                  <Building size={16} style={{ color: '#7c3aed' }} />
                  Order Header &amp; Framework Agreement
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Order Number
                    </label>
                    <input
                      type="text"
                      value={orderNo}
                      onChange={(e) => setOrderNo(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Order Date
                    </label>
                    <input
                      type="text"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Order Title (Service / Subscription Name)
                    </label>
                    <input
                      type="text"
                      value={serviceSubscriptionName}
                      onChange={(e) => setServiceSubscriptionName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Master Agreement / Proposal Reference Preamble
                    </label>
                    <input
                      type="text"
                      value={masterAgreementRef}
                      onChange={(e) => setMasterAgreementRef(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Section A. Customer Details */}
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
                  Section A: Customer Details
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Customer Legal Name
                    </label>
                    <input
                      type="text"
                      value={customerLegalName}
                      onChange={(e) => setCustomerLegalName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Registered Address
                    </label>
                    <input
                      type="text"
                      value={registeredAddress}
                      onChange={(e) => setRegisteredAddress(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      GSTIN / PAN
                    </label>
                    <input
                      type="text"
                      value={gstinPan}
                      onChange={(e) => setGstinPan(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Customer PO Number
                    </label>
                    <input
                      type="text"
                      value={customerPoNumber}
                      onChange={(e) => setCustomerPoNumber(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Authorised Contact &amp; Role
                    </label>
                    <input
                      type="text"
                      value={authorisedContact}
                      onChange={(e) => setAuthorisedContact(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Email &amp; Phone
                    </label>
                    <input
                      type="text"
                      value={contactEmailPhone}
                      onChange={(e) => setContactEmailPhone(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Billing Contact and Email
                    </label>
                    <input
                      type="text"
                      value={billingContactEmail}
                      onChange={(e) => setBillingContactEmail(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Section B. Order Details */}
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
                    Section B: Order Details &amp; Pricing
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
                        gridTemplateColumns: '36px 2fr 3fr 1fr 1fr 1.2fr 36px',
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
                        value={item.servicePlan}
                        placeholder="Service / Plan"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].servicePlan = e.target.value;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={item.description}
                        placeholder="Description"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].description = e.target.value;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={item.qty}
                        placeholder="Qty"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].qty = e.target.value;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={item.term}
                        placeholder="Term"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].term = e.target.value;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="number"
                        value={item.fee}
                        placeholder="Fee (INR)"
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].fee = Number(e.target.value) || 0;
                          setItems(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
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

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>
                    Sub-total: INR {subTotal.toLocaleString('en-IN')} + GST @ 18%: INR {gstAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ backgroundColor: '#f5f3ff', padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd6fe' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 600 }}>Total Order Value: </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed' }}>
                      INR {totalOrderValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 4: Section C. Commercial Terms */}
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
                  <Calendar size={16} style={{ color: '#2563eb' }} />
                  Section C: Commercial Terms
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Order Effective Date
                    </label>
                    <input
                      type="text"
                      value={orderEffectiveDate}
                      onChange={(e) => setOrderEffectiveDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Initial Term
                    </label>
                    <input
                      type="text"
                      value={initialTerm}
                      onChange={(e) => setInitialTerm(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Billing Frequency
                    </label>
                    <input
                      type="text"
                      value={billingFrequency}
                      onChange={(e) => setBillingFrequency(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Renewal Terms
                    </label>
                    <input
                      type="text"
                      value={renewalTerms}
                      onChange={(e) => setRenewalTerms(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Special Terms &amp; Provisions
                    </label>
                    <input
                      type="text"
                      value={specialTerms}
                      onChange={(e) => setSpecialTerms(e.target.value)}
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
                id={`print-order-p1-${printId}`}
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
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 18 }}>
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

                  {/* Order Ref & Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Order No.: </span>
                      <span>{orderNo}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Date: </span>
                      <span>{orderDate}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                    Order Form – {serviceSubscriptionName}
                  </div>

                  {/* Preamble */}
                  <p style={{ fontSize: '0.78rem', lineHeight: 1.45, color: '#334155', margin: '0 0 14px 0' }}>
                    This Order Form is issued under, and forms part of, {masterAgreementRef} between TASKNERA (the &ldquo;Provider&rdquo;) and the customer named below (the &ldquo;Customer&rdquo;).
                  </p>

                  {/* A. Customer Details */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      A. Customer Details
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, width: '30%', backgroundColor: '#f8fafc' }}>Customer legal name</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 700 }}>{customerLegalName}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Registered address</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{registeredAddress}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>GSTIN / PAN</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{gstinPan}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Authorised contact</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{authorisedContact}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Email / phone</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{contactEmailPhone}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Billing contact and email</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{billingContactEmail}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Customer PO number (if any)</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{customerPoNumber}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* B. Order Details */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      B. Order Details
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #94a3b8', width: '6%' }}>S.No</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', border: '1px solid #94a3b8', width: '28%' }}>Service / plan</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', border: '1px solid #94a3b8', width: '38%' }}>Description</th>
                          <th style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #94a3b8', width: '8%' }}>Qty</th>
                          <th style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #94a3b8', width: '10%' }}>Term</th>
                          <th style={{ padding: '5px 8px', textAlign: 'right', border: '1px solid #94a3b8', width: '14%' }}>Fee (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 600 }}>{item.sNo}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{item.servicePlan}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{item.description}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.qty}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{item.term}</td>
                            <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>{item.fee.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>Sub-total</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>INR {subTotal.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                          <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>GST @ 18%</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right' }}>INR {gstAmount.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <td colSpan={5} style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800 }}>Total Order Value (INR)</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800, color: '#047857' }}>INR {totalOrderValue.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* C. Commercial Terms */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      C. Commercial Terms
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, width: '30%', backgroundColor: '#f8fafc' }}>Order effective date</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600 }}>{orderEffectiveDate}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Initial term</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{initialTerm}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Renewal</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{renewalTerms}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Billing frequency</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{billingFrequency}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Payment terms</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{paymentTerms}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>Special terms</td>
                          <td style={{ padding: '5px 8px', border: '1px solid #cbd5e1' }}>{specialTerms}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* D. Terms (1 to 4) */}
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      D. Terms
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.73rem', lineHeight: 1.45, color: '#334155' }}>
                      <li style={{ marginBottom: 2 }}>
                        <strong>Governing terms.</strong> This Order Form is subject to {masterAgreementRef}, which prevail in case of conflict unless stated in Section C.
                      </li>
                      <li style={{ marginBottom: 2 }}>
                        <strong>Fees and payment.</strong> Fees are exclusive of GST and other applicable taxes and are payable as set out in Section C.
                      </li>
                      <li style={{ marginBottom: 2 }}>
                        <strong>Late payment.</strong> Overdue amounts may attract {lateFeePercent}% per month, and services may be suspended after written notice.
                      </li>
                      <li>
                        <strong>Term and termination.</strong> This order runs for the initial term and may be terminated as provided in the governing terms.
                      </li>
                    </ol>
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
                id={`print-order-p2-${printId}`}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 30 }}>
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
                      Order Form
                    </span>
                  </div>

                  {/* Clause 5 Confidentiality */}
                  <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, marginBottom: 24 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      5. Confidentiality. The pricing and terms of this Order Form are confidential.
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#0f172a', fontWeight: 600 }}>
                      By signing below, the parties agree to this Order Form.
                    </div>
                  </div>

                  {/* Dual Signatures */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36, alignItems: 'flex-start', marginTop: 10 }}>
                    {/* Left: Tasknera Signature & Seal */}
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
                            Date: {orderDate}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            Place: {ceoPlace}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Customer Authorisation */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '0.04em' }}>
                        CUSTOMER AUTHORISATION
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, marginBottom: 30 }}>
                        For and on behalf of {customerLegalName}.
                      </div>

                      <div style={{ borderBottom: '1px solid #94a3b8', width: '100%', marginBottom: 8 }} />
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginBottom: 8 }}>
                        Signature of Authorised Signatory (Customer)
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
  );
};
