import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Grid, List, CheckCircle, Sparkles, ArrowRight, Users, Calendar, Target } from 'lucide-react'
import { ProjectCard } from './ProjectCard'
import { ProjectForm } from './ProjectForm'
import { Project, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectDashboardProps {
  onProjectSelect: (projectId: string) => void
}

export function ProjectDashboard({ onProjectSelect }: ProjectDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { user, profile } = useAuth()

  useEffect(() => {
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (newProject: Project) => {
    setProjects(prevProjects => [newProject, ...prevProjects])
    setShowSuccessMessage(true)
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      completion_percentage: 75,
      last_activity: '2024-01-15T10:30:00Z',
      deadline: '2024-02-28T23:59:59Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      owner_id: user?.id || ''
    },
    {
      id: '2',
      name: 'Mobile App Redesign',
      description: 'Complete UI/UX overhaul of the mobile application',
      completion_percentage: 45,
      last_activity: '2024-01-14T16:45:00Z',
      deadline: '2024-03-15T23:59:59Z',
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-14T16:45:00Z',
      owner_id: user?.id || ''
    },
    {
      id: '3',
      name: 'API Integration',
      description: 'Integrate third-party APIs for enhanced functionality',
      completion_percentage: 90,
      last_activity: '2024-01-16T09:15:00Z',
      deadline: '2024-01-30T23:59:59Z',
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-16T09:15:00Z',
      owner_id: user?.id || ''
    }
  ]

  const displayProjects = filteredProjects.length > 0 ? filteredProjects : mockProjects
  const isFirstTime = projects.length === 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div>
            <p className="text-green-200 font-medium">Project created successfully!</p>
            <p className="text-green-300 text-sm">You can now start adding tasks and managing your project.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-white">
              {isFirstTime ? 'Welcome to Orion' : 'Project Dashboard'}
            </h1>
            {isFirstTime && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full p-1">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          <p className="text-slate-400">
            {isFirstTime 
              ? `Welcome ${profile?.full_name || user?.email?.split('@')[0] || 'there'}! Let's create your first project to get started.`
              : 'Manage and track your projects'
            }
          </p>
        </div>
        <button 
          onClick={() => setShowProjectForm(true)}
          className={`${
            isFirstTime 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-purple-500/25 animate-pulse' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 shadow-lg hover:shadow-purple-500/25'
          } rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2`}
        >
          <Plus className={`${isFirstTime ? 'h-6 w-6' : 'h-5 w-5'}`} />
          <span>{isFirstTime ? 'Create Your First Project' : 'New Project'}</span>
          {isFirstTime && <ArrowRight className="h-5 w-5" />}
        </button>
      </div>

      {/* First Time User Onboarding */}
      {isFirstTime && (
        <div className="mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">Let's Get You Started</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Orion helps you manage projects with an innovative task elevator system. 
              Create your first project and start organizing your work efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Create Projects</h3>
              <p className="text-slate-400 text-sm">Organize your work into manageable projects with clear goals and deadlines.</p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Invite Team Members</h3>
              <p className="text-slate-400 text-sm">Collaborate with developers, clients, and stakeholders on your projects.</p>
            </div>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
              <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Track Progress</h3>
              <p className="text-slate-400 text-sm">Use the task elevator to visualize progress and manage deliverables.</p>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setShowProjectForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-3 mx-auto shadow-xl hover:shadow-purple-500/25"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Your First Project</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Controls - Only show if user has projects */}
      {!isFirstTime && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </button>
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {displayProjects.length === 0 && !isFirstTime ? (
        <div className="text-center py-12">
          <div className="bg-slate-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-slate-400 mb-4">Get started by creating your first project</p>
          <button 
            onClick={() => setShowProjectForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            Create Project
          </button>
        </div>
      ) : !isFirstTime ? (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {displayProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectSelect(project.id)}
            />
          ))}
        </div>
      ) : null}

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}