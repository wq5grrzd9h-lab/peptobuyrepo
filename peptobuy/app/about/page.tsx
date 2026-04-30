import type { Metadata } from "next";
import Link from "next/link";
import {
  FlaskConical,
  ShieldCheck,
  Eye,
  Zap,
  Award,
  HeartHandshake,
  Truck,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — PeptoBuy",
  description:
    "We believe elite-grade supplementation should be accessible to every serious athlete. Learn our story.",
};

const VALUES = [
  {
    icon: FlaskConical,
    title: "Science-Backed",
    body: "Every formula is grounded in peer-reviewed research. No trend-chasing, no proprietary pixie-dust blends — just ingredients at doses the data actually supports.",
  },
  {
    icon: ShieldCheck,
    title: "Lab Verified",
    body: "Every batch is tested by an ISO-17025 accredited third-party lab for identity, purity, and potency before it ships. Certificates of Analysis available on request.",
  },
  {
    icon: Eye,
    title: "Radically Transparent",
    body: "Full ingredient disclosure, every time. You'll never see a proprietary blend on our label. If we put it in the formula, you'll know exactly how much.",
  },
];

const WHY_US = [
  { icon: FlaskConical, label: "No proprietary blends" },
  { icon: ShieldCheck, label: "Third-party lab tested" },
  { icon: Award, label: "Clinically dosed formulas" },
  { icon: HeartHandshake, label: "30-day money-back guarantee" },
  { icon: Truck, label: "Same-day shipping before 3 PM" },
  { icon: Zap, label: "No artificial dyes or fillers" },
];

const STATS = [
  { value: "12,000+", label: "Athletes served" },
  { value: "50+", label: "Products" },
  { value: "99%", label: "Purity rate" },
  { value: "4.9★", label: "Average rating" },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Pink glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,45,120,0.15) 0%, transparent 65%)",
          }}
        />
        {/* Grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-accent">
            Since 2021 · Austin, TX
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Built for athletes who won&apos;t{" "}
            <span className="text-accent">compromise.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/50">
            PeptoBuy started in a garage gym in Austin because we were tired of
            buying supplements that hid behind proprietary blends and inflated
            claims. We built what we wanted to use ourselves.
          </p>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                Our Mission
              </p>
              <blockquote className="text-2xl font-black leading-snug tracking-tight text-white sm:text-3xl">
                &ldquo;Make elite-grade supplementation accessible to every
                serious athlete — without the smoke and mirrors.&rdquo;
              </blockquote>
            </div>

            <div className="flex flex-col justify-center gap-5">
              <p className="text-sm leading-relaxed text-white/55">
                The supplement industry has a transparency problem. Proprietary
                blends hide underdosed ingredients. Marketing dollars replace
                research budgets. Flashy branding obscures what&apos;s actually
                inside the tub.
              </p>
              <p className="text-sm leading-relaxed text-white/55">
                We exist to be the alternative. Every ingredient is disclosed.
                Every dose is backed by peer-reviewed research. Every batch is
                tested before it ships. No exceptions, no excuses.
              </p>
              <p className="text-sm leading-relaxed text-white/55">
                If you can&apos;t read the label and know exactly what you&apos;re
                getting, it&apos;s not PeptoBuy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────── */}
      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              What We Stand For
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Our core values
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2 p-7 transition-all duration-200 hover:border-accent/30 hover:shadow-[0_0_24px_rgba(255,45,120,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                  <Icon size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 px-6 py-12 text-center">
                <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {value}
                </span>
                <span className="text-sm text-white/40">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ───────────────────────────────────────── */}
      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              The difference
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Why PeptoBuy?
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/45">
              There are thousands of supplement brands. Here&apos;s what makes us
              different — and why 12,000+ athletes keep coming back.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_US.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 px-5 py-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Icon size={17} className="text-accent" />
                </div>
                <span className="text-sm font-semibold text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,45,120,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Join Us
          </p>
          <h2 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Ready to take the next step?
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-white/45">
            Browse our full catalog of clinically dosed supplements, or start
            with our most popular products.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.45)]"
            >
              Browse Products <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop/bundles"
              className="flex items-center gap-2 rounded-xl border border-border px-7 py-3.5 text-sm font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white"
            >
              View Bundles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
