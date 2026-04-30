"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, TrendingUp } from "lucide-react";
import { products, categories } from "@/lib/products";
import { useSearch } from "@/context/SearchContext";

const QUICK_SEARCHES = ["Whey protein", "Creatine", "Recovery", "Bundles"];

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-accent/25 text-white not-italic">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchOverlay() {
  const { isOpen, close } = useSearch();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus + keyboard close
  useEffect(() => {
    if (!isOpen) { setQuery(""); return; }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Live filter
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const hasQuery = query.trim().length >= 2;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col"
      style={{ animation: "overlay-in 0.2s ease-out both" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/92 backdrop-blur-md"
        onClick={close}
      />

      {/* Panel */}
      <div className="relative mx-auto w-full max-w-2xl px-4 pt-[5vh]">
        {/* Search input */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-1 px-5 py-4 shadow-[0_8px_48px_rgba(0,0,0,0.6)]">
          <Search size={20} className="shrink-0 text-white/30" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-base text-white placeholder:text-white/25 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-md p-1 text-white/30 transition-colors hover:text-white/60"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={close}
            className="ml-1 flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-white/30 transition-colors hover:text-white/60"
          >
            ESC
          </button>
        </div>

        {/* Results / empty states */}
        <div className="mt-3 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-surface-1 shadow-[0_8px_48px_rgba(0,0,0,0.5)]">
          {/* ── Has results ── */}
          {hasQuery && results.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white/30">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  onClick={close}
                  className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                >
                  {/* Image */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {highlight(product.name, query)}
                    </p>
                    <p className="text-xs text-white/40">{product.category}</p>
                    {!product.inStock && (
                      <p className="text-[10px] text-red-400/70">Out of stock</p>
                    )}
                  </div>

                  {/* Price + arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums text-white">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-[10px] tabular-nums text-white/30 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* ── No results ── */}
          {hasQuery && results.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center">
              <Search size={28} className="mb-3 text-white/15" />
              <p className="text-sm font-semibold text-white/50">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-white/30">
                Try &ldquo;protein&rdquo;, &ldquo;creatine&rdquo;, or browse categories below
              </p>
            </div>
          )}

          {/* ── Default state ── */}
          {!hasQuery && (
            <div className="p-5 space-y-5">
              {/* Quick searches */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/30">
                  <TrendingUp size={12} /> Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-white/55 transition-colors hover:border-accent/40 hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse categories */}
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/30">
                  Browse categories
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/shop?category=${cat}`}
                      onClick={close}
                      className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-medium text-white/65 transition-colors hover:border-accent/40 hover:text-white"
                    >
                      {cat}
                      <ArrowRight size={13} className="text-white/20" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
