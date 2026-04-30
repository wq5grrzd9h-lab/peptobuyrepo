"use client";

import { useState } from "react";
import { Product } from "@/lib/products";
import { Star, BadgeCheck } from "lucide-react";

// ─── Per-product copy ─────────────────────────────────────────────────────────

interface ProductDetail {
  description: string[];
  servingSize: string;
  servingsPerContainer: number;
  ingredients: { label: string; amount: string; dv?: string }[];
  otherIngredients: string;
}

const PRODUCT_DETAILS: Record<string, ProductDetail> = {
  p1: {
    description: [
      "Our Whey Protein Isolate undergoes cross-flow microfiltration to produce a near-pure protein source — stripped of excess lactose, fat, and carbohydrates that slow recovery and cause bloating.",
      "Each scoop delivers 27g of complete protein with a fully intact essential amino acid profile, including elevated leucine levels to trigger muscle protein synthesis faster than whole-food sources alone.",
      "Unlike concentrate-based formulas that sit at ~70% protein by weight, this isolate maintains over 90% protein density per serving. It mixes instantly in a shaker cup or a glass of water — no blender, no clumping.",
    ],
    servingSize: "1 Scoop (33g)",
    servingsPerContainer: 30,
    ingredients: [
      { label: "Calories", amount: "130" },
      { label: "Protein", amount: "27g", dv: "54%" },
      { label: "Total Carbohydrate", amount: "3g", dv: "1%" },
      { label: "Total Fat", amount: "1.5g", dv: "2%" },
      { label: "Cholesterol", amount: "20mg", dv: "7%" },
      { label: "Sodium", amount: "125mg", dv: "5%" },
      { label: "Calcium", amount: "120mg", dv: "10%" },
    ],
    otherIngredients: "Whey Protein Isolate, Sunflower Lecithin, Natural Flavors, Sea Salt.",
  },
  p2: {
    description: [
      "Creatine monohydrate is the most researched performance supplement in sports science. After 40+ years of peer-reviewed study, the verdict is clear: it works, and it's safe.",
      "Our pharmaceutical-grade creatine is sourced from Creapure® — the gold standard of purity, manufactured in Germany under ISO-certified conditions. It's micronized for faster dissolution and absorption.",
      "5g per day saturates your muscle creatine stores within 3–4 weeks, increasing phosphocreatine availability for ATP resynthesis during explosive, high-intensity efforts. Take it daily, with or without food. No loading phase required.",
    ],
    servingSize: "1 Teaspoon (5g)",
    servingsPerContainer: 60,
    ingredients: [
      { label: "Creatine Monohydrate (Creapure®)", amount: "5000mg" },
    ],
    otherIngredients: "Pure Creatine Monohydrate (Creapure®). No fillers, no additives, no flow agents.",
  },
  p3: {
    description: [
      "Magnesium deficiency affects an estimated 50% of the population — and athletes, who lose magnesium through sweat, are even more susceptible. Low levels impair sleep quality, recovery, and neuromuscular function.",
      "We chose the glycinate form because glycine acts as a chelating agent, dramatically improving absorption over cheaper oxide or citrate forms. Glycinate also doesn't cause the laxative effect associated with magnesium oxide.",
      "Take 2 capsules 30–60 minutes before bed. Most users report noticeably deeper sleep within the first week of consistent use.",
    ],
    servingSize: "2 Capsules",
    servingsPerContainer: 60,
    ingredients: [
      { label: "Magnesium (as Bisglycinate Chelate)", amount: "400mg", dv: "95%" },
      { label: "Glycine", amount: "320mg" },
    ],
    otherIngredients: "Vegetable Cellulose (capsule), Magnesium Stearate (vegetable source). Vegan.",
  },
  p4: {
    description: [
      "The Recovery Pro Bundle combines three clinically validated supplements into one complete post-training stack: Magnesium Glycinate, Omega-3 Fish Oil, and Zinc-B6 Complex.",
      "Magnesium supports deep sleep and reduces muscle cramping. Omega-3s reduce systemic inflammation and joint soreness. Zinc-B6 boosts testosterone production and immune function — all of which drop significantly after intense training sessions.",
      "Taken together nightly, this stack addresses the primary recovery bottlenecks for serious athletes. You save 25% versus purchasing each product individually.",
    ],
    servingSize: "As directed per product",
    servingsPerContainer: 30,
    ingredients: [
      { label: "Magnesium (as Bisglycinate Chelate)", amount: "400mg", dv: "95%" },
      { label: "EPA (Eicosapentaenoic Acid)", amount: "600mg" },
      { label: "DHA (Docosahexaenoic Acid)", amount: "400mg" },
      { label: "Zinc (as Zinc Gluconate)", amount: "15mg", dv: "136%" },
      { label: "Vitamin B6 (as Pyridoxine HCl)", amount: "10mg", dv: "588%" },
    ],
    otherIngredients: "Fish Gelatin (softgel), Vegetable Cellulose (capsule), Purified Fish Oil.",
  },
  p5: {
    description: [
      "Not all fish oil is equal. Ours is sourced exclusively from wild-caught anchovies and sardines — small, short-lived species with minimal heavy metal accumulation — then molecularly distilled to remove any trace contaminants.",
      "Each serving provides 1,400mg of total omega-3 fatty acids, including 600mg EPA and 400mg DHA. EPA reduces inflammation; DHA supports brain structure and cardiovascular function. Every batch is third-party verified through Labdoor.",
      "Enteric-coated softgels prevent oxidation and eliminate fish burp entirely. Refrigerate after opening for maximum freshness and potency.",
    ],
    servingSize: "2 Softgels",
    servingsPerContainer: 60,
    ingredients: [
      { label: "Total Omega-3 Fatty Acids", amount: "1400mg" },
      { label: "EPA (Eicosapentaenoic Acid)", amount: "600mg" },
      { label: "DHA (Docosahexaenoic Acid)", amount: "400mg" },
      { label: "Other Omega-3s", amount: "400mg" },
    ],
    otherIngredients: "Fish Gelatin, Glycerin, Water, Natural Lemon Flavor. Contains fish (anchovy, sardine).",
  },
  p6: {
    description: [
      "Most pre-workouts are caffeine with proprietary blends that tell you nothing about actual dosing. Ours is fully transparent: every ingredient, every dose, listed on the label. No hiding behind blends.",
      "200mg caffeine anhydrous for clean, sustained energy without the jitter-crash of higher doses. 6g citrulline malate for maximal blood flow and pump. 3.2g beta-alanine for muscular endurance — yes, the tingle (paresthesia) is normal and completely harmless.",
      "No artificial dyes, no sucralose, no proprietary blends. Mix one scoop in 12oz of cold water 20–30 minutes before training.",
    ],
    servingSize: "1 Scoop (12g)",
    servingsPerContainer: 30,
    ingredients: [
      { label: "L-Citrulline Malate (2:1)", amount: "6000mg" },
      { label: "Beta-Alanine (CarnoSyn®)", amount: "3200mg" },
      { label: "L-Tyrosine", amount: "1000mg" },
      { label: "Alpha-GPC (50%)", amount: "300mg" },
      { label: "Caffeine Anhydrous", amount: "200mg" },
    ],
    otherIngredients: "Citric Acid, Natural Flavors, Silicon Dioxide, Malic Acid. No artificial colors.",
  },
  p7: {
    description: [
      "New to supplementation? The Starter Stack eliminates decision fatigue. Three products, proven by decades of research, covering the three most impactful areas for beginners: protein synthesis, cellular energy, and daily micronutrition.",
      "Whey Protein Isolate (27g per scoop) rebuilds muscle after training. Creatine Monohydrate increases strength output and training volume. The Daily Multivitamin fills micronutrient gaps that most people don't know they have.",
      "Follow the included Quick-Start Protocol: creatine and multivitamin with breakfast in the morning, whey immediately post-workout. That's the whole protocol. Simple, evidence-backed, effective.",
    ],
    servingSize: "As directed per product",
    servingsPerContainer: 30,
    ingredients: [
      { label: "Whey Protein Isolate (per scoop)", amount: "27g" },
      { label: "Creatine Monohydrate (per serving)", amount: "5000mg" },
      { label: "Vitamin D3", amount: "1000 IU", dv: "125%" },
      { label: "Vitamin C", amount: "90mg", dv: "100%" },
      { label: "Zinc", amount: "11mg", dv: "100%" },
      { label: "Magnesium", amount: "100mg", dv: "24%" },
    ],
    otherIngredients: "Varies by individual product. All products free from artificial dyes and gluten.",
  },
  p8: {
    description: [
      "Unless you live near the equator and spend significant time outdoors without sunscreen, you're almost certainly deficient in Vitamin D. Deficiency is linked to impaired immunity, low mood, poor sleep quality, and reduced testosterone production.",
      "We pair 5,000 IU of D3 (cholecalciferol — the same form your skin produces) with 100mcg of K2 as MK-7, the most bioavailable K2 isomer. K2 is essential here: it directs calcium into bones and away from arterial walls, preventing the calcification risk associated with high-dose D3 supplementation alone.",
      "Take one softgel daily with a fat-containing meal. D3 is fat-soluble — absorption increases significantly alongside dietary fat. One bottle covers 90 days.",
    ],
    servingSize: "1 Softgel",
    servingsPerContainer: 90,
    ingredients: [
      { label: "Vitamin D3 (as Cholecalciferol)", amount: "5000 IU (125mcg)", dv: "625%" },
      { label: "Vitamin K2 (as MK-7, Menaquinone-7)", amount: "100mcg", dv: "83%" },
    ],
    otherIngredients: "Extra Virgin Olive Oil, Gelatin (bovine), Glycerin, Water.",
  },
};

