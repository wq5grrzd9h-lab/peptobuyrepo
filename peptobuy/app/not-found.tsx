import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Giant background 404 */}
      <span aria-hidden className="pointer-events-none absolute select-none font-black text-zinc-950/[0.04]" style={{ fontSize: "clamp(120px, 30vw, 320px)", lineHeight: 1 }}>
        404
      </span>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,45,120,0.06) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col items-center gap-5">
        <Link href="/" className="text-2xl font-black tracking-tight">
          <span className="text-zinc-900">Pepto</span><span className="text-accent">Buy</span>
        </Link>
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Error 404</p>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">This page doesn&apos;t exist.</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">The page you&apos;re looking for may have been moved, deleted, or never existed. Let&apos;s get you back on track.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.3)]">
            Browse Shop <ArrowRight size={15} />
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900">
            <Home size={15} /> Go Home
          </Link>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {[
            { label: "Weight Loss", href: "/shop?category=Weight+Loss" },
            { label: "Recovery & Healing", href: "/shop?category=Recovery+%26+Healing" },
            { label: "Muscle Growth", href: "/shop?category=Muscle+Growth" },
            { label: "Combos", href: "/shop?category=Combos" },
            { label: "Essentials", href: "/shop?category=Essentials" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700">{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
