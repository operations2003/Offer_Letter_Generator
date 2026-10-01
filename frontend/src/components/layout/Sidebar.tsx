import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Sparkles,
  ShieldCheck,
  FileText,
  Layers,
  BookOpen,
  LogOut,
  CalendarCheck2,
  TrendingUp,
  Users2,
  Wallet,
  ChevronRight,
  Award,
  BrainCircuit,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, hasRole, loginAsDemo } = useAuth();

  const primaryModules = [
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
      badge: 'Active',
      badgeColor: '#059669',
    },
    {
      to: '/pdf-to-letter',
      label: 'AI PDF to Letter',
      icon: <Sparkles size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'],
      badge: 'Multi-Page',
      badgeColor: '#a35d39',
    },
    {
      to: '/templates',
      label: 'Offer Templates',
      icon: <FileText size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER'],
      badge: 'Standard',
      badgeColor: '#2563eb',
    },
    {
      to: '/documents',
      label: 'HR Documents',
      icon: <Layers size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'],
    },
    {
      to: '/ai-studio',
      label: 'AI Studio',
      icon: <Sparkles size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'],
      badge: 'Assistance',
      badgeColor: '#7c3aed',
    },
    {
      to: '/audit-logs',
      label: 'Audit & Compliance',
      icon: <ShieldCheck size={18} />,
      roles: ['SUPER_ADMIN', 'HR_MANAGER', 'AUDITOR'],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header — Exact TaskNera HRMS Portal Branding */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 24px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: 32,
              height: 32,
              objectFit: 'contain',
              borderRadius: 6,
            }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            TaskNera
          </div>
          <div style={{ fontSize: '0.625rem', color: '#2563eb', fontWeight: 700, letterSpacing: '0.06em', marginTop: 2 }}>
            HRMS PORTAL
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Core Workspace Modules */}
        <div>
          <div
            style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 12px 10px',
              fontWeight: 700,
            }}
          >
            Workspace Modules
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {primaryModules
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
                    padding: '9px 12px',
                    borderRadius: '8px',
                    color: isActive ? '#2563eb' : '#475569',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'inherit' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        background: `${item.badgeColor || '#2563eb'}14`,
                        color: item.badgeColor || '#2563eb',
                        fontWeight: 700,
                        border: `1px solid ${item.badgeColor || '#2563eb'}30`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
          </nav>
        </div>


        {/* TaskNera Enterprise Banner Card */}
        <div
          style={{
            marginTop: 'auto',
            padding: '12px 14px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>TaskNera Enterprise</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.35 }}>
            People. Processes. Performance.
          </div>
        </div>
      </div>

      {/* Switcher & User Profile in Footer */}
      <div style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
        {/* Role Quick Switcher for testing */}
        <div style={{ padding: '8px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: 6 }}>
          <button
            onClick={() => loginAsDemo('HR_MANAGER')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            HR Partner
          </button>
          <button
            onClick={() => loginAsDemo('SUPER_ADMIN')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#475569',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Admin
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: '12px 16px',
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
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {user?.firstName?.[0] || 'S'}
              {user?.lastName?.[0] || 'K'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.firstName || 'Sakshi'} {user?.lastName || 'Koparde'}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email || 'sakshi@tasknera.com'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn-ghost"
            style={{ padding: 6, borderRadius: '6px', cursor: 'pointer', color: '#94a3b8' }}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
