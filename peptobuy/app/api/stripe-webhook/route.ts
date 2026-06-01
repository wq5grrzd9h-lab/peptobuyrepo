/**
 * POST /api/stripe-webhook
 *
 * Handles Stripe subscription events:
 *   invoice.paid                  → increment paymentsCompleted, send emails
 *   invoice.payment_failed        → notify customer
 *   customer.subscription.deleted → mark cancelled in Redis
 *
 * Requires STRIPE_WEBHOOK_SECRET env variable.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { Redis } from "@upstash/redis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" as any });
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const INTERNAL_EMAIL = "peptobuy@gmail.com";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig ?? "", webhookSecret);
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("[stripe-webhook] signature verification failed:", e.message);
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  console.log("[stripe-webhook] event:", event.type, event.id);

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
      ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
      : null;

  // ── invoice.paid ─────────────────────────────────────────────────────────────
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionId = (invoice as any).subscription as string | null;
    if (!subscriptionId) return NextResponse.json({ ok: true });

    let customerEmail = "";
    let customerName = "";
    let orderNumber = "";

    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      customerEmail = (sub.metadata?.customerEmail ?? "").toLowerCase();
      customerName  = sub.metadata?.customerName ?? "";
      orderNumber   = sub.metadata?.orderNumber ?? subscriptionId;

      // Increment paymentsCompleted in Redis
      if (redis && customerEmail) {
        const existing = await redis.get<Record<string, unknown>>(`subscription:${customerEmail}`);
        if (existing) {
          const completed = (existing.paymentsCompleted as number ?? 0) + 1;
          const nextCharge = new Date(invoice.period_end * 1000);
          nextCharge.setMonth(nextCharge.getMonth() + 1);
          await redis.set(`subscription:${customerEmail}`, {
            ...existing,
            paymentsCompleted: completed,
            nextChargeDate: nextCharge.toISOString(),
          }, { ex: 365 * 24 * 3600 });
        }
      }

      const amountPaid = (invoice.amount_paid / 100).toFixed(2);
      const nextDate = new Date(invoice.period_end * 1000).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

      if (resend) {
        await Promise.allSettled([
          // Internal notification
          resend.emails.send({
            from: RESEND_FROM,
            to: INTERNAL_EMAIL,
            subject: `🔄 Subscription Payment Received — ${orderNumber}`,
            html: `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;">
              <h2 style="color:#ff2d78;">Subscription Payment Received</h2>
              <p><strong>Order:</strong> ${orderNumber}</p>
              <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
              <p><strong>Amount Paid:</strong> $${amountPaid}</p>
              <p><strong>Next Charge:</strong> ${nextDate}</p>
              <p><strong>Subscription ID:</strong> ${subscriptionId}</p>
              <p style="color:#cc5500;">Ship order for this customer now.</p>
            </div>`,
          }),
          // Customer shipment notification
          ...(customerEmail ? [
            resend.emails.send({
              from: RESEND_FROM,
              to: customerEmail,
              subject: `🔄 Your PeptoBuy Subscription — Monthly Charge Processed`,
              html: `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;background:#f4f4f5;padding:32px;">
                <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  <div style="background:#ff2d78;padding:24px 32px;text-align:center;">
                    <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">PeptoBuy 🔄 Subscription</p>
                  </div>
                  <div style="padding:32px;">
                    <h2 style="margin:0 0 8px;color:#18181b;">Payment Processed ✓</h2>
                    <p style="color:#71717a;">Your monthly subscription has been charged $${amountPaid}.</p>
                    <p style="color:#71717a;">Your order (${orderNumber}) will ship shortly.</p>
                    <p style="color:#71717a;">Next charge: <strong style="color:#18181b;">${nextDate}</strong></p>
                    <p style="margin-top:24px;font-size:12px;color:#a1a1aa;">
                      To cancel after your 3-month commitment, email
                      <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;">peptobuy@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>`,
            }),
          ] : []),
        ]);
      }
    } catch (err) {
      console.error("[stripe-webhook] invoice.paid handler error:", err);
    }
  }

  // ── invoice.payment_failed ────────────────────────────────────────────────────
  else if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionId = (invoice as any).subscription as string | null;

    try {
      if (subscriptionId && resend) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const customerEmail = (sub.metadata?.customerEmail ?? "").toLowerCase();
        const amountDue = (invoice.amount_due / 100).toFixed(2);

        if (customerEmail) {
          await resend.emails.send({
            from: RESEND_FROM,
            to: customerEmail,
            subject: "⚠️ PeptoBuy Subscription — Payment Failed",
            html: `<div style="font-family:sans-serif;max-width:580px;margin:0 auto;">
              <h2 style="color:#cc0000;">Subscription Payment Failed</h2>
              <p>We were unable to charge $${amountDue} for your PeptoBuy subscription.</p>
              <p>Please update your payment method to keep your subscription active.</p>
              <p>Contact us at <a href="mailto:peptobuy@gmail.com">peptobuy@gmail.com</a> for help.</p>
            </div>`,
          });
        }
      }
    } catch (err) {
      console.error("[stripe-webhook] payment_failed handler error:", err);
    }
  }

  // ── customer.subscription.deleted ────────────────────────────────────────────
  else if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerEmail = (sub.metadata?.customerEmail ?? "").toLowerCase();

    if (redis && customerEmail) {
      try {
        const existing = await redis.get<Record<string, unknown>>(`subscription:${customerEmail}`);
        if (existing) {
          await redis.set(`subscription:${customerEmail}`, {
            ...existing,
            status: "cancelled",
            cancelledAt: new Date().toISOString(),
          }, { ex: 90 * 24 * 3600 });
        }
      } catch (err) {
        console.error("[stripe-webhook] subscription.deleted redis error:", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
