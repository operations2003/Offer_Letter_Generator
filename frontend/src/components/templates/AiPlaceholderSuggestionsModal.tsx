import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  RefreshCw,
  Code2,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { templateService } from '../../services/templateService.js';
import { AiPlaceholderResult, AiPlaceholderSuggestion } from '../../types/template.js';

interface AiPlaceholderSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentMarkup: string;
  onApplyChanges: (updatedMarkup: string) => void;
}

export const AiPlaceholderSuggestionsModal: React.FC<AiPlaceholderSuggestionsModalProps> = ({
  isOpen,
  onClose,
  contentMarkup,
  onApplyChanges,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiPlaceholderResult | null>(null);
  const [selectedReplacements, setSelectedReplacements] = useState<Record<number, boolean>>({});
  const [activeTab, setActiveTab] = useState<'suggestions' | 'preview'>('suggestions');

  useEffect(() => {
    if (isOpen) {
      runAiScan();
    }
  }, [isOpen, contentMarkup]);

  const runAiScan = async () => {
    setLoading(true);
    try {
      const res = await templateService.aiSuggestPlaceholders(contentMarkup);
      setResult(res);
      // Select all suggestions by default
      const initial: Record<number, boolean> = {};
      res.suggestions.forEach((_, idx) => {
        initial[idx] = true;
      });
      setSelectedReplacements(initial);
    } catch {
      // Handled in service fallback
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedReplacements((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSelectAll = (select: boolean) => {
    if (!result) return;
    const next: Record<number, boolean> = {};
    result.suggestions.forEach((_, idx) => {
      next[idx] = select;
    });
    setSelectedReplacements(next);
  };

  const getComputedMarkup = () => {
    if (!result) return contentMarkup;
    let markup = contentMarkup;
    result.suggestions.forEach((sugg, idx) => {
      if (selectedReplacements[idx]) {
        markup = markup.replace(sugg.originalSnippet, sugg.suggestedToken);
      }
    });
    return markup;
  };

  const handleApply = () => {
    const finalMarkup = getComputedMarkup();
    onApplyChanges(finalMarkup);
    onClose();
  };

  const selectedCount = Object.values(selectedReplacements).filter(Boolean).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Placeholder Intelligence"
      subtitle="Audits template text for hardcoded names, salaries, roles, and dates to convert into dynamic tokens"
      maxWidth="800px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={runAiScan}
            disabled={loading}
            style={{ fontSize: '0.8125rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Re-analyze</span>
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-ai"
              disabled={loading || selectedCount === 0}
              onClick={handleApply}
            >
              <Sparkles size={16} />
              <span>Apply {selectedCount} Replacement{selectedCount !== 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <div
            className="spinner"
            style={{
              width: 38,
              height: 38,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--ai-purple)',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>
            Scanning Template Content...
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>
            Detecting hardcoded values, missing mandatory legal variables, and policy anomalies.
          </p>
        </div>
      ) : result ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Summary Banner */}
          <div
            className="ai-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid var(--ai-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--ai-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#fff' }}>
                  {result.summary}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Advisory recommendations to prevent accidental static data in production offers.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleSelectAll(true)}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Select All
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => handleSelectAll(false)}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Missing Required Warning (if any) */}
          {result.missingStandardPlaceholders.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: '0.8125rem', color: '#f59e0b' }}>
                  Missing Standard Tokens ({result.missingStandardPlaceholders.length})
                </strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  The following standard variables are currently absent from this template:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {result.missingStandardPlaceholders.slice(0, 8).map((token) => (
                    <span
                      key={token}
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {token}
                    </span>
                  ))}
                  {result.missingStandardPlaceholders.length > 8 && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                      +{result.missingStandardPlaceholders.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: 16 }}>
            <button
              onClick={() => setActiveTab('suggestions')}
              style={{
                padding: '8px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'suggestions' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'suggestions' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Detected Tokens ({result.suggestions.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '8px 4px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'preview' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'preview' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Result Preview
            </button>
          </div>

          {/* Tab 1: Suggestions List */}
          {activeTab === 'suggestions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
              {result.suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={32} color="var(--success)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: 600, color: '#fff' }}>No Hardcoded Values Detected</p>
                  <p style={{ fontSize: '0.8125rem' }}>This template is properly tokenized and compliant.</p>
                </div>
              ) : (
                result.suggestions.map((sugg, idx) => {
                  const isChecked = !!selectedReplacements[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelect(idx)}
                      className="glass-panel"
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: isChecked ? 'var(--ai-border)' : 'var(--border-subtle)',
                        backgroundColor: isChecked ? 'rgba(168, 85, 247, 0.05)' : 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 14,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span
                              style={{
                                textDecoration: 'line-through',
                                color: '#f87171',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8125rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              "{sugg.originalSnippet}"
                            </span>

                            <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />

                            <span
                              style={{
                                color: '#818cf8',
                                fontWeight: 700,
                                background: 'rgba(99, 102, 241, 0.15)',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8125rem',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {sugg.suggestedToken}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {sugg.rationale}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: '#c084fc',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {Math.round(sugg.confidenceScore * 100)}% Match
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Result Preview */}
          {activeTab === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Live preview of markup with selected replacements applied:
              </div>
              <pre
                style={{
                  padding: 14,
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-main)',
                  maxHeight: 280,
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.5,
                }}
              >
                {getComputedMarkup()}
              </pre>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};
