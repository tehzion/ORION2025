import React, { useState } from 'react'
import { Settings, Shield, Users, Database, Bell, Globe, Key, Save, AlertCircle, CheckCircle } from 'lucide-react'

interface SystemSetting {
  id: string
  name: string
  description: string
  value: string | boolean | number
  type: 'text' | 'boolean' | 'number' | 'select'
  category: 'security' | 'general' | 'notifications' | 'integrations'
  options?: { value: string; label: string }[]
}

const DEMO_SYSTEM_SETTINGS: SystemSetting[] = [
  // Security Settings
  {
    id: 'session_timeout',
    name: 'Session Timeout',
    description: 'Automatically log out users after inactivity (minutes)',
    value: 30,
    type: 'number',
    category: 'security'
  },
  {
    id: 'password_policy',
    name: 'Password Policy',
    description: 'Minimum password length requirement',
    value: 8,
    type: 'number',
    category: 'security'
  },
  {
    id: 'two_factor_auth',
    name: 'Two-Factor Authentication',
    description: 'Require 2FA for all users',
    value: true,
    type: 'boolean',
    category: 'security'
  },
  {
    id: 'ip_whitelist',
    name: 'IP Whitelist',
    description: 'Restrict access to specific IP addresses',
    value: '',
    type: 'text',
    category: 'security'
  },
  
  // General Settings
  {
    id: 'company_name',
    name: 'Company Name',
    description: 'Display name for the system',
    value: 'Mojo Digital',
    type: 'text',
    category: 'general'
  },
  {
    id: 'timezone',
    name: 'Default Timezone',
    description: 'System default timezone',
    value: 'UTC',
    type: 'select',
    category: 'general',
    options: [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time' },
      { value: 'America/Chicago', label: 'Central Time' },
      { value: 'America/Denver', label: 'Mountain Time' },
      { value: 'America/Los_Angeles', label: 'Pacific Time' },
      { value: 'Europe/London', label: 'London' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Asia/Tokyo', label: 'Tokyo' }
    ]
  },
  {
    id: 'language',
    name: 'Default Language',
    description: 'System default language',
    value: 'en',
    type: 'select',
    category: 'general',
    options: [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'ja', label: 'Japanese' }
    ]
  },
  
  // Notification Settings
  {
    id: 'email_notifications',
    name: 'Email Notifications',
    description: 'Enable email notifications',
    value: true,
    type: 'boolean',
    category: 'notifications'
  },
  {
    id: 'push_notifications',
    name: 'Push Notifications',
    description: 'Enable browser push notifications',
    value: true,
    type: 'boolean',
    category: 'notifications'
  },
  {
    id: 'notification_frequency',
    name: 'Notification Frequency',
    description: 'How often to send digest notifications',
    value: 'daily',
    type: 'select',
    category: 'notifications',
    options: [
      { value: 'immediate', label: 'Immediate' },
      { value: 'hourly', label: 'Hourly' },
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' }
    ]
  },
  
  // Integration Settings
  {
    id: 'slack_integration',
    name: 'Slack Integration',
    description: 'Enable Slack notifications',
    value: false,
    type: 'boolean',
    category: 'integrations'
  },
  {
    id: 'github_integration',
    name: 'GitHub Integration',
    description: 'Enable GitHub repository linking',
    value: true,
    type: 'boolean',
    category: 'integrations'
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Enable Google Analytics tracking',
    value: false,
    type: 'boolean',
    category: 'integrations'
  }
]

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>(DEMO_SYSTEM_SETTINGS)
  const [activeCategory, setActiveCategory] = useState<string>('general')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const categories = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: Globe }
  ]

  const handleSettingChange = (settingId: string, value: string | boolean | number) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('System settings updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const filteredSettings = settings.filter(setting => setting.category === activeCategory)

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        )
      
      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors ${
              setting.value ? 'bg-purple-600' : 'bg-slate-700'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                setting.value ? 'transform translate-x-5' : ''
              }`}></div>
            </div>
          </label>
        )
      
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-slate-400">Manage system-wide configuration and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-200 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-200 font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Category Navigation */}
        <div className="lg:w-64">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                const isActive = category.id === activeCategory
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-purple-600 text-white' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {categories.find(c => c.id === activeCategory)?.name} Settings
              </h2>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>

            <div className="space-y-6">
              {filteredSettings.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No settings found</h3>
                  <p className="text-slate-400 text-sm">
                    No settings available for this category
                  </p>
                </div>
              ) : (
                filteredSettings.map((setting) => (
                  <div key={setting.id} className="border-b border-slate-700 pb-6 last:border-b-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{setting.name}</h3>
                        <p className="text-slate-400 text-sm">{setting.description}</p>
                      </div>
                      <div className="lg:w-48">
                        {renderSettingInput(setting)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemSettings 