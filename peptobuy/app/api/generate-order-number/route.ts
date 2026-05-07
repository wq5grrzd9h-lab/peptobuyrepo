import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY = "pb_order_counter";

export async function POST() {
  try {
    const counter = await redis.incr(KEY);
    const orderNumber = `PB-${String(counter).padStart(6, "0")}`;
    return NextResponse.json({ orderNumber });
  } catch (err) {
    console.error("[generate-order-number]", err);
    // Fallback: timestamp-based so orders never hard-fail
    const now = new Date();
    const fallback = `PB-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    return NextResponse.json({ orderNumber: fallback });
  }
}
