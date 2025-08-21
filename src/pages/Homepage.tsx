import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Phone, Calendar, Clock, Users, CheckCircle, ChevronDown, ChevronUp, Menu, X, RefreshCw, Globe } from 'lucide-react';
import DemoModal from '../components/DemoModal';

export default function Homepage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const faqs = [
    {
      question: "How does VoisiaAI connect to my phone?",
      answer: "VoisiaAI connects to your existing clinic phone number through our cloud-based system. We provide you with a simple setup process that forwards calls to our AI assistant."
    },
    {
      question: "Do I need special hardware?",
      answer: "No special hardware is required. VoisiaAI works entirely through the cloud and integrates with your existing phone system and Google Calendar."
    },
    {
      question: "Can I try it before paying?",
      answer: "Yes! We offer a 7-day free trial with up to 10 calls so you can experience how VoisiaAI works for your clinic before committing to a plan."
    },
    {
      question: "What happens if the AI can't handle a call?",
      answer: "VoisiaAI is designed to handle appointment booking and basic inquiries. For complex medical questions, it will politely transfer the call to your staff or take a message."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">VoisiaAI</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#demo" className="text-gray-600 hover:text-blue-600 transition-colors">Demo</a>
              <a href="#faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</a>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </nav>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#demo" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Demo</a>
              <a href="#faq" className="block px-3 py-2 text-gray-600 hover:text-blue-600">FAQ</a>
              <Link to="/login" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Login</Link>
              <Link to="/signup" className="block px-3 py-2 bg-blue-600 text-white rounded-lg text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Automate Your Clinic's<br />
              <span className="text-blue-600">Calls with AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              VoisiaAI answers your calls, books real patient appointments, and syncs them with Google Calendar — no staff needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsDemoOpen(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span className="font-semibold">Hear Live Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Experience VoisiaAI in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Listen to how our AI assistant handles real appointment bookings with professionalism and accuracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Sample Conversation</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">VoisiaAI</p>
                    <p className="text-gray-700">"Good morning! Thank you for calling Wilson Dental Care. How can I help you today?"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-600">Patient</p>
                    <p className="text-gray-700">"Hi, I'd like to schedule a cleaning appointment."</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">VoisiaAI</p>
                    <p className="text-gray-700">"I'd be happy to help you schedule a cleaning. I have availability next Tuesday at 2 PM or Wednesday at 10 AM. Which works better for you?"</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDemoOpen(true)}
                className="mt-6 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Play className="w-4 h-4" />
                <span>Play Full Demo</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Natural conversation flow</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Real-time calendar checking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Instant appointment booking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Patient information collection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700">Professional, friendly tone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose VoisiaAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your clinic's phone system with intelligent automation that works around the clock.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Call Answering</h3>
              <p className="text-gray-600">Never miss a call again. Our AI works around the clock, even during holidays and weekends.</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real Appointment Booking</h3>
              <p className="text-gray-600">Books actual appointments in your calendar with patient details and contact information.</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Google Calendar Integration</h3>
              <p className="text-gray-600">Seamlessly syncs with your existing Google Calendar for real-time availability.</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">No Receptionist Required</h3>
              <p className="text-gray-600">Reduce staffing costs while improving patient satisfaction with instant responses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              One Simple Plan. Pay As You Grow.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent pricing with no hidden fees. Start small and scale as your business grows.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md w-full relative overflow-hidden">
              {/* Popular badge */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">VoisiaAI Pro</h3>
                
                {/* Platform Fee */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">$49</span>
                    <span className="text-xl text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="text-gray-600 font-medium">Platform Fee</p>
                </div>

                {/* Usage Rate */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-2xl font-bold text-blue-600">$0.20</span>
                    <span className="text-blue-600 ml-2">/minute</span>
                  </div>
                  <p className="text-blue-700 text-sm">Only pay for what you use</p>
                </div>

                {/* Trust elements */}
                <div className="flex justify-center space-x-6 mb-8 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No hidden fees</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <h4 className="font-semibold text-gray-900 text-center mb-6">Everything included:</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">24/7 AI voice assistant</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Google Calendar integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Multilingual support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Real-time appointment booking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Transcripts for every call</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Global availability</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Easy dashboard with usage tracking</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                to="/signup"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <CheckCircle className="w-5 h-5" />
              </Link>

            </div>
          </div>

          {/* Additional info */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              <strong>Example:</strong> 100 minutes of calls = $49 platform fee + $20 usage = $69/month total
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <span>✓ No setup fees</span>
              <span>✓ No contracts</span>
              <span>✓ 24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose an AI Voice Assistant Over a Human Receptionist?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Hiring a full-time receptionist costs anywhere from $2,000 to $3,500/month, and they're limited to business hours, one call at a time, and occasional unavailability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our AI voice assistant offers:</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">24/7 availability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">Simultaneous call handling</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">Real-time appointment booking with Google Calendar</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">Multilingual support</span>
                </div>
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <p className="text-blue-800 font-semibold text-lg">
                  👉 At just a fraction of the cost — plans starting at $99/month
                </p>
                <p className="text-blue-700 mt-2">It's efficient, cost-effective, and always ready.</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6">What Can the Assistant Do for My Business?</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-6 h-6 text-blue-600 mt-1" />
                  <span className="text-gray-700">Answer and handle incoming calls professionally</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-6 h-6 text-green-600 mt-1" />
                  <span className="text-gray-700">Book appointments or meetings in real-time</span>
                </div>
                <div className="flex items-start space-x-3">
                  <RefreshCw className="w-6 h-6 text-purple-600 mt-1" />
                  <span className="text-gray-700">Sync with your Google Calendar</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-6 h-6 text-orange-600 mt-1" />
                  <span className="text-gray-700">Reschedule or cancel appointments</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="w-6 h-6 text-red-600 mt-1" />
                  <span className="text-gray-700">Handle FAQs with customizable scripts</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-6 h-6 text-indigo-600 mt-1" />
                  <span className="text-gray-700">Speak in multiple languages</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional FAQ Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">🌍 Is It Available in All Countries?</h4>
              <p className="text-gray-600 mb-4">Yes. VoisiaAI is globally ready:</p>
              <ul className="space-y-2 text-gray-600">
                <li>🌎 International phone number support</li>
                <li>🕒 Time zone flexibility</li>
                <li>🗣️ Multilingual voice support</li>
                <li>📅 Google Calendar integration worldwide</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">📅 How Does Calendar Integration Work?</h4>
              <div className="space-y-3 text-gray-600">
                <p>We connect to your Google Calendar via secure API.</p>
                <p>The assistant checks your real-time availability and only books during free slots.</p>
                <p className="font-semibold text-gray-800">You maintain full control with no risk of double bookings.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">🎙️ Can I Customize What the Assistant Says?</h4>
              <p className="text-gray-600 mb-4">Absolutely. You can:</p>
              <ul className="space-y-2 text-gray-600">
                <li>🎙 Personalize the welcome message</li>
                <li>⏰ Set booking hours</li>
                <li>❓ Add responses for common questions</li>
                <li>🗣 Choose voice style and tone</li>
              </ul>
              <p className="text-gray-700 font-medium mt-4">Make your assistant reflect your brand's voice and values.</p>
            </div>
          </div>

          {/* Build vs Buy Section */}
          <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Not Build It Yourself or Hire a Team?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-red-800 mb-4">Building your own AI voice agent involves:</h4>
                <ul className="space-y-3 text-red-700">
                  <li>• Hiring developers or a voice AI team</li>
                  <li>• Managing backend and phone infrastructure</li>
                  <li>• Spending $10,000+ upfront and months to launch</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-green-800 mb-4">With VoisiaAI:</h4>
                <ul className="space-y-3 text-green-700">
                  <li>❌ No setup cost</li>
                  <li>❌ No technical overhead</li>
                  <li>❌ No management required</li>
                </ul>
                <div className="mt-6 p-4 bg-green-100 rounded-lg">
                  <p className="text-green-800 font-semibold">Just plug in and go live in minutes.</p>
                  <p className="text-green-700">Perfect for solo professionals, small teams, and growing businesses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about VoisiaAI
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors rounded-lg"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold">VoisiaAI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transforming clinic operations with intelligent AI voice assistants that handle calls and book appointments 24/7.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#demo" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VoisiaAI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}