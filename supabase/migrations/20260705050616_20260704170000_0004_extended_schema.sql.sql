/*
# Extended Schema — Missing Tables for Full Operations

## Summary
Adds tables that were missing from the core schema to support complete
restaurant operations: server-side cart persistence, loyalty accounts,
reward transactions, media library, staff management, employee roles,
activity logs, analytics events, and fine-grained permissions.

## New Tables (10)

1. **carts** — Server-side cart persistence per user (replaces client-only cart for authenticated users)
2. **cart_items** — Line items in a cart, linked to menu items/variants/addons
3. **loyalty_accounts** — Per-user loyalty point balance and tier (summary table; ledger is the source of truth)
4. **reward_transactions** — Alias-compatible name for loyalty_ledger entries (redeemed rewards tracking)
5. **media_library** — Centralized media asset registry with metadata, tags, and bucket references
6. **staff** — Staff member profiles linked to auth.users with branch assignment and employment details
7. **employee_roles** — Role definitions with permissions and hierarchy level
8. **activity_logs** — User/staff activity tracking (login, updates, views) for audit and analytics
9. **analytics_events** — Page views, clicks, conversions, and custom event tracking
10. **permissions** — Fine-grained permission definitions (resource + action pairs)

## Security
- RLS enabled on every new table
- Owner-scoped policies for customer-facing tables (carts, cart_items, loyalty_accounts, reward_transactions, activity_logs, analytics_events)
- Admin/staff-scoped policies for operational tables (staff, employee_roles, media_library, permissions)
- All policies use auth.uid() for ownership checks
- is_admin() used for admin-level access

## Notes
- All tables use UUID primary keys with gen_random_uuid() defaults
- All tables have created_at (and updated_at where mutable)
- Foreign keys with appropriate CASCADE/SET NULL rules
- Indexes on frequently queried columns
*/

-- ============================================================
-- PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL CHECK (action IN ('read', 'create', 'update', 'delete', 'manage')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_permissions_resource_action ON public.permissions(resource, action);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_permissions" ON public.permissions;
CREATE POLICY "admin_manage_permissions" ON public.permissions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- EMPLOYEE ROLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employee_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  hierarchy_level integer NOT NULL DEFAULT 0,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_roles_name ON public.employee_roles(name);

ALTER TABLE public.employee_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_employee_roles" ON public.employee_roles;
CREATE POLICY "admin_manage_employee_roles" ON public.employee_roles FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- STAFF
-- ============================================================

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id text UNIQUE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'customer')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  shift_start time DEFAULT '09:00',
  shift_end time DEFAULT '17:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_user ON public.staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_branch ON public.staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(role);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_staff" ON public.staff;
CREATE POLICY "select_staff" ON public.staff FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_manage_staff" ON public.staff;
CREATE POLICY "admin_manage_staff" ON public.staff FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- CARTS (server-side persistence)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL,
  subtotal numeric(12, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_carts_user_active ON public.carts(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_carts" ON public.carts;
CREATE POLICY "select_own_carts" ON public.carts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_carts" ON public.carts;
CREATE POLICY "insert_own_carts" ON public.carts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_carts" ON public.carts;
CREATE POLICY "update_own_carts" ON public.carts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_carts" ON public.carts;
CREATE POLICY "delete_own_carts" ON public.carts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- CART ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  menu_item_name text NOT NULL,
  variant_id uuid REFERENCES public.menu_variants(id) ON DELETE SET NULL,
  variant_name text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL,
  addons jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  line_total numeric(12, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cart_items" ON public.cart_items;
CREATE POLICY "select_own_cart_items" ON public.cart_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_cart_items" ON public.cart_items;
CREATE POLICY "insert_own_cart_items" ON public.cart_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_cart_items" ON public.cart_items;
CREATE POLICY "update_own_cart_items" ON public.cart_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_cart_items" ON public.cart_items;
CREATE POLICY "delete_own_cart_items" ON public.cart_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid())
  );

-- ============================================================
-- LOYALTY ACCOUNTS (summary table; loyalty_ledger is source of truth)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  points_balance integer NOT NULL DEFAULT 0,
  lifetime_points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_accounts_user ON public.loyalty_accounts(user_id);

ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_loyalty_account" ON public.loyalty_accounts;
CREATE POLICY "select_own_loyalty_account" ON public.loyalty_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_manage_loyalty_accounts" ON public.loyalty_accounts;
CREATE POLICY "admin_manage_loyalty_accounts" ON public.loyalty_accounts FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- REWARD TRANSACTIONS (extends loyalty_ledger for redemption tracking)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  loyalty_ledger_id uuid REFERENCES public.loyalty_ledger(id) ON DELETE SET NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('discount', 'free_item', 'free_delivery', 'cashback')),
  points_cost integer NOT NULL DEFAULT 0,
  reference_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'expired')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_transactions_user ON public.reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_status ON public.reward_transactions(status);

ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_reward_transactions" ON public.reward_transactions;
CREATE POLICY "select_own_reward_transactions" ON public.reward_transactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "admin_manage_reward_transactions" ON public.reward_transactions;
CREATE POLICY "admin_manage_reward_transactions" ON public.reward_transactions FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- MEDIA LIBRARY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  bucket text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  width integer,
  height integer,
  alt_text text,
  tags text[] DEFAULT '{}',
  category text DEFAULT 'general',
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_category ON public.media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_bucket ON public.media_library(bucket);
CREATE INDEX IF NOT EXISTS idx_media_tags ON public.media_library USING gin(tags);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media" ON public.media_library;
CREATE POLICY "public_read_media" ON public.media_library FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_manage_media" ON public.media_library;
CREATE POLICY "admin_manage_media" ON public.media_library FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  description text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_logs(created_at DESC);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_activity" ON public.activity_logs;
CREATE POLICY "select_own_activity" ON public.activity_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "insert_own_activity" ON public.activity_logs;
CREATE POLICY "insert_own_activity" ON public.activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_delete_activity" ON public.activity_logs;
CREATE POLICY "admin_delete_activity" ON public.activity_logs FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  event_type text NOT NULL,
  event_category text NOT NULL DEFAULT 'engagement',
  event_label text,
  page_url text,
  referrer text,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON public.analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_analytics_events" ON public.analytics_events;
