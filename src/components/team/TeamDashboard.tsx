import React, { useState } from 'react'
import { Users, UserPlus, Crown, Shield, Eye, Edit, Trash2, Mail, Phone, Calendar, MapPin, Building, Search, Filter } from 'lucide-react'
import { SearchBar } from '../common/SearchBar'
import { useAuth } from '../../contexts/AuthContext'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'developer' | 'client' | 'viewer'
  avatar: string
  department: string
  position: string
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  lastActive: string
  projects: number
  tasks: number
  skills: string[]
}

const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@orion.com',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    department: 'Engineering',
    position: 'Lead Developer',
    status: 'active',
    joinDate: '2023-01-15',
    lastActive: '2024-01-16T10:30:00Z',
    projects: 5,
    tasks: 12,
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker']
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@orion.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'active',
    joinDate: '2023-03-20',
    lastActive: '2024-01-16T09:15:00Z',
    projects: 4,
    tasks: 8,
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Kubernetes']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@orion.com',
    role: 'developer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    department: 'Design',
    position: 'UI/UX Designer',
    status: 'active',
    joinDate: '2023-06-10',
    lastActive: '2024-01-16T11:45:00Z',
    projects: 3,
    tasks: 6,
    skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research']
  }
]

export function TeamDashboard() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const { globalRole } = useAuth()

  const canManageTeam = globalRole === 'super_admin' || globalRole === 'admin'
  const canInviteMembers = globalRole === 'super_admin' || globalRole === 'admin'
  const canEditMembers = globalRole === 'super_admin' || globalRole === 'admin'
  const canRemoveMembers = globalRole === 'super_admin'
  const canViewTeam = globalRole === 'super_admin' || globalRole === 'admin' || globalRole === 'developer'

  // Search filters configuration
  const searchFilters = [
    {
      id: 'role',
      label: 'Role',
      value: '',
      options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'admin', label: 'Admin' },
        { value: 'developer', label: 'Developer' },
        { value: 'client', label: 'Client' },
        { value: 'viewer', label: 'Viewer' }
      ]
    },
    {
      id: 'department',
      label: 'Department',
      value: '',
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Design', label: 'Design' },
        { value: 'Marketing', label: 'Marketing' }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      value: '',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
      ]
    }
  ]

  // Enhanced filtering
  const filteredMembers = DEMO_TEAM_MEMBERS.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = !activeFilters.role || member.role === activeFilters.role
    const matchesDepartment = !activeFilters.department || member.department === activeFilters.department
    const matchesStatus = !activeFilters.status || member.status === activeFilters.status
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4 text-yellow-400" />
      case 'admin': return <Shield className="h-4 w-4 text-blue-400" />
      case 'developer': return <Users className="h-4 w-4 text-green-400" />
      case 'client': return <Eye className="h-4 w-4 text-purple-400" />
      case 'viewer': return <Eye className="h-4 w-4 text-slate-400" />
      default: return <Users className="h-4 w-4 text-slate-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'admin': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'developer': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'client': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'viewer': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'inactive': return 'bg-red-500/20 text-red-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Admin'
      case 'developer': return 'Developer'
      case 'client': return 'Client'
      case 'viewer': return 'Viewer'
      default: return role
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Team Management</h1>
          <p className="text-slate-400">Manage your team members and their roles</p>
        </div>
        <div className="flex items-center space-x-3">
          {canInviteMembers && (
            <button 
              onClick={() => setShowInviteForm(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Members</p>
              <p className="text-2xl font-bold text-white">{DEMO_TEAM_MEMBERS.length}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Members</p>
              <p className="text-2xl font-bold text-white">
                {DEMO_TEAM_MEMBERS.filter(m => m.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Departments</p>
              <p className="text-2xl font-bold text-white">
                {new Set(DEMO_TEAM_MEMBERS.map(m => m.department)).size}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Building className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Projects</p>
              <p className="text-2xl font-bold text-white">
                {DEMO_TEAM_MEMBERS.reduce((sum, m) => sum + m.projects, 0)}
              </p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <UserPlus className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search team members by name, email, position, or skills..."
          value={searchTerm}
          onChange={setSearchTerm}
          filters={searchFilters}
          onFilterChange={setActiveFilters}
          showKeyboardShortcuts={true}
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div 
            key={member.id}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedMember(member)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-slate-400 text-sm">{member.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getRoleIcon(member.role)}
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Department</span>
                <span className="text-white text-sm">{member.department}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Role</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {member.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Projects</span>
                <span className="text-white text-sm">{member.projects}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Tasks</span>
                <span className="text-white text-sm">{member.tasks}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {member.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                  {skill}
                </span>
              ))}
              {member.skills.length > 3 && (
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                  +{member.skills.length - 3}
                </span>
              )}
            </div>
            
            {canEditMembers && (
              <div className="flex space-x-2 pt-4 border-t border-slate-700">
                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                  Edit
                </button>
                {canRemoveMembers && (
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium">
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      {showInviteForm && canManageTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
              <button 
                onClick={() => setShowInviteForm(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="developer">Developer</option>
                  <option value="client">Client</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button 
                  onClick={() => setShowInviteForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 