export type Category = "Supplements" | "Recovery" | "Bundles" | "Essentials";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: Category;
  inStock: boolean;
  image: string;
  badge?: string;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Whey Protein Isolate",
    price: 54.99,
    originalPrice: 69.99,
    description:
      "Ultra-pure whey protein isolate with 27g of protein per serving. Zero fillers, zero compromises. Mixes instantly and goes down smooth.",
    category: "Supplements",
    inStock: true,
    image: "https://picsum.photos/seed/whey/600/600",
    badge: "Best Seller",
  },
  {
    id: "p2",
    name: "Creatine Monohydrate",
    price: 24.99,
    description:
      "Pharmaceutical-grade creatine monohydrate. 5g per serving to fuel explosive output and support lean muscle gains.",
    category: "Supplements",
    inStock: true,
    image: "https://picsum.photos/seed/creatine/600/600",
  },
  {
    id: "p3",
    name: "Magnesium Glycinate",
    price: 19.99,
    description:
      "High-absorption magnesium for deep sleep, muscle recovery, and nervous system support. 200mg elemental magnesium per capsule.",
    category: "Recovery",
    inStock: true,
    image: "https://picsum.photos/seed/magnesium/600/600",
  },
  {
    id: "p4",
    name: "Recovery Pro Bundle",
    price: 89.99,
    originalPrice: 119.97,
    description:
      "The complete recovery stack: Magnesium Glycinate, Omega-3 Fish Oil, and Zinc-B6 complex. Save 25% vs buying separately.",
    category: "Bundles",
    inStock: true,
    image: "https://picsum.photos/seed/bundle/600/600",
    badge: "Sale",
  },
  {
    id: "p5",
    name: "Omega-3 Fish Oil",
    price: 22.99,
    description:
      "Wild-caught, molecularly distilled fish oil. 1000mg EPA+DHA per serving for cardiovascular and joint health.",
    category: "Essentials",
    inStock: true,
    image: "https://picsum.photos/seed/omega3/600/600",
  },
  {
    id: "p6",
    name: "Pre-Workout Extreme",
    price: 44.99,
    originalPrice: 49.99,
    description:
      "Clean energy formula with 200mg caffeine, 6g citrulline, and beta-alanine. No crash, no jitters — just locked-in focus.",
    category: "Supplements",
    inStock: false,
    image: "https://picsum.photos/seed/preworkout/600/600",
    badge: "Sale",
  },
  {
    id: "p7",
    name: "Starter Stack",
    price: 64.99,
    originalPrice: 79.97,
    description:
      "Everything a beginner needs: Whey Protein, Creatine, and a daily multivitamin. The no-guesswork foundation.",
    category: "Bundles",
    inStock: true,
    image: "https://picsum.photos/seed/starter/600/600",
    badge: "New",
  },
  {
    id: "p8",
    name: "Vitamin D3 + K2",
    price: 16.99,
    description:
      "5000 IU of D3 paired with 100mcg MK-7 K2 for optimal calcium metabolism and immune function. Year-round essential.",
    category: "Essentials",
    inStock: true,
    image: "https://picsum.photos/seed/vitamind/600/600",
  },
];

export const categories: Category[] = [
  "Supplements",
  "Recovery",
  "Bundles",
  "Essentials",
];
