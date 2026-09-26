import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, FileText, Send } from 'lucide-react';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface AiAssistProps {
  onApplyAction?: (actionType: string, result: any) => void;
  contextData?: Record<string, unknown>;
}

export const AiAssist: React.FC<AiAssistProps> = ({ onApplyAction, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { info, success } = useToast();

  const quickActions = [
    {
      id: 'compliance',
      label: 'Check Policy Compliance',
      icon: <ShieldAlert size={14} />,
      desc: 'Verify probation and notice periods',
    },
    {
      id: 'benchmark',
      label: 'Benchmark Compensation',
      icon: <CheckCircle2 size={14} />,
      desc: 'Compare total CTC against market 75th percentile',
    },
    {
      id: 'clause',
      label: 'Draft Custom Sign-on Clause',
      icon: <FileText size={14} />,
      desc: 'Generate standard clawback terms',
    },
  ];

  const handleAction = async (actionId: string) => {
    setIsProcessing(true);
    info(`AI Assistant analyzing: ${actionId}...`);

    setTimeout(() => {
      setIsProcessing(false);
      success(`Analysis complete for ${actionId}`);
      if (onApplyAction) {
        onApplyAction(actionId, { timestamp: new Date().toISOString() });
      }
    }, 900);
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      success(`AI response generated for: "${query}"`);
      setQuery('');
    }, 1000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        border: '1px solid var(--ai-border)',
        boxShadow: isOpen ? 'var(--shadow-ai-glow)' : 'var(--shadow-md)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          background: 'var(--ai-gradient-subtle)',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
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
              boxShadow: '0 0 12px var(--ai-glow)',
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI Assist Co-Pilot</span>
              <span className="ai-badge" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                Advisory Only
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Intelligent drafting, compliance verification, and compensation benchmarking
            </p>
          </div>
        </div>
        <Button variant="ghost" style={{ fontSize: '0.8125rem' }}>
          {isOpen ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      {isOpen && (
        <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
            {quickActions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleAction(action.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ai-purple)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c084fc', fontWeight: 600, fontSize: '0.8125rem' }}>
                  {action.icon}
                  <span>{action.label}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{action.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCustomQuery} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AI Assist (e.g. 'Draft a relocation assistance clause for $15,000')..."
              className="form-input"
              style={{ flex: 1, borderColor: 'var(--border-medium)' }}
              disabled={isProcessing}
            />
            <Button variant="ai" type="submit" isLoading={isProcessing} icon={<Send size={14} />}>
              Ask
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
