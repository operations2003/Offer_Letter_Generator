import { z } from 'zod';

export const aiAssistanceTypes = [
  'professional_offer_wording',
  'welcome_intro_text',
  'job_description_wording',
  'general_clauses',
  'custom_hr_clauses',
  'grammar_improvement',
  'content_improvement',
] as const;

export const aiImprovementGoals = [
  'grammar',
  'clarity',
  'concise',
  'professional_legal',
  'warm_culture',
] as const;

/**
 * 1. AI Assistant Generate Schema
 */
export const assistantGenerateSchema = z.object({
  type: z.enum(aiAssistanceTypes),
  instruction: z.string().min(3, 'Instruction must be at least 3 characters long'),
  context: z.record(z.unknown()).optional().default({}),
  offerId: z.string().uuid().optional(),
});

/**
 * 2. AI Assistant Improve Schema
 */
export const assistantImproveSchema = z.object({
  type: z.enum(aiAssistanceTypes).optional().default('content_improvement'),
  text: z.string().min(5, 'Text to improve must be at least 5 characters long'),
  goal: z.enum(aiImprovementGoals).optional().default('clarity'),
  instruction: z.string().optional(),
  context: z.record(z.unknown()).optional().default({}),
  offerId: z.string().uuid().optional(),
});

/**
 * 3. AI Assistant Regenerate Schema
 */
export const assistantRegenerateSchema = z.object({
  generationId: z.string().optional(),
  type: z.enum(aiAssistanceTypes),
  previousContent: z.string().min(5, 'Previous content must be at least 5 characters long'),
  instruction: z.string().optional(),
  context: z.record(z.unknown()).optional().default({}),
  offerId: z.string().uuid().optional(),
  variationNumber: z.number().int().min(1).optional(),
});

/**
 * 4. AI Assistant Accept Schema
 */
export const assistantAcceptSchema = z.object({
  generationId: z.string().min(1, 'Generation ID is required'),
  content: z.string().min(1, 'Final content is required (must not be empty)'),
  offerId: z.string().uuid().optional(),
  targetField: z.string().optional(),
  hrFeedbackNotes: z.string().optional(),
});

/**
 * 5. AI Assistant Reject Schema
 */
export const assistantRejectSchema = z.object({
  generationId: z.string().min(1, 'Generation ID is required'),
  rejectionReason: z.string().optional(),
  offerId: z.string().uuid().optional(),
});
