import React, { useState } from 'react'
import { X, Mail, UserPlus, Shield, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { ProjectMember, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface InviteMemberFormProps {
  projectId: string
  onClose: () => void
  onMemberInvited?: () => void
}

export function InviteMemberForm({ projectId, onClose, onMemberInvited }: InviteMemberFormProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ProjectMember['role']>('developer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !email.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // First, check if the email corresponds to an existing user
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', email.trim().toLowerCase())
        .single()

      if (userError || !userData) {
        throw new Error('User with this email address not found. They need to create an account first.')
      }

      // Check if user is already a member of this project
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('project_members')
        .select('id, role')
        .eq('project_id', projectId)
        .eq('user_id', userData.id)
        .single()

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw memberCheckError
      }

      if (existingMember) {
        throw new Error(`This user is already a member of this project with the role: ${existingMember.role}`)
      }

      // Add the user as a project member
      const { error: insertError } = await supabase
        .from('project_members')
        .insert([{
          project_id: projectId,
          user_id: userData.id,
          role: role,
          invited_by: user.id,
          joined_at: new Date().toISOString() // Auto-join for now
        }])

      if (insertError) throw insertError

      setSuccess(`Successfully invited ${email} as a ${role}!`)
      setEmail('')
      
      // Call callback if provided
      if (onMemberInvited) {
        onMemberInvited()
      }

      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to invite team member')
    } finally {
      setLoading(false)
    }
  }

  const roleDescriptions = {
    owner: 'Full access to project settings, can invite/remove members, approve tasks',
    developer: 'Can create and manage tasks, upload deliverables, view all project content',
    client: 'Can review and approve tasks, add comments, view project progress',
    viewer: 'Read-only access to project overview and basic task information'
  }

  const roleColors = {
    owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    developer: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    client: 'bg-green-500/20 text-green-400 border-green-500/30',
    viewer: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Invite Team Member</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
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
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter team member's email..."
            />
            <p className="text-xs text-slate-400 mt-1">
              The user must already have an account to be invited
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Role</span>
              </div>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectMember['role'])}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="developer">Developer</option>
              <option value="client">Client</option>
              <option value="viewer">Viewer</option>
              <option value="owner">Owner</option>
            </select>
            
            {/* Role Description */}
            <div className={`mt-3 p-3 rounded-lg border ${roleColors[role]}`}>
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm capitalize">{role} Role</p>
                  <p className="text-xs mt-1 opacity-90">
                    {roleDescriptions[role]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500/20 rounded-full p-1">
                <UserPlus className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">Team Collaboration</h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Invited members will have immediate access to the project based on their assigned role. 
                  They can start collaborating right away.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim() || success}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Inviting...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Invited!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Invite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}