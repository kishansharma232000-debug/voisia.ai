// TypeScript type definitions for multi-industry support

export type IndustryType = 'clinic' | 'restaurant' | 'hotel' | 'salon' | 'agency' | 'other';

export interface IndustryConfig {
  type: IndustryType;
  displayName: string;
  appointmentLabel: string;
  bookingLabel: string;
  defaultSettings: IndustrySettings;
}

export interface BaseIndustrySettings {
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  timezone: string;
  bookingDuration: number; // in minutes
}

export interface ClinicSettings extends BaseIndustrySettings {
  serviceTypes: string[];
  appointmentDuration: number;
  staffMembers: string[];
  allowOnlineBooking: boolean;
}

export interface RestaurantSettings extends BaseIndustrySettings {
  tableSizes: number[];
  reservationDuration: number;
  menuCategories: string[];
  maxPartySize: number;
}

export interface HotelSettings extends BaseIndustrySettings {
  roomTypes: string[];
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  maxStayDuration: number;
}

export interface SalonSettings extends BaseIndustrySettings {
  serviceTypes: string[];
  appointmentDuration: number;
  stylists: string[];
  allowWalkIns: boolean;
}

export interface AgencySettings extends BaseIndustrySettings {
  consultationTypes: string[];
  meetingDuration: number;
  servicePackages: string[];
  consultants: string[];
}

export interface OtherSettings extends BaseIndustrySettings {
  customFields: {
    [key: string]: string | number | boolean;
  };
}

export type IndustrySettings = 
  | ClinicSettings 
  | RestaurantSettings 
  | HotelSettings 
  | SalonSettings 
  | AgencySettings 
  | OtherSettings;

export interface FAQEntry {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  faq_usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface FAQUploadResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: number;
}

export interface FAQSearchResult {
  entry: FAQEntry;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'keyword';
}

// Industry configuration constants
export const INDUSTRY_CONFIGS: Record<IndustryType, IndustryConfig> = {
  clinic: {
    type: 'clinic',
    displayName: 'Medical Clinic',
    appointmentLabel: 'Appointments',
    bookingLabel: 'Appointment',
    defaultSettings: {
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '15:00', closed: false },
        sunday: { open: '10:00', close: '14:00', closed: true }
      },
      timezone: 'America/New_York',
      bookingDuration: 60,
      serviceTypes: ['Consultation', 'Check-up', 'Treatment', 'Follow-up'],
      appointmentDuration: 30,
      staffMembers: ['Dr. Smith'],
      allowOnlineBooking: true
    } as ClinicSettings
  },
  restaurant: {
    type: 'restaurant',
    displayName: 'Restaurant',
    appointmentLabel: 'Reservations',
    bookingLabel: 'Reservation',
    defaultSettings: {
      businessHours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false }
      },
      timezone: 'America/New_York',
      bookingDuration: 120,
      tableSizes: [2, 4, 6, 8],
      reservationDuration: 90,
      menuCategories: ['Appetizers', 'Main Course', 'Desserts', 'Beverages'],
      maxPartySize: 12
    } as RestaurantSettings
  },
  hotel: {
    type: 'hotel',
    displayName: 'Hotel',
    appointmentLabel: 'Room Bookings',
    bookingLabel: 'Room Booking',
    defaultSettings: {
      businessHours: {
        monday: { open: '00:00', close: '23:59', closed: false },
        tuesday: { open: '00:00', close: '23:59', closed: false },
        wednesday: { open: '00:00', close: '23:59', closed: false },
        thursday: { open: '00:00', close: '23:59', closed: false },
        friday: { open: '00:00', close: '23:59', closed: false },
        saturday: { open: '00:00', close: '23:59', closed: false },
        sunday: { open: '00:00', close: '23:59', closed: false }
      },
      timezone: 'America/New_York',
      bookingDuration: 1440, // 24 hours
      roomTypes: ['Standard', 'Deluxe', 'Suite', 'Presidential'],
      checkInTime: '15:00',
      checkOutTime: '11:00',
      amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant'],
      maxStayDuration: 30
    } as HotelSettings
  },
  salon: {
    type: 'salon',
    displayName: 'Beauty Salon',
    appointmentLabel: 'Appointments',
    bookingLabel: 'Appointment',
    defaultSettings: {
      businessHours: {
        monday: { open: '09:00', close: '19:00', closed: false },
        tuesday: { open: '09:00', close: '19:00', closed: false },
        wednesday: { open: '09:00', close: '19:00', closed: false },
        thursday: { open: '09:00', close: '19:00', closed: false },
        friday: { open: '09:00', close: '19:00', closed: false },
        saturday: { open: '08:00', close: '18:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      timezone: 'America/New_York',
      bookingDuration: 90,
      serviceTypes: ['Haircut', 'Color', 'Styling', 'Manicure', 'Pedicure'],
      appointmentDuration: 60,
      stylists: ['Sarah', 'Mike'],
      allowWalkIns: true
    } as SalonSettings
  },
  agency: {
    type: 'agency',
    displayName: 'Agency',
    appointmentLabel: 'Consultations',
    bookingLabel: 'Consultation',
    defaultSettings: {
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: true },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      timezone: 'America/New_York',
      bookingDuration: 60,
      consultationTypes: ['Strategy', 'Design', 'Marketing', 'Development'],
      meetingDuration: 45,
      servicePackages: ['Basic', 'Premium', 'Enterprise'],
      consultants: ['John Doe', 'Jane Smith']
    } as AgencySettings
  },
  other: {
    type: 'other',
    displayName: 'Other Business',
    appointmentLabel: 'Bookings',
    bookingLabel: 'Booking',
    defaultSettings: {
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: true },
        sunday: { open: '09:00', close: '17:00', closed: true }
      },
      timezone: 'America/New_York',
      bookingDuration: 60,
      customFields: {}
    } as OtherSettings
  }
};