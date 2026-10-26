import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  CheckCircle2,
  UserCheck,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { OfferStatusBadge } from '../components/common/Badge.js';
import { offerService } from '../services/offerService.js';
import { Employee, EmployeeService } from '../services/employeeService.js';
import { DocumentEngineService } from '../services/documentEngineService.js';
import { OfferListItem, DashboardStatistics } from '../types/offer.js';
import { OfferStatus } from '../types/index.js';
import { OfferDetailModal } from '../components/offers/OfferDetailModal.js';
import { EmailSendModal } from '../components/offers/EmailSendModal.js';
import { EmailHistoryModal } from '../components/offers/EmailHistoryModal.js';
import { QuickTemplateOfferModal } from '../components/offers/QuickTemplateOfferModal.js';
import { GenerateDocumentModal } from '../components/employees/GenerateDocumentModal.js';
import { CharacterCertificateModal } from '../components/documents/CharacterCertificateModal.js';
import { ExperienceLetterModal } from '../components/documents/ExperienceLetterModal.js';
import { SalarySlipModal } from '../components/documents/SalarySlipModal.js';
import { RelievingCertificateModal } from '../components/documents/RelievingCertificateModal.js';
import { FreelancerOnboardingModal } from '../components/documents/FreelancerOnboardingModal.js';
import { FreelanceRecruiterAgreementModal } from '../components/documents/FreelanceRecruiterAgreementModal.js';
import { FreelancerTerminationModal } from '../components/documents/FreelancerTerminationModal.js';
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

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [recentOffers, setRecentOffers] = useState<OfferListItem[]>([]);
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [activeOperationalTab, setActiveOperationalTab] = useState<'EMPLOYEES' | 'OFFERS'>('EMPLOYEES');

  // Active Modals
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isEmpDocModalOpen, setIsEmpDocModalOpen] = useState(false);
  const [selectedEmployeeForGenDoc, setSelectedEmployeeForGenDoc] = useState<Employee | null>(null);

  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSalarySlipModalOpen, setIsSalarySlipModalOpen] = useState(false);
  const [isRelievingModalOpen, setIsRelievingModalOpen] = useState(false);
  const [isFreelancerModalOpen, setIsFreelancerModalOpen] = useState(false);
  const [isRecruiterAgreementModalOpen, setIsRecruiterAgreementModalOpen] = useState(false);
  const [isTerminationModalOpen, setIsTerminationModalOpen] = useState(false);

  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<OfferListItem | null>(null);
  const [selectedOfferForEmail, setSelectedOfferForEmail] = useState<OfferListItem | null>(null);
  const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<OfferListItem | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, offersRes, empRes, docRes] = await Promise.allSettled([
        offerService.getDashboardStatistics(),
        offerService.listOffers({ limit: 6 }),
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
        setEmployees(empRes.value);
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

  // Compute accurate document count for each employee (backend + local storage)
  const getEmployeeDocumentCount = (emp: Employee): number => {
    const backendCount = emp.documentCount || (emp.documents ? emp.documents.length : 0);
    try {
      const saved: any[] = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
      const localMatches = saved.filter((d) => {
        const rName = (d.recipientName || '').toLowerCase().trim();
        const eName = (emp.fullName || '').toLowerCase().trim();
        const rEmail = (d.recipientEmail || '').toLowerCase().trim();
        const eEmail = (emp.personalEmail || emp.officialEmail || '').toLowerCase().trim();
        const rId = (d.recipientExternalId || '').trim();
        return (
          (rName && eName && (rName === eName || rName.includes(eName) || eName.includes(rName))) ||
          (rEmail && eEmail && rEmail === eEmail) ||
          (rId && (rId === emp.employeeId || rId === emp.id))
        );
      }).length;
      return Math.max(backendCount, localMatches);
    } catch {
      return backendCount;
    }
  };

  // Filtered employees list based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase().trim();
    return employees.filter(
      (e) =>
        e.fullName?.toLowerCase().includes(q) ||
        e.employeeId?.toLowerCase().includes(q) ||
        e.department?.toLowerCase().includes(q) ||
        e.designation?.toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

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
        className="card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Welcome back, {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin' : 'Admin'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 4, marginBottom: 0 }}>
            {todayFormatted} &bull; Overview of employees, documents, and offers.
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
            New Document
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsQuickModalOpen(true)}
            icon={<Plus size={14} />}
            style={{ fontSize: '0.8125rem', padding: '8px 18px', backgroundColor: '#2563eb' }}
          >
            New Offer
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {/* KPI 1: Total Employees */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
          onClick={() => {
            setActiveOperationalTab('EMPLOYEES');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Total Employees
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
              <Users2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {totalEmployees}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Active team members
          </div>
        </div>

        {/* KPI 2: Documents Generated */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
          onClick={() => navigate('/documents')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Documents Created
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f8fafc',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #cbd5e1',
              }}
            >
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {totalDocuments}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>
            Issued letters and records
          </div>
        </div>

        {/* KPI 3: Action Required */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
          onClick={() => navigate('/offers?status=HR_REVIEW')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Pending Review
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
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginTop: 8 }}>
            {stats.awaitingReview + stats.draft}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: 4 }}>
            {stats.awaitingReview > 0
              ? `${stats.awaitingReview} awaiting sign-off`
              : 'All reviews up to date'}
          </div>
        </div>

        {/* KPI 4: Accepted & Rate */}
        <div
          className="card"
          style={{
            padding: '20px 22px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
          onClick={() => navigate('/offers?status=ACCEPTED')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
              Offer Acceptance
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bbf7d0',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#15803d', marginTop: 8 }}>
            {acceptanceRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 4 }}>
            {stats.accepted} accepted of {stats.sent} sent
          </div>
        </div>
      </div>

      {/* 3. Main Workspace: EMPLOYEES & DOCUMENTS CREATED + Recent Offers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Operational Section with Tabs */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header & Section Navigation Tabs */}
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
            {/* Operational Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveOperationalTab('EMPLOYEES')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: activeOperationalTab === 'EMPLOYEES' ? 600 : 500,
                  backgroundColor: activeOperationalTab === 'EMPLOYEES' ? '#ffffff' : 'transparent',
                  color: activeOperationalTab === 'EMPLOYEES' ? '#2563eb' : '#64748b',
                  boxShadow: activeOperationalTab === 'EMPLOYEES' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <Users2 size={14} />
                <span>Employees ({employees.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOperationalTab('OFFERS')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: activeOperationalTab === 'OFFERS' ? 600 : 500,
                  backgroundColor: activeOperationalTab === 'OFFERS' ? '#ffffff' : 'transparent',
                  color: activeOperationalTab === 'OFFERS' ? '#2563eb' : '#64748b',
                  boxShadow: activeOperationalTab === 'OFFERS' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <FileText size={14} />
                <span>Recent Offers ({recentOffers.length})</span>
              </button>
            </div>

            {/* Quick Action Link */}
            {activeOperationalTab === 'EMPLOYEES' ? (
              <Button
                variant="secondary"
                onClick={() => navigate('/employees')}
                style={{ fontSize: '0.78125rem', padding: '6px 12px' }}
              >
                View All Employees <ArrowRight size={13} style={{ marginLeft: 4 }} />
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => navigate('/offers')}
                style={{ fontSize: '0.78125rem', padding: '6px 12px' }}
              >
                View All Offers <ArrowRight size={13} style={{ marginLeft: 4 }} />
              </Button>
            )}
          </div>

          {/* Subheader Search Bar for Employees */}
          {activeOperationalTab === 'EMPLOYEES' && (
            <div
              style={{
                padding: '12px 22px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
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
                  placeholder="Filter by employee name, ID, or department..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 32px',
                    fontSize: '0.8125rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    backgroundColor: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Showing <strong>{filteredEmployees.length}</strong> employees with document counts
              </div>
            </div>
          )}

          {/* Tab 1: EMPLOYEES SECTION (Employee Name & Documents Created) */}
          {activeOperationalTab === 'EMPLOYEES' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Employee Name
                    </th>
                    <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Role & Dept
                    </th>
                    <th style={{ padding: '12px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      Documents Created
                    </th>
                    <th style={{ padding: '12px 18px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '48px 20px', textAlign: 'center' }}>
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
                            <Users2 size={22} />
                          </div>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                            No employees found
                          </div>
                          <p style={{ color: '#64748b', fontSize: '0.78rem', maxWidth: 320, margin: 0 }}>
                            Add company employees to track and generate official HR documents.
                          </p>
                          <Button
                            variant="primary"
                            onClick={() => navigate('/employees')}
                            icon={<Plus size={14} />}
                            style={{ fontSize: '0.8125rem', marginTop: 4 }}
                          >
                            Go to Employees Directory
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.slice(0, 10).map((emp) => {
                      const docCount = getEmployeeDocumentCount(emp);
                      return (
                        <tr
                          key={emp.id}
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
                          {/* Name of the Employee */}
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: '50%',
                                  backgroundColor: '#2563eb',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                  flexShrink: 0,
                                }}
                              >
                                {(emp.fullName || 'E')
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '0.86rem',
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => navigate(`/employees/${emp.id}`)}
                                >
                                  {emp.fullName}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                                  ID: <strong style={{ color: '#2563eb' }}>{emp.employeeId}</strong> &bull; {emp.personalEmail || emp.officialEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role & Department */}
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a' }}>
                              {emp.designation || 'Staff'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
                              {emp.department || 'General'}
                            </div>
                          </td>

                          {/* How many documents are created against that employee */}
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '4px 10px',
                                borderRadius: 16,
                                backgroundColor: docCount > 0 ? '#ecfdf5' : '#f1f5f9',
                                color: docCount > 0 ? '#047857' : '#64748b',
                                border: docCount > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                              }}
                            >
                              <Layers size={12} style={{ color: docCount > 0 ? '#059669' : '#94a3b8' }} />
                              <span>
                                {docCount} {docCount === 1 ? 'Document Created' : 'Documents Created'}
                              </span>
                            </span>
                          </td>

                          {/* Actions for this employee */}
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                  setSelectedEmployeeForGenDoc(emp);
                                  setIsEmpDocModalOpen(true);
                                }}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '0.74rem',
                                  color: '#2563eb',
                                  backgroundColor: '#eff6ff',
                                  borderColor: '#bfdbfe',
                                  fontWeight: 600,
                                }}
                                title="Generate document for this employee"
                              >
                                <Plus size={12} style={{ marginRight: 3 }} /> Generate Document
                              </button>

                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate(`/employees/${emp.id}`)}
                                style={{ padding: '5px 8px', fontSize: '0.74rem' }}
                                title="View employee profile & documents"
                              >
                                <Eye size={12} style={{ marginRight: 3 }} /> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: RECENT OFFERS TABLE */}
          {activeOperationalTab === 'OFFERS' && (
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
          )}
        </div>

        {/* Right Column: Quick Document Generator & System Standing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Quick Document Generator Card */}
          <div className="card" style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Create Document
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0' }}>
                Choose a document type to create
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                {
                  label: 'Experience Letter',
                  desc: 'Service and role confirmation',
                  icon: <Briefcase size={15} style={{ color: '#ea580c' }} />,
                  action: () => setIsExperienceModalOpen(true),
                },
                {
                  label: 'Salary Slip',
                  desc: 'Monthly earnings and deductions',
                  icon: <DollarSign size={15} style={{ color: '#059669' }} />,
                  action: () => setIsSalarySlipModalOpen(true),
                },
                {
                  label: 'Character Certificate',
                  desc: 'Conduct and character certificate',
                  icon: <Award size={15} style={{ color: '#7c3aed' }} />,
                  action: () => setIsCharacterModalOpen(true),
                },
                {
                  label: 'Freelancer Onboarding',
                  desc: 'Revenue-based engagement letter',
                  icon: <UserCheck size={15} style={{ color: '#059669' }} />,
                  action: () => setIsFreelancerModalOpen(true),
                },
                {
                  label: 'Recruiter Agreement',
                  desc: 'Master 14-page recruiter contract',
                  icon: <Scale size={15} style={{ color: '#2563eb' }} />,
                  action: () => setIsRecruiterAgreementModalOpen(true),
                },
                {
                  label: 'Termination Notice',
                  desc: 'Notice of contract termination',
                  icon: <AlertTriangle size={15} style={{ color: '#dc2626' }} />,
                  action: () => setIsTerminationModalOpen(true),
                },
                {
                  label: 'Relieving Letter',
                  desc: 'Work completion and clearance',
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

          {/* System Status Card */}
          <div
            className="card"
            style={{
              padding: '18px 20px',
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={16} style={{ color: '#059669' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                System Status
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>All systems operational</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Your Role:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{user?.roles?.[0] || 'Admin'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ color: '#64748b' }}>Audit Log:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Active & Recording</span>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate('/audit-logs')}
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '7px 10px' }}
            >
              View Audit Log <ArrowRight size={13} style={{ marginLeft: 4 }} />
            </Button>
          </div>
        </div>
      </div>

      {/* Employee Document Generation Workflow Modal */}
      {isEmpDocModalOpen && selectedEmployeeForGenDoc && (
        <GenerateDocumentModal
          employee={selectedEmployeeForGenDoc}
          isOpen={isEmpDocModalOpen}
          onClose={() => {
            setIsEmpDocModalOpen(false);
            setSelectedEmployeeForGenDoc(null);
          }}
          onDocumentGenerated={() => {
            loadDashboardData();
            success(`Document generated successfully for ${selectedEmployeeForGenDoc.fullName}!`);
          }}
        />
      )}

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

      <FreelancerOnboardingModal
        isOpen={isFreelancerModalOpen}
        onClose={() => setIsFreelancerModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      <FreelanceRecruiterAgreementModal
        isOpen={isRecruiterAgreementModalOpen}
        onClose={() => setIsRecruiterAgreementModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />

      <FreelancerTerminationModal
        isOpen={isTerminationModalOpen}
        onClose={() => setIsTerminationModalOpen(false)}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  );
};
