import React, { useState } from 'react'
import { Building2, Home, FolderOpen, Users, Settings, LogOut, Shield, Headphones, MessageSquare, BarChart3, ArrowUpDown, HelpCircle, MessageCircle, GitBranch, User, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation, Link } from 'react-router-dom'

export function Sidebar() {
  const { signOut, user, profile, globalRole } = useAuth()
  const location = useLocation()
  const pathname = location.pathname
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  // Convert menu items to navigation with proper routing
  const navigation = menuItems.map(item => {
    let href = '/'
    switch (item.id) {
      case 'dashboard': href = '/'; break
      case 'projects': href = '/projects'; break
      case 'team': href = '/team'; break
      case 'chat': href = '/chat'; break
      case 'support': href = '/support'; break
      case 'admin': href = '/admin'; break
      case 'settings': href = '/profile'; break
      default: href = '/'
    }
    
    return {
      name: item.label,
      href,
      icon: item.icon,
      current: pathname === href || (item.id === 'dashboard' && pathname === '/')
    }
  })

  return (
    <div className={`bg-slate-800 border-r border-slate-700 shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-white">Orion</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  item.current
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
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