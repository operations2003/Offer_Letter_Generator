// =============================================================================
// ADD NEW EMPLOYEE MODAL (3-STEP WIZARD)
// =============================================================================
// Step 1: Employee Details & Address (Title, Name, Email, Phone, PIN, City, State, Address)
// Step 2: Position & Role (Department with [IT, HR, TA, BDM] + Add custom option, Location, Designation, DOJ)
// Step 3: Compensation (Annual CTC, Basic % of CTC, HRA % of Basic, Incentive Applicable)
// =============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Plus,
  Briefcase,
  ChevronDown,
  Search,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { CreateEmployeePayload, EmployeeService } from '../../services/employeeService.js';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

// Indian PIN prefix dictionary for immediate instant auto-fill
const PIN_PREFIX_MAP: Record<string, { city: string; state: string; metro: boolean }> = {
  '110': { city: 'New Delhi', state: 'Delhi', metro: true },
  '400': { city: 'Mumbai', state: 'Maharashtra', metro: true },
  '401': { city: 'Thane', state: 'Maharashtra', metro: true },
  '411': { city: 'Pune', state: 'Maharashtra', metro: false },
  '560': { city: 'Bengaluru', state: 'Karnataka', metro: true },
  '561': { city: 'Bengaluru Rural', state: 'Karnataka', metro: false },
  '500': { city: 'Hyderabad', state: 'Telangana', metro: true },
  '600': { city: 'Chennai', state: 'Tamil Nadu', metro: true },
  '700': { city: 'Kolkata', state: 'West Bengal', metro: true },
  '380': { city: 'Ahmedabad', state: 'Gujarat', metro: false },
  '122': { city: 'Gurugram', state: 'Haryana', metro: true },
  '201': { city: 'Noida', state: 'Uttar Pradesh', metro: true },
  '302': { city: 'Jaipur', state: 'Rajasthan', metro: false },
  '226': { city: 'Lucknow', state: 'Uttar Pradesh', metro: false },
  '452': { city: 'Indore', state: 'Madhya Pradesh', metro: false },
  '682': { city: 'Kochi', state: 'Kerala', metro: false },
  '160': { city: 'Chandigarh', state: 'Chandigarh', metro: false },
  '695': { city: 'Thiruvananthapuram', state: 'Kerala', metro: false },
  '440': { city: 'Nagpur', state: 'Maharashtra', metro: false },
  '800': { city: 'Patna', state: 'Bihar', metro: false },
  '751': { city: 'Bhubaneswar', state: 'Odisha', metro: false },
  '781': { city: 'Guwahati', state: 'Assam', metro: false },
  '141': { city: 'Ludhiana', state: 'Punjab', metro: false },
  '395': { city: 'Surat', state: 'Gujarat', metro: false },
  '390': { city: 'Vadodara', state: 'Gujarat', metro: false },
  '641': { city: 'Coimbatore', state: 'Tamil Nadu', metro: false },
};

const METRO_CITIES = ['mumbai', 'delhi', 'new delhi', 'kolkata', 'chennai', 'bengaluru', 'bangalore', 'hyderabad', 'gurugram', 'noida'];

const DEFAULT_DEPARTMENTS = ['IT', 'HR', 'TA', 'BDM'];
const DEPARTMENTS_STORAGE_KEY = 'offer_gen_departments';

