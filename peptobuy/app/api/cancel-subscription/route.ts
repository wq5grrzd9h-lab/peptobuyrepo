import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" as any });

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  let subscriptionId: string;
  let customerEmail: string;
  try {
    ({ subscriptionId, customerEmail } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!subscriptionId || !customerEmail) {
    return NextResponse.json({ error: "Missing subscriptionId or customerEmail" }, { status: 400 });
  }

  try {
    // Count successful invoices for this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId,
      status: "paid",
      limit: 100,
    });

    const paidCount = invoices.data.length;

    if (paidCount < 3) {
      return NextResponse.json({
        error: `Minimum commitment of 3 months not yet fulfilled. Payments completed: ${paidCount}/3.`,
        paymentsCompleted: paidCount,
        canCancel: false,
      }, { status: 400 });
    }

    // Cancel at period end (lets current period finish before cancelling)
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update Redis status
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const existing = await redis.get<Record<string, unknown>>(`subscription:${customerEmail}`);
      if (existing) {
        await redis.set(`subscription:${customerEmail}`, {
          ...existing,
          status: "cancelling",
          cancelledAt: new Date().toISOString(),
        }, { ex: 365 * 24 * 3600 });
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Subscription will cancel at end of current billing period.",
      canCancel: true,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("[cancel-subscription] error:", e.message);
    return NextResponse.json({ error: e.message ?? "Cancellation failed" }, { status: 500 });
  }
}
