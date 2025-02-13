'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '../context/authcontext'
import { supabase } from '../utils/supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { PostgrestError } from '@supabase/supabase-js'

interface TopicProgress {
  topic: string
  score: number
  level: string
  completed: boolean
  totalAttempts: number
  correctAnswers: number
}

interface LeaderboardEntry {
  student_id: string
  full_name: string
  average_score: number
  rank: number
}

interface QuestionData {
  question_id: string
  topic: string
}

export default function LearningPage() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<TopicProgress[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Move topics array into useMemo to prevent recreation on each render
  const topics = useMemo(() => ['DSA', 'Fullstack', 'AI', 'Operating System'], [])

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setError('No user found')
      setLoading(false)
      return
    }

    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('ai_questions')
        .select('question_id, topic')

      if (questionsError) throw questionsError

      const questionMap = (questionsData || []).reduce((acc: Record<string, QuestionData>, question) => {
        acc[question.question_id] = question
        return acc
      }, {})

      const { data: answersData, error: answersError } = await supabase
        .from('student_answer')
        .select('*')
        .eq('student_id', user.id)

      if (answersError) throw answersError

      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', user.id)

      if (progressError) throw progressError

      const topicStats = topics.reduce((acc, topic) => {
        const topicAnswers = (answersData || []).filter(answer => 
          questionMap[answer.question_id]?.topic === topic
        )

        const correctAnswers = topicAnswers.filter(answer => answer.is_correct).length
        
        const existingProgress = progressData?.find(p => p.topic === topic)

        const score = topicAnswers.length > 0
          ? (correctAnswers / topicAnswers.length) * 100
          : existingProgress?.score || 0

        acc[topic] = {
          topic,
          score,
          totalAttempts: topicAnswers.length,
          correctAnswers,
          level: existingProgress?.level || 'Easy',
          completed: existingProgress?.completed || false
        }

        return acc
      }, {} as Record<string, TopicProgress>)

      setProgress(Object.values(topicStats))

      const { data: studentsData, error: studentsError } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'student')

      if (studentsError) throw studentsError

      const leaderboardPromises = studentsData.map(async (student) => {
        const { data: studentAnswers } = await supabase
          .from('student_answer')
          .select('*')
          .eq('student_id', student.id)

        let totalScore = 0
        let totalAttempts = 0

        topics.forEach(topic => {
          const topicAnswers = (studentAnswers || []).filter(answer => 
            questionMap[answer.question_id]?.topic === topic
          )
          
          if (topicAnswers.length > 0) {
            const correctAnswers = topicAnswers.filter(answer => answer.is_correct).length
            totalScore += (correctAnswers / topicAnswers.length) * 100
            totalAttempts += 1
          }
        })

        return {
          student_id: student.id,
          full_name: student.full_name,
          average_score: totalAttempts > 0 ? totalScore / totalAttempts : 0
        }
      })

      const leaderboardResults = await Promise.all(leaderboardPromises)
      const sortedLeaderboard = leaderboardResults
        .sort((a, b) => b.average_score - a.average_score)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      setLeaderboard(sortedLeaderboard)

    } catch (err) {
      const error = err as PostgrestError
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, topics]) // Now topics is stable and won't cause unnecessary rerenders

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  const averageScore = progress.length > 0
    ? progress.reduce((acc, curr) => acc + curr.score, 0) / progress.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Progress</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user?.full_name}
          </p>
        </div>

        {/* Overall Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="score"
                    fill="#4F46E5"
                    name="Score"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-indigo-900">Overall Progress</h3>
                <p className="text-3xl font-bold text-indigo-600">
                  {averageScore.toFixed(1)}%
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {progress.map((topic) => (
                  <div
                    key={topic.topic}
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <h4 className="text-sm font-medium text-gray-500">{topic.topic}</h4>
                    <p className="text-2xl font-semibold text-gray-900">
                      {topic.score.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {topic.correctAnswers} / {topic.totalAttempts} correct
                    </p>
                    <p className="text-sm text-gray-500">
                      Current Level: {topic.level}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.student_id}
                    className={entry.student_id === user?.id ? 'bg-indigo-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{entry.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.full_name}
                      {entry.student_id === user?.id && ' (You)'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.average_score.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}