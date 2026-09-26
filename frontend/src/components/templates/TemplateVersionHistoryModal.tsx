import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  RotateCcw,
  GitCommit,
  User,
  Calendar,
  FileCode2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { OfferTemplate, TemplateVersion } from '../../types/template.js';
import { templateService } from '../../services/templateService.js';

interface TemplateVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: OfferTemplate | null;
  onRollbackSuccess: (updatedTemplate: OfferTemplate) => void;
  onPreviewVersion?: (version: TemplateVersion) => void;
}

export const TemplateVersionHistoryModal: React.FC<TemplateVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  template,
  onRollbackSuccess,
  onPreviewVersion,
}) => {
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<TemplateVersion | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'diff'>('details');
  const [rollbackLoading, setRollbackLoading] = useState(false);

  useEffect(() => {
    if (template && isOpen) {
      loadHistory();
    }
  }, [template, isOpen]);

  const loadHistory = async () => {
    if (!template) return;
    setLoading(true);
    try {
      const history = await templateService.getVersionHistory(template.id);
      setVersions(history);
      setSelectedVersion(history[0] || template.currentVersion || null);
    } catch {
      // Handled in fallback
    } finally {
      setLoading(false);
    }
  };

  if (!template) return null;

  const currentVersionNumber = template.currentVersion?.versionNumber || 1;

  const handleRollback = async (versionNumber: number) => {
    if (versionNumber === currentVersionNumber) return;
    const confirm = window.confirm(
      `Are you sure you want to publish Version ${versionNumber} as the active live version for "${template.title}"?`
    );
    if (!confirm) return;

    setRollbackLoading(true);
    try {
      const updated = await templateService.publishVersion(template.id, versionNumber);
      onRollbackSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to rollback version');
    } finally {
      setRollbackLoading(false);
    }
  };

  // Simple line-by-line Diff comparison between selected version and current version
  const computeDiff = () => {
    if (!selectedVersion || !template.currentVersion) return [];
    const currentLines = (template.currentVersion.contentMarkup || '').split('\n');
    const selectedLines = (selectedVersion.contentMarkup || '').split('\n');

    const max = Math.max(currentLines.length, selectedLines.length);
    const diffRows = [];

    for (let i = 0; i < max; i++) {
      const cur = currentLines[i];
      const sel = selectedLines[i];

      if (cur === sel) {
        diffRows.push({ type: 'unchanged', text: cur ?? '' });
      } else if (sel === undefined) {
        diffRows.push({ type: 'deleted', text: cur ?? '' });
      } else if (cur === undefined) {
        diffRows.push({ type: 'added', text: sel ?? '' });
      } else {
        diffRows.push({ type: 'modified', oldText: cur, newText: sel });
      }
    }
    return diffRows;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Immutable Version History & Audit"
      subtitle={`Revision timeline for "${template.title}"`}
      maxWidth="880px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
            Current active: <strong>v{currentVersionNumber}</strong>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div
            className="spinner"
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--border-subtle)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              margin: '0 auto 12px',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading version timeline...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 400 }}>
          {/* Version List Sidebar */}
          <div
            style={{
              borderRight: '1px solid var(--border-subtle)',
              paddingRight: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 460,
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              All Versions ({versions.length})
            </div>

            {versions.map((ver) => {
              const isSelected = selectedVersion?.versionNumber === ver.versionNumber;
              const isCurrent = ver.versionNumber === currentVersionNumber;

              return (
                <div
                  key={ver.id || ver.versionNumber}
                  onClick={() => setSelectedVersion(ver)}
                  className="glass-panel"
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '0.9375rem',
                        color: isSelected ? '#818cf8' : '#fff',
                      }}
                    >
                      v{ver.versionNumber}
                    </span>

                    {isCurrent ? (
                      <span className="hr-badge" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: 'var(--text-dim)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        Archived
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {ver.changeSummary || 'Version revision'}
                  </div>

                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} />
                    <span>{new Date(ver.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Version Details & Diff Pane */}
          {selectedVersion ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Header Box */}
              <div
                className="glass-panel"
                style={{
                  padding: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-tertiary)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h4 style={{ fontSize: '1.15rem' }}>Version {selectedVersion.versionNumber}</h4>
                    {selectedVersion.versionNumber === currentVersionNumber ? (
                      <span className="hr-badge">Live Published Version</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Archived Snapshot</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {selectedVersion.changeSummary || 'Standard template release'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {onPreviewVersion && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      onClick={() => onPreviewVersion(selectedVersion)}
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>
                  )}

                  {selectedVersion.versionNumber !== currentVersionNumber && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      disabled={rollbackLoading}
                      onClick={() => handleRollback(selectedVersion.versionNumber)}
                    >
                      <RotateCcw size={13} />
                      <span>{rollbackLoading ? 'Rolling back...' : 'Rollback to v' + selectedVersion.versionNumber}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* View Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', gap: 16 }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  style={{
                    padding: '6px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'details' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === 'details' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Markup Content
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diff')}
                  style={{
                    padding: '6px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'diff' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: activeTab === 'diff' ? '#fff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Diff vs Current (v{currentVersionNumber})
                </button>
              </div>

              {/* Tab 1: Markup Content */}
              {activeTab === 'details' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Placeholders recorded in this version ({selectedVersion.placeholdersSchema?.length || 0}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(selectedVersion.placeholdersSchema || []).map((tok) => (
                      <span
                        key={tok}
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          background: 'rgba(99, 102, 241, 0.1)',
                          color: '#818cf8',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {tok.startsWith('{{') ? tok : `{{${tok}}}`}
                      </span>
                    ))}
                  </div>

                  <pre
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      fontSize: '0.8125rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-main)',
                      maxHeight: 260,
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedVersion.contentMarkup || '(No content markup stored)'}
                  </pre>
                </div>
              )}

              {/* Tab 2: Visual Diff */}
              {activeTab === 'diff' && (
                <div
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    maxHeight: 320,
                    overflowY: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                  }}
                >
                  {selectedVersion.versionNumber === currentVersionNumber ? (
                    <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '24px 0' }}>
                      This is the active version. No differences to compare.
                    </div>
                  ) : (
                    computeDiff().map((row, idx) => {
                      if (row.type === 'unchanged') {
                        return (
                          <div key={idx} style={{ color: 'var(--text-dim)', padding: '1px 4px' }}>
                            &nbsp;&nbsp;{row.text}
                          </div>
                        );
                      }
                      if (row.type === 'added') {
                        return (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              padding: '1px 4px',
                            }}
                          >
                            + {row.text}
                          </div>
                        );
                      }
                      if (row.type === 'deleted') {
                        return (
                          <div
                            key={idx}
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              padding: '1px 4px',
                            }}
                          >
                            - {row.text}
                          </div>
                        );
                      }
                      return (
                        <div key={idx}>
                          <div
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#f87171',
                              padding: '1px 4px',
                            }}
                          >
                            - {row.oldText}
                          </div>
                          <div
                            style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              padding: '1px 4px',
                            }}
                          >
                            + {row.newText}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a version on the left to view details
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
