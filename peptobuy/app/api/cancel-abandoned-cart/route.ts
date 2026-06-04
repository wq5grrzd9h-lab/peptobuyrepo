import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Client as QStash } from "@upstash/qstash";

const KEY_PREFIXES = {
  cart:     "cart-abandoned:",
  checkout: "checkout-abandoned:",
} as const;

interface AbandonedRecord {
  status: "pending" | "sent" | "cancelled";
  qstashMessageId1?: string;
  qstashMessageId2?: string;
  [key: string]: unknown;
}

async function cancelKey(redis: Redis, qstash: QStash | null, key: string) {
  const existing = await redis.get<AbandonedRecord>(key);
  if (!existing) return;

  // Cancel both QStash jobs if order is completed before they fire
  if (qstash && existing.status === "pending") {
    const cancels: Promise<unknown>[] = [];
    if (existing.qstashMessageId1) {
      cancels.push(
        qstash.messages.cancel(existing.qstashMessageId1)
          .catch((e) => console.warn("[cancel-abandoned-cart] QStash cancel msg1 failed:", e))
      );
    }
    if (existing.qstashMessageId2) {
      cancels.push(
        qstash.messages.cancel(existing.qstashMessageId2)
          .catch((e) => console.warn("[cancel-abandoned-cart] QStash cancel msg2 failed:", e))
      );
    }
    if (cancels.length) await Promise.allSettled(cancels);
  }

  if (existing.status === "pending") {
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
    type  = body.type ?? "checkout";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const qstash = process.env.QSTASH_TOKEN
    ? new QStash({ token: process.env.QSTASH_TOKEN })
    : null;

  const norm = email.toLowerCase();

  try {
    if (type === "cart" || type === "both") {
      await cancelKey(redis, qstash, `${KEY_PREFIXES.cart}${norm}`);
    }
    if (type === "checkout" || type === "both" || !type) {
      await cancelKey(redis, qstash, `${KEY_PREFIXES.checkout}${norm}`);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cancel-abandoned-cart]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
