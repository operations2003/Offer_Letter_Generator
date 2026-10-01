import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
  Hash,
  Send,
  Mail,
} from 'lucide-react';
import { GeneratedOfferResult } from '../../../types/offer.js';
import { offerService } from '../../../services/offerService.js';
import { useToast } from '../../../context/ToastContext.js';
import { EmailSendModal } from '../EmailSendModal.js';
import { EmailHistoryModal } from '../EmailHistoryModal.js';

interface Step11GenerateOfferProps {
  generatedOffer: GeneratedOfferResult | null;
  onFinish: () => void;
  onRegenerate?: () => Promise<void>;
}

export const Step11GenerateOffer: React.FC<Step11GenerateOfferProps> = ({
  generatedOffer,
  onFinish,
  onRegenerate,
}) => {
  const { success, error, info } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showEmailSendModal, setShowEmailSendModal] = useState(false);
  const [showEmailHistoryModal, setShowEmailHistoryModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!generatedOffer) return;
    setDownloading(true);
    try {
      await offerService.downloadOfferPdf(
        generatedOffer.id,
        generatedOffer.documentId,
        generatedOffer.fileName
      );
      success('Official offer letter PDF downloaded successfully.', 'PDF Exported');
    } catch (err: any) {
      // Fallback: print to PDF
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      setRegenerating(true);
      try {
        await onRegenerate();
        success('Offer letter regenerated with incremented version snapshot.', 'Regenerated');
      } catch (err: any) {
        error(err?.message || 'Failed to regenerate offer', 'Error');
      } finally {
        setRegenerating(false);
      }
    } else {
      info('Regeneration creates a new immutable document version in the tenant ledger.', 'Regenerate Version');
    }
  };

  if (!generatedOffer) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
        <h4>Minting Formal Offer Document...</h4>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Success Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#d1fae5',
              border: '2px solid #059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)',
            }}
          >
            <CheckCircle2 size={26} color="#059669" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Offer Letter Successfully Generated!
              </h3>
              <span className="hr-badge" style={{ fontSize: '0.6875rem' }}>
                Status: {generatedOffer.currentStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: 4 }}>
              Reference Number: <strong style={{ color: '#0f172a', fontFamily: 'var(--font-mono)' }}>{generatedOffer.referenceNumber}</strong> • Version {generatedOffer.versionNumber}
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ fontSize: '0.8125rem' }}
          >
            <Printer size={15} />
            <span>Print Document</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{ fontSize: '0.8125rem' }}
          >
            <RefreshCw size={15} className={regenerating ? 'animate-spin' : ''} />
            <span>{regenerating ? 'Regenerating...' : 'Regenerate'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{ fontSize: '0.8125rem' }}
          >
            <Download size={15} />
            <span>{downloading ? 'Downloading PDF...' : 'Download Legal PDF'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowEmailHistoryModal(true)}
            style={{ fontSize: '0.8125rem' }}
            title="View email dispatch logs, delivery status, and tracking"
          >
            <Mail size={15} />
            <span>Send History</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowEmailSendModal(true)}
            style={{ fontSize: '0.8125rem' }}
          >
            <Send size={15} />
            <span>Send Offer via Email</span>
          </button>
        </div>
      </div>

      {/* Security Verification & Integrity Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.75rem',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Lock size={14} color="#059669" />
          <span style={{ fontWeight: 600, color: '#475569' }}>VERIFICATION TOKEN:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#4f46e5', fontWeight: 600 }}>
            {generatedOffer.verificationToken || 'Verified'}
          </span>
          {generatedOffer.sha256Checksum && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <Hash size={13} color="#64748b" />
              <span>SHA-256:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }} title={generatedOffer.sha256Checksum}>
                {generatedOffer.sha256Checksum.substring(0, 16)}...
              </span>
            </>
          )}
          {generatedOffer.fileSizeBytes && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <span>{(generatedOffer.fileSizeBytes / 1024).toFixed(1)} KB</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontWeight: 600 }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Logged to Immutable Tenant Audit Ledger (v{generatedOffer.versionNumber})</span>
        </div>
      </div>

      {/* Rendered Letterhead Document (Paper Viewport) */}
      <div
        style={{
          backgroundColor: '#f1f5f9',
          padding: '36px 16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div
          id="final-offer-paper"
          style={{
            width: '100%',
            maxWidth: '780px',
            minHeight: '920px',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            padding: '54px 60px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            fontSize: '13px',
            lineHeight: 1.65,
            position: 'relative',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Document Content */}
          <div dangerouslySetInnerHTML={{ __html: generatedOffer.renderedHtml }} />
        </div>
      </div>

      {/* Return to Dashboard / Offers Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onFinish}
          style={{ padding: '12px 28px', fontSize: '0.9375rem' }}
        >
          <span>Return to Offers Pipeline</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Email Send Confirmation & Preview Modal */}
      {showEmailSendModal && (
        <EmailSendModal
          offerId={generatedOffer.id}
          offerReferenceNumber={generatedOffer.referenceNumber}
          isOpen={showEmailSendModal}
          onClose={() => setShowEmailSendModal(false)}
          onSentSuccessfully={() => {
            setShowEmailSendModal(false);
            success('Offer email successfully sent to candidate!');
          }}
          onViewHistory={() => {
            setShowEmailSendModal(false);
            setShowEmailHistoryModal(true);
          }}
        />
      )}

      {/* Email Dispatch History & Retry Modal */}
      {showEmailHistoryModal && (
        <EmailHistoryModal
          offerId={generatedOffer.id}
          offerReferenceNumber={generatedOffer.referenceNumber}
          candidateName="Candidate"
          isOpen={showEmailHistoryModal}
          onClose={() => setShowEmailHistoryModal(false)}
          onOpenSendModal={() => {
            setShowEmailHistoryModal(false);
            setShowEmailSendModal(true);
          }}
        />
      )}
    </div>
  );
};

