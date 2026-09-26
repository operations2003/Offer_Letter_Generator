import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge, AiAdvisoryBadge } from '../components/common/Badge.js';
import { AiAssist } from '../components/ai/AiAssist.js';
import { ExtractWithAi } from '../components/ai/ExtractWithAi.js';
import { GenerateWithAi } from '../components/ai/GenerateWithAi.js';
import { AiSuggestions, AiSuggestionItem } from '../components/ai/AiSuggestions.js';
import { OfferItem, AiCandidateExtractionData } from '../types/index.js';

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: 'off_001',
    referenceNumber: 'OFF-2026-0042',
    candidateName: 'Jane Doe',
    email: 'jane.doe@example.com',
    role: 'Lead Platform Architect',
    department: 'Engineering',
    totalCtc: 229000,
    currency: 'USD',
    status: 'HR_REVIEW',
    aiConfidence: 0.94,
    createdAt: '2026-09-26T08:30:00Z',
  },
  {
    id: 'off_002',
    referenceNumber: 'OFF-2026-0041',
    candidateName: 'Carlos Rivera',
    email: 'carlos.rivera@designtech.io',
    role: 'Staff Design Systems Engineer',
    department: 'Product Experience',
    totalCtc: 195000,
    currency: 'USD',
    status: 'DRAFT_AI',
    aiConfidence: 0.96,
    createdAt: '2026-09-25T14:15:00Z',
  },
  {
    id: 'off_003',
    referenceNumber: 'OFF-2026-0040',
    candidateName: 'Priya Sharma',
    email: 'priya.s@techlead.org',
    role: 'Director of Machine Learning',
    department: 'AI Research',
    totalCtc: 285000,
    currency: 'USD',
    status: 'PENDING_APPROVAL',
    aiConfidence: 0.91,
    createdAt: '2026-09-24T11:00:00Z',
  },
  {
    id: 'off_004',
    referenceNumber: 'OFF-2026-0039',
    candidateName: 'Liam O’Connor',
    email: 'liam.oc@cloudops.net',
    role: 'Senior DevOps Specialist',
    department: 'Cloud Infrastructure',
    totalCtc: 165000,
    currency: 'USD',
    status: 'APPROVED',
    aiConfidence: 0.88,
    createdAt: '2026-09-22T09:45:00Z',
  },
];

const INITIAL_SUGGESTIONS: AiSuggestionItem[] = [
  {
    id: 'sug_1',
    type: 'SALARY_BAND',
    title: 'Compensation Benchmark Alert (Jane Doe)',
    description: 'Proposed base of $155,000 is at the 82nd percentile for Lead Platform Architect in North America.',
    recommendedAction: 'Verify against department L6 band limit ($160,000 maximum).',
    confidenceScore: 0.92,
    impact: 'MEDIUM',
  },
  {
    id: 'sug_2',
    type: 'POLICY',
    title: 'Standard Notice Period Conformance',
    description: 'Executive candidates require 60-day notice period instead of standard 30-day term.',
    recommendedAction: 'Apply Executive Notice Clause from Template Library.',
    confidenceScore: 0.95,
    impact: 'HIGH',
  },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  const [suggestions, setSuggestions] = useState<AiSuggestionItem[]>(INITIAL_SUGGESTIONS);

  const handleExtraction = (extracted: AiCandidateExtractionData) => {
    // Navigate to AI Studio with the newly extracted data
    navigate('/ai-studio', { state: { extractedData: extracted } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ fontSize: '1.5rem' }}>Welcome back, {user?.firstName}</h2>
            <span className="hr-badge">{user?.roles?.[0]}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 640 }}>
            {user?.company?.name} — All candidate extractions are staged as advisory drafts for
            human review. AI models never finalize offers without your confirmation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <GenerateWithAi onGenerated={handleExtraction} />
          <ExtractWithAi onExtractionComplete={handleExtraction} />
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Active Offers</span>
            <FileText size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>24</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} />
            <span>+4 this week</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderColor: 'rgba(96, 165, 250, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pending HR Review</span>
            <Clock size={18} style={{ color: '#60a5fa' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#60a5fa' }}>4</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            AI Drafts awaiting confirmation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pending Approval</span>
            <CheckCircle2 size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fbbf24' }}>3</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Submitted to Department Approvers
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 20, borderColor: 'var(--ai-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>AI Extraction Confidence</span>
            <Sparkles size={18} style={{ color: 'var(--ai-purple)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#c084fc' }}>94.2%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Average across last 50 extractions
          </div>
        </div>
      </div>

      {/* AI Assistant Co-Pilot Bar */}
      <AiAssist />

      {/* Two Column Layout: Offers Pipeline & AI Suggestions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Recent Offers Table */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Recent Offer Letters</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Track real-time status from AI draft to issuance
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/offers')}
              icon={<ArrowUpRight size={14} />}
              style={{ fontSize: '0.8125rem' }}
            >
              View All Offers
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '10px 14px' }}>Candidate & Role</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Total CTC</th>
                  <th style={{ padding: '10px 14px' }}>AI Confidence</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{offer.candidateName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {offer.role} • {offer.department}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <OfferStatusBadge status={offer.status} />
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600 }}>
                      ${offer.totalCtc.toLocaleString()} {offer.currency}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <AiAdvisoryBadge confidence={offer.aiConfidence} label="" />
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => navigate('/ai-studio')}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Advisory Suggestions Column */}
        <AiSuggestions
          suggestions={suggestions}
          onApply={(id) => setSuggestions(suggestions.filter((s) => s.id !== id))}
          onDismiss={(id) => setSuggestions(suggestions.filter((s) => s.id !== id))}
        />
      </div>
    </div>
  );
};
