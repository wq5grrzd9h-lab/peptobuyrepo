"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import CartItemRow from "@/components/cart/CartItemRow";
import OrderSummary from "@/components/cart/OrderSummary";
import {
  isPromoActive,
  getTimeRemaining,
  pad,
  FREE_GHKCU_THRESHOLD,
  type TimeRemaining,
} from "@/lib/memorialDay";

// ─── Mini countdown ──────────────────────────────────────────────────────────

function MiniCountdown() {
  const [time, setTime] = useState<TimeRemaining>(() => getTimeRemaining());

  useEffect(() => {
    if (time.expired) return;
    const id = setInterval(() => {
      const t = getTimeRemaining();
      setTime(t);
    }, 1000);
    return () => clearInterval(id);
  }, [time.expired]);

  if (time.expired) return <span className="font-bold text-red-700">SALE ENDED</span>;

  return (
    <span className="font-black tabular-nums text-red-800">
      {pad(time.days)}d {pad(time.hours)}h {pad(time.mins)}m {pad(time.secs)}s
    </span>
  );
}

// ─── Free gift line item ─────────────────────────────────────────────────────

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

export default function CartClient() {
  const { items, totalCount, subtotal, hydrated, clearCart } = useCart();
  const [promoActive, setPromoActive] = useState(() => isPromoActive());

  useEffect(() => {
    if (!promoActive) return;
    const id = setInterval(() => {
      if (!isPromoActive()) setPromoActive(false);
    }, 5000);
    return () => clearInterval(id);
  }, [promoActive]);

  if (!hydrated) return <Skeleton />;
  if (items.length === 0) return <EmptyCart />;

  const hasGhkCu = subtotal >= FREE_GHKCU_THRESHOLD;
  const toUnlock = Math.max(0, FREE_GHKCU_THRESHOLD - subtotal);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Review</p>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">Your Cart</h1>
        <p className="mt-1.5 text-sm text-zinc-500">{totalCount} {totalCount === 1 ? "item" : "items"}</p>
      </div>

      {/* Memorial Day promo summary box */}
      {promoActive && (
        <div
          className="mb-6 overflow-hidden rounded-2xl border border-red-200"
          style={{ background: "linear-gradient(135deg,#fff5f5 0%,#fff 100%)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ background: "linear-gradient(135deg,#8B0000 0%,#c0392b 100%)" }}
          >
            <span className="text-sm font-black text-white">🇺🇸 Memorial Day Sale — Active</span>
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
                  <span style={{ color: "#cc0000", fontWeight: 700 }}>⚠️ Only 11 remaining!</span>
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

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100 shadow-sm">
            {items.map((item) => <CartItemRow key={item.product.id} item={item} />)}
            {/* Free gift rows — display only */}
            {promoActive && (
              <FreeGiftRow
                label="BAC Water (10ml) + Syringes — Memorial Day Gift"
                urgency="⚠️ Only 11 left!"
              />
            )}
            {promoActive && hasGhkCu && <FreeGiftRow label="GHK-Cu (100mg)" />}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Link href="/shop" className="text-sm text-zinc-400 transition-colors hover:text-zinc-600">← Continue Shopping</Link>
            <button onClick={clearCart} className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-red-500">
              <Trash2 size={13} /> Clear cart
            </button>
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
