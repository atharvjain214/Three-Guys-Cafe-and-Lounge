import { supabase } from "@/lib/supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function callEdgeFunction<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session.session?.access_token;

    if (!accessToken) {
      return { data: null, error: "Not authenticated. Please sign in." };
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: `Request failed (${response.status})` }));
      return { data: null, error: errorBody.error || `Request failed (${response.status})` };
    }

    const data: T = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Network error" };
  }
}

export interface CreateOrderResponse {
  id: string;
  order_number: string;
}

export interface CreateReservationResponse {
  id: string;
  reservation_number: string;
}

export interface CreatePaymentIntentResponse {
  payment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  order_number: string;
}

export interface UpdateOrderStatusResponse {
  id: string;
  order_number: string;
  status: string;
}

export const api = {
  createOrder: (payload: {
    order_type: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    delivery_fee: number;
    total: number;
    contact_phone: string;
    contact_email?: string;
    payment_method: string;
    delivery_address?: { address: string } | null;
    notes?: string | null;
    coupon_id?: string | null;
    items: Array<{
      menu_item_id: string;
      name: string;
      image_url: string | null;
      price: number;
      quantity: number;
      variant_name: string | null;
      variant_price_adjustment: number;
      addons: Array<{ id: string; name: string; price: number; quantity: number }>;
      notes: string | null;
    }>;
  }) => callEdgeFunction<CreateOrderResponse>("create-order", payload),

  createReservation: (payload: {
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    party_size: number;
    reservation_date: string;
    reservation_time: string;
    occasion?: string;
    special_requests?: string;
  }) => callEdgeFunction<CreateReservationResponse>("create-reservation", payload),

  createPaymentIntent: (payload: {
    order_id: string;
    payment_method: string;
  }) => callEdgeFunction<CreatePaymentIntentResponse>("create-payment-intent", payload),

  updateOrderStatus: (payload: {
    order_id: string;
    status: string;
    previous_status?: string;
    note?: string;
  }) => callEdgeFunction<UpdateOrderStatusResponse>("update-order-status", payload),
};
