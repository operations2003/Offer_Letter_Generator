import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  ArrowUpRight,
  FileCheck2,
  Layers,
  CalendarCheck2,
  Award,
  Headphones,
  Plus,
  BookOpen,
  UserCheck,
  BrainCircuit,
  ShieldCheck,
  Users2,
  GraduationCap,
  FileText,
  Search,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';

interface CoreDocTypeItem {
  code: string;
  name: string;
  desc: string;
  sections: number;
}

const CORE_DOC_TYPES: CoreDocTypeItem[] = [
  { code: 'OFFER_LETTER', name: 'Offer Letter', desc: 'Pre-hire terms, CTC, and joining date', sections: 5 },
  { code: 'INTERNSHIP_LETTER', name: 'Internship Letter', desc: 'Stipend, project scope, and mentor assignment', sections: 4 },
  { code: 'INCREMENT_LETTER', name: 'Increment Letter', desc: 'Performance appraisal and revised salary', sections: 4 },
  { code: 'TERMINATION_LETTER', name: 'Termination Letter', desc: 'Formal notice and exit terms', sections: 4 },
  { code: 'EXPERIENCE_LETTER', name: 'Experience Letter', desc: 'Tenure, designation, and service attestation', sections: 3 },
  { code: 'RELIEVING_LETTER', name: 'Relieving Letter', desc: 'Official discharge and release confirmation', sections: 3 },
  { code: 'FNF_SETTLEMENT', name: 'Full & Final Settlement', desc: 'Gratuity, leave encashment, and dues statement', sections: 5 },
  { code: 'CONTRACT_LETTER', name: 'Contract Letter', desc: 'Fixed-term deliverables and scope of work', sections: 5 },
  { code: 'MSA', name: 'Master Service Agreement', desc: 'Vendor SLAs, liability caps, and governance', sections: 6 },
];

