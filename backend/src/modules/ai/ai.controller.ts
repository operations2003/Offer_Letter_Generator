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
}
