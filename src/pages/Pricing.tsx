import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, CheckCircle, X, Crown, Mail, Building, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Pricing() {
  const { user, refreshUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: user?.email || '',
    company: user?.clinicName || '',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handlePlanSelection = async (planType: 'starter' | 'pro') => {
    if (!user) return;
    
    setIsUpdating(planType);
    
    try {
      const { error } = await supabase
        .from('users_meta')
        .upsert({
          id: user.id,
          plan: planType,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Refresh user data to update plan status
      await refreshUser();
      
      // Show success message or redirect
      alert(`Successfully activated ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan!`);
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to activate plan. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would send the contact form to your backend
    console.log('Contact form submitted:', contactForm);
    
    setContactSubmitted(true);
    setTimeout(() => {
      setShowContactForm(false);
      setContactSubmitted(false);
      setContactForm({
        name: '',
        email: user?.email || '',
        company: user?.clinicName || '',
        message: ''
      });
    }, 2000);
  };

  const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'Perfect for small clinics getting started',
    features: [
      '75 calls/month',
      'Google Calendar sync',
      '1 linked phone number',
      'Email support'
    ],
    limitations: [
      'No call recordings',
      'No analytics'
    ],
    buttonText: 'Choose Plan',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$149',
    period: '/month',
    description: 'Advanced features for growing practices',
    features: [
      '100 calls/month',
      'Analytics enabled',
      'Multi-user access',
      'Priority support'
    ],
    limitations: [
      'No call recordings'
    ],
    buttonText: 'Choose Plan',
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: null,
    period: '',
    description: 'Enterprise solution with unlimited calls',
    features: [
      'Unlimited calls',
      'Analytics enabled',
      'Call recordings',
      'Dedicated account manager',
      'Custom integrations'
    ],
    limitations: [],
    buttonText: 'Contact Sales',
    popular: false
  }
];
    {
      id: 'business',
      name: 'Business',
      price: null,
      period: '',
      description: 'Enterprise solution with unlimited calls',
      features: [
        'Unlimited AI calls',
        'Call recordings + replay',
        'Advanced analytics + exports',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'White-label options'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">VoisiaAI</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
                  Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                  <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your clinic's needs. Upgrade or downgrade anytime.
          </p>
          {user?.plan && (
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Current Plan: {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.popular ? 'border-2 border-blue-600 transform scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                  {plan.name}
                  {plan.id === 'business' && <Crown className="w-6 h-6 text-orange-500 ml-2" />}
                </h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  {plan.price ? (
                    <>
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 text-lg">{plan.period}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">Custom Pricing</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-gray-500">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (plan.id === 'business') {
                    setShowContactForm(true);
                  } else {
                    handlePlanSelection(plan.id as 'starter' | 'pro');
                  }
                }}
                disabled={isUpdating === plan.id || (user?.plan === plan.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  user?.plan === plan.id
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating === plan.id ? (
                  'Activating...'
                ) : user?.plan === plan.id ? (
                  'Current Plan'
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What happens if I exceed my call limit?
              </h3>
              <p className="text-gray-600">
                We'll notify you when you're approaching your limit. Additional calls are available at $2 per call.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a setup fee?
              </h3>
              <p className="text-gray-600">
                No setup fees for any plan. We'll help you get started with a free onboarding session.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. No long-term contracts required.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            {contactSubmitted ? (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">
                  We'll contact you within 24 hours to discuss your Business plan needs.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Contact Sales</h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="your.email@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clinic Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={contactForm.company}
                        onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your clinic name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about your needs, expected call volume, and any specific requirements..."
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                    </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}