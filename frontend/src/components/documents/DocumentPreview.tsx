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
  Building2,
  Calendar,
  Briefcase,
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

  const isCharacterCertificate =
    document.documentTypeCode === 'CERTIFICATE' ||
    document.templateId?.includes('character') ||
    document.title?.toLowerCase().includes('character');

  const isExperienceLetter =
    document.documentTypeCode === 'EXPERIENCE_LETTER' ||
    document.templateId?.includes('experience') ||
    document.title?.toLowerCase().includes('experience');

  const isOfferLetter =
    document.documentTypeCode === 'OFFER_LETTER' ||
    document.templateId?.includes('offer') ||
    document.title?.toLowerCase().includes('offer');

  // Shared / Document Variables
  const salutation = terms.salutation || 'Mr.';
  const fullName = terms.fullName || document.recipientName || 'Employee';
  const designation = terms.designation || 'Staff Member';
  const department = terms.department || 'Operations';
  const associationType = terms.associationType || 'employment';
  const startDate = terms.startDate || 'October 2, 2026';
  const endDate = terms.endDate || 'September 30, 2026';
  const statusMode = terms.statusMode || 'ended';
  const areaOfWork = terms.areaOfWork || 'talent acquisition, process automation, and HR operations';
  const responsibilityLevel = terms.responsibilityLevel || 'was responsible for';
  const keyResponsibilities =
    terms.keyResponsibilities ||
    'candidate sourcing, technical screening coordination, employee lifecycle maintenance, and compliance documentation';
  const demonstratedQualities =
    terms.demonstratedQualities ||
    'professionalism, sincerity, adaptability, willingness to learn, teamwork, and responsibility';
  const conductEvaluation = terms.conductEvaluation || 'satisfactory and professional';
  const characterTraits = terms.characterTraits || 'cooperative, respectful, and committed';
  const includeDisciplinaryClause = terms.includeDisciplinaryClause !== false;
  const futureEndeavours = terms.futureEndeavours || 'academic and professional';
  const issuanceReason =
    terms.issuanceReason ||
    (associationType === 'internship' ? 'completion/conclusion of his/her internship' : 'separation from employment');
  const referenceNumber = terms.referenceNumber || document.referenceNumber;
  const issueDate =
    terms.issueDate ||
    document.effectiveDate ||
    new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const place = terms.place || 'Delhi';
  const signatoryName = terms.signatoryName || document.signatoryName || 'Sheetal Bedi';
  const signatoryTitle =
    terms.signatoryTitle ||
    document.signatoryTitle ||
    (isExperienceLetter ? 'Chief Executive Officer' : 'CEO');

  const pronounHeShe = salutation === 'Ms.' || salutation === 'Mrs.' ? 'she' : 'he';
  const pronounHisHer = salutation === 'Ms.' || salutation === 'Mrs.' ? 'her' : 'his';
  const pronounHisHerCap = pronounHisHer.charAt(0).toUpperCase() + pronounHisHer.slice(1);
  const pronounHimHer = salutation === 'Ms.' || salutation === 'Mrs.' ? 'her' : 'him';
  const designationArticle = /^[aeiou]/i.test(designation.trim()) ? 'an' : 'a';

  // Isolated iframe print
  const printIframe = (elementId: string, docTitle: string) => {
    const el = window.document.getElementById(elementId);
    if (!el) {
      window.print();
      return;
    }

    const iframe = window.document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    window.document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 15mm 10mm 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #1e293b;
              font-family: "Times New Roman", Times, Georgia, serif;
              font-size: 10.5pt;
              line-height: 1.5;
            }
            #printable-character-certificate,
            .printable-character-sheet,
            #printable-experience-letter,
            .printable-experience-sheet {
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              min-height: auto !important;
              height: auto !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            p {
              margin: 0;
              text-align: justify;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          ${el.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        window.print();
      } finally {
        setTimeout(() => {
          if (window.document.body.contains(iframe)) {
            window.document.body.removeChild(iframe);
          }
        }, 2000);
      }
    }, 250);
  };

  const handleDownload = async () => {
    if (isCharacterCertificate) {
      printIframe(
        'printable-character-certificate',
        `TaskNera_Character_Certificate_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isExperienceLetter) {
      printIframe(
        'printable-experience-letter',
        `TaskNera_Experience_Letter_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    setIsDownloading(true);
    try {
      await DocumentEngineService.downloadPdf(document.id, `${document.referenceNumber}_${typeDef.code}.pdf`);
      success('Downloaded official PDF!');
    } catch (err: any) {
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (isCharacterCertificate) {
      printIframe(
        'printable-character-certificate',
        `TaskNera_Character_Certificate_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    if (isExperienceLetter) {
      printIframe(
        'printable-experience-letter',
        `TaskNera_Experience_Letter_${fullName.replace(/\s+/g, '_')}_${referenceNumber.replace(/[\/\\]/g, '_')}`
      );
      return;
    }

    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Action Toolbar */}
      <div
        className="glass-panel no-print"
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
          <Button variant="secondary" onClick={handlePrint} style={{ fontSize: '0.8125rem' }}>
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

      {/* DOCUMENT CANVAS */}
      {isCharacterCertificate ? (
        /* OFFICIAL TASKNERA CHARACTER CERTIFICATE */
        <div
          id="printable-character-certificate"
          className="printable-character-sheet"
          style={{
            maxWidth: 820,
            margin: '0 auto',
            width: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
            borderRadius: 8,
            padding: '40px 48px',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            color: '#1e293b',
            lineHeight: 1.55,
            fontSize: '0.9375rem',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header with Logo Left + Address Right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <img
                src="/logo.png"
                alt="TaskNera Logo"
                style={{ width: 48, height: 48, objectFit: 'contain' }}
              />
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                TaskNera
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                D-57 F1 Dilshad Colony, Shahdara, Delhi – 110095
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                Email: careers@tasknera.com
              </div>
            </div>
          </div>

          {/* Reference & Date */}
          <div style={{ marginBottom: 16, fontFamily: 'Arial, sans-serif', fontSize: '0.82rem', color: '#334155' }}>
            <div>
              <strong>Reference:</strong> {referenceNumber}
            </div>
            <div>
              <strong>Date:</strong> {issueDate}
            </div>
          </div>

          {/* Centered Document Title */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h1
              style={{
                margin: '0 0 4px',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '0.01em',
                fontFamily: '"Times New Roman", Times, serif',
              }}
            >
              Character Certificate
            </h1>
            <div
              style={{
                fontSize: '1rem',
                fontStyle: 'italic',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              To Whomsoever It May Concern
            </div>
          </div>

          {/* 8 Body Paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'justify' }}>
            <p style={{ margin: 0 }}>
              This is to certify that {salutation} {fullName} was associated with TaskNera HR Solutions as {designationArticle} {designation}, contributing to the {department}, from {startDate} to {endDate}.
            </p>

            <p style={{ margin: 0 }}>
              During the period of {pronounHisHer} {associationType}, {fullName} was part of the {department} and contributed to {areaOfWork} activities throughout {pronounHisHer} association with the organization.
            </p>

            <p style={{ margin: 0 }}>
              As part of the {department}, {pronounHeShe} {responsibilityLevel} {keyResponsibilities}, and supporting other {department} activities as assigned.
            </p>

            <p style={{ margin: 0 }}>
              Throughout {pronounHisHer} association with TaskNera HR Solutions, {fullName} demonstrated {demonstratedQualities} in carrying out {pronounHisHer} responsibilities.
            </p>

            <p style={{ margin: 0 }}>
              To the best of our knowledge, {pronounHisHer} conduct and character during the {associationType} period were {conductEvaluation}. We found {pronounHimHer} to be {characterTraits} to the responsibilities entrusted to {pronounHimHer}.
            </p>

            {includeDisciplinaryClause && (
              <p style={{ margin: 0 }}>
                No disciplinary action or complaint relating to misconduct was recorded against {pronounHimHer} during the period of association.
              </p>
            )}

            <p style={{ margin: 0 }}>
              We appreciate {pronounHisHer} contribution to the {department} function and wish {pronounHimHer} continued success and growth in {pronounHisHer} future {futureEndeavours} endeavours.
            </p>

            <p style={{ margin: 0 }}>
              This certificate is being issued upon {issuanceReason} with TaskNera HR Solutions.
            </p>
          </div>

          {/* Signatory Section */}
          <div style={{ marginTop: 24, display: 'inline-block' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 22 }}>
              For TaskNera HR Solutions
            </div>
            <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
              <div>Name: {signatoryName}</div>
              <div>Designation: {signatoryTitle}</div>
              <div>Date of Issue: {issueDate}</div>
              <div>Place: {place}</div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: 10,
              marginTop: 20,
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            TaskNera | Page 1 of 1
          </div>
        </div>
      ) : isExperienceLetter ? (
        /* OFFICIAL TASKNERA EXPERIENCE LETTER */
        <div
          id="printable-experience-letter"
          className="printable-experience-sheet"
          style={{
            maxWidth: 820,
            margin: '0 auto',
            width: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
            borderRadius: 8,
            padding: '40px 48px',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            color: '#1e293b',
            lineHeight: 1.55,
            fontSize: '0.9375rem',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Header with Logo Left + Address Right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <img
                src="/logo.png"
                alt="TaskNera Logo"
                style={{ width: 48, height: 48, objectFit: 'contain' }}
              />
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                TaskNera
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 2 }}>
                D-57 F1 Dilshad Colony, Shahdara, Delhi – 110095
              </div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                Email: careers@tasknera.com
              </div>
            </div>
          </div>

          {/* Reference & Date */}
          <div style={{ marginBottom: 16, fontFamily: 'Arial, sans-serif', fontSize: '0.82rem', color: '#334155' }}>
            <div>
              <strong>Reference:</strong> {referenceNumber}
            </div>
            <div>
              <strong>Date:</strong> {issueDate}
            </div>
          </div>

          {/* Centered Document Title */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h1
              style={{
                margin: '0 0 4px',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#0f172a',
                letterSpacing: '0.01em',
                fontFamily: '"Times New Roman", Times, serif',
              }}
            >
              Experience Letter
            </h1>
            <div
              style={{
                fontSize: '1rem',
                fontStyle: 'italic',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              To Whomsoever It May Concern
            </div>
          </div>

          {/* Body Paragraphs matching PDF template exactly */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, textAlign: 'justify' }}>
            <p style={{ margin: 0 }}>
              This is to certify that {salutation} {fullName} was associated with TaskNera HR Solutions as {designationArticle} {designation} from {startDate} to {endDate}.
            </p>

            <p style={{ margin: 0 }}>
              During {pronounHisHer} {associationType}, {pronounHeShe} was part of the {department} and contributed to {areaOfWork}-related activities throughout {pronounHisHer} association with the organization.
            </p>

            <p style={{ margin: 0 }}>
              As part of the {department}, {pronounHeShe} {responsibilityLevel} {keyResponsibilities}, and supporting other {department} activities as assigned.
            </p>

            <p style={{ margin: 0 }}>
              Throughout {pronounHisHer} association with TaskNera HR Solutions, {pronounHeShe} demonstrated {demonstratedQualities} in carrying out {pronounHisHer} responsibilities.
            </p>

            <p style={{ margin: 0 }}>
              {pronounHisHerCap} association with TaskNera HR Solutions {statusMode === 'ended' ? `ended on ${endDate}` : 'is continuing as on the date of this letter'}.
            </p>

            <p style={{ margin: 0 }}>
              We appreciate {pronounHisHer} contribution to the organization and wish {pronounHimHer} continued success and growth in all {pronounHisHer} future endeavours.
            </p>
          </div>

          {/* Signatory Section */}
          <div style={{ marginTop: 24, display: 'inline-block' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: 22 }}>
              For TaskNera HR Solutions
            </div>
            <div style={{ borderBottom: '1px solid #475569', width: 200, marginBottom: 6 }} />
            <div style={{ fontSize: '0.85rem', color: '#334155' }}>
              <div style={{ fontWeight: 600 }}>Authorized Signatory</div>
              <div>Name: {signatoryName}</div>
              <div>Designation: {signatoryTitle || 'Chief Executive Officer'}</div>
              <div>Date: {issueDate}</div>
              <div>Place: {place}</div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              paddingTop: 10,
              marginTop: 20,
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#94a3b8',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            TaskNera | Page 1 of 1
          </div>
        </div>
      ) : (
        /* STANDARD OR OTHER DOCUMENT CANVAS */
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
                  .filter(([k]) => !['signatoryName', 'signatoryTitle', 'parsedSections'].includes(k))
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
      )}
    </div>
  );
};
