import React, { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, MessageSquare, Calendar, Building2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { SupportTicket } from '../../lib/supabase'
import { TicketDetailModal } from './TicketDetailModal'
import { useAuth } from '../../contexts/AuthContext'

interface UserTicketsListProps {
  tickets: SupportTicket[]
  onTicketUpdated: () => void
}

export function UserTicketsList({ tickets, onTicketUpdated }: UserTicketsListProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set())
  const { profile } = useAuth()

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

  const toggleExpanded = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets)
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId)
    } else {
      newExpanded.add(ticketId)
    }
    setExpandedTickets(newExpanded)
  }

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
  }

  const handleTicketUpdated = () => {
    setSelectedTicket(null)
    onTicketUpdated()
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No support tickets</h3>
        <p className="text-slate-400 mb-4">You haven't created any support tickets yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => {
          const isExpanded = expandedTickets.has(ticket.id)
          
          return (
            <div
              key={ticket.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(ticket.status)}
                    <h3 className="text-lg font-semibold text-white truncate">
                      {ticket.subject}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
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
                  onClick={() => toggleExpanded(ticket.id)}
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
                  <button
                    onClick={() => handleTicketClick(ticket)}
                    className="flex items-center space-x-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>View Details</span>
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
                    {ticket.assigned_user && (
                      <div>
                        <span className="text-slate-400">Assigned To:</span>
                        <span className="text-white ml-2">
                          {ticket.assigned_user.full_name}
                        </span>
                      </div>
                    )}
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
          )
        })}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onTicketUpdated={handleTicketUpdated}
        />
      )}
    </>
  )
}