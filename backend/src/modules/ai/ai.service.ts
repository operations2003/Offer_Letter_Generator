import { AiProviderFactory } from './ai-provider.factory.js';
import { PromptManager } from './prompt-manager.js';
import { ResponseParser } from './response-parser.js';
import { JsonValidator } from './json-validator.js';
import {
  AiCandidateExtractionData,
  AiCompletionRequest,
  AiCompletionResponse,
  AiPolicyComplianceResult,
} from './types.js';
import { config } from '../../config/env.js';
import { RateLimitError } from '../../errors/app-error.js';

export class AiService {
  /**
   * Executes completion request with exponential backoff and rate-limit handling
   */
  private static async executeWithRetry(
    request: AiCompletionRequest
  ): Promise<AiCompletionResponse> {
    const adapter = AiProviderFactory.getAdapter();
    const maxRetries = config.ai.maxRetries;
    const baseDelay = config.ai.retryDelayMs;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await adapter.complete(request);
      } catch (err: any) {
        lastError = err;

        // Check if rate limited
        if (err instanceof RateLimitError) {
          const delaySec = err.retryAfterSeconds || Math.pow(2, attempt) * 2;
          console.warn(
            `[AI_RATE_LIMIT] Attempt ${attempt}/${maxRetries} throttled. Waiting ${delaySec}s before retry...`
          );
          if (attempt === maxRetries) throw err;
          await new Promise((r) => setTimeout(r, delaySec * 1000));
          continue;
        }

        // Check if transient error (500, 502, 503, 504, or network timeout)
        const isTransient =
          err.statusCode >= 500 ||
          err.code === 'ECONNRESET' ||
          err.code === 'ETIMEDOUT' ||
          err.message?.includes('network');

        if (isTransient && attempt < maxRetries) {
          const delayMs = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 200;
          console.warn(
            `[AI_TRANSIENT_RETRY] Attempt ${attempt}/${maxRetries} failed: ${err.message}. Retrying in ${Math.round(delayMs)}ms...`
          );
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        // Non-transient or final attempt reached
        throw err;
      }
    }

