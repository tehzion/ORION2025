import React, { useState } from 'react'
import { Eye, EyeOff, Building2, Crown, Code, Users, Eye as EyeIcon, Shield, Play } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onToggleMode: () => void
}

export function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        await signUp(email, password, fullName)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string, roleName: string) => {
    setDemoLoading(roleName)
    setError('')

    try {
      // First try to sign in
      try {
        await signIn(demoEmail, demoPassword)
      } catch (signInError: any) {
        // If sign in fails, try to sign up (user doesn't exist yet)
        if (signInError.message?.includes('Invalid login credentials') || 
            signInError.message?.includes('Email not confirmed')) {
          const fullName = getDemoUserName(demoEmail)
          await signUp(demoEmail, demoPassword, fullName)
        } else {
          throw signInError
        }
      }
    } catch (err: any) {
      setError(`Demo login failed: ${err.message}`)
    } finally {
      setDemoLoading(null)
    }
  }

  const getDemoUserName = (email: string) => {
    switch (email) {
      case 'owner@aacademy.com': return 'Sarah Johnson'
      case 'developer@aacademy.com': return 'Mike Chen'
      case 'client@aacademy.com': return 'Lisa Rodriguez'
      case 'viewer@aacademy.com': return 'Tom Wilson'
      case 'admin@mojodigital.com': return 'Admin User'
      default: return 'Demo User'
    }
  }

  const demoUsers = [
    {
      role: 'owner',
      email: 'owner@aacademy.com',
      password: 'DemoPass123!',
      name: 'Sarah Johnson',
      title: 'Project Owner',
      description: 'Full access to create projects, manage team members, and oversee all aspects of project development.',
      icon: Crown,
      color: 'from-purple-600 to-purple-700',
      borderColor: 'border-purple-500/50 hover:border-purple-400'
    },
    {
      role: 'developer',
      email: 'developer@aacademy.com',
      password: 'DemoPass123!',
      name: 'Mike Chen',
      title: 'Developer',
      description: 'Can create and manage tasks, upload deliverables, and collaborate on project development.',
      icon: Code,
      color: 'from-blue-600 to-blue-700',
      borderColor: 'border-blue-500/50 hover:border-blue-400'
    },
    {
      role: 'client',
      email: 'client@aacademy.com',
      password: 'DemoPass123!',
      name: 'Lisa Rodriguez',
      title: 'Client',
      description: 'Can review work, approve tasks, request revisions, and provide feedback on deliverables.',
      icon: Users,
      color: 'from-green-600 to-green-700',
      borderColor: 'border-green-500/50 hover:border-green-400'
    },
    {
      role: 'viewer',
      email: 'viewer@aacademy.com',
      password: 'DemoPass123!',
      name: 'Tom Wilson',
      title: 'Viewer',
      description: 'Read-only access to view project progress, tasks, and basic project information.',
      icon: EyeIcon,
      color: 'from-slate-600 to-slate-700',
      borderColor: 'border-slate-500/50 hover:border-slate-400'
    },
    {
      role: 'admin',
      email: 'admin@mojodigital.com',
      password: 'DemoPass123!',
      name: 'Admin User',
      title: 'Super Admin',
      description: 'Full system access including user management, support tickets, and administrative functions.',
      icon: Shield,
      color: 'from-red-600 to-red-700',
      borderColor: 'border-red-500/50 hover:border-red-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Demo Section */}
        <div className="order-2 lg:order-1">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-3">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Try Orion Demo
              </h2>
              <p className="text-slate-300 text-sm">
                Experience our project management system with pre-loaded demo data
              </p>
            </div>

            {/* Demo Project Info */}
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-white font-semibold mb-2">Demo Project: A Academy</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                WordPress website maintenance project with logo design, security updates, 
                performance optimization, and staff training. Complete with realistic tasks, 
                comments, and collaboration workflows.
              </p>
            </div>

            {/* Demo Users */}
            <div className="space-y-3">
              {demoUsers.map((user) => {
                const Icon = user.icon
                const isLoading = demoLoading === user.role
                
                return (
                  <button
                    key={user.role}
                    onClick={() => handleDemoLogin(user.email, user.password, user.role)}
                    disabled={isLoading || demoLoading !== null}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group ${user.borderColor} bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`bg-gradient-to-r ${user.color} rounded-lg p-2 flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-medium">{user.title}</h4>
                          <span className="text-slate-400 text-xs">{user.name}</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          {user.description}
                        </p>
                        {isLoading && (
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span className="text-white text-xs">Logging in...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-blue-200 text-xs text-center">
                <strong>Demo Features:</strong> Complete project with 6 tasks, team collaboration, 
                comments, support tickets, and role-based permissions
              </p>
            </div>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="order-1 lg:order-2">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Welcome to Orion
            </h2>
            <p className="mt-2 text-slate-300">
              {mode === 'signin' 
                ? 'Sign in to your project management dashboard'
                : 'Create your account to get started'
              }
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onToggleMode}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {mode === 'signin' 
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}