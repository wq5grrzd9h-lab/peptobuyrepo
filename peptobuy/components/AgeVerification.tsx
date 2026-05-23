"use client";

import { useState, useEffect } from "react";
import PeptoBuyLogo from "@/components/ui/PeptoBuyLogo";

const STORAGE_KEY = "peptobuy-age-verified";
const EXPIRY_MS = 24 * 60 * 60 * 1000;

export default function AgeVerification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { ts } = JSON.parse(raw);
        if (Date.now() - ts < EXPIRY_MS) return;
      }
    } catch { /* ignore */ }
    setVisible(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleEnter = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
    } catch { /* ignore */ }
    document.body.style.overflow = "";
    setVisible(false);
    // Signal to MemorialDayPopup that age gate was just confirmed
    window.dispatchEvent(new CustomEvent("peptobuy:ageVerified"));
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Dark base */}
      <div className="absolute inset-0 bg-zinc-950/97" />

      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute h-[700px] w-[700px] rounded-full bg-accent/[0.18] blur-[130px]"
          style={{
            top: "-15%",
            left: "-10%",
            animation: "age-blob-1 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute h-[500px] w-[500px] rounded-full bg-accent/[0.12] blur-[110px]"
          style={{
            bottom: "-15%",
            right: "-10%",
            animation: "age-blob-2 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute h-[280px] w-[280px] rounded-full bg-accent/[0.10] blur-[80px]"
          style={{
            top: "45%",
            left: "55%",
            animation: "age-blob-3 28s ease-in-out infinite",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,45,120,0.08)] backdrop-blur-2xl"
        style={{ animation: "age-card-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}
      >
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <PeptoBuyLogo flaskH={58} layout="stacked" darkBg />
        </div>

        {/* Divider */}
        <div className="mb-7 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

        {/* Headline */}
        <h2
          className="mb-3 text-center text-[1.6rem] font-black tracking-tight text-white"
          style={{ lineHeight: 1.15 }}
        >
          Research Access Only
        </h2>

        {/* Body */}
        <p className="mb-8 text-center text-sm leading-relaxed text-zinc-400">
          You must be{" "}
          <span className="font-semibold text-white">21 or older</span> and a{" "}
          <span className="font-semibold text-white">qualified researcher</span> to
          enter this site. All products are for laboratory use only.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleEnter}
            className="flex w-full items-center justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_28px_rgba(255,45,120,0.40)] transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_40px_rgba(255,45,120,0.55)] active:scale-[0.98]"
          >
            I am 21+ and a Researcher — Enter
          </button>
          <button
            onClick={handleExit}
            className="flex w-full items-center justify-center rounded-xl border border-zinc-700 px-6 py-3.5 text-sm font-semibold text-zinc-400 transition-all duration-200 hover:border-zinc-500 hover:text-zinc-200"
          >
            Exit
          </button>
        </div>

        {/* Legal footnote */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600">
          By entering, you confirm compliance with all applicable local, state,
          and federal laws. Verification is stored for 24 hours.
        </p>
      </div>
    </div>
  );
}
