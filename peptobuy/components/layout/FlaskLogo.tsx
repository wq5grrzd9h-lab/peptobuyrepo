// Animated Erlenmeyer flask — inline SVG, no external libraries.
// Hover glow is driven by a parent `group` class (applied in Navbar).
// Bubble rise animations use CSS keyframes embedded in a <style> element
// inside the SVG so the component is fully self-contained.

export default function FlaskLogo() {
  return (
    <svg
      viewBox="0 0 32 40"
      width="24"
      height="30"
      aria-hidden="true"
      // overflow:visible lets the drop-shadow glow extend past the SVG bounds
      style={{ overflow: "visible" }}
      className={[
        // Start from a zero-spread shadow so the transition is smooth
        "[filter:drop-shadow(0_0_0px_rgba(255,45,120,0))]",
        // Glow when a parent carries the Tailwind `group` class
        "group-hover:[filter:drop-shadow(0_0_12px_rgba(255,45,120,0.70))]",
        "transition-[filter] duration-300 ease-out",
      ].join(" ")}
    >
      {/* ── Shared definitions ─────────────────────────────── */}
      <defs>
        {/*
          Clip path matches the flask outline so liquid & bubbles
          are never rendered outside the glass body.
        */}
        <clipPath id="pb-flask-clip">
          <path d="M 12,2 L 20,2 L 20,14 L 26,23 L 29,38 L 3,38 L 6,23 L 12,14 Z" />
        </clipPath>

        <style>{`
          /* ── Bubble keyframes ──────────────────────────────
             translateY is in CSS pixels (not SVG user units).
             Each animation fades opacity to 0 well before
             the bubble would reach the liquid surface, so
             there is no visible clipping artefact.
          ─────────────────────────────────────────────────── */

          @keyframes pb-bub-a {
            0%   { transform: translateY(0px);   opacity: 0.90; }
            40%  {                               opacity: 0.50; }
            72%  {                               opacity: 0;    }
            100% { transform: translateY(-12px); opacity: 0;    }
          }

          @keyframes pb-bub-b {
            0%   { transform: translateY(0px);  opacity: 0.75; }
            40%  {                              opacity: 0.40; }
            72%  {                              opacity: 0;    }
            100% { transform: translateY(-9px); opacity: 0;    }
          }

          @keyframes pb-bub-c {
            0%   { transform: translateY(0px);   opacity: 0.82; }
            40%  {                               opacity: 0.45; }
            72%  {                               opacity: 0;    }
            100% { transform: translateY(-14px); opacity: 0;    }
          }

          /* transform-box:fill-box makes translate relative to the
             element's own bounding box, not the SVG viewport.       */
          .pb-ba, .pb-bb, .pb-bc {
            transform-box:    fill-box;
            transform-origin: 50% 50%;
          }

          .pb-ba { animation: pb-bub-a 2.2s  ease-in infinite; }
          .pb-bb { animation: pb-bub-b 2.75s ease-in infinite; animation-delay: 0.85s; }
          .pb-bc { animation: pb-bub-c 1.9s  ease-in infinite; animation-delay: 1.55s; }
        `}</style>
      </defs>

      {/* ── Flask glass outline ─────────────────────────────── */}
      {/*
        Erlenmeyer shape:
          neck   x 12→20 (8 px wide),  y 2→14
          shoulder            goes out to x 6/26 by y 23
          body   x  3→29 (26 px wide), y 23→38
      */}
      <path
        d="M 12,2 L 20,2 L 20,14 L 26,23 L 29,38 L 3,38 L 6,23 L 12,14 Z"
        fill="rgba(255,45,120,0.10)"
        stroke="#ff2d78"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* ── Neck mouth rim ──────────────────────────────────── */}
      {/* Slightly wider than the neck to mimic a glass lip */}
      <line
        x1="11" y1="2.5"
        x2="21" y2="2.5"
        stroke="#ff2d78"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* ── Liquid fill ─────────────────────────────────────── */}
      {/* Rect is clipped to the flask body; only the bottom ~35% fills. */}
      <rect
        x="0" y="24"
        width="32" height="15"
        fill="rgba(255,45,120,0.26)"
        clipPath="url(#pb-flask-clip)"
      />

      {/* ── Liquid surface line ─────────────────────────────── */}
      {/* Horizontal shimmer at the meniscus */}
      <line
        x1="6.2" y1="24"
        x2="25.8" y2="24"
        stroke="rgba(255,45,120,0.50)"
        strokeWidth="0.75"
        strokeLinecap="round"
        clipPath="url(#pb-flask-clip)"
      />

      {/* ── Rising bubbles ──────────────────────────────────── */}
      {/*
        Three bubbles staggered in x-position and animation-delay.
        They start near the flask floor, rise upward, and fade to
        opacity:0 before reaching the liquid surface.
      */}
      <g clipPath="url(#pb-flask-clip)">
        {/* centre-left, medium bubble */}
        <circle className="pb-ba" cx="14"  cy="33"   r="2.0" fill="rgba(255,45,120,0.62)" />
        {/* right area, slightly smaller */}
        <circle className="pb-bb" cx="21"  cy="35.5" r="1.55" fill="rgba(255,45,120,0.52)" />
        {/* left area, smallest */}
        <circle className="pb-bc" cx="9.5" cy="34.5" r="1.25" fill="rgba(255,45,120,0.46)" />
      </g>

      {/* ── Left-side glass reflection ──────────────────────── */}
      {/* A thin translucent streak to suggest the curved glass wall */}
      <line
        x1="8.5" y1="26"
        x2="7.2" y2="36"
        stroke="rgba(255,45,120,0.22)"
        strokeWidth="1.1"
        strokeLinecap="round"
        clipPath="url(#pb-flask-clip)"
      />
    </svg>
  );
}
