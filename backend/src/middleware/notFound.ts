import { Request, Response } from 'express';
import { errorResponse } from '../utils/helpers';

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json(errorResponse(
    'Route not found',
    `Cannot ${req.method} ${req.originalUrl}`
  ));
};
