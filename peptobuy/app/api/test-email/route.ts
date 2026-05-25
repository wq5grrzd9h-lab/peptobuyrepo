import { NextResponse } from "next/server";
import { Resend } from "resend";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

/**
 * GET /api/test-email
 * Sends a test order email to peptobuy@gmail.com to verify Resend is working
 * independently of the payment flow.
 *
 * Usage: curl https://your-domain.com/api/test-email
 * or visit the URL in a browser.
 */
export async function GET() {
  console.log("test-email called");
  console.log("Resend key exists:", !!process.env.RESEND_API_KEY);
  console.log("From:", RESEND_FROM);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const testOrderNumber = `TEST-${Date.now()}`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;padding:32px;background:#f9f9f9;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e5e5e5;">
    <h1 style="color:#ff2d78;margin:0 0 16px;">✅ PeptoBuy Email Test</h1>
    <p style="color:#18181b;">Resend is working correctly.</p>
    <p style="color:#71717a;font-size:13px;">
      Test order: <strong>${testOrderNumber}</strong><br>
      Sent at: <strong>${new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })}</strong><br>
      From: <strong>${RESEND_FROM}</strong>
    </p>
  </div>
</body></html>`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: "peptobuy@gmail.com",
      subject: `[TEST] PeptoBuy Email Test — ${testOrderNumber}`,
      html,
    });

    console.log("Test email result:", result);

    return NextResponse.json({
      ok: true,
      testOrderNumber,
      from: RESEND_FROM,
      to: "peptobuy@gmail.com",
      resendResult: result,
    });
  } catch (err) {
    console.error("test-email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
