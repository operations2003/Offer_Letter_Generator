// =============================================================================
// REGENERATE DOCUMENT MODAL (CREATES VERSION N+1)
// =============================================================================
// Strictly avoids silent overwriting. Records change reason and creates new version.
// =============================================================================

import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle, History, Check } from 'lucide-react';
import { EmployeeDocument, EmployeeService } from '../../services/employeeService.js';

interface RegenerateDocumentModalProps {
  document: EmployeeDocument;
  isOpen: boolean;
  onClose: () => void;
  onDocumentRegenerated: () => void;
}

export const RegenerateDocumentModal: React.FC<RegenerateDocumentModalProps> = ({
  document,
  isOpen,
  onClose,
  onDocumentRegenerated,
}) => {
  const [changeNotes, setChangeNotes] = useState('');
  const [updatedContent, setUpdatedContent] = useState(document.renderedContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const nextVersion = document.currentVersion + 1;

  const handleRegenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeNotes.trim()) {
      setError('Please provide a reason / notes for regenerating this new version.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await EmployeeService.regenerateDocument(document.id, {
        changeNotes: changeNotes.trim(),
        updatedContent,
      });

      onDocumentRegenerated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <RefreshCw size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Regenerate Document
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Will create <strong style={{ color: '#2563eb' }}>Version {nextVersion}</strong> (Preserving Version {document.currentVersion})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid #fee2e2',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleRegenerate} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Version Notice */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: '0.78rem',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <History size={16} style={{ flexShrink: 0 }} />
            <span>
              All prior versions remain accessible in version history. This operation creates an updated Version {nextVersion} for review.
            </span>
          </div>

          {/* Change Notes / Reason */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Reason for Regeneration / Revision Notes <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Revised salary after committee sign-off, updated designation, corrected start date"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                outline: 'none',
              }}
            />
          </div>

          {/* Editable Document Text Preview */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
              Document Content (Version {nextVersion})
            </label>
            <textarea
              rows={12}
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                fontFamily: 'monospace',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                backgroundColor: '#f8fafc',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Creating Version...' : `Generate Version ${nextVersion}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
