"use client";

import { type Category } from "@/lib/products";

export interface ProductVialProps {
  name: string;
  dose: string;
  category: Category;
  className?: string;
  variant?: "default" | "featured"; // featured = slow rock animation on product detail page
}

// ─── Content (powder/liquid) by category ────────────────────────────────────
const CONTENT: Record<Category, { fill: string; isLiquid: boolean }> = {
  "Weight Loss":        { fill: "rgba(255,210,225,0.82)", isLiquid: false },
  "Recovery & Healing": { fill: "rgba(245,244,238,0.88)", isLiquid: false },
  "Muscle Growth":      { fill: "rgba(248,244,228,0.86)", isLiquid: false },
  Essentials:           { fill: "rgba(208,235,250,0.40)", isLiquid: true  },
};

const BG: Record<Category, string> = {
  "Weight Loss":        "#fff4f7",
  "Recovery & Healing": "#f4f8ff",
  "Muscle Growth":      "#f5fff8",
  Essentials:           "#f3f8ff",
};

function splitName(name: string): [string, string | null] {
  if (name.length <= 10) return [name, null];
  const sl = name.indexOf(" / ");
  if (sl !== -1) return [name.slice(0, sl), name.slice(sl + 3)];
  const sp = name.lastIndexOf(" ", 11);
  if (sp > 3) return [name.slice(0, sp), name.slice(sp + 1)];
  return [name.slice(0, 11), name.slice(11)];
}

// Mini flask path (from PeptoBuyLogo) used as label icon
const FP = "M31,18 L49,18 L49,36 C58,44 70,53 70,62 L70,73 C70,79 63,82 54,82 L26,82 C17,82 10,79 10,73 L10,62 C10,53 22,44 31,36 Z";

