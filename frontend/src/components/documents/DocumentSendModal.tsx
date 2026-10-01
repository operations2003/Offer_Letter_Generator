import React, { useState } from 'react';
import { Mail, Send, X, CheckCircle2, FileText, Lock } from 'lucide-react';
import { HrDocument, DocumentTypeDefinition } from '../../types/document-engine.js';
import { Button } from '../common/Button.js';
import { useToast } from '../../context/ToastContext.js';

interface DocumentSendModalProps {
  document: HrDocument;
  typeDef: DocumentTypeDefinition;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export const DocumentSendModal: React.FC<DocumentSendModalProps> = ({
  document,
  typeDef,
  isOpen,
  onClose,
  onSent,
}) => {
  const { success } = useToast();
  const [recipientEmail, setRecipientEmail] = useState(document.recipientEmail || '');
  const [subject, setSubject] = useState(
    `Official ${typeDef.name} — ${document.referenceNumber} [TaskNera Enterprise]`
  );
  const [message, setMessage] = useState(
    `Dear ${document.recipientName},\n\nPlease find attached your official ${typeDef.name} (${document.referenceNumber}) issued by TaskNera Enterprise Corp.\n\nKindly review and sign where indicated.\n\nSincerely,\nPeople & HR Operations`
  );
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      success(`Dispatched ${typeDef.name} to ${recipientEmail}! Status updated to ISSUED.`);
      onSent();
      onClose();
    }, 800);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 540,
          borderRadius: 'var(--radius-xl)',
          padding: 24,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main, #0f172a)', fontWeight: 700 }}>
                Dispatch {typeDef.name}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                REF: {document.referenceNumber}
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        <div className="form-group">
          <label className="form-label">Recipient Email</label>
          <input
            type="email"
            className="form-input"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subject Line</label>
          <input
            type="text"
            className="form-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message Body</label>
          <textarea
            className="form-textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ fontSize: '0.8125rem' }}
          />
        </div>

        {/* Attachment Pill */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-main, #0f172a)', fontWeight: 600 }}>
              {document.referenceNumber}_{typeDef.code}.pdf
            </span>
          </div>
          <span className="hr-badge" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
            <Lock size={10} /> Tamper-Evident SHA-256
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button variant="secondary" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={isSending || !recipientEmail}>
            {isSending ? 'Sending...' : 'Send Official Document'}
            {!isSending && <Send size={14} />}
          </Button>
        </div>
      </div>
    </div>
  );
};
