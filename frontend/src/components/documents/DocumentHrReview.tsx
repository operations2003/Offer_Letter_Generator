import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Edit2,
  AlertTriangle,
  RotateCcw,
  CheckCheck,
  CheckCircle2,
  Info,
  Save,
} from 'lucide-react';
import { DocumentTypeDefinition, DocumentFieldDefinition } from '../../types/document-engine.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface DocumentHrReviewProps {
  typeDef: DocumentTypeDefinition;
  formData: Record<string, any>;
  aiExtractions: Record<string, { value: any; confidence: number; sourceQuote?: string }>;
  onConfirmTerms: (
    confirmedTerms: Record<string, any>,
    humanOverrides: Array<{ fieldKey: string; overrideReason?: string }>
  ) => void;
}

export const DocumentHrReview: React.FC<DocumentHrReviewProps> = ({
  typeDef,
  formData,
  aiExtractions = {},
  onConfirmTerms,
}) => {
  const { success, info } = useToast();

  const allFields = [...(typeDef.requiredFields || []), ...(typeDef.optionalFields || [])];

  // State of confirmed terms
  const [confirmedTerms, setConfirmedTerms] = useState<Record<string, any>>({ ...formData });

  // Tracking human decisions: 'ACCEPTED' | 'REJECTED' | 'OVERRIDDEN'
  const [fieldDecisions, setFieldDecisions] = useState<Record<string, 'ACCEPTED' | 'REJECTED' | 'OVERRIDDEN'>>(() => {
    const initial: Record<string, 'ACCEPTED' | 'REJECTED' | 'OVERRIDDEN'> = {};
    for (const f of allFields) {
      if (aiExtractions[f.key]) {
        // If formData matches AI extraction value, marked as accepted
        if (formData[f.key] === aiExtractions[f.key]?.value) {
          initial[f.key] = 'ACCEPTED';
        } else if (formData[f.key] !== undefined && formData[f.key] !== '') {
          initial[f.key] = 'OVERRIDDEN';
        }
      }
    }
    return initial;
  });

  // Override reasons
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});
  const [activeOverrideModalKey, setActiveOverrideModalKey] = useState<string | null>(null);
  const [tempOverrideReason, setTempOverrideReason] = useState<string>('');

  const handleAcceptField = (fieldKey: string) => {
    const aiVal = aiExtractions[fieldKey]?.value;
    if (aiVal !== undefined) {
      setConfirmedTerms((prev) => ({ ...prev, [fieldKey]: aiVal }));
      setFieldDecisions((prev) => ({ ...prev, [fieldKey]: 'ACCEPTED' }));
      success(`Accepted AI value for ${fieldKey}`);
    }
  };

  const handleRejectField = (fieldKey: string) => {
    setFieldDecisions((prev) => ({ ...prev, [fieldKey]: 'REJECTED' }));
    info(`Rejected AI advisory value for ${fieldKey}`);
  };

  const handleSaveOverride = (fieldKey: string, customVal: any, reason: string) => {
    setConfirmedTerms((prev) => ({ ...prev, [fieldKey]: customVal }));
    setFieldDecisions((prev) => ({ ...prev, [fieldKey]: 'OVERRIDDEN' }));
    setOverrideReasons((prev) => ({ ...prev, [fieldKey]: reason }));
    setActiveOverrideModalKey(null);
    setTempOverrideReason('');
    success(`Recorded HR Override for ${fieldKey}`);
  };

  const handleAcceptAllAi = () => {
    const updated = { ...confirmedTerms };
    const decisions = { ...fieldDecisions };

    for (const f of allFields) {
      const ai = aiExtractions[f.key];
      if (ai && ai.confidence >= 0.85) {
        updated[f.key] = ai.value;
        decisions[f.key] = 'ACCEPTED';
      }
    }

    setConfirmedTerms(updated);
    setFieldDecisions(decisions);
    success('Accepted all high-confidence AI values!');
  };

  const handleSaveAndProceed = () => {
    const overrides = Object.keys(fieldDecisions)
      .filter((k) => fieldDecisions[k] === 'OVERRIDDEN')
      .map((k) => ({
        fieldKey: k,
        overrideReason: overrideReasons[k] || 'HR managerial prerogative',
      }));

    onConfirmTerms(confirmedTerms, overrides);
  };

  // Stats
  const totalAi = Object.keys(aiExtractions).length;
  const acceptedCount = Object.values(fieldDecisions).filter((d) => d === 'ACCEPTED').length;
  const overriddenCount = Object.values(fieldDecisions).filter((d) => d === 'OVERRIDDEN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Policy Governance Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--hr-border)',
          background: 'rgba(16, 185, 129, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldCheck size={24} color="#34d399" />
          <div>
            <h4 style={{ fontSize: '0.9375rem', color: '#34d399', fontWeight: 700 }}>
              HR Legal Review & Strict Data Segregation
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AI suggested values are strictly advisory. Only terms verified and authorized by HR in the green column
              will be compiled into the legally binding document.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="ai"
            onClick={handleAcceptAllAi}
            style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
          >
            <CheckCheck size={14} /> Accept High-Confidence AI ({totalAi})
          </Button>
        </div>
      </div>

      {/* Review Metrics Bar */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          className="glass-panel"
          style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Sparkles size={16} color="var(--ai-purple)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>AI Advisory Fields</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#c084fc' }}>{totalAi} detected</div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <CheckCircle2 size={16} color="var(--success)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Accepted by HR</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#34d399' }}>{acceptedCount} fields</div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{ flex: 1, padding: 12, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <AlertTriangle size={16} color="var(--warning)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Human Overrides</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fbbf24' }}>{overriddenCount} logged</div>
          </div>
        </div>
      </div>

      {/* Review Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', width: '25%' }}>
                Parameter / Field
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#c084fc', width: '35%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} /> AI Suggested (Advisory)
                </div>
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', width: '12%', textAlign: 'center' }}>
                Decision
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#34d399', width: '28%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} /> HR Confirmed (Binding)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {allFields.map((field) => {
              const ai = aiExtractions[field.key];
              const decision = fieldDecisions[field.key];
              const confirmedVal = confirmedTerms[field.key];

              return (
                <tr
                  key={field.key}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  {/* Field Name */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      {field.sectionKey} • {field.dataType}
                    </div>
                  </td>

                  {/* AI Suggested */}
                  <td style={{ padding: '14px 18px' }}>
                    {ai ? (
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'rgba(139, 92, 246, 0.08)',
                          border: '1px dashed var(--ai-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#c084fc' }}>
                            {String(ai.value)}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {Math.round(ai.confidence * 100)}% conf
                          </span>
                        </div>
                        {ai.sourceQuote && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            Source: "{ai.sourceQuote}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        Omitted in source (Non-Assumed)
                      </span>
                    )}
                  </td>

                  {/* Decision Actions */}
                  <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {ai && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcceptField(field.key)}
                            className="btn"
                            title="Accept AI suggested value"
                            style={{
                              padding: 6,
                              borderRadius: 'var(--radius-sm)',
                              background: decision === 'ACCEPTED' ? 'var(--success)' : 'var(--bg-secondary)',
                              color: decision === 'ACCEPTED' ? '#fff' : 'var(--text-main, #0f172a)',
                              border: '1px solid ' + (decision === 'ACCEPTED' ? 'var(--success)' : 'var(--border-subtle)'),
                            }}
                          >
                            <Check size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectField(field.key)}
                            className="btn"
                            title="Reject AI suggestion"
                            style={{
                              padding: 6,
                              borderRadius: 'var(--radius-sm)',
                              background: decision === 'REJECTED' ? 'var(--danger)' : 'var(--bg-secondary)',
                              color: decision === 'REJECTED' ? '#fff' : 'var(--text-main, #0f172a)',
                              border: '1px solid ' + (decision === 'REJECTED' ? 'var(--danger)' : 'var(--border-subtle)'),
                            }}
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveOverrideModalKey(field.key);
                          setTempOverrideReason(overrideReasons[field.key] || '');
                        }}
                        className="btn"
                        title="Override or enter custom value"
                        style={{
                          padding: 6,
                          borderRadius: 'var(--radius-sm)',
                          background: decision === 'OVERRIDDEN' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-secondary)',
                          color: decision === 'OVERRIDDEN' ? '#fbbf24' : 'var(--text-muted)',
                          border: '1px solid ' + (decision === 'OVERRIDDEN' ? '#fbbf24' : 'var(--border-subtle)'),
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>

                  {/* HR Confirmed */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input
                        type={field.dataType === 'NUMBER' || field.dataType === 'CURRENCY' ? 'number' : field.dataType === 'DATE' ? 'date' : 'text'}
                        className="form-input"
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.8125rem',
                          borderColor: decision === 'OVERRIDDEN' ? 'var(--warning)' : decision === 'ACCEPTED' ? 'var(--success)' : 'var(--border-subtle)',
                        }}
                        value={confirmedVal ?? ''}
                        onChange={(e) => {
                          const val = field.dataType === 'NUMBER' || field.dataType === 'CURRENCY' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
                          setConfirmedTerms((prev) => ({ ...prev, [field.key]: val }));
                          if (ai && val !== ai.value) {
                            setFieldDecisions((prev) => ({ ...prev, [field.key]: 'OVERRIDDEN' }));
                          }
                        }}
                      />

                      {decision === 'OVERRIDDEN' && (
                        <div style={{ fontSize: '0.6875rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={10} /> Human Override: {overrideReasons[field.key] || 'Manual HR adjustment'}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Override Reason Capture Modal */}
      {activeOverrideModalKey && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div className="glass-panel" style={{ width: 440, padding: 24, borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-main, #0f172a)', marginBottom: 6 }}>
              Log Human Override for "{activeOverrideModalKey}"
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Compliance requires logging managerial reasons when modifying AI advisory recommendations:
            </p>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Executive negotiation approved by VP, Candidate counter-offer"
              value={tempOverrideReason}
              onChange={(e) => setTempOverrideReason(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <Button variant="secondary" onClick={() => setActiveOverrideModalKey(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  handleSaveOverride(
                    activeOverrideModalKey,
                    confirmedTerms[activeOverrideModalKey],
                    tempOverrideReason || 'HR Manager discretion'
                  )
                }
              >
                Confirm & Log Override
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
