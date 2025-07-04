import React, { useState, useEffect } from 'react'
import { Plus, Grid, List, CheckCircle, Sparkles, ArrowRight, Users, Calendar, Target, Search, X, Edit, Clock, User, Tag, DollarSign, FileText, Download } from 'lucide-react'
import ProjectCard from './ProjectCard'
import ProjectForm from './ProjectForm'
import { SearchBar } from '../common/SearchBar'
import { useAuth } from '../../contexts/AuthContext'
import { DEMO_MODE, DEMO_PROJECTS } from '../../lib/demo'
import { projectService, CreateProjectData, Project } from '../../lib/projectService'
import ProjectStatusFlow from '../project/ProjectStatusFlow'

interface ProjectDashboardProps {
  onProjectSelect: (projectId: string) => void
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const { user, profile, globalRole } = useAuth()

  // Role-based permissions
  const canUpdateProjectStatus = globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'developer'
  const canEditProject = globalRole === 'super_admin' || globalRole === 'admin'
  const canDeleteProject = globalRole === 'super_admin'

  useEffect(() => {
    loadProjects()
  }, [user, DEMO_MODE])

  const loadProjects = async () => {
    console.log('Loading projects...', { user, DEMO_MODE })
    
    if (DEMO_MODE) {
      // Use demo data in demo mode regardless of user state
      console.log('Using demo projects:', DEMO_PROJECTS)
      setProjects(DEMO_PROJECTS)
      setLoading(false)
      return
    }

    if (!user) {
      console.log('No user, returning early')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await projectService.getProjects()
      setProjects(data)
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = async (projectData: CreateProjectData) => {
    try {
      const newProject = await projectService.createProject(projectData)
      setProjects([newProject, ...projects])
      setShowForm(false)
    } catch (err) {
      setError('Failed to create project')
      console.error('Error creating project:', err)
    }
  }

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates)
      setProjects(projects.map(project => 
        project.id === id ? updatedProject : project
      ))
      // Update selected project if it's the one being updated
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(updatedProject)
      }
    } catch (err) {
      setError('Failed to update project')
      console.error('Error updating project:', err)
    }
  }

  const handleDeleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id)
      setProjects(projects.filter(project => project.id !== id))
      if (selectedProject && selectedProject.id === id) {
        setSelectedProject(null)
      }
    } catch (err) {
      setError('Failed to delete project')
      console.error('Error deleting project:', err)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedProject || !newStatus) return
    
    try {
      await handleUpdateProject(selectedProject.id, { status: newStatus })
      setShowStatusUpdate(false)
      setNewStatus('')
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const exportProjectData = (project: Project) => {
    const data = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      progress: project.progress,
      priority: project.priority,
      due_date: project.due_date,
      created_at: project.created_at,
      updated_at: project.updated_at
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '_')}_data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'due_date':
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      case 'progress':
        return b.progress - a.progress
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      default:
        return 0
    }
  })

  const getStatusStats = () => {
    const stats = {
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on-hold').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length
    }
    return stats
  }

  const stats = getStatusStats()

  function getProjectStages(project: Project) {
    // Ensure status is typed as 'completed' | 'pending' | 'current'
    const statusMap = (status: string): 'completed' | 'pending' | 'current' => {
      if (status === 'completed') return 'completed';
      if (status === 'active') return 'current';
      return 'pending';
    };
    return [
      {
        id: 'requirement',
        title: 'Requirement Submitted',
        description: 'Client sends project brief and requirements',
        status: statusMap(project.status),
        timestamp: project.created_at,
        assignee: 'Client',
        details: 'Project brief received.'
      },
      {
        id: 'started',
        title: 'Project In Progress',
        description: 'Work begins, tasks assigned to team',
        status: statusMap(project.status),
        timestamp: project.updated_at,
        assignee: 'Team',
        details: 'Development started.'
      },
      {
        id: 'done',
        title: 'Done',
        description: 'Final work completed',
        status: statusMap(project.status),
        assignee: 'QA Team',
        details: 'All features implemented and tested.'
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20'
      case 'completed': return 'text-blue-400 bg-blue-500/20'
      case 'on-hold': return 'text-yellow-400 bg-yellow-500/20'
      case 'cancelled': return 'text-red-400 bg-red-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-green-400 bg-green-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Project Dashboard</h1>
          <p className="text-slate-400">Manage and track all your projects</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Active Projects</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">On Hold</p>
                <p className="text-2xl font-bold text-white">{stats.onHold}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Target className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Cancelled</p>
                <p className="text-2xl font-bold text-white">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="due_date">Sort by Due Date</option>
                <option value="progress">Sort by Progress</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>

            {/* Add Project Button */}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={handleUpdateProject}
              onDelete={handleDeleteProject}
              onSelect={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* Enhanced Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedProject.priority)}`}>
                        {selectedProject.priority} Priority
                      </span>
                    </div>
                    <p className="text-slate-400">{selectedProject.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {canUpdateProjectStatus && (
                      <button
                        onClick={() => {
                          setNewStatus(selectedProject.status)
                          setShowStatusUpdate(true)
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => exportProjectData(selectedProject)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Export Project Data"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Project Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Progress</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">{selectedProject.progress}%</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${selectedProject.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Due Date</span>
                    </div>
                    <span className="text-white font-medium">
                      {selectedProject.due_date ? formatDate(selectedProject.due_date) : 'No deadline'}
                    </span>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Created</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatDate(selectedProject.created_at)}
                    </span>
                  </div>

                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400">Last Updated</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatDate(selectedProject.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Project Status Flow */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Status Timeline</h3>
                  <ProjectStatusFlow
                    projectId={selectedProject.id}
                    projectName={selectedProject.name}
                    currentStage={selectedProject.status}
                    stages={getProjectStages(selectedProject)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        // Navigate to elevator interface
                        window.location.href = `/elevator?projectId=${selectedProject.id}`
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>View Tasks</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {canEditProject && (
                      <button className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        Edit Project
                      </button>
                    )}
                    {canDeleteProject && (
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this project?')) {
                            handleDeleteProject(selectedProject.id)
                          }
                        }}
                        className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        Delete Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        {showStatusUpdate && selectedProject && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Update Project Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowStatusUpdate(false)
                      setNewStatus('')
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sortedProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No projects found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* Add Project Modal */}
      {showForm && (
        <ProjectForm
          onSubmit={handleAddProject}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default ProjectDashboard