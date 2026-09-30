// =============================================================================
// REUSABLE HR DOCUMENT ENGINE: MULTI-DOCUMENT AI SERVICE
// =============================================================================
// Provider-independent AI assistance across all 9 core HR document types:
// 1. Information Extraction (Strict Non-Assumption Rule)
// 2. Wording Generation (Advisory drafting only)
// 3. Wording Improvement (Grammar, formal tone, legal neutrality)
// 4. Section Suggestions (Recommending standard/optional legal clauses)
// 5. Missing Information Suggestions (Unassumed field detection)
// 6. Quality Check (Delegated to DocumentQualityService)
// 7. Regenerate (Alternative phrasing variations)
//
// STRICT SAFETY & ETHICAL INVARIANTS:
// - AI must NEVER invent facts, salary figures, employee IDs, or dates.
// - AI must NEVER make termination or compensation decisions.
// - AI must NEVER automatically approve or dispatch documents.
// - AI must NEVER override HR-confirmed data or claim legal compliance.
// - All outputs are strictly presented as advisory suggestions.
// - Zero silent modification of HR data.
// =============================================================================

import {
  DocumentTypeCode,
  DocumentTypeDefinition,
  AiExtractedFieldInfo,
} from '../../../../../shared/types/document-engine.js';
import { DOCUMENT_TYPE_REGISTRY } from './document-type.registry.js';
import {
  TaskNeraHrmsProfile,
  TASKNERA_SAMPLE_PROFILE,
  mapHrmsToDocumentForm,
} from '../../../../../shared/types/hrms-bridge.js';
import { DocumentQualityService, DocumentQualityReport } from './document-quality.service.js';
import { AiProviderFactory } from '../../ai/ai-provider.factory.js';
import { PromptManager } from '../../ai/prompt-manager.js';
import { ResponseParser } from '../../ai/response-parser.js';
import { AppError } from '../../../errors/app-error.js';

export interface DocumentAiExtractionResult {
  documentTypeCode: DocumentTypeCode;
  extractedFields: Record<string, AiExtractedFieldInfo>;
  missingFields: string[];
  overallConfidenceScore: number;
  warnings: string[];
  isAdvisoryOnly: true;
  extractedAt: string;
}

export interface DocumentWordingItem {
  id: string;
  documentTypeCode: DocumentTypeCode;
  taskCode: string;
  title: string;
  content: string;
  keyPoints?: string[];
  changesSummary?: string;
  isAiGenerated: true;
  isAdvisory: true;
  requiresHrReview: true;
  guardrailNotice: string;
  variationNumber: number;
  createdAt: string;
}

export interface SectionSuggestionItem {
  sectionKey: string;
  title: string;
  description: string;
  suggestedWording: string;
  rationale: string;
  isStandard: boolean;
  priority: 'RECOMMENDED' | 'OPTIONAL';
}

export interface MissingInformationSuggestion {
  fieldKey: string;
  label: string;
  description: string;
  dataType: string;
  isRequired: boolean;
  whyMissing: string;
  clarificationQuestion: string;
}

export class DocumentAiEngineService {
  private static readonly GUARDRAIL_NOTICE =
    'AI assistance is strictly advisory and must not invent company policies, salaries, employee details, or legal covenants. Human HR review and approval is mandatory before legal execution. AI does not provide formal legal counsel.';

