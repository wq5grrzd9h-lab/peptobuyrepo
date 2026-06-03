import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function POST(request: Request) {
  let email: string;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const key = `freebac-used:${email.toLowerCase().trim()}`;
  await redis.set(key, "1"); // no expiry — permanently used
  console.log("[mark-freebac-used] marked:", key);
  return NextResponse.json({ ok: true });
}
