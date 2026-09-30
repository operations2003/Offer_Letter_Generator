// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: MULTI-DOCUMENT AI ROUTES
// =============================================================================

import { Router } from 'express';
import { DocumentAiController } from './document-ai.controller.js';
import { requireAuth } from '../../../middleware/auth.js';
import { aiRateLimiter } from '../../../middleware/rate-limiter.js';

export const documentAiRouter = Router();

// Apply AI rate limiter to all AI routes
documentAiRouter.use(aiRateLimiter);

// 1. Extraction from source text
documentAiRouter.post('/extract', requireAuth, DocumentAiController.extractInformation);

// 2. Wording generation
documentAiRouter.post('/generate-wording', requireAuth, DocumentAiController.generateWording);

// 3. Wording improvement
documentAiRouter.post('/improve-wording', requireAuth, DocumentAiController.improveWording);

// 4. Section suggestions
documentAiRouter.post('/suggest-sections', requireAuth, DocumentAiController.suggestSections);

// 5. Missing information suggestions
documentAiRouter.post('/suggest-missing-info', requireAuth, DocumentAiController.suggestMissingInformation);

// 6. Comprehensive Quality Check (PASS | WARNING | REVIEW_REQUIRED)
documentAiRouter.post('/quality-check', requireAuth, DocumentAiController.qualityCheck);

// 7. Regenerate alternative variation
documentAiRouter.post('/regenerate', requireAuth, DocumentAiController.regenerateWording);
