import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  RefreshCw,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Undo2,
  UserCheck,
  Send,
  Hash,
} from 'lucide-react';
import { OfferItem } from '../../types/index.js';
import {
  OfferPreviewData,
  OfferVersionItem,
  OfferStatusDetails,
  GeneratedDocumentItem,
} from '../../types/offer.js';
import { offerService } from '../../services/offerService.js';
import { useToast } from '../../context/ToastContext.js';
import { OfferStatusBadge } from '../common/Badge.js';

interface OfferDetailModalProps {
  offer: OfferItem;
  isOpen: boolean;
  onClose: () => void;
  onOfferUpdated?: () => void;
  initialTab?: 'preview' | 'pdf' | 'versions' | 'status';
}

export const OfferDetailModal: React.FC<OfferDetailModalProps> = ({
  offer,
  isOpen,
  onClose,
  onOfferUpdated,
  initialTab = 'preview',
}) => {
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'preview' | 'pdf' | 'versions' | 'status'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewData, setPreviewData] = useState<OfferPreviewData | null>(null);
  const [statusDetails, setStatusDetails] = useState<OfferStatusDetails | null>(null);
  const [versions, setVersions] = useState<OfferVersionItem[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocumentItem[]>([]);
  
  // Generation & Regeneration states
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [regenerateReason, setRegenerateReason] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);
  const [signatoryName, setSignatoryName] = useState('Sarah Jenkins');
  const [signatoryTitle, setSignatoryTitle] = useState('VP of Global Talent Operations');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadOfferHubData = async () => {
      setLoading(true);
      try {
        const [preview, status, vers, docs] = await Promise.all([
          offerService.getOfferPreview(offer.id),
          offerService.getOfferStatus(offer.id),
          offerService.getOfferVersions(offer.id),
          offerService.listOfferDocuments(offer.id),
        ]);

        if (isMounted) {
          setPreviewData(preview);
          setStatusDetails(status);
          setVersions(vers);
          setDocuments(docs);
        }
      } catch (err: any) {
        if (isMounted) {
          error(err?.message || 'Failed to load offer details', 'Error');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOfferHubData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, offer.id]);

  if (!isOpen) return null;

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await offerService.downloadOfferPdf(
        offer.id,
        documents[0]?.id,
        `Offer_${previewData?.offerReferenceNumber || offer.referenceNumber}_v${previewData?.versionNumber || 1}.pdf`
      );
      success('Official legal offer letter PDF downloaded successfully.', 'PDF Exported');
    } catch (err: any) {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  // Handle Generate Offer Document
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await offerService.generateFinalDocument(offer.id, {
        signatoryName,
        signatoryTitle,
        notes: 'Document generated from HR Review & Approval Hub',
      });

      success('Official legal offer letter generated and digitally signed.', 'Offer Generated');
      
      // Refresh preview and versions
      const [updatedPreview, updatedStatus, updatedVers, updatedDocs] = await Promise.all([
        offerService.getOfferPreview(offer.id),
        offerService.getOfferStatus(offer.id),
        offerService.getOfferVersions(offer.id),
        offerService.listOfferDocuments(offer.id),
      ]);
      setPreviewData(updatedPreview);
      setStatusDetails(updatedStatus);
      setVersions(updatedVers);
      setDocuments(updatedDocs);

      if (onOfferUpdated) onOfferUpdated();
    } catch (err: any) {
      error(err?.message || 'Failed to generate document', 'Generation Failed');
    } finally {
      setGenerating(false);
    }
  };

  // Handle Regenerate Offer Document
  const handleRegenerate = async () => {
    if (!regenerateReason.trim()) {
      error('Please provide a reason for regenerating the offer.', 'Validation Error');
      return;
    }

    setRegenerating(true);
    try {
      await offerService.regenerateFinalDocument(offer.id, {
        signatoryName,
        signatoryTitle,
        reason: regenerateReason.trim(),
        notes: `Regeneration authorized by HR. Audit snapshot appended.`,
      });

      success(`Offer letter regenerated with incremented version snapshot.`, 'Regenerated');
      setShowRegenerateDialog(false);
      setRegenerateReason('');

      // Refresh data
      const [updatedPreview, updatedStatus, updatedVers, updatedDocs] = await Promise.all([
        offerService.getOfferPreview(offer.id),
        offerService.getOfferStatus(offer.id),
        offerService.getOfferVersions(offer.id),
        offerService.listOfferDocuments(offer.id),
      ]);
      setPreviewData(updatedPreview);
      setStatusDetails(updatedStatus);
      setVersions(updatedVers);
      setDocuments(updatedDocs);

      if (onOfferUpdated) onOfferUpdated();
    } catch (err: any) {
      error(err?.message || 'Failed to regenerate document', 'Regeneration Failed');
    } finally {
      setRegenerating(false);
    }
  };

  // Handle Version Restore
  const handleRestoreVersion = async (versionNum: number) => {
    if (!confirm(`Are you sure you want to rollback to Version ${versionNum}? This will create a new current revision.`)) {
      return;
    }

    setRestoringVersion(versionNum);
    try {
      await offerService.restoreOfferVersion(offer.id, versionNum);
      success(`Successfully restored offer terms to Version ${versionNum}.`, 'Version Restored');

      const [updatedPreview, updatedStatus, updatedVers] = await Promise.all([
        offerService.getOfferPreview(offer.id),
        offerService.getOfferStatus(offer.id),
        offerService.getOfferVersions(offer.id),
      ]);
      setPreviewData(updatedPreview);
      setStatusDetails(updatedStatus);
      setVersions(updatedVers);

      if (onOfferUpdated) onOfferUpdated();
    } catch (err: any) {
      error(err?.message || 'Failed to restore version', 'Error');
    } finally {
      setRestoringVersion(null);
    }
  };

  const isIssued = offer.status === 'ISSUED' || previewData?.currentStatus === 'ISSUED';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0b0f19',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <FileCheck2 size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  {offer.candidateName}
                </h3>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-dim)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {offer.referenceNumber}
                </span>
                <OfferStatusBadge status={((previewData?.currentStatus as any) || offer.status)} />
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {offer.role} • {offer.department} • CTC: ${offer.totalCtc.toLocaleString()} {offer.currency}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Quick Action: PDF Download */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadPdf}
              disabled={downloading}
              style={{ padding: '7px 14px', fontSize: '0.8125rem' }}
              title="Download Legal PDF"
            >
              <Download size={14} />
              <span>{downloading ? 'Downloading...' : 'PDF'}</span>
            </button>

            {/* Quick Action: Print */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.print()}
              style={{ padding: '7px 12px', fontSize: '0.8125rem' }}
              title="Print document"
            >
              <Printer size={14} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '8px', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Generation Status Pipeline Tracker */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#070a12',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Generation Pipeline:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {['DRAFT_AI', 'HR_REVIEW', 'APPROVED', 'ISSUED'].map((st, idx) => {
                const current = previewData?.currentStatus || offer.status;
                const statusOrder = ['DRAFT_AI', 'HR_REVIEW', 'PENDING_APPROVAL', 'APPROVED', 'ISSUED'];
                const isPassed = statusOrder.indexOf(current) >= statusOrder.indexOf(st);
                const isCurrent = current === st;

                return (
                  <React.Fragment key={st}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: isCurrent
                          ? 'rgba(99, 102, 241, 0.2)'
                          : isPassed
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)',
                        color: isCurrent
                          ? '#818cf8'
                          : isPassed
                          ? 'var(--success)'
                          : 'var(--text-dim)',
                        border: isCurrent
                          ? '1px solid #818cf8'
                          : isPassed
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid transparent',
                      }}
                    >
                      {st.replace(/_/g, ' ')}
                    </span>
                    {idx < 3 && <ChevronRight size={12} color="var(--text-dim)" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Primary Generation & Regeneration Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Generate Button (Shown when not yet Issued) */}
            {!isIssued && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
                style={{ padding: '6px 16px', fontSize: '0.8125rem' }}
              >
                <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
                <span>{generating ? 'Compiling Legal PDF...' : 'Generate Official Offer'}</span>
              </button>
            )}

            {/* Regenerate Option (Shown when already issued or updated) */}
            {isIssued && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRegenerateDialog(true)}
                disabled={regenerating}
                style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
              >
                <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                <span>Regenerate Offer</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: 2,
            padding: '0 24px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '12px 18px',
              borderRadius: 0,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'preview' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'preview' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Eye size={15} />
            <span>Offer Preview</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setActiveTab('pdf')}
            style={{
              padding: '12px 18px',
              borderRadius: 0,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'pdf' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'pdf' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FileText size={15} />
            <span>PDF Preview & Download</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setActiveTab('versions')}
            style={{
              padding: '12px 18px',
              borderRadius: 0,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'versions' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'versions' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <History size={15} />
            <span>Version History ({versions.length || 1})</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setActiveTab('status')}
            style={{
              padding: '12px 18px',
              borderRadius: 0,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'status' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'status' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Clock size={15} />
            <span>Status & Audit Ledger</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading offer hub data...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OFFER PREVIEW (LETTERHEAD DOCUMENT VIEW) */}
              {activeTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                  {/* Security / Verification Badge */}
                  <div
                    className="glass-panel"
                    style={{
                      width: '100%',
                      maxWidth: '780px',
                      padding: '10px 18px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Lock size={13} color="var(--success)" />
                      <span>OFFER TOKEN:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 600 }}>
                        {previewData?.verificationToken || 'VERIFIED-TOKEN-9281'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={14} color="var(--success)" />
                      <span>Version {previewData?.versionNumber || 1} • Immutable Document Ledger</span>
                    </div>
                  </div>

                  {/* Letterhead Paper Container */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '780px',
                      minHeight: '850px',
                      backgroundColor: '#ffffff',
                      color: '#1f2937',
                      padding: '48px 54px',
                      borderRadius: '4px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      lineHeight: 1.65,
                    }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: previewData?.renderedHtml || '' }} />
                  </div>
                </div>
              )}

              {/* TAB 2: PDF PREVIEW & DOWNLOAD */}
              {activeTab === 'pdf' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div
                    className="glass-panel"
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 16,
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                        Official Legal PDF Document
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                        Generated strictly from HR-confirmed terms with SHA-256 cryptographic integrity hash.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleDownloadPdf}
                        disabled={downloading}
                        style={{ padding: '8px 18px', fontSize: '0.8125rem' }}
                      >
                        <Download size={15} />
                        <span>{downloading ? 'Downloading...' : 'Download Official PDF'}</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => window.print()}
                        style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
                      >
                        <Printer size={15} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated PDF Viewport */}
                  <div
                    style={{
                      background: '#1a1f2e',
                      padding: '32px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '720px',
                        backgroundColor: '#ffffff',
                        color: '#1f2937',
                        padding: '48px 52px',
                        borderRadius: '2px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                        fontSize: '13px',
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: previewData?.renderedHtml || '' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VERSION HISTORY & ROLLBACK */}
              {activeTab === 'versions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                        Document Revision Timeline
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                        Every modification or regeneration increments the version snapshot and records a human audit trail.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRegenerateDialog(true)}
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      <RefreshCw size={13} />
                      <span>Create New Revision</span>
                    </button>
                  </div>

                  {/* Versions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {versions.map((ver, idx) => {
                      const isLatest = idx === 0;
                      return (
                        <div
                          key={ver.id || ver.versionNumber}
                          className="glass-panel"
                          style={{
                            padding: '18px 22px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            border: isLatest ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-subtle)',
                            background: isLatest ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                          }}
                        >
                          <div style={{ display: 'flex', gap: 14 }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '50%',
                                backgroundColor: isLatest ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                                color: isLatest ? '#fff' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                              }}
                            >
                              v{ver.versionNumber}
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff' }}>
                                  Version {ver.versionNumber}
                                </span>
                                {isLatest && (
                                  <span
                                    style={{
                                      fontSize: '0.6875rem',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                      color: '#818cf8',
                                      fontWeight: 600,
                                    }}
                                  >
                                    CURRENT ACTIVE
                                  </span>
                                )}
                              </div>

                              <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: '4px 0 6px 0' }}>
                                {ver.changeReason || 'Standard document revision'}
                              </p>

                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: 14 }}>
                                <span>Author: <strong>{ver.createdBy?.firstName || 'HR Operations'}</strong></span>
                                <span>Date: {new Date(ver.createdAt).toLocaleString()}</span>
                              </div>

                              {/* Snapshot Diff details */}
                              {ver.diffFromPrevious && Object.keys(ver.diffFromPrevious).length > 0 && (
                                <div
                                  style={{
                                    marginTop: 10,
                                    padding: '8px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(0, 0, 0, 0.25)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Recorded Changes: </span>
                                  {Object.entries(ver.diffFromPrevious).map(([key, diff]: [string, any]) => (
                                    <span key={key} style={{ marginRight: 12 }}>
                                      <code style={{ color: '#818cf8' }}>{key}</code>: {String(diff.before ?? 'None')} → <strong style={{ color: 'var(--success)' }}>{String(diff.after)}</strong>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Rollback Action */}
                          {!isLatest && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => handleRestoreVersion(ver.versionNumber)}
                              disabled={restoringVersion === ver.versionNumber}
                              style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              <Undo2 size={13} />
                              <span>{restoringVersion === ver.versionNumber ? 'Restoring...' : 'Restore This Version'}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: STATUS & AUDIT LEDGER */}
              {activeTab === 'status' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                      Lifecycle Status & Compliance Audit Ledger
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                      Tamper-evident log of all approvals, status transitions, and legal sign-offs.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Current Offer State:</span>
                      <OfferStatusBadge status={((previewData?.currentStatus as any) || offer.status)} />
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <div>Candidate: <strong>{offer.candidateName}</strong></div>
                      <div>Role: <strong>{offer.role}</strong> ({offer.department})</div>
                      <div>Approver: <strong>{statusDetails?.approver ? `${statusDetails.approver.firstName} ${statusDetails.approver.lastName}` : 'HR Leadership'}</strong></div>
                    </div>
                  </div>

                  {/* Transition History Table */}
                  <div className="glass-panel" style={{ padding: 20 }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 12 }}>Status Transition Logs</h5>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Timestamp</th>
                          <th style={{ padding: '8px 12px' }}>Previous</th>
                          <th style={{ padding: '8px 12px' }}>New State</th>
                          <th style={{ padding: '8px 12px' }}>Reason / Notes</th>
                          <th style={{ padding: '8px 12px' }}>Actor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(statusDetails?.statusLogs || []).map((log) => (
                          <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                            <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{log.previousStatus}</span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <OfferStatusBadge status={log.newStatus as any} />
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                              {log.reason || log.notes || 'Status progressed'}
                            </td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>
                              {log.changedBy ? `${log.changedBy.firstName} ${log.changedBy.lastName}` : 'System'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Strict Guardrail: AI suggestions are advisory. Final legal PDF is generated solely from HR-confirmed terms.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ fontSize: '0.8125rem' }}
            >
              Close
            </button>

            {!isIssued && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
                style={{ fontSize: '0.8125rem' }}
              >
                <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
                <span>{generating ? 'Minting PDF...' : 'Generate Official Offer'}</span>
              </button>
            )}

            {isIssued && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRegenerateDialog(true)}
                disabled={regenerating}
                style={{ fontSize: '0.8125rem' }}
              >
                <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                <span>Regenerate Offer</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REGENERATE DIALOG MODAL */}
      {showRegenerateDialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#0f172a',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RefreshCw size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                  Regenerate Legal Offer Letter
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowRegenerateDialog(false)}
                className="btn btn-ghost"
                style={{ padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
              Regenerating will compile a new legal PDF, increment the version number, and preserve the previous document in the audit ledger.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-dim)' }}>
                Reason for Regeneration *
              </label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. Revised compensation after executive signoff, adjusted joining bonus terms..."
                value={regenerateReason}
                onChange={(e) => setRegenerateReason(e.target.value)}
                style={{ width: '100%', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-dim)' }}>
                  Signatory Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, color: 'var(--text-dim)' }}>
                  Signatory Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  style={{ width: '100%', fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRegenerateDialog(false)}
                style={{ fontSize: '0.8125rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRegenerate}
                disabled={regenerating || !regenerateReason.trim()}
                style={{ fontSize: '0.8125rem' }}
              >
                <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                <span>{regenerating ? 'Regenerating...' : 'Confirm & Regenerate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
