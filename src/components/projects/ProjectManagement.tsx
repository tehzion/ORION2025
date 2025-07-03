import React, { useState } from 'react'
import { Plus, FolderOpen, Users, Calendar, Target, BarChart3, Settings, Eye, Edit, Trash2, UserPlus } from 'lucide-react'
import { SearchBar } from '../common/SearchBar'
import { DEMO_PROJECTS } from '../../lib/demo'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectDetails {
  id: string
  name: string
  description: string
  completion_percentage: number
  last_activity: string
  deadline: string
  created_at: string
  updated_at: string
  owner_id: string
  members: ProjectMember[]
  tasks: ProjectTask[]
  budget?: number
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[]
}

interface ProjectMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'developer' | 'client' | 'viewer'
  avatar: string
}

interface ProjectTask {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'ready-for-review' | 'approved' | 'revisions-requested'
  assignee: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
}

const DEMO_PROJECT_DETAILS: ProjectDetails[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js. Features include user authentication, product catalog, shopping cart, payment integration, and order management.',
    completion_percentage: 75,
    last_activity: '2024-01-15T10:30:00Z',
    deadline: '2024-02-28T23:59:59Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    owner_id: 'demo-user-123',
    status: 'active',
    priority: 'high',
    budget: 50000,
    tags: ['React', 'Node.js', 'E-commerce', 'Payment'],
    members: [
      { id: '1', name: 'Sarah Johnson', email: 'sarah@orion.com', role: 'owner', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
      { id: '2', name: 'Michael Chen', email: 'michael@orion.com', role: 'developer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
      { id: '3', name: 'Emily Rodriguez', email: 'emily@orion.com', role: 'developer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
      { id: '4', name: 'Lisa Thompson', email: 'lisa@orion.com', role: 'client', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' }
    ],
    tasks: [
      { id: '1', title: 'Design System Setup', status: 'approved', assignee: 'Emily Rodriguez', due_date: '2024-01-20T23:59:59Z', priority: 'high' },
      { id: '2', title: 'User Authentication', status: 'ready-for-review', assignee: 'Michael Chen', due_date: '2024-01-25T23:59:59Z', priority: 'high' },
      { id: '3', title: 'Product Catalog', status: 'revisions-requested', assignee: 'Emily Rodriguez', due_date: '2024-02-01T23:59:59Z', priority: 'medium' },
      { id: '4', title: 'Shopping Cart', status: 'in-progress', assignee: 'Michael Chen', due_date: '2024-02-05T23:59:59Z', priority: 'high' },
      { id: '5', title: 'Payment Integration', status: 'pending', assignee: 'Emily Rodriguez', due_date: '2024-02-10T23:59:59Z', priority: 'high' },
      { id: '6', title: 'Order Management', status: 'pending', assignee: 'Michael Chen', due_date: '2024-02-15T23:59:59Z', priority: 'medium' }
    ]
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    description: 'Complete UI/UX overhaul of the mobile application with modern design principles, improved user experience, and enhanced performance.',
    completion_percentage: 45,
    last_activity: '2024-01-14T16:45:00Z',
    deadline: '2024-03-15T23:59:59Z',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-14T16:45:00Z',
    owner_id: 'demo-user-123',
    status: 'active',
    priority: 'medium',
    budget: 35000,
    tags: ['Mobile', 'UI/UX', 'React Native', 'Design'],
    members: [
      { id: '1', name: 'Sarah Johnson', email: 'sarah@orion.com', role: 'owner', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
      { id: '3', name: 'Emily Rodriguez', email: 'emily@orion.com', role: 'developer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
      { id: '5', name: 'David Kim', email: 'david@orion.com', role: 'developer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }
    ],
    tasks: [
      { id: '1', title: 'Design Research', status: 'approved', assignee: 'Emily Rodriguez', due_date: '2024-01-30T23:59:59Z', priority: 'medium' },
      { id: '2', title: 'Wireframe Creation', status: 'in-progress', assignee: 'David Kim', due_date: '2024-02-15T23:59:59Z', priority: 'medium' },
      { id: '3', title: 'UI Component Library', status: 'pending', assignee: 'Emily Rodriguez', due_date: '2024-02-28T23:59:59Z', priority: 'high' },
      { id: '4', title: 'User Testing', status: 'pending', assignee: 'David Kim', due_date: '2024-03-10T23:59:59Z', priority: 'medium' }
    ]
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Integrate third-party APIs for enhanced functionality including payment processing, email services, and analytics.',
    completion_percentage: 90,
    last_activity: '2024-01-16T09:15:00Z',
    deadline: '2024-01-30T23:59:59Z',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-16T09:15:00Z',
    owner_id: 'demo-user-123',
    status: 'active',
    priority: 'high',
    budget: 25000,
    tags: ['API', 'Integration', 'Backend', 'Third-party'],
    members: [
      { id: '1', name: 'Sarah Johnson', email: 'sarah@orion.com', role: 'owner', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
      { id: '2', name: 'Michael Chen', email: 'michael@orion.com', role: 'developer', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
    ],
    tasks: [
      { id: '1', title: 'Stripe Payment API', status: 'approved', assignee: 'Michael Chen', due_date: '2024-01-25T23:59:59Z', priority: 'high' },
      { id: '2', title: 'SendGrid Email API', status: 'approved', assignee: 'Michael Chen', due_date: '2024-01-28T23:59:59Z', priority: 'medium' },
      { id: '3', title: 'Google Analytics API', status: 'ready-for-review', assignee: 'Michael Chen', due_date: '2024-01-30T23:59:59Z', priority: 'low' }
    ]
  }
]

export function ProjectManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { globalRole } = useAuth()

  const canManageProjects = globalRole === 'super_admin' || globalRole === 'admin'

  // Search filters configuration
  const searchFilters = [
    {
      id: 'status',
      label: 'Status',
      value: '',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'on-hold', label: 'On Hold' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      id: 'priority',
      label: 'Priority',
      value: '',
      options: [
        { value: 'urgent', label: 'Urgent' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    },
    {
      id: 'progress',
      label: 'Progress',
      value: '',
      options: [
        { value: 'low', label: 'Low (< 30%)' },
        { value: 'medium', label: 'Medium (30-70%)' },
        { value: 'high', label: 'High (> 70%)' }
      ]
    }
  ]

  // Enhanced filtering
  const filteredProjects = DEMO_PROJECTS.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !activeFilters.status || project.status === activeFilters.status
    const matchesProgress = !activeFilters.progress ||
      (activeFilters.progress === 'low' && project.completion_percentage < 30) ||
      (activeFilters.progress === 'medium' && project.completion_percentage >= 30 && project.completion_percentage < 70) ||
      (activeFilters.progress === 'high' && project.completion_percentage >= 70)
    
    return matchesSearch && matchesStatus && matchesProgress
  })

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Project Management</h1>
          <p className="text-slate-400">Manage and track all your projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <FolderOpen className="h-4 w-4" />
            </button>
          </div>
          {canManageProjects && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-white">{DEMO_PROJECTS.length}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FolderOpen className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-white">
                {DEMO_PROJECTS.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Target className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg Completion</p>
              <p className="text-2xl font-bold text-white">
                {Math.round(DEMO_PROJECTS.reduce((sum, p) => sum + p.completion_percentage, 0) / DEMO_PROJECTS.length)}%
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search projects by name or description..."
          value={searchTerm}
          onChange={setSearchTerm}
          filters={searchFilters}
          onFilterChange={setActiveFilters}
          showKeyboardShortcuts={true}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{project.name}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{project.description}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Progress</span>
                <span className="text-white text-sm">{project.completion_percentage}%</span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressColor(project.completion_percentage)}`}
                  style={{ width: `${project.completion_percentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Deadline</span>
                <span className="text-white text-sm">
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Last Activity</span>
                <span className="text-white text-sm">
                  {new Date(project.last_activity).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            {canManageProjects && (
              <div className="flex space-x-2 pt-4 border-t border-slate-700">
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Edit
                </button>
                <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateForm && canManageProjects && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New Project</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                <input 
                  type="text" 
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea 
                  placeholder="Enter project description"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Deadline</label>
                <input 
                  type="date"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 