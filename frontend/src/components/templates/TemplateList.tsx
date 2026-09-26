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
        return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
      case 'CONTRACT':
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)' };
      case 'INTERNSHIP':
        return { bg: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: 'rgba(236, 72, 153, 0.4)' };
      case 'FULL_TIME':
      default:
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.4)' };
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
        <div className="glass-panel" style={{ padding: '18px 20px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Template Library
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>
            {templates.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Across all employment categories
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Active in Production
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)', marginTop: 4 }}>
            {totalActive}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Available for instant candidate offer generation
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Avg Tokens Per Template
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', marginTop: 4 }}>
            ~{avgPlaceholders}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Automated merge data points
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 20px', background: 'var(--bg-tertiary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Version Audit
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', marginTop: 4 }}>
            Immutable
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
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
              background: 'var(--bg-tertiary)',
              padding: 3,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className="btn-ghost"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'grid' ? 'var(--bg-card-hover)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-dim)',
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className="btn-ghost"
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: viewMode === 'table' ? 'var(--bg-card-hover)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-dim)',
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
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-subtle)',
              backgroundColor: selectedCategory === cat.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
              color: selectedCategory === cat.id ? '#818cf8' : 'var(--text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
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
                className="glass-panel"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  border: '1px solid var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                <div>
                  {/* Top Meta Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
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
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#818cf8',
                        }}
                      >
                        v{versionNum}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleActive(tpl)}
                      className="btn-ghost"
                      style={{ padding: '2px 4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                      title={tpl.isActive ? 'Active (Click to disable)' : 'Inactive (Click to activate)'}
                    >
                      {tpl.isActive ? (
                        <>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'var(--success)',
                              boxShadow: '0 0 6px var(--success)',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Active</span>
                        </>
                      ) : (
                        <>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--text-dim)' }} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 6 }}>{tpl.title}</h4>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.45,
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
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.6875rem',
                      color: 'var(--text-dim)',
                      marginBottom: 12,
                    }}
                  >
                    <span>
                      {tpl.currentVersion?.placeholdersSchema?.length || 8} dynamic tokens
                    </span>
                    <span>Updated {new Date(tpl.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem' }}
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
                      title="Preview formatted offer letter"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      onClick={() => onSelectDuplicate(tpl)}
                      title="Duplicate template"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.75rem' }}
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
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Template Title</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Version</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)' }}>Last Modified</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
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
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{tpl.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
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
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: '#818cf8',
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
                            backgroundColor: tpl.isActive ? 'var(--success)' : 'var(--text-dim)',
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: tpl.isActive ? 'var(--success)' : 'var(--text-dim)' }}>
                          {tpl.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </button>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
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
