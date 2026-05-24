"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2 } from "lucide-react";
import { useCart, lineUnitPrice } from "@/context/CartContext";

const LS_EMAIL_KEY = "cartEmail";
const LS_SNAPSHOT_KEY = "cartEmailSnapshot";
const SS_CAPTURED_KEY = "cartEmailCaptured";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getStoredCartEmail(): string {
  try { return localStorage.getItem(LS_EMAIL_KEY) ?? ""; } catch { return ""; }
}

export function clearCartEmailStorage() {
  try {
    localStorage.removeItem(LS_EMAIL_KEY);
    localStorage.removeItem(LS_SNAPSHOT_KEY);
    sessionStorage.removeItem(SS_CAPTURED_KEY);
  } catch { /* ignore */ }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartAbandonmentPopup({ open, onClose }: Props) {
  const { items } = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setEmail("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  async function handleSave() {
    const val = email.trim().toLowerCase();
    if (!EMAIL_RE.test(val)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    const cartItems = items.map((i) => ({
      name: i.product.name,
      dose: i.selectedDose.size,
      price: lineUnitPrice(i),
      quantity: i.quantity,
    }));
    const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // Persist
    try {
      localStorage.setItem(LS_EMAIL_KEY, val);
      localStorage.setItem(LS_SNAPSHOT_KEY, JSON.stringify(cartItems));
      sessionStorage.setItem(SS_CAPTURED_KEY, "1");
    } catch { /* ignore */ }

    // Register fire-and-forget
    fetch("/api/register-cart-abandonment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: val, cartItems, cartTotal }),
    }).catch((err) => console.error("[register-cart-abandonment]", err));

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => onClose(), 1400);
  }

  function handleSkip() {
    try { sessionStorage.setItem(SS_CAPTURED_KEY, "1"); } catch { /* ignore */ }
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[997] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Save your cart"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleSkip} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <button
          onClick={handleSkip}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
        >
          <X size={15} />
        </button>

        <div className="px-6 pb-6 pt-5">
          {submitted ? (
            <div className="py-4 text-center">
              <p className="text-2xl">✅</p>
              <p className="mt-2 text-base font-black text-zinc-900">Cart saved!</p>
              <p className="mt-1 text-sm text-zinc-500">We&apos;ll email you if you forget to come back.</p>
            </div>
          ) : (
            <>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                Don&apos;t lose your cart! 🧪
              </p>
              <h2 className="mb-1.5 text-lg font-black tracking-tight text-zinc-900">
                Save your research compounds
              </h2>
              <p className="mb-4 text-sm text-zinc-500">
                Enter your email and we&apos;ll save your cart for you.
              </p>

              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="your@email.com"
                autoComplete="email"
                className={[
                  "w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2",
                  error
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-zinc-200 focus:border-accent focus:ring-accent/20",
                ].join(" ")}
              />
              {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}

              <button
                onClick={handleSave}
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-black text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-[#e0256a] active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                Save My Cart →
              </button>

              <button
                onClick={handleSkip}
                className="mt-2 w-full text-center text-[12px] text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                No thanks, continue to checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