const CORE_POLICIES = [
  'Leave Policy',
  'Attendance Policy',
  'Work From Home Policy',
  'Remote Work Policy',
  'Hybrid Work Policy',
  'Code of Conduct',
  'Anti-Harassment Policy',
  'IT / Acceptable Use Policy',
  'Data Privacy Policy',
  'Information Security Policy',
  'Expense Policy',
  'Travel Policy',
  'Recruitment Policy',
  'Onboarding Policy',
  'Performance Management Policy',
  'Probation Policy',
  'Grievance Policy',
  'Disciplinary Policy',
  'Exit/Offboarding Policy',
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'documents' | 'policies' | 'onboarding' | 'learning' | 'assessments' | 'certificates'
  >('documents');

  // Unified 6 Pillars Statistics
  const pillarStats = {
    documents: { total: 9, activeCount: 24, label: '9 Core Document Types' },
    policies: { total: 19, activeCount: 19, label: '19 Governance Policies' },
    onboarding: { total: 3, pendingCount: 2, label: 'Active Cohort Candidates' },
    learning: { total: 4, mandatoryCount: 2, label: 'Enterprise Curricula' },
    assessments: { total: 3, questionBankCount: 12, label: 'Cognitive & Tech Tests' },
    certificates: { total: 8, verifiedCount: 8, label: 'Issued Official Credentials' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Executive Master Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #090e1d 0%, #0d172e 100%)',
          borderRadius: 20,
          padding: '32px 36px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(9, 14, 29, 0.25)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 860 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 9999,
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              color: '#93c5fd',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <Sparkles size={13} style={{ color: '#60a5fa' }} />
            <span>TaskNera Enterprise HRMS &bull; Step 11 Unified Command Center</span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            Welcome back, {user?.firstName || 'Sakshi'}!
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: 680,
              marginBottom: 20,
            }}
          >
            One unified platform connecting all 6 core pillars: HR Documents, Governance Policies,
            Configurable Onboarding, L&D Academy, Aptitude & Technical Assessments, and Verifiable
            Certificates.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Button
              variant="primary"
              onClick={() => navigate('/documents')}
              icon={<Plus size={16} />}
              style={{ padding: '9px 18px', fontSize: '0.85rem' }}
            >
              Create HR Document
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/onboarding')}
              icon={<UserCheck size={15} />}
              style={{
                padding: '9px 18px',
                fontSize: '0.85rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              Onboarding Portal
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/learning')}
              icon={<Award size={15} />}
              style={{
                padding: '9px 18px',
                fontSize: '0.85rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              L&D & Certificates
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/assessments')}
              icon={<BrainCircuit size={15} />}
              style={{
                padding: '9px 18px',
                fontSize: '0.85rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.18)',
              }}
            >
              Assessments & Quizzes
            </Button>
          </div>
        </div>

        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 2. Top Metric Cards — Exact TaskNera Operational Modules */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 16,
        }}
      >
        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 16,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
              MY ATTENDANCE
            </span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Live Log</div>
            <div style={{ fontSize: '0.78125rem', color: '#64748b', marginTop: 4 }}>
              Clock in/out & daily attendance
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 16,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
              MY LEAVES
            </span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarCheck2 size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Time Off</div>
            <div style={{ fontSize: '0.78125rem', color: '#64748b', marginTop: 4 }}>
              Check balances & submit requests
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 16,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
              MY PERFORMANCE
            </span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Reviews</div>
            <div style={{ fontSize: '0.78125rem', color: '#64748b', marginTop: 4 }}>
              Quarterly appraisals & objectives
            </div>
          </div>
        </div>

        <div
          className="glass-panel"
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 16,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
              HELPDESK & SUPPORT
            </span>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={16} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>Requests</div>
            <div style={{ fontSize: '0.78125rem', color: '#64748b', marginTop: 4 }}>
              Raise employee tickets & queries
            </div>
          </div>
        </div>
      </div>

      {/* 3. STEP 11: THE 6 CORE PILLARS COMMAND CENTER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Hub Header */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  One Unified HRMS Master Dashboard
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Step 11 Unified Architecture
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized management across HR Documents, Policies, Onboarding, L&D, Assessments, and Certificates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/documents')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New HR Action
            </button>
          </div>
        </div>

        {/* 6 Pillars Quick Overview Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-slate-100 bg-slate-50/60 border-b border-slate-200">
          {/* Pillar 1: HR Documents */}
          <div
            onClick={() => setActiveTab('documents')}
            className={`p-4 cursor-pointer transition-colors ${
              activeTab === 'documents' ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Documents</span>
              <FileCheck2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">9 Types</p>
            <p className="text-[10px] text-blue-600 font-medium mt-0.5">Offer to MSA</p>
          </div>

          {/* Pillar 2: Policies */}
          <div
            onClick={() => setActiveTab('policies')}
            className={`p-4 cursor-pointer transition-colors ${
              activeTab === 'policies' ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Policies</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">19 Types</p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Version Controlled</p>
          </div>

          {/* Pillar 3: Onboarding */}
          <div
            onClick={() => setActiveTab('onboarding')}
            className={`p-4 cursor-pointer transition-colors ${
              activeTab === 'onboarding' ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Onboarding</span>
              <Users2 className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">Cohorts</p>
            <p className="text-[10px] text-indigo-600 font-medium mt-0.5">Checklist & KYC</p>
          </div>

          {/* Pillar 4: L&D */}
          <div
            onClick={() => setActiveTab('learning')}
            className={`p-4 cursor-pointer transition-colors ${
              activeTab === 'learning' ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">L&D Academy</span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">Courses</p>
            <p className="text-[10px] text-purple-600 font-medium mt-0.5">Compliance Tracks</p>
          </div>

          {/* Pillar 5: Assessments */}
          <div
            onClick={() => setActiveTab('assessments')}
            className={`p-4 cursor-pointer transition-colors ${
              activeTab === 'assessments' ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Assessments</span>
              <BrainCircuit className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">Quizzes</p>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Aptitude & Tech</p>
          </div>

          {/* Pillar 6: Certificates */}
          <div
            onClick={() => setActiveTab('certificates')}
            className={`p-4 cursor-pointer transition-colors ${
              activeTab === 'certificates' ? 'bg-white shadow-sm' : 'hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Certificates</span>
              <Award className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1">Verifiable</p>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">SHA-256 Sealed</p>
          </div>
        </div>

        {/* Dynamic Pillar Tab Content */}
        <div className="p-6">
          {/* ================================================================= */}
          {/* TAB 1: HR DOCUMENTS */}
          {/* ================================================================= */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    HR Documents Engine (All 9 Standard Formats)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Create, audit, and download PDF documents with strict AI assist and human confirmation
                  </p>
                </div>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View All Documents <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {CORE_DOC_TYPES.map((doc) => (
                  <div
                    key={doc.code}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {doc.code}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {doc.sections} Sections
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{doc.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => navigate(`/documents/create?type=${doc.code}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Create Now &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: GOVERNANCE POLICIES */}
          {/* ================================================================= */}
          {activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Governance Policies (19 Enterprise Policies)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Policy creation, approval workflows, employee acknowledgment, and version history
                  </p>
                </div>
                <button
                  onClick={() => navigate('/policies')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                >
                  Manage Policies <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {CORE_POLICIES.map((policyName) => (
                  <div
                    key={policyName}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {policyName}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      v1.0
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: ONBOARDING */}
          {/* ================================================================= */}
          {activeTab === 'onboarding' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Configurable Onboarding Lifecycle
                  </h3>
                  <p className="text-xs text-slate-500">
                    Personal details, KYC document collection, IT checklists, and verification progression
                  </p>
                </div>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Open Onboarding Center <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Aditya Sen (Staff Full-Stack Architect)
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Engineering</span> &bull; <span>Joining: 2026-10-15</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>KYC & Checklist: 85%</span>
                    <span className="font-bold text-indigo-600">VERIFIED</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Neha Kapoor (Senior People Operations Partner)
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Human Resources</span> &bull; <span>Joining: 2026-10-20</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Pending Bank & Declaration</span>
                    <span className="font-bold text-amber-600">IN_PROGRESS</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Rahul Varma (DevOps Cloud Engineer)
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Cloud Platform</span> &bull; <span>Joining: 2026-11-01</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Checklist Complete</span>
                    <span className="font-bold text-emerald-600">READY_FOR_JOINING</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: L&D ACADEMY */}
          {/* ================================================================= */}
          {activeTab === 'learning' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Learning & Development Academy Tracks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory corporate compliance, technical curricula, assignments, and progression
                  </p>
                </div>
                <button
                  onClick={() => navigate('/learning')}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  Explore Course Catalog <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      SECURITY
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Mandatory
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Enterprise Information Security & Data Privacy 2026
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    Phishing simulation, OWASP Top 10, zero-trust hygiene, and client data governance.
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Instructor: Vikram Joshi &bull; Duration: 3 Hours
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      TECHNICAL
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Certificate Eligible
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Cloud Architecture & Multi-Tenant Database Design
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    High-concurrency microservices, PostgreSQL sharding, connection pooling, and consensus.
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Instructor: Sakshi Koparde &bull; Duration: 2 Weeks
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: ASSESSMENTS & QUIZZES */}
          {/* ================================================================= */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Aptitude Tests & Cognitive Quizzes (Step 10)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Numerical reasoning, logical deduction, verbal aptitude, and technical screening
                  </p>
                </div>
                <button
                  onClick={() => navigate('/assessments')}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                >
                  Launch Assessment Center <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      APTITUDE & LOGIC
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Pass: 70%</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    TaskNera General Aptitude Benchmark 2026
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    5 Questions &bull; 20 Mins Limit &bull; Max 2 Attempts &bull; Numerical, Logical & Verbal
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate('/assessments')}
                      className="px-3 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      Start Test
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                      TECHNICAL
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">Pass: 75%</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Engineering Core Competency & Cloud Fundamentals
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    HTTP Protocols & ACID Transaction model multi-choice & multi-answers quiz.
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate('/assessments')}
                      className="px-3 py-1 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: CERTIFICATES */}
          {/* ================================================================= */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Verifiable Certificates Authority (Step 9)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Course completion, professional training, internship, participation, achievement & appreciation credentials
                  </p>
                </div>
                <button
                  onClick={() => navigate('/learning')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  Certificate Registry <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 text-xs">CERT-2026-8812</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ISSUED
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    Sakshi Koparde &bull; Enterprise Information Security 2026
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    SHA-256: b163d087a866704a... &bull; Issued: 2026-09-10
                  </p>
                </div>

                <button
                  onClick={() => navigate('/learning')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  View Certificate PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
