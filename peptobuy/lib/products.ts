// ─── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | "Weight Loss"
  | "Recovery & Healing"
  | "Muscle Growth"
  | "Essentials";

export interface DoseOption {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;      // = doses[0].price
  description: string;
  category: Category;
  inStock: boolean;
  image: string;
  badge?: string;
  doses: DoseOption[];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [

  // ── Weight Loss ─────────────────────────────────────────────────────────────
  {
    id: "rtglp3",
    name: "RTGLP3 (Reta 🐀)",
    slug: "rtglp3",
    price: 103.99,
    description:
      "Triple GLP receptor agonist peptide compound formulated for advanced metabolic research. Supplied as lyophilized powder for in vitro and preclinical study models. For research use only — not for human consumption.",
    category: "Weight Loss",
    inStock: true,
    image: "/products/RTGLP3_New_Pic.png",
    badge: "Best Seller",
    doses: [
      { size: "10mg", price: 103.99 },
      { size: "20mg", price: 183.99 },
      { size: "30mg", price: 229.99 },
    ],
  },

  // ── Recovery & Healing ──────────────────────────────────────────────────────
  {
    id: "bpc-157",
    name: "BPC-157",
    slug: "bpc-157",
    price: 80.99,
    description:
      "Body Protection Compound 157 — a 15-amino acid synthetic peptide derived from a human gastric protein sequence. Studied in models of gastrointestinal integrity, joint tissue repair, and angiogenesis. Supplied as lyophilized powder. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/BPC_NEW_PIC_Peptobuy.png",
    badge: "Best Seller",
    doses: [
      { size: "10mg", price: 80.99 },
    ],
  },
  {
    id: "tb-500",
    name: "TB-500",
    slug: "tb-500",
    price: 80.99,
    description:
      "Thymosin Beta-500 — synthetic analogue of Thymosin Beta-4 with high actin-binding affinity. Investigated in preclinical models of wound healing, inflammation modulation, and soft tissue recovery signaling pathways. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/TB500_new_pic.png",
    doses: [
      { size: "10mg", price: 80.99 },
    ],
  },
  {
    id: "bpc-tb-blend",
    name: "BPC-157 / TB-500 Blend",
    slug: "bpc-tb-blend",
    price: 149.99,
    description:
      "Research-grade BPC-157 and TB-500 peptide blend. Supplied as lyophilized powder for in vitro and preclinical research applications. For research use only — not for human consumption.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/Peptobuy BPC-TB Blend.png",
    badge: "New",
    doses: [
      { size: "20mg", price: 149.99 },
    ],
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    slug: "ghk-cu",
    price: 91.99,
    description:
      "Glycyl-L-histidyl-L-lysine copper chelate — a naturally occurring tripeptide-copper complex. Researched for roles in extracellular matrix remodeling, antioxidant signaling, and skin barrier function studies. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/GHKCU_NEW_PIC.png",
    doses: [
      { size: "100mg", price: 91.99 },
    ],
  },
  {
    id: "mots-c",
    name: "MOTS-C",
    slug: "mots-c",
    price: 91.99,
    description:
      "Research-grade MOTS-C peptide — a mitochondria-derived peptide investigated for roles in metabolic regulation, insulin sensitivity, and cellular energy homeostasis signaling pathways. Supplied as lyophilized powder for in vitro and preclinical research. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/MOTS-C_New_Pic.png",
    doses: [
      { size: "10mg", price: 91.99 },
    ],
  },

  // ── Muscle Growth ───────────────────────────────────────────────────────────
  {
    id: "tesamorelin",
    name: "Tesamorelin / TESA",
    slug: "tesamorelin",
    price: 103.99,
    description:
      "Synthetic GHRF analogue stabilized with a trans-3-hexenoic acid modification. Used in growth hormone pulsatility and visceral adipose tissue research models. For research use only — not for human consumption.",
    category: "Muscle Growth",
    inStock: true,
    image: "/products/Tesamorelin_new_pic.png",
    doses: [
      { size: "10mg", price: 103.99 },
    ],
  },

  // ── Essentials ──────────────────────────────────────────────────────────────
  {
    id: "bac-water",
    name: "BAC Water",
    slug: "bac-water",
    price: 17.99,
    description:
      "Bacteriostatic Water (0.9% benzyl alcohol in sterile water). Research-grade solvent used for peptide reconstitution and preparation of solutions in controlled laboratory settings. For research use only.",
    category: "Essentials",
    inStock: true,
    image: "/products/Bac_Water_New.png",
    doses: [
      { size: "10ml", price: 17.99 },
      { size: "20ml", price: 34.99 },
      { size: "30ml", price: 51.99 },
    ],
  },
];

// ─── Category lists ───────────────────────────────────────────────────────────

export const categories: Category[] = [
  "Weight Loss",
  "Recovery & Healing",
  "Muscle Growth",
  "Essentials",
];

export const shopCategories: readonly Category[] = [
  "Weight Loss",
  "Recovery & Healing",
  "Muscle Growth",
];

// ─── Slug helpers ─────────────────────────────────────────────────────────────

export function categoryToSlug(cat: Category): string {
  return cat.toLowerCase().replace(/[&\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function slugToCategory(slug: string): Category | null {
  return shopCategories.find((c) => categoryToSlug(c) === slug) ?? null;
}
