import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginPage } from './components/auth/LoginPage'
import { MainLayout } from './components/layout/MainLayout'

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-red-200 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function AppContent() {
  const { user, loading } = useAuth()

  // Debug logging
  useEffect(() => {
    console.log('AppContent rendered:', { user, loading })
  }, [user, loading])

  if (loading) {
    console.log('Showing loading spinner')
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    console.log('Showing login page')
    return <LoginPage />
  }

  console.log('Showing main layout')
  return <MainLayout />
}

function App() {
  console.log('App component rendered')
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App