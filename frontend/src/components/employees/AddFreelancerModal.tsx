// =============================================================================
// ADD NEW FREELANCER MODAL (STREAMLINED LETTER-FOCUSED ONBOARDING)
// =============================================================================
// Captures strictly the essential fields required in the creation of:
// 1. Freelancer Onboarding Letters (TSK/ONB/YYYY/000)
// 2. Freelance Recruiter Services Agreement (Master Contract)
// 3. Freelancer Notice of Termination (TN/FRSA/TERM/YYYY/000)
//
// OMITTED: Corporate CTC breakdowns, Basic %, HRA %, PF/ESIC, Gratuity, etc.
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Percent,
  Check,
  Sparkles,
  AlertCircle,
  Building2,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { CreateEmployeePayload, Employee, EmployeeService } from '../../services/employeeService.js';
import { useToast } from '../../context/ToastContext.js';

interface AddFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFreelancerAdded: (freelancer?: Employee) => void;
}

// Indian PIN prefix dictionary for instant local auto-fill
const PIN_PREFIX_MAP: Record<string, { city: string; state: string }> = {
  '110': { city: 'New Delhi', state: 'Delhi' },
  '400': { city: 'Mumbai', state: 'Maharashtra' },
  '401': { city: 'Thane', state: 'Maharashtra' },
  '411': { city: 'Pune', state: 'Maharashtra' },
  '560': { city: 'Bengaluru', state: 'Karnataka' },
  '500': { city: 'Hyderabad', state: 'Telangana' },
  '600': { city: 'Chennai', state: 'Tamil Nadu' },
  '700': { city: 'Kolkata', state: 'West Bengal' },
  '380': { city: 'Ahmedabad', state: 'Gujarat' },
  '122': { city: 'Gurugram', state: 'Haryana' },
  '201': { city: 'Noida', state: 'Uttar Pradesh' },
  '302': { city: 'Jaipur', state: 'Rajasthan' },
  '226': { city: 'Lucknow', state: 'Uttar Pradesh' },
  '452': { city: 'Indore', state: 'Madhya Pradesh' },
  '682': { city: 'Kochi', state: 'Kerala' },
  '160': { city: 'Chandigarh', state: 'Chandigarh' },
};

const FREELANCE_ROLES = [
  'Freelance Recruiter',
  'Strategic Growth Manager',
  'Talent Acquisition Partner',
  'Technical Sourcing Consultant',
  'Executive Search Partner',
  'Independent Business Associate',
];

const FREELANCE_DEPARTMENTS = [
  'Talent Acquisition',
  'Human Resources',
  'Business Development',
  'Information Technology',
  'Operations',
];

