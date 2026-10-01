import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  ArrowLeft,
  Eye,
  Sparkles,
  Wand2,
  BookOpen,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Layers,
  FileText,
  Split,
  Maximize2,
  HelpCircle,
} from 'lucide-react';
import {
  OfferTemplate,
  TemplateCategory,
  CreateTemplateInput,
  UpdateTemplateInput,
  PlaceholderValidationResult,
} from '../../types/template.js';
import {
  templateService,
  STANDARD_PLACEHOLDERS,
  SAMPLE_CANDIDATE_DATA,
} from '../../services/templateService.js';
import { PlaceholderManagerModal } from './PlaceholderManagerModal.js';
import { AiPlaceholderSuggestionsModal } from './AiPlaceholderSuggestionsModal.js';
import { AiWordingSuggestionsModal } from './AiWordingSuggestionsModal.js';
import { TemplatePreviewModal } from './TemplatePreviewModal.js';
import { useToast } from '../../context/ToastContext.js';

interface TemplateEditorProps {
  template?: OfferTemplate | null;
  onSave: (savedTemplate: OfferTemplate) => void;
  onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const { error, success } = useToast();
  const isEditing = !!template;

  // Metadata
  const [title, setTitle] = useState(template?.title || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState<TemplateCategory>(template?.category || 'FULL_TIME');
  const [changeSummary, setChangeSummary] = useState('');

  // Markup & Styles
  const [contentMarkup, setContentMarkup] = useState(
    template?.currentVersion?.contentMarkup ||
      `<p><strong>Date:</strong> {{offer_validity_date}}</p>
<p><strong>To:</strong><br />{{candidate_name}}<br />{{candidate_address}}</p>

<p>Dear <strong>{{candidate_name}}</strong>,</p>

<p>We are delighted to offer you the position of <strong>{{designation}}</strong> in the <strong>{{department}}</strong> department at <strong>{{company_name}}</strong>. Your anticipated start date will be <strong>{{joining_date}}</strong>.</p>

<p><strong>Compensation & Terms:</strong></p>
<ul>
  <li><strong>Annual Salary:</strong> {{salary}}</li>
  <li><strong>Total Package (CTC):</strong> {{total_ctc}}</li>
  <li><strong>Work Location:</strong> {{location}}</li>
  <li><strong>Probation Period:</strong> {{probation_period}}</li>
  <li><strong>Notice Period:</strong> {{notice_period}}</li>
</ul>

<p>Sincerely,<br /><strong>{{signatory_name}}</strong><br />{{signatory_title}}</p>`
  );

  const [headerMarkup, setHeaderMarkup] = useState(
    template?.currentVersion?.headerMarkup ||
      `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #6366f1; padding-bottom:12px; margin-bottom:20px;">
  <h2 style="margin:0; font-size:18px; color:#1e1b4b;">{{company_name}}</h2>
  <span style="font-size:11px; font-weight:700; color:#4f46e5; text-transform:uppercase;">Official Offer of Employment</span>
</div>`
  );

  const [footerMarkup, setFooterMarkup] = useState(
    template?.currentVersion?.footerMarkup ||
      `<div style="border-top:1px solid #e5e7eb; padding-top:12px; margin-top:30px; font-size:11px; color:#9ca3af; display:flex; justify-content:space-between;">
  <span>{{company_name}} • Confidential</span>
  <span>Page 1 of 1</span>
</div>`
  );

  const [styleCss, setStyleCss] = useState(
    template?.currentVersion?.styleCss ||
      `body { font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; color: #1f2937; }
h1, h2, h3 { color: #111827; }
ul { padding-left: 20px; margin: 12px 0; }`
  );

  // Active Editor Sub-tab
  const [activeTab, setActiveTab] = useState<'body' | 'header' | 'footer' | 'css'>('body');

  // Modals state
  const [showPlaceholdersModal, setShowPlaceholdersModal] = useState(false);
  const [showAiPlaceholdersModal, setShowAiPlaceholdersModal] = useState(false);
  const [showAiWordingModal, setShowAiWordingModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Split view live preview toggle
  const [splitView, setSplitView] = useState(true);

  // Loading & Validation
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<PlaceholderValidationResult>({
    found: [],
    valid: [],
    unknown: [],
    missingRequired: [],
  });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Live validation on markup change
  useEffect(() => {
    const val = templateService.validatePlaceholders(contentMarkup);
    setValidation(val);
  }, [contentMarkup]);

  // Insert token at cursor position
  const handleInsertToken = (token: string) => {
    if (!textareaRef.current) {
      setContentMarkup((prev) => prev + ` ${token} `);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = contentMarkup;
    const newText = text.substring(0, start) + token + text.substring(end);
    setContentMarkup(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + token.length, start + token.length);
      }
    }, 50);
  };

