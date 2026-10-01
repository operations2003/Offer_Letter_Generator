import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  FileCheck2,
  Check,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { templateService } from '../../services/templateService.js';
import { AiWordingSuggestion, AiWordingTone } from '../../types/template.js';

interface AiWordingSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
  onApplyClause: (refinedMarkup: string) => void;
}

export const AiWordingSuggestionsModal: React.FC<AiWordingSuggestionsModalProps> = ({
  isOpen,
  onClose,
  selectedText = '',
  onApplyClause,
}) => {
  const [instruction, setInstruction] = useState('');
  const [currentClause, setCurrentClause] = useState(selectedText);
  const [tone, setTone] = useState<AiWordingTone>('formal');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AiWordingSuggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const presets = [
    {
      label: 'Welcome Preamble',
      instruction: 'Draft an enthusiastic welcome opening congratulating the candidate and introducing their mission.',
    },
    {
      label: 'Confidentiality & IP',
      instruction: 'Draft a standard employee inventions and trade secrets confidentiality clause.',
    },
    {
      label: 'Remote / Hybrid Policy',
      instruction: 'Draft a modern hybrid work policy including equipment stipend and security expectations.',
    },
    {
      label: 'Performance Bonus',
      instruction: 'Draft a discretionary annual performance bonus clause based on company and individual OKRs.',
    },
    {
      label: 'At-Will & Notice Terms',
      instruction: 'Draft a clear at-will employment provision with mutual 30-day notice expectations.',
    },
  ];

  const handleGenerate = async () => {
    if (!instruction.trim() && !currentClause.trim()) return;
    setLoading(true);
    try {
      const effInstruction = instruction.trim() || 'Improve and elevate this legal clause';
      const results = await templateService.aiDraftClause(effInstruction, currentClause, tone);
      setSuggestions(results);
      setSelectedIdx(0);
    } catch {
      // Handled in service fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestions[selectedIdx]) {
      onApplyClause(suggestions[selectedIdx].suggestedClause);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Clause Drafter & Wording Assistant"
      subtitle="Generate, refine, or tone-adjust legal clauses and offer letter sections with compliant language"
      maxWidth="840px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSuggestions([]);
              setInstruction('');
            }}
            disabled={suggestions.length === 0}
            style={{ fontSize: '0.8125rem' }}
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-ai"
              disabled={loading || suggestions.length === 0}
              onClick={handleApply}
            >
              <Check size={16} />
              <span>Insert Refined Clause</span>
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Preset Chips */}
        <div>
          <label className="form-label" style={{ marginBottom: 6 }}>
            Quick Presets / Standard Sections:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setInstruction(preset.instruction)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: '#f1f5f9',
                  border: '1px solid var(--border-subtle)',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#c4b5fd';
                  e.currentTarget.style.color = '#7c3aed';
                  e.currentTarget.style.background = '#f5f3ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.background = '#f1f5f9';
                }}
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs: Instruction & Tone */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Drafting Instruction or Desired Clause Purpose</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Add 6-month equity cliff and patent assignment clause..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGenerate();
              }}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Desired Tone</label>
            <select
              className="form-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as AiWordingTone)}
            >
              <option value="formal">Executive & Formal</option>
              <option value="warm">Warm & Welcoming (Culture-First)</option>
              <option value="firm_legal">Firm & Legally Protective</option>
              <option value="concise">Concise & Direct</option>
            </select>
          </div>
        </div>

        {/* Existing Clause (Optional) */}
        <div>
          <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>
            Existing Text to Refine or Replace (Leave blank to generate fresh clause)
          </label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Paste raw draft sentence or paragraph here..."
            value={currentClause}
            onChange={(e) => setCurrentClause(e.target.value)}
          />
        </div>

        {/* Generate CTA Button */}
        <div>
          <button
            type="button"
            className="btn btn-ai"
            style={{ width: '100%', padding: '10px' }}
            disabled={loading || (!instruction.trim() && !currentClause.trim())}
            onClick={handleGenerate}
          >
            {loading ? (
              <>
                <div
                  className="spinner"
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                  }}
                />
                <span>Drafting with AI Language Engine...</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Generate Wording Suggestions</span>
              </>
            )}
          </button>
        </div>

        {/* Results Showcase */}
        {suggestions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#475569' }}>
                AI GENERATED SUGGESTION:
              </span>
              <span className="ai-badge" style={{ fontSize: '0.7rem' }}>
                Tone: {tone.toUpperCase()}
              </span>
            </div>

            {suggestions.map((sugg, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: 18,
                  border: '1px solid #ddd6fe',
                  background: '#fbfbfe',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Proposed Output Box */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ffffff',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    color: '#0f172a',
                    fontFamily: 'var(--font-sans)',
                  }}
                  dangerouslySetInnerHTML={{ __html: sugg.suggestedClause }}
                />

                {/* Compliance Notes & Rationale */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7c3aed', fontWeight: 500 }}>
                    <Sparkles size={14} />
                    <span>{sugg.rationale}</span>
                  </div>

                  {sugg.complianceNotes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 600 }}>
                      <ShieldCheck size={14} />
                      <span>{sugg.complianceNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
