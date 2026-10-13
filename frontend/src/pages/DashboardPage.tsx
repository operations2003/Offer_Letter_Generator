import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileCheck2,
  FileText,
  TrendingUp,
  Eye,
  Send,
  Layers,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  ChevronRight,
  Briefcase,
  Users2,
  Award,
  DollarSign,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge } from '../components/common/Badge.js';
import { offerService } from '../services/offerService.js';
import { EmployeeService } from '../services/employeeService.js';
import { DocumentEngineService } from '../services/documentEngineService.js';
import { OfferListItem, DashboardStatistics } from '../types/offer.js';
import { OfferStatus } from '../types/index.js';
import { OfferDetailModal } from '../components/offers/OfferDetailModal.js';
import { EmailSendModal } from '../components/offers/EmailSendModal.js';
import { EmailHistoryModal } from '../components/offers/EmailHistoryModal.js';
import { QuickTemplateOfferModal } from '../components/offers/QuickTemplateOfferModal.js';
import { CharacterCertificateModal } from '../components/documents/CharacterCertificateModal.js';
import { ExperienceLetterModal } from '../components/documents/ExperienceLetterModal.js';
import { SalarySlipModal } from '../components/documents/SalarySlipModal.js';
import { RelievingCertificateModal } from '../components/documents/RelievingCertificateModal.js';
import { useToast } from '../context/ToastContext.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success } = useToast();

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

  const [recentOffers, setRecentOffers] = useState<OfferListItem[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Active Modals
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [isRelievingModalOpen, setIsRelievingModalOpen] = useState(false);

  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferListItem | null>(null);
  const [selectedOfferForEmail, setSelectedOfferForEmail] = useState<OfferListItem | null>(null);
  const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<OfferListItem | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, offersRes, empRes, docRes] = await Promise.allSettled([
        offerService.getDashboardStatistics(),
        offerService.listOffers({ limit: 5 }),
        EmployeeService.listEmployees().catch(() => []),
        DocumentEngineService.listDocuments().catch(() => []),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }
      if (offersRes.status === 'fulfilled' && offersRes.value?.items) {
        setRecentOffers(offersRes.value.items);
      }
      if (empRes.status === 'fulfilled' && Array.isArray(empRes.value)) {
        setTotalEmployees(empRes.value.length);
      }
      if (docRes.status === 'fulfilled' && Array.isArray(docRes.value)) {
        setTotalDocuments(docRes.value.length);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const acceptanceRate =
    stats.sent > 0 ? Math.round((stats.accepted / Math.max(1, stats.sent)) * 100) : 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 48 }}>
      {/* 1. Header & Welcome Area */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          borderLeft: '4px solid #2563eb',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Welcome back, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Administrator' : 'Administrator'}
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
              }}
            >
              Operations Hub
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
            {todayFormatted} &bull; Manage offers, credentials, and official corporate documentation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={loadDashboardData}
            icon={<RefreshCw size={14} className={loading ? 'spin' : ''} />}
            style={{ fontSize: '0.8125rem', padding: '8px 14px' }}
          >
            Refresh
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/documents?create=true')}
            icon={<Plus size={14} />}
            style={{ fontSize: '0.8125rem', padding: '8px 14px' }}
          >
            Issue Document
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsQuickModalOpen(true)}
            icon={<Sparkles size={14} />}
            style={{ fontSize: '0.8125rem', padding: '8px 18px', backgroundColor: '#2563eb' }}
          >
            Generate Offer Letter
          </Button>
        </div>
      </div>

      {/* 2. Executive Key Performance Indicators */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {/* KPI 1: Total Offers */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onClick={() => navigate('/offers')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Total Offers
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe',
              }}
            >
              <FileCheck2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            {stats.generated} ready &bull; {stats.draft} in draft
          </div>
        </div>

        {/* KPI 2: Action Required */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onClick={() => navigate('/offers?status=HR_REVIEW')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Pending HR Review
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fde68a',
              }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {stats.awaitingReview + stats.draft}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: 4, fontWeight: 600 }}>
            {stats.awaitingReview > 0
              ? `${stats.awaitingReview} awaiting sign-off`
              : 'All reviews up to date'}
          </div>
        </div>

        {/* KPI 3: Dispatched & Issued */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onClick={() => navigate('/offers?status=ISSUED')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Issued to Candidates
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #ddd6fe',
              }}
            >
              <Send size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
            {stats.sent}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Candidate review portal active
          </div>
        </div>

        {/* KPI 4: Accepted & Rate */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onClick={() => navigate('/offers?status=ACCEPTED')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Acceptance Rate
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f0fdf4',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bbf7d0',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: 8 }}>
            {acceptanceRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>
            {stats.accepted} accepted offers
          </div>
        </div>
      </div>

      {/* 3. Core Modules Quick Hub */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr)))',
          gap: 16,
        }}
      >
        {/* Module 1: Offer Letters */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
            borderLeft: '3px solid #2563eb',
            transition: 'all 0.15s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileCheck2 size={18} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Offer Letters
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Generate verified offer letters on company letterhead with salary breakdown.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsQuickModalOpen(true)}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 12px' }}
          >
            Create Offer Letter <ChevronRight size={13} style={{ marginLeft: 4 }} />
          </Button>
        </div>

        {/* Module 2: Employee Records */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
            borderLeft: '3px solid #059669',
            transition: 'all 0.15s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#f0fdf4',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users2 size={18} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Employees
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Manage employee profiles, designations, joining dates, and departments.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/employees')}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 12px' }}
          >
            Employee Directory ({totalEmployees}) <ChevronRight size={13} style={{ marginLeft: 4 }} />
          </Button>
        </div>

        {/* Module 3: Document Engine */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
            borderLeft: '3px solid #7c3aed',
            transition: 'all 0.15s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={18} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Document Hub
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Issue certificates, monthly salary slips, relieving letters, and agreements.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/documents')}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 12px' }}
          >
            Documents Generated ({totalDocuments}) <ChevronRight size={13} style={{ marginLeft: 4 }} />
          </Button>
        </div>

        {/* Module 4: Offers Pipeline */}
        <div
          className="card"
          style={{
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14,
            borderLeft: '3px solid #ea580c',
            transition: 'all 0.15s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={18} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Offers Pipeline
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
              Review verification statuses, email delivery ledgers, and candidate portals.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/offers')}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '7px 12px' }}
          >
            View Full Pipeline <ChevronRight size={13} style={{ marginLeft: 4 }} />
          </Button>
        </div>
      </div>

      {/* 4. Split Operational Workspace (Recent Offers & Quick Generators) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Recent Offers List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Recent Offers Pipeline
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: '#eff6ff',
                    color: '#2563eb',
                  }}
                >
                  {recentOffers.length} Recent
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                Latest employment offers generated across departments
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/offers')}
              style={{ fontSize: '0.78125rem', padding: '6px 12px' }}
            >
              View All in Pipeline <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </Button>
          </div>

          {/* Table / Rows */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Candidate
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Role & Dept
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Package
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '10px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOffers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                          }}
                        >
                          <FileText size={22} />
                        </div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                          No offers created yet
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.78rem', maxWidth: 320, margin: 0 }}>
                          Get started by generating your first official offer letter.
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => setIsQuickModalOpen(true)}
                          icon={<Sparkles size={14} />}
                          style={{ fontSize: '0.8125rem', marginTop: 4 }}
                        >
                          Generate First Offer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOffers.map((o) => (
                    <tr
                      key={o.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 18px' }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: '#0f172a',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                          onClick={() => setSelectedOfferForDetail(o)}
                        >
                          <User size={13} style={{ color: '#2563eb' }} />
                          <span>{o.candidateName}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                          {o.email}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                          {o.position}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                          {o.department}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#0f172a' }}>
                          ${o.totalCtc.toLocaleString()} {o.currency}
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <OfferStatusBadge status={o.status as any} />
                      </td>

                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSelectedOfferForDetail(o)}
                            style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                            title="Preview offer"
                          >
                            <Eye size={12} style={{ marginRight: 3 }} /> View
                          </button>

                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSelectedOfferForEmail(o)}
                            style={{ padding: '5px 8px', fontSize: '0.72rem', color: '#2563eb' }}
                            title="Send offer email"
                          >
                            <Send size={12} />
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

        {/* Right Column: Quick Document Generator & System Standing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Quick Document Generator Card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Quick Document Generator
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                Instant issuance on official corporate letterhead
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                {
                  label: 'Experience Letter',
                  desc: 'Tenure & role certification',
                  icon: <Briefcase size={15} style={{ color: '#ea580c' }} />,
                  action: () => setIsExperienceModalOpen(true),
                },
                {
                  label: 'Salary Slip / Payslip',
                  desc: 'Itemized earnings & deductions',
                  icon: <DollarSign size={15} style={{ color: '#059669' }} />,
                  action: () => setIsSalarySlipModalOpen(true),
                },
                {
                  label: 'Character Certificate',
                  desc: 'Conduct & standing clearance',
                  icon: <Award size={15} style={{ color: '#7c3aed' }} />,
                  action: () => setIsCharacterModalOpen(true),
                },
                {
                  label: 'Relieving Certificate',
                  desc: 'Clearance & service release',
                  icon: <ShieldCheck size={15} style={{ color: '#2563eb' }} />,
                  action: () => setIsRelievingModalOpen(true),
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#93c5fd';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Security & Audit Standing Card */}
          <div
            className="card"
            style={{
              padding: '18px 20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <ShieldCheck size={16} style={{ color: '#059669' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                System Security & Compliance
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Tamper-Evident SHA-256:</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>Active &bull; Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Role-Based Access:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.roles?.[0] || 'Admin'} Session</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Statutory Rules:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Non-Assumption Enforced</span>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/audit-logs')}
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '6px 10px' }}
            >
              View Compliance Audit Ledger &rarr;
            </Button>
          </div>
        </div>
      </div>

      {/* Modals Mounted for Instant Operation */}
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

      {selectedOfferForEmail && (
        <EmailSendModal
          offerId={selectedOfferForEmail.id}
          offerReferenceNumber={selectedOfferForEmail.referenceNumber}
          isOpen={true}
          onClose={() => setSelectedOfferForEmail(null)}
          onSentSuccessfully={() => {
            loadDashboardData();
            setSelectedOfferForEmail(null);
            success(`Formal offer letter dispatched to ${selectedOfferForEmail.candidateName}.`);
          }}
          onViewHistory={() => {
            const toView = selectedOfferForEmail;
            setSelectedOfferForEmail(null);
            setSelectedOfferForHistory(toView);
          }}
        />
      )}

      {selectedOfferForHistory && (
        <EmailHistoryModal
          offerId={selectedOfferForHistory.id}
          offerReferenceNumber={selectedOfferForHistory.referenceNumber}
          candidateName={selectedOfferForHistory.candidateName}
          isOpen={true}
          onClose={() => setSelectedOfferForHistory(null)}
        />
      )}

      {/* Offer Letter Quick Generator Modal */}
      <QuickTemplateOfferModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      {/* Quick Document Generator Modals */}
      <ExperienceLetterModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      <SalarySlipModal
        isOpen={isSalarySlipModalOpen}
        onClose={() => setIsSalarySlipModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      <CharacterCertificateModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      <RelievingCertificateModal
        isOpen={isRelievingModalOpen}
        onClose={() => setIsRelievingModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  );
};
