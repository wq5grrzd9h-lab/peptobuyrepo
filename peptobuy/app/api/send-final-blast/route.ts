import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

const SKIP_EMAILS = new Set(["peptobuy@gmail.com", "tne.mustafa@gmail.com"]);

const ALL_EMAILS = [
  "accrains5@gmail.com",
  "jczap33@yahoo.com",
  "etrevino_2013@yahoo.com",
  "tiffrey76@gmail.com",
  "jorge.morelli@gmail.com",
  "rodmr90@gmail.com",
  "dds04300@aol.com",
  "prosariorg@yahoo.com",
  "cindy_arenas@yahoo.com",
  "lettymorin1980@gmail.com",
  "kkinderknecht11@gmail.com",
  "brandifirestone12@gmail.com",
  "marialopez4219@gmail.com",
  "mariimedina339@gmail.com",
  "hckytwn98@gmail.com",
  "christina_grvs@yahoo.com",
  "jordyn_hogs@yahoo.com",
  "chrissiemoore10@yahoo.com",
  "ashley.gremillion129@gmail.com",
  "absolutelybabbulous@gmail.com",
  "ashkynslee@gmail.com",
  "marcoantonioromero@alumni.usc.edu",
  "ing.jmurphy@gmail.com",
  "bajania@mail.com",
  "jeannetteb6@yahoo.com",
  "gonzalezjoann13@gmail.com",
  "bernadettes40@yahoo.com",
  "tne.mustafa@gmail.com",
  "hamiltonmarie166@gmail.com",
  "ssduclos@aol.com",
  "cher1961@aol.com",
  "danshafer47@yahoo.com",
  "santo_cracchiolo@yahoo.com",
].filter((e) => !SKIP_EMAILS.has(e.toLowerCase()));

const HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Final Hours — Sale Ends Tonight</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Logo header -->
    <div style="background:#ff2d78;padding:24px 32px;text-align:center;">
      <p style="margin:0;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
    </div>

    <!-- Full-width red banner -->
    <div style="background:#7f0000;padding:22px 32px;text-align:center;">
      <p style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.1em;">🚨 THIS IS YOUR FINAL WARNING</p>
    </div>

    <!-- Body -->
    <div style="padding:32px;">

      <!-- Giant bold headline -->
      <p style="margin:0 0 10px;font-size:28px;font-weight:900;color:#7f0000;text-align:center;letter-spacing:-0.02em;line-height:1.2;">
        SALE ENDS TONIGHT<br/>AT MIDNIGHT EST
      </p>
      <p style="margin:0 0 28px;font-size:14px;color:#52525b;text-align:center;line-height:1.6;">
        We&apos;re not extending this again. After midnight tonight everything goes back to normal pricing. This is it.
      </p>

      <!-- Countdown box -->
      <div style="background:#7f0000;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:900;color:#fff;letter-spacing:.04em;">
          ⏰ Hours remaining: TONIGHT AT MIDNIGHT EST
        </p>
      </div>

      <!-- Promo box -->
      <div style="border:3px solid #ff2d78;border-radius:12px;padding:20px 22px;margin-bottom:24px;background:#fff5f8;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:800;color:#18181b;">
          🎁 FREE BAC Water + Syringes — Every order automatically
        </p>
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#cc0000;border-top:1px solid #ffd6e5;padding-top:12px;">
          ⚠️ Only 4 kits left — first come first served
        </p>
        <p style="margin:0 0 12px;font-size:14px;font-weight:800;color:#18181b;border-top:1px solid #ffd6e5;padding-top:12px;">
          🎁 FREE GHK-Cu (100mg — $91.99 value) — Orders $250+
        </p>
        <p style="margin:0 0 12px;font-size:14px;font-weight:800;color:#18181b;border-top:1px solid #ffd6e5;padding-top:12px;">
          🚚 FREE SHIPPING — Orders $250+
        </p>
        <p style="margin:0;font-size:14px;font-weight:800;color:#18181b;border-top:1px solid #ffd6e5;padding-top:12px;">
          🧪 20% OFF YOUR FIRST ORDER — Code:
          <span style="font-family:monospace;font-size:16px;letter-spacing:.06em;color:#ff2d78;">FIRST20</span>
        </p>
      </div>

      <!-- What disappears at midnight -->
      <div style="background:#18181b;border-radius:12px;padding:20px 22px;margin-bottom:28px;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.06em;">After midnight tonight:</p>
        <p style="margin:0 0 8px;font-size:13px;color:#f87171;">❌ Free BAC Water kits — <strong style="color:#fca5a5;">GONE</strong></p>
        <p style="margin:0 0 8px;font-size:13px;color:#f87171;">❌ Free GHK-Cu offer — <strong style="color:#fca5a5;">GONE</strong></p>
        <p style="margin:0 0 8px;font-size:13px;color:#f87171;">❌ Free shipping on $250+ — <strong style="color:#fca5a5;">GONE</strong></p>
        <p style="margin:0 0 12px;font-size:13px;color:#f87171;">❌ All sale pricing — <strong style="color:#fca5a5;">GONE</strong></p>
        <p style="margin:0;font-size:13px;color:#86efac;font-weight:700;">✅ Your cart is still saved at peptobuy.com/cart</p>
      </div>

      <!-- Primary CTA -->
      <div style="text-align:center;margin-bottom:16px;">
        <a href="https://peptobuy.com/shop"
          style="display:inline-block;background:#ff2d78;color:#fff;font-size:18px;font-weight:900;text-decoration:none;padding:20px 48px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 0 40px rgba(255,45,120,0.45);">
          SHOP NOW — FINAL HOURS →
        </a>
      </div>

      <!-- Secondary CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="https://peptobuy.com/cart"
          style="display:inline-block;color:#ff2d78;font-size:13px;font-weight:700;text-decoration:underline;">
          Already have items in your cart? Complete your order →
        </a>
      </div>

      <!-- Product list -->
      <div style="text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#71717a;letter-spacing:.05em;text-transform:uppercase;">Available Now</p>
        <p style="margin:8px 0 0;font-size:14px;font-weight:700;color:#18181b;line-height:1.8;">
          BPC-157 &nbsp;·&nbsp; TB-500 &nbsp;·&nbsp; RTGLP3 (Reta 🐀) &nbsp;·&nbsp; MOTS-C<br/>
          NAD+ &nbsp;·&nbsp; Tesamorelin &nbsp;·&nbsp; GHK-Cu
        </p>
      </div>

      <!-- Trust line -->
      <p style="margin:0 0 20px;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">
        Every batch ISO 9001 certified &nbsp;·&nbsp; Third-party tested &nbsp;·&nbsp; COA on request
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

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = "🚨 FINAL HOURS — Sale Ends TONIGHT at Midnight. Don't Miss Out.";

  const BATCH_SIZE = 5;
  const BATCH_DELAY_MS = 200;

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < ALL_EMAILS.length; i += BATCH_SIZE) {
    const batch = ALL_EMAILS.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((to) =>
        resend.emails.send({ from: RESEND_FROM, to, subject, html: HTML }),
      ),
    );

    results.forEach((result, idx) => {
      const to = batch[idx];
      if (result.status === "fulfilled") {
        console.log(`[final-blast] ✓ sent → ${to}`);
        sent++;
      } else {
        console.error(`[final-blast] ✗ failed → ${to}`, result.reason);
        failed++;
      }
    });

    if (i + BATCH_SIZE < ALL_EMAILS.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: ALL_EMAILS.length });
}