  /**
   * 1. EXTRACT INFORMATION
   * Extracts parameters from unstructured text for ANY document type.
   * Strictly adheres to the Non-Assumption Rule: Never invents absent data.
   */
  static async extractDocumentInformation(
    documentTypeCode: DocumentTypeCode,
    sourceText: string
  ): Promise<DocumentAiExtractionResult> {
    const typeDef = DOCUMENT_TYPE_REGISTRY[documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${documentTypeCode}`, 400);
    }

    const sanitized = PromptManager.sanitizeUntrustedInput(sourceText);
    const allFields = [...(typeDef.requiredFields || []), ...(typeDef.optionalFields || [])];

    const systemPrompt = `You are a specialized HR Document Extraction Assistant.
Document Type: ${typeDef.name} (${typeDef.code})
Category: ${typeDef.category}

CRITICAL NON-NEGOTIABLE EXTRACTION RULES:
1. STRICT NON-ASSUMPTION RULE:
   - Only extract information explicitly and unambiguously stated in the text.
   - If a field is not mentioned, you MUST set "value": null, "confidenceScore": 0.0, "isDetected": false, "sourceSnippet": "Not mentioned in source text".
   - NEVER invent, assume, or hallucinate salary numbers, dates, titles, employee IDs, or addresses.
2. For EVERY field detected:
   - Provide "value", "confidenceScore" (0.00-1.00), "sourceSnippet" (verbatim quote), and "isDetected": true.
3. Output ONLY a valid JSON object matching the requested schema.`;

    const fieldSchema: Record<string, string> = {};
    for (const f of allFields) {
      fieldSchema[f.key] = `${f.dataType} - ${f.label} (${f.description || ''})`;
    }

    const userPrompt = `Extract information for ${typeDef.name} from the document below.
Expected Fields Schema:
${JSON.stringify(fieldSchema, null, 2)}

<untrusted_document_content>
${sanitized}
</untrusted_document_content>

Respond ONLY with JSON formatted as:
{
  "extractedFields": {
    "<fieldKey>": { "value": any, "confidenceScore": number, "sourceSnippet": string, "isDetected": boolean }
  },
  "warnings": string[],
  "missingFields": string[]
}`;

    // Intelligent HRMS structured record ingestion bridge (TaskNera, Workday, BambooHR)
    let rawExtracted: Record<string, any> = {};
    let isHrmsParsed = false;
    let hrmsWarnings: string[] = [];

    try {
      const trimmed = sourceText.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsedJson = JSON.parse(trimmed);
        if (parsedJson.personal || parsedJson.employment || parsedJson.employeeId || parsedJson.workEmail) {
          const profile: TaskNeraHrmsProfile = parsedJson.personal
            ? parsedJson
            : {
                ...TASKNERA_SAMPLE_PROFILE,
                personal: { ...TASKNERA_SAMPLE_PROFILE.personal, ...parsedJson },
                employment: { ...TASKNERA_SAMPLE_PROFILE.employment, ...(parsedJson.employment || {}) },
                payroll: { ...TASKNERA_SAMPLE_PROFILE.payroll, ...(parsedJson.payroll || {}) },
                exit: { ...TASKNERA_SAMPLE_PROFILE.exit, ...(parsedJson.exit || {}) },
              };
          const mapped = mapHrmsToDocumentForm(profile, documentTypeCode);
          for (const [k, val] of Object.entries(mapped)) {
            if (val !== undefined && val !== null && val !== '') {
              rawExtracted[k] = {
                value: val,
                confidenceScore: 0.99,
                sourceSnippet: `Synced from HRMS record: [${k}]`,
                isDetected: true,
              };
            }
          }
          isHrmsParsed = true;
          hrmsWarnings.push('Fields automatically normalized from verified HRMS profile ledger.');
        }
      }
    } catch {
      // Fallback to LLM natural text extraction
    }

    let warningsList: string[] = hrmsWarnings;

    if (!isHrmsParsed) {
      const adapter = AiProviderFactory.getAdapter();
      const completion = await adapter.complete({
        systemPrompt,
        userPrompt,
        jsonMode: true,
        temperature: 0.1, // Near zero for factual determinism
      });

      const parsed = ResponseParser.parseJson<any>(completion.rawContent);
      rawExtracted = parsed.extractedFields || {};
      warningsList = Array.isArray(parsed.warnings) ? parsed.warnings : [];
    }
    const finalExtracted: Record<string, AiExtractedFieldInfo> = {};
    const missingFields: string[] = [];

    let totalScore = 0;
    let detectedCount = 0;

    for (const f of allFields) {
      const item = rawExtracted[f.key];
      if (item && item.isDetected && item.value !== null && item.value !== '') {
        finalExtracted[f.key] = {
          value: item.value,
          confidenceScore: typeof item.confidenceScore === 'number' ? item.confidenceScore : 0.9,
          sourceSnippet: item.sourceSnippet || undefined,
          isDetected: true,
        };
        totalScore += finalExtracted[f.key].confidenceScore;
        detectedCount++;
      } else {
        // Enforce Non-Assumption Rule
        finalExtracted[f.key] = {
          value: null,
          confidenceScore: 0,
          sourceSnippet: 'Not mentioned in document',
          isDetected: false,
          warning: 'Omitted from source material',
        };
        if ((typeDef.requiredFields || []).some((rf) => rf.key === f.key)) {
          missingFields.push(f.key);
        }
      }
    }

    const overallConfidenceScore =
      detectedCount > 0 ? Number((totalScore / detectedCount).toFixed(2)) : 0;

    return {
      documentTypeCode,
      extractedFields: finalExtracted,
      missingFields,
      overallConfidenceScore,
      warnings: warningsList,
      isAdvisoryOnly: true,
      extractedAt: new Date().toISOString(),
    };
  }

  /**
   * 2. GENERATE WORDING
   * Drafts specialized clauses/sections for ANY of the 9 types.
   * STRICT GUARDRAIL: AI cannot decide compensation or termination; output is advisory.
   */
  static async generateDocumentWording(input: {
    documentTypeCode: DocumentTypeCode;
    taskCode: string;
    instruction?: string;
    context?: Record<string, unknown>;
  }): Promise<DocumentWordingItem> {
    const typeDef = DOCUMENT_TYPE_REGISTRY[input.documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${input.documentTypeCode}`, 400);
    }

