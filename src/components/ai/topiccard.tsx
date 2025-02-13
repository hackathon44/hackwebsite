'use client'

interface TopicCardProps {
  topic: string
  currentLevel: string
  progress: number
  isLocked: boolean
  onStartQuiz: () => void
}

export default function TopicCard({ 
  topic, 
  currentLevel, 
  progress, 
  isLocked,
  onStartQuiz 
}: TopicCardProps) {
  // Topic icons mapping
  const topicIcons = {
    'DSA': '🔍',
    'Fullstack': '💻',
    'AI': '🤖',
    'Operating System': '⚙️'
  }

  return (
    <div className="relative p-6 rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="absolute top-4 right-4">
        {isLocked ? (
          <span className="text-2xl">🔒</span>
        ) : (
          <span className="text-2xl">{topicIcons[topic as keyof typeof topicIcons]}</span>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{topic}</h3>
      <p className="text-sm text-gray-600 mb-4">Current Level: {currentLevel}</p>
      
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{progress}% Complete</p>
      </div>

      <button
        onClick={onStartQuiz}
        disabled={isLocked}
        className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
          ${isLocked 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
      >
        {isLocked ? 'Complete Previous Level' : 'Start Quiz'}
      </button>
    </div>
  )
}