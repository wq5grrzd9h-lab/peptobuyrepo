import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";

// ─── Vial avalanche — seeded PRNG, same output on SSR and client ──────────────
interface V { x: number; y: number; sc: number; rot: number }

const PILE: V[] = (() => {
  // Xorshift32
  let s = 0xdeadcafe;
  const rnd = (): number => {
    s = (s ^ (s << 13)) | 0;
    s = (s ^ (s >>> 17)) | 0;
    s = (s ^ (s << 5))  | 0;
    return (s >>> 0) / 4294967296;
  };
  const gauss = (m: number, d: number): number => {
    const u = Math.max(rnd(), 1e-10);
    return m + d * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
  };

  const v: V[] = [];

  // Dense upper-right avalanche source (88 vials)
  for (let i = 0; i < 88; i++) {
    v.push({
      x:  Math.max(290, Math.min(820, gauss(618, 84))),
      y:  Math.max(-60, Math.min(480, gauss(195, 172))),
      sc: 0.33 + rnd() * 0.52,
      rot: (rnd() - 0.5) * 360,
    });
  }

  // Dense lower-right accumulation (96 vials)
  for (let i = 0; i < 96; i++) {
    v.push({
      x:  Math.max(235, Math.min(825, gauss(555, 99))),
      y:  Math.max(415, Math.min(960, gauss(690, 155))),
      sc: 0.39 + rnd() * 0.64,
      rot: (rnd() - 0.5) * 360,
    });
  }

  // Cascade diagonal band connecting source to accumulation (46 vials)
  for (let i = 0; i < 46; i++) {
    const t = rnd();
    v.push({
      x:  Math.max(90,  Math.min(745, 672 - t * 320 + gauss(0, 55))),
      y:  Math.max(0,   Math.min(940, 140 + t * 620 + gauss(0, 50))),
      sc: 0.32 + rnd() * 0.48,
      rot: (rnd() - 0.5) * 360,
    });
  }

  // Scattered stragglers rolling toward center-left (36 vials)
  for (let i = 0; i < 36; i++) {
    v.push({
      x:  Math.max(-30, Math.min(410, gauss(200, 122))),
      y:  Math.max(50,  Math.min(910, gauss(520, 220))),
      sc: 0.52 + rnd() * 0.68,   // larger = closer / foreground
      rot: (rnd() - 0.5) * 360,
    });
  }

  // Sort ascending y → lower y renders first (further back); higher y on top
  return v.sort((a, b) => a.y - b.y);
})();

// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#fafaf8" }}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[40fr_60fr]">

        {/* ════════════════════════════════════════════════════════════
            LEFT — text content (40%)
        ════════════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-14 xl:px-20 2xl:px-24">

          {/* Brand wordmark */}
          <div className="mb-14">
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
            style={{ fontSize: "clamp(2.8rem, 5vw, 5.2rem)" }}
          >
            Precision.
            <br />
            Purity.
            <br />
            <span className="text-accent">For&nbsp;the&nbsp;lab.</span>
          </h1>

          {/* Sub-headline */}
          <p className="mb-10 max-w-[305px] text-[15px] leading-relaxed text-zinc-500">
            Every batch independently tested. COA published.
            Shipped within 24 hours.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(255,45,120,0.30)] transition-all hover:bg-accent-hover hover:shadow-[0_0_40px_rgba(255,45,120,0.44)] active:scale-[0.98]"
            >
              Browse Compounds <ArrowRight size={15} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/70 px-6 py-3.5 text-sm font-semibold text-zinc-600 backdrop-blur-sm transition-all hover:border-zinc-300 hover:bg-white hover:text-zinc-900"
            >
              <FlaskConical size={14} className="shrink-0 text-accent" />
              View Lab Results
            </Link>
          </div>

          {/* Stat strip */}
          <div className="mt-12 flex items-start gap-8 border-t border-zinc-200 pt-8">
            {(
              [
                { val: "≥98%", sub: "Avg. Purity" },
                { val: "24hr", sub: "Dispatch"   },
                { val: "COA",  sub: "Per Batch"  },
              ] as const
            ).map(({ val, sub }) => (
              <div key={sub}>
                <p className="text-[1.4rem] font-black text-zinc-900">{val}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT — vial avalanche (60%)
        ════════════════════════════════════════════════════════════ */}
        <div
          className="relative hidden overflow-hidden lg:block"
          style={{ background: "#fafaf8" }}
        >
          {/*
           * SVG scene: 760 wide × 900 tall
           * Dense pile at upper-right and lower-right,
           * vials cascading diagonally toward center-left,
           * individual stragglers scattered further left.
           */}
          <svg
            viewBox="0 0 760 900"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>

              {/* ── Metallic crimp-cap gradient (neutral silver) ── */}
              <linearGradient id="pv-mc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#747474" />
                <stop offset="14%"  stopColor="#b8b8b8" />
                <stop offset="34%"  stopColor="#dcdcdc" />
                <stop offset="52%"  stopColor="#ebebeb" />
                <stop offset="68%"  stopColor="#d2d2d2" />
                <stop offset="84%"  stopColor="#b4b4b4" />
                <stop offset="100%" stopColor="#787878" />
              </linearGradient>

              {/* ── Flip-off disc radial gradient ── */}
              <radialGradient id="pv-disc" cx="36%" cy="34%" r="58%">
                <stop offset="0%"   stopColor="#d0d0d0" />
                <stop offset="52%"  stopColor="#a4a4a4" />
                <stop offset="100%" stopColor="#828282" />
              </radialGradient>

              {/* ── Glass horizontal shine overlay ── */}
              <linearGradient id="pv-gs" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="white" stopOpacity="0.42" />
                <stop offset="15%"  stopColor="white" stopOpacity="0" />
                <stop offset="85%"  stopColor="black" stopOpacity="0" />
                <stop offset="100%" stopColor="black" stopOpacity="0.07" />
              </linearGradient>

              {/* ── Subtle pink ambient glow around the pile ── */}
              <radialGradient id="pv-glow" cx="80%" cy="50%" r="52%">
                <stop offset="0%"   stopColor="rgba(255,45,120,0.045)" />
                <stop offset="100%" stopColor="rgba(255,45,120,0)"     />
              </radialGradient>

              {/* ── Floor fade: bottom of scene dissolves into bg ── */}
              <linearGradient id="pv-floor" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#fafaf8" stopOpacity="0" />
                <stop offset="100%" stopColor="#fafaf8" stopOpacity="0.88" />
              </linearGradient>

              {/* ── Reflection mask: fades reflection from floor down ── */}
              <linearGradient
                id="pv-rfade"
                x1="0" y1="855" x2="0" y2="900"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
                <stop offset="100%" stopColor="white" stopOpacity="0"    />
              </linearGradient>
              <mask id="pv-rmask">
                <rect x="0" y="855" width="760" height="45" fill="url(#pv-rfade)" />
              </mask>

              {/* ── Drop-shadow for scattered foreground vials ── */}
              <filter id="pv-sh" x="-35%" y="-35%" width="170%" height="170%">
                <feDropShadow
                  dx="0" dy="2.5" stdDeviation="3.5"
                  floodColor="rgba(0,0,0,0.16)"
                />
              </filter>

              {/*
               * ──────────────────────────────────────────────────────
               *  VIAL SYMBOL
               *  Centered at origin.  ViewBox: -11 -22  22 44
               *  → 22 units wide × 44 units tall  (2 : 1 ratio)
               *
               *  Anatomy (y coords):
               *    −22 … −15.5   top crimp cap    (6.5 u)
               *    −15.5 … +15.5 glass body       (31 u)
               *       −7 … +7    pink label       (14 u ≈ 45% of body)
               *    +15.5 … +22   bottom crimp cap  (6.5 u)
               * ──────────────────────────────────────────────────────
               */}
              <symbol id="pv" viewBox="-11 -22 22 44" overflow="visible">

                {/* ── Bottom crimp cap ── */}
                <rect x="-9.5" y="15.5" width="19" height="6.5" rx="2.2" fill="url(#pv-mc)" />
                <line x1="-9.5" y1="17"   x2="9.5" y2="17"   stroke="rgba(255,255,255,0.30)" strokeWidth="0.6" />
                <line x1="-9.5" y1="19"   x2="9.5" y2="19"   stroke="rgba(0,0,0,0.10)" strokeWidth="0.5" />
                <line x1="-9.5" y1="21"   x2="9.5" y2="21"   stroke="rgba(0,0,0,0.08)" strokeWidth="0.45" />
                <rect x="-9.5" y="15.5" width="19" height="6.5" rx="2.2" fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="0.48" />

                {/* ── Glass body ── */}
                <rect x="-9.5" y="-15.5" width="19" height="31" rx="2.8"
                      fill="rgba(228,240,250,0.15)" stroke="rgba(145,188,225,0.42)" strokeWidth="0.5" />

                {/* Powder/cake hint at bottom of glass */}
                <rect x="-9" y="7.5" width="18" height="6.5" fill="rgba(245,242,232,0.72)" />
                <path d="M-9,7.5 Q0,6 9,7.5" fill="none" stroke="rgba(255,255,255,0.42)" strokeWidth="0.8" />

                {/* ── Pink label ── */}
                <rect x="-9.5" y="-7.5" width="19" height="15" fill="#ff2d78" />
                <line x1="-9.5" y1="-4"  x2="9.5" y2="-4"  stroke="rgba(255,255,255,0.20)" strokeWidth="0.5" />
                <line x1="-9.5" y1="4"   x2="9.5" y2="4"   stroke="rgba(255,255,255,0.20)" strokeWidth="0.5" />
                <rect x="-9.5" y="-7.5" width="19" height="2" fill="rgba(255,255,255,0.20)" />
                <rect x="-9.5" y="5.5"  width="19" height="2" fill="rgba(255,255,255,0.20)" />
                <circle cx="-4" cy="0" r="0.8" fill="rgba(255,255,255,0.28)" />
                <circle cx="0"  cy="0" r="0.8" fill="rgba(255,255,255,0.28)" />
                <circle cx="4"  cy="0" r="0.8" fill="rgba(255,255,255,0.28)" />

                {/* ── Left shine streak ── */}
                <rect x="-9" y="-14.5" width="3.5" height="29" rx="1.75" fill="rgba(255,255,255,0.52)" />
                {/* ── Right shadow strip ── */}
                <rect x="6.2" y="-14.5" width="2" height="29" rx="1" fill="rgba(0,0,0,0.06)" />
                {/* ── Glass shine gradient ── */}
                <rect x="-9.5" y="-15.5" width="19" height="31" rx="2.8" fill="url(#pv-gs)" />
                {/* ── Body outline ── */}
                <rect x="-9.5" y="-15.5" width="19" height="31" rx="2.8"
                      fill="none" stroke="rgba(100,155,200,0.20)" strokeWidth="0.38" />

                {/* ── Top crimp cap ── */}
                <rect x="-9.5" y="-22" width="19" height="6.5" rx="2.2" fill="url(#pv-mc)" />
                <line x1="-9.5" y1="-20.5" x2="9.5" y2="-20.5" stroke="rgba(255,255,255,0.48)" strokeWidth="0.75" />
                <line x1="-9.5" y1="-18.5" x2="9.5" y2="-18.5" stroke="rgba(0,0,0,0.09)" strokeWidth="0.5" />
                <line x1="-9.5" y1="-17"   x2="9.5" y2="-17"   stroke="rgba(0,0,0,0.07)" strokeWidth="0.45" />
                {/* Flip-off disc on top cap */}
                <circle cx="0" cy="-19" r="5.8" fill="url(#pv-disc)" />
                <ellipse cx="-2" cy="-21" rx="2.2" ry="1.3" fill="rgba(255,255,255,0.22)" />
                <circle cx="0" cy="-19" r="1.8" fill="rgba(48,48,48,0.65)" />
                {/* Cap border */}
                <rect x="-9.5" y="-22" width="19" height="6.5" rx="2.2"
                      fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="0.48" />

              </symbol>
            </defs>

            {/* Ambient pink glow */}
            <rect width="760" height="900" fill="url(#pv-glow)" />

            {/* ── All vials, y-sorted for correct z-order ── */}
            {PILE.map((vial, i) => {
              const scattered = vial.x < 270;
              return (
                <use
                  key={i}
                  href="#pv"
                  transform={`translate(${vial.x.toFixed(1)},${vial.y.toFixed(1)}) rotate(${vial.rot.toFixed(1)}) scale(${vial.sc.toFixed(3)})`}
                  filter={scattered ? "url(#pv-sh)" : undefined}
                />
              );
            })}

            {/* ── Floor reflection — bottom vials mirrored below y=855 ──
                Reflected y = 2 × 855 − original_y = 1710 − y
                Only vials with y > 800 have reflections in range 855–900. */}
            <g mask="url(#pv-rmask)">
              {PILE.filter((v) => v.y > 800).map((v, i) => (
                <use
                  key={i}
                  href="#pv"
                  transform={`translate(${v.x.toFixed(1)},${(1710 - v.y).toFixed(1)}) rotate(${(-v.rot).toFixed(1)}) scale(${v.sc.toFixed(3)})`}
                />
              ))}
            </g>

            {/* ── Floor fade — bottom vials dissolve into warm white ── */}
            <rect x="0" y="700" width="760" height="200" fill="url(#pv-floor)" />
          </svg>
        </div>

      </div>
    </section>
  );
}
