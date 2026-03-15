import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import logger from '../utils/logger.util';
import env from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const errors: Record<string, string> = {};
    Object.keys(mongooseErr.errors).forEach((key) => {
      errors[key] = mongooseErr.errors[key].message;
    });
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: env.IS_PRODUCTION ? 'Internal server error' : err.message,
    ...(! env.IS_PRODUCTION && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
