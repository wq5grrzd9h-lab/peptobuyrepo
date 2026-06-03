/**
 * POST /api/daily-blast
 *
 * Called by QStash three times per day (midnight / noon / evening EST).
 * Sends urgency emails ONLY to NEW contacts captured during the current window.
 * Never sends twice within 48 hours to the same address.
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
const SKIP = new Set(["peptobuy@gmail.com", "tne.mustafa@gmail.com"]);
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;

type Window = "midnight" | "noon" | "evening";

// ─── Time helpers ─────────────────────────────────────────────────────────────

/** DST-safe: get today's date string in NYC timezone, e.g. "2026-05-30" */
function estDateStr(offsetDays = 0): string {
  const d = new Date();
  // en-CA locale gives "YYYY-MM-DD" format
  const base = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  if (offsetDays === 0) return base;
  const dt = new Date(base + "T12:00:00"); // midday to avoid DST boundary edge cases
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toLocaleDateString("en-CA");
}

/** DST-safe: compute Unix ms boundaries for each blast window. */
function windowBoundaries(w: Window): { start: number; end: number } {
  const now = new Date();
  const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const offset = now.getTime() - estNow.getTime(); // UTC ahead of EST by this many ms

  const estMidnight = new Date(estNow);
  estMidnight.setHours(0, 0, 0, 0);
  const midnightUTC = estMidnight.getTime() + offset;

  const noonUTC   = midnightUTC + 12 * 3600_000;
  const eve8pmUTC = midnightUTC + 20 * 3600_000;
  const yst8pmUTC = midnightUTC -  4 * 3600_000; // yesterday 8PM = today midnight - 4h

  switch (w) {
    case "midnight": return { start: yst8pmUTC,   end: midnightUTC };
    case "noon":     return { start: midnightUTC,  end: noonUTC };
    case "evening":  return { start: noonUTC,      end: eve8pmUTC };
  }
}

// ─── Email HTML ───────────────────────────────────────────────────────────────

const PROMO_BOX = `
<div style="border:3px solid #18181b;border-radius:12px;padding:18px 22px;margin-bottom:24px;background:#fafafa;">
  <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#cc0000;">🚨 STOCK ALERT:</p>
  <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#cc0000;">⚠️ BAC Water — Low Quantity — Act Fast!</p>
  <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ Syringes — last few remaining</p>
  <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#cc5500;">⚠️ RTGLP3 (Reta) — Only 6 left · Free GHK-Cu — Only 3 left (orders $250+)</p>
  <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:10px;">🚚 FREE SHIPPING — Orders $250+</p>
  <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:10px;">🎁 FREE GHK-Cu (100mg — $91.99 value) — Orders $250+ <span style="color:#cc0000;">(Only 3 left!)</span></p>
  <p style="margin:0;font-size:14px;font-weight:700;color:#18181b;border-top:1px solid #e5e5e5;padding-top:10px;">🧪 20% OFF FIRST ORDER — Code: <span style="font-family:monospace;font-size:15px;letter-spacing:.06em;color:#ff2d78;">FIRST20</span></p>
</div>`;

const PRODUCT_LIST = `
<div style="text-align:center;margin-bottom:24px;">
  <p style="margin:0;font-size:12px;font-weight:700;color:#71717a;letter-spacing:.04em;text-transform:uppercase;">Available Now</p>
  <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#18181b;line-height:1.8;">
    BPC-157 &nbsp;·&nbsp; TB-500 &nbsp;·&nbsp; RTGLP3 (Reta 🐀) &nbsp;·&nbsp; MOTS-C<br/>
    Tesamorelin &nbsp;·&nbsp; GHK-Cu
  </p>
</div>`;

const FOOTER = `
<div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
  <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
    ⚠ For qualified researchers and laboratory professionals only. Not for human consumption.
    Not approved by the FDA. By purchasing, you confirm compliance with all applicable laws.
  </p>
  <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
    You received this because you recently visited peptobuy.com. &nbsp;
    <a href="mailto:peptobuy@gmail.com?subject=Unsubscribe" style="color:#a1a1aa;">Unsubscribe</a>
  </p>
</div>`;

