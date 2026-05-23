"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2, Package, MapPin, Truck, ArrowRight, Home, Clock, Copy, Check,
} from "lucide-react";

interface OrderItem {
  productId: string; name: string; price: number; quantity: number;
  image: string; category: string; selectedDose?: string; reconstitution?: boolean;
}
interface OrderAddress {
  firstName: string; lastName: string; address: string;
  city: string; state: string; zip: string; country: string;
}
interface OrderData {
  orderNumber: string; email: string; placedAt: string;
  paymentMethod?: "card" | "crypto" | "zelle";
  paymentStatus?: string;
  items: OrderItem[];
  subtotal: number; shippingCost: number; total: number;
  shippingAddress: OrderAddress; shippingMethod: "standard" | "express";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
function estimatedDelivery(method: "standard" | "express", placedAt: string) {
  const d = new Date(placedAt);
  d.setDate(d.getDate() + (method === "express" ? 2 : 5));
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-800"
      aria-label="Copy order number"
    >
      {copied ? <><Check size={11} className="text-emerald-600" /><span className="text-emerald-600">Copied</span></> : <><Copy size={11} />Copy</>}
    </button>
  );
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let email = "";
    try {
      const raw = localStorage.getItem("peptobuy-last-order");
      if (!raw) { router.replace("/"); return; }
      const parsed = JSON.parse(raw) as OrderData;
      setOrder(parsed);
      email = parsed.email ?? "";
    } catch { router.replace("/"); } finally { setLoading(false); }

