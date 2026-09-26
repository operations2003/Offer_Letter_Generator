import React, { useState } from 'react';
import { Copy, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { OfferTemplate } from '../../types/template.js';
import { templateService } from '../../services/templateService.js';

interface TemplateDuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: OfferTemplate | null;
  onSuccess: (duplicatedTemplate: OfferTemplate) => void;
}

export const TemplateDuplicateModal: React.FC<TemplateDuplicateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (template) {
      setTitle(`Copy of ${template.title}`);
      setError(null);
    }
  }, [template, isOpen]);

  if (!template) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for the duplicated template.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const duplicated = await templateService.duplicateTemplate(template.id, title.trim());
      onSuccess(duplicated);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to duplicate template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Template"
      subtitle={`Create an independent clone of "${template.title}"`}
      maxWidth="540px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
          >
            {loading ? 'Cloning...' : 'Duplicate Template'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-panel" style={{ padding: 14, background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Source Information
          </div>
          <div style={{ fontWeight: 600, color: '#fff', marginTop: 4 }}>{template.title}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Category: {template.category} • Current Version: v{template.currentVersion?.versionNumber || 1}
          </div>
        </div>

        <div>
          <label className="form-label">New Template Title *</label>
          <input
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Copy of Senior Engineering Offer"
            required
            autoFocus
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            The duplicated template will be initialized at Version 1 with all body, header, footer, and styling markup preserved.
          </p>
        </div>
      </form>
    </Modal>
  );
};
