import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}) => {
  if (totalPages <= 1 && !totalItems) return null;

  const startItem = totalItems && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const endItem = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : undefined;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 18px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: '#ffffff',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
      }}
    >
      <div>
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <strong style={{ color: '#0f172a' }}>{startItem}</strong> to{' '}
            <strong style={{ color: '#0f172a' }}>{endItem}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong style={{ color: '#0f172a' }}>{page}</strong> of{' '}
            <strong style={{ color: '#0f172a' }}>{Math.max(1, totalPages)}</strong>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          style={{
            padding: '5px 8px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            background: page <= 1 ? '#f8fafc' : '#ffffff',
            color: page <= 1 ? '#94a3b8' : '#334155',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="First page"
          title="First page"
        >
          <ChevronsLeft size={15} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={{
            padding: '5px 8px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            background: page <= 1 ? '#f8fafc' : '#ffffff',
            color: page <= 1 ? '#94a3b8' : '#334155',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={15} />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} style={{ padding: '0 4px', color: '#94a3b8' }}>
                ...
              </span>
            );
          }

          const isActive = p === page;

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(Number(p))}
              style={{
                minWidth: 30,
                height: 30,
                padding: '0 8px',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--primary)' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {p}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={{
            padding: '5px 8px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            background: page >= totalPages ? '#f8fafc' : '#ffffff',
            color: page >= totalPages ? '#94a3b8' : '#334155',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight size={15} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          style={{
            padding: '5px 8px',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            background: page >= totalPages ? '#f8fafc' : '#ffffff',
            color: page >= totalPages ? '#94a3b8' : '#334155',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Last page"
          title="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
};
