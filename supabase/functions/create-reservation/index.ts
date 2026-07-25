import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing authorization header", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();

    // Validate required fields
    if (!body.guest_name || !body.guest_email || !body.guest_phone) {
      return errorResponse("Missing required fields: guest_name, guest_email, guest_phone", 400);
    }

    if (!body.reservation_date || !body.reservation_time) {
      return errorResponse("Missing required fields: reservation_date, reservation_time", 400);
    }

    if (!body.party_size || body.party_size < 1 || body.party_size > 20) {
      return errorResponse("party_size must be between 1 and 20", 400);
    }

    // Check for reservation conflicts
    const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: conflictData, error: conflictError } = await serviceClient.rpc("check_reservation_conflict", {
      p_reservation_date: body.reservation_date,
      p_reservation_time: body.reservation_time,
      p_party_size: body.party_size,
    });

    if (conflictError) {
      console.error("Conflict check error:", conflictError);
      return errorResponse("Failed to check reservation availability", 500);
    }

    if (conflictData?.has_conflict) {
      return errorResponse("This time slot is fully booked. Please select another time.", 409);
    }

    // Insert the reservation
    const { data: reservation, error: insertError } = await serviceClient
      .from("reservations")
      .insert({
        user_id: user.id,
        guest_name: body.guest_name,
        guest_email: body.guest_email,
        guest_phone: body.guest_phone,
        party_size: body.party_size,
        reservation_date: body.reservation_date,
        reservation_time: body.reservation_time,
        occasion: body.occasion || null,
        special_requests: body.special_requests || null,
        status: "pending",
      })
      .select("id, reservation_number")
      .single();

    if (insertError) {
      console.error("Reservation insert error:", insertError);
      return errorResponse(insertError.message, 500);
    }

    // Log the activity
    await serviceClient.rpc("log_activity", {
      p_user_id: user.id,
      p_action: "reservation_created",
      p_entity_type: "reservation",
      p_entity_id: reservation.id,
      p_description: `Reservation for ${body.party_size} on ${body.reservation_date} at ${body.reservation_time}`,
      p_metadata: { party_size: body.party_size, date: body.reservation_date, time: body.reservation_time },
    });

    return new Response(JSON.stringify(reservation), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-reservation error:", err);
    return errorResponse(err.message || "Internal server error", 500);
  }
});
