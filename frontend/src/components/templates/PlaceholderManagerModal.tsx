import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  Plus,
  BookOpen,
  Tag,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { PlaceholderDefinition } from '../../types/template.js';
import { STANDARD_PLACEHOLDERS } from '../../services/templateService.js';

interface PlaceholderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToken?: (token: string) => void;
}

export const PlaceholderManagerModal: React.FC<PlaceholderManagerModalProps> = ({
  isOpen,
  onClose,
  onInsertToken,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Custom placeholders created in this session
  const [customPlaceholders, setCustomPlaceholders] = useState<PlaceholderDefinition[]>(() => {
    const saved = localStorage.getItem('offergen_custom_placeholders');
    return saved ? JSON.parse(saved) : [];
  });
  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newExample, setNewExample] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Tokens' },
    { id: 'candidate', label: 'Candidate Info' },
    { id: 'role', label: 'Role & Team' },
    { id: 'compensation', label: 'Compensation & Perks' },
    { id: 'terms', label: 'Terms & Policies' },
    { id: 'company', label: 'Company & Signatory' },
    { id: 'custom', label: 'Custom Placeholders' },
  ];

  const allPlaceholders = [...STANDARD_PLACEHOLDERS, ...customPlaceholders];

  const filtered = allPlaceholders.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.label.toLowerCase().includes(q) ||
        item.token.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newLabel.trim()) return;

    const formattedKey = newKey.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const created: PlaceholderDefinition = {
      key: formattedKey,
      token: `{{${formattedKey}}}`,
      label: newLabel.trim(),
      category: 'custom',
      description: newDescription.trim() || 'Custom company-specific placeholder',
      exampleValue: newExample.trim() || 'Value',
      required: false,
    };

    const updated = [...customPlaceholders, created];
    setCustomPlaceholders(updated);
    localStorage.setItem('offergen_custom_placeholders', JSON.stringify(updated));

    setNewKey('');
    setNewLabel('');
    setNewDescription('');
    setNewExample('');
    setShowAddCustom(false);
    setSelectedCategory('custom');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Placeholder Catalog & Variable Registry"
      subtitle="Standard and custom dynamic data variables that merge with candidate records"
      maxWidth="860px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
            Showing {filtered.length} of {allPlaceholders.length} placeholders
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Search & Actions Bar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
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
              placeholder="Search placeholders by name, token or description..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddCustom(!showAddCustom)}
            style={{ fontSize: '0.8125rem', padding: '8px 14px' }}
          >
            <Plus size={15} />
            <span>{showAddCustom ? 'Cancel New Token' : 'Add Custom Token'}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
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
                {cat.id === 'custom' && customPlaceholders.length > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.6875rem',
                    }}
                  >
                    {customPlaceholders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Placeholder Creation Form */}
        {showAddCustom && (
          <form
            onSubmit={handleCreateCustom}
            className="card"
            style={{
              padding: 18,
              border: '1px dashed var(--primary)',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>Create Custom Company Token</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Key Name (e.g. stock_options)</label>
                <input
                  type="text"
                  placeholder="e.g. equity_shares"
                  className="form-input"
                  style={{ background: '#ffffff' }}
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Human Label</label>
                <input
                  type="text"
                  placeholder="e.g. Stock Options Grant"
                  className="form-input"
                  style={{ background: '#ffffff' }}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Description / Guidance</label>
                <input
                  type="text"
                  placeholder="e.g. Number of ISO stock options granted under 2026 plan"
                  className="form-input"
                  style={{ background: '#ffffff' }}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontWeight: 600, color: '#334155' }}>Sample Preview Value</label>
                <input
                  type="text"
                  placeholder="e.g. 25,000 ISO Shares"
                  className="form-input"
                  style={{ background: '#ffffff' }}
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddCustom(false)}
                style={{ fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                Save Placeholder
              </button>
            </div>
          </form>
        )}

        {/* Placeholders Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 12,
            maxHeight: 380,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {filtered.map((item) => (
            <div
              key={item.key}
              className="card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 10,
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#2563eb',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                    }}
                  >
                    {item.token}
                  </span>
                  {item.required && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {item.description}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#64748b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 130,
                  }}
                  title={`Sample: ${item.exampleValue}`}
                >
                  Ex: {item.exampleValue}
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.token)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    title="Copy token to clipboard"
                  >
                    {copiedToken === item.token ? (
                      <Check size={13} color="#059669" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>

                  {onInsertToken && (
                    <button
                      type="button"
                      onClick={() => {
                        onInsertToken(item.token);
                        onClose();
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      title="Insert token into editor"
                    >
                      Insert
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
