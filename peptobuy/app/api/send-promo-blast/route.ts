/**
 * POST /api/send-promo-blast
 *
 * Collects emails from ALL sources (Redis + Resend history), deduplicates,
 * and sends a promo blast to every unique address.
 *
 * Body: { emailType: "midnight" | "noon" | "evening", resetDedup?: boolean }
 *   resetDedup: true  — skip dedup check, send to everyone regardless of prior blasts
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const RESEND_FROM = "PeptoBuy <noreply@peptobuy.com>";
const INTERNAL_EMAIL = "peptobuy@gmail.com";
const SITE_URL = "https://peptobuy.com";
const SHOP_URL = `${SITE_URL}/shop`;
const DEDUP_EXPIRY_SECONDS = 48 * 60 * 60; // 48 hours

type EmailType = "midnight" | "noon" | "evening";

// ─── Email collection ─────────────────────────────────────────────────────────

function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const e = email.trim().toLowerCase();
  return (
    e.length > 4 &&
    e.includes("@") &&
    e.includes(".") &&
    !e.includes(" ") &&
    e !== INTERNAL_EMAIL
  );
}

/** Scan ALL Redis keys (no pattern filter) and extract emails from key names. */
async function collectFromRedis(redis: Redis): Promise<Set<string>> {
  const emails = new Set<string>();
  let cursor = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { count: 100 });
    cursor = Number(nextCursor);

    for (const key of keys as string[]) {
      // Key format: "prefix:email" — email is everything after the last colon
      const parts = key.split(":");
      const potentialEmail = parts[parts.length - 1];
      if (isValidEmail(potentialEmail)) {
        emails.add(potentialEmail.toLowerCase().trim());
      }
    }
  } while (cursor !== 0);

  console.log(`[promo-blast] Redis scan found ${emails.size} emails`);
  return emails;
}

/** Pull all emails ever sent via Resend (paginated, up to 1000). */
async function collectFromResend(apiKey: string): Promise<Set<string>> {
  const emails = new Set<string>();
  const pages = [
    `https://api.resend.com/emails?limit=100`,
    `https://api.resend.com/emails?limit=100&offset=100`,
    `https://api.resend.com/emails?limit=100&offset=200`,
    `https://api.resend.com/emails?limit=100&offset=300`,
    `https://api.resend.com/emails?limit=100&offset=400`,
    `https://api.resend.com/emails?limit=100&offset=500`,
    `https://api.resend.com/emails?limit=100&offset=600`,
    `https://api.resend.com/emails?limit=100&offset=700`,
    `https://api.resend.com/emails?limit=100&offset=800`,
    `https://api.resend.com/emails?limit=100&offset=900`,
  ];

  for (const url of pages) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await res.json() as { data?: any[] };
      if (!data.data?.length) break;

      for (const record of data.data) {
        // `to` can be string or string[]
        const toList: unknown[] = Array.isArray(record.to)
          ? record.to
          : typeof record.to === "string"
          ? [record.to]
          : [];

        for (const addr of toList) {
          if (isValidEmail(addr)) {
            emails.add((addr as string).toLowerCase().trim());
          }
        }
      }

      // Stop paginating if fewer than 100 records returned
      if (data.data.length < 100) break;
    } catch (err) {
      console.warn("[promo-blast] Resend fetch page failed:", url, err);
      break;
    }
  }

  console.log(`[promo-blast] Resend history found ${emails.size} emails`);
  return emails;
}

async function collectAllEmails(redis: Redis, resendApiKey: string): Promise<string[]> {
  const [redisEmails, resendEmails] = await Promise.all([
    collectFromRedis(redis),
    collectFromResend(resendApiKey),
  ]);

  // Merge
  resendEmails.forEach((email) => redisEmails.add(email));
  const all = Array.from(redisEmails).filter(isValidEmail);
  console.log(`[promo-blast] total unique emails: ${all.length}`);
  return all;
}

