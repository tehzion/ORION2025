import React, { useState, useEffect } from 'react'
import { X, MessageSquare, AlertTriangle, FileText, Tag, Building2 } from 'lucide-react'
import { Department, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { DEMO_MODE, DEMO_DEPARTMENTS } from '../../lib/demo'

interface NewTicketFormProps {
  onClose: () => void
  onTicketCreated: () => void
}

export function NewTicketForm({ onClose, onTicketCreated }: NewTicketFormProps) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [departmentId, setDepartmentId] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      if (DEMO_MODE) {
        setDepartments(DEMO_DEPARTMENTS)
        // Set default department to General if available
        const generalDept = DEMO_DEPARTMENTS.find((d: Department) => d.name.toLowerCase() === 'general')
        if (generalDept) {
          setDepartmentId(generalDept.id)
        }
        return
      }

      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
      
      // Set default department to General if available
      const generalDept = data?.find((d: Department) => d.name.toLowerCase() === 'general')
      if (generalDept) {
        setDepartmentId(generalDept.id)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          assigned_to_department_id: departmentId || null,
          status: 'open'
        }])

      if (insertError) throw insertError

      onTicketCreated()
    } catch (err: any) {
      setError(err.message || 'Failed to create support ticket')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getPriorityDescription = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Critical issues that prevent you from working'
      case 'high':
        return 'Important issues that significantly impact your work'
      case 'medium':
        return 'General issues that need attention'
      case 'low':
        return 'Minor issues or feature requests'
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Create Support Ticket</h2>
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
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Subject</span>
              </div>
            </label>
            <input
              id="subject"
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Brief description of your issue..."
              maxLength={200}
            />
            <p className="text-xs text-slate-400 mt-1">
              {subject.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              maxLength={2000}
            />
            <p className="text-xs text-slate-400 mt-1">
              {description.length}/2000 characters
            </p>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Priority</span>
              </div>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            
            {/* Priority Description */}
            <div className={`mt-3 p-3 rounded-lg border ${getPriorityColor(priority)}`}>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm capitalize">{priority} Priority</p>
                  <p className="text-xs mt-1 opacity-90">
                    {getPriorityDescription(priority)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-white mb-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Department</span>
              </div>
            </label>
            <select
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Choose the department that best matches your request for faster resolution
            </p>
          </div>

          {/* Help Text */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500/20 rounded-full p-1">
                <MessageSquare className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-300 mb-1">Getting Help</h4>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Our support team will review your ticket and respond as soon as possible. 
                  You'll receive email notifications for any updates to your ticket.
                </p>
              </div>
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
              disabled={loading || !subject.trim() || !description.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}