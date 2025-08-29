import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface VapiWebhookEvent {
  type: string;
  call?: {
    id: string;
    assistantId: string;
    customer?: {
      number: string;
    };
  };
  functionCall?: {
    name: string;
    parameters: Record<string, any>;
  };
}

/**
 * Supabase Edge Function: vapi-webhook
 * 
 * Handles webhooks from Vapi for function calls
 * Routes calendar function calls to appropriate endpoints
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

    const webhookData: VapiWebhookEvent = await req.json();
    
    // Handle function calls
    if (webhookData.type === 'function-call' && webhookData.functionCall) {
      const { name, parameters } = webhookData.functionCall;
      
      if (name === 'get_availability') {
        return await handleGetAvailability(parameters.user_id);
      } else if (name === 'book_appointment') {
        return await handleBookAppointment(parameters);
      }
    }

    // Return success for other webhook types
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Webhook error:", error);
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
 * Handle get_availability function call
 */
async function handleGetAvailability(userId: string): Promise<Response> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/assistant-calendar/availability?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (data.error === 'calendar_not_connected') {
      return new Response(
        JSON.stringify({
          result: "Your calendar is not connected. Please connect it first before I can check availability."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (data.available_slots && data.available_slots.length > 0) {
      const slotsText = data.available_slots
        .map((slot: any, index: number) => `${index + 1}. ${slot.formattedDate} at ${slot.formattedTime}`)
        .join('\n');
      
      return new Response(
        JSON.stringify({
          result: `I have the following appointment times available:\n\n${slotsText}\n\nWhich time would work best for you?`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          result: "I don't have any available appointment slots in the next two weeks. Would you like me to take your information and have someone call you back to schedule?"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Get availability error:", error);
    return new Response(
      JSON.stringify({
        result: "I had trouble checking the calendar. Please try again or contact the office directly."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Handle book_appointment function call
 */
async function handleBookAppointment(parameters: any): Promise<Response> {
  try {
    const response = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/assistant-calendar/book`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      }
    );

    const data = await response.json();
    
    if (data.success) {
      return new Response(
        JSON.stringify({
          result: data.message
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          result: data.message || "I had trouble booking the appointment. Please try again or contact the office directly."
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Book appointment error:", error);
    return new Response(
      JSON.stringify({
        result: "I encountered an issue while booking your appointment. Please try again or contact the office directly."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}