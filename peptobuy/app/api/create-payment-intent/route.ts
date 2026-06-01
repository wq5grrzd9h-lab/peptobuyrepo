import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

// Initialise once at module load — not inside the handler
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiVersion: "2023-10-16" as any,
});

interface CompactItem {
  n: string; // name
  d: string; // dose
  q: number; // quantity
  p: number; // price per unit
  r: number; // reconstitution (0 | 1)
}

async function generateOrderNumber(): Promise<string> {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    const counter = await redis.incr("pb_order_counter");
    return `PB-${String(counter).padStart(6, "0")}`;
  } catch {
    const now = new Date();
    return `PB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
  }
}

export async function POST(request: Request) {
  console.log("[create-payment-intent] STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY);

  // Validate key present — surface misconfiguration immediately
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[create-payment-intent] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
  }

  let body: {
    amount?: unknown;
    customerEmail?: string;
    customerName?: string;
    cartItems?: CompactItem[];
    subtotal?: number;
    shipping?: number;
    shippingAddress?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { amount, customerEmail, customerName, cartItems, subtotal, shipping: shippingCost } = body;

  // Hard validate amount before touching Stripe
  const amountNum = typeof amount === "number" ? amount : parseFloat(String(amount ?? "0"));
  if (!amountNum || amountNum <= 0 || !isFinite(amountNum)) {
    console.error("[create-payment-intent] Invalid amount:", amount);
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const sentCents = Math.max(Math.round(amountNum * 100), 50);
  console.log("[create-payment-intent] Creating PI — cents:", sentCents, "email:", customerEmail);

  try {
    const orderNumber = await generateOrderNumber();

    // Card + Affirm + Klarna — no automatic_tax, no shipping block.
    // Affirm/Klarna are redirect-based; return_url sends users to /order-confirmation
    // where payment_intent + redirect_status params trigger confirm-and-email.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: sentCents,
      currency: "usd",
      payment_method_types: ["card", "affirm", "klarna"],
      receipt_email: customerEmail || undefined,
      description: `PeptoBuy Order ${orderNumber}${customerName ? ` — ${customerName}` : ""}`,
      metadata: {
        orderNumber,
        customerEmail: customerEmail ?? "",
        customerName: customerName ?? "",
        // Compact JSON — well under Stripe's 500-char metadata value limit
        itemsJson: JSON.stringify(cartItems ?? []).slice(0, 490),
        subtotal: (subtotal ?? 0).toString(),
        shipping: (shippingCost ?? 0).toString(),
        total: amountNum.toString(),
      },
    });

    console.log("[create-payment-intent] PI created:", paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber,
      taxAmount: 0,
      totalWithTax: amountNum,
    });
  } catch (err: unknown) {
    const e = err as { message?: string; type?: string; code?: string };
    console.error("[create-payment-intent] Stripe error message:", e.message);
    console.error("[create-payment-intent] Stripe error type:", e.type);
    console.error("[create-payment-intent] Stripe error code:", e.code);
    return NextResponse.json(
      { error: e.message ?? "Payment initialisation failed" },
      { status: 500 },
    );
  }
}
