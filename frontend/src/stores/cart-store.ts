import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productSlug: string;
  brandSlug: string;
  name: string;
  price: string;
  image?: string;
  size?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productSlug: string, size?: string) => void;
  updateQuantity: (productSlug: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        const existing = items.find(
          (i) => i.productSlug === item.productSlug && i.size === item.size,
        );

        if (existing) {
          set({
            items: items.map((i) =>
              i.productSlug === item.productSlug && i.size === item.size
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (productSlug, size) => {
        set({
          items: get().items.filter(
            (i) => !(i.productSlug === productSlug && i.size === size),
          ),
        });
      },

      updateQuantity: (productSlug, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productSlug, size);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productSlug === productSlug && i.size === size ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "maison-cart",
    },
  ),
);
