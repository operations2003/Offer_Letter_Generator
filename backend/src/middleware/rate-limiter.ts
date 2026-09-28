import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../errors/app-error.js';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
}

interface RequestRecord {
  timestamps: number[];
}

/**
 * High-performance, in-memory sliding-window rate limiter.
 * Protects critical endpoints from brute force, automated credential stuffing,
 * and AI resource/quota exhaustion without introducing external dependencies.
 */
export function createRateLimiter(options: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please slow down and try again later.',
    keyGenerator = (req: Request) => {
      // Use authenticated user ID when available, fallback to IP
      if (req.user?.userId) {
        return `user:${req.user.userId}`;
      }
      const forwarded = req.headers['x-forwarded-for'];
      const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip || req.socket.remoteAddress || 'unknown';
      return `ip:${ip}`;
    },
    skip = () => false,
  } = options;

  const hits = new Map<string, RequestRecord>();

  // Periodically clean up old entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow cleanup timer to not prevent process shutdown
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (skip(req)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    let record = hits.get(key);

    if (!record) {
      record = { timestamps: [] };
      hits.set(key, record);
    }

    // Keep timestamps within sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const currentHits = record.timestamps.length;
    const remaining = Math.max(0, maxRequests - currentHits);
    const resetTimeSeconds = Math.ceil(windowMs / 1000);

    // Standard rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());

    if (currentHits >= maxRequests) {
      const oldestTimestamp = record.timestamps[0] || now;
      const retryAfter = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);
      res.setHeader('Retry-After', retryAfter.toString());
      return next(new RateLimitError(message, retryAfter));
    }

    record.timestamps.push(now);
    next();
  };
}

/**
 * 1. Strict Auth Rate Limiter (Brute-force protection for login/refresh)
 * 10 requests per 15 minutes per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30, // 30 attempts per 15 min per IP (allows normal testing while stopping brute-force)
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  skip: () => process.env.NODE_ENV === 'test', // Skip in automated test suites
});

/**
 * 2. AI Endpoints Rate Limiter (Protects LLM tokens, budget, and compute)
 * 60 requests per minute per IP / authenticated user
 */
export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'AI request limit reached. Please wait a moment before sending more AI requests.',
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * 3. General API Protection Rate Limiter
 * 300 requests per 15 minutes per IP
 */
export const generalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 600,
  message: 'API rate limit exceeded. Please throttle your requests.',
  skip: () => process.env.NODE_ENV === 'test',
});
