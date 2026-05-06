// ─── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | "Weight Loss"
  | "Recovery & Healing"
  | "Muscle Growth"
  | "Combos"
  | "Essentials";

export interface DoseOption {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;      // = doses[0].price — used for cart/checkout backward-compat
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
    price: 89.99,
    description:
      "Triple GLP receptor agonist peptide compound formulated for advanced metabolic research. Supplied as lyophilized powder for in vitro and preclinical study models. For research use only — not for human consumption.",
    category: "Weight Loss",
    inStock: true,
    image: "/products/Peptobuy RTGLP3.png",
    badge: "Best Seller",
    doses: [
      { size: "10mg", price: 89.99 },
      { size: "20mg", price: 159.99 },
      { size: "30mg", price: 199.99 },
      { size: "50mg", price: 269.99 },
    ],
  },

  // ── Recovery & Healing ──────────────────────────────────────────────────────
  {
    id: "bpc-157",
    name: "BPC-157",
    slug: "bpc-157",
    price: 69.99,
    description:
      "Body Protection Compound 157 — a 15-amino acid synthetic peptide derived from a human gastric protein sequence. Studied in models of gastrointestinal integrity, joint tissue repair, and angiogenesis. Supplied as lyophilized powder. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/Peptobuy BPC157.png",
    badge: "Best Seller",
    doses: [
      { size: "10mg", price: 69.99 },
      { size: "20mg", price: 124.99 },
      { size: "30mg", price: 159.99 },
      { size: "50mg", price: 209.99 },
    ],
  },
  {
    id: "tb-500",
    name: "TB-500",
    slug: "tb-500",
    price: 69.99,
    description:
      "Thymosin Beta-500 — synthetic analogue of Thymosin Beta-4 with high actin-binding affinity. Investigated in preclinical models of wound healing, inflammation modulation, and soft tissue recovery signaling pathways. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/Peptobuy TB500.png",
    doses: [
      { size: "10mg", price: 69.99 },
      { size: "20mg", price: 124.99 },
      { size: "30mg", price: 159.99 },
      { size: "50mg", price: 209.99 },
    ],
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    slug: "ghk-cu",
    price: 70,
    description:
      "Glycyl-L-histidyl-L-lysine copper chelate — a naturally occurring tripeptide-copper complex. Researched for roles in extracellular matrix remodeling, antioxidant signaling, and skin barrier function studies. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "/products/Peptobuy GHK.png",
    doses: [
      { size: "100mg", price: 70 },
    ],
  },

  // ── Muscle Growth ───────────────────────────────────────────────────────────
  {
    id: "cjc-1295",
    name: "CJC-1295 / IPA",
    slug: "cjc-1295",
    price: 74.99,
    description:
      "Modified GHRH analogue incorporating Drug Affinity Complex (DAC) technology combined with Ipamorelin for enhanced growth hormone secretagogue activity. Studied for pulsatile GH release kinetics and IGF-1 axis modulation. For research use only.",
    category: "Muscle Growth",
    inStock: true,
    image: "/products/Peptobuy CJC1259.png",
    doses: [
      { size: "10mg", price: 74.99 },
      { size: "20mg", price: 134.99 },
      { size: "30mg", price: 169.99 },
      { size: "50mg", price: 219.99 },
    ],
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin / TESA",
    slug: "tesamorelin",
    price: 80,
    description:
      "Synthetic GHRF analogue stabilized with a trans-3-hexenoic acid modification. Used in growth hormone pulsatility and visceral adipose tissue research models. For research use only — not for human consumption.",
    category: "Muscle Growth",
    inStock: true,
    image: "/products/Peptobuy Tesa.png",
    doses: [
      { size: "10mg", price: 80 },
      { size: "20mg", price: 139.99 },
      { size: "30mg", price: 174.99 },
      { size: "50mg", price: 224.99 },
    ],
  },

  // ── Combos ──────────────────────────────────────────────────────────────────
  {
    id: "wolverine-blend",
    name: "Wolverine Blend",
    slug: "wolverine-blend",
    price: 74.99,
    description:
      "Multi-peptide research formulation studied in accelerated tissue repair biomarker models, anti-inflammatory signaling cascades, and cellular recovery pathway research. For research use only.",
    category: "Combos",
    inStock: true,
    image: "/products/Peptobuy wolverine.png",
    badge: "Best Seller",
    doses: [
      { size: "10mg", price: 74.99 },
      { size: "20mg", price: 134.99 },
      { size: "30mg", price: 169.99 },
      { size: "50mg", price: 219.99 },
    ],
  },
  {
    id: "klow-blend",
    name: "KLOW Blend",
    slug: "klow-blend",
    price: 130,
    description:
      "Proprietary multi-peptide research blend investigated for metabolic signaling, cellular homeostasis, and adipokine pathway modulation in in vitro model systems. For research use only.",
    category: "Combos",
    inStock: true,
    image: "/products/Peptobuy KLOW.png",
    doses: [
      { size: "80mg", price: 130 },
    ],
  },
  {
    id: "glow-blend",
    name: "GLOW Blend",
    slug: "glow-blend",
    price: 120,
    description:
      "Proprietary research formulation combining select peptides investigated for complementary roles in skin health signaling, collagen synthesis pathways, and photoprotection biomarker studies. For research use only.",
    category: "Combos",
    inStock: true,
    image: "/products/Peptobuy GLOW.png",
    badge: "New",
    doses: [
      { size: "70mg", price: 120 },
    ],
  },

  // ── Essentials ──────────────────────────────────────────────────────────────
  {
    id: "bac-water",
    name: "BAC Water",
    slug: "bac-water",
    price: 15,
    description:
      "Bacteriostatic Water (0.9% benzyl alcohol in sterile water). Research-grade solvent used for peptide reconstitution and preparation of solutions in controlled laboratory settings. For research use only.",
    category: "Essentials",
    inStock: true,
    image: "/products/Peptobuy BAC water.png",
    doses: [
      { size: "10ml", price: 15 },
      { size: "20ml", price: 30 },
      { size: "30ml", price: 45 },
      { size: "50ml", price: 60 },
    ],
  },
  {
    id: "nad-plus",
    name: "NAD+",
    slug: "nad-plus",
    price: 75,
    description:
      "Nicotinamide Adenine Dinucleotide — a coenzyme central to cellular energy metabolism and redox signaling research. Investigated in models of mitochondrial function, sirtuin activation, and DNA repair pathway studies. For research use only.",
    category: "Essentials",
    inStock: true,
    image: "/products/Peptobuy NAD.png",
    doses: [
      { size: "500mg", price: 75 },
    ],
  },
];

// ─── Category lists ───────────────────────────────────────────────────────────

export const categories: Category[] = [
  "Weight Loss",
  "Recovery & Healing",
  "Muscle Growth",
  "Combos",
  "Essentials",
];

export const shopCategories: readonly Category[] = [
  "Weight Loss",
  "Recovery & Healing",
  "Muscle Growth",
  "Combos",
];

// ─── Slug helpers ─────────────────────────────────────────────────────────────

export function categoryToSlug(cat: Category): string {
  return cat.toLowerCase().replace(/[&\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

export function slugToCategory(slug: string): Category | null {
  return shopCategories.find((c) => categoryToSlug(c) === slug) ?? null;
}
