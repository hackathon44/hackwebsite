'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'student' as 'student' | 'teacher' | 'parent'
  })

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80 },
          color: { value: '#9333ea' },
          opacity: { value: 0.5 },
          size: { value: 3 },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#9333ea',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 2
          }
        }
      })
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: formData.role
            }
          ])

        if (profileError) throw profileError

        setError('Registration successful! Please check your email to confirm your account.')
        setFormData({
          email: '',
          password: '',
          fullName: '',
          role: 'student'
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div id="particles-js" className="fixed inset-0 pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 animate-pulse">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-black/30 backdrop-blur-md py-8 px-4 shadow-[0_0_15px_rgba(147,51,234,0.3)] border border-purple-500/30 sm:rounded-lg sm:px-10 transform transition-all duration-700 hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:border-purple-500/50 hover:-translate-y-1">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`px-4 py-3 rounded backdrop-blur-md transition-all duration-700 ${
                error.includes('successful') 
                  ? 'bg-green-900/30 border border-green-500/50 text-green-300'
                  : 'bg-red-900/30 border border-red-500/50 text-red-300'
              }`}>
                {error}
                {error.includes('successful') && (
                  <div className="mt-2">
                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-700">
                      Go to login page →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Email input */}
            <div className="group">
              <label htmlFor="email" className="block text-sm font-medium text-purple-300 transition-colors duration-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-purple-500/30 rounded-md shadow-sm bg-black/30 text-purple-200 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-md transition-all duration-700 hover:border-purple-500/70 hover:shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password input */}
            <div className="group">
              <label htmlFor="password" className="block text-sm font-medium text-purple-300 transition-colors duration-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-purple-500/30 rounded-md shadow-sm bg-black/30 text-purple-200 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-md transition-all duration-700 hover:border-purple-500/70 hover:shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Full Name input */}
            <div className="group">
              <label htmlFor="fullName" className="block text-sm font-medium text-purple-300 transition-colors duration-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-purple-500/30 rounded-md shadow-sm bg-black/30 text-purple-200 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-md transition-all duration-700 hover:border-purple-500/70 hover:shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="group">
              <label htmlFor="role" className="block text-sm font-medium text-purple-300 transition-colors duration-700">
                Role
              </label>
              <div className="mt-1 relative">
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-purple-500/30 rounded-md shadow-sm bg-black/30 text-purple-200 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 backdrop-blur-md transition-all duration-700 hover:border-purple-500/70 hover:shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student" className="bg-black">Student</option>
                  <option value="teacher" className="bg-black">Teacher</option>
                  <option value="parent" className="bg-black">Parent</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-purple-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-700 shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)] transform hover:-translate-y-0.5"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>

            {/* Login link */}
            <div className="text-sm text-center mt-4">
              <Link 
                href="/login" 
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-700"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
