"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-1 h-3 w-20 rounded bg-surface-1" />
      <div className="mb-8 h-9 w-44 rounded-lg bg-surface-1" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-2xl border border-border">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 border-b border-border px-5 py-5 last:border-b-0"
            >
              <div className="h-20 w-20 shrink-0 rounded-xl bg-surface-1" />
              <div className="flex flex-1 flex-col gap-2.5 py-1">
                <div className="h-2.5 w-14 rounded bg-surface-1" />
                <div className="h-3.5 w-48 rounded bg-surface-1" />
                <div className="h-3 w-20 rounded bg-surface-1" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-96 rounded-2xl border border-border bg-surface-1" />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface-1">
          <ShoppingBag size={32} className="text-white/15" />
        </div>
        <h1 className="mb-2 text-2xl font-black tracking-tight text-white">
          Your cart is empty
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-white/40">
          Looks like you haven&apos;t added anything yet. Browse our catalog of
          performance supplements and find your stack.
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
        >
          Browse Products <ArrowRight size={15} />
        </Link>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {["Supplements", "Recovery", "Bundles", "Essentials"].map((cat) => (
            <Link
              key={cat}
              href={`/shop/${cat.toLowerCase()}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CartClient() {
  const { items, totalCount, hydrated, clearCart } = useCart();

  if (!hydrated) return <Skeleton />;
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          Review
        </p>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Your Cart
        </h1>
        <p className="mt-1.5 text-sm text-white/40">
          {totalCount} {totalCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left — item list */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-1 divide-y divide-border">
            {items.map((item) => (
              <CartItemRow key={item.product.id} item={item} />
            ))}
          </div>

          {/* Clear cart */}
          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/shop"
              className="text-sm text-white/30 transition-colors hover:text-white/60"
            >
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 text-sm text-white/25 transition-colors hover:text-red-400"
            >
              <Trash2 size={13} />
              Clear cart
            </button>
          </div>
        </div>

        {/* Right — summary (sticky on desktop) */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
