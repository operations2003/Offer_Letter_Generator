import { AiCompletionRequest, AiCompletionResponse } from '../types.js';

export interface IAiProviderAdapter {
  readonly providerId: string;
  readonly displayName: string;

  /**
   * Dispatches completion request to the underlying provider model.
   * Throws standard errors or RateLimitError on 429.
   */
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>;

  /**
   * Health check to test connectivity and credential validity.
   */
  healthCheck(): Promise<{ ok: boolean; message: string }>;
}
