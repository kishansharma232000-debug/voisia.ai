import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// TypeScript interfaces for type safety
interface CreateAssistantRequest {
  userId: string;
  businessName: string;
  timezone: string;
}

interface VapiAssistantResponse {
  id: string;
  name: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  // Add other Vapi response fields as needed
}

interface CreateAssistantResponse {
  success: boolean;
  assistant: VapiAssistantResponse;
  assistantId: string;
  message: string;
}

interface ApiError {
  error: string;
}

/**
 * Supabase Edge Function: create-assistant
 * 
 * Security Features:
 * - Validates user authentication using Supabase auth
 * - Ensures users can only create assistants for themselves
 * - Uses environment variables for sensitive API keys
 * - Implements proper error handling without exposing internals
 * - Includes cleanup mechanisms for failed operations
 */
Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests for creating assistants
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST to create assistants." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SECURITY: Get and validate authorization header
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

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SECURITY: Verify user authentication using the provided token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    let requestData: CreateAssistantRequest;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { userId, businessName, timezone } = requestData;

    // SECURITY: Ensure user can only create assistant for themselves
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Cannot create assistant for another user" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // INPUT VALIDATION: Validate required parameters
    if (!userId || !businessName || !timezone) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters. Required: userId, businessName, timezone" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate business name (basic sanitization)
    if (businessName.trim().length < 2 || businessName.trim().length > 100) {
      return new Response(
        JSON.stringify({ error: "Business name must be between 2 and 100 characters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate timezone format (basic check)
    const validTimezonePattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
    if (!validTimezonePattern.test(timezone)) {
      return new Response(
        JSON.stringify({ error: "Invalid timezone format. Use format like 'America/New_York'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DUPLICATE PREVENTION: Check if user already has an assistant
    const { data: existingMeta, error: fetchError } = await supabase
      .from('users_meta')
      .select('assistant_id')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" - which is expected for new users
      console.error("Database fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Database error occurred" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (existingMeta?.assistant_id) {
      return new Response(
        JSON.stringify({ 
          error: "Assistant already exists for this user",
          existingAssistantId: existingMeta.assistant_id
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SECURITY: Get Vapi API key from environment (stored as Supabase secret)
    const vapiApiKey = Deno.env.get("VAPI_API_KEY");
    if (!vapiApiKey) {
      console.error("VAPI_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Make secure API call to Vapi to create assistant
    let vapiResponse: Response;
    let vapiData: VapiAssistantResponse;

    try {
      vapiResponse = await fetch("https://api.vapi.ai/assistants", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: businessName.trim(),
          timezone: timezone,
          // Add additional Vapi configuration as needed
        }),
      });

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text();
        console.error("Vapi API error:", vapiResponse.status, errorText);
        
        // Handle specific Vapi error codes
        if (vapiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a few minutes." }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        if (vapiResponse.status === 401) {
          return new Response(
            JSON.stringify({ error: "API authentication failed" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ error: "Failed to create assistant. Please try again." }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      vapiData = await vapiResponse.json();
    } catch (networkError) {
      console.error("Network error calling Vapi API:", networkError);
      return new Response(
        JSON.stringify({ error: "Network error occurred. Please check your connection and try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const assistantId = vapiData.id;
    if (!assistantId) {
      console.error("No assistant ID returned from Vapi API");
      return new Response(
        JSON.stringify({ error: "Invalid response from assistant creation service" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // DATABASE OPERATION: Save assistant ID to users_meta table
    const { error: updateError } = await supabase
      .from('users_meta')
      .upsert({
        id: userId,
        assistant_id: assistantId,
        assistant_created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error("Database update error:", updateError);
      
      // CLEANUP: Attempt to delete the created Vapi assistant if database save fails
      try {
        await fetch(`https://api.vapi.ai/assistants/${assistantId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${vapiApiKey}`,
          },
        });
        console.log("Successfully cleaned up Vapi assistant after database failure");
      } catch (cleanupError) {
        console.error("Failed to cleanup Vapi assistant:", cleanupError);
        // Log this for manual cleanup if needed
      }

      return new Response(
        JSON.stringify({ error: "Failed to save assistant data. Please try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SUCCESS: Return complete response with assistant data
    const response: CreateAssistantResponse = {
      success: true,
      assistant: vapiData,
      assistantId: assistantId,
      message: "Assistant created successfully"
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    // GLOBAL ERROR HANDLER: Log unexpected errors without exposing details
    console.error("Unexpected error in create-assistant function:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});