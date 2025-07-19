import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';
import { UpdateProfileRequest } from '@shared/index';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phoneNumber: z.string().optional(),
});

const healthMetricsSchema = z.object({
  height: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be less than 250cm').optional(),
  weight: z.number().min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg').optional(),
  targetWeight: z.number().min(30, 'Target weight must be at least 30kg').max(300, 'Target weight must be less than 300kg').optional(),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  weeklyWeightLossGoal: z.number().min(0.25).max(1.0),
});

const dietaryPreferencesSchema = z.object({
  dietType: z.enum(['regular', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean']),
  allergies: z.array(z.string()).default([]),
  excludedFoods: z.array(z.string()).default([]),
  mealFrequency: z.number().min(3).max(6),
});

const goalsSchema = z.object({
  type: z.enum(['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain']),
  targetDate: z.string().optional(),
  notes: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type HealthMetricsFormData = z.infer<typeof healthMetricsSchema>;
type DietaryPreferencesFormData = z.infer<typeof dietaryPreferencesSchema>;
type GoalsFormData = z.infer<typeof goalsSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isHealthLoading, setIsHealthLoading] = useState(false);
  const [isDietaryLoading, setIsDietaryLoading] = useState(false);
  const [isGoalsLoading, setIsGoalsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dateOfBirth: user?.profile?.dateOfBirth || '',
      gender: user?.profile?.gender || undefined,
      phoneNumber: user?.profile?.phoneNumber || '',
    },
  });

  const healthForm = useForm<HealthMetricsFormData>({
    resolver: zodResolver(healthMetricsSchema),
    defaultValues: {
      height: user?.healthMetrics?.height || undefined,
      weight: user?.healthMetrics?.weight || undefined,
      targetWeight: user?.healthMetrics?.targetWeight || undefined,
      activityLevel: user?.healthMetrics?.activityLevel || 'sedentary',
      weeklyWeightLossGoal: user?.healthMetrics?.weeklyWeightLossGoal || 0.5,
    },
  });

  const dietaryForm = useForm<DietaryPreferencesFormData>({
    resolver: zodResolver(dietaryPreferencesSchema),
    defaultValues: {
      dietType: user?.dietaryPreferences?.dietType || 'regular',
      allergies: user?.dietaryPreferences?.allergies || [],
      excludedFoods: user?.dietaryPreferences?.excludedFoods || [],
      mealFrequency: user?.dietaryPreferences?.mealFrequency || 3,
    },
  });

  const goalsForm = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      type: user?.goals?.type || 'maintenance',
      targetDate: user?.goals?.targetDate || '',
      notes: user?.goals?.notes || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true);
    try {
      const updateData: UpdateProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        profile: {
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          phoneNumber: data.phoneNumber,
        },
      };
      await userService.updateProfile(updateData);
      // Show success message
    } catch (error) {
      profileForm.setError('root', {
        message: error instanceof Error ? error.message : 'Update failed',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onHealthSubmit = async (data: HealthMetricsFormData) => {
    setIsHealthLoading(true);
    try {
      await userService.updateHealthMetrics(data);
      // Show success message
    } catch (error) {
      healthForm.setError('root', {
        message: error instanceof Error ? error.message : 'Health metrics update failed',
      });
    } finally {
      setIsHealthLoading(false);
    }
  };

  const onDietarySubmit = async (data: DietaryPreferencesFormData) => {
    setIsDietaryLoading(true);
    try {
      await userService.updateDietaryPreferences(data);
      // Show success message
    } catch (error) {
      dietaryForm.setError('root', {
        message: error instanceof Error ? error.message : 'Dietary preferences update failed',
      });
    } finally {
      setIsDietaryLoading(false);
    }
  };

  const onGoalsSubmit = async (data: GoalsFormData) => {
    setIsGoalsLoading(true);
    try {
      await userService.updateGoals(data);
      // Show success message
    } catch (error) {
      goalsForm.setError('root', {
        message: error instanceof Error ? error.message : 'Goals update failed',
      });
    } finally {
      setIsGoalsLoading(false);
    }
  };

  const onPasswordSubmit = async (_data: PasswordFormData) => {
    setIsPasswordLoading(true);
    try {
      // Call password update API
      passwordForm.reset();
      // Show success message
    } catch (error) {
      passwordForm.setError('root', {
        message: error instanceof Error ? error.message : 'Password update failed',
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and diet planner preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Profile Info Card */}
          <div className="xl:col-span-1">
            <Card>
              <CardContent className="text-center">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {user?.firstName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user?.role}
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                </div>
                
                {/* Health Summary */}
                {user?.bmi && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-400">Current BMI</div>
                    <div className="text-lg font-bold text-blue-900 dark:text-blue-400">{user.bmi.toFixed(1)}</div>
                    <div className="text-xs text-blue-700 dark:text-blue-300 capitalize">{user.bmiCategory}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Forms */}
          <div className="xl:col-span-3 space-y-8">
            {/* Basic Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      error={profileForm.formState.errors.firstName?.message}
                      {...profileForm.register('firstName')}
                    />
                    <Input
                      label="Last Name"
                      error={profileForm.formState.errors.lastName?.message}
                      {...profileForm.register('lastName')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Date of Birth"
                      type="date"
                      error={profileForm.formState.errors.dateOfBirth?.message}
                      {...profileForm.register('dateOfBirth')}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gender
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        {...profileForm.register('gender')}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Input
                      label="Phone Number"
                      type="tel"
                      error={profileForm.formState.errors.phoneNumber?.message}
                      {...profileForm.register('phoneNumber')}
                    />
                  </div>

                  {profileForm.formState.errors.root && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {profileForm.formState.errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={isProfileLoading}
                    disabled={isProfileLoading}
                  >
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Health Metrics Form */}
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={healthForm.handleSubmit(onHealthSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Height (cm)"
                      type="number"
                      error={healthForm.formState.errors.height?.message}
                      {...healthForm.register('height', { valueAsNumber: true })}
                    />
                    <Input
                      label="Current Weight (kg)"
                      type="number"
                      step="0.1"
                      error={healthForm.formState.errors.weight?.message}
                      {...healthForm.register('weight', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Target Weight (kg)"
                      type="number"
                      step="0.1"
                      error={healthForm.formState.errors.targetWeight?.message}
                      {...healthForm.register('targetWeight', { valueAsNumber: true })}
                    />
                    <Input
                      label="Weekly Weight Loss Goal (kg)"
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="1.0"
                      error={healthForm.formState.errors.weeklyWeightLossGoal?.message}
                      {...healthForm.register('weeklyWeightLossGoal', { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Activity Level
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      {...healthForm.register('activityLevel')}
                    >
                      <option value="sedentary">Sedentary (little to no exercise)</option>
                      <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                      <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                      <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                      <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
                    </select>
                  </div>

                  {healthForm.formState.errors.root && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {healthForm.formState.errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={isHealthLoading}
                    disabled={isHealthLoading}
                  >
                    Update Health Metrics
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Dietary Preferences Form */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={dietaryForm.handleSubmit(onDietarySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Diet Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        {...dietaryForm.register('dietType')}
                      >
                        <option value="regular">Regular</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="keto">Keto</option>
                        <option value="paleo">Paleo</option>
                        <option value="mediterranean">Mediterranean</option>
                      </select>
                    </div>
                    <Input
                      label="Meal Frequency (per day)"
                      type="number"
                      min="3"
                      max="6"
                      error={dietaryForm.formState.errors.mealFrequency?.message}
                      {...dietaryForm.register('mealFrequency', { valueAsNumber: true })}
                    />
                  </div>

                  {dietaryForm.formState.errors.root && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {dietaryForm.formState.errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={isDietaryLoading}
                    disabled={isDietaryLoading}
                  >
                    Update Dietary Preferences
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Goals Form */}
            <Card>
              <CardHeader>
                <CardTitle>Health Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={goalsForm.handleSubmit(onGoalsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Goal Type
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        {...goalsForm.register('type')}
                      >
                        <option value="weight_loss">Weight Loss</option>
                        <option value="weight_gain">Weight Gain</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="muscle_gain">Muscle Gain</option>
                      </select>
                    </div>
                    <Input
                      label="Target Date"
                      type="date"
                      error={goalsForm.formState.errors.targetDate?.message}
                      {...goalsForm.register('targetDate')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      placeholder="Any additional notes about your goals..."
                      {...goalsForm.register('notes')}
                    />
                  </div>

                  {goalsForm.formState.errors.root && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {goalsForm.formState.errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={isGoalsLoading}
                    disabled={isGoalsLoading}
                  >
                    Update Goals
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Password Form */}
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                  />

                  <Input
                    label="New Password"
                    type="password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                    helperText="Must contain at least 8 characters with uppercase, lowercase, and number"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                    {...passwordForm.register('confirmPassword')}
                  />

                  {passwordForm.formState.errors.root && (
                    <div className="text-red-500 dark:text-red-400 text-sm">
                      {passwordForm.formState.errors.root.message}
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={isPasswordLoading}
                    disabled={isPasswordLoading}
                  >
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive email notifications about your account activity
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        defaultChecked 
                        aria-label="Enable email notifications"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-red-900 dark:text-red-400">
                          Delete Account
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};
