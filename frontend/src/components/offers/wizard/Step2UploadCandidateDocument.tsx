import React, { useState } from 'react';
import {
  Upload,
  FileText,
  FileCheck2,
  Sparkles,
  Clipboard,
  Check,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_RESUME_TEXT } from '../../../services/offerService.js';

interface Step2UploadCandidateDocumentProps {
  documentText: string;
  documentMeta: { name: string; sizeBytes: number; type: string } | null;
  onUpdateDocument: (text: string, meta: { name: string; sizeBytes: number; type: string } | null) => void;
}

export const Step2UploadCandidateDocument: React.FC<Step2UploadCandidateDocumentProps> = ({
  documentText,
  documentMeta,
  onUpdateDocument,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>(
    documentMeta ? 'upload' : 'upload'
  );
  const [pastedContent, setPastedContent] = useState(documentText || '');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    const meta = {
      name: file.name,
      sizeBytes: file.size,
      type: file.type || 'text/plain',
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      onUpdateDocument(text, meta);
      setPastedContent(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setPastedContent(SAMPLE_RESUME_TEXT);
    onUpdateDocument(SAMPLE_RESUME_TEXT, {
      name: 'Jane_Alexandra_Doe_Staff_Architect_Resume.pdf',
      sizeBytes: 42180,
      type: 'application/pdf',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
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
              2
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Upload Candidate Document</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
            Provide candidate resume, CV, or interview evaluation notes. AI will extract structured fields in Step 3.
          </p>
        </div>

        {/* Quick Demo Preload CTA */}
        <button
          type="button"
          className="btn btn-ai"
          onClick={handleLoadSample}
          style={{ fontSize: '0.8125rem', padding: '8px 14px' }}
        >
          <Sparkles size={14} />
          <span>Quick Load Sample Resume</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
        <button
          type="button"
          onClick={() => setActiveInputMode('upload')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeInputMode === 'upload' ? 'var(--primary)' : '#f1f5f9',
            color: activeInputMode === 'upload' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          File Upload (PDF / DOCX / TXT)
        </button>
        <button
          type="button"
          onClick={() => setActiveInputMode('paste')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeInputMode === 'paste' ? 'var(--primary)' : '#f1f5f9',
            color: activeInputMode === 'paste' ? '#ffffff' : '#475569',
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}
        >
          Paste Raw Text
        </button>
      </div>

      {/* File Upload Mode */}
      {activeInputMode === 'upload' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              border: `2px dashed ${dragActive ? 'var(--primary)' : '#cbd5e1'}`,
              backgroundColor: dragActive ? '#eff6ff' : '#ffffff',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => document.getElementById('resume-file-input')?.click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Upload size={24} color="var(--primary)" />
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
              Drag & Drop Candidate Resume or Click to Browse
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: 4 }}>
              Supports PDF, DOCX, or plain text up to 15MB. Encrypted locally and processed under strict tenant data isolation.
            </p>
          </div>

          {/* Uploaded File Badge Banner */}
          {documentMeta && (
            <div
              className="animate-fade-in"
              style={{
                padding: '12px 18px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileCheck2 size={20} color="#059669" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    {documentMeta.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {(documentMeta.sizeBytes / 1024).toFixed(1)} KB • Text extracted and ready for AI analysis
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: '#d1fae5',
                  color: '#065f46',
                  textTransform: 'uppercase',
                }}
              >
                Ready for Extraction
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Paste Mode */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea
            className="form-textarea"
            rows={14}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid var(--border-medium)',
            }}
            placeholder="Paste raw resume, CV, or interview feedback text here..."
            value={pastedContent}
            onChange={(e) => {
              setPastedContent(e.target.value);
              onUpdateDocument(e.target.value, {
                name: 'Pasted_Candidate_Profile.txt',
                sizeBytes: e.target.value.length,
                type: 'text/plain',
              });
            }}
          />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Characters: {pastedContent.length} • Words: {pastedContent.trim() ? pastedContent.trim().split(/\s+/).length : 0}
          </span>
        </div>
      )}
    </div>
  );
};
