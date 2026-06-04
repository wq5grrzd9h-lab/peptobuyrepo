import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import type { CartAbandonedRecord } from "@/app/api/register-cart-abandonment/route";

const REDIS_KEY_PREFIX = "cart-abandoned:";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

interface CartItem { name: string; dose: string; price: number; quantity: number; }
interface Payload { email: string; cartItems: CartItem[]; cartTotal: number; sequence?: number; }

// ─── Shared HTML blocks ───────────────────────────────────────────────────────

const HEADER = `
<div style="background:#ff2d78;padding:28px 32px;text-align:center;">
  <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
  <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
</div>`;

const FOOTER = `
<div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
  <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
    ⚠ All products are for in vitro research use only. Not intended for human or animal consumption.
    Not approved by the FDA. By purchasing, you confirm compliance with all applicable laws.
  </p>
  <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
    You received this because you saved your cart at peptobuy.com. &nbsp;
    <a href="mailto:peptobuy@gmail.com?subject=Unsubscribe" style="color:#a1a1aa;">Unsubscribe</a>
  </p>
</div>`;

const TRUST_BADGES = `
<div style="display:flex;gap:12px;margin-bottom:24px;justify-content:center;flex-wrap:wrap;">
  <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">🔒 Secure Checkout</div>
  <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">🏅 ISO 9001 Tested</div>
  <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">📋 COA On Request</div>
</div>`;

const PROMO_BOX = `
<div style="border:3px solid #18181b;border-radius:12px;padding:18px 22px;margin-bottom:24px;background:#fafafa;">
  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#18181b;">🚚 FREE SHIPPING — Orders $250+</p>
  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:8px;">🎁 FREE GHK-Cu (100mg — $91.99 value) — Orders $250+ <span style="color:#cc0000;">(Only 3 left!)</span></p>
  <p style="margin:0;font-size:13px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:8px;">🧪 20% OFF FIRST ORDER — Code: <span style="font-family:monospace;font-size:14px;letter-spacing:.06em;color:#ff2d78;">FIRST20</span></p>
</div>`;

const STOCK_URGENCY = `
<div style="background:#fff5f5;border:1px solid #fca5a5;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
  <p style="margin:0;font-size:12px;font-weight:700;color:#cc0000;">🚨 Stock Alert:</p>
  <p style="margin:4px 0 0;font-size:12px;color:#991b1b;">⚠️ RTGLP3 (Reta 🐀) — Only 6 left in stock</p>
  <p style="margin:4px 0 0;font-size:12px;color:#991b1b;">⚠️ Free GHK-Cu vials — Only 3 remaining (orders $250+)</p>
  <p style="margin:4px 0 0;font-size:12px;color:#991b1b;">⚠️ BAC Water — Low Quantity — Act Fast!</p>
</div>`;

