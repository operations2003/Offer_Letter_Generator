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
  ShieldCheck,
  UserCheck,
  GraduationCap,
  DollarSign,
  ArrowRight,
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
import { QuickTemplateOfferModal } from '../components/offers/QuickTemplateOfferModal.js';
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
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
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

  const documentCards = [
    {
      id: 'offer_letter',
      title: 'Offer Letter',
      description: 'Official TaskNera employment offer letter with salary breakdown, clauses & terms.',
      icon: <FileText size={22} style={{ color: '#2563eb' }} />,
      badge: 'Ready to Generate',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsQuickModalOpen(true),
    },
    {
      id: 'character_certificate',
      title: 'Character Certificate',
      description: 'Official conduct, background standing, and character verification certificate.',
      icon: <ShieldCheck size={22} style={{ color: '#7c3aed' }} />,
      badge: 'Coming Soon',
      badgeColor: '#64748b',
      badgeBg: '#f8fafc',
      badgeBorder: '#e2e8f0',
      active: false,
      onClick: () => info('Character Certificate template is currently in development and will be available soon.'),
    },
    {
      id: 'onboarding_letter',
      title: 'Onboarding Letter',
      description: 'Formal onboarding confirmation, joining schedule, and welcome documentation.',
      icon: <UserCheck size={22} style={{ color: '#0284c7' }} />,
      badge: 'Coming Soon',
      badgeColor: '#64748b',
      badgeBg: '#f8fafc',
      badgeBorder: '#e2e8f0',
      active: false,
      onClick: () => info('Onboarding Letter template is currently in development and will be available soon.'),
    },
    {
      id: 'experience_letter',
      title: 'Experience Letter',
      description: 'Formal employment tenure, roles held, and service certification letter.',
      icon: <Briefcase size={22} style={{ color: '#ea580c' }} />,
      badge: 'Coming Soon',
      badgeColor: '#64748b',
      badgeBg: '#f8fafc',
      badgeBorder: '#e2e8f0',
      active: false,
      onClick: () => info('Experience Letter template is currently in development and will be available soon.'),
    },
    {
      id: 'internship_letter',
      title: 'Internship Letter',
      description: 'Internship appointment letter with stipend details, duration, and learning scope.',
      icon: <GraduationCap size={22} style={{ color: '#9333ea' }} />,
      badge: 'Coming Soon',
      badgeColor: '#64748b',
      badgeBg: '#f8fafc',
      badgeBorder: '#e2e8f0',
      active: false,
      onClick: () => info('Internship Letter template is currently in development and will be available soon.'),
    },
    {
      id: 'salary_slip',
      title: 'Salary Slip',
      description: 'Monthly payslip statement with itemized earnings, deductions, and net pay.',
      icon: <DollarSign size={22} style={{ color: '#059669' }} />,
      badge: 'Coming Soon',
      badgeColor: '#64748b',
      badgeBg: '#f8fafc',
      badgeBorder: '#e2e8f0',
      active: false,
      onClick: () => info('Salary Slip template is currently in development and will be available soon.'),
    },
  ];

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
        </div>
      </div>

      {/* Document Templates Selection Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Document Templates
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Select a template to generate official documentation for employees & candidates.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {documentCards.map((card) => {
            const isOffer = card.active;
            return (
              <div
                key={card.id}
                onClick={card.onClick}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: isOffer ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                  boxShadow: isOffer ? '0 4px 16px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isOffer
                    ? '0 8px 24px rgba(37, 99, 235, 0.16)'
                    : '0 6px 18px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isOffer
                    ? '0 4px 16px rgba(37, 99, 235, 0.08)'
                    : '0 1px 3px rgba(0, 0, 0, 0.05)';
                }}
              >
                {/* Top: Icon + Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: isOffer ? '#eff6ff' : '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isOffer ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 20,
                        color: card.badgeColor,
                        backgroundColor: card.badgeBg,
                        border: `1px solid ${card.badgeBorder}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {isOffer && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a' }} />}
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {card.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.45, margin: 0 }}>
                    {card.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: isOffer ? '#2563eb' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {isOffer ? 'Generate Letter' : 'Coming Soon'}
                  </span>
                  {isOffer ? (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight size={15} />
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Template in dev</span>
                  )}
                </div>
              </div>
            );
          })}
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

      {/* 2-Step Company Template Offer Generator Modal */}
      <QuickTemplateOfferModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />
    </div>
  );
};
