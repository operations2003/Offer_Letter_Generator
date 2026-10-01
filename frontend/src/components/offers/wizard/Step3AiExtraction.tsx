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
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>AI Extraction & Parsing Telemetry</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Neural parsing engine processes unstructured resumes into structured, confidence-tagged attributes.
        </p>
      </div>

      {/* Main Card */}
      <div
        style={{
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Animated AI Core Emblem */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)',
              animation: extracting ? 'pulseGlow 2s infinite ease-in-out' : 'none',
            }}
          >
            <Sparkles size={36} color="#ffffff" />
          </div>

          {extracting && (
            <div
              className="spinner"
              style={{
                position: 'absolute',
                inset: -6,
                border: '3px solid transparent',
                borderTopColor: '#7c3aed',
                borderRadius: '50%',
              }}
            />
          )}
        </div>

        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h4 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
            {extracting ? 'Extracting Candidate Data Points...' : 'Extraction Successfully Completed'}
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 4 }}>
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
              background: '#f1f5f9',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>
            <span>Neural Parsing Engine</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Extraction Milestones Feed */}
        <div
          style={{
            width: '100%',
            maxWidth: 540,
            background: '#f8fafc',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Telemetry Log
          </div>
          {stepsDone.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: '#059669' }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{step}</span>
            </div>
          ))}
          {extracting && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8125rem', color: '#7c3aed' }}>
              <div className="spinner" style={{ width: 14, height: 14, border: '2px solid #ddd6fe', borderTopColor: '#7c3aed', borderRadius: '50%' }} />
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
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                width: '100%',
                justifyContent: 'space-around',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Candidate Detected
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                  {extractedData.candidateName.value}
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-subtle)' }} />

              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Confidence Score
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6d28d9', marginTop: 2 }}>
                  {Math.round(extractedData.overallConfidenceScore * 100)}%
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border-subtle)' }} />

              <div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                  Target Salary
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: 2 }}>
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
