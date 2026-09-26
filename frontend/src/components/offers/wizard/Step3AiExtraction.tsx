import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileSearch,
} from 'lucide-react';
import { AiCandidateExtractionData } from '../../../types/index.js';
import { offerService } from '../../../services/offerService.js';

interface Step3AiExtractionProps {
  documentText: string;
  onExtractionSuccess: (data: AiCandidateExtractionData) => void;
  onNextStep: () => void;
}

export const Step3AiExtraction: React.FC<Step3AiExtractionProps> = ({
  documentText,
  onExtractionSuccess,
  onNextStep,
}) => {
  const [extracting, setExtracting] = useState(true);
  const [progress, setProgress] = useState(15);
  const [extractedData, setExtractedData] = useState<AiCandidateExtractionData | null>(null);
  const [stepsDone, setStepsDone] = useState<string[]>([]);

  useEffect(() => {
    runExtraction();
  }, []);

  const runExtraction = async () => {
    setExtracting(true);
    setProgress(15);
    setStepsDone([]);

    // Progress milestone simulations for smooth UX
    setTimeout(() => {
      setProgress(40);
      setStepsDone((prev) => [...prev, 'Parsed document typography and semantic headings']);
    }, 600);

    setTimeout(() => {
      setProgress(70);
      setStepsDone((prev) => [...prev, 'Extracted candidate contact details and experience records']);
    }, 1200);

    try {
      const data = await offerService.extractCandidateData(documentText);
      setTimeout(() => {
        setProgress(100);
        setStepsDone((prev) => [
          ...prev,
          'Normalized compensation expectation and calculated confidence score',
        ]);
        setExtractedData(data);
        onExtractionSuccess(data);
        setExtracting(false);
      }, 1800);
    } catch {
      setExtracting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
            3
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Extraction & Parsing Telemetry</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Neural parsing engine processes unstructured resumes into structured, confidence-tagged attributes.
        </p>
      </div>

      {/* Main Glass Card */}
      <div
        className="glass-panel"
        style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          background: 'rgba(15, 21, 35, 0.85)',
          border: '1px solid var(--ai-border)',
          boxShadow: '0 0 30px var(--ai-glow)',
        }}
      >
        {/* Animated AI Core Emblem */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'var(--ai-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px var(--ai-glow)',
              animation: extracting ? 'pulseGlow 2s infinite ease-in-out' : 'none',
            }}
          >
            <Sparkles size={36} color="#fff" />
          </div>

          {extracting && (
            <div
              className="spinner"
              style={{
                position: 'absolute',
                inset: -6,
                border: '3px solid transparent',
                borderTopColor: '#c084fc',
                borderRadius: '50%',
              }}
            />
          )}
        </div>

        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
            {extracting ? 'Extracting Candidate Data Points...' : 'Extraction Successfully Completed'}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {extracting
              ? 'Model: Llama-3.3-70B-Versatile • Processing prompt tokens and applying guardrail filters.'
              : 'All candidate attributes parsed and tagged with confidence scores for HR confirmation.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', maxWidth: 540 }}>
          <div
            style={{
              height: 8,
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'var(--ai-gradient)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 6 }}>
            <span>Neural Parsing Engine</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Extraction Milestones Feed */}
        <div
          style={{
            width: '100%',
            maxWidth: 540,
            background: 'var(--bg-primary)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Telemetry Log
          </div>
          {stepsDone.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: '#34d399' }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{step}</span>
            </div>
          ))}
          {extracting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: '#c084fc' }}>
              <div className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(192, 132, 252, 0.4)', borderTopColor: '#c084fc', borderRadius: '50%' }} />
              <span>Synthesizing entity values & matching against offer schema...</span>
            </div>
          )}
        </div>

        {/* Completion Overview & Next Action */}
        {!extracting && extractedData && (
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 540,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 20,
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                width: '100%',
                justifyContent: 'space-around',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Candidate Detected
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
                  {extractedData.candidateName.value}
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-subtle)' }} />

              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Confidence Score
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#c084fc', marginTop: 2 }}>
                  {Math.round(extractedData.overallConfidenceScore * 100)}%
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-subtle)' }} />

              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Target Salary
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginTop: 2 }}>
                  ${extractedData.baseSalary.value?.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.9375rem' }}
              onClick={onNextStep}
            >
              <span>Proceed to AI vs HR Data Review</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
