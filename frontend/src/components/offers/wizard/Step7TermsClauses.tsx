import React, { useState } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  Shield,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { TermsAndPolicies, OfferClauseItem } from '../../../types/offer.js';

interface Step7TermsClausesProps {
  terms: TermsAndPolicies;
  onUpdateTerms: (updated: TermsAndPolicies) => void;
}

export const Step7TermsClauses: React.FC<Step7TermsClausesProps> = ({
  terms,
  onUpdateTerms,
}) => {
  const [newClauseTitle, setNewClauseTitle] = useState('');
  const [newClauseContent, setNewClauseContent] = useState('');
  const [showAddClause, setShowAddClause] = useState(false);

  const handleFieldChange = (field: keyof TermsAndPolicies, value: any) => {
    onUpdateTerms({
      ...terms,
      [field]: value,
    });
  };

  const handleToggleClause = (id: string) => {
    const updatedClauses = terms.clauses.map((c) =>
      c.id === id ? { ...c, isConfirmedByHr: !c.isConfirmedByHr } : c
    );
    onUpdateTerms({
      ...terms,
      clauses: updatedClauses,
    });
  };

  const handleAddCustomClause = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClauseTitle.trim() || !newClauseContent.trim()) return;

    const created: OfferClauseItem = {
      id: `custom_cls_${Date.now()}`,
      title: newClauseTitle.trim(),
      content: newClauseContent.trim(),
      isCustom: true,
      isMandatory: false,
      isConfirmedByHr: true,
      category: 'CUSTOM',
    };

    onUpdateTerms({
      ...terms,
      clauses: [...terms.clauses, created],
    });

    setNewClauseTitle('');
    setNewClauseContent('');
    setShowAddClause(false);
  };

  const handleDeleteCustomClause = (id: string) => {
    onUpdateTerms({
      ...terms,
      clauses: terms.clauses.filter((c) => c.id !== id),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.875rem',
            }}
          >
            7
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Terms, Policies & Legal Covenants</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: 4, marginLeft: 38 }}>
          Configure statutory probation, termination notice thresholds, offer expiration dates, and protective covenants.
        </p>
      </div>

      {/* Numerical Terms Grid */}
      <div
        style={{
          padding: 24,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        <div>
          <label className="form-label">Probation Period (Days)</label>
          <input
            type="number"
            className="form-input"
            value={terms.probationDurationDays}
            onChange={(e) => handleFieldChange('probationDurationDays', Number(e.target.value))}
            placeholder="e.g. 90"
          />
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            Standard US/Global: 90 calendar days
          </span>
        </div>

        <div>
          <label className="form-label">Notice Period (Days)</label>
          <input
            type="number"
            className="form-input"
            value={terms.noticePeriodDays}
            onChange={(e) => handleFieldChange('noticePeriodDays', Number(e.target.value))}
            placeholder="e.g. 30"
          />
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            Written resignation notice requirement
          </span>
        </div>

        <div>
          <label className="form-label">Weekly Hours & Work Schedule</label>
          <input
            type="text"
            className="form-input"
            value={terms.workSchedule}
            onChange={(e) => handleFieldChange('workSchedule', e.target.value)}
            placeholder="e.g. Mon - Fri, 9am - 5:30pm (40 hrs/wk)"
          />
        </div>

        <div>
          <label className="form-label">Offer Expiration Date</label>
          <input
            type="date"
            className="form-input"
            value={terms.offerValidUntil}
            onChange={(e) => handleFieldChange('offerValidUntil', e.target.value)}
          />
          <span style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 2, display: 'block' }}>
            Candidate must accept prior to this deadline
          </span>
        </div>
      </div>

      {/* Legal Clauses Section */}
      <div
        style={{
          padding: 24,
          background: '#ffffff',
          borderRadius: 12,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Contractual Clauses Included in Final Document</h4>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddClause(!showAddClause)}
            style={{ fontSize: '0.8125rem' }}
          >
            <Plus size={14} />
            <span>{showAddClause ? 'Cancel' : 'Add Custom Clause'}</span>
          </button>
        </div>

        {/* Custom Clause Creation Card */}
        {showAddClause && (
          <form
            onSubmit={handleAddCustomClause}
            className="glass-panel animate-fade-in"
            style={{
              padding: 18,
              border: '1px dashed var(--primary)',
              background: 'rgba(99, 102, 241, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div>
              <label className="form-label">Clause Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Relocation Support & Repayment Agreement"
                value={newClauseTitle}
                onChange={(e) => setNewClauseTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Clause Text (HTML markup supported)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. <p>The Company will provide a relocation reimbursement up to $5,000...</p>"
                value={newClauseContent}
                onChange={(e) => setNewClauseContent(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowAddClause(false)}
                style={{ fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
                Insert Clause
              </button>
            </div>
          </form>
        )}

        {/* Clauses List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {terms.clauses.map((clause) => {
            const isConfirmed = clause.isConfirmedByHr !== false;

            return (
              <div
                key={clause.id}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                  border: '1px solid',
                  borderColor: isConfirmed ? 'var(--border-subtle)' : '#e2e8f0',
                  backgroundColor: isConfirmed ? '#ffffff' : '#f8fafc',
                  boxShadow: isConfirmed ? 'var(--shadow-sm)' : 'none',
                  opacity: isConfirmed ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={() => handleToggleClause(clause.id)}
                    style={{ marginTop: 4, cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9375rem', color: '#0f172a' }}>{clause.title}</strong>
                      {clause.isMandatory && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            background: '#fee2e2',
                            color: '#dc2626',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Mandatory
                        </span>
                      )}
                      {clause.isCustom && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          Custom Added
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: '#475569',
                        marginTop: 6,
                        lineHeight: 1.5,
                      }}
                      dangerouslySetInnerHTML={{ __html: clause.content }}
                    />
                  </div>
                </div>

                {clause.isCustom && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleDeleteCustomClause(clause.id)}
                    style={{ padding: 6, color: '#dc2626' }}
                    title="Remove custom clause"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
