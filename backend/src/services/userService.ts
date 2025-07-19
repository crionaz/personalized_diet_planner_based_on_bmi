import User from '@/models/User';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateUserRoleDto,
  PaginationQuery,
  UserRole,
  Permission 
} from '@/types';
import { getPaginationParams, getSortParams } from '@/utils/helpers';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserDto) {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = UserRole.USER, 
      permissions = [Permission.READ_USERS],
      isActive = true 
    } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
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
    return user;
  }

  /**
   * Get users with pagination and search
   */
  static async getUsers(query: PaginationQuery) {
    const { page, limit, skip } = getPaginationParams(query);
    const sort = getSortParams(query);
    const { search } = query;

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

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    const user = await User.findById(id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updateData: UpdateUserDto) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update fields if provided
    if (updateData.firstName !== undefined) user.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) user.lastName = updateData.lastName;
    if (updateData.avatar !== undefined) user.avatar = updateData.avatar;

    await user.save();
    return user;
  }

  /**
   * Update user role and permissions
   */
  static async updateUserRole(userId: string, roleData: UpdateUserRoleDto, currentUserRole: UserRole) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent modifying super admin unless current user is super admin
    if (user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new Error('Cannot modify super admin user');
    }

    // Prevent non-super-admin from creating super admin
    if (roleData.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new Error('Only super admin can assign super admin role');
    }

    // Update role and permissions
    user.role = roleData.role;
    if (roleData.permissions) {
      user.permissions = roleData.permissions;
    }

    await user.save();
    return user;
  }

  /**
   * Toggle user active status
   */
  static async toggleUserStatus(userId: string, currentUserId: string, currentUserRole: UserRole) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent modifying super admin unless current user is super admin
    if (user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new Error('Cannot modify super admin user');
    }

    // Prevent users from deactivating themselves
    if (user._id.toString() === currentUserId) {
      throw new Error('Cannot deactivate your own account');
    }

    user.isActive = !user.isActive;
    await user.save();
    return user;
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string, currentUserId: string, currentUserRole: UserRole) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent deleting super admin unless current user is super admin
    if (user.role === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new Error('Cannot delete super admin user');
    }

    // Prevent users from deleting themselves
    if (user._id.toString() === currentUserId) {
      throw new Error('Cannot delete your own account');
    }

    await User.findByIdAndDelete(userId);
    return user;
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
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

    const roleDistribution = usersByRole.reduce((acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const growthRate = usersLastMonth > 0 
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(2)
      : '0';

    return {
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
  }

  /**
   * Bulk update users
   */
  static async bulkUpdateUsers(userIds: string[], updates: any, currentUserRole: UserRole) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs array is required');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Updates object is required');
    }

    // Prevent updating super admin users unless current user is super admin
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      const superAdminUsers = await User.find({
        _id: { $in: userIds },
        role: UserRole.SUPER_ADMIN
      });

      if (superAdminUsers.length > 0) {
        throw new Error('Cannot modify super admin users');
      }
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: updates }
    );

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }
}
