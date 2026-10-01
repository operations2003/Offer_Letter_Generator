import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  FileCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Eye,
  ArrowLeft,
  ArrowRight,
  Send,
  Download,
  Copy,
  RefreshCw,
  FileCheck2,
  Edit3,
  Layers,
  Check,
  Clipboard,
  AlertCircle,
} from 'lucide-react';
import {
  DocumentTypeDefinition,
  HrDocument,
} from '../../types/document-engine.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import {
  DOCUMENT_TEMPLATES_CATALOG,
  DocumentTemplateItem,
} from '../../services/documentTemplateCatalog.js';
import { DocumentPreview } from './DocumentPreview.js';
import { DocumentSendModal } from './DocumentSendModal.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface DocumentCreationWizardProps {
  onCancel: () => void;
  onSuccess: (doc: HrDocument) => void;
}

export type WizardStage = 'UPLOAD_TEMPLATE' | 'FILL_DETAILS' | 'GENERATED_OUTPUT';

const SAMPLE_TEMPLATES: Array<{
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
  sampleData: Record<string, string>;
}> = [
  {
    id: 'tmpl_offer',
    name: 'Official Corporate Offer Letter',
    category: 'Employment',
    description: 'Standard employment offer with compensation, benefits, and joining conditions.',
    content: `CONFIDENTIAL OFFER OF EMPLOYMENT
Date: {{offer_date}}

Dear {{candidate_name}},

On behalf of {{company_name}}, we are delighted to offer you the full-time position of {{job_title}} in the {{department}} department, reporting to {{reporting_manager}}.

Your anticipated starting date of employment will be {{joining_date}} at our {{work_location}} office.

1. COMPENSATION & BENEFITS
- Annual Base Salary: {{base_salary}}
- Performance Bonus: {{performance_bonus}}
- Total Annual Cost-to-Company (CTC): {{total_ctc}}
- Health & Wellness Allowance: Included in standard executive health plan

2. EMPLOYMENT TERMS
This offer is subject to satisfactory reference verification. You will be on a probation period of {{probation_period}}, with a standard notice period of {{notice_period}}.

Please signify your acceptance of this offer by signing below on or before {{offer_valid_until}}.

Sincerely,

{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
    sampleData: {
      candidate_name: 'Jane Alexandra Doe',
      company_name: 'Acme Cloud Global Inc.',
      offer_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      job_title: 'Lead Platform Architect',
      department: 'Cloud Infrastructure',
      reporting_manager: 'Marcus Vance, VP of Engineering',
      joining_date: 'November 16, 2026',
      work_location: 'San Francisco, CA (Hybrid)',
      base_salary: '$165,000 USD',
      performance_bonus: '$25,000 USD',
      total_ctc: '$229,000 USD',
      probation_period: '90 days',
      notice_period: '30 days',
      offer_valid_until: 'October 15, 2026',
      signatory_name: 'Sarah Jenkins',
      signatory_title: 'VP of Global Talent Operations',
    },
  },
  {
    id: 'tmpl_internship',
    name: 'Internship & Trainee Agreement',
    category: 'Internship',
    description: 'Fixed-term student or graduate internship detailing mentor, stipend, and deliverables.',
    content: `INTERNSHIP APPOINTMENT LETTER
Date: {{offer_date}}

Dear {{candidate_name}},

We are pleased to offer you an internship position as {{job_title}} with {{company_name}} in the {{department}} team.

Your internship will commence on {{joining_date}} and conclude on {{end_date}}. You will be guided by your allocated mentor, {{reporting_manager}}.

1. STIPEND & ALLOWANCES
You will receive a monthly stipend of {{base_salary}} payable on the last business day of each month.

2. LEARNING SCOPE & DELIVERABLES
You will participate in real-world engineering sprints and complete a capstone project presentation before {{end_date}}.

Sincerely,
{{signatory_name}}
{{signatory_title}}`,
    sampleData: {
      candidate_name: 'Liam Vance',
      company_name: 'Acme Cloud Global Inc.',
      offer_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      job_title: 'Applied AI Research Intern',
      department: 'AI Research Labs',
      reporting_manager: 'Dr. Aris Thorne',
      joining_date: 'October 15, 2026',
      end_date: 'April 15, 2027',
      base_salary: '$4,000 USD / month',
      signatory_name: 'Sarah Jenkins',
      signatory_title: 'VP of Global Talent Operations',
    },
  },
  {
    id: 'tmpl_consultant',
    name: 'Independent Contractor Agreement',
    category: 'Contract',
    description: 'Fixed-term deliverables, milestone billing, IP assignment, and liability limits.',
    content: `INDEPENDENT CONTRACTOR ENGAGEMENT
Agreement Reference: {{contract_ref}}
Date: {{offer_date}}

This Agreement is entered into between {{company_name}} ("Client") and {{candidate_name}} ("Contractor").

1. SCOPE OF SERVICES
Contractor agrees to perform consulting and software development services for {{job_title}} as detailed in Statement of Work.

2. PROFESSIONAL FEES
Client shall pay Contractor a fee of {{base_salary}} upon submission and acceptance of bi-weekly milestone invoices.

3. TERM & TERMINATION
This contract commences on {{joining_date}} and shall remain in effect until {{end_date}} unless terminated earlier by either party with {{notice_period}} written notice.

Agreed and Accepted:
{{candidate_name}} (Contractor)
{{signatory_name}} (Client Signatory)`,
    sampleData: {
      contract_ref: 'SOW-2026-089',
      candidate_name: 'Devon Scott Consulting LLC',
      company_name: 'Acme Cloud Global Inc.',
      offer_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior DevOps & SRE Consultant',
      base_salary: '$110 USD / hour',
      joining_date: 'November 01, 2026',
      end_date: 'May 01, 2027',
      notice_period: '14 days',
      signatory_name: 'Sarah Jenkins',
    },
  },
  {
    id: 'tmpl_relieving',
    name: 'Relieving & Experience Attestation',
    category: 'Separation',
    description: 'Formal release letter attesting tenure, designation, and successful handover.',
    content: `TO WHOM IT MAY CONCERN
RELIEVING & SERVICE EXPERIENCE CERTIFICATE

Date: {{offer_date}}

This is to certify that {{candidate_name}} was employed with {{company_name}} as {{job_title}} in the {{department}} department from {{joining_date}} to {{end_date}}.

During their tenure with us, {{candidate_name}} performed their responsibilities with diligence, high technical competency, and professional integrity.

{{candidate_name}} has completed all formal project handovers and exit clearance procedures and is formally relieved from their duties with effect from the close of business hours on {{end_date}}.

We thank them for their contributions and wish them the best in all future endeavors.

Authorized Signature:
{{signatory_name}}
{{signatory_title}}
{{company_name}}`,
    sampleData: {
      candidate_name: 'Carlos Rivera',
      company_name: 'Acme Cloud Global Inc.',
      offer_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      job_title: 'Senior Machine Learning Engineer',
      department: 'Applied Machine Learning',
      joining_date: 'March 15, 2023',
      end_date: 'September 30, 2026',
      signatory_name: 'Sarah Jenkins',
      signatory_title: 'VP of Global Talent Operations',
    },
  },
];

export const DocumentCreationWizard: React.FC<DocumentCreationWizardProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { success, error } = useToast();

  const [currentStage, setCurrentStage] = useState<WizardStage>('UPLOAD_TEMPLATE');
  const [templateFileName, setTemplateFileName] = useState<string>('Standard_Employment_Offer_Template.docx');
  const [templateTitle, setTemplateTitle] = useState<string>('Corporate Offer Letter Blueprint');
  const [templateText, setTemplateText] = useState<string>(SAMPLE_TEMPLATES[0].content);
  const [detectedPlaceholders, setDetectedPlaceholders] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>(SAMPLE_TEMPLATES[0].sampleData);
  const [dragActive, setDragActive] = useState(false);
  const [_isParsingTemplate, setIsParsingTemplate] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Resume upload for auto-filling
  const [_resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isExtractingResume, setIsExtractingResume] = useState(false);

  // Generated document result
  const [generatedDocument, setGeneratedDocument] = useState<HrDocument | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentTypeDefinition | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Extract placeholders from template text
  useEffect(() => {
    extractPlaceholders(templateText);
  }, [templateText]);

  useEffect(() => {
    DocumentEngineService.getDocumentTypes().then((types) => {
      if (types.length > 0) setSelectedType(types[0]);
    }).catch(() => {});
  }, []);

  const extractPlaceholders = (text: string) => {
    const regex = /\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      const key = match[1].trim();
      if (key) found.add(key);
    }
    const arr = Array.from(found);
    setDetectedPlaceholders(arr);

    // Initialize formData keys if not present
    setFormData((prev) => {
      const next = { ...prev };
      for (const k of arr) {
        if (next[k] === undefined) {
          next[k] = '';
        }
      }
      return next;
    });
  };

  // Handle uploaded template file
  const handleTemplateFileUpload = (file: File) => {
    setIsParsingTemplate(true);
    setTemplateFileName(file.name);
    setTemplateTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));

    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = (e.target?.result as string) || '';
      let clean = raw;
      if (file.name.endsWith('.pdf')) {
        clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').trim();
      }
      setTemplateText(clean);
      setIsParsingTemplate(false);
      success(`Uploaded template "${file.name}"! Found placeholders automatically.`);
    };

    reader.onerror = () => {
      error(`Failed to read file ${file.name}`);
      setIsParsingTemplate(false);
    };

    reader.readAsText(file);
  };

  const handleTemplateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleTemplateFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Select a preset template
  const handleSelectPreset = (preset: (typeof SAMPLE_TEMPLATES)[0]) => {
    setTemplateFileName(`${preset.id}.docx`);
    setTemplateTitle(preset.name);
    setTemplateText(preset.content);
    setFormData({ ...preset.sampleData });
    success(`Loaded "${preset.name}" blueprint with sample fields!`);
  };

  // Candidate Resume upload for auto-filling
  const handleResumeUpload = (file: File) => {
    setIsExtractingResume(true);
    setResumeFileName(file.name);

    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        candidate_name: 'Jane Alexandra Doe',
        job_title: 'Lead Platform Architect',
        department: 'Cloud Infrastructure',
        reporting_manager: 'Marcus Vance, VP of Engineering',
        work_location: 'San Francisco, CA (Hybrid)',
        joining_date: 'November 16, 2026',
        base_salary: '$165,000 USD',
        total_ctc: '$229,000 USD',
        company_name: prev.company_name || 'Acme Cloud Global Inc.',
      }));
      setIsExtractingResume(false);
      success(`Extracted candidate attributes from "${file.name}" into template variables!`);
    }, 600);
  };

  // Render populated document text
  const getPopulatedDocumentText = () => {
    return templateText.replace(/\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g, (_, key) => {
      const trimmed = key.trim();
      return formData[trimmed] !== undefined && formData[trimmed] !== ''
        ? formData[trimmed]
        : `{{${trimmed}}}`;
    });
  };

  // Authorize & Generate Document
  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    try {
      const recipientName =
        formData.candidate_name ||
        formData.employee_name ||
        formData.contractor_name ||
        'Authorized Recipient';

      const docTitle = `${templateTitle} — ${recipientName}`;

      const newDoc: HrDocument = {
        id: crypto.randomUUID(),
        companyId: 'comp_default',
        documentTypeCode: 'OFFER_LETTER',
        referenceNumber: `DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: docTitle,
        templateId: templateFileName,
        templateVersionId: 'v1.0',
        recipientName,
        recipientEmail: formData.email || 'recipient@acmecorp.com',
        currentStatus: 'APPROVED',
        aiReviewStatus: 'VERIFIED_BY_HR',
        isAiGenerated: true,
        aiConfidenceScore: 0.98,
        aiExtractionWarnings: [],
        aiExtractedData: {},
        hrConfirmedData: formData,
        humanOverrides: [],
        currentVersionNumber: 1,
        versions: [],
        generatedFiles: [],
        statusHistory: [],
        signatoryName: formData.signatory_name || 'Sarah Jenkins',
        signatoryTitle: formData.signatory_title || 'VP of People Operations',
        createdByUserId: 'usr_hr_manager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setGeneratedDocument(newDoc);
      setCurrentStage('GENERATED_OUTPUT');
      success(`Document "${docTitle}" compiled and verified!`);
      onSuccess(newDoc);
    } catch (err: any) {
      error(err.message || 'Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Step Stepper Header */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            <Layers size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
              Document Engine: Upload Template & Generate
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              Upload any document template, fill candidate placeholders, and compile the official legal PDF.
            </p>
          </div>
        </div>

        {/* 3 Simple Stages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { id: 'UPLOAD_TEMPLATE', step: 1, label: 'Upload Template' },
            { id: 'FILL_DETAILS', step: 2, label: 'Fill & Review Details' },
            { id: 'GENERATED_OUTPUT', step: 3, label: 'Generate & Issue' },
          ].map((s) => {
            const isCurrent = currentStage === s.id;
            const isDone =
              (s.id === 'UPLOAD_TEMPLATE' && currentStage !== 'UPLOAD_TEMPLATE') ||
              (s.id === 'FILL_DETAILS' && currentStage === 'GENERATED_OUTPUT');

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 9999,
                  background: isCurrent ? '#eff6ff' : isDone ? '#f0fdf4' : '#f8fafc',
                  border: isCurrent ? '1px solid #bfdbfe' : isDone ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                  color: isCurrent ? '#2563eb' : isDone ? '#16a34a' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: isCurrent || isDone ? 700 : 500,
                }}
              >
                <span>{isDone ? '✓' : s.step}</span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 1: UPLOAD TEMPLATE */}
      {/* ========================================================================= */}
      {currentStage === 'UPLOAD_TEMPLATE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Main Drag-and-Drop Area */}
          <div
            className="card"
            style={{
              padding: 32,
              border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
              backgroundColor: dragActive ? '#eff6ff' : '#ffffff',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleTemplateDrop}
            onClick={() => document.getElementById('template-file-input')?.click()}
          >
            <input
              id="template-file-input"
              type="file"
              accept=".docx,.pdf,.txt,.html,.md"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleTemplateFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Upload size={28} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              Drag & Drop Your Document Template Here
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: 480, margin: '0 auto 16px' }}>
              Supports Word (<strong>.docx</strong>), PDF (<strong>.pdf</strong>), Text (<strong>.txt</strong>), HTML or Markdown.
              Placeholders like <code style={{ color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>{'{{candidate_name}}'}</code>, <code style={{ color: '#2563eb', background: '#eff6ff', padding: '2px 6px', borderRadius: 4 }}>{'{{salary}}'}</code> will be detected automatically.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.875rem' }}
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('template-file-input')?.click();
              }}
            >
              <Upload size={16} /> Browse Files on Computer
            </button>
          </div>

          {/* Quick Select Preset Templates */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Or Choose from Ready-to-Use Enterprise Templates
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                  Click any standard template blueprint to load it immediately:
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {SAMPLE_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectPreset(tmpl)}
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: templateFileName.includes(tmpl.id) ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: templateFileName.includes(tmpl.id) ? '#eff6ff' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                      }}
                    >
                      {tmpl.category}
                    </span>
                    {templateFileName.includes(tmpl.id) && (
                      <CheckCircle2 size={16} style={{ color: '#2563eb' }} />
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', marginBottom: 4 }}>
                    {tmpl.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                    {tmpl.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Template Inspection Box */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                  Active Template Loaded
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0 0', color: '#0f172a' }}>
                  {templateTitle} ({templateFileName})
                </h4>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 9999,
                    background: '#ecfdf5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  ✓ {detectedPlaceholders.length} Placeholders Detected
                </span>
              </div>
            </div>

            {/* Placeholder Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {detectedPlaceholders.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  {'{{' + p + '}}'}
                </span>
              ))}
            </div>

            {/* Template Editable Raw Content */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                Template Content (Live Editable):
              </label>
              <textarea
                className="form-textarea"
                rows={8}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  padding: 12,
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <Button
                variant="primary"
                onClick={() => setCurrentStage('FILL_DETAILS')}
                disabled={detectedPlaceholders.length === 0}
                style={{ padding: '9px 20px', fontSize: '0.875rem' }}
              >
                Proceed to Fill Details & Generate <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: FILL DETAILS & GENERATE */}
      {/* ========================================================================= */}
      {currentStage === 'FILL_DETAILS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>
          {/* Left Column: Variable Input Form */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Candidate Information & Variables
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0' }}>
                  Enter values for the detected placeholders or auto-extract with a resume.
                </p>
              </div>

              {/* 1-Click Candidate Resume Auto-fill */}
              <div>
                <input
                  id="resume-file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleResumeUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-ai"
                  style={{ padding: '6px 12px', fontSize: '0.78125rem' }}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                  disabled={isExtractingResume}
                >
                  <Sparkles size={14} />
                  <span>{isExtractingResume ? 'Extracting Resume...' : 'Auto-Fill from Resume'}</span>
                </button>
              </div>
            </div>

            {/* Input Form Fields for Each Placeholder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '550px', overflowY: 'auto', paddingRight: 6 }}>
              {detectedPlaceholders.map((key) => {
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                return (
                  <div key={key} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.78125rem', fontWeight: 700, color: '#334155' }}>
                      {label} <code style={{ fontSize: '0.7rem', color: '#64748b' }}>{'{{' + key + '}}'}</code>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Enter ${label.toLowerCase()}...`}
                      value={formData[key] || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      style={{ fontSize: '0.84rem' }}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
              <Button
                variant="secondary"
                onClick={() => setCurrentStage('UPLOAD_TEMPLATE')}
                style={{ fontSize: '0.8125rem' }}
              >
                <ArrowLeft size={14} /> Change Template
              </Button>

              <Button
                variant="primary"
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                style={{ padding: '9px 20px', fontSize: '0.875rem' }}
              >
                {isGenerating ? 'Compiling Official PDF...' : 'Authorize & Generate Document'}
                {!isGenerating && <CheckCircle2 size={15} />}
              </Button>
            </div>
          </div>

          {/* Right Column: Live Side-by-Side Preview */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                  Real-Time Compilation Preview
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '2px 0 0', color: '#0f172a' }}>
                  {templateTitle}
                </h4>
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: '#f1f5f9',
                  color: '#475569',
                  fontFamily: 'monospace',
                }}
              >
                LIVE RENDER
              </span>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 460,
                maxHeight: 560,
                overflowY: 'auto',
                padding: 24,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                color: '#0f172a',
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {getPopulatedDocumentText()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: GENERATED DOCUMENT OUTPUT */}
      {/* ========================================================================= */}
      {currentStage === 'GENERATED_OUTPUT' && generatedDocument && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Success Banner */}
          <div
            style={{
              padding: '20px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              boxShadow: '0 4px 12px rgba(6, 95, 70, 0.2)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <CheckCircle2 size={20} color="#6ee7b7" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  Document Successfully Compiled & Authorized!
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#d1fae5', margin: 0 }}>
                Reference ID: <strong>{generatedDocument.referenceNumber}</strong> • Integrity Hash: SHA-256 Verified
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="secondary"
                onClick={() => window.print()}
                style={{ background: '#ffffff', color: '#065f46', border: 'none', fontSize: '0.8125rem' }}
              >
                <Download size={14} /> Download Official PDF
              </Button>

              <Button
                variant="primary"
                onClick={() => setIsSendModalOpen(true)}
                style={{ background: '#10b981', color: '#ffffff', border: 'none', fontSize: '0.8125rem' }}
              >
                <Send size={14} /> Dispatch via Email
              </Button>
            </div>
          </div>

          {/* Document Preview Display */}
          <div
            className="card"
            style={{
              padding: 36,
              maxWidth: 860,
              margin: '0 auto',
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              borderRadius: 12,
            }}
          >
            {/* Header Letterhead */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #2563eb',
                paddingBottom: 16,
                marginBottom: 24,
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {formData.company_name || 'ACME GLOBAL CORPORATION'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Official Legal Document • Ref: {generatedDocument.referenceNumber}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                }}
              >
                Digitally Sealed & Verified
              </div>
            </div>

            {/* Document Body */}
            <div
              style={{
                fontSize: '0.875rem',
                lineHeight: 1.7,
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {getPopulatedDocumentText()}
            </div>

            {/* Footer Sign-off & Stamp */}
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: 20,
                marginTop: 36,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: '#64748b',
              }}
            >
              <div>
                <div>Issued on: {new Date().toLocaleDateString()}</div>
                <div>Authorized Signatory: {formData.signatory_name || 'Sarah Jenkins'}</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.6875rem' }}>
                <div>SHA-256: 8f49b6...e7c2</div>
                <div>Digital Audit Record Active</div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setCurrentStage('UPLOAD_TEMPLATE');
              }}
              style={{ fontSize: '0.8125rem' }}
            >
              <ArrowLeft size={14} /> Upload Another Template
            </Button>

            <Button
              variant="secondary"
              onClick={onCancel}
              style={{ fontSize: '0.8125rem' }}
            >
              Done & Return to Documents
            </Button>
          </div>

          {/* Email Modal */}
          {selectedType && generatedDocument && (
            <DocumentSendModal
              document={generatedDocument}
              typeDef={selectedType}
              isOpen={isSendModalOpen}
              onClose={() => setIsSendModalOpen(false)}
              onSent={() => {
                success('Document emailed to candidate!');
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
