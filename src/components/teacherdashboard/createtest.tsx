'use client'

import { useState } from 'react'
import { useAuth } from '../../app/context/authcontext'
import { supabase } from '../../app/utils/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

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

// Custom error type for application-specific errors
interface ApplicationError {
  message: string
  type: 'validation' | 'auth' | 'database'
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

const TestCreation: React.FC = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<'test' | 'questions'>('test')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [testForm, setTestForm] = useState<TestForm>({
    name: '',
    total_marks: 0,
    questions: []
  })
  
  const [currentQuestion, setCurrentQuestion] = useState<QuestionForm>(initialQuestionState)

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      setError('You must be logged in to create a test')
      return
    }
    
    setCurrentStep('questions')
  }

  const validateQuestion = (question: QuestionForm): ApplicationError | null => {
    if (!question.question_text.trim()) {
      return { message: 'Question text is required', type: 'validation' }
    }
    if (!question.topic.trim()) {
      return { message: 'Topic is required', type: 'validation' }
    }
    if ([question.option_a, question.option_b, question.option_c, question.option_d]
        .some(option => !option.trim())) {
      return { message: 'All options must be filled', type: 'validation' }
    }
    return null
  }

  const handleQuestionAdd = () => {
    const validationError = validateQuestion(currentQuestion)
    if (validationError) {
      setError(validationError.message)
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
        throw { 
          message: 'You must be logged in to create a test',
          type: 'auth'
        } as ApplicationError
      }

      if (testForm.questions.length === 0) {
        throw { 
          message: 'Please add at least one question',
          type: 'validation'
        } as ApplicationError
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

      if (testError) {
        throw testError
      }

      // Create questions
      const questionsToInsert = testForm.questions.map(q => ({
        ...q,
        test_id: testData.id,
        teacher_id: user.id
      }))

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        throw questionsError
      }

      setSuccess('Test created successfully!')
      // Reset form
      setTestForm({ name: '', total_marks: 0, questions: [] })
      setCurrentStep('test')
      
    } catch (error) {
      // Handle different types of errors
      if ((error as ApplicationError).type) {
        const appError = error as ApplicationError
        setError(appError.message)
      } else if ((error as PostgrestError).code) {
        const pgError = error as PostgrestError
        setError(`Database error: ${pgError.message}`)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
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
            <form onSubmit={handleTestSubmit} className="space-y-6">
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
            <div className="space-y-6">
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
    </div>
  )
}

export default TestCreation