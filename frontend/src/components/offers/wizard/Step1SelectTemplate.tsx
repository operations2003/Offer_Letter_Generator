import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Eye,
  Sparkles,
  Layers,
  ArrowRight,
  Upload,
  Check,
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
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates({ isActive: true });
      setTemplates(data);
      if (!selectedTemplateId && data.length > 0) {
        onSelectTemplate(data[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTemplateUpload = (file: File) => {
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const customTemplate: OfferTemplate = {
        id: `uploaded_${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        description: `Uploaded custom template file: ${file.name}`,
        category: 'FULL_TIME',
        isActive: true,
        companyId: 'comp_default',
        createdBy: 'usr_hr',
        currentVersion: {
          id: `ver_${Date.now()}`,
          templateId: `uploaded_${Date.now()}`,
          versionNumber: 1,
          contentMarkup: content || '<p>Uploaded template</p>',
          headerMarkup: '',
          footerMarkup: '',
          styleCss: '',
          placeholdersSchema: ['candidate_name', 'designation', 'salary', 'joining_date'],
          changeSummary: 'Uploaded via template file',
          isPublished: true,
          createdBy: 'usr_hr',
          creator: { id: 'usr_hr', firstName: 'HR', lastName: 'Operations', email: 'hr@acme.com' },
          createdAt: new Date().toISOString(),
        },
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTemplates((prev) => [customTemplate, ...prev]);
      onSelectTemplate(customTemplate);
    };
    reader.readAsText(file);
  };

  const availableCategories = Array.from(new Set(templates.map((t) => t.category)));
  const categories = [
    { id: 'ALL', label: 'All Templates' },
    ...availableCategories.map((c) => ({
      id: c,
      label: c === 'FULL_TIME' ? 'Full-Time Regular' : c.replace(/_/g, ' '),
    })),
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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Upload or Select Document Template
          </h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Upload your custom Word, PDF, or text template, or choose an approved company blueprint below.
        </p>
      </div>

      {/* Upload Custom Template Box */}
      <div
        style={{
          padding: '24px 20px',
          border: dragActive ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
          background: dragActive ? '#eff6ff' : uploadedFileName ? '#f0fdf4' : '#f8fafc',
          borderRadius: 12,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
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
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleCustomTemplateUpload(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => document.getElementById('wizard-template-file-input')?.click()}
      >
        <input
          id="wizard-template-file-input"
          type="file"
          accept=".docx,.pdf,.txt,.html,.md"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleCustomTemplateUpload(e.target.files[0]);
            }
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: uploadedFileName ? '#dcfce7' : '#eff6ff',
              color: uploadedFileName ? '#16a34a' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {uploadedFileName ? <Check size={20} /> : <Upload size={20} />}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0f172a' }}>
              {uploadedFileName ? `Custom Template Loaded: ${uploadedFileName}` : 'Upload Template File (.docx, .pdf, .txt)'}
            </div>
            <div style={{ fontSize: '0.78125rem', color: '#64748b' }}>
              {uploadedFileName ? 'Active template loaded and ready for variable extraction' : 'Drag and drop your template file here or click to browse'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
          Or Select an Approved Company Blueprint
        </span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
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
              backgroundColor: filterCategory === cat.id ? 'var(--primary)' : '#ffffff',
              color: filterCategory === cat.id ? '#ffffff' : '#475569',
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
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Loading active templates...</p>
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
                style={{
                  padding: 20,
                  cursor: 'pointer',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2), var(--shadow-md)' : 'var(--shadow-sm)',
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
                          background: '#e0e7ff',
                          color: '#4338ca',
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
                          color: '#64748b',
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
                          color: '#059669',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Selected</span>
                      </span>
                    )}
                  </div>

                  <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700, marginBottom: 6 }}>{tpl.title}</h4>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#64748b',
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
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
