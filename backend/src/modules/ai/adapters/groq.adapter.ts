import { IAiProviderAdapter } from './ai-provider.interface.js';
import { AiCompletionRequest, AiCompletionResponse } from '../types.js';
import { config } from '../../../config/env.js';
import { AiServiceError, RateLimitError } from '../../../errors/app-error.js';

export class GroqAdapter implements IAiProviderAdapter {
  public readonly providerId = 'GROQ';
  public readonly displayName = 'Groq Cloud (Open Models: Llama 3.3)';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor() {
    this.apiKey = config.ai.groq.apiKey;
    this.baseUrl = config.ai.groq.baseUrl;
    this.defaultModel = config.ai.model || 'llama-3.3-70b-versatile';
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    if (!this.apiKey) {
      throw new AiServiceError('Groq API Key is not configured in environment (GROQ_API_KEY)', this.providerId, 500);
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
      throw new AiServiceError(`Network error communicating with Groq: ${err.message}`, this.providerId, 503);
    }

    const latencyMs = Date.now() - startTime;

    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSec = retryAfter ? parseInt(retryAfter, 10) : undefined;
      throw new RateLimitError('Groq rate limit exceeded', retryAfterSec);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new AiServiceError(`Groq API returned error status ${response.status}: ${errorText}`, this.providerId, response.status);
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
      return { ok: false, message: 'GROQ_API_KEY is not defined' };
    }
    return { ok: true, message: `Groq adapter configured with model: ${this.defaultModel}` };
  }
}
