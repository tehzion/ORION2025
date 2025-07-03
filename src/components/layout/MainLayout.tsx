import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ProjectDashboard } from '../dashboard/ProjectDashboard'
import { ElevatorInterface } from '../elevator/ElevatorInterface'
import { ProfileSettings } from '../profile/ProfileSettings'
import { SupportPage } from '../support/SupportPage'
import { ProjectManagement } from '../projects/ProjectManagement'
import { TeamDashboard } from '../team/TeamDashboard'
import { UserSwitcher } from '../common/UserSwitcher'
import { useAuth } from '../../contexts/AuthContext'
import DemoBanner from '../common/DemoBanner'

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
        // Projects accessible to all authenticated users
        return <ProjectManagement />
      case 'team':
        // Team management only for admins and super admins
        if (globalRole === 'super_admin' || globalRole === 'admin') {
          return <TeamDashboard />
        }
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-400">Team management is only available to administrators.</p>
          </div>
        )
      case 'support':
        // Support accessible to all users
        return <SupportPage />
      case 'admin':
        // Admin panel only for super admins
        if (globalRole === 'super_admin') {
          return (
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
              <p className="text-slate-400">Super admin controls and system management</p>
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
                  <h3 className="text-lg font-semibold text-white mb-2">System Settings</h3>
                  <p className="text-slate-400 text-sm">Configure system-wide settings</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
                  <p className="text-slate-400 text-sm">View system analytics and reports</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Backup & Restore</h3>
                  <p className="text-slate-400 text-sm">Manage data backup and restoration</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Security</h3>
                  <p className="text-slate-400 text-sm">Security settings and audit logs</p>
                </div>
              </div>
            </div>
          )
        }
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-400">Admin panel is only available to super administrators.</p>
          </div>
        )
      case 'settings':
        // Settings accessible to all users
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
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto lg:ml-0">
        <DemoBanner />
        {renderContent()}
      </main>
      <UserSwitcher />
    </div>
  )
}