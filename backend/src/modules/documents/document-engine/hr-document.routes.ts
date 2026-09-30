// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: ROUTE DEFINITIONS
// =============================================================================

import { Router } from 'express';
import { HrDocumentController } from './hr-document.controller.js';
import { authenticate } from '../../../middleware/auth.js';

export const documentTypeRouter = Router();
export const hrDocumentRouter = Router();

// Public / Authenticated read routes for document types configuration
documentTypeRouter.get('/', HrDocumentController.getDocumentTypes);
documentTypeRouter.get('/:code', HrDocumentController.getDocumentTypeByCode);

// HR Document Lifecycle Routes (Protected by auth)
hrDocumentRouter.use(authenticate);

hrDocumentRouter.post('/', HrDocumentController.createDocument);
hrDocumentRouter.get('/', HrDocumentController.listDocuments);
hrDocumentRouter.get('/:id', HrDocumentController.getDocumentById);
hrDocumentRouter.post('/:id/ai-ingest', HrDocumentController.ingestAiData);
hrDocumentRouter.put('/:id/confirm-terms', HrDocumentController.confirmTerms);
hrDocumentRouter.post('/:id/generate-pdf', HrDocumentController.generatePdf);
hrDocumentRouter.post('/:id/regenerate-pdf', HrDocumentController.regeneratePdf);
hrDocumentRouter.get('/:id/preview-pdf', HrDocumentController.previewPdf);
hrDocumentRouter.get('/:id/download-pdf', HrDocumentController.downloadPdf);
hrDocumentRouter.get('/:id/versions', HrDocumentController.getVersionHistory);
hrDocumentRouter.get('/:id/audit-trail', HrDocumentController.getAuditTrail);
hrDocumentRouter.post('/:id/rollback', HrDocumentController.rollback);
hrDocumentRouter.patch('/:id/status', HrDocumentController.updateStatus);
hrDocumentRouter.delete('/:id', HrDocumentController.softDelete);
