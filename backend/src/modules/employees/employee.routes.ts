// =============================================================================
// EMPLOYEE & HR DOCUMENT ENGINE: ROUTE DEFINITIONS
// =============================================================================

import { Router } from 'express';
import { EmployeeController } from './employee.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';
import { uploadDocumentMiddleware } from '../../middleware/upload.js';

export const employeeRouter = Router();

// All employee routes require authentication
employeeRouter.use(authenticate);

// -----------------------------------------------------------------------------
// 1. Employee Management Routes
// -----------------------------------------------------------------------------
// List & Search (Admin, HR, Recruiter, Approver)
employeeRouter.get(
  '/',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  EmployeeController.listEmployees
);

// Preloaded Templates list for 13 HR document categories
employeeRouter.get(
  '/templates',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  EmployeeController.listTemplates
);

employeeRouter.get(
  '/templates/:code',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  EmployeeController.getTemplateByCode
);

// Get single employee by ID
employeeRouter.get(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR', 'EMPLOYEE'),
  EmployeeController.getEmployeeById
);

// Create employee (Admin & HR/Recruiter)
employeeRouter.post(
  '/',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  EmployeeController.createEmployee
);

// Update employee (Admin & HR/Recruiter)
employeeRouter.put(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  EmployeeController.updateEmployee
);

// Delete / Archive employee (Admin only)
employeeRouter.delete(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  EmployeeController.deleteEmployee
);

// -----------------------------------------------------------------------------
// 2. Document Generation Workflow Routes
// -----------------------------------------------------------------------------
// Preview document for employee (Interpolated with real employee data)
employeeRouter.post(
  '/:employeeId/preview-document',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  EmployeeController.previewDocument
);

// Generate Document for employee
employeeRouter.post(
  '/:employeeId/generate-document',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  EmployeeController.generateDocument
);

// Regenerate Document (Creates Version N+1 with change reason)
employeeRouter.post(
  '/documents/:documentId/regenerate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  EmployeeController.regenerateDocument
);

// Update document lifecycle status (Draft -> Pending Review -> Approved -> Issued)
employeeRouter.patch(
  '/documents/:documentId/status',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'APPROVER'),
  EmployeeController.updateDocumentStatus
);

// Get single document
employeeRouter.get(
  '/documents/:documentId',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR', 'EMPLOYEE'),
  EmployeeController.getDocumentById
);

// Download PDF
employeeRouter.get(
  '/documents/:documentId/download-pdf',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR', 'EMPLOYEE'),
  EmployeeController.downloadPdf
);

// Download editable DOCX
employeeRouter.get(
  '/documents/:documentId/download-docx',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR', 'EMPLOYEE'),
  EmployeeController.downloadDocx
);

// Send Document by Email (Attach Generated PDF -> Send to Employee Email -> Save Email Log -> Save Document History)
employeeRouter.post(
  '/documents/:documentId/send-email',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  EmployeeController.sendDocumentEmail
);

// Get Document History & Email Logs
employeeRouter.get(
  '/documents/:documentId/history',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR', 'EMPLOYEE'),
  EmployeeController.getDocumentHistory
);

// Upload employee attachment / document
employeeRouter.post(
  '/:employeeId/upload-document',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'EMPLOYEE'),
  uploadDocumentMiddleware,
  EmployeeController.uploadEmployeeDocument
);

// -----------------------------------------------------------------------------
// 3. Optional AI Assistant Endpoints
// -----------------------------------------------------------------------------
employeeRouter.post(
  '/ai/suggest-wording',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  EmployeeController.aiSuggestWording
);

employeeRouter.post(
  '/ai/check-completeness',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  EmployeeController.aiCheckCompleteness
);

employeeRouter.post(
  '/ai/explain-clause',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  EmployeeController.aiExplainClause
);

employeeRouter.post(
  '/ai/flag-inconsistencies',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  EmployeeController.aiFlagInconsistencies
);
