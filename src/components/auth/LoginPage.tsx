import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Building2, ArrowRight, User, Shield, Users, Eye as EyeIcon } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { DEMO_MODE } from '../../lib/demo'

interface LoginFormData {
  email: string
  password: string
}

interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

const DEMO_USERS = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    email: 'admin@orion.com',
    password: 'admin123',
    role: 'super_admin',
    description: 'Full system access',
    icon: Shield,
    color: 'text-yellow-400'
  },
  {
    id: 'developer',
    name: 'Developer',
    email: 'dev@orion.com',
    password: 'dev123',
    role: 'developer',
    description: 'Task and project access',
    icon: Users,
    color: 'text-green-400'
  },
  {
    id: 'client',
    name: 'Client',
    email: 'client@orion.com',
    password: 'client123',
    role: 'client',
    description: 'Project viewing and feedback',
    icon: EyeIcon,
    color: 'text-purple-400'
  }
]

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signIn, signUp } = useAuth()

  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: ''
  })

  const [signUpData, setSignUpFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const handleLoginChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSignUpChange = (field: keyof SignUpFormData, value: string) => {
    setSignUpFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await signIn(loginData.email, loginData.password)
      setSuccess('Login successful!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      await signUp(signUpData.email, signUpData.password, signUpData.fullName)
      setSuccess('Account created successfully! Please check your email to verify your account.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoUser: typeof DEMO_USERS[0]) => {
    setIsLoading(true)
    setError('')

    try {
      // Simulate demo login
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoginData({ email: demoUser.email, password: demoUser.password })
      await signIn(demoUser.email, demoUser.password)
      setSuccess(`Logged in as ${demoUser.name}`)
    } catch (err) {
      setError('Demo login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-4">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to Orion
          </h2>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Demo Mode Banner */}
        {DEMO_MODE && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Shield className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-purple-400 font-medium text-sm">Demo Mode</h3>
                <p className="text-slate-400 text-xs">Try different user roles instantly</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {DEMO_USERS.map((user) => {
                const UserIcon = user.icon
                return (
                  <button
                    key={user.id}
                    onClick={() => handleDemoLogin(user)}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className={`p-2 rounded-lg bg-slate-700`}>
                      <UserIcon className={`h-4 w-4 ${user.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-slate-400 text-xs">{user.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-900 text-slate-400">
              {DEMO_MODE ? 'Or sign in manually' : 'Sign in to continue'}
            </span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Login Form */}
        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={(e) => handleLoginChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={(e) => handleLoginChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={signUpData.fullName}
                  onChange={(e) => handleSignUpChange('fullName', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signUpData.email}
                  onChange={(e) => handleSignUpChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={signUpData.password}
                  onChange={(e) => handleSignUpChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={signUpData.confirmPassword}
                  onChange={(e) => handleSignUpChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-600 rounded bg-slate-800"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-slate-300">
                I agree to the{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        )}

        {/* Toggle between Login and Sign Up */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
              }}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            © 2025 Orion Project Management. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
} 