import { z } from 'zod';
import { OfferStatus, TemplateCategory } from '@prisma/client';

export const candidateDetailsSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid candidate email is required'),
  phone: z.string().optional(),
  currentTitle: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentLocation: z.string().optional(),
  experienceYears: z.number().min(0).max(60).optional(),
});

export const partialCandidateDetailsSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Must be valid email if provided').optional(),
  phone: z.string().optional(),
  currentTitle: z.string().optional(),
  currentEmployer: z.string().optional(),
  currentLocation: z.string().optional(),
  experienceYears: z.number().min(0).max(60).optional(),
});

export const compensationSchema = z.object({
  currency: z.string().min(1).default('USD'),
  baseSalary: z.number().min(0, 'Base salary must be non-negative'),
  hraAllowance: z.number().min(0).optional().default(0),
  specialAllowances: z.number().min(0).optional().default(0),
  performanceBonus: z.number().min(0).optional().default(0),
  joiningBonus: z.number().min(0).optional().default(0),
  totalCtc: z.number().min(0).optional(),
  equityDetails: z
    .object({
      sharesCount: z.number().optional(),
      vestingPeriodMonths: z.number().optional(),
      cliffMonths: z.number().optional(),
      schemeType: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  benefitsSummary: z.array(z.string()).optional().default([]),
});

export const partialCompensationSchema = z.object({
  currency: z.string().optional().default('USD'),
  baseSalary: z.number().min(0).optional(),
  hraAllowance: z.number().min(0).optional(),
  specialAllowances: z.number().min(0).optional(),
  performanceBonus: z.number().min(0).optional(),
  joiningBonus: z.number().min(0).optional(),
  totalCtc: z.number().min(0).optional(),
  equityDetails: z.record(z.unknown()).optional(),
  benefitsSummary: z.array(z.string()).optional(),
});

export const probationSchema = z.object({
  durationMonths: z.number().min(0).max(36).optional(),
  durationDays: z.number().min(0).max(1095).optional(),
  terms: z.string().optional(),
  reviewCriteria: z.array(z.string()).optional(),
  isConfirmedByHr: z.boolean().optional().default(true),
});

export const noticePeriodSchema = z.object({
  days: z.number().min(0).max(365).optional(),
  probationDays: z.number().min(0).max(180).optional(),
  terms: z.string().optional(),
  isConfirmedByHr: z.boolean().optional().default(true),
});

export const workingHoursSchema = z.object({
  hoursPerWeek: z.number().min(1).max(168).optional(),
  schedule: z.string().optional(),
  workModel: z.enum(['ON_SITE', 'HYBRID', 'REMOTE']).optional(),
  terms: z.string().optional(),
  isConfirmedByHr: z.boolean().optional().default(true),
});

export const offerClauseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Clause title is required'),
  content: z.string().min(1, 'Clause content is required'),
  isMandatory: z.boolean().optional().default(false),
  isCustom: z.boolean().optional().default(false),
  isAiGenerated: z.boolean().optional().default(false),
  isConfirmedByHr: z.boolean().optional().default(true),
  displayOrder: z.number().optional(),
});

/**
 * 1. Create Offer Schema (Strict validation)
 */
export const createOfferSchema = z.object({
  candidateId: z.string().uuid().optional(),
  candidateDetails: candidateDetailsSchema.optional(),
  templateVersionId: z.string().uuid().optional(),
  jobTitle: z.string().min(2, 'Job title is required'),
  department: z.string().min(2, 'Department is required'),
  bandGrade: z.string().optional(),
  workLocation: z.string().min(2, 'Work location is required'),
  employmentType: z.nativeEnum(TemplateCategory).default(TemplateCategory.FULL_TIME),
  proposedJoiningDate: z.string().min(1, 'Proposed joining date is required'),
  reportingManagerName: z.string().optional(),
  reportingManagerTitle: z.string().optional(),
  compensation: compensationSchema,
  probation: probationSchema.optional(),
  noticePeriod: noticePeriodSchema.optional(),
  workingHours: workingHoursSchema.optional(),
  offerValidUntil: z.string().optional(),
  termsAndClauses: z.array(offerClauseSchema).optional().default([]),
  additionalHrTerms: z.record(z.unknown()).optional(),
  aiExtractedDataId: z.string().uuid().optional(),
  aiSuggestedTerms: z.record(z.unknown()).optional(),
  humanOverrides: z
    .array(
      z.object({
        fieldName: z.string(),
        previousValue: z.unknown(),
        newValue: z.unknown(),
        reason: z.string().optional(),
        timestamp: z.string().optional(),
      })
    )
    .optional(),
}).refine(
  (data) => Boolean(data.candidateId || data.candidateDetails),
  { message: 'Either candidateId or candidateDetails must be provided' }
);

/**
 * 2. Save Draft Schema (Permissive validation for work-in-progress)
 */
export const saveDraftSchema = z.object({
  candidateId: z.string().uuid().optional(),
  candidateDetails: partialCandidateDetailsSchema.optional(),
  templateVersionId: z.string().uuid().optional(),
  jobTitle: z.string().optional().default('Untitled Draft Offer'),
  department: z.string().optional().default('General'),
  bandGrade: z.string().optional(),
  workLocation: z.string().optional().default('Remote / TBD'),
  employmentType: z.nativeEnum(TemplateCategory).optional().default(TemplateCategory.FULL_TIME),
  proposedJoiningDate: z.string().optional(),
  reportingManagerName: z.string().optional(),
  reportingManagerTitle: z.string().optional(),
  compensation: partialCompensationSchema.optional(),
  probation: probationSchema.optional(),
  noticePeriod: noticePeriodSchema.optional(),
  workingHours: workingHoursSchema.optional(),
  offerValidUntil: z.string().optional(),
  termsAndClauses: z.array(offerClauseSchema).optional().default([]),
  additionalHrTerms: z.record(z.unknown()).optional(),
  aiExtractedDataId: z.string().uuid().optional(),
  aiSuggestedTerms: z.record(z.unknown()).optional(),
  changeReason: z.string().optional().default('Draft saved'),
});

