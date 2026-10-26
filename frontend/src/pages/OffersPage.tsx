import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Sparkles,
  Download,
  Eye,
  Edit3,
  Copy,
  Send,
  History,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
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
  Trash2,
  RotateCcw,
  Percent,
  Clock,
  Scale,
  ShieldAlert,
  UserMinus,
  TrendingUp,
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
import { GenerateLetterFromPdfModal } from '../components/offers/GenerateLetterFromPdfModal.js';
import { CharacterCertificateModal } from '../components/documents/CharacterCertificateModal.js';
import { ExperienceLetterModal } from '../components/documents/ExperienceLetterModal.js';
import { SalarySlipModal } from '../components/documents/SalarySlipModal.js';
import { InternshipConcludingModal } from '../components/documents/InternshipConcludingModal.js';
import { CertificateOfCompletionModal } from '../components/documents/CertificateOfCompletionModal.js';
import { RelievingCertificateModal } from '../components/documents/RelievingCertificateModal.js';
import { BonafideCertificateModal } from '../components/documents/BonafideCertificateModal.js';
import { PolicyViewerModal, PolicyDefinition } from '../components/policies/PolicyViewerModal.js';
import { MasterRecruitmentAgreementModal } from '../components/documents/MasterRecruitmentAgreementModal.js';
import { FreelancerOnboardingModal } from '../components/documents/FreelancerOnboardingModal.js';
import { FreelanceRecruiterAgreementModal } from '../components/documents/FreelanceRecruiterAgreementModal.js';
import { FreelancerTerminationModal } from '../components/documents/FreelancerTerminationModal.js';
import { EmployeeTerminationModal } from '../components/documents/EmployeeTerminationModal.js';
import { ResignationAcceptanceModal } from '../components/documents/ResignationAcceptanceModal.js';
import { SalaryRevisionModal } from '../components/documents/SalaryRevisionModal.js';
import { PromotionLetterModal } from '../components/documents/PromotionLetterModal.js';
import { OFFICIAL_POLICIES } from '../services/policyCatalog.js';
import {
  getAllPolicies,
  generatePolicyFromPrompt,
  deletePolicy,
  restoreAllPolicies,
  getDeletedPolicyCodes,
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
  const [isGeneratePdfModalOpen, setIsGeneratePdfModalOpen] = useState(false);
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [isRelievingModalOpen, setIsRelievingModalOpen] = useState(false);
  const [isBonafideModalOpen, setIsBonafideModalOpen] = useState(false);
  const [isMrsModalOpen, setIsMrsModalOpen] = useState(false);
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
  const [isRecruiterAgreementModalOpen, setIsRecruiterAgreementModalOpen] = useState(false);
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);
  const [isEmployeeTerminationModalOpen, setIsEmployeeTerminationModalOpen] = useState(false);
  const [isResignationModalOpen, setIsResignationModalOpen] = useState(false);
  const [isSalaryRevisionModalOpen, setIsSalaryRevisionModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [activeDocumentTab, setActiveDocumentTab] = useState<'ALL' | 'TEMPLATES' | 'PROMOTION' | 'RELIEVING' | 'SALARY_REVISION' | 'EMPLOYEE_TERMINATION' | 'RESIGNATION' | 'INTERNSHIP' | 'CERTIFICATES' | 'POLICIES'>('ALL');
  const [promotionSectionPulse, setPromotionSectionPulse] = useState(false);
  const [relievingSectionPulse, setRelievingSectionPulse] = useState(false);
  const [salaryRevisionSectionPulse, setSalaryRevisionSectionPulse] = useState(false);
  const [certificateSectionPulse, setCertificateSectionPulse] = useState(false);
  const [employeeTerminationSectionPulse, setEmployeeTerminationSectionPulse] = useState(false);
  const [resignationSectionPulse, setResignationSectionPulse] = useState(false);
  const [internshipSectionPulse, setInternshipSectionPulse] = useState(false);
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
      const generated = await generatePolicyFromPrompt(text);
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

  const handleDeletePolicy = (policy: PolicyDefinition) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${policy.name}" (${policy.policyNumber})?\n\nThis policy will be removed from your catalog. You can restore default policies anytime.`
    );
    if (!confirmed) return;

    const updated = deletePolicy(policy.code);
    setAllPoliciesList(updated);
    if (selectedPolicyForView?.code === policy.code) {
      setSelectedPolicyForView(null);
    }
    success(`"${policy.name}" was successfully deleted.`);
  };

  const handleRestorePolicies = () => {
    const confirmed = window.confirm('Restore all default company policies?');
    if (!confirmed) return;
    const updated = restoreAllPolicies();
    setAllPoliciesList(updated);
    success('All default company policies have been restored.');
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
      title: 'Recruitment Agreement',
      description: 'Standard agreement for recruitment services with hiring clients and partners.',
      icon: <FileCheck2 size={22} style={{ color: '#7c3aed' }} />,
      badge: 'Available',
      badgeColor: '#7c3aed',
      badgeBg: '#f5f3ff',
      badgeBorder: '#ddd6fe',
      active: true,
      onClick: () => setIsMrsModalOpen(true),
    },
    {
      id: 'offer_letter',
      title: 'Offer Letter',
      description: 'Formal employment offer with salary breakdown, start date, and terms.',
      icon: <FileText size={22} style={{ color: '#2563eb' }} />,
      badge: 'Available',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsQuickModalOpen(true),
    },
    {
      id: 'character_certificate',
      title: 'Character Certificate',
      description: 'Certificate verifying candidate conduct and character.',
      icon: <ShieldCheck size={22} style={{ color: '#7c3aed' }} />,
      badge: 'Available',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsCharacterModalOpen(true),
    },
    {
      id: 'freelancer_onboarding',
      title: 'Freelancer Onboarding',
      description: 'Official revenue-based engagement letter for independent contractors.',
      icon: <UserCheck size={22} style={{ color: '#059669' }} />,
      badge: 'Available',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsFreelancerModalOpen(true),
    },
    {
      id: 'recruiter_agreement',
      title: 'Recruiter Services Agreement',
      description: 'Master 14-page independent contractor agreement, Schedule 1 & Annexure A.',
      icon: <Scale size={22} style={{ color: '#2563eb' }} />,
      badge: 'Available',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
      active: true,
      onClick: () => setIsRecruiterAgreementModalOpen(true),
    },
    {
      id: 'freelancer_termination',
      title: 'Notice of Termination',
      description: 'Official notice terminating Freelance Recruiter Services Agreement (Clause 15, Options A/B/C).',
      icon: <AlertTriangle size={22} style={{ color: '#dc2626' }} />,
      badge: 'Clause 15 Notice',
      badgeColor: '#dc2626',
      badgeBg: '#fef2f2',
      badgeBorder: '#fecaca',
      active: true,
      onClick: () => setIsTerminationModalOpen(true),
    },
    {
      id: 'employee_termination',
      title: 'Employee Termination',
      description: 'Official termination letter for violation of the Zero Tolerance Policy and Code of Conduct.',
      icon: <ShieldAlert size={22} style={{ color: '#e11d48' }} />,
      badge: 'Zero Tolerance',
      badgeColor: '#e11d48',
      badgeBg: '#fff1f2',
      badgeBorder: '#fecdd3',
      active: true,
      onClick: () => setIsEmployeeTerminationModalOpen(true),
    },
    {
      id: 'promotion_letter',
      title: 'Promotion Letter',
      description: 'Official 1-page letter with promotion particulars table, reporting structure, new compensation & clauses.',
      icon: <Award size={22} style={{ color: '#2563eb' }} />,
      badge: 'TN/HR/PRO Format',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
      active: true,
      onClick: () => setIsPromotionModalOpen(true),
    },
    {
      id: 'relieving_letter',
      title: 'Relieving Letter',
      description: 'Official letter confirming resignation acceptance, Last Working Day, exit clearance & dues settlement.',
      icon: <FileCheck2 size={22} style={{ color: '#2563eb' }} />,
      badge: 'TN/HR/REL Format',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
      active: true,
      onClick: () => setIsRelievingModalOpen(true),
    },
    {
      id: 'salary_revision',
      title: 'Revision of Salary',
      description: 'Official 2-page letter with previous vs. revised monthly salary breakdown, effective date & clauses.',
      icon: <TrendingUp size={22} style={{ color: '#059669' }} />,
      badge: 'TN/HR/SAL Format',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      badgeBorder: '#a7f3d0',
      active: true,
      onClick: () => setIsSalaryRevisionModalOpen(true),
    },
    {
      id: 'resignation_acceptance',
      title: 'Acceptance of Resignation',
      description: 'Official 2-page letter acknowledging resignation, Last Working Day, notice period & FNF.',
      icon: <UserMinus size={22} style={{ color: '#2563eb' }} />,
      badge: 'TN/HR/RES Format',
      badgeColor: '#2563eb',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
      active: true,
      onClick: () => setIsResignationModalOpen(true),
    },
    {
      id: 'experience_letter',
      title: 'Experience Letter',
      description: 'Official letter stating employment tenure and role held.',
      icon: <Briefcase size={22} style={{ color: '#ea580c' }} />,
      badge: 'Available',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsExperienceModalOpen(true),
    },
    {
      id: 'internship_concluding',
      title: 'Conclusion of Internship',
      description: 'Official letter on internship conclusion, duties, equipment return, stipend & certificate.',
      icon: <GraduationCap size={22} style={{ color: '#ea580c' }} />,
      badge: 'TN/HR/INT Format',
      badgeColor: '#ea580c',
      badgeBg: '#fff7ed',
      badgeBorder: '#fed7aa',
      active: true,
      onClick: () => setIsInternshipModalOpen(true),
    },
    {
      id: 'salary_slip',
      title: 'Salary Slip',
      description: 'Monthly pay slip with itemized earnings, deductions, and net pay.',
      icon: <DollarSign size={22} style={{ color: '#059669' }} />,
      badge: 'Available',
      badgeColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeBorder: '#bbf7d0',
      active: true,
      onClick: () => setIsSalarySlipModalOpen(true),
    },
    {
      id: 'company_policies',
      title: 'Company Policies',
      description: 'Workplace guidelines, leave policies, and code of conduct.',
      icon: <ScrollText size={22} style={{ color: '#0284c7' }} />,
      badge: 'Available',
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
      title: 'Completion Certificate',
      subtitle: 'With name, course, and issue date',
      description: 'Official certificate for course, internship, or training completion.',
      icon: <Award size={22} style={{ color: '#ea580c' }} />,
      badge: 'Available',
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
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Offers</h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 12,
                background: '#eff6ff',
                color: '#2563eb',
                fontWeight: 600,
                border: '1px solid #bfdbfe',
              }}
            >
              {totalCount} Offers
            </span>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Create and track job offers and HR documents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
            icon={<FileText size={14} />}
            onClick={() => setIsGeneratePdfModalOpen(true)}
            style={{
              padding: '8px 16px',
              fontSize: '0.8125rem',
              backgroundColor: '#2563eb',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            Generate New Letter
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
          padding: '4px 0',
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All', count: documentCards.length + certificateCards.length + allPoliciesList.length + 1 },
            { key: 'TEMPLATES', label: 'Templates', count: documentCards.length },
            { key: 'PROMOTION', label: 'Promotion Letter', count: 1, icon: <Award size={13} /> },
            { key: 'RELIEVING', label: 'Relieving Letter', count: 1, icon: <FileCheck2 size={13} /> },
            { key: 'SALARY_REVISION', label: 'Salary Revision', count: 1, icon: <TrendingUp size={13} /> },
            { key: 'RESIGNATION', label: 'Resignation Acceptance', count: 1, icon: <UserMinus size={13} /> },
            { key: 'EMPLOYEE_TERMINATION', label: 'Employee Termination', count: 1, icon: <ShieldAlert size={13} /> },
            { key: 'INTERNSHIP', label: 'Internship Conclusion', count: 1, icon: <GraduationCap size={13} /> },
            { key: 'CERTIFICATES', label: 'Certificates', count: certificateCards.length, icon: <Award size={13} /> },
            { key: 'POLICIES', label: 'Policies', count: allPoliciesList.length },
          ].map((tab) => {
            const isSelected = activeDocumentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveDocumentTab(tab.key as any);
                  if (tab.key === 'PROMOTION') {
                    const el = document.getElementById('promotion-letter-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setPromotionSectionPulse(true);
                      setTimeout(() => setPromotionSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'RELIEVING') {
                    const el = document.getElementById('relieving-letter-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setRelievingSectionPulse(true);
                      setTimeout(() => setRelievingSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'SALARY_REVISION') {
                    const el = document.getElementById('salary-revision-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setSalaryRevisionSectionPulse(true);
                      setTimeout(() => setSalaryRevisionSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'RESIGNATION') {
                    const el = document.getElementById('resignation-acceptance-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setResignationSectionPulse(true);
                      setTimeout(() => setResignationSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'EMPLOYEE_TERMINATION') {
                    const el = document.getElementById('employee-termination-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setEmployeeTerminationSectionPulse(true);
                      setTimeout(() => setEmployeeTerminationSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'INTERNSHIP') {
                    const el = document.getElementById('internship-conclusion-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setInternshipSectionPulse(true);
                      setTimeout(() => setInternshipSectionPulse(false), 2400);
                    }
                  } else if (tab.key === 'CERTIFICATES') {
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
                  fontWeight: isSelected ? 600 : 500,
                  border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#475569',
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
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: 10,
                    backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
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
                  Templates
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {documentCards.length} Available
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Select a template to generate a document.
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
      {/* 2. EMPLOYEE TERMINATION LETTER SECTION (ZERO TOLERANCE POLICY)             */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'EMPLOYEE_TERMINATION') && (
        <div
          id="employee-termination-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '16px',
            backgroundColor: employeeTerminationSectionPulse ? 'rgba(225, 29, 72, 0.06)' : 'transparent',
            boxShadow: employeeTerminationSectionPulse ? '0 0 0 2px rgba(225, 29, 72, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Employee Termination Letter
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#ffe4e6',
                    color: '#be123c',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #fecdd3',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <ShieldAlert size={12} />
                  Zero Tolerance Policy &bull; Code of Conduct
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official formal termination of employment for violation of Company policies, covering show-cause notice, domestic inquiry, FNF settlement &amp; property handover.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<ShieldAlert size={14} />}
              onClick={() => setIsEmployeeTerminationModalOpen(true)}
              style={{
                backgroundColor: '#e11d48',
                borderColor: '#e11d48',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
                fontSize: '0.8125rem',
                padding: '8px 16px',
              }}
            >
              Generate Employee Termination
            </Button>
          </div>

          {/* Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '22px 24px',
              border: '1.5px solid #fecdd3',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 720 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    flexShrink: 0,
                  }}
                >
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Termination of Employment – Violation of Zero Tolerance Policy &amp; Code of Conduct
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        backgroundColor: '#ffe4e6',
                        color: '#be123c',
                        border: '1px solid #fda4af',
                      }}
                    >
                      Ref: TN/HR/TERM/YYYY/000
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Official 2-page Tasknera legal letter referencing the original employment appointment letter. Formulates factual allegations, show-cause due process, inquiry hearings, immediate termination without notice (or pay in lieu), Full &amp; Final settlement timelines, company property handover, and post-employment confidentiality obligations.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<FileText size={14} />}
                  onClick={() => setIsEmployeeTerminationModalOpen(true)}
                  style={{
                    backgroundColor: '#e11d48',
                    borderColor: '#e11d48',
                    fontSize: '0.8125rem',
                  }}
                >
                  Open Termination Generator
                </Button>
              </div>
            </div>

            {/* Quick Parameter Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              {[
                {
                  label: 'Policy Violation Grounds',
                  val: 'Zero Tolerance Policy (ZTP) & Code of Conduct Breach',
                  icon: <ShieldAlert size={14} style={{ color: '#e11d48' }} />,
                },
                {
                  label: 'Due Process & Inquiry',
                  val: 'Show-cause notice, written explanation & fair opportunity',
                  icon: <Scale size={14} style={{ color: '#7c3aed' }} />,
                },
                {
                  label: 'Notice & Pay Terms',
                  val: 'Without notice / pay in lieu under appointment letter',
                  icon: <Clock size={14} style={{ color: '#0284c7' }} />,
                },
                {
                  label: 'Clearance & Settlement',
                  val: 'Full & final settlement in working days & laptop/ID return',
                  icon: <FileCheck2 size={14} style={{ color: '#059669' }} />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ACCEPTANCE OF RESIGNATION LETTER SECTION (TN/HR/RES)                   */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'RESIGNATION') && (
        <div
          id="resignation-acceptance-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '16px',
            backgroundColor: resignationSectionPulse ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
            boxShadow: resignationSectionPulse ? '0 0 0 2px rgba(37, 99, 235, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Acceptance of Resignation
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #bfdbfe',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <UserMinus size={12} />
                  TN/HR/RES Format &bull; Official Exit Letter
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Formal 2-page Tasknera acknowledgement letter establishing Last Working Day, notice period waiver/shortfall options, handover protocols, and FNF settlement timeline.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<UserMinus size={14} />}
              onClick={() => setIsResignationModalOpen(true)}
              style={{
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                fontSize: '0.8125rem',
                padding: '8px 16px',
              }}
            >
              Generate Resignation Acceptance
            </Button>
          </div>

          {/* Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '22px 24px',
              border: '1.5px solid #bfdbfe',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 720 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  <UserMinus size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Acceptance of Resignation
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      Ref: TN/HR/RES/YYYY/000
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Official 2-page Tasknera legal letter referencing the original resignation submission. Formulates formal acceptance, Last Working Day determination, 3 notice period choices (Serve Notice / Waive or Shorten / Recover Shortfall), handover tasks, exit clearance, and FNF settlement within 30 working days.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<FileText size={14} />}
                  onClick={() => setIsResignationModalOpen(true)}
                  style={{
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                    fontSize: '0.8125rem',
                  }}
                >
                  Open Resignation Generator
                </Button>
              </div>
            </div>

            {/* Quick Parameter Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              {[
                {
                  label: 'Point 2: Last Working Day',
                  val: 'Determined based on resignation receipt date & notice period',
                  icon: <Calendar size={14} style={{ color: '#2563eb' }} />,
                },
                {
                  label: 'Point 3: Notice Period',
                  val: '3 Options: Full Served / Waived or Shortened / Shortfall Recovered',
                  icon: <Clock size={14} style={{ color: '#0284c7' }} />,
                },
                {
                  label: 'Point 5: Exit Formalities',
                  val: 'Asset return & systems access suspension at COB on LWD',
                  icon: <ShieldCheck size={14} style={{ color: '#059669' }} />,
                },
                {
                  label: 'Point 6: Full & Final Settlement',
                  val: 'Salary, leave encashment & statutory dues in 30 working days',
                  icon: <FileCheck2 size={14} style={{ color: '#7c3aed' }} />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3B. REVISION OF SALARY SECTION (TN/HR/SAL FORMAT)                         */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'SALARY_REVISION') && (
        <div
          id="salary-revision-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '16px',
            backgroundColor: salaryRevisionSectionPulse ? 'rgba(5, 150, 105, 0.06)' : 'transparent',
            boxShadow: salaryRevisionSectionPulse ? '0 0 0 2px rgba(5, 150, 105, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Revision of Salary
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #a7f3d0',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <TrendingUp size={12} />
                  TN/HR/SAL Format &bull; Compensation Revision
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official 2-page Tasknera compensation revision letter with comparative side-by-side previous vs. revised monthly structure, annual CTC, statutory clauses &amp; dual acknowledgement.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<TrendingUp size={14} />}
              onClick={() => setIsSalaryRevisionModalOpen(true)}
              style={{
                backgroundColor: '#059669',
                borderColor: '#059669',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                fontSize: '0.8125rem',
                padding: '8px 16px',
              }}
            >
              Generate Salary Revision Letter
            </Button>
          </div>

          {/* Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '22px 24px',
              border: '1.5px solid #a7f3d0',
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 740 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #a7f3d0',
                    color: '#059669',
                    flexShrink: 0,
                  }}
                >
                  <TrendingUp size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Revision of Salary (Compensation Revision)
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        backgroundColor: '#ecfdf5',
                        color: '#047857',
                        border: '1px solid #a7f3d0',
                      }}
                    >
                      Ref: TN/HR/SAL/[YYYY]/[000]
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Official 2-page Tasknera compensation revision letter detailing performance appraisal rationale, effective date, side-by-side previous vs. revised monthly earnings (Basic, HRA, Special Allowance, Gross), statutory deductions (PF, Gratuity, PT/TDS), Net Take-Home, Annual CTC, clauses on statutory deductions, unchanged employment terms, confidentiality, and Page 2 authorised signoff with Company Seal and employee acknowledgement of receipt.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<TrendingUp size={14} />}
                  onClick={() => setIsSalaryRevisionModalOpen(true)}
                  style={{
                    backgroundColor: '#059669',
                    borderColor: '#059669',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                    fontSize: '0.8125rem',
                    padding: '8px 16px',
                  }}
                >
                  Open Revision Generator
                </Button>
              </div>
            </div>

            {/* Quick parameter preview pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                marginTop: 4,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Revision Reason</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Annual Performance Review / Promotion</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Salary Structure Table</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Comparative Previous vs. Revised / Month</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Signatory Authority</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Ms. Sheetal Bedi &bull; CEO (Delhi, India)</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Employee Acknowledgement</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Signature of Employee &amp; Receipt Date</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3C. RELIEVING LETTER SECTION (TN/HR/REL FORMAT)                           */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'RELIEVING') && (
        <div
          id="relieving-letter-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '16px',
            backgroundColor: relievingSectionPulse ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
            boxShadow: relievingSectionPulse ? '0 0 0 2px rgba(37, 99, 235, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Relieving Letter
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #bfdbfe',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <FileCheck2 size={12} />
                  TN/HR/REL Format &bull; Official Separation Letter
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official 1-page Tasknera separation and relieving letter referencing resignation acceptance, Last Working Day, company property handover, FNF dues settlement &amp; confidentiality obligations.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<FileCheck2 size={14} />}
              onClick={() => setIsRelievingModalOpen(true)}
              style={{
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                fontSize: '0.8125rem',
                padding: '8px 16px',
              }}
            >
              Generate Relieving Letter
            </Button>
          </div>

          {/* Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '22px 24px',
              border: '1.5px solid #bfdbfe',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 740 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  <FileCheck2 size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Relieving Letter (Service Relief &amp; Clearance)
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      Ref: TN/HR/REL/[YYYY]/[000]
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Official 1-page Tasknera relieving letter confirming employee relief from services at close of business on Last Working Day. Certifies completion of work handover, return of company assets, full and final dues reconciliation (or adjustments), ongoing post-employment confidentiality &amp; data protection, optional performance rating, and authorized CEO signature with Company Seal.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<FileCheck2 size={14} />}
                  onClick={() => setIsRelievingModalOpen(true)}
                  style={{
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    fontSize: '0.8125rem',
                    padding: '8px 16px',
                  }}
                >
                  Open Relieving Generator
                </Button>
              </div>
            </div>

            {/* Quick parameter preview pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                marginTop: 4,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Resignation &amp; Last Working Day</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Resignation Acceptance &amp; LWD Date</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Exit Handover &amp; Settlement</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>No Dues / Adjusted in Full &amp; Final</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Post-Employment Obligations</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Confidentiality &amp; Data Protection</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Signatory Authority &amp; Seal</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Ms. Sheetal Bedi &bull; CEO (Delhi, India)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3D. PROMOTION LETTER SECTION (TN/HR/PRO FORMAT)                           */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'PROMOTION') && (
        <div
          id="promotion-letter-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '16px',
            backgroundColor: promotionSectionPulse ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
            boxShadow: promotionSectionPulse ? '0 0 0 2px rgba(37, 99, 235, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Promotion Letter
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #bfdbfe',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <Award size={12} />
                  TN/HR/PRO Format &bull; Career Advancement
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Official 1-page Tasknera promotion letter with tabular particulars (current vs. new designation, reporting line, effective date, revised compensation), core responsibilities &amp; dual acknowledgement.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<Award size={14} />}
              onClick={() => setIsPromotionModalOpen(true)}
              style={{
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                fontSize: '0.8125rem',
                padding: '8px 16px',
              }}
            >
              Generate Promotion Letter
            </Button>
          </div>

          {/* Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '22px 24px',
              border: '1.5px solid #bfdbfe',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 740 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  <Award size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Promotion (Career Progression &amp; Role Elevation)
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      Ref: TN/HR/PRO/[YYYY]/[000]
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Official 1-page Tasknera promotion letter recognizing employee performance and contributions. Formulates the Promotion Particulars Table (Current Designation, New Designation, Department/Team, Reporting To, Effective Date, Revised Compensation), 3 statutory clauses on role responsibilities, compensation deductions, and unchanged terms of employment, followed by CEO authorization with Company Seal and employee acknowledgement receipt.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<Award size={14} />}
                  onClick={() => setIsPromotionModalOpen(true)}
                  style={{
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                    fontSize: '0.8125rem',
                    padding: '8px 16px',
                  }}
                >
                  Open Promotion Generator
                </Button>
              </div>
            </div>

            {/* Quick parameter preview pills */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                marginTop: 4,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Designation Elevation</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Current Designation &rarr; New Role</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Particulars Table</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Reporting Line, Date &amp; Revised Pay</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Signatory Authority</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Ms. Sheetal Bedi &bull; CEO (Delhi, India)</div>
              </div>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                }}
              >
                <div style={{ color: '#64748b', fontWeight: 600, marginBottom: 2 }}>Employee Acknowledgement</div>
                <div style={{ color: '#0f172a', fontWeight: 700 }}>Receipt Signature, Date &amp; City</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONCLUSION OF INTERNSHIP SECTION (TN/HR/INT FORMAT)                    */}
      {/* ========================================================================= */}
      {(activeDocumentTab === 'ALL' || activeDocumentTab === 'INTERNSHIP') && (
        <div
          id="internship-conclusion-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 6,
            paddingTop: 10,
            scrollMarginTop: '80px',
            borderRadius: 14,
            padding: '16px',
            backgroundColor: internshipSectionPulse ? 'rgba(234, 88, 12, 0.06)' : 'transparent',
            boxShadow: internshipSectionPulse ? '0 0 0 2px rgba(234, 88, 12, 0.4)' : 'none',
            transition: 'all 0.4s ease',
          }}
        >
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Conclusion of Internship
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: '#fff7ed',
                    color: '#c2410c',
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #fed7aa',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <GraduationCap size={12} />
                  TN/HR/INT Format &bull; 1-Page Letter
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Formal conclusion of fixed-term internship program, work engagement summary, equipment return, stipend disbursal &amp; completion certificate.
              </p>
            </div>

            <Button
              variant="primary"
              icon={<GraduationCap size={14} />}
              onClick={() => setIsInternshipModalOpen(true)}
              style={{
                backgroundColor: '#ea580c',
                borderColor: '#ea580c',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                fontSize: '0.8125rem',
                padding: '8px 16px',
              }}
            >
              Generate Internship Letter
            </Button>
          </div>

          {/* Feature Showcase Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 12,
              padding: '22px 24px',
              border: '1.5px solid #fed7aa',
              boxShadow: '0 4px 20px rgba(234, 88, 12, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 720 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: '#fff7ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #fed7aa',
                    color: '#ea580c',
                    flexShrink: 0,
                  }}
                >
                  <GraduationCap size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Conclusion of Internship Letter
                    </h4>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 6,
                        backgroundColor: '#fff7ed',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                      }}
                    >
                      Ref: TN/HR/INT/YYYY/000
                    </span>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                    Official 1-page Tasknera letter confirming the conclusion of an internship with role, team department, commenced date, Last Working Day, brief description of duties, optional commendation line, and 5 standard exit formalities including work handover, property return, stipend dues, and Internship Completion Certificate issuance.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <Button
                  variant="primary"
                  icon={<FileText size={14} />}
                  onClick={() => setIsInternshipModalOpen(true)}
                  style={{
                    backgroundColor: '#ea580c',
                    borderColor: '#ea580c',
                    fontSize: '0.8125rem',
                  }}
                >
                  Open Internship Generator
                </Button>
              </div>
            </div>

            {/* Quick Parameter Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 12,
                paddingTop: 14,
                borderTop: '1px solid #f1f5f9',
              }}
            >
              {[
                {
                  label: 'Role & Department',
                  val: 'Internship role in dedicated team department',
                  icon: <Briefcase size={14} style={{ color: '#ea580c' }} />,
                },
                {
                  label: 'Tenure & Last Working Day',
                  val: 'Commenced on date through Last Working Day completion',
                  icon: <Calendar size={14} style={{ color: '#0284c7' }} />,
                },
                {
                  label: 'Exit & Access Withdrawal',
                  val: 'Points 1 & 2: Work handover & System access withdrawal on LWD',
                  icon: <ShieldCheck size={14} style={{ color: '#7c3aed' }} />,
                },
                {
                  label: 'Stipend & Certificate',
                  val: 'Points 4 & 5: Stipend payment by date & Completion Certificate',
                  icon: <Award size={14} style={{ color: '#059669' }} />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CERTIFICATES SECTION                                                   */}
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
              {getDeletedPolicyCodes().length > 0 && (
                <button
                  type="button"
                  onClick={handleRestorePolicies}
                  title="Restore deleted default policies"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '2px 9px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                >
                  <RotateCcw size={11} /> Restore Default Policies
                </button>
              )}
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

        {/* Policy Generator Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '18px 20px',
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
                  borderRadius: 8,
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bfdbfe',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Create Custom Policy
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Describe the policy you need in plain words to generate full clauses and guidelines.
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
                justifyContent: 'flex-end',
                flexWrap: 'wrap',
                gap: 8,
                paddingTop: 8,
                marginTop: 4,
                borderTop: '1px solid #f1f5f9',
              }}
            >
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
                      <button
                        type="button"
                        title={`Delete ${policy.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePolicy(policy);
                        }}
                        style={{
                          border: '1px solid #fee2e2',
                          backgroundColor: '#fff5f5',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '3px 6px',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.borderColor = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff5f5';
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.borderColor = '#fee2e2';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
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

      {/* PDF to Official Letterhead Generator Modal */}
      {isGeneratePdfModalOpen && (
        <GenerateLetterFromPdfModal
          isOpen={isGeneratePdfModalOpen}
          onClose={() => setIsGeneratePdfModalOpen(false)}
          onSuccess={() => {
            fetchOffers();
          }}
        />
      )}

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
        onDelete={handleDeletePolicy}
        onPolicyUpdate={(updated) => {
          setAllPoliciesList(getAllPolicies());
          setSelectedPolicyForView(updated);
        }}
      />

      {/* Official Master Recruitment Services Agreement (MRSA) Modal */}
      <MasterRecruitmentAgreementModal
        isOpen={isMrsModalOpen}
        onClose={() => setIsMrsModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Freelancer Onboarding Letter Modal */}
      <FreelancerOnboardingModal
        isOpen={isFreelancerModalOpen}
        onClose={() => setIsFreelancerModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Freelance Recruiter Services Agreement (14-page master) Modal */}
      <FreelanceRecruiterAgreementModal
        isOpen={isRecruiterAgreementModalOpen}
        onClose={() => setIsRecruiterAgreementModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Notice of Termination (Freelance Recruiter Services) Modal */}
      <FreelancerTerminationModal
        isOpen={isTerminationModalOpen}
        onClose={() => setIsTerminationModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Employee Termination Letter (Zero Tolerance Policy) Modal */}
      <EmployeeTerminationModal
        isOpen={isEmployeeTerminationModalOpen}
        onClose={() => setIsEmployeeTerminationModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Acceptance of Resignation (TN/HR/RES) Modal */}
      <ResignationAcceptanceModal
        isOpen={isResignationModalOpen}
        onClose={() => setIsResignationModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Revision of Salary (TN/HR/SAL) Modal */}
      <SalaryRevisionModal
        isOpen={isSalaryRevisionModalOpen}
        onClose={() => setIsSalaryRevisionModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />

      {/* Official Promotion Letter (TN/HR/PRO) Modal */}
      <PromotionLetterModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        onSuccess={() => fetchOffers()}
      />
    </div>
  );
};
