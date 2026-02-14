import React, { useState } from 'react';
import { Phone, Copy, Check, Loader, AlertCircle } from 'lucide-react';

interface PhoneNumberWidgetProps {
  phoneNumber: string | null;
  loading?: boolean;
  error?: string | null;
  onPurchase?: () => Promise<void>;
  hasActivePlan?: boolean;
}

export default function PhoneNumberWidget({
  phoneNumber,
  loading = false,
  error = null,
  onPurchase,
  hasActivePlan = false,
}: PhoneNumberWidgetProps) {
  const [copied, setCopied] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const handleCopy = async () => {
    if (phoneNumber) {
      await navigator.clipboard.writeText(phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePurchase = async () => {
    if (!onPurchase) return;
    try {
      setPurchaseLoading(true);
      await onPurchase();
    } catch (err) {
      console.error('Error purchasing number:', err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <Phone className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Assistant Phone Number</h3>
          <p className="text-sm text-gray-600">Your dedicated Telnyx phone number</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!phoneNumber ? (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            {!hasActivePlan
              ? 'Upgrade your plan to get a dedicated phone number for your AI assistant.'
              : 'Click below to assign a Telnyx phone number to your AI assistant.'}
          </p>
          <button
            onClick={handlePurchase}
            disabled={!hasActivePlan || purchaseLoading || loading}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {purchaseLoading || loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Assigning number...</span>
              </>
            ) : (
              <>
                <Phone className="h-5 w-5" />
                <span>Assign Phone Number</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Your Phone Number</p>
            <p className="text-2xl font-bold text-gray-900">{phoneNumber}</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                <span>Copy Number</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-600 text-center">
            This number is ready to receive calls from your patients.
          </p>
        </div>
      )}
    </div>
  );
}
