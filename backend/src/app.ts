import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { NotFoundError } from './errors/app-error.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import offerRoutes from './modules/offers/offer.routes.js';
import templateRoutes from './modules/templates/template.routes.js';
import { documentTypeRouter, hrDocumentRouter } from './modules/documents/document-engine/hr-document.routes.js';
import { documentAiRouter } from './modules/documents/document-engine/document-ai.routes.js';
import { policyRouter } from './modules/policies/policy.routes.js';
import { onboardingRouter } from './modules/onboarding/onboarding.routes.js';
import { createLearningRouter } from './modules/learning/learning.routes.js';
import { createAssessmentRouter } from './modules/assessments/assessment.routes.js';
import { employeeRouter } from './modules/employees/employee.routes.js';
import { authRateLimiter, aiRateLimiter, generalApiRateLimiter } from './middleware/rate-limiter.js';

export function createApp(): Express {
  const app = express();

  // Trust proxy if behind reverse proxy
  app.set('trust proxy', 1);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Set to false during local development/API consumption
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (config.cors.origin.includes(origin) || config.cors.origin.includes('*')) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in development
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger (in development)
  if (config.env === 'development') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
      next();
    });
  }

  // Health checks
  const healthHandler = (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'Offer Letter Generator Backend',
      environment: config.env,
      version: '1.0.0',
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Rate Limiting Guards
  app.use('/api/v1/auth/login', authRateLimiter);
  app.use('/api/v1/ai', aiRateLimiter);
  app.use('/api/v1/offers/ai', aiRateLimiter);
  app.use('/api/v1', generalApiRateLimiter);

  // Mount API v1 modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/offers', offerRoutes);
  app.use('/api/v1/templates', templateRoutes);
  app.use('/api/v1/document-types', documentTypeRouter);
  app.use('/api/v1/hr-documents', hrDocumentRouter);
  app.use('/api/v1/document-ai', documentAiRouter);
  app.use('/api/v1/policies', policyRouter);
  app.use('/api/v1/onboarding', onboardingRouter);
  app.use('/api/v1/learning', createLearningRouter());
  app.use('/api/v1/assessments', createAssessmentRouter());
  app.use('/api/v1/employees', employeeRouter);

  // 404 handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
