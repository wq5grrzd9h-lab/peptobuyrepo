/**
 * POST /api/confirm-and-email
 *
 * Called when Stripe redirects back to /order-confirmation (3DS, etc.).
 * Retrieves the payment intent from Stripe, extracts order metadata,
 * sends both internal + customer emails, cancels abandonment jobs, and
 * deduplicates via Redis so page refreshes don't resend.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";
import {
  buildInternalHtml,
  buildCustomerHtml,
  deriveFreeGifts,
  stripepmLabel,
  type OrderEmailData,
} from "@/lib/orderEmailBuilders";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const INTERNAL_EMAIL = "peptobuy@gmail.com";

interface CompactItem {
  n: string; // name
  d: string; // dose
  q: number; // quantity
  p: number; // price per unit
  r: number; // reconstitution 0|1
}

interface PendingOrderRecord {
  orderNumber?: string;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: {
    firstName?: string; lastName?: string; address?: string;
    city?: string; state?: string; zip?: string; country?: string;
  };
  items?: CompactItem[];
  subtotal?: number;
  shippingCost?: number;
  total?: number;
  taxAmount?: number;
  discountCode?: string;
  discountAmount?: number;
}

// EmailItem type alias (from shared lib via import above)
type EmailItem = import("@/lib/orderEmailBuilders").EmailItem;

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log("[confirm-and-email] called");

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  let paymentIntentId: string;
  try {
    ({ paymentIntentId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!paymentIntentId) {
    return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
  }

  try {
    // ── 1. Retrieve payment intent from Stripe ────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" as any });
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["payment_method", "latest_charge"],
    });
    console.log("[confirm-and-email] pi.status:", pi.status, "| order:", pi.metadata?.orderNumber, "| receipt_email:", pi.receipt_email);

    if (pi.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not succeeded", status: pi.status }, { status: 400 });
    }

    const meta = pi.metadata ?? {};

    // ── 2. Redis: dedup + pending-order lookup ────────────────────────────────
    let redis: Redis | null = null;
    let pendingOrder: PendingOrderRecord | null = null;

    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      // Dedup: prevent resend on page refresh / duplicate webhook
      const dedupKey = `order-email-sent:${paymentIntentId}`;
      const alreadySent = await redis.get(dedupKey);
      if (alreadySent) {
        console.log("[confirm-and-email] already sent — skipping");
        return NextResponse.json({ ok: true, skipped: true, reason: "already sent" });
      }
      await redis.set(dedupKey, "1", { ex: 86400 });

      // Pending order: rich record saved just before confirmPayment (Affirm/Klarna/3DS)
      const pendingKey = `pending-order:${paymentIntentId}`;
      try {
        pendingOrder = await redis.get<PendingOrderRecord>(pendingKey);
        if (pendingOrder) {
          console.log("[confirm-and-email] found pending-order for", paymentIntentId);
          // Clean up — one-time use
          await redis.del(pendingKey);
        }
      } catch (e) {
        console.warn("[confirm-and-email] pending-order lookup failed:", e);
      }
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // ── 3. Build order data — pending-order (Redis) takes priority over Stripe metadata ──
    // For Apple Pay / Express Checkout: customer email lives in charge billing_details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const charge = pi.latest_charge as any;
    const chargeEmail    = charge?.billing_details?.email  || charge?.receipt_email  || pi.receipt_email  || "";
    const chargeName     = charge?.billing_details?.name   || charge?.shipping?.name || "";
    const chargeTotal    = charge ? (charge.amount / 100)  : (pi.amount / 100);

    const orderNumber   = pendingOrder?.orderNumber   || meta.orderNumber   || paymentIntentId.slice(-8).toUpperCase();
    const customerEmail = pendingOrder?.customerEmail || meta.customerEmail || chargeEmail;
    const customerName  = pendingOrder?.customerName  || meta.customerName  || chargeName || "Valued Customer";

    console.log("[confirm-and-email] resolved email:", customerEmail, "| name:", customerName, "| orderNumber:", orderNumber);

    if (!customerEmail) {
      // Last resort — send internal alert so we can follow up manually
      console.error("[confirm-and-email] No customerEmail found anywhere for PI:", paymentIntentId);
      if (resend && redis) {
        await resend.emails.send({
          from: RESEND_FROM,
          to: INTERNAL_EMAIL,
          subject: `⚠️ Order placed — no email found — PI: ${paymentIntentId}`,
          html: `<p>Order completed but no customer email found.<br>PI: <code>${paymentIntentId}</code><br>Amount: $${chargeTotal.toFixed(2)}<br>Check Stripe dashboard.</p>`,
        }).catch(() => {});
      }
      return NextResponse.json({ error: "No customer email found", paymentIntentId }, { status: 400 });
    }

    // Items — prefer full pending-order record; fall back to compact Stripe metadata
    let compactItems: CompactItem[] = pendingOrder?.items ?? [];
    if (!compactItems.length) {
      try {
        compactItems = JSON.parse(meta.itemsJson || "[]");
      } catch {
        console.warn("[confirm-and-email] Failed to parse itemsJson:", meta.itemsJson);
      }
    }
    const emailItems: EmailItem[] = compactItems.map((i) => ({
      name: i.n,
      dose: i.d,
      quantity: i.q,
      price: i.p,
      reconstitution: i.r === 1,
    }));

    const subtotal = pendingOrder?.subtotal    ?? (parseFloat(meta.subtotal  || "0") || chargeTotal);
    const shipping = pendingOrder?.shippingCost ?? parseFloat(meta.shipping || "0");
    const total    = pendingOrder?.total       ?? (parseFloat(meta.total    || "0") || chargeTotal);

    // For Apple Pay: shipping address comes from charge.shipping
    const pa = pendingOrder?.shippingAddress;
    const chargeShipping = charge?.shipping?.address;
    const shippingAddress = {
      firstName: pa?.firstName || meta.shippingFirstName || chargeName.split(" ")[0] || "",
      lastName:  pa?.lastName  || meta.shippingLastName  || chargeName.split(" ").slice(1).join(" ") || "",
      address:   pa?.address   || meta.shippingStreet    || chargeShipping?.line1 || "",
      city:      pa?.city      || meta.shippingCity      || chargeShipping?.city  || "",
      state:     pa?.state     || meta.shippingState     || chargeShipping?.state || "",
      zip:       pa?.zip       || meta.shippingZip       || chargeShipping?.postal_code || "",
      country:   pa?.country   || meta.shippingCountry   || chargeShipping?.country || "",
    };

    // ── 4. Send emails ────────────────────────────────────────────────────────
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Derive payment method label from expanded Stripe PM
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pmType: string = (pi.payment_method as any)?.type ?? "card";
    const paymentMethodLabel = stripepmLabel(pmType);

    const discountCode   = pendingOrder?.discountCode;
    const discountAmount = pendingOrder?.discountAmount;
    const discountedSubtotal = subtotal - (discountAmount ?? 0);
    const freeGifts = deriveFreeGifts(discountedSubtotal);

    const emailData: OrderEmailData = {
      orderNumber, customerEmail, customerName,
      items: emailItems,
      subtotal, shipping, total,
      discountCode, discountAmount,
      paymentMethodLabel,
      shippingAddress,
      freeGifts,
    };

    const [internalResult, customerResult] = await Promise.allSettled([
      resend.emails.send({
        from: RESEND_FROM,
        to: INTERNAL_EMAIL,
        subject: `New Order — ${orderNumber}`,
        html: buildInternalHtml(emailData, timestamp),
      }),
      resend.emails.send({
        from: RESEND_FROM,
        to: customerEmail,
        subject: `Your PeptoBuy Order Confirmation — ${orderNumber}`,
        html: buildCustomerHtml(emailData),
      }),
    ]);

    console.log("[confirm-and-email] internal:", internalResult.status,
      internalResult.status === "fulfilled" ? internalResult.value : internalResult.reason);
    console.log("[confirm-and-email] customer:", customerResult.status,
      customerResult.status === "fulfilled" ? customerResult.value : customerResult.reason);

    // ── 5. Cancel abandoned jobs in Redis ─────────────────────────────────────
    if (redis && customerEmail) {
      for (const prefix of ["cart-abandoned:", "checkout-abandoned:"]) {
        const key = `${prefix}${customerEmail}`;
        try {
          const existing = await redis.get<{ status: string }>(key);
          if (existing && existing.status === "pending") {
            await redis.set(key, { ...existing, status: "cancelled" }, { ex: 86400 });
            console.log("[confirm-and-email] cancelled", key);
          }
        } catch { /* ignore */ }
      }
    }

    // ── 6. Decrement RETA stock if RTGLP3 ordered ────────────────────────────
    if (redis) {
      const retaItems = emailItems.filter(
        (i) => i.name.toLowerCase().includes("rtglp3") || i.name.toLowerCase().includes("reta")
      );
      if (retaItems.length > 0) {
        const retaQty = retaItems.reduce((sum, i) => sum + i.quantity, 0);
        try {
          const RETA_STOCK_KEY = "reta-stock";
          const current = await redis.get<number>(RETA_STOCK_KEY);
          if (current === null) await redis.set(RETA_STOCK_KEY, 13);
          const newStock = await redis.decrby(RETA_STOCK_KEY, retaQty);
          const clampedStock = Math.max(0, newStock);
          if (newStock < 0) await redis.set(RETA_STOCK_KEY, 0);
          console.log(`[confirm-and-email] RETA stock decremented by ${retaQty}, now: ${clampedStock}`);

          if (clampedStock === 0) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({
              from: RESEND_FROM,
              to: INTERNAL_EMAIL,
              subject: "⚠️ RETA OUT OF STOCK — all 13 units sold",
              html: `<p style="font-family:sans-serif;font-size:15px;color:#18181b;">
                <strong>RTGLP3 (Reta) is now out of stock.</strong><br><br>
                All 13 units have been sold. Last order: <strong>${orderNumber}</strong> (${customerName}).
              </p>`,
            }).catch((e: unknown) => console.error("[confirm-and-email] reta out-of-stock email failed:", e));
          }
        } catch (e) {
          console.error("[confirm-and-email] reta stock decrement failed:", e);
        }
      }
    }

    return NextResponse.json({ ok: true, orderNumber });
  } catch (err) {
    console.error("[confirm-and-email] unhandled error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
