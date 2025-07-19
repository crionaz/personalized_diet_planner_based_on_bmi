import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { AppError } from '../types';
import { errorResponse } from '../utils/helpers';
import logger from '../utils/logger';
import { config } from '../config/config';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Record<string, string> | undefined;

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    
    // Extract validation errors
    const validationErrors = error as any;
    for (const field in validationErrors.errors) {
      errors[field] = validationErrors.errors[field].message;
    }
  } else if (error.name === 'MongoServerError' || (error as any).code === 11000) {
    // MongoDB duplicate key error
    statusCode = 400;
    message = 'Duplicate field value';
    
    const duplicateError = error as any;
    if (duplicateError.keyPattern) {
      const field = Object.keys(duplicateError.keyPattern)[0] as string;
      errors = { [field]: `${field} already exists` };
    }
  } else if (error.name === 'CastError') {
    // MongoDB cast error (invalid ObjectId)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'MulterError') {
    // File upload error
    statusCode = 400;
    message = 'File upload error';
    
    const multerError = error as any;
    if (multerError.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large';
    } else if (multerError.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files';
    }
  }

  // Don't leak error details in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json(errorResponse(message, error.message, errors));
};

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMap: Record<string, string> = {};
    
    errors.array().forEach((error: ValidationError) => {
      if (error.type === 'field') {
        errorMap[error.path] = error.msg;
      }
    });

    res.status(400).json(errorResponse('Validation failed', undefined, errorMap));
    return;
  }
  
  next();
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
