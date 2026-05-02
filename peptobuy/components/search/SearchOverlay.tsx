"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight, TrendingUp } from "lucide-react";
import { products, categories } from "@/lib/products";
import { useSearch } from "@/context/SearchContext";

const QUICK_SEARCHES = ["BPC-157", "CJC-1295", "TB-500", "Wolverine", "BAC Water"];

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-accent/15 text-zinc-900 not-italic">{part}</mark> : part
  );
}

export default function SearchOverlay() {
  const { isOpen, close } = useSearch();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) { setQuery(""); return; }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const hasQuery = query.trim().length >= 2;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col" style={{ animation: "overlay-in 0.2s ease-out both" }}>
      <div className="absolute inset-0 bg-zinc-950/55 backdrop-blur-sm" onClick={close} />
      <div className="relative mx-auto w-full max-w-2xl px-4 pt-[5vh]">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-[0_8px_48px_rgba(0,0,0,0.15)]">
          <Search size={20} className="shrink-0 text-zinc-400" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" autoComplete="off" spellCheck={false} className="flex-1 bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none" />
          {query && <button onClick={() => setQuery("")} className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-600"><X size={16} /></button>}
          <button onClick={close} className="ml-1 flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600">ESC</button>
        </div>

        <div className="mt-3 max-h-[70vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-[0_8px_48px_rgba(0,0,0,0.12)]">
          {hasQuery && results.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">{results.length} result{results.length !== 1 ? "s" : ""}</p>
              {results.map((product) => (
                <Link key={product.id} href={`/shop/${product.id}`} onClick={close} className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-zinc-50">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <Image src={product.image} alt={product.name} fill sizes="56px" className="object-contain transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">{highlight(product.name, query)}</p>
                    <p className="text-xs text-zinc-500">{product.category}</p>
                    {!product.inStock && <p className="text-[10px] text-red-500">Out of stock</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums text-zinc-900">from ${product.doses[0].price.toFixed(2)}</p>
                      <p className="text-[10px] text-zinc-400">{product.doses[0].size}</p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-300 transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                </Link>
              ))}
            </div>
          )}
          {hasQuery && results.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center">
              <Search size={28} className="mb-3 text-zinc-300" />
              <p className="text-sm font-semibold text-zinc-500">No results for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-zinc-400">Try &ldquo;protein&rdquo;, &ldquo;creatine&rdquo;, or browse categories below</p>
            </div>
          )}
          {!hasQuery && (
            <div className="p-5 space-y-5">
              <div>
                <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400"><TrendingUp size={12} /> Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map((term) => (
                    <button key={term} onClick={() => setQuery(term)} className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50">{term}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Browse categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link key={cat} href={`/shop?category=${cat}`} onClick={close} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900">
                      {cat} <ArrowRight size={13} className="text-zinc-400" />
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
