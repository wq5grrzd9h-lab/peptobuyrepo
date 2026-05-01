"use client";

import { useId } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  PeptoBuyLogo
//
//  Props
//    flaskH    — height of the flask SVG in px (wordmark scales with it)
//    layout    — "horizontal" (flask left, wordmark right) | "stacked" (flask top, wordmark below)
//    darkBg    — set true when rendered on dark background (makes "pepto" white)
//    showWordmark — hide wordmark if false
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  flaskH?: number;
  layout?: "horizontal" | "stacked";
  darkBg?: boolean;
  showWordmark?: boolean;
  className?: string;
}

// Bubble data (static coordinates, animations applied via CSS)
const INNER = [
  { cx: 26,   cy: 70,    r: 5,   fill: "rgba(255,205,225,0.72)", hx: 24,    hy: 68,    hr: 1.4, delay: 0    },
  { cx: 45,   cy: 74,    r: 4,   fill: "rgba(255,210,230,0.65)", hx: 43,    hy: 72,    hr: 1.1, delay: 0.4  },
  { cx: 57,   cy: 65,    r: 3.5, fill: "rgba(255,200,222,0.68)", hx: 55,    hy: 63,    hr: 0.9, delay: 0.8  },
  { cx: 37,   cy: 60,    r: 2.5, fill: "rgba(255,215,235,0.60)", hx: 35.5,  hy: 58,    hr: 0.8, delay: 1.2  },
] as const;

const RISING = [
  { cx: 40,   cy: 9,    r: 3.5, fill: "#ff6b9d", hx: 38.5, hy: 7.5,  hr: 1.0, delay: 0    },
  { cx: 33,   cy: 3,    r: 2.8, fill: "#ff5288", hx: 31.8, hy: 2,    hr: 0.9, delay: 0.45 },
  { cx: 47,   cy: 5,    r: 3,   fill: "#ff6b9d", hx: 45.8, hy: 3.8,  hr: 0.9, delay: 0.90 },
  { cx: 38,   cy: -4,   r: 2.5, fill: "#ff5a8a", hx: 36.8, hy: -5,   hr: 0.8, delay: 1.35 },
  { cx: 44,   cy: -8,   r: 2,   fill: "#ff6b9d", hx: 43,   hy: -9,   hr: 0.6, delay: 1.80 },
  { cx: 35,   cy: -13,  r: 3.2, fill: "#ff5288", hx: 33.8, hy: -14.2, hr: 1.0, delay: 2.25 },
] as const;

// Flask path — Erlenmeyer shape, viewBox 0 0 80 88
// Neck: x=31..49, y=18..36   Body: x=10..70, y=36..82
const FLASK_PATH = "M31,18 L49,18 L49,36 C58,44 70,53 70,62 L70,73 C70,79 63,82 54,82 L26,82 C17,82 10,79 10,73 L10,62 C10,53 22,44 31,36 Z";

