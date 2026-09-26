import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Wand2, RefreshCw } from 'lucide-react';
import { ExtractWithAi } from '../components/ai/ExtractWithAi.js';
import { GenerateWithAi } from '../components/ai/GenerateWithAi.js';
import { ReviewAiOutput } from '../components/ai/ReviewAiOutput.js';
import { MissingInformation } from '../components/ai/MissingInformation.js';
import { ImproveWithAi } from '../components/ai/ImproveWithAi.js';
import { AiAssist } from '../components/ai/AiAssist.js';
import { AiCandidateExtractionData, HrConfirmedTerms } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';

const DEFAULT_EXTRACTION: AiCandidateExtractionData = {
  candidateName: {
    value: 'Jane Doe',
    confidenceScore: 0.98,
    sourceSnippet: 'Jane Doe - Senior Full Stack Engineer (7.5 years experience)',
    isDetected: true,
  },
  email: {
    value: 'jane.doe@example.com',
    confidenceScore: 0.96,
    sourceSnippet: 'jane.doe@example.com',
    isDetected: true,
  },
  phone: {
    value: '+1 (555) 349-2041',
    confidenceScore: 0.91,
    sourceSnippet: '+1 (555) 349-2041',
    isDetected: true,
  },
  address: {
    value: '452 Mission Street, Suite 1200, San Francisco, CA 94105',
    confidenceScore: 0.92,
    sourceSnippet: '452 Mission Street, San Francisco',
    isDetected: true,
  },
  qualification: {
    value: 'Master of Science in Computer Science, Stanford University',
    confidenceScore: 0.95,
    sourceSnippet: 'MS in CS, Stanford University',
    isDetected: true,
  },
  experience: {
    value: '7.5 years',
    confidenceScore: 0.92,
    sourceSnippet: '7.5 years in distributed systems',
    isDetected: true,
  },
  designation: {
    value: 'Lead Platform Architect',
    confidenceScore: 0.95,
    sourceSnippet: 'Target role is Lead Platform Architect',
    isDetected: true,
  },
  department: {
    value: 'Core Infrastructure & Engineering',
    confidenceScore: 0.9,
    sourceSnippet: 'Core Infrastructure & Engineering',
    isDetected: true,
  },
  location: {
    value: 'San Francisco, CA (Hybrid)',
    confidenceScore: 0.9,
    sourceSnippet: 'San Francisco, CA (Hybrid)',
    isDetected: true,
  },
  joiningDate: {
    value: '2026-11-01',
    confidenceScore: 0.85,
    sourceSnippet: 'Earliest start date: First week of November 2026',
    isDetected: true,
  },
  employmentType: {
    value: 'Full-time',
    confidenceScore: 0.96,
    sourceSnippet: 'Full-time permanent',
    isDetected: true,
  },
  reportingManager: {
    value: 'Marcus Vance, VP of Engineering',
    confidenceScore: 0.92,
    sourceSnippet: 'Reporting to Marcus Vance, VP of Engineering',
    isDetected: true,
  },
  otherDetails: {
    value: 'AWS Solutions Architect Professional certified. 30-day notice period.',
    confidenceScore: 0.88,
    sourceSnippet: 'Notes section',
    isDetected: true,
  },
  currency: {
    value: 'USD',
    confidenceScore: 0.99,
    sourceSnippet: 'USD standard',
    isDetected: true,
  },
  baseSalary: {
    value: 155000,
    confidenceScore: 0.94,
    sourceSnippet: 'Base compensation proposed: $155,000 USD',
    isDetected: true,
  },
  hraAllowance: {
    value: 25000,
    confidenceScore: 0.88,
    sourceSnippet: 'Housing allowance: $25,000',
    isDetected: true,
  },
  specialAllowances: {
    value: 12000,
    confidenceScore: 0.85,
    sourceSnippet: 'Special wellness/tech allowance: $12,000',
    isDetected: true,
  },
  performanceBonus: {
    value: 22000,
    confidenceScore: 0.89,
    sourceSnippet: '15% annual target bonus: $22,000',
    isDetected: true,
  },
  joiningBonus: {
    value: 15000,
    confidenceScore: 0.92,
    sourceSnippet: 'Sign-on joining bonus: $15,000 payable upon 30 days',
    isDetected: true,
  },
  totalCtc: {
    value: 229000,
    confidenceScore: 0.96,
    sourceSnippet: 'Total annual CTC: $229,000',
    isDetected: true,
  },
  overallConfidenceScore: 0.94,
  warnings: [],
  missingFields: [],
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

      {/* AI Assistant Co-Pilot (Generate / Improve / Regenerate / In-Place Edit / Accept / Reject) */}
      <AiAssist
        contextData={{
          candidateName: aiData.candidateName?.value,
          jobTitle: aiData.designation?.value,
          department: aiData.department?.value,
          location: aiData.location?.value,
          baseSalary: aiData.baseSalary?.value,
        }}
        onApplyAction={(actionType, result) => {
          if (actionType === 'general_clauses' || actionType === 'custom_hr_clauses') {
            setNonCompeteText(result.content);
          }
        }}
      />

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
