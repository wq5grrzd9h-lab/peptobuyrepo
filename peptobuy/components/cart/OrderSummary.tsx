"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";

const SHIPPING_THRESHOLD = 200;
const SHIPPING_COST = 9.99;

function Row({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-sm text-zinc-500">{label}</span>
        {sub && <p className="mt-0.5 text-[11px] text-zinc-400">{sub}</p>}
      </div>
      <span className={["text-sm font-semibold tabular-nums", accent ? "text-emerald-600" : "text-zinc-900"].join(" ")}>{value}</span>
    </div>
  );
}

export default function OrderSummary() {
  const { subtotal } = useCart();

  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const toFreeShipping = Math.max(0, SHIPPING_THRESHOLD - subtotal);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-4">
        <h2 className="text-base font-bold text-zinc-900">Order Summary</h2>
      </div>

      <div className="px-5 py-5">
        <div className="space-y-3">
          <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
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
