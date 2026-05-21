"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Tag, X, Check, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

const SHIPPING_THRESHOLD = 250;
const SHIPPING_COST = 9.99;

const TRUST_BADGES = [
  { emoji: "🔒", label: "Secure Checkout" },
  { emoji: "🏅", label: "ISO 9001 Tested" },
  { emoji: "📋", label: "COA On Request" },
];

function Row({ label, value, sub, accent, discount }: {
  label: string; value: string; sub?: string; accent?: boolean; discount?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className={["text-sm", discount ? "text-emerald-600 font-medium" : "text-zinc-500"].join(" ")}>{label}</span>
        {sub && <p className="mt-0.5 text-[11px] text-zinc-400">{sub}</p>}
      </div>
      <span className={["text-sm font-semibold tabular-nums", accent || discount ? "text-emerald-600" : "text-zinc-900"].join(" ")}>{value}</span>
    </div>
  );
}

export default function OrderSummary() {
  const { subtotal, discountAmount, promoCode, applyPromo, removePromo } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [codeAlreadyUsed, setCodeAlreadyUsed] = useState(false);

  // Check localStorage on mount to know whether to show nudge
  useEffect(() => {
    try {
      const used: string[] = JSON.parse(localStorage.getItem("usedDiscountCodes") || "[]");
      setCodeAlreadyUsed(used.includes("FIRST20"));
    } catch { /* ignore */ }
  }, []);

  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const discountedSubtotal = subtotal - discountAmount;
  const total = discountedSubtotal + shipping;
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  const handleApplyPromo = () => {
    setPromoError(null);
    setPromoSuccess(false);
    const result = applyPromo(promoInput);
    if (result.success) {
      setPromoSuccess(true);
      setPromoInput("");
    } else {
      setPromoError(result.error ?? "Invalid code.");
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoSuccess(false);
    setPromoError(null);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-base font-bold text-zinc-900">Order Summary</h2>
      </div>

      <div className="px-5 py-5">
        {/* Totals */}
        <div className="space-y-3">
          <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
          {discountAmount > 0 && (
            <Row
              label={`Discount (${promoCode})`}
              value={`-$${discountAmount.toFixed(2)}`}
              discount
            />
          )}
          <Row
            label="Shipping"
            value={isFreeShipping ? "Free" : `$${shipping.toFixed(2)}`}
            sub={!isFreeShipping ? `Add $${toFreeShipping.toFixed(2)} more for free shipping` : undefined}
            accent={isFreeShipping}
          />
        </div>

        <div className="my-4 h-px bg-zinc-100" />

        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-zinc-900">Estimated Total</span>
          <span className="text-2xl font-black text-zinc-900">${total.toFixed(2)}</span>
        </div>

        {/* Estimated delivery */}
        <p className="mt-2 text-center text-[12px] text-zinc-400">
          📦 Estimated delivery: 3–7 business days
        </p>

        {/* Promo code input */}
        <div className="mt-4">
          {promoCode ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Code applied — 20% off your first order!</span>
              </div>
              <button onClick={handleRemovePromo} className="rounded p-0.5 text-emerald-500 hover:text-emerald-700">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                  placeholder="Promo code"
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-8 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                />
              </div>
              <button
                onClick={handleApplyPromo}
                disabled={!promoInput.trim()}
                className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          )}
          {promoError && (
            <p className="mt-1.5 text-[12px] text-red-500">{promoError}</p>
          )}
        </div>

        {/* FIRST20 nudge — only show if code not applied + never used */}
        {!promoCode && !codeAlreadyUsed && (
          <div className="mt-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
            <p className="text-[13px] leading-snug text-zinc-700">
              🧪 First order? Use code{" "}
              <strong
                className="cursor-pointer select-all rounded bg-accent/10 px-1.5 py-0.5 font-black tracking-wider text-accent"
                title="Click to select"
              >
                FIRST20
              </strong>{" "}
              for 20% off — apply it above before checking out
            </p>
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {TRUST_BADGES.map(({ emoji, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 rounded-xl border border-zinc-100 bg-zinc-50 px-2 py-2.5 text-center"
            >
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-[10px] font-semibold leading-tight text-zinc-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Checkout CTA */}
        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-4 text-[15px] font-black text-white shadow-[0_0_28px_rgba(255,45,120,0.25)] transition-all hover:bg-accent-hover hover:shadow-[0_0_40px_rgba(255,45,120,0.4)] active:scale-[0.98]"
          >
            Proceed to Secure Checkout <ArrowRight size={17} />
          </Link>
          <Link href="/shop" className="flex items-center justify-center gap-1.5 py-1 text-sm text-zinc-400 transition-colors hover:text-zinc-700">
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-zinc-100 px-5 py-3">
        <ShieldCheck size={13} className="text-zinc-300" />
        <span className="text-[11px] text-zinc-400">Secure checkout — 256-bit SSL encryption</span>
      </div>
    </div>
  );
}
