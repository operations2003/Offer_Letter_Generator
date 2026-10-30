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
  PackageCheck,
  ShieldCheck,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';

interface SubscriptionPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PlanTier {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  setupFee: string;
  usersIncluded: string;
  feature1: string;
  feature2: string;
  support: string;
}

interface AddOnItem {
  id: string;
  name: string;
  description: string;
  price: string;
}

export const SubscriptionPlansModal: React.FC<SubscriptionPlansModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, info } = useToast();
  const printId = useId();

  // Reference & Metadata
  const currentYear = new Date().getFullYear();
  const [refNumber, setRefNumber] = useState(`TN/BD/SUB/${currentYear}/001`);
  const [docDate, setDocDate] = useState(
    new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [version, setVersion] = useState('1.0');
  const [preparedFor, setPreparedFor] = useState('Nexus Enterprise Technologies Pvt. Ltd.');
  const [productName, setProductName] = useState('Tasknera Enterprise Talent Suite & Global ATS');
  const [clientContactName, setClientContactName] = useState('Mr. Vikramaditya Singhania');
  const [clientAddress, setClientAddress] = useState('Tower 4, Cyber City, Gurugram, Haryana – 122002');

  // Plan Comparison Table
  const [planA, setPlanA] = useState<PlanTier>({
    name: 'Plan A – Starter',
    monthlyPrice: '14,999',
    annualPrice: '1,49,990',
    setupFee: '9,999',
    usersIncluded: '5 users',
    feature1: 'AI Candidate Sourcing & Resume Parsing',
    feature2: 'Standard Job Board Posting & Email Support',
    support: 'Email (24-48 hr SLA)',
  });

  const [planB, setPlanB] = useState<PlanTier>({
    name: 'Plan B – Professional',
    monthlyPrice: '29,999',
    annualPrice: '2,99,990',
    setupFee: 'Waived',
    usersIncluded: '15 users',
    feature1: 'Automated Interview Scheduling & Video Assessments',
    feature2: 'Custom Offer Letter Workflows & Background Verification',
    support: 'Email + Live Chat (4 hr SLA)',
  });

  const [planC, setPlanC] = useState<PlanTier>({
    name: 'Plan C – Enterprise',
    monthlyPrice: '59,999',
    annualPrice: '5,99,990',
    setupFee: 'Waived',
    usersIncluded: 'Unlimited',
    feature1: 'Full HRIS API Integration & Dedicated Cloud Tenant',
    feature2: 'White-labeled Candidate Portals & Custom Compliance',
    support: 'Dedicated Technical Account Manager',
  });

  // Optional Add-ons
  const [addOns, setAddOns] = useState<AddOnItem[]>([
    {
      id: '1',
      name: 'Custom HRMS / ERP Bi-directional Sync',
      description: 'Native REST API connector with Workday, SAP SuccessFactors and BambooHR',
      price: '19,999 / year',
    },
    {
      id: '2',
      name: 'Executive Headhunting Concierge',
      description: 'Dedicated senior recruitment partner for CXO and Director-level searches',
      price: '25,000 / month',
    },
  ]);

  // Terms & Conditions
  const [paymentDays, setPaymentDays] = useState('15');
  const [noticeDaysRenewal, setNoticeDaysRenewal] = useState('30');
  const [priceRevisionDays, setPriceRevisionDays] = useState('30');
  const [cancellationPolicy, setCancellationPolicy] = useState(
    'Written notice of 30 days prior to cycle renewal; pro-rata refunds applicable only for annual upfront plans within first 30 days.'
  );

  // Page 2: Plan Selection
  const [selectedPlanName, setSelectedPlanName] = useState('Plan B – Professional');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'Monthly' | 'Annual'>('Annual');
  const [selectedUsers, setSelectedUsers] = useState('15 users (expandable)');
  const [selectedAddonsText, setSelectedAddonsText] = useState('Custom HRMS / ERP Sync');
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })
  );
  const [feePerCycle, setFeePerCycle] = useState('2,99,990');

  // Signatories
  const [ceoName, setCeoName] = useState('Ms. Sheetal Bedi');
  const [ceoDesignation, setCeoDesignation] = useState('Chief Executive Officer (CEO)');
  const [ceoPlace, setCeoPlace] = useState('Delhi, India');
  const [clientSignatoryName, setClientSignatoryName] = useState('Mr. Vikramaditya Singhania');
  const [clientSignatoryTitle, setClientSignatoryTitle] = useState('Chief Technology Officer (CTO)');
  const [clientCity, setClientCity] = useState('Gurugram, India');

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = `TASKNERA - Subscription Plans and Pricing
Ref: ${refNumber} | Date: ${docDate}
Prepared for: ${preparedFor}
Product/Service: ${productName}
Selected Plan: ${selectedPlanName} (${selectedBillingCycle})
Fee per cycle: INR ${feePerCycle}
Signatory: ${ceoName}, ${ceoDesignation} (For TASKNERA)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    success('Document summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAddon = () => {
    setAddOns([
      ...addOns,
      {
        id: String(Date.now()),
        name: 'Additional Add-on Module',
        description: 'Module scope description and service deliverables',
        price: '9,999',
      },
    ]);
  };

  const handleRemoveAddon = (id: string) => {
    setAddOns(addOns.filter((item) => item.id !== id));
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
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <PackageCheck size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                  Subscription Plans and Pricing
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.25)',
                    color: '#93c5fd',
                    padding: '2px 8px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  TN/BD/SUB Format &bull; 2 Pages
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Ref: {refNumber} &bull; Client: {preparedFor}
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
                  backgroundColor: activeTab === 'editor' ? '#3b82f6' : 'transparent',
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
                  backgroundColor: activeTab === 'preview' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'preview' ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                Letter Preview (2 Pages)
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
              {/* Card 1: Document Metadata */}
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
                  Document Metadata &amp; Client Particulars
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Reference Number
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
                      Document Date
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
                      Version
                    </label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Prepared For (Client Company)
                    </label>
                    <input
                      type="text"
                      value={preparedFor}
                      onChange={(e) => setPreparedFor(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Product / Service Name
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
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
                </div>
              </div>

              {/* Card 2: Plan Comparison Parameters */}
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
                  <PackageCheck size={16} style={{ color: '#059669' }} />
                  Plan Pricing Tiers (Starter, Professional &amp; Enterprise)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {/* Starter */}
                  <div style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: 8 }}>
                      {planA.name}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Monthly Price (INR)</label>
                        <input
                          type="text"
                          value={planA.monthlyPrice}
                          onChange={(e) => setPlanA({ ...planA, monthlyPrice: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Annual Price (INR)</label>
                        <input
                          type="text"
                          value={planA.annualPrice}
                          onChange={(e) => setPlanA({ ...planA, annualPrice: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>One-time Setup Fee</label>
                        <input
                          type="text"
                          value={planA.setupFee}
                          onChange={(e) => setPlanA({ ...planA, setupFee: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Users Included</label>
                        <input
                          type="text"
                          value={planA.usersIncluded}
                          onChange={(e) => setPlanA({ ...planA, usersIncluded: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional */}
                  <div style={{ padding: 12, borderRadius: 8, border: '1.5px solid #3b82f6', backgroundColor: '#eff6ff' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1d4ed8', display: 'block', marginBottom: 8 }}>
                      {planB.name} (Recommended)
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Monthly Price (INR)</label>
                        <input
                          type="text"
                          value={planB.monthlyPrice}
                          onChange={(e) => setPlanB({ ...planB, monthlyPrice: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Annual Price (INR)</label>
                        <input
                          type="text"
                          value={planB.annualPrice}
                          onChange={(e) => setPlanB({ ...planB, annualPrice: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>One-time Setup Fee</label>
                        <input
                          type="text"
                          value={planB.setupFee}
                          onChange={(e) => setPlanB({ ...planB, setupFee: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Users Included</label>
                        <input
                          type="text"
                          value={planB.usersIncluded}
                          onChange={(e) => setPlanB({ ...planB, usersIncluded: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enterprise */}
                  <div style={{ padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', display: 'block', marginBottom: 8 }}>
                      {planC.name}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Monthly Price (INR)</label>
                        <input
                          type="text"
                          value={planC.monthlyPrice}
                          onChange={(e) => setPlanC({ ...planC, monthlyPrice: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Annual Price (INR)</label>
                        <input
                          type="text"
                          value={planC.annualPrice}
                          onChange={(e) => setPlanC({ ...planC, annualPrice: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>One-time Setup Fee</label>
                        <input
                          type="text"
                          value={planC.setupFee}
                          onChange={(e) => setPlanC({ ...planC, setupFee: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Users Included</label>
                        <input
                          type="text"
                          value={planC.usersIncluded}
                          onChange={(e) => setPlanC({ ...planC, usersIncluded: e.target.value })}
                          style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.75rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Optional Add-ons */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: 20,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} style={{ color: '#2563eb' }} />
                    Section 2: Optional Add-ons
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    style={{
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {addOns.map((add, idx) => (
                    <div
                      key={add.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr 2fr 1fr 36px',
                        gap: 8,
                        alignItems: 'center',
                        padding: '8px 10px',
                        borderRadius: 6,
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <input
                        type="text"
                        value={add.name}
                        placeholder="Add-on Name"
                        onChange={(e) => {
                          const updated = [...addOns];
                          updated[idx].name = e.target.value;
                          setAddOns(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={add.description}
                        placeholder="Description"
                        onChange={(e) => {
                          const updated = [...addOns];
                          updated[idx].description = e.target.value;
                          setAddOns(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <input
                        type="text"
                        value={add.price}
                        placeholder="Price (INR)"
                        onChange={(e) => {
                          const updated = [...addOns];
                          updated[idx].price = e.target.value;
                          setAddOns(updated);
                        }}
                        style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.78rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(add.id)}
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
              </div>

              {/* Card 4: Plan Selection (Page 2) */}
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
                  <FileCheck2 size={16} style={{ color: '#7c3aed' }} />
                  Section 4: Confirmed Plan Selection (Customer Execution)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Selected Plan
                    </label>
                    <input
                      type="text"
                      value={selectedPlanName}
                      onChange={(e) => setSelectedPlanName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Billing Cycle
                    </label>
                    <select
                      value={selectedBillingCycle}
                      onChange={(e) => setSelectedBillingCycle(e.target.value as any)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    >
                      <option value="Annual">Annual (Billed Yearly)</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Number of Users / Seats
                    </label>
                    <input
                      type="text"
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Add-ons Selected
                    </label>
                    <input
                      type="text"
                      value={selectedAddonsText}
                      onChange={(e) => setSelectedAddonsText(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Subscription Start Date
                    </label>
                    <input
                      type="text"
                      value={subscriptionStartDate}
                      onChange={(e) => setSubscriptionStartDate(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Fee per Billing Cycle (INR)
                    </label>
                    <input
                      type="text"
                      value={feePerCycle}
                      onChange={(e) => setFeePerCycle(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
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
                id={`print-page-1-${printId}`}
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
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 14, marginBottom: 22 }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Ref. No.: </span>
                      <span>{refNumber}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Date: </span>
                      <span>{docDate}</span>
                    </div>
                  </div>

                  {/* Version & Prepared for */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 16 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Version: </span>
                      <span>[{version}]</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>Prepared for: </span>
                      <span>{preparedFor}</span>
                    </div>
                  </div>

                  {/* Subject */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                    Subject: Subscription Plans and Pricing – {productName}
                  </div>

                  {/* Dear Salutation */}
                  <div style={{ fontSize: '0.8125rem', color: '#1e293b', marginBottom: 10 }}>
                    Dear {clientContactName},
                  </div>

                  <p style={{ fontSize: '0.8125rem', lineHeight: 1.55, color: '#334155', margin: '0 0 16px 0' }}>
                    We are pleased to share the subscription plans available for {productName}. Plans may be billed monthly or annually, and you may move between plans as your needs change.
                  </p>

                  {/* 1. Plan Comparison Table */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                      1. Plan Comparison
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '28%' }}>
                            Feature
                          </th>
                          <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '24%' }}>
                            {planA.name}
                          </th>
                          <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '24%' }}>
                            {planB.name}
                          </th>
                          <th style={{ padding: '7px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '24%' }}>
                            {planC.name}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            Monthly price (INR, per [user / seat])
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>INR {planA.monthlyPrice}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4', fontWeight: 600 }}>INR {planB.monthlyPrice}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>INR {planC.monthlyPrice}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            Annual price (INR, billed yearly)
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>INR {planA.annualPrice}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4', fontWeight: 700, color: '#047857' }}>INR {planB.annualPrice}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>INR {planC.annualPrice}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            One-time setup fee (INR)
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>INR {planA.setupFee}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4' }}>{planB.setupFee}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planC.setupFee}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            Users / seats included
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planA.usersIncluded}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4' }}>{planB.usersIncluded}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planC.usersIncluded}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            [Key feature 1]
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planA.feature1}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4' }}>{planB.feature1}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planC.feature1}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            [Key feature 2]
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planA.feature2}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4' }}>{planB.feature2}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planC.feature2}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                            Support
                          </td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planA.support}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', backgroundColor: '#f0fdf4' }}>{planB.support}</td>
                          <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>{planC.support}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 2. Optional Add-ons */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                      2. Optional Add-ons
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '28%' }}>
                            Add-on
                          </th>
                          <th style={{ padding: '6px 10px', textAlign: 'left', border: '1px solid #94a3b8', width: '52%' }}>
                            Description
                          </th>
                          <th style={{ padding: '6px 10px', textAlign: 'right', border: '1px solid #94a3b8', width: '20%' }}>
                            Price (INR)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {addOns.map((add) => (
                          <tr key={add.id}>
                            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                              {add.name}
                            </td>
                            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1' }}>
                              {add.description}
                            </td>
                            <td style={{ padding: '6px 10px', border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 600 }}>
                              {add.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 3. Billing and Subscription Terms */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                      3. Billing and Subscription Terms
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18, fontSize: '0.75rem', lineHeight: 1.5, color: '#334155' }}>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Billing cycle.</strong> Fees are invoiced in advance for each monthly or annual cycle, as selected below.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Payment.</strong> Invoices are payable within {paymentDays} days of the invoice date.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Renewal.</strong> The subscription renews automatically for the same term unless notice of non-renewal is given {noticeDaysRenewal} days before the renewal date.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Upgrades and downgrades.</strong> Upgrades take effect immediately and are charged pro rata; downgrades take effect from the next billing cycle.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Cancellation and refunds.</strong> {cancellationPolicy}
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Taxes.</strong> Prices are exclusive of GST and other applicable taxes.
                      </li>
                      <li style={{ marginBottom: 3 }}>
                        <strong>Price revision.</strong> Prices may be revised on renewal with at least {priceRevisionDays} days&rsquo; written notice.
                      </li>
                      <li>
                        <strong>Confidentiality.</strong> Plan pricing is confidential and is not to be disclosed to third parties, except as required by law.
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
                id={`print-page-2-${printId}`}
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 26 }}>
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
                      Subscription Plans &amp; Pricing
                    </span>
                  </div>

                  {/* Section 4. Plan Selection */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                      4. Plan Selection
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, width: '38%', backgroundColor: '#f8fafc' }}>
                            Selected plan
                          </td>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#1d4ed8' }}>
                            {selectedPlanName}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                            Billing cycle
                          </td>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                            {selectedBillingCycle}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                            Number of users / seats
                          </td>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                            {selectedUsers}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                            Add-ons selected
                          </td>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                            {selectedAddonsText || 'None'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                            Subscription start date
                          </td>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>
                            {subscriptionStartDate}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 600, backgroundColor: '#f8fafc' }}>
                            Fee per billing cycle (INR)
                          </td>
                          <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 800, fontSize: '0.9rem', color: '#047857' }}>
                            INR {feePerCycle}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: '#1e293b', margin: '0 0 36px 0', lineHeight: 1.5 }}>
                    Please sign below to confirm your plan selection and return a copy of this document.
                  </p>

                  {/* Dual Signatures Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, alignItems: 'flex-start' }}>
                    {/* Left: Tasknera Signature & Seal */}
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

                    {/* Right: Customer Confirmation */}
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '0.04em' }}>
                        CUSTOMER CONFIRMATION
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45, marginBottom: 30 }}>
                        We, {preparedFor}, confirm the plan selection above and agree to the terms of this document.
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
  );
};
