import { Request, Response, NextFunction } from 'express';
import { TemplateService } from './template.service.js';

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
}
