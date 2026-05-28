"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart, lineUnitPrice } from "@/context/CartContext";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import {
  isPromoActive,
  isFreeShippingWeekend,
  getTimeRemaining,
  pad,
  FREE_GHKCU_THRESHOLD,
  type TimeRemaining,
} from "@/lib/memorialDay";
import EmailCapturePopup, { useCheckoutNavigate } from "@/components/cart/EmailCapturePopup";
import { useExitDetection } from "@/hooks/useExitDetection";

// ─── Constants ───────────────────────────────────────────────────────────────

const LS_CART_EMAIL_KEY = "cartEmail";
const LS_CART_SNAPSHOT_KEY = "cartEmailSnapshot";
const SS_ABANDONMENT_SENT = "cartAbandonmentSent";
const SHIPPING_THRESHOLD = 250;
const SHIPPING_COST = 9.99;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Mini countdown ──────────────────────────────────────────────────────────

function MiniCountdown() {
  const [time, setTime] = useState<TimeRemaining>(() => getTimeRemaining());
  const [active, setActive] = useState(() => isPromoActive());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const t = getTimeRemaining();
      setTime(t);
      // t.expired is true only after May 31 (timer rolls over at midnight)
      if (t.expired) setActive(false);
    }, 1000);
    return () => clearInterval(id);
  }, [active]);
  if (!active) return <span className="font-bold text-red-700">SALE ENDED</span>;
  return (
    <span className="font-black tabular-nums text-red-800">
      {pad(time.days)}d {pad(time.hours)}h {pad(time.mins)}m {pad(time.secs)}s
    </span>
  );
}

// ─── Free gift row ────────────────────────────────────────────────────────────

function FreeGiftRow({ label, urgency }: { label: string; urgency?: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-zinc-100 px-5 py-4 last:border-b-0 bg-emerald-50/50">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-2xl">
        🎁
      </div>
      <div className="flex flex-1 items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Free Gift</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-900">{label}</p>
          {urgency ? (
            <p className="text-[11px] font-bold" style={{ color: "#cc0000" }}>{urgency}</p>
          ) : (
            <p className="text-[11px] text-emerald-600 font-semibold">Memorial Day Bonus</p>
          )}
        </div>
        <span className="text-sm font-black text-emerald-600">$0.00</span>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-1 h-3 w-20 rounded bg-zinc-200" />
      <div className="mb-8 h-9 w-44 rounded-lg bg-zinc-200" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-zinc-200">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 border-b border-zinc-100 px-5 py-5 last:border-b-0">
              <div className="h-20 w-20 shrink-0 rounded-xl bg-zinc-200" />
              <div className="flex flex-1 flex-col gap-2.5 py-1">
                <div className="h-2.5 w-14 rounded bg-zinc-200" />
                <div className="h-3.5 w-48 rounded bg-zinc-200" />
                <div className="h-3 w-20 rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-96 rounded-2xl border border-zinc-200 bg-zinc-50" />
      </div>
    </div>
  );
}

