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

interface CalendarEvent {
  date: string;
  time: string;
  duration: number;
  title: string;
  description?: string;
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
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
 * Supabase Edge Function: calendar
 * 
 * Handles Google Calendar integration with automatic token refresh
 * Endpoints:
 * - GET /calendar/availability - Get available time slots
 * - POST /calendar/book - Create calendar events
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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse URL to determine endpoint
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route to appropriate handler
    if (pathname.endsWith('/availability') && req.method === 'GET') {
      return await handleAvailability(supabase, user.id);
    } else if (pathname.endsWith('/book') && req.method === 'POST') {
      const eventData = await req.json();
      return await handleBooking(supabase, user.id, eventData);
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
    console.error("Calendar function error:", error);
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
  // Get current tokens
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
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (expiryDate.getTime() - now.getTime() > bufferTime) {
    // Token is still valid
    return tokens;
  }

  // Token is expired or about to expire, refresh it
  try {
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
    console.error("Token refresh error:", error);
    return null;
  }
}

/**
 * Handle availability endpoint
 */
async function handleAvailability(supabase: any, userId: string): Promise<Response> {
  try {
    // Get valid tokens
    const tokens = await getValidTokens(supabase, userId);
    if (!tokens) {
      return new Response(
        JSON.stringify({ error: "Google Calendar not connected or tokens expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get calendar availability for next 7 days
    const now = new Date();
    const endDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

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
        JSON.stringify({ error: "Failed to fetch calendar availability" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const freeBusyData: FreeBusyResponse = await freeBusyResponse.json();
    const busyTimes = freeBusyData.calendars.primary?.busy || [];

    // Generate available slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots: AvailabilitySlot[] = [];
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(now.getTime() + (day * 24 * 60 * 60 * 1000));
      
      // Skip weekends
      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        continue;
      }

      for (let hour = 9; hour < 17; hour++) {
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

        availableSlots.push({
          date: currentDate.toISOString().split('T')[0],
          startTime: slotStart.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          available: isAvailable,
        });
      }
    }

    // Return next 5 available slots
    const nextAvailable = availableSlots
      .filter(slot => slot.available)
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        success: true,
        availableSlots: nextAvailable,
        totalSlots: availableSlots.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Availability error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch availability" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle booking endpoint
 */
async function handleBooking(supabase: any, userId: string, eventData: CalendarEvent): Promise<Response> {
  try {
    // Validate input
    if (!eventData.date || !eventData.time || !eventData.duration || !eventData.title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: date, time, duration, title" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get valid tokens
    const tokens = await getValidTokens(supabase, userId);
    if (!tokens) {
      return new Response(
        JSON.stringify({ error: "Google Calendar not connected or tokens expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse date and time
    const startDateTime = new Date(`${eventData.date}T${eventData.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + (eventData.duration * 60 * 1000));

    // Create calendar event
    const calendarEvent = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York', // You might want to make this configurable
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York',
      },
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
        JSON.stringify({ error: "Failed to create calendar event" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const createdEvent = await createResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        event: {
          id: createdEvent.id,
          title: createdEvent.summary,
          start: createdEvent.start.dateTime,
          end: createdEvent.end.dateTime,
          htmlLink: createdEvent.htmlLink,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Booking error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create booking" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}