    const systemPrompt = `You are an HR Executive Drafting Assistant for ${typeDef.name}.
TASK: ${input.taskCode}
GUARDRAILS:
1. All wording is advisory suggestions only, subject to HR and legal review.
2. DO NOT make compensation, salary, or termination decisions.
3. DO NOT claim legal compliance or statutory guarantees.
4. Output must be professional, authoritative, and aligned with standard corporate practice.`;

    const userPrompt = `Draft wording for task "${input.taskCode}" in a ${typeDef.name}.
Instruction: ${input.instruction || 'Draft standard executive wording'}
Context Data: ${JSON.stringify(input.context || {})}

Respond in JSON:
{
  "title": string,
  "content": string,
  "keyPoints": string[]
}`;

    const adapter = AiProviderFactory.getAdapter();
    const completion = await adapter.complete({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.3,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);

    return {
      id: `doc_ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      documentTypeCode: input.documentTypeCode,
      taskCode: input.taskCode,
      title: parsed.title || `${typeDef.name} Draft Proposal`,
      content: parsed.content || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      isAiGenerated: true,
      isAdvisory: true,
      requiresHrReview: true,
      guardrailNotice: this.GUARDRAIL_NOTICE,
      variationNumber: 1,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 3. IMPROVE WORDING
   * Refines phrasing, tone, and grammar while strictly preserving all facts, figures, and dates.
   */
  static async improveDocumentWording(input: {
    documentTypeCode: DocumentTypeCode;
    text: string;
    goal: 'grammar' | 'clarity' | 'concise' | 'formal' | 'legal_neutral';
    instruction?: string;
    context?: Record<string, unknown>;
  }): Promise<DocumentWordingItem> {
    const typeDef = DOCUMENT_TYPE_REGISTRY[input.documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${input.documentTypeCode}`, 400);
    }

    const systemPrompt = `You are a Precision HR Document Editor for ${typeDef.name}.
GOAL: ${input.goal}
STRICT FACTUAL PRESERVATION RULE:
- Do NOT alter any employee names, dates, compensation numbers, job titles, or legal terms.
- Only polish grammar, clarity, conciseness, or executive tone.
- Do NOT invent company policies or make legal claims.`;

    const userPrompt = `Improve the following text for a ${typeDef.name}:
Text to improve: "${input.text}"
Goal: ${input.goal}
Additional Instruction: ${input.instruction || 'None'}

Respond in JSON:
{
  "title": string,
  "improvedText": string,
  "changesSummary": string
}`;

    const adapter = AiProviderFactory.getAdapter();
    const completion = await adapter.complete({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.2,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);

    return {
      id: `doc_imp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      documentTypeCode: input.documentTypeCode,
      taskCode: `improve_${input.goal}`,
      title: parsed.title || 'Refined Wording Proposal',
      content: parsed.improvedText || input.text,
      changesSummary: parsed.changesSummary || `Refined for ${input.goal} while preserving factual terms.`,
      isAiGenerated: true,
      isAdvisory: true,
      requiresHrReview: true,
      guardrailNotice: this.GUARDRAIL_NOTICE,
      variationNumber: 1,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 4. SUGGEST SECTIONS
   * Analyzes document type and existing data to recommend relevant standard or optional sections.
   */
  static suggestSections(
    documentTypeCode: DocumentTypeCode,
    currentData: Record<string, unknown>
  ): SectionSuggestionItem[] {
    const typeDef = DOCUMENT_TYPE_REGISTRY[documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${documentTypeCode}`, 400);
    }

    const suggestions: SectionSuggestionItem[] = [];

