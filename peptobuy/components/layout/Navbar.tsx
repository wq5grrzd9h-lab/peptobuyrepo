"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Menu, X, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";
import { useSearch } from "@/context/SearchContext";
import { getTimeRemaining, isPromoActive, isFreeShippingWeekend, pad } from "@/lib/memorialDay";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
];

function MemorialDayCountdown() {
  const [time, setTime] = useState(() => getTimeRemaining());
  const [active, setActive] = useState(() => isPromoActive());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const t = getTimeRemaining();
      setTime(t);
      if (t.expired) setActive(false);
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  if (!active && !time.expired) return null; // not yet mounted (SSR)

  return (
    <div
      className="z-50 flex items-center justify-center gap-3 px-4 py-1.5 text-center text-[13px] font-bold text-white"
      style={{ background: "#8B0000" }}
      aria-label="Memorial Day Sale countdown"
    >
      <span>🇺🇸 Memorial Day Weekend Sale</span>
      {time.expired ? (
        <span className="rounded-full bg-white/20 px-3 py-0.5 text-[12px]">SALE ENDED</span>
      ) : (
        <span className="flex items-center gap-1 font-black tabular-nums">
          <span className="rounded bg-white/15 px-1.5 py-0.5">{pad(time.days)}d</span>
          <span className="opacity-60">:</span>
          <span className="rounded bg-white/15 px-1.5 py-0.5">{pad(time.hours)}h</span>
          <span className="opacity-60">:</span>
          <span className="rounded bg-white/15 px-1.5 py-0.5">{pad(time.mins)}m</span>
          <span className="opacity-60">:</span>
          <span className="rounded bg-white/15 px-1.5 py-0.5">{pad(time.secs)}s</span>
        </span>
      )}
      <span className="hidden sm:inline">· Ends TONIGHT May 26 at Midnight EST · Free GHK-Cu + Free BAC Water &amp; Syringes (<span style={{ background: "#fff", color: "#cc0000", borderRadius: "4px", padding: "0 4px", fontWeight: 900, fontSize: "11px" }}>Only 11 Left!</span>)</span>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [badgePop, setBadgePop] = useState(false);

  const { totalCount, hydrated } = useCart();
  const { open: openSearch } = useSearch();
  const prevCount = useRef(0);

  useEffect(() => {
    if (hydrated && totalCount > prevCount.current) {
      setBadgePop(true);
      const t = setTimeout(() => setBadgePop(false), 350);
      prevCount.current = totalCount;
      return () => clearTimeout(t);
    }
    prevCount.current = totalCount;
  }, [totalCount, hydrated]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* Promo ticker */}
      <div className="relative z-50 h-9 overflow-hidden bg-accent" aria-label="Promotions">
        <div
          className="flex h-full items-center whitespace-nowrap"
          style={{ animation: "ticker-scroll 22s linear infinite", width: "max-content" }}
        >
          {[0, 1].map((i) => (
            <span key={i} className="inline-flex items-center gap-6 px-8 text-[13px] font-bold text-white">
              <span>🧪 20% OFF YOUR FIRST ORDER — Use Code: <span className="underline underline-offset-2">FIRST20</span> at Checkout 🧪</span>
              <span className="opacity-60">·</span>
              <span>Research Grade Peptides</span>
              <span className="opacity-60">·</span>
              <span>Third-Party Tested</span>
              <span className="opacity-60">·</span>
              <span>COA On Request</span>
              <span className="opacity-60">·</span>
              {isFreeShippingWeekend()
                ? <span className="font-black">🎖️ FREE SHIPPING — Memorial Day Sale · Ends TONIGHT at Midnight EST</span>
                : <span>Free Shipping Over $300</span>
              }
              <span className="opacity-60">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Memorial Day countdown bar */}
      <MemorialDayCountdown />

      {/* Research-use-only banner */}
      <div className="z-50 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-[11px] font-medium text-amber-800">
        ⚠️ All products are strictly for laboratory and research use only. Not intended for human consumption, diagnosis, or treatment.
      </div>

      {/* Sticky header */}
      <header
        className={[
          "sticky top-0 z-40 w-full transition-all duration-200",
          scrolled
            ? "border-b border-zinc-200 bg-white/95 backdrop-blur-md shadow-sm"
            : "border-b border-transparent bg-white",
        ].join(" ")}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <PeptoBuyLogo flaskH={40} />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button aria-label="Search products" onClick={openSearch} className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <Search size={18} />
            </button>

            <Link
              href="/cart"
              aria-label={totalCount > 0 ? `Cart — ${totalCount} items` : "Cart"}
              className="relative rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <ShoppingCart size={18} />
              {hydrated && totalCount > 0 && (
                <span className={["absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[10px] font-bold leading-none text-white transition-transform duration-150", badgePop ? "scale-125" : "scale-100"].join(" ")}>
                  {totalCount}
                </span>
              )}
            </Link>

            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-1 rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className={["overflow-hidden transition-all duration-300 ease-in-out md:hidden", mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"].join(" ")}>
          <div className="border-t border-zinc-100 bg-white px-4 pb-6 pt-4">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                    {link.label}
                    <ChevronRight size={16} className="text-zinc-300" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-1 border-t border-zinc-100 pt-4">
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center justify-between rounded-md px-3 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
                <span className="flex items-center gap-3"><ShoppingCart size={16} /> Cart</span>
                {hydrated && totalCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">{totalCount}</span>
                )}
              </Link>
              <button onClick={openSearch} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900">
                <Search size={16} /> Search products
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
