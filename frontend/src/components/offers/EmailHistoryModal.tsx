import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Send,
  Lock,
  Paperclip,
  Copy,
  ExternalLink,
  RefreshCw,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { offerService } from '../../services/offerService.js';
import { EmailDeliveryRecord, EmailHistoryResponse } from '../../types/offer.js';

interface EmailHistoryModalProps {
  offerId: string;
  offerReferenceNumber: string;
  candidateName: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenSendModal?: () => void;
}

export const EmailHistoryModal: React.FC<EmailHistoryModalProps> = ({
  offerId,
  offerReferenceNumber,
  candidateName,
  isOpen,
  onClose,
  onOpenSendModal,
}) => {
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<EmailHistoryResponse | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await offerService.getEmailHistory(offerId);
      setHistory(data);
    } catch (err: any) {
      error(err.message || 'Failed to fetch email history', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [offerId, isOpen]);

  if (!isOpen) return null;

  const handleRetry = async (deliveryId: string) => {
    setRetryingId(deliveryId);
    try {
      const result = await offerService.retryEmailDelivery(offerId, deliveryId);
      if (result.success) {
        success(result.message || 'Retry successful!');
      } else {
        error(result.message || 'Retry failed', 'Delivery Error');
      }
      await fetchHistory();
    } catch (err: any) {
      error(err.message || 'Retry failed', 'Error');
    } finally {
      setRetryingId(null);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    success('Candidate portal link copied to clipboard');
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return 'Not recorded';
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
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
          maxWidth: 820,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
          border: '1px solid var(--border-medium)',
        }}
      >
        {/* Header */}
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
              <History size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Email Delivery History</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                  ({offerReferenceNumber})
                </span>
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Auditable log of all email dispatch attempts, retries, secure links, and delivery timestamps.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchHistory}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
              title="Refresh History"
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: 6, borderRadius: '50%' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Overview Stats Strip */}
        {history && (
          <div
            style={{
              padding: '12px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.01)',
              display: 'flex',
              gap: 24,
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Candidate: </span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{candidateName}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Total Dispatches: </span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{history.totalDeliveries}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Delivered: </span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>{history.sentCount}</span>
            </div>
            {history.failedCount > 0 && (
              <div>
                <span style={{ color: 'var(--text-dim)' }}>Failed Attempts: </span>
                <span style={{ color: '#f87171', fontWeight: 600 }}>{history.failedCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Body List */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              Loading email delivery logs...
            </div>
          ) : !history || history.deliveries.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Mail size={32} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--text-dim)' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                No email dispatch records found
              </div>
              <p style={{ fontSize: '0.8125rem', maxWidth: 400, margin: '0 auto 16px' }}>
                This offer has not been dispatched to the candidate yet.
              </p>
              {onOpenSendModal && (
                <Button variant="primary" icon={<Send size={14} />} onClick={onOpenSendModal}>
                  Send Offer Now
                </Button>
              )}
            </div>
          ) : (
            history.deliveries.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: 18,
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border:
                    item.status === 'SENT'
                      ? '1px solid rgba(52, 211, 153, 0.2)'
                      : item.status === 'FAILED'
                      ? '1px solid rgba(248, 113, 113, 0.25)'
                      : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Top Row: Status, Attempt Number & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.status === 'SENT' ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 6,
                          background: 'rgba(52, 211, 153, 0.12)',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>SENT</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 6,
                          background: 'rgba(248, 113, 113, 0.12)',
                          color: '#f87171',
                          border: '1px solid rgba(248, 113, 113, 0.3)',
                        }}
                      >
                        <AlertTriangle size={13} />
                        <span>FAILED</span>
                      </span>
                    )}

                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Attempt #{item.attemptNumber} {item.retryCount > 0 && `(Retry #${item.retryCount})`}
                    </span>
                  </div>

                  {/* Retry Action button for failed deliveries */}
                  {item.status === 'FAILED' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleRetry(item.id)}
                      disabled={retryingId === item.id}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        gap: 5,
                        background: '#f87171',
                        borderColor: '#f87171',
                      }}
                    >
                      {retryingId === item.id ? (
                        <RefreshCw size={12} className="spin" />
                      ) : (
                        <RotateCcw size={12} />
                      )}
                      <span>Retry Dispatch</span>
                    </button>
                  )}
                </div>

                {/* Subject & Recipient Details */}
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>
                    {item.subject}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 3 }}>
                    To: {item.recipientName} &lt;{item.recipientEmail}&gt; • Dispatched by {item.sentBy.name}
                  </div>
                </div>

                {/* Failure Reason Alert Callout */}
                {item.status === 'FAILED' && item.failureReason && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'rgba(248, 113, 113, 0.08)',
                      border: '1px solid rgba(248, 113, 113, 0.2)',
                      fontSize: '0.75rem',
                      color: '#fca5a5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>Error: {item.failureReason}</span>
                  </div>
                )}

                {/* Secure Link & PDF attachment details */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399' }}>
                      <Lock size={12} />
                      <span>Secure Candidate Portal Token Attached</span>
                    </div>

                    {item.hasPdfAttachment && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#a5b4fc' }}>
                        <Paperclip size={12} />
                        <span>PDF Included ({item.pdfFileName || 'Legal Document'})</span>
                      </div>
                    )}
                  </div>

                  {item.securePortalUrl && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCopyLink(item.securePortalUrl, item.id)}
                      style={{ padding: '2px 8px', fontSize: '0.7rem', gap: 4 }}
                    >
                      <Copy size={11} />
                      <span>{copiedId === item.id ? 'Copied' : 'Copy Token Link'}</span>
                    </button>
                  )}
                </div>

                {/* Timestamps Row */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    fontSize: '0.72rem',
                    color: 'var(--text-dim)',
                    marginTop: 2,
                  }}
                >
                  <div>
                    <span>Attempted: </span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatTimestamp(item.attemptedAt)}</span>
                  </div>
                  {item.deliveredAt && (
                    <div>
                      <span>Delivered: </span>
                      <span style={{ color: '#34d399' }}>{formatTimestamp(item.deliveredAt)}</span>
                    </div>
                  )}
                  {item.failedAt && (
                    <div>
                      <span>Failed: </span>
                      <span style={{ color: '#f87171' }}>{formatTimestamp(item.failedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            All email deliveries and cryptographic tokens are immutably logged for audit compliance.
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
