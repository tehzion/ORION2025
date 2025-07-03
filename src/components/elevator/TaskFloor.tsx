import React, { useState } from 'react'
import { Clock, User, CheckCircle, Circle, AlertCircle, Eye, ExternalLink, ThumbsUp, MessageSquare, Send, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { Task, ProjectMember } from '../../lib/supabase'
import { CommentSection } from './CommentSection'
import { useAuth } from '../../contexts/AuthContext'

interface TaskFloorProps {
  task: Task
  floorNumber: number
  userRoleInProject?: ProjectMember['role'] | null
  onApprove?: (taskId: string) => void
  onRequestRevisions?: (taskId: string, comments: string) => void
}

export function TaskFloor({ task, floorNumber, userRoleInProject, onApprove, onRequestRevisions }: TaskFloorProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [revisionComments, setRevisionComments] = useState('')
  const { profile } = useAuth()

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'complete':
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case 'ready-for-review':
        return <Eye className="h-5 w-5 text-blue-400" />
      case 'revisions-requested':
        return <MessageSquare className="h-5 w-5 text-orange-400" />
      case 'pending':
        return <Circle className="h-5 w-5 text-slate-400" />
      default:
        return <Circle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'complete':
      case 'approved':
        return 'border-green-500 bg-green-500/10'
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'ready-for-review':
        return 'border-blue-500 bg-blue-500/10'
      case 'revisions-requested':
        return 'border-orange-500 bg-orange-500/10'
      case 'pending':
        return 'border-slate-600 bg-slate-800'
      default:
        return 'border-slate-600 bg-slate-800'
    }
  }

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'ready-for-review':
        return 'Ready for Review'
      case 'revisions-requested':
        return 'Revisions Requested'
      default:
        return status.replace('-', ' ')
    }
  }

  const formatDate = (dateString: string, userTimeZone?: string | null) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: userTimeZone || undefined
    })
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !['complete', 'approved'].includes(task.status)

  const handleApprove = () => {
    if (onApprove) {
      onApprove(task.id)
    }
  }

  const handleRequestRevisions = () => {
    if (onRequestRevisions && revisionComments.trim()) {
      onRequestRevisions(task.id, revisionComments.trim())
      setRevisionComments('')
      setShowRevisionForm(false)
    }
  }

  // Check if user can review tasks (owner, client)
  const canReviewTasks = userRoleInProject && ['owner', 'client'].includes(userRoleInProject)

  // Check if user can see deliverable links (all roles except viewer for external links)
  const canSeeDeliverables = userRoleInProject && userRoleInProject !== 'viewer'

  return (
    <div className="relative">
      {/* Floor Number */}
      <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-slate-700 border-2 border-slate-600 rounded-full flex items-center justify-center">
        <span className="text-sm font-bold text-white">{floorNumber}</span>
      </div>

      {/* Elevator Cable */}
      <div className="absolute -left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 to-blue-600"></div>

      {/* Task Card */}
      <div className={`ml-8 p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 ${getStatusColor(task.status)}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon(task.status)}
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              ['complete', 'approved'].includes(task.status)
                ? 'bg-green-500/20 text-green-400' 
                : task.status === 'in-progress'
                ? 'bg-yellow-500/20 text-yellow-400'
                : task.status === 'ready-for-review'
                ? 'bg-blue-500/20 text-blue-400'
                : task.status === 'revisions-requested'
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-slate-600/20 text-slate-400'
            }`}>
              {getStatusLabel(task.status)}
            </span>
            {userRoleInProject && (
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Shield className="h-3 w-3" />
                <span className="capitalize">{userRoleInProject}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-4 leading-relaxed">
          {task.description}
        </p>

        {/* Deliverable Link */}
        {task.deliverable_link && canSeeDeliverables && (
          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Deliverable</span>
              </div>
              <a
                href={task.deliverable_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View Link →
              </a>
            </div>
          </div>
        )}

        {/* Restricted Access Message for Viewers */}
        {task.deliverable_link && !canSeeDeliverables && (
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Deliverable available to project members</span>
            </div>
          </div>
        )}

        {/* Review Comments */}
        {task.review_comments && task.status === 'revisions-requested' && (
          <div className="mb-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-orange-400 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-orange-400">Revision Notes:</span>
                <p className="text-sm text-orange-200 mt-1">{task.review_comments}</p>
              </div>
            </div>
          </div>
        )}

        {/* Review Actions - Only show if user can review and task is ready for review */}
        {task.status === 'ready-for-review' && canReviewTasks && (onApprove || onRequestRevisions) && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleApprove}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => setShowRevisionForm(!showRevisionForm)}
                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Request Revisions</span>
              </button>
            </div>

            {/* Revision Form */}
            {showRevisionForm && (
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <textarea
                  value={revisionComments}
                  onChange={(e) => setRevisionComments(e.target.value)}
                  placeholder="Describe what needs to be revised..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setShowRevisionForm(false)}
                    className="px-3 py-1 text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestRevisions}
                    disabled={!revisionComments.trim()}
                    className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Review Status Message for Non-Reviewers */}
        {task.status === 'ready-for-review' && !canReviewTasks && (
          <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-200">This task is awaiting review from project owners or clients</span>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mb-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors text-sm"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comments</span>
            {showComments ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showComments && (
            <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <CommentSection taskId={task.id} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            {task.assignee_id && (
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>Assigned</span>
              </div>
            )}
            {task.due_date && (
              <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400' : ''}`}>
                <Clock className="h-3 w-3" />
                <span>Due {formatDate(task.due_date, profile?.timezone)}</span>
                {isOverdue && <span className="text-red-400 font-medium">• Overdue</span>}
              </div>
            )}
          </div>
          <div className="text-slate-500">
            Floor {floorNumber}
          </div>
        </div>
      </div>
    </div>
  )
}