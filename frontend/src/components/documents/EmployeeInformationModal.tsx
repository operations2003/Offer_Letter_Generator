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
  UserPlus,
  GraduationCap,
  Briefcase,
  Building,
  User,
  Edit3,
  CheckCircle2,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

interface EmployeeInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc?: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const EmployeeInformationModal: React.FC<EmployeeInformationModalProps> = ({
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
  const [refNumber, setRefNumber] = useState<string>(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/HR/EIF/${year}/${rand}`;
  });
  const [letterDate, setLetterDate] = useState<string>(() => formatDateString(new Date()));

  // A. Personal Details
  const [fullName, setFullName] = useState<string>('Aarav Sharma');
  const [dob, setDob] = useState<string>('14 August 1998');
  const [gender, setGender] = useState<string>('Male');
  const [maritalStatus, setMaritalStatus] = useState<string>('Single');
  const [bloodGroup, setBloodGroup] = useState<string>('B+');
  const [nationality, setNationality] = useState<string>('Indian');
  const [mobileNo, setMobileNo] = useState<string>('+91 98765 43210');
  const [alternateNo, setAlternateNo] = useState<string>('+91 91234 56789');
  const [personalEmail, setPersonalEmail] = useState<string>('aarav.sharma98@gmail.com');

  // B. Address Details
  const [currentAddress, setCurrentAddress] = useState<string>(
    'Flat 402, Royal Palms, Dilshad Garden, Delhi – 110095'
  );
  const [permanentAddress, setPermanentAddress] = useState<string>(
    'Flat 402, Royal Palms, Dilshad Garden, Delhi – 110095'
  );
  const [sameAddress, setSameAddress] = useState<boolean>(true);

  // C. Employment Details
  const [employeeId, setEmployeeId] = useState<string>('EMP-1088');
  const [designation, setDesignation] = useState<string>('Associate Talent Consultant');
  const [department, setDepartment] = useState<string>('Workforce & Recruitment Solutions');
  const [reportingManager, setReportingManager] = useState<string>('Rohit Verma');
  const [dateOfJoining, setDateOfJoining] = useState<string>(() => formatDateString(new Date()));
  const [employmentType, setEmploymentType] = useState<string>('Full-time');
  const [workLocation, setWorkLocation] = useState<string>('Delhi Office (Dilshad Colony)');
  const [officialEmail, setOfficialEmail] = useState<string>('aarav.sharma@tasknera.com');

  // D. Emergency Contact
  const [emergencyName, setEmergencyName] = useState<string>('Sunita Sharma');
  const [emergencyRelation, setEmergencyRelation] = useState<string>('Mother');
  const [emergencyContactNo, setEmergencyContactNo] = useState<string>('+91 98111 22334');
  const [emergencyAlternateNo, setEmergencyAlternateNo] = useState<string>('+91 98222 33445');

  // E. Bank and Statutory Details
  const [accountHolder, setAccountHolder] = useState<string>('Aarav Sharma');
  const [bankBranch, setBankBranch] = useState<string>('HDFC Bank, Dilshad Garden Branch');
  const [accountNumber, setAccountNumber] = useState<string>('50100481928371');
  const [ifscCode, setIfscCode] = useState<string>('HDFC0001284');
  const [panNumber, setPanNumber] = useState<string>('ABCPS1234E');
  const [aadhaarNumber, setAadhaarNumber] = useState<string>('XXXX-XXXX-9182');
  const [uanNumber, setUanNumber] = useState<string>('101928374652');
  const [esiNumber, setEsiNumber] = useState<string>('31009283710001');

  // F. Education
  const [edu1Qual, setEdu1Qual] = useState<string>('Master of Business Administration (MBA - HR)');
  const [edu1Inst, setEdu1Inst] = useState<string>('Faculty of Management Studies (FMS), Delhi');
  const [edu1Year, setEdu1Year] = useState<string>('2023');
  const [edu1Grade, setEdu1Grade] = useState<string>('8.4 CGPA');

  const [edu2Qual, setEdu2Qual] = useState<string>('Bachelor of Commerce (B.Com Hons)');
  const [edu2Inst, setEdu2Inst] = useState<string>('Delhi University (Hansraj College)');
  const [edu2Year, setEdu2Year] = useState<string>('2020');
  const [edu2Grade, setEdu2Grade] = useState<string>('78.5%');

  // Page 2: Certification & Previous Employer
  const [certName, setCertName] = useState<string>('SHRM Certified Professional (SHRM-CP)');
  const [certBody, setCertBody] = useState<string>('Society for Human Resource Management (USA)');
  const [certYear, setCertYear] = useState<string>('2024');
  const [certGrade, setCertGrade] = useState<string>('Distinction');

  const [prev1Emp, setPrev1Emp] = useState<string>('Apex Workforce Solutions Pvt Ltd');
  const [prev1Desig, setPrev1Desig] = useState<string>('Talent Acquisition Trainee');
  const [prev1Period, setPrev1Period] = useState<string>('Aug 2023 – May 2024');
  const [prev1Reason, setPrev1Reason] = useState<string>('Career progression & higher responsibilities');

  const [prev2Emp, setPrev2Emp] = useState<string>('Innovatech Staffing Corp');
  const [prev2Desig, setPrev2Desig] = useState<string>('Recruitment Intern');
  const [prev2Period, setPrev2Period] = useState<string>('Jan 2023 – Jul 2023');
  const [prev2Reason, setPrev2Reason] = useState<string>('Completion of internship tenure');

  // Signatures on Page 2
  const [employeeSignDate, setEmployeeSignDate] = useState<string>(() => formatDateString(new Date()));
  const [employeeSignPlace, setEmployeeSignPlace] = useState<string>('Delhi');
  const [hrVerifiedName, setHrVerifiedName] = useState<string>('Pooja Malhotra (HR Lead)');
  const [hrVerifiedDate, setHrVerifiedDate] = useState<string>(() => formatDateString(new Date()));

  // Preview & Highlighting
  const [highlightVariables, setHighlightVariables] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingEmployees(true);
    EmployeeService.listEmployees()
      .then((data) => {
        setEmployees(data);
        if (initialEmployee) {
          applyEmployee(initialEmployee);
        }
      })
      .catch((err) => console.warn('Failed to load employees:', err))
      .finally(() => setLoadingEmployees(false));
  }, [isOpen, initialEmployee]);

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    const name = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Aarav Sharma';
    setFullName(name);
    setAccountHolder(name);
    setEmployeeId(emp.employeeId || emp.id.slice(0, 8).toUpperCase());
    setDesignation(emp.designation || 'Staff Member');
    setDepartment(emp.department || 'Operations');
    if (emp.officialEmail) setOfficialEmail(emp.officialEmail);
    if (emp.personalEmail) setPersonalEmail(emp.personalEmail);
    if (emp.joiningDate) setDateOfJoining(formatDateString(new Date(emp.joiningDate)));
    if (emp.phone) setMobileNo(emp.phone);
  };

  const handleSelectEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) applyEmployee(emp);
    else setSelectedEmployeeId(null);
  };

  const handleSameAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setPermanentAddress(currentAddress);
    }
  };

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

  const handleDownloadPdf = () => {
    const el = document.getElementById('printable-employee-info-sheet');
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
          <title>Employee_Information_Form_${fullName.replace(/\\s+/g, '_')}</title>
          
            <style>
            [contenteditable] { outline: none !important; border: none !important; background: transparent !important; box-shadow: none !important; }
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

  const handleSaveToRecords = async () => {
    setIsSaving(true);
    try {
      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'EMPLOYEE_INFO_FORM',
          title: `Employee Information Form — ${fullName} (${employeeId})`,
          recipientName: fullName,
          recipientEmail: personalEmail || officialEmail,
          signatoryName: hrVerifiedName,
          signatoryTitle: 'HR Verification',
          effectiveDate: dateOfJoining,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            referenceNumber: refNumber,
            fullName,
            employeeId,
            designation,
            department,
            mobileNo,
            panNumber,
            bankBranch,
            accountNumber,
          });
        }
      } catch (backendErr) {
        console.warn('Backend sync not fully available; writing to local storage cache.', backendErr);
      }

      try {
        const stored = localStorage.getItem('TASKNERA_HR_DOCUMENTS');
        const docs = stored ? JSON.parse(stored) : [];
        const localDoc: any = {
          id: createdDoc?.id || `doc-eif-${Date.now()}`,
          documentTypeCode: 'EMPLOYEE_INFO_FORM',
          title: `Employee Information Form — ${fullName} (${employeeId})`,
          referenceNumber: refNumber,
          recipientName: fullName,
          recipientEmail: personalEmail || officialEmail,
          status: 'ISSUED',
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          effectiveDate: dateOfJoining,
          signatoryName: hrVerifiedName,
          signatoryTitle: 'HR Verification',
        };
        docs.unshift(localDoc);
        localStorage.setItem('TASKNERA_HR_DOCUMENTS', JSON.stringify(docs));
      } catch (storageErr) {
        console.error('LocalStorage write failed:', storageErr);
      }

      success(`Employee Information Form saved successfully for ${fullName}!`);
      if (onSuccess) onSuccess(createdDoc || undefined);
      onClose();
    } catch (err: any) {
      error(err.message || 'Failed to save Employee Information Form.');
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
          maxWidth: step === 1 ? 950 : 1100,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Header */}
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
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4338ca',
                border: '1px solid #c7d2fe',
              }}
            >
              <UserPlus size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Employee Information Form (Intake Dossier)
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#e0e7ff',
                    color: '#3730a3',
                    border: '1px solid #c7d2fe',
                  }}
                >
                  TN/HR/EIF &bull; 2-Page Official Intake
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                {step === 1
                  ? 'Complete personal, contact, address, banking, statutory, education and employment history'
                  : 'High-fidelity A4 printable preview matching official Tasknera Employee Information standard'}
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
                    backgroundColor: '#4338ca',
                    borderColor: '#4338ca',
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

        {/* Body */}
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
            /* STEP 1: FORM CONTROLS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Employee Selection */}
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
                    <Users size={16} style={{ color: '#4338ca' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Auto-fill from Employee Directory
                    </span>
                  </div>
                  {loadingEmployees && (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Loading employees...</span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Select Employee
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
                      <option value="">-- Choose employee --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} ({emp.employeeId || emp.id.slice(0, 4)}) - {emp.designation || 'Staff'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Search Directory
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={15}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                      />
                      <input
                        type="text"
                        placeholder="Search employee..."
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

              {/* A. Personal Details */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 18,
                  backgroundColor: '#ffffff',
                }}
              >
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 14px 0' }}>
                  A. Personal Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Date of Birth
                    </label>
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      placeholder="e.g. 14 August 1998"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: '#ffffff' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Marital Status
                    </label>
                    <input
                      type="text"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Blood Group
                    </label>
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Alternate Number
                    </label>
                    <input
                      type="text"
                      value={alternateNo}
                      onChange={(e) => setAlternateNo(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                      Personal Email
                    </label>
                    <input
                      type="email"
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* B. Address & C. Employment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* B. Address */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      B. Address Details
                    </h4>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={sameAddress}
                        onChange={(e) => handleSameAddressToggle(e.target.checked)}
                        style={{ accentColor: '#4338ca' }}
                      />
                      <span>Same as current</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Current Residential Address
                      </label>
                      <textarea
                        rows={2}
                        value={currentAddress}
                        onChange={(e) => {
                          setCurrentAddress(e.target.value);
                          if (sameAddress) setPermanentAddress(e.target.value);
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
                        Permanent Address
                      </label>
                      <textarea
                        rows={2}
                        value={permanentAddress}
                        disabled={sameAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* C. Employment */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                    C. Employment Particulars
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Designation
                      </label>
                      <input
                        type="text"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Reporting Manager
                      </label>
                      <input
                        type="text"
                        value={reportingManager}
                        onChange={(e) => setReportingManager(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Employment Type
                      </label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem', backgroundColor: '#ffffff' }}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Work Location
                      </label>
                      <input
                        type="text"
                        value={workLocation}
                        onChange={(e) => setWorkLocation(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* D. Emergency & E. Banking */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* D. Emergency */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                    D. Emergency Contact
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={emergencyRelation}
                        onChange={(e) => setEmergencyRelation(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Primary Contact No.
                      </label>
                      <input
                        type="text"
                        value={emergencyContactNo}
                        onChange={(e) => setEmergencyContactNo(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Alternate Contact No.
                      </label>
                      <input
                        type="text"
                        value={emergencyAlternateNo}
                        onChange={(e) => setEmergencyAlternateNo(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* E. Bank and Statutory Details */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 18,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                    E. Bank &amp; Statutory Identifiers
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Bank &amp; Branch
                      </label>
                      <input
                        type="text"
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        PAN
                      </label>
                      <input
                        type="text"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        Aadhaar No. (Masked)
                      </label>
                      <input
                        type="text"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 2 }}>
                        UAN (PF)
                      </label>
                      <input
                        type="text"
                        value={uanNumber}
                        onChange={(e) => setUanNumber(e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={15} />}
                  onClick={() => setStep(2)}
                  style={{
                    backgroundColor: '#4338ca',
                    borderColor: '#4338ca',
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  Generate 2-Page Intake Form Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: HIGH-FIDELITY PRINT PREVIEW */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              <div id="printable-employee-info-sheet"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  width: '100%',
                  maxWidth: '794px',
                }}
               contentEditable={true} suppressContentEditableWarning={true}>
                {/* PAGE 1: HEADER, SECTIONS A - F */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px',
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                    fontSize: '8.5pt',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 10 }}>
                      <img
                        src="/logo.png"
                        alt="Tasknera Logo"
                        style={{ height: 40, objectFit: 'contain', marginBottom: 3 }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <h1
                        style={{
                          fontSize: '18pt',
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
                          fontSize: '7pt',
                          letterSpacing: '0.12em',
                          color: '#64748b',
                          margin: '2px 0 0 0',
                          textTransform: 'uppercase',
                        }}
                      >
                        GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                      </p>
                    </div>

                    {/* Ref & Date */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 600,
                        margin: '6px 0',
                        fontSize: '9pt',
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

                    <div style={{ margin: '6px 0 2px 0' }}>
                      <h2 style={{ fontSize: '12pt', fontWeight: 700, margin: 0 }}>
                        Employee Information Form
                      </h2>
                      <p style={{ fontSize: '7.5pt', color: '#475569', margin: '2px 0 8px 0', fontStyle: 'italic' }}>
                        To be completed in BLOCK LETTERS by the employee on or before the date of joining and returned to the HR team along with supporting documents.
                      </p>
                    </div>

                    {/* Table A: Personal Details */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: 8, border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={4} style={{ padding: '3px 8px', textAlign: 'left', fontWeight: 700 }}>
                            A. Personal Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Full name</td>
                          <td colSpan={3} style={{ padding: '4px 6px', fontWeight: 600 }}>{renderHighlighted(fullName)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Date of birth</td>
                          <td style={{ width: '28%', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(dob)}</td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Gender</td>
                          <td style={{ width: '28%', padding: '4px 6px' }}>{renderHighlighted(gender)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Marital status</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(maritalStatus)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Blood group</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(bloodGroup)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Nationality</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(nationality)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Mobile no.</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(mobileNo)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Personal email</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(personalEmail)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Alternate no.</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(alternateNo)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table B: Address Details */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: 8, border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={2} style={{ padding: '3px 8px', textAlign: 'left', fontWeight: 700 }}>
                            B. Address Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Current address</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(currentAddress)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Permanent address</td>
                          <td style={{ padding: '4px 6px' }}>
                            {renderHighlighted(permanentAddress)} {sameAddress && <span style={{ color: '#64748b', fontSize: '7.5pt' }}>(Same as current address)</span>}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table C: Employment Details */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: 8, border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={4} style={{ padding: '3px 8px', textAlign: 'left', fontWeight: 700 }}>
                            C. Employment Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Employee ID</td>
                          <td style={{ width: '28%', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(employeeId)}</td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Designation</td>
                          <td style={{ width: '28%', padding: '4px 6px' }}>{renderHighlighted(designation)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Department</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(department)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Reporting manager</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(reportingManager)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Date of joining</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(dateOfJoining)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Employment type</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(employmentType)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Work location</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(workLocation)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Official email</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(officialEmail)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table D: Emergency Contact */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: 8, border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={4} style={{ padding: '3px 8px', textAlign: 'left', fontWeight: 700 }}>
                            D. Emergency Contact
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Contact name</td>
                          <td style={{ width: '28%', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(emergencyName)}</td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Relationship</td>
                          <td style={{ width: '28%', padding: '4px 6px' }}>{renderHighlighted(emergencyRelation)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Contact no.</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(emergencyContactNo)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Alternate no.</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(emergencyAlternateNo)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table E: Bank and Statutory Details */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', marginBottom: 8, border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #94a3b8' }}>
                          <th colSpan={4} style={{ padding: '3px 8px', textAlign: 'left', fontWeight: 700 }}>
                            E. Bank and Statutory Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Account holder</td>
                          <td style={{ width: '28%', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(accountHolder)}</td>
                          <td style={{ width: '22%', fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Bank and branch</td>
                          <td style={{ width: '28%', padding: '4px 6px' }}>{renderHighlighted(bankBranch)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Account no.</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{renderHighlighted(accountNumber)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>IFSC code</td>
                          <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{renderHighlighted(ifscCode)}</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>PAN</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{renderHighlighted(panNumber)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Aadhaar no.</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(aadhaarNumber)}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>UAN (PF)</td>
                          <td style={{ padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(uanNumber)}</td>
                          <td style={{ fontWeight: 700, padding: '4px 6px', backgroundColor: '#fafafa', borderRight: '1px solid #cbd5e1' }}>ESI no.</td>
                          <td style={{ padding: '4px 6px' }}>{renderHighlighted(esiNumber)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Table F: Education and Previous Employment */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8pt', border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '38%', borderRight: '1px solid #94a3b8' }}>Qualification</th>
                          <th style={{ padding: '5px 8px', textAlign: 'left', width: '36%', borderRight: '1px solid #94a3b8' }}>Institution / University</th>
                          <th style={{ padding: '5px 6px', textAlign: 'center', width: '14%', borderRight: '1px solid #94a3b8' }}>Year of passing</th>
                          <th style={{ padding: '5px 6px', textAlign: 'center' }}>% / CGPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(edu1Qual)}</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(edu1Inst)}</td>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(edu1Year)}</td>
                          <td style={{ textAlign: 'center', padding: '4px 6px' }}>{renderHighlighted(edu1Grade)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(edu2Qual)}</td>
                          <td style={{ padding: '4px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(edu2Inst)}</td>
                          <td style={{ textAlign: 'center', padding: '4px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(edu2Year)}</td>
                          <td style={{ textAlign: 'center', padding: '4px 6px' }}>{renderHighlighted(edu2Grade)}</td>
                        </tr>
                      </tbody>
                    </table>
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
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div>Confidential | Page 1 of 2</div>
                  </div>
                </div>

                {/* PAGE 2: CERTIFICATIONS, PREVIOUS EMPLOYER, DECLARATION & SIGNATURES */}
                <div
                  className="page-container"
                  style={{
                    backgroundColor: '#ffffff',
                    width: '100%',
                    minHeight: '1122px',
                    boxSizing: 'border-box',
                    padding: '36px 44px 30px 44px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontFamily: '"Times New Roman", Times, Georgia, serif',
                    position: 'relative',
                    fontSize: '9pt',
                    color: '#0f172a',
                  }}
                >
                  <div>
                    {/* Page 2 Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        fontSize: '8.5pt',
                        color: '#64748b',
                        paddingBottom: 8,
                        borderBottom: '1px solid #cbd5e1',
                        marginBottom: 20,
                      }}
                    >
                      <span>TASKNERA | Employee Information Form</span>
                    </div>

                    {/* Professional Certification Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', marginBottom: 18, border: '1px solid #94a3b8' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '38%', padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(certName)}</td>
                          <td style={{ width: '36%', padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(certBody)}</td>
                          <td style={{ textAlign: 'center', width: '14%', padding: '5px 6px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(certYear)}</td>
                          <td style={{ textAlign: 'center', padding: '5px 6px' }}>{renderHighlighted(certGrade)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Previous Employer Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', marginBottom: 24, border: '1px solid #94a3b8' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#1e3a5f', color: '#ffffff' }}>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '32%', borderRight: '1px solid #94a3b8' }}>Previous employer</th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '26%', borderRight: '1px solid #94a3b8' }}>Designation</th>
                          <th style={{ padding: '6px 8px', textAlign: 'left', width: '22%', borderRight: '1px solid #94a3b8' }}>Period (From – To)</th>
                          <th style={{ padding: '6px 8px', textAlign: 'left' }}>Reason for leaving</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(prev1Emp)}</td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(prev1Desig)}</td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(prev1Period)}</td>
                          <td style={{ padding: '5px 8px' }}>{renderHighlighted(prev1Reason)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(prev2Emp)}</td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(prev2Desig)}</td>
                          <td style={{ padding: '5px 8px', borderRight: '1px solid #cbd5e1' }}>{renderHighlighted(prev2Period)}</td>
                          <td style={{ padding: '5px 8px' }}>{renderHighlighted(prev2Reason)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Declaration */}
                    <div style={{ marginBottom: 36 }}>
                      <h4 style={{ fontSize: '10pt', fontWeight: 700, margin: '0 0 8px 0' }}>
                        Declaration
                      </h4>
                      <p style={{ margin: 0, textAlign: 'justify', lineHeight: 1.5, fontSize: '9pt' }}>
                        I hereby declare that the information furnished above is true, complete and correct to the best of my knowledge. I understand that any false or misleading information may result in disciplinary action, including termination of employment. I undertake to inform the HR team promptly of any change in the above details.
                      </p>
                    </div>

                    {/* Signatures Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, marginTop: 40 }}>
                      <div>
                        <div style={{ borderBottom: '1px solid #0f172a', height: 44, marginBottom: 6 }} />
                        <div style={{ fontWeight: 700 }}>Signature of Employee</div>
                        <div>Name: {renderHighlighted(fullName)}</div>
                        <div>Date: {renderHighlighted(employeeSignDate)}</div>
                        <div>Place: {renderHighlighted(employeeSignPlace)}</div>
                      </div>

                      <div>
                        <div style={{ borderBottom: '1px solid #0f172a', height: 44, marginBottom: 6 }} />
                        <div style={{ fontWeight: 700 }}>Verified by (HR)</div>
                        <div>Name: {renderHighlighted(hrVerifiedName)}</div>
                        <div>Date: {renderHighlighted(hrVerifiedDate)}</div>
                      </div>
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
                    <div>TASKNERA | D-57, Dilshad Colony, Delhi – 110095, India | careers@tasknera.com</div>
                    <div>Confidential | Page 2 of 2</div>
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
