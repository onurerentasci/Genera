import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Error Response Interface
 */
interface ErrorResponse {
  success: boolean;
  message: string;
  stack?: string;
  error?: Error;
}

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // If it's our custom AppError, use its properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Log the error
  if (isOperational) {
    logger.warn('Operational error', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  } else {
    logger.error('Non-operational error', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
      stack: err.stack,
      ip: req.ip
    });
  }

  // Send error response
  const response: ErrorResponse = {
    success: false,
    message
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 * Catches all undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
};
