import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Edit3,
  Wand2,
  Check,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { offerService } from '../../services/offerService.js';
import {
  AiAssistanceType,
  AiImprovementGoal,
  AiAssistantItem,
} from '../../types/offer.js';

interface AiAssistProps {
  onApplyAction?: (actionType: string, result: any) => void;
  contextData?: Record<string, unknown>;
  defaultOfferId?: string;
}

export const AiAssist: React.FC<AiAssistProps> = ({
  onApplyAction,
  contextData,
  defaultOfferId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'improve'>('generate');

  // Generation state
  const [selectedGenType, setSelectedGenType] = useState<AiAssistanceType>('welcome_intro_text');
  const [genInstruction, setGenInstruction] = useState('Draft an enthusiastic welcoming message aligned with high-performance engineering culture');

  // Improvement state
  const [selectedImpType, setSelectedImpType] = useState<AiAssistanceType>('grammar_improvement');
  const [impGoal, setImpGoal] = useState<AiImprovementGoal>('grammar');
  const [textToImprove, setTextToImprove] = useState('We are please to offer you teh position of Lead Architect and you will recieve full benefits.');
  const [impInstruction, setImpInstruction] = useState('Fix grammatical errors, typos, and improve sentence cadence');

  // Active AI Result & Editable state
  const [currentResult, setCurrentResult] = useState<AiAssistantItem | null>(null);
  const [editableContent, setEditableContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const { success, error, info } = useToast();

  const generationOptions: Array<{ id: AiAssistanceType; label: string; desc: string; placeholder: string }> = [
    {
      id: 'professional_offer_wording',
      label: 'Offer Appointment Wording',
      desc: 'Formal appointment declaration and standard letter body',
      placeholder: 'Draft formal appointment announcement for Senior Cloud Architect',
    },
    {
      id: 'welcome_intro_text',
      label: 'Welcome / Introduction Text',
      desc: 'Inspiring, warm greeting and company mission alignment',
      placeholder: 'Draft an enthusiastic welcoming message aligned with high-performance culture',
    },
    {
      id: 'job_description_wording',
      label: 'Job Description Wording',
      desc: 'Articulate responsibilities and key deliverables',
      placeholder: 'Draft key architectural deliverables and cross-functional responsibilities',
    },
    {
      id: 'general_clauses',
      label: 'General Contract Clauses',
      desc: 'Standard non-disclosure, IP assignment, and at-will terms',
      placeholder: 'Draft intellectual property assignment and confidentiality clause',
    },
    {
      id: 'custom_hr_clauses',
      label: 'Custom HR Clauses',
      desc: 'Equipment provisioning, remote work, or relocation terms',
      placeholder: 'Draft equipment setup allowance and hybrid working policy',
    },
  ];

  const improvementGoals: Array<{ id: AiImprovementGoal; label: string; desc: string }> = [
    { id: 'grammar', label: 'Grammar & Syntax', desc: 'Fix typos, punctuation, spelling & subject-verb agreement' },
    { id: 'clarity', label: 'Clarity & Flow', desc: 'Remove ambiguity and elevate readability' },
    { id: 'concise', label: 'Conciseness', desc: 'Streamline wordy clauses without changing meaning' },
    { id: 'professional_legal', label: 'Legal Precision', desc: 'Enrich formal contractual tone safely' },
    { id: 'warm_culture', label: 'Warm & Engaging', desc: 'Add positive and supportive candidate tone' },
  ];

  // 1. GENERATE API
  const handleGenerate = async () => {
    if (!genInstruction.trim()) return;
    setIsProcessing(true);
    setShowRejectInput(false);
    try {
      const result = await offerService.generateAiAssistance(
        selectedGenType,
        genInstruction,
        contextData,
        defaultOfferId
      );
      setCurrentResult(result);
      setEditableContent(result.content);
      setIsEditing(false);
      success(`AI drafted ${result.title}! Please review and edit before accepting.`);
    } catch {
      error('Failed to generate drafting assistance. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. IMPROVE API
  const handleImprove = async () => {
    if (!textToImprove.trim()) return;
    setIsProcessing(true);
    setShowRejectInput(false);
    try {
      const result = await offerService.improveAiAssistance(
        selectedImpType,
        textToImprove,
        impGoal,
        impInstruction,
        contextData,
        defaultOfferId
      );
      setCurrentResult(result);
      setEditableContent(result.content);
      setIsEditing(false);
      success('AI improved text! Please review and edit before accepting.');
    } catch {
      error('Failed to improve text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. REGENERATE API
  const handleRegenerate = async () => {
    if (!currentResult) return;
    setIsProcessing(true);
    setShowRejectInput(false);
    try {
      const result = await offerService.regenerateAiAssistance(
        currentResult.type,
        currentResult.content,
        'Provide an alternative professional wording variation',
        contextData,
        defaultOfferId,
        currentResult.variationNumber || 1
      );
      setCurrentResult(result);
      setEditableContent(result.content);
      setIsEditing(false);
      info(`Generated alternative variation #${result.variationNumber}`);
    } catch {
      error('Failed to regenerate alternative variation.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. ACCEPT API
  const handleAccept = async () => {
    if (!currentResult) return;
    setIsProcessing(true);
    try {
      await offerService.acceptAiAssistance(
        currentResult.id,
        editableContent,
        defaultOfferId,
        currentResult.type
      );
      setCurrentResult((prev) => (prev ? { ...prev, reviewStatus: 'ACCEPTED', content: editableContent } : null));
      success('AI content accepted and verified by HR!');
      if (onApplyAction) {
        onApplyAction(currentResult.type, {
          content: editableContent,
          title: currentResult.title,
          isConfirmedByHr: true,
          isAiGenerated: true,
        });
      }
    } catch {
      error('Failed to accept AI content.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. REJECT API
  const handleReject = async () => {
    if (!currentResult) return;
    setIsProcessing(true);
    try {
      await offerService.rejectAiAssistance(
        currentResult.id,
        rejectReason || 'Declined by HR review',
        defaultOfferId
      );
      setCurrentResult((prev) => (prev ? { ...prev, reviewStatus: 'REJECTED', rejectionReason: rejectReason } : null));
      info('AI suggestion declined by HR.');
      setShowRejectInput(false);
    } catch {
      error('Failed to reject AI content.');
    } finally {
      setIsProcessing(false);
    }
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
      {/* Header Bar */}
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
              <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI Offer Copilot & Drafting Assistant</span>
              <span className="ai-badge" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                HR Reviewed & Editable
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Assists with offer wording, welcome notes, job descriptions, legal clauses & grammar improvement
            </p>
          </div>
        </div>
        <Button variant="ghost" style={{ fontSize: '0.8125rem' }}>
          {isOpen ? 'Collapse' : 'Expand Assistant'}
        </Button>
      </div>

      {isOpen && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Mandatory AI Guardrail Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid var(--ai-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <ShieldAlert size={18} color="#c084fc" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.8125rem', color: '#f8fafc', lineHeight: 1.45 }}>
              <strong>STRICT COMPLIANCE GUARDRAIL:</strong> AI must not invent company policies or legal obligations. All AI-generated content is strictly advisory, completely editable, and requires human HR review and acceptance before issuance.
            </div>
          </div>

          {/* Mode Tabs: Generate vs Improve */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
            <button
              type="button"
              onClick={() => setActiveTab('generate')}
              className={`btn ${activeTab === 'generate' ? 'btn-ai' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
            >
              <Wand2 size={14} />
              <span>Generate Drafting</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('improve')}
              className={`btn ${activeTab === 'improve' ? 'btn-ai' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
            >
              <Edit3 size={14} />
              <span>Improve & Proofread</span>
            </button>
          </div>

          {/* TAB 1: GENERATE DRAFTING */}
          {activeTab === 'generate' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Select Assistance Category:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  {generationOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedGenType(opt.id);
                        setGenInstruction(opt.placeholder);
                      }}
                      className={`btn ${selectedGenType === opt.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '10px 12px',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 2,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{opt.label}</span>
                      <span style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Drafting Guidance / Prompt:
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={genInstruction}
                    onChange={(e) => setGenInstruction(e.target.value)}
                    placeholder="Enter instructions for AI drafter..."
                    style={{ flex: 1 }}
                    disabled={isProcessing}
                  />
                  <Button
                    variant="ai"
                    onClick={handleGenerate}
                    isLoading={isProcessing}
                    icon={<Sparkles size={14} />}
                  >
                    Generate Draft
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPROVE & PROOFREAD */}
          {activeTab === 'improve' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Improvement Objective:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                  {improvementGoals.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setImpGoal(g.id);
                        if (g.id === 'grammar') setSelectedImpType('grammar_improvement');
                        else setSelectedImpType('content_improvement');
                      }}
                      className={`btn ${impGoal === g.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '8px 10px',
                        fontSize: '0.75rem',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{g.label}</span>
                      <span style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Text to Improve:
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={textToImprove}
                  onChange={(e) => setTextToImprove(e.target.value)}
                  placeholder="Paste clause or paragraph to improve..."
                  style={{ width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
                  disabled={isProcessing}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="ai"
                  onClick={handleImprove}
                  isLoading={isProcessing}
                  icon={<Wand2 size={14} />}
                >
                  Improve Text
                </Button>
              </div>
            </div>
          )}

          {/* AI OUTPUT REVIEW & EDITING CONSOLE */}
          {currentResult && (
            <div
              className="glass-panel animate-fade-in"
              style={{
                padding: '18px',
                background: currentResult.reviewStatus === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.05)' :
                           currentResult.reviewStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.05)' :
                           'rgba(168, 85, 247, 0.05)',
                border: currentResult.reviewStatus === 'ACCEPTED' ? '1px solid var(--hr-border)' :
                        currentResult.reviewStatus === 'REJECTED' ? '1px solid rgba(239, 68, 68, 0.3)' :
                        '1px solid var(--ai-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ai-badge" style={{ fontSize: '0.6875rem' }}>
                    {currentResult.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  {currentResult.variationNumber && currentResult.variationNumber > 1 && (
                    <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>
                      Variation #{currentResult.variationNumber}
                    </span>
                  )}
                  {currentResult.reviewStatus === 'ACCEPTED' && (
                    <span style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} /> Accepted by HR
                    </span>
                  )}
                  {currentResult.reviewStatus === 'REJECTED' && (
                    <span style={{ color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <XCircle size={14} /> Rejected by HR
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <Button
                    variant="ghost"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 size={13} />
                    <span>{isEditing ? 'View Rendered' : 'Edit Text in Place'}</span>
                  </Button>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {currentResult.title}
              </h4>

              {currentResult.changesSummary && (
                <div style={{ fontSize: '0.75rem', color: '#a78bfa', background: 'rgba(168, 85, 247, 0.1)', padding: '6px 10px', borderRadius: 4 }}>
                  <strong>Changes Applied:</strong> {currentResult.changesSummary}
                </div>
              )}

              {/* Editable Text Area vs Read Mode */}
              {isEditing ? (
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    HR In-Place Editor (Modifications will be saved upon Acceptance):
                  </label>
                  <textarea
                    className="form-input"
                    rows={5}
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6 }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0, 0, 0, 0.25)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: 'var(--text-main)',
                  }}
                >
                  {editableContent}
                </div>
              )}

              {/* Key points if present */}
              {currentResult.keyPoints && currentResult.keyPoints.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <strong>Key Elements:</strong> {currentResult.keyPoints.join(' • ')}
                </div>
              )}

              {/* Rejection Input Drawer */}
              {showRejectInput && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejecting AI draft (e.g. 'Tone too informal', 'Policy mismatch')..."
                    style={{ flex: 1, fontSize: '0.8125rem' }}
                  />
                  <Button variant="danger" style={{ fontSize: '0.75rem' }} onClick={handleReject}>
                    Confirm Reject
                  </Button>
                  <Button variant="ghost" style={{ fontSize: '0.75rem' }} onClick={() => setShowRejectInput(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              {/* Action Buttons: Regenerate / Reject / Accept */}
              {currentResult.reviewStatus === 'PENDING' && !showRejectInput && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <Button
                    variant="secondary"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleRegenerate}
                    isLoading={isProcessing}
                    icon={<RefreshCw size={13} />}
                  >
                    Regenerate Variation
                  </Button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      variant="ghost"
                      style={{ fontSize: '0.75rem', color: 'var(--danger)' }}
                      onClick={() => setShowRejectInput(true)}
                    >
                      <XCircle size={14} />
                      <span>Reject</span>
                    </Button>

                    <Button
                      variant="primary"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleAccept}
                      isLoading={isProcessing}
                      icon={<Check size={14} />}
                    >
                      Accept & Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
