import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service.js';
import { AuditService } from '../audit/audit.service.js';

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
}
