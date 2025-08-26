// TypeScript type definitions for Vapi API integration

export interface VapiAssistant {
  id: string;
  name: string;
  timezone: string;
  language?: string;
  voiceStyle?: string;
  model?: {
    provider: string;
    model: string;
    temperature: number;
  };
  voice?: {
    provider: string;
    voiceId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssistantRequest {
  businessName: string;
  timezone: string;
  language?: string;
  voiceStyle?: string;
}

export interface CreateAssistantResponse {
  success: boolean;
  assistant: VapiAssistant;
  assistantId: string;
  message: string;
}

export interface UpdateAssistantRequest {
  assistantId: string;
  businessName?: string;
  timezone?: string;
  language?: string;
  voiceStyle?: string;
}

export interface UpdateAssistantResponse {
  success: boolean;
  assistant: VapiAssistant;
  message: string;
}

export interface VapiApiError {
  error: string;
  details?: string;
  code?: string;
}

export interface AssistantStatus {
  hasAssistant: boolean;
  assistantId: string | null;
  createdAt: string | null;
  isLoading: boolean;
  error: string | null;
}

// Form validation types
export interface FormValidationErrors {
  businessName?: string;
  timezone?: string;
  language?: string;
  voiceStyle?: string;
}

// API response types
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  details?: string;
};