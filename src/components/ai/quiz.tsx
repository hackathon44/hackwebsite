'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/authcontext'
import { supabase } from '@/app/utils/supabase'
import { XCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react'

interface Question {
  question_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: string
}

interface QuizProps {
  topic: string
  level: string
  onComplete: (score: number) => void
  onClose: () => void
}

export default function Quiz({ topic, level, onComplete, onClose }: QuizProps) {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_questions')
          .select('*')
          .eq('topic', topic)
          .eq('level', level)
        
        if (error) throw error
        
        if (!data || data.length === 0) {
          setError('No questions available for this topic and level')
          return
        }
        
        const shuffledQuestions = [...data].sort(() => Math.random() - 0.5)
        setQuestions(shuffledQuestions)
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError('Failed to load questions. Please try again.')
      }
    }
    
    fetchQuestions()
  }, [topic, level])

  const handleAnswer = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      let correctAnswers = 0
      const attempts = []
      
      for (const question of questions) {
        const selectedAnswer = selectedAnswers[question.question_id]
        const isCorrect = selectedAnswer === question.correct_option
        if (isCorrect) correctAnswers++
        
        attempts.push({
          student_id: user.id,
          question_id: question.question_id,
          selected_option: selectedAnswer,
          is_correct: isCorrect,
          attempted_at: new Date().toISOString()
        })
      }
      
      const score = (correctAnswers / questions.length) * 100

      const { error: attemptsError } = await supabase
        .from('student_answer')
        .insert(attempts)

      if (attemptsError) throw attemptsError

      const { error: progressError } = await supabase
        .from('student_progress')
        .upsert({
          student_id: user.id,
          topic,
          level,
          score,
          completed: score >= 70,
          last_attempted: new Date().toISOString()
        })

      if (progressError) throw progressError

      setShowResults(true)
      onComplete(score)
      
    } catch (error: unknown) {
      console.error('Error submitting quiz:', error)
      setError('Failed to submit quiz. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
        <div className="flex items-center justify-center min-h-48">
          <div className="text-center">
            <div className="text-red-500 mb-6 text-lg">{error}</div>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-black text-white rounded-full font-medium 
                hover:bg-gray-800 transition-all duration-300 ease-in-out"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent" />
      </div>
    )
  }

  if (showResults) {
    const score = (Object.values(selectedAnswers).filter((answer, index) => 
      answer === questions[index].correct_option
    ).length / questions.length) * 100

    return (
      <div className="p-8 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
        <h3 className="text-3xl font-semibold mb-8 text-black">Quiz Results</h3>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-medium text-black">Your Score</span>
            <span className="text-3xl font-semibold text-black">{score.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-700 ease-out ${
                score >= 70 ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        <p className="text-lg mb-8 text-gray-700 text-center">
          {score >= 70 
            ? "🎉 Excellent work! You've mastered this level!" 
            : "Keep going! You're getting closer to mastery."}
        </p>
        <button
          onClick={onClose}
          className="w-full py-4 bg-black text-white rounded-full font-medium 
            hover:bg-gray-800 transition-all duration-300 ease-in-out"
        >
          Continue Learning
        </button>
      </div>
    )
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <div className="p-8 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-semibold text-black mb-2">
            Question {currentQuestion + 1}
          </h3>
          <p className="text-sm text-gray-500">
            {topic} • Level {level} • {currentQuestion + 1}/{questions.length}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-8">
        <p className="text-xl text-black mb-6 leading-relaxed">
          {currentQuestionData.question_text}
        </p>
        
        <div className="space-y-4">
          {['A', 'B', 'C', 'D'].map((option) => {
            const isSelected = selectedAnswers[currentQuestionData.question_id] === option
            return (
              <button
                key={option}
                onClick={() => handleAnswer(currentQuestionData.question_id, option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-black bg-gray-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center
                    ${isSelected ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                  <span className="text-lg text-black">
                    {currentQuestionData[`option_${option.toLowerCase()}` as keyof Question]}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-black 
            disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </button>

        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(selectedAnswers).length !== questions.length}
            className="px-8 py-3 bg-black text-white rounded-full font-medium
              hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed 
              transition-all duration-300 ease-in-out"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-black transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        )}
      </div>

      <div className="mt-8">
        <div className="flex justify-center space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300
                ${index === currentQuestion
                  ? 'bg-black w-4'
                  : selectedAnswers[questions[index].question_id]
                  ? 'bg-gray-400'
                  : 'bg-gray-200'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}