  const handleInsertSnippet = (snippet: string) => {
    setContentMarkup((prev) => prev + '\n\n' + snippet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Template title is required', 'Validation Error');
      return;
    }
    if (!contentMarkup.trim()) {
      error('Template body markup cannot be empty', 'Validation Error');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && template) {
        const updateInput: UpdateTemplateInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          contentMarkup,
          headerMarkup: headerMarkup.trim() || undefined,
          footerMarkup: footerMarkup.trim() || undefined,
          styleCss: styleCss.trim() || undefined,
          changeSummary: changeSummary.trim() || 'Template modified via editor',
        };
        const updated = await templateService.updateTemplate(template.id, updateInput);
        success(`Template "${updated.title}" updated successfully.`);
        onSave(updated);
      } else {
        const createInput: CreateTemplateInput = {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          contentMarkup,
          headerMarkup: headerMarkup.trim() || undefined,
          footerMarkup: footerMarkup.trim() || undefined,
          styleCss: styleCss.trim() || undefined,
        };
        const created = await templateService.createTemplate(createInput);
        success(`Template "${created.title}" created successfully.`);
        onSave(created);
      }
    } catch (err: any) {
      error(err?.message || 'Failed to save template', 'Template Error');
    } finally {
      setSaving(false);
    }
  };

  // Rendered preview HTML for split view
  const renderedPreview = templateService.renderPreview(contentMarkup, SAMPLE_CANDIDATE_DATA);
  const renderedHeader = templateService.renderPreview(headerMarkup, SAMPLE_CANDIDATE_DATA);
  const renderedFooter = templateService.renderPreview(footerMarkup, SAMPLE_CANDIDATE_DATA);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Bar Navigation & Actions */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            style={{ padding: '6px 10px', fontSize: '0.8125rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Templates</span>
          </button>

          <div style={{ height: 20, width: 1, backgroundColor: 'var(--border-subtle)' }} />

          <div>
            <h3 style={{ fontSize: '1.15rem' }}>
              {isEditing ? `Edit: ${template?.title}` : 'Create New Offer Template'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {isEditing
                ? `Active Version v${template?.currentVersion?.versionNumber || 1} • Changes will generate v${(template?.currentVersion?.versionNumber || 1) + 1}`
                : 'Will initialize as Version 1 upon publishing'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSplitView(!splitView)}
            style={{ fontSize: '0.8125rem' }}
          >
            <Split size={15} />
            <span>{splitView ? 'Single Editor' : 'Side-by-Side'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowPreviewModal(true)}
            style={{ fontSize: '0.8125rem' }}
          >
            <Eye size={15} />
            <span>Full Preview</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            style={{ fontSize: '0.8125rem' }}
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : isEditing ? 'Save & Release Version' : 'Create Template'}</span>
          </button>
        </div>
      </div>

      {/* Template Metadata Header Form */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: isEditing ? '2fr 1.2fr 1.5fr 2fr' : '2fr 1.2fr 2.5fr',
          gap: 16,
          backgroundColor: '#ffffff',
        }}
      >
        <div>
          <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Template Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Standard Full-Time Offer Letter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Category</label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value as TemplateCategory)}
          >
            <option value="FULL_TIME">Full-Time Regular</option>
            <option value="PART_TIME">Part-Time</option>
            <option value="EXECUTIVE">Executive / Leadership</option>
            <option value="CONTRACT">Contractor / Consultant</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONSULTANT">Consultant</option>
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Description / Guidance</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. For general software and corporate employees"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {isEditing && (
          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
              Version Change Summary (v{(template?.currentVersion?.versionNumber || 1) + 1})
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Updated hybrid clause & bonus details"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Editor & Tools Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: splitView ? '1fr 1fr' : '1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Left Pane: Editor */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub-tab Navigation */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'body', label: 'Offer Body (HTML)' },
                { id: 'header', label: 'Header / Letterhead' },
                { id: 'footer', label: 'Footer & Disclaimer' },
                { id: 'css', label: 'Custom Styling (CSS)' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      color: isActive ? '#1d4ed8' : '#64748b',
                      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPlaceholdersModal(true)}
                style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#4f46e5' }}
                title="Browse variable placeholders catalog"
              >
                <BookOpen size={14} />
                <span>Tokens</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAiPlaceholdersModal(true)}
                style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#7c3aed' }}
                title="AI detects hardcoded names, salaries, roles and suggests tokens"
              >
                <Sparkles size={14} />
                <span>AI Scan</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAiWordingModal(true)}
                style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#7c3aed' }}
                title="Draft or elevate clauses using AI language assistant"
              >
                <Wand2 size={14} />
                <span>AI Drafter</span>
              </button>
            </div>
          </div>

          {/* Quick Insert Token Pills Bar */}
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
              Insert:
            </span>
            {[
              '{{candidate_name}}',
              '{{designation}}',
              '{{department}}',
              '{{salary}}',
              '{{total_ctc}}',
              '{{joining_date}}',
              '{{location}}',
              '{{reporting_manager}}',
              '{{probation_period}}',
              '{{notice_period}}',
              '{{offer_validity_date}}',
              '{{company_name}}',
            ].map((tok) => (
              <button
                key={tok}
                type="button"
                onClick={() => handleInsertToken(tok)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  color: '#4f46e5',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                title={`Click to insert ${tok} at cursor`}
              >
                + {tok}
              </button>
            ))}
          </div>

          {/* Textarea Workspace */}
          <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'body' && (
              <textarea
                ref={textareaRef}
                className="form-textarea"
                rows={22}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  width: '100%',
                  background: '#ffffff',
                  color: '#0f172a',
                }}
                value={contentMarkup}
                onChange={(e) => setContentMarkup(e.target.value)}
                placeholder="Enter HTML and {{placeholders}} for the main offer letter body..."
              />
            )}

            {activeTab === 'header' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Rendered at the top of the generated letterhead:
                </span>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: '#ffffff', color: '#0f172a' }}
                  value={headerMarkup}
                  onChange={(e) => setHeaderMarkup(e.target.value)}
                  placeholder="Enter header letterhead markup..."
                />
              </div>
            )}

            {activeTab === 'footer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Rendered at the bottom of the offer letter pages:
                </span>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: '#ffffff', color: '#0f172a' }}
                  value={footerMarkup}
                  onChange={(e) => setFooterMarkup(e.target.value)}
                  placeholder="Enter footer and disclaimer markup..."
                />
              </div>
            )}

            {activeTab === 'css' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Custom print and typography stylesheet rules:
                </span>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: '#ffffff', color: '#0f172a' }}
                  value={styleCss}
                  onChange={(e) => setStyleCss(e.target.value)}
                  placeholder="Enter custom CSS rules..."
                />
              </div>
            )}
          </div>

          {/* Real-Time Placeholder Validation Footer Indicator */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border-subtle)',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 600 }}>
                <CheckCircle2 size={14} color="#059669" />
                <span>{validation.valid.length} Tokens Active</span>
              </div>

              {validation.missingRequired.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontWeight: 500 }}>
                  <AlertTriangle size={14} color="#d97706" />
                  <span>Missing {validation.missingRequired.length} required: {validation.missingRequired.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPlaceholdersModal(true)}
              style={{ fontSize: '0.75rem', padding: '3px 10px' }}
            >
              Open Variable Registry
            </button>
          </div>
        </div>

        {/* Right Pane: Live Document Preview (when split view enabled) */}
        {splitView && (
          <div
            className="card"
            style={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f8fafc',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>Live Candidate Merged Preview</span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Sample: Jane Alexandra Doe ($165k)
              </span>
            </div>

            <div
              style={{
                padding: '24px 20px',
                overflowY: 'auto',
                maxHeight: '680px',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#f1f5f9',
              }}
            >
              {/* Paper Preview Sheet */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  padding: '36px 40px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '3px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {styleCss && <style>{styleCss}</style>}

                {/* Header */}
                {renderedHeader && (
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedHeader }}
                    style={{ marginBottom: 16 }}
                  />
                )}

                {/* Content */}
                <div dangerouslySetInnerHTML={{ __html: renderedPreview }} />

                {/* Footer */}
                {renderedFooter && (
                  <div
                    dangerouslySetInnerHTML={{ __html: renderedFooter }}
                    style={{ marginTop: 24 }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Modals */}
      <PlaceholderManagerModal
        isOpen={showPlaceholdersModal}
        onClose={() => setShowPlaceholdersModal(false)}
        onInsertToken={handleInsertToken}
      />

      <AiPlaceholderSuggestionsModal
        isOpen={showAiPlaceholdersModal}
        onClose={() => setShowAiPlaceholdersModal(false)}
        contentMarkup={contentMarkup}
        onApplyChanges={(updated) => setContentMarkup(updated)}
      />

      <AiWordingSuggestionsModal
        isOpen={showAiWordingModal}
        onClose={() => setShowAiWordingModal(false)}
        selectedText=""
        onApplyClause={(refined) => handleInsertSnippet(refined)}
      />

      <TemplatePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={template || null}
        customMarkup={contentMarkup}
        customHeader={headerMarkup}
        customFooter={footerMarkup}
        customCss={styleCss}
      />
    </div>
  );
};
