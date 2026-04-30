"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "cart";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  exiting: Set<string>;
  dismiss: (id: string) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    cart: (title: string, description?: string) => void;
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD"; item: ToastItem }
  | { type: "REMOVE"; id: string };

function reducer(state: ToastItem[], action: Action): ToastItem[] {
  switch (action.type) {
    case "ADD":
      return [action.item, ...state].slice(0, 5);
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setExiting((prev) => new Set(Array.from(prev).concat(id)));
    setTimeout(() => {
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      dispatch({ type: "REMOVE", id });
    }, 320);
  }, []);

  const add = useCallback(
    (type: ToastType, title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      dispatch({ type: "ADD", item: { id, type, title, description } });
      // Auto-dismiss
      setTimeout(() => dismiss(id), type === "error" ? 5000 : 3000);
    },
    [dismiss]
  );

  const toast = {
    success: (title: string, description?: string) =>
      add("success", title, description),
    error: (title: string, description?: string) =>
      add("error", title, description),
    info: (title: string, description?: string) =>
      add("info", title, description),
    cart: (title: string, description?: string) =>
      add("cart", title, description),
  };

  return (
    <ToastContext.Provider value={{ toasts, exiting, dismiss, toast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
