import { Router } from 'express';
import { TemplateController } from './template.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';
import { uploadDocumentMiddleware } from '../../middleware/upload.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  duplicateTemplateSchema,
  toggleActiveSchema,
  aiSuggestSchema,
} from './template.validation.js';
import { validateRequest } from '../../middleware/validate.js';

const router = Router();

router.use(authenticate);

// 0. Upload Template Document (DOCX / PDF)
router.post(
  '/upload',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  uploadDocumentMiddleware,
  TemplateController.uploadTemplate
);

// 1. Placeholder catalog
router.get('/placeholders/catalog', TemplateController.getCatalog);

// 2. AI Placeholder Detection & Suggestions (Advisory only)
router.post(
  '/ai-suggest-placeholders',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: aiSuggestSchema }),
  TemplateController.aiSuggest
);

// 3. Create Template (creates v1)
router.post(
  '/',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: createTemplateSchema }),
  TemplateController.create
);

// 4. List Templates
router.get('/', TemplateController.list);

// 5. Get Template by ID
router.get('/:id', TemplateController.getById);

// 6. Update Template (auto-increments version if markup changed)
router.put(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: updateTemplateSchema }),
  TemplateController.update
);

// 7. Duplicate Template
router.post(
  '/:id/duplicate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: duplicateTemplateSchema }),
  TemplateController.duplicate
);

// 8. Activate / Deactivate Template
router.patch(
  '/:id/status',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: toggleActiveSchema }),
  TemplateController.toggleActive
);

// 9. Version History
router.get('/:id/versions', TemplateController.getVersionHistory);

// 10. Publish / Rollback to a specific Version
router.post(
  '/:id/versions/:versionNumber/publish',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  TemplateController.publishVersion
);

export default router;
