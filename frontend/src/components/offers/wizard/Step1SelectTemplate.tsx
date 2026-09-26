import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { OfferTemplate, TemplateCategory } from '../../../types/template.js';
import { templateService } from '../../../services/templateService.js';
import { TemplatePreviewModal } from '../../templates/TemplatePreviewModal.js';

interface Step1SelectTemplateProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (template: OfferTemplate) => void;
}

export const Step1SelectTemplate: React.FC<Step1SelectTemplateProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<OfferTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates({ isActive: true });
      setTemplates(data);
      // Auto-select first template if none selected
      if (!selectedTemplateId && data.length > 0) {
        onSelectTemplate(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Templates' },
    { id: 'FULL_TIME', label: 'Full-Time Regular' },
    { id: 'EXECUTIVE', label: 'Executive' },
    { id: 'CONTRACT', label: 'Contractor' },
    { id: 'INTERNSHIP', label: 'Internship' },
  ];

  const filtered = templates.filter(
    (t) => filterCategory === 'ALL' || t.category === filterCategory
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
            }}
          >
            1
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Select Base Offer Template</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Choose an approved corporate offer letter blueprint. The template defines legal covenants, letterhead structure, and placeholder variables.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilterCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: filterCategory === cat.id ? 'var(--primary)' : 'var(--border-subtle)',
              backgroundColor: filterCategory === cat.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
              color: filterCategory === cat.id ? '#818cf8' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div
            className="spinner"
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading active templates...</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className="glass-panel"
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 20px var(--primary-glow)' : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tpl.category.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-dim)',
                        }}
                      >
                        v{tpl.currentVersion?.versionNumber || 1}
                      </span>
                    </div>

                    {isSelected && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--success)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 6 }}>{tpl.title}</h4>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {tpl.description || 'Standard legally verified offer letter blueprint.'}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {tpl.currentVersion?.placeholdersSchema?.length || 8} dynamic tokens
                  </span>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(tpl);
                    }}
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />
    </div>
  );
};
