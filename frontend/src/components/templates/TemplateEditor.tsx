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
      alert('Template title is required');
      return;
    }
    if (!contentMarkup.trim()) {
      alert('Template body markup cannot be empty');
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
        onSave(created);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to save template');
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
        className="glass-panel"
        style={{
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: isEditing ? '2fr 1.2fr 1.5fr 2fr' : '2fr 1.2fr 2.5fr',
          gap: 16,
          backgroundColor: 'var(--bg-tertiary)',
        }}
      >
        <div>
          <label className="form-label">Template Title *</label>
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
          <label className="form-label">Category</label>
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
          <label className="form-label">Description / Guidance</label>
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
            <label className="form-label">
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
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub-tab Navigation */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-secondary)',
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
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? 'var(--bg-tertiary)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Action Tools */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowPlaceholdersModal(true)}
                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#818cf8' }}
                title="Browse variable placeholders catalog"
              >
                <BookOpen size={14} />
                <span>Tokens</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAiPlaceholdersModal(true)}
                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#c084fc' }}
                title="AI detects hardcoded names, salaries, roles and suggests tokens"
              >
                <Sparkles size={14} />
                <span>AI Scan</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAiWordingModal(true)}
                style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#a855f7' }}
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
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
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
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: '#818cf8',
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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
                  background: 'var(--bg-primary)',
                  color: 'var(--text-main)',
                }}
                value={contentMarkup}
                onChange={(e) => setContentMarkup(e.target.value)}
                placeholder="Enter HTML and {{placeholders}} for the main offer letter body..."
              />
            )}

            {activeTab === 'header' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Rendered at the top of the generated letterhead:
                </span>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: 'var(--bg-primary)' }}
                  value={headerMarkup}
                  onChange={(e) => setHeaderMarkup(e.target.value)}
                  placeholder="Enter header letterhead markup..."
                />
              </div>
            )}

            {activeTab === 'footer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Rendered at the bottom of the offer letter pages:
                </span>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: 'var(--bg-primary)' }}
                  value={footerMarkup}
                  onChange={(e) => setFooterMarkup(e.target.value)}
                  placeholder="Enter footer and disclaimer markup..."
                />
              </div>
            )}

            {activeTab === 'css' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Custom print and typography stylesheet rules:
                </span>
                <textarea
                  className="form-textarea"
                  rows={14}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', background: 'var(--bg-primary)' }}
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
              background: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)' }}>
                <CheckCircle2 size={14} />
                <span>{validation.valid.length} Tokens Active</span>
              </div>

              {validation.missingRequired.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
                  <AlertTriangle size={14} />
                  <span>Missing {validation.missingRequired.length} required: {validation.missingRequired.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowPlaceholdersModal(true)}
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            >
              Open Variable Registry
            </button>
          </div>
        </div>

        {/* Right Pane: Live Document Preview (when split view enabled) */}
        {splitView && (
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0a0d16',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Live Candidate Merged Preview</span>
              </div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
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
                backgroundColor: '#070a12',
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
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  borderRadius: '2px',
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
