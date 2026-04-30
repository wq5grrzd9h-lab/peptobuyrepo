"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/context/CartContext";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;
  const lineSavings =
    product.originalPrice
      ? (product.originalPrice - product.price) * quantity
      : 0;

  return (
    <div className="flex gap-4 px-5 py-5 sm:gap-5">
      {/* Product image */}
      <Link
        href={`/shop/${product.id}`}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-24 sm:w-24"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Name row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
              {product.category}
            </p>
            <Link href={`/shop/${product.id}`}>
              <h3 className="truncate text-sm font-semibold text-white transition-colors hover:text-accent">
                {product.name}
              </h3>
            </Link>
            <p className="mt-0.5 text-xs text-white/35">
              ${product.price.toFixed(2)}{" "}
              <span className="text-white/20">ea.</span>
            </p>
          </div>

          {/* Remove */}
          <button
            onClick={() => removeItem(product.id)}
            aria-label={`Remove ${product.name}`}
            className="shrink-0 rounded-lg p-1.5 text-white/25 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Qty + price row */}
        <div className="flex items-center justify-between gap-3">
          {/* Qty controls */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border bg-surface-2">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={12} />
            </button>
            <span className="min-w-8 text-center text-sm font-bold tabular-nums text-white">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= 99}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Line total */}
          <div className="text-right">
            <p className="text-sm font-bold text-white">
              ${lineTotal.toFixed(2)}
            </p>
            {lineSavings > 0 && (
              <p className="text-[11px] text-emerald-400/70">
                Save ${lineSavings.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
