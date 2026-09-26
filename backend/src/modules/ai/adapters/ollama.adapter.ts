import { IAiProviderAdapter } from './ai-provider.interface.js';
import { AiCompletionRequest, AiCompletionResponse } from '../types.js';
import { config } from '../../../config/env.js';
import { AiServiceError } from '../../../errors/app-error.js';

export class OllamaAdapter implements IAiProviderAdapter {
  public readonly providerId = 'OLLAMA';
  public readonly displayName = 'Ollama (Local Open Source Models)';

  private readonly baseUrl: string;
  private readonly defaultModel: string;

  constructor() {
    this.baseUrl = config.ai.ollama.baseUrl;
    this.defaultModel = config.ai.model || 'llama3';
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();
    const url = `${this.baseUrl}/api/chat`;

    const body: Record<string, unknown> = {
      model: this.defaultModel,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
      stream: false,
      options: {
        temperature: request.temperature ?? config.ai.temperature,
        num_predict: request.maxTokens ?? config.ai.maxTokens,
      },
    };

    if (request.jsonMode) {
      body.format = 'json';
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err: any) {
      throw new AiServiceError(`Failed to connect to local Ollama at ${this.baseUrl}: ${err.message}`, this.providerId, 503);
    }

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      throw new AiServiceError(`Ollama returned status ${response.status}: ${errorText}`, this.providerId, response.status);
    }

    const data = (await response.json()) as any;
    const rawContent = data.message?.content || '';

    return {
      rawContent,
      modelName: data.model || this.defaultModel,
      providerName: this.providerId,
      promptTokens: data.prompt_eval_count || 0,
      completionTokens: data.eval_count || 0,
      latencyMs,
    };
  }

  async healthCheck(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`);
      if (res.ok) {
        return { ok: true, message: `Connected to Ollama at ${this.baseUrl}` };
      }
      return { ok: false, message: `Ollama replied with status ${res.status}` };
    } catch (err: any) {
      return { ok: false, message: `Cannot reach Ollama at ${this.baseUrl}: ${err.message}` };
    }
  }
}
