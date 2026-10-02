import { Request, Response, NextFunction } from 'express';
import { TemplateService } from './template.service.js';
import { DocumentExtractorService } from '../documents/document-extractor.service.js';
import { PlaceholderManager } from './placeholders.catalog.js';
import { BadRequestError } from '../../errors/app-error.js';
import fs from 'fs';
import path from 'path';

export class TemplateController {
  /**
   * GET /api/v1/templates/placeholders/catalog
   */
  static async getCatalog(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const catalog = TemplateService.getPlaceholdersCatalog();
      res.status(200).json({
        success: true,
        data: catalog,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const template = await TemplateService.createTemplate(companyId, userId, req.body);

      res.status(201).json({
        success: true,
        message: `Template "${template.title}" created successfully (v1)`,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates
   */
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { category, isActive, search } = req.query;

      const templates = await TemplateService.getTemplates(companyId, {
        category: category as any,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search: search as string,
      });

      res.status(200).json({
        success: true,
        total: templates.length,
        data: templates,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;
      const template = await TemplateService.getTemplateById(companyId, id);

      res.status(200).json({
        success: true,
        data: template,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/templates/:id
   */
  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const { id } = req.params;

      const updated = await TemplateService.updateTemplate(companyId, userId, id, req.body);

      res.status(200).json({
        success: true,
        message: `Template "${updated.title}" updated successfully`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/:id/duplicate
   */
  static async duplicate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const { id } = req.params;
      const { title } = req.body || {};

      const duplicated = await TemplateService.duplicateTemplate(companyId, userId, id, title);

      res.status(201).json({
        success: true,
        message: `Template duplicated successfully as "${duplicated.title}"`,
        data: duplicated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/templates/:id/status
   */
  static async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const { id } = req.params;
      const { isActive } = req.body;

      const updated = await TemplateService.toggleActive(companyId, userId, id, isActive);

      res.status(200).json({
        success: true,
        message: `Template "${updated.title}" is now ${isActive ? 'active' : 'inactive'}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/templates/:id/versions
   */
  static async getVersionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { id } = req.params;

      const history = await TemplateService.getVersionHistory(companyId, id);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/:id/versions/:versionNumber/publish
   */
  static async publishVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const userId = req.user!.userId;
      const { id, versionNumber } = req.params;

      const updated = await TemplateService.publishVersion(
        companyId,
        userId,
        id,
        parseInt(versionNumber, 10)
      );

      res.status(200).json({
        success: true,
        message: `Version ${versionNumber} is now the active version for "${updated.title}"`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/ai-suggest-placeholders
   * Advisory only - does not modify template automatically
   */
  static async aiSuggest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contentMarkup } = req.body;
      const suggestions = await TemplateService.aiDetectPlaceholders(contentMarkup);

      res.status(200).json({
        success: true,
        message: 'AI placeholder suggestions generated (Advisory only)',
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/templates/upload
   * Upload template file (DOCX or PDF), extract text and placeholders,
   * without silently overwriting original files.
   */
  static async uploadTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        throw new BadRequestError('No template file was uploaded.');
      }

      const extracted = await DocumentExtractorService.extractTextFromBuffer(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      // Determine template format and conversion status
      const isPdf = extracted.detectedFormat === 'PDF';
      const isDocx = extracted.detectedFormat === 'DOCX';

      // Safe storage path (unique name, never overwriting existing)
      const uploadDir = path.resolve(process.cwd(), 'uploads', 'template-files');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const safeFileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const savedStoragePath = path.join(uploadDir, safeFileName);
      fs.writeFileSync(savedStoragePath, file.buffer);

      // Detect any existing placeholders
      const detectedPlaceholders = PlaceholderManager.extractPlaceholders(extracted.extractedText);

      // Suggested category mapping based on content keywords
      const lower = extracted.extractedText.toLowerCase();
      let suggestedCategory = 'Offer Letter';
      if (lower.includes('intern') || lower.includes('stipend')) suggestedCategory = 'Internship Letter';
      else if (lower.includes('contract') || lower.includes('contractor')) suggestedCategory = 'Employment Contract';
      else if (lower.includes('increment') || lower.includes('revision') || lower.includes('appraisal')) suggestedCategory = 'Increment Letter';
      else if (lower.includes('experience') || lower.includes('service certificate')) suggestedCategory = 'Experience Letter';
      else if (lower.includes('relieving') || lower.includes('release')) suggestedCategory = 'Relieving Letter';
      else if (lower.includes('termination') || lower.includes('separation')) suggestedCategory = 'Termination Letter';
      else if (lower.includes('settlement') || lower.includes('fnf')) suggestedCategory = 'Full and Final Settlement Statement';
      else if (lower.includes('payslip') || lower.includes('salary slip')) suggestedCategory = 'Payslip';
      else if (lower.includes('policy') || lower.includes('conduct')) suggestedCategory = 'Company Policies';
      else if (lower.includes('agreement') || lower.includes('msa')) suggestedCategory = 'Service Agreement (MSA)';
      else if (lower.includes('onboarding') || lower.includes('joining checklist')) suggestedCategory = 'Onboarding Forms';
      else if (lower.includes('certificate') || lower.includes('training')) suggestedCategory = 'Training Certificates';

      res.status(200).json({
        success: true,
        data: {
          originalFileName: file.originalname,
          storagePath: savedStoragePath,
          detectedFormat: extracted.detectedFormat,
          isEditableNative: isDocx,
          needsPdfConversion: isPdf,
          message: isPdf
            ? 'PDF text extracted and converted into editable template markup. Original file preserved.'
            : 'DOCX template parsed and converted successfully.',
          extractedContent: extracted.extractedText,
          detectedPlaceholders,
          suggestedCategory,
          pageCount: extracted.pageCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
