"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { FlaskConical, Thermometer, Beaker } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompoundRow { label: string; value: string }

interface ProductDetail {
  overview: string[];           // 2–3 research-framed paragraphs
  compoundData: CompoundRow[];  // analytical / molecular data table
}

// ─── Shared base rows ─────────────────────────────────────────────────────────

const PEPTIDE_BASE: CompoundRow[] = [
  { label: "Form",            value: "Lyophilized Powder" },
  { label: "Purity",         value: "≥98% (HPLC)" },
  { label: "Storage",        value: "-20 °C — desiccate, protect from light" },
  { label: "Reconstitution", value: "Sterile or bacteriostatic water" },
];

const BLEND_BASE: CompoundRow[] = [
  { label: "Classification",    value: "Proprietary Peptide Blend" },
  { label: "Individual Purity", value: "≥98% per component (HPLC)" },
  { label: "Form",              value: "Lyophilized Powder (co-lyophilized)" },
  { label: "Storage",           value: "-20 °C — desiccate" },
  { label: "Reconstitution",    value: "Sterile or bacteriostatic water" },
];

const DISCLAIMER =
  "For research use only. Not for human or animal consumption. Handle in accordance with applicable laboratory safety regulations.";

// ─── Per-product detail records ───────────────────────────────────────────────

