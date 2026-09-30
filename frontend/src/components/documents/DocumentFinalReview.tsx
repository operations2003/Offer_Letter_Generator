import React from 'react';
import {
  FileText,
  User,
  Calendar,
  Building,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { DocumentTypeDefinition } from '../../types/document-engine.js';
import { Button } from '../common/Button.js';

interface DocumentFinalReviewProps {
  typeDef: DocumentTypeDefinition;
  formData: Record<string, any>;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const DocumentFinalReview: React.FC<DocumentFinalReviewProps> = ({
  typeDef,
  formData,
  onGenerate,
  isGenerating,
}) => {
  const sections = typeDef.sections || [];
  const allFields = [...(typeDef.requiredFields || []), ...(typeDef.optionalFields || [])];

  const recipientName =
    formData.candidateName ||
    formData.employeeName ||
    formData.contractorName ||
    formData.clientLegalName ||
    'Authorized Recipient';

  const recipientEmail =
    formData.email ||
    formData.clientContactEmail ||
    'recipient@example.com';

  const effectiveDate =
    formData.proposedJoiningDate ||
    formData.startDate ||
    formData.effectiveDate ||
    formData.settlementDate ||
    formData.officialRelievingDate ||
    new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 22,
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="hr-badge" style={{ fontSize: '0.7rem' }}>
              Final Pre-Generation Review
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
              Type: {typeDef.code}
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800 }}>
            {typeDef.name} for {recipientName}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Recipient: {recipientEmail} • Effective Date: {effectiveDate}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={onGenerate}
          disabled={isGenerating}
          style={{ fontSize: '0.9375rem', padding: '12px 24px', boxShadow: '0 4px 18px var(--primary-glow)' }}
        >
          {isGenerating ? 'Compiling Official PDF...' : 'Authorize & Generate Document'}
          {!isGenerating && <ArrowRight size={16} />}
        </Button>
      </div>

      {/* Structured Sections Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sections.map((sec) => {
          const secFields = allFields.filter((f) => (f.sectionKey || 'default') === sec.key);
          if (secFields.length === 0) return null;

          return (
            <div
              key={sec.key}
              className="glass-panel"
              style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}
            >
              <h4
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 18,
                    borderRadius: 3,
                    backgroundColor: 'var(--primary)',
                  }}
                />
                {sec.title}
              </h4>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 12,
                }}
              >
                {secFields.map((field) => {
                  const val = formData[field.key];
                  if (val === undefined || val === '') return null;

                  return (
                    <div
                      key={field.key}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                        {field.label}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: '#fff',
                          marginTop: 2,
                          wordBreak: 'break-word',
                        }}
                      >
                        {typeof val === 'boolean'
                          ? val ? 'Yes' : 'No'
                          : String(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal Non-Assumption & Signatory Attestation */}
      <div
        className="glass-panel"
        style={{
          padding: 18,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--hr-border)',
          background: 'rgba(16, 185, 129, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <ShieldCheck size={26} color="#34d399" />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#34d399' }}>
            HR & Legal Authorization Attestation
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            By clicking "Authorize & Generate Document", you certify that all information above has been thoroughly vetted
            and verified by authorized HR personnel. The resulting PDF document will be cryptographically hashed (SHA-256)
            and embedded with a tamper-evident digital verification token.
          </div>
        </div>
      </div>
    </div>
  );
};
