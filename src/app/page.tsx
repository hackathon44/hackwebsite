'use client'
import Link from 'next/link'
import Navbar from '../components/navbar'
import { BookOpen, Brain, FileText, Users } from 'lucide-react'
import { useEffect } from 'react'

export default function Home() {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-purple-400" />,
      title: 'Smart Lesson Planning',
      description: 'Generate AI-powered lesson plans customized to your curriculum'
    },
    {
      icon: <Users className="h-6 w-6 text-purple-400" />,
      title: 'Collaborative Teaching',
      description: 'Share resources and collaborate with fellow educators in real time'
    },
    {
      icon: <Brain className="h-6 w-6 text-purple-400" />,
      title: 'AI-Powered Insights',
      description: 'Analyze student engagement and optimize teaching strategies'
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-400" />,
      title: 'Automated Reports',
      description: 'Generate performance reports with actionable insights for students'
    }
  ]

  const detailedFeatures = [
    {
      title: 'Modern Dashboard Features',
      items: [
        'Modern responsive dashboard for teachers and students',
        'Dashboard easily accessible using domain link [AWS-hosted]',
        'Modern and interactive dashboard interface'
      ]
    },
    {
      title: 'AI Capabilities',
      items: [
        'Teacher can use AI Model Online and Offline',
        'Generate PDF, MCQ, and variety of questions automatically',
        'Multi-Language Support for diverse classrooms'
      ]
    },
    {
      title: 'Student Features',
      items: [
        'Students can attend tests and review results online',
        'AI automatically suggests personalized learning materials',
        'Automated grading system with customizable marking schemes'
      ]
    },
    {
      title: 'Technical Infrastructure',
      items: [
        'Built with Next.js and React Native',
        'TypeScript for robust development',
        'Fully GitHub secure deployment',
        'AWS and Render cloud infrastructure',
        'Supabase database integration'
      ]
    }
  ]

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js'
    script.async = true
    document.body.appendChild(script)

    script.onload = () => {
      // @ts-expect-error
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 80 },
          color: { value: '#9333ea' },
          opacity: { value: 0.5 },
          size: { value: 3 },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#9333ea',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 2
          }
        }
      })
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features')
    featuresSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div id="particles-js" className="fixed inset-0 pointer-events-none" />
      <Navbar />
      
      <section className="pt-16 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-6 animate-pulse">
              Revolutionizing Education with AI
            </h1>
            <p className="text-lg text-purple-200 mb-8">
              Empower teachers with AI-driven tools for lesson planning, student engagement, 
              and real-time performance insights. Simplify teaching and maximize impact.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-md text-center font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)]"
              >
                Get Started
              </Link>
              <button
                onClick={scrollToFeatures}
                className="bg-black/30 text-purple-400 border border-purple-500 px-8 py-3 rounded-md text-center font-medium hover:bg-purple-900/20 transition-all duration-300 backdrop-blur-sm"
              >
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-12">
            Why Choose AI-Powered Teaching?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-black/30 backdrop-blur-md rounded-lg border border-purple-500/30 hover:border-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.2)] hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] transform hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-purple-300 mb-2">{feature.title}</h3>
                <p className="text-purple-200/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 bg-gradient-to-b from-black to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-12">
            Comprehensive Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {detailedFeatures.map((category, index) => (
              <div
                key={index}
                className="p-6 bg-black/30 backdrop-blur-md rounded-lg border border-purple-500/30 
                hover:border-purple-500 transition-all duration-300 
                hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] 
                hover:bg-purple-900/10 transform hover:-translate-y-1
                group"
              >
                <h3 className="text-xl font-semibold text-purple-300 mb-4 group-hover:text-purple-200 transition-colors">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-purple-200/80 flex items-start group-hover:text-purple-100 transition-colors">
                      <span className="text-purple-400 mr-2 group-hover:text-purple-300">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-purple-900/50 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 mb-4">
            Join the Future of Education
          </h2>
          <p className="text-purple-200/80 mb-8 max-w-2xl mx-auto">
            Thousands of educators are transforming their teaching with AI-powered tools.
            Get started today and revolutionize your classroom experience.
          </p>
          <Link
            href="/register"
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-md font-medium hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)] inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </main>
  )
}
