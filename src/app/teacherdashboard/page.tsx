'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../context/authcontext'
import { useRouter } from 'next/navigation'
import TeacherNavbar from '../../components/teacherdashboard/navbar'
import ContentGenerator from '../../components/pdf_generator'
import { supabase } from '../utils/supabase'
import ExistingTests from '../../components/teacherdashboard/testshow'
import StudentPerformanceAnalytics from '../../components/teacherdashboard/markslist'

// Define interfaces for our form data
interface QuestionForm {
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  marks: number
  topic: string
}

interface TestForm {
  name: string
  total_marks: number
  questions: QuestionForm[]
}

const initialQuestionState: QuestionForm = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'A',
  marks: 1,
  topic: ''
}

export default function TeacherDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  
  // Test creation states
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'test' | 'questions'>('test')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showTestCreation, setShowTestCreation] = useState(false)
  
  const [testForm, setTestForm] = useState<TestForm>({
    name: '',
    total_marks: 0,
    questions: []
  })
  
  const [currentQuestion, setCurrentQuestion] = useState<QuestionForm>(initialQuestionState)

  // Protect the route and redirect non-teachers
  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state with an enhanced loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show dashboard content only for authenticated teachers
  if (!user || user.role !== 'teacher') {
    return null
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      setError('You must be logged in to create a test')
      return
    }
    
    setCurrentStep('questions')
  }

  const handleQuestionAdd = () => {
    // Validate current question
    if (!currentQuestion.question_text || !currentQuestion.topic) {
      setError('Please fill in all required fields')
      return
    }

    setTestForm(prev => ({
      ...prev,
      questions: [...prev.questions, currentQuestion],
      total_marks: prev.total_marks + currentQuestion.marks
    }))

    setCurrentQuestion(initialQuestionState)
    setSuccess('Question added successfully')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleFinalSubmit = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user?.id) {
        throw new Error('You must be logged in to create a test')
      }

      if (testForm.questions.length === 0) {
        throw new Error('Please add at least one question')
      }

      // Create test
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .insert([{
          teacher_id: user.id,
          name: testForm.name,
          total_marks: testForm.total_marks
        }])
        .select()
        .single()

      if (testError) throw testError

      // Create questions
      const questionsToInsert = testForm.questions.map(q => ({
        ...q,
        test_id: testData.id,
        teacher_id: user.id
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) throw questionsError

      setSuccess('Test created successfully!')
      // Reset form
      setTestForm({ name: '', total_marks: 0, questions: [] })
      setCurrentStep('test')
      setShowTestCreation(false)
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navbar */}
      <TeacherNavbar />

      {/* Main Content with proper spacing */}
      <div className="pt-8 pb-16">
        {/* Content Generator Section */}
        <div className="mb-12">
          <ContentGenerator />
        </div>

        {/* Test Creation Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <button
            onClick={() => setShowTestCreation(!showTestCreation)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showTestCreation ? 'Hide Test Creation' : 'Create New Test'}
          </button>
        </div>

        {/* Test Creation Section */}
        {showTestCreation && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
                  {success}
                </div>
              )}

              {currentStep === 'test' ? (
                <form onSubmit={handleTestSubmit} className="p-6 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Test</h2>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Test Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={testForm.name}
                      onChange={e => setTestForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    Continue to Add Questions
                  </button>
                </form>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Add Questions to: {testForm.name}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Total Questions: {testForm.questions.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Question Text
                      </label>
                      <textarea
                        value={currentQuestion.question_text}
                        onChange={e => setCurrentQuestion(prev => ({
                          ...prev,
                          question_text: e.target.value
                        }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        rows={3}
                        required
                      />
                    </div>

                    {['A', 'B', 'C', 'D'].map((option) => (
                      <div key={option}>
                        <label className="block text-sm font-medium text-gray-700">
                          Option {option}
                        </label>
                        <input
                          type="text"
                          value={currentQuestion[`option_${option.toLowerCase()}` as keyof QuestionForm] as string}
                          onChange={e => setCurrentQuestion(prev => ({
                            ...prev,
                            [`option_${option.toLowerCase()}`]: e.target.value
                          }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          required
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Correct Option
                        </label>
                        <select
                          value={currentQuestion.correct_option}
                          onChange={e => setCurrentQuestion(prev => ({
                            ...prev,
                            correct_option: e.target.value as 'A' | 'B' | 'C' | 'D'
                          }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        >
                          {['A', 'B', 'C', 'D'].map(option => (
                            <option key={option} value={option}>
                              Option {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Marks
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={currentQuestion.marks}
                          onChange={e => setCurrentQuestion(prev => ({
                            ...prev,
                            marks: parseInt(e.target.value) || 1
                          }))}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Topic
                      </label>
                      <input
                        type="text"
                        value={currentQuestion.topic}
                        onChange={e => setCurrentQuestion(prev => ({
                          ...prev,
                          topic: e.target.value
                        }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleQuestionAdd}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        disabled={isLoading}
                      >
                        Add Question
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalSubmit}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={isLoading || testForm.questions.length === 0}
                      >
                        {isLoading ? 'Creating Test...' : 'Submit Test'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teacher Profile Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                Teacher Profile Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your personal and account details
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {/* Full Name */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-slate-50 transition-colors duration-150">
                <dt className="text-sm font-medium text-slate-500">Full name</dt>
                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {user.full_name}
                </dd>
              </div>

              {/* Email - Continuing from previous artifact */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-slate-50 transition-colors duration-150">
                <dt className="text-sm font-medium text-slate-500">Email address</dt>
                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {user.email}
                </dd>
              </div>

              {/* Role */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-slate-50 transition-colors duration-150">
                <dt className="text-sm font-medium text-slate-500">Role</dt>
                <dd className="text-sm text-slate-900 sm:col-span-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Teacher
                  </span>
                </dd>
              </div>

              {/* Account Created */}
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 hover:bg-slate-50 transition-colors duration-150">
                <dt className="text-sm font-medium text-slate-500">Account created</dt>
                <dd className="text-sm text-slate-900 sm:col-span-2">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-5 bg-slate-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => router.push('/settings')}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
                <button
                  onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          <div className="mb-12">
  <ExistingTests />
</div>
<StudentPerformanceAnalytics />
        </main>
      </div>
    </div>
  )
}