// ─── Batch sender ─────────────────────────────────────────────────────────────

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendBatched(
  resend: Resend,
  emails: string[],
  subject: string,
  html: string,
  redis: Redis,
  emailType: EmailType,
  resetDedup: boolean,
): Promise<{ sent: number; skipped: number; failed: number }> {
  const BATCH_SIZE = 10;
  let sent = 0, skipped = 0, failed = 0;

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (email) => {
        const dedupKey = `promo-blast-sent:${emailType}:${email}`;

        if (!resetDedup) {
          try {
            const alreadySent = await redis.get(dedupKey);
            if (alreadySent) { skipped++; return; }
            // Mark before send — prevents concurrent duplicates
            await redis.set(dedupKey, "1", { ex: DEDUP_EXPIRY_SECONDS });
          } catch (err) {
            console.error(`[promo-blast] Redis dedup error for ${email}:`, err);
          }
        } else {
          // resetDedup: force-update the key after sending anyway
          try { await redis.set(dedupKey, "1", { ex: DEDUP_EXPIRY_SECONDS }); } catch { /* ignore */ }
        }

        try {
          await resend.emails.send({ from: RESEND_FROM, to: email, subject, html });
          console.log(`[promo-blast:${emailType}] ✓ ${email}`);
          sent++;
        } catch (err) {
          console.error(`[promo-blast:${emailType}] ✗ ${email}:`, err);
          failed++;
          if (!resetDedup) {
            try { await redis.del(dedupKey); } catch { /* ignore */ }
          }
        }
      }),
    );

    if (i + BATCH_SIZE < emails.length) await sleep(100);
  }

  return { sent, skipped, failed };
}

// ─── Email templates ──────────────────────────────────────────────────────────

const PRODUCTS = "BPC-157 · TB-500 · RTGLP3 (Reta 🐀) · MOTS-C · Tesamorelin · GHK-Cu";

const TONIGHT_BANNER = `
  <div style="background:#cc0000;padding:12px 20px;text-align:center;margin-bottom:20px;border-radius:8px;">
    <p style="margin:0;font-size:14px;font-weight:900;color:#fff;letter-spacing:.03em;">
      ⏰ ENDS TONIGHT — Tuesday May 26 at midnight EST. No further extensions.
    </p>
  </div>`;

const PROMO_BLOCK = `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff8f8;border:2px solid #ff2d78;border-radius:12px;margin:20px 0;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#18181b;text-transform:uppercase;letter-spacing:.07em;">What's included — every order:</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr><td style="padding:8px 0;border-bottom:1px solid #fde8ef;">
          <p style="margin:0;font-size:14px;font-weight:800;color:#18181b;">🎁 FREE BAC Water + Syringes</p>
          <p style="margin:3px 0 0;font-size:12px;color:#52525b;">Every single order. Automatically added.</p>
          <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#cc0000;">⚠️ Only 3 more free GHK-Cu vials — orders $250+</p>
        </td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #fde8ef;">
          <p style="margin:0;font-size:14px;font-weight:800;color:#18181b;">🎁 FREE GHK-Cu (100mg — $91.99 value)</p>
          <p style="margin:3px 0 0;font-size:12px;color:#52525b;">Orders $250+. Added automatically. No code needed.</p>
        </td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #fde8ef;">
          <p style="margin:0;font-size:14px;font-weight:800;color:#18181b;">🚚 FREE SHIPPING — Every order. No minimum.</p>
        </td></tr>
        <tr><td style="padding:8px 0;">
          <p style="margin:0;font-size:14px;font-weight:800;color:#18181b;">🧪 20% OFF FIRST ORDER</p>
          <p style="margin:3px 0 0;font-size:12px;color:#52525b;">Code: <strong style="font-family:monospace;background:#f4f4f5;padding:1px 6px;border-radius:4px;">FIRST20</strong></p>
        </td></tr>
      </table>
    </td></tr>
  </table>`;

