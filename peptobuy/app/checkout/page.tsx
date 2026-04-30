import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout — PeptoBuy",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <CheckoutClient />
    </div>
  );
}
