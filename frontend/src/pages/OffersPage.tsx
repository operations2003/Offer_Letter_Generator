import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge, AiAdvisoryBadge } from '../components/common/Badge.js';
import { ExtractWithAi } from '../components/ai/ExtractWithAi.js';
import { OfferItem, OfferStatus, AiCandidateExtractionData } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { OfferGeneratorWizard } from '../components/offers/wizard/OfferGeneratorWizard.js';
import { GeneratedOfferResult } from '../types/offer.js';

const MOCK_OFFERS: OfferItem[] = [
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
  {
    id: 'off_005',
    referenceNumber: 'OFF-2026-0038',
    candidateName: 'Emily Watson',
    email: 'emily.w@fintech.co',
    role: 'VP of Product Engineering',
    department: 'Executive',
    totalCtc: 320000,
    currency: 'USD',
    status: 'ISSUED',
    aiConfidence: 0.97,
    createdAt: '2026-09-20T16:20:00Z',
  },
];

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<OfferItem[]>(MOCK_OFFERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchParams, setSearchParams] = useSearchParams();
  const [isWizardOpen, setIsWizardOpen] = useState(() => searchParams.get('create') === 'true');
  const navigate = useNavigate();
  const { success } = useToast();

  const handleOfferCreated = (newOfferResult: GeneratedOfferResult) => {
    const newOfferItem: OfferItem = {
      id: newOfferResult.id,
      referenceNumber: newOfferResult.referenceNumber,
      candidateName: 'Verified Candidate',
      email: 'candidate@verified.org',
      role: 'Role Ratified & Issued',
      department: 'HR Operations',
      totalCtc: 185000,
      currency: 'USD',
      status: 'ISSUED',
      aiConfidence: 0.98,
      createdAt: newOfferResult.createdAt || new Date().toISOString(),
    };

    setOffers((prev) => [newOfferItem, ...prev]);
    setIsWizardOpen(false);
    searchParams.delete('create');
    setSearchParams(searchParams);
    success(`Offer ${newOfferResult.referenceNumber} generated successfully!`);
  };

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExtraction = (extracted: AiCandidateExtractionData) => {
    navigate('/ai-studio', { state: { extractedData: extracted } });
  };

  if (isWizardOpen) {
    return (
      <OfferGeneratorWizard
        onCancel={() => {
          setIsWizardOpen(false);
          searchParams.delete('create');
          setSearchParams(searchParams);
        }}
        onSuccess={handleOfferCreated}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Title & Actions Bar */}
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
          <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Offers Pipeline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Lifecycle management: AI Draft → HR Review → Department Approval → Issued PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="primary"
            icon={<Sparkles size={16} />}
            onClick={() => setIsWizardOpen(true)}
          >
            Generate Offer (11-Step Flow)
          </Button>
          <ExtractWithAi onExtractionComplete={handleExtraction} triggerButtonText="AI Quick Extract" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search candidate, role, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['ALL', 'DRAFT_AI', 'HR_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`btn ${selectedStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '12px 14px' }}>Reference</th>
                <th style={{ padding: '12px 14px' }}>Candidate</th>
                <th style={{ padding: '12px 14px' }}>Role & Department</th>
                <th style={{ padding: '12px 14px' }}>Total CTC</th>
                <th style={{ padding: '12px 14px' }}>Workflow Status</th>
                <th style={{ padding: '12px 14px' }}>AI Confidence</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((o) => (
                <tr
                  key={o.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {o.referenceNumber}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{o.candidateName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.email}</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 500 }}>{o.role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{o.department}</div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: 600 }}>
                    ${o.totalCtc.toLocaleString()} {o.currency}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <OfferStatusBadge status={o.status} />
                  </td>
                  <td style={{ padding: '14px' }}>
                    <AiAdvisoryBadge confidence={o.aiConfidence} label="" />
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button
                        variant="secondary"
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        onClick={() => navigate('/ai-studio')}
                        title="Review AI Output vs Confirmed Data"
                      >
                        Review
                      </Button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '6px' }}
                        title="Download Final PDF"
                        onClick={() => success(`Simulating PDF download for ${o.referenceNumber}`)}
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
