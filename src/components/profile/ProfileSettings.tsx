import React, { useState, useEffect } from 'react'
import { User, Save, Mail, Shield, Calendar, CheckCircle, AlertCircle, Edit3, Clock, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const ProfileSettings: React.FC = () => {
  const { user, profile, updateProfile, updatePassword, globalRole } = useAuth()

  // Role-based permissions
  const canEditProfile = globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'developer' || globalRole === 'client'
  const canChangePassword = globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'developer' || globalRole === 'client'
  const canViewAdvancedSettings = globalRole === 'super_admin' || globalRole === 'admin'
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name)
    }
    
    // Initialize timezone
    if (profile?.timezone) {
      setTimezone(profile.timezone)
    } else {
      // Set browser's detected timezone as default
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
  }, [profile, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateProfile(fullName.trim(), timezone)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword.trim()) {
      setPasswordError('New password is required')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordLoading(true)
    setPasswordError('')
    setPasswordSuccess('')

    try {
      await updatePassword(newPassword)
      setPasswordSuccess('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess('')
      }, 3000)
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (profile?.full_name) {
      setFullName(profile.full_name)
    } else if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name)
    }
    if (profile?.timezone) {
      setTimezone(profile.timezone)
    } else {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
    setIsEditing(false)
    setError('')
  }

  const handleCancelPasswordChange = () => {
    setNewPassword('')
    setConfirmPassword('')
    setShowPasswordForm(false)
    setPasswordError('')
    setPasswordSuccess('')
  }

  const formatDate = (dateString: string, userTimeZone?: string | null) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: userTimeZone || undefined
    })
  }

  const getUserInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'user':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin'
      case 'user':
        return 'User'
      default:
        return 'Unknown'
    }
  }

  // Get available timezones (common ones for demo)
  const availableTimezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information and preferences</p>
      </div>

      {/* Success Messages */}
      {success && (
        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-200 font-medium">{success}</p>
        </div>
      )}

      {passwordSuccess && (
        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-200 font-medium">{passwordSuccess}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="text-center">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {getUserInitials(profile?.full_name, user?.email)}
                </span>
              </div>

              {/* Name */}
              <h2 className="text-xl font-semibold text-white mb-1">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </h2>

              {/* Email */}
              <p className="text-slate-400 text-sm mb-3">{user?.email}</p>

              {/* Role Badge */}
              {globalRole && (
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getRoleBadgeColor(globalRole)}`}>
                  <Shield className="h-3 w-3" />
                  <span>{getRoleLabel(globalRole)}</span>
                </div>
              )}

              {/* Account Info */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Created</span>
                    <span className="text-white text-xs">
                      {profile?.created_at ? formatDate(profile.created_at, profile?.timezone) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Updated</span>
                    <span className="text-white text-xs">
                      {profile?.updated_at ? formatDate(profile.updated_at, profile?.timezone) : 'Never'}
                    </span>
                  </div>
                  {profile?.timezone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Time Zone</span>
                      <span className="text-white text-xs">{profile.timezone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Account Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </div>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter your full name"
                  maxLength={100}
                />
                {isEditing && (
                  <p className="text-xs text-slate-400 mt-1">
                    {fullName.length}/100 characters
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 cursor-not-allowed opacity-60"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Email address cannot be changed. Contact support if you need to update this.
                </p>
              </div>

              {/* Time Zone */}
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-white mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Time Zone</span>
                  </div>
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {availableTimezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {isEditing && (
                  <p className="text-xs text-slate-400 mt-1">
                    Select your preferred time zone for date displays.
                  </p>
                )}
              </div>

              {/* Global Role (Read-only) */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Account Role</span>
                  </div>
                </label>
                <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getRoleBadgeColor(globalRole || 'user')}`}>
                    <Shield className="h-3 w-3" />
                    <span>{getRoleLabel(globalRole || 'user')}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Your account role is managed by system administrators.
                </p>
              </div>

              {/* Account Dates (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member Since</span>
                    </div>
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300">
                    {profile?.created_at ? formatDate(profile.created_at, profile?.timezone) : 'Unknown'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last Updated</span>
                    </div>
                  </label>
                  <div className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300">
                    {profile?.updated_at ? formatDate(profile.updated_at, profile?.timezone) : 'Never'}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !fullName.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Account Security Card */}
          <div className="mt-6 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Account Security</h3>
            <div className="space-y-4">
              {/* Password Section */}
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div>
                  <h4 className="text-white font-medium">Password</h4>
                  <p className="text-slate-400 text-sm">Update your account password</p>
                </div>
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Change Password
                </button>
              </div>

              {/* Password Change Form */}
              {showPasswordForm && (
                <div className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-white mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                          placeholder="Enter new password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                          placeholder="Confirm new password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Error */}
                    {passwordError && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-200 text-sm">{passwordError}</p>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelPasswordChange}
                        className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading || !newPassword || !confirmPassword}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        {passwordLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                </div>
                <button className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings