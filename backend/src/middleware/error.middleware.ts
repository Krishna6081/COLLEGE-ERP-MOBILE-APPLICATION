import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error(`Error handling ${req.method} ${req.originalUrl}: ${err.message}`, { stack: err.stack });

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.code);
  }

  if (err.name === 'ZodError') {
    return ApiResponse.error(res, 'Validation failed', 400, 'VALIDATION_ERROR', err.errors);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return ApiResponse.error(res, message, statusCode, 'INTERNAL_SERVER_ERROR');
}
