/**
 * GET /api/schedule-hardcoded-blasts
 *
 * Schedules both hardcoded-list blasts via QStash:
 *   Noon  EST May 26 → { emailType: "noon" }
 *   8 PM  EST May 26 → { emailType: "evening" }
 *
 * Call once: curl https://peptobuy.com/api/schedule-hardcoded-blasts
 */

import { NextResponse } from "next/server";
import { Client as QStash } from "@upstash/qstash";

export async function GET() {
  return NextResponse.json({ error: "Disabled" }, { status: 410 });
  if (!process.env.QSTASH_TOKEN) {
    return NextResponse.json({ error: "QSTASH_TOKEN not set" }, { status: 500 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace("http://localhost:3000", "https://peptobuy.com") ??
    "https://peptobuy.com";

  const blastUrl = `${siteUrl}/api/send-hardcoded-blast`;
  const qstash = new QStash({ token: process.env.QSTASH_TOKEN });

  const blasts = [
    {
      emailType: "noon" as const,
      isoTime: "2026-05-26T12:00:00-05:00",
      label: "Noon EST May 26 — 12-hour warning",
    },
    {
      emailType: "evening" as const,
      isoTime: "2026-05-26T20:00:00-05:00",
      label: "8 PM EST May 26 — 4-hour final warning",
    },
  ];

  const results: Array<{
    emailType: string;
    label: string;
    status: "scheduled" | "skipped" | "error";
    notBefore?: number;
    messageId?: string;
    detail?: string;
  }> = [];

  for (const blast of blasts) {
    const notBefore = Math.floor(new Date(blast.isoTime).getTime() / 1000);
    const nowSec = Math.floor(Date.now() / 1000);

    if (notBefore <= nowSec) {
      console.warn(`[schedule-hardcoded-blasts] ${blast.emailType} time ${blast.isoTime} is in the past — skipping`);
      results.push({ emailType: blast.emailType, label: blast.label, status: "skipped", detail: "time is in the past" });
      continue;
    }

    try {
      const msg = await qstash.publishJSON({
        url: blastUrl,
        body: { emailType: blast.emailType },
        notBefore,
      });
      console.log(`[schedule-hardcoded-blasts] ✓ ${blast.emailType} scheduled at ${blast.isoTime} — messageId: ${msg.messageId}`);
      results.push({ emailType: blast.emailType, label: blast.label, status: "scheduled", notBefore, messageId: msg.messageId });
    } catch (err) {
      console.error(`[schedule-hardcoded-blasts] ✗ ${blast.emailType} QStash failed:`, err);
      results.push({ emailType: blast.emailType, label: blast.label, status: "error", detail: String(err) });
    }
  }

  const scheduled = results.filter((r) => r.status === "scheduled").length;
  return NextResponse.json({ success: true, scheduled, blastUrl, results });
}
