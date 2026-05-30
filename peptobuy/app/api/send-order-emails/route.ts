import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildInternalHtml,
  buildCustomerHtml,
  deriveFreeGifts,
  type OrderEmailData,
} from "@/lib/orderEmailBuilders";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const INTERNAL_EMAIL = "peptobuy@gmail.com";

interface OrderEmailPayload {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    dose: string;
    quantity: number;
    price: number;
    reconstitution: boolean;
  }>;
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  shipping: number;
  taxAmount?: number;
  total: number;
  paymentMethod: "card" | "crypto" | "zelle";
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  freeGifts?: string[];
}

function pmLabel(method: OrderEmailPayload["paymentMethod"]): string {
  switch (method) {
    case "card":   return "Credit / Debit Card (Stripe)";
    case "crypto": return "Cryptocurrency (Plisio)";
    case "zelle":  return "Zelle";
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  console.log("send-order-emails called");
  console.log("Resend key exists:", !!process.env.RESEND_API_KEY);

  if (!process.env.RESEND_API_KEY) {
    console.warn("[send-order-emails] RESEND_API_KEY not set — skipping email send");
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const payload: OrderEmailPayload = await request.json();
    console.log("Sending to customer:", payload.customerEmail, "| order:", payload.orderNumber);
    console.log("Sending to", INTERNAL_EMAIL);
    console.log("From:", RESEND_FROM);

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const discountedSubtotal = payload.subtotal - (payload.discountAmount ?? 0);
    const freeGifts = payload.freeGifts ?? deriveFreeGifts(discountedSubtotal);

    const emailData: OrderEmailData = {
      orderNumber:        payload.orderNumber,
      customerEmail:      payload.customerEmail,
      customerName:       payload.customerName,
      items:              payload.items,
      subtotal:           payload.subtotal,
      discountCode:       payload.discountCode,
      discountAmount:     payload.discountAmount,
      shipping:           payload.shipping,
      taxAmount:          payload.taxAmount,
      total:              payload.total,
      paymentMethodLabel: pmLabel(payload.paymentMethod),
      shippingAddress:    payload.shippingAddress,
      freeGifts,
    };

    const zelleBlock = payload.paymentMethod === "zelle" ? `
    <div style="background:#fdf4ff;border:2px solid #a855f7;border-radius:10px;padding:18px 20px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#7e22ce;text-transform:uppercase;letter-spacing:.06em;">⚠ Action Required — Zelle Payment</p>
      <p style="margin:0;font-size:14px;color:#4c1d95;line-height:1.6;">
        Send <strong>$${payload.total.toFixed(2)}</strong> via Zelle to
        <strong style="font-family:monospace;">peptobuy@gmail.com</strong>.<br>
        In the memo field enter <em>only</em> your order number:
        <strong style="font-family:monospace;font-size:15px;color:#7c3aed;">${payload.orderNumber}</strong>
      </p>
    </div>` : "";

    const [internalResult, customerResult] = await Promise.allSettled([
      resend.emails.send({
        from: RESEND_FROM,
        to: INTERNAL_EMAIL,
        subject: `New Order — ${payload.orderNumber}`,
        html: buildInternalHtml(emailData, timestamp),
      }),
      resend.emails.send({
        from: RESEND_FROM,
        to: payload.customerEmail,
        subject: `Your PeptoBuy Order Confirmation — ${payload.orderNumber}`,
        html: buildCustomerHtml(emailData, zelleBlock),
      }),
    ]);

    console.log("Resend internal result:", internalResult.status,
      internalResult.status === "fulfilled" ? internalResult.value : internalResult.reason);
    console.log("Resend customer result:", customerResult.status,
      customerResult.status === "fulfilled" ? customerResult.value : customerResult.reason);

    if (internalResult.status === "rejected") {
      console.error("[send-order-emails] Internal email failed:", internalResult.reason);
    }
    if (customerResult.status === "rejected") {
      console.error("[send-order-emails] Customer email failed:", customerResult.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-order-emails] Unhandled error:", err);
    return NextResponse.json({ error: "Email send failed" }, { status: 500 });
  }
}
