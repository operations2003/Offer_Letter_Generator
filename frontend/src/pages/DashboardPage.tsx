import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileCheck2,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Eye,
  Send,
  Download,
  Upload,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  Copy,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge, AiAdvisoryBadge, HrConfirmedBadge } from '../components/common/Badge.js';
import { offerService } from '../services/offerService.js';
import { templateService } from '../services/templateService.js';
import { OfferListItem, DashboardStatistics } from '../types/offer.js';
import { OfferItem, OfferStatus } from '../types/index.js';
import { OfferTemplate } from '../types/template.js';
import { OfferDetailModal } from '../components/offers/OfferDetailModal.js';
import { EmailSendModal } from '../components/offers/EmailSendModal.js';
import { EmailHistoryModal } from '../components/offers/EmailHistoryModal.js';
import { useToast } from '../context/ToastContext.js';

const INITIAL_OFFERS: OfferListItem[] = [];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [stats, setStats] = useState<DashboardStatistics>({
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

  const [offers, setOffers] = useState<OfferListItem[]>(INITIAL_OFFERS);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Active Modals
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferListItem | null>(null);
  const [selectedOfferForEmail, setSelectedOfferForEmail] = useState<OfferListItem | null>(null);
  const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<OfferListItem | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, offersRes, templatesRes] = await Promise.all([
        offerService.getDashboardStatistics(),
        offerService.listOffers({ limit: 10 }),
        templateService.getTemplates(),
      ]);

      if (statsRes) setStats(statsRes);
      if (offersRes && Array.isArray(offersRes.items)) {
        setOffers(offersRes.items);
      }
      if (templatesRes && Array.isArray(templatesRes)) {
        setTemplates(templatesRes);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.candidateName.toLowerCase().includes(q) ||
        o.position.toLowerCase().includes(q) ||
        o.referenceNumber.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* 1. Executive Master Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090e1d 0%, #1e1b4b 50%, #0f172a 100%)',
          borderRadius: 20,
          padding: '32px 36px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 9999,
              background: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#c7d2fe',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} style={{ color: '#818cf8' }} />
            <span>TaskNera Enterprise &bull; Offer Letter Studio</span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            Offer Letter Command Center
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: 720,
              marginBottom: 24,
            }}
          >
            Author, audit, verify, and dispatch legally binding, tamper-evident offer letters.
            AI extraction provides structured recommendations while strict HR oversight ensures complete statutory compliance.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Button
              variant="primary"
              onClick={() => navigate('/offers?create=true')}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                boxShadow: '0 4px 18px var(--primary-glow)',
              }}
            >
              <Plus size={16} style={{ marginRight: 6 }} /> Create New Offer
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate('/templates')}
              style={{
                padding: '10px 18px',
                fontSize: '0.9rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <FileText size={16} style={{ marginRight: 6 }} /> Offer Templates
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate('/audit-logs')}
              style={{
                padding: '10px 18px',
                fontSize: '0.9rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <ShieldCheck size={16} style={{ marginRight: 6 }} /> Compliance Ledger
            </Button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            bottom: -60,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 2. Key Performance Indicators Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Offers
            </span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginTop: 8 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            All active & historical offers
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Awaiting HR Review
            </span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginTop: 8 }}>
            {stats.awaitingReview + stats.draft}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: 4, fontWeight: 500 }}>
            {stats.awaitingReview} pending audit sign-off
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Approved & Ready
            </span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginTop: 8 }}>
            {stats.generated}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Minted official documents
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Dispatched & Issued
            </span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', marginTop: 8 }}>
            {stats.sent}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
            Candidate portal token active
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Accepted Offers
            </span>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 8 }}>
            {stats.accepted}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>
            {Math.round((stats.accepted / Math.max(1, stats.sent)) * 100)}% Acceptance rate
          </div>
        </div>
      </div>

      {/* 3. Action Launchpad & Flow Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <div
          className="card"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #2563eb',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Upload size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  Candidate CV Upload
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Extract candidate details with AI
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Upload any candidate PDF, DOCX, or text file. The AI extraction parser structures names, contact details, experience, and proposed terms for strict HR confirmation.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/offers?create=true&step=2')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Upload Resume / Document <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Button>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #7c3aed',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(124, 58, 237, 0.1)',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  Approved Legal Templates
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Standard corporate letter blueprints
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Select an approved corporate template. Dynamic placeholder variables ensure candidate compensation, reporting lines, and probation terms are populated cleanly.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/templates')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Manage Templates Studio <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Button>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderLeft: '4px solid #059669',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  Compliance & Quality Audit
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Arithmetic & statutory verification
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Automated 9-point compliance checks verify compensation math, minimum wage statutory limits, and enforce the Non-Assumption Rule before official PDF generation.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/audit-logs')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            View Verification Logs <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Button>
        </div>
      </div>

      {/* 4. Active Offers Pipeline Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                Active Offers Pipeline
              </h2>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                }}
              >
                {filteredOffers.length} Offers
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Track lifecycle progression from draft to candidate signing and archival.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ fontSize: '0.8125rem', padding: '6px 12px', width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT_AI">Draft (AI)</option>
              <option value="HR_REVIEW">HR Review</option>
              <option value="APPROVED">Approved</option>
              <option value="ISSUED">Issued / Sent</option>
              <option value="ACCEPTED">Accepted</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 240 }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search candidate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 32, fontSize: '0.8125rem', padding: '6px 12px 6px 32px' }}
              />
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/offers')}
              style={{ fontSize: '0.8125rem', padding: '6px 14px' }}
            >
              View Full Pipeline <ChevronRight size={14} style={{ marginLeft: 4 }} />
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Candidate Details
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Position & Band
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Total Package (CTC)
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  Lifecycle Status
                </th>
                <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  AI Review
                </th>
                <th style={{ padding: '12px 20px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#94a3b8',
                        }}
                      >
                        <FileText size={24} />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9375rem' }}>
                        No offers generated yet
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: 360, margin: 0 }}>
                        Get started by creating a new offer letter or uploading candidate documents through the verified workflow.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => navigate('/offers?create=true')}
                        style={{ marginTop: 8 }}
                        icon={<Plus size={16} />}
                      >
                        Create First Offer
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOffers.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: '#0f172a',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          maxWidth: 240,
                          wordBreak: 'break-word',
                        }}
                        onClick={() => setSelectedOfferForDetail(o)}
                      >
                        <User size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{o.candidateName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, wordBreak: 'break-all' }}>
                        {o.email}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>
                        Ref: {o.referenceNumber}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px', maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#0f172a', wordBreak: 'break-word' }}>
                        {o.position}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {o.department} {o.bandGrade ? `• ${o.bandGrade}` : ''}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        ${o.totalCtc.toLocaleString()} {o.currency}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        Anticipated Join: {o.joiningDate ? new Date(o.joiningDate).toLocaleDateString() : 'TBD'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <OfferStatusBadge status={o.status as any} />
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {o.aiReviewStatus === 'VERIFIED_BY_HR' ? (
                        <HrConfirmedBadge label="HR Verified" />
                      ) : o.aiReviewStatus === 'OVERRIDDEN' ? (
                        <HrConfirmedBadge label="HR Overridden" />
                      ) : o.aiReviewStatus === 'PENDING_AI_REVIEW' ? (
                        <AiAdvisoryBadge label="AI Draft Review" />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Standard</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedOfferForDetail(o)}
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          title="View offer hub & preview"
                        >
                          <Eye size={13} style={{ marginRight: 4 }} /> View
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedOfferForEmail(o)}
                          style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#2563eb' }}
                          title="Send offer to candidate"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Approved Offer Templates Studio Showcase */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
              Corporate Offer Letter Blueprints
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Standard legal templates equipped with dynamic compensation tokens and statutory clauses.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/templates')}
            style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
          >
            View All Templates &rarr;
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              id: 'tmpl_full_time',
              title: 'Standard Full-Time Offer',
              category: 'FULL_TIME',
              desc: 'Comprehensive full-time permanent corporate offer letter with salary breakdown and benefits.',
              variables: 14,
            },
            {
              id: 'tmpl_executive',
              title: 'Executive Employment Agreement',
              category: 'EXECUTIVE',
              desc: 'High-level C-Suite and VP agreements featuring equity vesting, bonus targets, and covenants.',
              variables: 18,
            },
            {
              id: 'tmpl_internship',
              title: 'Internship & Trainee Agreement',
              category: 'INTERNSHIP',
              desc: 'Fixed-term student internship blueprint detailing mentor allocation, stipend, and duration.',
              variables: 11,
            },
            {
              id: 'tmpl_consultant',
              title: 'Independent Contractor Agreement',
              category: 'CONTRACT',
              desc: 'Consulting deliverables, invoicing milestones, IP assignment, and liability limits.',
              variables: 13,
            },
          ].map((t) => (
            <div
              key={t.id}
              style={{
                padding: 18,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {t.category}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {t.variables} Placeholders
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                  {t.title}
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                  {t.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/offers?create=true&template=${t.category}`)}
                style={{
                  marginTop: 16,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-medium)',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Use Template <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Detail / Preview Modal */}
      {selectedOfferForDetail && (
        <OfferDetailModal
          offer={{
            id: selectedOfferForDetail.id,
            referenceNumber: selectedOfferForDetail.referenceNumber,
            candidateName: selectedOfferForDetail.candidateName,
            email: selectedOfferForDetail.email,
            role: selectedOfferForDetail.position || selectedOfferForDetail.jobTitle || 'Role',
            department: selectedOfferForDetail.department,
            totalCtc: selectedOfferForDetail.totalCtc,
            currency: selectedOfferForDetail.currency,
            status: selectedOfferForDetail.status as OfferStatus,
            aiConfidence: selectedOfferForDetail.aiReviewStatus === 'VERIFIED_BY_HR' ? 0.98 : 0.85,
            createdAt: selectedOfferForDetail.offerDate || new Date().toISOString(),
          }}
          isOpen={true}
          onClose={() => setSelectedOfferForDetail(null)}
          onOfferUpdated={() => {
            loadDashboardData();
            setSelectedOfferForDetail(null);
            success('Offer updated successfully.');
          }}
        />
      )}

      {/* Send Email Modal */}
      {selectedOfferForEmail && (
        <EmailSendModal
          offerId={selectedOfferForEmail.id}
          offerReferenceNumber={selectedOfferForEmail.referenceNumber}
          isOpen={true}
          onClose={() => setSelectedOfferForEmail(null)}
          onSentSuccessfully={() => {
            setOffers((prev) =>
              prev.map((item) =>
                item.id === selectedOfferForEmail.id ? { ...item, status: 'ISSUED' } : item
              )
            );
            setSelectedOfferForEmail(null);
            success(`Formal offer letter successfully dispatched to ${selectedOfferForEmail.candidateName}.`);
          }}
          onViewHistory={() => {
            const toView = selectedOfferForEmail;
            setSelectedOfferForEmail(null);
            setSelectedOfferForHistory(toView);
          }}
        />
      )}

      {/* Email History Modal */}
      {selectedOfferForHistory && (
        <EmailHistoryModal
          offerId={selectedOfferForHistory.id}
          offerReferenceNumber={selectedOfferForHistory.referenceNumber}
          candidateName={selectedOfferForHistory.candidateName}
          isOpen={true}
          onClose={() => setSelectedOfferForHistory(null)}
        />
      )}
    </div>
  );
};
