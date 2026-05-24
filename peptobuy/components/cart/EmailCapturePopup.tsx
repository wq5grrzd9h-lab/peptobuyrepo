"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Loader2 } from "lucide-react";
import { useCart, lineUnitPrice } from "@/context/CartContext";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";

const LS_EMAIL_KEY = "checkoutEmail";
const LS_CART_KEY = "checkoutCartSnapshot";
const LS_STARTED_KEY = "checkoutStarted";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getStoredCheckoutEmail(): string {
  try { return localStorage.getItem(LS_EMAIL_KEY) ?? ""; } catch { return ""; }
}

export function clearCheckoutStorage() {
  try {
    localStorage.removeItem(LS_EMAIL_KEY);
    localStorage.removeItem(LS_CART_KEY);
    localStorage.removeItem(LS_STARTED_KEY);
    sessionStorage.removeItem("capturedEmail");
  } catch { /* ignore */ }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function EmailCapturePopup({ open, onClose }: Props) {
  const router = useRouter();
  const { items, subtotal } = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when popup opens
  useEffect(() => {
    if (open) {
      setEmail("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  async function handleContinue() {
    const val = email.trim().toLowerCase();
    if (!EMAIL_RE.test(val)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    // Persist to localStorage
    try {
      localStorage.setItem(LS_EMAIL_KEY, val);
      localStorage.setItem(LS_STARTED_KEY, new Date().toISOString());
      const snapshot = items.map((i) => ({
        name: i.product.name,
        dose: i.selectedDose.size,
        price: lineUnitPrice(i),
        quantity: i.quantity,
      }));
      localStorage.setItem(LS_CART_KEY, JSON.stringify(snapshot));
    } catch { /* ignore */ }

    // Register with server — fire and forget (don't block navigation)
    fetch("/api/register-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: val,
        cartItems: items.map((i) => ({
          name: i.product.name,
          dose: i.selectedDose.size,
          price: lineUnitPrice(i),
          quantity: i.quantity,
        })),
        cartTotal: subtotal,
      }),
    }).catch((err) => console.error("[register-checkout]", err));

    setLoading(false);
    onClose();
    router.push("/checkout");
  }

  function handleSkip() {
    onClose();
    router.push("/checkout");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Enter email to continue"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X size={16} />
        </button>

        <div className="px-7 pb-7 pt-6">
          {/* Logo */}
          <div className="mb-5 flex justify-center">
            <PeptoBuyLogo flaskH={36} />
          </div>

          {/* Heading */}
          <h2 className="mb-1.5 text-center text-xl font-black tracking-tight text-zinc-900">
            Almost there! 🧪
          </h2>
          <p className="mb-6 text-center text-sm leading-relaxed text-zinc-500">
            Enter your email to continue. We&apos;ll send your order confirmation and keep your cart saved.
          </p>

          {/* Email input */}
          <div className="mb-1.5">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
              placeholder="your@email.com"
              autoComplete="email"
              className={[
                "w-full rounded-xl border px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2",
                error
                  ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                  : "border-zinc-200 focus:border-accent focus:ring-accent/20",
              ].join(" ")}
            />
            {error && (
              <p className="mt-1.5 text-[12px] text-red-500">{error}</p>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleContinue}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-black text-white shadow-[0_0_24px_rgba(255,45,120,0.25)] transition-all hover:bg-[#e0256a] hover:shadow-[0_0_36px_rgba(255,45,120,0.4)] active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Continue to Checkout →
          </button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="mt-2 w-full text-center text-[12px] text-zinc-400 transition-colors hover:text-zinc-600"
          >
            Skip for now
          </button>

          {/* Fine print */}
          <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-400">
            For order confirmation and shipping updates only. Research use only reminder will be included.
          </p>

          <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-zinc-400">
            <span>🔒</span> We never share your email. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Hook: check stored email, show popup or navigate directly ────────────────

export function useCheckoutNavigate() {
  const router = useRouter();

  function navigateToCheckout(openPopup: () => void) {
    try {
      // Check checkoutEmail first
      const checkoutEmail = localStorage.getItem(LS_EMAIL_KEY);
      if (checkoutEmail && EMAIL_RE.test(checkoutEmail)) {
        router.push("/checkout");
        return;
      }
      // Fall back to cartEmail (captured via cart gate)
      const cartEmail = localStorage.getItem("cartEmail");
      if (cartEmail && EMAIL_RE.test(cartEmail)) {
        // Copy to checkoutEmail so checkout page pre-fills correctly
        try { localStorage.setItem(LS_EMAIL_KEY, cartEmail); } catch { /* ignore */ }
        router.push("/checkout");
        return;
      }
    } catch { /* ignore */ }
    openPopup();
  }

  return { navigateToCheckout };
}
