// =============================================================================
// EMPLOYEES DIRECTORY PAGE
// =============================================================================
// Manage company employees, view essentials, search/filter, and trigger document generation.
// Workflow: Add employee once → Select employee → Generate Document
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  UserCheck,
  Search,
  FileText,
  Filter,
  ArrowRight,
  MoreVertical,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  FileCheck,
  Trash2,
  Sparkles,
  Scale,
  Plus,
  FileSignature,
} from 'lucide-react';
import { Employee, EmployeeService } from '../services/employeeService.js';
import { AddEmployeeModal } from '../components/employees/AddEmployeeModal.js';
import { AddFreelancerModal } from '../components/employees/AddFreelancerModal.js';
import { GenerateDocumentModal } from '../components/employees/GenerateDocumentModal.js';
import { FreelancerOnboardingModal } from '../components/documents/FreelancerOnboardingModal.js';
import { FreelanceRecruiterAgreementModal } from '../components/documents/FreelanceRecruiterAgreementModal.js';
import { FreelancerTerminationModal } from '../components/documents/FreelancerTerminationModal.js';
import { ResignationAcceptanceModal } from '../components/documents/ResignationAcceptanceModal.js';
import { SalaryRevisionModal } from '../components/documents/SalaryRevisionModal.js';
import { useToast } from '../context/ToastContext.js';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [rosterTab, setRosterTab] = useState<'ALL' | 'EMPLOYEES' | 'FREELANCERS'>('ALL');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFreelancerModalOpen, setIsAddFreelancerModalOpen] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [selectedEmployeeForDoc, setSelectedEmployeeForDoc] = useState<Employee | null>(null);

  // Freelancer Direct Letter Modals
  const [isFreelancerOnboardingOpen, setIsFreelancerOnboardingOpen] = useState(false);
  const [isFreelanceAgreementOpen, setIsFreelanceAgreementOpen] = useState(false);
  const [isFreelancerTerminationOpen, setIsFreelancerTerminationOpen] = useState(false);
  const [selectedFreelancerForLetter, setSelectedFreelancerForLetter] = useState<Employee | null>(null);

  // Resignation Acceptance Modal
  const [isResignationModalOpen, setIsResignationModalOpen] = useState(false);
  const [selectedEmployeeForResignation, setSelectedEmployeeForResignation] = useState<Employee | null>(null);

  // Salary Revision Modal
  const [isSalaryRevisionModalOpen, setIsSalaryRevisionModalOpen] = useState(false);
  const [selectedEmployeeForSalaryRevision, setSelectedEmployeeForSalaryRevision] = useState<Employee | null>(null);

  useEffect(() => {
    loadEmployees();
  }, [departmentFilter, statusFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EmployeeService.listEmployees({
        search,
        department: departmentFilter,
        status: statusFilter,
      });
      setEmployees(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmployees();
  };

  const handleDeleteEmployee = async (empId: string, empName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${empName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await EmployeeService.deleteEmployee(empId);
      success(`"${empName}" deleted successfully.`);
      loadEmployees();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete record');
    }
  };

  // Metrics
  const totalCount = employees.length;
  const freelancerCount = employees.filter(
    (e) => e.employmentType === 'Freelance' || e.employmentType === 'Contractor'
  ).length;
  const employeeCount = totalCount - freelancerCount;
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const onboardingCount = employees.filter((e) => e.status === 'ONBOARDING').length;
  const probationCount = employees.filter((e) => e.status === 'PROBATION').length;

  // Filtered list based on rosterTab
  const displayedEmployees = employees.filter((e) => {
    const isFreelancer = e.employmentType === 'Freelance' || e.employmentType === 'Contractor';
    if (rosterTab === 'EMPLOYEES') return !isFreelancer;
    if (rosterTab === 'FREELANCERS') return isFreelancer;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; border: string }> = {
      ACTIVE: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
      ONBOARDING: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
      PROBATION: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
      RESIGNED: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
      TERMINATED: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
    };
    const style = map[status] || map.ACTIVE;
    return (
      <span
        style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          backgroundColor: style.bg,
          color: style.text,
          border: `1px solid ${style.border}`,
          padding: '2px 8px',
          borderRadius: 12,
        }}
      >
        {status}
      </span>
    );
  };

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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header & Primary Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Employees & Freelancers
              </h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                View employee & contractor profiles and generate official HR & legal letters.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSelectedEmployeeForDoc(null);
              setIsGenModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#ffffff',
              color: '#2563eb',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={15} />
            <span>New Document</span>
          </button>

          <button
            onClick={() => setIsAddFreelancerModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <UserCheck size={15} />
            <span>+ Add Freelancer</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
            }}
          >
            <UserPlus size={15} />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total Roster</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{totalCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>Freelancers & Contractors</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#059669', marginTop: 4 }}>{freelancerCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb' }}>Full-time Employees</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1d4ed8', marginTop: 4 }}>{employeeCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>Active Status</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#15803d', marginTop: 4 }}>{activeCount}</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED ADD FREELANCER SECTION (LETTER-ESSENTIAL FIELDS)                 */}
      {/* ========================================================================= */}
      <div
        id="add-freelancer-section"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          border: '1.5px solid #a7f3d0',
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.08)',
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', maxWidth: 780 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: '#d1fae5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #6ee7b7',
                flexShrink: 0,
              }}
            >
              <Briefcase size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#064e3b', margin: 0 }}>
                  Add Freelancer
                </h3>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Streamlined Letter Fields Only
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    color: '#047857',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  No CTC • No HRA • No PF
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                Register independent recruiters and consultants with only the fields strictly needed for their legal contracts & letters: <strong>Addressee Name, Jurisdiction Address, Role/Mandate, Payout Terms (Clause 5.1/Revenue Share), and PAN Number</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setIsAddFreelancerModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                fontSize: '0.85rem',
                fontWeight: 700,
                backgroundColor: '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} />
              <span>+ Add Freelancer</span>
            </button>
          </div>
        </div>

        {/* Quick Letter Generation Shortcuts */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            paddingTop: 12,
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            Instant Document Generation for Freelancers:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setSelectedFreelancerForLetter(null);
                setIsFreelancerOnboardingOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#059669',
                border: '1px solid #a7f3d0',
                cursor: 'pointer',
              }}
            >
              <FileText size={13} />
              <span>Onboarding Letter (TSK/ONB)</span>
            </button>

            <button
              onClick={() => {
                setIsFreelanceAgreementOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                cursor: 'pointer',
              }}
            >
              <FileSignature size={13} />
              <span>Master Recruiter Agreement</span>
            </button>

            <button
              onClick={() => {
                setSelectedFreelancerForLetter(null);
                setIsFreelancerTerminationOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fecaca',
                cursor: 'pointer',
              }}
            >
              <AlertTriangle size={13} />
              <span>Notice of Termination</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Category Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { key: 'ALL', label: `All Personnel (${totalCount})` },
          { key: 'FREELANCERS', label: `Freelancers & Contractors (${freelancerCount})` },
          { key: 'EMPLOYEES', label: `Full-time Employees (${employeeCount})` },
        ].map((tab) => {
          const isActive = rosterTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setRosterTab(tab.key as any)}
              style={{
                padding: '7px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 8,
                border: isActive ? '1.5px solid #059669' : '1px solid #cbd5e1',
                backgroundColor: isActive ? '#ecfdf5' : '#ffffff',
                color: isActive ? '#047857' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            />
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              fontSize: '0.8125rem',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              backgroundColor: '#ffffff',
            }}
          >
            <option value="ALL">All Departments</option>
            {Array.from(
              new Set([
                'Talent Acquisition',
                'Human Resources',
                'Business Development',
                'IT',
                'HR',
                'TA',
                'BDM',
                ...employees.map((e) => e.department).filter(Boolean),
              ])
            ).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 10px',
              fontSize: '0.8125rem',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              backgroundColor: '#ffffff',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ONBOARDING">Onboarding</option>
            <option value="PROBATION">Probation</option>
            <option value="RESIGNED">Resigned</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Personnel Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading roster records...
          </div>
        ) : displayedEmployees.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              {rosterTab === 'FREELANCERS' ? 'No Freelancers Registered' : 'No Records Found'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 4 }}>
              {rosterTab === 'FREELANCERS'
                ? 'Register your first freelance recruiter or contractor to create their letters.'
                : 'Try adjusting your search criteria or add your first employee/freelancer.'}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button
                onClick={() => setIsAddFreelancerModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
                }}
              >
                <UserCheck size={14} />
                <span>+ Add Freelancer</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Add Employee
              </button>
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 18px' }}>Name & Contact</th>
                <th style={{ padding: '12px 18px' }}>Role & Department</th>
                <th style={{ padding: '12px 18px' }}>Type</th>
                <th style={{ padding: '12px 18px' }}>Engagement Date</th>
                <th style={{ padding: '12px 18px' }}>Status</th>
                <th style={{ padding: '12px 18px' }}>Letters Created</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedEmployees.map((emp) => {
                const isFreelancer = emp.employmentType === 'Freelance' || emp.employmentType === 'Contractor';
                return (
                  <tr
                    key={emp.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s',
                      backgroundColor: isFreelancer ? '#fcfdfd' : 'transparent',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isFreelancer ? '#fcfdfd' : 'transparent')}
                  >
                    {/* Name & ID */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: isFreelancer ? '#059669' : '#2563eb',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            flexShrink: 0,
                          }}
                        >
                          {emp.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div
                            onClick={() => navigate(`/employees/${emp.id}`)}
                            style={{
                              fontWeight: 700,
                              color: '#0f172a',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            {emp.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ID: <strong style={{ color: isFreelancer ? '#059669' : '#2563eb' }}>{emp.employeeId}</strong> • {emp.personalEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Designation & Department */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{emp.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {emp.department} • {emp.workLocation || 'Remote'}
                      </div>
                    </td>

                    {/* Employment Type */}
                    <td style={{ padding: '14px 18px' }}>
                      {isFreelancer ? (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            padding: '2px 8px',
                            borderRadius: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Briefcase size={11} />
                          Freelance
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            padding: '2px 8px',
                            borderRadius: 12,
                          }}
                        >
                          Full-time
                        </span>
                      )}
                    </td>

                    {/* Engagement / Joining Date */}
                    <td style={{ padding: '14px 18px', color: '#334155' }}>
                      {new Date(emp.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>{getStatusBadge(emp.status)}</td>

                    {/* Document Count */}
                    <td style={{ padding: '14px 18px' }}>
                      {(() => {
                        const count = getEmployeeDocumentCount(emp);
                        return (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 16,
                              backgroundColor: count > 0 ? '#ecfdf5' : '#f1f5f9',
                              color: count > 0 ? '#047857' : '#64748b',
                              border: count > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                            }}
                          >
                            <FileCheck size={13} style={{ color: count > 0 ? '#059669' : '#94a3b8' }} />
                            <span>
                              {count} {count === 1 ? 'Document' : 'Documents'}
                            </span>
                          </span>
                        );
                      })()}
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {isFreelancer ? (
                          <button
                            onClick={() => {
                              setSelectedFreelancerForLetter(emp);
                              setIsFreelancerOnboardingOpen(true);
                            }}
                            title="Generate Freelancer Onboarding Letter"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                          >
                            <FileText size={13} />
                            <span>Generate Letter</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedEmployeeForDoc(emp);
                              setIsGenModalOpen(true);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                              borderRadius: 6,
                              cursor: 'pointer',
                            }}
                          >
                            <FileText size={13} />
                            <span>Generate Document</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/employees/${emp.id}`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <span>Profile</span>
                          <ChevronRight size={13} />
                        </button>

                        <button
                          title="Delete Record"
                          onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 8px',
                            backgroundColor: '#ffffff',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                            e.currentTarget.style.borderColor = '#f87171';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff';
                            e.currentTarget.style.borderColor = '#fecaca';
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal (Full-time 3-Step Wizard) */}
      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEmployeeAdded={loadEmployees}
        />
      )}

      {/* Add Freelancer Modal (Streamlined Letter-Essential Form) */}
      {isAddFreelancerModalOpen && (
        <AddFreelancerModal
          isOpen={isAddFreelancerModalOpen}
          onClose={() => setIsAddFreelancerModalOpen(false)}
          onFreelancerAdded={(freelancer) => {
            loadEmployees();
            if (freelancer) {
              setSelectedFreelancerForLetter(freelancer);
            }
          }}
        />
      )}

      {/* Standard Document Generation Modal */}
      {isGenModalOpen && (
        <GenerateDocumentModal
          employee={selectedEmployeeForDoc}
          isOpen={isGenModalOpen}
          onClose={() => {
            setIsGenModalOpen(false);
            setSelectedEmployeeForDoc(null);
          }}
          onDocumentGenerated={loadEmployees}
        />
      )}

      {/* Freelancer Onboarding Letter Modal */}
      {isFreelancerOnboardingOpen && (
        <FreelancerOnboardingModal
          isOpen={isFreelancerOnboardingOpen}
          initialEmployee={selectedFreelancerForLetter}
          onClose={() => {
            setIsFreelancerOnboardingOpen(false);
            setSelectedFreelancerForLetter(null);
          }}
          onSuccess={() => loadEmployees()}
        />
      )}

      {/* Freelance Recruiter Agreement Modal */}
      {isFreelanceAgreementOpen && (
        <FreelanceRecruiterAgreementModal
          isOpen={isFreelanceAgreementOpen}
          initialFreelancerName={selectedFreelancerForLetter?.fullName}
          onClose={() => {
            setIsFreelanceAgreementOpen(false);
            setSelectedFreelancerForLetter(null);
          }}
          onSuccess={() => loadEmployees()}
        />
      )}

      {/* Freelancer Termination Notice Modal */}
      {isFreelancerTerminationOpen && (
        <FreelancerTerminationModal
          isOpen={isFreelancerTerminationOpen}
          initialEmployee={selectedFreelancerForLetter}
          onClose={() => {
            setIsFreelancerTerminationOpen(false);
            setSelectedFreelancerForLetter(null);
          }}
          onSuccess={() => loadEmployees()}
        />
      )}

      {/* Acceptance of Resignation (TN/HR/RES) Modal */}
      {isResignationModalOpen && (
        <ResignationAcceptanceModal
          isOpen={isResignationModalOpen}
          initialEmployee={selectedEmployeeForResignation}
          onClose={() => {
            setIsResignationModalOpen(false);
            setSelectedEmployeeForResignation(null);
          }}
          onSuccess={() => loadEmployees()}
        />
      )}

      {/* Revision of Salary (TN/HR/SAL) Modal */}
      {isSalaryRevisionModalOpen && (
        <SalaryRevisionModal
          isOpen={isSalaryRevisionModalOpen}
          initialEmployee={selectedEmployeeForSalaryRevision}
          onClose={() => {
            setIsSalaryRevisionModalOpen(false);
            setSelectedEmployeeForSalaryRevision(null);
          }}
          onSuccess={() => loadEmployees()}
        />
      )}
    </div>
  );
};

