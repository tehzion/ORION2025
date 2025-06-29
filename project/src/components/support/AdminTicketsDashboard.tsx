import React, { useState } from 'react'
import { Users, Clock, AlertTriangle, CheckCircle, MessageSquare, Search, Filter, Shield, Building2, User, TrendingUp, BarChart3, PieChart, Target, Zap, Timer } from 'lucide-react'
import { SupportTicket, TicketAnalytics } from '../../lib/supabase'
import { AdminTicketCard } from './AdminTicketCard'
import { useAuth } from '../../contexts/AuthContext'

interface AdminTicketsDashboardProps {
  tickets: SupportTicket[]
  analytics: TicketAnalytics | null
  stats: {
    total: number
    open: number
    in_progress: number
    resolved: number
    closed: number
  }
  priorityStats: {
    urgent: number
    high: number
    medium: number
    low: number
  }
  onTicketUpdated: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  priorityFilter: string
  onPriorityFilterChange: (priority: string) => void
}

export function AdminTicketsDashboard({
  tickets,
  analytics,
  stats,
  priorityStats,
  onTicketUpdated,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange
}: AdminTicketsDashboardProps) {
  const [viewMode, setViewMode] = useState<'all' | 'unassigned' | 'assigned'>('all')
  const [trendsView, setTrendsView] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const { profile } = useAuth()

  const filteredTickets = tickets.filter(ticket => {
    if (viewMode === 'unassigned' && ticket.assigned_to_user_id) return false
    if (viewMode === 'assigned' && !ticket.assigned_to_user_id) return false
    return true
  })

  const formatDate = (dateString: string, userTimeZone?: string | null) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: userTimeZone || undefined
    })
  }

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Support Dashboard</h1>
          </div>
          <p className="text-slate-400">Comprehensive analytics and ticket management</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
            <span className="text-purple-400 text-sm font-medium">Super Admin</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        {/* Status Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Total</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
            <MessageSquare className="h-5 w-5 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Open</p>
              <p className="text-xl font-bold text-white">{stats.open}</p>
            </div>
            <Clock className="h-5 w-5 text-yellow-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">In Progress</p>
              <p className="text-xl font-bold text-white">{stats.in_progress}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Resolved</p>
              <p className="text-xl font-bold text-white">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
        </div>

        {/* Priority Stats */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Urgent</p>
              <p className="text-xl font-bold text-red-400">{priorityStats.urgent}</p>
            </div>
            <Zap className="h-5 w-5 text-red-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">High</p>
              <p className="text-xl font-bold text-orange-400">{priorityStats.high}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-orange-400" />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Unassigned</p>
              <p className="text-xl font-bold text-white">
                {tickets.filter(t => !t.assigned_to_user_id).length}
              </p>
            </div>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-500/20 rounded-lg p-2">
                <Timer className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Response Time</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Avg First Response</span>
                <span className="text-white font-medium">
                  {formatHours(analytics.responseTimeMetrics.avgFirstResponseHours)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Avg Resolution</span>
                <span className="text-white font-medium">
                  {formatHours(analytics.responseTimeMetrics.avgResolutionHours)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-500/20 rounded-lg p-2">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">SLA Compliance</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.responseTimeMetrics.slaCompliance}%` }}
                ></div>
              </div>
              <span className="text-green-400 font-bold text-lg">
                {analytics.responseTimeMetrics.slaCompliance}%
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              Tickets resolved within SLA targets
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-500/20 rounded-lg p-2">
                <PieChart className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Priority Distribution</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-red-400 text-sm">Urgent</span>
                <span className="text-white font-medium">{analytics.priorityDistribution.urgent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400 text-sm">High</span>
                <span className="text-white font-medium">{analytics.priorityDistribution.high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 text-sm">Medium</span>
                <span className="text-white font-medium">{analytics.priorityDistribution.medium}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-sm">Low</span>
                <span className="text-white font-medium">{analytics.priorityDistribution.low}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Trends */}
      {analytics && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Ticket Trends</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setTrendsView('daily')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  trendsView === 'daily' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTrendsView('weekly')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  trendsView === 'weekly' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTrendsView('monthly')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  trendsView === 'monthly' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Trends Data Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">Tickets Created vs Resolved</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analytics.trends[trendsView].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300 text-sm">
                      {trendsView === 'daily' ? formatDate(item.date, profile?.timezone) : 
                       trendsView === 'weekly' ? item.week : 
                       item.month}
                    </span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-400 text-sm font-medium">{item.created}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 text-sm font-medium">{item.resolved}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Trend Summary</h4>
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Total Created</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analytics.trends[trendsView].reduce((sum, item) => sum + item.created, 0)}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Last {analytics.trends[trendsView].length} {trendsView.slice(0, -2)} periods
                  </p>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">Total Resolved</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {analytics.trends[trendsView].reduce((sum, item) => sum + item.resolved, 0)}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Resolution rate: {Math.round(
                      (analytics.trends[trendsView].reduce((sum, item) => sum + item.resolved, 0) /
                       Math.max(analytics.trends[trendsView].reduce((sum, item) => sum + item.created, 0), 1)) * 100
                    )}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Performance */}
      {analytics && analytics.departments.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg p-2">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Department Performance</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 font-medium py-3 px-4">Department</th>
                  <th className="text-center text-slate-400 font-medium py-3 px-4">Total</th>
                  <th className="text-center text-slate-400 font-medium py-3 px-4">Open</th>
                  <th className="text-center text-slate-400 font-medium py-3 px-4">Resolved</th>
                  <th className="text-center text-slate-400 font-medium py-3 px-4">Avg Resolution</th>
                  <th className="text-center text-slate-400 font-medium py-3 px-4">Urgent</th>
                  <th className="text-center text-slate-400 font-medium py-3 px-4">High Priority</th>
                </tr>
              </thead>
              <tbody>
                {analytics.departments.map((dept) => (
                  <tr key={dept.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white font-medium">{dept.name}</span>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-white font-medium">{dept.totalTickets}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-yellow-400 font-medium">{dept.openTickets}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-medium">{dept.resolvedTickets}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-white font-medium">
                        {dept.avgResolutionTimeHours > 0 ? formatHours(dept.avgResolutionTimeHours) : 'N/A'}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-red-400 font-medium">{dept.urgentTickets}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-orange-400 font-medium">{dept.highPriorityTickets}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Tickets</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tickets found</h3>
          <p className="text-slate-400">No tickets match your current filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <AdminTicketCard
              key={ticket.id}
              ticket={ticket}
              onTicketUpdated={onTicketUpdated}
            />
          ))}
        </div>
      )}
    </div>
  )
}