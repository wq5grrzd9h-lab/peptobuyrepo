import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const KEY_PREFIXES = {
  cart: "cart-abandoned:",
  checkout: "checkout-abandoned:",
} as const;

interface AbandonedRecord {
  status: "pending" | "sent" | "cancelled";
  [key: string]: unknown;
}

async function cancelKey(redis: Redis, key: string) {
  const existing = await redis.get<AbandonedRecord>(key);
  if (existing && existing.status === "pending") {
    await redis.set(key, { ...existing, status: "cancelled" }, { ex: 86400 });
  }
}

export async function POST(request: Request) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let email: string;
  let type: "cart" | "checkout" | "both" | undefined;

  try {
    const body = await request.json();
    email = body.email;
    type = body.type ?? "checkout"; // default to checkout for backward compat
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const norm = email.toLowerCase();

  try {
    if (type === "cart" || type === "both") {
      await cancelKey(redis, `${KEY_PREFIXES.cart}${norm}`);
    }
    if (type === "checkout" || type === "both" || !type) {
      await cancelKey(redis, `${KEY_PREFIXES.checkout}${norm}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cancel-abandoned-cart]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
