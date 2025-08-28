// TypeScript type definitions for Google Calendar integration

export interface GoogleTokens {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface CalendarEvent {
  date: string;
  time: string;
  duration: number;
  title: string;
  description?: string;
}

export interface BookingResponse {
  success: boolean;
  event?: {
    id: string;
    title: string;
    start: string;
    end: string;
    htmlLink: string;
  };
  error?: string;
}

export interface FreeBusyResponse {
  kind: string;
  timeMin: string;
  timeMax: string;
  calendars: {
    [key: string]: {
      busy: Array<{
        start: string;
        end: string;
      }>;
      errors?: Array<{
        domain: string;
        reason: string;
      }>;
    };
  };
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  htmlLink: string;
  status: string;
  created: string;
  updated: string;
}

export interface CalendarListResponse {
  kind: string;
  etag: string;
  items: Array<{
    id: string;
    summary: string;
    description?: string;
    timeZone: string;
    primary?: boolean;
    accessRole: string;
  }>;
}

// API response types
export interface AvailabilityResponse {
  success: boolean;
  availableSlots: AvailabilitySlot[];
  totalSlots: number;
  error?: string;
}

export interface CalendarConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  calendarInfo: {
    email?: string;
    name?: string;
    lastSync?: string;
  } | null;
}

// Form validation types
export interface CalendarEventFormData {
  date: string;
  time: string;
  duration: number;
  title: string;
  description: string;
}

export interface CalendarEventValidationErrors {
  date?: string;
  time?: string;
  duration?: string;
  title?: string;
  description?: string;
}

// Google OAuth types
export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface GoogleOAuthState {
  state: string;
  codeVerifier: string;
  redirectUri: string;
}