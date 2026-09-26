import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service.js';
import { DocumentExtractorService } from '../documents/document-extractor.service.js';
import { AuditService } from '../audit/audit.service.js';
import { BadRequestError } from '../../errors/app-error.js';

export class AiController {
  static async getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await AiService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Uploads a document (PDF, DOCX, TXT), extracts text, and runs AI candidate extraction
   */
  static async uploadAndExtract(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('No document uploaded. Please attach a PDF, DOCX, or TXT file.');
      }

      // 1. Text Extraction
      const docResult = await DocumentExtractorService.extractTextFromBuffer(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // 2. AI Structured Extraction
      const aiResult = await AiService.extractCandidateData(docResult.extractedText);

      // 3. Audit Logging
      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'CandidateDocument',
          entityId: docResult.fileHashSha256.substring(0, 16),
          action: 'CREATE',
          actionDescription: `Uploaded ${docResult.detectedFormat} document "${docResult.fileName}" (${(docResult.fileSizeBytes / 1024).toFixed(1)} KB) and extracted candidate data via AI`,
          newState: {
            fileName: docResult.fileName,
            format: docResult.detectedFormat,
            fileHashSha256: docResult.fileHashSha256,
            overallConfidenceScore: aiResult.extraction.overallConfidenceScore,
            missingFieldsCount: aiResult.extraction.missingFields.length,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: `Successfully extracted text and structured data from ${docResult.fileName}`,
        data: {
          document: {
            fileName: docResult.fileName,
            fileSizeBytes: docResult.fileSizeBytes,
            detectedFormat: docResult.detectedFormat,
            fileHashSha256: docResult.fileHashSha256,
            extractedTextSnippet: docResult.extractedText.substring(0, 300) + '...',
          },
          extraction: aiResult.extraction,
          metadata: aiResult.metadata,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async extractCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentText } = req.body;
      const result = await AiService.extractCandidateData(documentText);

      // Audit AI extraction event
      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'AI_WORKER',
          actorId: req.user.userId,
          entityType: 'AiExtractedData',
          entityId: 'transient_extraction',
          action: 'CREATE',
          actionDescription: `AI extracted candidate data (Provider: ${result.metadata.provider}, Model: ${result.metadata.model}, Latency: ${result.metadata.latencyMs}ms)`,
          newState: {
            confidenceScore: result.extraction.overallConfidenceScore,
            missingFields: result.extraction.missingFields,
            metadata: result.metadata,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Candidate data extracted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { terms, rules } = req.body;
      const result = await AiService.checkPolicyCompliance(terms, rules);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async draftClause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { instruction, context } = req.body;
      const result = await AiService.draftCustomClause(instruction, context || {});

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 1. AI Assistant: Generate drafting assistance
   * Supports:
   * - Professional offer wording
   * - Welcome/introduction text
   * - Job description wording
   * - General clauses
   * - Custom HR clauses
   */
  static async generateAssistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, instruction, context, offerId } = req.body;
      const result = await AiService.generateAssistance({
        type,
        instruction,
        context: context || {},
        offerId,
      });

      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'AiAssistanceContent',
          entityId: result.id,
          action: 'CREATE',
          actionDescription: `Generated AI assistance draft for "${type}": "${result.title}"`,
          newState: {
            id: result.id,
            type: result.type,
            title: result.title,
            requiresHrReview: true,
            isPolicyInvented: false,
            offerId,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: `AI drafting completed for ${type}. Advisory only; requires HR review.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 2. AI Assistant: Improve existing text
   * Supports:
   * - Grammar improvement
   * - Content improvement
   * - Clarity, conciseness, professional legal, and warm culture
   */
  static async improveText(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, text, goal, instruction, context, offerId } = req.body;
      const result = await AiService.improveText({
        type,
        text,
        goal,
        instruction,
        context: context || {},
        offerId,
      });

      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'AiAssistanceContent',
          entityId: result.id,
          action: 'CREATE',
          actionDescription: `AI improved text (Goal: ${goal || 'clarity'}) for "${result.title}"`,
          newState: {
            id: result.id,
            type: result.type,
            originalSnippet: text.substring(0, 100),
            changesSummary: result.changesSummary,
            requiresHrReview: true,
            isPolicyInvented: false,
            offerId,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'AI improvement generated. Advisory only; requires HR review.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 3. AI Assistant: Regenerate alternative variation
   */
  static async regenerateAssistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { generationId, type, previousContent, instruction, context, offerId, variationNumber } = req.body;
      const result = await AiService.regenerateAssistance({
        generationId,
        type,
        previousContent,
        instruction,
        context: context || {},
        offerId,
        variationNumber,
      });

      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'AiAssistanceContent',
          entityId: result.id,
          action: 'CREATE',
          actionDescription: `Regenerated AI alternative variation #${result.variationNumber} for "${type}"`,
          newState: {
            id: result.id,
            type: result.type,
            previousGenerationId: generationId,
            variationNumber: result.variationNumber,
            requiresHrReview: true,
            offerId,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: `Regenerated alternative variation #${result.variationNumber}. Advisory only; requires HR review.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 4. AI Assistant: Accept AI content by HR
   * Enforces that HR has reviewed and optionally edited the content before accepting.
   */
  static async acceptAssistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { generationId, content, offerId, targetField, hrFeedbackNotes } = req.body;

      const reviewTimestamp = new Date().toISOString();
      const reviewerUserId = req.user?.userId || 'unknown-user';

      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'AiAssistanceContent',
          entityId: generationId,
          action: 'UPDATE',
          actionDescription: `HR accepted and confirmed AI-generated content (ID: ${generationId}) for target field: ${targetField || 'general'}`,
          newState: {
            generationId,
            reviewStatus: 'ACCEPTED',
            acceptedContent: content,
            targetField,
            hrFeedbackNotes,
            offerId,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'AI-generated content accepted and verified by HR.',
        data: {
          generationId,
          reviewStatus: 'ACCEPTED',
          content,
          targetField,
          hrFeedbackNotes,
          reviewedBy: reviewerUserId,
          reviewedAt: reviewTimestamp,
          offerId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 5. AI Assistant: Reject AI content by HR
   */
  static async rejectAssistance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { generationId, rejectionReason, offerId } = req.body;

      const reviewTimestamp = new Date().toISOString();
      const reviewerUserId = req.user?.userId || 'unknown-user';

      if (req.user) {
        await AuditService.record({
          companyId: req.user.companyId,
          actorType: 'USER',
          actorId: req.user.userId,
          entityType: 'AiAssistanceContent',
          entityId: generationId,
          action: 'UPDATE',
          actionDescription: `HR rejected AI-generated content (ID: ${generationId}). Reason: ${rejectionReason || 'Declined by HR'}`,
          newState: {
            generationId,
            reviewStatus: 'REJECTED',
            rejectionReason: rejectionReason || null,
            offerId,
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'AI-generated content rejected by HR.',
        data: {
          generationId,
          reviewStatus: 'REJECTED',
          rejectionReason: rejectionReason || null,
          reviewedBy: reviewerUserId,
          reviewedAt: reviewTimestamp,
          offerId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

