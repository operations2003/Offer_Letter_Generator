import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Download,
  Printer,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  FileCheck2,
  RefreshCw,
  Eye,
  User,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { Modal } from '../common/Modal.js';
import { templateService } from '../../services/templateService.js';
import { offerService } from '../../services/offerService.js';
import { OfferTemplate } from '../../types/template.js';
import { useToast } from '../../context/ToastContext.js';

interface QuickTemplateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (offer: any) => void;
}

export const QuickTemplateOfferModal: React.FC<QuickTemplateOfferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error, info } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Workflow step: 1 = Template, 2 = Details, 3 = Generated Output
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Template State
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState('TaskNera Official Corporate Letterhead');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [customTemplateHtml, setCustomTemplateHtml] = useState<string | null>(null);

  // Candidate Details State
  const [details, setDetails] = useState({
    candidateName: '',
    email: '',
    phone: '',
    candidateAddress: 'D-57 Dilshad Colony, Delhi, 110095',
    designation: 'Senior Software Engineer',
    department: 'Platform Engineering',
    joiningDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    totalCtc: '₹18,00,000',
    location: 'Delhi (Hybrid - 3 days onsite)',
    probationPeriod: '90 days',
    offerValidityDate: new Date(Date.now() + 86400000 * 14).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  });

  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [generatedRefNumber, setGeneratedRefNumber] = useState('');

  if (!isOpen) return null;

  // Handle Uploading a new company template file (.docx / .pdf / .txt / .html)
  const handleTemplateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    try {
      const text = await file.text();
      // If it looks like HTML or plain text, wrap in clean markup
      const formatted = text.includes('<')
        ? text
        : text
            .split('\n\n')
            .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
            .join('');
      setCustomTemplateHtml(formatted);
      setSelectedTemplateTitle(`Uploaded: ${file.name}`);
      success(`Company template "${file.name}" uploaded successfully!`);
    } catch {
      error('Failed to read uploaded template file.');
    }
  };

  // Handle uploading candidate resume to auto-fill details
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingResume(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('offergen_token');
      const res = await fetch('/api/v1/candidates/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const extracted = json.data?.extractedData || json.data;
        if (extracted) {
          setDetails((prev) => ({
            ...prev,
            candidateName: extracted.fullName || extracted.candidateName || prev.candidateName || file.name.replace(/\.[^/.]+$/, ''),
            email: extracted.email || prev.email,
            phone: extracted.phone || prev.phone,
            designation: extracted.currentPosition || extracted.position || prev.designation,
          }));
          success('Candidate details auto-filled from document!');
        }
      } else {
        // Fallback: derive name from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setDetails((prev) => ({ ...prev, candidateName: cleanName }));
        info(`Auto-detected candidate name: "${cleanName}"`);
      }
    } catch {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setDetails((prev) => ({ ...prev, candidateName: cleanName }));
      info(`Auto-detected candidate name: "${cleanName}"`);
    } finally {
      setIsExtractingResume(false);
    }
  };

  // Step 2 -> Step 3: Swap details into template
  const handleGenerate = () => {
    if (!details.candidateName.trim()) {
      error('Please enter the Candidate Name before generating.');
      return;
    }

    setIsGenerating(true);
    const refNum = `OFF-TN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedRefNumber(refNum);

    // Template base
    let bodyContent = customTemplateHtml || `
<p><strong>Date:</strong> {{offer_validity_date}}</p>
<p><strong>Ref:</strong> {{reference_number}}</p>
<p><strong>To:</strong><br />
<strong>{{candidate_name}}</strong><br />
{{candidate_address}}</p>

<p>Dear <strong>{{candidate_name}}</strong>,</p>

<p>On behalf of <strong>TASKNERA</strong>, we are delighted to extend to you this formal offer of employment for the position of <strong>{{designation}}</strong> within our <strong>{{department}}</strong> team. We were thoroughly impressed by your background and are excited about the capabilities and leadership you bring to our organization.</p>

<div style="background:#f8fafc; border-left:4px solid #9c7a82; padding:14px 18px; margin:18px 0; border-radius:0 8px 8px 0;">
  <table style="width:100%; border-collapse:collapse; font-size:13px;">
    <tbody>
      <tr>
        <td style="padding:8px 12px; font-weight:600; color:#475569; width:35%;">Job Title / Designation</td>
        <td style="padding:8px 12px; font-weight:700; color:#0f172a;">{{designation}}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; font-weight:600; color:#475569;">Department</td>
        <td style="padding:8px 12px; color:#0f172a;">{{department}}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; font-weight:600; color:#475569;">Work Location</td>
        <td style="padding:8px 12px; color:#0f172a;">{{location}}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; font-weight:600; color:#475569;">Anticipated Joining Date</td>
        <td style="padding:8px 12px; font-weight:700; color:#0f172a;">{{joining_date}}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; font-weight:600; color:#475569;">Total Compensation (CTC)</td>
        <td style="padding:8px 12px; font-weight:700; color:#059669;">{{total_ctc}}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px; font-weight:600; color:#475569;">Probation Period</td>
        <td style="padding:8px 12px; color:#0f172a;">{{probation_period}}</td>
      </tr>
    </tbody>
  </table>
</div>

<p>Please signify your acceptance of this offer by signing and returning this document. We look forward to an impactful and rewarding journey together at TaskNera.</p>
`;

    // Swap details
    const replacements: Record<string, string> = {
      '{{candidate_name}}': details.candidateName,
      '{{candidate_address}}': details.candidateAddress,
      '{{designation}}': details.designation,
      '{{department}}': details.department,
      '{{location}}': details.location,
      '{{joining_date}}': details.joiningDate,
      '{{total_ctc}}': details.totalCtc,
      '{{salary}}': details.totalCtc,
      '{{probation_period}}': details.probationPeriod,
      '{{offer_validity_date}}': details.offerValidityDate,
      '{{reference_number}}': refNum,
      '{{company_name}}': 'TaskNera',
      '{{signatory_name}}': 'Sheetal Bedi',
      '{{signatory_title}}': 'CEO & FOUNDER',
      '\\[Candidate Name\\]': details.candidateName,
      '\\[Designation\\]': details.designation,
      '\\[Department\\]': details.department,
      '\\[Salary\\]': details.totalCtc,
      '\\[Joining Date\\]': details.joiningDate,
    };

    let finalBody = bodyContent;
    for (const [pattern, val] of Object.entries(replacements)) {
      finalBody = finalBody.replace(new RegExp(pattern, 'g'), val);
    }

    setGeneratedHtml(finalBody);
    setIsGenerating(false);
    setStep(3);
    success('Offer letter generated with swapped details!');
  };

  // Download PDF / Print
  const handlePrint = () => {
    window.print();
  };

  // Save to DB Pipeline
  const handleSaveToPipeline = async () => {
    setIsSaving(true);
    try {
      const candidateParts = details.candidateName.trim().split(' ');
      const firstName = candidateParts[0] || details.candidateName;
      const lastName = candidateParts.slice(1).join(' ') || 'Candidate';

      const created = await offerService.generateFinalOffer({
        templateId: 'tpl_tasknera_official_001',
        candidate: {
          firstName,
          lastName,
          email: details.email || `${firstName.toLowerCase()}@candidate.org`,
          phone: details.phone || '+91 9876543210',
          address: details.candidateAddress,
        },
        jobDetails: {
          jobTitle: details.designation,
          department: details.department,
          workLocation: details.location,
          employmentType: 'FULL_TIME',
          proposedJoiningDate: details.joiningDate,
          reportingManagerName: 'Sheetal Bedi',
          reportingManagerTitle: 'CEO & FOUNDER',
        },
        compensation: {
          currency: 'INR',
          baseSalary: 1500000,
          hraAllowance: 200000,
          specialAllowances: 100000,
          performanceBonus: 0,
          joiningBonus: 0,
          totalCtc: 1800000,
        },
        terms: {
          probationDurationDays: 90,
          noticePeriodDays: 30,
          workingHoursPerWeek: 40,
          workSchedule: 'Monday to Friday',
          clauses: [],
        },
        humanOverrides: [],
      });

      success(`Offer letter saved to pipeline with Ref: ${created.referenceNumber}!`);
      if (onSuccess) onSuccess(created);
      onClose();
    } catch (err: any) {
      error(err?.message || 'Failed to save offer to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: step === 3 ? 920 : 780,
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #090e1d 0%, #1e1b4b 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src="/logo.png"
              alt="TaskNera"
              style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 6 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Company Template Offer Generator
                </h3>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                >
                  Step {step} of 3
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: '#94a3b8' }}>
                Takes your company letterhead template and swaps in candidate details automatically.
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

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {/* STEP 1: SELECT OR UPLOAD COMPANY TEMPLATE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                  Step 1: Company Letterhead Template
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                  Select the official TaskNera company letterhead or upload your company’s Word (.docx) / PDF template.
                </p>
              </div>

              {/* Active Default Company Template Card */}
              <div
                style={{
                  border: '2px solid #2563eb',
                  borderRadius: 14,
                  padding: 20,
                  background: '#f8fafc',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: '#eff6ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                      }}
                    >
                      <FileCheck2 size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                        {selectedTemplateTitle}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 2 }}>
                        Verified TaskNera Executive Letterhead • D-57 Dilshad Colony, Delhi
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: '#dcfce7',
                            color: '#15803d',
                          }}
                        >
                          ✓ Official Letterhead Active
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: 4,
                            background: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          Signatory: Sheetal Bedi (CEO &amp; Founder)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Visual Preview of the Letterhead */}
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    background: '#ffffff',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ width: 140, height: 8, background: '#fae1c3', borderRadius: '0 0 6px 0' }}></div>
                    <div style={{ width: 100, height: 4, background: '#9c7a82' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <img src="/logo.png" alt="Logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                      <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>TASKNERA</span>
                    </div>
                    <div style={{ borderLeft: '1.5px solid #0f172a', paddingLeft: 8, fontSize: '0.625rem', color: '#475569', lineHeight: 1.3 }}>
                      <div>Phone: +91 7065278229</div>
                      <div>Email: careers@tasknera.com</div>
                      <div>ADD: D-57 Dilshad Colony, Delhi, 110095</div>
                    </div>
                  </div>
                  <div style={{ height: 2, background: '#1e293b', marginTop: 8 }}></div>
                </div>
              </div>

              {/* Upload Alternate Company Template Dropzone */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 8 }}>
                  Or Upload Another Company Template (.docx / .pdf / .txt):
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleTemplateFileUpload}
                  accept=".docx,.pdf,.txt,.html"
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: '24px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  <Upload size={28} style={{ color: '#2563eb', margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>
                    {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click to Upload Company Template'}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '4px 0 0' }}>
                    Supports Word (.docx), PDF (.pdf), and text (.txt). The system will automatically inject details into your template.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER OR AUTO-EXTRACT CANDIDATE DETAILS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Step 2: Change Candidate &amp; Offer Details
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                    Enter the candidate’s specifics to replace the placeholders in your template.
                  </p>
                </div>

                {/* Auto-fill from resume button */}
                <input
                  type="file"
                  ref={resumeInputRef}
                  onChange={handleResumeUpload}
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="secondary"
                  icon={isExtractingResume ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                  onClick={() => resumeInputRef.current?.click()}
                  disabled={isExtractingResume}
                  style={{ fontSize: '0.8125rem', padding: '7px 12px' }}
                >
                  {isExtractingResume ? 'Auto-Extracting...' : 'Auto-Fill from Resume (AI)'}
                </Button>
              </div>

              {/* Form Fields Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Candidate Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Aarav Sharma"
                      value={details.candidateName}
                      onChange={(e) => setDetails({ ...details, candidateName: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Job Title / Designation</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lead Platform Engineer"
                      value={details.designation}
                      onChange={(e) => setDetails({ ...details, designation: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Engineering"
                    value={details.department}
                    onChange={(e) => setDetails({ ...details, department: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Total Compensation (CTC)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ₹18,00,000 or $120,000"
                      value={details.totalCtc}
                      onChange={(e) => setDetails({ ...details, totalCtc: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Proposed Joining Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="date"
                      className="form-input"
                      value={details.joiningDate}
                      onChange={(e) => setDetails({ ...details, joiningDate: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Work Location &amp; Model</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Delhi (Hybrid)"
                      value={details.location}
                      onChange={(e) => setDetails({ ...details, location: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Candidate Email (Optional)</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="aarav.sharma@example.com"
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Candidate Phone (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 9876543210"
                    value={details.phone}
                    onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LIVE PREVIEW OF GENERATED LETTERHEAD DOCUMENT */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} style={{ color: '#059669' }} />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Offer Letter Generated Successfully
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                    Ref: <strong>{generatedRefNumber}</strong> • Candidate: <strong>{details.candidateName}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="secondary"
                    icon={<Printer size={15} />}
                    onClick={handlePrint}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Print / PDF
                  </Button>
                  <Button
                    variant="primary"
                    icon={isSaving ? <RefreshCw size={15} className="spin" /> : <ShieldCheck size={15} />}
                    onClick={handleSaveToPipeline}
                    disabled={isSaving}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    {isSaving ? 'Saving...' : 'Save to Pipeline'}
                  </Button>
                </div>
              </div>

              {/* Exact Letterhead Preview Paper */}
              <div
                id="printable-offer-document"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '40px 48px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  position: 'relative',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: '#1e293b',
                  lineHeight: 1.6,
                }}
              >
                {/* Official TaskNera Header Banner */}
                <div style={{ position: 'relative', marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ width: 280, height: 18, background: '#fae1c3', borderRadius: '0 0 14px 0' }}></div>
                    <div style={{ width: 220, height: 8, background: '#9c7a82' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src="/logo.png" alt="TaskNera" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                      <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>
                        TASKNERA
                      </span>
                    </div>
                    <div style={{ borderLeft: '2px solid #0f172a', paddingLeft: 14, fontSize: '11px', lineHeight: 1.5, color: '#1e293b' }}>
                      <div><strong>Phone:</strong> +91 7065278229</div>
                      <div><strong>Email:</strong> careers@tasknera.com</div>
                      <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
                    </div>
                  </div>
                  <div style={{ height: 3, background: '#1e293b', width: '100%' }}></div>
                </div>

                {/* Injected Content */}
                <div
                  dangerouslySetInnerHTML={{ __html: generatedHtml }}
                  style={{ fontSize: '0.875rem' }}
                />

                {/* Official TaskNera Signatory & Footer Banner */}
                <div style={{ marginTop: 40, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32, paddingRight: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Sheetal Bedi</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>CEO &amp; FOUNDER</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>TaskNera</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 240, height: 16, background: '#9c7a82', borderRadius: '12px 12px 0 0' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          {step > 1 ? (
            <Button
              variant="secondary"
              icon={<ArrowLeft size={16} />}
              onClick={() => setStep((step - 1) as any)}
            >
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          )}

          {step === 1 && (
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              onClick={() => setStep(2)}
            >
              Continue to Details
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="primary"
              icon={isGenerating ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Document'}
            </Button>
          )}

          {step === 3 && (
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
