import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Sparkles,
  Download,
  Eye,
  Edit3,
  Copy,
  Send,
  History,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Briefcase,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  X,
  FileCheck2,
  Layers,
  ArrowUpDown,
  MoreVertical,
  Mail,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge, AiAdvisoryBadge } from '../components/common/Badge.js';
import { ExtractWithAi } from '../components/ai/ExtractWithAi.js';
import { OfferItem, OfferStatus, AiCandidateExtractionData } from '../types/index.js';
import { OfferListItem, GeneratedOfferResult } from '../types/offer.js';
import { useToast } from '../context/ToastContext.js';
import { OfferGeneratorWizard } from '../components/offers/wizard/OfferGeneratorWizard.js';
import { OfferDetailModal } from '../components/offers/OfferDetailModal.js';
import { EmailSendModal } from '../components/offers/EmailSendModal.js';
import { EmailHistoryModal } from '../components/offers/EmailHistoryModal.js';
import { offerService } from '../services/offerService.js';

const INITIAL_MOCK_OFFERS: OfferListItem[] = [];

const DEPARTMENTS = [
  'ALL',
  'Engineering',
  'Platform Engineering',
  'Product Experience',
  'AI Research',
  'Cloud Infrastructure',
  'Executive',
  'Research',
  'HR Operations',
];

