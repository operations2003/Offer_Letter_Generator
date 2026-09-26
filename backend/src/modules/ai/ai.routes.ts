import { Router } from 'express';
import { AiController } from './ai.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { uploadDocumentMiddleware } from '../../middleware/upload.js';
import { z } from 'zod';
import {
  assistantGenerateSchema,
  assistantImproveSchema,
  assistantRegenerateSchema,
  assistantAcceptSchema,
  assistantRejectSchema,
} from './ai.validation.js';

const router = Router();



router.use(authenticate);

const extractSchema = z.object({
  documentText: z
    .string()
    .min(10, 'Document text must be at least 10 characters long to extract candidate details'),
});

const policySchema = z.object({
  terms: z.record(z.unknown()),
  rules: z.array(z.string()).min(1, 'At least one policy rule must be supplied'),
});

const clauseSchema = z.object({
  instruction: z.string().min(5, 'Instruction must be at least 5 characters'),
  context: z.record(z.unknown()).optional(),
});

router.get('/status', AiController.getStatus);

// Document File Upload & Extraction (PDF, DOCX, TXT)
router.post(
  '/upload-and-extract',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  uploadDocumentMiddleware,
  AiController.uploadAndExtract
);

// Raw Text Candidate Extraction
router.post(
  '/extract-candidate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: extractSchema }),
  AiController.extractCandidate
);

router.post(
  '/check-policy',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'APPROVER'),
  validateRequest({ body: policySchema }),
  AiController.checkPolicy
);


router.post(
  '/draft-clause',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: clauseSchema }),
  AiController.draftClause
);

// ---------------------------------------------------------------------------
// AI ASSISTANT APIS: GENERATE / IMPROVE / REGENERATE / ACCEPT / REJECT
// Strict Guardrails: AI must not invent company policies or legal obligations.
// All content is editable and must be reviewed by HR.
// ---------------------------------------------------------------------------

/**
 * 1. AI Assistant: Generate (offer wording, welcome text, JD wording, general clauses, custom HR clauses)
 */
router.post(
  '/assistant/generate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantGenerateSchema }),
  AiController.generateAssistance
);

/**
 * 2. AI Assistant: Improve (grammar improvement, content improvement, clarity, legal precision)
 */
router.post(
  '/assistant/improve',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantImproveSchema }),
  AiController.improveText
);

/**
 * 3. AI Assistant: Regenerate (alternative variation generation)
 */
router.post(
  '/assistant/regenerate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantRegenerateSchema }),
  AiController.regenerateAssistance
);

/**
 * 4. AI Assistant: Accept (HR review confirmation of edited or accepted AI text)
 */
router.post(
  '/assistant/accept',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantAcceptSchema }),
  AiController.acceptAssistance
);

/**
 * 5. AI Assistant: Reject (HR rejection with optional feedback)
 */
router.post(
  '/assistant/reject',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantRejectSchema }),
  AiController.rejectAssistance
);

export default router;

