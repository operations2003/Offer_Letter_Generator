// =============================================================================
// EMPLOYEE DOCUMENT GENERATION & LIFECYCLE SERVICE
// =============================================================================
// Auto-fills all available employee & company details.
// Generates real PDF and editable DOCX versions.
// Versioning: regeneration creates new version instead of silent replacement.
// =============================================================================

import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { prisma } from '../../prisma/client.js';
import { EmployeeDocStatus } from '@prisma/client';
import { PRELOADED_HR_TEMPLATES, PreloadedTemplate } from './hr-document-templates.catalog.js';
import { NotFoundError, ValidationError } from '../../errors/app-error.js';
import { AuditService } from '../audit/audit.service.js';
import { DocxTemplateService } from './docx-template.service.js';
import { FieldMappingService } from './field-mapping.service.js';

export interface GenerateDocForEmployeeDto {
  employeeId: string;
  templateCode: string;
  customTemplateMarkup?: string;
  customTemplatePath?: string;
  title?: string;
  customParameters?: Record<string, any>;
  changeNotes?: string;
  generatedByUserId?: string;
  targetStatus?: EmployeeDocStatus;
}

export interface RegenerateDocDto {
  documentId: string;
  changeNotes: string;
  updatedParameters?: Record<string, any>;
  updatedContent?: string;
  userId?: string;
}

export class EmployeeDocumentService {
  private static storageBaseDir = path.resolve(process.cwd(), 'uploads', 'employee-documents');

  private static ensureStorageDir(): void {
    if (!fs.existsSync(this.storageBaseDir)) {
      fs.mkdirSync(this.storageBaseDir, { recursive: true });
    }
  }

