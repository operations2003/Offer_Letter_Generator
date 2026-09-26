import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Wand2, RefreshCw } from 'lucide-react';
import { ExtractWithAi } from '../components/ai/ExtractWithAi.js';
import { GenerateWithAi } from '../components/ai/GenerateWithAi.js';
import { ReviewAiOutput } from '../components/ai/ReviewAiOutput.js';
import { MissingInformation } from '../components/ai/MissingInformation.js';
import { ImproveWithAi } from '../components/ai/ImproveWithAi.js';
import { AiCandidateExtractionData, HrConfirmedTerms } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';

const DEFAULT_EXTRACTION: AiCandidateExtractionData = {
  candidateName: {
    value: 'Jane Doe',
    confidenceScore: 0.98,
    sourceSnippet: 'Jane Doe - Senior Full Stack Engineer (7.5 years experience)',
  },
  email: {
    value: 'jane.doe@example.com',
    confidenceScore: 0.96,
    sourceSnippet: 'jane.doe@example.com',
  },
  phone: {
    value: '+1 (555) 349-2041',
    confidenceScore: 0.91,
    sourceSnippet: '+1 (555) 349-2041',
  },
  currentEmployer: {
    value: 'Stripe Technologies Inc.',
    confidenceScore: 0.94,
    sourceSnippet: 'Senior Full Stack Engineer at Stripe Technologies Inc.',
  },
  currentTitle: {
    value: 'Senior Full Stack Engineer',
    confidenceScore: 0.92,
    sourceSnippet: 'Senior Full Stack Engineer (2021 - Present)',
  },
  offeredRole: {
    value: 'Lead Platform Architect',
    confidenceScore: 0.95,
    sourceSnippet: 'Interview Debrief: Target role is Lead Platform Architect',
  },
  department: {
    value: 'Core Infrastructure & Engineering',
    confidenceScore: 0.9,
    sourceSnippet: 'Core Infrastructure & Engineering',
  },
  experienceYears: {
    value: 7.5,
    confidenceScore: 0.89,
    sourceSnippet: '7.5 years of distributed systems experience',
  },
  proposedJoiningDate: {
    value: '2026-11-01',
    confidenceScore: 0.85,
    sourceSnippet: 'Earliest start date: First week of November 2026',
  },
  currency: {
    value: 'USD',
    confidenceScore: 0.99,
    sourceSnippet: 'USD standard',
  },
  baseSalary: {
    value: 155000,
    confidenceScore: 0.94,
    sourceSnippet: 'Base compensation proposed: $155,000 USD',
  },
  hraAllowance: {
    value: 25000,
    confidenceScore: 0.88,
    sourceSnippet: 'Housing allowance: $25,000',
  },
  specialAllowances: {
    value: 12000,
    confidenceScore: 0.85,
    sourceSnippet: 'Special wellness/tech allowance: $12,000',
  },
  performanceBonus: {
    value: 22000,
    confidenceScore: 0.89,
    sourceSnippet: '15% annual target bonus: $22,000',
  },
  joiningBonus: {
    value: 15000,
    confidenceScore: 0.92,
    sourceSnippet: 'Sign-on joining bonus: $15,000 payable upon 30 days',
  },
  totalCtc: {
    value: 229000,
    confidenceScore: 0.96,
    sourceSnippet: 'Total annual CTC: $229,000',
  },
  overallConfidenceScore: 0.94,
  warnings: [],
};

export const AiStudioPage: React.FC = () => {
  const location = useLocation();
  const initialData = (location.state as any)?.extractedData || DEFAULT_EXTRACTION;
  const [aiData, setAiData] = useState<AiCandidateExtractionData>(initialData);
  const [nonCompeteText, setNonCompeteText] = useState(
    'The Employee agrees not to compete with the Company in identical software architecture domains for a period of twelve months following separation.'
  );
  const { success } = useToast();

  const handleConfirmedSave = (confirmed: HrConfirmedTerms, overrides: any[]) => {
    success(`Offer for ${confirmed.candidateName} confirmed by HR! Overrides logged: ${overrides.length}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Sparkles size={22} style={{ color: 'var(--ai-purple)' }} />
            <h2 style={{ fontSize: '1.4rem' }}>AI Extraction & Verification Studio</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Interactive review console enforcing strict data segregation: AI Advisory terms vs. HR
            Legally Confirmed terms.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <GenerateWithAi onGenerated={(data) => setAiData(data)} />
          <ExtractWithAi onExtractionComplete={(data) => setAiData(data)} />
        </div>
      </div>

      {/* Missing Information Component */}
      <MissingInformation
        aiData={aiData}
        onFieldFilled={(field, val) => {
          setAiData((prev) => ({
            ...prev,
            [field]: { value: val, confidenceScore: 1.0, sourceSnippet: 'Human HR Entry' },
          }));
        }}
      />

      {/* Main Split-Screen Review AI Output Component */}
      <ReviewAiOutput aiData={aiData} onConfirmAndSave={handleConfirmedSave} />

      {/* Specialized Legal Drafting Sandbox */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h4 style={{ fontSize: '1rem' }}>Custom Restrictive Covenants & Clauses</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Tune individual clauses before inclusion in the final PDF template.
            </p>
          </div>
          <ImproveWithAi
            clauseTitle="Non-Compete Clause"
            initialText={nonCompeteText}
            onApplyImprovement={(improved) => setNonCompeteText(improved)}
          />
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          }}
        >
          {nonCompeteText}
        </div>
      </div>
    </div>
  );
};
