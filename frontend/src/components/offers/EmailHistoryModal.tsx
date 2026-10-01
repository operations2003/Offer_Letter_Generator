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
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 14,
          background: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4338ca',
              }}
            >
              <History size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Email Delivery History</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                  ({offerReferenceNumber})
                </span>
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
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
              background: '#f1f5f9',
              display: 'flex',
              gap: 24,
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b' }}>Candidate: </span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{candidateName}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Total Dispatches: </span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{history.totalDeliveries}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Delivered: </span>
              <span style={{ color: '#059669', fontWeight: 600 }}>{history.sentCount}</span>
            </div>
            {history.failedCount > 0 && (
              <div>
                <span style={{ color: '#64748b' }}>Failed Attempts: </span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>{history.failedCount}</span>
              </div>
            )}
          </div>
        )}

        {/* Body List */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
              Loading email delivery logs...
            </div>
          ) : !history || history.deliveries.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
              <Mail size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#94a3b8' }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                No email dispatch records found
              </div>
              <p style={{ fontSize: '0.8125rem', maxWidth: 400, margin: '0 auto 16px', color: '#64748b' }}>
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
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  border:
                    item.status === 'SENT'
                      ? '1px solid #a7f3d0'
                      : item.status === 'FAILED'
                      ? '1px solid #fecaca'
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
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
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
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                        }}
                      >
                        <AlertTriangle size={13} />
                        <span>FAILED</span>
                      </span>
                    )}

                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
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
                        background: '#dc2626',
                        borderColor: '#dc2626',
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
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                    {item.subject}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
                    To: {item.recipientName} &lt;{item.recipientEmail}&gt; • Dispatched by {item.sentBy.name}
                  </div>
                </div>

                {/* Failure Reason Alert Callout */}
                {item.status === 'FAILED' && item.failureReason && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      fontSize: '0.75rem',
                      color: '#991b1b',
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
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#059669', fontWeight: 500 }}>
                      <Lock size={12} />
                      <span>Secure Candidate Portal Token Attached</span>
                    </div>

                    {item.hasPdfAttachment && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4f46e5', fontWeight: 500 }}>
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
                    color: '#64748b',
                    marginTop: 2,
                  }}
                >
                  <div>
                    <span>Attempted: </span>
                    <span style={{ color: '#0f172a', fontWeight: 500 }}>{formatTimestamp(item.attemptedAt)}</span>
                  </div>
                  {item.deliveredAt && (
                    <div>
                      <span>Delivered: </span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{formatTimestamp(item.deliveredAt)}</span>
                    </div>
                  )}
                  {item.failedAt && (
                    <div>
                      <span>Failed: </span>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatTimestamp(item.failedAt)}</span>
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
            background: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
