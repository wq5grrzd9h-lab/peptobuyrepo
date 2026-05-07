import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Microscope,
  Droplets,
  ShieldCheck,
  Beaker,
  Scale,
  FlaskConical,
  ArrowRight,
  BadgeCheck,
  Eye,
  Truck,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — PeptoBuy",
  description:
    "Research-grade peptides for qualified scientists. Learn about PeptoBuy's testing process, sourcing standards, and commitment to COA transparency.",
};

// ─── Quality Control steps ─────────────────────────────────────────────────────

const QC_STEPS = [
  {
    icon: Activity,
    title: "HPLC Purity Analysis",
    threshold: "≥99% Required",
    body: "Reverse-phase C18 HPLC with UV detection at 220 nm measures purity by peak area normalization. Standard industry threshold is ≥98% — we require ≥99% before any batch enters inventory.",
  },
  {
    icon: Microscope,
    title: "Mass Spectrometry",
    threshold: "Identity Confirmed",
    body: "Electrospray ionization MS (ESI-MS) or MALDI-TOF confirms the molecular ion peak matches the theoretical m/z of the target compound within 0.1 Da. Sequence confirmation applied to all multi-residue peptides.",
  },
  {
    icon: Droplets,
    title: "Endotoxin Testing (LAL)",
    threshold: "<1 EU/mg Required",
    body: "Kinetic Turbidimetric Limulus Amebocyte Lysate (LAL) assay per USP ‹85›. Endotoxin contamination would confound both in vitro and in vivo results. All batches must measure below 1 EU/mg of product.",
  },
  {
    icon: ShieldCheck,
    title: "Sterility Verification",
    threshold: "USP ‹71› Compliant",
    body: "Membrane filtration sterility testing per USP ‹71›. Applied to all lyophilized peptide compounds and BAC Water lots — required for any product intended for reconstitution in laboratory settings.",
  },
  {
    icon: Beaker,
    title: "Heavy Metal Screening",
    threshold: "<20 ppm Total",
    body: "ICP-MS (Inductively Coupled Plasma Mass Spectrometry) screens each batch for lead, arsenic, cadmium, and mercury. Total heavy metals must be below 20 ppm per USP ‹232› elemental impurities guidelines.",
  },
  {
    icon: Scale,
    title: "Quantity Verification",
    threshold: "±2% Tolerance",
    body: "Gravimetric analysis confirms that each vial contains the stated peptide mass within a ±2% tolerance. Prevents short-fills that would compromise dose-response reproducibility across experimental replicates.",
  },
];

// ─── Sourcing trust items ──────────────────────────────────────────────────────

