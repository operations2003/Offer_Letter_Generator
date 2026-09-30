import { Router } from 'express';
import { OnboardingController } from './onboarding.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();
const controller = new OnboardingController();

// Config routes
router.get('/config', authenticate, controller.getFormConfig);
router.put('/config', authenticate, controller.updateFormConfig);

// Candidate routes
router.get('/candidates', authenticate, controller.listCandidates);
router.post('/candidates', authenticate, controller.initiateOnboarding);
router.get('/candidates/:id', authenticate, controller.getCandidateById);
router.put('/candidates/:id/draft', authenticate, controller.saveDraft);
router.put('/candidates/:id/submit', authenticate, controller.submitForm);

// Document collection routes
router.post('/candidates/:id/documents', authenticate, controller.uploadDocument);
router.post('/candidates/:id/documents/:docId/verify', authenticate, controller.verifyDocument);

// Joining checklist & HR review routes
router.put('/candidates/:id/checklist/:itemId', authenticate, controller.updateChecklistItem);
router.post('/candidates/:id/review', authenticate, controller.reviewCandidate);

export const onboardingRouter = router;
export default router;
