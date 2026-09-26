import { Router } from 'express';
import { AiController } from './ai.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import { z } from 'zod';

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

export default router;
