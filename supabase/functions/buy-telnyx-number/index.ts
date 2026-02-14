import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BuyNumberRequest {
  userId: string;
}

interface TelnyxAvailableNumber {
  id: string;
  phone_number: string;
  country_code: string;
  npa: string;
  nxx: string;
  price: string;
  record_type: string;
}

interface TelnyxPhoneNumber {
  id: string;
  record_type: string;
  phone_number: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const telnyxApiKey = Deno.env.get("TELNYX_API_KEY");
    if (!telnyxApiKey) {
      throw new Error("TELNYX_API_KEY environment variable not set");
    }

    const { userId }: BuyNumberRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not set");
    }

    const supabase = (await import("npm:@supabase/supabase-js@2.54.0")).createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const existingNumber = await supabase
      .from("clinic_numbers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingNumber.data) {
      return new Response(
        JSON.stringify({
          error: "User already has a phone number assigned",
          number: existingNumber.data,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchResponse = await fetch(
      "https://api.telnyx.com/v2/available_phone_numbers?filter[country_code]=US&filter[features][0]=sms&filter[features][1]=voice&page[size]=1",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${telnyxApiKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.text();
      console.error("Telnyx search error:", errorData);
      throw new Error(`Failed to search available numbers: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    const availableNumbers = searchData.data as TelnyxAvailableNumber[];

    if (!availableNumbers || availableNumbers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No available phone numbers found" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const numberToPurchase = availableNumbers[0];

    const purchaseResponse = await fetch(
      "https://api.telnyx.com/v2/phone_numbers",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${telnyxApiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          phone_number: numberToPurchase.phone_number,
          connection_id: Deno.env.get("TELNYX_CONNECTION_ID"),
          customer_reference: userId,
        }),
      }
    );

    if (!purchaseResponse.ok) {
      const errorData = await purchaseResponse.text();
      console.error("Telnyx purchase error:", errorData);
      throw new Error(`Failed to purchase phone number: ${purchaseResponse.statusText}`);
    }

    const purchasedData = await purchaseResponse.json();
    const purchasedNumber = purchasedData.data as TelnyxPhoneNumber;

    const { error: insertError } = await supabase.from("clinic_numbers").insert({
      user_id: userId,
      telnyx_number: purchasedNumber.phone_number,
      telnyx_number_id: purchasedNumber.id,
      status: "active",
    });

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error(`Failed to save phone number: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        phoneNumber: purchasedNumber.phone_number,
        telnyxNumberId: purchasedNumber.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in buy-telnyx-number:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
