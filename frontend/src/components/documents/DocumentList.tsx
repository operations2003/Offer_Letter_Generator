import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpDown,
  Calendar,
  Lock,
} from 'lucide-react';
import {
  HrDocument,
  DocumentTypeCode,
  DocumentLifecycleStatus,
} from '../../types/document-engine.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface DocumentListProps {
  onCreateClick: () => void;
  onViewDocument: (doc: HrDocument) => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  OFFER_LETTER: 'Offer Letter',
  INTERNSHIP_LETTER: 'Internship Letter',
  INCREMENT_LETTER: 'Increment Letter',
  TERMINATION_LETTER: 'Termination Letter',
  EXPERIENCE_LETTER: 'Experience Letter',
  RELIEVING_LETTER: 'Relieving Letter',
  FNF_SETTLEMENT: 'FNF Settlement',
  CONTRACT_LETTER: 'Contract Letter',
  MSA: 'Master Services Agreement',
};

const INITIAL_MOCK_DOCS: HrDocument[] = [];

export const DocumentList: React.FC<DocumentListProps> = ({
  onCreateClick,
  onViewDocument,
}) => {
  const { success, error, info } = useToast();
  const [documents, setDocuments] = useState<HrDocument[]>(INITIAL_MOCK_DOCS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchDocuments();
  }, [selectedType, selectedStatus]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (selectedType !== 'ALL') params.type = selectedType as any;
      if (selectedStatus !== 'ALL') params.status = selectedStatus as any;

      let backendDocs: HrDocument[] = [];
      try {
        const res = await DocumentEngineService.listDocuments(params);
        if (Array.isArray(res)) {
          backendDocs = res;
        }
      } catch (err) {
        console.warn('Backend listDocuments notice:', err);
      }

      // Load saved documents from localStorage
      let localSaved: HrDocument[] = [];
      try {
        localSaved = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
      } catch {
        localSaved = [];
      }

      // Merge backend and local docs, deduplicating by referenceNumber or id
      const docMap = new Map<string, HrDocument>();
      backendDocs.forEach((d) => docMap.set(d.referenceNumber || d.id, d));
      localSaved.forEach((d) => {
        const key = d.referenceNumber || d.id;
        if (!docMap.has(key)) {
          docMap.set(key, d);
        }
      });

      let combined = Array.from(docMap.values());
      if (selectedType !== 'ALL') {
        combined = combined.filter((d) => d.documentTypeCode === selectedType);
      }
      if (selectedStatus !== 'ALL') {
        combined = combined.filter((d) => d.currentStatus === selectedStatus);
      }

      setDocuments(combined);
    } catch {
      let localSaved: HrDocument[] = [];
      try {
        localSaved = JSON.parse(localStorage.getItem('tasknera_saved_documents') || '[]');
      } catch {
        localSaved = [];
      }
      setDocuments(localSaved);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesType = selectedType === 'ALL' || doc.documentTypeCode === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || doc.currentStatus === selectedStatus;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner & Creation CTA */}
      <div
        className="glass-panel"
        style={{
          padding: '22px 28px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="ai-badge" style={{ fontSize: '0.7rem' }}>
              <Sparkles size={12} /> Unified HR Document Engine
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              9 Core Document Types Supported
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
            HR Document Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Author, verify, quality-check, and generate tamper-evident documents with AI assistance and strict HR oversight.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onCreateClick}
          style={{
            fontSize: '0.9375rem',
            padding: '12px 22px',
            boxShadow: '0 4px 18px var(--primary-glow)',
          }}
        >
          <Plus size={18} /> Create New Document
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {/* Document Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Type:</span>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.8125rem', width: 'auto' }}
            >
              <option value="ALL">All Document Types (9)</option>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Status:</span>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.8125rem', width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT_AI">Draft (AI)</option>
              <option value="HR_REVIEW">HR Review</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="ISSUED">Issued</option>
              <option value="ACCEPTED">Accepted</option>
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: 280 }}>
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
            placeholder="Search by recipient or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Document Details
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Recipient
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Lifecycle Status
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                AI Review Status
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Effective Date
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No documents found matching the selected filters.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <FileText size={16} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>
                          {DOCUMENT_TYPE_LABELS[doc.documentTypeCode] || doc.documentTypeCode}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          REF: {doc.referenceNumber} • v{doc.currentVersionNumber}.0
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main, #0f172a)' }}>
                      {doc.recipientName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {doc.recipientEmail}
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        background:
                          doc.currentStatus === 'ISSUED' || doc.currentStatus === 'ACCEPTED'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : doc.currentStatus === 'APPROVED'
                            ? 'rgba(99, 102, 241, 0.15)'
                            : 'rgba(245, 158, 11, 0.15)',
                        color:
                          doc.currentStatus === 'ISSUED' || doc.currentStatus === 'ACCEPTED'
                            ? '#34d399'
                            : doc.currentStatus === 'APPROVED'
                            ? '#818cf8'
                            : '#fbbf24',
                        border: '1px solid currentColor',
                      }}
                    >
                      {doc.currentStatus.replace('_', ' ')}
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <span
                      className={doc.aiReviewStatus === 'OVERRIDDEN' ? 'ai-badge' : 'hr-badge'}
                      style={{ fontSize: '0.6875rem', padding: '2px 8px' }}
                    >
                      {doc.aiReviewStatus === 'OVERRIDDEN' ? 'Overridden by HR' : 'Verified by HR'}
                    </span>
                  </td>

                  <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {doc.effectiveDate || '—'}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <Button
                      variant="secondary"
                      onClick={() => onViewDocument(doc)}
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} /> View / Preview
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
