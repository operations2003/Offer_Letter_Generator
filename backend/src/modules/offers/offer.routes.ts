import { Router } from 'express';
import { OfferController } from './offer.controller.js';
import { AiController } from '../ai/ai.controller.js';
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
  preGenerationAuditSchema,
  generateDocumentSchema,
  verifyTokenParamSchema,
  offerParamSchema,
  versionParamSchema,
} from './offer.validation.js';
import {
  assistantGenerateSchema,
  assistantImproveSchema,
  assistantRegenerateSchema,
  assistantAcceptSchema,
  assistantRejectSchema,
} from '../ai/ai.validation.js';

const router = Router();

// Public cryptographic verification endpoint (does not require login)
router.get(
  '/document/verify/:token',
  validateRequest({ params: verifyTokenParamSchema }),
  OfferController.verifyDocumentByToken
);

// Enforce JWT authentication on all internal offer routes
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

/**
 * AI Assistant Generate API
 */
router.post(
  '/ai/assistant/generate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantGenerateSchema }),
  AiController.generateAssistance
);

/**
 * AI Assistant Improve API
 */
router.post(
  '/ai/assistant/improve',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantImproveSchema }),
  AiController.improveText
);

/**
 * AI Assistant Regenerate API
 */
router.post(
  '/ai/assistant/regenerate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantRegenerateSchema }),
  AiController.regenerateAssistance
);

/**
 * AI Assistant Accept API
 */
router.post(
  '/ai/assistant/accept',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantAcceptSchema }),
  AiController.acceptAssistance
);

/**
 * AI Assistant Reject API
 */
router.post(
  '/ai/assistant/reject',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER'),
  validateRequest({ body: assistantRejectSchema }),
  AiController.rejectAssistance
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
 * Pre-Generation Audit (In-flight wizard payload check before formal generation)
 * Checks 9 categories and returns PASS / WARNING / REVIEW_REQUIRED
 */
router.post(
  '/pre-generation-check',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  validateRequest({ body: preGenerationAuditSchema }),
  OfferController.performPreGenerationCheck
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
 * Pre-Generation Audit for specific saved offer
 */
router.post(
  '/:id/pre-generation-check',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER'),
  validateRequest({ params: offerParamSchema, body: preGenerationAuditSchema }),
  OfferController.performPreGenerationCheck
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

// ---------------------------------------------------------------------------
// 5. LEGAL DOCUMENT GENERATION, PDF MINTING & SECURE STORAGE
// ---------------------------------------------------------------------------
/**
 * Generate Official Legal Offer Letter PDF (Strictly HR-Confirmed Data)
 */
router.post(
  '/:id/document/generate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ params: offerParamSchema, body: generateDocumentSchema }),
  OfferController.generateFinalDocument
);

/**
 * Regenerate Legal Offer Letter PDF (increments version and preserves audit log)
 */
router.post(
  '/:id/document/regenerate',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER'),
  validateRequest({ params: offerParamSchema, body: generateDocumentSchema }),
  OfferController.regenerateFinalDocument
);

/**
 * Download Stored PDF Document
 */
router.get(
  '/:id/document/download',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: offerParamSchema }),
  OfferController.downloadGeneratedDocument
);

/**
 * List All Generated Document Versions for Offer
 */
router.get(
  '/:id/documents',
  requireRoles('SUPER_ADMIN', 'HR_MANAGER', 'RECRUITER', 'APPROVER', 'AUDITOR'),
  validateRequest({ params: offerParamSchema }),
  OfferController.listOfferDocuments
);

export default router;
