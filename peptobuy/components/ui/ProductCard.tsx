"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, CheckCircle2, XCircle, Check } from "lucide-react";
import { Product } from "@/lib/products";
import Badge, { resolveBadgeVariant } from "@/components/ui/Badge";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    if (!product.inStock || added) return;
    addItem(product, 1);
    toast.cart("Added to cart", product.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-surface-1 overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_32px_rgba(255,45,120,0.12)]">
      {/* Image — linked to detail page */}
      <Link
        href={`/shop/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <div className="absolute left-3 top-3">
            <Badge label={product.badge} variant={resolveBadgeVariant(product.badge)} />
          </div>
        )}
        {discount && (
          <div className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">
            -{discount}%
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
          {product.category}
        </p>

        <Link href={`/shop/${product.id}`}>
          <h3 className="text-sm font-semibold leading-snug text-white hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-white/35 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            {product.inStock ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span className="text-[12px] text-emerald-400/80">In stock</span>
              </>
            ) : (
              <>
                <XCircle size={13} className="text-white/30" />
                <span className="text-[12px] text-white/30">Out of stock</span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={[
              "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]",
              added
                ? "bg-emerald-500 text-white"
                : "bg-accent text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30",
            ].join(" ")}
          >
            {added ? (
              <>
                <Check size={15} />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
