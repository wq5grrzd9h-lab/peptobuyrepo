import type { Metadata } from "next";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Research Peptides",
  description:
    "Browse our full catalog of research-grade peptides — BPC-157, TB-500, RTGLP3, MOTS-C, Tesamorelin, GHK-Cu, and BAC Water. 99%+ purity, COA on request.",
  openGraph: {
    title: "Shop Research Peptides | PeptoBuy",
    description: "Browse our full catalog of research-grade peptides. 99%+ purity, COA on request.",
    url: "https://peptobuy.com/shop",
  },
};

export default function ShopPage({ searchParams }: { searchParams: { category?: string } }) {
  return <ShopClient initialCategory={searchParams.category} />;
}