// ─── Empty cart ───────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
          <ShoppingBag size={32} className="text-zinc-300" />
        </div>
        <h1 className="mb-2 text-2xl font-black tracking-tight text-zinc-900">Your cart is empty</h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-zinc-500">
          Looks like you haven&apos;t added anything yet. Browse our catalog of research-grade compounds.
        </p>
        <Link href="/shop" className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover">
          Browse Products <ArrowRight size={15} />
        </Link>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {[
            { label: "Weight Loss", href: "/shop?category=Weight+Loss" },
            { label: "Recovery & Healing", href: "/shop?category=Recovery+%26+Healing" },
            { label: "Muscle Growth", href: "/shop?category=Muscle+Growth" },
            { label: "Combos", href: "/shop?category=Combos" },
            { label: "Essentials", href: "/shop?category=Essentials" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Email gate ───────────────────────────────────────────────────────────────

function CartEmailGate({ onCapture }: { onCapture: () => void }) {
  const { items } = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim().toLowerCase();
    if (!EMAIL_RE.test(val)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Build snapshot from current cart
    const cartItems = items.map((item) => ({
      name: item.product.name,
      dose: item.selectedDose.size,
      price: lineUnitPrice(item),
      quantity: item.quantity,
    }));
    const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // Persist
    try {
      localStorage.setItem(LS_CART_EMAIL_KEY, val);
      localStorage.setItem(LS_CART_SNAPSHOT_KEY, JSON.stringify(cartItems));
      localStorage.setItem("checkoutStarted", new Date().toISOString());
    } catch { /* ignore */ }

    // Register cart abandonment (fire-and-forget, non-blocking)
    fetch("/api/register-cart-abandonment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: val, cartItems, cartTotal }),
    }).catch(console.error);

    onCapture();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
          {/* Pink header */}
          <div className="bg-accent px-6 py-5 text-center">
            <p className="text-xl font-black tracking-tight text-white">PeptoBuy</p>
            <p className="mt-0.5 text-xs font-medium text-white/70">Research-Grade Peptides</p>
          </div>

          <div className="px-7 py-8">
            {/* Icon + heading */}
            <div className="mb-6 text-center">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/8">
                <ShoppingBag size={24} className="text-accent" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-zinc-900">
                Enter your email to view your cart
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                We&apos;ll save your cart and send your order confirmation.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  inputMode="email"
                  className={[
                    "w-full rounded-xl border px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-all",
                    error
                      ? "border-red-400 focus:ring-2 focus:ring-red-400/20"
                      : "border-zinc-200 focus:border-accent focus:ring-2 focus:ring-accent/20",
                  ].join(" ")}
                />
                {error && <p className="mt-1.5 text-[12px] font-medium text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                className="flex h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-black text-white shadow-[0_0_24px_rgba(255,45,120,0.25)] transition-all hover:bg-accent-hover active:scale-[0.98]"
              >
                View My Cart <ArrowRight size={16} />
              </button>
            </form>

            <p className="mt-3 text-center text-[12px] text-zinc-400">
              🔒 No spam. Used for order updates only.
            </p>

            {/* Memorial Day urgency */}
            {isPromoActive() && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                <p className="text-[13px] font-bold text-red-700">
                  ⚡ Flash Sale active — Free gifts with your order.
                </p>
                <p className="mt-0.5 text-[12px] text-red-600">
                  Enter your email to claim yours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sticky mobile checkout bar ───────────────────────────────────────────────

function StickyMobileCheckoutBar() {
  const { subtotal, discountAmount } = useCart();
  const [emailPopupOpen, setEmailPopupOpen] = useState(false);
  const { navigateToCheckout } = useCheckoutNavigate();

  const discountedSub = subtotal - (discountAmount ?? 0);
  const freeWeekend = false;
  const shipping = discountedSub >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = discountedSub + shipping;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total</p>
          <p className="text-xl font-black tabular-nums text-zinc-900">${total.toFixed(2)}</p>
        </div>
        <button
          onClick={() => navigateToCheckout(() => setEmailPopupOpen(true))}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-accent text-[15px] font-black text-white shadow-[0_0_24px_rgba(255,45,120,0.3)] active:scale-[0.97]"
        >
          Checkout Now <ArrowRight size={16} />
        </button>
      </div>
      <EmailCapturePopup open={emailPopupOpen} onClose={() => setEmailPopupOpen(false)} />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CartClient() {
  const { items, totalCount, subtotal, hydrated, clearCart } = useCart();
  const [promoActive, setPromoActive] = useState(() => isPromoActive());

  // null = not checked yet (avoid gate flash for returning users)
  const [emailCaptured, setEmailCaptured] = useState<boolean | null>(null);

  // Check localStorage for existing email after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_CART_EMAIL_KEY);
      setEmailCaptured(!!stored && EMAIL_RE.test(stored));
    } catch {
      setEmailCaptured(false);
    }
  }, []);

  // Auto-expire promo ticker
  useEffect(() => {
    if (!promoActive) return;
    const id = setInterval(() => { if (!isPromoActive()) setPromoActive(false); }, 5000);
    return () => clearInterval(id);
  }, [promoActive]);

  // ── Exit detection — fire beacon when leaving with captured email ──────────
  const handleCartExit = useCallback(() => {
    try {
      const storedEmail = localStorage.getItem(LS_CART_EMAIL_KEY);
      const snapshot = localStorage.getItem(LS_CART_SNAPSHOT_KEY);
      if (!storedEmail || !snapshot) return;
      try {
        if (sessionStorage.getItem(SS_ABANDONMENT_SENT)) return;
        sessionStorage.setItem(SS_ABANDONMENT_SENT, "1");
      } catch { /* ignore */ }
      const cartItems = JSON.parse(snapshot) as Array<{ price: number; quantity: number }>;
      const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      navigator.sendBeacon(
        "/api/send-abandoned-cart-email-now",
        JSON.stringify({ email: storedEmail, cartItems, cartTotal }),
      );
    } catch { /* ignore */ }
  }, []);

  useExitDetection(handleCartExit);

  // Show skeleton until both cart and email state are ready
  if (!hydrated || emailCaptured === null) return <Skeleton />;
  if (items.length === 0) return <EmptyCart />;

  // Show email gate before cart contents
  if (!emailCaptured) {
    return <CartEmailGate onCapture={() => setEmailCaptured(true)} />;
  }

  const hasGhkCu = subtotal >= FREE_GHKCU_THRESHOLD;
  const toUnlock = Math.max(0, FREE_GHKCU_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 pb-28 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mb-4">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Review</p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">Your Cart</h1>
        <p className="mt-1.5 text-sm text-zinc-500">
          {totalCount} {totalCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* ── Free shipping banner / urgency nudge ──────────────── */}
      {hasFreeShipping ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="text-base">🚚</span>
          <div>
            <p className="text-sm font-bold text-emerald-700">
              FREE SHIPPING unlocked — Orders $250+
            </p>
            <p className="text-[12px] text-emerald-600">Standard shipping included free on your order.</p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
          <span className="text-base">⚡</span>
          <div>
            <p className="text-sm font-bold text-accent">
              Add ${toFreeShipping.toFixed(2)} more to unlock FREE SHIPPING!
            </p>
            <p className="text-[12px] text-zinc-500">Only ${toFreeShipping.toFixed(2)} away — free shipping on orders $250+</p>
          </div>
        </div>
      )}

      {/* ── Compact gift strip (mobile) ────────────────────── */}
      {promoActive && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 lg:hidden">
          <span className="text-sm font-bold text-emerald-700">✅ Free BAC Water &amp; Syringes added</span>
          {hasGhkCu ? (
            <span className="text-sm font-bold text-amber-700">🎁 Free GHK-Cu (100mg) unlocked!</span>
          ) : (
            <span className="text-sm text-zinc-700">
              🎁 Add <span className="font-bold text-zinc-900">${toUnlock.toFixed(2)}</span> more for free GHK-Cu
            </span>
          )}
        </div>
      )}

      {/* ── Memorial Day promo box (desktop) ───────────────── */}
      {promoActive && (
        <div
          className="mb-6 hidden overflow-hidden rounded-2xl border border-red-200 lg:block"
          style={{ background: "linear-gradient(135deg,#fff5f5 0%,#fff 100%)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "linear-gradient(135deg,#8B0000 0%,#c0392b 100%)" }}
          >
            <span className="text-sm font-black text-white">⚡ Flash Sale — Active</span>
            <span className="text-[12px] font-bold text-white/80">
              Ends in: <MiniCountdown />
            </span>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <span className="text-lg">🎁</span>
              <div>
                <p className="text-sm font-bold text-emerald-700">✅ Free BAC Water &amp; Syringes — added automatically</p>
                <p className="text-[12px] text-zinc-500">
                  <span style={{ color: "#cc0000", fontWeight: 700 }}>⚠️ Only 6 remaining!</span>
                </p>
              </div>
            </div>
            {hasGhkCu ? (
              <div className="flex items-start gap-2.5">
                <span className="text-lg">💛</span>
                <div>
                  <p className="text-sm font-bold text-amber-700">Free GHK-Cu (100mg) Unlocked!</p>
                  <p className="text-[12px] text-zinc-500">Added free — you qualify at $250+</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <span className="text-lg">💛</span>
                <div>
                  <p className="text-sm font-bold text-amber-700">Unlock Free GHK-Cu (100mg)</p>
                  <p className="text-[12px] text-zinc-500">
                    Add <span className="font-bold text-zinc-700">${toUnlock.toFixed(2)}</span> more to qualify
                  </p>
                  <Link href="/shop" className="mt-1 inline-block text-[12px] font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-800">
                    Shop more →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Cart grid ──────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100 shadow-sm">
            {items.map((item) => <CartItemRow key={item.product.id} item={item} />)}
            {promoActive && (
              <FreeGiftRow
                label="BAC Water (10ml) + Syringes — Flash Sale Gift"
                urgency="⚠️ Only 6 left!"
              />
            )}
            {promoActive && hasGhkCu && <FreeGiftRow label="GHK-Cu (100mg)" />}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Link href="/shop" className="text-sm text-zinc-400 transition-colors hover:text-zinc-600">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-red-500">
              <Trash2 size={13} /> Clear cart
            </button>
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </div>
      </div>

      {/* Sticky mobile checkout bar */}
      <StickyMobileCheckoutBar />
    </div>
  );
}
