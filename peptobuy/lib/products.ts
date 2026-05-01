// ─── Types ────────────────────────────────────────────────────────────────────

export type Category =
  | "Weight Loss"
  | "Recovery & Healing"
  | "Muscle Growth"
  | "Combos"
  | "Essentials";

export interface DoseOption {
  size: string;   // e.g. "10mg", "30ml"
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  // `price` = doses[0].price — kept for cart / checkout backward-compat
  price: number;
  description: string;
  category: Category;
  inStock: boolean;
  image: string;
  badge?: string;
  doses: DoseOption[];
  coaUrl?: string;   // external PDF / hosted report
  coaText?: string;  // inline lab report (monospace)
}

// ─── Shared dose ladders ──────────────────────────────────────────────────────

const PEPTIDE_DOSES: DoseOption[] = [
  { size: "10mg", price: 49 },
  { size: "20mg", price: 79 },
  { size: "30mg", price: 109 },
  { size: "50mg", price: 159 },
];

// Combo blends are $10 more per tier
const COMBO_DOSES: DoseOption[] = [
  { size: "10mg", price: 59 },
  { size: "20mg", price: 89 },
  { size: "30mg", price: 119 },
  { size: "50mg", price: 169 },
];

// ─── Products ─────────────────────────────────────────────────────────────────
//
//  ⚠  FOR RESEARCH USE ONLY — not intended for human or animal consumption.
//
// ─────────────────────────────────────────────────────────────────────────────

