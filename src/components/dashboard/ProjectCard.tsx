import React from 'react'
import { Calendar, Clock, Users } from 'lucide-react'
import { Project } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectCardProps {
  project: Project
  onClick: () => void
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { profile } = useAuth()

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

  const isOverdue = new Date(project.deadline) < new Date()

  return (
    <div
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-purple-500 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400 hidden sm:inline">Active</span>
        </div>
      </div>

      <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400">Progress</span>
          <span className={`text-xs font-medium ${getStatusColor(project.completion_percentage)}`}>
            {project.completion_percentage}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.completion_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">{formatDate(project.last_activity, profile?.timezone)}</span>
          <span className="sm:hidden">{new Date(project.last_activity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-400' : ''}`}>
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">{formatDate(project.deadline, profile?.timezone)}</span>
          <span className="sm:hidden">{new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  )
}