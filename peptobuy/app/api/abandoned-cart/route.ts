import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

interface CartEmailItem {
  name: string;
  dose: string;
  price: number;
  quantity: number;
}

interface AbandonedCartPayload {
  customerEmail: string;
  customerName?: string;
  cartItems: CartEmailItem[];
  cartTotal: number;
  abandonedAt: string;
}

function itemRows(items: CartEmailItem[]): string {
  return items.map((item) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#18181b;">${item.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;">${item.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join("");
}

function buildHtml(d: AbandonedCartPayload): string {
  const firstName = d.customerName?.split(" ")[0] ?? "Researcher";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>You left something behind</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
        Hey ${firstName}, you left something in your cart 🧪
      </h1>
      <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
        Your research compounds are waiting. Come back and complete your order — your cart is saved and ready.
      </p>

      <!-- Cart items -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Product</th>
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Dose</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows(d.cartItems)}</tbody>
      </table>

      <!-- Cart total -->
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #e5e5e5;margin-bottom:24px;">
        <span style="font-size:15px;font-weight:700;color:#18181b;">Cart Total</span>
        <span style="font-size:18px;font-weight:800;color:#ff2d78;">$${d.cartTotal.toFixed(2)}</span>
      </div>

      <!-- CTA button -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://peptobuy.com/cart"
          style="display:inline-block;background:#ff2d78;color:#fff;font-size:15px;font-weight:800;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:-0.01em;box-shadow:0 0 24px rgba(255,45,120,0.25);">
          Complete Your Order →
        </a>
      </div>

      <!-- FIRST20 nudge -->
      <div style="background:#fff5f8;border:2px solid #ffb3cb;border-radius:10px;padding:14px 18px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-size:13px;color:#cc1155;font-weight:600;">
          🧪 First order? Use code <strong style="font-family:monospace;font-size:15px;letter-spacing:.06em;">FIRST20</strong> for 20% off
        </p>
        <p style="margin:4px 0 0;font-size:12px;color:#cc1155;opacity:.8;">Apply at checkout before completing your order.</p>
      </div>

      <!-- Trust line -->
      <p style="margin:0 0 24px;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">
        Every batch third-party tested &nbsp;·&nbsp; ISO 9001 certified labs &nbsp;·&nbsp; COA on request
      </p>

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

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const payload: AbandonedCartPayload = await request.json();

    if (!payload.customerEmail || !payload.cartItems?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: RESEND_FROM,
      to: payload.customerEmail,
      subject: "You left something behind 🧪",
      html: buildHtml(payload),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[abandoned-cart]", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
