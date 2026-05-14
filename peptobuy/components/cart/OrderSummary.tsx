"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldCheck, Tag, X, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

const SHIPPING_THRESHOLD = 250;
const SHIPPING_COST = 9.99;

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
          {promoSuccess && !promoCode && (
            <p className="mt-1.5 text-[12px] text-emerald-600">Code applied — 20% off your first order!</p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <Link href="/checkout" className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.35)] active:scale-[0.98]">
            Continue to Checkout <ChevronRight size={16} />
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
