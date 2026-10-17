import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  ShieldCheck,
  Shield,
  Users,
  CheckCircle2,
  Lock,
  Mail,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { UserService, SystemUser } from '../services/userService.js';
import { CreateUserModal } from '../components/users/CreateUserModal.js';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await UserService.listUsers({
        search: searchQuery || undefined,
        role: roleFilter || undefined,
      });
      setUsers(data.users || []);
    } catch (err: any) {
      error(err.message || 'Failed to load user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUserCreated = (newUser: SystemUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const getRoleBadge = (roleCode: string) => {
    switch (roleCode) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', color: '#b45309', bg: '#fffbeb', border: '#fde68a' };
      case 'HR_MANAGER':
        return { label: 'HR Manager', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' };
      case 'RECRUITER':
        return { label: 'Recruiter', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
      case 'APPROVER':
        return { label: 'Approver', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' };
      case 'AUDITOR':
        return { label: 'Auditor', color: '#475569', bg: '#f8fafc', border: '#cbd5e1' };
      default:
        return { label: roleCode, color: '#334155', bg: '#f1f5f9', border: '#e2e8f0' };
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles.some((r) => r.code === 'SUPER_ADMIN')).length;
  const hrCount = users.filter((u) => u.roles.some((r) => r.code === 'HR_MANAGER')).length;
  const recruiterCount = users.filter((u) => u.roles.some((r) => r.code === 'RECRUITER')).length;

  return (
    <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner / Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
              }}
            >
              Users
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 4, marginBottom: 0 }}>
            Manage team accounts and permissions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            type="button"
            variant="ghost"
            onClick={fetchUsers}
            icon={<RefreshCw size={14} />}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<UserPlus size={15} />}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
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
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Users</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{totalUsers}</div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Administrators</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a' }}>{adminCount}</div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>HR Managers</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{hrCount}</div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#ffffff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserPlus size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Recruiters</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{recruiterCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: '0.85rem' }}
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
          </div>
          <Button type="submit" variant="secondary" style={{ height: 38 }}>
            Search
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#64748b' }}>
            <Filter size={14} />
            <span>Role:</span>
          </div>
          <select
            className="form-input"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ height: 38, fontSize: '0.85rem', width: 170 }}
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="APPROVER">Approver</option>
            <option value="AUDITOR">Auditor</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  User & Identity
                </th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Department & Role
                </th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Authority Level
                </th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Account Status
                </th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Loading user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '50px 20px', textAlign: 'center' }}>
                    <div style={{ maxWidth: 360, margin: '0 auto' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                          color: '#94a3b8',
                        }}
                      >
                        <Users size={24} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                        No users found
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                        Try adjusting your search criteria or create a new user.
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ marginTop: 14 }}
                        icon={<UserPlus size={15} />}
                      >
                        Create New User
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?.email?.toLowerCase() === u.email.toLowerCase();
                  const primaryRole = u.roles?.[0]?.code || 'HR_MANAGER';
                  const badge = getRoleBadge(primaryRole);

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* User & Identity */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: badge.bg,
                              color: badge.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              border: `1px solid ${badge.border}`,
                              flexShrink: 0,
                            }}
                          >
                            {u.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{u.firstName} {u.lastName}</span>
                              {isCurrent && (
                                <span
                                  style={{
                                    fontSize: '0.625rem',
                                    fontWeight: 700,
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                    background: '#ecfdf5',
                                    color: '#065f46',
                                    border: '1px solid #a7f3d0',
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                              <Mail size={12} style={{ color: '#94a3b8' }} />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Title */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>
                          {u.title || 'Team Member'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 1 }}>
                          {u.department || 'Operations'}
                        </div>
                      </td>

                      {/* Authority Level */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {u.roles?.map((r) => {
                            const rb = getRoleBadge(r.code);
                            return (
                              <span
                                key={r.code}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: rb.bg,
                                  color: rb.color,
                                  border: `1px solid ${rb.border}`,
                                }}
                              >
                                {r.code === 'SUPER_ADMIN' ? <Shield size={11} /> : <CheckCircle2 size={11} />}
                                {rb.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Account Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 9999,
                            background: u.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                            color: u.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                            border: `1px solid ${u.status === 'ACTIVE' ? '#a7f3d0' : '#fecaca'}`,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: u.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                            }}
                          />
                          {u.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.8rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
};
