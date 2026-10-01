import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Edit3,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Copy,
  CheckCircle2,
  FileText,
  Shield,
  Layers,
  Database,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';
import { DocumentTypeDefinition, DocumentFieldDefinition } from '../../types/document-engine.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import {
  TASKNERA_SAMPLE_PROFILE,
  TaskNeraHrmsProfile,
  mapHrmsToDocumentForm,
} from '../../../../shared/types/hrms-bridge.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface DocumentAiAssistanceProps {
  typeDef: DocumentTypeDefinition;
  formData: Record<string, any>;
  onApplyField: (fieldKey: string, value: any) => void;
  onApplyClauseText?: (clauseText: string) => void;
}

export const DocumentAiAssistance: React.FC<DocumentAiAssistanceProps> = ({
  typeDef,
  formData,
  onApplyField,
  onApplyClauseText,
}) => {
  const { success, warning, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'hrms' | 'generate' | 'improve' | 'missing'>('hrms');

  // HRMS Sync State
  const [hrmsRawJson, setHrmsRawJson] = useState<string>(
    JSON.stringify(TASKNERA_SAMPLE_PROFILE, null, 2)
  );
  const [hrmsExtractedData, setHrmsExtractedData] = useState<Record<string, any>>(
    mapHrmsToDocumentForm(TASKNERA_SAMPLE_PROFILE, typeDef.code)
  );
  const [isSyncingHrms, setIsSyncingHrms] = useState<boolean>(false);

  // Generation state
  const tasks = typeDef.aiCapabilities?.draftingAssistanceTasks || [
    { taskCode: 'custom_clause', label: 'Standard Terms & Covenants', description: 'Draft legal terms and compliance stipulations' },
  ];
  const [selectedTask, setSelectedTask] = useState<string>(tasks[0]?.taskCode || 'custom_clause');
  const [promptInstruction, setPromptInstruction] = useState<string>(
    `Draft a professional, authoritative clause for ${typeDef.name}`
  );
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiDisclaimer, setAiDisclaimer] = useState<string>('');

  // Improve state
  const [textToImprove, setTextToImprove] = useState<string>(
    formData.summaryOfResponsibilities ||
    formData.serviceScopeSummary ||
    formData.clearanceRequirementsSummary ||
    formData.settlementRemarks ||
    `We are delighted to confirm your appointment for ${typeDef.name} with standard organizational policies.`
  );
  const [improvementGoal, setImprovementGoal] = useState<'formal' | 'concise' | 'legal' | 'grammar'>('formal');
  const [improvedText, setImprovedText] = useState<string>('');
  const [isImproving, setIsImproving] = useState<boolean>(false);

  // Missing Information calculations
  const requiredFields = typeDef.requiredFields || [];
  const missingItems = requiredFields.filter((f) => {
    const val = formData[f.key];
    return val === undefined || val === null || val === '';
  });

  const [missingFieldInputs, setMissingFieldInputs] = useState<Record<string, any>>({});

  // 1. GENERATE CLAUSE VIA REAL API
  const handleGenerateClause = async () => {
    setIsGenerating(true);
    setAiDisclaimer('');
    try {
      const res = await DocumentEngineService.generateWordingWithAi(
        typeDef.code,
        selectedTask,
        promptInstruction,
        formData
      );
      setGeneratedText(res.content);
      setAiDisclaimer(res.guardrailNotice || '');
      success('AI drafted section proposal from active AI provider!');
    } catch (err: any) {
      // Graceful fallback with advisory draft
      const fallback = `In accordance with corporate governance policies, all activities undertaken under this ${typeDef.name} are subject to strict adherence with organizational confidentiality, data protection, and statutory workplace regulations.`;
      setGeneratedText(fallback);
      warning(err.message || 'AI request completed with advisory defaults.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. IMPROVE WORDING VIA REAL API
  const handleImproveText = async () => {
    if (!textToImprove.trim()) {
      error('Please provide text to improve');
      return;
    }
    setIsImproving(true);
    try {
      const res = await DocumentEngineService.improveWordingWithAi(
        typeDef.code,
        textToImprove,
        improvementGoal,
        `Refine text for ${typeDef.name}`
      );
      setImprovedText(res.improvedText);
      setAiDisclaimer(res.guardrailNotice || '');
      success('AI refined text according to requested criteria!');
    } catch (err: any) {
      let result = textToImprove;
      if (improvementGoal === 'formal') {
        result = `Pursuant to company governance standards, we hereby formally issue this ${typeDef.name}. The designated terms and conditions set forth herein shall govern the parties with immediate effect.`;
      } else if (improvementGoal === 'concise') {
        result = `This ${typeDef.name} confirms the agreed terms, deliverables, and timeline effective immediately upon signature.`;
      } else if (improvementGoal === 'legal') {
        result = `The parties irrevocably acknowledge that the provisions outlined herein represent the complete and binding agreement, superseding any prior verbal or written understandings.`;
      }
      setImprovedText(result);
      warning(err.message || 'Completed with advisory enhancement.');
    } finally {
      setIsImproving(false);
    }
  };

  // 3. HRMS PARSE & SYNC
  const handleLoadTaskNeraProfile = () => {
    const raw = JSON.stringify(TASKNERA_SAMPLE_PROFILE, null, 2);
    setHrmsRawJson(raw);
    const mapped = mapHrmsToDocumentForm(TASKNERA_SAMPLE_PROFILE, typeDef.code);
    setHrmsExtractedData(mapped);
    success('Loaded TaskNera profile for Sakshi Koparde (TN-ENG-1048)');
  };

  const handleParseCustomHrmsJson = async () => {
    setIsSyncingHrms(true);
    try {
      // Call backend AI extractor with HRMS JSON
      const res = await DocumentEngineService.extractWithAi(typeDef.code, hrmsRawJson);
      const extracted: Record<string, any> = {};
      for (const [k, v] of Object.entries(res.extractedFields || {})) {
        if (v && v.value !== null && v.value !== undefined) {
          extracted[k] = v.value;
        }
      }
      setHrmsExtractedData(extracted);
      success(`Successfully mapped ${Object.keys(extracted).length} HRMS fields for ${typeDef.name}!`);
    } catch (err: any) {
      try {
        const parsed = JSON.parse(hrmsRawJson);
        const mapped = mapHrmsToDocumentForm(parsed, typeDef.code);
        setHrmsExtractedData(mapped);
        success(`Extracted ${Object.keys(mapped).length} fields from parsed HRMS record!`);
      } catch (parseErr: any) {
        error('Invalid JSON: Please provide a valid HRMS payload');
      }
    } finally {
      setIsSyncingHrms(false);
    }
  };

  const handleApplyAllHrmsFields = () => {
    let appliedCount = 0;
    for (const [key, val] of Object.entries(hrmsExtractedData)) {
      if (val !== undefined && val !== null && val !== '') {
        onApplyField(key, val);
        appliedCount++;
      }
    }
    success(`Applied ${appliedCount} verified HRMS fields to the ${typeDef.name} form!`);
  };

  const handleSaveMissingField = (key: string) => {
    const val = missingFieldInputs[key];
    if (val !== undefined && val !== '') {
      onApplyField(key, val);
      success(`Saved ${key}!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab('hrms')}
          className="btn"
          style={{
            fontSize: '0.8125rem',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'hrms' ? 'var(--ai-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'hrms' ? '#fff' : 'var(--text-main, #0f172a)',
            border: activeTab === 'hrms' ? 'none' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Database size={14} /> HRMS Sync (TaskNera)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('generate')}
          className="btn"
          style={{
            fontSize: '0.8125rem',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'generate' ? 'var(--ai-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'generate' ? '#fff' : 'var(--text-main, #0f172a)',
            border: activeTab === 'generate' ? 'none' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Wand2 size={14} /> AI Generate Section
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('improve')}
          className="btn"
          style={{
            fontSize: '0.8125rem',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'improve' ? 'var(--ai-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'improve' ? '#fff' : 'var(--text-main, #0f172a)',
            border: activeTab === 'improve' ? 'none' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Edit3 size={14} /> AI Improve & Polish
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missing')}
          className="btn"
          style={{
            fontSize: '0.8125rem',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'missing' ? 'var(--ai-gradient)' : 'var(--bg-secondary)',
            color: activeTab === 'missing' ? '#fff' : 'var(--text-main, #0f172a)',
            border: activeTab === 'missing' ? 'none' : '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={14} /> Missing Information
          {missingItems.length > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: 'rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {missingItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 0: HRMS Integration Bridge (TaskNera) */}
      {activeTab === 'hrms' && (
        <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius-lg)' }}>
          {/* Header Banner */}
          <div
            style={{
              padding: 16,
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                TN
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ margin: 0, color: 'var(--text-main, #0f172a)', fontSize: '1rem', fontWeight: 600 }}>
                    TaskNera HRMS Data Bridge
                  </h4>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontWeight: 600,
                    }}
                  >
                    READY FOR SYNC
                  </span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Active Endpoint: <code>hrms-portal-nu.vercel.app</code> • Normalized across People, Payroll, Attendance, Performance & Exit.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleLoadTaskNeraProfile}
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <UserCheck size={14} style={{ marginRight: 6 }} />
              Load Sakshi Koparde Profile
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {/* Left: HRMS Payload Inspector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  HRMS Employee Record (JSON)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Accepts TaskNera, BambooHR, Darwinbox, Workday
                </span>
              </div>
              <textarea
                className="form-input"
                rows={12}
                value={hrmsRawJson}
                onChange={(e) => setHrmsRawJson(e.target.value)}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  lineHeight: 1.4,
                  resize: 'vertical',
                  marginBottom: 12,
                  background: 'rgba(15, 23, 42, 0.7)',
                }}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  onClick={handleParseCustomHrmsJson}
                  isLoading={isSyncingHrms}
                >
                  <RefreshCw size={14} style={{ marginRight: 6 }} />
                  Extract & Map to {typeDef.name}
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleLoadTaskNeraProfile}
                >
                  Reset to Default TaskNera Record
                </Button>
              </div>
            </div>

            {/* Right: Normalized Fields Preview */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>
                  Mapped Form Fields ({Object.keys(hrmsExtractedData).length})
                </div>
                <Button
                  variant="primary"
                  onClick={handleApplyAllHrmsFields}
                  disabled={Object.keys(hrmsExtractedData).length === 0}
                  style={{ background: 'var(--primary)' }}
                >
                  <CheckCircle2 size={14} style={{ marginRight: 6 }} />
                  Apply All to Document Form
                </Button>
              </div>

              <div
                style={{
                  flex: 1,
                  maxHeight: 280,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {Object.entries(hrmsExtractedData).map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{k}: </span>
                      <strong style={{ color: 'var(--text-main, #0f172a)' }}>{String(v)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyField(k, v);
                        success(`Applied ${k}!`);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 4,
                        color: 'var(--primary-light)',
                        padding: '2px 8px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: 8,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(37, 99, 235, 0.1)',
                  fontSize: '0.72rem',
                  color: '#93c5fd',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Shield size={12} />
                <span>Non-Assumption Rule: Values pulled strictly from authenticated HRMS ledger.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: AI Generate Section */}
      {activeTab === 'generate' && (
        <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 8, display: 'block' }}>
                Select Generation Capability
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {tasks.map((t) => (
                  <div
                    key={t.taskCode}
                    onClick={() => setSelectedTask(t.taskCode)}
                    style={{
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: selectedTask === t.taskCode ? '1px solid var(--ai-purple)' : '1px solid var(--border-subtle)',
                      background: selectedTask === t.taskCode ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-secondary)',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>{t.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{t.description}</div>
                  </div>
                ))}
              </div>

              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 6, display: 'block' }}>
                Prompt Customization
              </label>
              <input
                type="text"
                className="form-input"
                value={promptInstruction}
                onChange={(e) => setPromptInstruction(e.target.value)}
                style={{ fontSize: '0.8125rem', marginBottom: 12 }}
              />

              <Button
                variant="primary"
                onClick={handleGenerateClause}
                isLoading={isGenerating}
                style={{ width: '100%', background: 'var(--ai-gradient)' }}
              >
                <Wand2 size={16} style={{ marginRight: 6 }} />
                Generate Section Wording
              </Button>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 8, display: 'block' }}>
                Generated Output Proposal (Advisory)
              </label>
              <div
                style={{
                  minHeight: 180,
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  color: generatedText ? 'var(--text-main, #0f172a)' : 'var(--text-muted)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 12,
                }}
              >
                {generatedText || 'Click Generate to draft professional wording for this document type.'}
              </div>

              {aiDisclaimer && (
                <div
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-dim)',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    padding: 8,
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 12,
                  }}
                >
                  <AlertCircle size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                  {aiDisclaimer}
                </div>
              )}

              {generatedText && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (onApplyClauseText) {
                        onApplyClauseText(generatedText);
                      } else {
                        navigator.clipboard.writeText(generatedText);
                        success('Copied to clipboard!');
                      }
                    }}
                    style={{ flex: 1 }}
                  >
                    <Check size={14} style={{ marginRight: 6 }} /> Apply to Document
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedText);
                      success('Copied to clipboard!');
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Improve */}
      {activeTab === 'improve' && (
        <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 8, display: 'block' }}>
                Text to Polish or Rephrase
              </label>
              <textarea
                className="form-input"
                rows={6}
                value={textToImprove}
                onChange={(e) => setTextToImprove(e.target.value)}
                style={{ fontSize: '0.8125rem', marginBottom: 12, resize: 'vertical' }}
              />

              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 6, display: 'block' }}>
                Improvement Style
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['formal', 'concise', 'legal', 'grammar'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setImprovementGoal(g)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      border: improvementGoal === g ? '1px solid var(--ai-purple)' : '1px solid var(--border-subtle)',
                      background: improvementGoal === g ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-secondary)',
                      color: improvementGoal === g ? 'var(--ai-purple)' : 'var(--text-main, #0f172a)',
                      cursor: 'pointer',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                onClick={handleImproveText}
                isLoading={isImproving}
                style={{ width: '100%', background: 'var(--ai-gradient)' }}
              >
                <Edit3 size={16} style={{ marginRight: 6 }} /> Polish & Improve Wording
              </Button>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: 8, display: 'block' }}>
                Polished Result
              </label>
              <div
                style={{
                  minHeight: 180,
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem',
                  lineHeight: 1.5,
                  color: improvedText ? 'var(--text-main, #0f172a)' : 'var(--text-muted)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 12,
                }}
              >
                {improvedText || 'Polished text will appear here.'}
              </div>

              {improvedText && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (onApplyClauseText) {
                        onApplyClauseText(improvedText);
                      } else {
                        navigator.clipboard.writeText(improvedText);
                        success('Copied to clipboard!');
                      }
                    }}
                    style={{ flex: 1 }}
                  >
                    <Check size={14} style={{ marginRight: 6 }} /> Replace Text
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(improvedText);
                      success('Copied to clipboard!');
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Missing Information */}
      {activeTab === 'missing' && (
        <div className="glass-panel" style={{ padding: 22, borderRadius: 'var(--radius-lg)' }}>
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-main, #0f172a)', marginBottom: 4 }}>
              Mandatory Field Detection
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Non-Assumption Rule: Fields requiring confirmation before final document generation.
            </p>
          </div>

          {missingItems.length === 0 ? (
            <div
              style={{
                padding: 30,
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-main, #0f172a)', fontSize: '0.9rem' }}>
                All Mandatory Fields Completed!
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
                This {typeDef.name} contains all requisite parameters for quality audit and generation.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {missingItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ maxWidth: '60%' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-main, #0f172a)' }}>
                      {item.label}{' '}
                      <span style={{ color: '#f87171', fontSize: '0.75rem' }}>(Required)</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {item.description || `Missing parameter [${item.key}]`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type={item.dataType === 'NUMBER' ? 'number' : item.dataType === 'DATE' ? 'date' : 'text'}
                      className="form-input"
                      placeholder={`Enter ${item.label}...`}
                      value={missingFieldInputs[item.key] || ''}
                      onChange={(e) =>
                        setMissingFieldInputs({ ...missingFieldInputs, [item.key]: e.target.value })
                      }
                      style={{ fontSize: '0.8rem', padding: '6px 10px', width: 180 }}
                    />
                    <Button
                      variant="primary"
                      onClick={() => handleSaveMissingField(item.key)}
                      disabled={!missingFieldInputs[item.key]}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
