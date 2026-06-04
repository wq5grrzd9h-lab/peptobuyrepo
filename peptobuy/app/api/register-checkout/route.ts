import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Client as QStash } from "@upstash/qstash";

const REDIS_KEY_PREFIX = "checkout-abandoned:";
const DEDUP_WINDOW_MS  = 24 * 60 * 60 * 1000;

interface CartItem { name: string; dose: string; price: number; quantity: number; }

interface RegisterPayload { email: string; cartItems: CartItem[]; cartTotal: number; }

export interface AbandonedRecord {
  email: string;
  cartItems: CartItem[];
  cartTotal: number;
  registeredAt: string;
  capturedAt?: number;
  status: "pending" | "sent" | "cancelled";
  qstashMessageId1?: string;
  qstashMessageId2?: string;
}

export async function POST(request: Request) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ ok: true, skipped: true, reason: "redis-not-configured" });
  }

  let payload: RegisterPayload;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

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
      if (existing.status === "sent") {
        const sentAt = new Date(existing.registeredAt).getTime();
        if (Date.now() - sentAt < DEDUP_WINDOW_MS) {
          await redis.set(key, { ...existing, cartItems, cartTotal }, { ex: 86400 });
          return NextResponse.json({ ok: true, action: "cart-updated-no-reschedule" });
        }
      }
      if (existing.status === "pending") {
        await redis.set(key, { ...existing, cartItems, cartTotal }, { ex: 86400 });
        return NextResponse.json({ ok: true, action: "cart-updated-timer-kept" });
      }
    }

    let qstashMessageId1: string | undefined;
    let qstashMessageId2: string | undefined;

    if (process.env.QSTASH_TOKEN) {
      try {
        const qstash = new QStash({ token: process.env.QSTASH_TOKEN });
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL?.replace("http://localhost:3000", "https://peptobuy.com") ??
          "https://peptobuy.com";
        const url = `${siteUrl}/api/send-abandoned-checkout-email`;

        const [msg1, msg2] = await Promise.all([
          qstash.publishJSON({
            url,
            body: { email: email.toLowerCase(), cartItems, cartTotal, sequence: 1 },
            delay: 120,    // 2 minutes
          }),
          qstash.publishJSON({
            url,
            body: { email: email.toLowerCase(), cartItems, cartTotal, sequence: 2 },
            delay: 900,    // 15 minutes
          }),
        ]);
        qstashMessageId1 = msg1.messageId;
        qstashMessageId2 = msg2.messageId;
      } catch (err) {
        console.error("[register-checkout] QStash schedule failed:", err);
      }
    }

    const capturedAt = Date.now();
    const record: AbandonedRecord = {
      email: email.toLowerCase(),
      cartItems,
      cartTotal,
      registeredAt: new Date().toISOString(),
      capturedAt,
      status: "pending",
      ...(qstashMessageId1 ? { qstashMessageId1 } : {}),
      ...(qstashMessageId2 ? { qstashMessageId2 } : {}),
    };

    await redis.set(key, record, { ex: 86400 });
    await redis.zadd("captured-emails", { score: capturedAt, member: email.toLowerCase() });

    return NextResponse.json({ ok: true, action: "registered", scheduled: !!(qstashMessageId1 && qstashMessageId2) });
  } catch (err) {
    console.error("[register-checkout]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
