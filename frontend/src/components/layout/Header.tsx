import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Shield,
  LogOut,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'offer' | 'ai' | 'compliance';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Offer Letter Signed & Accepted',
    desc: 'Liam O’Connor accepted the Staff Site Reliability Engineer offer.',
    time: '12m ago',
    type: 'offer',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'AI Quality Audit Completed',
    desc: 'Audit for Jane Doe passed 9/9 compliance rules with zero critical flags.',
    time: '45m ago',
    type: 'ai',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'New Candidate CV Uploaded',
    desc: 'Elena Rostova document ready for AI automated extraction.',
    time: '2h ago',
    type: 'offer',
    read: false,
  },
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout, loginAsDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumb based on route
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.startsWith('/offers')) {
      return { parent: 'WORKFORCE', current: 'Offers Pipeline' };
    }
    if (path.startsWith('/templates')) {
      return { parent: 'SETTINGS', current: 'Offer Templates' };
    }
    if (path.startsWith('/documents')) {
      return { parent: 'DOCUMENTS', current: 'HR Document Suite' };
    }
    if (path.startsWith('/onboarding')) {
      return { parent: 'ONBOARDING', current: 'Candidate Cohorts' };
    }
    if (path.startsWith('/learning')) {
      return { parent: 'DEVELOPMENT', current: 'L&D & Certificates' };
    }
    if (path.startsWith('/assessments')) {
      return { parent: 'EVALUATION', current: 'Assessments & Quizzes' };
    }
    if (path.startsWith('/ai-studio')) {
      return { parent: 'INTELLIGENCE', current: 'AI & HRMS Studio' };
    }
    if (path.startsWith('/policies')) {
      return { parent: 'POLICIES', current: 'HR Policy Registry' };
    }
    if (path.startsWith('/audit-logs')) {
      return { parent: 'GOVERNANCE', current: 'Compliance Ledger' };
    }
    return { parent: 'DASHBOARD', current: 'Enterprise Console' };
  };

  const breadcrumb = getBreadcrumb();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="header">
      {/* Left: Hamburger + Dynamic Breadcrumbs */}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 700, letterSpacing: '0.04em', color: '#64748b' }}>
            {breadcrumb.parent}
          </span>
          <span style={{ color: '#cbd5e1', fontWeight: 400 }}>/</span>
          <span style={{ fontWeight: 600, color: '#2563eb' }}>
            {breadcrumb.current}
          </span>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Notification Bell Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: showNotifications ? '#2563eb' : '#475569',
              background: showNotifications ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${showNotifications ? '#bfdbfe' : '#e2e8f0'}`,
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              position: 'relative',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
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
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div
              className="dropdown-menu"
              style={{
                width: 340,
                maxHeight: 420,
                padding: 0,
                overflow: 'hidden',
                right: 0,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                  Notifications
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        background: n.read ? '#ffffff' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                      onClick={() => {
                        setNotifications((prev) =>
                          prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                        );
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: n.type === 'ai' ? '#faf5ff' : '#eff6ff',
                            color: n.type === 'ai' ? '#7c3aed' : '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 2,
                          }}
                        >
                          {n.type === 'ai' ? <Sparkles size={14} /> : <FileCheck2 size={14} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              fontWeight: n.read ? 600 : 700,
                              color: '#0f172a',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <span>{n.title}</span>
                            <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 400 }}>
                              {n.time}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0', lineHeight: 1.4 }}>
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '8px 16px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/audit-logs');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View full activity ledger &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px 4px 4px',
              borderRadius: '9999px',
              cursor: 'pointer',
              background: showUserMenu ? '#f1f5f9' : 'transparent',
              border: '1px solid',
              borderColor: showUserMenu ? '#cbd5e1' : 'transparent',
              transition: 'all 0.15s ease',
            }}
            aria-label="User account menu"
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                marginLeft: 4,
              }}
            >
              {user?.roles?.[0] === 'SUPER_ADMIN' ? 'Admin' : 'HR Partner'}
            </span>

            <ChevronDown size={14} style={{ color: '#94a3b8' }} />
          </button>

          {/* User Account Dropdown */}
          {showUserMenu && (
            <div
              className="dropdown-menu"
              style={{
                width: 240,
                right: 0,
              }}
            >
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 1 }}>
                  {user?.email}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    Role: {user?.roles?.join(', ')}
                  </span>
                </div>
              </div>

              <div style={{ padding: '6px 0' }}>
                <div
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                  }}
                >
                  Quick Role Switch:
                </div>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    loginAsDemo('HR_MANAGER');
                    setShowUserMenu(false);
                  }}
                >
                  <Shield size={14} style={{ color: '#059669' }} />
                  <span>HR Partner (Sakshi)</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    loginAsDemo('SUPER_ADMIN');
                    setShowUserMenu(false);
                  }}
                >
                  <Shield size={14} style={{ color: '#2563eb' }} />
                  <span>Super Admin</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    loginAsDemo('RECRUITER');
                    setShowUserMenu(false);
                  }}
                >
                  <User size={14} style={{ color: '#7c3aed' }} />
                  <span>Recruiter</span>
                </button>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item danger"
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
