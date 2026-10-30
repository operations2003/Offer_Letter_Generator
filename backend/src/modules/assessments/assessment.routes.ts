// =============================================================================
// STEP 10: ASSESSMENT & QUIZZES ROUTES
// =============================================================================

import { Router } from 'express';
import { AssessmentController } from './assessment.controller.js';
import { authenticate } from '../../middleware/auth.js';

export function createAssessmentRouter(controller: AssessmentController = new AssessmentController()): Router {
  const router = Router();

  // Enforce authentication on all assessment and AI routes
  router.use(authenticate);

  // Question Bank & Review
  router.get('/questions', controller.listQuestions);
  router.post('/questions', controller.createQuestion);
  router.get('/questions/:id', controller.getQuestionById);
  router.post('/questions/:id/review', controller.reviewQuestion);

  // AI Question Generation & Refinement
  router.post('/ai/generate', controller.generateAiQuestions);
  router.post('/ai/improve', controller.improveQuestionWithAi);

  // Tests & Quizzes Management
  router.get('/tests', controller.listTests);
  router.post('/tests', controller.createTest);
  router.get('/tests/:id', controller.getTestById);
  router.post('/tests/:id/attempt', controller.submitAttempt);

  // Attempt History
  router.get('/attempts', controller.listAttemptResults);

  return router;
}
