import React from 'react';
import { X, Play, Pause } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);

  if (!isOpen) return null;

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control actual audio playback
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">VoisiaAI Live Demo</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Sample Call Recording</span>
              <span className="text-sm text-gray-600">2:34</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlay}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Call Transcript:</h4>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"Good morning! Thank you for calling Wilson Dental Care. My name is Sarah, your AI assistant. How can I help you today?"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-gray-600">P</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"Hi, I'd like to schedule a dental cleaning appointment."</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"I'd be happy to help you schedule a cleaning appointment. Let me check our availability for you. Can I get your full name first?"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-gray-600">P</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"Sure, it's Jennifer Martinez."</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"Thank you, Jennifer. I can see we have availability this Wednesday at 2 PM or Thursday at 10 AM. Which time works better for you?"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-gray-600">P</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"Wednesday at 2 PM would be perfect."</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-blue-600">AI</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 flex-1">
                  <p className="text-gray-800">"Excellent! I've booked your cleaning appointment for Wednesday, December 18th at 2:00 PM. Can I get a phone number where we can reach you if needed?"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold">✅ Appointment Successfully Booked</p>
            <p className="text-green-700 text-sm mt-1">The appointment has been automatically added to your Google Calendar and the patient will receive a confirmation email.</p>
          </div>
        </div>
      </div>
    </div>
  );
}