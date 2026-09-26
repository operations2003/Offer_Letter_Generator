import { z } from 'zod';
import { AiCandidateExtractionData, AiPolicyComplianceResult } from './types.js';

const fieldSchema = <T extends z.ZodTypeAny>(valueType: T) =>
  z.object({
    value: valueType.nullable().default(null),
    confidenceScore: z.number().min(0).max(1).default(0),
    sourceSnippet: z.string().optional(),
    validationWarning: z.string().optional(),
    isDetected: z.boolean().optional(),
  }).transform((val) => ({
    ...val,
    isDetected: val.isDetected !== undefined ? val.isDetected : val.value !== null,
  }));

const candidateExtractionSchema = z.object({
  candidateName: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  email: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  phone: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  address: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  qualification: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  experience: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  currentEmployer: fieldSchema(z.string()).optional(),
  currentTitle: fieldSchema(z.string()).optional(),
  designation: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  department: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  location: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  joiningDate: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  employmentType: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  reportingManager: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  otherDetails: fieldSchema(z.string()).default({ value: null, confidenceScore: 0, isDetected: false }),
  currency: fieldSchema(z.string()).default({ value: 'USD', confidenceScore: 0.9, isDetected: true }),
  baseSalary: fieldSchema(z.number()).default({ value: null, confidenceScore: 0, isDetected: false }),
  hraAllowance: fieldSchema(z.number()).default({ value: null, confidenceScore: 0, isDetected: false }),
  specialAllowances: fieldSchema(z.number()).default({ value: null, confidenceScore: 0, isDetected: false }),
  performanceBonus: fieldSchema(z.number()).default({ value: null, confidenceScore: 0, isDetected: false }),
  joiningBonus: fieldSchema(z.number()).default({ value: null, confidenceScore: 0, isDetected: false }),
  totalCtc: fieldSchema(z.number()).default({ value: null, confidenceScore: 0, isDetected: false }),
  warnings: z.array(z.string()).default([]),
  missingFields: z.array(z.string()).default([]),
});

export class JsonValidator {
  /**
   * Validates and normalizes candidate extraction payload
   */
  static validateCandidateExtraction(rawJson: unknown): AiCandidateExtractionData {
    const parsed = candidateExtractionSchema.parse(rawJson);

    // Identify all missing fields that were not detected
    const coreFields: Array<{ name: string; isDetected: boolean; value: unknown }> = [
      { name: 'Name', isDetected: parsed.candidateName.isDetected, value: parsed.candidateName.value },
      { name: 'Email', isDetected: parsed.email.isDetected, value: parsed.email.value },
      { name: 'Phone', isDetected: parsed.phone.isDetected, value: parsed.phone.value },
      { name: 'Address', isDetected: parsed.address.isDetected, value: parsed.address.value },
      { name: 'Qualification', isDetected: parsed.qualification.isDetected, value: parsed.qualification.value },
      { name: 'Experience', isDetected: parsed.experience.isDetected, value: parsed.experience.value },
      { name: 'Designation', isDetected: parsed.designation.isDetected, value: parsed.designation.value },
      { name: 'Department', isDetected: parsed.department.isDetected, value: parsed.department.value },
      { name: 'Location', isDetected: parsed.location.isDetected, value: parsed.location.value },
      { name: 'Joining Date', isDetected: parsed.joiningDate.isDetected, value: parsed.joiningDate.value },
      { name: 'Employment Type', isDetected: parsed.employmentType.isDetected, value: parsed.employmentType.value },
      { name: 'Reporting Manager', isDetected: parsed.reportingManager.isDetected, value: parsed.reportingManager.value },
      { name: 'Other Relevant Details', isDetected: parsed.otherDetails.isDetected, value: parsed.otherDetails.value },
      { name: 'Base Salary', isDetected: parsed.baseSalary.isDetected, value: parsed.baseSalary.value },
    ];

    const missingFields: string[] = [];
    let detectedCount = 0;
    let confidenceSum = 0;

    for (const f of coreFields) {
      if (!f.value || !f.isDetected) {
        missingFields.push(f.name);
      } else {
        detectedCount++;
      }
    }

    // Tally overall confidence
    const allFieldObjs = [
      parsed.candidateName,
      parsed.email,
      parsed.phone,
      parsed.address,
      parsed.qualification,
      parsed.experience,
      parsed.designation,
      parsed.department,
      parsed.location,
      parsed.joiningDate,
      parsed.employmentType,
      parsed.reportingManager,
      parsed.baseSalary,
    ];

    for (const obj of allFieldObjs) {
      if (obj.isDetected && obj.value !== null) {
        confidenceSum += obj.confidenceScore;
      }
    }

    const overallConfidenceScore =
      detectedCount > 0 ? Number((confidenceSum / detectedCount).toFixed(2)) : 0;

    const warnings = [...parsed.warnings];
    if (missingFields.length > 0 && !warnings.some((w) => w.includes('not present in the document'))) {
      warnings.push(`${missingFields.length} field(s) were absent in the document and have not been assumed.`);
    }

    return {
      ...parsed,
      missingFields,
      warnings,
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
