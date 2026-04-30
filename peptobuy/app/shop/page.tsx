import type { Metadata } from "next";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop — PeptoBuy",
  description:
    "Browse our full catalog of performance supplements, recovery essentials, and curated bundles.",
};

export default function ShopPage() {
  return <ShopClient />;
}
