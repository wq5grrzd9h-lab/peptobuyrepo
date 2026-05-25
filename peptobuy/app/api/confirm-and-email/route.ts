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

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const INTERNAL_EMAIL = "peptobuy@gmail.com";

interface CompactItem {
  n: string; // name
  d: string; // dose
  q: number; // quantity
  p: number; // price per unit
  r: number; // reconstitution 0|1
}

interface EmailItem {
  name: string;
  dose: string;
  quantity: number;
  price: number;
  reconstitution: boolean;
}

// ─── Email HTML ───────────────────────────────────────────────────────────────

function itemRowsHtml(items: EmailItem[]): string {
  return items
    .map(
      (i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#18181b;">${i.name}${i.reconstitution ? ' <span style="font-size:11px;color:#ff2d78;font-weight:600;">(pre-mixed)</span>' : ""}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${i.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join("");
}

function buildInternalHtml(d: {
  orderNumber: string; customerName: string; customerEmail: string;
  items: EmailItem[]; subtotal: number; shipping: number; total: number;
  shippingAddress: { firstName: string; lastName: string; address: string; city: string; state: string; zip: string; country: string };
}, timestamp: string): string {
  const addr = d.shippingAddress;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New Order</title></head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;background:#f9f9f9;color:#18181b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#ff2d78;padding:20px 28px;">
      <h1 style="margin:0;font-size:18px;font-weight:800;color:#fff;">🧪 New Order — ${d.orderNumber}</h1>
      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">${timestamp}</p>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;width:130px;">Order #</td><td style="padding:6px 0;font-size:13px;font-weight:700;font-family:monospace;color:#18181b;">${d.orderNumber}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Payment</td><td style="padding:6px 0;font-size:13px;color:#18181b;">Credit/Debit Card (Stripe)</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Customer</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerName}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Email</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerEmail}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Ship to</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${addr.address}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Product</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Dose</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml(d.items)}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Subtotal</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#18181b;">$${d.subtotal.toFixed(2)}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Shipping</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#18181b;">${d.shipping === 0 ? "Free" : `$${d.shipping.toFixed(2)}`}</td></tr>
        <tr style="border-top:1px solid #e5e5e5;">
          <td style="padding:10px 0 4px;font-size:14px;font-weight:700;color:#18181b;">Total</td>
          <td style="padding:10px 0 4px;font-size:16px;font-weight:800;text-align:right;color:#ff2d78;">$${d.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>
  </div>
</body></html>`;
}

function buildCustomerHtml(d: {
  orderNumber: string; customerName: string;
  items: EmailItem[]; subtotal: number; shipping: number; total: number;
  shippingAddress: { firstName: string; lastName: string; address: string; city: string; state: string; zip: string };
  customerEmail: string;
}): string {
  const addr = d.shippingAddress;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Research-Grade Peptides</p>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#18181b;">Order Confirmed ✓</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#71717a;">Thank you for your order. We will ship promptly.</p>
      <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Order Number</p>
        <p style="margin:0;font-size:20px;font-weight:800;font-family:monospace;color:#ff2d78;letter-spacing:.04em;">${d.orderNumber}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Product</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Dose</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Qty</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml(d.items)}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Subtotal</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">$${d.subtotal.toFixed(2)}</td></tr>
        <tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Shipping</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">${d.shipping === 0 ? "Free" : `$${d.shipping.toFixed(2)}`}</td></tr>
        <tr style="border-top:2px solid #e5e5e5;">
          <td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#18181b;">Total</td>
          <td style="padding:10px 0 0;font-size:17px;font-weight:800;text-align:right;color:#ff2d78;">$${d.total.toFixed(2)}</td>
        </tr>
      </table>
      <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Ships To</p>
        <p style="margin:0;font-size:13px;color:#18181b;line-height:1.7;">
          ${addr.firstName} ${addr.lastName}<br>
          ${addr.address}<br>
          ${addr.city}, ${addr.state} ${addr.zip}
        </p>
      </div>
      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
        Questions? Email us at
        <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
      </p>
    </div>
    <div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
        ⚠ All products are for in vitro research use only. Not intended for human consumption.
      </p>
    </div>
  </div>
</body></html>`;
}

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
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("[confirm-and-email] pi.status:", pi.status, "| order:", pi.metadata?.orderNumber);

    if (pi.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not succeeded", status: pi.status }, { status: 400 });
    }

    const meta = pi.metadata ?? {};
    const orderNumber = meta.orderNumber || paymentIntentId;
    const customerEmail = meta.customerEmail;

    if (!customerEmail) {
      console.error("[confirm-and-email] No customerEmail in metadata — PI may be missing metadata");
      return NextResponse.json({ error: "No customer email in payment intent metadata" }, { status: 400 });
    }

    // ── 2. Redis dedup ────────────────────────────────────────────────────────
    let redis: Redis | null = null;
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const dedupKey = `order-email-sent:${paymentIntentId}`;
      const alreadySent = await redis.get(dedupKey);
      if (alreadySent) {
        console.log("[confirm-and-email] already sent — skipping");
        return NextResponse.json({ ok: true, skipped: true, reason: "already sent" });
      }
      // Mark BEFORE sending to prevent duplicate concurrent calls
      await redis.set(dedupKey, "1", { ex: 86400 });
    }

    // ── 3. Parse items from metadata ─────────────────────────────────────────
    let compactItems: CompactItem[] = [];
    try {
      compactItems = JSON.parse(meta.itemsJson || "[]");
    } catch {
      console.warn("[confirm-and-email] Failed to parse itemsJson:", meta.itemsJson);
    }
    const emailItems: EmailItem[] = compactItems.map((i) => ({
      name: i.n,
      dose: i.d,
      quantity: i.q,
      price: i.p,
      reconstitution: i.r === 1,
    }));

    const subtotal = parseFloat(meta.subtotal || "0");
    const shipping = parseFloat(meta.shipping || "0");
    const total = parseFloat(meta.total || "0");
    const shippingAddress = {
      firstName: meta.shippingFirstName || "",
      lastName: meta.shippingLastName || "",
      address: meta.shippingStreet || "",
      city: meta.shippingCity || "",
      state: meta.shippingState || "",
      zip: meta.shippingZip || "",
      country: meta.shippingCountry || "",
    };
    const customerName = meta.customerName || "";

    // ── 4. Send emails ────────────────────────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const emailPayload = { orderNumber, customerEmail, customerName, items: emailItems, subtotal, shipping, total, shippingAddress };

    const [internalResult, customerResult] = await Promise.allSettled([
      resend.emails.send({
        from: RESEND_FROM,
        to: INTERNAL_EMAIL,
        subject: `New Order — ${orderNumber}`,
        html: buildInternalHtml(emailPayload, timestamp),
      }),
      resend.emails.send({
        from: RESEND_FROM,
        to: customerEmail,
        subject: `Your PeptoBuy Order Confirmation — ${orderNumber}`,
        html: buildCustomerHtml(emailPayload),
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

    return NextResponse.json({ ok: true, orderNumber });
  } catch (err) {
    console.error("[confirm-and-email] unhandled error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
