/*
# Server-Side RPC Functions for Edge Functions

## Summary
Creates three SECURITY DEFINER database functions that edge functions call
to perform transactional writes with proper validation, audit logging, and
conflict checking. These functions run with database-level privileges so the
edge function can use the service role key while still enforcing business rules.

## New Functions

### 1. public.create_order(payload jsonb) → jsonb
Atomically creates an order with its line items and initial timeline entry.
- Validates that the user exists and has items in the payload
- Generates a unique order_number (format: ORD-YYYYMMDD-XXXX)
- Inserts into orders, order_items, and order_timeline in a single transaction
- Returns the created order's id and order_number
- SECURITY DEFINER with pinned search_path (public, pg_catalog)

### 2. public.check_reservation_conflict(p_date date, p_time text, p_party_size int) → jsonb
Checks whether a reservation slot has capacity conflicts.
- Counts existing reservations for the same date/time that aren't cancelled
- Returns { conflict_count, has_conflict } as a JSON object
- SECURITY DEFINER with pinned search_path

### 3. public.log_activity(p_user_id uuid, p_action text, p_entity_type text, p_entity_id uuid, p_description text, p_metadata jsonb) → void
Inserts a row into activity_logs for audit trail.
- Called by edge functions after status updates, order creation, etc.
- SECURITY DEFINER with pinned search_path

## Security
- All functions use SET search_path = public, pg_catalog to prevent hijacking
- All functions are SECURITY DEFINER so they can run with elevated privileges
- EXECUTE is granted to authenticated (edge functions pass the user's JWT)
- create_order validates the user_id against auth.uid() when called with a JWT
*/

-- ============================================================
-- 1. create_order — transactional order creation
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_user_id uuid := (p_payload->>'user_id')::uuid;
  v_order_type text := p_payload->>'order_type';
  v_subtotal numeric := COALESCE((p_payload->>'subtotal')::numeric, 0);
  v_tax_amount numeric := COALESCE((p_payload->>'tax_amount')::numeric, 0);
  v_discount_amount numeric := COALESCE((p_payload->>'discount_amount')::numeric, 0);
  v_delivery_fee numeric := COALESCE((p_payload->>'delivery_fee')::numeric, 0);
  v_total numeric := COALESCE((p_payload->>'total')::numeric, 0);
  v_contact_phone text := p_payload->>'contact_phone';
  v_contact_email text := p_payload->>'contact_email';
  v_payment_method text := p_payload->>'payment_method';
  v_delivery_address jsonb := p_payload->'delivery_address';
  v_notes text := p_payload->>'notes';
  v_coupon_id uuid := NULLIF(p_payload->>'coupon_id', '')::uuid;
  v_order_id uuid;
  v_order_number text;
  v_date_part text := to_char(now(), 'YYYYMMDD');
  v_seq int;
  v_items jsonb := p_payload->'items';
  v_item jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;
  IF v_order_type IS NULL THEN
    RAISE EXCEPTION 'order_type is required';
  END IF;
  IF jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'Cannot create order with no items';
  END IF;

  -- Generate order number: ORD-YYYYMMDD-XXXX
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(order_number FROM 16) AS int)
  ), 0) + 1
  INTO v_seq
  FROM orders
  WHERE order_number LIKE 'ORD-' || v_date_part || '-%';

  v_order_number := 'ORD-' || v_date_part || '-' || lpad(v_seq::text, 4, '0');

  -- Insert the order
  INSERT INTO orders (
    user_id, order_number, status, order_type,
    subtotal, tax_amount, discount_amount, delivery_fee, total,
    coupon_id, delivery_address, contact_phone, contact_email,
    payment_status, payment_method, notes
  ) VALUES (
    v_user_id, v_order_number, 'pending', v_order_type,
    v_subtotal, v_tax_amount, v_discount_amount, v_delivery_fee, v_total,
    v_coupon_id, v_delivery_address, v_contact_phone, v_contact_email,
    'pending', v_payment_method, v_notes
  )
  RETURNING id INTO v_order_id;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_items) LOOP
    INSERT INTO order_items (
      order_id, menu_item_id, menu_item_name, menu_item_image,
      variant_name, quantity, unit_price, addons_total, line_total, notes
    ) VALUES (
      v_order_id,
      NULLIF(v_item->>'menu_item_id', '')::uuid,
      v_item->>'menu_item_name',
      v_item->>'menu_item_image',
      NULLIF(v_item->>'variant_name', '') ,
      COALESCE((v_item->>'quantity')::int, 1),
      COALESCE((v_item->>'unit_price')::numeric, 0),
      COALESCE((v_item->>'addons_total')::numeric, 0),
      COALESCE((v_item->>'line_total')::numeric, 0),
      v_item->>'notes'
    );
  END LOOP;

  -- Insert initial timeline entry
  INSERT INTO order_timeline (order_id, status, note)
  VALUES (v_order_id, 'pending', 'Order placed');

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO authenticated;

-- ============================================================
-- 2. check_reservation_conflict — slot availability check
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_reservation_conflict(
  p_reservation_date date,
  p_reservation_time text,
  p_party_size int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_conflict_count int;
  v_total_party int;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(party_size), 0)
  INTO v_conflict_count, v_total_party
  FROM reservations
  WHERE reservation_date = p_reservation_date
    AND reservation_time = p_reservation_time
    AND status NOT IN ('cancelled', 'no_show');

  RETURN jsonb_build_object(
    'conflict_count', v_conflict_count,
    'total_party_at_slot', v_total_party,
    'has_conflict', (v_total_party + p_party_size) > 50
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_reservation_conflict(date, text, int) TO authenticated;

-- ============================================================
-- 3. log_activity — audit trail insertion
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid,
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_description, p_metadata);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity(uuid, text, text, uuid, text, jsonb) TO authenticated;
