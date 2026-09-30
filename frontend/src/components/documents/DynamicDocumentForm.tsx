import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Database,
} from 'lucide-react';
import {
  DocumentTypeDefinition,
  DocumentFieldDefinition,
} from '../../types/document-engine.js';
import {
  TASKNERA_SAMPLE_PROFILE,
  mapHrmsToDocumentForm,
} from '../../../../shared/types/hrms-bridge.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface DynamicDocumentFormProps {
  typeDef: DocumentTypeDefinition;
  formData: Record<string, any>;
  onChange: (fieldKey: string, value: any) => void;
  aiExtractions?: Record<string, { value: any; confidence: number; sourceQuote?: string }>;
  onExtractFromText: (text: string) => void;
  sampleInputText?: string;
  onPopulateSampleData?: () => void;
}

export const DynamicDocumentForm: React.FC<DynamicDocumentFormProps> = ({
  typeDef,
  formData,
  onChange,
  aiExtractions = {},
  onExtractFromText,
  sampleInputText = '',
  onPopulateSampleData,
}) => {
  const { info, success, warning, error } = useToast();
  const [activeSectionKey, setActiveSectionKey] = useState<string>(
    typeDef.sections?.[0]?.key || 'default'
  );
  const [rawText, setRawText] = useState<string>(sampleInputText);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [showExtractionBox, setShowExtractionBox] = useState<boolean>(true);

  // Group fields by section
  const allFields = [...(typeDef.requiredFields || []), ...(typeDef.optionalFields || [])];
  const requiredKeys = new Set((typeDef.requiredFields || []).map((f) => f.key));

  const sections = typeDef.sections || [
    { key: 'default', title: 'Document Fields', displayOrder: 1 },
  ];

  const handleRunAiExtraction = async () => {
    if (!rawText.trim()) {
      info('Please paste source notes or document text to extract');
      return;
    }
    setIsExtracting(true);
    try {
      const res = await DocumentEngineService.extractWithAi(typeDef.code, rawText);
      for (const [k, v] of Object.entries(res.extractedFields || {})) {
        if (v && v.value !== null && v.value !== undefined) {
          onChange(k, v.value);
        }
      }
      onExtractFromText(rawText);
      success(`AI successfully extracted parameters for ${typeDef.name}!`);
    } catch (err: any) {
      onExtractFromText(rawText);
      warning(err.message || 'Extracted fields with advisory fallbacks.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleImportTaskNeraHrms = () => {
    const mapped = mapHrmsToDocumentForm(TASKNERA_SAMPLE_PROFILE, typeDef.code);
    for (const [k, val] of Object.entries(mapped)) {
      if (val !== undefined && val !== null && val !== '') {
        onChange(k, val);
      }
    }
    success(`Synced ${Object.keys(mapped).length} fields from TaskNera HRMS profile (Sakshi Koparde)!`);
  };

  const currentSectionFields = allFields.filter(
    (f) => (f.sectionKey || 'default') === activeSectionKey
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* AI Extraction / Source Ingestion Bar */}
      <div
        className="glass-panel"
        style={{
          padding: 18,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--ai-border)',
          background: 'rgba(139, 92, 246, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showExtractionBox ? 12 : 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--ai-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>
                AI Document Extraction & HRMS Ingestion
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Advisory parameters extracted strictly from source material or HRMS profile (Non-Assumption Rule).
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={handleImportTaskNeraHrms}
            >
              <Database size={13} /> Sync TaskNera HRMS
            </button>

            {onPopulateSampleData && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                onClick={() => {
                  onPopulateSampleData();
                  success(`Loaded realistic sample data for ${typeDef.name}!`);
                }}
              >
                1-Click Preset Data
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              onClick={() => setShowExtractionBox(!showExtractionBox)}
            >
              {showExtractionBox ? 'Collapse' : 'Expand Source Ingestion'}
            </button>
          </div>
        </div>

        {showExtractionBox && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder={`Paste candidate dossier, appraisal memo, contract term sheet, or separation notes for ${typeDef.name}...`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button
                variant="ai"
                onClick={handleRunAiExtraction}
                disabled={isExtracting}
                style={{ fontSize: '0.8125rem', padding: '6px 16px' }}
              >
                {isExtracting ? (
                  <>
                    <RefreshCw size={14} className="spinner" /> Ingesting & Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Extract Fields with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Section Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: 4 }}>
        {sections.map((sec) => {
          const isActive = sec.key === activeSectionKey;
          const secFields = allFields.filter((f) => (f.sectionKey || 'default') === sec.key);
          const reqCount = secFields.filter((f) => requiredKeys.has(f.key)).length;

          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setActiveSectionKey(sec.key)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              <span>{sec.title}</span>
              {reqCount > 0 && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--primary)' : 'var(--bg-tertiary)',
                    color: '#fff',
                  }}
                >
                  {reqCount} req
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render Dynamic Fields for Active Section */}
      <div
        className="glass-panel"
        style={{
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 18,
        }}
      >
        {currentSectionFields.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.875rem', gridColumn: '1 / -1' }}>
            No configured fields in this section.
          </div>
        ) : (
          currentSectionFields.map((field) => {
            const isRequired = requiredKeys.has(field.key);
            const val = formData[field.key] ?? field.defaultValue ?? '';
            const aiData = aiExtractions[field.key];

            return (
              <div key={field.key} className="form-group" style={{ marginBottom: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                  }}
                >
                  <label className="form-label" style={{ fontWeight: 600, color: '#fff' }}>
                    {field.label} {isRequired && <span style={{ color: 'var(--danger)' }}>*</span>}
                  </label>

                  {/* AI Advisory Hint Tag */}
                  {aiData && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        onChange(field.key, aiData.value);
                        info(`Adopted AI value for ${field.label}`);
                      }}
                      title={`Extracted with ${Math.round(aiData.confidence * 100)}% confidence: "${aiData.sourceQuote || aiData.value}". Click to adopt.`}
                    >
                      <span
                        className="ai-badge"
                        style={{
                          fontSize: '0.65rem',
                          padding: '1px 6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={10} /> AI: {String(aiData.value).slice(0, 16)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Input Control by Data Type */}
                {renderFieldControl(field, val, (newVal) => onChange(field.key, newVal))}

                {field.description && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>
                    {field.description}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Sub-renderer for diverse input controls
function renderFieldControl(
  field: DocumentFieldDefinition,
  value: any,
  onChange: (val: any) => void
) {
  if (field.dataType === 'SELECT' && field.options) {
    return (
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Select {field.label} --</option>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.dataType === 'DATE') {
    return (
      <input
        type="date"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.dataType === 'CURRENCY' || field.dataType === 'NUMBER') {
    return (
      <input
        type="number"
        className="form-input"
        placeholder={`Enter ${field.label}...`}
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    );
  }

  if (field.dataType === 'BOOLEAN') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 42 }}>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {value ? 'Yes / Confirmed' : 'No / Excluded'}
        </span>
      </div>
    );
  }

  if (field.description?.toLowerCase().includes('summary') || field.key.toLowerCase().includes('scope') || field.key.toLowerCase().includes('remarks') || field.key.toLowerCase().includes('duties')) {
    return (
      <textarea
        className="form-textarea"
        rows={3}
        placeholder={`Enter ${field.label}...`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type="text"
      className="form-input"
      placeholder={`Enter ${field.label}...`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
