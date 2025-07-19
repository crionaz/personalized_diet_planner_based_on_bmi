import { Response } from 'express';
import User from '@/models/User';
import { 
  AuthenticatedRequest, 
  UpdateUserDto,
  UpdateHealthMetricsDto,
  UpdateDietaryPreferencesDto,
  UpdateGoalsDto,
  PaginationQuery 
} from '@/types';
import { 
  successResponse, 
  errorResponse, 
  paginatedResponse,
  getPaginationParams,
  getSortParams 
} from '@/utils/helpers';
import { asyncHandler } from '@/middleware/errorHandler';
import logger from '@/utils/logger';

/**
 * Get all users (with pagination and search)
 */
export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const sort = getSortParams(req.query);
  const { search } = req.query;

  // Build search filter
  let filter: any = {};
  if (search) {
    filter = {
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    };
  }

  // Get users with pagination
  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json(paginatedResponse(users, page, limit, total, 'Users retrieved successfully'));
});

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  res.json(successResponse('User retrieved successfully', { user }));
});

/**
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { firstName, lastName, avatar }: UpdateUserDto = req.body;
  const userId = req.user!._id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Update fields if provided
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  logger.info(`Profile updated for user: ${user.email}`);

  res.json(successResponse('Profile updated successfully', {
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
      updatedAt: user.updatedAt,
    },
  }));
});

/**
 * Delete user account
 */
export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  await User.findByIdAndDelete(userId);

  logger.info(`User account deleted: ${user.email}`);

  res.json(successResponse('Account deleted successfully'));
});

/**
 * Update user health metrics
 */
export const updateHealthMetrics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const healthMetricsData: UpdateHealthMetricsDto = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Update health metrics
  Object.keys(healthMetricsData).forEach(key => {
    if (healthMetricsData[key as keyof UpdateHealthMetricsDto] !== undefined) {
      (user.healthMetrics as any)[key] = healthMetricsData[key as keyof UpdateHealthMetricsDto];
    }
  });

  await user.save();

  logger.info(`Health metrics updated for user: ${user.email}`);

  res.json(successResponse('Health metrics updated successfully', {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      healthMetrics: user.healthMetrics,
      bmi: user.calculateBMI(),
      bmiCategory: user.getBMICategory(),
      dailyCalories: user.calculateDailyCalories(),
    },
  }));
});

/**
 * Update dietary preferences
 */
export const updateDietaryPreferences = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const preferencesData: UpdateDietaryPreferencesDto = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Update dietary preferences
  Object.keys(preferencesData).forEach(key => {
    if (preferencesData[key as keyof UpdateDietaryPreferencesDto] !== undefined) {
      (user.dietaryPreferences as any)[key] = preferencesData[key as keyof UpdateDietaryPreferencesDto];
    }
  });

  await user.save();

  logger.info(`Dietary preferences updated for user: ${user.email}`);

  res.json(successResponse('Dietary preferences updated successfully', {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      dietaryPreferences: user.dietaryPreferences,
    },
  }));
});

/**
 * Update health goals
 */
export const updateGoals = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  const goalsData: UpdateGoalsDto = req.body;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Update health goals
  Object.keys(goalsData).forEach(key => {
    if (goalsData[key as keyof UpdateGoalsDto] !== undefined) {
      (user.goals as any)[key] = goalsData[key as keyof UpdateGoalsDto];
    }
  });

  await user.save();

  logger.info(`Health goals updated for user: ${user.email}`);

  res.json(successResponse('Health goals updated successfully', {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.getFullName(),
      goals: user.goals,
      dailyCalories: user.calculateDailyCalories(),
    },
  }));
});

/**
 * Get user statistics
 */
export const getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$emailVerified', true] }, 1, 0] }
        },
        usersByRole: {
          $push: '$role'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        activeUsers: 1,
        verifiedUsers: 1,
        inactiveUsers: { $subtract: ['$totalUsers', '$activeUsers'] },
        unverifiedUsers: { $subtract: ['$totalUsers', '$verifiedUsers'] },
        usersByRole: 1
      }
    }
  ]);

  // Count users by role
  const roleStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    ...stats[0],
    roleDistribution: roleStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>)
  };

  res.json(successResponse('User statistics retrieved successfully', result));
});
