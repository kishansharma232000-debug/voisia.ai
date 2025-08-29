import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// TypeScript interfaces
interface GoogleTokens {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  formattedDate: string;
  formattedTime: string;
}

interface BookingRequest {
  user_id: string;
  date: string;
  time: string;
  duration: number;
  title: string;
  caller_name: string;
  caller_number: string;
  description?: string;
}

interface FreeBusyResponse {
  calendars: {
    [key: string]: {
      busy: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

interface GoogleCalendarEvent {
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
}

/**
 * Supabase Edge Function: assistant-calendar
 * 
 * Handles Google Calendar integration for Vapi assistants
 * Endpoints:
 * - GET /assistant/availability?user_id=xxx - Get available time slots
 * - POST /assistant/book - Create calendar events and appointments
 */
Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse URL to determine endpoint
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route to appropriate handler
    if (pathname.includes('/availability') && req.method === 'GET') {
      const userId = url.searchParams.get('user_id');
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "user_id parameter is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      return await handleAvailability(supabase, userId);
    } else if (pathname.includes('/book') && req.method === 'POST') {
      const bookingData = await req.json();
      return await handleBooking(supabase, bookingData);
    } else {
      return new Response(
        JSON.stringify({ error: "Endpoint not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Assistant calendar function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Get user's Google tokens and refresh if needed
 */
async function getValidTokens(supabase: any, userId: string): Promise<GoogleTokens | null> {
  try {
    // Get current tokens
    const { data: tokens, error } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !tokens) {
      console.log(`No tokens found for user ${userId}`);
      return null;
    }

    // Check if access token is expired (with 5 minute buffer)
    const expiryDate = new Date(tokens.expiry_date);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    if (expiryDate.getTime() - now.getTime() > bufferTime) {
      // Token is still valid
      return tokens;
    }

    // Token is expired, refresh it
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get("GOOGLE_CLIENT_ID") || "",
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") || "",
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      console.error("Token refresh failed:", await refreshResponse.text());
      return null;
    }

    const refreshData: GoogleTokenResponse = await refreshResponse.json();
    
    // Calculate new expiry date
    const newExpiryDate = new Date(now.getTime() + (refreshData.expires_in * 1000));

    // Update tokens in database
    const { data: updatedTokens, error: updateError } = await supabase
      .from('google_tokens')
      .update({
        access_token: refreshData.access_token,
        expiry_date: newExpiryDate.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update tokens:", updateError);
      return null;
    }

    return updatedTokens;
  } catch (error) {
    console.error("Token management error:", error);
    return null;
  }
}

/**
 * Handle availability endpoint for Vapi assistant
 */
async function handleAvailability(supabase: any, userId: string): Promise<Response> {
  try {
    // Get valid tokens
    const tokens = await getValidTokens(supabase, userId);
    if (!tokens) {
      return new Response(
        JSON.stringify({ 
          error: "calendar_not_connected",
          message: "Your calendar is not connected. Please connect it first.",
          available_slots: []
        }),
        {
          status: 200, // Return 200 so Vapi can handle the response
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get calendar availability for next 14 days (business days only)
    const now = new Date();
    const endDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000));

    const freeBusyResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: now.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: 'primary' }],
        }),
      }
    );

    if (!freeBusyResponse.ok) {
      const errorText = await freeBusyResponse.text();
      console.error("FreeBusy API error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "calendar_api_error",
          message: "I had trouble checking the calendar, please try again later.",
          available_slots: []
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const freeBusyData: FreeBusyResponse = await freeBusyResponse.json();
    const busyTimes = freeBusyData.calendars.primary?.busy || [];

    // Generate available slots (9 AM to 5 PM, 1-hour slots, business days only)
    const availableSlots: AvailabilitySlot[] = [];
    
    for (let day = 0; day < 14; day++) {
      const currentDate = new Date(now.getTime() + (day * 24 * 60 * 60 * 1000));
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      // Skip past dates (if checking today, only show future hours)
      const isToday = currentDate.toDateString() === now.toDateString();
      const startHour = isToday ? Math.max(9, now.getHours() + 1) : 9;

      for (let hour = startHour; hour < 17; hour++) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        // Check if slot conflicts with busy times
        const isAvailable = !busyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return (slotStart < busyEnd && slotEnd > busyStart);
        });

        if (isAvailable) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];
          
          availableSlots.push({
            date: currentDate.toISOString().split('T')[0],
            startTime: slotStart.toTimeString().slice(0, 5),
            endTime: slotEnd.toTimeString().slice(0, 5),
            dayOfWeek: dayNames[currentDate.getDay()],
            formattedDate: `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}`,
            formattedTime: slotStart.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            }),
          });
        }
      }
    }

    // Return next 5 available slots
    const nextAvailable = availableSlots.slice(0, 5);

    return new Response(
      JSON.stringify({
        success: true,
        available_slots: nextAvailable,
        total_available: availableSlots.length,
        message: nextAvailable.length > 0 
          ? "Available time slots found" 
          : "No available time slots in the next 14 days"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Availability error:", error);
    return new Response(
      JSON.stringify({ 
        error: "availability_error",
        message: "I had trouble checking the calendar, please try again later.",
        available_slots: []
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle booking endpoint for Vapi assistant
 */
async function handleBooking(supabase: any, bookingData: BookingRequest): Promise<Response> {
  try {
    // Validate input
    const { user_id, date, time, duration, title, caller_name, caller_number, description } = bookingData;
    
    if (!user_id || !date || !time || !duration || !title || !caller_name || !caller_number) {
      return new Response(
        JSON.stringify({ 
          error: "missing_parameters",
          message: "I need all the appointment details to book this for you. Let me ask for the missing information.",
          success: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(caller_number.replace(/[\s\-\(\)]/g, ''))) {
      return new Response(
        JSON.stringify({ 
          error: "invalid_phone",
          message: "I need a valid phone number to complete the booking. Could you please provide your phone number?",
          success: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get valid tokens
    const tokens = await getValidTokens(supabase, user_id);
    if (!tokens) {
      return new Response(
        JSON.stringify({ 
          error: "calendar_not_connected",
          message: "Your calendar is not connected. Please connect it first.",
          success: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate date/time
    let startDateTime: Date;
    let endDateTime: Date;
    
    try {
      startDateTime = new Date(`${date}T${time}:00`);
      endDateTime = new Date(startDateTime.getTime() + (duration * 60 * 1000));
      
      // Validate that the appointment is in the future
      if (startDateTime <= new Date()) {
        return new Response(
          JSON.stringify({ 
            error: "invalid_time",
            message: "I can only book appointments for future dates and times. Please choose a different time.",
            success: false
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (dateError) {
      return new Response(
        JSON.stringify({ 
          error: "invalid_datetime",
          message: "The date and time format seems incorrect. Could you please repeat the date and time you'd like?",
          success: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if the time slot is still available
    const freeBusyResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startDateTime.toISOString(),
          timeMax: endDateTime.toISOString(),
          items: [{ id: 'primary' }],
        }),
      }
    );

    if (freeBusyResponse.ok) {
      const freeBusyData: FreeBusyResponse = await freeBusyResponse.json();
      const busyTimes = freeBusyData.calendars.primary?.busy || [];
      
      // Check for conflicts
      const hasConflict = busyTimes.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (startDateTime < busyEnd && endDateTime > busyStart);
      });

      if (hasConflict) {
        return new Response(
          JSON.stringify({ 
            error: "time_slot_unavailable",
            message: "I'm sorry, but that time slot is no longer available. Let me check for other available times.",
            success: false
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Create calendar event
    const calendarEvent = {
      summary: title,
      description: description || `Appointment with ${caller_name}\nPhone: ${caller_number}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        {
          email: caller_name.includes('@') ? caller_name : undefined,
          displayName: caller_name,
        }
      ],
    };

    const createResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Calendar event creation error:", errorText);
      return new Response(
        JSON.stringify({ 
          error: "calendar_booking_failed",
          message: "I had trouble creating the appointment in the calendar. Please try again or contact the office directly.",
          success: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const createdEvent: GoogleCalendarEvent = await createResponse.json();

    // Store appointment in database
    const { data: appointment, error: dbError } = await supabase
      .from('appointments')
      .insert({
        user_id: user_id,
        caller_name: caller_name,
        caller_number: caller_number,
        event_id: createdEvent.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'booked',
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      
      // Try to cleanup the calendar event
      try {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${createdEvent.id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${tokens.access_token}`,
            },
          }
        );
      } catch (cleanupError) {
        console.error("Failed to cleanup calendar event:", cleanupError);
      }

      return new Response(
        JSON.stringify({ 
          error: "database_error",
          message: "I had trouble saving the appointment details. Please try again.",
          success: false
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format success response for Vapi
    const formattedDate = startDateTime.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = startDateTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });

    return new Response(
      JSON.stringify({
        success: true,
        appointment: {
          id: appointment.id,
          event_id: createdEvent.id,
          caller_name: caller_name,
          caller_number: caller_number,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          formatted_date: formattedDate,
          formatted_time: formattedTime,
          calendar_link: createdEvent.htmlLink,
        },
        message: `Perfect! I've booked your appointment for ${formattedDate} at ${formattedTime}. You should receive a calendar invitation shortly. Is there anything else I can help you with?`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Booking error:", error);
    return new Response(
      JSON.stringify({ 
        error: "booking_error",
        message: "I encountered an issue while booking your appointment. Please try again or contact the office directly.",
        success: false
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}