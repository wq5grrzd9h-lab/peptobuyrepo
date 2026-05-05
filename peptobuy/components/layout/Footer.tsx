import Link from "next/link";
import NewsletterForm from "@/components/layout/NewsletterForm";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Weight Loss", href: "/shop?category=Weight+Loss" },
      { label: "Recovery & Healing", href: "/shop?category=Recovery+%26+Healing" },
      { label: "Muscle Growth", href: "/shop?category=Muscle+Growth" },
      { label: "Combos", href: "/shop?category=Combos" },
      { label: "Essentials", href: "/shop?category=Essentials" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "mailto:peptobuy@gmail.com" },
    ],
  },
];

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Visa">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Mastercard">
      <rect width="48" height="32" rx="4" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1" />
      <circle cx="18" cy="16" r="9" fill="#EB001B" />
      <circle cx="30" cy="16" r="9" fill="#F79E1B" />
      <path d="M24 9.1a9 9 0 0 1 0 13.8A9 9 0 0 1 24 9.1z" fill="#FF5F00" />
    </svg>
  );
}

function CryptoIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Crypto">
      <rect width="48" height="32" rx="4" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#ff2d78" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">₿</text>
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg viewBox="0 0 48 32" className="h-7 w-auto" aria-label="Apple Pay">
      <rect width="48" height="32" rx="4" fill="#f5f5f5" stroke="#e5e5e5" strokeWidth="1" />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fill="#0a0a0a" fontSize="10" fontWeight="500" fontFamily="-apple-system, sans-serif">Pay</text>
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-1">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/"><PeptoBuyLogo layout="horizontal" flaskH={32} /></Link>
          <p className="mt-3 max-w-xs text-sm text-zinc-500">Precision research compounds for qualified scientists and laboratories.</p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-2 lg:max-w-md">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">{col.heading}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-xl border border-border bg-white px-6 py-6 sm:flex sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm font-semibold text-zinc-900">Get 10% off your first order</p>
            <p className="mt-0.5 text-xs text-zinc-500">Stay updated on new compounds and batch releases.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border">
        {/* Research disclaimer */}
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
          <p className="text-[11px] leading-relaxed text-zinc-400">
            <span className="font-semibold text-zinc-500">Research Use Only Disclaimer:</span> All products sold by PeptoBuy are strictly intended for in vitro laboratory and scientific research purposes. They are not approved by the FDA, are not intended for human consumption, diagnosis, or treatment, and must not be used on humans or animals. By purchasing from PeptoBuy, you confirm that you are a qualified researcher acting in full compliance with all applicable local, state, and federal laws.
          </p>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-zinc-400">© {year} PeptoBuy. All rights reserved.</p>
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
