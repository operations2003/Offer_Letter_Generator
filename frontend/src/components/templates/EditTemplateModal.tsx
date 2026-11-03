import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Save,
  X,
  Sparkles,
  Tag,
  AlertCircle,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';

export interface TemplateEditData {
  id?: string;
  title: string;
  category: string;
  categoryGroup?: string;
  badge?: string;
  description?: string;
  blueprintContent: string;
  fileName?: string;
  isCertificate?: boolean;
  sampleData?: Record<string, string>;
  isCustomUploaded?: boolean;
}

interface EditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateEditData | null;
  onSave: (saved: TemplateEditData) => void;
  onSaveAndUse?: (saved: TemplateEditData) => void;
}

const COMMON_PLACEHOLDERS = [
  '{{candidate_name}}',
  '{{company_name}}',
  '{{job_title}}',
  '{{department}}',
  '{{joining_date}}',
  '{{work_location}}',
  '{{annual_ctc}}',
  '{{reference_number}}',
  '{{issue_date}}',
  '{{signatory_name}}',
  '{{signatory_title}}',
];

export const EditTemplateModal: React.FC<EditTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
  onSaveAndUse,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Offer Letter');
  const [badge, setBadge] = useState('Custom Template');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isCertificate, setIsCertificate] = useState(false);
  const [detectedTokens, setDetectedTokens] = useState<string[]>([]);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template && isOpen) {
      setTitle(template.title || '');
      setCategory(template.category || 'Offer Letter');
      setBadge(template.badge || (template.isCustomUploaded ? 'Uploaded Template' : 'Custom'));
      setDescription(template.description || '');
      setContent(template.blueprintContent || '');
      setIsCertificate(Boolean(template.isCertificate));
    }
  }, [template, isOpen]);

  // Extract tokens from content
  useEffect(() => {
    const tokens = new Set<string>();
    const regexCurly = /\{\{\s*([a-zA-Z0-9_\s]+)\s*\}\}/g;
    let match;
    while ((match = regexCurly.exec(content)) !== null) {
      tokens.add(match[1].trim());
    }
    const regexSquare = /\[\s*([a-zA-Z0-9_\s]{2,40})\s*\]/g;
    while ((match = regexSquare.exec(content)) !== null) {
      tokens.add(match[1].trim());
    }
    setDetectedTokens(Array.from(tokens));
  }, [content]);

  if (!isOpen || !template) return null;

  const handleInsertPlaceholder = (placeholder: string) => {
    if (!contentTextareaRef.current) return;
    const textarea = contentTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    const updated = before + placeholder + after;
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const handleSubmit = (useInGenerator: boolean = false) => {
    if (!title.trim()) {
      alert('Please enter a template title.');
      return;
    }
    if (!content.trim()) {
      alert('Template content cannot be empty.');
      return;
    }

    const updatedData: TemplateEditData = {
      ...template,
      title: title.trim(),
      category: category.trim(),
      badge: badge.trim(),
      description: description.trim(),
      blueprintContent: content,
      isCertificate,
    };

    if (useInGenerator && onSaveAndUse) {
      onSaveAndUse(updatedData);
    } else {
      onSave(updatedData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Template"
      subtitle={`Modify template details, placeholders, and structure for "${template.title}"`}
      maxWidth="780px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 10 }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {detectedTokens.length} dynamic variable{detectedTokens.length === 1 ? '' : 's'} detected
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={onClose} style={{ fontSize: '0.85rem' }}>
              Cancel
            </Button>
            {onSaveAndUse && (
              <Button
                variant="secondary"
                icon={<Sparkles size={14} />}
                onClick={() => handleSubmit(true)}
                style={{ fontSize: '0.85rem', color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
              >
                Save &amp; Use in Generator
              </Button>
            )}
            <Button
              variant="primary"
              icon={<Save size={15} />}
              onClick={() => handleSubmit(false)}
              style={{ fontSize: '0.85rem', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Title and Category Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Template Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer Offer Letter"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Offer Letter, Certificate, Policy"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Badge & Description */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Badge / Format Tag
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Uploaded, Corporate, Verified"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or applicability"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Certificate Layout Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <input
            type="checkbox"
            id="modal-is-certificate-check"
            checked={isCertificate}
            onChange={(e) => setIsCertificate(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="modal-is-certificate-check" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={15} color="#2563eb" />
            Format as Certificate (landscape certificate framing with official seal layout)
          </label>
        </div>

        {/* Placeholders Quick-Insert Toolbar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
              Template Content &amp; Markup <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Click to insert dynamic variable at cursor:
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {COMMON_PLACEHOLDERS.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => handleInsertPlaceholder(token)}
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
              >
                + {token}
              </button>
            ))}
          </div>

          <textarea
            ref={contentTextareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            placeholder="Paste or write your template content here with {{variables}}..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.82rem',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

