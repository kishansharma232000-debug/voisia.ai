import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Calendar, MessageSquare, CheckCircle, ArrowRight, Check, DollarSign } from 'lucide-react';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Phone className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">VoisiaAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Phone Assistant
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your business with an intelligent phone assistant that handles calls, 
              schedules appointments, and provides customer support 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium flex items-center justify-center"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VoisiaAI?
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features to automate your phone operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Call Handling</h3>
              <p className="text-gray-600">
                AI assistant answers calls professionally and routes them appropriately
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Scheduling</h3>
              <p className="text-gray-600">
                Automatically schedule appointments and sync with your calendar
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">FAQ Support</h3>
              <p className="text-gray-600">
                Instant answers to common questions with customizable responses
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              No complicated tiers. One flat rate that grows with your business.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-8 py-6">
                <h3 className="text-2xl font-bold mb-2">VoisiaAI Plan</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-xl ml-2">/month</span>
                  <span className="text-lg ml-2 opacity-90">+ $0.20 per call</span>
                </div>
              </div>

              <div className="px-8 py-8">
                <p className="text-gray-600 mb-6">
                  Perfect for any business — from salons and restaurants to agencies and clinics.
                  You only pay for the calls we handle.
                </p>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">AI voice assistant for your business</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Google Calendar integration</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">FAQ & business info upload</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Real-time analytics dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Multilingual & 24/7 availability</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Secure data management</span>
                  </li>
                </ul>

                <Link
                  to="/signup"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-4 rounded-lg text-lg font-semibold transition-colors"
                >
                  Get Started Now
                </Link>
              </div>
            </div>

            {/* Cost Comparison */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <DollarSign className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  <span className="font-semibold">A human receptionist costs over $2,000/month.</span> VoisiaAI gives you 24/7 coverage for just $49 + usage.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-12 space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">How is usage billed?</h4>
                <p className="text-gray-600">
                  Each answered call costs $0.20, automatically added to your monthly invoice.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
                <p className="text-gray-600">
                  Yes — there's no contract. Cancel anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Never Miss Another Call
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">24/7 Availability</h3>
                    <p className="text-gray-600">Your AI assistant works around the clock</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Professional Service</h3>
                    <p className="text-gray-600">Consistent, polite, and knowledgeable responses</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Cost Effective</h3>
                    <p className="text-gray-600">Reduce staffing costs while improving service</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Set up your AI assistant in minutes and start transforming your business today.
                </p>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center"
                >
                  Create Your Assistant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">VoisiaAI</span>
            </div>
            <p className="text-gray-400">
              © 2025 VoisiaAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}