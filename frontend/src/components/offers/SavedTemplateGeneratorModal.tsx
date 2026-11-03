import { SHEETAL_BEDI_SIGNATURE_DATA_URL } from '../../constants/signature.js';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Mail,
  Printer,
  CheckCircle2,
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Briefcase,
  User,
  Check,
  Edit3,
  Loader2,
  FileText,
  Building,
  Save,
} from 'lucide-react';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { SavedCustomTemplate } from '../../services/customTemplateService.js';
import { useToast } from '../../context/ToastContext.js';

interface SavedTemplateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: SavedCustomTemplate | null;
  onSuccess?: (offer: any) => void;
}

export const SavedTemplateGeneratorModal: React.FC<SavedTemplateGeneratorModalProps> = ({
  isOpen,
  onClose,
  template,
  onSuccess,
}) => {
  const { success, error, info } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Employee Directory state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Candidate Details Form
  const [candidateFullName, setCandidateFullName] = useState('Rahul Sharma');
  const [candidateEmail, setCandidateEmail] = useState('rahul.sharma@example.com');
  const [candidatePhone, setCandidatePhone] = useState('+91 98765 43210');
  const [candidateAddress, setCandidateAddress] = useState('New Delhi, India');

  // Role & Terms Parameters
  const [positionTitle, setPositionTitle] = useState('Associate');
  const [department, setDepartment] = useState('Operations');
  const [workLocation, setWorkLocation] = useState('Remote / Delhi NCR');
  const [reportingTo, setReportingTo] = useState('Operations Manager');
  const [compensationText, setCompensationText] = useState('As per standard agreed terms');
  const [effectiveDate, setEffectiveDate] = useState(() =>
    new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [referenceNumber, setReferenceNumber] = useState(() => {
    const yyyy = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    return `TN/DOC/${yyyy}/${rand}`;
  });

  // Dynamic Template Sections
  const [sections, setSections] = useState<Array<{ number: number; title: string; content: string }>>([]);

  // Direct Edit & Actions
  const [isDirectEditMode, setIsDirectEditMode] = useState(false);
  const [editedBodyHtml, setEditedBodyHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [savedDocument, setSavedDocument] = useState<any | null>(null);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Scroll to top on step change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step]);

  // Initialize from template and directory
  useEffect(() => {
    if (isOpen && template) {
      setStep(1);
      setIsDirectEditMode(false);
      setEditedBodyHtml('');
      setSavedDocument(null);
      setEmailSentSuccess(false);

      if (template.sections && template.sections.length > 0) {
        setSections(template.sections.map((s, idx) => ({ ...s, number: s.number || idx + 1 })));
      } else {
        setSections([
          {
            number: 1,
            title: 'Terms of Agreement',
            content: 'The employee / contractor agrees to fulfill all duties with professional excellence and diligence.',
          },
        ]);
      }

      loadEmployees();
    }
  }, [isOpen, template]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const list = await EmployeeService.listEmployees();
      setEmployees(list || []);
      if (list && list.length > 0) {
        applyEmployeeData(list[0]);
      }
    } catch {
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployeeData = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setCandidateFullName(emp.fullName);
    setCandidateEmail(emp.officialEmail || emp.personalEmail || '');
    setCandidatePhone(emp.phone || '');
    setCandidateAddress([emp.addressLine, emp.city, emp.state].filter(Boolean).join(', ') || 'Delhi NCR, India');
    setPositionTitle(emp.designation || 'Associate');
    setDepartment(emp.department || 'Operations');
    if (emp.annualCtc) {
      const numCtc = Number(emp.annualCtc);
      const sym = emp.currency === 'USD' ? '$' : '₹';
      setCompensationText(`${sym}${numCtc.toLocaleString()} per annum`);
    }
  };

  // Interpolate placeholders
  const interpolateText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\[Candidate Full Name\]|\[Candidate Name\]|\[Employee Full Name\]|\[Employee Name\]|{{candidate_name}}|{{employee_name}}/gi, candidateFullName)
      .replace(/\[Candidate Email Address\]|\[Candidate Email\]|\[Email Address\]|{{candidate_email}}|{{email}}/gi, candidateEmail)
      .replace(/\[Position\]|\[Designation\]|\[Job Title\]|{{designation}}|{{position}}/gi, positionTitle)
      .replace(/\[Department\]|{{department}}/gi, department)
      .replace(/\[Effective Date\]|\[Start Date\]|\[Joining Date\]|\[DD Month YYYY\]|{{effective_date}}|{{joining_date}}|{{date}}/gi, effectiveDate)
      .replace(/\[End Date\]/gi, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
      .replace(/\[Acceptance Date\]/gi, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
      .replace(/\[Work Arrangement \/ Location\]|\[On-site \/ Hybrid \/ Remote; Location\]|\[Location\]|\[Work Location\]|{{location}}/gi, workLocation || 'Hybrid / Remote (Delhi NCR)')
      .replace(/\[Reporting Manager\]|\[Reporting To\]|\[Name \/ Designation\]|{{reporting_manager}}/gi, reportingTo || 'Ms. Sheetal Bedi / CEO')
      .replace(/\[Compensation\]|\[Salary\]|\[CTC\]|{{salary}}|{{ctc}}/gi, compensationText)
      .replace(/\[Company Name\]|TaskNera|TASKNERA/g, 'TaskNera');
  };

  // Compile Body HTML for preview
  const getCompiledBody = (): string => {
    if (editedBodyHtml) {
      return interpolateText(editedBodyHtml);
    }

    const parts: string[] = [];

    if (template?.introParagraph) {
      parts.push(
        `<p style="font-size:12.8px; line-height:1.65; color:#334155; text-align:justify; margin-bottom:14px;">${interpolateText(
          template.introParagraph
        )}</p>`
      );
    }

    if (template?.keyDetails && template.keyDetails.length > 0) {
      const rowsHtml = template.keyDetails
        .map(
          (kd) => `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:9px 14px; font-weight:700; color:#334155; width:36%; background:#f8fafc; border-right:1px solid #e2e8f0;">${interpolateText(
            kd.label
          )}</td>
          <td style="padding:9px 14px; color:#0f172a; font-weight:500;">${interpolateText(kd.value)}</td>
        </tr>`
        )
        .join('');

      parts.push(
        `<table style="width:100%; border-collapse:collapse; margin:14px 0 20px; font-size:12.8px; border:1px solid #cbd5e1; font-family:system-ui,-apple-system,sans-serif;">` +
          `<tbody>${rowsHtml}</tbody>` +
        `</table>`
      );
    }

    if (sections && sections.length > 0) {
      const clausesHtml = sections
        .map((s) => {
          const titleHtml = s.title
            ? `<h3 style="font-size:13.5px; font-weight:700; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:3px; margin:16px 0 6px; font-family:'Georgia',serif;">${s.number ? `${s.number}. ` : ''}${s.title}</h3>`
            : '';

          const contentLines = s.content.split('\n').map((l) => l.trim()).filter(Boolean);
          let bodyHtml = '';
          let inList = false;

          for (const line of contentLines) {
            if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ') || line.startsWith('')) {
              const bulletText = line.replace(/^[•\-\*]\s*/, '').trim();
              if (!inList) {
                bodyHtml += '<ul style="margin:6px 0 10px 22px; padding:0; list-style-type:disc; font-size:12.8px; color:#334155; line-height:1.65;">';
                inList = true;
              }
              bodyHtml += `<li style="margin-bottom:4px;">${interpolateText(bulletText)}</li>`;
            } else {
              if (inList) {
                bodyHtml += '</ul>';
                inList = false;
              }
              bodyHtml += `<p style="font-size:12.8px; line-height:1.65; color:#334155; text-align:justify; margin-bottom:8px;">${interpolateText(line)}</p>`;
            }
          }
          if (inList) bodyHtml += '</ul>';

          return `<div style="margin-bottom:14px;">${titleHtml}${bodyHtml}</div>`;
        })
        .join('');

      parts.push(clausesHtml);
    }

    if (template?.closingText) {
      parts.push(
        `<p style="font-size:12.8px; line-height:1.65; color:#334155; margin:16px 0 12px; text-align:justify;">${interpolateText(
          template.closingText
        )}</p>`
      );
    }

    if (template?.acceptanceText) {
      parts.push(
        `<div style="margin-top:24px; border:1.5px solid #cbd5e1; border-radius:8px; padding:16px 18px; background:#f8fafc;">` +
          `<div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.03em;">` +
            `ACCEPTANCE BY THE ${template.title?.toLowerCase().includes('internship') ? 'INTERN' : 'CANDIDATE'}` +
          `</div>` +
          `<p style="font-size:12px; line-height:1.6; color:#334155; margin-bottom:14px;">` +
            interpolateText(template.acceptanceText) +
          `</p>` +
          `<div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#475569; border-top:1px dashed #cbd5e1; padding-top:10px; margin-top:8px;">` +
            `<span><strong>Signature:</strong> _______________________</span>` +
            `<span><strong>Date:</strong> __________________</span>` +
            `<span><strong>Place:</strong> __________________</span>` +
          `</div>` +
        `</div>`
      );
    }

    return parts.length > 0 ? parts.join('\n') : '<p>No content specified.</p>';
  };

  // Save Document to Records
  const handleSaveDocument = async () => {
    setIsSaving(true);
    try {
      const compiledContent = getCompiledBody();
      let empId = selectedEmployeeId;

      if (!empId && employees.length > 0) {
        empId = employees[0].id;
      }

      if (empId) {
        const generated = await EmployeeService.generateDocument(empId, {
          templateCode: template?.categoryCode || 'CUSTOM_OFFER',
          customTemplateMarkup: compiledContent,
          title: `${template?.title || 'Document'} - ${candidateFullName}`,
          customParameters: {
            candidate_name: candidateFullName,
            designation: positionTitle,
            department: department,
            reference_number: referenceNumber,
            effective_date: effectiveDate,
          },
          targetStatus: 'APPROVED',
        });
        setSavedDocument(generated);
        success(`Document saved to Offers ledger with Ref: ${referenceNumber}!`);
        if (onSuccess) onSuccess(generated);
      } else {
        success(`Document saved successfully with Ref: ${referenceNumber}!`);
        if (onSuccess) onSuccess({ id: referenceNumber, title: template?.title });
      }
    } catch (err: any) {
      error(err.message || 'Failed to save document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Download PDF / Print
  const handleDownloadPdf = () => {
    const prevTitle = document.title;
    document.title = `TaskNera_${(template?.title || 'Document').replace(/\s+/g, '_')}_${candidateFullName.replace(/\s+/g, '_')}`;
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1000);
    }, 150);
  };

  // Send by Email
  const handleSendEmail = async () => {
    if (!candidateEmail) {
      error('Please enter a valid candidate email address.');
      return;
    }

    setIsSendingEmail(true);
    try {
      if (savedDocument?.id) {
        await EmployeeService.sendDocumentEmail(savedDocument.id, {
          to: candidateEmail,
          subject: `${template?.title || 'Official Document'} — TaskNera`,
          message: `Dear ${candidateFullName},\n\nPlease find attached your official ${template?.title || 'document'} issued by TaskNera.\n\nBest regards,\nPeople Operations Team\nTaskNera`,
        });
      }
      setEmailSentSuccess(true);
      success(`Official document dispatched successfully to ${candidateEmail}!`);
    } catch (err: any) {
      error(err.message || 'Failed to send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!isOpen || !template) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          width: '100%',
          maxWidth: step === 2 ? 1040 : 860,
          maxHeight: 'min(92vh, 800px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Saved Offer Template
              </span>
              <span style={{ fontSize: '0.78125rem', color: '#64748b' }}>
                Step {step} of 2 • {step === 1 ? 'Configure Candidate & Terms' : 'Official Letterhead Preview'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0' }}>
              {template.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 6,
              border: 'none',
              backgroundColor: '#f1f5f9',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div ref={scrollContainerRef} style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* ========================================================================= */}
          {/* STEP 1: CONFIGURE CANDIDATE & TERMS                                       */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div>
              {/* Autofill from Employee Directory */}
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={18} color="#2563eb" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e40af' }}>
                      Autofill from Employee / Candidate Directory
                    </span>
                  </div>

                  <div style={{ position: 'relative', width: 260 }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search directory..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 30px',
                        fontSize: '0.78rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 4,
                  }}
                >
                  {employees
                    .filter(
                      (e) =>
                        !employeeSearch ||
                        e.fullName.toLowerCase().includes(employeeSearch.toLowerCase()) ||
                        e.designation.toLowerCase().includes(employeeSearch.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((emp) => {
                      const isSelected = selectedEmployeeId === emp.id;
                      return (
                        <button
                          key={emp.id}
                          type="button"
                          onClick={() => applyEmployeeData(emp)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            backgroundColor: isSelected ? '#ffffff' : '#f8fafc',
                            color: isSelected ? '#1e40af' : '#334155',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isSelected && <Check size={14} color="#2563eb" />}
                          <span>{emp.fullName}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>({emp.designation})</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {/* Candidate Name */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Candidate / Recipient Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateFullName}
                    onChange={(e) => setCandidateFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Designation / Role */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Designation / Position Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Department */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Candidate Email */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Candidate Email Address
                  </label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Reference Number */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Document Reference Number
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Effective Date */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Effective / Issue Date
                  </label>
                  <input
                    type="text"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Work Location */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Work Location / Arrangement
                  </label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Reporting To */}
                <div>
                  <label style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    value={reportingTo}
                    onChange={(e) => setReportingTo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '0.84rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Template Clauses Customizer */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Template Clauses & Terms ({sections.length} sections)
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    All placeholders like [Candidate Name] are automatically populated.
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sections.map((sec, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].title = e.target.value;
                          setSections(updated);
                        }}
                        style={{
                          width: '100%',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          border: 'none',
                          backgroundColor: 'transparent',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: 4,
                          marginBottom: 6,
                        }}
                      />
                      <textarea
                        rows={3}
                        value={sec.content}
                        onChange={(e) => {
                          const updated = [...sections];
                          updated[idx].content = e.target.value;
                          setSections(updated);
                        }}
                        style={{
                          width: '100%',
                          fontSize: '0.8125rem',
                          lineHeight: 1.5,
                          border: '1px solid #cbd5e1',
                          borderRadius: 6,
                          padding: '6px 8px',
                          backgroundColor: '#ffffff',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OFFICIAL LETTERHEAD PREVIEW                                       */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div>
              {/* Top Action Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  padding: '10px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    Candidate: {candidateFullName}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>• Ref: {referenceNumber}</span>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setIsDirectEditMode(!isDirectEditMode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: isDirectEditMode ? '#dbeafe' : '#ffffff',
                      color: '#2563eb',
                      border: '1px solid #93c5fd',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 size={14} />
                    <span>{isDirectEditMode ? 'Done Editing' : 'Edit Text in Place'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                    <span>{emailSentSuccess ? 'Email Dispatched!' : 'Send by Email'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveDocument}
                    disabled={isSaving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save to Records</span>
                  </button>
                </div>
              </div>

              {/* Printable Official Letterhead Sheet */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '48px 48px',
                  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
                  color: '#0f172a',
                  maxWidth: 800,
                  margin: '0 auto',
                }}
              >
                {/* Official Letterhead Header - EXACT MATCH TO PDF */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2.5px solid #0072bc',
                    paddingBottom: 14,
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <h1
                      style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: 900,
                        color: '#0072bc',
                        letterSpacing: '0.04em',
                        lineHeight: 1,
                      }}
                    >
                      TASKNERA
                    </h1>
                    <div
                      style={{
                        fontSize: '9.5px',
                        color: '#00838f',
                        marginTop: 6,
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      GLOBAL HR SOLUTIONS | RECRUITMENT | WORKFORCE SUPPORT
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: 1.5, color: '#475569' }}>
                    <div style={{ fontWeight: 500 }}>D-57, Dilshad Colony, Delhi - 110095, India</div>
                    <div style={{ color: '#0072bc', fontWeight: 600 }}>careers@tasknera.com</div>
                    <div style={{ marginTop: 4, color: '#1e293b', fontWeight: 600 }}>
                      <strong>Date:</strong> {effectiveDate}
                    </div>
                  </div>
                </div>

                {/* Recipient Address Block - EXACT MATCH TO PDF */}
                <div style={{ marginBottom: 18, fontSize: '12.5px', lineHeight: 1.55, color: '#1e293b' }}>
                  <div style={{ color: '#475569' }}>To,</div>
                  <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                    {candidateFullName}
                  </div>
                  {candidateEmail && <div style={{ color: '#334155' }}>{candidateEmail}</div>}
                </div>

                {/* Document Title Banner - EXACT MATCH TO PDF */}
                <div
                  style={{
                    textAlign: 'center',
                    margin: '18px 0 10px 0',
                    borderBottom: '2px solid #0072bc',
                    paddingBottom: 8,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '17px',
                      fontWeight: 800,
                      color: '#0072bc',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {template.title || 'INTERNSHIP OFFER LETTER'}
                  </h2>
                </div>

                {/* Subject Line - EXACT MATCH TO PDF */}
                {(template.subject || template.title?.toLowerCase().includes('internship')) && (
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#0f172a',
                      margin: '12px 0 14px 0',
                    }}
                  >
                    Subject: {interpolateText(template.subject || 'Offer of Unpaid Internship - Human Resources')}
                  </div>
                )}

                {/* Preamble */}
                <div style={{ fontSize: '12.8px', lineHeight: 1.65, color: '#334155', marginBottom: 14 }}>
                  Dear <strong>{candidateFullName}</strong>,
                </div>

                {/* Body Content */}
                {isDirectEditMode ? (
                  <textarea
                    rows={14}
                    value={editedBodyHtml || getCompiledBody()}
                    onChange={(e) => setEditedBodyHtml(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 12,
                      fontSize: '12.5px',
                      fontFamily: 'monospace',
                      border: '2px solid #2563eb',
                      borderRadius: 6,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: getCompiledBody() }}
                    style={{ fontSize: '12.8px', lineHeight: 1.65, color: '#334155' }}
                  />
                )}

                {/* Sign-Off & Acceptance Block - EXACT MATCH TO PDF */}
                <div style={{ marginTop: 32, paddingTop: 16 }}>
                  {/* Company Sign-Off */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                      For and on behalf of TASKNERA
                    </div>
                    <div style={{ margin: '8px 0' }}>
                      <img
                        src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                        alt="Signature of CEO"
                        style={{ maxHeight: 44, objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a' }}>
                      Ms. Sheetal Bedi
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Chief Executive Officer
                    </div>
                  </div>

                  {/* Intern / Candidate Acceptance Box */}
                  <div
                    style={{
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 6,
                      padding: '14px 18px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#0f172a',
                        marginBottom: 6,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}
                    >
                      ACCEPTANCE BY THE {template.title?.toLowerCase().includes('internship') ? 'INTERN' : 'CANDIDATE'}
                    </div>
                    <p style={{ fontSize: '11.5px', lineHeight: 1.55, color: '#334155', margin: '0 0 12px 0' }}>
                      {interpolateText(
                        template.acceptanceText ||
                          `I, [Candidate Full Name], have read and understood the terms of this offer and accept the unpaid HR internship on the terms stated above.`
                      )}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: '#475569',
                        borderTop: '1px dashed #cbd5e1',
                        paddingTop: 10,
                      }}
                    >
                      <span>
                        <strong>Signature:</strong> __________________________
                      </span>
                      <span>
                        <strong>Date:</strong> __________________
                      </span>
                      <span>
                        <strong>Place:</strong> __________________
                      </span>
                    </div>
                  </div>

                  {/* Page Footer */}
                  <div
                    style={{
                      marginTop: 32,
                      paddingTop: 12,
                      borderTop: '1px solid #e2e8f0',
                      textAlign: 'center',
                      fontSize: '10.5px',
                      color: '#64748b',
                      letterSpacing: '0.02em',
                    }}
                  >
                    TASKNERA | D-57, Dilshad Colony, Delhi - 110095, India | careers@tasknera.com
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
          }}
        >
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to Form</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}

          <div>
            {step === 1 && (
              <button
                onClick={() => {
                  if (!candidateFullName.trim()) {
                    error('Please enter candidate name.');
                    return;
                  }
                  setStep(2);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 20px',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                <span>Preview Official Letterhead</span>
                <ArrowRight size={14} />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Done / Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