const PRODUCT_DETAILS: Record<string, ProductDetail> = {

  // ── Weight Loss ─────────────────────────────────────────────────────────────
  "rtglp3": {
    overview: [
      "RTGLP3 is a synthetic triple GLP receptor agonist peptide studied for its role in metabolic signaling research. It demonstrates binding affinity at GLP-1, GLP-2, and GLP-3 receptor subtypes in in vitro assay models.",
      "Research applications include studies on incretin axis modulation, glucose-dependent insulin secretion models, and gastric motility pathway investigations. Supplied as lyophilized powder with ≥98% purity by HPLC.",
      "All experimental protocols should be conducted under appropriate laboratory conditions with applicable biosafety measures. For research use only.",
    ],
    compoundData: [
      { label: "Compound Type",   value: "Synthetic Peptide" },
      { label: "Receptor Targets", value: "GLP-1R, GLP-2R, GLP-3R" },
      ...PEPTIDE_BASE,
    ],
  },

  // ── Recovery & Healing ───────────────────────────────────────────────────────
  "bpc-157": {
    overview: [
      "BPC-157 (Body Protection Compound 157) is a 15-amino acid synthetic pentadecapeptide derived from a partial sequence of the human gastric Body Protection Compound. It is studied extensively in models of gastrointestinal mucosal integrity and wound repair signaling.",
      "Preclinical research has examined its effects in joint and tendon tissue repair models, angiogenesis assay systems, and nitric oxide pathway studies. The compound shows high stability and activity in standard in vitro assay conditions.",
      "Supplied as lyophilized powder. Reconstitute in sterile or bacteriostatic water. For research use only.",
    ],
    compoundData: [
      { label: "Sequence",          value: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val" },
      { label: "Molecular Weight",  value: "1,419.53 Da" },
      { label: "CAS Number",        value: "137525-51-0" },
      { label: "Amino Acids",       value: "15" },
      ...PEPTIDE_BASE,
    ],
  },
  "tb-500": {
    overview: [
      "TB-500 is a synthetic analogue derived from the active region of Thymosin Beta-4 — a 43-amino acid ubiquitous actin-sequestering protein. The compound retains the core Ac-LKKTETQ motif central to actin-binding activity.",
      "Research applications include in vitro studies on cellular migration, angiogenic signaling, inflammation pathway modulation, and skeletal muscle repair models. TB-500 has been investigated in a range of preclinical tissue recovery research.",
      "Reconstitute in sterile water or BAC Water for laboratory assay use. For research use only.",
    ],
    compoundData: [
      { label: "Based On",         value: "Thymosin Beta-4 (fragment 17–23)" },
      { label: "Molecular Weight", value: "~2,187.5 Da" },
      { label: "CAS Number",       value: "107761-42-2" },
      ...PEPTIDE_BASE,
    ],
  },
  "ghk-cu": {
    overview: [
      "GHK-Cu (Glycyl-L-histidyl-L-lysine copper chelate) is a naturally occurring tripeptide-copper complex found in human plasma, saliva, and urine. Its copper-complexing capability gives it unique activity profiles of interest in extracellular matrix research.",
      "In vitro research has examined GHK-Cu in contexts of collagen and glycosaminoglycan synthesis models, antioxidant response assays, wound-healing signaling cascades, and anti-inflammatory gene expression studies.",
      "Supplied as lyophilized powder. Protect from light during storage and handling. For research use only.",
    ],
    compoundData: [
      { label: "Sequence",         value: "Gly-His-Lys (copper(II) chelate)" },
      { label: "Molecular Weight", value: "340.38 Da (free peptide)" },
      { label: "CAS Number",       value: "49557-75-7" },
      { label: "Form",             value: "Lyophilized Powder (blue-green)" },
      { label: "Purity",           value: "≥98% (HPLC)" },
      { label: "Storage",          value: "-20 °C — protect from light" },
      { label: "Reconstitution",   value: "Sterile or bacteriostatic water" },
    ],
  },

  // ── Muscle Growth ────────────────────────────────────────────────────────────
  "cjc-1295": {
    overview: [
      "CJC-1295 / IPA is a research blend combining CJC-1295 (a GHRH analogue with Drug Affinity Complex technology) and Ipamorelin (a selective GH secretagogue). Together they are studied for synergistic effects on pulsatile GH release kinetics in preclinical models.",
      "CJC-1295 provides extended half-life via albumin binding, while Ipamorelin selectively stimulates GH release without significant cortisol or prolactin elevation in research assays. The combination is used in IGF-1 axis modulation and body composition signaling studies.",
      "Supplied as lyophilized powder. Reconstitute in BAC Water or sterile water. For research use only.",
    ],
    compoundData: [
      { label: "Components",        value: "CJC-1295 (DAC) + Ipamorelin" },
      { label: "CJC-1295 MW",       value: "~3,647.28 Da" },
      { label: "Ipamorelin MW",     value: "~711.86 Da" },
      { label: "CJC-1295 CAS",      value: "863288-34-0" },
      { label: "Ipamorelin CAS",    value: "170851-70-4" },
      ...PEPTIDE_BASE,
    ],
  },
  "tesamorelin": {
    overview: [
      "Tesamorelin (TESA) is a synthetic analogue of endogenous Growth Hormone-Releasing Factor (GHRF 1-44) stabilized with a trans-3-hexenoic acid modification at the N-terminus that improves resistance to dipeptidyl peptidase IV degradation in research models.",
      "Research applications include GH axis modulation studies, visceral adipose tissue signaling assays, lipid metabolism pathway research, and pituitary receptor binding kinetics investigations.",
      "Supplied as lyophilized powder. For research use only — not for human consumption.",
    ],
    compoundData: [
      { label: "Modification",     value: "GHRF (1-44) + trans-3-hexenoic acid" },
      { label: "Molecular Weight", value: "5,135.9 Da" },
      { label: "CAS Number",       value: "901758-09-6" },
      { label: "Amino Acids",      value: "44" },
      ...PEPTIDE_BASE,
    ],
  },
  // ── Combos ───────────────────────────────────────────────────────────────────
  "glow-blend": {
    overview: [
      "GLOW Blend is a proprietary multi-peptide research formulation for studies investigating complementary peptide interactions in skin health signaling — including collagen synthesis pathway assays, photoprotection biomarker analysis, and barrier function research models.",
      "Each component is independently validated for purity (≥98% HPLC) prior to co-lyophilization. The lyophilized format preserves individual peptide integrity during storage and shipping.",
      "Reconstitute in sterile or bacteriostatic water per your laboratory protocol. For research use only.",
    ],
    compoundData: [
      ...BLEND_BASE,
      { label: "Research Focus", value: "Skin signaling, collagen synthesis, photoprotection" },
    ],
  },
  "klow-blend": {
    overview: [
      "KLOW Blend is a proprietary research formulation combining peptides investigated for synergistic activity in metabolic signaling, cellular homeostasis assays, and adipokine pathway modulation studies in vitro.",
      "The blend is formulated via co-lyophilization to ensure uniform distribution of components per dosage unit. Each batch is HPLC-verified for individual component purity before release.",
      "For research use only. Not intended for human or animal consumption.",
    ],
    compoundData: [
      ...BLEND_BASE,
      { label: "Research Focus", value: "Metabolic signaling, cellular homeostasis" },
    ],
  },
  "wolverine-blend": {
    overview: [
      "Wolverine Blend is a multi-peptide research formulation studied in models of accelerated tissue repair biomarkers, anti-inflammatory signaling cascades, and cellular recovery pathway characterization.",
      "The formulation targets multiple repair-associated receptor systems simultaneously — useful for researchers studying pathway crosstalk in tissue regeneration models. Components are co-lyophilized for stability.",
      "Reconstitute in BAC Water or sterile water. Store at -20 °C. For research use only.",
    ],
    compoundData: [
      ...BLEND_BASE,
      { label: "Research Focus", value: "Tissue repair, anti-inflammatory signaling" },
    ],
  },
  // ── Essentials ───────────────────────────────────────────────────────────────
  "nad-plus": {
    overview: [
      "NAD+ (Nicotinamide Adenine Dinucleotide) is a critical coenzyme found in all living cells, functioning as an electron carrier in metabolic redox reactions and as a substrate for enzymes involved in cellular signaling and DNA repair.",
      "Research applications include studies on sirtuin (SIRT1–SIRT7) activation pathways, PARP-1 dependent DNA repair assays, mitochondrial biogenesis pathway investigations, and NAD+-dependent metabolism in aging models.",
      "Supplied as lyophilized powder. Store at -20 °C protected from light. For research use only.",
    ],
    compoundData: [
      { label: "Full Name",         value: "Nicotinamide Adenine Dinucleotide (oxidized)" },
      { label: "Molecular Formula", value: "C21H27N7O14P2" },
      { label: "Molecular Weight",  value: "663.43 Da" },
      { label: "CAS Number",        value: "53-84-9" },
      { label: "Form",              value: "Lyophilized Powder" },
      { label: "Purity",            value: "≥98% (HPLC)" },
      { label: "Storage",           value: "-20 °C — protect from light, desiccate" },
      { label: "Reconstitution",    value: "Sterile water or PBS" },
    ],
  },
  "bac-water": {
    overview: [
      "Bacteriostatic Water is a 0.9% benzyl alcohol solution in sterile water for injection (WFI grade). The benzyl alcohol preservative allows multi-dose use from a single vial without microbial contamination risk — making it the standard solvent for peptide reconstitution in laboratory settings.",
      "It maintains compatibility with the majority of research-grade lyophilized peptides at physiological pH ranges, and is supplied in sealed multi-dose vials with rubber stoppers for use with standard laboratory syringes.",
      "For research and laboratory use only. Not for human or animal injection. Use under appropriate aseptic technique.",
    ],
    compoundData: [
      { label: "Composition",  value: "Sterile Water for Injection USP + 0.9% Benzyl Alcohol" },
      { label: "Grade",        value: "Research / WFI-grade" },
      { label: "pH",           value: "4.5 – 7.0 (approx.)" },
      { label: "Preservative", value: "0.9% Benzyl Alcohol (bacteriostatic)" },
      { label: "Container",    value: "Multi-dose vial with rubber stopper" },
      { label: "Storage",      value: "Room temperature — keep sealed until use" },
    ],
  },
};

const FALLBACK_DETAIL: ProductDetail = {
  overview: [
    "Research-grade compound formulated for in vitro and preclinical laboratory research applications. Supplied as lyophilized powder unless otherwise specified.",
    "Each batch is verified for identity and purity prior to release. Certificates of Analysis are available on request.",
  ],
  compoundData: [
    { label: "Form",            value: "Lyophilized Powder" },
    { label: "Purity",         value: "≥98% (HPLC)" },
    { label: "Storage",        value: "-20 °C — desiccate" },
    { label: "Reconstitution", value: "Sterile or bacteriostatic water" },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function OverviewTab({ detail }: { detail: ProductDetail }) {
  return (
    <div className="max-w-2xl space-y-5">
      {detail.overview.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-zinc-600">{p}</p>
      ))}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold leading-relaxed text-amber-700">
          ⚠ {DISCLAIMER}
        </p>
      </div>
    </div>
  );
}

function CompoundTab({ detail }: { detail: ProductDetail }) {
  return (
    <div className="max-w-lg">
      <div className="overflow-hidden rounded-2xl border-2 border-zinc-200 bg-zinc-50">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/8">
            <FlaskConical size={16} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900">Compound Data</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Research Grade · For Laboratory Use Only
            </p>
          </div>
        </div>

        {/* Data rows */}
        <ul className="divide-y divide-zinc-200">
          {detail.compoundData.map((row, i) => (
            <li key={i} className="flex items-start justify-between gap-6 px-5 py-3">
              <span className="shrink-0 text-sm text-zinc-500">{row.label}</span>
              <span className="text-right text-sm font-semibold text-zinc-900">{row.value}</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="border-t border-zinc-200 bg-white px-5 py-3">
          <p className="text-[11px] leading-relaxed text-zinc-400">
            All specifications verified per lot. Certificate of Analysis available on request.
          </p>
        </div>
      </div>
    </div>
  );
}

function ShippingTab() {
  const rates = [
    { method: "Standard (3–5 days)",         price: "Free over $200, else $9.99" },
    { method: "Expedited (2 days)",           price: "$12.99" },
    { method: "Overnight (next business day)", price: "$24.99" },
    { method: "International",               price: "Calculated at checkout" },
  ];
  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold text-zinc-900">Shipping Rates</h3>
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          {rates.map((r, i) => (
            <div key={i} className="flex items-center justify-between border-b border-zinc-100 px-4 py-3.5 last:border-b-0">
              <span className="text-sm text-zinc-600">{r.method}</span>
              <span className="text-sm font-semibold text-zinc-900">{r.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
          <Thermometer size={14} className="text-accent" /> Packaging
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600">
          All lyophilized peptides ship with a desiccant pack inside an insulated mailer to maintain
          compound integrity in transit. Tracking is emailed within 1 hour of dispatch.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
          <Beaker size={14} className="text-accent" /> Sales Policy
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600">
          All sales are final. We do not accept returns or exchanges. If you received a damaged or
          incorrect item, contact{" "}
          <a href="mailto:peptobuy@gmail.com" className="text-accent underline underline-offset-2 hover:no-underline">
            peptobuy@gmail.com
          </a>{" "}
          within 48 hours of delivery with photos of the issue.
        </p>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

type TabId = "overview" | "compound" | "shipping";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "compound", label: "Compound Data" },
  { id: "shipping", label: "Shipping & Policy" },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const detail = PRODUCT_DETAILS[product.id] ?? FALLBACK_DETAIL;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-zinc-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "shrink-0 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "border-accent text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === "overview"  && <OverviewTab detail={detail} />}
        {activeTab === "compound"  && <CompoundTab detail={detail} />}
        {activeTab === "shipping"  && <ShippingTab />}
      </div>
    </div>
  );
}
