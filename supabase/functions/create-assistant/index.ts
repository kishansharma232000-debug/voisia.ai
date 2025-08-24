import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CreateAssistantRequest {
  userId: string;
  businessName: string;
  timezone: string;
}

interface VapiAssistantResponse {
  id: string;
  name: string;
  timezone: string;
  // Add other Vapi response fields as needed
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Only allow POST requests
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

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication using the provided token
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
    const { userId, businessName, timezone }: CreateAssistantRequest = await req.json();

    // Security check: ensure user can only create assistant for themselves
    if (user.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Cannot create assistant for another user" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate required parameters
    if (!userId || !businessName || !timezone) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: userId, businessName, timezone" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if user already has an assistant
    const { data: existingMeta } = await supabase
      .from('users_meta')
      .select('assistant_id')
      .eq('id', userId)
      .single();

    if (existingMeta?.assistant_id) {
      return new Response(
        JSON.stringify({ error: "Assistant already exists for this user" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Vapi API key from environment (stored as Supabase secret)
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
    const vapiResponse = await fetch("https://api.vapi.ai/assistants", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: businessName,
        timezone: timezone,
        // Add other Vapi configuration as needed
      }),
    });

    if (!vapiResponse.ok) {
      const errorText = await vapiResponse.text();
      console.error("Vapi API error:", errorText);
      
      // Handle specific Vapi error codes
      if (vapiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to create assistant with Vapi API" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const vapiData: VapiAssistantResponse = await vapiResponse.json();
    const assistantId = vapiData.id;

    // Save assistant ID to users_meta table
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
      
      // Attempt to cleanup the created Vapi assistant if database save fails
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
        JSON.stringify({ error: "Failed to save assistant data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response with complete Vapi assistant data
    return new Response(
      JSON.stringify({
        success: true,
        assistant: vapiData,
        assistantId: assistantId,
        message: "Assistant created successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error in create-assistant function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});