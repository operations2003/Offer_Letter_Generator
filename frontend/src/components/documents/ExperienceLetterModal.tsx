import { SHEETAL_BEDI_SIGNATURE_DATA_URL } from '../../constants/signature.js';
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
  const [salutation, setSalutation] = useState<'Mr.' | 'Ms.' | 'Dr.'>('Mr.');
  const [fullName, setFullName] = useState<string>('Maurya Ajay Munnalal');
  const [designation, setDesignation] = useState<string>('Full Stack Developer');
  const [department, setDepartment] = useState<string>('Engineering');
  const [associationType, setAssociationType] = useState<'employment' | 'internship'>('employment');
  const [genderPronoun, setGenderPronoun] = useState<'male' | 'female'>('male');

  // Dates & Reference
  const [startDate, setStartDate] = useState<string>('October 25, 2025');
  const [endDate, setEndDate] = useState<string>('September 14, 2026');
  const [issueDate, setIssueDate] = useState<string>('14/09/2026');
  const [referenceNumber, setReferenceNumber] = useState<string>('TKS/HR/INT/2026-27/001');
  const [place, setPlace] = useState<string>('Delhi');

  // Status of association: either ended on date or continuing
  const [statusMode, setStatusMode] = useState<'ended' | 'continuing'>('ended');

  // Specific functions & contributions matching official Tasknera Experience Letter
  const DEFAULT_CONTRIBUTION_OVERVIEW =
    "the development and enhancement of the company's software solutions, particularly in the areas of Human Resource Management Systems (HRMS), Applicant Tracking Systems (ATS), recruitment automation, and business application development.";

  const DEFAULT_RESPONSIBILITIES_TEXT = [
    'Developing and enhancing HRMS modules and functionalities.',
    'Contributing to the development of HireIQ, an AI-powered Applicant Tracking System (ATS), including resume parsing, candidate screening, and job description matching.',
    'Developing email automation functionalities for recruitment and business communication.',
    'Building automated document generation functionalities, including offer letters, experience letters, and certificates.',
    'Developing and maintaining company website components and application interfaces.',
    'Working on frontend and backend integration, database management, API development, and application functionality.',
    'Supporting the Talent Acquisition (TA) Team with recruitment-related activities and process improvements.',
    'Contributing to research, preparation, and development of training materials for Learning & Development (L&D) initiatives.',
  ].join('\n');

  const [tenureContributionOverview, setTenureContributionOverview] = useState<string>(DEFAULT_CONTRIBUTION_OVERVIEW);
  const [responsibilitiesText, setResponsibilitiesText] = useState<string>(DEFAULT_RESPONSIBILITIES_TEXT);
  const [demonstratedQualities, setDemonstratedQualities] = useState<string>(
    'professionalism, technical aptitude, sincerity, adaptability, teamwork, willingness to learn, and responsibility'
  );

  const responsibilitiesList = useMemo(() => {
    return responsibilitiesText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [responsibilitiesText]);

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
    if (emp.department) {
      setDepartment(emp.department);
    }

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
              font-family: Georgia, "Times New Roman", Times, serif;
              font-size: 9pt;
              line-height: 1.38;
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
              line-height: 1.38;
            }
            ul {
              margin: 2px 0 3px 0;
              padding-left: 18px;
            }
            li {
              margin-bottom: 2px;
              line-height: 1.35;
              text-align: justify;
            }
            mark {
              background-color: transparent !important;
              color: inherit !important;
              padding: 0 !important;
              font-weight: inherit !important;
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
            tenureContributionOverview,
            responsibilities: responsibilitiesList,
            responsibilitiesText,
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
          tenureContributionOverview,
          responsibilities: responsibilitiesList,
          responsibilitiesText,
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
                        "{pronounHisHerCap} association with Tasknera HR Solutions concluded on {endDate}."
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
                      Tenure Contribution Overview (Paragraph 2)
                    </label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={tenureContributionOverview}
                      onChange={(e) => setTenureContributionOverview(e.target.value)}
                      placeholder="e.g. the development and enhancement of the company's software solutions..."
                      style={{ fontSize: '0.8125rem', backgroundColor: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>
                        Key Responsibilities and Contributions (Paragraph 3 - One Bullet per Line)
                      </label>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {responsibilitiesList.length} items
                      </span>
                    </div>
                    <textarea
                      rows={8}
                      className="form-input"
                      value={responsibilitiesText}
                      onChange={(e) => setResponsibilitiesText(e.target.value)}
                      placeholder="Developing and enhancing HRMS modules and functionalities.&#10;Contributing to the development of HireIQ..."
                      style={{ fontSize: '0.8125rem', backgroundColor: '#ffffff', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Demonstrated Qualities &amp; Attributes (Paragraph 4)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={demonstratedQualities}
                      onChange={(e) => setDemonstratedQualities(e.target.value)}
                      placeholder="e.g. professionalism, technical aptitude, sincerity, adaptability, teamwork, willingness to learn, and responsibility"
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
              <div id="printable-experience-letter"
                className="printable-experience-sheet"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  borderRadius: 6,
                  padding: '38px 48px 28px 48px',
                  maxWidth: '816px',
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                  color: '#1e293b',
                  lineHeight: 1.5,
                  fontSize: '0.865rem',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                }}
               contentEditable={true} suppressContentEditableWarning={true}>
                <div>
                  {/* Official Top Header: Tasknera Logo + Brand + Tagline */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      paddingBottom: 10,
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="Tasknera"
                        style={{ width: 50, height: 50, objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1.6rem',
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
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          marginTop: 3,
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

                  <div style={{ width: '100%', height: 1, backgroundColor: '#cbd5e1', marginBottom: 12 }} />

                  {/* Reference & Date Line */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '0.825rem',
                      color: '#0f172a',
                      marginBottom: 14,
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
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <h1
                      style={{
                        margin: '0 0 6px',
                        fontSize: '1.3rem',
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
                      fontSize: '1rem',
                      fontStyle: 'italic',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: 16,
                      fontFamily: 'Georgia, "Times New Roman", Times, serif',
                    }}
                  >
                    To Whom It May Concern
                  </div>

                  {/* Body Paragraphs matching user requested format */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, textAlign: 'justify' }}>
                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '1px 2px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      This is to certify that {hl(`${salutation} ${fullName}`)} was associated with Tasknera HR Solutions as {designationArticle} {hl(designation)} from {hl(startDate)}, to {hl(endDate)}.
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '1px 2px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      During {hl(pronounHisHer)} tenure with the organization, {hl(pronounHeShe)} contributed to {hl(tenureContributionOverview)}
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: '2px 0 0', fontWeight: 600, outline: 'none', cursor: 'text' }}>
                      {hl(pronounHisHerCap)} key responsibilities and contributions included:
                    </p>

                    <ul style={{ margin: '2px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {responsibilitiesList.map((resp, idx) => (
                        <li key={idx} style={{ lineHeight: 1.38 }}>
                          {resp}
                        </li>
                      ))}
                    </ul>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '1px 2px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      Throughout {hl(pronounHisHer)} association with Tasknera HR Solutions, {hl(pronounHeShe)} demonstrated {hl(demonstratedQualities)} in carrying out {hl(pronounHisHer)} assigned duties.
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '1px 2px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      {hl(pronounHisHerCap)} association with Tasknera HR Solutions {statusMode === 'ended' ? hl(`concluded on ${endDate}.`) : hl('is continuing as on the date of this letter.')}
                    </p>

                    <p contentEditable={true} suppressContentEditableWarning={true} title="Click to edit this paragraph directly" style={{ margin: 0, padding: '1px 2px', borderRadius: 4, outline: 'none', cursor: 'text' }}>
                      We appreciate {hl(pronounHisHer)} contributions to the organization and wish {hl(pronounHimHer)} continued success and growth in {hl(pronounHisHer)} future professional endeavors.
                    </p>
                  </div>

                  {/* Signatory Section */}
                  <div style={{ marginTop: 14, fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif" }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f2a5c', marginBottom: 2 }}>
                      For Tasknera HR Solutions
                    </div>
                    <div style={{ margin: '0 0 0 -4px', minHeight: 56, display: 'flex', alignItems: 'center' }}>
                      <img
                        src={SHEETAL_BEDI_SIGNATURE_DATA_URL}
                        alt="Sheetal Bedi Signature"
                        style={{
                          width: 95,
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#0f2a5c', lineHeight: 1.25 }}>
                      {hl(signatoryName)}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 500, marginBottom: 5 }}>
                      {hl(signatoryTitle)}
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#1e293b', marginBottom: 5 }}>
                      <span style={{ fontWeight: 600 }}>Authorized Signature: </span>
                      <span style={{ color: '#64748b' }}>__________________</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>Date:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(issueDate)}</span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>Place:</span>{' '}
                      <span style={{ color: '#334155' }}>{hl(place)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer with Registered Office Address */}
                <div style={{ marginTop: 16, paddingTop: 8, borderTop: '1px solid #cbd5e1', position: 'relative' }}>
                  <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.4, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <div style={{ fontWeight: 700, color: '#0f2238', marginBottom: 1 }}>Registered Office:</div>
                    <div>D-57 F1, Dilshad Colony, Shahdara, Delhi – 110095</div>
                    <div>
                      Email: <a href="mailto:operations@tasknera.com" style={{ color: '#0284c7', textDecoration: 'none' }}>operations@tasknera.com</a>
                      {' '}|{' '}
                      Website: <a href="https://tasknera.com" target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>https://tasknera.com</a>
                    </div>
                  </div>

                  {/* Corner Accent Graphic */}
                  <div style={{ position: 'absolute', right: -48, bottom: -28, width: 120, height: 28, pointerEvents: 'none', overflow: 'hidden' }}>
                    <svg width="120" height="28" viewBox="0 0 120 28" fill="none">
                      <polygon points="25,28 50,0 120,0 120,12" fill="#f97316" />
                      <polygon points="45,28 70,0 120,0 120,28" fill="#0f2a5c" />
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
