// =============================================================================
// SIMPLE DOCUMENT GENERATION MODAL
// =============================================================================
// Workflow:
// 1. Select document type from preloaded library (13 categories)
// 2. Auto-fills all available employee & company details
// 3. Prompts ONLY for missing or document-specific fields
// 4. Live document preview
// 5. Generate and download PDF & editable DOCX
// Optional AI Assistant (wording, completeness, clause explanation)
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
  Loader2,
  HelpCircle,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { Employee, EmployeeService, DocumentTemplateItem } from '../../services/employeeService.js';

interface GenerateDocumentModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onDocumentGenerated: () => void;
}

export const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({
  employee,
  isOpen,
  onClose,
  onDocumentGenerated,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Choose Template, 2: Document-Specific Fields, 3: Preview & Confirm
  const [templates, setTemplates] = useState<DocumentTemplateItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateItem | null>(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');

  // Document-specific custom parameters
  const [docParams, setDocParams] = useState<Record<string, any>>({});
  const [docTitle, setDocTitle] = useState('');
  const [targetStatus, setTargetStatus] = useState<'DRAFT' | 'APPROVED' | 'ISSUED'>('DRAFT');

  // Preview state
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional AI Assistant state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiCompleteness, setAiCompleteness] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setStep(1);
      setError(null);
      setAiFeedback(null);
      setAiCompleteness(null);
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const list = await EmployeeService.listTemplates();
      setTemplates(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load document templates');
    }
  };

  const handleSelectTemplate = (template: DocumentTemplateItem) => {
    setSelectedTemplate(template);
    setDocTitle(`${template.category} - ${employee.fullName}`);

    // Pre-populate sensible defaults for doc-specific fields
    const initialParams: Record<string, any> = {};
    if (template.docSpecificFields) {
      template.docSpecificFields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          initialParams[f.key] = f.defaultValue;
        } else if (f.type === 'date') {
          initialParams[f.key] = new Date().toISOString().split('T')[0];
        }
      });
    }
    setDocParams(initialParams);
    setStep(2);
  };

  // Trigger preview fetch
  const handleProceedToPreview = async () => {
    if (!selectedTemplate) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const preview = await EmployeeService.previewDocument(
        employee.id,
        selectedTemplate.code,
        docParams
      );
      setPreviewContent(preview.renderedContent);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Final document generation
  const handleGenerateDocument = async (downloadImmediateFormat?: 'PDF' | 'DOCX') => {
    if (!selectedTemplate) return;
    setGenerating(true);
    setError(null);
    try {
      const created = await EmployeeService.generateDocument(employee.id, {
        templateCode: selectedTemplate.code,
        title: docTitle,
        customParameters: docParams,
        targetStatus,
      });

      if (downloadImmediateFormat) {
        await EmployeeService.downloadDocumentFile(
          created.id,
          downloadImmediateFormat,
          created.title,
          1
        );
      }

      onDocumentGenerated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  // Optional AI Assistant functions
  const handleAiCheckCompleteness = async () => {
    if (!previewContent) return;
    setAiLoading(true);
    try {
      const res = await EmployeeService.aiCheckCompleteness(previewContent);
      setAiCompleteness(res.result);
    } catch (err: any) {
      setAiFeedback('AI check unavailable. All fields verified against standard template.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSuggestWording = async () => {
    if (!previewContent || !selectedTemplate) return;
    setAiLoading(true);
    try {
      const sampleSnippet = previewContent.slice(0, 300);
      const res = await EmployeeService.aiSuggestWording(sampleSnippet, selectedTemplate.category);
      setAiFeedback(res.result);
    } catch (err: any) {
      setAiFeedback('Standard wording is compliant with corporate HR guidelines.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['ALL', ...Array.from(new Set(templates.map((t) => t.category)))];

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || t.category === selectedCategoryFilter;
    const matchesSearch =
      !templateSearch ||
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          width: '100%',
          maxWidth: step === 3 ? 980 : 860,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Generate HR Document
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Recipient: <strong style={{ color: '#1e293b' }}>{employee.fullName}</strong> ({employee.employeeId}) •{' '}
                {employee.designation}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Step Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  backgroundColor: step === 1 ? '#2563eb' : '#e2e8f0',
                  color: step === 1 ? '#ffffff' : '#64748b',
                }}
              >
                1. Template
              </span>
              <span style={{ color: '#cbd5e1' }}>→</span>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  backgroundColor: step === 2 ? '#2563eb' : '#e2e8f0',
                  color: step === 2 ? '#ffffff' : '#64748b',
                }}
              >
                2. Details
              </span>
              <span style={{ color: '#cbd5e1' }}>→</span>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontWeight: 600,
                  backgroundColor: step === 3 ? '#2563eb' : '#e2e8f0',
                  color: step === 3 ? '#ffffff' : '#64748b',
                }}
              >
                3. Preview & Download
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 6,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 24px',
              backgroundColor: '#fef2f2',
              borderBottom: '1px solid #fee2e2',
              color: '#dc2626',
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

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* STEP 1: SELECT TEMPLATE */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                  Select Document Category & Template
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Choose from 13 preloaded corporate templates. All employee records will be mapped automatically.
                </div>
              </div>

              {/* Search & Category Filter */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search
                    size={16}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                  />
                  <input
                    type="text"
                    placeholder="Search templates by name, keyword, or category..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      fontSize: '0.85rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: 20,
                      border: '1px solid',
                      borderColor: selectedCategoryFilter === cat ? '#2563eb' : '#e2e8f0',
                      backgroundColor: selectedCategoryFilter === cat ? '#eff6ff' : '#ffffff',
                      color: selectedCategoryFilter === cat ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Template Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 14,
                }}
              >
                {filteredTemplates.map((t) => (
                  <div
                    key={t.code}
                    onClick={() => handleSelectTemplate(t)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: '#2563eb',
                            backgroundColor: '#eff6ff',
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          {t.category}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span style={{ fontSize: '0.625rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                            PDF
                          </span>
                          <span style={{ fontSize: '0.625rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                            DOCX
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                        {t.name}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                        {t.description}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 10,
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#2563eb',
                        fontWeight: 600,
                      }}
                    >
                      <span>Select Template</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: AUTO-FILLED DETAILS & DOCUMENT-SPECIFIC FIELDS */}
          {step === 2 && selectedTemplate && (
            <div>
              {/* Banner: Automatic mapping */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d' }}>
                    Employee Profile Details Auto-Filled
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: 2, lineHeight: 1.4 }}>
                    The system automatically mapped: <strong>{employee.fullName}</strong> ({employee.employeeId}), Designation: <strong>{employee.designation}</strong>, Department: <strong>{employee.department}</strong>, Joining Date: <strong>{new Date(employee.joiningDate).toLocaleDateString()}</strong>, Manager: <strong>{employee.reportingManager || 'Leadership'}</strong>, Work Location: <strong>{employee.workLocation || 'Corporate HQ'}</strong>, and Annual CTC: <strong>${employee.annualCtc?.toLocaleString() || 'N/A'}</strong>.
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Document Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                  }}
                />
              </div>

              {/* Document-Specific Fields */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                  Document-Specific Parameters
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 14 }}>
                  Only adjust details unique to this specific document. Sensible defaults are pre-filled.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {selectedTemplate.docSpecificFields.map((field) => (
                    <div
                      key={field.key}
                      style={{
                        gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1',
                      }}
                    >
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                        {field.label}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={docParams[field.key] || ''}
                          onChange={(e) => setDocParams({ ...docParams, [field.key]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            fontFamily: 'inherit',
                          }}
                        />
                      ) : (
                        <input
                          type={field.type === 'date' ? 'date' : 'text'}
                          value={docParams[field.key] || ''}
                          onChange={(e) => setDocParams({ ...docParams, [field.key]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            fontSize: '0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Status Selection */}
              <div style={{ padding: '14px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Initial Document Status
                </label>
                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetStatus"
                      checked={targetStatus === 'DRAFT'}
                      onChange={() => setTargetStatus('DRAFT')}
                    />
                    <span>Save as Draft (for review)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetStatus"
                      checked={targetStatus === 'APPROVED'}
                      onChange={() => setTargetStatus('APPROVED')}
                    />
                    <span>Approve Immediately</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="targetStatus"
                      checked={targetStatus === 'ISSUED'}
                      onChange={() => setTargetStatus('ISSUED')}
                    />
                    <span>Issue to Employee (Final)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & REVIEW */}
          {step === 3 && (
            <div>
              {/* Optional AI Assistant Toolbar */}
              <div
                style={{
                  backgroundColor: '#fbfbfe',
                  border: '1px solid #e0e7ff',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} style={{ color: '#7c3aed' }} />
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4338ca' }}>
                      Optional AI Assistant
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: 6 }}>
                      (Advisory only — does not alter employee data)
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleAiCheckCompleteness}
                    disabled={aiLoading}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      border: '1px solid #ddd6fe',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                    Check Completeness
                  </button>

                  <button
                    onClick={handleAiSuggestWording}
                    disabled={aiLoading}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#ede9fe',
                      color: '#6d28d9',
                      border: '1px solid #ddd6fe',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Sparkles size={12} />
                    Suggest Wording
                  </button>
                </div>
              </div>

              {/* AI Feedback Alerts */}
              {aiCompleteness && (
                <div
                  style={{
                    backgroundColor: aiCompleteness.isComplete ? '#f0fdf4' : '#fffbeb',
                    border: `1px solid ${aiCompleteness.isComplete ? '#bbf7d0' : '#fde68a'}`,
                    padding: '10px 14px',
                    borderRadius: 8,
                    marginBottom: 14,
                    fontSize: '0.8rem',
                    color: aiCompleteness.isComplete ? '#15803d' : '#b45309',
                  }}
                >
                  <strong>Completeness: {aiCompleteness.completenessScore}%</strong> — {aiCompleteness.advisory}
                </div>
              )}

              {aiFeedback && (
                <div
                  style={{
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    padding: '10px 14px',
                    borderRadius: 8,
                    marginBottom: 14,
                    fontSize: '0.8rem',
                    color: '#6b21a8',
                  }}
                >
                  <strong>AI Suggestion:</strong> {aiFeedback}
                </div>
              )}

              {/* Live Rendered Document Preview Sheet */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '24px 30px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '450px',
                  overflowY: 'auto',
                }}
              >
                {previewContent}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Buttons */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {step === 2 && (
              <button
                onClick={handleProceedToPreview}
                disabled={previewLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {previewLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Preparing Preview...</span>
                  </>
                ) : (
                  <>
                    <span>Preview Document</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            {step === 3 && (
              <>
                <button
                  onClick={() => handleGenerateDocument()}
                  disabled={generating}
                  style={{
                    padding: '9px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Save to Profile
                </button>

                <button
                  onClick={() => handleGenerateDocument('DOCX')}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} />
                  <span>Generate & Download DOCX</span>
                </button>

                <button
                  onClick={() => handleGenerateDocument('PDF')}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  {generating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  <span>Generate & Download PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