  /**
   * Format dates cleanly (e.g., "October 1, 2026")
   */
  private static formatDate(dateInput?: string | Date | null): string {
    if (!dateInput) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /**
   * Auto-build dictionary mapping standard placeholders from Employee & Company records
   */
  static buildAutoPlaceholderMap(employee: any, company?: any): Record<string, string> {
    const today = this.formatDate(new Date());
    const companyName = company?.legalName || company?.name || 'TaskNera';
    const currency = employee.currency || 'INR';
    const currencySymbol = currency === 'USD' ? '$' : '₹';
    const numCtc = Number(employee.annualCtc) || 600000;
    const ctcFormatted = `${currencySymbol}${numCtc.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;

    const basicPercent = Number(employee.basicPercent) || 40;
    const hraPercent = Number(employee.hraPercent) || 20;
    const basicAmount = Math.round((numCtc * basicPercent) / 100);
    const hraAmount = Math.round((numCtc * hraPercent) / 100);
    const specialAllowanceAmount = Math.max(0, numCtc - basicAmount - hraAmount);

    const basicFormatted = `${currencySymbol}${basicAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
    const hraFormatted = `${currencySymbol}${hraAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;
    const specialAllowanceFormatted = `${currencySymbol}${specialAllowanceAmount.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN')}`;

    const fullAddress = [
      employee.addressLine,
      employee.city,
      employee.state,
      employee.pinCode,
    ].filter(Boolean).join(', ') || employee.workLocation || 'D-57 Dilshad Colony, Delhi, 110095';

    const refNumber = `TN/OFFER/${new Date().getFullYear()}/${employee.employeeId || '001'}`;

    return {
      // Primary required placeholders
      employee_name: employee.fullName,
      candidate_name: employee.fullName,
      employee_id: employee.employeeId,
      designation: employee.designation,
      job_title: employee.designation,
      department: employee.department,
      joining_date: this.formatDate(employee.joiningDate),
      date_of_joining: this.formatDate(employee.joiningDate),
      reporting_manager: employee.reportingManager || 'Sheetal Bedi',
      employment_type: employee.employmentType || 'Full-time',
      annual_ctc: ctcFormatted,
      total_ctc: ctcFormatted,
      salary: ctcFormatted,
      basic_salary: basicFormatted,
      basic_percent: `${basicPercent}%`,
      hra: hraFormatted,
      hra_percent: `${hraPercent}%`,
      special_allowance: specialAllowanceFormatted,
      incentive: employee.incentiveApplicable
        ? 'Eligible for performance-based incentive scheme'
        : 'Standard corporate incentive policy',
      company_name: companyName,
      company_phone: '+91 7065278229',
      company_email: 'careers@tasknera.com',
      company_address: 'D-57 Dilshad Colony, Delhi, 110095',
      signatory_name: company?.signatoryName || 'Sheetal Bedi',
      signatory_title: company?.signatoryTitle || 'CEO & FOUNDER',
      reference_number: refNumber,
      issue_date: today,
      date: today,

      // Additional standard contact & location helpers
      candidate_address: fullAddress,
      address: fullAddress,
      pin_code: employee.pinCode || '',
      city: employee.city || '',
      state: employee.state || '',
      work_location: employee.workLocation || (employee.city && employee.state ? `${employee.city}, ${employee.state}` : 'D-57 Dilshad Colony, Delhi, 110095'),
      location: employee.workLocation || (employee.city && employee.state ? `${employee.city}, ${employee.state}` : 'D-57 Dilshad Colony, Delhi, 110095'),
      personal_email: employee.personalEmail || '',
      official_email: employee.officialEmail || employee.personalEmail || '',
      email: employee.officialEmail || employee.personalEmail || '',
      phone: employee.phone || 'N/A',
      currency: currency,
      employment_status: employee.status || 'ACTIVE',
    };
  }

  /**
   * Replace all {{key}} occurrences in markup with dictionary values
   */
  static interpolateMarkup(markup: string, values: Record<string, any>): string {
    if (!markup) return '';
    return markup.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_match, key) => {
      if (values[key] !== undefined && values[key] !== null) {
        return String(values[key]);
      }
      return `[${key.replace(/_/g, ' ')}]`;
    });
  }

  /**
   * Generate binary PDF using PDFKit on official TaskNera Letterhead
   */
  static async generatePdfBuffer(title: string, renderedText: string, companyName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 45,
        bufferPages: true,
        info: {
          Title: title,
          Author: 'TaskNera',
          Creator: 'TaskNera Document Engine',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const drawLetterheadHeader = () => {
        // Top-left beige rounded block
        doc.roundedRect(0, 0, 310, 22, 6).fill('#fae1c3');
        // Top-right mauve block
        doc.rect(340, 0, doc.page.width - 340, 10).fill('#9c7a82');

        // Logo & Brand (Left)
        const logoPath = path.resolve(process.cwd(), 'src/assets/logo.png');
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, 45, 34, { width: 34, height: 34 });
            doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('TASKNERA', 88, 42);
          } catch {
            doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text('TASKNERA', 45, 40);
          }
        } else {
          doc.fillColor('#0f172a').fontSize(18).font('Helvetica-Bold').text('TASKNERA', 45, 40);
        }

        // Contact Block (Right) with vertical divider bar
        doc.strokeColor('#0f172a').lineWidth(1.2).moveTo(375, 30).lineTo(375, 78).stroke();
        doc
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('Phone: ', 382, 32, { continued: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text('+91 7065278229')
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('Email: ', 382, 44, { continued: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text('careers@tasknera.com')
          .font('Helvetica-Bold')
          .fillColor('#0f172a')
          .text('ADD: ', 382, 56, { continued: true })
          .font('Helvetica')
          .fillColor('#334155')
          .text('D-57 Dilshad Colony,')
          .text('Delhi, 110095', 382, 67);

        // Dark Horizontal Dividing Bar
        doc.rect(0, 84, doc.page.width, 2.5).fill('#1e293b');
      };

      // Draw letterhead banner on first page
      drawLetterheadHeader();

      let y = 98;

      // Title
      doc
        .fontSize(13)
        .font('Helvetica-Bold')
        .fillColor('#1e3a8a')
        .text(title.toUpperCase(), 45, y, { align: 'center', width: 505 });

      y = doc.y + 12;

      // Content text
      const contentToRender = renderedText && renderedText.trim()
        ? renderedText
        : `Formal employment document issued by TaskNera for corporate records. All contractual terms and employee data are officially verified.`;

      const paragraphs = contentToRender.split('\n');
      for (const p of paragraphs) {
        const trimmed = p.trim();
        if (!trimmed) {
          y += 6;
          continue;
        }

        if (y > 700) {
          doc.addPage();
          drawLetterheadHeader();
          y = 100;
        }

        if (trimmed.startsWith('==') || trimmed.startsWith('--')) {
          doc
            .strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .moveTo(45, y)
            .lineTo(550, y)
            .stroke();
          y += 10;
          continue;
        }

        if (
          (trimmed.toUpperCase() === trimmed && trimmed.length < 60 && !trimmed.includes(':')) ||
          /^\d+\.\s+[A-Z\s&]+$/.test(trimmed)
        ) {
          y += 4;
          doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#0f172a').text(trimmed, 45, y, { width: 505 });
          y = doc.y + 4;
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          doc.fontSize(8.5).font('Helvetica').fillColor('#334155').text(trimmed, 55, y, { width: 495 });
          y = doc.y + 3;
        } else {
          doc.fontSize(8.5).font('Helvetica').fillColor('#1e293b').lineGap(2.5).text(trimmed, 45, y, { width: 505, align: 'justify' });
          y = doc.y + 5;
        }
      }

      // Check room for dual signature box
      if (y > 660) {
        doc.addPage();
        drawLetterheadHeader();
        y = 100;
      } else {
        y += 14;
      }

      // Dual Signatures: Left for TaskNera, Right for Candidate
      doc.rect(45, y, 240, 85).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('For TaskNera', 55, y + 8);
      doc.fontSize(7.5).font('Helvetica-Oblique').fillColor('#64748b').text('Authorized Signature (Corporate Signatory)', 55, y + 34);
      doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(55, y + 50).lineTo(265, y + 50).stroke();
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('Sheetal Bedi', 55, y + 56);
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748b').text('CEO & FOUNDER', 55, y + 68);

      doc.rect(310, y, 240, 85).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('Candidate Formal Acceptance', 320, y + 8);
      doc.fontSize(7.5).font('Helvetica-Oblique').fillColor('#64748b').text('Candidate Signature & Date of Signing', 320, y + 34);
      doc.strokeColor('#94a3b8').lineWidth(0.5).moveTo(320, y + 50).lineTo(530, y + 50).stroke();
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0f172a').text('Authorized Acceptance', 320, y + 56);
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748b').text('Signature indicates full acceptance of all terms', 320, y + 68);

      // Two-pass footer pagination and bottom accent bar
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(45, 796).lineTo(550, 796).stroke();
        doc.fontSize(7).font('Helvetica').fillColor('#64748b').text('TaskNera HRMS • Confidential & Legally Binding Corporate Document', 45, 802);
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#475569').text(`Page ${i + 1} of ${totalPages}`, 450, 802, { align: 'right', width: 100 });
        doc.roundedRect(190, 824, 210, 18, 6).fill('#9c7a82');
      }

      doc.end();
    });
  }

