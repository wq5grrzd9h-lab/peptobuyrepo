"use client";

import { useState } from "react";
import { FlaskConical, ExternalLink, Copy, Check, Clock, ShieldCheck } from "lucide-react";
import { Product } from "@/lib/products";

export default function COASection({ product }: { product: Product }) {
  const [copied, setCopied] = useState(false);

  const hasCoA = !!(product.coaUrl || product.coaText);

  const handleCopy = async () => {
    if (!product.coaText) return;
    await navigator.clipboard.writeText(product.coaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="mt-16">
      {/* Header row */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/8">
            <FlaskConical size={18} className="text-accent" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900">
            Lab Testing &amp; Certificate of Analysis
          </h2>
        </div>

        {hasCoA ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <ShieldCheck size={11} />
            Lab Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
            <Clock size={11} />
            Pending
          </span>
        )}
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {hasCoA ? (
          <>
            {/* COA URL — external report link */}
            {product.coaUrl && (
              <div className="flex flex-col gap-4 border-b border-zinc-100 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 text-sm font-semibold text-zinc-900">
                    Third-Party Lab Report
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    Full COA including HPLC chromatogram, MS data, and sterility results.
                    Hosted externally by our testing laboratory.
                  </p>
                </div>
                <a
                  href={product.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(255,45,120,0.18)] transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(255,45,120,0.28)] active:scale-[0.98]"
                >
                  View COA Report
                  <ExternalLink size={13} />
                </a>
              </div>
            )}

            {/* COA Text — inline monospace block */}
            {product.coaText && (
              <div>
                {/* Block header bar */}
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                    </div>
                    <span className="ml-1 text-[11px] font-mono font-medium text-zinc-400">
                      {product.id}-coa.txt
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
                    aria-label="Copy COA text"
                  >
                    {copied ? (
                      <>
                        <Check size={11} className="text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Pre-formatted report */}
                <div className="overflow-x-auto">
                  <pre className="p-5 font-mono text-[12px] leading-relaxed text-zinc-700 whitespace-pre">
                    {product.coaText}
                  </pre>
                </div>
              </div>
            )}

            {/* Trust footer strip */}
            <div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100 bg-zinc-50">
              {[
                { label: "HPLC Purity Tested" },
                { label: "Mass-Spec Confirmed" },
                { label: "Third-Party Verified" },
              ].map(({ label }) => (
                <div key={label} className="flex items-center justify-center gap-1.5 px-3 py-3">
                  <ShieldCheck size={11} className="shrink-0 text-emerald-500" />
                  <span className="text-center text-[10px] font-semibold text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Pending state */
          <div className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-zinc-900">COA Pending</p>
              <p className="text-sm leading-relaxed text-zinc-500">
                COA pending — batch currently under third-party testing. Results will be posted
                within 48 hours of shipment.
              </p>
              <p className="mt-3 text-[11px] text-zinc-400">
                All batches are independently tested before release. Contact us for the
                latest testing status for this lot.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
