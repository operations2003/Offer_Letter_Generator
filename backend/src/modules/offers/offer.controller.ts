import { Request, Response, NextFunction } from 'express';
import { OfferService } from './offer.service.js';

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
   * GET /api/v1/offers
   */
  static async listOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { status, candidateId, search, limit, offset } = req.query;

      const result = await OfferService.listOffers(companyId, {
        status: status as any,
        candidateId: candidateId as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
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
}
