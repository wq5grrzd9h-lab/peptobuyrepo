"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, CheckCircle2, XCircle, Check, ChevronDown } from "lucide-react";
import { Product } from "@/lib/products";
import Badge, { resolveBadgeVariant } from "@/components/ui/Badge";
import { useCart, RECONSTITUTION_PRICE } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [doseIdx, setDoseIdx] = useState(0);
  const [recon, setRecon] = useState(false);
  const [added, setAdded] = useState(false);
  const [retaStock, setRetaStock] = useState<number | null>(null);

  useEffect(() => {
    if (product.id !== "rtglp3") return;
    fetch("/api/get-reta-stock")
      .then((r) => r.json())
      .then((d) => { if (typeof d.stock === "number") setRetaStock(d.stock); })
      .catch(() => {});
  }, [product.id]);

  const isEssentials = product.category === "Essentials";
  const selectedDose = product.doses[doseIdx];
  const unitPrice = selectedDose.price + (recon && !isEssentials ? RECONSTITUTION_PRICE : 0);

  const effectiveInStock =
    product.id === "rtglp3" && retaStock !== null ? retaStock > 0 : product.inStock;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!effectiveInStock || added) return;
    addItem(product, selectedDose, 1, !isEssentials && recon);
    toast.cart(
      "Added to cart",
      `${product.name} · ${selectedDose.size}${recon && !isEssentials ? " · Pre-mixed" : ""}`
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article
      onClick={() => router.push(`/shop/${product.id}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 cursor-pointer hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(255,45,120,0.14)] hover:-translate-y-0.5"
    >

      {/* ── Full-card link overlay ──────────────────────────
          Catches taps on image / price / any dead zone.
          Interactive elements sit above it via z-[1].       */}
      <Link
        href={`/shop/${product.id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      />

      {/* ── Image ─────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain transition-all duration-300 group-hover:scale-105 group-hover:[filter:drop-shadow(0_0_14px_rgba(255,45,120,0.22))]"
        />
        {product.badge && (
          <div className="absolute left-3 top-3 z-[1]">
            <Badge label={product.badge} variant={resolveBadgeVariant(product.badge)} />
          </div>
        )}
      </div>

      {/* ── Info ──────────────────────────────────────────── */}
      <div className="relative z-[1] flex flex-1 flex-col gap-2.5 p-4">

        {/* Category + research badge */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
            {product.category}
          </p>
          <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
            Research Only
          </span>
        </div>

        {/* Name — larger on mobile */}
        <Link href={`/shop/${product.id}`} className="z-[1]" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-base font-bold leading-snug text-zinc-900 transition-colors hover:text-accent sm:text-sm sm:font-semibold">
            {product.name}
          </h3>
        </Link>

        {/* ── Dose selector ───────────────────────────────── */}
        {product.doses.length > 1 ? (
          <div className="relative z-[1]">
            <select
              value={doseIdx}
              onChange={(e) => setDoseIdx(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-full appearance-none rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-7 text-sm font-semibold text-zinc-900 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 sm:py-1.5 sm:text-xs"
            >
              {product.doses.map((dose, i) => (
                <option key={dose.size} value={i}>
                  {dose.size} — ${dose.price.toFixed(2)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-3 text-sm font-semibold text-zinc-700 sm:py-1.5 sm:text-xs">
            {product.doses[0].size}
          </div>
        )}

        {/* ── Reconstitution toggle (hidden for Essentials) ── */}
        {!isEssentials && (
          <label
            className="relative z-[1] flex cursor-pointer items-start gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-2.5 py-2 transition-colors hover:border-zinc-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={[
                "mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-all",
                recon ? "border-accent bg-accent" : "border-zinc-300 bg-white",
              ].join(" ")}
            >
              {recon && <Check size={9} className="text-white" strokeWidth={3} />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={recon}
              onChange={(e) => setRecon(e.target.checked)}
            />
            <span className="text-[11px] leading-tight text-zinc-600">
              Pre-mixed reconstitution{" "}
              <span className="font-bold text-accent">+${RECONSTITUTION_PRICE.toFixed(2)}</span>
            </span>
          </label>
        )}

        {/* ── Live unit price — larger on mobile ───────────── */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-zinc-900 sm:text-lg">${unitPrice.toFixed(2)}</span>
          <span className="text-xs text-zinc-400">/ {selectedDose.size}</span>
        </div>

        {/* ── RTGLP3 backorder badge ───────────────────────────── */}
        {product.id === "rtglp3" && (
          <div className="animate-pulse rounded-lg bg-orange-100 px-3 py-1.5 text-center text-[11px] font-bold text-orange-800">
            🔥 VERY LOW STOCK — Act Fast
          </div>
        )}

        {/* ── Stock + CTA ──────────────────────────────────── */}
        <div className="mt-auto flex flex-col gap-2 pt-0.5">
          <div className="flex items-center gap-1.5">
            {effectiveInStock ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span className="text-[12px] text-emerald-600">In stock</span>
              </>
            ) : (
              <>
                <XCircle size={13} className="text-zinc-400" />
                <span className="text-[12px] text-zinc-400">Out of stock</span>
              </>
            )}
          </div>

          {/* Taller button on mobile — 56px vs 42px on desktop */}
          <button
            onClick={handleAddToCart}
            disabled={!effectiveInStock}
            className={[
              "relative z-[1] flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-[15px] font-bold transition-all duration-200 active:scale-[0.97] sm:py-2.5 sm:text-sm sm:font-semibold",
              added
                ? "bg-emerald-500 text-white"
                : "bg-accent text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400",
            ].join(" ")}
          >
            {added ? (
              <><Check size={15} /> Added!</>
            ) : (
              <><ShoppingCart size={15} />{effectiveInStock ? "Add to Cart" : "Out of Stock"}</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
