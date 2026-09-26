import { ValidationError } from '../../errors/app-error.js';

export class ResponseParser {
  /**
   * Robustly extracts and parses a JSON object from raw LLM output text.
   * Handles markdown code fences, leading conversational text, and whitespace.
   */
  static parseJson<T = Record<string, unknown>>(rawOutput: string): T {
    if (!rawOutput || typeof rawOutput !== 'string') {
      throw new ValidationError('AI model returned empty or invalid response');
    }

    let cleaned = rawOutput.trim();

    // 1. Strip markdown fences like ```json ... ``` or ``` ... ```
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1].trim();
    }

    // 2. If there is leading/trailing text outside the first { and last }, slice it
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (parseError: any) {
      console.error('[AI_RESPONSE_PARSER_ERROR] Raw text could not be parsed as JSON:', cleaned);
      throw new ValidationError(
        `Failed to parse AI structured response as JSON: ${parseError.message}`,
        { snippet: cleaned.substring(0, 300) }
      );
    }
  }
}
