import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function POST(request: Request) {
  let email: string;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ used: false });

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ used: false });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  const used = await redis.exists(`freebac-used:${email.toLowerCase().trim()}`);
  return NextResponse.json({ used: used === 1 });
}
