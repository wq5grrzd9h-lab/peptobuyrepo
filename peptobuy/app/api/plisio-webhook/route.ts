import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";

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

    const { status, order_number, txn_id, source_amount, source_currency } = data;

    switch (status) {
      case "completed":
      case "mismatch": {
        console.log(`[Plisio] Order ${order_number} ${status.toUpperCase()} — txn: ${txn_id}`);
        // Send internal payment-confirmed notification
        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromAddr = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";
          const amountStr = source_amount ? `$${parseFloat(source_amount).toFixed(2)} ${source_currency ?? "USD"}` : "—";
          await resend.emails.send({
            from: fromAddr,
            to: "peptobuy@gmail.com",
            subject: `Crypto Payment ${status === "completed" ? "Confirmed" : "Mismatch"} — ${order_number}`,
            html: `<div style="font-family:system-ui,sans-serif;padding:24px;max-width:500px;">
              <h2 style="color:${status === "completed" ? "#16a34a" : "#d97706"};">
                ${status === "completed" ? "✅ Payment Confirmed" : "⚠ Payment Mismatch"}
              </h2>
              <table style="border-collapse:collapse;width:100%;">
                <tr><td style="padding:4px 0;color:#71717a;">Order</td><td style="font-family:monospace;font-weight:700;">${order_number}</td></tr>
                <tr><td style="padding:4px 0;color:#71717a;">Status</td><td>${status}</td></tr>
                <tr><td style="padding:4px 0;color:#71717a;">TXN ID</td><td style="font-family:monospace;">${txn_id ?? "—"}</td></tr>
                <tr><td style="padding:4px 0;color:#71717a;">Amount</td><td>${amountStr}</td></tr>
              </table>
            </div>`,
          }).catch(e => console.error("[Plisio webhook] email failed:", e));
        }
        break;
      }
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
