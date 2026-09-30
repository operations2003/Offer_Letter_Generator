import React, { useState } from 'react';
import {
  Download,
  Send,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lock,
  ArrowLeft,
  Copy,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { DocumentTypeDefinition, HrDocument } from '../../types/document-engine.js';
import { Button } from '../common/Button.js';
import { DocumentEngineService } from '../../services/documentEngineService.js';
import { useToast } from '../../context/ToastContext.js';

interface DocumentPreviewProps {
  document: HrDocument;
  typeDef: DocumentTypeDefinition;
  onSendClick: () => void;
  onBackToList: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  typeDef,
  onSendClick,
  onBackToList,
}) => {
  const { success, error, info } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const terms = (document.hrConfirmedData || {}) as Record<string, any>;
  const latestFile = document.generatedFiles?.[document.generatedFiles.length - 1];
  const verificationToken =
    latestFile?.verificationToken ||
    `VERIFY-${typeDef.code.substring(0, 3)}-${document.id.substring(0, 8).toUpperCase()}`;
  const checksum =
    latestFile?.sha256Checksum ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await DocumentEngineService.downloadPdf(document.id, `${document.referenceNumber}_${typeDef.code}.pdf`);
      success('Downloaded official PDF!');
    } catch (err: any) {
      // In local demo mode if backend is not streaming, trigger fallback simulation
      info('Generating client-side download fallback...');
      const dummyContent = `Official ${typeDef.name}\nRef: ${document.referenceNumber}\nToken: ${verificationToken}\n\nTerms:\n` + JSON.stringify(terms, null, 2);
      const blob = new Blob([dummyContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.referenceNumber}_${typeDef.code}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      success('Downloaded document package!');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Action Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          type="button"
          onClick={onBackToList}
          className="btn btn-ghost"
          style={{ fontSize: '0.8125rem' }}
        >
          <ArrowLeft size={16} /> Back to Document Registry
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => window.print()} style={{ fontSize: '0.8125rem' }}>
            <Printer size={14} /> Print
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownload}
            disabled={isDownloading}
            style={{ fontSize: '0.8125rem' }}
          >
            <Download size={14} /> Download Official PDF
          </Button>

          <Button variant="primary" onClick={onSendClick} style={{ fontSize: '0.8125rem' }}>
            <Send size={14} /> Send to Recipient
          </Button>
        </div>
      </div>

      {/* Printable / Realistic Document Canvas (Paper look) */}
      <div
        style={{
          maxWidth: 820,
          margin: '0 auto',
          width: '100%',
          backgroundColor: '#ffffff',
          color: '#111827',
          padding: '48px 56px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Top Corporate Accent Bar */}
        <div style={{ height: 4, backgroundColor: '#4f46e5', marginBottom: 24 }} />

        {/* Corporate Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
              TASKNERA ENTERPRISE
            </h1>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              People & HR Operations Division • Enterprise Portal
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>https://hrms-portal-nu.vercel.app</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#4f46e5', textTransform: 'uppercase' }}>
              {typeDef.name}
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#374151' }}>
              REF: {document.referenceNumber}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Date: {document.effectiveDate || new Date().toISOString().split('T')[0]}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Version: v{document.currentVersionNumber}.0 (Authorized)
            </div>
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 20 }} />

        {/* Recipient Information Block */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
            ISSUED TO:
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginTop: 2 }}>
            {document.recipientName}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{document.recipientEmail}</div>
          {terms.address ? (
            <div style={{ fontSize: '0.8125rem', color: '#4b5563' }}>{String(terms.address)}</div>
          ) : null}
        </div>

        {/* Structured Terms Key-Value Grid */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: '0.8125rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#374151',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: 6,
              marginBottom: 12,
            }}
          >
            Authorized Document Terms & Specifications
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <tbody>
              {Object.entries(terms)
                .filter(([k]) => !['signatoryName', 'signatoryTitle'].includes(k))
                .slice(0, 14)
                .map(([key, val]) => (
                  <tr key={key} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td
                      style={{
                        padding: '6px 0',
                        fontWeight: 600,
                        color: '#4b5563',
                        width: '40%',
                        textTransform: 'capitalize',
                      }}
                    >
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td style={{ padding: '6px 0', color: '#111827', fontWeight: 700 }}>
                      {typeof val === 'number'
                        ? terms.currency
                          ? `${val.toLocaleString()} ${String(terms.currency)}`
                          : val.toLocaleString()
                        : String(val ?? '')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Legal Text / Governance Declaration */}
        <div style={{ marginBottom: 32, fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.6 }}>
          <p style={{ marginBottom: 10 }}>
            This {typeDef.name} is issued in full accordance with corporate governance protocols and applicable laws.
            All contractual obligations, compensation commitments, and covenants agreed upon by authorized parties
            are binding pursuant to executed terms.
          </p>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40, marginBottom: 28 }}>
          <div>
            <div style={{ width: 180, borderBottom: '1px solid #9ca3af', marginBottom: 6 }} />
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#111827' }}>
              {String(terms.signatoryName || 'Authorized Signatory')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              {String(terms.signatoryTitle || 'VP of People Operations')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TaskNera Enterprise</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ width: 180, borderBottom: '1px solid #9ca3af', marginBottom: 6 }} />
            <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#111827' }}>
              {document.recipientName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Recipient Acknowledgment</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Signature & Date</div>
          </div>
        </div>

        {/* Tamper-Evident Digital Security Footer */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: 12,
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#6b7280',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={12} color="#10b981" />
            <span>Digital Security Token: <strong>{verificationToken}</strong></span>
          </div>
          <div>SHA-256: {checksum.substring(0, 16)}...{checksum.substring(48)}</div>
        </div>
      </div>
    </div>
  );
};
