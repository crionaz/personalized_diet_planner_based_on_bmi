import { Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '@/models/User';
import { 
  AuthenticatedRequest, 
  LoginDto, 
  RegisterDto, 
  UpdatePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserRole,
  Permission 
} from '@/types';
import { config } from '@/config/config';
import { successResponse, errorResponse } from '@/utils/helpers';
import { asyncHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, firstName, lastName }: RegisterDto = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json(errorResponse('User already exists with this email'));
    return;
  }

  // Set default permissions for regular users
  const defaultPermissions: Permission[] = [Permission.READ_USERS];

  // Create user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    role: UserRole.USER,
    permissions: defaultPermissions,
  });

  await user.save();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  logger.info(`New user registered: ${email}`);

  res.status(201).json(successResponse('User registered successfully', {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    token,
    refreshToken,
  }));
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password }: LoginDto = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password +permissions');
  if (!user) {
    res.status(401).json(errorResponse('Invalid credentials'));
    return;
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(401).json(errorResponse('Account is deactivated'));
    return;
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    res.status(401).json(errorResponse('Invalid credentials'));
    return;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  logger.info(`User logged in: ${email}`);

  res.json(successResponse('Login successful', {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      avatar: user.avatar,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    token,
    refreshToken,
  }));
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  res.json(successResponse('Profile retrieved successfully', {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      avatar: user.avatar,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      profile: user.profile,
      healthMetrics: user.healthMetrics,
      dietaryPreferences: user.dietaryPreferences,
      goals: user.goals,
      bmi: user.calculateBMI(),
      bmiCategory: user.getBMICategory(),
      dailyCalories: user.calculateDailyCalories(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  }));
});

/**
 * Update user password
 */
export const updatePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword }: UpdatePasswordDto = req.body;
  const user = await User.findById(req.user!._id).select('+password');

  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    res.status(400).json(errorResponse('Current password is incorrect'));
    return;
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info(`Password updated for user: ${user.email}`);

  res.json(successResponse('Password updated successfully'));
});

/**
 * Refresh authentication token
 */
export const refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json(errorResponse('Refresh token is required'));
    return;
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;
    
    // Find user
    const user = await User.findById(decoded.userId).select('+permissions');
    if (!user || !user.isActive) {
      res.status(401).json(errorResponse('Invalid refresh token'));
      return;
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    res.json(successResponse('Token refreshed successfully', {
      token: newToken,
      refreshToken: newRefreshToken,
    }));
  } catch (error) {
    res.status(401).json(errorResponse('Invalid refresh token'));
  }
});

/**
 * Logout user (invalidate token on client side)
 */
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  logger.info(`User logged out: ${req.user!.email}`);
  res.json(successResponse('Logout successful'));
});

/**
 * Forgot password - send reset email
 */
export const forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email }: ForgotPasswordDto = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists for security
    res.json(successResponse('If an account with that email exists, a password reset link has been sent'));
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save();

  // In a real application, you would send an email here
  // For now, we'll just log the token (remove this in production)
  logger.info(`Password reset token for ${email}: ${resetToken}`);

  res.json(successResponse('If an account with that email exists, a password reset link has been sent'));
});

/**
 * Reset password with token
 */
export const resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token, password }: ResetPasswordDto = req.body;

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    res.status(400).json(errorResponse('Invalid or expired reset token'));
    return;
  }

  // Update password and clear reset fields
  user.password = password;
  user.passwordResetToken = "undefined";
  user.passwordResetExpires =  new Date(0); // Clear reset fields
  
  await user.save();

  logger.info(`Password reset successful for user: ${user.email}`);

  res.json(successResponse('Password reset successful'));
});

/**
 * Verify email with token
 */
export const verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.params;

  const user = await User.findOne({ emailVerificationToken: token });
  if (!user) {
    res.status(400).json(errorResponse('Invalid verification token'));
    return;
  }

  user.emailVerified = true;
  user.emailVerificationToken = "undefined";
  await user.save();

  logger.info(`Email verified for user: ${user.email}`);

  res.json(successResponse('Email verified successfully'));
});
