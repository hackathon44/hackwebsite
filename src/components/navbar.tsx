'use client'

import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/auth-helpers-nextjs'

interface NavbarProps {
  session?: Session | null
}

export default function Navbar({ session }: NavbarProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(session?.user || null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-purple-500/30 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 text-xl font-bold hover:from-purple-500 hover:to-purple-700 transition-all duration-300">
              LessonPlannerAI
            </span>
          </Link>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-purple-300 hover:text-purple-200 transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 border border-purple-500/30 rounded-md text-sm font-medium text-purple-300 hover:text-purple-200 bg-black/20 backdrop-blur-md hover:bg-black/30 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-purple-300 hover:text-purple-200 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transform hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}