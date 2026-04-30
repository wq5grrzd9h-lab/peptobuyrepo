"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  MapPin,
  Truck,
  ArrowRight,
  Home,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface OrderAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface OrderData {
  orderNumber: string;
  email: string;
  placedAt: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: OrderAddress;
  shippingMethod: "standard" | "express";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function estimatedDelivery(method: "standard" | "express", placedAt: string): string {
  const placed = new Date(placedAt);
  const days = method === "express" ? 2 : 5;
  placed.setDate(placed.getDate() + days);
  return placed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("peptobuy-last-order");
      if (!raw) {
        router.replace("/");
        return;
      }
      setOrder(JSON.parse(raw));
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
      {/* ── Success hero ──────────────────────────────────── */}
      <div
        className="mb-10 flex flex-col items-center text-center"
        style={{ animation: "fade-up 0.5s ease-out both" }}
      >
        {/* Animated checkmark */}
        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10"
          style={{ animation: "check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}
        >
          <CheckCircle2 size={44} className="text-emerald-400" />
        </div>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-400">
          Order Confirmed
        </p>
        <h1 className="mb-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Thank you, {order.shippingAddress.firstName}!
        </h1>
        <p className="text-sm text-white/50">
          A confirmation has been sent to{" "}
          <span className="font-semibold text-white/80">{order.email}</span>
        </p>
      </div>

      {/* ── Order number card ─────────────────────────────── */}
      <div
        className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface-1"
        style={{ animation: "fade-up 0.5s ease-out 0.15s both" }}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Package size={16} className="text-accent" />
            <span className="text-sm font-bold text-white">Order Details</span>
          </div>
          <span className="text-xs text-white/35">{formatDate(order.placedAt)}</span>
        </div>

        <div className="px-6 py-5">
          {/* Order number */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-white/50">Order number</span>
            <span className="font-mono text-base font-bold tracking-widest text-white">
              #{order.orderNumber}
            </span>
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white/80">{item.name}</p>
                  <p className="text-[10px] text-white/35">{item.category}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-5 space-y-2 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="tabular-nums text-white">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">Shipping</span>
              <span className="tabular-nums text-white">
                {order.shippingCost === 0 ? (
                  <span className="text-emerald-400">Free</span>
                ) : (
                  `$${order.shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 text-sm">
              <span className="font-bold text-white">Total</span>
              <span className="text-lg font-black tabular-nums text-white">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shipping info ─────────────────────────────────── */}
      <div
        className="mb-6 grid gap-4 sm:grid-cols-2"
        style={{ animation: "fade-up 0.5s ease-out 0.25s both" }}
      >
        {/* Address */}
        <div className="rounded-2xl border border-border bg-surface-1 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={14} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Shipping To
            </p>
          </div>
          <p className="text-sm font-semibold text-white">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </p>
          <p className="text-sm text-white/55">{order.shippingAddress.address}</p>
          <p className="text-sm text-white/55">
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            {order.shippingAddress.zip}
          </p>
        </div>

        {/* Delivery estimate */}
        <div className="rounded-2xl border border-border bg-surface-1 px-5 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Truck size={14} className="text-accent" />
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Estimated Delivery
            </p>
          </div>
          <p className="text-sm font-bold text-white">
            {estimatedDelivery(order.shippingMethod, order.placedAt)}
          </p>
          <p className="mt-0.5 text-sm text-white/45 capitalize">
            {order.shippingMethod} shipping
          </p>
          <p className="mt-2 text-[11px] text-white/25">
            Tracking number will be emailed once shipped.
          </p>
        </div>
      </div>

      {/* ── CTAs ──────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center gap-3 sm:flex-row"
        style={{ animation: "fade-up 0.5s ease-out 0.35s both" }}
      >
        <Link
          href="/shop"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.25)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.4)] sm:flex-none sm:px-8"
        >
          Continue Shopping <ArrowRight size={15} />
        </Link>
        <Link
          href="/"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-6 py-3.5 text-sm font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white sm:flex-none"
        >
          <Home size={15} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
