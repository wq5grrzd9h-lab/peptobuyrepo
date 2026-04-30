import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Giant background 404 */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none font-black text-white/[0.03]"
        style={{ fontSize: "clamp(120px, 30vw, 320px)", lineHeight: 1 }}
      >
        404
      </span>

      {/* Pink glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,45,120,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-5">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tight">
          <span className="text-white">Pepto</span>
          <span className="text-accent">Buy</span>
        </Link>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Error 404
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            This page doesn&apos;t exist.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/45">
            The page you&apos;re looking for may have been moved, deleted, or never
            existed. Let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.25)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.4)]"
          >
            Browse Shop <ArrowRight size={15} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white"
          >
            <Home size={15} /> Go Home
          </Link>
        </div>

        {/* Quick category links */}
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {["Supplements", "Recovery", "Bundles", "Essentials"].map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${cat}`}
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-white/35 transition-colors hover:border-white/20 hover:text-white/70"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
