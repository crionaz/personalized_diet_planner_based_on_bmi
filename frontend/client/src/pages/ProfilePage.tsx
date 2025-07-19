import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
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
type PasswordFormData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileLoading(true);
    try {
      await updateProfile(data);
      // Show success message
    } catch (error) {
      profileForm.setError('root', {
        message: error instanceof Error ? error.message : 'Update failed',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="text-center">
                <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {user?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{user?.email}</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {user?.role}
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(user?.createdAt || '').toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Form */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <Input
                    label="Full Name"
                    error={profileForm.formState.errors.name?.message}
                    {...profileForm.register('name')}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    error={profileForm.formState.errors.email?.message}
                    {...profileForm.register('email')}
                  />

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
                      <input type="checkbox" className="sr-only peer" defaultChecked />
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

                  <div className="border-t border-gray-200 pt-6">
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
