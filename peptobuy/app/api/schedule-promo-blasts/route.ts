/**
 * GET /api/schedule-promo-blasts
 *
 * Blast 1 — IMMEDIATE: calls /api/send-promo-blast now with resetDedup:true
 * Blast 2 — Noon EST   Tuesday May 26: notBefore QStash
 * Blast 3 — 8 PM EST   Tuesday May 26: notBefore QStash
 *
 * Call once: curl https://peptobuy.com/api/schedule-promo-blasts
 */

import { NextResponse } from "next/server";
import { Client as QStash } from "@upstash/qstash";

export async function GET(request: Request) {
  return NextResponse.json({ error: "Disabled" }, { status: 410 });
  if (!process.env.QSTASH_TOKEN) {
    return NextResponse.json({ error: "QSTASH_TOKEN not set" }, { status: 500 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace("http://localhost:3000", "https://peptobuy.com") ??
    "https://peptobuy.com";

  const blastUrl = `${siteUrl}/api/send-promo-blast`;
  const qstash = new QStash({ token: process.env.QSTASH_TOKEN });

  const results: Array<{
    emailType: string;
    timing: string;
    status: "fired" | "scheduled" | "skipped" | "error";
    detail?: string;
    messageId?: string;
  }> = [];

  // ── Blast 1: IMMEDIATE (fire inline, don't use QStash) ────────────────────
  try {
    // Call our own endpoint directly with resetDedup:true
    const origin = new URL(request.url).origin;
    const immediateRes = await fetch(`${origin}/api/send-promo-blast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailType: "midnight", resetDedup: true }),
    });
    const immediateData = await immediateRes.json() as Record<string, unknown>;
    console.log("[schedule-promo-blasts] immediate blast result:", immediateData);
    results.push({
      emailType: "midnight",
      timing: "IMMEDIATE",
      status: "fired",
      detail: `sent:${immediateData.count ?? "?"} skipped:${immediateData.skipped ?? "?"} failed:${immediateData.failed ?? "?"}`,
    });
  } catch (err) {
    console.error("[schedule-promo-blasts] immediate blast failed:", err);
    results.push({ emailType: "midnight", timing: "IMMEDIATE", status: "error", detail: String(err) });
  }

  // ── Blasts 2 & 3: QStash scheduled ───────────────────────────────────────
  const scheduled = [
    {
      emailType: "noon" as const,
      isoTime: "2026-05-26T12:00:00-05:00",
      timing: "Noon EST Tuesday May 26 — 12-hour warning",
    },
    {
      emailType: "evening" as const,
      isoTime: "2026-05-26T20:00:00-05:00",
      timing: "8 PM EST Tuesday May 26 — 4-hour final warning",
    },
  ];

  for (const blast of scheduled) {
    const fireAt = new Date(blast.isoTime);
    const notBefore = Math.floor(fireAt.getTime() / 1000);
    const nowSec = Math.floor(Date.now() / 1000);

    if (notBefore <= nowSec) {
      console.warn(`[schedule-promo-blasts] ${blast.emailType} time ${blast.isoTime} is in the past — skipping`);
      results.push({ emailType: blast.emailType, timing: blast.timing, status: "skipped", detail: "time is in the past" });
      continue;
    }

    try {
      const msg = await qstash.publishJSON({
        url: blastUrl,
        body: { emailType: blast.emailType, resetDedup: false },
        notBefore,
      });
      console.log(`[schedule-promo-blasts] ✓ ${blast.emailType} scheduled at ${blast.isoTime} — messageId: ${msg.messageId}`);
      results.push({ emailType: blast.emailType, timing: blast.timing, status: "scheduled", messageId: msg.messageId });
    } catch (err) {
      console.error(`[schedule-promo-blasts] ✗ ${blast.emailType} QStash failed:`, err);
      results.push({ emailType: blast.emailType, timing: blast.timing, status: "error", detail: String(err) });
    }
  }

  const scheduledCount = results.filter((r) => r.status === "scheduled" || r.status === "fired").length;
  return NextResponse.json({ success: true, total: results.length, active: scheduledCount, blastUrl, results });
}
