import React, { useState } from 'react'
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar, 
  Target, 
  BarChart3, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  FileText,
  Paperclip,
  Kanban,
  GanttChart,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react'
import { SearchBar } from '../common/SearchBar'
import { DEMO_PROJECTS } from '../../lib/demo'
import { useAuth } from '../../contexts/AuthContext'
import { FileUpload } from '../common/FileUpload'

export function ProjectDashboardEnhanced() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'gantt'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { globalRole } = useAuth()

  const canManageProjects = globalRole === 'super_admin' || globalRole === 'admin'
  const canViewProjects = globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'developer' || globalRole === 'client'
  const canCreateProjects = globalRole === 'super_admin' || globalRole === 'admin'
  const canEditProjects = globalRole === 'super_admin' || globalRole === 'admin'
  const canDeleteProjects = globalRole === 'super_admin'

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

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Enhanced Project Management</h1>
          <p className="text-slate-400">Manage projects with file attachments, task assignment, and progress tracking</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Kanban View"
            >
              <Kanban className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`p-2 rounded ${viewMode === 'gantt' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Gantt View"
            >
              <GanttChart className="h-4 w-4" />
            </button>
          </div>
          {canCreateProjects && (
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

      {/* File Upload Demo */}
      <div className="mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">File Attachments Demo</h3>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            maxFiles={5}
            maxFileSize={10}
            acceptedTypes={['image/*', 'application/pdf', 'text/*', 'application/msword']}
          />
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Selected Files: {selectedFiles.length}</p>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700 border border-slate-600 rounded-lg">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
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
            
            {canEditProjects && (
              <div className="flex space-x-2 pt-4 border-t border-slate-700">
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Edit
                </button>
                {canDeleteProjects && (
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Features Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Paperclip className="h-6 w-6 text-blue-400" />
            <h3 className="font-semibold text-white">File Attachments</h3>
          </div>
          <p className="text-slate-400 text-sm">
            Upload and manage files directly to projects and tasks. Support for images, documents, and more.
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="h-6 w-6 text-green-400" />
            <h3 className="font-semibold text-white">Task Assignment</h3>
          </div>
          <p className="text-slate-400 text-sm">
            Assign tasks to team members with clear visibility on responsibilities and progress tracking.
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-3">
            <BarChart3 className="h-6 w-6 text-purple-400" />
            <h3 className="font-semibold text-white">Progress Tracking</h3>
          </div>
          <p className="text-slate-400 text-sm">
            Track completion percentages, status updates, and visualize progress with charts and timelines.
          </p>
        </div>
      </div>
    </div>
  )
} 