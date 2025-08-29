import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CreateAssistantRequest {
  business_name: string;
  timezone: string;
  user_id?: string;
}

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

    // Get authorization header
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
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

    // Parse request body
    const { business_name, timezone, user_id }: CreateAssistantRequest = await req.json();

    if (!business_name || !timezone || !user_id) {
      return new Response(
        JSON.stringify({ error: "business_name, timezone, and user_id are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if assistant already exists for this user
    const { data: existingAssistant } = await supabase
      .from('assistants')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingAssistant) {
      return new Response(
        JSON.stringify({ error: "Assistant already exists for this user" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Vapi API key
    const vapiApiKey = Deno.env.get("VAPI_API_KEY");
    if (!vapiApiKey) {
      return new Response(
        JSON.stringify({ error: "Vapi API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create assistant in Vapi
    const assistantConfig = {
      name: business_name,
      timezone: timezone,
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a professional AI assistant for ${business_name}. Your primary role is to help callers book appointments.

IMPORTANT: You have access to two functions for calendar management:
1. get_availability(user_id) - Check available appointment slots
2. book_appointment(user_id, date, time, duration, title, caller_name, caller_number) - Book appointments

When someone wants to book an appointment:
1. First, get their name and phone number
2. Call get_availability with user_id: "${user_id}" to check available times
3. Present the available options clearly
4. When they choose a time, call book_appointment with all details
5. Confirm the booking details

Always be professional, friendly, and helpful. If you encounter any errors, explain them clearly and offer alternatives.`
          }
        ],
        functions: [
          {
            name: "get_availability",
            description: "Get available appointment time slots from the calendar",
            parameters: {
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                  description: "The user ID to check availability for"
                }
              },
              required: ["user_id"]
            }
          },
          {
            name: "book_appointment",
            description: "Book an appointment in the calendar",
            parameters: {
              type: "object",
              properties: {
                user_id: {
                  type: "string",
                  description: "The user ID to book for"
                },
                date: {
                  type: "string",
                  description: "Date in YYYY-MM-DD format"
                },
                time: {
                  type: "string",
                  description: "Time in HH:MM format (24-hour)"
                },
                duration: {
                  type: "number",
                  description: "Duration in minutes"
                },
                title: {
                  type: "string",
                  description: "Appointment title/type"
                },
                caller_name: {
                  type: "string",
                  description: "Name of the person booking"
                },
                caller_number: {
                  type: "string",
                  description: "Phone number of the person booking"
                }
              },
              required: ["user_id", "date", "time", "duration", "title", "caller_name", "caller_number"]
            }
          }
        ]
      },
      voice: {
        provider: "11labs",
        voiceId: "sarah"
      }
    };

    const vapiResponse = await fetch("https://api.vapi.ai/assistants", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!vapiResponse.ok) {
      const vapiError = await vapiResponse.text();
      return new Response(
        JSON.stringify({ error: `Failed to create Vapi assistant: ${vapiError}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const vapiData = await vapiResponse.json();
    const assistantId = vapiData.id;

    // Store assistant data in Supabase
    const { data: assistantRecord, error: insertError } = await supabase
      .from('assistants')
      .insert({
        user_id: user_id,
        vapi_assistant_id: assistantId,
        business_name: business_name,
        timezone: timezone,
      })
      .select()
      .single();

    if (insertError) {
      // Try to cleanup the Vapi assistant if database insert fails
      try {
        await fetch(`https://api.vapi.ai/assistants/${assistantId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${vapiApiKey}`,
          },
        });
      } catch (cleanupError) {
        console.error("Failed to cleanup Vapi assistant:", cleanupError);
      }

      return new Response(
        JSON.stringify({ error: `Failed to store assistant data: ${insertError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        assistant: assistantRecord,
        vapi_assistant_id: assistantId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-vapi-assistant function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});