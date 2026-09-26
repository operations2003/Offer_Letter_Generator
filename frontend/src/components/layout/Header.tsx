import React from 'react';
import { Menu, Building2, Sparkles, Shield, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          <Building2 size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.company?.name || 'Acme Technologies'}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>({user?.company?.code || 'ACME'})</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* AI Engine Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid var(--ai-border)',
            fontSize: '0.75rem',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <Cpu size={13} style={{ color: '#c084fc' }} />
          <span style={{ color: '#c084fc', fontWeight: 600 }}>AI Engine Active (Llama 3.3)</span>
        </div>

        {/* Current Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#818cf8',
          }}
        >
          <Shield size={12} />
          <span>{user?.roles?.[0] || 'GUEST'}</span>
        </div>
      </div>
    </header>
  );
};