export default function ProductVial({
  name, dose, category, className = "", variant = "default",
}: ProductVialProps) {
  // Stable ID — safe for SSR (no Math.random, no useId needed)
  const uid = `rv-${category.replace(/\W/g, "").slice(0, 4).toLowerCase()}-${name.replace(/\W/g, "").slice(0, 8).toLowerCase()}`;

  const { fill: contentFill, isLiquid } = CONTENT[category];
  const [line1, line2] = splitName(name);
  const nameFontSize = line2 ? 8 : (line1.length > 9 ? 9 : 10.5);

  // Label text y-coords (white area y=55..108)
  const nameY1 = line2 ? 74 : 78;
  const doseY  = line2 ? 100 : 97;

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: BG[category] }}
    >
      {/*
       * ViewBox: 0 0 72 172
       * Anatomy:
       *   y=1..25    top aluminum crimp cap
       *   y=23..29.5 cap→glass transition ring
       *   y=29.5..144.5 glass body (115 u)
       *   y=49.5..113.5 label (64 u = 56% of body)
       *     y=49.5..55  pink top bar
       *     y=55..108   white label body
       *     y=108..113.5 pink bottom bar
       *   y=114..121  powder cake or liquid surface
       *   y=140..147  glass→cap ring
       *   y=145..167  bottom aluminum crimp cap
       *   y=170       ground shadow
       */}
      <svg
        viewBox="0 0 72 172"
        className="h-full w-auto"
        style={{
          filter: "drop-shadow(0 5px 16px rgba(0,0,0,0.17))",
          ...(variant === "featured"
            ? { animation: "vial-rock 3s ease-in-out infinite" }
            : {}),
        }}
        overflow="visible"
        aria-label={`${name} ${dose} research vial`}
      >
        <defs>
          {/* ── 7-stop horizontal metallic gradient ── */}
          <linearGradient id={`${uid}-cap`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#747474" />
            <stop offset="14%"  stopColor="#b8b8b8" />
            <stop offset="34%"  stopColor="#dcdcdc" />
            <stop offset="52%"  stopColor="#ebebeb" />
            <stop offset="68%"  stopColor="#d2d2d2" />
            <stop offset="84%"  stopColor="#b4b4b4" />
            <stop offset="100%" stopColor="#787878" />
          </linearGradient>

          {/* ── Flip-off disc: radial gradient ── */}
          <radialGradient id={`${uid}-disc`} cx="36%" cy="34%" r="58%">
            <stop offset="0%"   stopColor="#d0d0d0" />
            <stop offset="52%"  stopColor="#a4a4a4" />
            <stop offset="100%" stopColor="#828282" />
          </radialGradient>

          {/* ── Glass horizontal shine overlay ── */}
          <linearGradient id={`${uid}-glass`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(172,196,218,0.42)" />
            <stop offset="10%"  stopColor="rgba(218,234,244,0.18)" />
            <stop offset="38%"  stopColor="rgba(240,247,252,0.06)" />
            <stop offset="68%"  stopColor="rgba(220,235,246,0.14)" />
            <stop offset="87%"  stopColor="rgba(198,218,232,0.28)" />
            <stop offset="100%" stopColor="rgba(158,184,204,0.50)" />
          </linearGradient>

          {/* ── Powder surface radial highlight ── */}
          <radialGradient id={`${uid}-surf`} cx="36%" cy="22%" r="62%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.58)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* ══ TOP CRIMP CAP ══════════════════════════════════════ */}
        <rect x="14" y="1" width="44" height="24" rx="4.5" fill={`url(#${uid}-cap)`} />
        {/* Crimp score lines */}
        <line x1="14" y1="3"    x2="58" y2="3"    stroke="rgba(255,255,255,0.50)" strokeWidth="0.8" />
        <line x1="14" y1="6.5"  x2="58" y2="6.5"  stroke="rgba(0,0,0,0.09)" strokeWidth="0.7" />
        <line x1="14" y1="10.5" x2="58" y2="10.5" stroke="rgba(0,0,0,0.09)" strokeWidth="0.7" />
        <line x1="14" y1="14.5" x2="58" y2="14.5" stroke="rgba(0,0,0,0.07)" strokeWidth="0.6" />
        <line x1="14" y1="18.5" x2="58" y2="18.5" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
        {/* Flip-off disc */}
        <circle cx="36" cy="12.5" r="12" fill={`url(#${uid}-disc)`} />
        <ellipse cx="30.5" cy="8" rx="5" ry="3" fill="rgba(255,255,255,0.28)" />
        <circle cx="36" cy="12.5" r="4" fill="rgba(52,52,52,0.70)" />
        <circle cx="34.5" cy="11" r="1.4" fill="rgba(255,255,255,0.16)" />
        <rect x="14" y="1" width="44" height="24" rx="4.5" fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="0.65" />

        {/* Cap→glass transition ring */}
        <rect x="11" y="23" width="50" height="6.5" rx="1.5" fill={`url(#${uid}-cap)`} opacity="0.72" />
        <line x1="11" y1="25.5" x2="61" y2="25.5" stroke="rgba(255,255,255,0.32)" strokeWidth="0.6" />
        <rect x="11" y="23" width="50" height="6.5" rx="1.5" fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="0.45" />

        {/* ══ GLASS BODY ══════════════════════════════════════════ */}
        <rect x="13" y="29.5" width="46" height="115" rx="4.5" fill="rgba(230,242,250,0.14)" />

        {/* ── Content (powder / liquid) ── */}
        {isLiquid ? (
          <>
            <rect x="14" y="104" width="44" height="38" fill={contentFill} />
            <path d="M14,104 Q36,101.5 58,104" fill="none" stroke="rgba(190,225,248,0.55)" strokeWidth="1.1" />
          </>
        ) : (
          <>
            <rect x="14" y="114" width="44" height="29" fill={contentFill} />
            <path d="M14,114 Q36,111.5 58,114" fill="none" stroke="rgba(255,255,255,0.48)" strokeWidth="1.1" />
            <ellipse cx="30" cy="114" rx="13" ry="2.2" fill="rgba(255,255,255,0.32)" />
            <rect x="14" y="114" width="44" height="29" fill={`url(#${uid}-surf)`} />
          </>
        )}

        {/* Glass shine gradient overlay */}
        <rect x="13" y="29.5" width="46" height="115" rx="4.5" fill={`url(#${uid}-glass)`} />
        {/* Left edge highlight streak */}
        <rect x="15" y="31.5" width="5.5" height="111" rx="2.75" fill="rgba(255,255,255,0.58)" />
        {/* Right edge shadow strip */}
        <rect x="52.5" y="31.5" width="4" height="111" rx="2" fill="rgba(0,0,0,0.06)" />
        {/* Body outline */}
        <rect x="13" y="29.5" width="46" height="115" rx="4.5" fill="none" stroke="rgba(90,120,150,0.20)" strokeWidth="0.75" />

        {/* ══ LABEL ═══════════════════════════════════════════════ */}
        {/* Pink top accent bar */}
        <rect x="14" y="49.5" width="44" height="5.5" rx="1" fill="#ff2d78" />
        {/* White label body */}
        <rect x="14" y="55" width="44" height="53" fill="white" />
        {/* Pink bottom accent bar */}
        <rect x="14" y="108" width="44" height="5.5" rx="1" fill="#ff2d78" />
        {/* Label border */}
        <rect x="14" y="49.5" width="44" height="64" fill="none" stroke="#f8b0cc" strokeWidth="0.45" rx="1" />

        {/* Mini flask icon (top-left of label) */}
        <g transform="translate(16, 57) scale(0.087)">
          <rect x="29" y="13" width="22" height="7" rx="2.5" fill="#2d2d3a" />
          <path d={FP} fill="#ff2d78" stroke="#2d2d3a" strokeWidth="5" strokeLinejoin="round" />
        </g>

        {/* "PeptoBuy" micro branding */}
        <text x="29.5" y="64"
              fontSize="5" fontWeight="700" fill="#2d2d3a"
              fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.4">
          PeptoBuy
        </text>

        {/* Branding separator */}
        <line x1="16" y1="67.5" x2="56" y2="67.5" stroke="#f0f0f0" strokeWidth="0.65" />

        {/* Product name — line 1 */}
        <text x="36" y={nameY1} textAnchor="middle"
              fontSize={nameFontSize} fontWeight="700" fill="#1a1a2e"
              fontFamily="system-ui,-apple-system,sans-serif">
          {line1}
        </text>

        {/* Product name — line 2 (long names) */}
        {line2 && (
          <text x="36" y="85" textAnchor="middle"
                fontSize={nameFontSize} fontWeight="700" fill="#1a1a2e"
                fontFamily="system-ui,-apple-system,sans-serif">
            {line2}
          </text>
        )}

        {/* Dose separator */}
        <line x1="19" y1={doseY - 4.5} x2="53" y2={doseY - 4.5} stroke="#f0f0f0" strokeWidth="0.65" />

        {/* Dose */}
        <text x="36" y={doseY} textAnchor="middle"
              fontSize="7.5" fontWeight="500" fill="#646464"
              fontFamily="system-ui,-apple-system,sans-serif">
          {dose}
        </text>

        {/* Research Use Only */}
        <text x="36" y="104.5" textAnchor="middle"
              fontSize="5.5" fontWeight="600" fill="#cc0000"
              fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.3">
          RESEARCH USE ONLY
        </text>

        {/* ══ GLASS→BOTTOM-CAP RING ══════════════════════════════ */}
        <rect x="11" y="140" width="50" height="6.5" rx="1.5" fill={`url(#${uid}-cap)`} opacity="0.72" />
        <line x1="11" y1="143.5" x2="61" y2="143.5" stroke="rgba(255,255,255,0.30)" strokeWidth="0.6" />
        <rect x="11" y="140" width="50" height="6.5" rx="1.5" fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="0.45" />

        {/* ══ BOTTOM CRIMP CAP ════════════════════════════════════ */}
        <rect x="14" y="145" width="44" height="22" rx="4.5" fill={`url(#${uid}-cap)`} />
        <line x1="14" y1="150.5" x2="58" y2="150.5" stroke="rgba(0,0,0,0.09)" strokeWidth="0.7" />
        <line x1="14" y1="154.5" x2="58" y2="154.5" stroke="rgba(0,0,0,0.07)" strokeWidth="0.6" />
        <line x1="14" y1="158.5" x2="58" y2="158.5" stroke="rgba(0,0,0,0.06)" strokeWidth="0.55" />
        <line x1="14" y1="162.5" x2="58" y2="162.5" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
        <line x1="14" y1="164.5" x2="58" y2="164.5" stroke="rgba(255,255,255,0.38)" strokeWidth="0.7" />
        <rect x="14" y="145" width="44" height="22" rx="4.5" fill="none" stroke="rgba(0,0,0,0.11)" strokeWidth="0.65" />

        {/* Ground shadow */}
        <ellipse cx="36" cy="170" rx="22" ry="3.5" fill="rgba(0,0,0,0.08)" />
      </svg>
    </div>
  );
}
