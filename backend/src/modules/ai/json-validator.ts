import { z } from 'zod';
import { AiCandidateExtractionData, AiPolicyComplianceResult } from './types.js';

const fieldSchema = <T extends z.ZodTypeAny>(valueType: T) =>
  z.object({
    value: valueType.nullable().default(null),
    confidenceScore: z.number().min(0).max(1).default(0.5),
    sourceSnippet: z.string().optional(),
    validationWarning: z.string().optional(),
  });

const candidateExtractionSchema = z.object({
  candidateName: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  email: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  phone: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  currentEmployer: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  currentTitle: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  offeredRole: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  department: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  experienceYears: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  proposedJoiningDate: fieldSchema(z.string()).default({ value: null, confidenceScore: 0 }),
  currency: fieldSchema(z.string()).default({ value: 'USD', confidenceScore: 0.9 }),
  baseSalary: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  hraAllowance: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  specialAllowances: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  performanceBonus: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  joiningBonus: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  totalCtc: fieldSchema(z.number()).default({ value: null, confidenceScore: 0 }),
  warnings: z.array(z.string()).default([]),
});

export class JsonValidator {
  /**
   * Validates and normalizes candidate extraction payload
   */
  static validateCandidateExtraction(rawJson: unknown): AiCandidateExtractionData {
    const parsed = candidateExtractionSchema.parse(rawJson);

    // Compute weighted overall confidence score
    const scoredFields = [
      parsed.candidateName,
      parsed.email,
      parsed.offeredRole,
      parsed.baseSalary,
      parsed.totalCtc,
    ];

    const sum = scoredFields.reduce((acc, f) => acc + (f.value !== null ? f.confidenceScore : 0), 0);
    const overallConfidenceScore = Number((sum / scoredFields.length).toFixed(2));

    return {
      ...parsed,
      overallConfidenceScore,
    };
  }

  /**
   * Validates policy compliance results
   */
  static validatePolicyCheck(rawJson: unknown): AiPolicyComplianceResult {
    const policySchema = z.object({
      isCompliant: z.boolean().default(true),
      overallRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
      findings: z
        .array(
          z.object({
            ruleName: z.string(),
            isViolated: z.boolean(),
            severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
            detail: z.string(),
            suggestedRemedy: z.string().optional(),
          })
        )
        .default([]),
    });

    return policySchema.parse(rawJson);
  }
}
