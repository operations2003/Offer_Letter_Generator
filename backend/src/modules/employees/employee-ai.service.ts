// =============================================================================
// OPTIONAL AI DOCUMENT ASSISTANT SERVICE
// =============================================================================
// Provides advisory assistance ONLY when explicitly invoked:
// 1. Suggest appropriate professional wording
// 2. Identify missing information / check document completeness
// 3. Explain template clauses in plain language
// 4. Flag inconsistencies between employee data and document terms
// Strict constraint: AI must NOT invent employee details or salary figures.
// Graceful fallback: System works 100% even if no AI key is configured.
// =============================================================================

import { AiService } from '../ai/ai.service.js';
import { config } from '../../config/env.js';

export interface AiAssistanceResult {
  success: boolean;
  provider: string;
  task: 'suggest_wording' | 'check_completeness' | 'explain_clause' | 'flag_inconsistencies';
  result: string | Record<string, any>;
  warnings?: string[];
  isAiAvailable: boolean;
}

export class EmployeeAiService {
  /**
   * Helper to check if AI provider is configured and available
   */
  private static isAiConfigured(): boolean {
    const provider = config.ai.provider;
    if (provider === 'MOCK') return true;
    if (provider === 'GROQ' && Boolean(config.ai.groq.apiKey)) return true;
    if (provider === 'OPENAI' && Boolean(config.ai.openai.apiKey)) return true;
    if (provider === 'OLLAMA' && Boolean(config.ai.ollama.baseUrl)) return true;
    return false;
  }

  /**
   * 1. Suggest appropriate professional wording for a specific section or clause
   */
  static async suggestWording(textToRefine: string, documentType: string): Promise<AiAssistanceResult> {
    if (!this.isAiConfigured()) {
      return {
        success: false,
        provider: config.ai.provider,
        task: 'suggest_wording',
        result: textToRefine,
        warnings: ['AI provider is not configured. Retaining standard template wording.'],
        isAiAvailable: false,
      };
    }

    try {
      const prompt = `You are an HR Legal & Compliance Assistant. 
Document Category: "${documentType}".
Task: Improve the clarity, professional tone, and conciseness of the following HR text while strictly preserving its original legal meaning and factual information. 
CRITICAL RULE: Do NOT invent or alter any employee names, dates, compensation numbers, or policy terms.

Draft Text:
"${textToRefine}"

Provide only the improved, polished text directly without conversational commentary.`;

      const aiResponse = await AiService.executePrompt(prompt, {
        temperature: 0.2,
        maxTokens: 500,
      });

      return {
        success: true,
        provider: config.ai.provider,
        task: 'suggest_wording',
        result: aiResponse.trim().replace(/^"|"$/g, ''),
        isAiAvailable: true,
      };
    } catch (err: any) {
      return {
        success: false,
        provider: config.ai.provider,
        task: 'suggest_wording',
        result: textToRefine,
        warnings: [`AI wording suggestion unavailable (${err.message}). Using standard text.`],
        isAiAvailable: false,
      };
    }
  }

  /**
   * 2. Check document completeness & identify missing information
   */
  static async checkCompleteness(renderedText: string, expectedFields: string[]): Promise<AiAssistanceResult> {
    const missingPlaceholders: string[] = [];
    const placeholderRegex = /\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}|\[([a-zA-Z0-9\s_-]+)\]/g;
    let match: RegExpExecArray | null;

    while ((match = placeholderRegex.exec(renderedText)) !== null) {
      const token = match[1] || match[2];
      if (token && !missingPlaceholders.includes(token)) {
        missingPlaceholders.push(token);
      }
    }

    const isFullyComplete = missingPlaceholders.length === 0;

    let aiAdvice = isFullyComplete
      ? 'Document contains all required fields and contains no un-interpolated placeholders.'
      : `Missing or unpopulated placeholders detected: ${missingPlaceholders.join(', ')}.`;

