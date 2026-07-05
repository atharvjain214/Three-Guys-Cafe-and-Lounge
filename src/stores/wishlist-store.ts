import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[];
  toggle: (menuItemId: string) => void;
  has: (menuItemId: string) => boolean;
  remove: (menuItemId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (menuItemId) => {
        const exists = get().items.includes(menuItemId);
        set((state) => ({
          items: exists
            ? state.items.filter((id) => id !== menuItemId)
            : [...state.items, menuItemId],
        }));
      },
      has: (menuItemId) => get().items.includes(menuItemId),
      remove: (menuItemId) => set((state) => ({ items: state.items.filter((id) => id !== menuItemId) })),
      clear: () => set({ items: [] }),
    }),
    { name: "tg-wishlist" }
  )
);
