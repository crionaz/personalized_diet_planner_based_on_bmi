import { Response } from 'express';
import User from '@/models/User';
import { 
  AuthenticatedRequest, 
  CreateUserDto, 
  UpdateUserRoleDto,
  UserRole,
  Permission 
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
 * Create a new user (Admin only)
 */
export const createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    role = UserRole.USER, 
    permissions = [Permission.READ_USERS],
    isActive = true 
  }: CreateUserDto = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400).json(errorResponse('User already exists with this email'));
    return;
  }

  // Create user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    role,
    permissions,
    isActive,
    emailVerified: true, // Admin-created users are auto-verified
  });

  await user.save();

  logger.info(`User created by admin: ${email}, Role: ${role}`);

  res.status(201).json(successResponse('User created successfully', {
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
  }));
});

/**
 * Update user role and permissions (Admin only)
 */
export const updateUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { role, permissions }: UpdateUserRoleDto = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Prevent modifying super admin unless current user is super admin
  if (user.role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json(errorResponse('Cannot modify super admin user'));
    return;
  }

  // Prevent non-super-admin from creating super admin
  if (role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json(errorResponse('Only super admin can assign super admin role'));
    return;
  }

  // Update role and permissions
  user.role = role;
  if (permissions) {
    user.permissions = permissions;
  }

  await user.save();

  logger.info(`User role updated by admin: ${user.email}, New Role: ${role}`);

  res.json(successResponse('User role updated successfully', {
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
      updatedAt: user.updatedAt,
    },
  }));
});

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Prevent deactivating super admin unless current user is super admin
  if (user.role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json(errorResponse('Cannot modify super admin user'));
    return;
  }

  // Prevent users from deactivating themselves
  if (user._id.toString() === req.user!._id.toString()) {
    res.status(400).json(errorResponse('Cannot deactivate your own account'));
    return;
  }

  user.isActive = !user.isActive;
  await user.save();

  logger.info(`User status toggled by admin: ${user.email}, Active: ${user.isActive}`);

  res.json(successResponse(`User ${user.isActive ? 'activated' : 'deactivated'} successfully`, {
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
      updatedAt: user.updatedAt,
    },
  }));
});

/**
 * Delete user (Admin only)
 */
export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404).json(errorResponse('User not found'));
    return;
  }

  // Prevent deleting super admin unless current user is super admin
  if (user.role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
    res.status(403).json(errorResponse('Cannot delete super admin user'));
    return;
  }

  // Prevent users from deleting themselves
  if (user._id.toString() === req.user!._id.toString()) {
    res.status(400).json(errorResponse('Cannot delete your own account'));
    return;
  }

  await User.findByIdAndDelete(id);

  logger.info(`User deleted by admin: ${user.email}`);

  res.json(successResponse('User deleted successfully'));
});

/**
 * Get dashboard statistics (Admin only)
 */
export const getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const [
    totalUsers,
    activeUsers,
    verifiedUsers,
    recentUsers,
    usersByRole,
    usersThisMonth,
    usersLastMonth
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ emailVerified: true }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email role createdAt'),
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }),
    User.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    })
  ]);

  const roleDistribution = usersByRole.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {} as Record<string, number>);

  const growthRate = usersLastMonth > 0 
    ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(2)
    : '0';

  const stats = {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    verifiedUsers,
    unverifiedUsers: totalUsers - verifiedUsers,
    usersThisMonth,
    usersLastMonth,
    growthRate: `${growthRate}%`,
    roleDistribution,
    recentUsers,
  };

  res.json(successResponse('Dashboard statistics retrieved successfully', stats));
});

/**
 * Get system information (Super Admin only)
 */
export const getSystemInfo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const systemInfo = {
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };

  res.json(successResponse('System information retrieved successfully', systemInfo));
});

/**
 * Bulk update users (Super Admin only)
 */
export const bulkUpdateUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userIds, updates } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    res.status(400).json(errorResponse('User IDs array is required'));
    return;
  }

  if (!updates || Object.keys(updates).length === 0) {
    res.status(400).json(errorResponse('Updates object is required'));
    return;
  }

  // Prevent updating super admin users unless current user is super admin
  if (req.user!.role !== UserRole.SUPER_ADMIN) {
    const superAdminUsers = await User.find({
      _id: { $in: userIds },
      role: UserRole.SUPER_ADMIN
    });

    if (superAdminUsers.length > 0) {
      res.status(403).json(errorResponse('Cannot modify super admin users'));
      return;
    }
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    { $set: updates }
  );

  logger.info(`Bulk update performed by admin: ${result.modifiedCount} users updated`);

  res.json(successResponse(`${result.modifiedCount} users updated successfully`, {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
  }));
});
