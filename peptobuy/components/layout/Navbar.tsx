"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  Zap,
  LogOut,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, isLoggedIn, hydrated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!hydrated) return <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200" />;

  if (!isLoggedIn) {
    return (
      <Link href="/login" aria-label="Sign in" className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
        <User size={18} />
      </Link>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean).join("").toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/25 text-xs font-bold transition-all hover:bg-accent/20"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-zinc-900">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
          <div className="p-1.5">
            <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900">
              <User size={14} /> My Account
            </Link>
            <button onClick={() => { logout(); setOpen(false); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [badgePop, setBadgePop] = useState(false);

  const { totalCount, hydrated } = useCart();
  const { isLoggedIn } = useAuth();
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
      {/* Announcement bar — stays pink/white */}
      {announcementVisible && (
        <div className="relative z-50 flex items-center justify-center gap-2 bg-accent px-4 py-2 text-center text-[13px] font-medium text-white">
          <Zap size={13} className="shrink-0" />
          <span>
            Free shipping on orders over <span className="font-bold">$200</span>
            {" — "}
            <Link href="/shop" className="inline-flex items-center gap-0.5 underline underline-offset-2 hover:no-underline">
              Shop Now <ChevronRight size={12} />
            </Link>
          </span>
          <button
            aria-label="Dismiss announcement"
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

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
            <PeptoBuyLogo layout="horizontal" flaskH={34} />
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

            <div className="px-1"><UserMenu /></div>

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
              {isLoggedIn ? (
                <button onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900">
                  <User size={16} /> My Account
                </button>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900">
                  <User size={16} /> Sign In
                </Link>
              )}
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
