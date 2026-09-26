import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/offer_letter_generator?schema=public',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_super_secure_key_change_in_production_32chars_min',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_super_secure_key_change_in_production_32chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000').split(','),
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'MOCK').toUpperCase() as 'GROQ' | 'OLLAMA' | 'OPENAI' | 'MOCK',
    model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
    retryDelayMs: parseInt(process.env.AI_RETRY_DELAY_MS || '1000', 10),

    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
  },
} as const;
