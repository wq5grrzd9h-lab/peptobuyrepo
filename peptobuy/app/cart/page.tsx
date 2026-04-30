import type { Metadata } from "next";
import CartClient from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Cart — PeptoBuy",
  description: "Review your cart and complete your order.",
};

export default function CartPage() {
  return <CartClient />;
}
