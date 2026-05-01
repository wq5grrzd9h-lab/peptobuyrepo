"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Minus, Plus, Check, Info } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart, RECONSTITUTION_PRICE, lineUnitPrice } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

const RECON_TOOLTIP =
  "Your vial will arrive reconstituted and labeled with per-dose markings. For research use only.";

// ─── Inline tooltip ───────────────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex cursor-help">
      <Info size={13} className="text-zinc-400 transition-colors group-hover:text-zinc-600" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white p-3 text-xs leading-relaxed text-zinc-600 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {text}
        <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-200" />
        <span className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
      </span>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedDose, setSelectedDose] = useState(product.doses[0]);
  const [recon, setRecon] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isEssentials = product.category === "Essentials";
  const unitPrice = selectedDose.price + (recon && !isEssentials ? RECONSTITUTION_PRICE : 0);

  const handleAddToCart = () => {
    if (!product.inStock || added) return;
    addItem(product, selectedDose, qty, !isEssentials && recon);
    toast.cart("Added to cart", `${product.name} · ${selectedDose.size}${recon && !isEssentials ? " · Pre-mixed" : ""}`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addItem(product, selectedDose, qty, !isEssentials && recon);
    router.push("/cart");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Dose / volume selector ──────────────────────────── */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
          {isEssentials ? "Volume" : "Dose"}
        </p>
        <div className="flex flex-wrap gap-2">
          {product.doses.map((dose) => {
            const active = dose.size === selectedDose.size;
            return (
              <button
                key={dose.size}
                type="button"
                onClick={() => setSelectedDose(dose)}
                className={[
                  "flex flex-col items-center rounded-xl border px-4 py-2.5 text-left transition-all duration-150",
                  active
                    ? "border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(255,45,120,0.25)]"
                    : "border-zinc-200 bg-white hover:border-zinc-300",
                ].join(" ")}
              >
                <span className={`text-sm font-bold ${active ? "text-accent" : "text-zinc-700"}`}>
                  {dose.size}
                </span>
                <span className="text-[11px] text-zinc-400">${dose.price.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Reconstitution add-on (hidden for Essentials / BAC Water) ─── */}
      {!isEssentials && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            {/* Custom checkbox */}
            <div
              onClick={() => setRecon((v) => !v)}
              className={[
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all",
                recon ? "border-accent bg-accent" : "border-zinc-300 bg-white hover:border-zinc-400",
              ].join(" ")}
            >
              {recon && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={recon}
              onChange={(e) => setRecon(e.target.checked)}
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-zinc-900">
                  Add reconstitution service
                </span>
                <span className="text-sm font-bold text-accent">
                  +${RECONSTITUTION_PRICE.toFixed(2)}/vial
                </span>
                <InfoTooltip text={RECON_TOOLTIP} />
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                Vial delivered pre-mixed and labeled with dosages
              </p>
            </div>
          </label>
        </div>
      )}

      {/* ── Live price ──────────────────────────────────────── */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-zinc-900">${unitPrice.toFixed(2)}</span>
        <span className="text-sm text-zinc-400">per {selectedDose.size}</span>
        {recon && !isEssentials && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            incl. reconstitution
          </span>
        )}
      </div>

      {/* ── Quantity selector ────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-500">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span className="min-w-10 text-center text-sm font-bold tabular-nums text-zinc-900">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={qty >= 99}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* ── CTA buttons ──────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none",
            added
              ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.25)]"
              : "bg-accent text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.35)] disabled:bg-zinc-200 disabled:text-zinc-400",
          ].join(" ")}
        >
          {added ? <><Check size={16} /> Added!</> : <><ShoppingCart size={16} /> Add to Cart</>}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3.5 text-sm font-bold text-zinc-700 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Zap size={16} /> Order Now
        </button>
      </div>

      {product.inStock && (
        <p className="text-center text-xs text-zinc-400">
          Free shipping on orders over $200
        </p>
      )}
    </div>
  );
}