function buildHtml(w: Window): string {
  const configs = {
    midnight: {
      bannerBg: "#8B0000",
      bannerText: "⚡ FLASH SALE — ENDS TONIGHT AT MIDNIGHT EST",
      headline: `Your research cart is waiting. Our flash sale ends <span style="color:#8B0000;">TONIGHT at midnight EST.</span>`,
      sub: "Don't miss your chance to grab research peptides with free gifts, free shipping on $250+, and 20% off your first order.",
      ctaHref: "https://peptobuy.com/shop",
      ctaText: "Shop Now — Sale Ends Tonight →",
      urgency: "",
    },
    noon: {
      bannerBg: "#cc5500",
      bannerText: "⚠️ ONLY 12 HOURS LEFT — SALE ENDS TONIGHT",
      headline: `Only <strong>12 hours left.</strong> Our flash sale ends at <span style="color:#cc5500;">midnight EST tonight.</span>`,
      sub: "Free gifts, free shipping on $250+, and 20% off your first order. All gone at midnight.",
      ctaHref: "https://peptobuy.com/cart",
      ctaText: "Complete Your Order →",
      urgency: `<p style="margin:0 0 24px;font-size:15px;font-weight:900;color:#8B0000;text-align:center;">⏰ MIDNIGHT TONIGHT. NO EXTENSIONS.</p>`,
    },
    evening: {
      bannerBg: "#7f1d1d",
      bannerText: "🚨 4 HOURS LEFT — FINAL WARNING. SALE ENDS AT MIDNIGHT.",
      headline: "This is your <strong>final reminder.</strong> The sale ends in <strong style=\"color:#7f1d1d;\">4 hours at midnight EST.</strong>",
      sub: "After midnight: free shipping ends, free gifts are gone, prices return to normal.",
      ctaHref: "https://peptobuy.com/shop",
      ctaText: "Shop Now — FINAL HOURS →",
      urgency: `<p style="margin:0 0 24px;font-size:16px;font-weight:900;color:#7f1d1d;text-align:center;">🚨 4 HOURS. MIDNIGHT TONIGHT. THIS IS IT.</p>`,
    },
  };

  const c = configs[w];

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>PeptoBuy Flash Sale</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
    </div>
    <div style="background:${c.bannerBg};padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:13px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:.06em;">${c.bannerText}</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 12px;font-size:16px;font-weight:800;color:#18181b;">${c.headline}</p>
      <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.6;">${c.sub}</p>
      ${PROMO_BOX}
      ${c.urgency}
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${c.ctaHref}" style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:-0.01em;box-shadow:0 0 28px rgba(255,45,120,0.35);">${c.ctaText}</a>
      </div>
      ${PRODUCT_LIST}
      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
        Questions? <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
      </p>
    </div>
    ${FOOTER}
  </div>
</body></html>`;
}

const SUBJECTS: Record<Window, string> = {
  midnight: "⚡ Flash Sale — Ends TONIGHT at Midnight",
  noon:     "⚠️ 12 Hours Left — Flash Sale Ends Tonight",
  evening:  "🚨 4 Hours Left — Final Warning. Sale Ends at Midnight.",
};

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 500 });
  }

  let window: Window;
  try {
    const body = await request.json() as { window?: string };
    if (!body.window || !["midnight", "noon", "evening"].includes(body.window)) {
      return NextResponse.json({ error: "Invalid or missing window" }, { status: 400 });
    }
    window = body.window as Window;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const { start, end } = windowBoundaries(window);
  const today     = estDateStr(0);
  const yesterday = estDateStr(-1);

  console.log(`[daily-blast:${window}] window ${new Date(start).toISOString()} → ${new Date(end).toISOString()}`);

  // ── Step 1: Prune stale entries (>48h old) then get emails in window ─────────
  const cutoff = Date.now() - 48 * 3600_000;
  await redis.zremrangebyscore("captured-emails", 0, cutoff);

  const rawEmails = await redis.zrange("captured-emails", start, end, { byScore: true }) as string[];

  if (!rawEmails.length) {
    console.log(`[daily-blast:${window}] No new emails for window — skipping`);
    return NextResponse.json({ success: true, window, sent: 0, skipped: 0, reason: "no-new-emails" });
  }

  console.log(`[daily-blast:${window}] ${rawEmails.length} raw emails in window`);

  // ── Step 2: Filter and deduplicate ───────────────────────────────────────────
  const candidates: string[] = [];
  const deduped: string[] = [];

  for (const email of rawEmails) {
    const e = email.toLowerCase().trim();

    if (SKIP.has(e)) { deduped.push(e); continue; }
    if (!e.includes("@")) { deduped.push(e); continue; }

    // Check today and yesterday sent keys
    const [todaySent, ystSent] = await redis.mget(
      `daily-blast-sent:${today}:${e}`,
      `daily-blast-sent:${yesterday}:${e}`,
    );

    if (todaySent || ystSent) {
      console.log(`[daily-blast:${window}] skip (already sent) → ${e}`);
      deduped.push(e);
      continue;
    }

    candidates.push(e);
  }

  console.log(`[daily-blast:${window}] ${candidates.length} to send, ${deduped.length} skipped`);

  if (!candidates.length) {
    return NextResponse.json({ success: true, window, sent: 0, skipped: deduped.length, reason: "all-deduped" });
  }

  // ── Step 3 & 4: Send in batches of 10 with 200ms delay ──────────────────────
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = buildHtml(window);
  const subject = SUBJECTS[window];
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map((email) =>
        resend.emails.send({ from: RESEND_FROM, to: email, subject, html })
      )
    );

    for (let j = 0; j < batch.length; j++) {
      const email = batch[j];
      const result = results[j];

      if (result.status === "fulfilled") {
        console.log(`[daily-blast:${window}] ✓ sent → ${email}`);
        // Mark as sent — 48h TTL prevents re-send today and tomorrow
        await redis.set(`daily-blast-sent:${today}:${email}`, "1", { ex: 48 * 3600 });
        sent++;
      } else {
        console.error(`[daily-blast:${window}] ✗ failed → ${email}`, result.reason);
        failed++;
      }
    }

    if (i + BATCH_SIZE < candidates.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  console.log(`[daily-blast:${window}] done — sent:${sent} failed:${failed} skipped:${deduped.length}`);
  return NextResponse.json({
    success: true,
    window,
    sent,
    failed,
    skipped: deduped.length,
    total: rawEmails.length,
  });
}
