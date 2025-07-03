import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { ProjectDashboard } from '../dashboard/ProjectDashboard'
import { ElevatorInterface } from '../elevator/ElevatorInterface'
import { ProfileSettings } from '../profile/ProfileSettings'
import { SupportPage } from '../support/SupportPage'
import { ProjectManagement } from '../projects/ProjectManagement'
import { TeamDashboard } from '../team/TeamDashboard'
import { ChatSystem } from '../chat/ChatSystem'
import { SystemSettings } from '../admin/SystemSettings'
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
      case 'chat':
        // Chat accessible to all users
        return <ChatSystem />
      case 'support':
        // Support accessible to all users
        return <SupportPage />
      case 'admin':
        // Admin panel only for super admins
        if (globalRole === 'super_admin') {
          return <SystemSettings />
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