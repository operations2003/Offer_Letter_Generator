import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Sparkles,
  ShieldAlert,
  Users,
  LogOut,
  Building,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasRole, loginAsDemo } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'],
    },
    {
      to: '/offers',
      label: 'Offers Pipeline',
      icon: <FileCheck2 size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'],
    },
    {
      to: '/templates',
      label: 'Offer Templates',
      icon: <FileText size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
    },
    {
      to: '/ai-studio',
      label: 'AI Extraction Studio',
      icon: <Sparkles size={18} style={{ color: '#c084fc' }} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'],
      badge: 'AI',
    },
    {
      to: '/audit-logs',
      label: 'Compliance Audit Ledger',
      icon: <ShieldAlert size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'AUDITOR'],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--ai-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--ai-glow)',
          }}
        >
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            OfferGen <span style={{ color: 'var(--ai-purple)' }}>AI</span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
            STANDALONE PLATFORM
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-dim)',
            padding: '4px 12px 8px',
            fontWeight: 700,
          }}
        >
          Offer Operations
        </div>

        {navItems
          .filter((item) => hasRole(...item.roles))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="ai-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
      </nav>

      {/* User Role Switcher (For Pair Testing) */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: 8 }}>
          TEST RBAC ROLES:
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => loginAsDemo('HR_MANAGER')}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '4px', fontSize: '0.7rem' }}
            title="Switch to HR Operations Manager"
          >
            HR Mgr
          </button>
          <button
            onClick={() => loginAsDemo('SUPER_ADMIN')}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '4px', fontSize: '0.7rem' }}
            title="Switch to Super Administrator"
          >
            Admin
          </button>
          <button
            onClick={() => loginAsDemo('RECRUITER')}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '4px', fontSize: '0.7rem' }}
            title="Switch to Recruiter"
          >
            Recruiter
          </button>
        </div>
      </div>

      {/* User Card */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: 'var(--primary)',
            }}
          >
            {user?.firstName?.[0] || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#c084fc', fontWeight: 600 }}>
              {user?.roles?.[0]}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="btn-ghost"
          style={{ padding: 6, borderRadius: 'var(--radius-sm)' }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
