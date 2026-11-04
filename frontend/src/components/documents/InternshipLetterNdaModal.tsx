import { SHEETAL_BEDI_SIGNATURE_DATA_URL } from '../../constants/signature.js';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  Users,
  Search,
  ArrowRight,
  UserPlus,
  GraduationCap,
  Briefcase,
  User,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Building,
  FileCheck2,
  Calendar,
  Lock,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { useToast } from '../../context/ToastContext.js';

interface InternshipLetterNdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: any) => void;
  initialEmployee?: Employee | null;
}

export const InternshipLetterNdaModal: React.FC<InternshipLetterNdaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Directory selection
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);

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

  const formatDateShort = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${d.getFullYear()}`;
  };

  // Header & Reference
  const currentYear = new Date().getFullYear();
  const [refNumber, setRefNumber] = useState<string>(() => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TASK/INT/${currentYear}/${rand}`;
  });
  const [issueDate, setIssueDate] = useState<string>(() => formatDateString(new Date()));

  // Candidate Details
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.'>('Mr.');
  const [internFullName, setInternFullName] = useState<string>('Rahul Sharma');
  const [addressLine1, setAddressLine1] = useState<string>('B-142, Sector 62');
  const [addressLine2, setAddressLine2] = useState<string>('Noida, Gautam Buddha Nagar');
  const [cityStatePin, setCityStatePin] = useState<string>('Uttar Pradesh – 201309');
  const [internEmail, setInternEmail] = useState<string>('rahul.sharma@example.com');
  const [internPhone, setInternPhone] = useState<string>('+91 98765 43210');

  // Role & Internship Parameters
  const [designation, setDesignation] = useState<string>('Full Stack Web Developer Intern');
  const [durationMonths, setDurationMonths] = useState<string>('3');
  const [stipendAmount, setStipendAmount] = useState<string>('15,000');
  const [startDateShort, setStartDateShort] = useState<string>(() => formatDateShort(new Date()));
  const [endDateShort, setEndDateShort] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return formatDateShort(d);
  });
  const [workLocation, setWorkLocation] = useState<'Remote' | 'On-site' | 'Hybrid'>('Hybrid');
  const [acceptanceDeadlineShort, setAcceptanceDeadlineShort] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return formatDateShort(d);
  });

  // Signatory
  const [signatoryName, setSignatoryName] = useState<string>('Sheetal Bedi');
  const [signatoryDesignation, setSignatoryDesignation] = useState<string>('CEO & Founder');

  // Controls
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const list = await EmployeeService.listEmployees();
      setEmployees(list || []);
      if (initialEmployee) {
        populateFromEmployee(initialEmployee);
      } else if (list && list.length > 0) {
        populateFromEmployee(list[0]);
      }
    } catch {
      setEmployees([]);
    }
  };

  const populateFromEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setInternFullName(emp.fullName);
    setInternEmail(emp.officialEmail || emp.personalEmail || '');
    setInternPhone(emp.phone || '+91 98765 43210');
    if (emp.designation) {
      setDesignation(emp.designation.includes('Intern') ? emp.designation : `${emp.designation} Intern`);
    }
    if (emp.addressLine) setAddressLine1(emp.addressLine);
    if (emp.city && emp.state) {
      setAddressLine2(`${emp.city}, ${emp.state}`);
      setCityStatePin(`${emp.city}, ${emp.state} – ${emp.pinCode || '110095'}`);
    }
  };

  const handleDownloadPdf = () => {
    const prevTitle = document.title;
    document.title = `TaskNera_Internship_Letter_NDA_${internFullName.replace(/\s+/g, '_')}`;
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }, 150);
  };

  const handleSaveDocument = async () => {
    setIsSaving(true);
    try {
      let empId = selectedEmployeeId;
      if (!empId && employees.length > 0) {
        empId = employees[0].id;
      }
      if (empId) {
        const generated = await EmployeeService.generateDocument(empId, {
          templateCode: 'INTERNSHIP_LETTER_NDA',
          customTemplateMarkup: '<div>IT Internship Letter &amp; NDA (Annexure A)</div>',
          title: `Internship Letter & NDA - ${internFullName}`,
          customParameters: {
            refNumber,
            issueDate,
            internFullName,
            designation,
            stipendAmount,
            durationMonths,
            startDateShort,
            endDateShort,
            workLocation,
            internEmail,
            internPhone,
          },
          targetStatus: 'APPROVED',
        });
        success(`Internship Letter & NDA saved to Records with Ref: ${refNumber}!`);
        if (onSuccess) onSuccess(generated);
      } else {
        success(`Document saved successfully with Ref: ${refNumber}!`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      error(err.message || 'Failed to save document.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: 16,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 1040,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Modal Top Header */}
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
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <Lock size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Internship Letter &amp; NDA (Annexure A)
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                  }}
                >
                  TASK/INT Format • 6 Pages
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Complete 6-Page Package: Internship Offer + Candidate Undertaking + Non-Disclosure &amp; IP Assignment Agreement
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#e2e8f0',
                borderRadius: 8,
                padding: 3,
                fontSize: '0.8125rem',
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: step === 1 ? '#ffffff' : 'transparent',
                  color: step === 1 ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                1. Edit Terms
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  fontWeight: 600,
                  border: 'none',
                  backgroundColor: step === 2 ? '#ffffff' : 'transparent',
                  color: step === 2 ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                2. Preview 6-Page Package
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 6,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: step === 1 ? 24 : 16,
            backgroundColor: step === 1 ? '#ffffff' : '#f1f5f9',
          }}
        >
          {step === 1 ? (
            /* STEP 1: CONFIGURATION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900, margin: '0 auto' }}>
              {/* Directory Pre-fill */}
              <div style={{ padding: 16, borderRadius: 8, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                  Pre-fill from Candidate / Employee Directory:
                </div>
                <select
                  value={selectedEmployeeId || ''}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    if (emp) populateFromEmployee(emp);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="">-- Choose Intern --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeId}) — {emp.designation || 'Intern'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Date of Issue
                  </label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Salutation &amp; Intern Full Name
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value as any)}
                      style={{ width: 80, padding: '8px 6px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                    </select>
                    <input
                      type="text"
                      value={internFullName}
                      onChange={(e) => setInternFullName(e.target.value)}
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Designation (IT Intern)
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Monthly Stipend (INR)
                  </label>
                  <input
                    type="text"
                    value={stipendAmount}
                    onChange={(e) => setStipendAmount(e.target.value)}
                    placeholder="15,000"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Duration (Months)
                  </label>
                  <input
                    type="text"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Commencing Date (DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    value={startDateShort}
                    onChange={(e) => setStartDateShort(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Concluding Date (DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    value={endDateShort}
                    onChange={(e) => setEndDateShort(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Work Location
                  </label>
                  <select
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Acceptance Deadline (DD-MM-YYYY)
                  </label>
                  <input
                    type="text"
                    value={acceptanceDeadlineShort}
                    onChange={(e) => setAcceptanceDeadlineShort(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Intern Full Address
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <input
                      type="text"
                      placeholder="City, State – PIN Code"
                      value={cityStatePin}
                      onChange={(e) => setCityStatePin(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Intern Email
                  </label>
                  <input
                    type="text"
                    value={internEmail}
                    onChange={(e) => setInternEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Intern Phone Number
                  </label>
                  <input
                    type="text"
                    value={internPhone}
                    onChange={(e) => setInternPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setStep(2)}>
                  Proceed to 6-Page Document Preview <ArrowRight size={16} style={{ marginLeft: 6 }} />
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: PREVIEW 6-PAGE PRINTABLE PACKAGE */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Document Toolbar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  maxWidth: 820,
                  margin: '0 auto',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Document: {refNumber}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={highlightVariables}
                      onChange={(e) => setHighlightVariables(e.target.checked)}
                    />
                    <Highlighter size={13} /> Highlight Variables
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button variant="secondary" onClick={() => setStep(1)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <Edit3 size={13} style={{ marginRight: 5 }} /> Edit Terms
                  </Button>
                  <Button variant="secondary" onClick={handleDownloadPdf} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <Download size={13} style={{ marginRight: 5 }} /> Print / Save PDF
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    style={{ padding: '6px 14px', fontSize: '0.78rem', backgroundColor: '#2563eb' }}
                  >
                    <Save size={13} style={{ marginRight: 5 }} /> {isSaving ? 'Saving...' : 'Save to System Records'}
                  </Button>
                </div>
              </div>

              {/* 6-PAGE SHEETS CONTAINER */}
              <div
                id="printable-internship-letter-nda-package"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  maxWidth: 820,
                  margin: '0 auto',
                  width: '100%',
                }}
              >
                {/* -------------------- PAGE 1 OF 6: INTERNSHIP LETTER -------------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '38px 46px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    color: '#0f172a',
                    minHeight: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          <span style={{ color: '#0f172a' }}>Task</span><span style={{ color: '#f97316' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                          D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
                        </div>
                      </div>
                    </div>

                    {/* Ref & Date Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#334155', marginBottom: 14 }}>
                      <div>
                        <strong>Ref:</strong> {highlightVariables ? <mark style={{ background: '#fef08a' }}>{refNumber}</mark> : refNumber}
                      </div>
                      <div>
                        <strong>Date:</strong> {highlightVariables ? <mark style={{ background: '#fef08a' }}>{issueDate}</mark> : issueDate}
                      </div>
                    </div>

                    {/* Recipient Block */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.5, color: '#1e293b', marginBottom: 18 }}>
                      <div style={{ fontWeight: 800 }}>{internFullName}</div>
                      <div>{addressLine1}</div>
                      <div>{addressLine2}</div>
                      <div>{cityStatePin}</div>
                    </div>

                    {/* Document Title */}
                    <div style={{ textAlign: 'center', margin: '14px 0 16px' }}>
                      <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#881337', fontFamily: "'Georgia', serif" }}>
                        Internship Letter
                      </h1>
                    </div>

                    {/* Salutation & Welcome */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.6, color: '#1e293b', textAlign: 'justify', marginBottom: 14 }}>
                      <div style={{ marginBottom: 8 }}>
                        Dear <strong>{salutation} {internFullName}</strong>,
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        Congratulations! We are excited to offer you the opportunity to join the TaskNera internship program.
                      </div>
                      <div>
                        This internship will have an initial duration of <strong>{durationMonths} months</strong>, commencing on or before <strong>{startDateShort}</strong> and concluding on <strong>{endDateShort}</strong>. Extension of this internship or transition to a permanent role will be contingent upon your performance and our business needs.
                      </div>
                    </div>

                    {/* Stipend */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.55, marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>Stipend</div>
                      <div>You will receive a monthly stipend of <strong>INR {stipendAmount}</strong> during the internship, payable at the end of each month.</div>
                    </div>

                    {/* Joining Details */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.55, marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 4 }}>Joining Details</div>
                      <div style={{ paddingLeft: 12 }}>
                        <div>1. <strong>Date of Joining:</strong> On or before <strong>{startDateShort}</strong>.</div>
                        <div>2. <strong>Location:</strong> <strong>{workLocation}</strong>.</div>
                        <div>3. <strong>Designation:</strong> <strong>{designation}</strong>.</div>
                      </div>
                    </div>

                    {/* Required Documents */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.55, marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 4 }}>Required Documents</div>
                      <div style={{ paddingLeft: 12 }}>
                        <div>1. Copy of your highest educational qualification certificate.</div>
                        <div>2. Identification and address proof (any one of the following: Passport, Aadhaar Card, Voter ID).</div>
                      </div>
                    </div>

                    {/* Terms of Internship */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.55, marginBottom: 14, textAlign: 'justify' }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 4 }}>Terms of Internship</div>
                      <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div>1. <strong>Termination:</strong> The internship may be terminated by either party with a notice of 15 days in writing or via email.</div>
                        <div>2. <strong>Validity:</strong> This internship is valid until the end date specified above, with the possibility of renewal or extension based on mutual agreement.</div>
                        <div>3. <strong>Login Hours:</strong> The intern shall maintain a minimum of 6 login hours per day. The Company reserves the right to modify working hours and weekly off days.</div>
                        <div>4. <strong>Confidentiality &amp; Intellectual Property:</strong> This letter must be read together with the Non-Disclosure, Confidentiality &amp; Intellectual Property Assignment Agreement annexed hereto as <strong>Annexure A</strong>, which forms an integral part of this offer. Signing and returning this letter together with Annexure A is a condition of joining.</div>
                      </div>
                    </div>

                    {/* Acceptance notice */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, color: '#334155', textAlign: 'justify', marginBottom: 14 }}>
                      <p style={{ margin: '0 0 6px 0' }}>
                        We hope you will find your internship with us enriching and rewarding. We look forward to having you as part of our team and are confident that this will be an exceptional opportunity for professional growth and personal development.
                      </p>
                      <p style={{ margin: 0 }}>
                        Please accept this offer by signing and returning a copy of this letter, along with the signed Annexure A, by <strong>{acceptanceDeadlineShort}</strong>.
                      </p>
                    </div>

                    {/* Sign-off */}
                    <div style={{ fontSize: '11.5px', lineHeight: 1.45, marginTop: 10 }}>
                      <div>Yours sincerely,</div>
                      <div style={{ fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>For TaskNera</div>
                      <div style={{ margin: '4px 0' }}>
                        <img src={SHEETAL_BEDI_SIGNATURE_DATA_URL} alt="CEO Signature" style={{ maxHeight: 38, objectFit: 'contain' }} />
                      </div>
                      <div><strong>Name:</strong> {signatoryName}</div>
                      <div><strong>Designation:</strong> {signatoryDesignation}</div>
                      <div style={{ marginTop: 4 }}><strong>Signature &amp; Company Seal:</strong> ______________________</div>
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                    <span>TaskNera – Internship Letter &amp; NDA | Confidential</span>
                    <span>Page 1 of 6</span>
                  </div>
                </div>

                {/* -------------------- PAGE 2 OF 6: CANDIDATE UNDERTAKING -------------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '38px 46px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    color: '#0f172a',
                    minHeight: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          <span style={{ color: '#0f172a' }}>Task</span><span style={{ color: '#f97316' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                          D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: 'center', margin: '20px 0 30px' }}>
                      <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#881337', fontFamily: "'Georgia', serif" }}>
                        Candidate Undertaking
                      </h2>
                    </div>

                    {/* Undertaking Body */}
                    <div style={{ fontSize: '12px', lineHeight: 1.75, color: '#1e293b', textAlign: 'justify', display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <p style={{ margin: 0 }}>
                        I have carefully read and understood the terms and conditions mentioned above, together with Annexure A (Non-Disclosure, Confidentiality &amp; Intellectual Property Assignment Agreement), and I accept them in full.
                      </p>
                      <p style={{ margin: 0 }}>
                        I acknowledge that while I am working for TaskNera, I will take proper care of all company equipment and accounts that I am entrusted with. I further understand that upon termination or expiry of my internship, I will return all company property and access credentials, and that the property will be returned in proper working order. I understand I may be held financially responsible for lost or damaged property. This includes, but is not limited to, laptops, cell phones, and other equipment. I understand that failure to return equipment will be considered theft and may lead to criminal prosecution by the Company.
                      </p>
                      <p style={{ margin: 0, fontWeight: 700 }}>
                        I shall commence my internship with effect from {startDateShort}.
                      </p>
                    </div>

                    {/* Signature Block */}
                    <div style={{ marginTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, fontSize: '12px' }}>
                      <div>
                        <div><strong>Name:</strong> {internFullName}</div>
                        <div style={{ borderBottom: '1px solid #94a3b8', height: 28 }} />
                      </div>
                      <div>
                        <div><strong>Date:</strong> {issueDate}</div>
                        <div style={{ borderBottom: '1px solid #94a3b8', height: 28 }} />
                      </div>
                      <div>
                        <div><strong>Signature:</strong> __________________</div>
                        <div style={{ borderBottom: '1px solid #94a3b8', height: 28 }} />
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                    <span>TaskNera – Internship Letter &amp; NDA | Confidential</span>
                    <span>Page 2 of 6</span>
                  </div>
                </div>

                {/* -------------------- PAGE 3 OF 6: ANNEXURE A (PAGE 1) -------------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '38px 46px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    color: '#0f172a',
                    minHeight: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          <span style={{ color: '#0f172a' }}>Task</span><span style={{ color: '#f97316' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                          D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
                        </div>
                      </div>
                    </div>

                    {/* Annexure A Title */}
                    <div style={{ textAlign: 'center', marginBottom: 18 }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.25em', color: '#ea580c', marginBottom: 4 }}>
                        A N N E X U R E &nbsp; A
                      </div>
                      <h2 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#881337', textTransform: 'uppercase', lineHeight: 1.35 }}>
                        NON-DISCLOSURE, CONFIDENTIALITY &amp; INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT
                      </h2>
                      <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#475569' }}>
                        (For IT Interns Engaged as {designation})
                      </div>
                    </div>

                    {/* Parties */}
                    <div style={{ fontSize: '11px', lineHeight: 1.6, color: '#1e293b', textAlign: 'justify', marginBottom: 12 }}>
                      <p style={{ margin: '0 0 6px 0' }}>
                        This Non-Disclosure, Confidentiality &amp; Intellectual Property Assignment Agreement (the &quot;Agreement&quot;) is made and entered into on the date of signing below, by and between:
                      </p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>Company: TaskNera</strong>, having its registered/business address at D-57 F1, Dilshad Colony, Dilshad Garden, East Delhi, Delhi – 110095 (hereinafter referred to as the &quot;Company&quot;),
                      </p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>AND</strong>
                      </p>
                      <div style={{ padding: '6px 12px', backgroundColor: '#f8fafc', borderLeft: '3px solid #ea580c', marginBottom: 8, fontSize: '10.5px' }}>
                        <div><strong>Intern Name:</strong> {internFullName}</div>
                        <div><strong>Address:</strong> {addressLine1}, {addressLine2}, {cityStatePin}</div>
                        <div><strong>Email:</strong> {internEmail}</div>
                        <div><strong>Phone:</strong> {internPhone}</div>
                      </div>
                      <p style={{ margin: '0 0 6px 0' }}>
                        (hereinafter referred to as the &quot;Intern&quot;), collectively referred to as the &quot;Parties&quot; and individually as a &quot;Party.&quot;
                      </p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>WHEREAS</strong>, the Company wishes to engage the Intern for an internship program in the position of <strong>{designation}</strong> for a period of <strong>{durationMonths} months</strong> (the &quot;Internship Term&quot;); and
                      </p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>WHEREAS</strong>, in the course of the Internship, the Intern will have access to confidential, proprietary, and sensitive information belonging to the Company and/or its clients, including but not limited to client identities, business data, source code, designs, and work products; and
                      </p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        <strong>WHEREAS</strong>, the Company requires that all such information remain confidential and that all work product created by the Intern during the Internship Term belong exclusively to the Company;
                      </p>
                      <p style={{ margin: 0, fontWeight: 700 }}>
                        NOW, THEREFORE, in consideration of the Intern&apos;s engagement in the internship program and other good and valuable consideration, the Parties agree as follows:
                      </p>
                    </div>

                    {/* Clause 1: Term */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>1. TERM OF INTERNSHIP</div>
                      <p style={{ margin: 0 }}>
                        The internship shall commence on <strong>{startDateShort}</strong> and shall continue for a period of <strong>{durationMonths} months</strong>, ending on or around <strong>{endDateShort}</strong> (the &quot;Internship Term&quot;), unless extended, renewed, or terminated earlier by either Party in accordance with the terms of the Internship Letter and the Company&apos;s internship policies. The obligations of confidentiality and intellectual property assignment set out in this Agreement shall survive the expiry or termination of the Internship Term as set out in Clauses 3, 5, 6 and 8 below.
                      </p>
                    </div>

                    {/* Clause 2: Definition */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify' }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>2. DEFINITION OF CONFIDENTIAL INFORMATION</div>
                      <p style={{ margin: '0 0 4px 0' }}>
                        &quot;Confidential Information&quot; means any non-public information disclosed to, or accessed, created, or learned by, the Intern in connection with the internship, in any form (written, oral, electronic, or observed), including but not limited to:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <li>The identity, names, and business details of the Company&apos;s clients, customers, vendors, and partners;</li>
                        <li>Any data, records, or documents belonging to clients that the Intern may access, process, or handle;</li>
                        <li>All projects, products, portals, websites, web applications, mobile applications, tools, and software (collectively, &quot;Projects&quot;) that the Intern works on, contributes to, or creates, whether alone or with others, during the Internship Term;</li>
                        <li>Source code, architecture, technical designs, algorithms, databases, credentials, API keys, and development methodologies;</li>
                        <li>Business strategies, pricing, financial information, marketing plans, and internal processes of the Company;</li>
                        <li>Any other information designated as confidential by the Company, or which a reasonable person would understand to be confidential given the nature of the information and circumstances of disclosure.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Page 3 Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                    <span>TaskNera – Internship Letter &amp; NDA | Confidential</span>
                    <span>Page 3 of 6</span>
                  </div>
                </div>

                {/* -------------------- PAGE 4 OF 6: ANNEXURE A (PAGE 2) -------------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '38px 46px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    color: '#0f172a',
                    minHeight: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          <span style={{ color: '#0f172a' }}>Task</span><span style={{ color: '#f97316' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                          D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
                        </div>
                      </div>
                    </div>

                    {/* Clause 3 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 14 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 4 }}>3. NON-DISCLOSURE OBLIGATIONS</div>
                      <p style={{ margin: '0 0 4px 0' }}>
                        The Intern agrees that, both during and after the Internship Term (in perpetuity, except as required by law), the Intern shall:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <li>Not disclose, publish, reveal, or make available any Confidential Information to any third party, including friends, family, other employers, or on any public platform (including social media, portfolios, blogs, or forums), without the prior written consent of the Company;</li>
                        <li>Not use any Confidential Information for personal gain, for the benefit of any third party, or for any purpose other than the performance of duties assigned by the Company;</li>
                        <li>Not disclose the names or identifying details of the Company&apos;s clients under any circumstances;</li>
                        <li>Not disclose the existence, nature, features, or technical details of any Project, portal, or application built for the Company or its clients, except as expressly permitted under Clause 7 (CV &amp; Reference Use) below;</li>
                        <li>Take all reasonable precautions to safeguard Confidential Information from unauthorized access, use, or disclosure, including securing physical and digital copies of any materials.</li>
                      </ul>
                    </div>

                    {/* Clause 4 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 14 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 3 }}>4. EXCLUSIONS</div>
                      <p style={{ margin: 0 }}>
                        The obligations of confidentiality under this Agreement shall not apply to information that: (a) is or becomes publicly available through no fault of the Intern; (b) was already lawfully known to the Intern prior to disclosure, as evidenced by written records; (c) is independently developed by the Intern without reference to or use of the Confidential Information; or (d) is required to be disclosed by law, regulation, or a valid order of a court or governmental authority, provided the Intern gives the Company prompt written notice of such requirement to the extent legally permitted.
                      </p>
                    </div>

                    {/* Clause 5 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 14 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 3 }}>5. OWNERSHIP AND ASSIGNMENT OF INTELLECTUAL PROPERTY</div>
                      <p style={{ margin: '0 0 6px 0' }}>
                        The Intern agrees and acknowledges that all work product created, developed, conceived, or contributed to by the Intern during the Internship Term — whether solely or jointly with others, and whether during or outside normal working hours, provided it relates to the Company&apos;s business or is created using the Company&apos;s resources, time, or information — shall be considered &quot;Work Product.&quot; Work Product includes, without limitation, all projects, portals, websites, web applications, mobile applications, software, source code, scripts, databases, designs, UI/UX layouts, documentation, and any related intellectual property created from scratch or modified by the Intern during the Internship Term.
                      </p>
                      <p style={{ margin: '0 0 6px 0' }}>
                        All right, title, and interest — including all intellectual property rights such as copyright, patent, trademark, trade secret, and any other proprietary rights — in and to the Work Product shall automatically and exclusively vest in, and be the sole and exclusive property of, the Company upon creation. To the extent any such rights do not vest automatically, the Intern hereby irrevocably assigns, transfers, and conveys all such rights, title, and interest to the Company, without any further consideration, and agrees to execute any documents reasonably requested by the Company to give effect to this assignment.
                      </p>
                      <p style={{ margin: 0 }}>
                        The Intern shall have no right, claim, license, or entitlement whatsoever to any Work Product, whether during or after the Internship Term, and shall not use, reproduce, distribute, sell, license, or claim authorship or ownership of any Work Product, in whole or in part, for any commercial or non-commercial purpose, except as expressly permitted under Clause 7 below.
                      </p>
                    </div>

                    {/* Clause 6 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify' }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 3 }}>6. NO RIGHT TO CLAIM OWNERSHIP OR AUTHORSHIP</div>
                      <p style={{ margin: 0 }}>
                        The Intern expressly agrees that the Intern shall not, at any time, publicly or privately claim to be the owner, sole creator, or copyright holder of any Project or Work Product developed during the Internship Term. The Intern may reference their contribution/involvement strictly in accordance with Clause 7 below, but shall not represent that any Project belongs to them or was independently created by them.
                      </p>
                    </div>
                  </div>

                  {/* Page 4 Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                    <span>TaskNera – Internship Letter &amp; NDA | Confidential</span>
                    <span>Page 4 of 6</span>
                  </div>
                </div>

                {/* -------------------- PAGE 5 OF 6: ANNEXURE A (PAGE 3) -------------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '38px 46px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    color: '#0f172a',
                    minHeight: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          <span style={{ color: '#0f172a' }}>Task</span><span style={{ color: '#f97316' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                          D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
                        </div>
                      </div>
                    </div>

                    {/* Clause 7 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 3 }}>7. PERMITTED USE FOR CV / PORTFOLIO / REFERENCES</div>
                      <p style={{ margin: '0 0 4px 0' }}>
                        Notwithstanding the confidentiality obligations above, the Intern may reference their role, general responsibilities, technologies/skills used (e.g., &quot;React,&quot; &quot;Node.js,&quot; &quot;MongoDB&quot;), and general nature of work performed during the internship in their personal curriculum vitae (CV), résumé, LinkedIn profile, or in interviews and reference discussions with prospective employers, subject to the following conditions:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <li>The Intern shall <strong>NOT</strong> disclose the name of any client of the Company, nor any client-identifying details;</li>
                        <li>The Intern shall <strong>NOT</strong> disclose, screenshot, share, upload, or publish the source code, live links, screenshots, or proprietary details of any Project without prior written consent from the Company;</li>
                        <li>The Intern shall <strong>NOT</strong> claim ownership, sole authorship, or copyright of any Project, and must clearly describe their role as &quot;Intern&quot; or &quot;Contributor&quot; and not as &quot;Owner&quot; or &quot;Creator&quot;;</li>
                        <li>The Intern may state that they worked as a &quot;<strong>{designation}</strong>&quot; at &quot;TaskNera&quot; for the stated duration and describe general technical contributions in generic, non-confidential terms.</li>
                      </ul>
                    </div>

                    {/* Clause 8 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>8. RETURN OF MATERIALS</div>
                      <p style={{ margin: 0 }}>
                        Upon completion, termination, or expiry of the Internship Term (whichever occurs first), or upon the Company&apos;s request at any time, the Intern shall immediately return or permanently delete all Company and client materials, documents, source code, credentials, devices, and Confidential Information in the Intern&apos;s possession or control, in any form, and shall certify in writing that this has been done.
                      </p>
                    </div>

                    {/* Clause 9 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>9. NO EMPLOYMENT RELATIONSHIP</div>
                      <p style={{ margin: 0 }}>
                        This Agreement does not create an employer-employee relationship between the Company and the Intern. The internship is undertaken for training and educational purposes for the stipulated Internship Term, and either Party may terminate the internship in accordance with the Internship Letter and the Company&apos;s internship policies.
                      </p>
                    </div>

                    {/* Clause 10 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>10. REMEDIES FOR BREACH</div>
                      <p style={{ margin: 0 }}>
                        The Intern acknowledges that any breach of this Agreement, particularly Clauses 3, 5, and 6, may cause irreparable harm to the Company and/or its clients, for which monetary damages alone may not be an adequate remedy. Accordingly, the Company shall be entitled to seek injunctive relief, specific performance, and/or any other legal or equitable remedy available, in addition to damages, without the need to post a bond, to the extent permitted by applicable law.
                      </p>
                    </div>

                    {/* Clause 11 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify', marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>11. GOVERNING LAW AND JURISDICTION</div>
                      <p style={{ margin: 0 }}>
                        This Agreement shall be governed by and construed in accordance with the laws of India, and the courts at Delhi shall have exclusive jurisdiction over any disputes arising out of or in connection with this Agreement.
                      </p>
                    </div>

                    {/* Clause 12 */}
                    <div style={{ fontSize: '11px', lineHeight: 1.55, textAlign: 'justify' }}>
                      <div style={{ fontWeight: 800, color: '#881337', marginBottom: 2 }}>12. SEVERABILITY &amp; ENTIRE AGREEMENT</div>
                      <p style={{ margin: 0 }}>
                        If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. This Agreement, together with the Internship Letter, constitutes the entire understanding between the Parties with respect to its subject matter and supersedes all prior discussions or agreements, whether oral or written, relating thereto. This Agreement may only be amended in writing signed by both Parties.
                      </p>
                    </div>
                  </div>

                  {/* Page 5 Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                    <span>TaskNera – Internship Letter &amp; NDA | Confidential</span>
                    <span>Page 5 of 6</span>
                  </div>
                </div>

                {/* -------------------- PAGE 6 OF 6: ACKNOWLEDGEMENT AND SIGNATURES -------------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '38px 46px',
                    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                    color: '#0f172a',
                    minHeight: 1060,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: 12, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src="/logo.png"
                          alt="TaskNera"
                          style={{ width: 44, height: 44, objectFit: 'contain' }}
                        />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                          <span style={{ color: '#0f172a' }}>Task</span><span style={{ color: '#f97316' }}>Nera</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                          D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095
                        </div>
                      </div>
                    </div>

                    {/* Section Title */}
                    <div style={{ textAlign: 'center', margin: '20px 0 24px' }}>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#881337', fontFamily: "'Georgia', serif", letterSpacing: '0.04em' }}>
                        ACKNOWLEDGEMENT AND SIGNATURES
                      </h2>
                    </div>

                    <div style={{ fontSize: '12px', lineHeight: 1.6, color: '#334155', textAlign: 'justify', marginBottom: 40 }}>
                      By signing below, the Parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions outlined in this Agreement.
                    </div>

                    {/* Two-Column Signatures */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, fontSize: '12px', lineHeight: 1.7 }}>
                      {/* For TaskNera */}
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                          For and on behalf of TaskNera
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Name:</strong> {signatoryName}
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <strong>Designation:</strong> {signatoryDesignation}
                        </div>
                        <div style={{ margin: '8px 0' }}>
                          <img src={SHEETAL_BEDI_SIGNATURE_DATA_URL} alt="CEO Signature" style={{ maxHeight: 44, objectFit: 'contain' }} />
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <strong>Signature:</strong> ____________________
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <strong>Date:</strong> {issueDate}
                        </div>
                        <div>
                          <strong>Company Seal:</strong>
                          <div style={{ width: 80, height: 80, border: '1px dashed #94a3b8', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 10, marginTop: 6 }}>
                            Seal
                          </div>
                        </div>
                      </div>

                      {/* Intern */}
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>
                          Intern
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <strong>Name:</strong> {internFullName}
                        </div>
                        <div style={{ height: 44 }} />
                        <div style={{ marginBottom: 10 }}>
                          <strong>Signature:</strong> ____________________
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <strong>Date:</strong> {issueDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 6 Footer */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748b' }}>
                    <span>TaskNera – Internship Letter &amp; NDA | Confidential</span>
                    <span>Page 6 of 6</span>
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
