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
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface InternshipOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: any) => void;
  initialEmployee?: Employee | null;
}

export const InternshipOnboardingModal: React.FC<InternshipOnboardingModalProps> = ({
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
  const formRefNo = 'TASK/HR-FORM/ONBOARD/2026/v1.0';
  const [issueDate, setIssueDate] = useState<string>(() => formatDateString(new Date()));

  // 1. Position Details
  const [positionType, setPositionType] = useState<'Intern' | 'Recruitment Intern' | 'Other'>('Recruitment Intern');
  const [otherPositionText, setOtherPositionText] = useState<string>('');
  const [department, setDepartment] = useState<string>('Human Resources');
  const [reportingTo, setReportingTo] = useState<string>('Ms. Sheetal Bedi / CEO');
  const [startDate, setStartDate] = useState<string>(() => formatDateString(new Date()));
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return formatDateString(d);
  });
  const [workArrangement, setWorkArrangement] = useState<'Remote' | 'On-site' | 'Hybrid'>('Hybrid');
  const [internshipType, setInternshipType] = useState<'Unpaid' | 'Stipend-based'>('Unpaid');
  const [dailyHours, setDailyHours] = useState<string>('10:00 AM to 06:00 PM');
  const [dailyDays, setDailyDays] = useState<string>('Monday – Friday');

  // 2. Personal Details
  const [fullName, setFullName] = useState<string>('Rahul Sharma');
  const [preferredName, setPreferredName] = useState<string>('Rahul');
  const [dob, setDob] = useState<string>('15 July 2002');
  const [mobileNumber, setMobileNumber] = useState<string>('+91 98765 43210');
  const [alternateNumber, setAlternateNumber] = useState<string>('+91 98111 22334');
  const [personalEmail, setPersonalEmail] = useState<string>('rahul.sharma@example.com');
  const [currentAddress, setCurrentAddress] = useState<string>('D-57, Dilshad Colony, Delhi – 110095');
  const [permanentAddress, setPermanentAddress] = useState<string>('D-57, Dilshad Colony, Delhi – 110095');
  const [sameAddress, setSameAddress] = useState<boolean>(true);
  const [languagesKnown, setLanguagesKnown] = useState<string>('English, Hindi');

  // 3. Education Details
  const [highestQualification, setHighestQualification] = useState<string>('BBA / MBA (Pursuing)');
  const [courseStream, setCourseStream] = useState<string>('Human Resources / Management');
  const [yearSemester, setYearSemester] = useState<string>('Final Year / 4th Semester');
  const [collegeUniversity, setCollegeUniversity] = useState<string>('Delhi University');
  const [yearOfCompletion, setYearOfCompletion] = useState<string>('2026');
  const [collegeLetterRequired, setCollegeLetterRequired] = useState<boolean>(false);

  // 4. Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState<string>('Mr. R. K. Sharma');
  const [emergencyRelationship, setEmergencyRelationship] = useState<string>('Father');
  const [emergencyMobile, setEmergencyMobile] = useState<string>('+91 98100 55443');
  const [emergencyAlternate, setEmergencyAlternate] = useState<string>('+91 11 22334455');

  // 5. Work Setup & Role Information
  const [ownLaptop, setOwnLaptop] = useState<boolean>(true);
  const [stableInternet, setStableInternet] = useState<boolean>(true);
  const [internetProvider, setInternetProvider] = useState<string>('High-Speed Broadband (100 Mbps)');
  const [preferredComm, setPreferredComm] = useState<string>('WhatsApp');
  const [priorExperience, setPriorExperience] = useState<boolean>(true);
  const [experienceDetails, setExperienceDetails] = useState<string>('Campus placement drive sourcing & resume screening');
  const [toolsFamiliar, setToolsFamiliar] = useState<Record<string, boolean>>({
    LinkedIn: true,
    Naukri: true,
    Indeed: true,
    ATS: false,
    ExcelSheets: true,
  });
  const [skillsInterest, setSkillsInterest] = useState<string>('Talent Acquisition, Resume Screening, Interview Scheduling, HR Operations');

  // 6. Documents Submitted
  const [docsSubmitted, setDocsSubmitted] = useState<Record<string, boolean>>({
    resume: true,
    govtId: true,
    addressProof: true,
    panCard: true,
    collegeId: true,
    collegeNoc: false,
    photo: true,
  });

  // 7. Bank Details
  const [bankAccountHolder, setBankAccountHolder] = useState<string>('Rahul Sharma');
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('50100492817261');
  const [bankIfsc, setBankIfsc] = useState<string>('HDFC0001234');
  const [bankBranch, setBankBranch] = useState<string>('Dilshad Garden Branch, Delhi');

  // 8. Policy Acknowledgements & Consent
  const [policiesAccepted, setPoliciesAccepted] = useState<Record<string, boolean>>({
    offerTerms: true,
    confidentiality: true,
    dpdpConsent: true,
    posh: true,
    remoteWorkSec: true,
    companyProperty: true,
  });

  // 9. Declaration & Signature
  const [declarationPlace, setDeclarationPlace] = useState<string>('Delhi');

  // 10. HR Use Only
  const [hrReceivedBy, setHrReceivedBy] = useState<string>('HR Operations');
  const [hrReceivedDate, setHrReceivedDate] = useState<string>(() => formatDateString(new Date()));
  const [hrVerifiedBy, setHrVerifiedBy] = useState<string>('Verified / HR Admin');
  const [internIdAssigned, setInternIdAssigned] = useState<string>('TN/INT/2026/042');
  const [emailAccessIssued, setEmailAccessIssued] = useState<boolean>(true);
  const [emailAccessDate, setEmailAccessDate] = useState<string>(() => formatDateString(new Date()));
  const [orientationDone, setOrientationDone] = useState<boolean>(true);
  const [orientationDate, setOrientationDate] = useState<string>(() => formatDateString(new Date()));
  const [policyCompleted, setPolicyCompleted] = useState<boolean>(true);
  const [hrSignature, setHrSignature] = useState<string>('Sheetal Bedi (CEO)');

  // Control State
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load directory
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
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
    } finally {
      setLoadingEmployees(false);
    }
  };

  const populateFromEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setFullName(emp.fullName);
    setPreferredName(emp.firstName || emp.fullName.split(' ')[0] || '');
    setPersonalEmail(emp.officialEmail || emp.personalEmail || '');
    setMobileNumber(emp.phone || '+91 98765 43210');
    setDepartment(emp.department || 'Human Resources');
    setReportingTo(emp.reportingManager || 'Ms. Sheetal Bedi / CEO');
    setBankAccountHolder(emp.fullName);
    if (emp.joiningDate) {
      setStartDate(formatDateString(new Date(emp.joiningDate)));
    }
    const fullAddr = [emp.addressLine, emp.city, emp.state, emp.pinCode].filter(Boolean).join(', ') || 'D-57, Dilshad Colony, Delhi – 110095';
    setCurrentAddress(fullAddr);
    setPermanentAddress(fullAddr);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(employeeSearchTerm.toLowerCase()))
  );

  const handleDownloadPdf = () => {
    const prevTitle = document.title;
    document.title = `TaskNera_Internship_Onboarding_Form_${fullName.replace(/\s+/g, '_')}`;
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
          templateCode: 'INTERNSHIP_ONBOARDING_FORM',
          customTemplateMarkup: '<div>Internship Onboarding Form Record</div>',
          title: `Internship Onboarding Form - ${fullName}`,
          customParameters: {
            fullName,
            formRefNo,
            department,
            reportingTo,
            positionType,
            startDate,
            endDate,
            personalEmail,
            mobileNumber,
          },
          targetStatus: 'APPROVED',
        });
        success(`Internship Onboarding Form saved to system records!`);
        if (onSuccess) onSuccess(generated);
      } else {
        success('Internship Onboarding Form recorded successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      error(err.message || 'Failed to save form record.');
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
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Internship Onboarding Form
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
                  TASK/HR-FORM/ONBOARD/2026/v1.0
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official 3-Page Dossier for Interns &amp; Recruitment Interns (Position, Education, DPDP Consent &amp; HR Verification)
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
                  color: step === 1 ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: step === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                1. Edit Form Data
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
                  color: step === 2 ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: step === 2 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                2. Preview 3-Page Official Form
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
            /* STEP 1: FORM DATA EDITING */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900, margin: '0 auto' }}>
              {/* Employee Selection Quick Banner */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                  Pre-fill from Employee Directory:
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <select
                    value={selectedEmployeeId || ''}
                    onChange={(e) => {
                      const emp = employees.find((x) => x.id === e.target.value);
                      if (emp) populateFromEmployee(emp);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 260,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="">-- Choose Candidate / Intern --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.employeeId}) — {emp.designation || 'Intern'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. Position Details */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0072bc', marginBottom: 14 }}>
                  1. POSITION DETAILS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Position *
                    </label>
                    <select
                      value={positionType}
                      onChange={(e) => setPositionType(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Intern">Intern</option>
                      <option value="Recruitment Intern">Recruitment Intern</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Department / Team
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Reporting To
                    </label>
                    <input
                      type="text"
                      value={reportingTo}
                      onChange={(e) => setReportingTo(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Start Date *
                    </label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      End Date *
                    </label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Work Arrangement *
                    </label>
                    <select
                      value={workArrangement}
                      onChange={(e) => setWorkArrangement(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Internship Type *
                    </label>
                    <select
                      value={internshipType}
                      onChange={(e) => setInternshipType(e.target.value as any)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Stipend-based">Stipend-based</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Daily Availability Hours
                    </label>
                    <input
                      type="text"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Personal Details */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0072bc', marginBottom: 14 }}>
                  2. PERSONAL DETAILS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Full Name * (as per ID)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Preferred Name
                    </label>
                    <input
                      type="text"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Date of Birth *
                    </label>
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Alternate Number
                    </label>
                    <input
                      type="text"
                      value={alternateNumber}
                      onChange={(e) => setAlternateNumber(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Personal Email *
                    </label>
                    <input
                      type="text"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Current Address *
                    </label>
                    <input
                      type="text"
                      value={currentAddress}
                      onChange={(e) => {
                        setCurrentAddress(e.target.value);
                        if (sameAddress) setPermanentAddress(e.target.value);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                        Permanent Address *
                      </label>
                      <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={sameAddress}
                          onChange={(e) => {
                            setSameAddress(e.target.checked);
                            if (e.target.checked) setPermanentAddress(currentAddress);
                          }}
                        />
                        Same as current address
                      </label>
                    </div>
                    <input
                      type="text"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      disabled={sameAddress}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', backgroundColor: sameAddress ? '#f8fafc' : '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Languages Known
                    </label>
                    <input
                      type="text"
                      value={languagesKnown}
                      onChange={(e) => setLanguagesKnown(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Education & Emergency Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 18 }}>
                {/* Education */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0072bc', marginBottom: 14 }}>
                    3. EDUCATION DETAILS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Highest Qualification *
                      </label>
                      <input
                        type="text"
                        value={highestQualification}
                        onChange={(e) => setHighestQualification(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Course / Stream *
                      </label>
                      <input
                        type="text"
                        value={courseStream}
                        onChange={(e) => setCourseStream(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        College / University *
                      </label>
                      <input
                        type="text"
                        value={collegeUniversity}
                        onChange={(e) => setCollegeUniversity(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                          Year / Semester
                        </label>
                        <input
                          type="text"
                          value={yearSemester}
                          onChange={(e) => setYearSemester(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                          Year of Completion
                        </label>
                        <input
                          type="text"
                          value={yearOfCompletion}
                          onChange={(e) => setYearOfCompletion(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 18 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0072bc', marginBottom: 14 }}>
                    4. EMERGENCY CONTACT
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Relationship *
                      </label>
                      <input
                        type="text"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Mobile Number *
                      </label>
                      <input
                        type="text"
                        value={emergencyMobile}
                        onChange={(e) => setEmergencyMobile(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 3 }}>
                        Alternate Number
                      </label>
                      <input
                        type="text"
                        value={emergencyAlternate}
                        onChange={(e) => setEmergencyAlternate(e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setStep(2)}>
                  Proceed to Official Form Preview <ArrowRight size={16} style={{ marginLeft: 6 }} />
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: EXACT 3-PAGE PRINTABLE FORM */
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
                    Document: {formRefNo}
                  </span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={highlightVariables}
                      onChange={(e) => setHighlightVariables(e.target.checked)}
                    />
                    <Highlighter size={13} /> Highlight Form Fields
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Button variant="secondary" onClick={() => setStep(1)} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <Edit3 size={13} style={{ marginRight: 5 }} /> Edit Fields
                  </Button>
                  <Button variant="secondary" onClick={handleDownloadPdf} style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <Download size={13} style={{ marginRight: 5 }} /> Print / Save PDF
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    style={{ padding: '6px 14px', fontSize: '0.78rem', backgroundColor: '#0284c7' }}
                  >
                    <Save size={13} style={{ marginRight: 5 }} /> {isSaving ? 'Saving...' : 'Save to System Records'}
                  </Button>
                </div>
              </div>

              {/* Printable 3-Page Sheets Container */}
              <div
                id="printable-internship-onboarding-form"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 32,
                  maxWidth: 820,
                  margin: '0 auto',
                  width: '100%',
                }}
              >
                {/* ----------------- PAGE 1 OF 3 ----------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '36px 44px',
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
                    {/* Header: Logo, Tagline, Form Ref */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.18em', color: '#1e293b' }}>
                        T A S K N E R A
                      </div>
                      <div
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 700,
                          color: '#64748b',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          marginTop: 3,
                        }}
                      >
                        G L O B A L &nbsp; H R &nbsp; S O L U T I O N S &nbsp; | &nbsp; R E C R U I T M E N T &nbsp; | &nbsp; W O R K F O R C E &nbsp; S U P P O R T
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#334155', marginTop: 10 }}>
                        <strong>Form Ref. No.:</strong> {formRefNo}
                      </div>
                    </div>

                    {/* Form Title & Instructions Banner */}
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                      <h1
                        style={{
                          margin: 0,
                          fontSize: '17px',
                          fontWeight: 900,
                          color: '#0f172a',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        INTERNSHIP ONBOARDING FORM
                      </h1>
                      <div style={{ fontSize: '11px', color: '#475569', fontStyle: 'italic', marginTop: 2 }}>
                        For Interns and Recruitment Interns
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        lineHeight: 1.45,
                        color: '#475569',
                        marginBottom: 16,
                        textAlign: 'justify',
                        borderBottom: '1px solid #e2e8f0',
                        paddingBottom: 8,
                      }}
                    >
                      Please complete every section in full and return this form to <strong>careers@tasknera.com</strong> within 5 working days of your joining date, together with the document copies listed in Section 6. Do not send original documents. Fields marked * are mandatory.
                    </div>

                    {/* SECTION 1: POSITION DETAILS */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        1. POSITION DETAILS
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Position *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 18 }}>{positionType === 'Intern' ? '☑' : '☐'} Intern</span>
                              <span style={{ marginRight: 18 }}>{positionType === 'Recruitment Intern' ? '☑' : '☐'} Recruitment Intern</span>
                              <span>{positionType === 'Other' ? '☑' : '☐'} Other: {otherPositionText || '______________________'}</span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Department / Team
                            </td>
                            <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {department}
                            </td>
                            <td style={{ width: '18%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Reporting To
                            </td>
                            <td style={{ width: '22%', padding: '6px 8px' }}>
                              {reportingTo}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Start Date *
                            </td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {startDate}
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              End Date *
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              {endDate}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Work Arrangement *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 20 }}>{workArrangement === 'Remote' ? '☑' : '☐'} Remote</span>
                              <span style={{ marginRight: 20 }}>{workArrangement === 'On-site' ? '☑' : '☐'} On-site</span>
                              <span>{workArrangement === 'Hybrid' ? '☑' : '☐'} Hybrid</span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Internship Type *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 24 }}>{internshipType === 'Unpaid' ? '☑' : '☐'} Unpaid</span>
                              <span>{internshipType === 'Stipend-based' ? '☑' : '☐'} Stipend-based</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Daily Availability
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              Hours: <strong>{dailyHours}</strong> &nbsp;&nbsp;&nbsp;&nbsp; Days: <strong>{dailyDays}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SECTION 2: PERSONAL DETAILS */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        2. PERSONAL DETAILS
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Full Name * (as per ID)
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px', fontWeight: 700, color: '#0f172a' }}>
                              {fullName}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Preferred Name
                            </td>
                            <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {preferredName}
                            </td>
                            <td style={{ width: '18%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Date of Birth *
                            </td>
                            <td style={{ width: '22%', padding: '6px 8px' }}>
                              {dob}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Mobile Number *
                            </td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {mobileNumber}
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Alternate Number
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              {alternateNumber || '—'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Personal Email *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {personalEmail}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Current Address *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {currentAddress}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Permanent Address *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 12 }}>{sameAddress ? '☑' : '☐'} Same as current address</span>
                              {!sameAddress && <span>{permanentAddress}</span>}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Languages Known
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {languagesKnown}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SECTION 3: EDUCATION DETAILS (PART 1) */}
                    <div>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        3. EDUCATION DETAILS
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Highest Qualification * (or pursuing)
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {highestQualification}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Course / Stream *
                            </td>
                            <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {courseStream}
                            </td>
                            <td style={{ width: '18%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Year / Semester
                            </td>
                            <td style={{ width: '22%', padding: '6px 8px' }}>
                              {yearSemester}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              College / University *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {collegeUniversity}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '9.5px',
                      color: '#64748b',
                    }}
                  >
                    <span>TASKNERA | D-57, Dilshad Colony, Delhi-110095, India | careers@tasknera.com</span>
                    <span>Confidential — Page 1 of 3</span>
                  </div>
                </div>

                {/* ----------------- PAGE 2 OF 3 ----------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '36px 44px',
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
                    {/* Header: Logo, Tagline, Form Ref */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.18em', color: '#1e293b' }}>
                        T A S K N E R A
                      </div>
                      <div
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 700,
                          color: '#64748b',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          marginTop: 3,
                        }}
                      >
                        G L O B A L &nbsp; H R &nbsp; S O L U T I O N S &nbsp; | &nbsp; R E C R U I T M E N T &nbsp; | &nbsp; W O R K F O R C E &nbsp; S U P P O R T
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#334155', marginTop: 10 }}>
                        <strong>Form Ref. No.:</strong> {formRefNo}
                      </div>
                    </div>

                    {/* Section 3 (Continued) */}
                    <div style={{ marginBottom: 16 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Year of Completion
                            </td>
                            <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {yearOfCompletion}
                            </td>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Internship Letter from College Required?
                            </td>
                            <td style={{ width: '18%', padding: '6px 8px' }}>
                              <span style={{ marginRight: 14 }}>{collegeLetterRequired ? '☑' : '☐'} Yes</span>
                              <span>{!collegeLetterRequired ? '☑' : '☐'} No</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SECTION 4: EMERGENCY CONTACT */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        4. EMERGENCY CONTACT
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Contact Name *
                            </td>
                            <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {emergencyContactName}
                            </td>
                            <td style={{ width: '18%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Relationship *
                            </td>
                            <td style={{ width: '22%', padding: '6px 8px' }}>
                              {emergencyRelationship}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Mobile Number *
                            </td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {emergencyMobile}
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Alternate Number
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              {emergencyAlternate || '—'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SECTION 5: WORK SETUP AND ROLE-SPECIFIC INFORMATION */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        5. WORK SETUP AND ROLE-SPECIFIC INFORMATION
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic', padding: '3px 8px', backgroundColor: '#f8fafc', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                        Part A applies to all interns. Part B applies to Recruitment Interns only.
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '24%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              A. Own Laptop / Computer *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 24 }}>{ownLaptop ? '☑' : '☐'} Yes</span>
                              <span>{!ownLaptop ? '☑' : '☐'} No</span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              A. Stable Internet *
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 24 }}>{stableInternet ? '☑' : '☐'} Yes</span>
                              <span style={{ marginRight: 24 }}>{!stableInternet ? '☑' : '☐'} No</span>
                              <span>Provider: {internetProvider || '________________'}</span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              A. Preferred Communication
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 16 }}>{preferredComm === 'Email' ? '☑' : '☐'} Email</span>
                              <span style={{ marginRight: 16 }}>{preferredComm === 'WhatsApp' ? '☑' : '☐'} WhatsApp</span>
                              <span style={{ marginRight: 16 }}>{preferredComm === 'Phone' ? '☑' : '☐'} Phone</span>
                              <span>{preferredComm !== 'Email' && preferredComm !== 'WhatsApp' && preferredComm !== 'Phone' ? '☑' : '☐'} Other: ________________</span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              B. Prior Recruitment Experience
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 18 }}>{priorExperience ? '☑' : '☐'} Yes</span>
                              <span style={{ marginRight: 18 }}>{!priorExperience ? '☑' : '☐'} No</span>
                              <span>If yes, details: <strong>{experienceDetails || '____________________________________'}</strong></span>
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              B. Tools Familiar With
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              <span style={{ marginRight: 14 }}>{toolsFamiliar.LinkedIn ? '☑' : '☐'} LinkedIn</span>
                              <span style={{ marginRight: 14 }}>{toolsFamiliar.Naukri ? '☑' : '☐'} Naukri</span>
                              <span style={{ marginRight: 14 }}>{toolsFamiliar.Indeed ? '☑' : '☐'} Indeed</span>
                              <span style={{ marginRight: 14 }}>{toolsFamiliar.ATS ? '☑' : '☐'} Any ATS</span>
                              <span style={{ marginRight: 14 }}>{toolsFamiliar.ExcelSheets ? '☑' : '☐'} MS Excel / Google Sheets</span>
                              <span>☐ Other: ______________</span>
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              B. Skills / Domains of Interest
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {skillsInterest}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SECTION 6: DOCUMENTS SUBMITTED (COPIES ONLY) */}
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        6. DOCUMENTS SUBMITTED (COPIES ONLY)
                      </div>
                      <div style={{ fontSize: '9.5px', color: '#475569', fontStyle: 'italic', padding: '3px 8px', backgroundColor: '#f8fafc', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1' }}>
                        HR collects copies only. Original documents, if shown for verification, are returned immediately. TaskNera does not retain originals or charge any fee.
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                            <th style={{ width: '50%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>Document</th>
                            <th style={{ width: '25%', padding: '5px 8px', textAlign: 'left', fontWeight: 700, borderRight: '1px solid #cbd5e1' }}>Submitted</th>
                            <th style={{ width: '25%', padding: '5px 8px', textAlign: 'left', fontWeight: 700 }}>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>Updated resume / CV *</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☑ Yes &nbsp;&nbsp; ☐ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>Mandatory</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>Government photo ID *</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☑ Yes &nbsp;&nbsp; ☐ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>Copy</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>Address proof *</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☑ Yes &nbsp;&nbsp; ☐ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>Copy</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>PAN card</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☑ Yes &nbsp;&nbsp; ☐ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>If applicable</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>Latest education proof / college ID *</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☑ Yes &nbsp;&nbsp; ☐ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>Copy</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>College internship letter / NOC</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☐ Yes &nbsp;&nbsp; ☑ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>If required</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>Passport-size photograph (digital)</td>
                            <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>☑ Yes &nbsp;&nbsp; ☐ No</td>
                            <td style={{ padding: '5px 8px', color: '#475569' }}>Mandatory</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* SECTION 7: BANK DETAILS */}
                    <div>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        7. BANK DETAILS (ONLY IF A STIPEND OR REIMBURSEMENT APPLIES)
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '22%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Account Holder Name
                            </td>
                            <td style={{ width: '38%', padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {bankAccountHolder}
                            </td>
                            <td style={{ width: '18%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Bank Name
                            </td>
                            <td style={{ width: '22%', padding: '6px 8px' }}>
                              {bankName}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Account Number
                            </td>
                            <td style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>
                              {bankAccountNumber}
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              IFSC Code
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              {bankIfsc}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Branch
                            </td>
                            <td colSpan={3} style={{ padding: '6px 8px' }}>
                              {bankBranch}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '9.5px',
                      color: '#64748b',
                    }}
                  >
                    <span>TASKNERA | D-57, Dilshad Colony, Delhi-110095, India | careers@tasknera.com</span>
                    <span>Confidential — Page 2 of 3</span>
                  </div>
                </div>

                {/* ----------------- PAGE 3 OF 3 ----------------- */}
                <div
                  className="page-sheet"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '36px 44px',
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
                    {/* Header: Logo, Tagline, Form Ref */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                      <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.18em', color: '#1e293b' }}>
                        T A S K N E R A
                      </div>
                      <div
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 700,
                          color: '#64748b',
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          marginTop: 3,
                        }}
                      >
                        G L O B A L &nbsp; H R &nbsp; S O L U T I O N S &nbsp; | &nbsp; R E C R U I T M E N T &nbsp; | &nbsp; W O R K F O R C E &nbsp; S U P P O R T
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '10.5px', color: '#334155', marginTop: 10 }}>
                        <strong>Form Ref. No.:</strong> {formRefNo}
                      </div>
                    </div>

                    {/* SECTION 8: POLICY ACKNOWLEDGEMENTS AND CONSENT */}
                    <div style={{ marginBottom: 18 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        8. POLICY ACKNOWLEDGEMENTS AND CONSENT
                      </div>
                      <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', fontSize: '10px', color: '#334155' }}>
                        <div style={{ display: 'flex', gap: 10, padding: '7px 10px', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '12px' }}>☑</span>
                          <div>I have read, understood and accepted the terms of my offer letter.</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, padding: '7px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'justify' }}>
                          <span style={{ fontSize: '12px' }}>☑</span>
                          <div>
                            <strong>Confidentiality:</strong> I will keep all candidate resumes, contact details, employee records and other non-public business information secure, use them only for authorised work, and not disclose them to unauthorised persons or platforms. This obligation continues after my internship ends.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, padding: '7px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'justify' }}>
                          <span style={{ fontSize: '12px' }}>☑</span>
                          <div>
                            <strong>Data protection:</strong> I consent to TaskNera collecting and processing my personal data for onboarding and internship administration under the Digital Personal Data Protection (DPDP) Act, 2023. I understand I may withdraw my consent and request erasure of my data, subject to statutory recordkeeping requirements.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, padding: '7px 10px', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '12px' }}>☑</span>
                          <div>I have read and understood the POSH (Prevention of Sexual Harassment) policy.</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, padding: '7px 10px', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '12px' }}>☑</span>
                          <div>I have read and understood the Remote Work and Information Security policy.</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, padding: '7px 10px' }}>
                          <span style={{ fontSize: '12px' }}>☑</span>
                          <div>
                            <strong>Company property:</strong> I will handle company documents, records and credentials responsibly and return or securely delete them when my internship ends.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 9: DECLARATION AND SIGNATURE */}
                    <div style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        9. DECLARATION AND SIGNATURE
                      </div>
                      <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', padding: '10px 12px', fontSize: '10px', color: '#334155' }}>
                        <div style={{ marginBottom: 12, textAlign: 'justify', lineHeight: 1.45 }}>
                          I declare that the information given in this form is true and complete to the best of my knowledge. I understand that any false or misleading statement may result in withdrawal of my offer or termination of my internship.
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, paddingTop: 6 }}>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>Signature *</div>
                            <div style={{ borderBottom: '1px solid #94a3b8', height: 26, display: 'flex', alignItems: 'flex-end', paddingBottom: 2, fontWeight: 700, color: '#0f172a' }}>
                              {fullName}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>Date *</div>
                            <div style={{ borderBottom: '1px solid #94a3b8', height: 26, display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                              {issueDate}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a' }}>Place *</div>
                            <div style={{ borderBottom: '1px solid #94a3b8', height: 26, display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                              {declarationPlace}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FOR HR USE ONLY */}
                    <div>
                      <div
                        style={{
                          backgroundColor: '#0c4a6e',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '11px',
                          padding: '4px 8px',
                          letterSpacing: '0.04em',
                        }}
                      >
                        FOR HR USE ONLY
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #cbd5e1' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ width: '38%', padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Form received on / by
                            </td>
                            <td style={{ width: '62%', padding: '6px 8px' }}>
                              {hrReceivedDate} &nbsp; / &nbsp; {hrReceivedBy}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Documents verified by / on
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              {hrVerifiedBy}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Intern ID assigned
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: 700, color: '#0284c7' }}>
                              {internIdAssigned}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              TaskNera email and system access issued
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              ☑ Yes &nbsp;&nbsp;&nbsp;&nbsp; Date: {emailAccessDate}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Orientation and reporting manager briefing
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              ☑ Done &nbsp;&nbsp;&nbsp;&nbsp; Date: {orientationDate}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              Policy acknowledgements completed (within 5 working days)
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              ☑ Yes &nbsp;&nbsp;&nbsp;&nbsp; Date: {issueDate}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 700, backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' }}>
                              HR signature and date
                            </td>
                            <td style={{ padding: '6px 8px', fontWeight: 700 }}>
                              {hrSignature} &nbsp;&nbsp;—&nbsp;&nbsp; {issueDate}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Page 3 Footer */}
                  <div
                    style={{
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '9.5px',
                      color: '#64748b',
                    }}
                  >
                    <span>TASKNERA | D-57, Dilshad Colony, Delhi-110095, India | careers@tasknera.com</span>
                    <span>Confidential — Page 3 of 3</span>
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
