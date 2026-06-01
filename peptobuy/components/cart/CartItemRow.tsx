"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, FlaskConical } from "lucide-react";
import { useCart, lineUnitPrice, type CartItem } from "@/context/CartContext";
import Image from "next/image";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity, selectedDose, reconstitution, itemKey, isSubscription } = item;

  const unitPrice = lineUnitPrice(item);
  const lineTotal = unitPrice * quantity;

  return (
    <div className="flex gap-4 px-5 py-5 sm:gap-5">
      {/* Thumbnail */}
      <Link
        href={`/shop/${product.id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24"
      >
        <Image src={product.image} alt={product.name} fill sizes="96px" className="object-contain" />
      </Link>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Name row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {product.category}
            </p>
            <Link href={`/shop/${product.id}`}>
              <h3 className="truncate text-sm font-semibold text-zinc-900 transition-colors hover:text-accent">
                {product.name}
              </h3>
            </Link>

            {/* Selected dose + reconstitution metadata */}
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                {selectedDose.size}
              </span>
              {reconstitution && (
                <span className="flex items-center gap-1 rounded-full bg-accent/8 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  <FlaskConical size={10} />
                  Pre-mixed +$19.99
                </span>
              )}
              {isSubscription && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  🔄 Monthly · 10% off
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-zinc-500">
              ${unitPrice.toFixed(2)}{" "}
              <span className="text-zinc-400">ea.</span>
            </p>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeItem(itemKey)}
            aria-label={`Remove ${product.name}`}
            className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Qty + line total */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <button
              onClick={() => updateQuantity(itemKey, quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={12} />
            </button>
            <span className="min-w-8 text-center text-sm font-bold tabular-nums text-zinc-900">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(itemKey, quantity + 1)}
              disabled={quantity >= 99}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={12} />
            </button>
          </div>

          <p className="text-sm font-bold text-zinc-900">${lineTotal.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
