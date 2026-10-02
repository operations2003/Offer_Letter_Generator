// =============================================================================
// EMPLOYEE & HR DOCUMENT CONTROLLER
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { EmployeeService } from './employee.service.js';
import { EmployeeDocumentService } from './employee-document.service.js';
import { EmployeeAiService } from './employee-ai.service.js';
import { PRELOADED_HR_TEMPLATES } from './hr-document-templates.catalog.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';
import { ValidationError, NotFoundError } from '../../errors/app-error.js';
import { prisma } from '../../prisma/client.js';
import { AuditService } from '../audit/audit.service.js';
import fs from 'fs';
import path from 'path';

export class EmployeeController {
  // ---------------------------------------------------------------------------
  // 1. EMPLOYEE MASTER CRUD
  // ---------------------------------------------------------------------------

  static async listEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const { search, department, status } = req.query;

      const employees = await EmployeeService.listEmployees({
        companyId,
        search: search as string,
        department: department as string,
        status: status as string,
      });

      res.status(200).json({
        success: true,
        data: employees,
        total: employees.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getEmployeeById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const employee = await EmployeeService.getEmployeeById(id, companyId);
      res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.companyId;
      const userId = req.user?.userId;

      const employee = await EmployeeService.createEmployee({
        ...req.body,
        companyId,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: employee,
        message: `Employee ${employee.fullName} (${employee.employeeId}) registered successfully`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const updated = await EmployeeService.updateEmployee(id, req.body, companyId);
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Employee profile updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.user?.companyId;

      const result = await EmployeeService.deleteEmployee(id, companyId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. DOCUMENT TEMPLATES LIBRARY (13 CATEGORIES)
  // ---------------------------------------------------------------------------

  static async listTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = Object.values(PRELOADED_HR_TEMPLATES);
      res.status(200).json({
        success: true,
        data: templates,
        total: templates.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getTemplateByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const template = PRELOADED_HR_TEMPLATES[code];
      if (!template) {
        throw new NotFoundError(`Template "${code}" not found`);
      }
      res.status(200).json({
        success: true,
        data: template,
      });
    } catch (err) {
      next(err);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. DOCUMENT GENERATION WORKFLOW
  // ---------------------------------------------------------------------------

  static async previewDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { templateCode, customParameters } = req.body;

      if (!templateCode) {
        throw new ValidationError('templateCode is required');
      }

      const preview = await EmployeeDocumentService.previewDocument(
        employeeId,
        templateCode,
        customParameters
      );

      res.status(200).json({
        success: true,
        data: preview,
      });
    } catch (err) {
      next(err);
    }
  }

  static async generateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const userId = req.user?.userId;
      const {
        templateCode,
        title,
        customParameters,
        changeNotes,
        targetStatus,
      } = req.body;

      if (!templateCode) {
        throw new ValidationError('templateCode is required');
      }

      const document = await EmployeeDocumentService.generateDocumentForEmployee({
        employeeId,
        templateCode,
        title,
        customParameters,
        changeNotes,
        generatedByUserId: userId,
        targetStatus,
      });

      res.status(201).json({
        success: true,
        data: document,
        message: `Successfully generated ${document.title} (v1)`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async regenerateDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const userId = req.user?.userId;
      const { changeNotes, updatedParameters, updatedContent } = req.body;

      if (!changeNotes || !changeNotes.trim()) {
        throw new ValidationError('changeNotes is required when regenerating a document to record version reason');
      }

      const regenerated = await EmployeeDocumentService.regenerateDocument({
        documentId,
        changeNotes: changeNotes.trim(),
        updatedParameters,
        updatedContent,
        userId,
      });

      res.status(200).json({
        success: true,
        data: regenerated,
        message: regenerated.message,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateDocumentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { status } = req.body;
      const userId = req.user?.userId;

      if (!status) {
        throw new ValidationError('status is required');
      }

      const updated = await EmployeeDocumentService.updateDocumentStatus(documentId, status, userId);
      res.status(200).json({
        success: true,
        data: updated,
        message: `Document status updated to ${status}`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDocumentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const doc = await EmployeeDocumentService.getDocumentById(documentId);
      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (err) {
      next(err);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. DOWNLOAD HANDLERS (PDF & DOCX)
  // ---------------------------------------------------------------------------

  static async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const version = req.query.version ? parseInt(req.query.version as string, 10) : undefined;
      const userId = req.user?.userId;

      const fileInfo = await EmployeeDocumentService.getDocumentFile(documentId, 'PDF', version);

      // Save Document History: Log download action in audit ledger
      try {
        const doc = await prisma.employeeDocument.findUnique({ where: { id: documentId } });
        if (doc) {
          await AuditService.log({
            companyId: doc.companyId,
            actorType: 'USER',
            actorId: userId || doc.generatedBy,
            action: 'DOWNLOAD',
            actionDescription: `Document ${doc.title} v${version || doc.currentVersion} downloaded as PDF`,
            entityType: 'EMPLOYEE_DOCUMENT',
            entityId: doc.id,
            newState: {
              fileName: fileInfo.fileName,
              format: 'PDF',
              version: version || doc.currentVersion,
              downloadedAt: new Date().toISOString(),
            },
          });
        }
      } catch {
        // Non-blocking audit record
      }

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      fs.createReadStream(fileInfo.filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  }

  static async sendDocumentEmail(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const { to, subject, message } = req.body;
      const senderUserId = req.user?.userId;

      const result = await EmployeeDocumentService.sendDocumentEmail(documentId, {
        to,
        subject,
        message,
        senderUserId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDocumentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const history = await EmployeeDocumentService.getDocumentHistory(documentId);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadDocx(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentId } = req.params;
      const version = req.query.version ? parseInt(req.query.version as string, 10) : undefined;

      const fileInfo = await EmployeeDocumentService.getDocumentFile(documentId, 'DOCX', version);

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      fs.createReadStream(fileInfo.filePath).pipe(res);
    } catch (err) {
      next(err);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. UPLOADED EMPLOYEE DOCUMENTS
  // ---------------------------------------------------------------------------

  static async uploadEmployeeDocument(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const file = req.file;

      if (!file) {
        throw new ValidationError('No document file was uploaded');
      }

      const docCategory = req.body.documentType || 'EMPLOYEE_RECORD';
      const docTitle = req.body.title || file.originalname;

      const uploadDir = path.resolve(process.cwd(), 'uploads', 'employee-records', employeeId);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const targetPath = path.join(uploadDir, `${Date.now()}_${file.originalname}`);
      fs.copyFileSync(file.path, targetPath);

      res.status(201).json({
        success: true,
        data: {
          id: `upl_${Date.now()}`,
          fileName: file.originalname,
          sizeBytes: file.size,
          category: docCategory,
          title: docTitle,
          uploadedAt: new Date().toISOString(),
        },
        message: `Document "${file.originalname}" uploaded to employee records`,
      });
    } catch (err) {
      next(err);
    }
  }

  // ---------------------------------------------------------------------------
  // 6. OPTIONAL AI ASSISTANT ENDPOINTS
  // ---------------------------------------------------------------------------

  static async aiSuggestWording(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text, documentType } = req.body;
      if (!text) throw new ValidationError('text is required');

      const result = await EmployeeAiService.suggestWording(text, documentType || 'Standard');
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async aiCheckCompleteness(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { renderedContent, expectedFields } = req.body;
      if (!renderedContent) throw new ValidationError('renderedContent is required');

      const result = await EmployeeAiService.checkCompleteness(renderedContent, expectedFields || []);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async aiExplainClause(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clauseText } = req.body;
      if (!clauseText) throw new ValidationError('clauseText is required');

      const result = await EmployeeAiService.explainClause(clauseText);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async aiFlagInconsistencies(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeData, documentParameters } = req.body;
      if (!employeeData || !documentParameters) {
        throw new ValidationError('employeeData and documentParameters are required');
      }

      const result = await EmployeeAiService.flagInconsistencies(employeeData, documentParameters);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
