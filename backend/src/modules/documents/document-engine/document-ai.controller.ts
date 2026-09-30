// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: MULTI-DOCUMENT AI CONTROLLER
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { DocumentAiEngineService } from './document-ai.service.js';
import { DocumentTypeCode } from '../../../../../shared/types/document-engine.js';
import { AppError } from '../../../errors/app-error.js';

export class DocumentAiController {
  /**
   * POST /api/v1/document-ai/extract
   * Extract information from source text with strict Non-Assumption Rule
   */
  static async extractInformation(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, sourceText } = req.body;
      if (!documentTypeCode || !sourceText) {
        throw new AppError('documentTypeCode and sourceText are required', 400);
      }

      const result = await DocumentAiEngineService.extractDocumentInformation(
        documentTypeCode as DocumentTypeCode,
        sourceText
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/document-ai/generate-wording
   * Generates advisory wording proposal for a section or task
   */
  static async generateWording(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, taskCode, instruction, context } = req.body;
      if (!documentTypeCode || !taskCode) {
        throw new AppError('documentTypeCode and taskCode are required', 400);
      }

      const item = await DocumentAiEngineService.generateDocumentWording({
        documentTypeCode: documentTypeCode as DocumentTypeCode,
        taskCode,
        instruction,
        context,
      });

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/document-ai/improve-wording
   * Refines phrasing, tone, and grammar while strictly preserving all facts
   */
  static async improveWording(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, text, goal, instruction, context } = req.body;
      if (!documentTypeCode || !text) {
        throw new AppError('documentTypeCode and text are required', 400);
      }

      const item = await DocumentAiEngineService.improveDocumentWording({
        documentTypeCode: documentTypeCode as DocumentTypeCode,
        text,
        goal: goal || 'clarity',
        instruction,
        context,
      });

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/document-ai/suggest-sections
   * Recommends standard or optional sections and clauses
   */
  static async suggestSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, currentData } = req.body;
      if (!documentTypeCode) {
        throw new AppError('documentTypeCode is required', 400);
      }

      const sections = DocumentAiEngineService.suggestSections(
        documentTypeCode as DocumentTypeCode,
        currentData || {}
      );

      res.status(200).json({
        success: true,
        data: sections,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/document-ai/suggest-missing-info
   * Detects unassumed gaps and generates clarification prompts
   */
  static async suggestMissingInformation(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, currentData } = req.body;
      if (!documentTypeCode) {
        throw new AppError('documentTypeCode is required', 400);
      }

      const missing = DocumentAiEngineService.suggestMissingInformation(
        documentTypeCode as DocumentTypeCode,
        currentData || {}
      );

      res.status(200).json({
        success: true,
        data: missing,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/document-ai/quality-check
   * Runs 7-category audit: Missing fields, contradictions, dates, salaries, placeholders, etc.
   * Returns PASS | WARNING | REVIEW_REQUIRED. Zero silent modification.
   */
  static async qualityCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, data } = req.body;
      if (!documentTypeCode) {
        throw new AppError('documentTypeCode is required', 400);
      }

      const report = DocumentAiEngineService.performQualityCheck(
        documentTypeCode as DocumentTypeCode,
        data || {}
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/document-ai/regenerate
   * Generates alternative drafting proposal
   */
  static async regenerateWording(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentTypeCode, taskCode, previousContent, instruction, context, variationNumber } = req.body;
      if (!documentTypeCode || !previousContent) {
        throw new AppError('documentTypeCode and previousContent are required', 400);
      }

      const item = await DocumentAiEngineService.regenerateDocumentWording({
        documentTypeCode: documentTypeCode as DocumentTypeCode,
        taskCode: taskCode || 'general_drafting',
        previousContent,
        instruction,
        context,
        variationNumber,
      });

      res.status(200).json({
        success: true,
        data: item,
      });
    } catch (err) {
      next(err);
    }
  }
}
