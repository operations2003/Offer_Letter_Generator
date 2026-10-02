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
} from 'lucide-react';
import { Employee, EmployeeService } from '../services/employeeService.js';
import { AddEmployeeModal } from '../components/employees/AddEmployeeModal.js';
import { GenerateDocumentModal } from '../components/employees/GenerateDocumentModal.js';

export const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [selectedEmployeeForDoc, setSelectedEmployeeForDoc] = useState<Employee | null>(null);

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

  // Metrics
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const onboardingCount = employees.filter((e) => e.status === 'ONBOARDING').length;
  const probationCount = employees.filter((e) => e.status === 'PROBATION').length;

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

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header & Primary Action */}
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
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Employee Directory
              </h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Select an employee to view documents, download PDFs, or generate letters in 1-click.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              setSelectedEmployeeForDoc(null);
              setIsGenModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: '#ffffff',
              color: '#2563eb',
              border: '2px solid #2563eb',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
            }}
          >
            <FileText size={16} />
            <span>Document Generation</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
            }}
          >
            <UserPlus size={16} />
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
          marginBottom: 24,
        }}
      >
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total Workforce</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{totalCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>Active Employees</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>{activeCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb' }}>In Onboarding</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>{onboardingCount}</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309' }}>Probation Status</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', marginTop: 4 }}>{probationCount}</div>
        </div>
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
              placeholder="Search by name, employee ID, designation, or email..."
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
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Applied AI Labs">Applied AI Labs</option>
            <option value="Core Infrastructure">Core Infrastructure</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="People / HR">People / HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
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

      {/* Employees Table */}
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
            Loading employee records...
          </div>
        ) : employees.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Users size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No Employees Found</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: 4 }}>
              Try adjusting your search criteria or add your first employee.
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                marginTop: 16,
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
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '12px 18px' }}>Employee</th>
                <th style={{ padding: '12px 18px' }}>Role & Department</th>
                <th style={{ padding: '12px 18px' }}>Joining Date</th>
                <th style={{ padding: '12px 18px' }}>Status</th>
                <th style={{ padding: '12px 18px' }}>Documents</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Name & ID */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
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
                          ID: <strong style={{ color: '#2563eb' }}>{emp.employeeId}</strong> • {emp.personalEmail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Designation & Department */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{emp.designation}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {emp.department} • {emp.employmentType}
                    </div>
                  </td>

                  {/* Date of Joining */}
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
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 12,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                      }}
                    >
                      {emp.documentCount || 0} Generated
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onEmployeeAdded={loadEmployees}
        />
      )}

      {/* Document Generation Modal */}
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
    </div>
  );
};
