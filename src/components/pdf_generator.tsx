'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { 
  Search,
  Loader2,
  BookOpen,
  ClipboardList,
  FileQuestion,
  Sparkles,
  BookMarked
} from 'lucide-react'

// Types remain the same
interface MCQQuestion {
  question: string
  options: string[]
  correct_answer: string
  explanation: string
}

interface CaseStudy {
  scenario: string
  question: string
  answer: string
}

interface EducationalContent {
  main_content: string
  mcq_questions: MCQQuestion[]
  case_studies: CaseStudy[]
}

export default function ContentGenerator() {
  const [topic, setTopic] = useState('')
  const [context, setContext] = useState('')
  const [content, setContent] = useState<EducationalContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // All existing functions remain the same
  const generateContent = async (searchData: { topic: string; context?: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setContent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error generating content:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = (type: 'main' | 'mcq' | 'case-study') => {
    if (!content) return

    const doc = new jsPDF()
    let yPos = 20
    const lineHeight = 7
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - 2 * margin

    const addWrappedText = (text: string, y: number) => {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, margin, y)
      return y + (lines.length * lineHeight)
    }

    doc.setFontSize(16)
    doc.text(`${topic} - ${type.toUpperCase()}`, margin, yPos)
    yPos += 15

    doc.setFontSize(12)

    switch (type) {
      case 'main':
        yPos = addWrappedText(content.main_content, yPos)
        break

      case 'mcq':
        content.mcq_questions.forEach((mcq, index) => {
          yPos = addWrappedText(`Q${index + 1}: ${mcq.question}`, yPos)
          yPos += lineHeight
          
          mcq.options.forEach((option, optIndex) => {
            yPos = addWrappedText(`${String.fromCharCode(65 + optIndex)}) ${option}`, yPos)
          })
          
          yPos = addWrappedText(`Correct Answer: ${mcq.correct_answer}`, yPos)
          yPos = addWrappedText(`Explanation: ${mcq.explanation}`, yPos)
          yPos += lineHeight * 2

          if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage()
            yPos = margin
          }
        })
        break

      case 'case-study':
        content.case_studies.forEach((cs, index) => {
          yPos = addWrappedText(`Case Study ${index + 1}:`, yPos)
          yPos += lineHeight
          yPos = addWrappedText(`Scenario: ${cs.scenario}`, yPos)
          yPos += lineHeight
          yPos = addWrappedText(`Question: ${cs.question}`, yPos)
          yPos += lineHeight
          yPos = addWrappedText(`Answer: ${cs.answer}`, yPos)
          yPos += lineHeight * 2

          if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage()
            yPos = margin
          }
        })
        break
    }

    doc.save(`${topic}-${type}.pdf`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    
    await generateContent({ 
      topic: topic.trim(),
      context: context.trim() || undefined
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookMarked className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">AI EDUCATIONAL CONTENT GENERATOR</h1>
          <p className="text-slate-600 dark:text-slate-300">Create comprehensive learning materials with just a few clicks</p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="space-y-2">
              <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Topic
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter a topic (e.g., Photosynthesis)"
                />
                <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="context" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Additional Context (Optional)
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add any specific focus or requirements"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Generating Content...' : 'Generate Content'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800">
            <p className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Content Display and Download Section */}
        {content && (
          <div className="space-y-8">
            {/* Download Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <button
                onClick={() => generatePDF('main')}
                className="flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Download Main Content
              </button>
              <button
                onClick={() => generatePDF('mcq')}
                className="flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
              >
                <ClipboardList className="h-5 w-5 mr-2" />
                Download MCQs
              </button>
              <button
                onClick={() => generatePDF('case-study')}
                className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <FileQuestion className="h-5 w-5 mr-2" />
                Download Case Studies
              </button>
            </div>

            {/* Content Preview */}
            <div className="space-y-8">
              {/* Main Content */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Main Content
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  {content.main_content.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-slate-700 dark:text-slate-300 mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* MCQs */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <ClipboardList className="h-6 w-6 mr-2 text-purple-600 dark:text-purple-400" />
                  Multiple Choice Questions
                </h2>
                <div className="space-y-8">
                  {content.mcq_questions.map((mcq, index) => (
                    <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0">
                      <p className="font-medium text-slate-900 dark:text-white mb-4">
                        {index + 1}. {mcq.question}
                      </p>
                      <ul className="space-y-3 mb-4">
                        {mcq.options.map((option, optIndex) => (
                          <li
                            key={optIndex}
                            className={`pl-4 ${
                              option === mcq.correct_answer
                                ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        {mcq.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Studies */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                  <FileQuestion className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
                  Case Studies
                </h2>
                <div className="space-y-10">
                  {content.case_studies.map((cs, index) => (
                    <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-8 last:border-0">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                        Case Study {index + 1}
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">Scenario:</h4>
                          <p className="text-slate-700 dark:text-slate-300">{cs.scenario}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">Question:</h4>
                          <p className="text-slate-700 dark:text-slate-300">{cs.question}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white mb-2">Answer:</h4>
                          <p className="text-slate-700 dark:text-slate-300">{cs.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}