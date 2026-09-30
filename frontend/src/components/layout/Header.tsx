import React from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      {/* Left: Breadcrumbs matching TaskNera Enterprise Console */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="btn btn-ghost"
            style={{ padding: 6, display: 'inline-flex' }}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78125rem' }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.04em', color: '#64748b' }}>
            DASHBOARD
          </span>
          <span style={{ color: '#cbd5e1', fontWeight: 400 }}>/</span>
          <span style={{ fontWeight: 600, color: '#2563eb' }}>
            Enterprise Console
          </span>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Notification Bell with red badge '3' */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              transition: 'background 0.15s ease',
            }}
          >
            <Bell size={18} />
          </div>
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.625rem',
              fontWeight: 700,
              width: 17,
              height: 17,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
            }}
          >
            3
          </span>
        </div>

        {/* User Profile Pill matching screenshot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 6px',
            borderRadius: '9999px',
            cursor: 'pointer',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {user?.firstName?.[0] || 'S'}
          </div>

          {/* User Details */}
          <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
              {user?.firstName || 'Sakshi'} {user?.lastName || 'Koparde'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
              {user?.email || 'sakshi@tasknera.com'}
            </div>
          </div>

          {/* Role Pill */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              marginLeft: 4,
            }}
          >
            {user?.roles?.[0] === 'SUPER_ADMIN' ? 'Admin' : 'Employee'}
          </span>

          <ChevronDown size={14} style={{ color: '#94a3b8' }} />
        </div>
      </div>
    </header>
  );
};
