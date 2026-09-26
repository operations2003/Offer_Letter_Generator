import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service.js';
import { AuditAction } from '@prisma/client';

export class AuditController {
  static async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user!.companyId;
      const { entityType, entityId, actorId, action, limit, offset } = req.query;

      const result = await AuditService.query({
        companyId,
        entityType: entityType ? String(entityType) : undefined,
        entityId: entityId ? String(entityId) : undefined,
        actorId: actorId ? String(actorId) : undefined,
        action: action ? (String(action) as AuditAction) : undefined,
        limit: limit ? parseInt(String(limit), 10) : 50,
        offset: offset ? parseInt(String(offset), 10) : 0,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