const FALLBACK_DETAIL: ProductDetail = {
  description: [
    "Premium quality formulated with only the most bioavailable ingredients, sourced from certified suppliers and manufactured in a GMP-certified facility.",
    "Every batch is third-party tested for purity, potency, and the absence of heavy metals, pesticides, and microbiological contaminants.",
  ],
  servingSize: "As directed",
  servingsPerContainer: 30,
  ingredients: [{ label: "Proprietary Blend", amount: "As labeled" }],
  otherIngredients: "See label for full ingredient list.",
};

// ─── Mock reviews ─────────────────────────────────────────────────────────────

const REVIEWS = [
  {
    author: "Marcus J.",
    date: "March 15, 2025",
    rating: 5,
    title: "Exactly what I needed",
    body: "Been using this consistently for about 3 months now and the results have been solid. Quality is noticeably higher than the big-box brands I was buying before. Ships fast, no issues with the packaging. Already on my third order.",
    verified: true,
  },
  {
    author: "Priya S.",
    date: "February 28, 2025",
    rating: 4,
    title: "Solid product, fast shipping",
    body: "Genuinely impressed. The lab reports are available on request — most brands don't offer that level of transparency. Mixing is clean, no aftertaste. Docking one star only because I wish they offered larger size options.",
    verified: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rating ? "fill-accent text-accent" : "fill-transparent text-white/20"}
        />
      ))}
    </div>
  );
}

