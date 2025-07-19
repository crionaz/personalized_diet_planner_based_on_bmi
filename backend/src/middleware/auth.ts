import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { config } from '@/config/config';
import { AuthenticatedRequest, JWTPayload, UserRole, Permission } from '@/types';
import { errorResponse } from '@/utils/helpers';
import logger from '@/utils/logger';

/**
 * Middleware to authenticate JWT token
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;

    // Find user by ID
    const user = await User.findById(decoded.userId).select('+permissions');

    if (!user) {
      res.status(401).json(errorResponse('User not found'));
      return;
    }

    if (!user.isActive) {
      res.status(401).json(errorResponse('Account is deactivated'));
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(errorResponse('Invalid token'));
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(errorResponse('Token expired'));
      return;
    }

    res.status(500).json(errorResponse('Authentication failed'));
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(errorResponse('Insufficient permissions'));
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (...permissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const hasPermission = permissions.some(permission => 
      req.user?.hasPermission(permission)
    );

    if (!hasPermission) {
      res.status(403).json(errorResponse('Insufficient permissions'));
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN);

/**
 * Middleware to check if user is super admin
 */
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

/**
 * Middleware to validate user ownership or admin access
 */
export const requireOwnershipOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(errorResponse('Authentication required'));
      return;
    }

    const targetUserId = req.params[userIdParam];
    const isOwner = req.user._id.toString() === targetUserId;
    const isAdmin = req.user.hasRole(UserRole.ADMIN) || req.user.hasRole(UserRole.SUPER_ADMIN);

    if (!isOwner && !isAdmin) {
      res.status(403).json(errorResponse('Access denied'));
      return;
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      const user = await User.findById(decoded.userId).select('+permissions');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