export const OffersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  // State: Offers data
  const [offers, setOffers] = useState<OfferListItem[]>(INITIAL_MOCK_OFFERS);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Filters & Search State
  const initialStatusParam = searchParams.get('status') || 'ALL';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusParam);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedAiReviewStatus, setSelectedAiReviewStatus] = useState<string>('ALL');

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals & Action States
  const [isWizardOpen, setIsWizardOpen] = useState(() => searchParams.get('create') === 'true');
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferItem | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'preview' | 'pdf' | 'versions' | 'status'>('preview');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [emailSendOffer, setEmailSendOffer] = useState<OfferListItem | null>(null);
  const [emailHistoryOffer, setEmailHistoryOffer] = useState<OfferListItem | null>(null);

  // Update selectedStatus if URL search param changes
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
      setPage(1);
    }
  }, [searchParams]);

  // Fetch offers from backend
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await offerService.listOffers({
        search: searchTerm,
        status: selectedStatus,
        department: selectedDepartment,
        aiReviewStatus: selectedAiReviewStatus,
        page,
        limit,
      });

      if (response && Array.isArray(response.items)) {
        setOffers(response.items);
        setTotalCount(response.total ?? response.items.length);
        setTotalPages(response.totalPages ?? 1);
      } else {
        setOffers([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.warn('Backend list offers unavailable:', err);
      setOffers([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [page, limit, selectedStatus, selectedDepartment, selectedAiReviewStatus, searchTerm]);

  // Convert OfferListItem to OfferItem for OfferDetailModal
  const convertToOfferItem = (o: OfferListItem): OfferItem => {
    return {
      id: o.id,
      referenceNumber: o.referenceNumber,
      candidateName: o.candidateName,
      email: o.email,
      role: o.position,
      department: o.department,
      totalCtc: o.totalCtc,
      currency: o.currency || 'USD',
      status: (o.status as OfferStatus) || 'DRAFT_AI',
      aiConfidence: o.aiReviewStatus === 'VERIFIED_BY_HR' ? 0.98 : 0.91,
      createdAt: o.offerDate || new Date().toISOString(),
    };
  };

  // ---------------------------------------------------------------------------
  // THE 7 REQUIRED ACTIONS:
  // View / Edit / Preview / Download / Duplicate / Send / History
  // ---------------------------------------------------------------------------

  // 1. VIEW ACTION
  const handleView = (item: OfferListItem) => {
    setSelectedOfferForDetail(convertToOfferItem(item));
    setDetailModalTab('preview');
  };

  // 2. EDIT ACTION
  const handleEdit = (item: OfferListItem) => {
    if (['APPROVED', 'ISSUED', 'ACCEPTED'].includes(item.status)) {
      info(`Offer ${item.referenceNumber} is in ${item.status} state. To modify, create a new version or duplicate.`);
    }
    // Launch wizard or editor with offer context
    setSelectedOfferForDetail(convertToOfferItem(item));
    setDetailModalTab('preview');
  };

  // 3. PREVIEW ACTION
  const handlePreview = (item: OfferListItem) => {
    setSelectedOfferForDetail(convertToOfferItem(item));
    setDetailModalTab('preview');
  };

  // 4. DOWNLOAD ACTION
  const handleDownload = async (item: OfferListItem) => {
    try {
      setActionLoadingId(item.id);
      await offerService.downloadOfferPdf(item.id, undefined, `Offer_${item.referenceNumber}.pdf`);
      success(`Downloaded official PDF for ${item.referenceNumber}`);
    } catch (err: any) {
      // Fallback
      window.print();
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. DUPLICATE ACTION
  const handleDuplicate = async (item: OfferListItem) => {
    try {
      setActionLoadingId(item.id);
      const duplicated = await offerService.duplicateOffer(item.id);
      success(`Duplicated offer successfully as ${duplicated.referenceNumber || duplicated.offerReferenceNumber}`);
      await fetchOffers();
    } catch (err: any) {
      error(err.message || 'Failed to duplicate offer', 'Error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. SEND ACTION (Formal Dispatch via Email Confirmation & Secure Link)
  const handleSend = (item: OfferListItem) => {
    setEmailSendOffer(item);
  };

  // Dedicated EMAIL HISTORY ACTION (Dispatch Logs, Secure Token Link, Retries)
  const handleEmailHistory = (item: OfferListItem) => {
    setEmailHistoryOffer(item);
  };

  // 7. HISTORY ACTION (Audit & Version History)
  const handleHistory = (item: OfferListItem) => {
    setSelectedOfferForDetail(convertToOfferItem(item));
    setDetailModalTab('versions');
  };

  // Handle Offer Creation from 11-step wizard
  const handleOfferCreated = (newOfferResult: GeneratedOfferResult) => {
    setIsWizardOpen(false);
    searchParams.delete('create');
    setSearchParams(searchParams);
    success(`Offer ${newOfferResult.referenceNumber} generated successfully!`);
    fetchOffers();
  };

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

  // Helper date formatter
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Not set';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Helper AI Review Status Badge renderer
  const renderAiReviewStatusBadge = (status: OfferListItem['aiReviewStatus']) => {
    switch (status) {
      case 'VERIFIED_BY_HR':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
            }}
          >
            <CheckCircle2 size={12} style={{ color: '#059669' }} />
            <span>HR Verified</span>
          </span>
        );
      case 'PENDING_AI_REVIEW':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#f5f3ff',
              color: '#6d28d9',
              border: '1px solid #ddd6fe',
            }}
          >
            <Sparkles size={12} style={{ color: '#7c3aed' }} />
            <span>AI Review Pending</span>
          </span>
        );
      case 'OVERRIDDEN':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#fffbeb',
              color: '#b45309',
              border: '1px solid #fde68a',
            }}
          >
            <AlertTriangle size={12} style={{ color: '#d97706' }} />
            <span>Overrides Applied</span>
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
            }}
          >
            <span>Standard</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header & Quick Actions Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Offers Pipeline</h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 12,
                background: 'var(--primary-subtle)',
                color: 'var(--primary-light)',
                fontWeight: 600,
              }}
            >
              {totalCount} Total Offers
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Lifecycle management: Draft → AI Processing → Awaiting Review → Generated → Sent → Accepted.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button
            variant="secondary"
            icon={<RefreshCw size={14} className={loading ? 'spin' : ''} />}
            onClick={() => fetchOffers()}
            style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
          >
            Refresh
          </Button>
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
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Search Row & Dropdown Filters */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 2, minWidth: 260 }}>
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
              placeholder="Search candidate name, email, job title, or reference..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: 38, paddingRight: searchTerm ? 32 : 12, width: '100%' }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <select
              className="form-input"
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', height: '40px' }}
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.filter((d) => d !== 'ALL').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* AI Review Status Filter Dropdown */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <select
              className="form-input"
              value={selectedAiReviewStatus}
              onChange={(e) => {
                setSelectedAiReviewStatus(e.target.value);
                setPage(1);
              }}
              style={{ width: '100%', height: '40px' }}
            >
              <option value="ALL">All AI Review States</option>
              <option value="VERIFIED_BY_HR">HR Verified</option>
              <option value="PENDING_AI_REVIEW">AI Review Pending</option>
              <option value="OVERRIDDEN">Overrides Applied</option>
              <option value="STANDARD">Standard Manual</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills Row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: 4 }}>
            Status:
          </span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DRAFT_AI', label: 'Draft' },
            { id: 'AWAITING_REVIEW', label: 'Awaiting Review' },
            { id: 'APPROVED', label: 'Generated' },
            { id: 'ISSUED', label: 'Sent' },
            { id: 'ACCEPTED', label: 'Accepted' },
            { id: 'REJECTED', label: 'Rejected' },
            { id: 'EXPIRED', label: 'Expired' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setSelectedStatus(st.id);
                setPage(1);
                searchParams.set('status', st.id);
                setSearchParams(searchParams);
              }}
              className={`btn ${selectedStatus === st.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '5px 12px',
                fontSize: '0.75rem',
                borderRadius: 20,
                transition: 'all 0.15s ease',
              }}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offer List Table with 8 Columns */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '14px 18px', width: '22%' }}>Candidate</th>
                <th style={{ padding: '14px 16px', width: '18%' }}>Position</th>
                <th style={{ padding: '14px 14px', width: '11%' }}>Offer Date</th>
                <th style={{ padding: '14px 14px', width: '11%' }}>Joining Date</th>
                <th style={{ padding: '14px 16px', width: '14%' }}>Template</th>
                <th style={{ padding: '14px 12px', width: '10%' }}>Status</th>
                <th style={{ padding: '14px 14px', width: '14%' }}>AI Review Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
                    Loading offer records...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Layers size={36} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-dim)' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      No offers found
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      Try adjusting your search criteria or status filter.
                    </div>
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* 1. Candidate Column */}
                    <td style={{ padding: '14px 18px' }}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          maxWidth: 240,
                          wordBreak: 'break-word',
                        }}
                        onClick={() => handleView(o)}
                        title="Click to view offer details"
                      >
                        <User size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ color: '#0f172a' }}>{o.candidateName}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, wordBreak: 'break-all' }}>
                        {o.email}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-dim)',
                          marginTop: 3,
                        }}
                      >
                        Ref: {o.referenceNumber}
                      </div>
                    </td>

                    {/* 2. Position Column */}
                    <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>{o.position}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.department}</span>
                        {o.bandGrade && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                              fontWeight: 600,
                            }}
                          >
                            {o.bandGrade}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                        ${o.totalCtc?.toLocaleString()} {o.currency}
                      </div>
                    </td>

                    {/* 3. Offer Date Column */}
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8125rem', color: '#334155' }}>
                        <Calendar size={13} style={{ color: 'var(--text-dim)' }} />
                        <span>{formatDate(o.offerDate)}</span>
                      </div>
                    </td>

                    {/* 4. Joining Date Column */}
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: o.joiningDate ? 600 : 400, color: '#334155' }}>
                        {formatDate(o.joiningDate)}
                      </div>
                    </td>

                    {/* 5. Template Column */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>{o.template}</div>
                      {o.templateCode && (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            marginTop: 4,
                          }}
                        >
                          {o.templateCode}
                        </span>
                      )}
                    </td>

                    {/* 6. Status Column */}
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        <OfferStatusBadge status={o.status as any} />
                        {o.status === 'ISSUED' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailHistory(o);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3,
                              fontSize: '0.6875rem',
                              color: 'var(--success)',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontWeight: 500,
                            }}
                            title="Click to view email delivery logs and exact dispatch timestamp"
                          >
                            <CheckCircle2 size={11} /> Sent Log
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 7. AI Review Status Column */}
                    <td style={{ padding: '14px 14px' }}>
                      {renderAiReviewStatusBadge(o.aiReviewStatus)}
                    </td>

                    {/* 8. Actions Column (View / Edit / Preview / Download / Duplicate / Send / History) */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 4,
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* View Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="View offer summary and details"
                          onClick={() => handleView(o)}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="Edit terms and clauses"
                          onClick={() => handleEdit(o)}
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Preview Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="Preview document markup and terms"
                          onClick={() => handlePreview(o)}
                        >
                          <FileText size={13} />
                        </button>

                        {/* Download Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="Download official PDF document"
                          onClick={() => handleDownload(o)}
                          disabled={actionLoadingId === o.id}
                        >
                          <Download size={13} />
                        </button>

                        {/* Duplicate Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="Duplicate offer into fresh draft"
                          onClick={() => handleDuplicate(o)}
                          disabled={actionLoadingId === o.id}
                        >
                          <Copy size={13} />
                        </button>

                        {/* Send Action */}
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: '5px 9px',
                            fontSize: '0.72rem',
                            gap: 4,
                            background: o.status === 'ISSUED' ? 'rgba(99, 102, 241, 0.15)' : undefined,
                            color: o.status === 'ISSUED' ? '#818cf8' : undefined,
                            border: o.status === 'ISSUED' ? '1px solid rgba(99, 102, 241, 0.3)' : undefined,
                          }}
                          title={o.status === 'ISSUED' ? 'Resend or re-dispatch offer email' : 'Send formal offer to candidate'}
                          onClick={() => handleSend(o)}
                          disabled={actionLoadingId === o.id}
                        >
                          <Send size={12} />
                          <span>{o.status === 'ISSUED' ? 'Resend' : 'Send'}</span>
                        </button>

                        {/* Email Dispatch Logs Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="View email dispatch history, delivery status, and secure link"
                          onClick={() => handleEmailHistory(o)}
                        >
                          <Mail size={13} />
                        </button>

                        {/* History Action */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '0.72rem' }}
                          title="View audit history, versions, and transitions"
                          onClick={() => handleHistory(o)}
                        >
                          <History size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background: '#ffffff',
          }}
        >
          {/* Showing Count and Limit Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Showing {totalCount === 0 ? 0 : (page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, totalCount)} of {totalCount} offers
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Per page:</span>
              <select
                className="form-input"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                style={{ padding: '3px 8px', fontSize: '0.75rem', height: 28 }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Page Navigation Controls */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '5px 8px' }}
              disabled={page <= 1}
              onClick={() => setPage(1)}
              title="First Page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '5px 8px' }}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            {/* Dynamic Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                return (
                  <React.Fragment key={p}>
                    {prev && p - prev > 1 && (
                      <span style={{ padding: '0 4px', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                        ...
                      </span>
                    )}
                    <button
                      className={`btn ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem', minWidth: 28 }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              className="btn btn-secondary"
              style={{ padding: '5px 8px' }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '5px 8px' }}
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              title="Last Page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Offer Detail, Preview, Generation & Version History Hub Modal */}
      {selectedOfferForDetail && (
        <OfferDetailModal
          offer={selectedOfferForDetail}
          isOpen={Boolean(selectedOfferForDetail)}
          initialTab={detailModalTab}
          onClose={() => setSelectedOfferForDetail(null)}
          onOfferUpdated={() => {
            fetchOffers();
          }}
        />
      )}

      {/* Formal Offer Email Dispatch & Confirmation Modal */}
      {emailSendOffer && (
        <EmailSendModal
          offerId={emailSendOffer.id}
          offerReferenceNumber={emailSendOffer.referenceNumber}
          isOpen={Boolean(emailSendOffer)}
          onClose={() => setEmailSendOffer(null)}
          onSentSuccessfully={(delivery) => {
            fetchOffers();
          }}
          onViewHistory={() => {
            const currentOffer = emailSendOffer;
            setEmailSendOffer(null);
            setEmailHistoryOffer(currentOffer);
          }}
        />
      )}

      {/* Email History, Dispatch Ledger & Delivery Retry Modal */}
      {emailHistoryOffer && (
        <EmailHistoryModal
          offerId={emailHistoryOffer.id}
          offerReferenceNumber={emailHistoryOffer.referenceNumber}
          candidateName={emailHistoryOffer.candidateName}
          isOpen={Boolean(emailHistoryOffer)}
          onClose={() => {
            setEmailHistoryOffer(null);
            fetchOffers();
          }}
          onOpenSendModal={() => {
            const currentOffer = emailHistoryOffer;
            setEmailHistoryOffer(null);
            setEmailSendOffer(currentOffer);
          }}
        />
      )}
    </div>
  );
};
