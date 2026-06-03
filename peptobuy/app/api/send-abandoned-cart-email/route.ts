import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";
import { MEMORIAL_DAY_END } from "@/lib/memorialDay";
import type { CartAbandonedRecord } from "@/app/api/register-cart-abandonment/route";

const REDIS_KEY_PREFIX = "cart-abandoned:";
const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

interface CartItem { name: string; dose: string; price: number; quantity: number; }
interface Payload { email: string; cartItems: CartItem[]; cartTotal: number; }

function itemRows(items: CartItem[]): string {
  return items.map((i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#18181b;">${i.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;">${i.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join("");
}

function buildHtml(items: CartItem[], cartTotal: number): string {
  const memorialActive = Date.now() < MEMORIAL_DAY_END.getTime();
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your cart is waiting</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
    <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
  </div>

  <div style="padding:32px;">
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
      Your cart is waiting 🧪
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      Hey! You left some research compounds in your cart. They&apos;re still reserved — come back and complete your order.
    </p>

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
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://peptobuy.com/cart"
        style="display:inline-block;background:#ff2d78;color:#fff;font-size:15px;font-weight:800;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:-0.01em;box-shadow:0 0 24px rgba(255,45,120,0.25);">
        Return to My Cart →
      </a>
    </div>

    ${memorialActive ? `
    <div style="background:#8B0000;border-radius:10px;padding:14px 18px;margin-bottom:20px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:800;color:#fff;">🇺🇸 Memorial Day Sale — Ends Monday Midnight</p>
      <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.5;">
        🚨 STOCK UPDATE: ⚠️ BAC Water — Low Quantity — Act Fast! · ⚠️ Syringes almost gone · ⚠️ Reta only 6 left · ⚠️ Free GHK-Cu only 3 left (orders $250+)
      </p>
    </div>` : ""}

    <div style="background:#fff5f8;border:2px solid #ffb3cb;border-radius:10px;padding:14px 18px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:13px;color:#cc1155;font-weight:600;">
        🧪 First order? Use code <strong style="font-family:monospace;font-size:15px;letter-spacing:.06em;">FIRST20</strong> for 20% off
      </p>
      <p style="margin:4px 0 0;font-size:12px;color:#cc1155;opacity:.8;">Apply at checkout before completing your order.</p>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:24px;justify-content:center;flex-wrap:wrap;">
      <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">🔒 Secure Checkout</div>
      <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">🏅 ISO 9001 Tested</div>
      <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">📋 COA On Request</div>
    </div>

    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
      Questions? <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
    </p>
  </div>

  <div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
    <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
      ⚠ All products are for in vitro research use only. Not intended for human or animal consumption.
      Not approved by the FDA. By purchasing, you confirm compliance with all applicable laws.
    </p>
    <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
      You received this because you saved your cart at peptobuy.com. &nbsp;
      <a href="mailto:peptobuy@gmail.com?subject=Unsubscribe" style="color:#a1a1aa;">Unsubscribe</a>
    </p>
  </div>
</div>
</body></html>`;
}

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

  const { email, cartItems, cartTotal } = payload;
  if (!email || !cartItems?.length) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const redis = await getRedis();
  const key = `${REDIS_KEY_PREFIX}${email.toLowerCase()}`;

  if (redis) {
    const record = await redis.get<CartAbandonedRecord>(key);
    if (!record) return NextResponse.json({ ok: true, skipped: true, reason: "no-record" });
    if (record.status === "cancelled") return NextResponse.json({ ok: true, skipped: true, reason: "cancelled" });
    if (record.status === "sent") return NextResponse.json({ ok: true, skipped: true, reason: "already-sent" });
    await redis.set(key, { ...record, status: "sent" }, { ex: 86400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: "Your cart is waiting 🧪",
      html: buildHtml(cartItems, cartTotal),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-abandoned-cart-email]", err);
    if (redis) {
      const record = await redis.get<CartAbandonedRecord>(key);
      if (record?.status === "sent") await redis.set(key, { ...record, status: "pending" }, { ex: 86400 });
    }
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}
