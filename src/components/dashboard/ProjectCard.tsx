import React, { useState } from 'react'
import { Calendar, Clock, Users, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { Project } from '../../lib/projectService'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectCardProps {
  project: Project
  onUpdate: (id: string, updates: Partial<Project>) => void
  onDelete: (id: string) => void
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, onDelete }) => {
  const { profile } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-400'
    if (percentage >= 50) return 'text-yellow-400'
    return 'text-red-400'
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

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-purple-500 transition-all duration-200 cursor-pointer group">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400 hidden sm:inline">{project.status}</span>
        </div>
      </div>

      <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className={`text-xs font-medium ${getStatusColor(project.progress)}`}>
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

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">{formatDate(project.updated_at, profile?.timezone)}</span>
          <span className="sm:hidden">{new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400' : ''}`}>
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">{project.due_date ? formatDate(project.due_date, profile?.timezone) : 'No deadline'}</span>
          <span className="sm:hidden">{project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}</span>
        </div>
      </div>

      {/* Menu Button */}
      <div className="relative ml-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border z-10">
            <div className="py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  // Add view logic here
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                  // Add edit logic here
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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