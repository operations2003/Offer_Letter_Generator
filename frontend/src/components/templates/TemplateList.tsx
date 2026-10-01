import React, { useState } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit3,
  Copy,
  History,
  ToggleLeft,
  ToggleRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { OfferTemplate, TemplateCategory } from '../../types/template.js';

interface TemplateListProps {
  templates: OfferTemplate[];
  onSelectEdit: (template: OfferTemplate) => void;
  onSelectPreview: (template: OfferTemplate) => void;
  onSelectDuplicate: (template: OfferTemplate) => void;
  onSelectHistory: (template: OfferTemplate) => void;
  onToggleActive: (template: OfferTemplate) => void;
  onCreateNew: () => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onSelectEdit,
  onSelectPreview,
  onSelectDuplicate,
  onSelectHistory,
  onToggleActive,
  onCreateNew,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'FULL_TIME', label: 'Full-Time' },
    { id: 'EXECUTIVE', label: 'Executive' },
    { id: 'CONTRACT', label: 'Contractor' },
    { id: 'INTERNSHIP', label: 'Internship' },
    { id: 'CONSULTANT', label: 'Consultant' },
  ];

  const filtered = templates.filter((tpl) => {
    if (selectedCategory !== 'ALL' && tpl.category !== selectedCategory) return false;
    if (selectedStatus === 'ACTIVE' && !tpl.isActive) return false;
    if (selectedStatus === 'INACTIVE' && tpl.isActive) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tpl.title.toLowerCase().includes(q) ||
        (tpl.description && tpl.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Category badges color mapping
  const getCategoryBadge = (cat: TemplateCategory) => {
    switch (cat) {
      case 'EXECUTIVE':
        return { bg: '#f3e8ff', color: '#7c3aed', border: '#d8b4fe' };
      case 'CONTRACT':
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
      case 'INTERNSHIP':
        return { bg: '#fdf2f8', color: '#db2777', border: '#fbcfe8' };
      case 'FULL_TIME':
      default:
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    }
  };

  const totalActive = templates.filter((t) => t.isActive).length;
  const avgPlaceholders = Math.round(
    templates.reduce((acc, t) => acc + (t.currentVersion?.placeholdersSchema?.length || 8), 0) /
      (templates.length || 1)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Metric Counters Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Template Library
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
            {templates.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Across all employment categories
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Active in Production
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>
            {totalActive}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Available for instant candidate offer generation
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Avg Tokens Per Template
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', marginTop: 4 }}>
            ~{avgPlaceholders}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Automated merge data points
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
            Version Audit
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
            Immutable
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
            Complete rollback & diff tracking
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filter, Mode Toggle & CTA */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search templates by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: 120 }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: viewMode === 'grid' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: viewMode === 'table' ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          {/* Primary Create CTA */}
          <button type="button" className="btn btn-primary" onClick={onCreateNew}>
            <Plus size={16} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 1px 2px rgba(37,99,235,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Templates Content: Grid View or Table View */}
      {filtered.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <FileText size={42} style={{ color: 'var(--text-dim)' }} />
          <h4 style={{ fontSize: '1.15rem' }}>No Templates Found</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', maxWidth: 440 }}>
            No offer letter templates match your current search and filter criteria. Adjust your filters or create a new template.
          </p>
          <button type="button" className="btn btn-primary" onClick={onCreateNew} style={{ marginTop: 8 }}>
            <Plus size={16} />
            <span>Create New Template</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {filtered.map((tpl) => {
            const badgeStyle = getCategoryBadge(tpl.category);
            const versionNum = tpl.currentVersion?.versionNumber || 1;

            return (
              <div
                key={tpl.id}
                className="card"
                style={{
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  transition: 'all 0.2s ease',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  {/* Top Meta Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {tpl.category.replace('_', ' ')}
                      </span>

                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        v{versionNum}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleActive(tpl)}
                      className="btn-ghost"
                      style={{ padding: '2px 6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}
                      title={tpl.isActive ? 'Active (Click to disable)' : 'Inactive (Click to activate)'}
                    >
                      {tpl.isActive ? (
                        <>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#059669',
                              boxShadow: '0 0 6px rgba(5, 150, 105, 0.4)',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active</span>
                        </>
                      ) : (
                        <>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{tpl.title}</h4>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {tpl.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer Metrics & Actions */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {tpl.currentVersion?.placeholdersSchema?.length || 8} dynamic tokens
                    </span>
                    <span>Updated {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '7px 12px', fontSize: '0.75rem' }}
                      onClick={() => onSelectEdit(tpl)}
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '7px 10px', fontSize: '0.75rem' }}
                      onClick={() => onSelectPreview(tpl)}
                      title="Preview formatted offer letter"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '7px 10px', fontSize: '0.75rem' }}
                      onClick={() => onSelectDuplicate(tpl)}
                      title="Duplicate template"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '7px 10px', fontSize: '0.75rem' }}
                      onClick={() => onSelectHistory(tpl)}
                      title="View immutable revision history"
                    >
                      <History size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', background: '#f8fafc' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: '#475569' }}>Template Title</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: '#475569' }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: '#475569' }}>Version</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: '#475569' }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: '#475569' }}>Last Modified</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tpl) => {
                const badgeStyle = getCategoryBadge(tpl.category);
                return (
                  <tr
                    key={tpl.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{tpl.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        {tpl.description || 'No description'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                          border: `1px solid ${badgeStyle.border}`,
                          textTransform: 'uppercase',
                        }}
                      >
                        {tpl.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        v{tpl.currentVersion?.versionNumber || 1}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <button
                        type="button"
                        onClick={() => onToggleActive(tpl)}
                        className="btn-ghost"
                        style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: tpl.isActive ? '#059669' : '#94a3b8',
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: tpl.isActive ? '#059669' : '#64748b', fontWeight: 600 }}>
                          {tpl.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </button>
                    </td>

                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.8125rem' }}>
                      {new Date(tpl.updatedAt).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => onSelectEdit(tpl)}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => onSelectPreview(tpl)}
                          title="Preview"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => onSelectDuplicate(tpl)}
                          title="Duplicate"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => onSelectHistory(tpl)}
                          title="Version History"
                        >
                          <History size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
