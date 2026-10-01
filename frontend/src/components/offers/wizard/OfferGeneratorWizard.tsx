import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Cpu,
  CheckSquare,
  Briefcase,
  DollarSign,
  Shield,
  Sparkles,
  SearchCheck,
  Award,
  Send,
  ArrowLeft,
  ArrowRight,
  Save,
  X,
} from 'lucide-react';
import { OfferTemplate } from '../../../types/template.js';
import {
  CandidateDetails,
  CompensationData,
  JobEmploymentDetails,
  TermsAndPolicies,
  OfferClauseItem,
  AiQualityCheckResult,
  GeneratedOfferResult,
  PreGenerationCheckResult,
} from '../../../types/offer.js';
import {
  AiCandidateExtractionData,
  HrConfirmedTerms,
  HumanOverrideItem,
} from '../../../types/index.js';
import { offerService, SAMPLE_RESUME_TEXT } from '../../../services/offerService.js';
import { templateService } from '../../../services/templateService.js';
import { useToast } from '../../../context/ToastContext.js';

// Import 11 Step Components
import { Step1SelectTemplate } from './Step1SelectTemplate.js';
import { Step2UploadCandidateDocument } from './Step2UploadCandidateDocument.js';
import { Step3AiExtraction } from './Step3AiExtraction.js';
import { Step4ReviewAiData } from './Step4ReviewAiData.js';
import { Step5JobEmploymentDetails } from './Step5JobEmploymentDetails.js';
import { Step6Compensation } from './Step6Compensation.js';
import { Step7TermsClauses } from './Step7TermsClauses.js';
import { Step8AiAssistance } from './Step8AiAssistance.js';
import { Step9AiQualityCheck } from './Step9AiQualityCheck.js';
import { Step10FinalHrReview } from './Step10FinalHrReview.js';
import { Step11GenerateOffer } from './Step11GenerateOffer.js';

interface OfferGeneratorWizardProps {
  onCancel: () => void;
  onSuccess: (offer: GeneratedOfferResult) => void;
}

