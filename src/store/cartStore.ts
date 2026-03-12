import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  sellerReply?: string;
  status?: string;
}

export interface CustomDesign {
  baseType: 'tshirt' | 'hoodie' | 'shopper';
  baseColor: string;
  designImage: string;
  isAI: boolean;
}

export interface Product {
  id: string; // For custom items, this will be unique (e.g., custom-123)
  title: string;
  price: number;
  image_url: string;
  description?: string;
  brand?: string;
  old_price?: number;
  rating?: number;
  reviews_count?: number;
  is_recommended?: boolean;
  article?: string;
  categoryId?: string;
  reviews?: Review[];
  composition?: string;
  color?: string;
  sizes?: string[];
  gender?: string;
  season?: string;
  features?: string;
  images?: string[];
  stock?: Record<string, number>;
  selectedSize?: string;
  collection?: string;
  customDesign?: CustomDesign; // Added for AI Constructor
}

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for cart entry
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  promoCode: string | null;
  discountPercent: number;
  applyPromoCode: (code: string) => void;
  removePromoCode: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;

        // Custom items are ALWAYS added as new separate items (unique id is generated in Constructor)
        if (product.customDesign) {
          set({ items: [...items, { ...product, cartItemId: product.id, quantity: 1 }] });
          return;
        }

        // Standard logic for normal products
        const existingItem = items.find(
          (item) => !item.customDesign && item.id === product.id && item.selectedSize === product.selectedSize
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              (item.cartItemId || item.id) === (existingItem.cartItemId || existingItem.id)
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, cartItemId: `${product.id}-${product.selectedSize || 'default'}`, quantity: 1 }] });
        }
      },
      removeItem: (cartItemId) => {
        set({ items: get().items.filter((item) => (item.cartItemId || item.id) !== cartItemId) });
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId);
          return;
        }
        set({
          items: get().items.map((item) =>
            (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [], promoCode: null, discountPercent: 0 }),
      promoCode: null,
      discountPercent: 0,
      applyPromoCode: (code: string) => {
        if (code.toUpperCase() === 'SALE20') {
          set({ promoCode: 'SALE20', discountPercent: 20 });
        } else if (code.toUpperCase() === 'WOW50') {
          set({ promoCode: 'WOW50', discountPercent: 50 });
        } else {
          throw new Error('Неверный промокод');
        }
      },
      removePromoCode: () => set({ promoCode: null, discountPercent: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