const CTA_BUTTON = (label: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:24px 0;">
    <tr><td align="center">
      <a href="${SHOP_URL}" style="display:inline-block;background:linear-gradient(135deg,#ff2d78 0%,#e0005e 100%);color:#fff;text-decoration:none;font-size:16px;font-weight:900;letter-spacing:.04em;padding:16px 40px;border-radius:12px;box-shadow:0 4px 20px rgba(255,45,120,0.35);">
        ${label}
      </a>
    </td></tr>
  </table>`;

const TRUST_BADGES = `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;background:#f9f9f9;border-radius:10px;">
    <tr><td align="center" style="padding:14px;">
      <span style="font-size:12px;color:#71717a;font-weight:600;">🔬 ISO 9001 Tested &nbsp;·&nbsp; 📄 COA On Request &nbsp;·&nbsp; 💬 Real Support</span>
    </td></tr>
  </table>`;

const DISCLAIMER = `
  <p style="margin:16px 0 0;font-size:10px;color:#a1a1aa;text-align:center;line-height:1.6;">
    ⚠ All products are for in vitro research use only. Not intended for human consumption, diagnosis, or treatment. Not approved by the FDA.
  </p>
  <p style="margin:8px 0 0;font-size:10px;color:#a1a1aa;text-align:center;">
    You received this because you started a checkout at peptobuy.com.<br>
    <a href="${SITE_URL}" style="color:#a1a1aa;">peptobuy.com</a>
  </p>`;

function buildEmailHtml(opts: {
  headerBg: string;
  headerEmoji: string;
  headerTitle: string;
  bigLine: string;
  subtext: string;
  extraBlock?: string;
  urgencyLine: string;
  ctaLabel: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PeptoBuy</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:0 auto;padding:0 0 32px;">
    <div style="background:${opts.headerBg};padding:28px 32px;text-align:center;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:.1em;">${opts.headerEmoji} ${opts.headerTitle}</p>
      <p style="margin:0;font-size:30px;font-weight:900;color:#fff;letter-spacing:-0.03em;line-height:1.1;">${opts.bigLine}</p>
    </div>
    <div style="background:#fff;margin:16px;border-radius:16px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      ${TONIGHT_BANNER}
      <p style="margin:0 0 20px;font-size:15px;color:#52525b;line-height:1.6;">${opts.subtext}</p>
      ${PROMO_BLOCK}
      ${opts.extraBlock ?? ""}
      <p style="margin:20px 0;font-size:15px;font-weight:900;color:#cc0000;text-align:center;">${opts.urgencyLine}</p>
      ${CTA_BUTTON(opts.ctaLabel)}
      <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Available Now</p>
        <p style="margin:0;font-size:13px;color:#18181b;font-weight:600;line-height:1.8;">${PRODUCTS}</p>
      </div>
      ${TRUST_BADGES}
      ${DISCLAIMER}
    </div>
    <p style="text-align:center;margin:16px 0 0;font-size:12px;font-weight:800;color:#a1a1aa;letter-spacing:.06em;">PEPTOBUY</p>
  </div>
</body>
</html>`;
}

