import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

const TONIGHT_EMAILS = [
  "accrains5@gmail.com",
  "hamiltonmarie166@gmail.com",
  "ssduclos@aol.com",
  "cher1961@aol.com",
  "danshafer47@yahoo.com",
  "santo_cracchiolo@yahoo.com",
];

const DAN_EMAIL = "danshafer47@yahoo.com";

function buildHtml(to: string): string {
  const isDan = to.toLowerCase() === DAN_EMAIL;

  const danNote = isDan
    ? `
      <!-- Dan-specific cart note -->
      <div style="background:#f0f9ff;border:2px solid #0ea5e9;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#0c4a6e;">📋 Your Recent Cart</p>
        <p style="margin:8px 0 0;font-size:13px;color:#075985;line-height:1.6;">
          We noticed you had a significant order ready — Tesamorelin and RTGLP3. That&apos;s a
          <strong>$1,219.87 order with your 20% discount already applied</strong>. We&apos;d hate for
          you to miss out on the free shipping on top of that.
        </p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your cart expires tonight</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
    </div>

    <!-- Red urgency banner -->
    <div style="background:#8B0000;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.06em;">🚨 TONIGHT IS YOUR LAST CHANCE</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">

      <p style="margin:0 0 8px;font-size:16px;font-weight:800;color:#18181b;">
        Your cart is still saved — but the sale ends <span style="color:#8B0000;">TONIGHT at midnight EST.</span>
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.6;">
        After midnight: free shipping ends, free gifts are gone, prices return to normal.
      </p>

      <!-- Cart reminder box -->
      <div style="background:#fff5f8;border:2px solid #ff2d78;border-radius:10px;padding:16px 20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;font-size:15px;font-weight:800;color:#18181b;">🛒 Your cart is waiting at peptobuy.com/cart</p>
        <p style="margin:8px 0 0;font-size:13px;color:#52525b;">Complete your order before midnight to lock in:</p>
      </div>

      <!-- Promo box -->
      <div style="border:3px solid #18181b;border-radius:12px;padding:18px 22px;margin-bottom:24px;background:#fafafa;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;">🚚 FREE SHIPPING — Every order. Ends tonight.</p>
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:10px;">🎁 FREE BAC Water + Syringes — Every order <span style="color:#cc0000;">(Only 3 more free GHK-Cu vials! — orders $250+)</span></p>
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:10px;">🎁 FREE GHK-Cu (100mg — $91.99 value) — Orders $250+</p>
        <p style="margin:0;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:10px;">🧪 20% OFF FIRST ORDER — Code: <span style="font-family:monospace;font-size:15px;letter-spacing:.06em;color:#ff2d78;">FIRST20</span></p>
      </div>

      ${danNote}

      <!-- Urgency closing -->
      <div style="text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:16px;font-weight:900;color:#8B0000;">⏰ SALE ENDS TONIGHT AT MIDNIGHT. NO EXTENSIONS.</p>
      </div>

      <!-- CTA button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://peptobuy.com/cart"
          style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 0 28px rgba(255,45,120,0.35);">
          COMPLETE MY ORDER NOW →
        </a>
      </div>

      <!-- Product list -->
      <div style="text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#71717a;letter-spacing:.04em;text-transform:uppercase;">Available Now</p>
        <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#18181b;line-height:1.8;">
          BPC-157 &nbsp;·&nbsp; TB-500 &nbsp;·&nbsp; RTGLP3 (Reta 🐀) &nbsp;·&nbsp; MOTS-C<br/>
          Tesamorelin &nbsp;·&nbsp; GHK-Cu
        </p>
      </div>

      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
        Questions? Email us at
        <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
      <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
        ⚠ For qualified researchers and laboratory professionals only. Not for human consumption.
        Not approved by the FDA. By purchasing, you confirm compliance with all applicable laws.
      </p>
      <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
        You received this because you started a checkout at peptobuy.com. &nbsp;
        <a href="mailto:peptobuy@gmail.com?subject=Unsubscribe" style="color:#a1a1aa;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body></html>`;
}

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = "🚨 Your Cart Expires Tonight — Free Shipping Ends at Midnight";

  let sent = 0;
  let failed = 0;

  const results = await Promise.allSettled(
    TONIGHT_EMAILS.map((to) =>
      resend.emails.send({
        from: RESEND_FROM,
        to,
        subject,
        html: buildHtml(to),
      }),
    ),
  );

  results.forEach((result, idx) => {
    const to = TONIGHT_EMAILS[idx];
    if (result.status === "fulfilled") {
      console.log(`[tonight-blast] ✓ sent → ${to}`);
      sent++;
    } else {
      console.error(`[tonight-blast] ✗ failed → ${to}`, result.reason);
      failed++;
    }
  });

  return NextResponse.json({ success: true, sent, failed, total: TONIGHT_EMAILS.length });
}
