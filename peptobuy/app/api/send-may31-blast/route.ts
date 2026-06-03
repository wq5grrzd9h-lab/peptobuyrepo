import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const SKIP = new Set(["peptobuy@gmail.com", "tne.mustafa@gmail.com"]);

const EMAILS = [
  "jbljkj2113@gmail.com",
  "geomartinez1980@gmail.com",
  "rguerrero198705@yahoo.com",
  "localgurl5454@yahoo.com",
  "bridget1250@yahoo.com",
  "krisbendixen@ymail.com",
  "jaywmez@aol.com",
  "91rubio.t@gmail.com",
  "agostomary48@gmail.com",
  "kimidtx@yahoo.com",
  "taylorvavra92@gmail.com",
  "cbajal@aol.com",
  "jaimegalan208@gmail.com",
  "fogerlover1@gmail.com",
  "mcecilia65@yahoo.com",
];

const HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Sale Ends Tonight</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Logo header -->
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);font-weight:500;">Research-Grade Peptides</p>
    </div>

    <!-- Red urgency banner -->
    <div style="background:#8B0000;padding:18px 32px;text-align:center;">
      <p style="margin:0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.08em;">⏰ SALE ENDS TONIGHT AT MIDNIGHT EST</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">

      <p style="margin:0 0 6px;font-size:17px;font-weight:800;color:#18181b;">You visited PeptoBuy today but didn't complete your order.</p>
      <p style="margin:0 0 28px;font-size:14px;color:#52525b;line-height:1.7;">
        Your cart is saved and ready — but every deal disappears at midnight tonight. No extensions.
      </p>

      <!-- Promo box -->
      <div style="border:2px solid #ff2d78;border-radius:14px;padding:20px 24px;margin-bottom:24px;background:#fff8fb;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#cc0000;">🚨 STOCK ALERT:</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#cc0000;">⚠️ BAC Water — Low Quantity — Act Fast!</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ Syringes — last few remaining</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ RTGLP3 (Reta) — Only 6 left in stock</p>
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ Free GHK-Cu — Only 3 left (orders $250+)</p>
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #ffd6e6;padding-top:10px;">🎁 FREE GHK-Cu (100mg — $91.99 value) — Orders $250+</p>
        <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#cc0000;padding-left:16px;">⚠️ Only 3 left</p>
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #ffd6e6;padding-top:10px;">🚚 FREE SHIPPING — Orders $250+</p>
        <p style="margin:0;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #ffd6e6;padding-top:10px;">🧪 20% OFF FIRST ORDER — Code: <span style="font-family:monospace;font-size:15px;letter-spacing:.06em;color:#ff2d78;">FIRST20</span></p>
      </div>

      <!-- What ends at midnight -->
      <div style="background:#18181b;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.06em;">What ends at midnight tonight:</p>
        <p style="margin:0 0 7px;font-size:13px;color:#fca5a5;">⚠️ BAC Water — Low Quantity — Act Fast!</p>
        <p style="margin:0 0 7px;font-size:13px;color:#fca5a5;">❌ Free GHK-Cu offer — GONE</p>
        <p style="margin:0 0 7px;font-size:13px;color:#fca5a5;">❌ Free shipping on $250+ — GONE</p>
        <p style="margin:0 0 12px;font-size:13px;color:#fca5a5;">❌ Sale pricing — BACK TO NORMAL</p>
        <p style="margin:0;font-size:13px;color:#86efac;font-weight:700;">✅ Your cart is still saved at peptobuy.com/cart</p>
      </div>

      <!-- Primary CTA -->
      <div style="text-align:center;margin-bottom:14px;">
        <a href="https://peptobuy.com/cart" style="display:inline-block;background:#ff2d78;color:#fff;font-size:17px;font-weight:900;text-decoration:none;padding:18px 44px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 0 32px rgba(255,45,120,0.4);">
          Complete My Order Now →
        </a>
      </div>

      <!-- Secondary CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://peptobuy.com/shop" style="display:inline-block;color:#ff2d78;font-size:14px;font-weight:700;text-decoration:none;border:2px solid #ff2d78;padding:10px 28px;border-radius:10px;">
          Browse Products →
        </a>
      </div>

      <!-- Final urgency -->
      <p style="margin:0 0 24px;font-size:16px;font-weight:900;color:#8B0000;text-align:center;">
        🚨 MIDNIGHT TONIGHT. THIS IS YOUR FINAL REMINDER.
      </p>

      <!-- Product list -->
      <div style="text-align:center;margin-bottom:20px;padding:16px;background:#f9fafb;border-radius:10px;">
        <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#a1a1aa;text-transform:uppercase;letter-spacing:.06em;">Available Now</p>
        <p style="margin:0;font-size:13px;font-weight:600;color:#18181b;line-height:1.9;">
          BPC-157 &nbsp;·&nbsp; TB-500 &nbsp;·&nbsp; RTGLP3 (Reta 🐀) &nbsp;·&nbsp; MOTS-C<br/>
          Tesamorelin &nbsp;·&nbsp; GHK-Cu
        </p>
      </div>

      <!-- Trust line -->
      <p style="margin:0;font-size:12px;color:#71717a;text-align:center;line-height:1.6;">
        Every batch ISO 9001 certified &nbsp;·&nbsp; Third-party tested &nbsp;·&nbsp; COA on request
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
      <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
        For qualified researchers and laboratory professionals only. Not for human consumption.
        Not approved by the FDA. By purchasing you confirm compliance with all applicable laws.
      </p>
      <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
        You received this because you started a checkout at peptobuy.com. &nbsp;
        <a href="mailto:peptobuy@gmail.com?subject=Unsubscribe" style="color:#a1a1aa;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body></html>`;

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = "⚡ Your Cart Is Saved — Sale Ends TONIGHT at Midnight";
  const targets = EMAILS.filter((e) => !SKIP.has(e.toLowerCase()));

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i += 5) {
    const batch = targets.slice(i, i + 5);
    const results = await Promise.allSettled(
      batch.map((to) => resend.emails.send({ from: RESEND_FROM, to, subject, html: HTML }))
    );

    results.forEach((r, j) => {
      const to = batch[j];
      if (r.status === "fulfilled") {
        console.log(`[may31-blast] ✓ ${to}`);
        sent++;
      } else {
        console.error(`[may31-blast] ✗ ${to}`, r.reason);
        failed++;
      }
    });

    if (i + 5 < targets.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: targets.length });
}
