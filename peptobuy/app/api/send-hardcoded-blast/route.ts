/**
 * POST /api/send-hardcoded-blast
 * Body: { emailType: "noon" | "evening" }
 *
 * Sends Memorial Day blast to hardcoded email list.
 * No deduplication — sends to everyone unconditionally.
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ALL_EMAILS = [
  "tiffrey76@gmail.com",
  "eddy.esquivel@yahoo.com",
  "jorge.morelli@gmail.com",
  "keyygreen@icloud.com",
  "edmagon@gmail.com",
  "a.dnswrthcottrell@gmail.com",
  "burdj315@yahoo.com",
  "tziupsnys@yahoo.com",
  "jczap33@yahoo.com",
  "juan.mazariegos122@icloud.com",
  "sotojason555@gmail.com",
  "jessica.tafoya2@icloud.com",
  "vickypelletier@yahoo.com",
  "weener25@aol.com",
  "muggernot@yahoo.com",
  "butterjohn713@yahoo.com",
  "zeledonkevin125@gmail.com",
  "johnpepe1976@me.com",
  "allison.green324@icloud.com",
  "mendz13@gmail.com",
  "ramiconstant@yahoo.com",
  "pepsibaker@gmail.com",
  "n.harris97@yahoo.com",
  "fsalas1978@yahoo.com",
  "catdipo@yahoo.com",
  "andressatoliveira017@yahoo.com",
  "stull_lisa@yahoo.com",
  "hckytwn98@gmail.com",
  "brassellbrady1972@gmail.com",
  "andetaz@gmail.com",
  "vetty87701@gmail.com",
  "tiffanyb75@gmail.com",
  "desiree0309@yahoo.com",
  "mustafaisbatman@gmail.com",
];

const FROM = "PeptoBuy <noreply@peptobuy.com>";
const SHOP_URL = "https://peptobuy.com/shop";

const PROMO_BOX = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff5f5;border:2px solid #cc0000;border-radius:12px;margin:24px 0;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:800;color:#cc0000;">🚨 STOCK ALERT</p>
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#cc0000;">❌ BAC Water kits — SOLD OUT</p>
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ Syringes — last few remaining</p>
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ RTGLP3 (Reta) — Only 6 left</p>
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ Free GHK-Cu — Only 3 left (orders $250+)</p>
      <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#cc0000;">🎁 FREE GHK-Cu (100mg — $91.99 value) — Orders $250+</p>
      <p style="margin:0 0 10px;font-size:15px;font-weight:700;color:#16a34a;">🚚 FREE SHIPPING — Every order. No minimum.</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#be185d;">🧪 20% OFF FIRST ORDER — Code: FIRST20</p>
    </td></tr>
  </table>
`;

const PRODUCT_LIST = `
  <p style="font-size:13px;color:#555;margin:16px 0 4px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Available Now:</p>
  <p style="font-size:14px;color:#333;margin:0;">BPC-157 · TB-500 · RTGLP3 (Reta 🐀) · MOTS-C · Tesamorelin · GHK-Cu</p>
`;

const TRUST_BADGES = `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="font-size:12px;color:#555;padding:0 8px;">✅ ISO 9001 Tested</td>
      <td align="center" style="font-size:12px;color:#555;padding:0 8px;">📄 COA On Request</td>
      <td align="center" style="font-size:12px;color:#555;padding:0 8px;">💬 Real Support</td>
    </tr>
  </table>
`;

const FOOTER = `
  <p style="font-size:11px;color:#999;text-align:center;margin:24px 0 8px;font-style:italic;">For qualified researchers and laboratory professionals only. Not for human consumption.</p>
  <p style="font-size:11px;color:#bbb;text-align:center;margin:0;">You received this because you started a checkout at peptobuy.com</p>
`;

function buildCta(label: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center">
          <a href="${SHOP_URL}" style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:900;padding:16px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.02em;">${label}</a>
        </td>
      </tr>
    </table>
  `;
}

function buildNoonHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.08);">

      <!-- Red urgency header -->
      <tr><td style="background:#cc0000;padding:18px 24px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:900;color:#fff;letter-spacing:0.02em;">⚠️ ONLY 12 HOURS REMAINING</p>
      </td></tr>

      <tr><td style="padding:32px 32px 8px;">
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#111;text-align:center;">SALE ENDS TONIGHT AT MIDNIGHT EST</h1>
        <p style="font-size:16px;color:#333;line-height:1.6;text-align:center;">This is not a drill. Every free gift, every deal ends tonight at midnight EST. No extensions.</p>

        ${PROMO_BOX}

        <p style="font-size:16px;font-weight:900;color:#cc0000;text-align:center;margin:20px 0;">⏰ ENDS TONIGHT TUESDAY MAY 26 AT MIDNIGHT EST. FINAL.</p>

        ${buildCta("CLAIM YOUR FREE GIFTS NOW →")}

        ${PRODUCT_LIST}
        ${TRUST_BADGES}
        ${FOOTER}
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

function buildEveningHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.08);">

      <!-- Dark red urgency header -->
      <tr><td style="background:#8B0000;padding:18px 24px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:900;color:#fff;letter-spacing:0.02em;">🚨 FINAL 4 HOURS — THIS IS IT</p>
      </td></tr>

      <tr><td style="padding:32px 32px 8px;">
        <h1 style="margin:0 0 16px;font-size:28px;font-weight:900;color:#cc0000;text-align:center;">SALE ENDS TONIGHT AT MIDNIGHT EST</h1>
        <p style="font-size:16px;color:#333;line-height:1.6;text-align:center;">After midnight tonight all prices return to normal. Free shipping ends. Free gifts are gone forever. This is the last email we will send.</p>

        ${PROMO_BOX}

        <p style="font-size:15px;color:#555;font-style:italic;text-align:center;margin:16px 0;">⚡ Researchers have been ordering all weekend. BAC water kits are almost gone.</p>

        <p style="font-size:18px;font-weight:900;color:#cc0000;text-align:center;margin:20px 0;">🚨 4 HOURS LEFT. MIDNIGHT TONIGHT. NO MORE EXTENSIONS.</p>

        ${buildCta("SHOP NOW — FINAL HOURS →")}

        ${PRODUCT_LIST}
        ${TRUST_BADGES}
        ${FOOTER}
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(request: Request) {
  return NextResponse.json({ error: "Disabled" }, { status: 410 });
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const body = await request.json() as { emailType?: string };
  const emailType = body.emailType;

  if (emailType !== "noon" && emailType !== "evening") {
    return NextResponse.json({ error: "emailType must be 'noon' or 'evening'" }, { status: 400 });
  }

  const subject =
    emailType === "noon"
      ? "⚠️ 12 Hours Left — Free Gifts + Free Shipping Ending TONIGHT"
      : "🚨 4 Hours Left — FINAL CHANCE. Sale Ends at Midnight TONIGHT.";

  const html = emailType === "noon" ? buildNoonHtml() : buildEveningHtml();

  let sent = 0;
  let failed = 0;
  const BATCH = 10;

  for (let i = 0; i < ALL_EMAILS.length; i += BATCH) {
    const batch = ALL_EMAILS.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (to) => {
        try {
          const result = await resend.emails.send({ from: FROM, to, subject, html });
          console.log(`[send-hardcoded-blast] ✓ ${emailType} → ${to}`, result);
          sent++;
        } catch (err) {
          console.error(`[send-hardcoded-blast] ✗ ${emailType} → ${to}`, err);
          failed++;
        }
      })
    );
    if (i + BATCH < ALL_EMAILS.length) await sleep(100);
  }

  console.log(`[send-hardcoded-blast] ${emailType} done — sent:${sent} failed:${failed}`);
  return NextResponse.json({ success: true, emailType, sent, failed, total: ALL_EMAILS.length });
}
