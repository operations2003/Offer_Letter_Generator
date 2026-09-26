import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  FileText,
  ShieldCheck,
  Lock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { offerService } from '../../services/offerService.js';
import { EmailConfirmationPreview, EmailDeliveryRecord } from '../../types/offer.js';

interface EmailSendModalProps {
  offerId: string;
  offerReferenceNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccessfully: (delivery: EmailDeliveryRecord) => void;
  onViewHistory?: () => void;
}

export const EmailSendModal: React.FC<EmailSendModalProps> = ({
  offerId,
  offerReferenceNumber,
  isOpen,
  onClose,
  onSentSuccessfully,
  onViewHistory,
}) => {
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<EmailConfirmationPreview | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [includePdfAttachment, setIncludePdfAttachment] = useState(true);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadPreview = async () => {
      setLoading(true);
      try {
        const data = await offerService.getEmailConfirmationPreview(offerId);
        if (isMounted) {
          setPreview(data);
          setSubject(data.defaultSubject);
        }
      } catch (err: any) {
        if (isMounted) {
          error(err.message || 'Failed to load email preview', 'Error');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPreview();
    return () => {
      isMounted = false;
    };
  }, [offerId, isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (preview?.securePortalUrl) {
      const fullUrl = window.location.origin + preview.securePortalUrl;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      success('Candidate portal link copied to clipboard');
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const result = await offerService.sendOfferEmail(offerId, {
        subject,
        message: customMessage,
        includePdfAttachment,
        simulateFailure,
      });

      if (result.success) {
        success(`Offer email successfully dispatched to ${preview?.recipientEmail}!`);
        onSentSuccessfully(result.delivery);
        onClose();
      } else {
        error(result.message || 'Offer email delivery failed', 'Delivery Error');
        onSentSuccessfully(result.delivery);
      }
    } catch (err: any) {
      error(err.message || 'Error occurred while sending offer', 'Error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 20,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-medium)',
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
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Send Formal Offer Email</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                  ({offerReferenceNumber})
                </span>
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Review email content, secure token link, and PDF attachment before final dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: 6, borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              Loading email confirmation details...
            </div>
          ) : (
            <>
              {/* AI Guardrail Strict Notice Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <ShieldCheck size={18} style={{ color: '#818cf8', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#c7d2fe' }}>
                    Human Verification Required (AI Prohibition Guardrail)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    AI agents and background routines are strictly prohibited from dispatching offers.
                    You are sending as authorized HR user <strong>{preview?.senderName}</strong> ({preview?.senderEmail}).
                  </div>
                </div>
              </div>

              {/* Recipient & Subject Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Candidate Recipient
                  </label>
                  <div
                    style={{
                      padding: '9px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#fff',
                    }}
                  >
                    {preview?.recipientName} ({preview?.recipientEmail})
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Target Role & Department
                  </label>
                  <div
                    style={{
                      padding: '9px 12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                      color: 'var(--text-bright)',
                    }}
                  >
                    {preview?.jobTitle} • {preview?.department}
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Email Subject Line
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Custom HR Message */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Custom Welcome Note (Optional)
                </label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Add any personalized message or orientation instructions for the candidate..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* PDF Attachment & Secure Link Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  padding: 16,
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* PDF Attachment Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Paperclip size={14} style={{ color: 'var(--primary-light)' }} />
                      <span>PDF Attachment</span>
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={includePdfAttachment}
                        onChange={(e) => setIncludePdfAttachment(e.target.checked)}
                      />
                      <span>Attach PDF</span>
                    </label>
                  </div>
                  {preview?.hasPdfAttachment ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{preview.pdfFileName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2 }}>
                        SHA-256: {preview.pdfChecksum?.slice(0, 16)}...
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      PDF will be rendered & attached automatically upon dispatch.
                    </div>
                  )}
                </div>

                {/* Cryptographic Secure Portal Link Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Lock size={14} style={{ color: '#34d399' }} />
                      <span>Secure Candidate Link</span>
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCopyLink}
                      style={{ padding: '3px 8px', fontSize: '0.7rem', gap: 4 }}
                    >
                      <Copy size={11} />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-dim)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {preview?.securePortalUrl}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Validity: 14 days (Expires {new Date(preview?.portalTokenExpiresAt || '').toLocaleDateString()})
                  </div>
                </div>
              </div>

              {/* Full Email HTML Preview Box */}
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Eye size={13} />
                  <span>Email Content Preview</span>
                </label>
                <div
                  style={{
                    padding: 18,
                    borderRadius: 8,
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.875rem',
                    maxHeight: 180,
                    overflowY: 'auto',
                    border: '1px solid var(--border-medium)',
                  }}
                  dangerouslySetInnerHTML={{ __html: preview?.bodyHtmlPreview || '' }}
                />
              </div>

              {/* Test Delivery Mode (Simulate Failure) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px dashed rgba(239, 68, 68, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={14} style={{ color: '#f87171' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Simulate SMTP failure (tests Failed Status and Retry capabilities)
                  </span>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                  />
                  <span>Simulate Failure</span>
                </label>
              </div>
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
            background: 'rgba(255, 255, 255, 0.01)',
          }}
        >
          {onViewHistory ? (
            <button
              className="btn btn-secondary"
              onClick={onViewHistory}
              style={{ fontSize: '0.8125rem', gap: 6 }}
            >
              <Clock size={14} />
              <span>View Email History</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={onClose} disabled={sending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={loading || sending || !preview?.canSend}
              icon={sending ? <RefreshCw size={14} className="spin" /> : <Send size={14} />}
            >
              {sending ? 'Dispatching...' : 'Confirm & Dispatch Offer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
