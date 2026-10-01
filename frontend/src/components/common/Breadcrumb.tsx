import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={className} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#64748b',
          fontSize: '0.8125rem',
          transition: 'color 0.15s ease',
        }}
        title="Home"
      >
        <Home size={14} />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={item.label + index}>
            <ChevronRight size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
            {isLast || !item.to ? (
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: isLast ? '#2563eb' : '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                style={{
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color 0.15s ease',
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
