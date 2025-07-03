import React, { useState } from 'react'
import { Users, Crown, Shield, Eye, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const DEMO_ROLES = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access',
    icon: Crown,
    color: 'text-yellow-400'
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Team and project management',
    icon: Shield,
    color: 'text-blue-400'
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Task and project access',
    icon: Users,
    color: 'text-green-400'
  },
  {
    id: 'client',
    name: 'Client',
    description: 'Project viewing and feedback',
    icon: Eye,
    color: 'text-purple-400'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    icon: Eye,
    color: 'text-slate-400'
  }
]

export function UserSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const { globalRole, setGlobalRole } = useAuth()

  const currentRole = DEMO_ROLES.find(role => role.id === globalRole) || DEMO_ROLES[0]
  const CurrentIcon = currentRole.icon

  const handleRoleChange = (roleId: string) => {
    setGlobalRole(roleId as any)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg hover:bg-slate-700 transition-all duration-200 flex items-center space-x-3 group"
        >
          <div className={`p-2 rounded-lg bg-slate-700 group-hover:bg-slate-600 transition-colors`}>
            <CurrentIcon className={`h-5 w-5 ${currentRole.color}`} />
          </div>
          <div className="text-left">
            <p className="text-white font-medium text-sm">{currentRole.name}</p>
            <p className="text-slate-400 text-xs">{currentRole.description}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
            <div className="p-3 border-b border-slate-700">
              <p className="text-slate-400 text-xs font-medium">Switch User Role</p>
            </div>
            
            <div className="p-2">
              {DEMO_ROLES.map((role) => {
                const RoleIcon = role.icon
                const isActive = role.id === globalRole
                
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                      isActive 
                        ? 'bg-purple-600/20 border border-purple-500/30' 
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-purple-600/20' : 'bg-slate-700'}`}>
                      <RoleIcon className={`h-4 w-4 ${role.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isActive ? 'text-purple-400' : 'text-white'}`}>
                        {role.name}
                      </p>
                      <p className="text-slate-400 text-xs">{role.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
            
            <div className="p-3 border-t border-slate-700">
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <LogOut className="h-3 w-3" />
                <span>Demo Mode - Changes are temporary</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 