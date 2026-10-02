// =============================================================================
// DOCUMENT TEMPLATES LIBRARY PAGE (13 CATEGORIES + DOCX/PDF UPLOAD)
// =============================================================================
// Support preloaded company templates across all 13 categories,
// DOCX and PDF template upload with placeholder detection,
// and reusable placeholders mapping.
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Copy,
  Layers,
  Sparkles,
  Download,
  X,
} from 'lucide-react';
import { DocumentTemplateItem, EmployeeService } from '../services/employeeService.js';

export const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplateItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showPlaceholderGuide, setShowPlaceholderGuide] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmployeeService.listTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'ALL',
    'Offer Letter',
    'Internship Letter',
    'Employment Contract',
    'Increment Letter',
    'Experience Letter',
    'Relieving Letter',
    'Termination Letter',
    'Full and Final Settlement Statement',
    'Payslip',
    'Company Policies',
    'Service Agreement (MSA)',
    'Onboarding Forms',
    'Training Certificates',
  ];

  const standardPlaceholders = [
    { token: '{{employee_name}}', label: 'Employee Name', desc: 'Full legal name of the employee or recipient' },
    { token: '{{employee_id}}', label: 'Employee ID', desc: 'Unique corporate employee identification number' },
    { token: '{{designation}}', label: 'Designation', desc: 'Job title or professional rank' },
    { token: '{{department}}', label: 'Department', desc: 'Assigned business division or functional team' },
    { token: '{{joining_date}}', label: 'Joining Date', desc: 'Official date of employment commencement' },
    { token: '{{reporting_manager}}', label: 'Reporting Manager', desc: 'Direct supervisor name or title' },
    { token: '{{employment_type}}', label: 'Employment Type', desc: 'Full-time, Part-time, Contract, or Intern' },
    { token: '{{annual_ctc}}', label: 'Annual CTC', desc: 'Annualized cost-to-company salary figure' },
    { token: '{{company_name}}', label: 'Company Name', desc: 'Corporate legal entity name' },
    { token: '{{issue_date}}', label: 'Issue Date', desc: 'Date on which document is generated' },
    { token: '{{work_location}}', label: 'Work Location', desc: 'Office location or remote/hybrid arrangement' },
    { token: '{{official_email}}', label: 'Official Email', desc: 'Work email address' },
  ];

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    try {
      const res = await EmployeeService.uploadTemplate(uploadFile);
      setUploadResult(res);

      // Add uploaded template to active template list
      const customCode = `CUSTOM_${Date.now()}`;
      const newTemplate: DocumentTemplateItem = {
        code: customCode,
        category: res.suggestedCategory || 'Custom Template',
        name: uploadFile.name.replace(/\.[^/.]+$/, ''),
        description: `Uploaded from ${uploadFile.name} (${res.detectedFormat}). Original file preserved without overwriting.`,
        supportedFormats: res.detectedFormat === 'DOCX' ? ['DOCX', 'PDF'] : ['PDF'],
        defaultDocxAvailable: res.detectedFormat === 'DOCX',
        requiredEmployeePlaceholders: res.detectedPlaceholders || ['employee_name', 'employee_id'],
        docSpecificFields: [],
        contentMarkup: res.extractedContent,
      };

      setTemplates([newTemplate, ...templates]);
      setUploadFile(null);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
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
            <Layers size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Preloaded Document Template Library
            </h1>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
              13 standard company templates pre-configured with reusable placeholders. Upload DOCX or PDF templates anytime.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowPlaceholderGuide(!showPlaceholderGuide)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            <HelpCircle size={15} />
            <span>Placeholder Tags</span>
          </button>

          <button
            onClick={() => {
              setUploadResult(null);
              setIsUploadModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Upload size={15} />
            <span>Upload Template (DOCX / PDF)</span>
          </button>
        </div>
      </div>

      {/* Placeholders Quick Reference Guide Drawer */}
      {showPlaceholderGuide && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
              Standard Reusable Placeholders (Auto-Mapped to Employee Master Records)
            </div>
            <button
              onClick={() => setShowPlaceholderGuide(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 10,
            }}
          >
            {standardPlaceholders.map((p) => (
              <div
                key={p.token}
                onClick={() => copyToClipboard(p.token)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                title="Click to copy placeholder token"
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>
                    {p.token}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.label}</div>
                </div>
                <Copy size={13} style={{ color: '#94a3b8' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
          />
          <input
            type="text"
            placeholder="Search templates by title, keywords, or legal terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.85rem',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Category Horizontal Filter Pills */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 20 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: 20,
              border: '1px solid',
              borderColor: selectedCategory === cat ? '#2563eb' : '#e2e8f0',
              backgroundColor: selectedCategory === cat ? '#eff6ff' : '#ffffff',
              color: selectedCategory === cat ? '#1d4ed8' : '#475569',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.code}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '2px 8px',
                    borderRadius: 12,
                  }}
                >
                  {tpl.category}
                </span>

                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ fontSize: '0.625rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                    PDF
                  </span>
                  <span style={{ fontSize: '0.625rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                    DOCX
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {tpl.name}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.45, marginBottom: 14 }}>
                {tpl.description}
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {tpl.requiredEmployeePlaceholders?.length || 5} mapped placeholders
              </span>

              <button
                onClick={() => setPreviewTemplate(tpl)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <Eye size={13} />
                <span>View Markup</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* TEMPLATE MARKUP PREVIEW MODAL */}
      {previewTemplate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 820,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {previewTemplate.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Category: {previewTemplate.category} • Code: {previewTemplate.code}
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '20px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  color: '#1e293b',
                }}
              >
                {previewTemplate.contentMarkup}
              </div>
            </div>

            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setPreviewTemplate(null)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD TEMPLATE MODAL */}
      {isUploadModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 640,
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Upload size={18} style={{ color: '#2563eb' }} />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Upload Company Document Template
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Supports DOCX and PDF template formats
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <form onSubmit={handleUploadSubmit}>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: 12,
                    padding: '30px 20px',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Upload size={36} style={{ color: '#94a3b8', margin: '0 auto 10px auto' }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                    Select a .docx or .pdf template file
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4, marginBottom: 14 }}>
                    Placeholders like {'{{employee_name}}'} and {'{{designation}}'} will be automatically recognized.
                  </div>
                  <input
                    type="file"
                    accept=".docx,.pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    style={{ fontSize: '0.8125rem' }}
                  />
                </div>

                {uploadResult && (
                  <div
                    style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 8,
                      padding: 14,
                      marginBottom: 16,
                      fontSize: '0.8rem',
                      color: '#166534',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>
                      ✅ {uploadResult.message}
                    </div>
                    <div>Detected Format: <strong>{uploadResult.detectedFormat}</strong></div>
                    <div>Suggested Category: <strong>{uploadResult.suggestedCategory}</strong></div>
                    <div>
                      Detected Placeholders: <strong>{uploadResult.detectedPlaceholders?.join(', ') || 'Standard default'}</strong>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {uploadResult ? 'Done' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile || uploadLoading}
                    style={{
                      padding: '8px 18px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      opacity: !uploadFile || uploadLoading ? 0.6 : 1,
                    }}
                  >
                    {uploadLoading ? 'Uploading & Parsing...' : 'Upload & Add Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
