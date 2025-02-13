
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../context/authcontext'
import { useRouter } from 'next/navigation'
import { Menu, X, Sun, Moon, Layout, BookOpen, Brain,PieChart } from 'lucide-react'
import Link from 'next/link'
import StudentTests from '../../components/studentdashboard/testattempt'
import { motion } from 'framer-motion'
import StudentAnalytics from '../../components/studentdashboard/chart'

// Types for our analytics data
interface TopicPerformance {
  topic: string;
  correctPercentage: number;
  classAverage: number;
  totalQuestions: number;
}

interface ProgressStats {
  testsCompleted: number;
  averageScore: number;
  topPerformance: string;
  improvementArea: string;
}

export default function StudentDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [topicPerformance, setTopicPerformance] = useState<TopicPerformance[]>([])
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    testsCompleted: 0,
    averageScore: 0,
    topPerformance: '',
    improvementArea: ''
  })

  // Enhanced navigation items with badges and descriptions
  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Layout,
      badge: '2 new',
      description: 'Your learning overview'
    },
    { 
      name: 'Courses', 
      href: '/courses', 
      icon: BookOpen,
      badge: '5 active',
      description: 'Enrolled courses'
    },
    { 
      name: 'AI Recommendations', 
      href: '/recommendations', 
      icon: Brain,
      badge: 'New',
      description: 'Personalized learning paths'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: PieChart,
      description: 'Performance insights'
    }
  ]
  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login')
    }

    // Enhanced particles configuration
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
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
            speed: 2,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'repulse'
            },
            onclick: {
              enable: true,
              mode: 'push'
            },
            resize: true
          }
        }
      })
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="h-14 w-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto">
            <div className="h-10 w-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-purple-400 text-lg font-medium">Loading your personalized dashboard...</p>
        </motion.div>
      </div>
    )
  }

  const bgClass = isDark ? 'bg-black/30' : 'bg-white/80'
  const textClass = isDark ? 'text-purple-300' : 'text-purple-600'
  const borderClass = isDark ? 'border-purple-500/30' : 'border-purple-300/30'

  // Card component for reusability
  const Card = ({ children, className = '' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${bgClass} backdrop-blur-md rounded-lg border ${borderClass} shadow-lg overflow-hidden transform transition-all duration-700 hover:shadow-xl hover:border-purple-500/50 ${className}`}
    >
      {children}
    </motion.div>
  )

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'} relative overflow-hidden`}>
      <div id="particles-js" className="fixed inset-0 pointer-events-none" />
      
      {/* Enhanced Navbar */}
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${bgClass} backdrop-blur-md border-b ${borderClass} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                EduTech
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${textClass} hover:bg-purple-500/10`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>

            {/* Right side items */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full transition-all duration-300 ${textClass} hover:bg-purple-500/10`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-bold ${textClass}`}>{user.full_name}</p>
                  <p className={isDark ? 'text-purple-400/80' : 'text-purple-500/80'}>{user.email}</p>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md transition-all duration-300 ${textClass} hover:bg-purple-500/10`}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
          <div className={`px-2 pt-2 pb-3 space-y-1 ${bgClass}`}>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${textClass} hover:bg-purple-500/10`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-20 max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  Welcome back, {user.full_name}!
                </h1>
                <p className={`mt-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  Your learning journey continues. You've completed {progressStats.testsCompleted} tests this week!
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-full ${bgClass} ${borderClass}`}>
                  <span className="text-sm font-medium">Current Rank: </span>
                  <span className="text-purple-500 font-bold">Top 10%</span>
                </div>
                <div className={`px-4 py-2 rounded-full ${bgClass} ${borderClass}`}>
                  <span className="text-sm font-medium">Average Score: </span>
                  <span className="text-purple-500 font-bold">{progressStats.averageScore}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Tests Section */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Recent Tests</h2>
            <StudentTests />
          </div>
        </Card>
        <StudentAnalytics/>
      </main>
    </div>
  )
}