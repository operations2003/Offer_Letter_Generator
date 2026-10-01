import React from 'react';
import { Loader2, Inbox, AlertOctagon, RotateCw } from 'lucide-react';
import { Button } from './Button.js';

export const LoadingSpinner: React.FC<{ label?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  label = 'Loading...',
  size = 'md',
}) => {
  const spinnerSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'sm' ? '24px 12px' : '48px 24px',
        gap: 14,
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
            width: spinnerSize + 12,
            height: spinnerSize + 12,
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            filter: 'blur(8px)',
          }}
        />
        <Loader2 size={spinnerSize} className="spinner" style={{ color: 'var(--primary)', zIndex: 1 }} />
      </div>
      {label && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
          {label}
        </p>
      )}
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <Inbox size={36} />,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
        {title}
      </h4>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          maxWidth: 440,
          margin: '0 auto',
          lineHeight: 1.5,
          marginBottom: onAction && actionText ? 20 : 0,
        }}
      >
        {description}
      </p>
      {(onAction || onSecondaryAction) && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
          {onSecondaryAction && secondaryActionText && (
            <Button variant="secondary" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
          {onAction && actionText && (
            <Button variant="primary" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
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
        padding: '36px 24px',
        textAlign: 'center',
        border: '1px solid #fecaca',
        backgroundColor: '#fef2f2',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <AlertOctagon size={36} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
      <h4 style={{ color: '#991b1b', fontSize: '1.05rem', fontWeight: 700, marginBottom: 6 }}>
        {title}
      </h4>
      <p style={{ color: '#7f1d1d', fontSize: '0.875rem', maxWidth: 460, margin: '0 auto 16px', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" icon={<RotateCw size={14} />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export const SkeletonBox: React.FC<{
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  style?: React.CSSProperties;
}> = ({ height = 20, width = '100%', borderRadius = 6, style = {} }) => {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        backgroundColor: '#e2e8f0',
        animation: 'pulseGlow 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};
