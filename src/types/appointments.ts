// TypeScript type definitions for appointments system

export interface Appointment {
  id: string;
  user_id: string;
  caller_name: string;
  caller_number: string;
  event_id: string;
  start_time: string;
  end_time: string;
  status: 'booked' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface AppointmentFormData {
  caller_name: string;
  caller_number: string;
  date: string;
  time: string;
  duration: number;
  title: string;
  description?: string;
}

export interface AppointmentValidationErrors {
  caller_name?: string;
  caller_number?: string;
  date?: string;
  time?: string;
  duration?: string;
  title?: string;
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  formattedDate: string;
  formattedTime: string;
}

export interface AvailabilityResponse {
  success: boolean;
  available_slots: AvailabilitySlot[];
  total_available: number;
  message: string;
  error?: string;
}

export interface BookingResponse {
  success: boolean;
  appointment?: {
    id: string;
    event_id: string;
    caller_name: string;
    caller_number: string;
    start_time: string;
    end_time: string;
    formatted_date: string;
    formatted_time: string;
    calendar_link: string;
  };
  message: string;
  error?: string;
}

export interface AppointmentStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export interface AppointmentFilters {
  status?: 'all' | 'booked' | 'cancelled' | 'completed';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  search?: string;
}

// Vapi assistant integration types
export interface VapiAssistantConfig {
  user_id: string;
  business_name: string;
  timezone: string;
  calendar_integration: {
    enabled: boolean;
    availability_endpoint: string;
    booking_endpoint: string;
  };
}

export interface VapiCalendarFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}