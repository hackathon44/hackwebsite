'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/authcontext'
import { supabase } from '@/app/utils/supabase'
import { ArrowLeft, ArrowRight, Search, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: string
  test_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  marks: number
  topic: string
  created_at: string
}

interface Test {
  id: string
  teacher_id: string
  name: string
  total_marks: number
  created_at: string
  updated_at: string
  questions?: Question[]
}

interface TestAttempt {
  test_id: string
  attempted: boolean
  score?: number
}

export default function StudentTests() {
  const { user } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [topics, setTopics] = useState<string[]>([])
  const [attempts, setAttempts] = useState<TestAttempt[]>([])

  // Test taking states
  const [activeTest, setActiveTest] = useState<Test | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchTestsAndAttempts()
    }
  }, [user])

  const fetchTestsAndAttempts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false })

      if (testsError) throw testsError

      // Fetch questions for each test
      const testsWithQuestions = await Promise.all(
        testsData.map(async (test) => {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('test_id', test.id)

          if (questionsError) throw questionsError

          const testTopics = questions.map((q: Question) => q.topic)
          setTopics(prev => Array.from(new Set([...prev, ...testTopics])))

          return {
            ...test,
            questions
          }
        })
      )

      // Fetch student's attempts
      if (user?.id) {
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('student_attempts')
          .select('test_id, is_correct, marks_obtained')
          .eq('student_id', user.id)

        if (attemptsError) throw attemptsError

        const attemptMap = attemptsData.reduce((acc: Record<string, TestAttempt>, curr) => {
          if (!acc[curr.test_id]) {
            acc[curr.test_id] = {
              test_id: curr.test_id,
              attempted: true,
              score: curr.marks_obtained
            }
          }
          return acc
        }, {})

        setAttempts(Object.values(attemptMap))
      }

      setTests(testsWithQuestions)
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const startTest = (test: Test) => {
    setActiveTest(test)
    setCurrentQuestionIndex(0)
    setUserAnswers({})
  }

  const handleAnswer = (questionId: string, option: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: option
    }))
  }

  const submitTest = async () => {
    if (!activeTest || !user?.id || submitting) return

    try {
      setSubmitting(true)
      const submissions = activeTest.questions?.map(question => ({
        student_id: user.id,
        test_id: activeTest.id,
        question_id: question.id,
        selected_option: userAnswers[question.id] || null,
        is_correct: userAnswers[question.id] === question.correct_option,
        marks_obtained: userAnswers[question.id] === question.correct_option ? question.marks : 0
      })) || []

      const { error: submissionError } = await supabase
        .from('student_attempts')
        .insert(submissions)

      if (submissionError) throw submissionError

      await fetchTestsAndAttempts()
      setActiveTest(null)
      setUserAnswers({})
    } catch (err) {
      console.error('Error submitting test:', err)
      setError('Failed to submit test')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTopic = selectedTopic === 'all' || 
      test.questions?.some(q => q.topic === selectedTopic)
    return matchesSearch && matchesTopic
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (activeTest && activeTest.questions) {
    const currentQuestion = activeTest.questions[currentQuestionIndex]
    const totalQuestions = activeTest.questions.length
    const answeredQuestions = Object.keys(userAnswers).length

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Test Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-black">{activeTest.name}</h2>
              <div className="flex items-center gap-4">
                <span className="text-black">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-black">
                  Answered: {answeredQuestions}/{totalQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Question Section */}
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-xl text-black font-medium">{currentQuestion.question_text}</p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all
                    ${userAnswers[currentQuestion.id] === option
                      ? 'border-blue-500 bg-blue-50 text-black'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-black'
                    }`}
                >
                  <span className="font-medium">{option}.</span>{' '}
                  {currentQuestion[`option_${option.toLowerCase()}` as keyof Question]}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 disabled:text-gray-400"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <button
                  onClick={submitTest}
                  disabled={submitting}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                    transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed
                    ${answeredQuestions < totalQuestions ? 'opacity-50' : ''}`}
                >
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {answeredQuestions < totalQuestions && currentQuestionIndex === totalQuestions - 1 && (
              <p className="text-red-500 text-center mt-4">
                Please answer all questions before submitting
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-black">Available Tests</h2>
          <p className="mt-2 text-gray-600">View and attempt your tests</p>

          {/* Search and Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="sm:w-48 px-4 py-2 rounded-lg border-2 border-gray-200 
                focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="all">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tests List */}
        <div className="divide-y divide-gray-200">
          {filteredTests.map(test => {
            const attempt = attempts.find(a => a.test_id === test.id)
            
            return (
              <div 
                key={test.id} 
                className="p-6 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium text-black">{test.name}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-gray-600 flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {test.questions?.length || 0} Questions
                      </span>
                      <span className="text-gray-600">
                        Total Marks: {test.total_marks}
                      </span>
                      {attempt?.attempted && (
                        <span className="text-gray-600 flex items-center gap-1">
                          {attempt.score && attempt.score >= (test.total_marks * 0.6) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          Score: {attempt.score} / {test.total_marks}
                        </span>
                      )}
                    </div>
                    {test.questions && test.questions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(test.questions.map(q => q.topic))).map(topic => (
                          <span 
                            key={topic}
                            className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {!attempt?.attempted && (
                    <button 
                      onClick={() => startTest(test)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                        transition-colors whitespace-nowrap"
                    >
                      Start Test
                    </button>
                  )}
                </div>
              </div>
            )
          })}

{filteredTests.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No tests found matching your criteria
            </div>
          )}
        </div>

        {/* Summary Section - Shows test statistics */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-600">Total Tests</h4>
              <p className="text-2xl font-semibold text-black mt-1">
                {tests.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-600">Tests Attempted</h4>
              <p className="text-2xl font-semibold text-black mt-1">
                {attempts.length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-600">Available Tests</h4>
              <p className="text-2xl font-semibold text-black mt-1">
                {tests.length - attempts.length}
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-black mb-4">Test Instructions</h3>
          <div className="space-y-3 text-gray-600">
            <p>• Click "Start Test" to begin a new test attempt</p>
            <p>• Answer all questions to complete the test</p>
            <p>• Use the Previous/Next buttons to navigate between questions</p>
            <p>• Your answers are saved automatically as you progress</p>
            <p>• Submit your test when you've answered all questions</p>
          </div>
        </div>
      </div>

      {/* Pagination or Load More - If needed in the future */}
      {tests.length > 10 && (
        <div className="mt-6 flex justify-center">
          <button 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            onClick={() => console.log('Load more tests')}
          >
            Load More Tests
          </button>
        </div>
      )}
    </div>
  )
}