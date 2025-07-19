import { ApiResponse, PaginatedResponse } from '../types';

// Simple error class for API errors
export class ApiError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Create a standardized API response
 */
export const createResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  errors?: Record<string, string>
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (error) {
    response.error = error;
  }

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Create a success response
 */
export const successResponse = <T = any>(
  message: string,
  data?: T
): ApiResponse<T> => {
  return createResponse(true, message, data);
};

/**
 * Create an error response
 */
export const errorResponse = (
  message: string,
  error?: string,
  errors?: Record<string, string>
): ApiResponse => {
  return createResponse(false, message, undefined, error, errors);
};

/**
 * Create a paginated response
 */
export const paginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): ApiResponse<PaginatedResponse<T>> => {
  const pages = Math.ceil(total / limit);
  
  return successResponse(message, {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  });
};

/**
 * Extract pagination parameters from query
 */
export const getPaginationParams = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    limitNum: limit,
    skip
  };
};

// Alias functions for backward compatibility
export const getPagination = getPaginationParams;
export const getPaginatedResponse = <T>(data: T[], total: number, page: number, limit: number) => 
  paginatedResponse(data, page, limit, total);

/**
 * Extract sort parameters from query
 */
export const getSortParams = (query: any): Record<string, 1 | -1> => {
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
  
  return { [sortBy]: sortOrder };
};

/**
 * Generate a random string
 */
export const generateRandomString = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true };
};

/**
 * Sanitize user input
 */
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Convert string to slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: Date, locale: string = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined values from object
 */
export const removeUndefined = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
