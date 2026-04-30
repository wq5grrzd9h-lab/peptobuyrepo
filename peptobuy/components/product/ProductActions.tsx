"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Minus, Plus, Check } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock || added) return;
    addItem(product, qty);
    toast.cart("Added to cart", `${qty}× ${product.name}`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addItem(product, qty);
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-white/50">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-border bg-surface-2">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-10 text-center text-sm font-bold tabular-nums text-white">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={qty >= 99}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none",
            added
              ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)]"
              : "bg-accent text-white shadow-[0_0_20px_rgba(255,45,120,0.3)] hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.45)] disabled:bg-white/8 disabled:text-white/25",
          ].join(" ")}
        >
          {added ? (
            <>
              <Check size={16} />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Add to Cart
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/12 py-3.5 text-sm font-bold text-white/80 transition-all duration-150 hover:border-white/25 hover:bg-white/5 hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Zap size={16} />
          Buy Now
        </button>
      </div>

      {product.inStock && (
        <p className="text-center text-xs text-white/25">
          Free shipping on orders over $75
        </p>
      )}
    </div>
  );
}