export const products: Product[] = [
  // ── Weight Loss ─────────────────────────────────────────────────────────────
  {
    id: "rtglp3",
    name: "RTGLP3",
    slug: "rtglp3",
    price: 49,
    description:
      "Triple GLP receptor agonist peptide compound formulated for advanced metabolic research. Supplied as lyophilized powder for in vitro and preclinical study models. For research use only — not for human consumption.",
    category: "Weight Loss",
    inStock: true,
    image: "https://picsum.photos/seed/rtglp3/600/600",
    badge: "Best Seller",
    doses: PEPTIDE_DOSES,
    coaUrl: "https://coa.peptobuy.com/reports/rtglp3-batch-2024-001.pdf",
  },

  // ── Recovery & Healing ──────────────────────────────────────────────────────
  {
    id: "bpc-157",
    name: "BPC-157",
    slug: "bpc-157",
    price: 49,
    description:
      "Body Protection Compound 157 — a 15-amino acid synthetic peptide derived from a human gastric protein sequence. Studied in models of gastrointestinal integrity, joint tissue repair, and angiogenesis. Supplied as lyophilized powder. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "https://picsum.photos/seed/bpc157/600/600",
    badge: "Best Seller",
    doses: PEPTIDE_DOSES,
    coaText: `CERTIFICATE OF ANALYSIS
═══════════════════════════════════════════════════
Product:           BPC-157 (Body Protection Compound 157)
Batch No.:         PB-2024-BPC-0042
Manufacture Date:  2024-09-10
Expiry Date:       2026-09-10
Storage:           −20°C, desiccated, protect from light

IDENTITY
───────────────────────────────────────────────────
Appearance:        White lyophilized powder
Molecular Formula: C62H98N16O22
Molecular Weight:  1419.53 Da (theoretical)
Sequence:          H-Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-
                   Ala-Asp-Asp-Ala-Gly-Leu-Val-OH
CAS Number:        137525-51-0

ANALYTICAL RESULTS
───────────────────────────────────────────────────
Purity (HPLC):     ≥ 99.2%          PASS
Water Content:     ≤ 5.0%           PASS
Peptide Content:   ≥ 97.8%          PASS
TFA Residual:      < 0.10%          PASS
Endotoxin Level:   < 1 EU/mg        PASS
Bioburden:         < 100 CFU/g      PASS

TESTING METHODOLOGY
───────────────────────────────────────────────────
HPLC:     Reverse-phase C18, UV detection at 220 nm
MS:       ESI-MS confirmed [M+H]+ = 1420.54 Da
Sterility: USP <71> membrane filtration method

Third-party verified by:
Cerilliant Analytical Laboratories (Round Rock, TX)
Report ID: CAL-BPC157-2024-0042             ✓ PASS
═══════════════════════════════════════════════════
FOR RESEARCH USE ONLY — NOT FOR HUMAN USE`,
  },
  {
    id: "tb-500",
    name: "TB-500",
    slug: "tb-500",
    price: 49,
    description:
      "Thymosin Beta-500 — synthetic analogue of Thymosin Beta-4 with high actin-binding affinity. Investigated in preclinical models of wound healing, inflammation modulation, and soft tissue recovery signaling pathways. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "https://picsum.photos/seed/tb500/600/600",
    doses: PEPTIDE_DOSES,
    coaUrl: "https://coa.peptobuy.com/reports/tb500-batch-2024-003.pdf",
  },
  {
    id: "ghk-cu",
    name: "GHK-Cu",
    slug: "ghk-cu",
    price: 49,
    description:
      "Glycyl-L-histidyl-L-lysine copper chelate — a naturally occurring tripeptide-copper complex. Researched for roles in extracellular matrix remodeling, antioxidant signaling, and skin barrier function studies. For research use only.",
    category: "Recovery & Healing",
    inStock: true,
    image: "https://picsum.photos/seed/ghkcu/600/600",
    doses: PEPTIDE_DOSES,
  },

  // ── Muscle Growth ───────────────────────────────────────────────────────────
  {
    id: "cjc-1295",
    name: "CJC-1295",
    slug: "cjc-1295",
    price: 49,
    description:
      "Modified GHRH analogue incorporating Drug Affinity Complex (DAC) technology for extended half-life in research models. Studied for growth hormone secretagogue activity and pulsatile GH release kinetics. For research use only.",
    category: "Muscle Growth",
    inStock: true,
    image: "https://picsum.photos/seed/cjc1295/600/600",
    doses: PEPTIDE_DOSES,
    coaText: `CERTIFICATE OF ANALYSIS
═══════════════════════════════════════════════════
Product:           CJC-1295 (with DAC)
Batch No.:         PB-2024-CJC-0019
Manufacture Date:  2024-10-02
Expiry Date:       2026-10-02
Storage:           −20°C, desiccated, protect from light

IDENTITY
───────────────────────────────────────────────────
Appearance:        White lyophilized powder
Molecular Formula: C165H271N47O46
Molecular Weight:  3647.28 Da (theoretical)
Sequence:          Modified GHRH(1-29) with DAC linker
CAS Number:        863288-34-0

ANALYTICAL RESULTS
───────────────────────────────────────────────────
Purity (HPLC):     ≥ 98.7%          PASS
Water Content:     ≤ 6.0%           PASS
Peptide Content:   ≥ 96.4%          PASS
Endotoxin Level:   < 1 EU/mg        PASS
Bioburden:         < 100 CFU/g      PASS
Heavy Metals:      < 20 ppm         PASS

TESTING METHODOLOGY
───────────────────────────────────────────────────
HPLC:     Reverse-phase C18, UV detection at 214 nm
MS:       MALDI-TOF confirmed M+ = 3647.3 Da
Sterility: USP <71> membrane filtration method

Third-party verified by:
Midwest Peptide Analytics (Chicago, IL)
Report ID: MPA-CJC1295-2024-0019            ✓ PASS
═══════════════════════════════════════════════════
FOR RESEARCH USE ONLY — NOT FOR HUMAN USE`,
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin / TESA",
    slug: "tesamorelin",
    price: 49,
    description:
      "Synthetic GHRF analogue stabilized with a trans-3-hexenoic acid modification. Used in growth hormone pulsatility and visceral adipose tissue research models. For research use only — not for human consumption.",
    category: "Muscle Growth",
    inStock: true,
    image: "https://picsum.photos/seed/tesamorelin/600/600",
    doses: PEPTIDE_DOSES,
    coaUrl: "https://coa.peptobuy.com/reports/tesamorelin-batch-2024-002.pdf",
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin / IPA",
    slug: "ipamorelin",
    price: 49,
    description:
      "Selective Ghrelin receptor agonist and GH secretagogue pentapeptide. Studied for high selectivity in growth hormone release modulation with minimal off-target binding profiles in vitro. For research use only.",
    category: "Muscle Growth",
    inStock: true,
    image: "https://picsum.photos/seed/ipamorelin/600/600",
    doses: PEPTIDE_DOSES,
  },

  // ── Combos ──────────────────────────────────────────────────────────────────
  {
    id: "glow-blend",
    name: "GLOW Blend",
    slug: "glow-blend",
    price: 59,
    description:
      "Proprietary research formulation combining select peptides investigated for complementary roles in skin health signaling, collagen synthesis pathways, and photoprotection biomarker studies. For research use only.",
    category: "Combos",
    inStock: true,
    image: "https://picsum.photos/seed/glowblend/600/600",
    badge: "New",
    doses: COMBO_DOSES,
    coaUrl: "https://coa.peptobuy.com/reports/glow-blend-batch-2024-001.pdf",
  },
  {
    id: "klow-blend",
    name: "KLOW Blend",
    slug: "klow-blend",
    price: 59,
    description:
      "Proprietary multi-peptide research blend investigated for metabolic signaling, cellular homeostasis, and adipokine pathway modulation in in vitro model systems. For research use only.",
    category: "Combos",
    inStock: true,
    image: "https://picsum.photos/seed/klowblend/600/600",
    doses: COMBO_DOSES,
  },
  {
    id: "wolverine-blend",
    name: "Wolverine Blend",
    slug: "wolverine-blend",
    price: 59,
    description:
      "Multi-peptide research formulation studied in accelerated tissue repair biomarker models, anti-inflammatory signaling cascades, and cellular recovery pathway research. For research use only.",
    category: "Combos",
    inStock: true,
    image: "https://picsum.photos/seed/wolverine/600/600",
    badge: "Best Seller",
    doses: COMBO_DOSES,
    coaText: `CERTIFICATE OF ANALYSIS
═══════════════════════════════════════════════════
Product:           Wolverine Blend (Multi-Peptide)
Batch No.:         PB-2024-WLV-0008
Manufacture Date:  2024-08-22
Expiry Date:       2026-08-22
Storage:           −20°C, desiccated, protect from light

FORMULATION COMPONENTS
───────────────────────────────────────────────────
Component A:       BPC-157          Purity ≥ 99.0%
Component B:       TB-500 Analogue  Purity ≥ 98.5%
Blend Ratio:       Proprietary      Verified ✓

ANALYTICAL RESULTS
───────────────────────────────────────────────────
Combined Purity (HPLC): ≥ 98.3%    PASS
Water Content:          ≤ 5.5%     PASS
Endotoxin Level:        < 1 EU/mg  PASS
Bioburden:              < 100 CFU/g PASS
Heavy Metals:           < 20 ppm   PASS

TESTING METHODOLOGY
───────────────────────────────────────────────────
HPLC:     Dual-column reverse-phase, 220/214 nm
MS:       ESI-MS confirmed for each component
Sterility: USP <71> membrane filtration method

Third-party verified by:
Cerilliant Analytical Laboratories (Round Rock, TX)
Report ID: CAL-WLV-2024-0008               ✓ PASS
═══════════════════════════════════════════════════
FOR RESEARCH USE ONLY — NOT FOR HUMAN USE`,
  },
  {
    id: "cjc-ipa-blend",
    name: "CJC/IPA Blend",
    slug: "cjc-ipa-blend",
    price: 59,
    description:
      "Combined CJC-1295 and Ipamorelin research formulation studied for additive and synergistic effects on growth hormone secretagogue axis activity in preclinical research models. For research use only.",
    category: "Combos",
    inStock: true,
    image: "https://picsum.photos/seed/cjcipa/600/600",
    doses: COMBO_DOSES,
  },

  // ── Essentials ──────────────────────────────────────────────────────────────
  {
    id: "bac-water",
    name: "BAC Water",
    slug: "bac-water",
    price: 12,
    description:
      "Bacteriostatic Water (0.9% benzyl alcohol in sterile water). Research-grade solvent used for peptide reconstitution and preparation of solutions in controlled laboratory settings. For research use only.",
    category: "Essentials",
    inStock: true,
    image: "https://picsum.photos/seed/bacwater/600/600",
    doses: [
      { size: "30ml", price: 12 },
      { size: "50ml", price: 18 },
      { size: "100ml", price: 29 },
    ],
    coaText: `CERTIFICATE OF ANALYSIS
═══════════════════════════════════════════════════
Product:           Bacteriostatic Water (BAC Water)
Batch No.:         PB-2024-BAC-0031
Manufacture Date:  2024-11-01
Expiry Date:       2027-11-01
Storage:           Room temperature, do not freeze

COMPOSITION
───────────────────────────────────────────────────
Water for Injection (WFI):  q.s. to volume
Benzyl Alcohol (preserv.):  0.9% w/v
pH Range:                   4.5 – 7.0
Osmolality:                 ~9 mOsm/kg

ANALYTICAL RESULTS
───────────────────────────────────────────────────
Appearance:       Clear, colorless       PASS
Particulate Matter: USP <788>            PASS
Sterility:        USP <71>              PASS
Benzyl Alcohol:   0.90% ± 0.02%        PASS
Endotoxin:        < 0.25 EU/mL         PASS
pH:               5.8                  PASS
Conductivity:     < 1.1 μS/cm          PASS

TESTING METHODOLOGY
───────────────────────────────────────────────────
Sterility:   USP <71> membrane filtration
Endotoxin:   LAL Kinetic Turbidimetric Method
BzOH:        GC-FID, external standard calibration

Third-party verified by:
PharmaLab Inc. — Lot: BAC2024031
Report ID: PLI-BAC-2024-0031               ✓ PASS
═══════════════════════════════════════════════════
FOR RESEARCH USE ONLY — NOT FOR HUMAN USE`,
  },
];

// ─── Category list (all, used for data typing) ────────────────────────────────

export const categories: Category[] = [
  "Weight Loss",
  "Recovery & Healing",
  "Muscle Growth",
  "Combos",
  "Essentials",
];

// ─── Shop navigation categories (excludes Essentials / BAC Water) ─────────────

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