const DEFAULT_POSITIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Lead Full-Stack Architect',
  'IT Support Specialist',
  'DevOps Engineer',
  'QA Automation Engineer',
  'Product Manager',
  'Product Designer',
  'HR Executive',
  'HR Manager',
  'Talent Acquisition Specialist',
  'Technical Recruiter',
  'Business Development Manager',
  'Business Development Associate',
  'Operations Executive',
  'Finance Analyst',
  'Executive Assistant',
];
const POSITIONS_STORAGE_KEY = 'offer_gen_positions';

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onEmployeeAdded,
}) => {
  // Stepper state (1: Employee, 2: Role & Joining, 3: Compensation)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Employee Details
  const [title, setTitle] = useState<'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.'>('Mr.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Step 1: Employee Address
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Step 2: Position & Role
  const [departments, setDepartments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DEPARTMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure default departments are always present
          const merged = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...parsed]));
          return merged;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_DEPARTMENTS;
  });

  const [department, setDepartment] = useState('');
  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState('');

  // Positions (Designations) state & authority to manage
  const [positions, setPositions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_POSITIONS, ...parsed]));
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_POSITIONS;
  });

  const [workLocation, setWorkLocation] = useState('');
  const [designation, setDesignation] = useState('');
  const [isDesignationOpen, setIsDesignationOpen] = useState(false);
  const [designationSearch, setDesignationSearch] = useState('');
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newPositionInput, setNewPositionInput] = useState('');
  const designationRef = useRef<HTMLDivElement>(null);

  const [joiningDate, setJoiningDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Step 3: Compensation
  const [annualCtc, setAnnualCtc] = useState<string>('');
  const [basicPercent, setBasicPercent] = useState<string>('50.0');
  const [hraPercent, setHraPercent] = useState<string>('40');
  const [incentiveApplicable, setIncentiveApplicable] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill City & State when PIN Code is entered
  useEffect(() => {
    const cleanPin = pinCode.replace(/\D/g, '');
    if (cleanPin.length === 6) {
      // 1. Instant local lookup
      const prefix3 = cleanPin.substring(0, 3);
      if (PIN_PREFIX_MAP[prefix3]) {
        const info = PIN_PREFIX_MAP[prefix3];
        setCity((prev) => prev || info.city);
        setState((prev) => prev || info.state);
        if (!workLocation) {
          setWorkLocation(info.city);
        }
        if (info.metro) {
          setHraPercent('50');
        }
      }

      // 2. Fetch from Postal PIN API with fallback
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
            if (!workLocation && fetchedDistrict) {
              setWorkLocation(fetchedDistrict);
            }
            // Auto suggest metro HRA if applicable
            const lowerCity = (fetchedDistrict || '').toLowerCase();
            if (METRO_CITIES.some((m) => lowerCity.includes(m))) {
              setHraPercent('50');
            }
          }
        })
        .catch(() => {
          // Keep offline match or user input
        })
        .finally(() => {
          setPinLoading(false);
        });
    }
  }, [pinCode]);

  // Adjust suggested HRA if work location or city matches metro
  useEffect(() => {
    const targetLoc = (workLocation || city).toLowerCase();
    if (METRO_CITIES.some((m) => targetLoc.includes(m))) {
      setHraPercent('50');
    } else {
      setHraPercent('40');
    }
  }, [workLocation, city]);

  // Listen for outside click to close designation dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (designationRef.current && !designationRef.current.contains(e.target as Node)) {
        setIsDesignationOpen(false);
        setIsAddingPosition(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtered positions based on active search
  const filteredPositions = positions.filter((p) =>
    p.toLowerCase().includes(designationSearch.toLowerCase().trim())
  );

  // Add custom designation / position handler
  const handleAddNewPosition = (titleToAdd?: string) => {
    const trimmed = (titleToAdd !== undefined ? titleToAdd : newPositionInput).trim();
    if (!trimmed) {
      setIsAddingPosition(false);
      return;
    }

    if (!positions.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [trimmed, ...positions];
      setPositions(updated);
      try {
        localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    }

    setDesignation(trimmed);
    setNewPositionInput('');
    setDesignationSearch('');
    setIsAddingPosition(false);
    setIsDesignationOpen(false);
    setError(null);
  };

  // Delete custom position from list
  const handleDeletePosition = (posToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = positions.filter((p) => p !== posToDelete);
    setPositions(updated);
    try {
      localStorage.setItem(POSITIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
    if (designation === posToDelete) {
      setDesignation('');
    }
  };

  // Add custom department handler
  const handleAddNewDepartment = () => {
    const trimmed = newDeptInput.trim();
    if (!trimmed) {
      setIsAddingDept(false);
      return;
    }

    if (!departments.includes(trimmed)) {
      const updated = [...departments, trimmed];
      setDepartments(updated);
      try {
        localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    }

    setDepartment(trimmed);
    setNewDeptInput('');
    setIsAddingDept(false);
    setError(null);
  };

  // Validation per step
  const validateStep1 = () => {
    if (!firstName.trim()) {
      setError('Please enter employee first name.');
      return false;
    }
    if (!lastName.trim()) {
      setError('Please enter employee last name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid employee email address.');
      return false;
    }
    if (!pinCode.trim() || pinCode.replace(/\D/g, '').length !== 6) {
      setError('Please enter a valid 6-digit PIN code.');
      return false;
    }
    if (!city.trim()) {
      setError('Please enter or verify the District / City.');
      return false;
    }
    if (!state.trim()) {
      setError('Please enter or verify the State.');
      return false;
    }
    if (!addressLine.trim()) {
      setError('Please enter the Address Line (Building, street, locality).');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!department || department === '--- Select ---' || department === '__ADD_NEW__') {
      setError('Please select or add an Employee Department.');
      return false;
    }
    if (!workLocation.trim()) {
      setError('Please specify the Work Location.');
      return false;
    }
    if (!designation.trim()) {
      setError('Please specify the Employee Designation.');
      return false;
    }
    if (!joiningDate) {
      setError('Please enter the Date of Joining.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep3 = () => {
    const ctcNum = parseFloat(annualCtc);
    if (isNaN(ctcNum) || ctcNum <= 0) {
      setError('Please enter a valid Annual CTC (INR).');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        if (!workLocation && city) {
          setWorkLocation(city);
        }
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 1) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    const fullName = `${title} ${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const payload: CreateEmployeePayload = {
        fullName,
        title,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalEmail: email.trim().toLowerCase(),
        phone: phone.trim() ? (phone.startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`) : undefined,
        pinCode: pinCode.trim(),
        city: city.trim(),
        state: state.trim(),
        addressLine: addressLine.trim(),
        department: department.trim(),
        workLocation: workLocation.trim(),
        designation: designation.trim(),
        joiningDate,
        employmentType: 'Full-time',
        status: 'ACTIVE',
        annualCtc: parseFloat(annualCtc),
        currency: 'INR',
        basicPercent: parseFloat(basicPercent) || 50,
        hraPercent: parseFloat(hraPercent) || 40,
        incentiveApplicable,
      };

      await EmployeeService.createEmployee(payload);
      onEmployeeAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
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
          width: '100%',
          maxWidth: 780,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '18px 24px 10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#0052cc',
              letterSpacing: '-0.01em',
            }}
          >
            Add New Employee
          </h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 20,
              top: 18,
              background: 'none',
              border: 'none',
              color: '#334155',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 24px 18px 24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: 30,
              padding: '4px 8px',
              gap: 8,
            }}
          >
            {/* Step 1 Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                backgroundColor: currentStep === 1 || currentStep > 1 ? '#0066cc' : 'transparent',
                color: currentStep === 1 || currentStep > 1 ? '#ffffff' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (currentStep > 1) setCurrentStep(1);
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: currentStep > 1 ? 'none' : '1.5px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {currentStep > 1 ? <Check size={13} strokeWidth={3} /> : '1'}
              </div>
              <span>Employee</span>
            </div>

            {/* Divider Line 1-2 */}
            <div
              style={{
                width: 24,
                height: 2,
                backgroundColor: currentStep >= 2 ? '#0066cc' : '#cbd5e1',
                borderRadius: 1,
              }}
            />

            {/* Step 2 Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                backgroundColor:
                  currentStep === 2
                    ? '#ffffff'
                    : currentStep > 2
                    ? '#0066cc'
                    : 'transparent',
                border: currentStep === 2 ? '1.5px solid #0066cc' : '1.5px solid transparent',
                color:
                  currentStep === 2
                    ? '#0066cc'
                    : currentStep > 2
                    ? '#ffffff'
                    : '#64748b',
                fontWeight: 600,
                fontSize: '0.8125rem',
                cursor: currentStep > 2 ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (currentStep > 2) setCurrentStep(2);
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: currentStep > 2 ? 'none' : '1.5px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {currentStep > 2 ? <Check size={13} strokeWidth={3} /> : '2'}
              </div>
              <span>Role & Joining</span>
            </div>

            {/* Divider Line 2-3 */}
            <div
              style={{
                width: 24,
                height: 2,
                backgroundColor: currentStep === 3 ? '#0066cc' : '#cbd5e1',
                borderRadius: 1,
              }}
            />

            {/* Step 3 Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 20,
                backgroundColor: currentStep === 3 ? '#ffffff' : 'transparent',
                border: currentStep === 3 ? '1.5px solid #0066cc' : '1.5px solid transparent',
                color: currentStep === 3 ? '#0066cc' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8125rem',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '1.5px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                3
              </div>
              <span>Compensation</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              margin: '0 24px 12px 24px',
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.8125rem',
              borderRadius: 8,
              border: '1px solid #fee2e2',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }}>
          <div
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '24px',
              backgroundColor: '#ffffff',
            }}
          >
            {/* =============================================================== */}
            {/* STEP 1: EMPLOYEE DETAILS & ADDRESS                              */}
            {/* =============================================================== */}
            {currentStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Section 1: Employee Details */}
                <div>
                  <div
                    style={{
                      borderBottom: '2.5px solid #0066cc',
                      display: 'inline-block',
                      paddingBottom: 2,
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.975rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      Employee Details
                    </h3>
                  </div>

                  {/* Name of Employee */}
                  <div style={{ marginBottom: 14 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        marginBottom: 6,
                      }}
                    >
                      Name of Employee <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value as any)}
                        style={{
                          width: 85,
                          padding: '9px 10px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          backgroundColor: '#ffffff',
                          color: '#1e293b',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                      </select>

                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />

                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={{
                          flex: 1,
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        Email ID <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Type here..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        Phone Number <span style={{ fontWeight: 400, color: '#64748b' }}>(Optional)</span>
                      </label>
                      <div style={{ display: 'flex' }}>
                        <div
                          style={{
                            padding: '9px 10px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            backgroundColor: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRight: 'none',
                            borderTopLeftRadius: 8,
                            borderBottomLeftRadius: 8,
                            color: '#334155',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          IN +91
                        </div>
                        <input
                          type="tel"
                          placeholder="Type here..."
                          value={phone.replace(/^\+91\s*/, '')}
                          onChange={(e) => setPhone(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            fontSize: '0.85rem',
                            border: '1px solid #cbd5e1',
                            borderTopRightRadius: 8,
                            borderBottomRightRadius: 8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Employee Address */}
                <div>
                  <div
                    style={{
                      borderBottom: '2.5px solid #0066cc',
                      display: 'inline-block',
                      paddingBottom: 2,
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.975rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      Employee Address
                    </h3>
                  </div>

                  {/* PIN, City, State */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        PIN Code <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Type here..."
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                        {pinLoading ? 'Looking up pincode...' : 'City & State auto fill from PIN'}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        District / City <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Auto filled"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        State <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Auto filled"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </div>
                  </div>

                  {/* Address Line */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        marginBottom: 6,
                      }}
                    >
                      Address Line <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Building, street, locality"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 2: POSITION, ROLE & JOINING                                */}
            {/* =============================================================== */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Section 1: Position */}
                <div>
                  <div
                    style={{
                      borderBottom: '2.5px solid #0066cc',
                      display: 'inline-block',
                      paddingBottom: 2,
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.975rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      Position
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    {/* Department (IT, HR, TA, BDM + Add Option) */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <label
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#1e293b',
                          }}
                        >
                          Employee Department <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        {!isAddingDept && (
                          <button
                            type="button"
                            onClick={() => setIsAddingDept(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0066cc',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                              padding: 0,
                            }}
                          >
                            <Plus size={12} strokeWidth={2.5} /> Add
                          </button>
                        )}
                      </div>

                      {isAddingDept ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type="text"
                            placeholder="e.g. Finance"
                            value={newDeptInput}
                            onChange={(e) => setNewDeptInput(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewDepartment();
                              } else if (e.key === 'Escape') {
                                setIsAddingDept(false);
                                setNewDeptInput('');
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              fontSize: '0.85rem',
                              border: '1.5px solid #0066cc',
                              borderRadius: 8,
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddNewDepartment}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: '#0066cc',
                              color: '#ffffff',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingDept(false);
                              setNewDeptInput('');
                            }}
                            style={{
                              padding: '8px 10px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              cursor: 'pointer',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <select
                          value={department}
                          onChange={(e) => {
                            if (e.target.value === '__ADD_NEW__') {
                              setIsAddingDept(true);
                            } else {
                              setDepartment(e.target.value);
                            }
                          }}
                          required
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            fontSize: '0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            backgroundColor: '#ffffff',
                            color: department ? '#1e293b' : '#64748b',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="">--- Select ---</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                          <option
                            value="__ADD_NEW__"
                            style={{ color: '#0066cc', fontWeight: 600 }}
                          >
                            + Add New Department...
                          </option>
                        </select>
                      )}
                    </div>

                    {/* Work Location */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        Work Location <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={workLocation}
                        onChange={(e) => setWorkLocation(e.target.value)}
                        required
                        list="indian-cities"
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                      <datalist id="indian-cities">
                        <option value="Bengaluru" />
                        <option value="Mumbai" />
                        <option value="Delhi NCR" />
                        <option value="Hyderabad" />
                        <option value="Pune" />
                        <option value="Chennai" />
                        <option value="Kolkata" />
                        <option value="Ahmedabad" />
                        <option value="Gurugram" />
                        <option value="Noida" />
                        <option value="Remote" />
                      </datalist>
                    </div>

                    {/* Employee Designation / Position with Authority to Add Positions */}
                    <div ref={designationRef} style={{ position: 'relative' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <label
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            color: '#1e293b',
                            margin: 0,
                          }}
                        >
                          Employee Designation (Position) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        {!isAddingPosition && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingPosition(true);
                              setIsDesignationOpen(false);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0284c7',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 6px',
                              borderRadius: 4,
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <Plus size={13} /> Add New Position
                          </button>
                        )}
                      </div>

                      {/* Inline Add Position Mode */}
                      {isAddingPosition ? (
                        <div
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1.5px dashed #0284c7',
                            borderRadius: 10,
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                            <Sparkles size={14} color="#0284c7" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Add Organization Position
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="text"
                              autoFocus
                              placeholder="e.g. Lead Platform Architect, Staff AI Engineer"
                              value={newPositionInput}
                              onChange={(e) => setNewPositionInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddNewPosition();
                                } else if (e.key === 'Escape') {
                                  setIsAddingPosition(false);
                                  setNewPositionInput('');
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                backgroundColor: '#ffffff',
                                outline: 'none',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddNewPosition()}
                              style={{
                                padding: '8px 14px',
                                backgroundColor: '#0284c7',
                                color: '#ffffff',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Check size={14} /> Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingPosition(false);
                                setNewPositionInput('');
                              }}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#e2e8f0',
                                color: '#475569',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                          <p style={{ margin: '6px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                            New positions are permanently saved to your company catalog for all employee files and offers.
                          </p>
                        </div>
                      ) : (
                        /* Modern Custom Select Box */
                        <div style={{ position: 'relative' }}>
                          <div
                            onClick={() => {
                              setIsDesignationOpen(!isDesignationOpen);
                              setDesignationSearch('');
                            }}
                            style={{
                              width: '100%',
                              padding: '9px 12px 9px 36px',
                              fontSize: '0.85rem',
                              border: isDesignationOpen ? '1px solid #0284c7' : '1px solid #cbd5e1',
                              borderRadius: 8,
                              backgroundColor: '#ffffff',
                              color: designation ? '#0f172a' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              boxShadow: isDesignationOpen ? '0 0 0 3px rgba(2, 132, 199, 0.12)' : 'none',
                              transition: 'all 0.15s ease',
                              userSelect: 'none',
                            }}
                          >
                            <div style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                              <Briefcase size={16} />
                            </div>
                            <span style={{ fontWeight: designation ? 500 : 400 }}>
                              {designation || 'Select or type a position...'}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {designation && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDesignation('');
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    borderRadius: 4,
                                    display: 'flex',
                                    alignItems: 'center',
                                  }}
                                  title="Clear selection"
                                >
                                  ✕
                                </button>
                              )}
                              <ChevronDown
                                size={16}
                                style={{
                                  color: '#64748b',
                                  transform: isDesignationOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease',
                                }}
                              />
                            </div>
                          </div>

                          {/* Hidden actual form input for form validation */}
                          <input
                            type="text"
                            tabIndex={-1}
                            style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
                            value={designation}
                            onChange={() => {}}
                            required
                          />

                          {/* Floating Dropdown */}
                          {isDesignationOpen && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                left: 0,
                                right: 0,
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 10,
                                boxShadow: '0 14px 30px -4px rgba(15, 23, 42, 0.15), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
                                zIndex: 1060,
                                overflow: 'hidden',
                              }}
                            >
                              {/* Search Box */}
                              <div
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  backgroundColor: '#f8fafc',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Search size={15} color="#64748b" />
                                <input
                                  type="text"
                                  autoFocus
                                  placeholder="Type to filter or add position..."
                                  value={designationSearch}
                                  onChange={(e) => setDesignationSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (filteredPositions.length > 0) {
                                        setDesignation(filteredPositions[0]);
                                        setIsDesignationOpen(false);
                                      } else if (designationSearch.trim()) {
                                        handleAddNewPosition(designationSearch.trim());
                                      }
                                    }
                                  }}
                                  style={{
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    fontSize: '0.8125rem',
                                    width: '100%',
                                    color: '#0f172a',
                                  }}
                                />
                                {designationSearch && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDesignationSearch('');
                                    }}
                                    style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem' }}
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              {/* Quick Add Custom Action if search query doesn't exactly match */}
                              {designationSearch.trim() && !positions.some((p) => p.toLowerCase() === designationSearch.trim().toLowerCase()) && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddNewPosition(designationSearch.trim());
                                  }}
                                  style={{
                                    padding: '10px 14px',
                                    backgroundColor: '#f0f9ff',
                                    borderBottom: '1px solid #e0f2fe',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'background-color 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Sparkles size={15} color="#0284c7" />
                                    <div>
                                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0369a1' }}>
                                        Add &quot;{designationSearch.trim()}&quot; as New Position
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>
                                        Saves to organization position directory
                                      </div>
                                    </div>
                                  </div>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      backgroundColor: '#0284c7',
                                      color: '#ffffff',
                                      borderRadius: 4,
                                    }}
                                  >
                                    + Add
                                  </span>
                                </div>
                              )}

                              {/* Positions List */}
                              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                                {filteredPositions.length === 0 ? (
                                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                                    <p style={{ margin: 0, fontSize: '0.8125rem' }}>No matching positions found.</p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddNewPosition(designationSearch.trim());
                                      }}
                                      style={{
                                        marginTop: 8,
                                        padding: '5px 12px',
                                        backgroundColor: '#0284c7',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Create &quot;{designationSearch.trim()}&quot;
                                    </button>
                                  </div>
                                ) : (
                                  filteredPositions.map((pos) => {
                                    const isSelected = designation === pos;
                                    const isCustom = !DEFAULT_POSITIONS.includes(pos);
                                    return (
                                      <div
                                        key={pos}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDesignation(pos);
                                          setIsDesignationOpen(false);
                                        }}
                                        style={{
                                          padding: '9px 14px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                          color: isSelected ? '#1d4ed8' : '#1e293b',
                                          fontWeight: isSelected ? 600 : 400,
                                          fontSize: '0.8125rem',
                                          cursor: 'pointer',
                                          transition: 'background-color 0.12s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                          {isSelected ? (
                                            <Check size={15} color="#2563eb" />
                                          ) : (
                                            <div style={{ width: 15 }} />
                                          )}
                                          <span>{pos}</span>
                                          {isCustom && (
                                            <span
                                              style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 600,
                                                padding: '1px 6px',
                                                backgroundColor: '#fef3c7',
                                                color: '#b45309',
                                                borderRadius: 4,
                                                border: '1px solid #fde68a',
                                              }}
                                            >
                                              Custom
                                            </span>
                                          )}
                                        </div>

                                        {isCustom && (
                                          <button
                                            type="button"
                                            title="Delete custom position"
                                            onClick={(e) => handleDeletePosition(pos, e)}
                                            style={{
                                              border: 'none',
                                              background: 'none',
                                              color: '#94a3b8',
                                              cursor: 'pointer',
                                              padding: '3px 5px',
                                              borderRadius: 4,
                                              display: 'flex',
                                              alignItems: 'center',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                                          >
                                            <Trash2 size={13} />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Footer Action */}
                              <div
                                style={{
                                  padding: '8px 12px',
                                  borderTop: '1px solid #f1f5f9',
                                  backgroundColor: '#fafafa',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                  {positions.length} organization positions
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingPosition(true);
                                    setIsDesignationOpen(false);
                                  }}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#0284c7',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                  }}
                                >
                                  <Plus size={13} /> Add Position
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Joining & Signatory */}
                <div>
                  <div
                    style={{
                      borderBottom: '2.5px solid #0066cc',
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: 8,
                      paddingBottom: 2,
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.975rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      Joining & Signatory
                    </h3>
                    <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 400 }}>
                      When they join and who signs the offer.
                    </span>
                  </div>

                  {/* Date of Joining */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        marginBottom: 6,
                      }}
                    >
                      Date of Joining of the Employee <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 3: COMPENSATION                                            */}
            {/* =============================================================== */}
            {currentStep === 3 && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Section: Compensation */}
                <div>
                  <div
                    style={{
                      borderBottom: '2.5px solid #0066cc',
                      display: 'inline-block',
                      paddingBottom: 2,
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.975rem',
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      Compensation
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    {/* Annual CTC (INR) */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        Annual CTC (INR) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Type here..."
                        value={annualCtc}
                        onChange={(e) => setAnnualCtc(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                    </div>

                    {/* Basic (% of CTC) */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        Basic (% of CTC)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="50.0"
                        value={basicPercent}
                        onChange={(e) => setBasicPercent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </div>

                  {/* HRA (% of Basic) */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ maxWidth: '50%' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: 6,
                        }}
                      >
                        HRA (% of Basic)
                      </label>
                      <input
                        type="number"
                        step="1"
                        placeholder="40"
                        value={hraPercent}
                        onChange={(e) => setHraPercent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                        }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                        Suggested for your selected city, You can edit
                      </div>
                    </div>
                  </div>

                  {/* Incentive Applicable Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      id="incentiveApplicable"
                      checked={incentiveApplicable}
                      onChange={(e) => setIncentiveApplicable(e.target.checked)}
                      style={{
                        width: 18,
                        height: 18,
                        cursor: 'pointer',
                        accentColor: '#0066cc',
                      }}
                    />
                    <label
                      htmlFor="incentiveApplicable"
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      Incentive Applicable
                    </label>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Navigation Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          {/* Back / Home Button */}
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '8px 18px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#0066cc',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={16} />
            <span>{currentStep === 1 ? 'Home' : 'Back'}</span>
          </button>

          {/* Continue / Submit Button */}
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 20px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#0066cc',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <span>Save and continue</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 22px',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#0066cc',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <span>{loading ? 'Adding Employee...' : 'Add Employee'}</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