const SOURCING_ITEMS = [
  { icon: FlaskConical, label: "cGMP-compliant synthesis" },
  { icon: CheckCircle2, label: "SPPS methodology" },
  { icon: ShieldCheck,  label: "ISO 9001 supply chain" },
  { icon: BadgeCheck,   label: "Third-party release criteria" },
  { icon: Truck,        label: "Cold-chain dispatch" },
  { icon: Eye,          label: "Full batch traceability" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div>

      {/* ── 1. Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-white">
        {/* Subtle top accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.26em] text-accent">
            Research-Grade Peptides · Since 2021
          </p>
          <h1 className="mb-6 max-w-4xl text-5xl font-black leading-[1.04] tracking-tight text-zinc-900 sm:text-6xl lg:text-[80px]">
            Built for the Lab.
            <br />
            <span className="text-accent">Not the Shelf.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-500">
            PeptoBuy supplies research institutions, independent laboratories, and
            qualified investigators with independently verified peptide compounds —
            batch-tested, COA-published, and dispatched within 24 hours.
          </p>
        </div>
      </section>

      {/* ── 2. Mission ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">

            {/* Left: large statement */}
            <div className="flex flex-col justify-center">
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                Our Mission
              </p>
              <blockquote className="text-3xl font-black leading-snug tracking-tight text-zinc-900 sm:text-4xl">
                &ldquo;Research integrity starts with compound integrity.&rdquo;
              </blockquote>
              <p className="mt-8 text-sm leading-relaxed text-zinc-500">
                A peptide compound is only as useful as it is accurate. We exist to
                eliminate the variable of compound quality from your experimental design.
              </p>
            </div>

            {/* Right: paragraphs */}
            <div className="flex flex-col justify-center gap-5 text-sm leading-relaxed text-zinc-600">
              <p>
                We serve a precise audience: research institutions, contract research
                organizations (CROs), independent investigators, and qualified laboratory
                professionals conducting in vitro and preclinical research. Every compound
                in our catalog is formulated, tested, and supplied with this context in
                mind — not consumer retail.
              </p>
              <p>
                In peptide research, compound variability is not a minor inconvenience —
                it is a confound. Impurities, incorrect identity, or mislabeled quantities
                can invalidate assay results, corrupt dose-response data, and waste months
                of work. We take this seriously. Our acceptance specifications are stricter
                than industry defaults, and we do not ship batches that fail any single
                criterion.
              </p>
              <p>
                Our commitment to transparency is unconditional. We do not publish summary
                data or representative COAs. Every batch receives its own independent
                analysis, and the full report — chromatogram, mass spectrum, endotoxin
                result, and sterility data — is posted on the product page before the
                batch ships.
              </p>
              <p>
                All sales are final. We stand behind the quality of every product we
                dispatch. If you receive a batch that does not match its published COA,
                <a href="mailto:peptobuy@gmail.com" className="text-accent underline underline-offset-2 hover:no-underline">contact us</a> within 48 hours and we will resolve it without exception.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Quality Control ──────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="mb-4 text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              Quality Control
            </p>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Six-Stage Verification
            </h2>
            <p className="mt-4 text-sm text-zinc-500">
              Zero batches ship without passing every stage. No exceptions.
            </p>
          </div>

          {/* Required-to-pass bar */}
          <div className="mx-auto mb-12 mt-8 flex max-w-lg items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
            <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-800">
              All six stages are mandatory. Failure at any stage = batch rejected.
            </p>
          </div>

          {/* QC grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {QC_STEPS.map(({ icon: Icon, title, threshold, body }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                {/* Icon + verified badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/8">
                    <Icon size={20} className="text-accent" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                    <CheckCircle2 size={10} />
                    Lab Verified
                  </span>
                </div>

                {/* Title + threshold */}
                <div>
                  <h3 className="mb-1 text-sm font-black text-zinc-900">{title}</h3>
                  <span className="inline-block rounded-md bg-accent/8 px-2 py-0.5 text-[11px] font-bold text-accent">
                    {threshold}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[13px] leading-relaxed text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. COA Transparency ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

            {/* Left */}
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                COA Transparency
              </p>
              <h2 className="mb-6 text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-4xl">
                Every batch.
                <br />
                Every result.
                <br />
                <span className="text-accent">Published.</span>
              </h2>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200">
                {[
                  { val: "Batch-specific", sub: "COA per lot, not per product" },
                  { val: "ISO 17025",      sub: "Third-party lab accreditation" },
                  { val: "Pre-shipment",   sub: "Published before dispatch" },
                  { val: "Full report",    sub: "Chromatogram + MS data included" },
                ].map(({ val, sub }) => (
                  <div key={val} className="flex flex-col gap-1 bg-white px-5 py-5">
                    <p className="text-base font-black text-zinc-900">{val}</p>
                    <p className="text-[11px] text-zinc-400">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div className="flex flex-col justify-center gap-5 text-sm leading-relaxed text-zinc-600">
              <p>
                Most peptide suppliers publish a &ldquo;representative&rdquo; COA — a single
                test result applied across an entire production run. We do not operate
                this way. Every individual batch receives its own independent analysis at
                an ISO 17025-accredited third-party laboratory.
              </p>
              <p>
                The full report — including raw HPLC chromatogram data, mass spectrum
                confirming molecular identity, LAL endotoxin result, sterility testing
                outcome, and ICP-MS heavy metal panel — is published on the corresponding
                product page before the batch ships. Every COA includes the batch number,
                manufacture date, expiry date, and the testing laboratory&apos;s report
                reference number.
              </p>
              <p>
                You can verify the data before you order. Every COA is publicly
                accessible on each product detail page. If a batch COA is pending (rare,
                during rapid restocking), we publish an explicit &ldquo;Pending&rdquo; status
                and hold shipment until testing is complete.
              </p>
              <Link
                href="/shop"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:text-zinc-900"
              >
                Browse product COAs <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Sourcing ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              Sourcing &amp; Manufacturing
            </p>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Where compounds come from.
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-5 text-sm leading-relaxed text-zinc-600">
              <p>
                All peptide compounds in the PeptoBuy catalog are synthesized via
                solid-phase peptide synthesis (SPPS) at cGMP-compliant contract
                manufacturing facilities. Raw material amino acid precursors are sourced
                from ISO 9001-certified suppliers with documented chain of custody from
                raw material to finished product.
              </p>
              <p>
                Manufacturing is performed under controlled environmental conditions
                with documented batch records and in-process quality checks at each
                synthesis stage. Finished product is lyophilized under validated
                conditions, filled into sealed multi-dose vials with inert gas
                backfill, and stored at −20 °C prior to dispatch.
              </p>
              <p>
                Third-party verification is not optional in our process — it is the
                final release criterion. No batch enters inventory until the independent
                COA is received, reviewed against specifications, and confirmed to meet
                all acceptance criteria. Batches that fail any specification are
                discarded. Retest is not offered as a release pathway.
              </p>
            </div>

            {/* Sourcing trust grid */}
            <div className="grid grid-cols-2 gap-4 self-start">
              {SOURCING_ITEMS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 shadow-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/8">
                    <Icon size={15} className="text-accent" />
                  </div>
                  <span className="text-[13px] font-semibold text-zinc-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CTA ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,45,120,0.05) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Place an Order
          </p>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
            Ready to stock your lab?
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-zinc-500">
            Every compound in our catalog is available for immediate dispatch.
            Certificate of Analysis provided with every order.
            Orders over $250 ship free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(255,45,120,0.22)] transition-all hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(255,45,120,0.35)] active:scale-[0.98]"
            >
              Browse Compounds <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop?category=combos"
              className="flex items-center gap-2 rounded-xl border border-zinc-200 px-7 py-3.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
            >
              View Blends &amp; Combos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
