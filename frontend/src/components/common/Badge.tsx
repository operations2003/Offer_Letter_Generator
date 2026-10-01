import React from 'react';
import { Sparkles, ShieldCheck, Clock, CheckCircle, AlertTriangle, AlertCircle, FileText, Send } from 'lucide-react';
import { OfferStatus } from '../../types/index.js';

interface AiAdvisoryBadgeProps {
  confidence?: number;
  label?: string;
  className?: string;
}

export const AiAdvisoryBadge: React.FC<AiAdvisoryBadgeProps> = ({
  confidence,
  label = 'AI Advisory — Unverified',
  className = '',
}) => {
  return (
    <span
      className={`ai-badge ${className}`}
      title="Extracted or generated probabilistically by AI model. Requires HR human-in-the-loop review."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#f5f3ff',
        color: '#6d28d9',
        border: '1px solid #ddd6fe',
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      <Sparkles size={12} style={{ color: '#7c3aed' }} />
      <span>{label}</span>
      {confidence !== undefined && (
        <span
          style={{
            background: '#ede9fe',
            color: '#5b21b6',
            padding: '1px 6px',
            borderRadius: 9999,
            fontSize: '0.6875rem',
            fontWeight: 700,
            marginLeft: 2,
          }}
        >
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};

export const HrConfirmedBadge: React.FC<{ label?: string; className?: string }> = ({
  label = 'HR Confirmed & Verified',
  className = '',
}) => {
  return (
    <span
      className={`hr-badge ${className}`}
      title="Authoritatively verified and signed off by an authorized HR user."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #a7f3d0',
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      <ShieldCheck size={13} style={{ color: '#059669' }} />
      <span>{label}</span>
    </span>
  );
};

export const OfferStatusBadge: React.FC<{ status: OfferStatus | string; className?: string }> = ({
  status,
  className = '',
}) => {
  let color = '#475569';
  let bg = '#f1f5f9';
  let border = '#cbd5e1';
  let icon = <Clock size={12} />;

  switch (status) {
    case 'DRAFT_AI':
      color = '#6d28d9';
      bg = '#f5f3ff';
      border = '#ddd6fe';
      icon = <Sparkles size={12} />;
      break;
    case 'HR_REVIEW':
      color = '#1d4ed8';
      bg = '#eff6ff';
      border = '#bfdbfe';
      icon = <FileText size={12} />;
      break;
    case 'PENDING_APPROVAL':
      color = '#b45309';
      bg = '#fffbeb';
      border = '#fde68a';
      icon = <AlertTriangle size={12} />;
      break;
    case 'APPROVED':
      color = '#047857';
      bg = '#ecfdf5';
      border = '#a7f3d0';
      icon = <CheckCircle size={12} />;
      break;
    case 'ISSUED':
      color = '#0369a1';
      bg = '#f0f9ff';
      border = '#bae6fd';
      icon = <Send size={12} />;
      break;
    case 'ACCEPTED':
      color = '#065f46';
      bg = '#d1fae5';
      border = '#6ee7b7';
      icon = <CheckCircle size={12} />;
      break;
    case 'DECLINED':
    case 'WITHDRAWN':
      color = '#b91c1c';
      bg = '#fef2f2';
      border = '#fecaca';
      icon = <AlertCircle size={12} />;
      break;
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 9999,
        fontSize: '0.75rem',
        fontWeight: 600,
        color,
        background: bg,
        border: `1px solid ${border}`,
        letterSpacing: '0.02em',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'ai' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
  size = 'md',
}) => {
  const styles: Record<string, { color: string; bg: string; border: string }> = {
    primary: { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    ai: { color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
    success: { color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    warning: { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
    danger: { color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
    info: { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
    neutral: { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
  };

  const current = styles[variant] || styles.neutral;
  const padding = size === 'sm' ? '2px 7px' : '3px 10px';
  const fontSize = size === 'sm' ? '0.6875rem' : '0.75rem';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding,
        borderRadius: 9999,
        fontSize,
        fontWeight: 600,
        color: current.color,
        background: current.bg,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.015em',
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
};