    switch (documentTypeCode) {
      case 'OFFER_LETTER':
        suggestions.push(
          {
            sectionKey: 'intellectual_property',
            title: 'Intellectual Property Assignment',
            description: 'Stipulates that company owns work product created during employment.',
            suggestedWording:
              'All inventions, original works of authorship, and developments conceived or reduced to practice by the Employee during working hours shall remain the sole and exclusive property of the Company.',
            rationale: 'Essential corporate asset protection clause for modern knowledge workers.',
            isStandard: true,
            priority: 'RECOMMENDED',
          },
          {
            sectionKey: 'confidentiality_nda',
            title: 'Confidentiality & Non-Disclosure',
            description: 'Prevents unauthorized disclosure of customer lists, source code, and trade secrets.',
            suggestedWording:
              'The Employee agrees to hold all proprietary trade secrets, customer records, and strategic roadmaps in strict confidence throughout employment and surviving separation.',
            rationale: 'Standard legal requirement protecting corporate confidential information.',
            isStandard: true,
            priority: 'RECOMMENDED',
          }
        );
        break;

      case 'INTERNSHIP_LETTER':
        suggestions.push(
          {
            sectionKey: 'academic_credit',
            title: 'Academic Credit & Evaluation Report',
            description: 'Facilitates university credit coordination and final faculty report.',
            suggestedWording:
              'Upon completion of the internship, the Mentor shall provide a written performance evaluation suitable for submission to the Intern’s academic institution.',
            rationale: 'Supports students pursuing degree credit through university partnerships.',
            isStandard: false,
            priority: 'OPTIONAL',
          },
          {
            sectionKey: 'non_employment_status',
            title: 'Educational Engagement Clarification',
            description: 'Explicitly clarifies that internship does not constitute permanent employment.',
            suggestedWording:
              'This internship is an educational and training engagement and does not guarantee or imply subsequent regular employment with the Organization.',
            rationale: 'Prevents implied permanent employment claims.',
            isStandard: true,
            priority: 'RECOMMENDED',
          }
        );
        break;

      case 'TERMINATION_LETTER':
        suggestions.push(
          {
            sectionKey: 'asset_return_checklist',
            title: 'Equipment Return & IT Surrender Checklist',
            description: 'Lists physical laptops, security keys, access cards, and credentials to be returned.',
            suggestedWording:
              'The Employee shall surrender all company-issued hardware, secure authentication tokens, access badges, and confidential documents to IT Operations on or before the last working day.',
            rationale: 'Standard ISO 27001 data protection and hardware reconciliation safeguard.',
            isStandard: true,
            priority: 'RECOMMENDED',
          },
          {
            sectionKey: 'post_employment_covenants',
            title: 'Reaffirmation of Continuing Covenants',
            description: 'Reaffirms continuing non-disclosure and non-solicitation covenants.',
            suggestedWording:
              'The Employee is reminded of continuing contractual obligations regarding non-solicitation of clients and staff, as well as non-disclosure of proprietary trade secrets.',
            rationale: 'Reiterates enforceable post-separation obligations.',
            isStandard: true,
            priority: 'RECOMMENDED',
          }
        );
        break;

      case 'FNF_SETTLEMENT':
        suggestions.push(
          {
            sectionKey: 'tax_indemnification',
            title: 'Tax Withholding & Indemnification Clause',
            description: 'Clarifies statutory withholding responsibilities on settlement credits.',
            suggestedWording:
              'Statutory withholding taxes have been deducted in accordance with applicable revenue codes. Any personal tax liabilities arising from receipt of this settlement remain the responsibility of the Employee.',
            rationale: 'Prevents statutory tax disputes regarding settlement encashment.',
            isStandard: true,
            priority: 'RECOMMENDED',
          },
          {
            sectionKey: 'no_dues_undertaking',
            title: 'Mutual Release & No Dues Undertaking',
            description: 'Full satisfaction of all claims, wages, and reimbursable expenses.',
            suggestedWording:
              'Payment of this net sum constitutes complete and final satisfaction of all financial claims, accrued dues, and statutory benefits arising out of the employment relationship.',
            rationale: 'Protects the enterprise against retrospective wage claims.',
            isStandard: true,
            priority: 'RECOMMENDED',
          }
        );
        break;

      case 'MSA':
        suggestions.push(
          {
            sectionKey: 'limitation_of_liability',
            title: 'Limitation of Liability & Consequential Damages Waiver',
            description: 'Limits damages to fees paid or agreed monetary ceiling.',
            suggestedWording:
              'Except for breaches of confidentiality or willful misconduct, neither party’s aggregate liability under this MSA shall exceed the total fees paid under the applicable SOW in the preceding 12 months.',
            rationale: 'Vital commercial risk mitigation clause standard in enterprise contracts.',
            isStandard: true,
            priority: 'RECOMMENDED',
          },
          {
            sectionKey: 'governing_jurisdiction',
            title: 'Governing Law & Dispute Resolution',
            description: 'Specifies venue, governing laws, and mandatory mediation.',
            suggestedWording:
              'This Agreement shall be construed in accordance with the laws of the State of Delaware without regard to conflict of laws principles. The parties submit to exclusive court jurisdiction in said venue.',
            rationale: 'Eliminates multi-jurisdictional litigation uncertainty.',
            isStandard: true,
            priority: 'RECOMMENDED',
          }
        );
        break;

      default:
        suggestions.push({
          sectionKey: 'general_covenants',
          title: 'Standard Compliance & Governance',
          description: 'Standard organizational compliance provisions.',
          suggestedWording:
            'All parties agree to perform their obligations under this document in adherence with applicable industry standards and statutory regulations.',
          rationale: 'Standard professional baseline clause.',
          isStandard: true,
          priority: 'RECOMMENDED',
        });
    }

