import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, RefreshCw, X } from 'lucide-react';
import { Button } from '../common/Button.js';
import { Modal } from '../common/Modal.js';
import { useToast } from '../../context/ToastContext.js';

interface ImproveWithAiProps {
  initialText: string;
  onApplyImprovement: (improvedText: string) => void;
  clauseTitle?: string;
}

export const ImproveWithAi: React.FC<ImproveWithAiProps> = ({
  initialText,
  onApplyImprovement,
  clauseTitle = 'Employment Clause',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentText, setCurrentText] = useState(initialText);
  const [improvedText, setImprovedText] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('legal');
  const [isImproving, setIsImproving] = useState(false);
  const { success } = useToast();

  const handleImprove = async () => {
    setIsImproving(true);
    await new Promise((r) => setTimeout(r, 800));

    let refined = currentText;
    if (selectedGoal === 'legal') {
      refined = `${currentText} This provision shall be construed and governed in accordance with applicable labor standards, and shall survive any cessation of employment.`;
    } else if (selectedGoal === 'concise') {
      refined = currentText.replace(/shall be entitled to receive/gi, 'receives').replace(/in the event that/gi, 'if');
    } else if (selectedGoal === 'warm') {
      refined = `We are thrilled to present this offer. ${currentText} We eagerly look forward to welcoming you to our team!`;
    }

    setImprovedText(refined);
    setIsImproving(false);
  };

  const handleAccept = () => {
    if (improvedText) {
      onApplyImprovement(improvedText);
      success('AI improved clause accepted and applied!');
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        icon={<Sparkles size={14} style={{ color: 'var(--ai-purple)' }} />}
        onClick={() => {
          setCurrentText(initialText);
          setImprovedText('');
          setIsOpen(true);
        }}
        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
      >
        Improve with AI
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Improve ${clauseTitle} with AI`}
        subtitle="Refine clause language for enforceability, clarity, or tone."
        maxWidth="700px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Discard
            </Button>
            {improvedText && (
              <Button variant="primary" icon={<Check size={16} />} onClick={handleAccept}>
                Accept Improvement
              </Button>
            )}
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Goal Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
              Refinement Objective:
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'legal', label: 'Strengthen Legal Enforceability' },
                { id: 'concise', label: 'Make More Concise' },
                { id: 'warm', label: 'Welcoming Culture Tone' },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`btn ${selectedGoal === goal.id ? 'btn-ai' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '8px 10px', fontSize: '0.75rem' }}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Original Text */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Current Text:</label>
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
              }}
            >
              {currentText}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="ai"
              icon={<Sparkles size={16} />}
              isLoading={isImproving}
              onClick={handleImprove}
            >
              Generate AI Improvement
            </Button>
          </div>

          {/* Improved Diff Preview */}
          {improvedText && (
            <div className="ai-box animate-fade-in" style={{ borderColor: 'var(--ai-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="ai-badge" style={{ fontSize: '0.7rem' }}>
                  AI Proposed Revision
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Diff Preview
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--text-main)',
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: 12,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {improvedText}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
