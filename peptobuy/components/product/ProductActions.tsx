"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Minus, Plus, Check, Info } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart, RECONSTITUTION_PRICE, lineUnitPrice } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { isPromoActive, isFreeShippingWeekend, getUrgencyText } from "@/lib/memorialDay";

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
  const [urgencyText, setUrgencyText] = useState(() => getUrgencyText());
  const [retaStock, setRetaStock] = useState<number | null>(null);
  const [isSubscription, setIsSubscription] = useState(false);

  // Sticky bar visibility — show when main CTA buttons scroll off screen
  const ctaRef = useRef<HTMLDivElement>(null);
  const [stickyVisible, setStickyVisible] = useState(false);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Refresh urgency text every 30s so "X hours left" stays accurate
  useEffect(() => {
    if (!isPromoActive()) return;
    const id = setInterval(() => setUrgencyText(getUrgencyText()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Fetch live RETA stock for RTGLP3 product page
  useEffect(() => {
    if (product.id !== "rtglp3") return;
    fetch("/api/get-reta-stock")
      .then((r) => r.json())
      .then((d) => { if (typeof d.stock === "number") setRetaStock(d.stock); })
      .catch(() => {});
  }, [product.id]);

  const isEssentials = product.category === "Essentials";
  const basePrice = selectedDose.price + (recon && !isEssentials ? RECONSTITUTION_PRICE : 0);
  const unitPrice = isSubscription ? Math.round(basePrice * 0.9 * 100) / 100 : basePrice;
  // For RTGLP3: treat stock=0 as out of stock; stock=null means still loading (assume in-stock)
  const effectiveInStock =
    product.id === "rtglp3" && retaStock !== null ? retaStock > 0 : product.inStock;

  const handleAddToCart = () => {
    if (!effectiveInStock || added) return;
    addItem(product, selectedDose, qty, !isEssentials && recon, isSubscription);
    toast.cart("Added to cart", `${product.name} · ${selectedDose.size}${recon && !isEssentials ? " · Pre-mixed" : ""}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "AddToCart", { value: unitPrice * qty, currency: "USD" });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!effectiveInStock) return;
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

      {/* ── Purchase type selector ──────────────────────────── */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Purchase Type</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsSubscription(false)}
            className={[
              "rounded-xl border p-3 text-left transition-all",
              !isSubscription ? "border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(255,45,120,0.25)]" : "border-zinc-200 bg-white hover:border-zinc-300",
            ].join(" ")}
          >
            <p className={`text-sm font-bold ${!isSubscription ? "text-accent" : "text-zinc-700"}`}>One-Time Purchase</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">${basePrice.toFixed(2)}</p>
          </button>
          <button
            type="button"
            onClick={() => setIsSubscription(true)}
            className={[
              "rounded-xl border p-3 text-left transition-all",
              isSubscription ? "border-accent bg-accent/5 shadow-[0_0_0_1px_rgba(255,45,120,0.25)]" : "border-zinc-200 bg-white hover:border-zinc-300",
            ].join(" ")}
          >
            <div className="flex items-center gap-1.5">
              <p className={`text-sm font-bold ${isSubscription ? "text-accent" : "text-zinc-700"}`}>Subscribe & Save 10% 🔄</p>
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-400">Only ${(basePrice * 0.9).toFixed(2)}/month</p>
            <p className="mt-0.5 text-[10px] text-zinc-400">3 month minimum</p>
          </button>
        </div>
        {isSubscription && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">📋 Subscription Commitment</p>
            <p className="text-[12px] leading-relaxed text-amber-800">
              By subscribing you agree to a minimum 3 month commitment. Your card will be charged{" "}
              <strong>${(basePrice * 0.9).toFixed(2)}</strong> today and on the same date each month for at least 3 months.
              After 3 months you may cancel anytime by emailing{" "}
              <a href="mailto:peptobuy@gmail.com" className="font-semibold underline">peptobuy@gmail.com</a>
            </p>
          </div>
        )}
      </div>

      {/* ── Reconstitution add-on (hidden for Essentials / BAC Water) ─── */}
      {!isEssentials && (
        <label className="block cursor-pointer rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:border-zinc-300">
          <div className="flex items-start gap-3">
            <div
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
          </div>
        </label>
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

      {/* ── RTGLP3 backorder notice ──────────────────────────── */}
      {product.id === "rtglp3" && (
        <div className="animate-pulse rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-center text-sm font-bold text-orange-800">
          ⚠️ Very Low Stock — Back Order
        </div>
      )}

      {/* ── CTA buttons ──────────────────────────────────────── */}
      <div ref={ctaRef} className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={!effectiveInStock}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:shadow-none",
            added
              ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.25)]"
              : "bg-accent text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.35)] disabled:bg-zinc-200 disabled:text-zinc-400",
          ].join(" ")}
        >
          {added ? <><Check size={16} /> Added!</> : <><ShoppingCart size={16} /> {!effectiveInStock ? "Out of Stock" : isSubscription ? "Subscribe & Save →" : "Add to Cart"}</>}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={!effectiveInStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3.5 text-sm font-bold text-zinc-700 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Zap size={16} /> Order Now
        </button>
      </div>

      {effectiveInStock && (
        <p className="text-center text-xs text-zinc-400">
          {"🚚 FREE SHIPPING on orders $250+"}
        </p>
      )}

      {product.id === "rtglp3" && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <p className="text-[12px] leading-relaxed text-orange-800">
            <strong>Due to extremely high demand, RTGLP3 is currently on backorder.</strong> Orders will ship as soon as stock is replenished. Thank you for your patience.
          </p>
        </div>
      )}

      {product.id === "bac-water" && (
        <div className="space-y-2">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="mb-1 text-[12px] font-bold text-red-800">❌ BAC Water is currently sold out.</p>
            <p className="text-[11px] leading-relaxed text-red-700">
              Every purchase automatically includes a voucher for free BAC Water on your next order.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-[12px] font-bold text-emerald-800">🎁 FREE BAC Water Voucher — included with every order while sold out.</p>
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-zinc-400">All sales final. No returns or refunds.</p>

      {/* Flash Sale urgency banner */}
      {effectiveInStock && isPromoActive() && (
        <div
          className="rounded-xl border border-red-200 px-4 py-3 text-center"
          style={{ background: "linear-gradient(135deg,#fff5f5 0%,#fff8f8 100%)" }}
        >
          <p className="text-[12px] font-bold text-red-800">
            ⚡ Flash Sale Active — 🚚 Free Shipping on $250+
          </p>
          <p className="mt-1 text-[11px] font-bold text-emerald-700">
            🎁 Free BAC Water Voucher — included with every order
          </p>
          <p className="mt-0.5 text-[11px] font-bold" style={{ color: "#cc5500" }}>
            🎁 Free GHK-Cu (100mg) — orders $250+ · Only 3 remaining
          </p>
          <p className="mt-0.5 text-[11px] font-bold" style={{ color: "#cc0000" }}>
            ⚠️ RTGLP3 (Reta 🐀) — On backorder · High demand
          </p>
          {urgencyText && (
            <p className="mt-0.5 text-[11px] font-bold text-red-700">
              ⏰ {urgencyText} — Ends at Midnight EST
            </p>
          )}
        </div>
      )}

      {/* ── Sticky mobile add-to-cart bar ────────────────────
          Appears when the main CTA buttons scroll off screen.
          Hidden on lg+ (desktop has sidebar layout).          */}
      {stickyVisible && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            {/* Product info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-zinc-900">{product.name}</p>
              <p className="text-base font-black text-accent">${unitPrice.toFixed(2)}</p>
            </div>

            {/* Qty mini stepper */}
            <div className="flex items-center overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="flex h-10 w-9 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-30"
              >
                <Minus size={13} />
              </button>
              <span className="min-w-[1.75rem] text-center text-sm font-bold tabular-nums text-zinc-900">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                disabled={qty >= 99}
                className="flex h-10 w-9 items-center justify-center text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-30"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!effectiveInStock}
              className={[
                "flex h-[52px] min-w-[140px] items-center justify-center gap-2 rounded-xl text-[15px] font-black text-white transition-all active:scale-[0.97] disabled:opacity-40",
                added
                  ? "bg-emerald-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                  : "bg-accent shadow-[0_0_20px_rgba(255,45,120,0.25)] hover:bg-accent-hover",
              ].join(" ")}
            >
              {added ? <><Check size={16} /> Added!</> : <><ShoppingCart size={16} /> Add to Cart</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
