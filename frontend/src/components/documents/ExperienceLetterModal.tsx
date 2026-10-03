import React, { useState, useEffect, useMemo } from 'react';
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
  const [fullName, setFullName] = useState<string>('Aarav Sharma');
  const [designation, setDesignation] = useState<string>('Senior Platform Engineer');
  const [department, setDepartment] = useState<string>('Platform Engineering');
  const [associationType, setAssociationType] = useState<'employment' | 'internship'>('employment');
  const [genderPronoun, setGenderPronoun] = useState<'male' | 'female'>('male');

  // Dates & Reference
  const [startDate, setStartDate] = useState<string>('January 15, 2024');
  const [endDate, setEndDate] = useState<string>('September 30, 2026');
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [referenceNumber, setReferenceNumber] = useState<string>(
    `TASK/${new Date().getFullYear()}/EXP-${Math.floor(100 + Math.random() * 900)}`
  );
  const [place, setPlace] = useState<string>('Delhi');

  // Status of association: either ended on date or continuing
  const [statusMode, setStatusMode] = useState<'ended' | 'continuing'>('ended');

  // Custom Content Fields (Authority to user)
  const [areaOfWork, setAreaOfWork] = useState<string>('talent acquisition and recruitment operations');
  const [responsibilityLevel, setResponsibilityLevel] = useState<'assisted with' | 'was responsible for'>('was responsible for');
  const [keyResponsibilities, setKeyResponsibilities] = useState<string>(
    'candidate sourcing and screening, recruitment coordination, maintaining candidate records'
  );
  const [demonstratedQualities, setDemonstratedQualities] = useState<string>(
    'professionalism, sincerity, adaptability, willingness to learn, teamwork and responsibility'
  );

  // Signatory (Matches official template: Chief Executive Officer)
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
            areaOfWork,
            responsibilityLevel,
            keyResponsibilities,
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
          areaOfWork,
          responsibilityLevel,
          keyResponsibilities,
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

  return (
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
          maxHeight: '94vh',
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
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Official Experience Letter Generator
                </h3>
                <span
                  style={{
                    backgroundColor: '#fff7ed',
                    color: '#ea580c',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    border: '1px solid #fed7aa',
                  }}
                >
                  Step {step} of 2: {step === 1 ? 'Select Employee & Configure Terms' : 'Official Letterhead Preview'}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Generates verified statutory service certification on pristine TaskNera corporate letterhead.
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#f8fafc' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        Area of Work Activities
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={areaOfWork}
                        onChange={(e) => setAreaOfWork(e.target.value)}
                        placeholder="e.g. talent acquisition and recruitment operations"
                        style={{ fontSize: '0.8125rem' }}
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                        Responsibility Level
                      </label>
                      <select
                        className="form-input"
                        value={responsibilityLevel}
                        onChange={(e) => setResponsibilityLevel(e.target.value as any)}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        <option value="was responsible for">was responsible for (Primary Ownership)</option>
                        <option value="assisted with">assisted with (Supportive / Collaborative)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Key Responsibilities Undertaken
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={keyResponsibilities}
                      onChange={(e) => setKeyResponsibilities(e.target.value)}
                      placeholder="e.g. candidate sourcing and screening, recruitment coordination, maintaining candidate records"
                      style={{ fontSize: '0.8125rem' }}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                      Demonstrated Qualities &amp; Professional Attributes
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      value={demonstratedQualities}
                      onChange={(e) => setDemonstratedQualities(e.target.value)}
                      placeholder="e.g. professionalism, sincerity, adaptability, willingness to learn, teamwork and responsibility"
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
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  borderRadius: 8,
                  padding: '36px 48px',
                  maxWidth: '820px',
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  color: '#1e293b',
                  lineHeight: 1.55,
                  fontSize: '0.9375rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  {/* Official Top Header: TaskNera Logo Left + Address & Email Right */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f1f5f9',
                      paddingBottom: 14,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <img
                        src="/logo.png"
                        alt="TaskNera Logo"
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                        TaskNera
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                        D-57 F1 Dilshad Colony, Shahdara, Delhi – 110095
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                        Email: careers@tasknera.com
                      </div>
                    </div>
                  </div>

                  {/* Reference & Date Block */}
                  <div style={{ marginBottom: 16, fontFamily: 'Arial, sans-serif', fontSize: '0.82rem', color: '#334155' }}>
                    <div>
                      <strong>Reference:</strong> {hl(referenceNumber)}
                    </div>
                    <div>
                      <strong>Date:</strong> {hl(issueDate)}
                    </div>
                  </div>

                  {/* Centered Document Title */}
                  <div style={{ textAlign: 'center', marginBottom: 18 }}>
                    <h1
                      style={{
                        margin: '0 0 4px',
                        fontSize: '1.6rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        letterSpacing: '0.01em',
                        fontFamily: '"Times New Roman", Times, serif',
                      }}
                    >
                      Experience Letter
                    </h1>
                    <div
                      style={{
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      To Whomsoever It May Concern
                    </div>
                  </div>

                  {/* Body Paragraphs matching PDF template exactly */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, textAlign: 'justify' }}>
                    <p style={{ margin: 0 }}>
                      This is to certify that {hl(`${salutation} ${fullName}`)} was associated with TaskNera HR Solutions as {hl(designationArticle)} {hl(designation)} from {hl(startDate)} to {hl(endDate)}.
                    </p>

                    <p style={{ margin: 0 }}>
                      During {hl(pronounHisHer)} {hl(associationType)}, {hl(pronounHeShe)} was part of the {hl(department)} and contributed to {hl(areaOfWork)}-related activities throughout {hl(pronounHisHer)} association with the organization.
                    </p>

                    <p style={{ margin: 0 }}>
                      As part of the {hl(department)}, {hl(pronounHeShe)} {hl(responsibilityLevel)} {hl(keyResponsibilities)}, and supporting other {hl(department)} activities as assigned.
                    </p>

                    <p style={{ margin: 0 }}>
                      Throughout {hl(pronounHisHer)} association with TaskNera HR Solutions, {hl(pronounHeShe)} demonstrated {hl(demonstratedQualities)} in carrying out {hl(pronounHisHer)} responsibilities.
                    </p>

                    <p style={{ margin: 0 }}>
                      {hl(pronounHisHerCap)} association with TaskNera HR Solutions {statusMode === 'ended' ? hl(`ended on ${endDate}`) : hl('is continuing as on the date of this letter')}.
                    </p>

                    <p style={{ margin: 0 }}>
                      We appreciate {hl(pronounHisHer)} contribution to the organization and wish {hl(pronounHimHer)} continued success and growth in all {hl(pronounHisHer)} future endeavours.
                    </p>
                  </div>

                  {/* Signatory Section */}
                  <div style={{ marginTop: 24, display: 'inline-block' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 22 }}>
                      For TaskNera HR Solutions
                    </div>
                    <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
                      <div>Name: {hl(signatoryName)}</div>
                      <div>Designation: {hl(signatoryTitle)}</div>
                      <div>Date: {hl(issueDate)}</div>
                      <div>Place: {hl(place)}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Page Numbering */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: 10,
                    marginTop: 20,
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  TaskNera | Page 1 of 1
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
