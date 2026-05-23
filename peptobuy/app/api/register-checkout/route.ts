import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Client as QStash } from "@upstash/qstash";

const REDIS_KEY_PREFIX = "pb_abandoned:";
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours — no duplicate sends in this window
const DELAY_SECONDS = 45 * 60; // 45 minutes

interface CartItem {
  name: string;
  dose: string;
  price: number;
  quantity: number;
}

interface RegisterPayload {
  email: string;
  cartItems: CartItem[];
  cartTotal: number;
}

export interface AbandonedRecord {
  email: string;
  cartItems: CartItem[];
  cartTotal: number;
  registeredAt: string;
  status: "pending" | "sent" | "cancelled";
  qstashMessageId?: string;
}

export async function POST(request: Request) {
  // Gracefully skip if Redis not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ ok: true, skipped: true, reason: "redis-not-configured" });
  }

  let payload: RegisterPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, cartItems, cartTotal } = payload;
  if (!email || !cartItems?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const key = `${REDIS_KEY_PREFIX}${email.toLowerCase()}`;

  try {
    const existing = await redis.get<AbandonedRecord>(key);

    if (existing) {
      // If already sent within dedup window — don't reschedule, just update cart
      if (existing.status === "sent") {
        const sentAt = new Date(existing.registeredAt).getTime();
        if (Date.now() - sentAt < DEDUP_WINDOW_MS) {
          // Update cart data silently — already sent, no new schedule
          await redis.set(key, { ...existing, cartItems, cartTotal }, { ex: 86400 });
          return NextResponse.json({ ok: true, action: "cart-updated-no-reschedule" });
        }
      }

      // If pending — update cart data but don't reschedule (keep original timer)
      if (existing.status === "pending") {
        await redis.set(key, { ...existing, cartItems, cartTotal }, { ex: 86400 });
        return NextResponse.json({ ok: true, action: "cart-updated-timer-kept" });
      }
    }

    // New registration or previously cancelled — schedule QStash job
    let qstashMessageId: string | undefined;

    if (process.env.QSTASH_TOKEN) {
      try {
        const qstash = new QStash({ token: process.env.QSTASH_TOKEN });
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace("http://localhost:3000", "https://peptobuy.com") ?? "https://peptobuy.com";

        const msg = await qstash.publishJSON({
          url: `${siteUrl}/api/send-abandoned-cart-queued`,
          body: { email: email.toLowerCase(), cartItems, cartTotal },
          delay: DELAY_SECONDS,
        });
        qstashMessageId = msg.messageId;
      } catch (err) {
        console.error("[register-checkout] QStash schedule failed:", err);
        // Non-fatal — still save record, old browser timer will fire
      }
    }

    const record: AbandonedRecord = {
      email: email.toLowerCase(),
      cartItems,
      cartTotal,
      registeredAt: new Date().toISOString(),
      status: "pending",
      ...(qstashMessageId ? { qstashMessageId } : {}),
    };

    await redis.set(key, record, { ex: 86400 });

    return NextResponse.json({ ok: true, action: "registered", scheduled: !!qstashMessageId });
  } catch (err) {
    console.error("[register-checkout]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
