'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../app/utils/supabase'
import { useAuth } from '../../app/context/authcontext'
import type { PostgrestError } from '@supabase/supabase-js'

// Enhanced error handling with discriminated union types
type AppError = 
  | { type: 'database'; error: PostgrestError }
  | { type: 'validation'; message: string }
  | { type: 'network'; message: string }

// Define TypeScript interfaces for our data structures
interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'student' | 'teacher' | 'parent'
  created_at: string
  updated_at: string
}

interface Test {
  id: string
  name: string
  total_marks: number
  teacher_id: string
}

interface Question {
  id: string
  test_id: string
  question_text: string
  marks: number
  topic: string
}

interface StudentAttempt {
  id: string
  student_id: string
  test_id: string
  question_id: string
  is_correct: boolean
  marks_obtained: number
  selected_option: string
  attempt_time: string
}

interface TestResult {
  testId: string
  testName: string
  totalMarks: number
  marksObtained: number
  questionsAttempted: number
  topicPerformance: {
    [key: string]: {
      total: number
      correct: number
      percentage: number
    }
  }
}

interface StudentAnalytics {
  testResults: TestResult[]
  weakTopics: string[]
  strongTopics: string[]
  averageScore: number
}

const StudentPerformanceAnalytics: React.FC = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState<UserProfile[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  // Helper function to handle errors
  const handleError = (error: AppError): string => {
    switch (error.type) {
      case 'database':
        return `Database error: ${error.error.message}`
      case 'validation':
      case 'network':
        return error.message
      default:
        return 'An unexpected error occurred'
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      fetchAnalytics(selectedStudent)
    }
  }, [selectedStudent])

  const fetchStudents = async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name')

      if (dbError) {
        throw { type: 'database', error: dbError } as AppError
      }

      setStudents(data)
    } catch (error) {
      const appError = error as AppError
      setError(handleError(appError))
    }
  }

  const fetchAnalytics = async (studentId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all required data in parallel
      const [testsResponse, questionsResponse, attemptsResponse] = await Promise.all([
        supabase.from('tests').select('*'),
        supabase.from('questions').select('*'),
        supabase.from('student_attempts')
          .select('*')
          .eq('student_id', studentId)
      ])

      // Handle potential database errors
      if (testsResponse.error) {
        throw { type: 'database', error: testsResponse.error } as AppError
      }
      if (questionsResponse.error) {
        throw { type: 'database', error: questionsResponse.error } as AppError
      }
      if (attemptsResponse.error) {
        throw { type: 'database', error: attemptsResponse.error } as AppError
      }

      const tests = testsResponse.data as Test[]
      const questions = questionsResponse.data as Question[]
      const attempts = attemptsResponse.data as StudentAttempt[]

      // Create lookup maps for efficient data access
      const questionMap = new Map(questions.map(q => [q.id, q]))
      const testResults = new Map<string, TestResult>()

      // Initialize test results
      tests.forEach(test => {
        testResults.set(test.id, {
          testId: test.id,
          testName: test.name,
          totalMarks: test.total_marks,
          marksObtained: 0,
          questionsAttempted: 0,
          topicPerformance: {}
        })
      })

      // Process attempts and calculate scores
      attempts.forEach(attempt => {
        const question = questionMap.get(attempt.question_id)
        if (!question) return

        const testResult = testResults.get(attempt.test_id)
        if (!testResult) return

        testResult.questionsAttempted++
        testResult.marksObtained += attempt.marks_obtained

        // Update topic performance
        const topic = question.topic
        if (!testResult.topicPerformance[topic]) {
          testResult.topicPerformance[topic] = {
            total: 0,
            correct: 0,
            percentage: 0
          }
        }

        const topicStats = testResult.topicPerformance[topic]
        topicStats.total += question.marks
        if (attempt.is_correct) {
          topicStats.correct += attempt.marks_obtained
        }
        topicStats.percentage = (topicStats.correct / topicStats.total) * 100
      })

      // Calculate topic strengths
      const topicPerformances: { [key: string]: number[] } = {}
      testResults.forEach(result => {
        Object.entries(result.topicPerformance).forEach(([topic, stats]) => {
          if (!topicPerformances[topic]) {
            topicPerformances[topic] = []
          }
          topicPerformances[topic].push(stats.percentage)
        })
      })

      const avgTopicPerformance = Object.entries(topicPerformances).map(([topic, scores]) => ({
        topic,
        average: scores.reduce((a, b) => a + b, 0) / scores.length
      }))

      const strongTopics = avgTopicPerformance
        .filter(t => t.average >= 70)
        .map(t => t.topic)

      const weakTopics = avgTopicPerformance
        .filter(t => t.average < 50)
        .map(t => t.topic)

      // Calculate overall average
      const results = Array.from(testResults.values())
      const averageScore = results.length > 0
        ? results.reduce((acc, test) => 
            acc + (test.marksObtained / test.totalMarks) * 100, 0
          ) / results.length
        : 0

      setAnalytics({
        testResults: results,
        weakTopics,
        strongTopics,
        averageScore
      })
    } catch (error) {
      const appError = error as AppError
      setError(handleError(appError))
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async () => {
    if (!selectedStudent || !user?.id || !feedback.trim()) {
      throw { type: 'validation', message: 'Invalid feedback submission data' } as AppError
    }
    
    try {
      setSubmittingFeedback(true)
      
      const { error: feedbackError } = await supabase
        .from('feedback')
        .insert({
          student_id: selectedStudent,
          teacher_id: user.id,
          feedback_text: feedback,
          acknowledged: false
        })

      if (feedbackError) {
        throw { type: 'database', error: feedbackError } as AppError
      }

      setFeedback('')
    } catch (error) {
      const appError = error as AppError
      setError(handleError(appError))
    } finally {
      setSubmittingFeedback(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Performance Analytics</h1>
          
          {/* Student Selection */}
          <div className="mt-6 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 
                    ${selectedStudent === student.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                  <p className="font-medium text-gray-900">{student.full_name}</p>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {analytics && selectedStudent && (
          <div className="space-y-8">
            {/* Performance Overview */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Average</h3>
                      <p className="text-4xl font-bold text-blue-600">
                        {analytics.averageScore.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Strong Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {analytics.strongTopics.map(topic => (
                          <span key={topic} 
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
                      <div className="flex flex-wrap gap-2">
                        {analytics.weakTopics.map(topic => (
                          <span key={topic} 
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analytics.testResults.map((test) => (
                    <div key={test.testId} 
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{test.testName}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Score</span>
                          <span className="font-medium">
                            {test.marksObtained}/{test.totalMarks}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Percentage</span>
                          <span className="font-medium">
                            {((test.marksObtained / test.totalMarks) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Percentage</span>
                          <span className="font-medium">
                            {((test.marksObtained / test.totalMarks) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Questions Attempted</span>
                          <span className="font-medium">{test.questionsAttempted}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Provide Feedback</h2>
                <div className="space-y-4">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                      resize-none"
                    placeholder="Enter your feedback for the student..."
                  />
                  <button
                    onClick={submitFeedback}
                    disabled={submittingFeedback || !feedback.trim()}
                    className={`px-6 py-3 rounded-lg text-white font-medium transition-colors
                      ${submittingFeedback || !feedback.trim()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}