import { Request, Response, NextFunction } from 'express';
import { OfferService } from './offer.service.js';
import { OfferEmailService } from './offer-email.service.js';

export class OfferController {
  /**
   * POST /api/v1/offers
   * Creates a formal offer
   */
  static async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const offer = await OfferService.createOffer(companyId, userId, req.body, ipAddress, userAgent);

      res.status(201).json({
        success: true,
        message: 'Offer created successfully and submitted for HR review',
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/draft
   * Saves a new draft offer
   */
  static async saveNewDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const draft = await OfferService.saveDraft(companyId, userId, null, req.body, ipAddress, userAgent);

      res.status(201).json({
        success: true,
        message: 'Draft offer saved successfully',
        data: draft,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/offers/:id/draft
   * Updates an existing draft offer
   */
  static async updateDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const draft = await OfferService.saveDraft(companyId, userId, offerId, req.body, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: 'Draft offer updated successfully',
        data: draft,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/offers/:id
   * Updates an offer and records a new version with diffs
   */
  static async updateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const offer = await OfferService.updateOffer(companyId, userId, offerId, req.body, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: `Offer updated to version ${offer.currentVersionNumber}`,
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id
   */
  static async getOfferById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const offer = await OfferService.getOfferById(companyId, offerId);

      res.status(200).json({
        success: true,
        data: offer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/statistics
   * Returns pipeline counts: Total, Draft, AI Processing, Awaiting Review, Generated, Sent, Accepted, Rejected, Expired
   */
  static async getDashboardStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const stats = await OfferService.getDashboardStatistics(companyId);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers
   * List offers with advanced filtering, search and pagination
   */
  static async listOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { status, candidateId, search, department, templateId, aiReviewStatus, page, limit, offset } = req.query;

      const parsedLimit = limit ? parseInt(limit as string, 10) : 20;
      const parsedPage = page ? parseInt(page as string, 10) : undefined;
      const parsedOffset = offset !== undefined ? parseInt(offset as string, 10) : undefined;

      const result = await OfferService.listOffers(companyId, {
        status: status as any,
        candidateId: candidateId as string,
        search: search as string,
        department: department as string,
        templateId: templateId as string,
        aiReviewStatus: aiReviewStatus as string,
        page: parsedPage,
        limit: parsedLimit,
        offset: parsedOffset,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/ai/extract
   * AI Extraction: Extracts candidate and proposed terms from document text
   */
  static async extractFromAi(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const { documentText, candidateId } = req.body;

      const result = await OfferService.extractFromDocument(companyId, userId, documentText, candidateId);

      res.status(200).json({
        success: true,
        message: 'AI candidate extraction completed (Advisory Data)',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/ai/suggestions
   * POST /api/v1/offers/:id/ai/suggestions
   * Generates AI suggestions for wording, welcome message, role perks, and recommended clauses
   */
  static async generateAiSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;

      const suggestions = await OfferService.generateAiSuggestions(companyId, userId, offerId, req.body);

      res.status(200).json({
        success: true,
        message: 'AI suggestions generated (Advisory Data)',
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/offers/ai/suggestions/:suggestionId/review
   * Review AI suggestion (Accept / Reject)
   */
  static async reviewAiSuggestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const { suggestionId } = req.params;
      const { isAccepted, hrFeedbackNotes } = req.body;

      const updated = await OfferService.reviewAiSuggestion(companyId, userId, suggestionId, isAccepted, hrFeedbackNotes);

      res.status(200).json({
        success: true,
        message: `AI suggestion ${isAccepted ? 'accepted' : 'declined'} successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/ai/generate-clause
   * AI Clause Generation: Generates specific legal clause wording
   */
  static async generateAiClause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;

      const clause = await OfferService.generateAiClause(companyId, userId, req.body);

      res.status(200).json({
        success: true,
        message: 'AI clause generated successfully for review',
        data: clause,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/ai/quality-check
   * AI Quality Check: Audits offer for completeness, math consistency, and sensitive field compliance
   */
  static async performQualityCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;

      const qualityCheck = await OfferService.performQualityCheck(companyId, userId, offerId);

      res.status(200).json({
        success: true,
        message: 'Offer quality check completed',
        data: qualityCheck,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/pre-generation-check
   * POST /api/v1/offers/:id/pre-generation-check
   * Pre-Generation Audit:
   * Checks for missing required fields, candidate/company info, date inconsistencies,
   * designation inconsistencies, salary inconsistencies, missing clauses, unreplaced placeholders,
   * formatting issues, and contradictions.
   * Returns: PASS, WARNING, REVIEW_REQUIRED.
   * AI flags issues, never silently modifies the offer.
   */
  static async performPreGenerationCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params?.id;

      const auditResult = await OfferService.performPreGenerationCheck(
        companyId,
        userId,
        offerId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: `Pre-generation audit completed: ${auditResult.status}`,
        data: auditResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/preview
   * Renders interpolated preview with compensation tables, clauses, and readiness validation
   */
  static async getOfferPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const preview = await OfferService.getOfferPreview(companyId, offerId);

      res.status(200).json({
        success: true,
        data: preview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/status
   * Retrieves current status, allowed transitions, and history
   */
  static async getOfferStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const status = await OfferService.getOfferStatus(companyId, offerId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/offers/:id/status
   * Transitions offer status (DRAFT_AI -> HR_REVIEW -> PENDING_APPROVAL -> APPROVED -> ISSUED -> ACCEPTED, etc.)
   */
  static async updateOfferStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const updated = await OfferService.updateOfferStatus(companyId, userId, offerId, req.body, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: `Offer status transitioned to ${updated.currentStatus}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/versions
   * Retrieves version history list
   */
  static async getOfferVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const versions = await OfferService.getOfferVersions(companyId, offerId);

      res.status(200).json({
        success: true,
        data: versions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/versions/:versionNumber
   * Retrieves snapshot and diff for a specific version
   */
  static async getOfferVersionByNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;
      const versionNumber = parseInt(req.params.versionNumber, 10);

      const version = await OfferService.getOfferVersionByNumber(companyId, offerId, versionNumber);

      res.status(200).json({
        success: true,
        data: version,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/versions/:versionNumber/restore
   * Restores an earlier version snapshot as the new active version
   */
  static async restoreOfferVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const versionNumber = parseInt(req.params.versionNumber, 10);
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const restored = await OfferService.restoreOfferVersion(companyId, userId, offerId, versionNumber, ipAddress, userAgent);

      res.status(200).json({
        success: true,
        message: `Successfully restored offer to Version ${versionNumber}`,
        data: restored,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/document/generate
   * Generates formal PDF offer letter strictly from HR-confirmed data and stores securely
   */
  static async generateFinalDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const result = await OfferService.generateFinalDocument(
        companyId,
        userId,
        offerId,
        req.body,
        ipAddress,
        userAgent
      );

      res.status(201).json({
        success: true,
        message: 'Official legal offer letter PDF generated and securely archived',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/document/regenerate
   * Regenerates document with incremented version and audit snapshot
   */
  static async regenerateFinalDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
      const userAgent = req.headers['user-agent'];

      const result = await OfferService.regenerateFinalDocument(
        companyId,
        userId,
        offerId,
        req.body,
        ipAddress,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: `Document regenerated successfully: Version ${result.versionNumber}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/document/download
   * Streams stored PDF binary with proper download headers
   */
  static async downloadGeneratedDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const documentId = req.query.documentId as string | undefined;

      const { buffer, fileName, fileSizeBytes, sha256Checksum } = await OfferService.getGeneratedDocumentDownload(
        companyId,
        userId,
        offerId,
        documentId
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileSizeBytes.toString());
      res.setHeader('X-Document-Checksum-SHA256', sha256Checksum);
      res.status(200).send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/documents
   * Lists all generated document versions for this offer
   */
  static async listOfferDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const documents = await OfferService.listOfferDocuments(companyId, offerId);

      res.status(200).json({
        success: true,
        data: {
          offerId,
          totalDocuments: documents.length,
          documents,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/document/verify/:token
   * Public verification endpoint: validates cryptographic verification token
   */
  static async verifyDocumentByToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token;

      const verification = await OfferService.verifyDocumentByToken(token);

      res.status(verification.isValid ? 200 : 404).json({
        success: verification.isValid,
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/duplicate
   * Duplicates an existing offer into a fresh draft with a new reference number
   */
  static async duplicateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;

      const duplicated = await OfferService.duplicateOffer(companyId, userId, offerId);

      res.status(201).json({
        success: true,
        message: `Offer duplicated successfully with reference ${duplicated.offerReferenceNumber}`,
        data: duplicated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/send/confirmation-preview
   * Generates email confirmation preview, secure link, and PDF attachment details for HR review
   */
  static async getEmailConfirmationPreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;

      const preview = await OfferEmailService.getEmailConfirmationPreview(companyId, userId, offerId);

      res.status(200).json({
        success: true,
        data: preview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/send
   * Issues the offer to the candidate, mints secure access token, and triggers notification
   */
  static async sendOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const { subject, message, includePdfAttachment, ccEmails, simulateFailure } = req.body || {};

      // Guardrail against simulated AI automated headers
      const isAiAutomated = req.headers['x-ai-automated'] === 'true' || req.body?.isAiAutomated === true;

      const result = await OfferEmailService.sendOfferEmail(
        companyId,
        userId,
        offerId,
        {
          subject,
          message,
          includePdfAttachment: includePdfAttachment !== false,
          ccEmails,
          simulateFailure: Boolean(simulateFailure),
          isAiAutomated,
        },
        'USER'
      );

      res.status(result.success ? 200 : 502).json({
        success: result.success,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/offers/:id/emails/:deliveryId/retry
   * Retries a previously failed offer email delivery.
   */
  static async retryEmailDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const offerId = req.params.id;
      const deliveryId = req.params.deliveryId;
      const { simulateFailure, customMessage } = req.body || {};

      const result = await OfferEmailService.retryEmailDelivery(
        companyId,
        userId,
        offerId,
        deliveryId,
        { simulateFailure, customMessage },
        'USER'
      );

      res.status(result.success ? 200 : 502).json({
        success: result.success,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/emails
   * Retrieves chronological email delivery history, status logs, retries, and timestamps.
   */
  static async getEmailHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const history = await OfferEmailService.getEmailHistory(companyId, offerId);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/offers/:id/history
   * Retrieves comprehensive audit history, versions, and status logs
   */
  static async getOfferHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const offerId = req.params.id;

      const history = await OfferService.getOfferHistory(companyId, offerId);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
