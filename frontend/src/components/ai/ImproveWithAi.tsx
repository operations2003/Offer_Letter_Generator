import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, XCircle, ShieldAlert, Edit3 } from 'lucide-react';
import { Button } from '../common/Button.js';
import { Modal } from '../common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { offerService } from '../../services/offerService.js';
import { AiImprovementGoal, AiAssistantItem } from '../../types/offer.js';

interface ImproveWithAiProps {
  initialText: string;
  onApplyImprovement: (improvedText: string) => void;
  clauseTitle?: string;
  offerId?: string;
}

export const ImproveWithAi: React.FC<ImproveWithAiProps> = ({
  initialText,
  onApplyImprovement,
  clauseTitle = 'Employment Clause',
  offerId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentText, setCurrentText] = useState(initialText);
  const [improvedItem, setImprovedItem] = useState<AiAssistantItem | null>(null);
  const [editableText, setEditableText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<AiImprovementGoal>('clarity');
  const [isImproving, setIsImproving] = useState(false);
  const { success, info } = useToast();

  const handleImprove = async () => {
    setIsImproving(true);
    try {
      const type = selectedGoal === 'grammar' ? 'grammar_improvement' : 'content_improvement';
      const result = await offerService.improveAiAssistance(
        type,
        currentText,
        selectedGoal,
        `Improve ${clauseTitle} with objective: ${selectedGoal}`,
        { clauseTitle },
        offerId
      );
      setImprovedItem(result);
      setEditableText(result.content);
      setIsEditing(false);
      success('AI improved text generated! Review and edit before accepting.');
    } finally {
      setIsImproving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!improvedItem) return;
    setIsImproving(true);
    try {
      const regenerated = await offerService.regenerateAiAssistance(
        improvedItem.type,
        improvedItem.content,
        `Provide an alternative variation for ${selectedGoal}`,
        { clauseTitle },
        offerId,
        improvedItem.variationNumber || 1
      );
      setImprovedItem(regenerated);
      setEditableText(regenerated.content);
      setIsEditing(false);
      info(`Regenerated alternative variation #${regenerated.variationNumber}`);
    } finally {
      setIsImproving(false);
    }
  };

  const handleAccept = async () => {
    if (editableText && improvedItem) {
      await offerService.acceptAiAssistance(
        improvedItem.id,
        editableText,
        offerId,
        clauseTitle
      );
      onApplyImprovement(editableText);
      success('AI improved clause accepted and applied by HR!');
      setIsOpen(false);
    }
  };

  const handleReject = async () => {
    if (improvedItem) {
      await offerService.rejectAiAssistance(
        improvedItem.id,
        'Declined during clause modal review',
        offerId
      );
      info('AI revision discarded.');
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        icon={<Sparkles size={14} style={{ color: 'var(--ai-purple)' }} />}
        onClick={() => {
          setCurrentText(initialText);
          setImprovedItem(null);
          setEditableText('');
          setIsEditing(false);
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
        subtitle="AI drafting assistant for grammar, clarity, conciseness, and professional legal tone."
        maxWidth="720px"
        footer={
          <>
            <Button variant="secondary" onClick={handleReject}>
              Discard
            </Button>
            {improvedItem && (
              <Button variant="primary" icon={<Check size={16} />} onClick={handleAccept}>
                Accept Improvement
              </Button>
            )}
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mandatory AI Guardrail Banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid var(--ai-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.75rem',
              color: '#f8fafc',
            }}
          >
            <ShieldAlert size={16} color="#c084fc" style={{ flexShrink: 0 }} />
            <span>
              <strong>GUARDRAIL:</strong> AI must not invent company policies or legal obligations. All improvements are advisory, editable, and require HR confirmation.
            </span>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
              Refinement Objective:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {[
                { id: 'grammar' as AiImprovementGoal, label: 'Grammar Improvement' },
                { id: 'clarity' as AiImprovementGoal, label: 'Clarity & Flow' },
                { id: 'concise' as AiImprovementGoal, label: 'Make Concise' },
                { id: 'professional_legal' as AiImprovementGoal, label: 'Legal Precision' },
                { id: 'warm_culture' as AiImprovementGoal, label: 'Warm Culture Tone' },
              ].map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`btn ${selectedGoal === goal.id ? 'btn-ai' : 'btn-secondary'}`}
                  style={{ padding: '8px 10px', fontSize: '0.75rem' }}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Original Text */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Current Draft Text:</label>
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
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

          {/* Improved Diff Preview & In-Place Editing */}
          {improvedItem && (
            <div className="ai-box animate-fade-in" style={{ borderColor: 'var(--ai-purple)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="ai-badge" style={{ fontSize: '0.7rem' }}>
                    AI Proposed Revision
                  </span>
                  {improvedItem.variationNumber && improvedItem.variationNumber > 1 && (
                    <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>
                      Variation #{improvedItem.variationNumber}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={12} />
                  <span>{isEditing ? 'View Diff' : 'Edit in Place'}</span>
                </Button>
              </div>

              {improvedItem.changesSummary && (
                <div style={{ fontSize: '0.75rem', color: '#c084fc', marginBottom: 8 }}>
                  <strong>Summary of Enhancements:</strong> {improvedItem.changesSummary}
                </div>
              )}

              {isEditing ? (
                <textarea
                  className="form-input"
                  rows={4}
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6 }}
                />
              ) : (
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
                  {editableText}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 10 }}>
                <Button
                  variant="ghost"
                  icon={<RefreshCw size={13} />}
                  onClick={handleRegenerate}
                  isLoading={isImproving}
                  style={{ fontSize: '0.75rem' }}
                >
                  Regenerate Alternative
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
