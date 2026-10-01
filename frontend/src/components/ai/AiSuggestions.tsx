import React from 'react';
import { Sparkles, Check, X, ShieldAlert, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button.js';
import { AiAdvisoryBadge } from '../common/Badge.js';
import { useToast } from '../../context/ToastContext.js';

export interface AiSuggestionItem {
  id: string;
  type: 'POLICY' | 'SALARY_BAND' | 'ANOMALY';
  title: string;
  description: string;
  recommendedAction: string;
  confidenceScore: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface AiSuggestionsProps {
  suggestions: AiSuggestionItem[];
  onApply: (suggestionId: string) => void;
  onDismiss: (suggestionId: string) => void;
}

export const AiSuggestions: React.FC<AiSuggestionsProps> = ({
  suggestions,
  onApply,
  onDismiss,
}) => {
  const { success, info } = useToast();

  if (suggestions.length === 0) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: 20,
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <Sparkles size={20} style={{ color: 'var(--ai-purple)', margin: '0 auto 8px' }} />
        No pending AI suggestions. The proposed offer terms align with company policy benchmarks.
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} style={{ color: 'var(--ai-purple)' }} />
          <h4 style={{ fontSize: '1rem' }}>AI Advisory Suggestions ({suggestions.length})</h4>
        </div>
        <AiAdvisoryBadge label="Advisory Only" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {suggestions.map((item) => {
          let Icon = TrendingUp;
          let iconColor = '#60a5fa';
          if (item.type === 'POLICY') {
            Icon = ShieldAlert;
            iconColor = '#fbbf24';
          }
          if (item.type === 'ANOMALY') {
            Icon = AlertCircle;
            iconColor = '#f87171';
          }

          return (
            <div
              key={item.id}
              className="ai-box"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--ai-border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={16} color={iconColor} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>{item.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background:
                        item.impact === 'HIGH'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color: item.impact === 'HIGH' ? '#dc2626' : '#d97706',
                    }}
                  >
                    {item.impact} IMPACT
                  </span>
                  <AiAdvisoryBadge confidence={item.confidenceScore} label="" />
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{item.description}</p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border-subtle, #e2e8f0)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <strong>Action:</strong> {item.recommendedAction}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => {
                      onDismiss(item.id);
                      info('Suggestion dismissed');
                    }}
                  >
                    <X size={12} />
                    <span>Dismiss</span>
                  </button>
                  <button
                    className="btn btn-ai"
                    style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                    onClick={() => {
                      onApply(item.id);
                      success(`Applied AI recommendation: ${item.title}`);
                    }}
                  >
                    <Check size={12} />
                    <span>Apply</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
