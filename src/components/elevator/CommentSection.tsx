import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, Trash2, Edit3, Check, X } from 'lucide-react'
import { Comment, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface CommentSectionProps {
  taskId: string
}

export function CommentSection({ taskId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const { user, profile } = useAuth()

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            email,
            raw_user_meta_data
          )
        `)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Transform the data to match our Comment interface
      const transformedComments = (data || []).map(comment => ({
        ...comment,
        user: {
          email: comment.user?.email || 'Unknown User',
          full_name: comment.user?.raw_user_meta_data?.full_name || comment.user?.email?.split('@')[0] || 'Unknown'
        }
      }))

      setComments(transformedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          task_id: taskId,
          user_id: user.id,
          content: newComment.trim()
        }])

      if (error) throw error

      setNewComment('')
      fetchComments()
    } catch (error) {
      console.error('Error creating comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabase
        .from('comments')
        .update({ 
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)

      if (error) throw error

      setEditingId(null)
      setEditContent('')
      fetchComments()
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditContent('')
  }

  const formatDate = (dateString: string, userTimeZone?: string | null) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        timeZone: userTimeZone || undefined
      })
    }
  }

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 text-slate-300">
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Comments ({comments.length})
        </span>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-medium">
                    {getUserInitials(comment.user?.full_name || comment.user?.email || 'U')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        {comment.user?.full_name || comment.user?.email?.split('@')[0] || 'Unknown User'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(comment.created_at, profile?.timezone)}
                        {comment.updated_at !== comment.created_at && (
                          <span className="ml-1">(edited)</span>
                        )}
                      </span>
                    </div>

                    {/* Actions for own comments */}
                    {user?.id === comment.user_id && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startEditing(comment)}
                          className="text-slate-400 hover:text-white transition-colors p-1"
                          title="Edit comment"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors p-1"
                          title="Delete comment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          <Check className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="flex items-center space-x-1 bg-slate-600 hover:bg-slate-700 text-white px-2 py-1 rounded text-xs transition-colors"
                        >
                          <X className="h-3 w-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        <div className="flex items-start space-x-3">
          {/* User Avatar */}
          <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-medium">
              {getUserInitials(user?.user_metadata?.full_name || user?.email || 'U')}
            </span>
          </div>

          {/* Comment Input */}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">
                {newComment.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting || newComment.length > 500}
                className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                <Send className="h-3 w-3" />
                <span>{submitting ? 'Posting...' : 'Comment'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}