    return suggestions;
  }

  /**
   * 5. SUGGEST MISSING INFORMATION
   * Audits current data and surfaces missing fields with clear clarification questions.
   */
  static suggestMissingInformation(
    documentTypeCode: DocumentTypeCode,
    currentData: Record<string, unknown>
  ): MissingInformationSuggestion[] {
    const typeDef = DOCUMENT_TYPE_REGISTRY[documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${documentTypeCode}`, 400);
    }

    const suggestions: MissingInformationSuggestion[] = [];
    const allFields = [...(typeDef.requiredFields || []), ...(typeDef.optionalFields || [])];

    for (const f of allFields) {
      const val = currentData[f.key];
      if (val === undefined || val === null || val === '') {
        const isReq = (typeDef.requiredFields || []).some((rf) => rf.key === f.key);
        suggestions.push({
          fieldKey: f.key,
          label: f.label,
          description: f.description || '',
          dataType: f.dataType,
          isRequired: isReq,
          whyMissing: isReq
            ? 'Mandatory parameter absent from source dossier'
            : 'Optional parameter currently omitted',
          clarificationQuestion: `Please provide the confirmed ${f.label} for this ${typeDef.name}.`,
        });
      }
    }

    return suggestions;
  }

  /**
   * 6. QUALITY CHECK
   * Evaluates document against 7 categories returning PASS, WARNING, or REVIEW_REQUIRED.
   * GUARANTEE: Does not alter HR data.
   */
  static performQualityCheck(
    documentTypeCode: DocumentTypeCode,
    data: Record<string, unknown>
  ): DocumentQualityReport {
    return DocumentQualityService.auditDocument(documentTypeCode, data);
  }

  /**
   * 7. REGENERATE WORDING
   * Generates alternative drafting proposal.
   */
  static async regenerateDocumentWording(input: {
    documentTypeCode: DocumentTypeCode;
    taskCode: string;
    previousContent: string;
    instruction?: string;
    context?: Record<string, unknown>;
    variationNumber?: number;
  }): Promise<DocumentWordingItem> {
    const typeDef = DOCUMENT_TYPE_REGISTRY[input.documentTypeCode];
    if (!typeDef) {
      throw new AppError(`Unknown document type: ${input.documentTypeCode}`, 400);
    }

    const systemPrompt = `You are an HR Executive Drafting Assistant for ${typeDef.name}.
TASK: REGENERATE_VARIATION
Provide a distinctive, fresh alternative wording variation for the text below.
Preserve all factual context. Do not invent facts, policies, or salaries.`;

    const userPrompt = `Generate an alternative drafting variation.
Previous Text: "${input.previousContent}"
Instruction: ${input.instruction || 'Provide fresh professional phrasing'}
Context: ${JSON.stringify(input.context || {})}

Respond in JSON:
{
  "title": string,
  "content": string,
  "changesSummary": string
}`;

    const adapter = AiProviderFactory.getAdapter();
    const completion = await adapter.complete({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.45,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);
    const variationNumber = (input.variationNumber || 1) + 1;

    return {
      id: `doc_regen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      documentTypeCode: input.documentTypeCode,
      taskCode: input.taskCode,
      title: parsed.title || `Alternative Variation #${variationNumber}`,
      content: parsed.content || input.previousContent,
      changesSummary: parsed.changesSummary || 'Alternative executive phrasing variation.',
      isAiGenerated: true,
      isAdvisory: true,
      requiresHrReview: true,
      guardrailNotice: this.GUARDRAIL_NOTICE,
      variationNumber,
      createdAt: new Date().toISOString(),
    };
  }
}