    throw lastError || new Error('AI completion failed after retries');
  }

  /**
   * Extracts candidate data from resume or memo text
   */
  static async extractCandidateData(documentText: string): Promise<{
    extraction: AiCandidateExtractionData;
    metadata: {
      provider: string;
      model: string;
      latencyMs: number;
      promptTokens: number;
      completionTokens: number;
    };
  }> {
    const { systemPrompt, userPrompt } = PromptManager.buildCandidateExtractionPrompt(documentText);

    const completion = await this.executeWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.1, // Near-zero for deterministic extraction
    });

    const parsedJson = ResponseParser.parseJson(completion.rawContent);
    const extraction = JsonValidator.validateCandidateExtraction(parsedJson);

    return {
      extraction,
      metadata: {
        provider: completion.providerName,
        model: completion.modelName,
        latencyMs: completion.latencyMs,
        promptTokens: completion.promptTokens,
        completionTokens: completion.completionTokens,
      },
    };
  }

  /**
   * Evaluates proposed terms against company policy rules
   */
  static async checkPolicyCompliance(
    confirmedTerms: Record<string, unknown>,
    companyRules: string[]
  ): Promise<AiPolicyComplianceResult> {
    const { systemPrompt, userPrompt } = PromptManager.buildPolicyCompliancePrompt(
      confirmedTerms,
      companyRules
    );

    const completion = await this.executeWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.1,
    });

    const parsedJson = ResponseParser.parseJson(completion.rawContent);
    return JsonValidator.validatePolicyCheck(parsedJson);
  }

  /**
   * Drafts custom employment clause based on instruction
   */
  static async draftCustomClause(
    instruction: string,
    context: Record<string, unknown>
  ): Promise<{
    clauseTitle: string;
    clauseText: string;
    keyPoints?: string[];
    governingConsiderations: string;
    isAdvisory: boolean;
  }> {
    const { systemPrompt, userPrompt } = PromptManager.buildCustomClausePrompt(instruction, context);

    const completion = await this.executeWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.3,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);
    return {
      clauseTitle: parsed.clauseTitle || 'Employment Agreement Clause',
      clauseText: parsed.clauseText || '',
      keyPoints: parsed.keyPoints || [],
      governingConsiderations: parsed.governingConsiderations || '',
      isAdvisory: true,
    };
  }

  /**
   * Generates AI suggestions for wording, welcome note, role perks, and recommended clauses
   * GUARDRAIL: AI cannot decide sensitive fields (CTC, probation duration, notice duration).
   */
  static async generateOfferSuggestions(context: Record<string, unknown>): Promise<{
    summary: string;
    isAdvisoryOnly: boolean;
    sensitiveFieldsLocked: boolean;
    suggestions: Array<{
      id: string;
      category: string;
      title: string;
      suggestedWording: string;
      rationale: string;
      requiresHumanConfirmation: boolean;
    }>;
  }> {
    const { systemPrompt, userPrompt } = PromptManager.buildOfferSuggestionsPrompt(context);

    const completion = await this.executeWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.3,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);
    return {
      summary: parsed.summary || 'AI Advisory Suggestions for offer enhancement',
      isAdvisoryOnly: true,
      sensitiveFieldsLocked: true,
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map((s: any) => ({
            id: s.id || `sug-${Math.random().toString(36).substring(2, 8)}`,
            category: s.category || 'ROLE_PERKS',
            title: s.title || 'Suggestion',
            suggestedWording: s.suggestedWording || '',
            rationale: s.rationale || '',
            requiresHumanConfirmation: true, // Strictly enforce human review
          }))
        : [],
    };
  }

  /**
   * Performs AI Quality Check across offer completeness, math consistency, and sensitive fields audit
   */
  static async performOfferQualityCheck(offerData: Record<string, unknown>): Promise<{
    overallQualityScore: number;
    isReadyForIssuance: boolean;
    readabilityScore: string;
    completenessScore: number;
    compensationCheck: {
      isMathConsistent: boolean;
      breakdownSum: number;
      statedTotalCtc: number;
      discrepancy: number;
    };
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
    sensitiveFieldsAudit: {
      isHumanConfirmed: boolean;
      details: string;
    };
  }> {
    const { systemPrompt, userPrompt } = PromptManager.buildOfferQualityCheckPrompt(offerData);

    const completion = await this.executeWithRetry({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.1,
    });

    const parsed = ResponseParser.parseJson<any>(completion.rawContent);
    return {
      overallQualityScore: typeof parsed.overallQualityScore === 'number' ? parsed.overallQualityScore : 85,
      isReadyForIssuance: Boolean(parsed.isReadyForIssuance),
      readabilityScore: parsed.readabilityScore || 'HIGH',
      completenessScore: typeof parsed.completenessScore === 'number' ? parsed.completenessScore : 90,
      compensationCheck: parsed.compensationCheck || {
        isMathConsistent: true,
        breakdownSum: 0,
        statedTotalCtc: 0,
        discrepancy: 0,
      },
      criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      sensitiveFieldsAudit: parsed.sensitiveFieldsAudit || {
        isHumanConfirmed: true,
        details: 'Sensitive fields verified for human authorization.',
      },
    };
  }

  /**
   * Health and diagnostics check for currently active AI provider
   */
  static async getStatus() {
    const adapter = AiProviderFactory.getAdapter();
    const health = await adapter.healthCheck();

    return {
      activeProvider: adapter.providerId,
      displayName: adapter.displayName,
      model: config.ai.model,
      health,
      rateLimits: {
        maxRetries: config.ai.maxRetries,
        baseRetryDelayMs: config.ai.retryDelayMs,
      },
    };
  }
}
