'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../app/context/authcontext'
import { supabase } from '../../app/utils/supabase'

interface Question {
  id: string
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
  name: string
  total_marks: number
  created_at: string
  updated_at: string
  questions?: Question[]
}

export default function ExistingTests() {
  const { user } = useAuth()
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) {
      fetchTests()
    }
  }, [user])

  const fetchTests = async () => {
    try {
      setLoading(true)
      
      // Fetch tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false })

      if (testsError) throw testsError

      // Fetch questions for each test
      const testsWithQuestions = await Promise.all(
        testsData.map(async (test) => {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('test_id', test.id)
            .order('created_at', { ascending: true })

          if (questionsError) throw questionsError

          // Collect unique topics
          const testTopics = [...new Set(questions.map((q: Question) => q.topic))]
          setTopics(prev => [...new Set([...prev, ...testTopics])])

          return {
            ...test,
            questions
          }
        })
      )

      setTests(testsWithQuestions)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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
        <div className="w-8 h-8 border-t-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-3xl font-semibold text-gray-900">Your Tests</h2>
          <p className="mt-2 text-gray-500">Manage and review your created tests</p>
          
          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Topics</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="divide-y divide-gray-100">
          {filteredTests.map(test => (
            <div key={test.id} className="transition-all duration-200 hover:bg-gray-50">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setExpandedTest(expandedTest === test.id ? null : test.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{test.name}</h3>
                    <div className="mt-1 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Total Marks: {test.total_marks}
                      </span>
                      <span className="text-sm text-gray-500">
                        Questions: {test.questions?.length || 0}
                      </span>
                      <span className="text-sm text-gray-500">
                        Created: {new Date(test.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="transform transition-transform duration-200">
                    <svg
                      className={`w-6 h-6 text-gray-400 ${
                        expandedTest === test.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Questions View */}
              {expandedTest === test.id && (
                <div className="px-6 pb-6">
                  <div className="space-y-6">
                    {test.questions?.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">
                                {index + 1}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {question.topic}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {question.marks} marks
                              </span>
                            </div>
                            
                            <p className="mt-3 text-gray-900 font-medium">
                              {question.question_text}
                            </p>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {['A', 'B', 'C', 'D'].map((option) => (
                                <div
                                  key={option}
                                  className={`p-3 rounded-lg ${
                                    question.correct_option === option
                                      ? 'bg-green-50 border-2 border-green-200'
                                      : 'bg-gray-50 border border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-medium ${
                                      question.correct_option === option
                                        ? 'text-green-700'
                                        : 'text-gray-700'
                                    }`}>
                                      {option}.
                                    </span>
                                    <span className={
                                      question.correct_option === option
                                        ? 'text-green-700'
                                        : 'text-gray-600'
                                    }>
                                      {question[`option_${option.toLowerCase()}` as keyof Question]}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredTests.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No tests found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  )
}