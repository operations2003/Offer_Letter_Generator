import React, { useState } from 'react';
import {
  User,
  Phone,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  CreditCard,
  FileUp,
  FileCheck2,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Check,
} from 'lucide-react';
import {
  OnboardingFormConfig,
  CandidateOnboardingData,
  EducationRecord,
  EmploymentRecord,
  CollectedDocument,
} from '../../../../shared/types/onboarding-engine.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { onboardingService } from '../../services/onboardingService.js';

interface OnboardingFormWizardProps {
  candidateId: string;
  config: OnboardingFormConfig;
  initialData?: Partial<CandidateOnboardingData>;
  onSaved?: (data: CandidateOnboardingData) => void;
  onSubmitted?: (data: CandidateOnboardingData) => void;
  isReadOnly?: boolean;
}

export const OnboardingFormWizard: React.FC<OnboardingFormWizardProps> = ({
  candidateId,
  config,
  initialData,
  onSaved,
  onSubmitted,
  isReadOnly = false,
}) => {
  const { success, error } = useToast();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [personalInfo, setPersonalInfo] = useState<Record<string, any>>(
    initialData?.personalInfo || {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'Female',
      bloodGroup: 'O+',
      maritalStatus: 'Single',
      nationality: 'Indian',
      fatherOrSpouseName: '',
    }
  );

  const [contactInfo, setContactInfo] = useState<Record<string, any>>(
    initialData?.contactInfo || {
      personalEmail: '',
      mobileNumber: '',
      alternateNumber: '',
      currentAddress: '',
      permanentAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    }
  );

  const [education, setEducation] = useState<EducationRecord[]>(
    initialData?.education && initialData.education.length > 0
      ? initialData.education
      : [
          {
            degree: 'Bachelor of Technology',
            institution: '',
            universityOrBoard: '',
            endYear: '2022',
            gradeOrPercentage: '',
          },
        ]
  );

  const [previousEmployment, setPreviousEmployment] = useState<EmploymentRecord[]>(
    initialData?.previousEmployment || []
  );

  const [emergencyContact, setEmergencyContact] = useState<Record<string, any>>(
    initialData?.emergencyContact || {
      primaryName: '',
      relationship: 'Parent',
      primaryPhone: '',
      alternatePhone: '',
      address: '',
    }
  );

  const [bankDetails, setBankDetails] = useState<Record<string, any>>(
    initialData?.bankDetails || {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscOrRoutingCode: '',
      branchName: '',
      accountType: 'SAVINGS',
      panNumber: '',
    }
  );

  const [documents, setDocuments] = useState<CollectedDocument[]>(
    initialData?.documents || []
  );

  const [declaration, setDeclaration] = useState<Record<string, any>>(
    initialData?.declaration || {
      hasConsentedBgv: false,
      hasConfirmedAccuracy: false,
      agreedToPolicies: false,
      electronicSignature: '',
      signatureDate: new Date().toISOString().split('T')[0],
    }
  );

  const enabledSections = (config.sections || []).filter((s) => s.isEnabled).sort((a, b) => a.order - b.order);

  const getSectionIcon = (key: string) => {
    switch (key) {
      case 'personal_info':
        return <User size={16} />;
      case 'contact_info':
        return <Phone size={16} />;
      case 'education':
        return <GraduationCap size={16} />;
      case 'previous_employment':
        return <Briefcase size={16} />;
      case 'emergency_contact':
        return <AlertTriangle size={16} />;
      case 'bank_details':
        return <CreditCard size={16} />;
      case 'document_collection':
        return <FileUp size={16} />;
      case 'declaration':
        return <FileCheck2 size={16} />;
      default:
        return <CheckCircle2 size={16} />;
    }
  };

  const currentSection = enabledSections[activeStep] || enabledSections[0];

  // Helper to compile full candidate submission
  const compilePayload = (): CandidateOnboardingData => ({
    personalInfo,
    contactInfo,
    education,
    previousEmployment,
    emergencyContact: emergencyContact as any,
    bankDetails: bankDetails as any,
    documents,
    declaration: declaration as any,
  });

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const payload = compilePayload();
      await onboardingService.saveDraft(candidateId, payload);
      success('Onboarding draft saved successfully!');
      if (onSaved) onSaved(payload);
    } catch (err: any) {
      error(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = compilePayload();
      await onboardingService.submitForm(candidateId, payload);
      success('Onboarding form submitted successfully to HR!');
      if (onSubmitted) onSubmitted(payload);
    } catch (err: any) {
      error(err.message || 'Failed to submit onboarding form');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Education Helpers
  const addEducationRow = () => {
    setEducation([
      ...education,
      {
        degree: '',
        institution: '',
        universityOrBoard: '',
        endYear: '',
        gradeOrPercentage: '',
      },
    ]);
  };

  const removeEducationRow = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Employment Helpers
  const addEmploymentRow = () => {
    setPreviousEmployment([
      ...previousEmployment,
      {
        companyName: '',
        designation: '',
        employmentType: 'FULL_TIME',
        startDate: '',
        endDate: '',
        reasonForLeaving: '',
        lastDrawnCtc: '',
      },
    ]);
  };

  const removeEmploymentRow = (index: number) => {
    setPreviousEmployment(previousEmployment.filter((_, i) => i !== index));
  };

  // Mock Document Upload Handler
  const handleFileUpload = (docCode: string, fileName: string) => {
    const existingIndex = documents.findIndex((d) => d.documentCode === docCode);
    const newDoc: CollectedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      documentCode: docCode,
      fileName,
      fileSize: 450000,
      mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    let updatedDocs: CollectedDocument[];
    if (existingIndex >= 0) {
      updatedDocs = [...documents];
      updatedDocs[existingIndex] = newDoc;
    } else {
      updatedDocs = [...documents, newDoc];
    }
    setDocuments(updatedDocs);
    success(`Uploaded ${fileName}`);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {/* Wizard Header / Steps Indicator */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflowX: 'auto',
        }}
      >
        {enabledSections.map((sec, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep;

          return (
            <button
              key={sec.key}
              onClick={() => setActiveStep(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: isActive ? '#2563eb' : isDone ? '#eff6ff' : 'transparent',
                color: isActive ? '#ffffff' : isDone ? '#2563eb' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isDone ? <Check size={14} /> : getSectionIcon(sec.key)}</span>
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Body */}
      <div style={{ padding: '28px 32px' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            {currentSection.title}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 3 }}>
            {currentSection.description}
          </p>
        </div>

        {/* 1. PERSONAL INFORMATION */}
        {currentSection.key === 'personal_info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={personalInfo.firstName || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                placeholder="e.g. Sakshi"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={personalInfo.middleName || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, middleName: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={personalInfo.lastName || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                placeholder="e.g. Koparde"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className="form-input"
                disabled={isReadOnly}
                value={personalInfo.dateOfBirth || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className="form-select"
                disabled={isReadOnly}
                value={personalInfo.gender || 'Female'}
                onChange={(e) => setPersonalInfo({ ...personalInfo, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                className="form-select"
                disabled={isReadOnly}
                value={personalInfo.bloodGroup || 'O+'}
                onChange={(e) => setPersonalInfo({ ...personalInfo, bloodGroup: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marital Status</label>
              <select
                className="form-select"
                disabled={isReadOnly}
                value={personalInfo.maritalStatus || 'Single'}
                onChange={(e) => setPersonalInfo({ ...personalInfo, maritalStatus: e.target.value })}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nationality *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={personalInfo.nationality || 'Indian'}
                onChange={(e) => setPersonalInfo({ ...personalInfo, nationality: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Father or Spouse Full Name</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={personalInfo.fatherOrSpouseName || ''}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fatherOrSpouseName: e.target.value })}
                placeholder="For statutory documentation & verification"
              />
            </div>
          </div>
        )}

        {/* 2. CONTACT INFORMATION */}
        {currentSection.key === 'contact_info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Personal Email *</label>
              <input
                type="email"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.personalEmail || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, personalEmail: e.target.value })}
                placeholder="candidate@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Phone Number *</label>
              <input
                type="tel"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.mobileNumber || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, mobileNumber: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Phone Number</label>
              <input
                type="tel"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.alternateNumber || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, alternateNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Current Residential Address *</label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={isReadOnly}
                value={contactInfo.currentAddress || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, currentAddress: e.target.value })}
                placeholder="Flat/House No, Building, Street, Area"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Permanent Address *</label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={isReadOnly}
                value={contactInfo.permanentAddress || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, permanentAddress: e.target.value })}
                placeholder="Same as current address or permanent hometown address"
              />
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.city || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                placeholder="e.g. Pune"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Province *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.state || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, state: e.target.value })}
                placeholder="e.g. Maharashtra"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal / ZIP Code *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.postalCode || ''}
                onChange={(e) => setContactInfo({ ...contactInfo, postalCode: e.target.value })}
                placeholder="e.g. 411057"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={contactInfo.country || 'India'}
                onChange={(e) => setContactInfo({ ...contactInfo, country: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* 3. EDUCATION */}
        {currentSection.key === 'education' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                      Qualification #{idx + 1}
                    </span>
                    {!isReadOnly && education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEducationRow(idx)}
                        style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        title="Remove Qualification"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Degree / Diploma *</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled={isReadOnly}
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. B.Tech Computer Science"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">College / Institute *</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled={isReadOnly}
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].institution = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. PICT Pune"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">University / Board *</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled={isReadOnly}
                        value={edu.universityOrBoard}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].universityOrBoard = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. SPPU"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Year of Passing *</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled={isReadOnly}
                        value={edu.endYear}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].endYear = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. 2022"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Grade / Percentage *</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled={isReadOnly}
                        value={edu.gradeOrPercentage}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].gradeOrPercentage = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. 8.8 CGPA or 78%"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!isReadOnly && (
              <Button
                variant="secondary"
                onClick={addEducationRow}
                icon={<Plus size={14} />}
                style={{ marginTop: 16, fontSize: '0.8125rem' }}
              >
                Add Another Degree
              </Button>
            )}
          </div>
        )}

        {/* 4. PREVIOUS EMPLOYMENT */}
        {currentSection.key === 'previous_employment' && (
          <div>
            {previousEmployment.length === 0 ? (
              <div
                style={{
                  padding: 32,
                  textAlign: 'center',
                  background: '#f8fafc',
                  borderRadius: 12,
                  border: '1px dashed #cbd5e1',
                }}
              >
                <Briefcase size={28} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155' }}>
                  No Previous Employment Records
                </h4>
                <p style={{ fontSize: '0.78125rem', color: '#64748b', marginTop: 2 }}>
                  Fresher candidates may skip this section. Lateral hires can record past companies below.
                </p>
                {!isReadOnly && (
                  <Button
                    variant="secondary"
                    onClick={addEmploymentRow}
                    icon={<Plus size={14} />}
                    style={{ marginTop: 12, fontSize: '0.8125rem' }}
                  >
                    Add Prior Employer
                  </Button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {previousEmployment.map((emp, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                        Employer #{idx + 1}
                      </span>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeEmploymentRow(idx)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Remove Employer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Company Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          disabled={isReadOnly}
                          value={emp.companyName}
                          onChange={(e) => {
                            const updated = [...previousEmployment];
                            updated[idx].companyName = e.target.value;
                            setPreviousEmployment(updated);
                          }}
                          placeholder="e.g. Acme Tech Solutions"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Designation / Role *</label>
                        <input
                          type="text"
                          className="form-input"
                          disabled={isReadOnly}
                          value={emp.designation}
                          onChange={(e) => {
                            const updated = [...previousEmployment];
                            updated[idx].designation = e.target.value;
                            setPreviousEmployment(updated);
                          }}
                          placeholder="e.g. Software Engineer"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Start Date *</label>
                        <input
                          type="date"
                          className="form-input"
                          disabled={isReadOnly}
                          value={emp.startDate}
                          onChange={(e) => {
                            const updated = [...previousEmployment];
                            updated[idx].startDate = e.target.value;
                            setPreviousEmployment(updated);
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">End Date *</label>
                        <input
                          type="date"
                          className="form-input"
                          disabled={isReadOnly}
                          value={emp.endDate}
                          onChange={(e) => {
                            const updated = [...previousEmployment];
                            updated[idx].endDate = e.target.value;
                            setPreviousEmployment(updated);
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Last Drawn Annual CTC</label>
                        <input
                          type="text"
                          className="form-input"
                          disabled={isReadOnly}
                          value={emp.lastDrawnCtc || ''}
                          onChange={(e) => {
                            const updated = [...previousEmployment];
                            updated[idx].lastDrawnCtc = e.target.value;
                            setPreviousEmployment(updated);
                          }}
                          placeholder="e.g. 15,00,000 INR"
                        />
                      </div>

                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Reason for Leaving</label>
                        <input
                          type="text"
                          className="form-input"
                          disabled={isReadOnly}
                          value={emp.reasonForLeaving || ''}
                          onChange={(e) => {
                            const updated = [...previousEmployment];
                            updated[idx].reasonForLeaving = e.target.value;
                            setPreviousEmployment(updated);
                          }}
                          placeholder="e.g. Career growth & new opportunity"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!isReadOnly && (
                  <Button
                    variant="secondary"
                    onClick={addEmploymentRow}
                    icon={<Plus size={14} />}
                    style={{ marginTop: 12, fontSize: '0.8125rem' }}
                  >
                    Add Another Employer
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. EMERGENCY CONTACT */}
        {currentSection.key === 'emergency_contact' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Primary Contact Person Name *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={emergencyContact.primaryName || ''}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, primaryName: e.target.value })}
                placeholder="e.g. Rajesh Koparde"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relationship to Candidate *</label>
              <select
                className="form-select"
                disabled={isReadOnly}
                value={emergencyContact.relationship || 'Parent'}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
              >
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Mobile Number *</label>
              <input
                type="tel"
                className="form-input"
                disabled={isReadOnly}
                value={emergencyContact.primaryPhone || ''}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, primaryPhone: e.target.value })}
                placeholder="+91 98765 00000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alternate Phone Number</label>
              <input
                type="tel"
                className="form-input"
                disabled={isReadOnly}
                value={emergencyContact.alternatePhone || ''}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, alternatePhone: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Emergency Contact Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                disabled={isReadOnly}
                value={emergencyContact.address || ''}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, address: e.target.value })}
                placeholder="Residential address of emergency contact"
              />
            </div>
          </div>
        )}

        {/* 6. BANK & STATUTORY DETAILS */}
        {currentSection.key === 'bank_details' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Account Holder Name (as per Bank) *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={bankDetails.accountHolderName || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                placeholder="e.g. SAKSHI KOPARDE"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Name *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={bankDetails.bankName || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank, ICICI Bank"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Account Number *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={bankDetails.accountNumber || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="Enter account number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">IFSC Code / Routing Code *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={bankDetails.ifscOrRoutingCode || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, ifscOrRoutingCode: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch Location *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={bankDetails.branchName || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                placeholder="e.g. Hinjewadi Phase 1, Pune"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Type *</label>
              <select
                className="form-select"
                disabled={isReadOnly}
                value={bankDetails.accountType || 'SAVINGS'}
                onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
              >
                <option value="SAVINGS">Savings Account</option>
                <option value="CURRENT">Current Account</option>
                <option value="CHECKING">Checking Account</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">PAN Number *</label>
              <input
                type="text"
                className="form-input"
                disabled={isReadOnly}
                value={bankDetails.panNumber || ''}
                onChange={(e) => setBankDetails({ ...bankDetails, panNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
              />
            </div>
          </div>
        )}

        {/* 7. DOCUMENT COLLECTION */}
        {currentSection.key === 'document_collection' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {config.requiredDocuments.map((docDef) => {
              const uploaded = documents.find((d) => d.documentCode === docDef.code);

              return (
                <div
                  key={docDef.code}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: uploaded ? '#f0fdf4' : '#f8fafc',
                    border: uploaded ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                        {docDef.name}
                      </span>
                      {docDef.required && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#b91c1c',
                            background: '#fef2f2',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          REQUIRED
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
                      {docDef.description}
                    </p>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 4 }}>
                      Accepted: {docDef.acceptedFormats.join(', ')} • Max {docDef.maxSizeMb}MB
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    {uploaded ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          background: '#ffffff',
                          borderRadius: 8,
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                          <CheckCircle2 size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              color: '#15803d',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                          >
                            {uploaded.fileName}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 9999,
                            background: uploaded.status === 'VERIFIED' ? '#dcfce7' : '#fef9c3',
                            color: uploaded.status === 'VERIFIED' ? '#15803d' : '#854d0e',
                          }}
                        >
                          {uploaded.status}
                        </span>
                      </div>
                    ) : (
                      !isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const fileName = `${docDef.code.toLowerCase()}_sample.pdf`;
                            handleFileUpload(docDef.code, fileName);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: '#ffffff',
                            border: '1px dashed #93c5fd',
                            borderRadius: 8,
                            color: '#2563eb',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <UploadCloud size={16} />
                          <span>Attach {docDef.name}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 8. DECLARATION & CONSENT */}
        {currentSection.key === 'declaration' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <input
                type="checkbox"
                id="decl_bgv"
                disabled={isReadOnly}
                checked={declaration.hasConsentedBgv || false}
                onChange={(e) => setDeclaration({ ...declaration, hasConsentedBgv: e.target.checked })}
                style={{ marginTop: 3, width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="decl_bgv" style={{ fontSize: '0.8125rem', color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}>
                <strong>Background Verification Consent:</strong> I hereby authorize TaskNera Enterprise to conduct
                comprehensive background screening, including academic credentials, prior employment tenures, reference checks,
                and regulatory compliance verifications.
              </label>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <input
                type="checkbox"
                id="decl_accuracy"
                disabled={isReadOnly}
                checked={declaration.hasConfirmedAccuracy || false}
                onChange={(e) => setDeclaration({ ...declaration, hasConfirmedAccuracy: e.target.checked })}
                style={{ marginTop: 3, width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="decl_accuracy" style={{ fontSize: '0.8125rem', color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}>
                <strong>Truthfulness & Authenticity:</strong> I certify that all information submitted, personal records,
                and digital document uploads are authentic, true, and complete. I understand that misrepresentation constitutes
                grounds for summary revocation of employment.
              </label>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <input
                type="checkbox"
                id="decl_policies"
                disabled={isReadOnly}
                checked={declaration.agreedToPolicies || false}
                onChange={(e) => setDeclaration({ ...declaration, agreedToPolicies: e.target.checked })}
                style={{ marginTop: 3, width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="decl_policies" style={{ fontSize: '0.8125rem', color: '#334155', cursor: 'pointer', lineHeight: 1.4 }}>
                <strong>Corporate Policies & Code of Conduct:</strong> I agree to review, respect, and uphold TaskNera's
                Code of Conduct, IT Acceptable Use Policy, Data Privacy, and Information Security Standards.
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 8 }}>
              <div className="form-group">
                <label className="form-label">Full Legal Name (Electronic Signature) *</label>
                <input
                  type="text"
                  className="form-input"
                  disabled={isReadOnly}
                  value={declaration.electronicSignature || ''}
                  onChange={(e) => setDeclaration({ ...declaration, electronicSignature: e.target.value })}
                  placeholder="Type your full legal name as digital signature"
                  style={{ fontFamily: 'Georgia, serif', fontSize: '1rem', fontStyle: 'italic' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Execution *</label>
                <input
                  type="date"
                  className="form-input"
                  disabled={isReadOnly}
                  value={declaration.signatureDate || ''}
                  onChange={(e) => setDeclaration({ ...declaration, signatureDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Footer Controls */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          {!isReadOnly && (
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={isSaving}
              icon={<Save size={15} />}
              style={{ fontSize: '0.8125rem' }}
            >
              Save Draft
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {activeStep > 0 && (
            <Button
              variant="secondary"
              onClick={() => setActiveStep(activeStep - 1)}
              icon={<ArrowLeft size={15} />}
              style={{ fontSize: '0.8125rem' }}
            >
              Previous
            </Button>
          )}

          {activeStep < enabledSections.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setActiveStep(activeStep + 1)}
              icon={<ArrowRight size={15} />}
              style={{ fontSize: '0.8125rem' }}
            >
              Next: {enabledSections[activeStep + 1]?.title}
            </Button>
          ) : (
            !isReadOnly && (
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                icon={<CheckCircle2 size={16} />}
                style={{ fontSize: '0.85rem', padding: '9px 20px', background: '#059669', borderColor: '#059669' }}
              >
                Submit Onboarding
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
