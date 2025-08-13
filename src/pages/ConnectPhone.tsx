import React, { useState } from 'react';
import { Phone, CheckCircle, AlertCircle, Copy, ExternalLink, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ConnectPhone() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(!!user?.phoneNumber);
  const [isVerifying, setIsVerifying] = useState(false);

  const hasActivePlan = user?.plan !== null;

  const handleConnect = async () => {
    if (!hasActivePlan) return;
    
    setIsVerifying(true);
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnected(true);
    setIsVerifying(false);
  };

  const connectedNumber = '+1 (555) 123-4567';
  const forwardingNumber = '+1 (888) 555-0123';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Plan Required Notice */}
      {!hasActivePlan && (
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Plan Required</h3>
              <p className="text-yellow-700">Upgrade your plan to unlock voice assistant integration.</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="inline-flex items-center space-x-2 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
          >
            <span>Choose Plan</span>
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Connect Phone Number</h1>
        <p className="text-gray-600 mt-2">Link your clinic's phone number to enable AI call handling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Form */}
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${!hasActivePlan ? 'opacity-60' : ''}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Phone Setup</h3>
          
          {!hasActivePlan ? (
            <div className="text-center py-8">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">Phone connection requires an active plan</p>
              <Link
                to="/pricing"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                View Plans
              </Link>
            </div>
          ) : !isConnected ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the phone number that patients currently call your clinic
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={!phoneNumber || isVerifying}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? 'Verifying & Connecting...' : 'Verify & Connect'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">Phone Connected Successfully!</span>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-800 font-medium">Connected Number:</p>
                <p className="text-green-700 text-lg font-mono">{connectedNumber}</p>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                  Disconnect
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Test Connection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Setup Instructions</h3>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Enter Your Number</h4>
                <p className="text-gray-600 text-sm">Add the phone number that patients currently use to call your clinic.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Forward Calls</h4>
                <p className="text-gray-600 text-sm">We'll provide you with a forwarding number to redirect calls to our AI system.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Test & Go Live</h4>
                <p className="text-gray-600 text-sm">Test the connection and start automating your clinic's calls immediately.</p>
              </div>
            </div>

            {hasActivePlan && isConnected && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Call Forwarding Details:</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Forward to:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{forwardingNumber}</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <a href="#" className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm">
                    <ExternalLink className="w-4 h-4" />
                    <span>Setup guide for your phone provider</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Connection Status</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              hasActivePlan && isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Phone className={`w-6 h-6 ${hasActivePlan && isConnected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <p className="font-semibold text-gray-900">Phone Number</p>
            <p className={`text-sm ${hasActivePlan && isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {hasActivePlan && isConnected ? 'Connected' : 'Not Connected'}
            </p>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              hasActivePlan && isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <CheckCircle className={`w-6 h-6 ${hasActivePlan && isConnected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <p className="font-semibold text-gray-900">AI Assistant</p>
            <p className={`text-sm ${hasActivePlan && isConnected ? 'text-green-600' : 'text-gray-500'}`}>
              {hasActivePlan && isConnected ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              hasActivePlan && user?.googleConnected ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <AlertCircle className={`w-6 h-6 ${hasActivePlan && user?.googleConnected ? 'text-green-600' : 'text-yellow-600'}`} />
            </div>
            <p className="font-semibold text-gray-900">Calendar Sync</p>
            <p className={`text-sm ${hasActivePlan && user?.googleConnected ? 'text-green-600' : 'text-yellow-600'}`}>
              {hasActivePlan && user?.googleConnected ? 'Connected' : 'Setup Required'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}