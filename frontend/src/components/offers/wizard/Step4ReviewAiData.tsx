import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Edit2,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  Info,
  ArrowRight,
} from 'lucide-react';
import {
  AiCandidateExtractionData,
  HrConfirmedTerms,
  FieldDecision,
  HumanOverrideItem,
} from '../../../types/index.js';

interface Step4ReviewAiDataProps {
  aiData: AiCandidateExtractionData;
  confirmedTerms: HrConfirmedTerms;
  overrides: HumanOverrideItem[];
  onUpdateTerms: (terms: HrConfirmedTerms, overrides: HumanOverrideItem[]) => void;
}

interface FieldReviewConfig {
  key: keyof HrConfirmedTerms;
  label: string;
  category: 'personal' | 'background' | 'proposed';
  type: 'text' | 'number';
}

const REVIEW_FIELDS: FieldReviewConfig[] = [
  // 1. Personal & Contact
  { key: 'candidateName', label: 'Candidate Full Name', category: 'personal', type: 'text' },
  { key: 'email', label: 'Email Address', category: 'personal', type: 'text' },
  { key: 'phone', label: 'Phone Number', category: 'personal', type: 'text' },
  { key: 'address', label: 'Residential Address', category: 'personal', type: 'text' },

  // 2. Qualifications & Experience
  { key: 'qualification', label: 'Qualification / Education', category: 'background', type: 'text' },
  { key: 'experience', label: 'Work Experience', category: 'background', type: 'text' },

  // 3. Proposed Role & Initial Terms
  { key: 'designation', label: 'Designation / Job Title', category: 'proposed', type: 'text' },
  { key: 'department', label: 'Department', category: 'proposed', type: 'text' },
  { key: 'location', label: 'Work Location / Arrangement', category: 'proposed', type: 'text' },
  { key: 'joiningDate', label: 'Proposed Joining Date', category: 'proposed', type: 'text' },
  { key: 'baseSalary', label: 'Annual Base Salary ($)', category: 'proposed', type: 'number' },
];

