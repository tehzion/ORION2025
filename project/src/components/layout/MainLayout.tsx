import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ProjectDashboard } from '../dashboard/ProjectDashboard'
import { ElevatorInterface } from '../elevator/ElevatorInterface'
import { ProfileSettings } from '../profile/ProfileSettings'
import { SupportPage } from '../support/SupportPage'
import { useAuth } from '../../contexts/AuthContext'

export function MainLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const { globalRole } = useAuth()

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        if (selectedProjectId) {
          return (
            <ElevatorInterface 
              projectId={selectedProjectId} 
              onBackToProjects={handleBackToProjects}
            />
          )
        }
        return (
          <ProjectDashboard onProjectSelect={handleProjectSelect} />
        )
      case 'projects':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Projects</h1>
            <p className="text-slate-400">Project management interface coming soon...</p>
          </div>
        )
      case 'team':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Team</h1>
            <p className="text-slate-400">Team management interface coming soon...</p>
          </div>
        )
      case 'support':
        return <SupportPage />
      case 'admin':
        if (globalRole === 'super_admin') {
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
              <p className="text-slate-400">Super admin controls coming soon...</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">User Management</h3>
                  <p className="text-slate-400 text-sm">Manage user roles and permissions</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Support Tickets</h3>
                  <p className="text-slate-400 text-sm">View and manage all support requests</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Departments</h3>
                  <p className="text-slate-400 text-sm">Manage support departments and assignments</p>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-400">You don't have permission to access this area.</p>
          </div>
        )
      case 'settings':
        return <ProfileSettings />
      default:
        if (selectedProjectId) {
          return (
            <ElevatorInterface 
              projectId={selectedProjectId} 
              onBackToProjects={handleBackToProjects}
            />
          )
        }
        return (
          <ProjectDashboard onProjectSelect={handleProjectSelect} />
        )
    }
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}