import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

// Intentionally dark section for visual contrast within the light theme.
export default function CTABanner() {
  return (
    <section className="relative overflow-hidden border-y border-zinc-800 bg-zinc-950 py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,45,120,0.14) 0%, transparent 70%)" }}
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5">
          <Zap size={12} className="text-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Limited Time</span>
        </div>

        <h2 className="mb-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ready to perform <span className="text-accent">at your best?</span>
        </h2>

        <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/55">
          Use code{" "}
          <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-sm font-bold text-accent">FIRST10</span>
          {" "}at checkout and get 10% off your first order. Free shipping included.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop"><Button size="lg">Shop Now <ArrowRight size={16} /></Button></Link>
          <Link href="/shop?category=Combos"><Button variant="outline" size="lg">Explore Combos</Button></Link>
        </div>
      </div>
    </section>
  );
}
