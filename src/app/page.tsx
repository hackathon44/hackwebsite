'use client'
// src/app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/navbar'
import { BookOpen, Brain, FileText, Users } from 'lucide-react'

export default function Home() {
  // Features section data
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: 'Smart Lesson Planning',
      description: 'Generate AI-powered lesson plans customized to your curriculum'
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: 'Collaborative Teaching',
      description: 'Share resources and collaborate with fellow educators in real time'
    },
    {
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      title: 'AI-Powered Insights',
      description: 'Analyze student engagement and optimize teaching strategies'
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      title: 'Automated Reports',
      description: 'Generate performance reports with actionable insights for students'
    }
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Revolutionizing Education with AI
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Empower teachers with AI-driven tools for lesson planning, student engagement, 
                and real-time performance insights. Simplify teaching and maximize impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-8 py-3 rounded-md text-center font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/features"
                  className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-md text-center font-medium hover:bg-blue-50 transition-colors"
                >
                  Explore Features
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative h-64 sm:h-72 md:h-96 w-full">
                <Image
                  src="/api/placeholder/800/600"
                  alt="AI in education"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose AI-Powered Teaching?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Future of Education
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Thousands of educators are transforming their teaching with AI-powered tools.
            Get started today and revolutionize your classroom experience.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </main>
  )
}