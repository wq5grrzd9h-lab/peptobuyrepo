/**
 * GET /api/schedule-promo-blasts
 *
 * Schedules 3 QStash messages to fire /api/send-promo-blast at specific times:
 *   1. "midnight" — just after midnight EST May 26 (sale extension announcement)
 *   2. "noon"     — noon EST May 26 (12-hour warning)
 *   3. "evening"  — 8 PM EST May 26 (4-hour final warning)
 *
 * Call this once via: curl https://peptobuy.com/api/schedule-promo-blasts
 */

import { NextResponse } from "next/server";
import { Client as QStash } from "@upstash/qstash";

interface BlastSchedule {
  emailType: "midnight" | "noon" | "evening";
  label: string;
  isoTime: string;
}

const BLASTS: BlastSchedule[] = [
  {
    emailType: "midnight",
    label: "Just after midnight EST — sale extension",
    isoTime: "2026-05-26T00:01:00-05:00",
  },
  {
    emailType: "noon",
    label: "Noon EST — 12-hour warning",
    isoTime: "2026-05-26T12:00:00-05:00",
  },
  {
    emailType: "evening",
    label: "8 PM EST — 4-hour final warning",
    isoTime: "2026-05-26T20:00:00-05:00",
  },
];

export async function GET() {
  if (!process.env.QSTASH_TOKEN) {
    return NextResponse.json({ error: "QSTASH_TOKEN not set" }, { status: 500 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace("http://localhost:3000", "https://peptobuy.com") ??
    "https://peptobuy.com";

  const targetUrl = `${siteUrl}/api/send-promo-blast`;
  const qstash = new QStash({ token: process.env.QSTASH_TOKEN });

  const results: Array<{
    emailType: string;
    label: string;
    scheduledFor: string;
    notBefore: number;
    messageId?: string;
    error?: string;
  }> = [];

  for (const blast of BLASTS) {
    const fireAt = new Date(blast.isoTime);
    const notBefore = Math.floor(fireAt.getTime() / 1000); // Unix seconds
    const nowSec = Math.floor(Date.now() / 1000);

    if (notBefore <= nowSec) {
      console.warn(`[schedule-promo-blasts] ${blast.emailType} is in the past (${blast.isoTime}) — skipping`);
      results.push({
        emailType: blast.emailType,
        label: blast.label,
        scheduledFor: blast.isoTime,
        notBefore,
        error: "in the past — skipped",
      });
      continue;
    }

    try {
      const msg = await qstash.publishJSON({
        url: targetUrl,
        body: { emailType: blast.emailType },
        notBefore,
      });

      console.log(`[schedule-promo-blasts] ✓ ${blast.emailType} scheduled at ${blast.isoTime} — messageId: ${msg.messageId}`);
      results.push({
        emailType: blast.emailType,
        label: blast.label,
        scheduledFor: blast.isoTime,
        notBefore,
        messageId: msg.messageId,
      });
    } catch (err) {
      console.error(`[schedule-promo-blasts] ✗ ${blast.emailType} failed:`, err);
      results.push({
        emailType: blast.emailType,
        label: blast.label,
        scheduledFor: blast.isoTime,
        notBefore,
        error: String(err),
      });
    }
  }

  const scheduled = results.filter((r) => r.messageId).length;
  console.log(`[schedule-promo-blasts] done — ${scheduled}/${BLASTS.length} scheduled`);

  return NextResponse.json({
    success: true,
    scheduled,
    targetUrl,
    results,
  });
}
