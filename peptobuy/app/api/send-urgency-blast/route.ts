import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

const URGENCY_EMAILS = [
  "jenntuckett@gmail.com",
  "kimmira895@yahoo.com",
  "baby_kisses_9@yahoo.com",
  "sebastiandreyt3@gmail.com",
  "mariahg0802@gmail.com",
  "saperrry66@outlook.com",
  "tne.mustafa@gmail.com",
  "mjs1115.ms@gmail.com",
  "23spicier_fill@icloud.com",
  "tiffrey76@gmail.com",
  "etrevino_2013@yahoo.com",
  "jczap33@yahoo.com",
  "jorge.morelli@gmail.com",
  "hckytwn98@gmail.com",
];

function buildHtml(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Sale Ends TONIGHT</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
    </div>

    <!-- Red urgency banner -->
    <div style="background:#8B0000;padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.06em;">🚨 TONIGHT IS THE LAST CHANCE</p>
      <p style="margin:10px 0 0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.02em;">SALE ENDS AT MIDNIGHT EST TONIGHT</p>
      <p style="margin:10px 0 0;font-size:14px;color:rgba(255,255,255,0.88);line-height:1.6;">
        This is your final reminder. Every deal, every free gift, every discount disappears at midnight tonight. No exceptions.
      </p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">

      <!-- Promo box -->
      <div style="border:3px solid #18181b;border-radius:12px;padding:20px 24px;margin-bottom:28px;background:#fafafa;">
        <div style="margin-bottom:14px;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#18181b;">🎁 FREE BAC Water + Syringes</p>
          <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Every order. Auto-added at checkout.</p>
          <p style="margin:6px 0 0;font-size:13px;font-weight:700;color:#cc0000;">⚠️ Only 3 more free GHK-Cu vials — orders $250+</p>
        </div>
        <div style="border-top:1px solid #e5e5e5;padding-top:14px;margin-bottom:14px;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#18181b;">🎁 FREE GHK-Cu (100mg — $91.99 value)</p>
          <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Orders $250+. Auto-added at checkout. No code needed.</p>
        </div>
        <div style="border-top:1px solid #e5e5e5;padding-top:14px;margin-bottom:14px;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#18181b;">🚚 FREE SHIPPING</p>
          <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Every order. No minimum. Ends tonight.</p>
        </div>
        <div style="border-top:1px solid #e5e5e5;padding-top:14px;">
          <p style="margin:0;font-size:15px;font-weight:800;color:#18181b;">🧪 20% OFF FIRST ORDER</p>
          <p style="margin:4px 0 0;font-size:13px;color:#52525b;">Code: <strong style="font-family:monospace;font-size:15px;letter-spacing:.06em;color:#ff2d78;">FIRST20</strong></p>
        </div>
      </div>

      <!-- After-midnight countdown -->
      <div style="background:#fff5f5;border:2px solid #fca5a5;border-radius:12px;padding:18px 22px;margin-bottom:28px;">
        <p style="margin:0 0 10px;font-size:15px;font-weight:800;color:#7f1d1d;">⏰ After midnight tonight:</p>
        <p style="margin:5px 0;font-size:13px;color:#991b1b;">✗&nbsp; Free shipping ends</p>
        <p style="margin:5px 0;font-size:13px;color:#991b1b;">✗&nbsp; Free BAC Water kits are gone</p>
        <p style="margin:5px 0;font-size:13px;color:#991b1b;">✗&nbsp; Free GHK-Cu offer ends</p>
        <p style="margin:5px 0;font-size:13px;color:#991b1b;">✗&nbsp; Prices return to normal</p>
      </div>

      <!-- CTA button -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://peptobuy.com/shop"
          style="display:inline-block;background:#ff2d78;color:#fff;font-size:17px;font-weight:900;text-decoration:none;padding:18px 44px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 0 32px rgba(255,45,120,0.35);">
          SHOP NOW — ENDS TONIGHT →
        </a>
      </div>

      <!-- Product list -->
      <div style="text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#71717a;letter-spacing:.04em;text-transform:uppercase;">Available Now</p>
        <p style="margin:8px 0 0;font-size:14px;font-weight:600;color:#18181b;line-height:1.8;">
          BPC-157 &nbsp;·&nbsp; TB-500 &nbsp;·&nbsp; RTGLP3 (Reta 🐀) &nbsp;·&nbsp; MOTS-C<br/>
          Tesamorelin &nbsp;·&nbsp; GHK-Cu
        </p>
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = "🚨 Sale Ends TONIGHT at Midnight — Free Gifts + Free Shipping Last Chance";
  const html = buildHtml();

  const BATCH_SIZE = 5;
  const BATCH_DELAY_MS = 200;

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < URGENCY_EMAILS.length; i += BATCH_SIZE) {
    const batch = URGENCY_EMAILS.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((to) =>
        resend.emails.send({ from: RESEND_FROM, to, subject, html }),
      ),
    );

    results.forEach((result, idx) => {
      const to = batch[idx];
      if (result.status === "fulfilled") {
        console.log(`[urgency-blast] ✓ sent → ${to}`);
        sent++;
      } else {
        console.error(`[urgency-blast] ✗ failed → ${to}`, result.reason);
        failed++;
      }
    });

    if (i + BATCH_SIZE < URGENCY_EMAILS.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: URGENCY_EMAILS.length });
}
