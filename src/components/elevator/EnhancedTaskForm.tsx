import React, { useState, useEffect } from 'react'
import { X, Calendar, User, FileText, Tag, ExternalLink, Paperclip, Percent, BarChart3 } from 'lucide-react'
import { Task, ProjectMember, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { FileUpload } from '../common/FileUpload'

interface EnhancedTaskFormProps {
  projectId: string
  onClose: () => void
  onTaskCreated: () => void
  initialData?: Partial<Task>
}

interface ProjectMemberWithUser extends ProjectMember {
  user?: {
    id: string
    email: string
    full_name?: string
  }
}

interface TaskAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
  preview?: string
}

export function EnhancedTaskForm({ projectId, onClose, onTaskCreated, initialData }: EnhancedTaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState<Task['status']>(initialData?.status || 'pending')
  const [dueDate, setDueDate] = useState(initialData?.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '')
  const [deliverableLink, setDeliverableLink] = useState(initialData?.deliverable_link || '')
  const [assigneeId, setAssigneeId] = useState(initialData?.assignee_id || '')
  const [completionPercentage, setCompletionPercentage] = useState(initialData?.completion_percentage || 0)
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(initialData?.priority || 'medium')
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
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

      const transformedMembers = (data || []).map(member => ({
        ...member,
        user: member.user ? {
          id: member.user.id,
          email: member.user.email,
          full_name: member.user.raw_user_meta_data?.full_name || member.user.email?.split('@')[0] || 'Unknown'
        } : undefined
      }))

      setProjectMembers(transformedMembers)
      
      if (!initialData?.assignee_id) {
        const currentUserMember = transformedMembers.find(m => m.user_id === user?.id)
        if (currentUserMember) {
          setAssigneeId(currentUserMember.user_id)
        }
      }
    } catch (error) {
      console.error('Error fetching project members:', error)
    }
  }

  const handleFilesSelected = (files: File[]) => {
    const newAttachments: TaskAttachment[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
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
        completion_percentage: completionPercentage,
        priority,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400'
      case 'high':
        return 'bg-orange-500/20 text-orange-400'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'low':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500/20 text-green-400'
      case 'ready-for-review':
        return 'bg-blue-500/20 text-blue-400'
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400'
      case 'pending':
        return 'bg-slate-500/20 text-slate-400'
      default:
        return 'bg-slate-500/20 text-slate-400'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
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
                  rows={4}
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
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Completion Percentage */}
              <div>
                <label htmlFor="completion" className="block text-sm font-medium text-white mb-2">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4" />
                    <span>Completion: {completionPercentage}%</span>
                  </div>
                </label>
                <div className="space-y-2">
                  <input
                    id="completion"
                    type="range"
                    min="0"
                    max="100"
                    value={completionPercentage}
                    onChange={(e) => setCompletionPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
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
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4" />
                <span>Attachments</span>
              </div>
            </label>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              maxFiles={5}
              maxFileSize={10}
              acceptedTypes={['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
            />
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Attached Files ({attachments.length})</h4>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-slate-700 border border-slate-600 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {attachment.preview ? (
                        <img
                          src={attachment.preview}
                          alt={attachment.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-600 rounded flex items-center justify-center">
                          <FileText className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-slate-400 text-xs">{formatFileSize(attachment.size)}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {loading ? 'Creating...' : (initialData ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 