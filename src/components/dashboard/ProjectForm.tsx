import React, { useState } from 'react'
import { X, Calendar, FileText, AlignLeft, Building2, Save, Plus, X as XIcon } from 'lucide-react'
import { CreateProjectData } from '../../lib/projectService'
import { useAuth } from '../../contexts/AuthContext'

interface ProjectFormProps {
  onSubmit: (projectData: CreateProjectData) => Promise<void>
  onCancel: () => void
  project?: any
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, onCancel, project }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
    priority: project?.priority || 'medium',
    due_date: project?.due_date || '',
    budget: project?.budget || '',
    tags: project?.tags || []
  })
  const [newTeamMember, setNewTeamMember] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      await onSubmit({
        ...formData,
        budget: parseFloat(formData.budget) || 0
      })
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
    if (newTeamMember.trim()) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTeamMember.trim()]
      })
      setNewTeamMember('')
    }
  }

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_: string, i: number) => i !== index)
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
            onClick={onCancel}
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter project name..."
              maxLength={100}
            />
            <p className="text-xs text-slate-400 mt-1">
              {formData.name.length}/100 characters
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Describe your project goals, scope, and key deliverables..."
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Project Deadline</span>
              </div>
            </label>
            <input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              min={getTomorrowDate()}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-white mb-2">
              Budget ($)
            </label>
            <input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter budget amount"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTeamMember}
                onChange={(e) => setNewTeamMember(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={addTeamMember}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tags List */}
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  <span>{tag}</span>
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
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-400 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {project ? 'Update Project' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectForm