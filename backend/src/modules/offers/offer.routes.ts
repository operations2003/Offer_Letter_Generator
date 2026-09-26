import { Router } from 'express';
import { OfferController } from './offer.controller.js';
import { authenticate, requireRoles } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';
import {
  createOfferSchema,
  saveDraftSchema,
  updateOfferSchema,
  updateStatusSchema,
  aiExtractionSchema,
  aiSuggestionsSchema,
  reviewSuggestionSchema,
  aiClauseSchema,
  aiQualityCheckSchema,
  offerParamSchema,
  versionParamSchema,
} from './offer.validation.js';

const router = Router();

// Enforce JWT authentication on all offer routes
router.use(authenticate);

// ---------------------------------------------------------------------------
// 1. AI ASSISTANCE ENDPOINTS (Advisory Only - Sensitive Fields Guardrail)
// ---------------------------------------------------------------------------
/**
 * AI Extraction: Extracts candidate and proposed terms from document text
 */
router.post(
  '/ai/extract',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: aiExtractionSchema }),
  OfferController.extractFromAi
);

/**
 * AI Clause Generation: Drafts standard or customized legal clause wording
 */
router.post(
  '/ai/generate-clause',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: aiClauseSchema }),
  OfferController.generateAiClause
);

/**
 * Global AI Suggestions: Generates wording, role perks, or clause suggestions
 */
router.post(
  '/ai/suggestions',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: aiSuggestionsSchema }),
  OfferController.generateAiSuggestions
);

/**
 * Review AI Suggestion: Mark accepted / rejected with feedback
 */
router.patch(
  '/ai/suggestions/:suggestionId/review',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ body: reviewSuggestionSchema }),
  OfferController.reviewAiSuggestion
);

// ---------------------------------------------------------------------------
// 2. OFFER CREATION & DRAFT ENDPOINTS
// ---------------------------------------------------------------------------
/**
 * Save New Draft Offer
 */
router.post(
  '/draft',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: saveDraftSchema }),
  OfferController.saveNewDraft
);

/**
 * Create Formal Offer
 */
router.post(
  '/',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: createOfferSchema }),
  OfferController.createOffer
);

/**
 * List Offers (paginated and filtered)
 */
router.get(
  '/',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  OfferController.listOffers
);

// ---------------------------------------------------------------------------
// 3. SINGLE OFFER OPERATIONS & AI COPILOT
// ---------------------------------------------------------------------------
/**
 * Update Existing Draft
 */
router.put(
  '/:id/draft',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ params: offerParamSchema, body: saveDraftSchema }),
  OfferController.updateDraft
);

/**
 * Update Offer (creates new version with snapshot & diff)
 */
router.put(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ params: offerParamSchema, body: updateOfferSchema }),
  OfferController.updateOffer
);

/**
 * Get Offer by ID
 */
router.get(
  '/:id',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: offerParamSchema }),
  OfferController.getOfferById
);

/**
 * AI Suggestions for Specific Offer Context
 */
router.post(
  '/:id/ai/suggestions',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ params: offerParamSchema, body: aiSuggestionsSchema }),
  OfferController.generateAiSuggestions
);

/**
 * AI Quality Check (audits completeness, compensation math, sensitive fields)
 */
router.post(
  '/:id/ai/quality-check',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'APPROVER'),
  validateRequest({ params: offerParamSchema, body: aiQualityCheckSchema }),
  OfferController.performQualityCheck
);

/**
 * Offer Preview (interpolated HTML/text with compensation tables and clauses)
 */
router.get(
  '/:id/preview',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: offerParamSchema }),
  OfferController.getOfferPreview
);

/**
 * Get Offer Status & Allowed Transitions
 */
router.get(
  '/:id/status',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: offerParamSchema }),
  OfferController.getOfferStatus
);

/**
 * Update Offer Status (transitions state machine)
 */
router.patch(
  '/:id/status',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'APPROVER'),
  validateRequest({ params: offerParamSchema, body: updateStatusSchema }),
  OfferController.updateOfferStatus
);

// ---------------------------------------------------------------------------
// 4. VERSIONING & HISTORY
// ---------------------------------------------------------------------------
/**
 * List Offer Versions
 */
router.get(
  '/:id/versions',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: offerParamSchema }),
  OfferController.getOfferVersions
);

/**
 * Get Specific Offer Version Snapshot
 */
router.get(
  '/:id/versions/:versionNumber',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: versionParamSchema }),
  OfferController.getOfferVersionByNumber
);

/**
 * Restore Previous Offer Version
 */
router.post(
  '/:id/versions/:versionNumber/restore',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ params: versionParamSchema }),
  OfferController.restoreOfferVersion
);

export default router;
