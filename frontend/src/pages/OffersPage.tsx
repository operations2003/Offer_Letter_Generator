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
  ScrollText,
  BookOpen,
  Award,
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
import { CharacterCertificateModal } from '../components/documents/CharacterCertificateModal.js';
import { ExperienceLetterModal } from '../components/documents/ExperienceLetterModal.js';
import { SalarySlipModal } from '../components/documents/SalarySlipModal.js';
import { InternshipConcludingModal } from '../components/documents/InternshipConcludingModal.js';
import { CertificateOfCompletionModal } from '../components/documents/CertificateOfCompletionModal.js';
import { RelievingCertificateModal } from '../components/documents/RelievingCertificateModal.js';
import { BonafideCertificateModal } from '../components/documents/BonafideCertificateModal.js';
import { PolicyViewerModal, PolicyDefinition } from '../components/policies/PolicyViewerModal.js';
import { MasterRecruitmentAgreementModal } from '../components/documents/MasterRecruitmentAgreementModal.js';
import { OFFICIAL_POLICIES } from '../services/policyCatalog.js';
import {
  getAllPolicies,
  generatePolicyFromPrompt,
  deleteCustomPolicy,
} from '../services/policyGeneratorService.js';
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
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [isRelievingModalOpen, setIsRelievingModalOpen] = useState(false);
  const [isBonafideModalOpen, setIsBonafideModalOpen] = useState(false);
  const [isMrsModalOpen, setIsMrsModalOpen] = useState(false);
  const [activeDocumentTab, setActiveDocumentTab] = useState<'ALL' | 'TEMPLATES' | 'CERTIFICATES' | 'POLICIES'>('ALL');
  const [certificateSectionPulse, setCertificateSectionPulse] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(() => searchParams.get('create') === 'true');
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferItem | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'preview' | 'pdf' | 'versions' | 'status'>('preview');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [emailSendOffer, setEmailSendOffer] = useState<OfferListItem | null>(null);
  const [emailHistoryOffer, setEmailHistoryOffer] = useState<OfferListItem | null>(null);

  // Policies Section State
  const [selectedPolicyForView, setSelectedPolicyForView] = useState<PolicyDefinition | null>(null);
  const [policySearch, setPolicySearch] = useState('');
  const [policyCategoryFilter, setPolicyCategoryFilter] = useState('ALL');
  const [policySectionPulse, setPolicySectionPulse] = useState(false);
  const [policyPrompt, setPolicyPrompt] = useState('');
  const [policyPromptCategory, setPolicyPromptCategory] = useState('ALL');
  const [isGeneratingPolicy, setIsGeneratingPolicy] = useState(false);
  const [allPoliciesList, setAllPoliciesList] = useState<PolicyDefinition[]>(() => getAllPolicies());

  const handleGeneratePolicy = async (promptOverride?: string) => {
    const text = (promptOverride || policyPrompt).trim();
    if (!text) {
      info('Please enter a description or prompt for the policy.');
      return;
    }
    setIsGeneratingPolicy(true);
    try {
      const generated = await generatePolicyFromPrompt(
        text,
        policyPromptCategory !== 'ALL' ? policyPromptCategory : undefined
      );
      setAllPoliciesList(getAllPolicies());
      setPolicyPrompt('');
      setSelectedPolicyForView(generated);
      success(`Generated "${generated.name}" successfully! Opening policy viewer...`);
    } catch (err: any) {
      error(err.message || 'Failed to generate policy.');
    } finally {
      setIsGeneratingPolicy(false);
    }
  };

  const handleDeleteCustomPolicy = (code: string) => {
    const updated = deleteCustomPolicy(code);
    setAllPoliciesList(updated);
    info('Custom policy removed.');
  };

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
      id: 'mrsa_agreement',
      title: 'Recruitment Agreement (MRSA)',
      description: 'Official 21-page Master Recruitment Services Agreement between TaskNera and hiring clients with full clauses & schedules.',
      icon: <FileCheck2 size={22} style={{ color: '#7c3aed' }} />,
      badge: 'Ready to Generate',
      badgeColor: '#7c3aed',
      badgeBg: '#f5f3ff',
      badgeBorder: '#ddd6fe',
      active: true,
      onClick: () => setIsMrsModalOpen(true),
    },
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
      badge: 'Ready to Generate',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsCharacterModalOpen(true),
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
      badge: 'Ready to Generate',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsExperienceModalOpen(true),
    },
    {
      id: 'internship_concluding',
      title: 'Internship Concluding Letter',
      description: 'Formal internship conclusion letter, tenure verification, completion formalities, and acknowledgement.',
      icon: <GraduationCap size={22} style={{ color: '#c2410c' }} />,
      badge: 'Ready to Generate',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsInternshipModalOpen(true),
    },
    {
      id: 'salary_slip',
      title: 'Salary Slip',
      description: 'Monthly payslip statement with itemized earnings, deductions, and net pay.',
      icon: <DollarSign size={22} style={{ color: '#059669' }} />,
      badge: 'Ready to Generate',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsSalarySlipModalOpen(true),
    },
    {
      id: 'company_policies',
      title: 'Company Policies',
      description: 'Official corporate policies, leave rules, attendance standards, and code of conduct.',
      icon: <ScrollText size={22} style={{ color: '#0284c7' }} />,
      badge: 'Ready to View',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => {
        const el = document.getElementById('company-policies-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setPolicySectionPulse(true);
          setTimeout(() => setPolicySectionPulse(false), 2400);
        } else if (OFFICIAL_POLICIES.length > 0) {
          setSelectedPolicyForView(OFFICIAL_POLICIES[0]);
        }
      },
    },
  ];

  const certificateCards = [
    {
      id: 'certificate',
      title: 'Certificate',
      subtitle: 'Dynamic: Name, Course Name, Date of Issue',
      description: 'Official TaskNera certificate with dynamic recipient name, course/source name, and date of issue.',
      icon: <Award size={22} style={{ color: '#ea580c' }} />,
      badge: 'Ready to Generate',
      badgeColor: '#c2410c',
      badgeBg: '#fff7ed',
      badgeBorder: '#fed7aa',
      accentColor: '#ea580c',
      featured: true,
      active: true,
      onClick: () => setIsCompletionModalOpen(true),
    },
  ];

  // Filtered policies list based on category and search query
  const filteredPolicies = useMemo(() => {
    return allPoliciesList.filter((policy) => {
      const matchesCategory =
        policyCategoryFilter === 'ALL' || policy.category === policyCategoryFilter;
      const q = policySearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        policy.name.toLowerCase().includes(q) ||
        policy.description.toLowerCase().includes(q) ||
        policy.policyNumber.toLowerCase().includes(q) ||
        policy.sections.some(
          (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
        );
      return matchesCategory && matchesSearch;
    });
  }, [allPoliciesList, policyCategoryFilter, policySearch]);

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

      {/* Category Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '6px 0',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Document Categories', count: documentCards.length + certificateCards.length + allPoliciesList.length },
            { key: 'TEMPLATES', label: 'Document Templates', count: documentCards.length },
            { key: 'CERTIFICATES', label: 'Certificates', count: certificateCards.length, icon: <Award size={13} /> },
            { key: 'POLICIES', label: 'Company Policies', count: allPoliciesList.length },
          ].map((tab) => {
            const isSelected = activeDocumentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveDocumentTab(tab.key as any);
                  if (tab.key === 'CERTIFICATES') {
                    const el = document.getElementById('certificates-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setCertificateSectionPulse(true);
                      setTimeout(() => setCertificateSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'TEMPLATES') {
                    const el = document.getElementById('document-templates-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else if (tab.key === 'POLICIES') {
                    const el = document.getElementById('company-policies-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setPolicySectionPulse(true);
                      setTimeout(() => setPolicySectionPulse(false), 2400);
                    }
                  }
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected
                    ? tab.key === 'CERTIFICATES'
                      ? '1px solid #ea580c'
                      : '1px solid #2563eb'
                    : '1px solid #e2e8f0',
                  backgroundColor: isSelected
                    ? tab.key === 'CERTIFICATES'
                      ? '#fff7ed'
                      : '#eff6ff'
                    : '#ffffff',
                  color: isSelected
                    ? tab.key === 'CERTIFICATES'
                      ? '#c2410c'
                      : '#1d4ed8'
                    : '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    backgroundColor: isSelected
                      ? tab.key === 'CERTIFICATES'
                        ? '#ea580c'
                        : '#2563eb'
                      : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Document Templates Selection Cards */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'TEMPLATES') && (
        <div id="document-templates-section" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Document Templates
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  {documentCards.length} Templates Available
                </span>
              </div>
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
                        color: isOffer ? (card.id === 'company_policies' ? '#0284c7' : '#2563eb') : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {card.id === 'company_policies'
                        ? 'Browse Policies'
                        : isOffer
                        ? 'Generate Letter'
                        : 'Coming Soon'}
                    </span>
                    {isOffer ? (
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          backgroundColor: card.id === 'company_policies' ? '#e0f2fe' : '#2563eb',
                          color: card.id === 'company_policies' ? '#0284c7' : '#ffffff',
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
      )}

      {/* ========================================================================= */}
      {/* 2. CERTIFICATES SECTION                                                   */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'CERTIFICATES') && (
        <div
          id="certificates-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '12px',
            backgroundColor: certificateSectionPulse ? 'rgba(234, 88, 12, 0.05)' : 'transparent',
            boxShadow: certificateSectionPulse ? '0 0 0 2px rgba(234, 88, 12, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Certificates
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#fff7ed',
                    color: '#ea580c',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #fed7aa',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Award size={12} />
                  Ready to Issue
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Issue official TaskNera certificates with dynamic recipient name, course name, and date of issue.
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
            {certificateCards.map((card) => {
              const isFeatured = (card as any).featured;
              const accent = (card as any).accentColor || '#ea580c';
              return (
                <div
                  key={card.id}
                  onClick={card.onClick}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    padding: '20px',
                    border: isFeatured ? `1.5px solid ${accent}` : '1px solid #e2e8f0',
                    boxShadow: isFeatured
                      ? `0 4px 16px ${accent}22`
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                    e.currentTarget.style.boxShadow = `0 8px 24px ${accent}25`;
                    e.currentTarget.style.borderColor = accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isFeatured
                      ? `0 4px 16px ${accent}22`
                      : '0 1px 3px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = isFeatured ? accent : '#e2e8f0';
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
                          backgroundColor: card.badgeBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${card.badgeBorder}`,
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
                        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: card.badgeColor }} />
                        {card.badge}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                      {card.title}
                    </h4>
                    {(card as any).subtitle && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: accent,
                          marginBottom: 6,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{(card as any).subtitle}</span>
                      </div>
                    )}
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
                        color: accent,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Generate Certificate
                    </span>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        backgroundColor: `${accent}15`,
                        color: accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPANY POLICIES SECTION                                                 */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'POLICIES') && (
        <div
          id="company-policies-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '12px',
            backgroundColor: policySectionPulse ? 'rgba(2, 132, 199, 0.05)' : 'transparent',
            boxShadow: policySectionPulse ? '0 0 0 2px rgba(2, 132, 199, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Company Policies & Guidelines
              </h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                }}
              >
                {filteredPolicies.length} Policies Available
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Standard organizational policies, compliance documentation, and employee guidelines.
            </p>
          </div>

          {/* Search bar for policies */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder="Search policy name, code, clause..."
                value={policySearch}
                onChange={(e) => setPolicySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  fontSize: '0.8125rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  backgroundColor: '#ffffff',
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Policy Generator Box (ChatGPT / Gemini Prompt Style) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1.5px solid #e2e8f0',
            borderRadius: 14,
            padding: '18px 20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    AI Policy Generator
                  </h4>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: '#f3e8ff',
                      color: '#7e22ce',
                      border: '1px solid #e9d5ff',
                    }}
                  >
                    Natural Language Prompt
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Enter any requirement like in ChatGPT/Gemini to draft formal clauses, definitions, and compliance rules.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt input container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              border: isGeneratingPolicy ? '1.5px solid #8b5cf6' : '1.5px solid #cbd5e1',
              borderRadius: 10,
              padding: '10px 12px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              transition: 'border-color 0.2s ease',
            }}
          >
            <textarea
              value={policyPrompt}
              onChange={(e) => setPolicyPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleGeneratePolicy();
                }
              }}
              placeholder="e.g. Generate a Moonlighting & Dual Employment Policy requiring prior approval and banning side work with direct competitors..."
              rows={2}
              disabled={isGeneratingPolicy}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '0.875rem',
                color: '#1e293b',
                fontFamily: 'inherit',
                lineHeight: 1.45,
                backgroundColor: 'transparent',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                paddingTop: 8,
                marginTop: 4,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Category:</span>
                <select
                  value={policyPromptCategory}
                  onChange={(e) => setPolicyPromptCategory(e.target.value)}
                  disabled={isGeneratingPolicy}
                  style={{
                    fontSize: '0.78125rem',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#334155',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">Auto-Detect</option>
                  <option value="WORKPLACE_CONDUCT">Workplace Conduct</option>
                  <option value="IT_DATA_SECURITY">IT & Data Security</option>
                  <option value="WORK_ARRANGEMENTS">Work Arrangements</option>
                  <option value="ATTENDANCE_LEAVE">Attendance & Leave</option>
                  <option value="FINANCE_TRAVEL">Finance & Travel</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {policyPrompt && (
                  <button
                    type="button"
                    onClick={() => setPolicyPrompt('')}
                    disabled={isGeneratingPolicy}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      padding: '4px 8px',
                    }}
                  >
                    Clear
                  </button>
                )}
                <Button
                  variant="primary"
                  onClick={() => handleGeneratePolicy()}
                  disabled={isGeneratingPolicy || !policyPrompt.trim()}
                  icon={isGeneratingPolicy ? <RefreshCw size={14} className="spin" /> : <Sparkles size={14} />}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderColor: '#7c3aed',
                  }}
                >
                  {isGeneratingPolicy ? 'Generating Policy...' : 'Generate Policy'}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick inspiration suggestion pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} color="#8b5cf6" /> Try prompts:
            </span>
            {[
              'Moonlighting & Secondary Employment Policy',
              'Generative AI & LLM Usage Policy',
              'BYOD & Mobile Device Security Policy',
              'Remote Work & Digital Nomad Policy',
              'Anti-Harassment & POSH Policy',
            ].map((sample) => (
              <button
                key={sample}
                type="button"
                disabled={isGeneratingPolicy}
                onClick={() => {
                  setPolicyPrompt(sample);
                  handleGeneratePolicy(sample);
                }}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 9px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f3ff';
                  e.currentTarget.style.borderColor = '#c4b5fd';
                  e.currentTarget.style.color = '#6d28d9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                + {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Policies' },
            { key: 'ATTENDANCE_LEAVE', label: 'Attendance & Leave' },
            { key: 'WORKPLACE_CONDUCT', label: 'Workplace Conduct' },
            { key: 'WORK_ARRANGEMENTS', label: 'Work Arrangements' },
            { key: 'IT_DATA_SECURITY', label: 'IT & Data Security' },
            { key: 'FINANCE_TRAVEL', label: 'Finance & Travel' },
          ].map((cat) => {
            const isSelected = policyCategoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setPolicyCategoryFilter(cat.key)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78125rem',
                  fontWeight: isSelected ? 700 : 500,
                  borderRadius: 20,
                  border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Policies Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {filteredPolicies.map((policy) => {
            const isCustom = policy.code.startsWith('CUSTOM_POL_');
            return (
              <div
                key={policy.code}
                onClick={() => setSelectedPolicyForView(policy)}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: '20px',
                  border: isCustom ? `1.5px solid ${policy.color}` : '1px solid #e2e8f0',
                  boxShadow: isCustom ? `0 4px 14px ${policy.color}15` : '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                  e.currentTarget.style.boxShadow = `0 6px 18px ${policy.color}25`;
                  e.currentTarget.style.borderColor = policy.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isCustom ? `0 4px 14px ${policy.color}15` : '0 1px 3px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = isCustom ? policy.color : '#e2e8f0';
                }}
              >
                <div>
                  {/* Top: Icon + Number Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: `${policy.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${policy.color}30`,
                        color: policy.color,
                      }}
                    >
                      <ShieldCheck size={22} />
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isCustom && (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 12,
                            color: '#7c3aed',
                            backgroundColor: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Sparkles size={10} />
                          AI
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 6,
                          color: '#475569',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {policy.policyNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 12,
                          color: '#16a34a',
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                        Active
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          title="Remove custom policy"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomPolicy(policy.code);
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '2px 3px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {policy.name}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.45, margin: '0 0 12px 0' }}>
                    {policy.description}
                  </p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      {policy.sections.length} Sections
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: '1px solid #f1f5f9',
                      }}
                    >
                      {policy.categoryLabel}
                    </span>
                  </div>
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
                      color: policy.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    View Policy
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: `${policy.color}15`,
                      color: policy.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}



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

      {/* 2-Step TaskNera Character Certificate Generator Modal */}
      <CharacterCertificateModal
        isOpen={isCharacterModalOpen}
        onClose={() => setIsCharacterModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* 2-Step TaskNera Experience Letter Generator Modal */}
      <ExperienceLetterModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* 2-Step TaskNera Salary Slip / Monthly Payslip Generator Modal */}
      <SalarySlipModal
        isOpen={isSalarySlipModalOpen}
        onClose={() => setIsSalarySlipModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* 2-Step TaskNera Internship Concluding Letter Generator Modal */}
      <InternshipConcludingModal
        isOpen={isInternshipModalOpen}
        onClose={() => setIsInternshipModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Certificate of Completion (L&D Training Programme) Modal */}
      <CertificateOfCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Relieving & Clearance Certificate Modal */}
      <RelievingCertificateModal
        isOpen={isRelievingModalOpen}
        onClose={() => setIsRelievingModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Bonafide Employment Certificate Modal */}
      <BonafideCertificateModal
        isOpen={isBonafideModalOpen}
        onClose={() => setIsBonafideModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* TaskNera Official Policy Viewer & PDF Export Modal */}
      <PolicyViewerModal
        policy={selectedPolicyForView}
        isOpen={Boolean(selectedPolicyForView)}
        onClose={() => setSelectedPolicyForView(null)}
      />

      {/* Official Master Recruitment Services Agreement (MRSA) Modal */}
      <MasterRecruitmentAgreementModal
        isOpen={isMrsModalOpen}
        onClose={() => setIsMrsModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />
    </div>
  );
};
