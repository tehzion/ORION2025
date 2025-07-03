import React, { useState, useEffect } from 'react'
import { X, MessageSquare, Send, Clock, AlertTriangle, CheckCircle, User, Calendar, Building2, Edit3, Save, Shield } from 'lucide-react'
import { SupportTicket, TicketMessage, Department, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface TicketDetailModalProps {
  ticket: SupportTicket
  onClose: () => void
  onTicketUpdated: () => void
  isAdmin?: boolean
}

export function TicketDetailModal({ ticket, onClose, onTicketUpdated, isAdmin = false }: TicketDetailModalProps) {
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedStatus, setEditedStatus] = useState(ticket.status)
  const [editedPriority, setEditedPriority] = useState(ticket.priority)
  const [editedDepartment, setEditedDepartment] = useState(ticket.assigned_to_department_id || '')
  const [departments, setDepartments] = useState<Department[]>([])
  const { user, globalRole, profile } = useAuth()

  useEffect(() => {
    fetchMessages()
    if (isAdmin) {
      fetchDepartments()
    }
  }, [ticket.id])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Transform the data
      const transformedMessages = (data || []).map(message => ({
        ...message,
        user: message.user ? {
          id: message.user.id,
          email: message.user.email,
          full_name: message.user.raw_user_meta_data?.full_name || message.user.email?.split('@')[0] || 'Unknown'
        } : undefined
      }))

      setMessages(transformedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: ticket.id,
          user_id: user.id,
          content: newMessage.trim()
        }])

      if (error) throw error

      setNewMessage('')
      fetchMessages()
      
      // Update ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticket.id)

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTicket = async () => {
    if (!isAdmin) return

    try {
      const updates: any = {
        status: editedStatus,
        priority: editedPriority,
        assigned_to_department_id: editedDepartment || null,
        updated_at: new Date().toISOString()
      }

      // If assigning to a department and status is open, change to in_progress
      if (editedDepartment && ticket.status === 'open') {
        updates.status = 'in_progress'
        setEditedStatus('in_progress')
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticket.id)

      if (error) throw error

      setIsEditing(false)
      onTicketUpdated()
    } catch (error) {
      console.error('Error updating ticket:', error)
    }
  }

  const getStatusIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-400" />
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-slate-400" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'in_progress':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'closed':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
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
        hour: '2-digit',
        minute: '2-digit',
        timeZone: userTimeZone || undefined
      })
    }
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            {getStatusIcon(ticket.status)}
            <div>
              <h2 className="text-xl font-semibold text-white">{ticket.subject}</h2>
              <p className="text-slate-400 text-sm">
                Ticket #{ticket.id.slice(-8)} • Created {formatDate(ticket.created_at, profile?.timezone)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="p-6 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Description</h4>
                <p className="text-white leading-relaxed">{ticket.description}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-400 text-sm">Submitted by:</span>
                  <span className="text-white text-sm">
                    {ticket.user?.full_name || ticket.user?.email || 'Unknown User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {isEditing && isAdmin ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Status</label>
                    <select
                      value={editedStatus}
                      onChange={(e) => setEditedStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Priority</label>
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Department</label>
                    <select
                      value={editedDepartment}
                      onChange={(e) => setEditedDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Unassigned</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateTicket}
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Save className="h-3 w-3" />
                    <span>Save Changes</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">Status:</span>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">Priority:</span>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority.toUpperCase()}
                    </div>
                  </div>

                  {ticket.department && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 text-sm">Department:</span>
                      <span className="text-white text-sm">{ticket.department.name}</span>
                    </div>
                  )}

                  {ticket.assigned_user && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-400 text-sm">Assigned to:</span>
                      <span className="text-white text-sm">{ticket.assigned_user.full_name}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">Last updated:</span>
                    <span className="text-white text-sm">{formatDate(ticket.updated_at, profile?.timezone)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center space-x-2 text-slate-300 mb-4">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">
              Messages ({messages.length})
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">
                      {getUserInitials(message.user?.full_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {message.user?.full_name || message.user?.email || 'Unknown User'}
                      </span>
                      {globalRole === 'super_admin' && message.user_id !== ticket.user_id && (
                        <div className="bg-purple-500/20 px-2 py-0.5 rounded-full">
                          <div className="flex items-center space-x-1">
                            <Shield className="h-2 w-2 text-purple-400" />
                            <span className="text-purple-400 text-xs font-medium">Support</span>
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatDate(message.created_at, profile?.timezone)}
                      </span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-medium">
                {getUserInitials(user?.user_metadata?.full_name || user?.email)}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={1000}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">
                  {newMessage.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || submitting}
                  className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Send className="h-3 w-3" />
                  <span>{submitting ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}