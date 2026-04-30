"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, RotateCcw } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CheckoutSummaryProps {
  shippingCost: number;
  discount?: number;
}

function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon size={15} className="text-white/30" />
      <span className="text-[10px] font-medium leading-tight text-white/30">{label}</span>
    </div>
  );
}

export default function CheckoutSummary({
  shippingCost,
  discount = 0,
}: CheckoutSummaryProps) {
  const { items, subtotal } = useCart();
  const total = subtotal - discount + shippingCost;

  return (
    <div className="rounded-2xl border border-border bg-surface-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold text-white">Order Summary</h2>
        <Link href="/cart" className="text-xs text-white/35 transition-colors hover:text-accent">
          Edit cart
        </Link>
      </div>

      {/* Item list */}
      <div
        className="divide-y divide-border overflow-y-auto"
        style={{ maxHeight: "272px" }}
      >
        {items.map((item) => {
          const lineTotal = item.product.price * item.quantity;
          return (
            <div key={item.product.id} className="flex items-center gap-3 px-5 py-3.5">
              {/* Image with qty badge */}
              <div className="relative shrink-0">
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-surface-2">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white backdrop-blur-sm">
                  {item.quantity}
                </span>
              </div>

              {/* Name */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-white/80">
                  {item.product.name}
                </p>
                <p className="text-[10px] text-white/35">{item.product.category}</p>
              </div>

              {/* Price */}
              <span className="text-sm font-semibold tabular-nums text-white">
                ${lineTotal.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-border px-5 py-4">
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-white/55">Subtotal</span>
            <span className="tabular-nums text-white">${subtotal.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-white/55">Discount</span>
              <span className="tabular-nums text-emerald-400">
                -${discount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-white/55">Shipping</span>
            <span className="tabular-nums text-white">
              {shippingCost === 0 ? (
                <span className="text-emerald-400">Free</span>
              ) : (
                `$${shippingCost.toFixed(2)}`
              )}
            </span>
          </div>
        </div>

        <div className="my-3 h-px bg-border" />

        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-white">Total</span>
          <span className="text-xl font-black tabular-nums text-white">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-border px-5 py-4">
        <div className="grid grid-cols-3 divide-x divide-border">
          <TrustBadge icon={ShieldCheck} label="Secure Checkout" />
          <TrustBadge icon={Lock} label="SSL Encrypted" />
          <TrustBadge icon={RotateCcw} label="30-Day Returns" />
        </div>
      </div>
    </div>
  );
}
