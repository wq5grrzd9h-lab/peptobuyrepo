import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Redis } from "@upstash/redis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" as any });

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

interface SubscriptionItem {
  name: string;
  dose: string;
  quantity: number;
  price: number;       // regular unit price (before discount)
}

interface OneTimeItem {
  name: string;
  dose: string;
  quantity: number;
  price: number;       // unit price (after any promo discount)
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
  }

  let body: {
    customerEmail?: string;
    customerName?: string;
    subscriptionItems?: SubscriptionItem[];
    oneTimeItems?: OneTimeItem[];
    shippingAddress?: ShippingAddress;
    shippingCost?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { customerEmail, customerName, subscriptionItems, oneTimeItems, shippingAddress, shippingCost = 0 } = body;

  if (!customerEmail || !subscriptionItems?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const orderNumber = await generateOrderNumber();
  const DISCOUNT = 0.9; // 10% off

  try {
    // 1. Create Stripe Customer
    const customer = await stripe.customers.create({
      email: customerEmail,
      name: customerName || customerEmail,
      ...(shippingAddress && {
        shipping: {
          name: customerName || customerEmail,
          address: {
            line1: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.zip,
            country: shippingAddress.country || "US",
          },
        },
      }),
      metadata: { orderNumber, source: "peptobuy-subscription" },
    });

    // 2. Add one-time items as invoice items (charged on the first invoice)
    if (oneTimeItems?.length) {
      for (const item of oneTimeItems) {
        await stripe.invoiceItems.create({
          customer: customer.id,
          amount: Math.round(item.price * item.quantity * 100),
          currency: "usd",
          description: `${item.name} ${item.dose} × ${item.quantity} (one-time)`,
        });
      }
    }

    // Add shipping as invoice item if any
    if (shippingCost > 0) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        amount: Math.round(shippingCost * 100),
        currency: "usd",
        description: "Shipping",
      });
    }

    // 3. Create Stripe Prices for each subscription item
    const stripeItems: Stripe.SubscriptionCreateParams.Item[] = [];
    for (const item of subscriptionItems) {
      const discountedCents = Math.round(item.price * DISCOUNT * 100);
      const price = await stripe.prices.create({
        currency: "usd",
        unit_amount: discountedCents,
        recurring: { interval: "month" },
        product_data: {
          name: `${item.name} ${item.dose} — Monthly Subscription (10% off)`,
        },
      });
      stripeItems.push({ price: price.id, quantity: item.quantity });
    }

    // 4. Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: stripeItems,
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        orderNumber,
        customerEmail,
        customerName: customerName || "",
        minimumMonths: "3",
        shippingAddress: JSON.stringify(shippingAddress ?? {}),
        items: JSON.stringify(subscriptionItems).slice(0, 490),
      },
    });

    // 5. Save subscription record to Redis
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const nextCharge = new Date();
      nextCharge.setMonth(nextCharge.getMonth() + 1);
      await redis.set(`subscription:${customerEmail}`, {
        subscriptionId: subscription.id,
        customerId: customer.id,
        orderNumber,
        items: subscriptionItems,
        startDate: new Date().toISOString(),
        nextChargeDate: nextCharge.toISOString(),
        paymentsCompleted: 0,
        status: "active",
        shippingAddress,
      }, { ex: 365 * 24 * 3600 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoice = subscription.latest_invoice as any;
    const clientSecret = invoice?.payment_intent?.client_secret as string | null;

    if (!clientSecret) {
      return NextResponse.json({ error: "Could not retrieve payment client secret" }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      customerId: customer.id,
      orderNumber,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("[create-subscription] error:", e.message);
    return NextResponse.json({ error: e.message ?? "Subscription creation failed" }, { status: 500 });
  }
}
