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
import type { Product, DoseOption } from "@/lib/products";

// ─── Constants ────────────────────────────────────────────────────────────────

export const RECONSTITUTION_PRICE = 29.99;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  /** Unique key: "${productId}::${doseSize}::${r|n}" */
  itemKey: string;
  product: Product;
  quantity: number;
  selectedDose: DoseOption;
  reconstitution: boolean;
}

interface StoredItem {
  productId: string;
  doseSize: string;
  quantity: number;
  reconstitution: boolean;
}

export interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  promoCode: string | null;
  hydrated: boolean;
  addItem: (
    product: Product,
    dose: DoseOption,
    quantity?: number,
    reconstitution?: boolean
  ) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { success: boolean; error?: string };
  removePromo: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function makeItemKey(
  productId: string,
  doseSize: string,
  recon: boolean
): string {
  return `${productId}::${doseSize}::${recon ? "r" : "n"}`;
}

/** Unit price for a single cart item (dose price + optional reconstitution fee). */
export function lineUnitPrice(item: CartItem): number {
  return item.selectedDose.price + (item.reconstitution ? RECONSTITUTION_PRICE : 0);
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD"; product: Product; dose: DoseOption; recon: boolean; qty: number }
  | { type: "REMOVE"; itemKey: string }
  | { type: "UPDATE"; itemKey: string; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const key = makeItemKey(action.product.id, action.dose.size, action.recon);
      const idx = state.findIndex((i) => i.itemKey === key);
      if (idx !== -1) {
        return state.map((item, i) =>
          i === idx
            ? { ...item, quantity: Math.min(99, item.quantity + action.qty) }
            : item
        );
      }
      return [
        ...state,
        {
          itemKey: key,
          product: action.product,
          quantity: action.qty,
          selectedDose: action.dose,
          reconstitution: action.recon,
        },
      ];
    }
    case "REMOVE":
      return state.filter((i) => i.itemKey !== action.itemKey);
    case "UPDATE":
      if (action.qty <= 0) return state.filter((i) => i.itemKey !== action.itemKey);
      return state.map((i) =>
        i.itemKey === action.itemKey
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

// Bumped to v2: stored format now includes doseSize + reconstitution
const STORAGE_KEY = "peptobuy-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const isMounted = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    isMounted.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredItem[] = JSON.parse(raw);
        const hydratedItems: CartItem[] = stored
          .map(({ productId, doseSize, quantity, reconstitution }) => {
            const product = allProducts.find((p) => p.id === productId);
            if (!product) return null;
            const dose = product.doses.find((d) => d.size === doseSize);
            if (!dose) return null;
            return {
              itemKey: makeItemKey(productId, doseSize, reconstitution),
              product,
              quantity,
              selectedDose: dose,
              reconstitution,
            } as CartItem;
          })
          .filter(Boolean) as CartItem[];
        if (hydratedItems.length > 0) {
          dispatch({ type: "HYDRATE", items: hydratedItems });
        }
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    setHydrated(true);
  }, []);

  // Persist on change (not before hydration)
  useEffect(() => {
    if (!hydrated) return;
    const stored: StoredItem[] = items.map((i) => ({
      productId: i.product.id,
      doseSize: i.selectedDose.size,
      quantity: i.quantity,
      reconstitution: i.reconstitution,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage full — ignore */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (product: Product, dose: DoseOption, qty = 1, recon = false) => {
      dispatch({ type: "ADD", product, dose, recon, qty });
    },
    []
  );

  const removeItem = useCallback((itemKey: string) => {
    dispatch({ type: "REMOVE", itemKey });
  }, []);

  const updateQuantity = useCallback((itemKey: string, qty: number) => {
    dispatch({ type: "UPDATE", itemKey, qty });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // Subtotal uses the actual unit price per item (dose price + reconstitution)
  const subtotal = items.reduce((sum, i) => sum + lineUnitPrice(i) * i.quantity, 0);

  // Discount: FIRST20 = 20% off subtotal
  const discountAmount = promoCode === "FIRST20" ? Math.round(subtotal * 0.2 * 100) / 100 : 0;

  const applyPromo = useCallback((code: string): { success: boolean; error?: string } => {
    const normalized = code.trim().toUpperCase();
    if (normalized !== "FIRST20") {
      return { success: false, error: "Invalid discount code." };
    }
    try {
      const used: string[] = JSON.parse(localStorage.getItem("usedDiscountCodes") || "[]");
      if (used.includes("FIRST20")) {
        return { success: false, error: "This code has already been used. FIRST20 is valid for first orders only." };
      }
    } catch { /* ignore */ }
    setPromoCode("FIRST20");
    return { success: true };
  }, []);

  const removePromo = useCallback(() => {
    setPromoCode(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        discountAmount,
        promoCode,
        hydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyPromo,
        removePromo,
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
