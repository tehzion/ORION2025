import React, { useState } from 'react'
import { Calendar, Clock, Users, MoreVertical, Edit, Trash2, Eye, AlertTriangle, Target } from 'lucide-react'
import { Project } from '../../lib/projectService'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ProjectCardProps {
  project: Project
  onUpdate: (id: string, updates: Partial<Project>) => void
  onDelete: (id: string) => void
  onSelect?: (projectId: string) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete, onSelect }) => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'completed': return 'text-blue-400'
      case 'on-hold': return 'text-yellow-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-slate-400'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20'
      case 'completed': return 'bg-blue-500/20'
      case 'on-hold': return 'bg-yellow-500/20'
      case 'cancelled': return 'bg-red-500/20'
      default: return 'bg-slate-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-green-400'
      default: return 'text-slate-400'
    }
  }

  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20'
      case 'medium': return 'bg-yellow-500/20'
      case 'low': return 'bg-green-500/20'
      default: return 'bg-slate-500/20'
    }
  }

  const formatDate = (dateString: string, userTimeZone?: string | null) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: userTimeZone || undefined
    })
  }

  const isOverdue = project.due_date ? new Date(project.due_date) < new Date() : false

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(project.id)
    } else {
      // Navigate to elevator interface with project ID
      navigate(`/elevator?projectId=${project.id}`)
    }
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    navigate(`/elevator?projectId=${project.id}`)
  }

  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    // You can implement edit modal here or navigate to edit page
    console.log('Edit project:', project.id)
  }

  return (
    <div 
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-purple-500 transition-all duration-200 cursor-pointer group relative"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBgColor(project.priority)} ${getPriorityColor(project.priority)}`}>
            {project.priority}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColor(project.status)} ${getStatusColor(project.status)}`}>
            {project.status}
          </div>
        </div>
      </div>

      <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className={`text-xs font-medium ${project.progress >= 80 ? 'text-green-400' : project.progress >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {project.progress}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Project Info */}
      <div className="mb-4 space-y-2">
        {project.budget && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Target className="h-3 w-3 flex-shrink-0" />
            <span>Budget: ${project.budget.toLocaleString()}</span>
          </div>
        )}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>{formatDate(project.updated_at, profile?.timezone)}</span>
        </div>
        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400' : ''}`}>
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>{project.due_date ? formatDate(project.due_date, profile?.timezone) : 'No deadline'}</span>
          {isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
        </div>
      </div>

      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-slate-400" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-8 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-10">
            <div className="py-1">
              <button
                onClick={handleViewDetails}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={handleEditProject}
                className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  onDelete(project.id)
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCard