"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { isPromoActive } from "@/lib/memorialDay";

const SESSION_KEY = "md_popup_dismissed";
const AGE_STORAGE_KEY = "peptobuy-age-verified";
const AGE_EXPIRY_MS = 24 * 60 * 60 * 1000;

function isAgeAlreadyVerified(): boolean {
  try {
    const raw = localStorage.getItem(AGE_STORAGE_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    return Date.now() - ts < AGE_EXPIRY_MS;
  } catch {
    return false;
  }
}

function isPopupDismissed(): boolean {
  try {
    return !!sessionStorage.getItem(SESSION_KEY);
  } catch {
    return false;
  }
}

export default function MemorialDayPopup() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleShow() {
    if (timerRef.current) return; // already scheduled
    timerRef.current = setTimeout(() => setVisible(true), 1000);
  }

  useEffect(() => {
    if (!isPromoActive()) return;
    if (isPopupDismissed()) return;

    // Returning visitor — age gate won't show, safe to schedule immediately
    if (isAgeAlreadyVerified()) {
      scheduleShow();
      return;
    }

    // New visitor — wait for age gate confirmation before showing
    const handleAgeVerified = () => {
      if (isPopupDismissed()) return;
      scheduleShow();
    };

    window.addEventListener("peptobuy:ageVerified", handleAgeVerified);
    return () => {
      window.removeEventListener("peptobuy:ageVerified", handleAgeVerified);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Memorial Day Sale"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div
          style={{ background: "linear-gradient(135deg,#8B0000 0%,#c0392b 100%)" }}
          className="px-6 py-5 text-center text-white"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-80">
            ⚡ Limited Time
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight">
            🔥 FLASH SALE — TODAY ONLY
          </h2>
          <p className="mt-1 text-sm font-medium opacity-80">
            Hurry — this offer expires at midnight tonight
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close popup"
          className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition-colors hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Promo cards */}
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {/* Card 1 — Stock alert */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xl">🚨</p>
            <p className="mt-1.5 text-sm font-black text-red-800">
              STOCK ALERT
            </p>
            <p className="mt-1 text-[12px] font-bold text-red-700">⚠️ BAC Water — Low Quantity — Act Fast!</p>
            <p className="mt-1 text-[12px] font-bold" style={{ color: "#cc5500" }}>⚠️ Syringes — extremely limited</p>
            <p className="mt-1 text-[12px] font-bold" style={{ color: "#cc5500" }}>⚠️ RTGLP3 (Reta 🐀) — Only 6 left</p>
            <p className="mt-1 text-[12px] font-bold" style={{ color: "#cc5500" }}>⚠️ Free GHK-Cu vials — Only 3 remaining</p>
          </div>

          {/* Card 2 — Free GHK-Cu on $250+ */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xl">💛</p>
            <p className="mt-1.5 text-sm font-black text-amber-800">
              FREE GHK-Cu on $250+
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-amber-700">
              Spend $250 or more and get a FREE GHK-Cu (100mg) vial added to your order.
            </p>
            <p className="mt-2 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
              Auto-applied at $250+
            </p>
          </div>

          {/* Card 3 — Free Shipping on $250+ (spans both columns) */}
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 sm:col-span-2">
            <div className="flex items-center gap-3">
              <span className="text-xl">🚚</span>
              <div>
                <p className="text-sm font-black text-sky-800">FREE Shipping on Orders $250+</p>
                <p className="mt-0.5 text-[12px] text-sky-700">
                  Spend $250 or more and standard shipping is on us — automatically applied at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-zinc-100 px-5 pb-5">
          <Link
            href="/shop"
            onClick={dismiss}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#8B0000 0%,#c0392b 100%)" }}
          >
            🔥 Shop the Flash Sale →
          </Link>
          <button
            onClick={dismiss}
            className="mt-2 w-full text-center text-xs text-zinc-400 transition-colors hover:text-zinc-600"
          >
            No thanks, dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
