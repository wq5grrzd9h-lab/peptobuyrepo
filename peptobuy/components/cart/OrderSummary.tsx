"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, ChevronRight, ArrowLeft, X, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

const PROMO_CODES: Record<string, { rate: number; label: string }> = {
  PEPTOBUYDEAL: { rate: 0.1, label: "10% off" },
};

const SHIPPING_THRESHOLD = 75;
const SHIPPING_COST = 9.99;

function Row({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-sm text-white/60">{label}</span>
        {sub && <p className="mt-0.5 text-[11px] text-white/30">{sub}</p>}
      </div>
      <span
        className={[
          "text-sm font-semibold tabular-nums",
          accent ? "text-emerald-400" : "text-white",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

export default function OrderSummary() {
  const { subtotal } = useCart();
  const { toast } = useToast();
  const [promoInput, setPromoInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState("");

  const promo = appliedCode ? PROMO_CODES[appliedCode] : null;
  const discount = promo ? subtotal * promo.rate : 0;
  const discountedSubtotal = subtotal - discount;
  const isFreeShipping = discountedSubtotal >= SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = discountedSubtotal + shipping;
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - discountedSubtotal);

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedCode(code);
      setPromoError("");
      setPromoInput("");
      toast.success("Promo applied!", `${PROMO_CODES[code].label} has been added to your order`);
    } else {
      setPromoError("Invalid promo code. Try PEPTOBUYDEAL");
      toast.error("Invalid promo code", "Double-check the code and try again");
    }
  };

  const removePromo = () => {
    setAppliedCode(null);
    setPromoInput("");
    setPromoError("");
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-1">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-bold text-white">Order Summary</h2>
      </div>

      <div className="px-5 py-5">
        {/* Breakdown */}
        <div className="space-y-3">
          <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />

          {promo && (
            <Row
              label={`Promo (${appliedCode})`}
              value={`-$${discount.toFixed(2)}`}
              accent
            />
          )}

          <Row
            label="Shipping"
            value={isFreeShipping ? "Free" : `$${shipping.toFixed(2)}`}
            sub={
              !isFreeShipping
                ? `Add $${toFreeShipping.toFixed(2)} more for free shipping`
                : undefined
            }
            accent={isFreeShipping}
          />
        </div>

        <div className="my-4 h-px bg-border" />

        {/* Total */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-white">Estimated Total</span>
          <span className="text-2xl font-black text-white">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Promo code */}
        <div className="mt-5">
          {appliedCode ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Tag size={13} className="text-emerald-400" />
                <span className="text-sm font-bold text-emerald-400">
                  {appliedCode}
                </span>
                <span className="text-xs text-emerald-400/60">
                  — {promo?.label}
                </span>
              </div>
              <button
                onClick={removePromo}
                aria-label="Remove promo code"
                className="rounded p-0.5 text-white/30 hover:text-white/60"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                  className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-mono tracking-wide text-white placeholder:text-white/20 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  onClick={applyPromo}
                  className="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="mt-1.5 text-xs text-red-400">{promoError}</p>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-5 flex flex-col gap-3">
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.25)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.4)] active:scale-[0.98]"
          >
            Continue to Checkout
            <ChevronRight size={16} />
          </Link>

          <Link
            href="/shop"
            className="flex items-center justify-center gap-1.5 py-1 text-sm text-white/35 transition-colors hover:text-white/70"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-2 border-t border-border px-5 py-3">
        <ShieldCheck size={13} className="text-white/20" />
        <span className="text-[11px] text-white/25">
          Secure checkout — 256-bit SSL encryption
        </span>
      </div>
    </div>
  );
}
