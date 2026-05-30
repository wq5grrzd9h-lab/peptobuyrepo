import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const RETA_STOCK_KEY = "reta-stock";
const INITIAL_STOCK = 13;

export async function GET() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ stock: INITIAL_STOCK });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  let stock = await redis.get<number>(RETA_STOCK_KEY);
  if (stock === null) {
    // Initialize on first read
    await redis.set(RETA_STOCK_KEY, INITIAL_STOCK);
    stock = INITIAL_STOCK;
  }

  return NextResponse.json({ stock: Math.max(0, Number(stock)) });
}
