import Link from "next/link";
import NewsletterForm from "@/components/layout/NewsletterForm";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Supplements", href: "/shop/supplements" },
      { label: "Recovery", href: "/shop/recovery" },
      { label: "Bundles", href: "/shop/bundles" },
      { label: "Essentials", href: "/shop/essentials" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Shipping & Returns", href: "/shipping" },
      { label: "Track Order", href: "/track" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        letterSpacing="1"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="18" cy="16" r="9" fill="#EB001B" />
      <circle cx="30" cy="16" r="9" fill="#F79E1B" />
      <path
        d="M24 9.1a9 9 0 0 1 0 13.8A9 9 0 0 1 24 9.1z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function CryptoIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Crypto">
      <rect width="48" height="32" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#ff2d78"
        fontSize="18"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        ₿
      </text>
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Apple Pay">
      <rect width="48" height="32" rx="4" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1" />
      <text
        x="50%"
        y="52%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="500"
        fontFamily="-apple-system, sans-serif"
      >
        Pay
      </text>
      <text
        x="14"
        y="52%"
        dominantBaseline="middle"
        fill="white"
        fontSize="13"
        fontFamily="-apple-system, sans-serif"
      >

      </text>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-1">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Brand + tagline */}
        <div className="mb-12">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Pepto</span>
            <span className="text-accent">Buy</span>
          </span>
          <p className="mt-2 max-w-xs text-sm text-white/40">
            Premium supplements for serious athletes. No fluff, no fillers — just results.
          </p>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter strip */}
        <div className="mt-14 rounded-xl border border-border bg-surface-2 px-6 py-6 sm:flex sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm font-semibold text-white">
              Get 10% off your first order
            </p>
            <p className="mt-0.5 text-xs text-white/40">
              Join 12,000+ athletes. No spam, ever.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/30">
            © {year} PeptoBuy. All rights reserved.
          </p>

          {/* Payment icons */}
          <div className="flex items-center gap-2" aria-label="Accepted payment methods">
            <VisaIcon />
            <MastercardIcon />
            <ApplePayIcon />
            <CryptoIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}