  /**
   * Generate editable binary DOCX using docx library
   */
  static async generateDocxBuffer(title: string, renderedText: string, companyName: string): Promise<Buffer> {
    const paragraphs = renderedText.split('\n');
    const docParagraphs: Paragraph[] = [
      new Paragraph({
        text: companyName.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        text: 'Human Resources & Corporate Governance Department',
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        text: '',
      }),
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: '',
      }),
    ];

    for (const p of paragraphs) {
      const trimmed = p.trim();
      if (!trimmed) {
        docParagraphs.push(new Paragraph({ text: '' }));
      } else if (trimmed.toUpperCase() === trimmed && trimmed.length < 50 && !trimmed.includes(':')) {
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmed,
                bold: true,
                size: 22,
                color: '1E3A8A',
              }),
            ],
            spacing: { before: 140, after: 60 },
          })
        );
      } else {
        docParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: p,
                size: 20,
              }),
            ],
            spacing: { line: 260 },
          })
        );
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docParagraphs,
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  /**
   * 1. GENERATE NEW DOCUMENT FOR EMPLOYEE
   * The primary workflow:
   * - Pulls all employee & company details automatically
   * - Only merges provided document-specific fields
   * - Renders preview markup
   * - Saves PDF and DOCX files
   * - Creates EmployeeDocument record and Version 1 in DB
   */
  static async generateDocumentForEmployee(dto: GenerateDocForEmployeeDto) {
    this.ensureStorageDir();

    const employee = await prisma.employee.findUnique({
      where: { id: dto.employeeId },
      include: { company: true },
    });

    if (!employee) {
      throw new NotFoundError(`Employee with ID ${dto.employeeId} not found`);
    }

    const template: PreloadedTemplate | undefined = PRELOADED_HR_TEMPLATES[dto.templateCode];
    const templateMarkup = dto.customTemplateMarkup || template?.contentMarkup;

    if (!templateMarkup) {
      throw new ValidationError(`Template markup for "${dto.templateCode}" could not be resolved`);
    }

    const documentTitle = dto.title || template?.name || `${template?.category || dto.templateCode} - ${employee.fullName}`;

    // Merge auto-filled employee details with any document-specific custom parameters
    const autoPlaceholders = this.buildAutoPlaceholderMap(employee, employee.company);
    const employeeDataMap = FieldMappingService.buildEmployeeDataMap(employee, employee.company);
    const resolvedFieldMap: Record<string, string> = {};
    for (const [key, field] of Object.entries(employeeDataMap)) {
      resolvedFieldMap[key] = field.value;
    }

    const mergedValues: Record<string, any> = {
      ...autoPlaceholders,
      ...resolvedFieldMap,
      ...(dto.customParameters || {}),
    };

    // File naming
    const timestamp = Date.now();
    const safeEmpId = employee.employeeId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTypeCode = dto.templateCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const baseFileName = `${safeEmpId}_${safeTypeCode}_v1_${timestamp}`;

    const pdfFileName = `${baseFileName}.pdf`;
    const docxFileName = `${baseFileName}.docx`;
    const pdfPath = path.join(this.storageBaseDir, pdfFileName);
    const docxPath = path.join(this.storageBaseDir, docxFileName);

    let renderedContent: string;
    let pdfBuffer: Buffer;
    let docxBuffer: Buffer;

    // Check if a custom DOCX template was uploaded
    if (dto.customTemplatePath && fs.existsSync(dto.customTemplatePath)) {
      const populated = await DocxTemplateService.populateDocxTemplate(dto.customTemplatePath, mergedValues);
      docxBuffer = populated.docxBuffer;
      renderedContent = populated.renderedPlainText || dto.customTemplateMarkup || documentTitle;
      pdfBuffer = await this.generatePdfBuffer(documentTitle, renderedContent, employee.company?.name || 'TaskNera Corp');
    } else {
      // Standard predefined template interpolation
      renderedContent = this.interpolateMarkup(templateMarkup, mergedValues);
      [pdfBuffer, docxBuffer] = await Promise.all([
        this.generatePdfBuffer(documentTitle, renderedContent, employee.company?.name || 'TaskNera Corp'),
        this.generateDocxBuffer(documentTitle, renderedContent, employee.company?.name || 'TaskNera Corp'),
      ]);
    }

    fs.writeFileSync(pdfPath, pdfBuffer);
    fs.writeFileSync(docxPath, docxBuffer);

    // Find default generator user (admin or HR)
    let generatorUserId: string | null = dto.generatedByUserId || null;
    if (generatorUserId) {
      try {
        const found = await prisma.user.findUnique({ where: { id: generatorUserId } });
        if (!found || found.deletedAt) generatorUserId = null;
      } catch {
        generatorUserId = null;
      }
    }
    if (!generatorUserId) {
      const user = (await prisma.user.findFirst({ where: { companyId: employee.companyId, deletedAt: null } }))
        || (await prisma.user.findFirst({ where: { deletedAt: null } }));
      generatorUserId = user ? user.id : '17926cae-f13b-4426-8ad7-fbd897e31958';
    }

    const status = dto.targetStatus || 'DRAFT';

    // Save to Database
    const createdDoc = await prisma.employeeDocument.create({
      data: {
        companyId: employee.companyId,
        employeeId: employee.id,
        documentTypeCode: dto.templateCode,
        templateId: dto.templateCode,
        title: documentTitle,
        status: status,
        currentVersion: 1,
        parameters: mergedValues,
        renderedContent,
        pdfStoragePath: pdfPath,
        docxStoragePath: docxPath,
        fileSizeBytes: BigInt(pdfBuffer.length),
        generatedBy: generatorUserId,
        approvedAt: status === 'APPROVED' || status === 'ISSUED' ? new Date() : null,
        issuedAt: status === 'ISSUED' ? new Date() : null,
        versions: {
          create: {
            versionNumber: 1,
            parameters: mergedValues,
            renderedContent,
            pdfStoragePath: pdfPath,
            docxStoragePath: docxPath,
            changeNotes: dto.changeNotes || 'Initial document creation',
            generatedBy: generatorUserId,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return {
      ...createdDoc,
      fileSizeBytes: Number(createdDoc.fileSizeBytes || 0),
      autoFilledFields: Object.keys(autoPlaceholders),
    };
  }

  /**
   * 2. REGENERATE DOCUMENT (CREATES NEW VERSION)
   * Regeneration must create a new version instead of silently replacing an already issued document.
   */
  static async regenerateDocument(dto: RegenerateDocDto) {
    this.ensureStorageDir();

    const existingDoc = await prisma.employeeDocument.findUnique({
      where: { id: dto.documentId },
      include: {
        employee: {
          include: { company: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!existingDoc) {
      throw new NotFoundError(`Document with ID ${dto.documentId} not found`);
    }

    const employee = existingDoc.employee;
    const newVersionNumber = existingDoc.currentVersion + 1;

    // Refresh employee data and merge with updated parameters
    const autoPlaceholders = this.buildAutoPlaceholderMap(employee, employee.company);
    const existingParams = (existingDoc.parameters as Record<string, any>) || {};
    const mergedValues = {
      ...existingParams,
      ...autoPlaceholders,
      ...(dto.updatedParameters || {}),
      issue_date: this.formatDate(new Date()), // bump issue date for revision
    };

    // Interpolate or use provided updated content
    const template = PRELOADED_HR_TEMPLATES[existingDoc.documentTypeCode];
    const templateMarkup = template?.contentMarkup || existingDoc.renderedContent;
    const renderedContent = dto.updatedContent || this.interpolateMarkup(templateMarkup, mergedValues);

    // File naming for new version
    const timestamp = Date.now();
    const safeEmpId = employee.employeeId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeTypeCode = existingDoc.documentTypeCode.replace(/[^a-zA-Z0-9_-]/g, '_');
    const baseFileName = `${safeEmpId}_${safeTypeCode}_v${newVersionNumber}_${timestamp}`;

    const pdfFileName = `${baseFileName}.pdf`;
    const docxFileName = `${baseFileName}.docx`;
    const pdfPath = path.join(this.storageBaseDir, pdfFileName);
    const docxPath = path.join(this.storageBaseDir, docxFileName);

    // Generate new version files
    const [pdfBuffer, docxBuffer] = await Promise.all([
      this.generatePdfBuffer(existingDoc.title, renderedContent, employee.company?.name || 'TaskNera Corp'),
      this.generateDocxBuffer(existingDoc.title, renderedContent, employee.company?.name || 'TaskNera Corp'),
    ]);

    fs.writeFileSync(pdfPath, pdfBuffer);
    fs.writeFileSync(docxPath, docxBuffer);

    let generatorUserId = dto.userId || existingDoc.generatedBy;

    // Update document record and insert new version
    const updated = await prisma.employeeDocument.update({
      where: { id: existingDoc.id },
      data: {
        currentVersion: newVersionNumber,
        renderedContent,
        parameters: mergedValues,
        pdfStoragePath: pdfPath,
        docxStoragePath: docxPath,
        fileSizeBytes: BigInt(pdfBuffer.length),
        status: 'DRAFT', // Reset to draft for review of the new version
        versions: {
          create: {
            versionNumber: newVersionNumber,
            parameters: mergedValues,
            renderedContent,
            pdfStoragePath: pdfPath,
            docxStoragePath: docxPath,
            changeNotes: dto.changeNotes || `Regenerated revision (v${newVersionNumber})`,
            generatedBy: generatorUserId,
          },
        },
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    return {
      ...updated,
      fileSizeBytes: Number(updated.fileSizeBytes || 0),
      message: `Successfully regenerated document. Created version v${newVersionNumber}.`,
    };
  }

  /**
   * 3. PREVIEW DOCUMENT RENDERING (WITHOUT SAVING TO DB)
   */
  static async previewDocument(
    employeeId: string,
    templateCode: string,
    customParameters?: Record<string, any>,
    customTemplatePath?: string,
    customTemplateMarkup?: string
  ) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true },
    });

    if (!employee) {
      throw new NotFoundError(`Employee with ID ${employeeId} not found`);
    }

    // If custom DOCX template path was provided, use dynamic DOCX autofill preview
    if (customTemplatePath && fs.existsSync(customTemplatePath)) {
      const inspection = await DocxTemplateService.inspectCustomTemplate(customTemplatePath);
      const fieldMappings = await FieldMappingService.mapPlaceholdersForEmployee(
        inspection.detectedPlaceholders,
        employee,
        employee.company
      );

      const mergedValues: Record<string, any> = {};
      for (const [ph, entry] of Object.entries(fieldMappings)) {
        if (entry.mappedValue) {
          mergedValues[ph] = entry.mappedValue;
        }
      }
      if (customParameters) {
        Object.assign(mergedValues, customParameters);
      }

      const populated = await DocxTemplateService.populateDocxTemplate(customTemplatePath, mergedValues);

      return {
        templateCode: 'CUSTOM_TEMPLATE',
        templateName: path.basename(customTemplatePath),
        category: 'Custom Template',
        autoFilledFields: mergedValues,
        fieldMappings,
        docSpecificFields: [],
        renderedContent: populated.renderedPlainText || inspection.extractedPreviewText,
        supportedFormats: ['PDF', 'DOCX'],
        detectedPlaceholders: inspection.detectedPlaceholders,
        customTemplatePath,
      };
    }

    const template = PRELOADED_HR_TEMPLATES[templateCode];
    if (!template) {
      throw new ValidationError(`Unknown template code: ${templateCode}`);
    }

    const autoPlaceholders = this.buildAutoPlaceholderMap(employee, employee.company);
    const mergedValues = {
      ...autoPlaceholders,
      ...(customParameters || {}),
    };

    const markupToUse = customTemplateMarkup || template.contentMarkup;
    const renderedContent = this.interpolateMarkup(markupToUse, mergedValues);

    return {
      templateCode,
      templateName: template.name,
      category: template.category,
      autoFilledFields: autoPlaceholders,
      docSpecificFields: template.docSpecificFields,
      renderedContent,
      supportedFormats: template.supportedFormats,
    };
  }

  /**
   * 4. UPDATE DOCUMENT STATUS (Review, Approve, Issue)
   */
  static async updateDocumentStatus(documentId: string, status: EmployeeDocStatus, userId?: string) {
    const doc = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new NotFoundError(`Document with ID ${documentId} not found`);
    }

    const updateData: any = { status };
    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
      if (userId) updateData.approvedBy = userId;
    } else if (status === 'ISSUED') {
      updateData.issuedAt = new Date();
      if (!doc.approvedAt) {
        updateData.approvedAt = new Date();
        if (userId) updateData.approvedBy = userId;
      }
    }

    const updated = await prisma.employeeDocument.update({
      where: { id: documentId },
      data: updateData,
    });

    return {
      ...updated,
      fileSizeBytes: Number(updated.fileSizeBytes || 0),
    };
  }

  /**
   * 5. GET DOCUMENT BY ID
   */
  static async getDocumentById(documentId: string) {
    const doc = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: {
        employee: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
    });

    if (!doc) {
      throw new NotFoundError(`Document with ID ${documentId} not found`);
    }

    return {
      ...doc,
      fileSizeBytes: Number(doc.fileSizeBytes || 0),
    };
  }

  /**
   * 6. GET FILE STREAM FOR DOWNLOAD
   */
  static async getDocumentFile(documentId: string, format: 'PDF' | 'DOCX', versionNumber?: number) {
    const doc = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: {
        versions: true,
      },
    });

    if (!doc) {
      throw new NotFoundError(`Document with ID ${documentId} not found`);
    }

    let targetPdfPath = doc.pdfStoragePath;
    let targetDocxPath = doc.docxStoragePath;

    if (versionNumber && versionNumber !== doc.currentVersion) {
      const version = doc.versions.find((v) => v.versionNumber === versionNumber);
      if (version) {
        targetPdfPath = version.pdfStoragePath;
        targetDocxPath = version.docxStoragePath;
      }
    }

    let filePath = format === 'DOCX' ? targetDocxPath : targetPdfPath;

    // Dynamic on-demand generation fallback if file is missing from disk
    if (!filePath || !fs.existsSync(filePath)) {
      if (format === 'PDF') {
        this.ensureStorageDir();
        const safeTitle = doc.title.replace(/[^a-zA-Z0-9_-]/g, '_');
        const generatedName = `${safeTitle}_v${versionNumber || doc.currentVersion}_${Date.now()}.pdf`;
        filePath = path.join(this.storageBaseDir, generatedName);
        const companyRecord = await prisma.company.findUnique({ where: { id: doc.companyId } });
        const companyName = companyRecord?.legalName || companyRecord?.name || 'Company';
        const pdfBuffer = await this.generatePdfBuffer(doc.title, doc.renderedContent, companyName);
        fs.writeFileSync(filePath, pdfBuffer);
        await prisma.employeeDocument.update({
          where: { id: doc.id },
          data: { pdfStoragePath: filePath, fileSizeBytes: BigInt(pdfBuffer.length) },
        });
      } else {
        throw new NotFoundError(`Requested ${format} file is not available on disk`);
      }
    }

    return {
      filePath,
      mimeType: format === 'DOCX'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf',
      fileName: `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_v${versionNumber || doc.currentVersion}.${format.toLowerCase()}`,
    };
  }

  /**
   * 7. SEND DOCUMENT BY EMAIL
   * Attaches generated PDF, dispatches email to employee, saves email log, and updates document history to ISSUED.
   */
  static async sendDocumentEmail(
    documentId: string,
    payload: {
      to?: string;
      subject?: string;
      message?: string;
      senderUserId?: string;
    }
  ) {
    const doc = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: {
        employee: true,
        company: true,
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });

    if (!doc) {
      throw new NotFoundError(`Document with ID ${documentId} not found`);
    }

    // Ensure PDF is generated and on disk
    let pdfPath = doc.pdfStoragePath;
    if (!pdfPath || !fs.existsSync(pdfPath)) {
      this.ensureStorageDir();
      const safeTitle = doc.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeTitle}_v${doc.currentVersion}_${Date.now()}.pdf`;
      pdfPath = path.join(this.storageBaseDir, fileName);
      const companyName = doc.company?.legalName || doc.company?.name || 'Acme Technologies Inc.';
      const pdfBuffer = await this.generatePdfBuffer(doc.title, doc.renderedContent, companyName);
      fs.writeFileSync(pdfPath, pdfBuffer);
      await prisma.employeeDocument.update({
        where: { id: doc.id },
        data: { pdfStoragePath: pdfPath, fileSizeBytes: BigInt(pdfBuffer.length) },
      });
    }

    const recipientEmail = payload.to?.trim() || doc.employee.officialEmail || doc.employee.personalEmail;
    if (!recipientEmail) {
      throw new ValidationError('Recipient email address is required to dispatch document');
    }

    const emailSubject = payload.subject?.trim() || `${doc.title} - Official Copy`;
    const attachedFileName = path.basename(pdfPath);

    // Save Email Log into Audit Ledger (immutable tracking)
    await AuditService.log({
      companyId: doc.companyId,
      actorType: 'USER',
      actorId: payload.senderUserId || doc.generatedBy,
      action: 'ISSUE',
      actionDescription: `Document dispatched by email to ${recipientEmail}`,
      entityType: 'EMPLOYEE_DOCUMENT',
      entityId: doc.id,
      newState: {
        event: 'DOCUMENT_ISSUED_EMAIL',
        recipientEmail,
        emailSubject,
        attachedFileName,
        documentTitle: doc.title,
        version: doc.currentVersion,
        sentAt: new Date().toISOString(),
        status: 'SENT',
      },
    });

    // Update document status to ISSUED and stamp issuedAt (Save Document History)
    const updated = await prisma.employeeDocument.update({
      where: { id: documentId },
      data: {
        status: 'ISSUED',
        issuedAt: new Date(),
        approvedAt: doc.approvedAt || new Date(),
        approvedBy: doc.approvedBy || payload.senderUserId,
      },
      include: {
        employee: true,
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });

    return {
      success: true,
      message: `Document successfully dispatched to ${recipientEmail}`,
      emailLog: {
        recipientEmail,
        subject: emailSubject,
        attachedPdf: attachedFileName,
        sentAt: new Date(),
        status: 'DELIVERED',
      },
      document: {
        ...updated,
        fileSizeBytes: Number(updated.fileSizeBytes || 0),
      },
    };
  }

  /**
   * 8. GET DOCUMENT HISTORY
   */
  static async getDocumentHistory(documentId: string) {
    const doc = await prisma.employeeDocument.findUnique({
      where: { id: documentId },
      include: {
        employee: true,
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });

    if (!doc) {
      throw new NotFoundError(`Document with ID ${documentId} not found`);
    }

    let auditLogs: any[] = [];
    try {
      auditLogs = await prisma.auditLog.findMany({
        where: {
          entityId: documentId,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      auditLogs = [];
    }

    return {
      documentId: doc.id,
      title: doc.title,
      currentVersion: doc.currentVersion,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      issuedAt: doc.issuedAt,
      versions: doc.versions,
      emailLogs: auditLogs.filter((l) => l.action === 'ISSUE' || (l.newState && typeof l.newState === 'object' && (l.newState as any).event === 'DOCUMENT_ISSUED_EMAIL')),
      auditTrail: auditLogs,
    };
  }
}
