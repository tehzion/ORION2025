import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '../lib/supabase'
import { DEMO_MODE, DEMO_USER, DEMO_PROFILE, DEMO_CONFIG, DEMO_USERS } from '../lib/demo'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  globalRole: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (fullName: string, timezone?: string | null) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
  setGlobalRole: (role: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [globalRole, setGlobalRole] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  const updateProfile = async (fullName: string, timezone?: string | null) => {
    if (!user) throw new Error('No user logged in')

    const updates: { full_name: string; updated_at: string; timezone?: string | null } = {
      full_name: fullName.trim(),
      updated_at: new Date().toISOString(),
    }

    if (timezone !== undefined) {
      updates.timezone = timezone
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error

    // Refresh the profile data after successful update
    await refreshProfile()
  }

  const updatePassword = async (newPassword: string) => {
    if (!user) throw new Error('No user logged in')

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
  }

  useEffect(() => {
    console.log('AuthContext useEffect - DEMO_MODE:', DEMO_MODE, 'DEMO_CONFIG.autoLogin:', DEMO_CONFIG.autoLogin)
    
    if (DEMO_MODE && DEMO_CONFIG.autoLogin) {
      // Demo mode - auto login with mock user
      console.log('Auto-logging in demo user')
      setUser({
        ...DEMO_USER,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: undefined,
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        confirmation_sent_at: undefined,
        recovery_sent_at: undefined,
        email_change_confirm_status: 0,
        banned_until: undefined,
        reauthentication_sent_at: undefined,
        reauthentication_confirm_status: 0
      } as unknown as User)
      setProfile(DEMO_PROFILE)
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else {
        setProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('signIn called with:', { email, password, DEMO_MODE })
    
    if (DEMO_MODE) {
      // Demo mode - find demo user and set state
      console.log('Looking for demo user in:', DEMO_USERS)
      const demoUser = DEMO_USERS.find((u: any) => u.email === email && u.password === password)
      console.log('Found demo user:', demoUser)
      if (!demoUser) {
        throw new Error('Invalid demo credentials')
      }
      
      const mockUser = {
        ...DEMO_USER,
        email: demoUser.email,
        app_metadata: {},
        user_metadata: { full_name: demoUser.full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: undefined,
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        confirmation_sent_at: undefined,
        recovery_sent_at: undefined,
        email_change_confirm_status: 0,
        banned_until: undefined,
        reauthentication_sent_at: undefined,
        reauthentication_confirm_status: 0
      } as unknown as User
      
      const mockProfile = {
        ...DEMO_PROFILE,
        full_name: demoUser.full_name,
        global_role: demoUser.role
      }
      
      setUser(mockUser)
      setProfile(mockProfile)
      setGlobalRole(demoUser.role)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    console.log('Signing out...', { DEMO_MODE })
    
    if (DEMO_MODE) {
      // Demo mode - clear the state and redirect to login
      console.log('Demo mode sign out - clearing state')
      setUser(null)
      setProfile(null)
      setGlobalRole(null)
      setSession(null)
      // Force redirect to login page
      window.location.href = '/login'
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear all state
      setUser(null)
      setProfile(null)
      setGlobalRole(null)
      setSession(null)
      
      // Force redirect to login page
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, clear the state and redirect
      setUser(null)
      setProfile(null)
      setGlobalRole(null)
      setSession(null)
      window.location.href = '/login'
    }
  }

  const value = {
    user,
    session,
    profile,
    globalRole: globalRole || profile?.global_role || null,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    refreshProfile,
    setGlobalRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}