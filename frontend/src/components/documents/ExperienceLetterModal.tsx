import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  Save,
  Highlighter,
  User,
  Users,
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Building2,
  Calendar,
  Briefcase,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  MapPin,
  Mail,
  Globe,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Employee, EmployeeService } from '../../services/employeeService.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { HrDocument } from '../../types/document-engine.js';
import { useToast } from '../../context/ToastContext.js';

const SHEETAL_BEDI_SIGNATURE_DATA_URL = 'data:image/png;base64,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';

interface ExperienceLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: HrDocument) => void;
  initialEmployee?: Employee | null;
}

export const ExperienceLetterModal: React.FC<ExperienceLetterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const { success, error } = useToast();

  // Navigation steps: 1 = Employee & Configuration, 2 = Official Certificate Preview
  const [step, setStep] = useState<1 | 2>(1);

  // Employee Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(initialEmployee?.id || null);
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Preview options
  const [highlightPlaceholders, setHighlightPlaceholders] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields State (Auto-fetched from employee + editable)
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.' | 'Dr.'>('Ms.');
  const [fullName, setFullName] = useState<string>('Edwina Zephra Gomes');
  const [designation, setDesignation] = useState<string>('HR Intern');
  const [department, setDepartment] = useState<string>('Human Resources');
  const [associationType, setAssociationType] = useState<'employment' | 'internship'>('internship');
  const [genderPronoun, setGenderPronoun] = useState<'male' | 'female'>('female');

  // Dates & Reference
  const [startDate, setStartDate] = useState<string>('August 06, 2026');
  const [endDate, setEndDate] = useState<string>('September 14, 2026');
  const [issueDate, setIssueDate] = useState<string>('14/09/2026');
  const [referenceNumber, setReferenceNumber] = useState<string>('TKS/HR/INT/2026-27/001');
  const [place, setPlace] = useState<string>('Delhi');

  // Status of association: either ended on date or continuing
  const [statusMode, setStatusMode] = useState<'ended' | 'continuing'>('ended');

  // Specific functions & contributions matching official Tasknera Experience Letter
  const [departmentSupport, setDepartmentSupport] = useState<string>(
    'the Talent Acquisition (TA) Team and the Learning & Development (L&D) Department'
  );
  const [taDuties, setTaDuties] = useState<string>(
    'candidate sourcing and screening, recruitment coordination, maintaining candidate records, and supported other talent acquisition activities as assigned.'
  );
  const [ldDuties, setLdDuties] = useState<string>(
    'the research, preparation, structuring, and development of training modules and learning materials for internal L&D initiatives.'
  );
  const [demonstratedQualities, setDemonstratedQualities] = useState<string>(
    'professionalism, sincerity, adaptability, willingness to learn, teamwork, and responsibility'
  );

  // Signatory (Matches official template: Sheetal Bedi, Chief Executive Officer)
  const [signatoryName, setSignatoryName] = useState<string>('Sheetal Bedi');
  const [signatoryTitle, setSignatoryTitle] = useState<string>('Chief Executive Officer');

  // Load employees from database
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const data = await EmployeeService.listEmployees();
      const list = data || [];
      setEmployees(list);

      if (initialEmployee) {
        applyEmployee(initialEmployee);
      } else if (!selectedEmployeeId && list.length > 0) {
        applyEmployee(list[0]);
      }
    } catch (err) {
      console.warn('Could not load employees for experience letter:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const applyEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setFullName(emp.fullName || 'Employee');
    if (emp.designation) setDesignation(emp.designation);
    if (emp.department) setDepartment(emp.department);

    if (emp.joiningDate) {
      try {
        const d = new Date(emp.joiningDate);
        setStartDate(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      } catch {
        setStartDate(emp.joiningDate);
      }
    }

    if (emp.title === 'Ms.' || emp.title === 'Mrs.') {
      setSalutation('Ms.');
      setGenderPronoun('female');
    } else {
      setSalutation('Mr.');
      setGenderPronoun('male');
    }

    if (emp.employmentType?.toLowerCase().includes('intern')) {
      setAssociationType('internship');
    } else {
      setAssociationType('employment');
    }
  };

  // Pronoun helpers
  const pronounHeShe = genderPronoun === 'female' ? 'she' : 'he';
  const pronounHisHer = genderPronoun === 'female' ? 'her' : 'his';
  const pronounHisHerCap = genderPronoun === 'female' ? 'Her' : 'His';
  const pronounHimHer = genderPronoun === 'female' ? 'her' : 'him';

  // Indefinite article helper for designation
  const designationArticle = /^[aeiou]/i.test(designation.trim()) ? 'an' : 'a';

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = employeeSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q));
      const matchesDept = selectedDeptFilter === 'ALL' || e.department === selectedDeptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, employeeSearch, selectedDeptFilter]);

  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [employees]);

  // Highlight helper for placeholders
  const hl = (content: React.ReactNode) => {
    if (!highlightPlaceholders) return <>{content}</>;
    return (
      <mark
        style={{
          backgroundColor: '#fef08a',
          color: '#854d0e',
          padding: '1px 4px',
          borderRadius: 3,
          fontWeight: 600,
        }}
      >
        {content}
      </mark>
    );
  };

  // Download PDF / Print with isolated single-page iframe
  const handleDownloadPdf = () => {
    const certElement = document.getElementById('printable-experience-letter');
    if (!certElement) {
      window.print();
      return;
    }

    const docTitle = `TaskNera_Experience_Letter_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>
            [contenteditable] {
              outline: none !important;
              border: none !important;
              background: transparent !important;
              box-shadow: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm 15mm 10mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #1e293b;
              font-family: "Times New Roman", Times, Georgia, serif;
              font-size: 10.5pt;
              line-height: 1.5;
            }
            #printable-experience-letter {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            p {
              margin: 0;
              text-align: justify;
              line-height: 1.5;
            }
            mark {
              background-color: #fef08a !important;
              color: #854d0e !important;
              padding: 1px 3px;
              border-radius: 2px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          ${certElement.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back:', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 250);
  };

  // Save to Documents Generated
  const handleSaveToDocumentsGenerated = async () => {
    setIsSaving(true);
    try {
      const selectedEmp = employees.find((e) => e.id === selectedEmployeeId);
      const recipientEmail =
        selectedEmp?.personalEmail ||
        selectedEmp?.officialEmail ||
        `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@tasknera.com`;

      let createdDoc: HrDocument | null = null;
      try {
        createdDoc = await DocumentEngineService.createDocument({
          documentTypeCode: 'EXPERIENCE_LETTER',
          title: `Experience Letter — ${fullName}`,
          recipientName: fullName,
          recipientEmail: recipientEmail,
          signatoryName,
          signatoryTitle,
          effectiveDate: issueDate,
        });

        if (createdDoc && createdDoc.id) {
          await DocumentEngineService.confirmTerms(createdDoc.id, {
            salutation,
            fullName,
            designation,
            department,
            associationType,
            startDate,
            endDate,
            statusMode,
            departmentSupport,
            taDuties,
            ldDuties,
            demonstratedQualities,
            referenceNumber,
            issueDate,
            place,
            signatoryName,
            signatoryTitle,
          });
        }
      } catch (backendErr) {
        console.warn('Backend createDocument note:', backendErr);
      }

      // Local storage backup for immediate listing in Documents Generated
      const localDoc: HrDocument = {
        id: createdDoc?.id || `doc_exp_${Date.now()}`,
        companyId: 'company_default',
        documentTypeCode: 'EXPERIENCE_LETTER',
        referenceNumber: createdDoc?.referenceNumber || referenceNumber,
        title: `Experience Letter — ${fullName}`,
        templateId: 'tpl_experience_letter_official',
        templateVersionId: 'v1.0',
        recipientName: fullName,
        recipientEmail: recipientEmail,
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: false,
        aiConfidenceScore: 1.0,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: {
          salutation,
          fullName,
          designation,
          department,
          associationType,
          startDate,
          endDate,
          statusMode,
          departmentSupport,
          taDuties,
          ldDuties,
          demonstratedQualities,
          referenceNumber,
          issueDate,
          place,
          signatoryName,
          signatoryTitle,
        },
        humanOverrides: [],
        currentVersionNumber: 1,
        versions: [],
        generatedFiles: [],
        statusHistory: [],
        signatoryName,
        signatoryTitle,
        effectiveDate: issueDate,
        createdByUserId: 'usr_current',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingSaved: HrDocument[] = JSON.parse(
        localStorage.getItem('tasknera_saved_documents') || '[]'
      );
      const updatedList = [
        localDoc,
        ...existingSaved.filter(
          (d) => d.id !== localDoc.id && d.referenceNumber !== localDoc.referenceNumber
        ),
      ];
      localStorage.setItem('tasknera_saved_documents', JSON.stringify(updatedList));

      success(`Experience Letter saved successfully with Ref: ${localDoc.referenceNumber}!`);
      if (onSuccess) onSuccess(localDoc);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save experience letter.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="tasknera-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="tasknera-modal-container glass-panel"
        style={{
          width: '100%',
          maxWidth: 1100,
          height: '90vh',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Top Header */}
        <div
          className="no-print"
          style={{
            padding: '18px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                border: '1px solid #fed7aa',
              }}
            >
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Experience Letter
                </h3>
                <span
                  style={{
                    backgroundColor: '#fff7ed',
                    color: '#ea580c',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    border: '1px solid #fed7aa',
                  }}
                >
                  Step {step} of 2: {step === 1 ? 'Details' : 'Preview'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Create and print an official experience letter.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: '50%',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 32px', background: '#f8fafc' }}>
          {step === 1 ? (
            /* STEP 1: EMPLOYEE SELECTION & MANUAL AUTHORITY FORM */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Section 1: Select Employee */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={16} color="#ea580c" />
                      1. Choose Employee (Auto-Fetches Profile & Tenure)
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                      Select a team member to automatically populate name, designation, department, and tenure dates.
                    </p>
                  </div>
                </div>

                {/* Search & Dept Filters */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                    <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search employee by name, ID, or role..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDeptFilter('ALL')}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 8,
                        border: selectedDeptFilter === 'ALL' ? '1px solid #ea580c' : '1px solid #e2e8f0',
                        background: selectedDeptFilter === 'ALL' ? '#fff7ed' : '#ffffff',
                        color: selectedDeptFilter === 'ALL' ? '#ea580c' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      All ({employees.length})
                    </button>
                    {availableDepartments.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDeptFilter(dept)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderRadius: 8,
                          border: selectedDeptFilter === dept ? '1px solid #ea580c' : '1px solid #e2e8f0',
                          background: selectedDeptFilter === dept ? '#fff7ed' : '#ffffff',
                          color: selectedDeptFilter === dept ? '#ea580c' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employee Cards Grid */}
                {loadingEmployees ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', color: '#ea580c' }} />
                    <span style={{ fontSize: '0.8125rem' }}>Loading employees from directory...</span>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: '0.8125rem', color: '#64748b' }}>
                    No matching employees found. You can enter employee details manually below.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: 10,
                      maxHeight: '190px',
                      overflowY: 'auto',
                      paddingRight: 4,
                    }}
                  >
                    {filteredEmployees.map((emp) => {
                      const isSel = selectedEmployeeId === emp.id;
                      return (
                        <div
                          key={emp.id}
                          onClick={() => applyEmployee(emp)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: isSel ? '2px solid #ea580c' : '1px solid #e2e8f0',
                            background: isSel ? '#fff7ed' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: isSel ? '#ea580c' : '#f1f5f9',
                              color: isSel ? '#ffffff' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              flexShrink: 0,
                            }}
                          >
                            {emp.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: isSel ? '#ea580c' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {emp.fullName}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {emp.designation || 'Staff'} • {emp.department || 'General'}
                            </div>
                          </div>
                          {isSel && <CheckCircle2 size={16} color="#ea580c" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 2: Core Identification & Tenure Fields */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} color="#ea580c" />
                  2. Employee Particulars &amp; Association Period
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Salutation</label>
                    <select
                      className="form-input"
                      value={salutation}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSalutation(val);
                        setGenderPronoun(val === 'Ms.' ? 'female' : 'male');
                      }}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Employee Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{ fontSize: '0.8125rem', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Department / Team</label>
                    <input
                      type="text"
                      className="form-input"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Association Nature</label>
                    <select
                      className="form-input"
                      value={associationType}
                      onChange={(e) => setAssociationType(e.target.value as any)}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <option value="employment">Employment</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Start Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>End Date / Relieving Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Reference Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      style={{ fontSize: '0.8125rem', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Association Status Selector (ended vs continuing) */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 8 }}>
                    Association Status Statement (Paragraph 5 of Letter):
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                    <div
                      onClick={() => setStatusMode('ended')}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: statusMode === 'ended' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                        background: statusMode === 'ended' ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: statusMode === 'ended' ? '#ea580c' : '#1e293b' }}>
                        Option A: Concluded Association
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                        "{pronounHisHerCap} association with TaskNera HR Solutions ended on {endDate}."
                      </div>
                    </div>

                    <div
                      onClick={() => setStatusMode('continuing')}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: statusMode === 'continuing' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                        background: statusMode === 'continuing' ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: statusMode === 'continuing' ? '#ea580c' : '#1e293b' }}>
                        Option B: Currently Active / Continuing
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                        "{pronounHisHerCap} association with TaskNera HR Solutions is continuing as on the date of this letter."
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: User Authority over Narrative, Responsibilities & Qualities */}
              <div style={{ background: '#ffffff', padding: '20px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="#ea580c" />
                  3. Narrative Customization (Full Manual Authority)
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Departments / Teams Supported (Paragraph 2)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={departmentSupport}
                      onChange={(e) => setDepartmentSupport(e.target.value)}
                      placeholder="e.g. the Talent Acquisition (TA) Team and the Learning & Development (L&D) Department"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Primary Function Contributions (Paragraph 3 - Talent Acquisition)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={taDuties}
                      onChange={(e) => setTaDuties(e.target.value)}
                      placeholder="e.g. candidate sourcing and screening, recruitment coordination, maintaining candidate records, and supported other talent acquisition activities as assigned."
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Secondary Function Contributions (Paragraph 4 - Learning &amp; Development)
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={ldDuties}
                      onChange={(e) => setLdDuties(e.target.value)}
                      placeholder="e.g. the research, preparation, structuring, and development of training modules and learning materials for internal L&D initiatives."
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Demonstrated Qualities &amp; Attributes (Paragraph 5)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={demonstratedQualities}
                      onChange={(e) => setDemonstratedQualities(e.target.value)}
                      placeholder="e.g. professionalism, sincerity, adaptability, willingness to learn, teamwork, and responsibility"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Signatory Designation</label>
                      <input
                        type="text"
                        className="form-input"
                        value={signatoryTitle}
                        onChange={(e) => setSignatoryTitle(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Issue Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Place of Issuance</label>
                      <input
                        type="text"
                        className="form-input"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Proceed to Preview Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  icon={<ArrowRight size={16} />}
                  onClick={() => setStep(2)}
                  style={{ padding: '10px 24px', fontSize: '0.875rem', backgroundColor: '#ea580c', borderColor: '#ea580c' }}
                >
                  Proceed to Official Letterhead Preview
                </Button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL EXPERIENCE LETTER PREVIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Action Toolbar */}
              <div
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#ffffff',
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    icon={<ArrowLeft size={14} />}
                    onClick={() => setStep(1)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Edit Details
                  </Button>

                  <button
                    type="button"
                    onClick={() => setHighlightPlaceholders(!highlightPlaceholders)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 6,
                      border: highlightPlaceholders ? '1px solid #eab308' : '1px solid #cbd5e1',
                      background: highlightPlaceholders ? '#fef9c3' : '#ffffff',
                      color: highlightPlaceholders ? '#854d0e' : '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <Highlighter size={14} />
                    <span>{highlightPlaceholders ? 'Yellow Highlights: ON' : 'Yellow Highlights: OFF'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    icon={<Download size={14} />}
                    onClick={handleDownloadPdf}
                    style={{ fontSize: '0.8125rem', background: '#a35d39', borderColor: '#a35d39' }}
                  >
                    Download Official PDF
                  </Button>

                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                    onClick={handleSaveToDocumentsGenerated}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem', background: '#ea580c', borderColor: '#ea580c' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Documents Generated'}
                  </Button>
                </div>
              </div>

              {/* PRINTABLE OFFICIAL TASKNERA EXPERIENCE LETTER SHEET */}
              <div
                id="printable-experience-letter"
                className="printable-experience-sheet"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  borderRadius: 6,
                  padding: '48px 56px 40px 56px',
                  maxWidth: '816px',
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                  color: '#1e293b',
                  lineHeight: 1.65,
                  fontSize: '0.9125rem',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div>
                  {/* Official Top Header: Tasknera Logo + Brand + Tagline */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      paddingBottom: 14,
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="Tasknera"
                        style={{ width: 56, height: 56, objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1.75rem',
                          color: '#0f2238',
                          letterSpacing: '0.03em',
                          lineHeight: 1.1,
                          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                      >
                        TASKNERA
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          marginTop: 4,
                          letterSpacing: '0.01em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                        }}
                      >
                        <span style={{ color: '#0d9488' }}>Global HR</span>
                        <span style={{ color: '#0284c7', fontSize: '0.65rem' }}>•</span>
                        <span style={{ color: '#0d9488' }}>Recruitment</span>
                        <span style={{ color: '#0284c7', fontSize: '0.65rem' }}>•</span>
                        <span style={{ color: '#0d9488' }}>Workforce Solutions</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: 1, backgroundColor: '#cbd5e1', marginBottom: 18 }} />

                  {/* Reference & Date Line */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      marginBottom: 24,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 500 }}>Ref: </span>
                      <span style={{ fontWeight: 600 }}>{hl(referenceNumber)}</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 500 }}>Date: </span>
                      <span style={{ fontWeight: 600 }}>{hl(issueDate)}</span>
                    </div>
                  </div>

                  {/* Centered Document Title with Teal Accent Bar */}
                  <div style={{ textAlign: 'center', marginBottom: 22 }}>
                    <h1
                      style={{
                        margin: '0 0 10px',
                        fontSize: '1.45rem',
                        fontWeight: 800,
                        color: '#0f2238',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontFamily: 'Georgia, "Times New Roman", Times, serif',
                      }}
                    >
                      EXPERIENCE LETTER
                    </h1>
                    <div style={{ width: '100%', height: '2.5px', backgroundColor: '#0f766e', margin: '0 auto' }} />
                  </div>

                  {/* Salutation / Subheading */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '1.05rem',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: 24,
                      fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    }}
                  >
                    To Whomsoever It May Concern
                  </div>

                  {/* Body Paragraphs matching PDF template exactly */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'justify' }}>
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      This is to certify that {hl(`${salutation} ${fullName}`)} was associated with Tasknera HR Solutions as an {hl(designation)} from {hl(startDate)} to {hl(endDate)}.
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      During {hl(pronounHisHer)} tenure with the organization, {hl(pronounHeShe)} supported {hl(departmentSupport)}.
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      As part of the Talent Acquisition function, {hl(pronounHeShe)} assisted with {hl(taDuties)}
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      Within the Learning &amp; Development function, {hl(pronounHeShe)} contributed to {hl(ldDuties)}
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      Throughout {hl(pronounHisHer)} association with Tasknera HR Solutions, {hl(pronounHeShe)} demonstrated {hl(demonstratedQualities)} in carrying out {hl(pronounHisHer)} responsibilities.
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      {hl(pronounHisHerCap)} association with Tasknera HR Solutions {statusMode === 'ended' ? hl(`ended on ${endDate}.`) : hl('is continuing as on the date of this letter.')}
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '2px 4px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      We appreciate {hl(pronounHisHer)} contribution to the organization and wish {hl(pronounHimHer)} continued success and growth in all {hl(pronounHisHer)} future endeavors.
                    </p>
                  </div>

                  {/* Signatory Section with Authentic Sheetal Bedi Signature */}
                  <div style={{ marginTop: 24, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" }}>
                    <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f2a5c', marginBottom: 2 }}>
                      For Tasknera HR Solutions
                    </div>
                    <div style={{ margin: '2px 0 2px -4px', minHeight: 90, display: 'flex', alignItems: 'center' }}>
                      <img
                        src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                        alt="Sheetal Bedi Signature"
                        style={{
                          width: 110,
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#0f2a5c', lineHeight: 1.25 }}>
                      {hl(signatoryName)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 400, marginBottom: 14 }}>
                      {hl(signatoryTitle)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>Date:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(issueDate)}</span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>Place:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(place)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Contact Bar and Geometric Corner Shape */}
                <div style={{ marginTop: 44, paddingTop: 14, borderTop: '1px solid #cbd5e1', position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 14,
                      fontSize: '0.75rem',
                      color: '#334155',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={13} style={{ color: '#0284c7' }} />
                      <span>D-57 F1, Dilshad Colony Shahdara, Delhi 110095</span>
                    </div>
                    <span style={{ color: '#94a3b8' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Mail size={13} style={{ color: '#0284c7' }} />
                      <span>operations@tasknera.com</span>
                    </div>
                    <span style={{ color: '#94a3b8' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Globe size={13} style={{ color: '#0284c7' }} />
                      <span>https://tasknera.com</span>
                    </div>
                  </div>

                  {/* Corner Accent Graphic */}
                  <div style={{ position: 'absolute', right: -56, bottom: -40, width: 140, height: 36, pointerEvents: 'none', overflow: 'hidden' }}>
                    <svg width="140" height="36" viewBox="0 0 140 36" fill="none">
                      <polygon points="35,36 60,0 140,0 140,16" fill="#f97316" />
                      <polygon points="55,36 80,0 140,0 140,36" fill="#0f2a5c" />
                    </svg>
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
