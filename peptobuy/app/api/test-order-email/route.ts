import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildInternalHtml,
  buildCustomerHtml,
  type OrderEmailData,
} from "@/lib/orderEmailBuilders";

const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "PeptoBuy <noreply@peptobuy.com>";

export async function GET() {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const testData: OrderEmailData = {
    orderNumber: "PB-000099",
    customerEmail: "peptobuy@gmail.com",
    customerName: "Test Customer",
    items: [
      { name: "RTGLP3 (Reta 🐀)", dose: "10mg", quantity: 2, price: 103.99, reconstitution: false },
      { name: "BPC-157",           dose: "10mg", quantity: 1, price: 110.98, reconstitution: true  },
    ],
    subtotal:           369.96,
    discountCode:       "FIRST20",
    discountAmount:     73.99,
    shipping:           0,
    total:              295.97,
    paymentMethodLabel: "Credit / Debit Card (Stripe)",
    shippingAddress: {
      firstName: "Test",
      lastName:  "Customer",
      address:   "123 Research Blvd",
      city:      "Tampa",
      state:     "FL",
      zip:       "33617",
    },
    freeGifts: ["BAC Water + Syringes", "GHK-Cu 100mg"],
  };

  const resend = new Resend(process.env.RESEND_API_KEY);

  const [internalResult, customerResult] = await Promise.allSettled([
    resend.emails.send({
      from: RESEND_FROM,
      to: "peptobuy@gmail.com",
      subject: `[TEST] New Order — ${testData.orderNumber}`,
      html: buildInternalHtml(testData, timestamp),
    }),
    resend.emails.send({
      from: RESEND_FROM,
      to: "peptobuy@gmail.com",
      subject: `[TEST] Your PeptoBuy Order Confirmation — ${testData.orderNumber}`,
      html: buildCustomerHtml(testData),
    }),
  ]);

  const results = {
    internal: internalResult.status === "fulfilled"
      ? { ok: true, id: (internalResult.value as { data?: { id?: string } }).data?.id }
      : { ok: false, error: String((internalResult as PromiseRejectedResult).reason) },
    customer: customerResult.status === "fulfilled"
      ? { ok: true, id: (customerResult.value as { data?: { id?: string } }).data?.id }
      : { ok: false, error: String((customerResult as PromiseRejectedResult).reason) },
  };

  console.log("[test-order-email] results:", results);
  return NextResponse.json({ ok: true, results });
}
