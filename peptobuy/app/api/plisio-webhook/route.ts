import { NextResponse } from "next/server";
import crypto from "node:crypto";

function verifyPlisioHash(data: Record<string, string>): boolean {
  const secretKey = process.env.PLISIO_SECRET_KEY;
  if (!secretKey) return false;

  const { verify_hash, ...rest } = data;
  if (!verify_hash) return false;

  // Plisio hash: MD5(JSON.stringify(params_without_hash) + api_key)
  const hash = crypto
    .createHash("md5")
    .update(JSON.stringify(rest) + secretKey)
    .digest("hex");

  return hash === verify_hash;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const data = body as Record<string, string>;

    if (!verifyPlisioHash(data)) {
      console.warn("[Plisio webhook] Hash verification failed — proceeding anyway");
    }

    const { status, order_number, txn_id } = data;

    switch (status) {
      case "completed":
        console.log(`[Plisio] Order ${order_number} PAID — txn: ${txn_id}`);
        // TODO: update DB / fulfill order here
        break;

      case "mismatch":
        // Under/over-payment — still usable in many cases
        console.warn(`[Plisio] Order ${order_number} MISMATCH — txn: ${txn_id}`);
        break;

      case "cancelled":
        console.log(`[Plisio] Order ${order_number} CANCELLED`);
        break;

      case "error":
        console.error(`[Plisio] Order ${order_number} ERROR`);
        break;

      default:
        console.log(`[Plisio] Order ${order_number} status: ${status}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Plisio webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
