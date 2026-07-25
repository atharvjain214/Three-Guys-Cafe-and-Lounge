export type UserRole = "admin" | "manager" | "staff" | "customer";

export interface Branch {
  id: string;
  name: string;
  slug: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_primary: boolean;
  opening_time: string;
  closing_time: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface MenuVariant {
  id: string;
  menu_item_id: string;
  name: string;
  price_adjustment: number;
  sort_order: number;
  is_available: boolean;
}

export interface MenuAddon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
}

export interface MenuItemAddon {
  id: string;
  menu_item_id: string;
  menu_addon_id: string;
  is_required: boolean;
  max_quantity: number;
  menu_addon?: MenuAddon;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  gallery_urls: string[];
  category_id: string | null;
  calories: number | null;
  prep_time_minutes: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
  is_gluten_free: boolean;
  is_featured: boolean;
  is_available: boolean;
  rating: number;
  review_count: number;
  sort_order: number;
  tags: string[];
  category?: Category;
  variants?: MenuVariant[];
  addons?: MenuItemAddon[];
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  name: string;
  slug: string;
  image_url: string | null;
  price: number;
  quantity: number;
  variant_id: string | null;
  variant_name: string | null;
  variant_price_adjustment: number;
  addons: { id: string; name: string; price: number; quantity: number }[];
  notes: string | null;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

export type OrderType = "pickup" | "delivery" | "dine_in";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  order_type: OrderType;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  delivery_address: Record<string, unknown> | null;
  contact_phone: string | null;
  contact_email: string | null;
  payment_status: string;
  payment_method: string | null;
  estimated_ready_at: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  order_items?: OrderItem[];
  timeline?: OrderTimelineEntry[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  menu_item_name: string;
  menu_item_image: string | null;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  addons_total: number;
  line_total: number;
  notes: string | null;
}

export interface OrderTimelineEntry {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Reservation {
  id: string;
  reservation_number: string;
  user_id: string | null;
  table_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  duration_minutes: number;
  status: ReservationStatus;
  special_requests: string | null;
  occasion: string | null;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  table_number: string;
  seats: number;
  location: string;
  is_active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  is_featured: boolean;
  sort_order: number;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  price: number;
  capacity: number | null;
  booked_count: number;
  is_featured: boolean;
}

export interface Review {
  id: string;
  user_id: string | null;
  menu_item_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed_amount" | "free_delivery";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  valid_until: string | null;
  is_active: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export interface LoyaltyEntry {
  id: string;
  user_id: string;
  points: number;
  type: "earned" | "redeemed" | "adjusted" | "expired";
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: unknown;
  description: string | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  changes: Record<string, unknown>;
  created_at: string;
}
