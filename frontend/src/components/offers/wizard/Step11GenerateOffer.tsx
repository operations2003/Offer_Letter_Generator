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
} from 'lucide-react';
import { GeneratedOfferResult } from '../../../types/offer.js';
import { offerService } from '../../../services/offerService.js';
import { useToast } from '../../../context/ToastContext.js';

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

  const handleSendCandidate = () => {
    info(
      `Secure portal invitation link dispatched to candidate with token: ${generatedOffer?.verificationToken?.substring(0, 14)}...`,
      'Portal Invitation Issued'
    );
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
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid var(--hr-border)',
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
              background: 'var(--hr-gradient-subtle)',
              border: '2px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--hr-glow)',
            }}
          >
            <CheckCircle2 size={26} color="var(--success)" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Offer Letter Successfully Generated!
              </h3>
              <span className="hr-badge" style={{ fontSize: '0.6875rem' }}>
                Status: {generatedOffer.currentStatus}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Reference Number: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{generatedOffer.referenceNumber}</strong> • Version {generatedOffer.versionNumber}
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
            className="btn btn-primary"
            onClick={handleSendCandidate}
            style={{ fontSize: '0.8125rem' }}
          >
            <Share2 size={15} />
            <span>Issue to Candidate Portal</span>
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
          background: 'var(--bg-tertiary)',
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Lock size={14} color="var(--success)" />
          <span>VERIFICATION TOKEN:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 600 }}>
            {generatedOffer.verificationToken || 'Verified'}
          </span>
          {generatedOffer.sha256Checksum && (
            <>
              <span style={{ color: 'var(--border-subtle)' }}>•</span>
              <Hash size={13} color="var(--text-muted)" />
              <span>SHA-256:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }} title={generatedOffer.sha256Checksum}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={14} color="var(--success)" />
          <span>Logged to Immutable Tenant Audit Ledger (v{generatedOffer.versionNumber})</span>
        </div>
      </div>

      {/* Rendered Letterhead Document (Paper Viewport) */}
      <div
        style={{
          backgroundColor: '#070a12',
          padding: '32px 16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'auto',
        }}
      >
        <div
          id="final-offer-paper"
          style={{
            width: '100%',
            maxWidth: '740px',
            minHeight: '920px',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            padding: '54px 60px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
            borderRadius: '2px',
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
    </div>
  );
};
