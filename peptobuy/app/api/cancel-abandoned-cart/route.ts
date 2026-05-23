import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { AbandonedRecord } from "@/app/api/register-checkout/route";

const REDIS_KEY_PREFIX = "pb_abandoned:";

export async function POST(request: Request) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let email: string;
  try {
    const body = await request.json();
    email = body.email;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const key = `${REDIS_KEY_PREFIX}${email.toLowerCase()}`;

  try {
    const existing = await redis.get<AbandonedRecord>(key);
    if (existing && existing.status === "pending") {
      await redis.set(key, { ...existing, status: "cancelled" }, { ex: 86400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[cancel-abandoned-cart]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
