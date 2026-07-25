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

    if (!body.order_id) {
      return errorResponse("Missing required field: order_id", 400);
    }

    if (!body.payment_method || !["upi", "card", "netbanking", "wallet"].includes(body.payment_method)) {
      return errorResponse("Invalid payment_method. Must be: upi, card, netbanking, or wallet", 400);
    }

    // Verify the order belongs to the authenticated user
    const { data: order, error: orderError } = await userClient
      .from("orders")
      .select("id, order_number, total, user_id, status, payment_status")
      .eq("id", body.order_id)
      .maybeSingle();

    if (orderError || !order) {
      return errorResponse("Order not found", 404);
    }

    if (order.user_id !== user.id) {
      return errorResponse("Forbidden: order does not belong to you", 403);
    }

    if (order.payment_status === "paid") {
      return errorResponse("Order is already paid", 409);
    }

    // Create a payment record
    const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: payment, error: paymentError } = await serviceClient
      .from("payments")
      .insert({
        order_id: order.id,
        user_id: user.id,
        amount: order.total,
        currency: "INR",
        payment_method: body.payment_method,
        status: "pending",
        gateway: "internal",
      })
      .select("id, amount, currency, payment_method, status")
      .single();

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      return errorResponse("Failed to create payment record", 500);
    }

    // Log the activity
    await serviceClient.rpc("log_activity", {
      p_user_id: user.id,
      p_action: "payment_intent_created",
      p_entity_type: "payment",
      p_entity_id: payment.id,
      p_description: `Payment intent for order ${order.order_number}`,
      p_metadata: { order_id: order.id, amount: order.total, method: body.payment_method },
    });

    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        payment_method: payment.payment_method,
        status: payment.status,
        order_number: order.order_number,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("create-payment-intent error:", err);
    return errorResponse(err.message || "Internal server error", 500);
  }
});
