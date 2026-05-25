import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const INTERNAL_EMAIL = "peptobuy@gmail.com";

interface EmailItem {
  name: string;
  dose: string;
  quantity: number;
  price: number;
  reconstitution: boolean;
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

interface OrderEmailPayload {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: EmailItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  shipping: number;
  total: number;
  paymentMethod: "card" | "crypto" | "zelle";
  shippingAddress: ShippingAddress;
}

// ─── HTML helpers ─────────────────────────────────────────────────────────────

function itemRows(items: EmailItem[]): string {
  return items.map(item => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#18181b;">${item.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;">${item.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${item.reconstitution ? "Yes" : "No"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#18181b;text-align:right;font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join("");
}

function internalEmailHtml(d: OrderEmailPayload, timestamp: string): string {
  const addr = d.shippingAddress;
  const pmLabel = d.paymentMethod === "card" ? "Credit/Debit Card (Stripe)"
    : d.paymentMethod === "crypto" ? "Cryptocurrency (Plisio)"
    : "Zelle";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New Order</title></head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;background:#f9f9f9;color:#18181b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#ff2d78;padding:20px 28px;">
      <h1 style="margin:0;font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.02em;">
        🧪 New Order — ${d.orderNumber}
      </h1>
      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">${timestamp}</p>
    </div>

    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;width:130px;">Order #</td><td style="padding:6px 0;font-size:13px;font-weight:700;font-family:monospace;color:#18181b;">${d.orderNumber}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Payment</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${pmLabel}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Customer</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerName}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Email</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerEmail}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Ship to</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${addr.address}, ${addr.city}, ${addr.state} ${addr.zip}, ${addr.country}</td></tr>
      </table>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Product</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Dose</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Qty</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Recon</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows(d.items)}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Subtotal</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#18181b;">$${d.subtotal.toFixed(2)}</td></tr>
        ${d.discountAmount ? `<tr><td style="padding:4px 0;font-size:13px;color:#16a34a;font-weight:600;">Discount (${d.discountCode})</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#16a34a;font-weight:600;">-$${d.discountAmount.toFixed(2)}</td></tr>` : ""}
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

function customerEmailHtml(d: OrderEmailPayload): string {
  const isZelle = d.paymentMethod === "zelle";
  const addr = d.shippingAddress;

  const zelleBlock = isZelle ? `
    <div style="background:#fdf4ff;border:2px solid #a855f7;border-radius:10px;padding:18px 20px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#7e22ce;text-transform:uppercase;letter-spacing:.06em;">⚠ Action Required — Zelle Payment</p>
      <p style="margin:0;font-size:14px;color:#4c1d95;line-height:1.6;">
        Send <strong>$${d.total.toFixed(2)}</strong> via Zelle to
        <strong style="font-family:monospace;">peptobuy@gmail.com</strong>.<br>
        In the memo field enter <em>only</em> your order number:
        <strong style="font-family:monospace;font-size:15px;color:#7c3aed;">${d.orderNumber}</strong>
      </p>
    </div>` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
        ${isZelle ? "Order Placed" : "Order Confirmed"} ✓
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#71717a;">
        ${isZelle
          ? "Your order has been placed. Complete your Zelle payment to confirm it."
          : "Thank you for your order. We will ship promptly."}
      </p>

      <!-- Order number -->
      <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Order Number</p>
        <p style="margin:0;font-size:20px;font-weight:800;font-family:monospace;color:#ff2d78;letter-spacing:.04em;">${d.orderNumber}</p>
      </div>

      ${zelleBlock}

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Product</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Dose</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Qty</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${d.items.map(item => `
          <tr>
            <td style="padding:10px 12px;border-top:1px solid #f0f0f0;font-size:13px;color:#18181b;">${item.name}${item.reconstitution ? ' <span style="font-size:11px;color:#ff2d78;font-weight:600;">(pre-mixed)</span>' : ""}</td>
            <td style="padding:10px 12px;border-top:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${item.dose}</td>
            <td style="padding:10px 12px;border-top:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${item.quantity}</td>
            <td style="padding:10px 12px;border-top:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`).join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Subtotal</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">$${d.subtotal.toFixed(2)}</td></tr>
        ${d.discountAmount ? `<tr><td style="padding:3px 0;font-size:13px;color:#16a34a;font-weight:600;">Discount (${d.discountCode})</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#16a34a;font-weight:600;">-$${d.discountAmount.toFixed(2)}</td></tr>` : ""}
        <tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Shipping</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">${d.shipping === 0 ? "Free" : `$${d.shipping.toFixed(2)}`}</td></tr>
        <tr style="border-top:2px solid #e5e5e5;">
          <td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#18181b;">Total</td>
          <td style="padding:10px 0 0;font-size:17px;font-weight:800;text-align:right;color:#ff2d78;">$${d.total.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Shipping address -->
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

    <!-- Footer -->
    <div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
        ⚠ All products are for in vitro research use only. Not intended for human or animal
        consumption. Not approved by the FDA. By purchasing, you confirm compliance with all
        applicable laws.
      </p>
    </div>
  </div>
</body></html>`;
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

    const [internalResult, customerResult] = await Promise.allSettled([
      resend.emails.send({
        from: RESEND_FROM,
        to: INTERNAL_EMAIL,
        subject: `New Order — ${payload.orderNumber}`,
        html: internalEmailHtml(payload, timestamp),
      }),
      resend.emails.send({
        from: RESEND_FROM,
        to: payload.customerEmail,
        subject: `Your PeptoBuy Order Confirmation — ${payload.orderNumber}`,
        html: customerEmailHtml(payload),
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
