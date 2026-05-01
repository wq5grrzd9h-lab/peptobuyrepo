import type { Metadata } from "next";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop — PeptoBuy",
  description:
    "Browse our full catalog of research-grade peptides, lyophilized compounds, blends, and reconstitution essentials.",
};

export default function ShopPage({ searchParams }: { searchParams: { category?: string } }) {
  return <ShopClient initialCategory={searchParams.category} />;
}
