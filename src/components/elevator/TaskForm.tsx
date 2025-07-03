import React, { useState, useEffect } from 'react'
import { X, Calendar, User, FileText, Tag, ExternalLink } from 'lucide-react'
import { Task, ProjectMember, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface TaskFormProps {
  projectId: string
  onClose: () => void
  onTaskCreated: () => void
}

interface ProjectMemberWithUser extends ProjectMember {
  user?: {
    id: string
    email: string
    full_name?: string
  }
}

export function TaskForm({ projectId, onClose, onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Task['status']>('pending')
  const [dueDate, setDueDate] = useState('')
  const [deliverableLink, setDeliverableLink] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [projectMembers, setProjectMembers] = useState<ProjectMemberWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchProjectMembers()
  }, [projectId])

  const fetchProjectMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('project_id', projectId)
        .order('role', { ascending: true })

      if (error) throw error

      // Transform the data to include user information
      const transformedMembers = (data || []).map(member => ({
        ...member,
        user: member.user ? {
          id: member.user.id,
          email: member.user.email,
          full_name: member.user.raw_user_meta_data?.full_name || member.user.email?.split('@')[0] || 'Unknown'
        } : undefined
      }))

      setProjectMembers(transformedMembers)
      
      // Set current user as default assignee if they're a member
      const currentUserMember = transformedMembers.find(m => m.user_id === user?.id)
      if (currentUserMember) {
        setAssigneeId(currentUserMember.user_id)
      }
    } catch (error) {
      console.error('Error fetching project members:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Get the highest floor position to place new task at the top
      const { data: existingTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('floor_position')
        .eq('project_id', projectId)
        .order('floor_position', { ascending: false })
        .limit(1)

      if (fetchError) throw fetchError

      const nextFloorPosition = existingTasks && existingTasks.length > 0 
        ? existingTasks[0].floor_position + 1 
        : 1

      const taskData = {
        project_id: projectId,
        title: title.trim(),
        description: description.trim(),
        status,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
        deliverable_link: deliverableLink.trim() || null,
        floor_position: nextFloorPosition
      }

      const { error: insertError } = await supabase
        .from('tasks')
        .insert([taskData])

      if (insertError) throw insertError

      onTaskCreated()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-400'
      case 'developer':
        return 'bg-blue-500/20 text-blue-400'
      case 'client':
        return 'bg-green-500/20 text-green-400'
      case 'viewer':
        return 'bg-slate-500/20 text-slate-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Task Title</span>
              </div>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe the task details..."
            />
          </div>

          {/* Assignee Selection */}
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Assign To</span>
              </div>
            </label>
            <select
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.user_id}>
                  {member.user?.full_name || member.user?.email || 'Unknown User'} ({member.role})
                </option>
              ))}
            </select>
            {projectMembers.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-slate-400">Project Members:</p>
                <div className="flex flex-wrap gap-2">
                  {projectMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}
                    >
                      {member.user?.full_name || member.user?.email?.split('@')[0] || 'Unknown'} ({member.role})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Status</span>
              </div>
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="ready-for-review">Ready for Review</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          {/* Deliverable Link */}
          <div>
            <label htmlFor="deliverableLink" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Deliverable Link (Optional)</span>
              </div>
            </label>
            <input
              id="deliverableLink"
              type="url"
              value={deliverableLink}
              onChange={(e) => setDeliverableLink(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://figma.com/design or https://github.com/pull/123"
            />
            <p className="text-xs text-slate-400 mt-1">
              Link to Figma designs, GitHub PR, staging site, etc.
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Due Date (Optional)</span>
              </div>
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={getTomorrowDate()}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

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
              disabled={loading || !title.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}