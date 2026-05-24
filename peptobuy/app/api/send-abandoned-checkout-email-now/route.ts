import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { buildCheckoutAbandonedHtml, type CartEmailItem } from "@/lib/abandonedEmailHtml";

const CHECKOUT_KEY_PREFIX = "checkout-abandoned:";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

interface Payload {
  email: string;
  cartItems: CartEmailItem[];
  cartTotal: number;
}

async function parsePayload(request: Request): Promise<Payload | null> {
  try {
    const raw = await request.text();
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

  let redis: Redis | null = null;
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  if (redis) {
    const key = `${CHECKOUT_KEY_PREFIX}${emailLc}`;
    const record = await redis.get<{ status: string; email: string; cartItems: unknown; cartTotal: number; registeredAt: string }>(key);

    if (record?.status === "sent" || record?.status === "cancelled") {
      return new Response(null, { status: 204 });
    }

    if (record) {
      await redis.set(key, { ...record, status: "sent" }, { ex: 86400 });
    }
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: RESEND_FROM,
      to: emailLc,
      subject: "Complete your PeptoBuy order 🧪",
      html: buildCheckoutAbandonedHtml(cartItems, cartTotal),
    });
  } catch (err) {
    console.error("[send-abandoned-checkout-email-now]", err);
  }

  return new Response(null, { status: 204 });
}