const TEMPLATES: Record<EmailType, { subject: string; html: string }> = {
  midnight: {
    subject: "⚡ Sale Extended — Ends TONIGHT at Midnight + Free Gifts Still Available",
    html: buildEmailHtml({
      headerBg: "linear-gradient(135deg,#8B0000 0%,#c0392b 100%)",
      headerEmoji: "🎖️",
      headerTitle: "SALE ENDS TONIGHT — TUESDAY MAY 26",
      bigLine: "SALE ENDS TONIGHT AT MIDNIGHT",
      subtext:
        "One last chance. The Memorial Day sale runs through tonight — Tuesday May 26 at midnight EST. Every free gift, every deal, still active until then.",
      urgencyLine: "⏰ ENDS TONIGHT AT MIDNIGHT EST. NO FURTHER EXTENSIONS.",
      ctaLabel: "SHOP NOW BEFORE IT'S GONE →",
    }),
  },
  noon: {
    subject: "⚠️ 12 Hours Left — Free Gifts + Free Shipping Ending TONIGHT",
    html: buildEmailHtml({
      headerBg: "linear-gradient(135deg,#c0392b 0%,#e74c3c 100%)",
      headerEmoji: "⚠️",
      headerTitle: "ONLY 12 HOURS REMAINING — ENDS TONIGHT",
      bigLine: "THE CLOCK IS RUNNING OUT",
      subtext:
        "Tonight at midnight — Tuesday May 26 — the sale ends for good. Last chance for free BAC Water, free GHK-Cu on orders over $250, and free shipping on every order.",
      extraBlock: `<div style="background:#fff8f0;border:1px solid #f97316;border-radius:10px;padding:14px 18px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#9a3412;font-weight:600;">👀 Hundreds of researchers have already claimed their free gifts. BAC Water kits are going fast.</p>
      </div>`,
      urgencyLine: "⏰ ENDS TONIGHT AT MIDNIGHT. BAC WATER KITS GOING FAST.",
      ctaLabel: "CLAIM YOUR FREE GIFTS NOW →",
    }),
  },
  evening: {
    subject: "🚨 4 Hours Left — Last Chance. Sale Ends TONIGHT at Midnight.",
    html: buildEmailHtml({
      headerBg: "linear-gradient(135deg,#18181b 0%,#3f1515 100%)",
      headerEmoji: "🚨",
      headerTitle: "🚨 FINAL 4 HOURS — TONIGHT IS THE LAST CHANCE",
      bigLine: "SALE ENDS AT MIDNIGHT TONIGHT",
      subtext:
        "Tonight at midnight — Tuesday May 26 — it's over. Prices return to normal. Free shipping ends. Free gifts are gone forever.",
      extraBlock: `<div style="background:#fff0f0;border:2px solid #cc0000;border-radius:10px;padding:14px 18px;margin:16px 0;">
        <p style="margin:0;font-size:14px;color:#cc0000;font-weight:800;text-align:center;">This is the last email we will send about this sale.<br>When tonight's midnight hits — it is over.</p>
      </div>`,
      urgencyLine: "⏰ 4 HOURS LEFT. TONIGHT ONLY. DON'T MISS OUT.",
      ctaLabel: "SHOP NOW — FINAL HOURS TONIGHT →",
    }),
  },
};

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  return NextResponse.json({ error: "Disabled" }, { status: 410 });
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  let emailType: EmailType;
  let resetDedup = false;
  try {
    const body = await request.json();
    emailType = body.emailType as EmailType;
    resetDedup = body.resetDedup === true;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!["midnight", "noon", "evening"].includes(emailType)) {
    return NextResponse.json({ error: `Unknown emailType: ${emailType}` }, { status: 400 });
  }

  const template = TEMPLATES[emailType];
  console.log(`[promo-blast:${emailType}] starting | resetDedup=${resetDedup} | subject: ${template.subject}`);

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const emails = await collectAllEmails(redis, process.env.RESEND_API_KEY ?? "");
  console.log(`[promo-blast:${emailType}] sending to ${emails.length} emails`);

  if (emails.length === 0) {
    return NextResponse.json({ success: true, emailType, count: 0, skipped: 0, failed: 0, message: "No emails found in Redis or Resend" });
  }

  const { sent, skipped, failed } = await sendBatched(
    resend, emails, template.subject, template.html, redis, emailType, resetDedup,
  );

  console.log(`[promo-blast:${emailType}] done — sent:${sent} skipped:${skipped} failed:${failed}`);
  return NextResponse.json({ success: true, emailType, count: sent, skipped, failed, total: emails.length, resetDedup });
}
