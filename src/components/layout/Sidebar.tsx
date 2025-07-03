import React from 'react'
import { Building2, Home, FolderOpen, Users, Settings, LogOut, Shield, Headphones, MessageSquare } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { signOut, user, profile, globalRole } = useAuth()

  // Base menu items for all users
  const baseMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
  ]

  // Role-based menu items
  const getMenuItems = () => {
    const items = [...baseMenuItems]

    // Projects - available to all authenticated users
    items.push({ id: 'projects', label: 'Projects', icon: FolderOpen })

    // Team management - only for admins and super admins
    if (globalRole === 'super_admin' || globalRole === 'admin') {
      items.push({ id: 'team', label: 'Team', icon: Users })
    }

    // Chat - available to all users
    items.push({ id: 'chat', label: 'Messages', icon: MessageSquare })

    // Support - available to all users
    items.push({ id: 'support', label: 'Support', icon: Headphones })

    // Admin Panel - only for super admins
    if (globalRole === 'super_admin') {
      items.push({ id: 'admin', label: 'Admin Panel', icon: Shield })
    }

    // Settings - available to all users
    items.push({ id: 'settings', label: 'Settings', icon: Settings })

    return items
  }

  const menuItems = getMenuItems()

  const getUserInitials = (name: string | null | undefined, email: string | undefined) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <div className="bg-slate-900 border-r border-slate-800 w-64 flex flex-col h-full hidden lg:flex">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">Orion</span>
            {globalRole === 'super_admin' && (
              <div className="flex items-center space-x-1 mt-1">
                <Shield className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-purple-400 font-medium">Mojo Digital</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.id === 'admin' && (
                    <Shield className="h-3 w-3 text-purple-400 ml-auto" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getUserInitials(profile?.full_name, user?.email)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-white text-sm font-medium truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              {globalRole && (
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  globalRole === 'super_admin' ? 'bg-yellow-500/20 text-yellow-400' :
                  globalRole === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                  globalRole === 'developer' ? 'bg-green-500/20 text-green-400' :
                  globalRole === 'client' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {globalRole === 'super_admin' ? 'Super Admin' :
                   globalRole === 'admin' ? 'Admin' :
                   globalRole === 'developer' ? 'Developer' :
                   globalRole === 'client' ? 'Client' :
                   globalRole === 'viewer' ? 'Viewer' : globalRole}
                </div>
              )}
            </div>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}