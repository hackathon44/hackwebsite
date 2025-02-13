'use client'

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode,
  useCallback 
} from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'
import { PostgrestError } from '@supabase/supabase-js'

// Define authentication error types for better error handling
export type AuthError = {
  message: string
  code?: string
}

// Define custom error types to replace 'any'
type SupabaseAuthError = {
  message: string
  code?: string
  status?: number
}

// Define the shape of our user profile data with strict typing
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'teacher' | 'parent'
  created_at: string
  updated_at: string
  avatar_url?: string
  preferences?: Record<string, unknown>
}

// Define authentication state interface
interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: AuthError | null
}

// Define the shape of our auth context with complete typing
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

// Create the context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to handle errors
const handleError = (error: SupabaseAuthError | PostgrestError): AuthError => ({
  message: error.message || 'An error occurred',
  code: 'code' in error ? error.code : undefined
})

// Create a provider component with proper error handling and state management
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  // Function to fetch user profile data with error handling
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      return data as UserProfile
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching user profile:', error)
        setState(prev => ({ ...prev, error: { message: error.message } }))
      }
      return null
    }
  }

  // Enhanced user refresh function with error handling
  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) throw authError

      if (authUser) {
        const profile = await fetchUserProfile(authUser.id)
        setState(prev => ({ ...prev, user: profile, error: null }))
      } else {
        setState(prev => ({ ...prev, user: null, error: null }))
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error refreshing user:', error)
        setState(prev => ({ 
          ...prev, 
          user: null, 
          error: { message: error.message } 
        }))
      }
    }
  }, [])

  // Sign in function with enhanced error handling
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id)
        setState(prev => ({ ...prev, user: profile, error: null }))
        router.push('/dashboard')
      }

      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { 
        error: handleError(error as SupabaseAuthError)
      }
    }
  }

  // Sign up function with profile creation
  const signUp = async (
    email: string, 
    password: string, 
    userData: Partial<UserProfile>
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              email,
              ...userData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])

        if (profileError) throw profileError

        const profile = await fetchUserProfile(data.user.id)
        setState(prev => ({ ...prev, user: profile, error: null }))
        router.push('/dashboard')
      }

      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { 
        error: handleError(error as SupabaseAuthError)
      }
    }
  }

  // Sign out function with proper cleanup
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setState(prev => ({ ...prev, user: null, error: null }))
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error signing out:', error)
        setState(prev => ({ 
          ...prev, 
          error: { message: error.message } 
        }))
      }
    }
  }

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user?.id) throw new Error('No user logged in')

      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id)

      if (error) throw error

      await refreshUser()
      return { error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { 
        error: handleError(error as SupabaseAuthError)
      }
    }
  }

  // Password reset function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { 
        error: handleError(error as SupabaseAuthError)
      }
    }
  }

  // Initial auth state setup with error handling
  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) throw authError

        if (authUser) {
          const profile = await fetchUserProfile(authUser.id)
          setState(prev => ({ ...prev, user: profile, loading: false, error: null }))
        } else {
          setState(prev => ({ ...prev, loading: false, error: null }))
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error setting up auth:', error)
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: { message: error.message } 
          }))
        }
      }
    }

    setupAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setState(prev => ({ ...prev, user: profile, error: null }))
        } else {
          setState(prev => ({ ...prev, user: null, error: null }))
          if (event === 'SIGNED_OUT') {
            router.push('/login')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Provide auth context value
  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshUser,
    updateProfile,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context with proper error checking
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}