import { IAiProviderAdapter } from './ai-provider.interface.js';
import { AiCompletionRequest, AiCompletionResponse } from '../types.js';
import { config } from '../../../config/env.js';
import { AiServiceError, RateLimitError } from '../../../errors/app-error.js';

export class GeminiAdapter implements IAiProviderAdapter {
  public readonly providerId = 'GEMINI';
  public readonly displayName = 'Google Gemini (Gemini 1.5 Flash / 2.0)';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || (config.ai as any).gemini?.apiKey || '';
    this.baseUrl =
      process.env.GEMINI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta/openai';
    this.defaultModel =
      process.env.GEMINI_MODEL ||
      config.ai.model ||
      'gemini-1.5-flash';
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    if (!this.apiKey) {
      throw new AiServiceError(
        'Gemini API Key is not configured in environment (GEMINI_API_KEY)',
        this.providerId,
        500
      );
    }

    const startTime = Date.now();
    const url = `${this.baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.defaultModel,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      temperature: request.temperature ?? config.ai.temperature,
      max_tokens: request.maxTokens ?? config.ai.maxTokens,
    };

    if (request.jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err: any) {
      throw new AiServiceError(
        `Network error communicating with Google Gemini API: ${err.message}`,
        this.providerId,
        503
      );
    }

    const latencyMs = Date.now() - startTime;

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSec = retryAfter ? parseInt(retryAfter, 10) : undefined;
      throw new RateLimitError('Google Gemini rate limit exceeded', retryAfterSec);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new AiServiceError(
        `Gemini API returned status ${response.status}: ${errorText}`,
        this.providerId,
        response.status
      );
    }

    const data = (await response.json()) as any;
    const choice = data.choices?.[0];
    const rawContent = choice?.message?.content || '';

    return {
      rawContent,
      modelName: data.model || this.defaultModel,
      providerName: this.providerId,
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      latencyMs,
    };
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    if (!this.apiKey) {
      return { ok: false, message: 'GEMINI_API_KEY is not configured' };
    }
    return { ok: true, message: `Gemini adapter configured with model: ${this.defaultModel}` };
  }
}
