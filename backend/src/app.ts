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

  // Mount API v1 modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);
  app.use('/api/v1/ai', aiRoutes);

  // 404 handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
