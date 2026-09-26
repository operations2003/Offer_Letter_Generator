import React from 'react';
import { Loader2, Inbox, AlertOctagon, RotateCw } from 'lucide-react';
import { Button } from './Button.js';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 16,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            filter: 'blur(8px)',
          }}
        />
        <Loader2 size={36} className="spinner" style={{ color: 'var(--primary)', zIndex: 1 }} />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{label}</p>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({ title, description, actionText, onAction, icon = <Inbox size={42} /> }) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '56px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
          marginBottom: 18,
        }}
      >
        {icon}
      </div>
      <h4 style={{ fontSize: '1.125rem', marginBottom: 6 }}>{title}</h4>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          maxWidth: 420,
          marginBottom: onAction && actionText ? 20 : 0,
        }}
      >
        {description}
      </p>
      {onAction && actionText && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'Failed to load content', message, onRetry }) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        background: 'rgba(239, 68, 68, 0.05)',
      }}
    >
      <AlertOctagon size={36} style={{ color: 'var(--danger)', margin: '0 auto 12px' }} />
      <h4 style={{ color: '#f87171', marginBottom: 6 }}>{title}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>{message}</p>
      {onRetry && (
        <Button variant="secondary" icon={<RotateCw size={14} />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
