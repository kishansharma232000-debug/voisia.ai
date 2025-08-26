import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// TypeScript interfaces for type safety
interface CreateAssistantRequest {
  businessName: string;
  timezone: string;
  language?: string;
  voiceStyle?: string;
}

interface VapiAssistantResponse {
  id: string;
  name: string;
  timezone: string;
  language?: string;
  voiceStyle?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAssistantResponse {
  success: boolean;
  assistant: VapiAssistantResponse;
  assistantId: string;
  message: string;
}

interface ApiError {
  error: string;
  details?: string;
}

/**
 * Supabase Edge Function: vapi-proxy
 * 
 * Securely handles Vapi API integration without exposing credentials to frontend
 * 
 * Security Features:
 * - Server-side API key management
 * - User authentication validation
 * - Input sanitization and validation
 * - Proper error handling without exposing internals
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

    // Only allow POST requests for assistant creation
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST to create assistants." }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SECURITY: Validate authorization header
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

    // Initialize Supabase client for authentication
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

    // SECURITY: Verify user authentication
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

    const { businessName, timezone, language = "en", voiceStyle = "friendly" } = requestData;

    // INPUT VALIDATION: Validate required parameters
    if (!businessName || !timezone) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters",
          details: "businessName and timezone are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate business name
    const sanitizedBusinessName = businessName.trim();
    if (sanitizedBusinessName.length < 2 || sanitizedBusinessName.length > 100) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid business name",
          details: "Business name must be between 2 and 100 characters"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate timezone format
    const validTimezonePattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;
    if (!validTimezonePattern.test(timezone)) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid timezone format",
          details: "Use format like 'America/New_York'"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already has an assistant
    const { data: existingMeta, error: fetchError } = await supabase
      .from('users_meta')
      .select('assistant_id')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
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
          error: "Assistant already exists",
          details: "You already have an assistant created"
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SECURITY: Get Vapi API key from environment
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

    // Make secure API call to Vapi
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
          name: sanitizedBusinessName,
          timezone: timezone,
          language: language,
          voiceStyle: voiceStyle,
          // Add additional Vapi configuration as needed
          model: {
            provider: "openai",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
          },
          voice: {
            provider: "11labs",
            voiceId: "default",
          },
        }),
      });

      if (!vapiResponse.ok) {
        const errorText = await vapiResponse.text();
        console.error("Vapi API error:", vapiResponse.status, errorText);
        
        // Handle specific Vapi error codes
        if (vapiResponse.status === 429) {
          return new Response(
            JSON.stringify({ 
              error: "Rate limit exceeded",
              details: "Please try again in a few minutes"
            }),
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
          JSON.stringify({ 
            error: "Failed to create assistant",
            details: "Please try again later"
          }),
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
        JSON.stringify({ 
          error: "Network error occurred",
          details: "Please check your connection and try again"
        }),
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
        JSON.stringify({ error: "Invalid response from assistant service" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save assistant ID to database
    const { error: updateError } = await supabase
      .from('users_meta')
      .upsert({
        id: user.id,
        assistant_id: assistantId,
        assistant_created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error("Database update error:", updateError);
      
      // CLEANUP: Attempt to delete the created Vapi assistant
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
      }

      return new Response(
        JSON.stringify({ 
          error: "Failed to save assistant data",
          details: "Please try again"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SUCCESS: Return complete response
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
    // Global error handler
    console.error("Unexpected error in vapi-proxy function:", error);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred",
        details: "Please try again later"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});