function itemRows(items: CartItem[]): string {
  return items.map((i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#18181b;">${i.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;">${i.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join("");
}

function itemTable(items: CartItem[], cartTotal: number): string {
  return `
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin-bottom:20px;">
      <thead>
        <tr style="background:#f4f4f5;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Product</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Dose</th>
          <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows(items)}</tbody>
    </table>
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #e5e5e5;margin-bottom:24px;">
      <span style="font-size:15px;font-weight:700;color:#18181b;">Cart Total</span>
      <span style="font-size:18px;font-weight:800;color:#ff2d78;">$${cartTotal.toFixed(2)}</span>
    </div>`;
}

// ─── Sequence 1 — 2 minute gentle reminder ────────────────────────────────────

function buildSeq1Html(items: CartItem[], cartTotal: number): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your cart is waiting</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
${HEADER}
<div style="padding:32px;">
  <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
    Your cart is waiting 🧪
  </h1>
  <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
    Hey! You left some research compounds in your cart. They&apos;re still saved — come back and complete your order.
  </p>
  ${itemTable(items, cartTotal)}
  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://peptobuy.com/cart"
      style="display:inline-block;background:#ff2d78;color:#fff;font-size:15px;font-weight:800;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:-0.01em;box-shadow:0 0 24px rgba(255,45,120,0.25);">
      Return to My Cart →
    </a>
  </div>
  <div style="background:#8B0000;border-radius:10px;padding:14px 18px;margin-bottom:20px;text-align:center;">
    <p style="margin:0;font-size:13px;font-weight:800;color:#fff;">⚡ Flash Sale — Free gifts + free shipping on $250+</p>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.85);">
      🚨 STOCK UPDATE: ⚠️ BAC Water — Low Quantity — Act Fast! · ⚠️ Reta only 6 left · ⚠️ Free GHK-Cu only 3 left
    </p>
  </div>
  <div style="background:#fff5f8;border:2px solid #ffb3cb;border-radius:10px;padding:14px 18px;margin-bottom:24px;text-align:center;">
    <p style="margin:0;font-size:13px;color:#cc1155;font-weight:600;">
      🧪 First order? Use code <strong style="font-family:monospace;font-size:15px;letter-spacing:.06em;">FIRST20</strong> for 20% off
    </p>
    <p style="margin:4px 0 0;font-size:12px;color:#cc1155;opacity:.8;">Apply at checkout before completing your order.</p>
  </div>
  ${TRUST_BADGES}
  <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
    Questions? <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
  </p>
</div>
${FOOTER}
</div>
</body></html>`;
}

// ─── Sequence 2 — 15 minute stronger urgency ──────────────────────────────────

function buildSeq2Html(items: CartItem[], cartTotal: number): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Still thinking it over?</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
${HEADER}
<div style="background:#8B0000;padding:16px 32px;text-align:center;">
  <p style="margin:0;font-size:13px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.06em;">⏰ DON&apos;T LET YOUR CART EXPIRE</p>
</div>
<div style="padding:32px;">
  <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
    Still thinking it over? 🔬
  </h1>
  <p style="margin:0 0 8px;font-size:14px;color:#71717a;line-height:1.6;">
    We noticed you haven&apos;t completed your order yet. Here&apos;s a reminder of what&apos;s waiting in your cart:
  </p>
  <p style="margin:0 0 24px;font-size:13px;font-weight:700;color:#8B0000;">
    Flash sale pricing + free gifts won&apos;t last forever.
  </p>
  ${itemTable(items, cartTotal)}
  <div style="text-align:center;margin-bottom:24px;">
    <a href="https://peptobuy.com/cart"
      style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 0 28px rgba(255,45,120,0.35);">
      Complete My Order Now →
    </a>
  </div>
  ${STOCK_URGENCY}
  ${PROMO_BOX}
  ${TRUST_BADGES}
  <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
    Questions? <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
  </p>
</div>
${FOOTER}
</div>
</body></html>`;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

async function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  return new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true, reason: "resend-not-configured" });
  }

  let payload: Payload;
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { email, cartItems, cartTotal, sequence = 1 } = payload;
  if (!email || !cartItems?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const redis = await getRedis();
  const norm  = email.toLowerCase();
  const key   = `${REDIS_KEY_PREFIX}${norm}`;
  const dedupKey = `cart-abandoned-sent-${sequence}:${norm}`;

  if (redis) {
    // Check if order was completed (record cancelled) or this sequence already sent
    const [record, alreadySent] = await Promise.all([
      redis.get<CartAbandonedRecord>(key),
      redis.exists(dedupKey),
    ]);

    if (!record) return NextResponse.json({ ok: true, skipped: true, reason: "no-record" });
    if (record.status === "cancelled") return NextResponse.json({ ok: true, skipped: true, reason: "cancelled" });
    if (alreadySent) return NextResponse.json({ ok: true, skipped: true, reason: `seq-${sequence}-already-sent` });

    // Mark this sequence as sent (6hr expiry)
    await redis.set(dedupKey, "1", { ex: 6 * 3600 });
  }

  const subject = sequence === 1
    ? "⚡ You left something in your cart — still interested?"
    : "🔬 Still thinking it over? Here's what you're missing.";

  const html = sequence === 1
    ? buildSeq1Html(cartItems, cartTotal)
    : buildSeq2Html(cartItems, cartTotal);

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: RESEND_FROM, to: email, subject, html });
    return NextResponse.json({ ok: true, sequence });
  } catch (err) {
    console.error("[send-abandoned-cart-email]", err);
    // Revert dedup key so it can retry
    if (redis) await redis.del(dedupKey).catch(() => {});
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
