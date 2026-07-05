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

    // Create client with the user's JWT to verify auth
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
    if (!body.order_type || !body.contact_phone || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return errorResponse("Missing required fields: order_type, contact_phone, items", 400);
    }

    if (!["pickup", "delivery", "dine_in"].includes(body.order_type)) {
      return errorResponse("Invalid order_type", 400);
    }

    if (body.order_type === "delivery" && !body.delivery_address?.address) {
      return errorResponse("Delivery address is required for delivery orders", 400);
    }

    // Build the payload for the RPC
    const rpcPayload = {
      user_id: user.id,
      order_type: body.order_type,
      subtotal: Number(body.subtotal) || 0,
      tax_amount: Number(body.tax_amount) || 0,
      discount_amount: Number(body.discount_amount) || 0,
      delivery_fee: Number(body.delivery_fee) || 0,
      total: Number(body.total) || 0,
      contact_phone: body.contact_phone,
      contact_email: body.contact_email || user.email,
      payment_method: body.payment_method || "upi",
      delivery_address: body.delivery_address || null,
      notes: body.notes || null,
      coupon_id: body.coupon_id || null,
      items: body.items.map((item: any) => ({
        menu_item_id: item.menu_item_id,
        menu_item_name: item.name,
        menu_item_image: item.image_url || null,
        variant_name: item.variant_name || null,
        quantity: item.quantity,
        unit_price: item.price + (item.variant_price_adjustment || 0),
        addons_total: item.addons?.reduce((s: number, a: any) => s + a.price * a.quantity, 0) || 0,
        line_total: (item.price + (item.variant_price_adjustment || 0) + (item.addons?.reduce((s: number, a: any) => s + a.price * a.quantity, 0) || 0)) * item.quantity,
        notes: item.notes || null,
      })),
    };

    // Call the create_order RPC with the service client (elevated privileges)
    const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY")!;
    const serviceClient = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: orderData, error: orderError } = await serviceClient.rpc("create_order", {
      p_payload: rpcPayload,
    });

    if (orderError) {
      console.error("create_order RPC error:", orderError);
      return errorResponse(orderError.message, 500);
    }

    // Log the activity
    await serviceClient.rpc("log_activity", {
      p_user_id: user.id,
      p_action: "order_created",
      p_entity_type: "order",
      p_entity_id: orderData.id,
      p_description: `Order ${orderData.order_number} created`,
      p_metadata: { order_type: body.order_type, total: body.total },
    });

    return new Response(JSON.stringify(orderData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-order error:", err);
    return errorResponse(err.message || "Internal server error", 500);
  }
});
