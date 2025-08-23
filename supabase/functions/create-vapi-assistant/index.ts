import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CreateAssistantRequest {
  business_name: string;
  timezone: string;
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
    const { business_name, timezone }: CreateAssistantRequest = await req.json();

    if (!business_name || !timezone) {
      return new Response(
        JSON.stringify({ error: "business_name and timezone are required" }),
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
      .eq('user_id', user.id)
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
    const vapiResponse = await fetch("https://api.vapi.ai/assistants", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: business_name,
        timezone: timezone,
      }),
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
        user_id: user.id,
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