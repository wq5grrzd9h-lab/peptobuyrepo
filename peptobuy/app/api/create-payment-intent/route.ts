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

    const shippingBlock = addr && addr.firstName ? {
      shipping: {
        name: `${addr.firstName} ${addr.lastName}`.trim(),
        address: {
          line1: addr.address,
          city: addr.city,
          state: addr.state,
          postal_code: addr.zip,
          country: addr.country || "US",
        },
      },
    } : {};

    const sentCents = Math.round(amount * 100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const piParams: any = {
      amount: sentCents,
      currency: "usd",
      // Card only — eliminates Affirm, Klarna, and all BNPL redirect methods
      // that bypass the client-side onSuccess handler.
      payment_method_types: ["card"],
      // Stripe Tax: automatically calculates and adds tax based on shipping address.
      // Requires Stripe Tax to be activated in the Stripe Dashboard.
      automatic_tax: { enabled: true },
      receipt_email: customerEmail || undefined,
      description: `PeptoBuy Order ${orderNumber}${customerName ? ` — ${customerName}` : ""}`,
      ...shippingBlock,
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
    };

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    // Stripe Tax adds computed tax to the amount field when automatic_tax.status = "complete".
    // taxCents = 0 if tax-exempt, not computed, or Stripe Tax not configured.
    const taxCents = Math.max(0, paymentIntent.amount - sentCents);
    const taxAmount = taxCents / 100;
    const totalWithTax = paymentIntent.amount / 100;

    // Patch metadata with final tax + total so /api/confirm-and-email can include it
    if (taxCents > 0) {
      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          taxAmount: taxAmount.toString(),
          total: totalWithTax.toString(),
        },
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderNumber,
      taxAmount,      // 0 if tax-exempt or Stripe Tax not active
      totalWithTax,   // authoritative total from Stripe (includes tax)
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
