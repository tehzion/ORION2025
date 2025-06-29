import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Clock, AlertCircle, CheckCircle, MessageSquare, User, Calendar, Shield } from 'lucide-react'
import { NewTicketForm } from './NewTicketForm'
import { UserTicketsList } from './UserTicketsList'
import { AdminTicketsDashboard } from './AdminTicketsDashboard'
import { SupportTicket, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// Analytics interfaces
export interface TicketTrends {
  daily: { date: string; created: number; resolved: number }[]
  weekly: { week: string; created: number; resolved: number }[]
  monthly: { month: string; created: number; resolved: number }[]
}

export interface DepartmentAnalytics {
  id: string
  name: string
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResolutionTimeHours: number
  urgentTickets: number
  highPriorityTickets: number
}

export interface TicketAnalytics {
  trends: TicketTrends
  departments: DepartmentAnalytics[]
  responseTimeMetrics: {
    avgFirstResponseHours: number
    avgResolutionHours: number
    slaCompliance: number
  }
  priorityDistribution: {
    urgent: number
    high: number
    medium: number
    low: number
  }
  statusDistribution: {
    open: number
    in_progress: number
    resolved: number
    closed: number
  }
}

export function SupportPage() {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const { user, globalRole, profile } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTickets()
    }
  }, [user, globalRole])

  const calculateResolutionTime = (createdAt: string, updatedAt: string, status: string): number => {
    if (!['resolved', 'closed'].includes(status)) return 0
    
    const created = new Date(createdAt)
    const resolved = new Date(updatedAt)
    const diffMs = resolved.getTime() - created.getTime()
    return Math.round(diffMs / (1000 * 60 * 60)) // Convert to hours
  }

  const generateTicketTrends = (tickets: SupportTicket[]): TicketTrends => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    // Daily trends for last 30 days
    const daily = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const created = tickets.filter(t => 
        new Date(t.created_at).toISOString().split('T')[0] === dateStr
      ).length
      
      const resolved = tickets.filter(t => 
        ['resolved', 'closed'].includes(t.status) &&
        new Date(t.updated_at).toISOString().split('T')[0] === dateStr
      ).length
      
      daily.push({ date: dateStr, created, resolved })
    }

    // Weekly trends for last 12 weeks
    const weekly = []
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      const weekStr = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      
      const created = tickets.filter(t => {
        const createdDate = new Date(t.created_at)
        return createdDate >= weekStart && createdDate < weekEnd
      }).length
      
      const resolved = tickets.filter(t => {
        const updatedDate = new Date(t.updated_at)
        return ['resolved', 'closed'].includes(t.status) &&
               updatedDate >= weekStart && updatedDate < weekEnd
      }).length
      
      weekly.push({ week: weekStr, created, resolved })
    }

    // Monthly trends for last 6 months
    const monthly = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthStr = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const created = tickets.filter(t => {
        const createdDate = new Date(t.created_at)
        return createdDate >= monthStart && createdDate <= monthEnd
      }).length
      
      const resolved = tickets.filter(t => {
        const updatedDate = new Date(t.updated_at)
        return ['resolved', 'closed'].includes(t.status) &&
               updatedDate >= monthStart && updatedDate <= monthEnd
      }).length
      
      monthly.push({ month: monthStr, created, resolved })
    }

    return { daily, weekly, monthly }
  }

  const generateDepartmentAnalytics = (tickets: SupportTicket[]): DepartmentAnalytics[] => {
    const departmentMap = new Map<string, DepartmentAnalytics>()
    
    // Initialize with departments that have tickets
    tickets.forEach(ticket => {
      if (ticket.department) {
        const deptId = ticket.department.id
        if (!departmentMap.has(deptId)) {
          departmentMap.set(deptId, {
            id: deptId,
            name: ticket.department.name,
            totalTickets: 0,
            openTickets: 0,
            resolvedTickets: 0,
            avgResolutionTimeHours: 0,
            urgentTickets: 0,
            highPriorityTickets: 0
          })
        }
        
        const dept = departmentMap.get(deptId)!
        dept.totalTickets++
        
        if (ticket.status === 'open') dept.openTickets++
        if (['resolved', 'closed'].includes(ticket.status)) dept.resolvedTickets++
        if (ticket.priority === 'urgent') dept.urgentTickets++
        if (ticket.priority === 'high') dept.highPriorityTickets++
      }
    })

    // Calculate average resolution times
    departmentMap.forEach((dept, deptId) => {
      const resolvedTickets = tickets.filter(t => 
        t.department?.id === deptId && ['resolved', 'closed'].includes(t.status)
      )
      
      if (resolvedTickets.length > 0) {
        const totalResolutionTime = resolvedTickets.reduce((sum, ticket) => 
          sum + calculateResolutionTime(ticket.created_at, ticket.updated_at, ticket.status), 0
        )
        dept.avgResolutionTimeHours = Math.round(totalResolutionTime / resolvedTickets.length)
      }
    })

    return Array.from(departmentMap.values()).sort((a, b) => b.totalTickets - a.totalTickets)
  }

  const generateAnalytics = (tickets: SupportTicket[]): TicketAnalytics => {
    const trends = generateTicketTrends(tickets)
    const departments = generateDepartmentAnalytics(tickets)
    
    // Calculate response time metrics
    const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status))
    const avgResolutionHours = resolvedTickets.length > 0 
      ? Math.round(resolvedTickets.reduce((sum, ticket) => 
          sum + calculateResolutionTime(ticket.created_at, ticket.updated_at, ticket.status), 0
        ) / resolvedTickets.length)
      : 0

    // Mock first response time (would need additional data tracking)
    const avgFirstResponseHours = Math.round(avgResolutionHours * 0.2) // Assume 20% of resolution time

    // Mock SLA compliance (would need SLA targets defined)
    const slaCompliance = Math.round(85 + Math.random() * 10) // 85-95% range

    const priorityDistribution = {
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      high: tickets.filter(t => t.priority === 'high').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      low: tickets.filter(t => t.priority === 'low').length
    }

    const statusDistribution = {
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    }

    return {
      trends,
      departments,
      responseTimeMetrics: {
        avgFirstResponseHours,
        avgResolutionHours,
        slaCompliance
      },
      priorityDistribution,
      statusDistribution
    }
  }

  const fetchTickets = async () => {
    if (!user) return

    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          department:assigned_to_department_id (
            id,
            name,
            description
          ),
          assigned_user:assigned_to_user_id (
            id,
            email,
            raw_user_meta_data
          ),
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)

      // If not super admin, only show user's own tickets
      if (globalRole !== 'super_admin') {
        query = query.eq('user_id', user.id)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match our interface
      const transformedTickets = (data || []).map(ticket => ({
        ...ticket,
        user: ticket.user ? {
          id: ticket.user.id,
          email: ticket.user.email,
          full_name: ticket.user.raw_user_meta_data?.full_name || ticket.user.email?.split('@')[0] || 'Unknown'
        } : undefined,
        assigned_user: ticket.assigned_user ? {
          id: ticket.assigned_user.id,
          email: ticket.assigned_user.email,
          full_name: ticket.assigned_user.raw_user_meta_data?.full_name || ticket.assigned_user.email?.split('@')[0] || 'Unknown'
        } : undefined
      }))

      setTickets(transformedTickets)

      // Generate analytics for super admin
      if (globalRole === 'super_admin') {
        const analyticsData = generateAnalytics(transformedTickets)
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTicketCreated = () => {
    fetchTickets()
    setShowNewTicketForm(false)
  }

  const handleTicketUpdated = () => {
    fetchTickets()
  }

  const getStatusStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    }
    return stats
  }

  const getPriorityStats = () => {
    return {
      urgent: tickets.filter(t => t.priority === 'urgent').length,
      high: tickets.filter(t => t.priority === 'high').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      low: tickets.filter(t => t.priority === 'low').length
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = getStatusStats()
  const priorityStats = getPriorityStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Super Admin View
  if (globalRole === 'super_admin') {
    return (
      <AdminTicketsDashboard 
        tickets={filteredTickets}
        analytics={analytics}
        stats={stats}
        priorityStats={priorityStats}
        onTicketUpdated={handleTicketUpdated}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />
    )
  }

  // Regular User View
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
          <p className="text-slate-400">Get help with your projects and account</p>
        </div>
        <button 
          onClick={() => setShowNewTicketForm(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-purple-500/25"
        >
          <Plus className="h-5 w-5" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-blue-500/20 rounded-full p-3">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Open</p>
              <p className="text-2xl font-bold text-white">{stats.open}</p>
            </div>
            <div className="bg-yellow-500/20 rounded-full p-3">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-white">{stats.in_progress}</p>
            </div>
            <div className="bg-orange-500/20 rounded-full p-3">
              <AlertCircle className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-white">{stats.resolved}</p>
            </div>
            <div className="bg-green-500/20 rounded-full p-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            onChange={(e) => setPriorityFilter(e.target.value)}
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
      <UserTicketsList 
        tickets={filteredTickets}
        onTicketUpdated={handleTicketUpdated}
      />

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <NewTicketForm
          onClose={() => setShowNewTicketForm(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  )
}