export const OfferGeneratorWizard: React.FC<OfferGeneratorWizardProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { success, warning, error, info } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Template
  const [selectedTemplate, setSelectedTemplate] = useState<OfferTemplate | null>(null);

  // Step 2: Document
  const [documentText, setDocumentText] = useState<string>(SAMPLE_RESUME_TEXT);
  const [documentMeta, setDocumentMeta] = useState<{
    name: string;
    sizeBytes: number;
    type: string;
  } | null>({
    name: 'Jane_Alexandra_Doe_Staff_Architect_Resume.pdf',
    sizeBytes: 42180,
    type: 'application/pdf',
  });

  // Step 3 & 4: AI Extraction & Review
  const [aiData, setAiData] = useState<AiCandidateExtractionData | null>(null);
  const [confirmedTerms, setConfirmedTerms] = useState<HrConfirmedTerms>({
    candidateName: 'Jane Alexandra Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Springfield, OR',
    qualification: 'B.S. in Computer Science & Engineering',
    experience: '9+ years',
    designation: 'Staff Software Architect',
    department: 'Cloud Infrastructure & Core Services',
    location: 'San Francisco, CA (Hybrid - 3 days onsite)',
    joiningDate: '2026-11-16',
    employmentType: 'FULL_TIME',
    reportingManager: 'Marcus Vance, VP of Engineering',
    otherDetails: 'Standard technical equipment bundle',
    currency: 'USD',
    baseSalary: 165000,
    hraAllowance: 24000,
    specialAllowances: 6000,
    performanceBonus: 24750,
    joiningBonus: 15000,
    totalCtc: 234750,
  });
  const [humanOverrides, setHumanOverrides] = useState<HumanOverrideItem[]>([]);

  // Step 5: Job & Employment Details
  const [jobDetails, setJobDetails] = useState<JobEmploymentDetails>({
    jobTitle: 'Staff Software Architect',
    department: 'Cloud Infrastructure & Core Services',
    bandGrade: 'L6 - Staff Software Architect',
    workLocation: 'San Francisco, CA (Hybrid - 3 days onsite)',
    employmentType: 'FULL_TIME',
    proposedJoiningDate: '2026-11-16',
    reportingManagerName: 'Marcus Vance',
    reportingManagerTitle: 'VP of Global Engineering',
  });

  // Step 6: Compensation
  const [compensation, setCompensation] = useState<CompensationData>({
    currency: 'USD',
    baseSalary: 165000,
    hraAllowance: 24000,
    specialAllowances: 6000,
    performanceBonus: 24750,
    joiningBonus: 15000,
    totalCtc: 234750,
    equityDetails: {
      sharesCount: 25000,
      vestingPeriodMonths: 48,
      cliffMonths: 12,
      schemeType: 'ISO',
    },
    benefitsSummary: [
      'Comprehensive 100% Medical, Dental, Vision health insurance',
      '401(k) matching up to 4% of eligible base salary',
      'Annual $4,000 professional learning & conference stipend',
    ],
  });

  // Step 7: Terms & Clauses
  const [terms, setTerms] = useState<TermsAndPolicies>({
    probationDurationDays: 90,
    noticePeriodDays: 30,
    workingHoursPerWeek: 40,
    workSchedule: 'Monday to Friday, 9:00 AM – 5:30 PM PST',
    offerValidUntil: '2026-10-15',
    clauses: [
      {
        id: 'cls_ip_01',
        title: 'Proprietary Information & Inventions Agreement',
        content: '<p>All software codes, architectures, patents, trade secrets, and works conceived during tenure remain the sole exclusive property of Acme Technologies Inc.</p>',
        isMandatory: true,
        isConfirmedByHr: true,
        category: 'IP',
      },
      {
        id: 'cls_nda_02',
        title: 'Non-Disclosure & Trade Secrets Confidentiality',
        content: '<p>You shall maintain strictest confidentiality regarding company proprietary data, customer pipelines, and internal architectures during and following employment.</p>',
        isMandatory: true,
        isConfirmedByHr: true,
        category: 'CONFIDENTIALITY',
      },
      {
        id: 'cls_atwill_03',
        title: 'At-Will Employment & Resignation Notice',
        content: '<p>Employment constitutes at-will service. Either party may conclude the engagement upon providing written notice in accordance with stated notice periods.</p>',
        isMandatory: true,
        isConfirmedByHr: true,
        category: 'TERMS',
      },
      {
        id: 'cls_remote_04',
        title: 'Flexible Hybrid Workspace & Equipment Support',
        content: '<p>Candidate will receive a standard company workstation equipment package and monthly technology allowance in accordance with hybrid guidelines.</p>',
        isCustom: true,
        isConfirmedByHr: true,
        category: 'CUSTOM',
      },
    ],
  });

  // Step 9: AI Quality Check Result
  const [qualityCheckResult, setQualityCheckResult] = useState<AiQualityCheckResult | null>(null);
  const [preGenAuditResult, setPreGenAuditResult] = useState<PreGenerationCheckResult | null>(null);

  // Step 10: Sign Off
  const [signOff, setSignOff] = useState({
    recruiterId: 'usr_hr_002',
    approverId: 'usr_eng_vp',
    approvalNotes: 'Approved per Q4 Staff Architecture Headcount plan.',
    isConfirmed: true,
  });

  // Step 11: Generated Offer
  const [generatedOffer, setGeneratedOffer] = useState<GeneratedOfferResult | null>(null);
  const [generatingOffer, setGeneratingOffer] = useState(false);

  // Sync terms when aiData changes
  const handleExtractionSuccess = (data: AiCandidateExtractionData) => {
    setAiData(data);
    setConfirmedTerms((prev) => ({
      ...prev,
      candidateName: data.candidateName.value || prev.candidateName,
      email: data.email.value || prev.email,
      phone: data.phone.value || prev.phone,
      address: data.address.value || prev.address,
      qualification: data.qualification.value || prev.qualification,
      experience: data.experience.value || prev.experience,
      designation: data.designation.value || prev.designation,
      department: data.department.value || prev.department,
      location: data.location.value || prev.location,
      joiningDate: data.joiningDate.value || prev.joiningDate,
      baseSalary: Number(data.baseSalary.value || prev.baseSalary),
      totalCtc: Number(data.totalCtc.value || prev.totalCtc),
    }));

    setJobDetails((prev) => ({
      ...prev,
      jobTitle: data.designation.value || prev.jobTitle,
      department: data.department.value || prev.department,
      workLocation: data.location.value || prev.workLocation,
      proposedJoiningDate: data.joiningDate.value || prev.proposedJoiningDate,
    }));

    if (data.baseSalary.value) {
      setCompensation((prev) => ({
        ...prev,
        baseSalary: Number(data.baseSalary.value),
        totalCtc: Number(data.totalCtc.value || prev.totalCtc),
      }));
    }
  };

  // Sync Step 4 terms updates into jobDetails and compensation
  const handleUpdateConfirmedTerms = (termsUpdate: HrConfirmedTerms, overridesUpdate: HumanOverrideItem[]) => {
    setConfirmedTerms(termsUpdate);
    setHumanOverrides(overridesUpdate);

    setJobDetails((prev) => ({
      ...prev,
      jobTitle: termsUpdate.designation,
      department: termsUpdate.department,
      workLocation: termsUpdate.location,
      proposedJoiningDate: termsUpdate.joiningDate,
    }));

    setCompensation((prev) => ({
      ...prev,
      baseSalary: termsUpdate.baseSalary,
      hraAllowance: termsUpdate.hraAllowance,
      specialAllowances: termsUpdate.specialAllowances,
      performanceBonus: termsUpdate.performanceBonus,
      joiningBonus: termsUpdate.joiningBonus,
      totalCtc: termsUpdate.totalCtc,
    }));
  };

  // Candidate details object derived from confirmedTerms
  const candidateObject: CandidateDetails = {
    firstName: confirmedTerms.candidateName.split(' ')[0] || 'Jane',
    lastName: confirmedTerms.candidateName.split(' ').slice(1).join(' ') || 'Doe',
    email: confirmedTerms.email,
    phone: confirmedTerms.phone,
    address: confirmedTerms.address,
    qualification: confirmedTerms.qualification,
    experienceYears: 9.5,
  };

  // Step 10 -> Step 11 Offer Generation Action
  const handleProceedToGenerate = async () => {
    if (!signOff.isConfirmed) {
      warning('Please check the HR sign-off ratification checkbox before generating.');
      return;
    }

    setGeneratingOffer(true);

    try {
      // 1. Mandatory Pre-Generation Audit across all 9 categories
      const auditRes = await offerService.performPreGenerationCheck({
        candidate: candidateObject,
        jobDetails,
        compensation,
        terms,
        company: {
          name: 'Acme Technologies Global Corp.',
          legalName: 'Acme Technologies Global Corp.',
          signatoryName: 'Sarah Jenkins',
          signatoryTitle: 'VP of Global Talent Operations',
        },
      });

      setPreGenAuditResult(auditRes);

      // 2. Enforce Verdict: PASS / WARNING / REVIEW_REQUIRED
      // AI flags issues, never silently modifies the offer
      if (auditRes.status === 'REVIEW_REQUIRED') {
        error(
          `Pre-Generation Audit: REVIEW_REQUIRED (${auditRes.criticalIssuesCount} blocking issues found). AI has flagged these issues; human HR review and resolution is required before generation. AI will not silently modify the offer.`,
          'Audit Review Required'
        );
        setGeneratingOffer(false);
        return;
      }

      if (auditRes.status === 'WARNING') {
        warning(
          `Pre-Generation Audit: WARNING (${auditRes.warningsCount} advisory warnings). Proceeding to generation under HR authority.`,
          'Advisories Present'
        );
      } else {
        info('Pre-Generation Audit: PASS. All 9 consistency checks cleared.', 'Audit Passed');
      }

      // 3. Final Offer Generation
      setCurrentStep(11);
      const templateId = selectedTemplate?.id || 'tpl_std_fulltime_001';
      const result = await offerService.generateFinalOffer({
        templateId,
        candidate: candidateObject,
        jobDetails,
        compensation,
        terms,
        humanOverrides,
      });

      setGeneratedOffer(result);
      success(`Offer letter generated: ${result.referenceNumber}`, 'Offer Issued');
      onSuccess(result);
    } catch (err: any) {
      error(err?.message || 'Failed to generate offer document', 'Error');
    } finally {
      setGeneratingOffer(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedTemplate) {
      warning('Please select a base offer template.');
      return;
    }
    if (currentStep === 2 && !documentText.trim()) {
      warning('Please upload a candidate resume or click Quick Load Sample.');
      return;
    }
    if (currentStep === 10) {
      handleProceedToGenerate();
      return;
    }
    setCurrentStep((prev) => Math.min(11, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const stepTitles = [
    { num: 1, title: 'Select Template', icon: FileText, group: 'Intake' },
    { num: 2, title: 'Upload Document', icon: Upload, group: 'Intake' },
    { num: 3, title: 'AI Extraction', icon: Cpu, group: 'Intake' },
    { num: 4, title: 'Review AI Data', icon: CheckSquare, group: 'Intake' },
    { num: 5, title: 'Job Details', icon: Briefcase, group: 'Terms' },
    { num: 6, title: 'Compensation', icon: DollarSign, group: 'Terms' },
    { num: 7, title: 'Terms & Clauses', icon: Shield, group: 'Terms' },
    { num: 8, title: 'AI Assistance', icon: Sparkles, group: 'Intelligence' },
    { num: 9, title: 'AI Quality Check', icon: SearchCheck, group: 'Intelligence' },
    { num: 10, title: 'Final HR Review', icon: Award, group: 'Authorization' },
    { num: 11, title: 'Generate Offer', icon: Send, group: 'Issuance' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Stepper Navigation Bar */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              OFFER GENERATION PIPELINE • STEP {currentStep} OF 11
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
              {stepTitles[currentStep - 1]?.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              style={{ fontSize: '0.8125rem' }}
            >
              <X size={15} />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => info('Draft state preserved in local tenant workspace.', 'Draft Auto-Saved')}
              style={{ fontSize: '0.8125rem' }}
            >
              <Save size={14} />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {/* 11 Steps Horizontal Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 6,
          }}
        >
          {stepTitles.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            const Icon = s.icon;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  // Allow jumping to any visited or current step
                  if (currentStep >= s.num || isDone) {
                    setCurrentStep(s.num);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: isCurrent
                    ? 'var(--primary)'
                    : isDone
                    ? '#ecfdf5'
                    : '#f8fafc',
                  border: isCurrent
                    ? '1px solid var(--primary)'
                    : isDone
                    ? '1px solid #a7f3d0'
                    : '1px solid var(--border-subtle)',
                  color: isCurrent ? '#ffffff' : isDone ? '#047857' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: isDone || isCurrent ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: isCurrent
                      ? '#ffffff'
                      : isDone
                      ? '#059669'
                      : '#e2e8f0',
                    color: isCurrent ? 'var(--primary)' : isDone ? '#ffffff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                  }}
                >
                  {s.num}
                </span>
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step View Container */}
      <div style={{ minHeight: '520px' }}>
        {currentStep === 1 && (
          <Step1SelectTemplate
            selectedTemplateId={selectedTemplate?.id || null}
            onSelectTemplate={(tpl) => setSelectedTemplate(tpl)}
          />
        )}

        {currentStep === 2 && (
          <Step2UploadCandidateDocument
            documentText={documentText}
            documentMeta={documentMeta}
            onUpdateDocument={(txt, meta) => {
              setDocumentText(txt);
              setDocumentMeta(meta);
            }}
          />
        )}

        {currentStep === 3 && (
          <Step3AiExtraction
            documentText={documentText}
            onExtractionSuccess={handleExtractionSuccess}
            onNextStep={handleNextStep}
          />
        )}

        {currentStep === 4 && aiData && (
          <Step4ReviewAiData
            aiData={aiData}
            confirmedTerms={confirmedTerms}
            overrides={humanOverrides}
            onUpdateTerms={handleUpdateConfirmedTerms}
          />
        )}

        {currentStep === 5 && (
          <Step5JobEmploymentDetails
            jobDetails={jobDetails}
            aiData={aiData}
            onUpdateJobDetails={(updated) => setJobDetails(updated)}
          />
        )}

        {currentStep === 6 && (
          <Step6Compensation
            compensation={compensation}
            aiData={aiData}
            onUpdateCompensation={(updated) => setCompensation(updated)}
          />
        )}

        {currentStep === 7 && (
          <Step7TermsClauses
            terms={terms}
            onUpdateTerms={(updated) => setTerms(updated)}
          />
        )}

        {currentStep === 8 && (
          <Step8AiAssistance
            roleTitle={jobDetails.jobTitle}
            department={jobDetails.department}
            onAddClause={(newCls) =>
              setTerms((prev) => ({
                ...prev,
                clauses: [...prev.clauses, newCls],
              }))
            }
            onAddBenefit={(newBenefit) =>
              setCompensation((prev) => ({
                ...prev,
                benefitsSummary: [...(prev.benefitsSummary || []), newBenefit],
              }))
            }
          />
        )}

        {currentStep === 9 && (
          <Step9AiQualityCheck
            candidate={candidateObject}
            jobDetails={jobDetails}
            compensation={compensation}
            terms={terms}
            qualityCheckResult={qualityCheckResult}
            onUpdateQualityResult={(res) => setQualityCheckResult(res)}
            preGenAuditResult={preGenAuditResult}
            onUpdatePreGenAuditResult={(res) => setPreGenAuditResult(res)}
            onJumpToStep={(step) => setCurrentStep(step)}
          />
        )}

        {currentStep === 10 && (
          <Step10FinalHrReview
            candidate={candidateObject}
            jobDetails={jobDetails}
            compensation={compensation}
            terms={terms}
            aiData={aiData}
            overrides={humanOverrides}
            recruiterId={signOff.recruiterId}
            approverId={signOff.approverId}
            approvalNotes={signOff.approvalNotes}
            isConfirmed={signOff.isConfirmed}
            preGenAuditResult={preGenAuditResult}
            onJumpToStep={(step) => setCurrentStep(step)}
            onUpdateSignOff={(so) => setSignOff(so)}
          />
        )}

        {currentStep === 11 && (
          <Step11GenerateOffer
            generatedOffer={generatedOffer}
            onFinish={onCancel}
            onRegenerate={handleProceedToGenerate}
          />
        )}
      </div>

      {/* Bottom Sticky Navigation Footer (Steps 1 through 10) */}
      {currentStep < 11 && (
        <div
          style={{
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            borderRadius: 12,
            border: '1px solid var(--border-medium)',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
            position: 'sticky',
            bottom: 0,
            zIndex: 20,
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            style={{ fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} />
            <span>Previous Step</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              Step {currentStep} of 10
            </span>

            <button
              type="button"
              className={currentStep === 10 ? 'btn btn-ai' : 'btn btn-primary'}
              onClick={handleNextStep}
              style={{ fontSize: '0.875rem', padding: '10px 22px' }}
            >
              <span>{currentStep === 10 ? 'Ratify & Generate Formal Offer' : 'Continue to Next Step'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
