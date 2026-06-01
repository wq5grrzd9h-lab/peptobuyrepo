import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export async function GET() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  await redis.set("reta-stock", 6);
  console.log("[update-reta-stock] set reta-stock = 6");
  return NextResponse.json({ ok: true, stock: 6 });
}
