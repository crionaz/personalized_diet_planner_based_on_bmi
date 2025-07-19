import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { 
  Settings as SettingsIcon, 
  Save, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Globe,
  Key
} from 'lucide-react'
import toast from 'react-hot-toast'

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'My Application',
    siteDescription: 'A modern fullstack application',
    siteUrl: 'https://myapp.com',
    
    // Email Settings
    emailEnabled: true,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    
    // Security Settings
    passwordMinLength: 8,
    requireEmailVerification: true,
    sessionTimeout: 60, // minutes
    maxLoginAttempts: 5,
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    userRegistrationNotifications: true,
    
    // Database Settings
    backupEnabled: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    retentionPeriod: 30, // days
  })

  const [activeTab, setActiveTab] = useState('general')

  const handleSave = async () => {
    try {
      // In a real app, you would make an API call here
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'database', name: 'Database', icon: Database },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site URL
              </label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )

      case 'email':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={settings.emailEnabled}
                onChange={(e) => handleInputChange('emailEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailEnabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Enable email functionality
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtpHost}
                onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="32"
                value={settings.passwordMinLength}
                onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Require email verification for new accounts
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="15"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Enable email notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="systemAlerts"
                checked={settings.systemAlerts}
                onChange={(e) => handleInputChange('systemAlerts', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Enable system alerts
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="userRegistrationNotifications"
                checked={settings.userRegistrationNotifications}
                onChange={(e) => handleInputChange('userRegistrationNotifications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="userRegistrationNotifications" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Notify on new user registrations
              </label>
            </div>
          </div>
        )

      case 'database':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="backupEnabled"
                checked={settings.backupEnabled}
                onChange={(e) => handleInputChange('backupEnabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="backupEnabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Enable automatic backups
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retention Period (days)
              </label>
              <input
                type="number"
                min="7"
                max="365"
                value={settings.retentionPeriod}
                onChange={(e) => handleInputChange('retentionPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
              <div className="flex">
                <Database className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Database Maintenance
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      Regular backups are essential for data protection. Ensure you have adequate storage space
                      and test restore procedures regularly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="admin-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {tabs.find(tab => tab.id === activeTab)?.icon && (
                  React.createElement(tabs.find(tab => tab.id === activeTab)!.icon, {
                    className: "h-5 w-5 text-blue-600 mr-2"
                  })
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tabs.find(tab => tab.id === activeTab)?.name} Settings
                </h2>
              </div>
              <button
                onClick={handleSave}
                className="btn-admin-primary flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
