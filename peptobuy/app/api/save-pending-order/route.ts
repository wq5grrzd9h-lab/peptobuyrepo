/**
 * POST /api/save-pending-order
 *
 * Saves full order data to Redis under key "pending-order:{paymentIntentId}"
 * with a 24-hour TTL. Called just before stripe.confirmPayment for redirect-
 * based methods (Affirm, Klarna, etc.) so confirm-and-email can recover
 * shipping address and cart items from the PI metadata gap.
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export interface PendingOrderPayload {
  paymentIntentId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    n: string; // name
    d: string; // dose
    q: number; // quantity
    p: number; // unit price
    r: number; // reconstitution (0|1)
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  taxAmount?: number;
  discountCode?: string;
  discountAmount?: number;
  savedAt: string;
}

export async function POST(request: Request) {
  let payload: PendingOrderPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { paymentIntentId } = payload;
  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Redis not configured — no-op, confirm-and-email will fall back to Stripe metadata
    console.warn("[save-pending-order] Redis not configured — skipping");
    return NextResponse.json({ ok: true, skipped: true, reason: "redis-not-configured" });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const key = `pending-order:${paymentIntentId}`;
  await redis.set(key, { ...payload, savedAt: new Date().toISOString() }, { ex: 86400 });

  console.log("[save-pending-order] saved key:", key, "order:", payload.orderNumber);
  return NextResponse.json({ ok: true, key });
}
