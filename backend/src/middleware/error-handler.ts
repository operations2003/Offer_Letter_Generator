import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // If headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return _next(err);
  }

  // 1. Handled AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed',
        details: formattedDetails,
      },
    });
    return;
  }

  // 3. Prisma Known Errors
  if ('code' in err && typeof (err as any).code === 'string') {
    const prismaError = err as { code: string; meta?: Record<string, unknown> };

    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'A resource with this identifier already exists',
          details: prismaError.meta,
        },
      });
      return;
    }

    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'RECORD_NOT_FOUND',
          message: 'Requested record was not found in the database',
          details: prismaError.meta,
        },
      });
      return;
    }
  }

  // 4. Fallback Unhandled 500
  console.error('[UNHANDLED_ERROR]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message,
      details: process.env.NODE_ENV === 'production' ? null : err.stack,
    },
  });
}
