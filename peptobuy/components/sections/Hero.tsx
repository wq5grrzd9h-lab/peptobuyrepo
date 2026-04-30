import Link from "next/link";
import { ArrowRight, CheckCircle2, Truck, Shield, FlaskConical } from "lucide-react";
import Button from "@/components/ui/Button";

const TRUST_PILLS = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: FlaskConical, label: "99% Purity" },
  { icon: Shield, label: "30-Day Guarantee" },
  { icon: CheckCircle2, label: "Lab Tested" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-center overflow-hidden">
      {/* Background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -5%, rgba(255,45,120,0.18) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/40 to-transparent"
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-3.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Performance Supplements
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[82px]">
          Quality you can{" "}
          <span className="relative whitespace-nowrap">
            trust.
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-accent"
            />
          </span>
          <br />
          <span className="text-accent">Delivered fast.</span>
        </h1>

        {/* Subheadline */}
        <p className="mb-10 max-w-xl text-lg leading-relaxed text-white/50">
          Clinically dosed, third-party tested supplements — formulated for
          athletes who refuse to compromise.
        </p>

        {/* CTAs */}
        <div className="mb-14 flex flex-wrap items-center gap-3">
          <Link href="/shop">
            <Button size="lg">
              Shop Now <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/shop?filter=best-sellers">
            <Button variant="outline" size="lg">
              View Best Sellers
            </Button>
          </Link>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap gap-3">
          {TRUST_PILLS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-border bg-surface-1/80 px-4 py-2 text-sm backdrop-blur-sm"
            >
              <Icon size={14} className="text-accent" />
              <span className="font-medium text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
      />
    </section>
  );
}
