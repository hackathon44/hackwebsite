'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../app/utils/supabase'
import { useAuth } from '../../app/context/authcontext'
import { PostgrestError } from '@supabase/supabase-js'

// Define TypeScript interfaces for our data structures
interface TeacherProfile {
  id: string
  full_name: string
  email: string
}

interface FeedbackItem {
  feedback_id: number
  teacher_id: string
  feedback_text: string
  acknowledged: boolean
  created_at: string
  teacher?: TeacherProfile
}

export default function StudentFeedback() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!user?.id) {
        setError('User not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // First fetch the feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false })

        if (feedbackError) throw feedbackError

        // Then fetch teacher details for each feedback item
        const teacherIds = [...new Set(feedbackData.map(f => f.teacher_id))]
        const { data: teachersData, error: teachersError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email')
          .in('id', teacherIds)

        if (teachersError) throw teachersError

        // Create a map of teacher details for quick lookup
        const teacherMap = new Map(teachersData.map(t => [t.id, t]))

        // Combine feedback with teacher details
        const enrichedFeedback = feedbackData.map(feedback => ({
          ...feedback,
          teacher: teacherMap.get(feedback.teacher_id)
        }))

        setFeedback(enrichedFeedback)
      } catch (err) {
        const error = err as PostgrestError
        console.error('Error fetching feedback:', error)
        setError(error.message || 'An error occurred while fetching feedback')
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [user?.id]) // fetchFeedback is now defined inside useEffect

  const acknowledgeFeedback = async (feedbackId: number) => {
    try {
      const { error: updateError } = await supabase
        .from('feedback')
        .update({ acknowledged: true })
        .eq('feedback_id', feedbackId)

      if (updateError) throw updateError

      // Update local state
      setFeedback(prev => prev.map(f => 
        f.feedback_id === feedbackId ? { ...f, acknowledged: true } : f
      ))
    } catch (err) {
      const error = err as PostgrestError
      console.error('Error acknowledging feedback:', error)
      setError(error.message || 'An error occurred while acknowledging feedback')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-black mb-8">Your Feedback</h1>

        {feedback.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-lg text-gray-600">No feedback received yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {feedback.map((item) => (
              <div 
                key={item.feedback_id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 
                  ${item.acknowledged ? 'border-green-500' : 'border-blue-500'}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-1">
                        {item.teacher?.full_name || 'Teacher'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                    {!item.acknowledged && (
                      <button
                        onClick={() => acknowledgeFeedback(item.feedback_id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg 
                          hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-black whitespace-pre-wrap">{item.feedback_text}</p>
                  </div>

                  {item.acknowledged && (
                    <div className="mt-4 flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M5 13l4 4L19 7"/>
                      </svg>
                      Read
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}