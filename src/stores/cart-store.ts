import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, MenuItem, MenuVariant, MenuAddon } from "@/types";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  isOpen: boolean;
  addItem: (item: MenuItem, quantity: number, variant?: MenuVariant | null, selectedAddons?: MenuAddon[], notes?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null, discount: number) => void;
  setOpen: (open: boolean) => void;
  getSubtotal: () => number;
  getTax: (rate: number) => number;
  getDeliveryFee: (fee: number) => number;
  getTotal: (taxRate: number, deliveryFee: number) => number;
  getItemCount: () => number;
}

function generateCartItemId(menuItemId: string, variantId: string | null, addonIds: string[]): string {
  return [menuItemId, variantId, ...addonIds.sort()].join("|");
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      isOpen: false,

      addItem: (item, quantity, variant = null, selectedAddons = [], notes = "") => {
        const addonIds = selectedAddons.map((a) => a.id);
        const cartItemId = generateCartItemId(item.id, variant?.id ?? null, addonIds);
        const basePrice = item.price;
        const variantAdjustment = variant?.price_adjustment ?? 0;

        set((state) => {
          const existing = state.items.find((i) => i.id === cartItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === cartItemId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          const newItem: CartItem = {
            id: cartItemId,
            menu_item_id: item.id,
            name: item.name,
            slug: item.slug,
            image_url: item.image_url,
            price: basePrice,
            quantity,
            variant_id: variant?.id ?? null,
            variant_name: variant?.name ?? null,
            variant_price_adjustment: variantAdjustment,
            addons: selectedAddons.map((a) => ({ id: a.id, name: a.name, price: a.price, quantity: 1 })),
            notes: notes || null,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      setOpen: (open) => set({ isOpen: open }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const unitPrice = item.price + item.variant_price_adjustment + item.addons.reduce((s, a) => s + a.price * a.quantity, 0);
          return sum + unitPrice * item.quantity;
        }, 0);
      },

      getTax: (rate) => {
        const subtotal = get().getSubtotal();
        return Math.round(subtotal * rate * 100) / 100;
      },

      getDeliveryFee: (fee) => {
        return get().couponDiscount >= fee ? 0 : fee;
      },

      getTotal: (taxRate, deliveryFee) => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax(taxRate);
        const delivery = get().getDeliveryFee(deliveryFee);
        return Math.max(0, subtotal + tax + delivery - get().couponDiscount);
      },

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "tg-cart" }
  )
);
