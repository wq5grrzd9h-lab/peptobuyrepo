import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

interface CompactItem {
  n: string; // name
  d: string; // dose
  q: number; // quantity
  p: number; // price per unit
  r: number; // reconstitution (0 | 1)
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
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
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });

    const {
      amount,
      customerEmail,
      customerName,
      cartItems,
      subtotal,
      shipping: shippingCost,
      shippingAddress,
    }: {
      amount: number;
      customerEmail?: string;
      customerName?: string;
      cartItems?: CompactItem[];
      subtotal?: number;
      shipping?: number;
      shippingAddress?: ShippingAddress;
    } = await request.json();

    // Generate order number server-side so it lands in Stripe metadata
    const orderNumber = await generateOrderNumber();
    const addr = shippingAddress;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: "usd",
      // Card only — eliminates redirect-based BNPL methods (Affirm, Klarna, etc.)
      // that bypass the client-side onSuccess handler.
      payment_method_types: ["card"],
      metadata: {
        orderNumber,
        customerEmail: customerEmail ?? "",
        customerName: customerName ?? "",
        // Compact JSON array — stays well under Stripe's 500-char limit for typical orders
        itemsJson: JSON.stringify(cartItems ?? []),
        subtotal: (subtotal ?? 0).toString(),
        shipping: (shippingCost ?? 0).toString(),
        total: amount.toString(),
        shippingFirstName: addr?.firstName ?? "",
        shippingLastName: addr?.lastName ?? "",
        shippingStreet: addr?.address ?? "",
        shippingCity: addr?.city ?? "",
        shippingState: addr?.state ?? "",
        shippingZip: addr?.zip ?? "",
        shippingCountry: addr?.country ?? "",
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
