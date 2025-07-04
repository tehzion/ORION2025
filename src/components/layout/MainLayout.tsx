import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { UserSwitcher } from '../common/UserSwitcher'
import { useAuth } from '../../contexts/AuthContext'
import DemoBanner from '../common/DemoBanner'

const MainLayout: React.FC = () => {
  const location = useLocation()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const { globalRole } = useAuth()

  // Determine active tab from current location
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/') return 'dashboard'
    if (path === '/elevator') return 'elevator'
    if (path === '/support') return 'support'
    if (path === '/profile') return 'settings'
    if (path === '/team') return 'team'
    if (path === '/admin') return 'admin'
    if (path === '/chat') return 'chat'
    if (path === '/project-status') return 'project-status'
    return 'dashboard'
  }

  const activeTab = getActiveTab()

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const handleBackToProjects = () => {
    setSelectedProjectId(null)
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={() => {}} />
      <MobileNav activeTab={activeTab} onTabChange={() => {}} />
      <main className="flex-1 overflow-auto lg:ml-0">
        <DemoBanner />
        <Outlet />
      </main>
      <UserSwitcher />
    </div>
  )
}

export default MainLayout