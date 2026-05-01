"use client";

import Link from "next/link";
import { ShieldCheck, Lock, FlaskConical } from "lucide-react";
import ProductVial from "@/components/product/ProductVial";
import { useCart, lineUnitPrice } from "@/context/CartContext";

interface CheckoutSummaryProps { shippingCost: number; discount?: number }

function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon size={15} className="text-zinc-400" />
      <span className="text-[10px] font-medium leading-tight text-zinc-400">{label}</span>
    </div>
  );
}

export default function CheckoutSummary({ shippingCost, discount = 0 }: CheckoutSummaryProps) {
  const { items, subtotal } = useCart();
  const total = subtotal - discount + shippingCost;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <h2 className="text-sm font-bold text-zinc-900">Order Summary</h2>
        <Link href="/cart" className="text-xs text-zinc-400 transition-colors hover:text-accent">
          Edit cart
        </Link>
      </div>

      {/* Item list */}
      <div className="divide-y divide-zinc-100 overflow-y-auto" style={{ maxHeight: "296px" }}>
        {items.map((item) => {
          const unitPrice = lineUnitPrice(item);
          const lineTotal = unitPrice * item.quantity;
          return (
            <div key={item.itemKey} className="flex items-start gap-3 px-5 py-3.5">
              {/* Image + qty badge */}
              <div className="relative shrink-0">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                  <ProductVial
                    name={item.product.name}
                    dose={item.selectedDose.size}
                    category={item.product.category}
                    className="h-full w-full"
                  />
                </div>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                  {item.quantity}
                </span>
              </div>

              {/* Name + dose metadata */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-zinc-800">
                  {item.product.name}
                </p>

                {/* Dose + reconstitution tags */}
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  <span className="rounded bg-zinc-100 px-1.5 py-px text-[10px] font-medium text-zinc-500">
                    {item.selectedDose.size}
                  </span>
                  {item.reconstitution && (
                    <span className="flex items-center gap-0.5 rounded bg-accent/8 px-1.5 py-px text-[10px] font-medium text-accent">
                      <FlaskConical size={9} />
                      Pre-mixed
                    </span>
                  )}
                </div>
              </div>

              <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                ${lineTotal.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-zinc-100 px-5 py-4">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="tabular-nums text-zinc-900">${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Discount</span>
              <span className="tabular-nums text-emerald-600">-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Shipping</span>
            <span className="tabular-nums text-zinc-900">
              {shippingCost === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                `$${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>
        </div>
        <div className="my-3 h-px bg-zinc-100" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-zinc-900">Total</span>
          <span className="text-xl font-black tabular-nums text-zinc-900">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-t border-zinc-100 px-5 py-4">
        <div className="grid grid-cols-3 divide-x divide-zinc-100">
          <TrustBadge icon={ShieldCheck} label="Secure Checkout" />
          <TrustBadge icon={Lock} label="SSL Encrypted" />
          <TrustBadge icon={ShieldCheck} label="All Sales Final" />
        </div>
      </div>
    </div>
  );
}
