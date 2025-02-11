'use client'
// src/app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '../components/navbar'
import { Calendar, Clock, Phone, Users } from 'lucide-react'

export default function Home() {
  // Features section data
  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      title: 'Easy Scheduling',
      description: 'Book appointments online 24/7 with our easy-to-use scheduling system'
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: 'Expert Doctors',
      description: 'Access to a network of experienced healthcare professionals'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: '24/7 Support',
      description: 'Round-the-clock medical support for emergencies'
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: 'Telemedicine',
      description: 'Virtual consultations from the comfort of your home'
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
                Your Health, Our Priority
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Experience world-class healthcare with our team of expert doctors. 
                We provide comprehensive medical services to ensure your well-being.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/appointment"
                  className="bg-blue-600 text-white px-8 py-3 rounded-md text-center font-medium hover:bg-blue-700 transition-colors"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/services"
                  className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-md text-center font-medium hover:bg-blue-50 transition-colors"
                >
                  Our Services
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative h-64 sm:h-72 md:h-96 w-full">
                <Image
                  src="/api/placeholder/800/600"
                  alt="Healthcare professionals"
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
            Why Choose Us
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
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied patients who trust us with their healthcare needs.
            Schedule your appointment today and take the first step towards better health.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors inline-block"
          >
            Register Now
          </Link>
        </div>
      </section>
    </main>
  )
}