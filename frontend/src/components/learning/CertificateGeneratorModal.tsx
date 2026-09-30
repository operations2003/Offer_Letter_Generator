import React, { useState, useEffect } from 'react';
import {
  CertificateTemplate,
  CertificateTypeCode,
  IssuedCertificate,
} from '../../../../shared/types/learning-engine';
import { learningService, RequestCertificatePayload } from '../../services/learningService';
import {
  Award,
  CheckCircle2,
  FileCheck,
  FileText,
  Layers,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  History,
} from 'lucide-react';

interface CertificateGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificateIssued: (cert: IssuedCertificate) => void;
  templates: CertificateTemplate[];
  initialData?: {
    recipientName?: string;
    recipientEmail?: string;
    recipientDepartment?: string;
    courseId?: string;
    courseTitle?: string;
    certificateTypeCode?: CertificateTypeCode;
  };
  userRole?: string;
}

export const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({
  isOpen,
  onClose,
  onCertificateIssued,
  templates,
  initialData,
  userRole = 'HR_MANAGER',
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || 'tmpl_cert_course'
  );

  // Step 2: Person & Course Details
  const [personForm, setPersonForm] = useState({
    recipientName: initialData?.recipientName || 'Sakshi Koparde',
    recipientEmail: initialData?.recipientEmail || 'sakshi@tasknera.com',
    recipientDepartment: initialData?.recipientDepartment || 'Engineering',
    courseId: initialData?.courseId || '',
    courseTitle: initialData?.courseTitle || 'Enterprise Information Security & Data Privacy 2026',
    achievementDescription: 'Passed compliance assessment with 95% proficiency benchmark',
    signatoryName: 'Sakshi Koparde',
    signatoryTitle: 'Head of Learning & People Development',
    secondarySignatoryName: 'Alex Vance',
    secondarySignatoryTitle: 'Chief Technology Officer',
  });

  // Step 3: HR Review State
  const [reviewNotes, setReviewNotes] = useState(
    'Identity verified, curriculum requirements authenticated, and assessment scores verified.'
  );

  // Step 4: Generated Result
  const [generatedCert, setGeneratedCert] = useState<IssuedCertificate | null>(null);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates]);

  if (!isOpen) return null;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleNextToDetails = () => {
    setCurrentStep(2);
  };

  const handleNextToReview = () => {
    if (!personForm.recipientName.trim()) {
      setError('Recipient Name is required');
      return;
    }
    if (!personForm.courseTitle.trim()) {
      setError('Course or Milestone Title is required');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleConfirmAndGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload: RequestCertificatePayload = {
        templateId: selectedTemplate.id,
        certificateTypeCode: selectedTemplate.certificateTypeCode,
        recipientName: personForm.recipientName,
        recipientEmail: personForm.recipientEmail,
        recipientDepartment: personForm.recipientDepartment,
        courseId: personForm.courseId || undefined,
        courseTitle: personForm.courseTitle,
        achievementDescription: personForm.achievementDescription,
        signatoryName: personForm.signatoryName || selectedTemplate.signatoryName,
        signatoryTitle: personForm.signatoryTitle || selectedTemplate.signatoryTitle,
        secondarySignatoryName: personForm.secondarySignatoryName || selectedTemplate.secondarySignatoryName,
        secondarySignatoryTitle: personForm.secondarySignatoryTitle || selectedTemplate.secondarySignatoryTitle,
        requesterRole: userRole,
        requesterId: 'usr_admin_001',
        autoApprove: true, // Authorized HR/L&D directly approves and generates official ref
      };

      const cert = await learningService.requestCertificate(payload);
      setGeneratedCert(cert);
      onCertificateIssued(cert);
      setCurrentStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Template' },
    { num: 2, label: 'Person & Details' },
    { num: 3, label: 'HR / L&D Review' },
    { num: 4, label: 'Issue & Reference' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Certificate Generation Engine</h2>
              <p className="text-xs text-slate-500">
                Official credential issuing workflow with cryptographic SHA-256 seal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-8 py-3 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
            {steps.map((s) => {
              const isDone = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center bg-white px-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1 ${
                      isCurrent ? 'text-blue-700' : isDone ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Select Reusable Template */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 1: Select Certificate Template</h3>
                <p className="text-xs text-slate-500">
                  Select from 6 standardized reusable enterprise templates
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {tmpl.certificateTypeCode}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600">
                          {tmpl.badgeTitle}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-2">{tmpl.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {tmpl.description}
                      </p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Theme: {tmpl.styleTheme}</span>
                        <span className="font-medium text-slate-600">
                          Signatory: {tmpl.signatoryName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Person & Course Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Step 2: Enter Person & Credential Details
                </h3>
                <p className="text-xs text-slate-500">
                  Configure recipient identity, course title, and credentials
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={personForm.recipientName}
                    onChange={(e) => setPersonForm({ ...personForm, recipientName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={personForm.recipientEmail}
                    onChange={(e) => setPersonForm({ ...personForm, recipientEmail: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="learner@tasknera.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={personForm.recipientDepartment}
                    onChange={(e) =>
                      setPersonForm({ ...personForm, recipientDepartment: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Engineering, Product, People Ops"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Course / Milestone Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={personForm.courseTitle}
                    onChange={(e) => setPersonForm({ ...personForm, courseTitle: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Advanced AI Systems Engineering 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Achievement Description / Honors
                </label>
                <input
                  type="text"
                  value={personForm.achievementDescription}
                  onChange={(e) =>
                    setPersonForm({ ...personForm, achievementDescription: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Completed with 95% assessment distinction and capstone project"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Signatories</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Primary Signatory
                    </label>
                    <input
                      type="text"
                      value={personForm.signatoryName}
                      onChange={(e) =>
                        setPersonForm({ ...personForm, signatoryName: e.target.value })
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                      Secondary Signatory
                    </label>
                    <input
                      type="text"
                      value={personForm.secondarySignatoryName}
                      onChange={(e) =>
                        setPersonForm({ ...personForm, secondarySignatoryName: e.target.value })
                      }
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HR / L&D Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Step 3: HR / L&D Review & Attestation</h3>
                <p className="text-xs text-slate-500">
                  Verify credential details before issuing permanent cryptographic reference number
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Template</span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedTemplate.title} ({selectedTemplate.certificateTypeCode})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Recipient</span>
                  <span className="text-xs font-bold text-slate-900">
                    {personForm.recipientName} ({personForm.recipientEmail})
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Department</span>
                  <span className="text-xs font-medium text-slate-900">
                    {personForm.recipientDepartment}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-semibold text-slate-500">Course / Subject</span>
                  <span className="text-xs font-bold text-blue-700">{personForm.courseTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Achievement Notes</span>
                  <span className="text-xs text-slate-700 italic">
                    {personForm.achievementDescription || 'Standard Curriculum Completion'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  HR Review Verification Log Notes
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-800">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Approval will assign an immutable <strong>CERT-2026-XXXX</strong> reference number
                  and generate a 256-bit SHA digest for public credential lookup.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Reference Number */}
          {currentStep === 4 && generatedCert && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900">Certificate Successfully Issued!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Official corporate credential generated and cataloged into TaskNera registry with
                cryptographic integrity.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Reference Number:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {generatedCert.referenceNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-bold text-slate-900">{generatedCert.recipientName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Course / Milestone:</span>
                  <span className="font-medium text-slate-800">{generatedCert.courseTitle}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-mono text-slate-700">{generatedCert.issueDate}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400 truncate">
                  SHA-256: {generatedCert.verificationHash}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  View in Registry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {currentStep < 4 && (
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((currentStep - 1) as any)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={handleNextToDetails}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Continue to Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleNextToReview}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Proceed to HR Review
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleConfirmAndGenerate}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loading ? 'Issuing Certificate...' : 'Approve & Issue Certificate'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
