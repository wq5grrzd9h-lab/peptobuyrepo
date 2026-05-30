/**
 * GET /api/setup-daily-blasts
 *
 * Call ONCE after deploy to register three recurring QStash cron schedules.
 * After that they fire automatically every day forever.
 *
 * Jobs:
 *   midnight — 12:01 AM EST (05:01 UTC) — "Sale ends TONIGHT at midnight"
 *   noon     — 12:00 PM EST (17:00 UTC) — "Only 12 hours left"
 *   evening  — 8:00  PM EST (01:00 UTC) — "Only 4 hours left — final warning"
 */

import { NextResponse } from "next/server";
import { Client as QStash } from "@upstash/qstash";

const SCHEDULES = [
  {
    window: "midnight",
    cron: "1 5 * * *",      // 12:01 AM EST (5:01 AM UTC)
    label: "Midnight blast — Sale ends tonight",
  },
  {
    window: "noon",
    cron: "0 17 * * *",     // 12:00 PM EST (5:00 PM UTC)
    label: "Noon blast — 12 hours left",
  },
  {
    window: "evening",
    cron: "0 1 * * *",      // 8:00 PM EST (1:00 AM UTC next day)
    label: "Evening blast — 4 hours left, final warning",
  },
];

export async function GET() {
  if (!process.env.QSTASH_TOKEN) {
    return NextResponse.json({ error: "QSTASH_TOKEN not set" }, { status: 500 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace("http://localhost:3000", "https://peptobuy.com") ??
    "https://peptobuy.com";

  const blastUrl = `${siteUrl}/api/daily-blast`;
  const qstash = new QStash({ token: process.env.QSTASH_TOKEN });

  const results: Array<{
    window: string;
    label: string;
    cron: string;
    status: "created" | "error";
    scheduleId?: string;
    error?: string;
  }> = [];

  for (const s of SCHEDULES) {
    try {
      // publishJSON with cron creates a recurring schedule in QStash v2
      const result = await qstash.publishJSON({
        url: blastUrl,
        cron: s.cron,
        body: { window: s.window },
      });

      const scheduleId = (result as { scheduleId?: string }).scheduleId ?? "created";
      console.log(`[setup-daily-blasts] ✓ ${s.window} schedule created — id: ${scheduleId}`);
      results.push({ window: s.window, label: s.label, cron: s.cron, status: "created", scheduleId });
    } catch (err) {
      console.error(`[setup-daily-blasts] ✗ ${s.window} failed:`, err);
      results.push({ window: s.window, label: s.label, cron: s.cron, status: "error", error: String(err) });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  return NextResponse.json({
    success: created === 3,
    created,
    total: 3,
    blastUrl,
    results,
    note: "Call this endpoint ONCE after deploying. Schedules repeat daily forever.",
  });
}
