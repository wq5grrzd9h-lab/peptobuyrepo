import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[640px] overflow-hidden">

      {/* ── Full-bleed background image ─────────────────────────── */}
      <Image
        src="/products/New peptobuy main background.png"
        alt="PeptoBuy research peptides"
        fill
        priority
        className="object-cover"
      />

      {/* ── Left-side gradient overlay for text readability ─────── */}
      {/* Solid white on far left, fades to transparent at ~55% width */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(250,250,248,1) 0%, rgba(250,250,248,0.96) 25%, rgba(250,250,248,0.82) 38%, rgba(250,250,248,0.40) 52%, rgba(250,250,248,0) 62%)",
        }}
      />

      {/* ── Text content — left-aligned, vertically centered ───── */}
      <div className="relative z-10 flex h-full max-w-[52%] flex-col justify-center px-8 py-16 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">

        {/* Brand wordmark */}
        <div className="mb-12">
          <PeptoBuyLogo layout="horizontal" flaskH={36} />
        </div>

        {/* Eyebrow */}
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-7 shrink-0 bg-accent" />
          <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            Research Grade Peptides
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mb-7 font-black leading-[1.03] tracking-tight text-zinc-900"
          style={{ fontSize: "clamp(2.6rem, 4.5vw, 5rem)" }}
        >
          Precision.
          <br />
          Purity.
          <br />
          <span className="text-accent">For&nbsp;the&nbsp;lab.</span>
        </h1>

        {/* Sub-headline */}
        <p className="mb-10 max-w-[300px] text-[15px] leading-relaxed text-zinc-600">
          Every batch independently tested. COA available on request.
          Ships promptly.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(255,45,120,0.30)] transition-all hover:bg-accent-hover hover:shadow-[0_0_40px_rgba(255,45,120,0.44)] active:scale-[0.98]"
          >
            Browse Compounds <ArrowRight size={15} />
          </Link>
        </div>

        {/* Stat strip */}
        <div className="mt-12 flex items-start gap-8 border-t border-zinc-300/60 pt-8">
          {(
            [
              { val: "≥98%", sub: "Avg. Purity" },
              { val: "Fast", sub: "Dispatch"   },
              { val: "COA",  sub: "On Request"  },
            ] as const
          ).map(({ val, sub }) => (
            <div key={sub}>
              <p className="text-[1.4rem] font-black text-zinc-900">{val}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                {sub}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