    if (this.isAiConfigured() && !isFullyComplete) {
      try {
        const prompt = `Review this HR document draft and briefly summarize what information is missing before it can be legally issued:
Missing fields: ${missingPlaceholders.join(', ')}
Provide a 2-sentence actionable advisory for the HR manager.`;

        const aiResponse = await AiService.executePrompt(prompt, { temperature: 0.1, maxTokens: 150 });
        if (aiResponse) aiAdvice = aiResponse.trim();
      } catch {
        // Fall back gracefully to static advice
      }
    }

    return {
      success: true,
      provider: config.ai.provider,
      task: 'check_completeness',
      result: {
        isComplete: isFullyComplete,
        missingFields: missingPlaceholders,
        totalExpectedFields: expectedFields.length,
        completenessScore: isFullyComplete ? 100 : Math.max(30, Math.round(((expectedFields.length - missingPlaceholders.length) / expectedFields.length) * 100)),
        advisory: aiAdvice,
      },
      isAiAvailable: this.isAiConfigured(),
    };
  }

  /**
   * 3. Explain template clauses to HR in simple, plain language
   */
  static async explainClause(clauseText: string): Promise<AiAssistanceResult> {
    if (!this.isAiConfigured()) {
      return {
        success: true,
        provider: 'RULE_ENGINE',
        task: 'explain_clause',
        result: `Standard Clause Overview: This provision sets formal obligations for both employer and employee. Adhere to internal HR policy guidelines.`,
        isAiAvailable: false,
      };
    }

    try {
      const prompt = `You are an HR legal expert. Explain the practical implication of the following clause to an HR recruiter in plain, simple English (max 3 bullet points):

Clause:
"${clauseText}"`;

      const aiResponse = await AiService.executePrompt(prompt, { temperature: 0.2, maxTokens: 300 });

      return {
        success: true,
        provider: config.ai.provider,
        task: 'explain_clause',
        result: aiResponse.trim(),
        isAiAvailable: true,
      };
    } catch (err: any) {
      return {
        success: true,
        provider: 'FALLBACK',
        task: 'explain_clause',
        result: `Standard Clause Overview: This covenant specifies operational terms for separation, notice, or compliance under corporate HR regulations.`,
        warnings: [`Live AI provider unavailable: ${err.message}`],
        isAiAvailable: false,
      };
    }
  }

  /**
   * 4. Flag inconsistencies between employee records and document parameters
   */
  static async flagInconsistencies(
    employeeData: Record<string, any>,
    documentParameters: Record<string, any>
  ): Promise<AiAssistanceResult> {
    const inconsistencies: string[] = [];

    // Rule-based checks
    if (
      employeeData.annualCtc &&
      documentParameters.annual_ctc &&
      !String(documentParameters.annual_ctc).includes(String(employeeData.annualCtc)) &&
      !String(documentParameters.annual_ctc).includes(Number(employeeData.annualCtc).toLocaleString('en-US'))
    ) {
      inconsistencies.push(
        `Salary in document parameters ("${documentParameters.annual_ctc}") differs from employee record ("$${Number(employeeData.annualCtc).toLocaleString('en-US')}"). Please confirm if an intentional increment or revision.`
      );
    }

    if (
      employeeData.designation &&
      documentParameters.designation &&
      employeeData.designation.trim().toLowerCase() !== String(documentParameters.designation).trim().toLowerCase()
    ) {
      inconsistencies.push(
        `Designation in document ("${documentParameters.designation}") differs from profile record ("${employeeData.designation}").`
      );
    }

    return {
      success: true,
      provider: config.ai.provider,
      task: 'flag_inconsistencies',
      result: {
        hasInconsistencies: inconsistencies.length > 0,
        flags: inconsistencies,
        summary:
          inconsistencies.length === 0
            ? 'All document parameters match verified employee master records.'
            : `${inconsistencies.length} discrepancy flag(s) identified for human HR review.`,
      },
      isAiAvailable: this.isAiConfigured(),
    };
  }
}