    // Cancel any pending abandoned cart job and clear capture keys
    if (email) {
      fetch("/api/cancel-abandoned-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch((err) => console.error("[order-confirm cancel]", err));
    }
    try {
      localStorage.removeItem("checkoutEmail");
      localStorage.removeItem("checkoutCartSnapshot");
      localStorage.removeItem("checkoutStarted");
      sessionStorage.removeItem("capturedEmail");
    } catch { /* ignore */ }
  }, [router]);

  useEffect(() => {
    if (!order) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      window.goaffpro_order = {
        number: ${JSON.stringify(order.orderNumber)},
        total: ${order.total}
      };
      if (typeof window.goaffproTrackConversion !== "undefined") {
        window.goaffproTrackConversion(window.goaffpro_order);
      }
    `;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [order]);

  useEffect(() => {
    if (!order) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "Purchase", { value: order.total, currency: "USD" });
    }
  }, [order]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-accent" /></div>;
  }
  if (!order) return null;

  const isZelle = order.paymentMethod === "zelle";

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">

      {/* ── Hero header ── */}
      <div className="mb-10 flex flex-col items-center text-center" style={{ animation: "fade-up 0.5s ease-out both" }}>
        {isZelle ? (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50" style={{ animation: "check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>
              <Clock size={40} className="text-amber-500" />
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">Awaiting Payment</p>
            <h1 className="mb-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Order Placed, {order.shippingAddress.firstName}!
            </h1>
            <p className="text-sm text-zinc-500">
              Complete your Zelle payment to confirm your order.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50" style={{ animation: "check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>
              <CheckCircle2 size={44} className="text-emerald-600" />
            </div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">Order Confirmed</p>
            <h1 className="mb-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Thank you, {order.shippingAddress.firstName}!
            </h1>
            <p className="text-sm text-zinc-500">
              A confirmation has been sent to <span className="font-semibold text-zinc-700">{order.email}</span>
            </p>
          </>
        )}
      </div>

      {/* ── Zelle payment instructions ── */}
      {isZelle && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm" style={{ animation: "fade-up 0.5s ease-out 0.1s both" }}>
          <div className="flex items-center gap-2.5 border-b border-amber-200 bg-amber-100/60 px-6 py-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-black text-purple-600 shadow-sm">Z</span>
            <span className="text-sm font-bold text-amber-900">Complete Your Zelle Payment</span>
          </div>
          <div className="p-6">
            {/* Order number + copy */}
            <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-white px-4 py-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Your Order Number</p>
                <p className="mt-0.5 font-mono text-xl font-black tracking-widest text-zinc-900">{order.orderNumber}</p>
              </div>
              <CopyButton text={order.orderNumber} />
            </div>

            {/* Steps */}
            <ol className="space-y-3">
              {[
                <>Open your bank app and start a <strong>Zelle</strong> payment.</>,
                <>Send <strong className="text-amber-900">${order.total.toFixed(2)}</strong> to <strong className="font-mono text-amber-900">peptobuy@gmail.com</strong>.</>,
                <>In the Zelle <strong>memo / comments</strong> field, enter <em>only</em> your order number: <strong className="font-mono">{order.orderNumber}</strong>.</>,
                <>We&apos;ll confirm your order via <strong>{order.email}</strong> once payment is received.</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-amber-900">{step}</span>
                </li>
              ))}
            </ol>

            {/* Zelle address */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-500">Zelle Address</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-purple-900">peptobuy@gmail.com</p>
              </div>
              <CopyButton text="peptobuy@gmail.com" />
            </div>
          </div>
        </div>
      )}

      {/* ── Order details ── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm" style={{ animation: "fade-up 0.5s ease-out 0.15s both" }}>
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Package size={16} className="text-accent" />
            <span className="text-sm font-bold text-zinc-900">Order Details</span>
          </div>
          <span className="text-xs text-zinc-400">{formatDate(order.placedAt)}</span>
        </div>
        <div className="px-6 py-5">
          {/* Order number row */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Order number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-widest text-zinc-900">#{order.orderNumber}</span>
              <CopyButton text={order.orderNumber} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-contain" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">{item.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-zinc-800">{item.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    {item.selectedDose && (
                      <span className="rounded bg-zinc-100 px-1.5 py-px text-[10px] font-medium text-zinc-500">{item.selectedDose}</span>
                    )}
                    {item.reconstitution && (
                      <span className="rounded bg-accent/8 px-1.5 py-px text-[10px] font-medium text-accent">Pre-mixed</span>
                    )}
                    {!item.selectedDose && <span className="text-[10px] text-zinc-400">{item.category}</span>}
                  </div>
                </div>
                <span className="text-sm font-semibold tabular-nums text-zinc-900">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-5 space-y-2 border-t border-zinc-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Subtotal</span>
              <span className="tabular-nums text-zinc-900">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Shipping</span>
              <span className="tabular-nums text-zinc-900">
                {order.shippingCost === 0 ? <span className="text-emerald-600">Free</span> : `$${order.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-100 pt-2.5 text-sm">
              <span className="font-bold text-zinc-900">Total</span>
              <span className="text-lg font-black tabular-nums text-zinc-900">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shipping / delivery ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2" style={{ animation: "fade-up 0.5s ease-out 0.25s both" }}>
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Shipping To</p>
          </div>
          <p className="text-sm font-semibold text-zinc-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
          <p className="text-sm text-zinc-500">{order.shippingAddress.address}</p>
          <p className="text-sm text-zinc-500">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Truck size={14} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {isZelle ? "Estimated Dispatch" : "Estimated Delivery"}
            </p>
          </div>
          {isZelle ? (
            <>
              <p className="text-sm font-bold text-zinc-900">After payment confirmed</p>
              <p className="mt-0.5 text-sm text-zinc-500 capitalize">{order.shippingMethod} shipping</p>
              <p className="mt-2 text-[11px] text-zinc-400">Order ships promptly after Zelle confirmation.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-zinc-900">{estimatedDelivery(order.shippingMethod, order.placedAt)}</p>
              <p className="mt-0.5 text-sm text-zinc-500 capitalize">{order.shippingMethod} shipping</p>
              <p className="mt-2 text-[11px] text-zinc-400">Tracking number will be emailed once shipped.</p>
            </>
          )}
        </div>
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-col items-center gap-3 sm:flex-row" style={{ animation: "fade-up 0.5s ease-out 0.35s both" }}>
        <Link href="/shop" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover sm:flex-none sm:px-8">
          Continue Shopping <ArrowRight size={15} />
        </Link>
        <Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-6 py-3.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 sm:flex-none">
          <Home size={15} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
