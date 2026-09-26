import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
  Sliders,
  Check,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { OfferTemplate } from '../../types/template.js';
import { templateService, SAMPLE_CANDIDATE_DATA } from '../../services/templateService.js';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: OfferTemplate | null;
  customMarkup?: string;
  customHeader?: string | null;
  customFooter?: string | null;
  customCss?: string | null;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  customMarkup,
  customHeader,
  customFooter,
  customCss,
}) => {
  const [useSampleData, setUseSampleData] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [candidateData, setCandidateData] = useState<Record<string, string>>({ ...SAMPLE_CANDIDATE_DATA });
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!template) return null;

  const markup = customMarkup !== undefined ? customMarkup : template.currentVersion?.contentMarkup || '';
  const header = customHeader !== undefined ? customHeader : template.currentVersion?.headerMarkup || '';
  const footer = customFooter !== undefined ? customFooter : template.currentVersion?.footerMarkup || '';
  const css = customCss !== undefined ? customCss : template.currentVersion?.styleCss || '';

  // Render text based on sample toggle
  const renderedContent = useSampleData
    ? templateService.renderPreview(markup, candidateData)
    : markup.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, '<span class="token-pill">{{$1}}</span>');

  const renderedHeader = useSampleData
    ? templateService.renderPreview(header || '', candidateData)
    : header || '';

  const renderedFooter = useSampleData
    ? templateService.renderPreview(footer || '', candidateData)
    : footer || '';

  const handlePrint = () => {
    window.print();
  };

  const handleDataChange = (key: string, value: string) => {
    setCandidateData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${template.title}`}
      subtitle={`Category: ${template.category} • Version ${template.currentVersion?.versionNumber || 1}`}
      maxWidth="940px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setUseSampleData(!useSampleData)}
              style={{ fontSize: '0.8125rem' }}
            >
              {useSampleData ? <ToggleRight size={18} color="var(--primary)" /> : <ToggleLeft size={18} />}
              <span>{useSampleData ? 'Populated Sample Data' : 'Raw {{placeholders}}'}</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowCustomize(!showCustomize)}
              style={{ fontSize: '0.8125rem' }}
            >
              <Sliders size={14} />
              <span>{showCustomize ? 'Hide Data Editor' : 'Customize Sample Data'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrint}
              style={{ fontSize: '0.8125rem' }}
            >
              <Printer size={15} />
              <span>Print Document</span>
            </button>
            <button type="button" className="btn btn-primary" onClick={onClose} style={{ fontSize: '0.8125rem' }}>
              Done
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Customize Sample Data Drawer (Expandable) */}
        {showCustomize && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: 16,
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
            }}
          >
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Candidate Name</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                value={candidateData.candidate_name || ''}
                onChange={(e) => handleDataChange('candidate_name', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Designation / Title</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                value={candidateData.designation || ''}
                onChange={(e) => handleDataChange('designation', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Annual Salary</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                value={candidateData.salary || ''}
                onChange={(e) => handleDataChange('salary', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Joining Date</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '0.8125rem', padding: '6px 10px' }}
                value={candidateData.joining_date || ''}
                onChange={(e) => handleDataChange('joining_date', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Paper Document Container */}
        <div
          style={{
            backgroundColor: '#070a12',
            padding: '24px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'center',
            overflowX: 'auto',
          }}
        >
          <div
            id="offer-letter-paper"
            style={{
              width: '100%',
              maxWidth: '720px',
              minHeight: '850px',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              padding: '48px 56px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.1)',
              borderRadius: '2px',
              fontSize: '13px',
              lineHeight: 1.65,
              position: 'relative',
              boxSizing: 'border-box',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Custom Embedded CSS */}
            {css && <style>{css}</style>}

            {/* Standard Preview Tokens CSS */}
            <style>{`
              .token-pill {
                background: #e0e7ff;
                color: #4338ca;
                padding: 1px 6px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 11px;
                font-weight: 700;
                border: 1px solid #c7d2fe;
              }
              #offer-letter-paper h1, #offer-letter-paper h2, #offer-letter-paper h3 {
                color: #111827;
              }
              #offer-letter-paper p {
                margin-bottom: 12px;
              }
            `}</style>

            {/* Document Header */}
            {renderedHeader && (
              <div
                dangerouslySetInnerHTML={{ __html: renderedHeader }}
                style={{ marginBottom: '20px' }}
              />
            )}

            {/* Document Body */}
            <div
              dangerouslySetInnerHTML={{ __html: renderedContent }}
              style={{ minHeight: '500px' }}
            />

            {/* Document Footer */}
            {renderedFooter && (
              <div
                dangerouslySetInnerHTML={{ __html: renderedFooter }}
                style={{ marginTop: '30px' }}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
