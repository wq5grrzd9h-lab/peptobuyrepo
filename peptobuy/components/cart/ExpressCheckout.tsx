"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import { useCart, lineUnitPrice } from "@/context/CartContext";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const SHIPPING_THRESHOLD = 300;
const STANDARD_SHIPPING = 9.99;

function ExpressCheckoutInner() {
  const stripe = useStripe();
  const { items, subtotal, discountAmount, clearCart } = useCart();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  const discountedSub = subtotal - (discountAmount ?? 0);
  const baseShippingCents = discountedSub >= SHIPPING_THRESHOLD ? 0 : 999;
  const totalCents = Math.round(discountedSub * 100) + baseShippingCents;

  useEffect(() => {
    if (!stripe || !items.length || totalCents <= 0) return;

    let liveTotalCents = totalCents;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: "PeptoBuy Order", amount: liveTotalCents },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: "standard",
          label: "Standard Shipping (3–7 days)",
          detail: "Ships within 1 business day",
          amount: baseShippingCents,
        },
        {
          id: "express",
          label: "Express Shipping (1–2 days)",
          detail: "Priority processing",
          amount: 1999,
        },
      ],
    });

    pr.on("shippingoptionchange", (ev) => {
      liveTotalCents =
        Math.round(discountedSub * 100) +
        (ev.shippingOption.id === "express" ? 1999 : baseShippingCents);
      ev.updateWith({
        status: "success",
        total: { label: "PeptoBuy Order", amount: liveTotalCents },
      });
    });

    pr.on("paymentmethod", async (ev) => {
      try {
        const piRes = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: liveTotalCents / 100 }),
        });
        const { clientSecret } = await piRes.json();
        if (!clientSecret) { ev.complete("fail"); return; }

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false },
        );

        if (error) { ev.complete("fail"); return; }

        if (paymentIntent.status === "requires_action") {
          const { error: err2 } = await stripe.confirmCardPayment(clientSecret);
          if (err2) { ev.complete("fail"); return; }
        }

        ev.complete("success");

        // Build order record
        const raw = ev.payerName ?? "";
        const sp = raw.indexOf(" ");
        const firstName = sp > -1 ? raw.slice(0, sp) : (raw || "Customer");
        const lastName = sp > -1 ? raw.slice(sp + 1) : "";
        const addr = ev.shippingAddress;
        const isExpress = ev.shippingOption?.id === "express";
        const finalShippingCost = isExpress
          ? 19.99
          : discountedSub >= SHIPPING_THRESHOLD
          ? 0
          : STANDARD_SHIPPING;
        const finalTotal = discountedSub + finalShippingCost;

        const onr = await fetch("/api/generate-order-number", { method: "POST" });
        const { orderNumber } = await onr.json();

        const orderData = {
          orderNumber,
          email: ev.payerEmail ?? "",
          placedAt: new Date().toISOString(),
          paymentMethod: "card" as const,
          paymentStatus: "paid",
          items: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: lineUnitPrice(item),
            quantity: item.quantity,
            image: item.product.image,
            category: item.product.category,
            selectedDose: item.selectedDose?.size,
            reconstitution: item.reconstitution,
          })),
          subtotal: discountedSub,
          shippingCost: finalShippingCost,
          total: finalTotal,
          shippingAddress: {
            firstName,
            lastName,
            address: addr?.addressLine?.[0] ?? "",
            city: addr?.city ?? "",
            state: addr?.region ?? "",
            zip: addr?.postalCode ?? "",
            country: addr?.country ?? "US",
          },
          shippingMethod: (isExpress ? "express" : "standard") as "express" | "standard",
        };

        try { localStorage.setItem("peptobuy-last-order", JSON.stringify(orderData)); } catch {}

        // Send order confirmation email (non-blocking)
        fetch("/api/send-order-emails", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        }).catch(console.error);

        // Cancel abandonment jobs
        if (orderData.email) {
          fetch("/api/cancel-abandoned-cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: orderData.email, type: "both" }),
          }).catch(console.error);
        }

        // Clear state
        try {
          localStorage.removeItem("checkoutEmail");
          localStorage.removeItem("cartEmail");
          localStorage.removeItem("checkoutCartSnapshot");
          localStorage.removeItem("cartEmailSnapshot");
          sessionStorage.removeItem("capturedEmail");
          sessionStorage.removeItem("cartEmailCaptured");
        } catch {}

        clearCart();
        window.location.href = "/order-confirmation";
      } catch (err) {
        console.error("[express-checkout paymentmethod]", err);
        ev.complete("fail");
      }
    });

    pr.canMakePayment().then((result) => {
      if (result) setPaymentRequest(pr);
    });

    return () => setPaymentRequest(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, items.length, totalCents]);

  if (!paymentRequest) return null;

  return (
    <div className="mb-3">
      <div className="mb-2.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          Express Checkout
        </span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: { type: "buy", theme: "dark", height: "52px" },
          },
        }}
      />
      <div className="mt-2.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-[11px] font-semibold text-zinc-400">or pay with card</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>
    </div>
  );
}

export default function ExpressCheckout() {
  return (
    <Elements stripe={stripePromise}>
      <ExpressCheckoutInner />
    </Elements>
  );
}
