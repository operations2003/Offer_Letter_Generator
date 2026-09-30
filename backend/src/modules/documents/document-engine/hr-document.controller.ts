// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: CONTROLLER
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { HrDocumentService } from './hr-document.service.js';
import { DocumentTypeRegistry } from './document-type.registry.js';
import { DocumentTypeCode, DocumentLifecycleStatus } from '../../../../../shared/types/document-engine.js';
import { AuthenticatedRequest } from '../../../middleware/auth.js';

export class HrDocumentController {
  /**
   * GET /api/v1/document-types
   * Returns all configuration-driven document type definitions (Core 9 + Future)
   */
  static async getDocumentTypes(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const types = DocumentTypeRegistry.getAll();
      res.status(200).json({
        success: true,
        data: types,
        total: types.length,
        coreImplementedCount: types.filter((t) => t.isImplemented).length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/document-types/:code
   * Returns definition for a specific document type
   */
  static async getDocumentTypeByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const typeDef = DocumentTypeRegistry.getByCode(code as DocumentTypeCode);
      if (!typeDef) {
        res.status(404).json({ success: false, message: `Document type "${code}" not found` });
        return;
      }
      res.status(200).json({ success: true, data: typeDef });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/hr-documents
   * Create a new document draft of any registered document type
   */
  static async createDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.companyId || 'company_default';
      const userId = req.user?.userId || 'usr_system';

      const doc = await HrDocumentService.createDocument({
        ...req.body,
        companyId,
        createdByUserId: userId,
      });

      res.status(201).json({
        success: true,
        data: doc,
        message: `Draft created for ${doc.title} (${doc.referenceNumber})`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hr-documents
   * List documents with optional filters
   */
  static async listDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, status, search } = req.query;
      const docs = await HrDocumentService.listDocuments({
        documentTypeCode: type as DocumentTypeCode,
        status: status as DocumentLifecycleStatus,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        data: docs,
        total: docs.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hr-documents/:id
   * Get single document with full metadata, version history, and data segregation
   */
  static async getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await HrDocumentService.getById(id);
      res.status(200).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/hr-documents/:id/ai-ingest
   * Ingest AI advisory extractions
   */
  static async ingestAiData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { extractedFields, overallConfidence, warnings } = req.body;

      const doc = await HrDocumentService.ingestAiExtractedData(
        id,
        extractedFields,
        overallConfidence || 0.9,
        warnings || []
      );

      res.status(200).json({
        success: true,
        data: doc,
        message: 'AI advisory extraction ingested successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/hr-documents/:id/confirm-terms
   * HR confirms terms, logs overrides, and increments version snapshot
   */
  static async confirmTerms(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_hr_reviewer';
      const { hrConfirmedData, humanOverrides } = req.body;

      const result = await HrDocumentService.confirmTermsByHr({
        documentId: id,
        hrConfirmedData,
        humanOverrides,
        reviewedByUserId: userId,
      });

      res.status(200).json({
        success: true,
        data: result.document,
        validation: result.validation,
        message: 'Terms confirmed by HR reviewer',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/hr-documents/:id/generate-pdf
   * Generate official PDF strictly using HR confirmed terms
   */
  static async generatePdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_hr_issuer';

      const company = {
        name: 'Acme Technologies Inc.',
        legalName: 'Acme Technologies Global Solutions Corporation',
        domain: 'acme.com',
        address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
      };

      const result = await HrDocumentService.generateLegalPdf(id, userId, company);

      res.status(200).json({
        success: true,
        data: {
          document: result.document,
          fileMetadata: result.document.generatedFiles[result.document.generatedFiles.length - 1],
          sha256Checksum: result.pdfResult.sha256Checksum,
          verificationToken: result.pdfResult.verificationToken,
          fileSizeBytes: result.pdfResult.fileSizeBytes,
        },
        message: `Official legal PDF generated successfully (${result.pdfResult.fileName})`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hr-documents/:id/preview-pdf
   * Render draft preview PDF in-browser (inline) strictly from HR-confirmed data
   */
  static async previewPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const company = {
        name: 'Acme Technologies Inc.',
        legalName: 'Acme Technologies Global Solutions Corporation',
        domain: 'acme.com',
        address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
      };

      const result = await HrDocumentService.previewLegalPdf(id, company);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${result.fileName}"`);
      res.setHeader('X-Verification-Token', result.verificationToken);
      res.setHeader('X-SHA256-Checksum', result.sha256Checksum);
      res.send(result.buffer);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/hr-documents/:id/regenerate-pdf
   * Recompile fresh legal PDF after HR edits, preserving file lineage
   */
  static async regeneratePdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_hr_issuer';
      const { reason } = req.body || {};

      const company = {
        name: 'Acme Technologies Inc.',
        legalName: 'Acme Technologies Global Solutions Corporation',
        domain: 'acme.com',
        address: '500 Howard Street, Suite 400, San Francisco, CA 94105',
      };

      const result = await HrDocumentService.regenerateLegalPdf(id, userId, company, reason);

      res.status(200).json({
        success: true,
        data: {
          document: result.document,
          fileMetadata: result.document.generatedFiles[result.document.generatedFiles.length - 1],
          sha256Checksum: result.pdfResult.sha256Checksum,
          verificationToken: result.pdfResult.verificationToken,
          fileSizeBytes: result.pdfResult.fileSizeBytes,
        },
        message: `Official legal PDF regenerated successfully (${result.pdfResult.fileName})`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hr-documents/:id/download-pdf
   * Download the raw PDF binary from secure storage
   */
  static async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await HrDocumentService.downloadPdf(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
      res.setHeader('X-Verification-Token', result.verificationToken);
      res.setHeader('X-SHA256-Checksum', result.sha256Checksum);
      res.send(result.buffer);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hr-documents/:id/versions
   * Retrieve version snapshots and human overrides history
   */
  static async getVersionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const history = await HrDocumentService.getVersionHistory(id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/hr-documents/:id/audit-trail
   * Retrieve lifecycle status transitions and audit history
   */
  static async getAuditTrail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const trail = await HrDocumentService.getAuditTrail(id);

      res.status(200).json({
        success: true,
        data: trail,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/hr-documents/:id/rollback
   * Rollback to prior version
   */
  static async rollback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { versionNumber } = req.body;
      const userId = req.user?.userId || 'usr_hr_admin';

      const doc = await HrDocumentService.rollbackToVersion(id, Number(versionNumber), userId);

      res.status(200).json({
        success: true,
        data: doc,
        message: `Document rolled back to version v${versionNumber}`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/hr-documents/:id/status
   * Update status transition
   */
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const userId = req.user?.userId || 'usr_hr_reviewer';

      const doc = await HrDocumentService.updateStatus(id, status, userId, reason);

      res.status(200).json({
        success: true,
        data: doc,
        message: `Status updated to ${status}`,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/hr-documents/:id
   * Soft-delete document
   */
  static async softDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId || 'usr_hr_admin';

      await HrDocumentService.softDelete(id, userId);

      res.status(200).json({
        success: true,
        message: 'Document soft-deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
