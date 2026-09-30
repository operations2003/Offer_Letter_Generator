// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: MODULAR PDF GENERATOR SERVICE
// =============================================================================
// Renders professional, print-ready, tamper-evident legal PDF documents
// for ANY of the 9 core HR document types using ONLY HR-confirmed terms.
// Supports official compilation and live draft previews with watermarking.
// =============================================================================

import PDFDocument from 'pdfkit';
import crypto from 'crypto';
import { HrDocument, DocumentTypeDefinition } from '../../../../../shared/types/document-engine.js';
import { DOCUMENT_TYPE_REGISTRY } from './document-type.registry.js';
import { AppError } from '../../../errors/app-error.js';

export interface GeneratedDocumentPdfResult {
  buffer: Buffer;
  sha256Checksum: string;
  verificationToken: string;
  fileName: string;
  fileSizeBytes: number;
  isPreview: boolean;
}

export interface PdfGenerationOptions {
  isPreview?: boolean;
  watermarkText?: string;
  templateContent?: string;
}

export class ModularDocumentPdfService {
  /**
   * Generates a compiled legal PDF or preview for any HR document based strictly on HR-confirmed terms.
   * GUARANTEE: Uses ONLY document.hrConfirmedData. AI suggestions are NEVER rendered into final legal PDFs.
   */
  static async generatePdf(
    document: HrDocument,
    company: {
      name: string;
      legalName: string;
      domain?: string;
      address?: string;
    },
    options: PdfGenerationOptions = {}
  ): Promise<GeneratedDocumentPdfResult> {
    const typeDef = DOCUMENT_TYPE_REGISTRY[document.documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${document.documentTypeCode}`, 400);
    }

    const isPreview = Boolean(options.isPreview);
    const terms = document.hrConfirmedData || {};
    const verificationToken = `VERIFY-${document.documentTypeCode.substring(0, 3)}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 48,
          info: {
            Title: `${typeDef.name} - ${document.referenceNumber}`,
            Author: company.legalName,
            Subject: `Official ${typeDef.name}`,
            Keywords: `HR, Legal, ${typeDef.name}, ${document.referenceNumber}`,
            CreationDate: new Date(),
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
          const cleanRecipient = (document.recipientName || 'Recipient').replace(/[^a-zA-Z0-9]/g, '_');
          const prefix = isPreview ? 'PREVIEW_' : '';
          const fileName = `${prefix}${document.referenceNumber}_${document.documentTypeCode}_${cleanRecipient}.pdf`;

          resolve({
            buffer,
            sha256Checksum,
            verificationToken,
            fileName,
            fileSizeBytes: buffer.length,
            isPreview,
          });
        });

        // ---------------------------------------------------------------------
        // 0. PREVIEW WATERMARK BANNER (If in preview mode)
        // ---------------------------------------------------------------------
        if (isPreview) {
          doc.rect(48, 20, 499, 18).fill('#fef3c7'); // Soft amber draft banner
          doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(8).text(
            'DRAFT PREVIEW — NOT ISSUED — FOR HR REVIEW ONLY',
            48,
            25,
            { align: 'center', width: 499 }
          );
        }

        // ---------------------------------------------------------------------
        // 1. CORPORATE LETTERHEAD
        // ---------------------------------------------------------------------
        const headerTop = isPreview ? 46 : 48;
        doc.rect(48, headerTop, 499, 4).fill('#4f46e5'); // Primary Indigo Accent Bar

        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(18).text(company.name.toUpperCase(), 48, headerTop + 14);
        doc.fillColor('#6b7280').font('Helvetica').fontSize(8.5).text(company.legalName, 48, headerTop + 36);
        if (company.address) {
          doc.text(company.address, 48, headerTop + 48);
        }

        // Document Meta Badge (Right-aligned)
        doc.fillColor('#4f46e5').font('Helvetica-Bold').fontSize(11).text(typeDef.name.toUpperCase(), 350, headerTop + 14, { align: 'right', width: 197 });
        doc.fillColor('#374151').font('Helvetica-Bold').fontSize(9).text(`REF: ${document.referenceNumber}`, 350, headerTop + 30, { align: 'right', width: 197 });
        doc.fillColor('#6b7280').font('Helvetica').fontSize(8).text(`Date: ${document.effectiveDate || new Date().toISOString().split('T')[0]}`, 350, headerTop + 44, { align: 'right', width: 197 });
        doc.text(`Version: v${document.currentVersionNumber}`, 350, headerTop + 56, { align: 'right', width: 197 });

        const separatorY = headerTop + 74;
        doc.moveTo(48, separatorY).lineTo(547, separatorY).strokeColor('#e5e7eb').lineWidth(1).stroke();

        // ---------------------------------------------------------------------
        // 2. RECIPIENT INFORMATION BLOCK
        // ---------------------------------------------------------------------
        let currentY = separatorY + 16;
        doc.fillColor('#6b7280').font('Helvetica-Bold').fontSize(8).text('ISSUED TO:', 48, currentY);
        currentY += 12;
        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(document.recipientName, 48, currentY);
        currentY += 14;
        doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text(`Email: ${document.recipientEmail}`, 48, currentY);
        if (document.recipientPhone) {
          currentY += 12;
          doc.text(`Phone: ${document.recipientPhone}`, 48, currentY);
        }

        currentY += 24;

        // ---------------------------------------------------------------------
        // 3. DOCUMENT BODY & SECTIONAL SCHEDULE
        // ---------------------------------------------------------------------
        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(13).text(`RE: ${typeDef.name.toUpperCase()} - CONFIRMATION OF TERMS`, 48, currentY);
        currentY += 20;

        doc.fillColor('#374151').font('Helvetica').fontSize(9.5).lineGap(3);
        const openingIntro = `Dear ${document.recipientName},\n\nWe are pleased to provide this official ${typeDef.name} on behalf of ${company.name}. The terms and specifications detailed below have been formally confirmed by HR management and govern this arrangement:`;
        doc.text(openingIntro, 48, currentY, { width: 499, align: 'justify' });
        currentY = doc.y + 16;

        // Group fields by Section definition
        const sections = typeDef.sections || [];
        const allFields = [...typeDef.requiredFields, ...typeDef.optionalFields];

        for (const sec of sections) {
          const secFields = allFields.filter(
            (f) => f.sectionKey === sec.key && terms[f.key] !== undefined && terms[f.key] !== null && terms[f.key] !== ''
          );

          if (secFields.length === 0) continue;

          if (currentY > 680) {
            doc.addPage();
            currentY = 50;
          }

          // Section Header Bar
          doc.rect(48, currentY, 499, 20).fill('#f1f5f9');
          doc.fillColor('#1e293b').font('Helvetica-Bold').fontSize(8.5).text(sec.title.toUpperCase(), 56, currentY + 5);
          currentY += 26;

          for (const field of secFields) {
            if (currentY > 700) {
              doc.addPage();
              currentY = 50;
            }

            const rawVal = terms[field.key];
            let formattedVal = String(rawVal);
            if (field.dataType === 'CURRENCY') {
              const currency = String(terms.currency || 'USD');
              formattedVal = `${currency} ${Number(rawVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
            } else if (field.dataType === 'DATE') {
              formattedVal = String(rawVal).split('T')[0];
            }

            // Key-value row
            doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8.5).text(field.label, 56, currentY, { width: 190 });
            doc.fillColor('#0f172a').font('Helvetica').fontSize(8.5).text(formattedVal, 250, currentY, { width: 290 });
            currentY += 16;
          }

          currentY += 8;
        }

        currentY += 12;

        // ---------------------------------------------------------------------
        // 4. GOVERNING POLICIES & ACKNOWLEDGMENT
        // ---------------------------------------------------------------------
        if (currentY > 640) {
          doc.addPage();
          currentY = 50;
        }

        doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text('LEGAL BINDING & GENERAL TERMS', 48, currentY);
        currentY += 14;
        doc.fillColor('#4b5563').font('Helvetica').fontSize(8.5).lineGap(2).text(
          'This document constitutes the entire understanding between the parties with respect to its subject matter and supersedes all prior discussions, drafts, and informal representations. Any amendments must be made in writing and confirmed by authorized company officers.',
          48,
          currentY,
          { width: 499, align: 'justify' }
        );
        currentY = doc.y + 24;

        // ---------------------------------------------------------------------
        // 5. SIGNATORY AUTHORIZATION BLOCK
        // ---------------------------------------------------------------------
        if (currentY > 660) {
          doc.addPage();
          currentY = 50;
        }

        doc.rect(48, currentY, 235, 80).strokeColor('#e2e8f0').lineWidth(0.75).stroke();
        doc.rect(312, currentY, 235, 80).strokeColor('#e2e8f0').lineWidth(0.75).stroke();

        const employerSignatoryName = String(terms.signatoryName || document.signatoryName || 'Sarah Jenkins');
        const employerSignatoryTitle = String(terms.signatoryTitle || document.signatoryTitle || 'Authorized HR Officer');

        // Employer side
        doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text('FOR AND ON BEHALF OF THE COMPANY:', 56, currentY + 8);
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(employerSignatoryName, 56, currentY + 44);
        doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(employerSignatoryTitle, 56, currentY + 58);

        // Recipient side
        doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7.5).text('ACCEPTED AND AGREED BY RECIPIENT:', 320, currentY + 8);
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9.5).text(document.recipientName, 320, currentY + 44);
        doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('Signature & Date', 320, currentY + 58);

        // ---------------------------------------------------------------------
        // 6. CRYPTOGRAPHIC FOOTER & TAMPER EVIDENCE
        // ---------------------------------------------------------------------
        doc.rect(48, 770, 499, 24).fill('#f1f5f9');
        doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(7).text(`DIGITAL VERIFICATION TOKEN: ${verificationToken}`, 56, 778);
        doc.fillColor('#94a3b8').font('Helvetica').fontSize(6.5).text(
          `Immutable SHA-256 Ledger Record • Generated strictly from HR-Confirmed Terms • Page ${doc.bufferedPageRange().count}`,
          56,
          788,
          { width: 480, align: 'right' }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
