'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../app/context/authcontext'
import { 
  BookOpen, 
  TestTube2,
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Sun,
  Moon,
  Sparkles,
  GraduationCap,
  Users,
  Calendar,
  BarChart,
  MessageSquare,
  HelpCircle
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  description: string
}

export default function TeacherNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [unreadNotifications] = useState(3) // Example count
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/teacher/dashboard',
      icon: <BarChart className="h-5 w-5" />,
      description: 'View your teaching analytics and insights'
    },
    {
      name: 'Lesson Planner',
      href: '/teacher/lessons',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Create and manage lesson plans with AI assistance'
    },
    {
      name: 'Test Creator',
      href: '/teacher/tests',
      icon: <TestTube2 className="h-5 w-5" />,
      description: 'Generate and customize tests for your classes'
    },
    {
      name: 'Students',
      href: '/teacher/students',
      icon: <Users className="h-5 w-5" />,
      description: 'Manage your student roster and performance'
    },
    {
      name: 'Schedule',
      href: '/teacher/schedule',
      icon: <Calendar className="h-5 w-5" />,
      description: 'View and manage your teaching schedule'
    },
    {
      name: 'AI Assistant',
      href: '/teacher/ai-tools',
      icon: <Sparkles className="h-5 w-5" />,
      description: 'Access AI-powered teaching tools and resources'
    }
  ]

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800' 
        : 'bg-white/90 backdrop-blur-md border-b border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/teacher/dashboard" 
                className="flex items-center space-x-2"
              >
                <GraduationCap className={`h-8 w-8 ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
                <span className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  EduAI
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden lg:ml-10 lg:flex lg:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={`
                        inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        ${isActive 
                          ? isDarkMode
                            ? 'text-indigo-400 bg-slate-800'
                            : 'text-indigo-600 bg-indigo-50'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }
                        transition-all duration-200
                      `}
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Link>
                    
                    {/* Enhanced Tooltip */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-24 hidden group-hover:block w-48 px-2 py-1 z-50">
                      <div className={`
                        text-sm rounded-lg p-2 text-center shadow-lg
                        ${isDarkMode
                          ? 'bg-slate-800 text-slate-200 border border-slate-700'
                          : 'bg-white text-slate-600 border border-slate-200'}
                      `}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
              `}
            >
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Help Button */}
            <button
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
              `}
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Messages */}
            <Link
              href="/teacher/messages"
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
              `}
            >
              <MessageSquare className="h-5 w-5" />
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`
                  p-2 rounded-lg transition-colors duration-200 relative
                  ${isDarkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                `}
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadNotifications}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className={`
                  absolute right-0 mt-2 w-80 rounded-lg shadow-lg py-1 z-50
                  ${isDarkMode
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-white border border-slate-200'}
                `}>
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <h3 className={`text-sm font-semibold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      Notifications
                    </h3>
                  </div>
                  {/* Add notification items here */}
                </div>
              )}
            </div>

            {/* Create New Button */}
            <button
              className={`
                inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              `}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Create New
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className={`
                flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200
                ${isDarkMode
                  ? 'hover:bg-slate-800'
                  : 'hover:bg-slate-100'}
              `}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${isDarkMode
                    ? 'bg-slate-800'
                    : 'bg-slate-200'}
                `}>
                  <User className={`h-5 w-5 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-slate-700'
                }`}>
                  {user?.full_name}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              <div className="absolute right-0 w-56 mt-2 hidden group-hover:block z-50">
                <div className={`
                  rounded-lg shadow-lg ring-1 ring-black ring-opacity-5
                  ${isDarkMode
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-white border border-slate-200'}
                `}>
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <p className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {user?.full_name}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/teacher/settings"
                      className={`
                        flex items-center px-4 py-2 text-sm
                        ${isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={signOut}
                      className={`
                        flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50
                        ${isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'}
                      `}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                inline-flex items-center justify-center p-2 rounded-lg
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
              `}
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className={`pt-2 pb-3 space-y-1 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-2 text-base font-medium
                    ${isActive
                      ? isDarkMode
                        ? 'text-indigo-400 bg-slate-800'
                        : 'text-indigo-600 bg-indigo-50'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              )
            })}
          </div>
          <div className={`pt-4 pb-3 border-t ${
            isDarkMode
            ? 'border-slate-800 bg-slate-900'
            : 'border-slate-200 bg-white'
        }`}>
          {/* Mobile Profile Section */}
          <div className="px-4 flex items-center">
            <div className="flex-shrink-0">
              <div className={`
                h-10 w-10 rounded-full flex items-center justify-center
                ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}
              `}>
                <User className={`h-6 w-6 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`} />
              </div>
            </div>
            <div className="ml-3">
              <div className={`text-base font-medium ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {user?.full_name}
              </div>
              <div className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {user?.email}
              </div>
            </div>
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`
                ml-auto p-2 rounded-lg transition-colors duration-200
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
              `}
            >
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Action Buttons */}
          <div className="mt-3 px-2 space-y-1">
            {/* Messages */}
            <Link
              href="/teacher/messages"
              className={`
                flex items-center px-3 py-2 rounded-lg text-base font-medium
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages
            </Link>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-base font-medium
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Help */}
            <button
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-base font-medium
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <HelpCircle className="h-5 w-5 mr-2" />
              Help & Support
            </button>

            {/* Settings */}
            <Link
              href="/teacher/settings"
              className={`
                flex items-center px-3 py-2 rounded-lg text-base font-medium
                ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>

            {/* Create New (Mobile) */}
            <button
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-base font-medium
                ${isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'}
              `}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Create New
            </button>

            {/* Sign Out (Mobile) */}
            <button
              onClick={signOut}
              className={`
                flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-red-600
                ${isDarkMode
                  ? 'hover:bg-red-900/20'
                  : 'hover:bg-red-50'}
              `}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    )}
  </nav>
);
}