function DescriptionTab({ detail }: { detail: ProductDetail }) {
  return (
    <div className="max-w-2xl space-y-5">
      {detail.description.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-white/60">
          {p}
        </p>
      ))}
    </div>
  );
}

function DetailsTab({ detail }: { detail: ProductDetail }) {
  return (
    <div className="max-w-lg">
      {/* Supplement facts card */}
      <div className="rounded-2xl border-2 border-border bg-surface-1 p-5">
        <h3 className="mb-1 text-base font-black tracking-tight text-white">
          Supplement Facts
        </h3>
        <p className="mb-4 text-xs text-white/40">
          Serving Size: {detail.servingSize} &nbsp;|&nbsp; Servings Per Container:{" "}
          {detail.servingsPerContainer}
        </p>

        {/* Header row */}
        <div className="mb-2 flex justify-between border-b-2 border-white/15 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Amount Per Serving
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            %DV
          </span>
        </div>

        {/* Ingredient rows */}
        <ul className="divide-y divide-border">
          {detail.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-white/80">{ing.label}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-white">
                  {ing.amount}
                </span>
                {ing.dv && (
                  <span className="ml-3 text-xs text-white/35">{ing.dv}</span>
                )}
                {!ing.dv && (
                  <span className="ml-3 text-xs text-white/20">†</span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Footer note */}
        <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-white/30">
          † Daily Value not established.
          <br />
          <span className="mt-1.5 block">
            <strong className="text-white/40">Other Ingredients:</strong>{" "}
            {detail.otherIngredients}
          </span>
        </p>
      </div>
    </div>
  );
}

function ShippingTab() {
  const rows = [
    { method: "Standard (3–5 days)", price: "Free over $75, else $6.99" },
    { method: "Expedited (2 days)", price: "$12.99" },
    { method: "Overnight (next business day)", price: "$24.99" },
    { method: "International", price: "Calculated at checkout" },
  ];

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-bold text-white">Shipping Rates</h3>
        <div className="overflow-hidden rounded-xl border border-border">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border px-4 py-3.5 last:border-b-0"
            >
              <span className="text-sm text-white/70">{r.method}</span>
              <span className="text-sm font-semibold text-white">{r.price}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Returns & Exchanges</h3>
        <p className="text-sm leading-relaxed text-white/55">
          We stand behind every product we sell. If you&apos;re not satisfied for any
          reason, return within 30 days of delivery for a full refund — even on
          opened products. No restocking fees. Email{" "}
          <a
            href="mailto:support@peptobuy.com"
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            support@peptobuy.com
          </a>{" "}
          to start a return.
        </p>
        <p className="text-sm leading-relaxed text-white/55">
          Orders are processed and shipped from our fulfillment center in
          Austin, TX. Orders placed before 3 PM CST ship the same business day.
          You&apos;ll receive a tracking number via email within 1 hour of shipment.
        </p>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const avgRating = (
    REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length
  ).toFixed(1);

  return (
    <div className="max-w-2xl">
      {/* Summary bar */}
      <div className="mb-8 flex items-center gap-5 rounded-2xl border border-border bg-surface-1 p-5">
        <div className="text-center">
          <p className="text-4xl font-black text-white">{avgRating}</p>
          <Stars rating={Math.round(Number(avgRating))} />
          <p className="mt-1 text-xs text-white/30">{REVIEWS.length} reviews</p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = REVIEWS.filter((r) => r.rating === star).length;
            const pct = (count / REVIEWS.length) * 100;
            return (
              <div key={star} className="flex items-center gap-2.5">
                <span className="w-2 text-right text-[11px] text-white/30">
                  {star}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-4 text-[11px] text-white/30">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-5">
        {REVIEWS.map((review, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface-1 p-5"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Stars rating={review.rating} />
                  {review.verified && (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400/70">
                      <BadgeCheck size={11} />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-white">{review.title}</p>
              </div>
              <div className="text-right text-xs text-white/30 whitespace-nowrap">
                <p>{review.author}</p>
                <p>{review.date}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/55">{review.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

type TabId = "description" | "details" | "shipping" | "reviews";

const TABS: { id: TabId; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "details", label: "Ingredients & Details" },
  { id: "shipping", label: "Shipping & Returns" },
  { id: "reviews", label: `Reviews (${REVIEWS.length})` },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const detail = PRODUCT_DETAILS[product.id] ?? FALLBACK_DETAIL;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "shrink-0 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "border-accent text-white"
                : "border-transparent text-white/40 hover:text-white/70",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {activeTab === "description" && <DescriptionTab detail={detail} />}
        {activeTab === "details" && <DetailsTab detail={detail} />}
        {activeTab === "shipping" && <ShippingTab />}
        {activeTab === "reviews" && <ReviewsTab />}
      </div>
    </div>
  );
}
