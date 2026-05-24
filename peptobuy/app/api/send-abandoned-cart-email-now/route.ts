import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { buildCartAbandonedHtml, type CartEmailItem } from "@/lib/abandonedEmailHtml";

const CART_KEY_PREFIX = "cart-abandoned:";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

interface Payload {
  email: string;
  cartItems: CartEmailItem[];
  cartTotal: number;
}

/** Parse both application/json and text/plain (sendBeacon sends text/plain). */
async function parsePayload(request: Request): Promise<Payload | null> {
  try {
    const ct = request.headers.get("content-type") ?? "";
    const raw = ct.includes("application/json")
      ? await request.text()
      : await request.text();
    return JSON.parse(raw) as Payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await parsePayload(request);
  if (!payload?.email || !payload?.cartItems?.length) {
    return new Response(null, { status: 204 });
  }

  const { email, cartItems, cartTotal } = payload;
  const emailLc = email.toLowerCase().trim();

  if (!process.env.RESEND_API_KEY) {
    return new Response(null, { status: 204 });
  }

  // ── Redis dedup ────────────────────────────────────────────────────────────
  let redis: Redis | null = null;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  if (redis) {
    const key = `${CART_KEY_PREFIX}${emailLc}`;
    const record = await redis.get<{ status: string; email: string; cartItems: unknown; cartTotal: number; registeredAt: string }>(key);

    // Skip if already sent or cancelled
    if (record?.status === "sent" || record?.status === "cancelled") {
      return new Response(null, { status: 204 });
    }

    // Mark sent immediately (before sending) to prevent duplicate concurrent calls
    if (record) {
      await redis.set(key, { ...record, status: "sent" }, { ex: 86400 });
    }
  }

  // ── Send email ─────────────────────────────────────────────────────────────
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: RESEND_FROM,
      to: emailLc,
      subject: "You left your cart 🧪",
      html: buildCartAbandonedHtml(cartItems, cartTotal),
    });
  } catch (err) {
    console.error("[send-abandoned-cart-email-now]", err);
  }

  return new Response(null, { status: 204 });
}
