import React, { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, MessageSquare, Calendar, Building2, User, ChevronDown, ChevronUp, ExternalLink, UserCheck, Edit3 } from 'lucide-react'
import { SupportTicket, supabase } from '../../lib/supabase'
import { TicketDetailModal } from './TicketDetailModal'
import { useAuth } from '../../contexts/AuthContext'

interface AdminTicketCardProps {
  ticket: SupportTicket
  onTicketUpdated: () => void
}

export function AdminTicketCard({ ticket, onTicketUpdated }: AdminTicketCardProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const { user, profile } = useAuth()

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
        timeZone: userTimeZone || undefined
      })
    }
  }

  const handleAssignToSelf = async () => {
    if (!user) return

    setIsAssigning(true)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          assigned_to_user_id: user.id,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (error) throw error
      onTicketUpdated()
    } catch (error) {
      console.error('Error assigning ticket:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleTicketClick = () => {
    setSelectedTicket(ticket)
  }

  const handleTicketUpdated = () => {
    setSelectedTicket(null)
    onTicketUpdated()
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              {getStatusIcon(ticket.status)}
              <h3 className="text-lg font-semibold text-white truncate">
                {ticket.subject}
              </h3>
              {!ticket.assigned_to_user_id && (
                <div className="bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                  <span className="text-red-400 text-xs font-medium">UNASSIGNED</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{ticket.user?.full_name || ticket.user?.email || 'Unknown User'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(ticket.created_at, profile?.timezone)}</span>
              </div>
              {ticket.department && (
                <div className="flex items-center space-x-1">
                  <Building2 className="h-3 w-3" />
                  <span>{ticket.department.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority.toUpperCase()}
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        {/* Assigned User */}
        {ticket.assigned_user && (
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {getUserInitials(ticket.assigned_user.full_name)}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">
                  Assigned to {ticket.assigned_user.full_name}
                </p>
                <p className="text-slate-400 text-xs">{ticket.assigned_user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description Preview */}
        <div className="mb-4">
          <p className={`text-slate-300 leading-relaxed ${
            isExpanded ? '' : 'line-clamp-2'
          }`}>
            {ticket.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            {!ticket.assigned_to_user_id && (
              <button
                onClick={handleAssignToSelf}
                disabled={isAssigning}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <UserCheck className="h-3 w-3" />
                <span>{isAssigning ? 'Assigning...' : 'Assign to Me'}</span>
              </button>
            )}
            <button
              onClick={handleTicketClick}
              className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Edit3 className="h-3 w-3" />
              <span>Manage</span>
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Created:</span>
                <span className="text-white ml-2">
                  {new Date(ticket.created_at).toLocaleString('en-US', { timeZone: profile?.timezone || undefined })}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Last Updated:</span>
                <span className="text-white ml-2">
                  {new Date(ticket.updated_at).toLocaleString('en-US', { timeZone: profile?.timezone || undefined })}
                </span>
              </div>
              <div>
                <span className="text-slate-400">User Email:</span>
                <span className="text-white ml-2">
                  {ticket.user?.email || 'Unknown'}
                </span>
              </div>
              {ticket.department && (
                <div>
                  <span className="text-slate-400">Department:</span>
                  <span className="text-white ml-2">
                    {ticket.department.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
          isAdmin={true}
        />
      )}
    </>
  )
}