import React, { useState } from 'react';
import {
  FileText,
  GraduationCap,
  TrendingUp,
  UserX,
  Award,
  LogOut,
  Calculator,
  Briefcase,
  FileCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import { DocumentTypeDefinition, DocumentTypeCode } from '../../types/document-engine.js';

interface DocumentTypeSelectorProps {
  documentTypes: DocumentTypeDefinition[];
  selectedCode: DocumentTypeCode | null;
  onSelect: (typeDef: DocumentTypeDefinition) => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  OFFER_LETTER: <FileText size={22} className="text-indigo-400" />,
  INTERNSHIP_LETTER: <GraduationCap size={22} className="text-purple-400" />,
  INCREMENT_LETTER: <TrendingUp size={22} className="text-emerald-400" />,
  TERMINATION_LETTER: <UserX size={22} className="text-rose-400" />,
  EXPERIENCE_LETTER: <Award size={22} className="text-amber-400" />,
  RELIEVING_LETTER: <LogOut size={22} className="text-cyan-400" />,
  FNF_SETTLEMENT: <Calculator size={22} className="text-teal-400" />,
  CONTRACT_LETTER: <Briefcase size={22} className="text-blue-400" />,
  MSA: <FileCheck size={22} className="text-violet-400" />,
};

const CATEGORIES = [
  { id: 'ALL', label: 'All Document Types' },
  { id: 'EMPLOYMENT', label: 'Employment' },
  { id: 'COMPENSATION', label: 'Compensation & Payroll' },
  { id: 'SEPARATION', label: 'Separation & Exit' },
  { id: 'LEGAL_COMMERCIAL', label: 'Legal & Commercial' },
];

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  documentTypes,
  selectedCode,
  onSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const coreTypes = documentTypes.filter((t) => t.isImplemented);

  const filteredTypes = coreTypes.filter((t) => {
    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Category Pills & Search */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="btn"
              style={{
                fontSize: '0.8125rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat.id ? '#fff' : 'var(--text-muted)',
                border: '1px solid ' + (selectedCategory === cat.id ? 'var(--primary)' : 'var(--border-subtle)'),
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 260 }}>
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
            placeholder="Search document type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Grid of Document Types */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {filteredTypes.map((t) => {
          const isSelected = selectedCode === t.code;
          return (
            <div
              key={t.code}
              onClick={() => onSelect(t)}
              className="glass-panel"
              style={{
                padding: '18px 20px',
                cursor: 'pointer',
                borderRadius: 'var(--radius-lg)',
                border: isSelected
                  ? '2px solid var(--primary)'
                  : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    color: 'var(--primary)',
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {TYPE_ICONS[t.code] || <FileText size={22} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', marginBottom: 2 }}>
                      {t.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-dim)',
                        fontWeight: 600,
                      }}
                    >
                      {t.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  {t.description}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  color: 'var(--text-dim)',
                }}
              >
                <div style={{ display: 'flex', gap: 10 }}>
                  <span>
                    <strong>{t.requiredFields?.length || 0}</strong> Required
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{t.sections?.length || 0}</strong> Sections
                  </span>
                </div>
                {t.aiCapabilities?.supportsDocumentExtraction && (
                  <span className="ai-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                    <Sparkles size={10} /> AI Ready
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