/**
 * 3. Update Offer Schema
 */
export const updateOfferSchema = saveDraftSchema.extend({
  changeReason: z.string().min(1, 'Please specify the change reason for this version').default('Offer revised'),
});

/**
 * 4. Update Status Schema
 */
export const updateStatusSchema = z.object({
  targetStatus: z.nativeEnum(OfferStatus),
  reasonNotes: z.string().optional(),
});

/**
 * 5. AI Extraction Schema
 */
export const aiExtractionSchema = z.object({
  documentText: z.string().min(10, 'Document text must contain at least 10 characters'),
  candidateId: z.string().uuid().optional(),
});

/**
 * 6. AI Suggestions Schema
 */
export const aiSuggestionsSchema = z.object({
  role: z.string().optional(),
  department: z.string().optional(),
  seniorityLevel: z.string().optional(),
  workLocation: z.string().optional(),
  focusAreas: z.array(z.enum(['welcome_wording', 'benefits_recommendation', 'clauses_recommendation', 'role_perks'])).optional(),
});

/**
 * 7. Review AI Suggestion Schema
 */
export const reviewSuggestionSchema = z.object({
  isAccepted: z.boolean(),
  hrFeedbackNotes: z.string().optional(),
});

/**
 * 8. AI Clause Generation Schema
 */
export const aiClauseSchema = z.object({
  clauseType: z.string().min(2, 'Clause type is required'),
  instruction: z.string().min(5, 'Instruction must be at least 5 characters long'),
  context: z
    .object({
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      workLocation: z.string().optional(),
      employmentType: z.string().optional(),
      customParameters: z.record(z.unknown()).optional(),
    })
    .optional(),
});

/**
 * 9. AI Quality Check Schema
 */
export const aiQualityCheckSchema = z.object({
  customRules: z.array(z.string()).optional(),
});

export const offerParamSchema = z.object({
  id: z.string().uuid('Invalid offer ID format'),
});

export const versionParamSchema = z.object({
  id: z.string().uuid('Invalid offer ID format'),
  versionNumber: z.coerce.number().int().min(1),
});

/**
 * 10. Pre-Generation Audit Schema (Wizard in-flight check or loaded offer audit)
 */
export const preGenerationAuditSchema = z.object({
  candidate: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      currentLocation: z.string().optional(),
      currentTitle: z.string().optional(),
      currentEmployer: z.string().optional(),
      qualification: z.string().optional(),
      experienceYears: z.number().optional(),
    })
    .optional(),
  company: z
    .object({
      name: z.string().optional(),
      legalName: z.string().optional(),
      domain: z.string().optional(),
      address: z.string().optional(),
      signatoryName: z.string().optional(),
      signatoryTitle: z.string().optional(),
    })
    .optional(),
  jobDetails: z
    .object({
      jobTitle: z.string().optional(),
      department: z.string().optional(),
      bandGrade: z.string().optional(),
      workLocation: z.string().optional(),
      employmentType: z.string().optional(),
      proposedJoiningDate: z.string().optional(),
      reportingManagerName: z.string().optional(),
      reportingManagerTitle: z.string().optional(),
    })
    .optional(),
  compensation: z
    .object({
      currency: z.string().optional(),
      baseSalary: z.number().optional(),
      hraAllowance: z.number().optional(),
      specialAllowances: z.number().optional(),
      performanceBonus: z.number().optional(),
      joiningBonus: z.number().optional(),
      totalCtc: z.number().optional(),
      equityDetails: z.record(z.unknown()).optional(),
      benefitsSummary: z.array(z.string()).optional(),
    })
    .optional(),
  terms: z
    .object({
      probationDurationDays: z.number().optional(),
      probationDurationMonths: z.number().optional(),
      noticePeriodDays: z.number().optional(),
      probationNoticePeriodDays: z.number().optional(),
      workingHoursPerWeek: z.number().optional(),
      workSchedule: z.string().optional(),
      workModel: z.string().optional(),
      offerValidUntil: z.string().optional(),
      clauses: z
        .array(
          z.object({
            id: z.string().optional(),
            title: z.string(),
            content: z.string(),
            isMandatory: z.boolean().optional(),
            category: z.string().optional(),
          })
        )
        .optional(),
    })
    .optional(),
  templateMarkup: z
    .object({
      contentMarkup: z.string().optional(),
      headerMarkup: z.string().optional(),
      footerMarkup: z.string().optional(),
      styleCss: z.string().optional(),
    })
    .optional(),
  renderedHtml: z.string().optional(),
  plainText: z.string().optional(),
});

/**
 * 11. Document Generation Schema
 */
export const generateDocumentSchema = z.object({
  signatoryName: z.string().optional(),
  signatoryTitle: z.string().optional(),
  includeWatermark: z.boolean().optional().default(true),
  regenerationReason: z.string().optional(),
});

export const verifyTokenParamSchema = z.object({
  token: z.string().min(8, 'Invalid verification token format'),
});
