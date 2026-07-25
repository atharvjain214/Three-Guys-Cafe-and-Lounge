import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const VALID_STATUSES = [
  "pending", "confirmed", "preparing", "ready",
  "out_for_delivery", "delivered", "completed", "cancelled", "refunded",
];

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

    if (!body.order_id || !body.status) {
      return errorResponse("Missing required fields: order_id, status", 400);
    }

    if (!VALID_STATUSES.includes(body.status)) {
      return errorResponse(`Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`, 400);
    }

    // Check the user's role — only admin, manager, or staff can update order status
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleError || !roleData) {
      return errorResponse("Forbidden: insufficient permissions", 403);
    }

    const role = roleData.role;
    if (!["admin", "manager", "staff"].includes(role)) {
      return errorResponse("Forbidden: only staff can update order status", 403);
    }

    // Use service client for the update
    const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Update the order status
    const updateFields: Record<string, any> = { status: body.status };
    if (body.status === "confirmed") updateFields.confirmed_at = new Date().toISOString();
    if (body.status === "completed") updateFields.completed_at = new Date().toISOString();
    if (body.status === "cancelled") updateFields.cancelled_at = new Date().toISOString();

    const { data: updatedOrder, error: updateError } = await serviceClient
      .from("orders")
      .update(updateFields)
      .eq("id", body.order_id)
      .select("id, order_number, status")
      .single();

    if (updateError) {
      console.error("Order update error:", updateError);
      return errorResponse(updateError.message, 500);
    }

    // Insert timeline entry
    await serviceClient.from("order_timeline").insert({
      order_id: body.order_id,
      status: body.status,
      note: body.note || `Status updated to ${body.status} by ${role}`,
    });

    // Log the activity
    await serviceClient.rpc("log_activity", {
      p_user_id: user.id,
      p_action: "order_status_updated",
      p_entity_type: "order",
      p_entity_id: body.order_id,
      p_description: `Order ${updatedOrder.order_number} status changed to ${body.status}`,
      p_metadata: { previous_status: body.previous_status, new_status: body.status, role },
    });

    return new Response(JSON.stringify(updatedOrder), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("update-order-status error:", err);
    return errorResponse(err.message || "Internal server error", 500);
  }
});
