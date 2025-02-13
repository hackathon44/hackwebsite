'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../app/utils/supabase'

interface StudentAnalytics {
  studentId: string
  studentName: string
  testResults: {
    testId: string
    testName: string
    totalMarks: number
    marksObtained: number
    topics: {
      [key: string]: {
        total: number
        correct: number
        percentage: number
      }
    }
  }[]
  weakTopics: string[]
  strongTopics: string[]
  averageScore: number
}

interface Feedback {
  feedbackId: number
  studentId: string
  teacherId: string
  feedbackText: string
  acknowledged: boolean
  createdAt: string
}

export default function StudentPerformanceAnalytics() {
  const [analytics, setAnalytics] = useState<StudentAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newFeedback, setNewFeedback] = useState<{ [key: string]: string }>({})
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch all student attempts with related data
      const { data: attempts, error: attemptsError } = await supabase
        .from('student_attempts')
        .select(`
          *,
          students:student_id (*),
          tests:test_id (*),
          questions:question_id (*)
        `)

      if (attemptsError) throw attemptsError

      // Process the data to calculate analytics
      const analyticsMap = new Map<string, StudentAnalytics>()

      attempts?.forEach((attempt) => {
        const studentId = attempt.student_id
        const testId = attempt.test_id
        const question = attempt.questions
        const test = attempt.tests

        if (!analyticsMap.has(studentId)) {
          analyticsMap.set(studentId, {
            studentId,
            studentName: attempt.students.full_name,
            testResults: [],
            weakTopics: [],
            strongTopics: [],
            averageScore: 0
          })
        }

        const studentData = analyticsMap.get(studentId)!
        let testResult = studentData.testResults.find(t => t.testId === testId)

        if (!testResult) {
          testResult = {
            testId,
            testName: test.name,
            totalMarks: test.total_marks,
            marksObtained: 0,
            topics: {}
          }
          studentData.testResults.push(testResult)
        }

        // Update topic statistics
        if (!testResult.topics[question.topic]) {
          testResult.topics[question.topic] = {
            total: 0,
            correct: 0,
            percentage: 0
          }
        }

        const topicStats = testResult.topics[question.topic]
        topicStats.total += question.marks
        if (attempt.is_correct) {
          topicStats.correct += question.marks
          testResult.marksObtained += attempt.marks_obtained
        }
        topicStats.percentage = (topicStats.correct / topicStats.total) * 100
      })

      // Calculate weak and strong topics
      analyticsMap.forEach(student => {
        const topicPerformance: { [key: string]: number[] } = {}
        
        student.testResults.forEach(test => {
          Object.entries(test.topics).forEach(([topic, stats]) => {
            if (!topicPerformance[topic]) {
              topicPerformance[topic] = []
            }
            topicPerformance[topic].push(stats.percentage)
          })
        })

        // Calculate average performance per topic
        const avgTopicPerformance = Object.entries(topicPerformance).map(([topic, percentages]) => ({
          topic,
          average: percentages.reduce((a, b) => a + b, 0) / percentages.length
        }))

        // Sort topics by performance
        avgTopicPerformance.sort((a, b) => b.average - a.average)

        student.strongTopics = avgTopicPerformance
          .filter(t => t.average >= 70)
          .map(t => t.topic)
        
        student.weakTopics = avgTopicPerformance
          .filter(t => t.average < 50)
          .map(t => t.topic)

        // Calculate overall average score
        student.averageScore = student.testResults.reduce((acc, test) => 
          acc + (test.marksObtained / test.totalMarks) * 100, 0
        ) / student.testResults.length
      })

      setAnalytics(Array.from(analyticsMap.values()))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          student_id: studentId,
          teacher_id: supabase.auth.getUser(),
          feedback_text: newFeedback[studentId],
          acknowledged: false
        })

      if (error) throw error

      // Clear the feedback input
      setNewFeedback(prev => ({
        ...prev,
        [studentId]: ''
      }))

      // Show success message or update UI
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-black">Student Performance Analytics</h2>
      
      {analytics.map((student) => (
        <div key={student.studentId} className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-black">
              {student.studentName}
            </h3>
            <span className="text-lg font-medium text-black">
              Overall Average: {student.averageScore.toFixed(1)}%
            </span>
          </div>

          {/* Topic Analysis */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-black mb-2">Strong Topics:</h4>
              <ul className="list-disc list-inside text-black">
                {student.strongTopics.map(topic => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-black mb-2">Topics Needing Improvement:</h4>
              <ul className="list-disc list-inside text-black">
                {student.weakTopics.map(topic => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Test Results */}
          <div className="mb-4">
            <h4 className="font-medium text-black mb-2">Test Results:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {student.testResults.map((test) => (
                <div key={test.testId} className="border rounded p-3">
                  <p className="font-medium text-black">{test.testName}</p>
                  <p className="text-black">
                    Score: {test.marksObtained}/{test.totalMarks} (
                    {((test.marksObtained / test.totalMarks) * 100).toFixed(1)}%)
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mt-4">
            <h4 className="font-medium text-black mb-2">Provide Feedback:</h4>
            <div className="flex gap-4">
              <textarea
                value={newFeedback[student.studentId] || ''}
                onChange={(e) => setNewFeedback(prev => ({
                  ...prev,
                  [student.studentId]: e.target.value
                }))}
                className="flex-1 border rounded p-2 text-black"
                placeholder="Enter feedback for student..."
                rows={2}
              />
              <button
                onClick={() => submitFeedback(student.studentId)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}