export default function PeptoBuyLogo({
  flaskH = 52,
  layout = "stacked",
  darkBg = false,
  showWordmark = true,
  className = "",
}: Props) {
  const raw = useId();
  // Strip non-alphanumeric so IDs are valid in CSS and SVG
  const id = "pb" + raw.replace(/[^a-z0-9]/gi, "");

  const svgW = Math.round(flaskH * 0.909);   // 80/88 ratio
  const wSize = layout === "horizontal"
    ? Math.round(flaskH * 0.52)
    : Math.round(flaskH * 0.36);

  return (
    <div
      className={`inline-flex items-center ${
        layout === "horizontal" ? "flex-row gap-[0.35em]" : "flex-col items-center gap-[0.2em]"
      } ${className}`}
      style={{ overflow: "visible" }}
      data-logo-root={id}
    >
      {/* ── Flask SVG ── */}
      <svg
        width={svgW}
        height={flaskH}
        viewBox="0 0 80 88"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        aria-hidden="true"
      >
        {/* ── Scoped CSS animations ── */}
        <style>{`
          /* Transform origin fix for SVG elements */
          [data-logo-root="${id}"] .pbi, [data-logo-root="${id}"] .pbr {
            transform-box: fill-box;
            transform-origin: center;
          }

          /* Flask glow on hover */
          [data-logo-root="${id}"]:hover #pf-${id} {
            filter: drop-shadow(0 0 8px rgba(255,45,120,0.58));
          }
          #pf-${id} { transition: filter 0.35s ease; }

          /* Inner bubble float */
          @keyframes pbi-${id} {
            0%,100% { transform: translateY(0)    scale(1);    }
            50%      { transform: translateY(-5px) scale(1.08); }
          }
          [data-logo-root="${id}"]:hover .pbi {
            animation: pbi-${id} 2s ease-in-out infinite;
          }

          /* Rising bubble: float up + fade out */
          @keyframes pbr-${id} {
            0%   { transform: translateY(0)     scale(1);    opacity: 0.88; }
            65%  { transform: translateY(-17px) scale(1.12); opacity: 0.45; }
            100% { transform: translateY(-28px) scale(0.72); opacity: 0;    }
          }
          [data-logo-root="${id}"]:hover .pbr {
            animation: pbr-${id} 2.5s ease-out infinite;
          }
        `}</style>

        <defs>
          {/* Liquid fill gradient */}
          <linearGradient id={`plg-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#ff9cbc" />
            <stop offset="100%" stopColor="#ff2d78" />
          </linearGradient>

          {/* Clip path = flask shape */}
          <clipPath id={`pcp-${id}`}>
            <path d={FLASK_PATH} />
          </clipPath>
        </defs>

        <g id={`pf-${id}`}>

          {/* ── Liquid fill (bottom ~55%) ── */}
          <rect
            x="0" y="42" width="80" height="50"
            fill={`url(#plg-${id})`}
            clipPath={`url(#pcp-${id})`}
          />

          {/* ── Left-side glass shine streak ── */}
          <path
            d="M14,65 C13,57 16,48 22,42 L22,70 Z"
            fill="rgba(255,255,255,0.28)"
            clipPath={`url(#pcp-${id})`}
          />

          {/* ── Inner bubbles + highlight dots (clipped to flask body) ── */}
          {INNER.map((b, i) => (
            <g key={i} className="pbi" style={{ animationDelay: `${b.delay}s` }}>
              <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} clipPath={`url(#pcp-${id})`} />
              <circle cx={b.hx} cy={b.hy} r={b.hr} fill="rgba(255,255,255,0.68)" clipPath={`url(#pcp-${id})`} />
            </g>
          ))}

          {/* ── Flask outline ── */}
          <path
            d={FLASK_PATH}
            fill="none"
            stroke="#2d2d3a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* ── Neck opening rim ── */}
          <rect x="29" y="13" width="22" height="7" rx="2.5" fill="#2d2d3a" />

          {/* ── Rising bubbles above flask neck ── */}
          {RISING.map((b, i) => (
            <g key={i} className="pbr" style={{ animationDelay: `${b.delay}s` }}>
              <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.fill} />
              <circle cx={b.hx} cy={b.hy} r={b.hr} fill="rgba(255,255,255,0.75)" />
            </g>
          ))}
        </g>
      </svg>

      {/* ── Wordmark ── */}
      {showWordmark && (
        <span
          aria-label="PeptoBuy"
          style={{
            fontFamily:
              "var(--font-nunito), 'Nunito', 'Poppins', 'Varela Round', system-ui, sans-serif",
            fontWeight: 700,
            lineHeight: 1,
            fontSize: `${wSize}px`,
            letterSpacing: "-0.01em",
            userSelect: "none",
          }}
        >
          <span style={{ color: darkBg ? "#ffffff" : "#2d2d3a" }}>pepto</span>
          <span style={{ color: "#ff2d78" }}>buy</span>
        </span>
      )}
    </div>
  );
}
