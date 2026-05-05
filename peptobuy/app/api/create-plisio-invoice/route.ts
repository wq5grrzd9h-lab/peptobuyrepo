import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { amount, email, orderId } = await request.json();

    const params = {
      api_key: process.env.PLISIO_SECRET_KEY,
      currency: "BTC",
      source_currency: "USD",
      source_amount: Number(amount).toFixed(2),
      order_number: orderId,
      order_name: "PeptoBuy Order",
      email,
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/plisio-webhook`,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/order-confirmation`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
    };

    const response = await axios.get("https://plisio.net/api/v1/invoices/new", { params });

    if (response.data?.status !== "success") {
      const msg = response.data?.data?.message ?? "Plisio API error";
      throw new Error(msg);
    }

    const invoiceUrl: string = response.data.data.invoice_url;
    return NextResponse.json({ invoiceUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
