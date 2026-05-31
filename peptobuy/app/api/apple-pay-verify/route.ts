/**
 * GET /api/apple-pay-verify
 * Reached via next.config.mjs rewrite from:
 *   /.well-known/apple-developer-merchantid-domain-association
 *
 * Proxies the Apple Pay domain association file from Stripe's CDN.
 * Stripe hosts this file for all merchants — same content for every
 * Stripe-based Apple Pay integration. The rewrite is used because
 * Next.js serves static /public/ files before rewrites, so the path
 * must not have a static file (public/.well-known/ file is deleted).
 *
 * Stripe source:
 *   https://stripe.com/files/apple-pay/apple-developer-merchantid-domain-association
 */

import { NextResponse } from "next/server";

const STRIPE_APPLE_PAY_FILE =
  "https://stripe.com/files/apple-pay/apple-developer-merchantid-domain-association";

export async function GET() {
  try {
    const upstream = await fetch(STRIPE_APPLE_PAY_FILE, {
      // Revalidate daily — content rarely changes
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      console.error(
        "[apple-pay-verify] upstream fetch failed:",
        upstream.status,
        upstream.statusText
      );
      return new NextResponse("Upstream fetch failed", { status: 502 });
    }

    const content = await upstream.arrayBuffer();

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type":  "application/octet-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("[apple-pay-verify] error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}
