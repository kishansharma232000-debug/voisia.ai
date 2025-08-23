import { createClient } from 'npm:@supabase/supabase-js@2.54.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface UpdateAssistantRequest {
  user_id: string;
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

    if (req.method !== "PATCH") {
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
    const { user_id, business_name, timezone }: UpdateAssistantRequest = await req.json();

    if (!user_id || !business_name || !timezone) {
      return new Response(
        JSON.stringify({ error: "user_id, business_name, and timezone are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Ensure user can only update their own assistant
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Cannot update another user's assistant" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the user's assistant record
    const { data: assistantRecord, error: fetchError } = await supabase
      .from('assistants')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (fetchError || !assistantRecord) {
      return new Response(
        JSON.stringify({ error: "Assistant not found for this user" }),
        {
          status: 404,
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

    // Update assistant in Vapi
    const vapiResponse = await fetch(`https://api.vapi.ai/assistants/${assistantRecord.vapi_assistant_id}`, {
      method: "PATCH",
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
        JSON.stringify({ error: `Failed to update Vapi assistant: ${vapiError}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update assistant record in Supabase
    const { data: updatedRecord, error: updateError } = await supabase
      .from('assistants')
      .update({
        business_name: business_name,
        timezone: timezone,
      })
      .eq('user_id', user_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to update assistant record: ${updateError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        assistant: updatedRecord,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in update-vapi-assistant function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});