export const AddFreelancerModal: React.FC<AddFreelancerModalProps> = ({
  isOpen,
  onClose,
  onFreelancerAdded,
}) => {
  const { success, error: toastError } = useToast();

  // 1. Personal Details (Required for Letter Salutation & Recipient Block)
  const [title, setTitle] = useState<'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.'>('Mr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // 2. Address & Location (Required in Agreement & Onboarding address lines)
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // 3. Engagement Details (Required for Assignment Scope & Role)
  const [designation, setDesignation] = useState('Freelance Recruiter');
  const [department, setDepartment] = useState('Talent Acquisition');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);

  // 4. Letter Commercial & Tax Terms (Strictly required in agreement & onboarding letter)
  const [payoutType, setPayoutType] = useState<'FIXED_PER_HIRE' | 'REVENUE_SHARE' | 'MONTHLY_RETAINER'>('FIXED_PER_HIRE');
  const [payoutAmount, setPayoutAmount] = useState('25000');
  const [revenueSharePercent, setRevenueSharePercent] = useState('15');
  const [panNumber, setPanNumber] = useState('');

  // Form handling state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill City & State when PIN Code is typed
  useEffect(() => {
    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length === 6) {
      const prefix3 = cleanPin.substring(0, 3);
      if (PIN_PREFIX_MAP[prefix3]) {
        const info = PIN_PREFIX_MAP[prefix3];
        setCity((prev) => prev || info.city);
        setState((prev) => prev || info.state);
      }

      setPinLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          clearTimeout(timeoutId);
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            const fetchedDistrict = po.District || po.Block || po.Circle;
            const fetchedState = po.State;
            if (fetchedDistrict) setCity(fetchedDistrict);
            if (fetchedState) setState(fetchedState);
          }
        })
        .catch(() => {})
        .finally(() => {
          setPinLoading(false);
        });
    }
  }, [pinCode]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validations strictly for letter generation
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both First Name and Last Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }
    if (!city.trim() || !state.trim()) {
      setError('Please provide the City and State.');
      return;
    }
    if (!designation.trim()) {
      setError('Please enter the Freelancer Designation / Role.');
      return;
    }

    setLoading(true);
    const fullName = `${title} ${firstName.trim()} ${lastName.trim()}`.trim();
    const cleanPan = panNumber.trim().toUpperCase();

    try {
      const payload: CreateEmployeePayload = {
        fullName,
        title,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalEmail: email.trim().toLowerCase(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
        pinCode: pinCode.trim(),
        city: city.trim(),
        state: state.trim(),
        addressLine: addressLine.trim() || `${city.trim()}, ${state.trim()} – ${pinCode.trim()}`,
        department: department.trim() || 'Talent Acquisition',
        workLocation: city.trim() || 'Remote',
        designation: designation.trim() || 'Freelance Recruiter',
        joiningDate,
        employmentType: 'Freelance',
        status: 'ACTIVE',
        annualCtc: payoutType === 'FIXED_PER_HIRE' ? parseFloat(payoutAmount || '0') : 0,
        currency: 'INR',
        basicPercent: 0,
        hraPercent: 0,
        incentiveApplicable: false,
      };

      const created = await EmployeeService.createEmployee(payload);

      // Store freelancer-specific commercial metadata for seamless 1-click letter auto-population
      try {
        const meta = {
          panNumber: cleanPan,
          payoutType,
          payoutAmount: payoutType === 'FIXED_PER_HIRE' ? payoutAmount : undefined,
          revenueSharePercent: payoutType === 'REVENUE_SHARE' ? revenueSharePercent : undefined,
          territoryFocus: department,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(`freelancer_meta_${created.id}`, JSON.stringify(meta));
      } catch {
        // ignore storage warning
      }

      success(`Freelancer "${fullName}" added successfully with letter profile ready!`);
      onFreelancerAdded(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add freelancer record.');
      toastError(err.message || 'Failed to add freelancer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #a7f3d0',
                flexShrink: 0,
              }}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Add Freelancer
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Letter-Essential Profile
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>
                Only the fields strictly required to generate Onboarding, Services Agreements & Termination Letters.
              </p>
            </div>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.825rem',
                marginBottom: 18,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Personal Details */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <User size={16} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Personal Details (Letter Addressee)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Title
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  First Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Last Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mehta"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="aarav.mehta@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Phone / Mobile <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 34px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Residential / Service Location (Required in Agreement Party Block) */}
          <div style={{ marginBottom: 22, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <MapPin size={16} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Location & Address (Legal Contract Jurisdiction)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  PIN Code {pinLoading && <span style={{ color: '#059669' }}>(...)</span>}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 400064"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  City <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  State <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Address Line (Flat / Building / Street)
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Sunshine Heights, Malad West"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Section 3: Engagement Role & Mandate */}
          <div style={{ marginBottom: 22, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Briefcase size={16} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. Engagement Role & Mandate
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Freelance Role / Designation <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  list="freelance-roles-list"
                  placeholder="e.g. Freelance Recruiter"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
                <datalist id="freelance-roles-list">
                  {FREELANCE_ROLES.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Department / Territory Focus
                </label>
                <input
                  type="text"
                  list="freelance-dept-list"
                  placeholder="e.g. Talent Acquisition"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
                <datalist id="freelance-dept-list">
                  {FREELANCE_DEPARTMENTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                Engagement Effective / Start Date <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative', maxWidth: 280 }}>
                <Calendar size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 34px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Letter Payout Model & Tax Details */}
          <div style={{ marginBottom: 12, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <CreditCard size={16} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                4. Letter Payout & Tax Details (Clause 5 & TDS)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                  Payout Model (Clause 5.1 / Growth Plan)
                </label>
                <select
                  value={payoutType}
                  onChange={(e) => setPayoutType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="FIXED_PER_HIRE">Fixed INR Payout Per Placement</option>
                  <option value="REVENUE_SHARE">Revenue Share Percentage (%)</option>
                  <option value="MONTHLY_RETAINER">Monthly Advisory / Retainer</option>
                </select>
              </div>

              <div>
                {payoutType === 'FIXED_PER_HIRE' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Fixed Payout per Hire (INR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {payoutType === 'REVENUE_SHARE' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Revenue Share Percentage (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={revenueSharePercent}
                      onChange={(e) => setRevenueSharePercent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}

                {payoutType === 'MONTHLY_RETAINER' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Monthly Retainer (INR)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 40000"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        outline: 'none',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                PAN Card Number (Required for Indian Contract TDS & Agreement Clause 3.4)
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. ABCDE1234F"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  maxWidth: 280,
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  outline: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              />
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Used in the Master Recruiter Agreement and Onboarding tax acknowledgement.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              paddingTop: 20,
              marginTop: 10,
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '9px 18px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 22px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#059669',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span>Adding Freelancer...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save Freelancer Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
