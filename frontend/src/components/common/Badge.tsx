import React from 'react';
import { Sparkles, ShieldCheck, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { OfferStatus } from '../../types/index.js';

interface AiAdvisoryBadgeProps {
  confidence?: number;
  label?: string;
}

export const AiAdvisoryBadge: React.FC<AiAdvisoryBadgeProps> = ({
  confidence,
  label = 'AI Advisory — Unverified',
}) => {
  return (
    <span className="ai-badge" title="Extracted probabilistically by AI model. Requires HR review.">
      <Sparkles size={12} />
      <span>{label}</span>
      {confidence !== undefined && (
        <span
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '1px 6px',
            borderRadius: 9999,
            fontSize: '0.7rem',
          }}
        >
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};

export const HrConfirmedBadge: React.FC<{ label?: string }> = ({
  label = 'HR Confirmed & Verified',
}) => {
  return (
    <span className="hr-badge" title="Authoritatively verified and signed off by an authorized HR user.">
      <ShieldCheck size={13} />
      <span>{label}</span>
    </span>
  );
};

export const OfferStatusBadge: React.FC<{ status: OfferStatus }> = ({ status }) => {
  let color = 'var(--text-muted)';
  let bg = 'rgba(255, 255, 255, 0.05)';
  let border = 'var(--border-subtle)';
  let icon = <Clock size={12} />;

  switch (status) {
    case 'DRAFT_AI':
      color = '#c084fc';
      bg = 'rgba(168, 85, 247, 0.1)';
      border = 'rgba(168, 85, 247, 0.3)';
      icon = <Sparkles size={12} />;
      break;
    case 'HR_REVIEW':
      color = '#60a5fa';
      bg = 'rgba(59, 130, 246, 0.1)';
      border = 'rgba(59, 130, 246, 0.3)';
      break;
    case 'PENDING_APPROVAL':
      color = '#fbbf24';
      bg = 'rgba(245, 158, 11, 0.1)';
      border = 'rgba(245, 158, 11, 0.3)';
      icon = <AlertTriangle size={12} />;
      break;
    case 'APPROVED':
      color = '#34d399';
      bg = 'rgba(16, 185, 129, 0.1)';
      border = 'rgba(16, 185, 129, 0.3)';
      icon = <CheckCircle size={12} />;
      break;
    case 'ISSUED':
      color = '#38bdf8';
      bg = 'rgba(56, 189, 248, 0.1)';
      border = 'rgba(56, 189, 248, 0.3)';
      break;
    case 'ACCEPTED':
      color = '#10b981';
      bg = 'rgba(16, 185, 129, 0.2)';
      border = 'var(--success)';
      icon = <CheckCircle size={12} />;
      break;
    case 'DECLINED':
    case 'WITHDRAWN':
      color = '#f87171';
      bg = 'rgba(239, 68, 68, 0.1)';
      border = 'rgba(239, 68, 68, 0.3)';
      break;
  }

  return (
    <span
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
      }}
    >
      {icon}
      <span>{status.replace(/_/g, ' ')}</span>
    </span>
  );
};
