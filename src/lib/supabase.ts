import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Create a mock Supabase client for demo mode when env vars are missing
let supabase: any

if (demoMode || !supabaseUrl || !supabaseAnonKey) {
  console.log('Running in demo mode - using mock Supabase client')
  
  // Mock Supabase client for demo mode
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async (credentials: { email: string; password: string }) => {
        // Demo login logic
        const demoUsers = [
          { email: 'admin@orion.com', password: 'admin123', role: 'super_admin' },
          { email: 'dev@orion.com', password: 'dev123', role: 'user' },
          { email: 'client@orion.com', password: 'client123', role: 'user' }
        ]
        
        const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password)
        
        if (user) {
          return {
            data: {
              user: {
                id: `demo-${user.email}`,
                email: user.email,
                user_metadata: { full_name: user.email.split('@')[0] },
                app_metadata: { role: user.role }
              },
              session: {
                access_token: 'demo-token',
                refresh_token: 'demo-refresh',
                user: {
                  id: `demo-${user.email}`,
                  email: user.email
                }
              }
            },
            error: null
          }
        } else {
          return {
            data: { user: null, session: null },
            error: { message: 'Invalid credentials' }
          }
        }
      },
      signUp: async (credentials: { email: string; password: string; options?: any }) => {
        // Demo signup logic
        return {
          data: {
            user: {
              id: `demo-${credentials.email}`,
              email: credentials.email,
              user_metadata: credentials.options?.data || {}
            },
            session: null
          },
          error: null
        }
      },
      signOut: () => Promise.resolve({ error: null }),
      updateUser: (updates: any) => Promise.resolve({ data: { user: null }, error: null })
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null })
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
        }),
        insert: (data: any) => Promise.resolve({ data: null, error: null }),
        delete: () => ({
          eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
        })
      })
    })
  }
} else {
  // Real Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('Connected to Supabase')
}

export { supabase }

// Database types
export interface Project {
  id: string
  name: string
  description: string
  completion_percentage: number
  last_activity: string
  deadline: string
  created_at: string
  updated_at: string
  owner_id: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'ready-for-review' | 'approved' | 'revisions-requested' | 'complete'
  assignee_id?: string
  due_date?: string
  floor_position: number
  deliverable_link?: string
  review_comments?: string
  completion_percentage?: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'developer' | 'client' | 'viewer'
  invited_by?: string
  invited_at: string
  joined_at?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: {
    email: string
    full_name?: string
  }
}

export interface User {
  id: string
  email: string
  role: 'owner' | 'developer' | 'client' | 'viewer'
  full_name?: string
  avatar_url?: string
}

// New types for global roles and support system
export interface Profile {
  id: string
  full_name: string | null
  global_role: 'user' | 'super_admin'
  is_verified?: boolean
  timezone?: string | null
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'closed' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to_department_id: string | null
  assigned_to_user_id: string | null
  created_at: string
  updated_at: string
  department?: Department
  assigned_user?: Profile
  user?: Profile
}

export interface TicketMessage {
  id: string
  ticket_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

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