/**
 * GET /api/send-manual-followups
 *
 * Sends 4 personalised order follow-up emails immediately via Resend.
 * Call once: curl https://peptobuy.com/api/send-manual-followups
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = "PeptoBuy <noreply@peptobuy.com>";
const CART_URL = "https://peptobuy.com/cart";

// ─── HTML template ────────────────────────────────────────────────────────────

interface CartLine {
  name: string;
  dose: string;
  qty: number;
  price: number;
}

interface FollowupEmail {
  to: string;
  firstName: string;
  ctaVerb: string; // "Complete" | "Secure" | "Don't miss out — complete"
  urgencyLine: string;
  cartLines: CartLine[];
  orderLabel: string; // e.g. "Order total with current discount:"
  orderTotal: number;
}

function buildHtml(e: FollowupEmail): string {
  const cartRows = e.cartLines
    .map(
      (line) => `
      <tr>
        <td style="padding:10px 14px;font-size:14px;color:#18181b;border-bottom:1px solid #f0f0f0;">
          ${line.name}
        </td>
        <td style="padding:10px 14px;font-size:14px;color:#52525b;text-align:center;border-bottom:1px solid #f0f0f0;">
          ${line.dose}
        </td>
        <td style="padding:10px 14px;font-size:14px;color:#52525b;text-align:center;border-bottom:1px solid #f0f0f0;">
          ×${line.qty}
        </td>
        <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#18181b;text-align:right;border-bottom:1px solid #f0f0f0;">
          $${(line.price * line.qty).toFixed(2)}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your PeptoBuy order is waiting</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#ff2d78;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 0;">

              <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
                Your order is waiting, ${e.firstName}
              </h1>

              <!-- Urgency line -->
              <div style="background:#fff5f5;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin:20px 0;">
                <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:700;">
                  ⏰ ${e.urgencyLine}
                </p>
              </div>

              <!-- Cart card -->
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Your Cart</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:10px;overflow:hidden;margin-bottom:16px;">
                <thead>
                  <tr style="background:#f4f4f5;">
                    <th style="padding:9px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Product</th>
                    <th style="padding:9px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Dose</th>
                    <th style="padding:9px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Qty</th>
                    <th style="padding:9px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Price</th>
                  </tr>
                </thead>
                <tbody>${cartRows}</tbody>
              </table>

              <!-- Order total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#71717a;">${e.orderLabel}</td>
                  <td style="padding:4px 0;font-size:16px;font-weight:900;text-align:right;color:#ff2d78;">$${e.orderTotal.toFixed(2)}</td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${CART_URL}"
                       style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:900;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.01em;box-shadow:0 4px 16px rgba(255,45,120,0.3);">
                      ${e.ctaVerb} My Order →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support line -->
              <p style="margin:0 0 32px;font-size:13px;color:#71717a;line-height:1.6;text-align:center;">
                Any questions? Reply to this email or reach us at
                <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 6px;font-size:12px;color:#a1a1aa;text-align:center;font-style:italic;">
                For research use only. Not for human consumption.
              </p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;font-weight:600;">
                The PeptoBuy Team ·
                <a href="https://peptobuy.com" style="color:#a1a1aa;text-decoration:none;">peptobuy.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Email definitions ────────────────────────────────────────────────────────

interface EmailDef extends FollowupEmail {
  subject: string;
}

const EMAILS: EmailDef[] = [
  {
    to: "etrevino_2013@yahoo.com",
    subject: "Your PeptoBuy order is waiting — sale ends tonight",
    firstName: "Erika",
    ctaVerb: "Complete",
    urgencyLine:
      "Free shipping, discounts, and all current specials end TONIGHT at midnight EST. After midnight regular pricing and shipping rates apply.",
    cartLines: [
      { name: "RTGLP3 (Reta 🐀)", dose: "10mg", qty: 1, price: 103.99 },
    ],
    orderLabel: "Order total with current discount:",
    orderTotal: 83.19,
  },
  {
    to: "tiffrey76@gmail.com",
    subject: "Your PeptoBuy order is waiting — sale ends tonight",
    firstName: "Tiffany",
    ctaVerb: "Complete",
    urgencyLine:
      "Free shipping, discounts, and all current specials end TONIGHT at midnight EST. After tonight regular pricing applies.",
    cartLines: [
      { name: "RTGLP3 (Reta 🐀)", dose: "10mg", qty: 1, price: 103.99 },
      { name: "BAC Water", dose: "10ml", qty: 1, price: 17.99 },
    ],
    orderLabel: "Order total with current specials:",
    orderTotal: 97.58,
  },
  {
    to: "jorge.morelli@gmail.com",
    subject: "Your PeptoBuy order is waiting — sale ends tonight",
    firstName: "Jorge",
    ctaVerb: "Secure",
    urgencyLine:
      "Free shipping, discounts, and current specials are only available through TONIGHT at midnight EST. After midnight standard pricing kicks in.",
    cartLines: [
      { name: "RTGLP3 (Reta 🐀)", dose: "10mg", qty: 1, price: 103.99 },
    ],
    orderLabel: "Order total with current discount:",
    orderTotal: 83.19,
  },
  {
    to: "jczap33@yahoo.com",
    subject: "Your PeptoBuy order is waiting — sale ends tonight",
    firstName: "John",
    ctaVerb: "Complete",
    urgencyLine:
      "Free shipping, discounts, and all current specials end TONIGHT at midnight EST. After today regular pricing and shipping rates apply.",
    cartLines: [
      { name: "RTGLP3 (Reta 🐀)", dose: "30mg", qty: 1, price: 259.98 },
    ],
    orderLabel: "Order total with current discount:",
    orderTotal: 207.98,
  },
];

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const results = await Promise.allSettled(
    EMAILS.map(async (email) => {
      const result = await resend.emails.send({
        from: FROM,
        to: email.to,
        subject: email.subject,
        html: buildHtml(email),
      });
      console.log(`[send-manual-followups] ✓ ${email.to}`, result);
      return { to: email.to, result };
    })
  );

  const summary = results.map((r, i) => ({
    to: EMAILS[i].to,
    firstName: EMAILS[i].firstName,
    status: r.status,
    ...(r.status === "fulfilled"
      ? { id: (r.value as { result: { id?: string } }).result.id }
      : { error: String((r as PromiseRejectedResult).reason) }),
  }));

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`[send-manual-followups] done — sent:${sent} failed:${failed}`);
  return NextResponse.json({ success: true, sent, failed, emails: summary });
}
