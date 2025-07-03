import React, { useState } from 'react'
import { Menu, X, Building2, Home, FolderOpen, Users, Settings, LogOut, Shield, Headphones } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { signOut, user, profile, globalRole } = useAuth()

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  // Add super admin specific menu items
  if (globalRole === 'super_admin') {
    menuItems.splice(-1, 0, { id: 'admin', label: 'Admin Panel', icon: Shield })
  }

  const handleTabChange = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false)
  }

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
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-white hover:bg-slate-700 transition-colors"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation Panel */}
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900 border-r border-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-2">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">Orion</span>
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
                        onClick={() => handleTabChange(item.id)}
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
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {getUserInitials(profile?.full_name, user?.email)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-white text-sm font-medium truncate">
                      {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                    </p>
                    {globalRole === 'super_admin' && (
                      <div className="bg-purple-500/20 px-2 py-0.5 rounded-full">
                        <span className="text-purple-400 text-xs font-medium">Admin</span>
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
        </div>
      )}
    </>
  )
} 