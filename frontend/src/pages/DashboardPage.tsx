import React, { useState, useEffect } from 'react';
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
  Send,
  FileCheck2,
  XCircle,
  CalendarX,
  Layers,
  Edit3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge, AiAdvisoryBadge } from '../components/common/Badge.js';
import { AiAssist } from '../components/ai/AiAssist.js';
import { ExtractWithAi } from '../components/ai/ExtractWithAi.js';
import { GenerateWithAi } from '../components/ai/GenerateWithAi.js';
import { AiSuggestions, AiSuggestionItem } from '../components/ai/AiSuggestions.js';
import { OfferItem, AiCandidateExtractionData } from '../types/index.js';
import { DashboardStatistics } from '../types/offer.js';
import { offerService } from '../services/offerService.js';

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
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    total: 0,
    draft: 0,
    aiProcessing: 0,
    awaitingReview: 0,
    generated: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const data = await offerService.getDashboardStatistics();
        if (isMounted) {
          setStatistics(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExtraction = (extracted: AiCandidateExtractionData) => {
    // Navigate to AI Studio with the newly extracted data
    navigate('/ai-studio', { state: { extractedData: extracted } });
  };

  const statCards = [
    {
      id: 'total',
      title: 'Total',
      count: statistics.total,
      hint: 'All offer letters',
      icon: <Layers size={18} style={{ color: 'var(--primary)' }} />,
      borderColor: 'var(--border-medium)',
      statusFilter: 'ALL',
      color: '#fff',
    },
    {
      id: 'draft',
      title: 'Draft',
      count: statistics.draft,
      hint: 'Staged draft offers',
      icon: <Edit3 size={18} style={{ color: '#93c5fd' }} />,
      borderColor: 'rgba(147, 197, 253, 0.3)',
      statusFilter: 'DRAFT_AI',
      color: '#93c5fd',
    },
    {
      id: 'aiProcessing',
      title: 'AI Processing',
      count: statistics.aiProcessing,
      hint: 'Extraction & suggestions',
      icon: <Sparkles size={18} style={{ color: '#c084fc' }} />,
      borderColor: 'rgba(192, 132, 252, 0.3)',
      statusFilter: 'DRAFT_AI',
      color: '#c084fc',
    },
    {
      id: 'awaitingReview',
      title: 'Awaiting Review',
      count: statistics.awaitingReview,
      hint: 'HR & approver review',
      icon: <Clock size={18} style={{ color: '#fbbf24' }} />,
      borderColor: 'rgba(251, 191, 36, 0.3)',
      statusFilter: 'AWAITING_REVIEW',
      color: '#fbbf24',
    },
    {
      id: 'generated',
      title: 'Generated',
      count: statistics.generated,
      hint: 'Minted legal documents',
      icon: <FileCheck2 size={18} style={{ color: '#38bdf8' }} />,
      borderColor: 'rgba(56, 189, 248, 0.3)',
      statusFilter: 'APPROVED',
      color: '#38bdf8',
    },
    {
      id: 'sent',
      title: 'Sent',
      count: statistics.sent,
      hint: 'Dispatched to candidate',
      icon: <Send size={18} style={{ color: '#818cf8' }} />,
      borderColor: 'rgba(129, 140, 248, 0.3)',
      statusFilter: 'ISSUED',
      color: '#818cf8',
    },
    {
      id: 'accepted',
      title: 'Accepted',
      count: statistics.accepted,
      hint: 'Signed by candidate',
      icon: <CheckCircle2 size={18} style={{ color: '#34d399' }} />,
      borderColor: 'rgba(52, 211, 153, 0.3)',
      statusFilter: 'ACCEPTED',
      color: '#34d399',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      count: statistics.rejected,
      hint: 'Declined or revoked',
      icon: <XCircle size={18} style={{ color: '#f87171' }} />,
      borderColor: 'rgba(248, 113, 113, 0.3)',
      statusFilter: 'REJECTED',
      color: '#f87171',
    },
    {
      id: 'expired',
      title: 'Expired',
      count: statistics.expired,
      hint: 'Past deadline',
      icon: <CalendarX size={18} style={{ color: '#94a3b8' }} />,
      borderColor: 'rgba(148, 163, 184, 0.3)',
      statusFilter: 'EXPIRED',
      color: '#94a3b8',
    },
  ];

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

      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pipeline Overview</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Real-time offer lifecycle metrics across all stages
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/offers')}
          icon={<ArrowUpRight size={14} />}
          style={{ fontSize: '0.8125rem' }}
        >
          Manage All Offers
        </Button>
      </div>

      {/* 9 Dashboard Statistics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.id}
            className="glass-panel"
            onClick={() => navigate(`/offers?status=${card.statusFilter}`)}
            style={{
              padding: '18px 20px',
              cursor: 'pointer',
              borderColor: card.borderColor,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {card.title}
              </span>
              <div
                style={{
                  padding: 6,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {card.icon}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: card.color }}>
                {loadingStats ? '-' : card.count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
                {card.hint}
              </div>
            </div>
          </div>
        ))}
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
