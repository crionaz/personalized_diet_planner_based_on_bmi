import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { User, Lock, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleProfileSave = async () => {
    try {
      // In a real app, you would make an API call here
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      // In a real app, you would make an API call here
      toast.success('Password updated successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error('Failed to update password')
    }
  }

  const handleProfileInputChange = (key: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePasswordInputChange = (key: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <User className="mr-3 h-5 w-5" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'security'
                  ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <Lock className="mr-3 h-5 w-5" />
              Security
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="admin-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>
                </div>
                <button
                  onClick={handleProfileSave}
                  className="btn-admin-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <button className="btn-admin-secondary flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleProfileInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user?.role || 'Admin'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleProfileInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="admin-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h2>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="btn-admin-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Password
                </button>
              </div>

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Security Information */}
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex">
                  <Lock className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Password Security Tips
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use a strong, unique password</li>
                        <li>Include uppercase, lowercase, numbers, and symbols</li>
                        <li>Avoid using personal information</li>
                        <li>Don't reuse passwords from other accounts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
