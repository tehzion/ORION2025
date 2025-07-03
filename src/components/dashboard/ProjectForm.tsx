import React, { useState } from 'react'
import { X, Calendar, FileText, AlignLeft, Building2, Save, Plus, X as XIcon } from 'lucide-react'
import { Project } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectFormProps {
  onClose: () => void
  onProjectCreated: (project: Project) => void
  project?: Project
}

export function ProjectForm({ onClose, onProjectCreated, project }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [deadline, setDeadline] = useState(project?.deadline || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [newTeamMember, setNewTeamMember] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Create project with local state (no Supabase yet)
      const newProject: Project = {
        id: project?.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description.trim(),
        completion_percentage: 0,
        last_activity: new Date().toISOString(),
        deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: user.id,
        status: project?.status || 'active',
        priority: project?.priority || 'medium',
        dueDate: project?.dueDate || '',
        budget: project?.budget ? parseFloat(project.budget) : 0,
        team: project?.team || []
      }

      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))

      onProjectCreated(newProject)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const addTeamMember = () => {
    if (newTeamMember.trim() && !project?.team.includes(newTeamMember.trim())) {
      onProjectCreated({
        ...project,
        team: [...project.team, newTeamMember.trim()]
      })
      setNewTeamMember('')
    }
  }

  const removeTeamMember = (index: number) => {
    onProjectCreated({
      ...project,
      team: project.team.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {project ? 'Edit Project' : 'Create New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Project Name</span>
              </div>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter project name..."
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1">
              {name.length}/100 characters
            </p>
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <AlignLeft className="h-4 w-4" />
                <span>Description</span>
              </div>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe your project goals, scope, and key deliverables..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Project Deadline</span>
              </div>
            </label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={getTomorrowDate()}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">
              {deadline ? '' : 'If not specified, deadline will be set to 30 days from now'}
            </p>
          </div>

          {/* Project Type Info */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-500/20 rounded-full p-1">
                <Building2 className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">Project Setup</h4>
                <p className="text-xs text-purple-200 leading-relaxed">
                  Your project will be created with an initial task elevator. You can add team members, 
                  create tasks, and track progress once the project is set up.
                </p>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Team Members
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTeamMember}
                onChange={(e) => setNewTeamMember(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add team member"
              />
              <button
                type="button"
                onClick={addTeamMember}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Team Members List */}
            <div className="flex flex-wrap gap-2">
              {project?.team.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  <span>{member}</span>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="hover:bg-purple-200 rounded-full p-1"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-600 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}