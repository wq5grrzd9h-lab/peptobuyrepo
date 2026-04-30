"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  useCallback,
  useRef,
} from "react";
import { products as allProducts } from "@/lib/products";
import type { Product } from "@/lib/products";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoredItem {
  productId: string;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD"; product: Product; qty: number }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const idx = state.findIndex((i) => i.product.id === action.product.id);
      if (idx !== -1) {
        return state.map((item, i) =>
          i === idx
            ? { ...item, quantity: Math.min(99, item.quantity + action.qty) }
            : item
        );
      }
      return [...state, { product: action.product, quantity: action.qty }];
    }
    case "REMOVE":
      return state.filter((i) => i.product.id !== action.id);
    case "UPDATE":
      if (action.qty <= 0)
        return state.filter((i) => i.product.id !== action.id);
      return state.map((i) =>
        i.product.id === action.id
          ? { ...i, quantity: Math.min(99, action.qty) }
          : i
      );
    case "CLEAR":
      return [];
    case "HYDRATE":
      return action.items;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "peptobuy-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const isMounted = useRef(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    isMounted.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredItem[] = JSON.parse(raw);
        const hydrated: CartItem[] = stored
          .map(({ productId, quantity }) => {
            const product = allProducts.find((p) => p.id === productId);
            return product ? { product, quantity } : null;
          })
          .filter(Boolean) as CartItem[];
        if (hydrated.length > 0) {
          dispatch({ type: "HYDRATE", items: hydrated });
        }
      }
    } catch {
      // corrupted storage — ignore and start fresh
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change (but not before hydration)
  useEffect(() => {
    if (!hydrated) return;
    const stored: StoredItem[] = items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // storage full or unavailable — ignore
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, qty = 1) => {
    dispatch({ type: "ADD", product, qty });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    dispatch({ type: "UPDATE", id, qty });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        hydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