export const Step4ReviewAiData: React.FC<Step4ReviewAiDataProps> = ({
  aiData,
  confirmedTerms,
  overrides,
  onUpdateTerms,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'background' | 'proposed'>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});

  const getAiField = (key: keyof HrConfirmedTerms) => {
    return (aiData as any)[key] || { value: null, confidenceScore: 0 };
  };

  const getOverride = (key: string): HumanOverrideItem | undefined => {
    return overrides.find((o) => o.field === key);
  };

  const handleFieldChange = (key: keyof HrConfirmedTerms, val: any) => {
    const aiVal = getAiField(key)?.value;
    const isDifferent = String(aiVal).trim() !== String(val).trim();

    const nextTerms: HrConfirmedTerms = {
      ...confirmedTerms,
      [key]: val,
    };

    let nextOverrides = overrides.filter((o) => o.field !== key);
    if (isDifferent) {
      nextOverrides.push({
        field: key,
        fieldLabel: REVIEW_FIELDS.find((f) => f.key === key)?.label || key,
        decision: 'EDITED',
        aiValue: aiVal,
        hrValue: val,
        confidenceScore: getAiField(key)?.confidenceScore || 0.9,
        reason: overrideReasons[key] || 'HR updated value from interview notes',
      });
    }

    onUpdateTerms(nextTerms, nextOverrides);
  };

  const handleAcceptAll = () => {
    const nextTerms: HrConfirmedTerms = { ...confirmedTerms };
    REVIEW_FIELDS.forEach((f) => {
      const aiVal = getAiField(f.key)?.value;
      if (aiVal !== null && aiVal !== undefined) {
        (nextTerms as any)[f.key] = aiVal;
      }
    });
    // Clear overrides since HR accepted all AI defaults
    onUpdateTerms(nextTerms, []);
  };

  const handleRejectField = (key: keyof HrConfirmedTerms) => {
    const nextTerms: HrConfirmedTerms = {
      ...confirmedTerms,
      [key]: typeof confirmedTerms[key] === 'number' ? 0 : '',
    };
    const nextOverrides = [
      ...overrides.filter((o) => o.field !== key),
      {
        field: key,
        fieldLabel: REVIEW_FIELDS.find((f) => f.key === key)?.label || key,
        decision: 'REJECTED' as FieldDecision,
        aiValue: getAiField(key)?.value,
        hrValue: null,
        confidenceScore: getAiField(key)?.confidenceScore || 0.8,
        reason: 'Rejected by HR',
      },
    ];
    onUpdateTerms(nextTerms, nextOverrides);
  };

  const filteredFields = REVIEW_FIELDS.filter(
    (f) => activeTab === 'all' || f.category === activeTab
  );

  const overriddenCount = overrides.length;
  const acceptedCount = REVIEW_FIELDS.length - overriddenCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header with Title & Action Banner */}
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
              4
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Review, Confirm & Override AI Data</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
            Enforces strict separation: AI output is advisory. HR confirmed data carries legal authority.
          </p>
        </div>

        {/* Bulk Action Controls */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleAcceptAll}
            style={{ fontSize: '0.8125rem' }}
          >
            <CheckCheck size={15} color="var(--success)" />
            <span>Accept All AI Values</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TOTAL FIELDS: </span>
            <strong style={{ color: '#fff' }}>{REVIEW_FIELDS.length}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ACCEPTED: </span>
            <strong style={{ color: 'var(--success)' }}>{acceptedCount}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>HR OVERRIDES: </span>
            <strong style={{ color: overriddenCount > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
              {overriddenCount}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All Fields' },
            { id: 'personal', label: 'Personal & Contact' },
            { id: 'background', label: 'Qualifications' },
            { id: 'proposed', label: 'Role & Terms' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'var(--bg-card-hover)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--text-dim)',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dual Column Header Labels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          padding: '0 8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ai-badge" style={{ fontSize: '0.75rem' }}>
            <Sparkles size={13} />
            AI Suggested (Advisory)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Extracted from document with neural confidence metrics
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="hr-badge" style={{ fontSize: '0.75rem' }}>
            <ShieldCheck size={13} />
            HR Confirmed (Legal Authority)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Final ratified terms for binding contract issuance
          </span>
        </div>
      </div>

      {/* Dual Column Comparison Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredFields.map((field) => {
          const aiField = getAiField(field.key);
          const hrVal = (confirmedTerms as any)[field.key];
          const override = getOverride(field.key);
          const isOverridden = !!override;
          const confidence = Math.round((aiField.confidenceScore || 0.9) * 100);

          return (
            <div
              key={field.key}
              className="glass-panel"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                padding: 16,
                border: '1px solid',
                borderColor: isOverridden ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)',
                backgroundColor: isOverridden ? 'rgba(245, 158, 11, 0.03)' : 'var(--bg-card)',
                transition: 'all 0.15s ease',
              }}
            >
              {/* LEFT COLUMN: AI SUGGESTED */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  paddingRight: 16,
                  borderRight: '1px dashed var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {field.label}
                  </span>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: confidence >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: confidence >= 90 ? '#34d399' : '#fbbf24',
                    }}
                  >
                    {confidence}% Confidence
                  </span>
                </div>

                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(139, 92, 246, 0.06)',
                    border: '1px solid var(--ai-border)',
                    fontSize: '0.875rem',
                    color: '#fff',
                    fontFamily: field.type === 'number' ? 'var(--font-mono)' : 'inherit',
                  }}
                >
                  {aiField.value !== null && aiField.value !== undefined
                    ? field.type === 'number'
                      ? `$${Number(aiField.value).toLocaleString()}`
                      : String(aiField.value)
                    : <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Not detected in document</span>}
                </div>

                {aiField.sourceSnippet && (
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-dim)',
                      fontStyle: 'italic',
                      lineHeight: 1.3,
                    }}
                  >
                    Source: "{aiField.sourceSnippet}"
                  </div>
                )}

                {aiField.validationWarning && (
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <AlertTriangle size={12} />
                    <span>{aiField.validationWarning}</span>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: HR CONFIRMED */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#fff' }}>
                    HR Verified Value
                  </span>

                  {isOverridden ? (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Edit2 size={11} />
                      <span>Overridden</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Check size={11} />
                      <span>Matches AI</span>
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    className="form-input"
                    style={{
                      border: isOverridden ? '1px solid #f59e0b' : '1px solid var(--hr-border)',
                      background: 'var(--bg-primary)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                    value={hrVal !== null && hrVal !== undefined ? hrVal : ''}
                    onChange={(e) =>
                      handleFieldChange(
                        field.key,
                        field.type === 'number' ? Number(e.target.value) : e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleFieldChange(field.key, aiField.value)}
                    style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                    title="Reset to AI value"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleRejectField(field.key)}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', color: '#f87171' }}
                    title="Reject value"
                  >
                    <X size={14} />
                  </button>
                </div>

                {isOverridden && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', color: '#f59e0b' }}>
                    <Info size={12} />
                    <span>Audit: Logged as manual human override against AI advisory suggestion.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
