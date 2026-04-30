"use client";

type CardType = "visa" | "mastercard" | "amex" | "unknown";

export function detectCardType(number: string): CardType {
  const d = number.replace(/\s/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "unknown";
}

function Chip() {
  return (
    <svg width="42" height="32" viewBox="0 0 42 32" fill="none" className="opacity-80">
      <rect width="42" height="32" rx="5" fill="#c8a84b" />
      <rect x="1" y="1" width="40" height="30" rx="4" fill="url(#chipGrad)" />
      <line x1="0" y1="10.5" x2="42" y2="10.5" stroke="#8B7030" strokeWidth="0.8" />
      <line x1="0" y1="21.5" x2="42" y2="21.5" stroke="#8B7030" strokeWidth="0.8" />
      <line x1="14" y1="0" x2="14" y2="32" stroke="#8B7030" strokeWidth="0.8" />
      <line x1="28" y1="0" x2="28" y2="32" stroke="#8B7030" strokeWidth="0.8" />
      <rect x="14" y="10.5" width="14" height="11" fill="rgba(180,140,40,0.4)" />
      <defs>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="42" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e0b857" />
          <stop offset="1" stopColor="#b8892a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto" fill="none">
      <text x="0" y="17" fontSize="20" fontWeight="900" fontFamily="Arial, sans-serif" fill="white" letterSpacing="-1">
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 38 24" className="h-6 w-auto">
      <circle cx="13" cy="12" r="11" fill="#eb001b" opacity="0.9" />
      <circle cx="25" cy="12" r="11" fill="#f79e1b" opacity="0.9" />
      <path d="M19 4.8a11 11 0 0 1 0 14.4A11 11 0 0 1 19 4.8z" fill="#ff5f00" />
    </svg>
  );
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 60 20" className="h-5 w-auto">
      <text x="0" y="16" fontSize="14" fontWeight="800" fontFamily="Arial, sans-serif" fill="white" letterSpacing="1">
        AMEX
      </text>
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 rotate-90 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M5 13a9 9 0 0 1 14 0" />
      <path d="M1.5 9.5a13 13 0 0 1 21 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

interface CardPreviewProps {
  cardNumber: string;
  nameOnCard: string;
  expiry: string;
  isFlipped: boolean;
  cvv: string;
}

export default function CardPreview({
  cardNumber,
  nameOnCard,
  expiry,
  isFlipped,
  cvv,
}: CardPreviewProps) {
  const cardType = detectCardType(cardNumber);

  // Format display number with bullet placeholders
  const rawDigits = cardNumber.replace(/\s/g, "");
  const padded = rawDigits.padEnd(16, "•");
  const displayNumber = [
    padded.slice(0, 4),
    padded.slice(4, 8),
    padded.slice(8, 12),
    padded.slice(12, 16),
  ].join("  ");

  const displayName = nameOnCard.trim().toUpperCase() || "FULL NAME";
  const displayExpiry = expiry || "MM/YY";

  return (
    <div className="w-full max-w-sm" style={{ perspective: "1000px" }}>
      <div
        className="relative h-48 w-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── Front ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1a1128 0%, #2d1a3d 40%, #1a2042 100%)",
            }}
          />
          {/* Decorative orbs */}
          <div
            className="absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-25"
            style={{
              background:
                "radial-gradient(circle, rgba(255,45,120,0.6) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-16 -left-8 h-48 w-48 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, rgba(100,80,200,0.8) 0%, transparent 70%)",
            }}
          />
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Content */}
          <div className="relative flex h-full flex-col justify-between p-6">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <Chip />
              <div className="flex items-center gap-2">
                <WifiIcon />
                {cardType === "visa" && <VisaLogo />}
                {cardType === "mastercard" && <MastercardLogo />}
                {cardType === "amex" && <AmexLogo />}
              </div>
            </div>

            {/* Card number */}
            <div className="font-mono text-[17px] tracking-[0.22em] text-white/85">
              {displayNumber}
            </div>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Card Holder
                </p>
                <p className="max-w-[160px] truncate text-sm font-semibold tracking-wide text-white">
                  {displayName}
                </p>
              </div>
              <div className="text-right">
                <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                  Expires
                </p>
                <p className="font-mono text-sm text-white">{displayExpiry}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Back ──────────────────────────────────────── */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1a1128 0%, #2d1a3d 40%, #1a2042 100%)",
            }}
          />

          {/* Magnetic stripe */}
          <div className="absolute left-0 right-0 top-8 h-10 bg-[#111]" />

          {/* Signature strip + CVV */}
          <div className="absolute bottom-10 left-6 right-6">
            <div className="flex items-center gap-3">
              <div className="h-8 flex-1 rounded bg-white/90" />
              <div className="flex flex-col items-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">
                  CVV
                </p>
                <div className="mt-0.5 flex h-8 w-12 items-center justify-center rounded bg-white font-mono text-sm font-bold text-[#1a1128]">
                  {cvv || "•••"}
                </div>
              </div>
            </div>
          </div>

          {/* Card type bottom right */}
          <div className="absolute bottom-4 right-6">
            {cardType === "visa" && <VisaLogo />}
            {cardType === "mastercard" && <MastercardLogo />}
            {cardType === "amex" && <AmexLogo />}
          </div>
        </div>
      </div>
    </div>
  );
}
