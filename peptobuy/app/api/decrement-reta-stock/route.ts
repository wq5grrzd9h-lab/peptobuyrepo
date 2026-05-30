import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const RETA_STOCK_KEY = "reta-stock";
const INITIAL_STOCK = 13;

export async function POST(request: Request) {
  let quantity = 1;
  try {
    const body = await request.json();
    if (typeof body.quantity === "number" && body.quantity > 0) {
      quantity = body.quantity;
    }
  } catch { /* default to 1 */ }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ ok: true, stock: 0, skipped: true });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Initialize if missing before decrement
  const current = await redis.get<number>(RETA_STOCK_KEY);
  if (current === null) {
    await redis.set(RETA_STOCK_KEY, INITIAL_STOCK);
  }

  const newStock = await redis.decrby(RETA_STOCK_KEY, quantity);
  const clampedStock = Math.max(0, newStock);

  // Clamp to 0 if it went negative
  if (newStock < 0) {
    await redis.set(RETA_STOCK_KEY, 0);
  }

  console.log(`[decrement-reta-stock] decremented by ${quantity}, new stock: ${clampedStock}`);
  return NextResponse.json({ ok: true, stock: clampedStock });
}
