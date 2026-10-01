import React, { useState } from 'react';
import {
  FileCode,
  CheckCircle2,
  Eye,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { DocumentTypeDefinition, DocumentPlaceholderDefinition } from '../../types/document-engine.js';
import { DocumentTemplateItem, DOCUMENT_TEMPLATES_CATALOG } from '../../services/documentTemplateCatalog.js';

interface DocumentTemplateSelectorProps {
  typeDef: DocumentTypeDefinition;
  selectedTemplate: DocumentTemplateItem | null;
  onSelectTemplate: (template: DocumentTemplateItem) => void;
}

export const DocumentTemplateSelector: React.FC<DocumentTemplateSelectorProps> = ({
  typeDef,
  selectedTemplate,
  onSelectTemplate,
}) => {
  const templates = DOCUMENT_TEMPLATES_CATALOG[typeDef.code] || [];
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplateItem>(
    selectedTemplate || templates[0] || null
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Template List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
            Available Templates ({templates.length})
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Choose an authorized template for <strong>{typeDef.name}</strong>.
          </p>
        </div>

        {templates.map((tmpl) => {
          const isSelected = selectedTemplate?.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl);
                setPreviewTemplate(tmpl);
              }}
              className="glass-panel"
              style={{
                padding: 16,
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                border: isSelected
                  ? '2px solid var(--primary)'
                  : '1px solid var(--border-subtle)',
                background: isSelected ? '#eff6ff' : 'var(--bg-surface, #ffffff)',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCode size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main, #0f172a)' }}>
                    {tmpl.name}
                  </span>
                </div>
                {isSelected ? (
                  <CheckCircle2 size={18} color="var(--primary)" />
                ) : (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {tmpl.version}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                {tmpl.description}
              </p>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Category: {tmpl.category}
                </span>
                {tmpl.isDefault && (
                  <span className="hr-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    Standard
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Placeholders Specification */}
        <div
          className="glass-panel"
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary, #f8fafc)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Layers size={16} color="var(--ai-purple)" />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
              Dynamic Template Placeholders ({typeDef.placeholders?.length || 0})
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            These tokens will automatically map to HR-confirmed values during PDF compilation:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {typeDef.placeholders?.map((p) => (
              <span
                key={p.tag}
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface, #ffffff)',
                  border: '1px solid var(--border-subtle, #e2e8f0)',
                  color: p.isRequired ? 'var(--ai-purple, #7c3aed)' : 'var(--text-muted)',
                }}
                title={`${p.description} (e.g. ${p.sampleValue})`}
              >
                {p.tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Template Preview Panel */}
      <div
        className="glass-panel"
        style={{
          padding: 20,
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 560,
          background: 'var(--bg-surface, #ffffff)',
          border: '1px solid var(--border-subtle, #e2e8f0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            paddingBottom: 10,
            borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>
              Template Content Preview
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {previewTemplate?.version}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            color: 'var(--text-main, #0f172a)',
            backgroundColor: '#f8fafc',
            padding: 16,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
          }}
        >
          {previewTemplate?.content || 'No template selected.'}
        </div>
      </div>
    </div>
  );
};
