import { IAiProviderAdapter } from './adapters/ai-provider.interface.js';
import { GroqAdapter } from './adapters/groq.adapter.js';
import { OllamaAdapter } from './adapters/ollama.adapter.js';
import { OpenAiAdapter } from './adapters/openai.adapter.js';
import { GeminiAdapter } from './adapters/gemini.adapter.js';
import { MockAiAdapter } from './adapters/mock.adapter.js';
import { config } from '../../config/env.js';

export class AiProviderFactory {
  private static cachedAdapter: IAiProviderAdapter | null = null;

  /**
   * Returns the configured singleton AI provider adapter.
   */
  static getAdapter(): IAiProviderAdapter {
    if (this.cachedAdapter) {
      return this.cachedAdapter;
    }

    const providerType = (process.env.AI_PROVIDER || config.ai.provider || 'MOCK').toUpperCase();

    try {
      switch (providerType) {
        case 'GEMINI':
          this.cachedAdapter = new GeminiAdapter();
          break;
        case 'GROQ':
          this.cachedAdapter = new GroqAdapter();
          break;
        case 'OLLAMA':
          this.cachedAdapter = new OllamaAdapter();
          break;
        case 'OPENAI':
          this.cachedAdapter = new OpenAiAdapter();
          break;
        case 'MOCK':
        default:
          this.cachedAdapter = new MockAiAdapter();
          break;
      }
    } catch (err: any) {
      console.warn(`[AI_FACTORY] Failed to initialize ${providerType}, falling back to MockAiAdapter:`, err?.message || err);
      this.cachedAdapter = new MockAiAdapter();
    }

    console.log(
      `[AI_FACTORY] Initialized AI Provider: ${this.cachedAdapter.displayName} (${this.cachedAdapter.providerId})`
    );

    return this.cachedAdapter;
  }

  /**
   * Allows dynamically overriding the adapter at runtime (e.g. for testing)
   */
  static setAdapter(adapter: IAiProviderAdapter): void {
    this.cachedAdapter = adapter;
  }

  /**
   * Resets the cached adapter to reload from environment
   */
  static reset(): void {
    this.cachedAdapter = null;
  }
}