CREATE POLICY "insert_analytics_events" ON public.analytics_events FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_analytics" ON public.analytics_events;
CREATE POLICY "admin_read_analytics" ON public.analytics_events FOR SELECT
  TO authenticated USING (public.is_admin());

-- ============================================================
-- UPDATED_AT TRIGGERS for new tables
-- ============================================================

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'employee_roles', 'staff', 'carts', 'cart_items',
    'loyalty_accounts', 'reward_transactions', 'media_library'
  ]) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at()', t);
  END LOOP;
END $$;

-- ============================================================
-- SEED: DEFAULT PERMISSIONS
-- ============================================================

INSERT INTO public.permissions (resource, action, description) VALUES
  ('orders', 'read', 'View orders'),
  ('orders', 'create', 'Create orders'),
  ('orders', 'update', 'Update order status'),
  ('orders', 'delete', 'Delete orders'),
  ('reservations', 'read', 'View reservations'),
  ('reservations', 'create', 'Create reservations'),
  ('reservations', 'update', 'Update reservations'),
  ('reservations', 'delete', 'Delete reservations'),
  ('menu_items', 'read', 'View menu items'),
  ('menu_items', 'create', 'Create menu items'),
  ('menu_items', 'update', 'Update menu items'),
  ('menu_items', 'delete', 'Delete menu items'),
  ('inventory', 'read', 'View inventory'),
  ('inventory', 'update', 'Update inventory'),
  ('customers', 'read', 'View customer data'),
  ('customers', 'update', 'Update customer data'),
  ('coupons', 'read', 'View coupons'),
  ('coupons', 'create', 'Create coupons'),
  ('coupons', 'update', 'Update coupons'),
  ('coupons', 'delete', 'Delete coupons'),
  ('gallery', 'read', 'View gallery'),
  ('gallery', 'create', 'Upload gallery images'),
  ('gallery', 'update', 'Update gallery items'),
  ('gallery', 'delete', 'Delete gallery items'),
  ('cms', 'read', 'View CMS pages'),
  ('cms', 'create', 'Create CMS pages'),
  ('cms', 'update', 'Update CMS pages'),
  ('cms', 'delete', 'Delete CMS pages'),
  ('settings', 'read', 'View settings'),
  ('settings', 'update', 'Update settings'),
  ('staff', 'read', 'View staff'),
  ('staff', 'create', 'Create staff'),
  ('staff', 'update', 'Update staff'),
  ('staff', 'delete', 'Delete staff'),
  ('analytics', 'read', 'View analytics'),
  ('media', 'read', 'View media library'),
  ('media', 'create', 'Upload media'),
  ('media', 'update', 'Update media metadata'),
  ('media', 'delete', 'Delete media')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: DEFAULT EMPLOYEE ROLES
-- ============================================================

INSERT INTO public.employee_roles (name, description, hierarchy_level, permissions) VALUES
  ('Administrator', 'Full system access', 100, '["*"]'::jsonb),
  ('Manager', 'Manage daily operations, orders, reservations, inventory', 50, '["orders:*","reservations:*","menu_items:read","inventory:*","customers:read","coupons:*","gallery:*","cms:read","analytics:read","media:*"]'::jsonb),
  ('Staff', 'Front-of-house operations, order taking, reservations', 10, '["orders:read","orders:create","orders:update","reservations:read","reservations:create","reservations:update","menu_items:read","customers:read","gallery:read"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
