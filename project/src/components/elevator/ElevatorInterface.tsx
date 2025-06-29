import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Filter, Search, UserPlus } from 'lucide-react'
import { TaskFloor } from './TaskFloor'
import { TaskForm } from './TaskForm'
import { InviteMemberForm } from '../project/InviteMemberForm'
import { Task, ProjectMember, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ElevatorInterfaceProps {
  projectId: string
  onBackToProjects: () => void
}

export function ElevatorInterface({ projectId, onBackToProjects }: ElevatorInterfaceProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showInviteMemberForm, setShowInviteMemberForm] = useState(false)
  const [userRoleInProject, setUserRoleInProject] = useState<ProjectMember['role'] | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUserRole()
      fetchTasks()
    }
  }, [projectId, user])

  const fetchUserRole = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        // If no role found, assume viewer for now
        setUserRoleInProject('viewer')
      } else {
        setUserRoleInProject(data.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRoleInProject('viewer')
    }
  }

  const fetchTasks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('floor_position', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = () => {
    fetchTasks()
  }

  const handleMemberInvited = () => {
    // Optionally refresh any member-related data
    console.log('Member invited successfully')
  }

  const handleApproveTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error approving task:', error)
    }
  }

  const handleRequestRevisions = async (taskId: string, comments: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'revisions-requested',
          review_comments: comments,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)

      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error requesting revisions:', error)
    }
  }

  // Mock data for demonstration with new statuses
  const mockTasks: Task[] = [
    {
      id: '1',
      project_id: projectId,
      title: 'Design System Setup',
      description: 'Create a comprehensive design system with components, colors, and typography',
      status: 'approved',
      assignee_id: user?.id,
      due_date: '2024-01-20T23:59:59Z',
      floor_position: 1,
      deliverable_link: 'https://figma.com/design-system-mockup',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      project_id: projectId,
      title: 'User Authentication',
      description: 'Implement secure user authentication with email/password and social login',
      status: 'ready-for-review',
      assignee_id: user?.id,
      due_date: '2024-01-25T23:59:59Z',
      floor_position: 2,
      deliverable_link: 'https://github.com/project/pull/123',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-16T14:20:00Z'
    },
    {
      id: '3',
      project_id: projectId,
      title: 'Product Catalog',
      description: 'Build dynamic product catalog with search, filters, and pagination',
      status: 'revisions-requested',
      assignee_id: user?.id,
      due_date: '2024-02-01T23:59:59Z',
      floor_position: 3,
      deliverable_link: 'https://staging.example.com/catalog',
      review_comments: 'The search functionality needs improvement. Please add autocomplete and fix the filter reset button.',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-16T16:45:00Z'
    },
    {
      id: '4',
      project_id: projectId,
      title: 'Shopping Cart',
      description: 'Implement shopping cart functionality with add/remove items and quantity updates',
      status: 'in-progress',
      assignee_id: user?.id,
      due_date: '2024-02-05T23:59:59Z',
      floor_position: 4,
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z'
    },
    {
      id: '5',
      project_id: projectId,
      title: 'Payment Integration',
      description: 'Integrate Stripe payment processing for secure transactions',
      status: 'pending',
      assignee_id: user?.id,
      due_date: '2024-02-10T23:59:59Z',
      floor_position: 5,
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z'
    },
    {
      id: '6',
      project_id: projectId,
      title: 'Order Management',
      description: 'Build order management system for tracking and fulfillment',
      status: 'pending',
      assignee_id: user?.id,
      due_date: '2024-02-15T23:59:59Z',
      floor_position: 6,
      created_at: '2024-01-06T00:00:00Z',
      updated_at: '2024-01-06T00:00:00Z'
    }
  ]

  const displayTasks = tasks.length > 0 ? tasks : mockTasks

  const filteredTasks = displayTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if user can create tasks (owner, developer)
  const canCreateTasks = userRoleInProject && ['owner', 'developer'].includes(userRoleInProject)

  // Check if user can review tasks (owner, client)
  const canReviewTasks = userRoleInProject && ['owner', 'client'].includes(userRoleInProject)

  // Check if user can invite members (owner only)
  const canInviteMembers = userRoleInProject === 'owner'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToProjects}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Projects</span>
            </button>
            <div className="h-6 w-px bg-slate-600"></div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">Task Elevator</h1>
              {userRoleInProject && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userRoleInProject === 'owner' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : userRoleInProject === 'developer'
                    ? 'bg-blue-500/20 text-blue-400'
                    : userRoleInProject === 'client'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-500/20 text-slate-400'
                }`}>
                  {userRoleInProject}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {canInviteMembers && (
              <button 
                onClick={() => setShowInviteMemberForm(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 border border-slate-600"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Member</span>
              </button>
            )}
            {canCreateTasks && (
              <button 
                onClick={() => setShowTaskForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Elevator Shaft */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
              <p className="text-slate-400 mb-4">
                {canCreateTasks 
                  ? 'Create your first task to get started'
                  : 'No tasks have been created for this project yet'
                }
              </p>
              {canCreateTasks && (
                <button 
                  onClick={() => setShowTaskForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Create Task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => (
                <TaskFloor 
                  key={task.id} 
                  task={task} 
                  floorNumber={filteredTasks.length - index}
                  userRoleInProject={userRoleInProject}
                  onApprove={canReviewTasks ? handleApproveTask : undefined}
                  onRequestRevisions={canReviewTasks ? handleRequestRevisions : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && canCreateTasks && (
        <TaskForm
          projectId={projectId}
          onClose={() => setShowTaskForm(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {/* Invite Member Form Modal */}
      {showInviteMemberForm && canInviteMembers && (
        <InviteMemberForm
          projectId={projectId}
          onClose={() => setShowInviteMemberForm(false)}
          onMemberInvited={handleMemberInvited}
        />
      )}
    </div>
  )
}