import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

/**
 * Supabase Edge Function: vapi-calendar-functions
 * 
 * Handles calendar function calls from Vapi assistants
 * Endpoints:
 * - POST /get_availability - Get available appointment slots
 * - POST /book_appointment - Book calendar appointments
 */
Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const requestData = await req.json();
    const { function_name, parameters } = requestData;

    // Route to appropriate function
    if (function_name === 'get_availability') {
      return await handleGetAvailability(supabase, parameters.user_id);
    } else if (function_name === 'book_appointment') {
      return await handleBookAppointment(supabase, parameters);
    } else {
      return new Response(
        JSON.stringify({ 
          error: "unknown_function",
          message: "I don't recognize that function. Please try again."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Vapi calendar function error:", error);
    return new Response(
      JSON.stringify({ 
        error: "internal_error",
        message: "I encountered a technical issue. Please try again or contact support."
      }),
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
    const { data: tokens, error } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !tokens) {
      return null;
    }

    // Check if access token is expired (with 5 minute buffer)
    const expiryDate = new Date(tokens.expiry_date);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000;

    if (expiryDate.getTime() - now.getTime() > bufferTime) {
      return tokens;
    }

    // Refresh expired token
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
      console.error("Token refresh failed");
      return null;
    }

    const refreshData: GoogleTokenResponse = await refreshResponse.json();
    const newExpiryDate = new Date(now.getTime() + (refreshData.expires_in * 1000));

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
 * Handle get_availability function call from Vapi
 */
async function handleGetAvailability(supabase: any, userId: string): Promise<Response> {
  try {
    const tokens = await getValidTokens(supabase, userId);
    if (!tokens) {
      return new Response(
        JSON.stringify({
          result: "I'm sorry, but your calendar is not connected. Please connect your Google Calendar first, and then I'll be able to check availability for you."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get calendar availability for next 14 days
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
      return new Response(
        JSON.stringify({
          result: "I'm having trouble accessing the calendar right now. Please try again in a moment, or I can take your information and have someone call you back."
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
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      // Skip past hours for today
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

    if (nextAvailable.length === 0) {
      return new Response(
        JSON.stringify({
          result: "I don't see any available appointment slots in the next two weeks. Would you like me to take your contact information and have someone call you back to schedule an appointment?"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const slotsText = nextAvailable
      .map((slot, index) => `${index + 1}. ${slot.formattedDate} at ${slot.formattedTime}`)
      .join('\n');
    
    return new Response(
      JSON.stringify({
        result: `I have several appointment times available. Here are the next few options:\n\n${slotsText}\n\nWhich of these times would work best for you?`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Get availability error:", error);
    return new Response(
      JSON.stringify({
        result: "I'm having trouble checking the calendar right now. Let me take your information and have someone call you back to schedule your appointment."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle book_appointment function call from Vapi
 */
async function handleBookAppointment(supabase: any, parameters: BookingRequest): Promise<Response> {
  try {
    const { user_id, date, time, duration, title, caller_name, caller_number, description } = parameters;
    
    // Validate required parameters
    if (!user_id || !date || !time || !duration || !title || !caller_name || !caller_number) {
      return new Response(
        JSON.stringify({
          result: "I need a few more details to complete your booking. Can you please provide your full name and phone number?"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate phone number format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = caller_number.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return new Response(
        JSON.stringify({
          result: "I need a valid phone number to complete your booking. Could you please provide your phone number again?"
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
          result: "I'm sorry, but the calendar system is not connected. Let me take your information and have someone call you back to schedule your appointment."
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
      
      if (startDateTime <= new Date()) {
        return new Response(
          JSON.stringify({
            result: "I can only book appointments for future dates and times. Could you please choose a different time from the available options?"
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
          result: "I didn't quite catch the date and time correctly. Could you please repeat when you'd like to schedule your appointment?"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Double-check availability before booking
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
      
      const hasConflict = busyTimes.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (startDateTime < busyEnd && endDateTime > busyStart);
      });

      if (hasConflict) {
        return new Response(
          JSON.stringify({
            result: "I'm sorry, but that time slot just became unavailable. Let me check for other available times for you."
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
          result: "I had trouble creating the appointment in the calendar. Let me take your information and have someone call you back to confirm the booking."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const createdEvent = await createResponse.json();

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
      
      // Cleanup calendar event
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
          result: "I had trouble saving the appointment details. Let me take your information and have someone call you back to confirm the booking."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format success response
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
        result: `Perfect! I've successfully booked your ${title.toLowerCase()} appointment for ${formattedDate} at ${formattedTime}. You should receive a calendar invitation shortly. Is there anything else I can help you with today?`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Book appointment error:", error);
    return new Response(
      JSON.stringify({
        result: "I encountered an issue while booking your appointment. Let me take your contact information and have someone call you back to complete the scheduling."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}