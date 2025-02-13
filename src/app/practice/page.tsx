
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/authcontext'
import { supabase } from '@/app/utils/supabase'
import Quiz from '../../components/ai/quiz'
import { motion } from 'framer-motion'

interface Progress {
  topic: string
  level: string
  score: number
  completed: boolean
  last_attempted: string
}

const TOPICS = ['DSA', 'Fullstack', 'AI', 'Operating System'] as const
const LEVELS = ['Easy', 'Medium', 'Hard'] as const

type Topic = typeof TOPICS[number]
type Level = typeof LEVELS[number]

export default function LearningPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<Progress[]>([])
  const [activeQuiz, setActiveQuiz] = useState<{ topic: Topic; level: Level } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return
      try {
        const { data, error } = await supabase
          .from('student_progress')
          .select('*')
          .eq('student_id', user.id)
        if (error) throw error
        setProgress(data || [])
      } catch (error) {
        console.error('Error fetching progress:', error)
        setError('Failed to load progress')
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [user])

  const getCurrentLevel = (topic: Topic): Level => {
    const topicProgress = progress.filter(p => p.topic === topic)
    
    if (topicProgress.length === 0) return 'Easy'
    
    const completedLevels = topicProgress
      .filter(p => p.completed)
      .map(p => p.level)
    
    if (completedLevels.includes('Medium')) return 'Hard'
    if (completedLevels.includes('Easy')) return 'Medium'
    return 'Easy'
  }

  const getTopicProgress = (topic: Topic): number => {
    const topicProgress = progress.filter(p => p.topic === topic)
    if (topicProgress.length === 0) return 0
    
    const completedLevels = topicProgress.filter(p => p.completed).length
    return Math.round((completedLevels / LEVELS.length) * 100)
  }

  const isLevelAvailable = (topic: Topic): boolean => {
    const currentLevel = getCurrentLevel(topic)
    const previousLevel = LEVELS[LEVELS.indexOf(currentLevel) - 1]
    
    if (!previousLevel) return true // First level is always available
    
    return progress.some(p => 
      p.topic === topic && 
      p.level === previousLevel && 
      p.completed
    )
  }

  const getTopicIcon = (topic: Topic) => {
    const icons = {
      'DSA': '🔍',
      'Fullstack': '💻',
      'AI': '🤖',
      'Operating System': '⚙️'
    }
    return icons[topic]
  }

  const getLevelBadge = (level: Level) => {
    const badges = {
      'Easy': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Hard': 'bg-red-100 text-red-800'
    }
    return badges[level]
  }

  const handleQuizComplete = async () => {
    if (!activeQuiz || !user) return

    try {
      // Refresh progress after quiz completion
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id)

      if (error) throw error

      setProgress(data || [])
      setActiveQuiz(null)
    } catch (error) {
      console.error('Error refreshing progress:', error)
      setError('Failed to update progress')
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl text-red-600">{error}</div>
      </div>
    )
  }

  if (activeQuiz) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Quiz
          topic={activeQuiz.topic}
          level={activeQuiz.level}
          onComplete={handleQuizComplete}
          onClose={() => setActiveQuiz(null)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-800/30 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-600/20 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-600/20 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-200">
            Welcome back, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-yellow-100/70 max-w-2xl mx-auto text-lg">
            Your learning journey continues. Progress through challenges and unlock new achievements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOPICS.map((topic, index) => {
            const currentLevel = getCurrentLevel(topic)
            const topicProgress = getTopicProgress(topic)
            const isAvailable = isLevelAvailable(topic)
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={topic}
                className="group bg-yellow-50/5 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-yellow-900/20 transition-all duration-300 border border-yellow-100/10 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300" role="img" aria-label={topic}>
                      {getTopicIcon(topic)}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getLevelBadge(currentLevel)}`}>
                      {currentLevel}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-yellow-100 mb-3">{topic}</h3>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-yellow-100/70 mb-2">
                      <span>Progress</span>
                      <span className="font-semibold">{topicProgress}%</span>
                    </div>
                    <div className="w-full bg-yellow-900/20 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${topicProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {LEVELS.map((level) => {
                      const levelProgress = progress.find(p => p.topic === topic && p.level === level)
                      const isLocked = LEVELS.indexOf(level) > LEVELS.indexOf(currentLevel)
                      
                      return (
                        <div 
                          key={level}
                          className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-yellow-100/5 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-2">
                            {isLocked ? (
                              <span className="text-yellow-100/30">🔒</span>
                            ) : levelProgress?.completed ? (
                              <span className="text-green-400">✓</span>
                            ) : (
                              <span className="text-yellow-100/30">○</span>
                            )}
                            <span className={isLocked ? 'text-yellow-100/30' : 'text-yellow-100/90 font-medium'}>
                              {level}
                            </span>
                          </div>
                          {levelProgress && (
                            <span className={`font-semibold ${levelProgress.completed ? 'text-green-400' : 'text-yellow-100/50'}`}>
                              {levelProgress.score.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setActiveQuiz({ topic, level: currentLevel })}
                    disabled={!isAvailable}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                      ${isAvailable
                        ? 'bg-gradient-to-r from-purple-600 to-yellow-500 text-white hover:from-purple-700 hover:to-yellow-600 transform hover:-translate-y-0.5'
                        : 'bg-yellow-100/5 text-yellow-100/30 cursor-not-allowed'
                      }`}
                  >
                    {isAvailable ? 'Start Quiz' : 'Complete Previous Level'}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 bg-yellow-50/5 backdrop-blur-lg rounded-2xl shadow-lg border border-yellow-100/10 p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-100">Progress Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TOPICS.map((topic) => {
              const topicProgress = progress.filter(p => p.topic === topic)
              const completedLevels = topicProgress.filter(p => p.completed).length
              const averageScore = topicProgress.length > 0
                ? topicProgress.reduce((acc, curr) => acc + curr.score, 0) / topicProgress.length
                : 0

              return (
                <div 
                  key={topic} 
                  className="p-4 rounded-xl bg-gradient-to-br from-yellow-100/5 to-yellow-100/10 hover:from-yellow-100/10 hover:to-yellow-100/5 transition-colors duration-300"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getTopicIcon(topic)}</span>
                    <h3 className="font-semibold text-yellow-100">{topic}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-yellow-100/70">
                    <p className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-medium text-yellow-100">{completedLevels}/{LEVELS.length}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Average:</span>
                      <span className="font-medium text-yellow-100">{averageScore.toFixed(1)}%</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Level:</span>
                      <span className="font-medium text-yellow-100">{getCurrentLevel(topic)}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}