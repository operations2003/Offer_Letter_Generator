// =============================================================================
// HR POLICY ENGINE: ROUTE DEFINITIONS
// =============================================================================

import { Router } from 'express';
import { PolicyController } from './policy.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const policyRouter = Router();

// Public / Authenticated read routes for policy types metadata
policyRouter.get('/types', PolicyController.getPolicyTypes);
policyRouter.get('/types/:code', PolicyController.getPolicyTypeByCode);

// Protected Policy Lifecycle Routes
policyRouter.use(authenticate);

policyRouter.post('/', PolicyController.createPolicy);
policyRouter.get('/', PolicyController.listPolicies);
policyRouter.post('/ai-assist', PolicyController.aiAssist);

policyRouter.get('/:id', PolicyController.getPolicyById);
policyRouter.put('/:id/sections', PolicyController.updateSections);
policyRouter.post('/:id/review', PolicyController.submitForReview);
policyRouter.post('/:id/approve', PolicyController.recordApproval);
policyRouter.post('/:id/publish', PolicyController.publishPolicy);
policyRouter.post('/:id/new-revision', PolicyController.createNewRevision);
policyRouter.post('/:id/acknowledge', PolicyController.recordAcknowledgment);
policyRouter.get('/:id/acknowledgments', PolicyController.getAcknowledgments);
policyRouter.get('/:id/versions', PolicyController.getVersionHistory);
policyRouter.post('/:id/archive', PolicyController.archivePolicy);
