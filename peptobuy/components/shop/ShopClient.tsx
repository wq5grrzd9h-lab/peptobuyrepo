"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, SlidersHorizontal, PackageX } from "lucide-react";
import {
  products,
  shopCategories,
  categoryToSlug,
  slugToCategory,
  type Category,
} from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";
import PriceRangeSlider from "@/components/shop/PriceRangeSlider";
import CTABoxes from "@/components/sections/CTABoxes";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

interface Filters {
  categories: Category[];
  priceRange: [number, number];
  inStockOnly: boolean;
  sortBy: SortOption;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICE_MIN = 0;
const PRICE_MAX = 200;

const DEFAULT_FILTERS: Filters = {
  categories: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  inStockOnly: false,
  sortBy: "featured",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured",   label: "Featured" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest",     label: "Newest" },
];

// Count per shop category (Essentials excluded — BAC Water shows under All)
const CATEGORY_COUNTS = Object.fromEntries(
  shopCategories.map((cat) => [cat, products.filter((p) => p.category === cat).length])
) as Record<Category, number>;

// ─── FilterPanel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const toggleCategory = (cat: Category) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > PRICE_MIN ||
    filters.priceRange[1] < PRICE_MAX ||
    filters.inStockOnly;

  return (
    <div className="flex flex-col gap-7">
      {/* Sort */}
      <div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sort By</p>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as SortOption })}
            className="w-full appearance-none rounded-lg border border-border bg-surface-2 py-2.5 pl-3 pr-8 text-sm text-zinc-900 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Category checkboxes — shopCategories only (no Essentials) */}
      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Categories</p>
        <ul className="flex flex-col gap-3">
          {shopCategories.map((cat) => {
            const checked = filters.categories.includes(cat);
            return (
              <li key={cat}>
                <label className="group flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={[
                        "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded border transition-all duration-150",
                        checked ? "border-accent bg-accent" : "border-border group-hover:border-zinc-300",
                      ].join(" ")}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleCategory(cat)} />
                    <span className={["text-sm transition-colors", checked ? "font-medium text-zinc-900" : "text-zinc-500 group-hover:text-zinc-900"].join(" ")}>
                      {cat}
                    </span>
                  </div>
                  <span className="text-[11px] tabular-nums text-zinc-300">{CATEGORY_COUNTS[cat]}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-px bg-border" />

      {/* Price Range */}
      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Price Range</p>
        <PriceRangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          value={filters.priceRange}
          onChange={(range) => onChange({ ...filters, priceRange: range })}
        />
      </div>

      <div className="h-px bg-border" />

      {/* In Stock Only */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-600">In Stock Only</p>
        <button
          role="switch"
          aria-checked={filters.inStockOnly}
          onClick={() => onChange({ ...filters, inStockOnly: !filters.inStockOnly })}
          className={["relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200", filters.inStockOnly ? "bg-accent" : "border border-border bg-surface-2"].join(" ")}
        >
          <span className={["inline-block h-[15px] w-[15px] transform rounded-full bg-white shadow transition-transform duration-200", filters.inStockOnly ? "translate-x-[21px]" : "translate-x-[3px]"].join(" ")} />
        </button>
      </div>

      {hasActiveFilters && (
        <button onClick={() => onChange(DEFAULT_FILTERS)} className="text-left text-xs font-semibold text-accent hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-1 px-8 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2">
        <PackageX size={22} className="text-zinc-300" />
      </div>
      <h3 className="mb-2 text-base font-bold text-zinc-900">No products found</h3>
      <p className="mb-7 max-w-xs text-sm text-zinc-400">
        No products match your current filters. Try broadening your search or clearing the filters.
      </p>
      <button onClick={onClear} className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover">
        Clear all filters
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-1">
          <div className="skeleton aspect-square w-full" />
          <div className="flex flex-col gap-3 p-4">
            <div className="skeleton h-2.5 w-16 rounded-full" />
            <div className="skeleton h-4 w-3/4 rounded-full" />
            <div className="skeleton h-5 w-1/3 rounded-full" />
            <div className="mt-2 skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShopClient({ initialCategory }: { initialCategory?: string }) {
  const router = useRouter();

  // Derive initial state from URL param (server-rendered searchParams prop)
  const [filters, setFilters] = useState<Filters>(() => {
    const cat = initialCategory ? slugToCategory(initialCategory) : null;
    return { ...DEFAULT_FILTERS, categories: cat ? [cat] : [] };
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== "undefined" && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq("track", "ViewContent");
    }
  }, []);

  // Sync URL when category selection changes
  useEffect(() => {
    const slug =
      filters.categories.length === 1 ? categoryToSlug(filters.categories[0]) : null;
    router.replace(slug ? `/shop?category=${slug}` : "/shop", { scroll: false });
  }, [filters.categories]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setDrawerOpen(false); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Filtered + sorted products — "All Products" includes every category (Essentials too)
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category as Category))
        return false;
      if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
      if (filters.inStockOnly && !p.inStock) return false;
      return true;
    });
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":  return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "newest": {
          const ai = products.findIndex((p) => p.id === a.id);
          const bi = products.findIndex((p) => p.id === b.id);
          return bi - ai;
        }
        default: return 0;
      }
    });
  }, [filters]);

  // Non-category active tags (price, stock)
  const activeTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];
    filters.categories.forEach((cat) => tags.push({ key: `cat:${cat}`, label: cat }));
    if (filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < PRICE_MAX) {
      tags.push({ key: "price", label: `$${filters.priceRange[0]} – $${filters.priceRange[1]}` });
    }
    if (filters.inStockOnly) tags.push({ key: "inStock", label: "In Stock" });
    return tags;
  }, [filters]);

  const removeTag = useCallback((key: string) => {
    if (key.startsWith("cat:")) {
      const cat = key.slice(4) as Category;
      setFilters((f) => ({ ...f, categories: f.categories.filter((c) => c !== cat) }));
    } else if (key === "price") {
      setFilters((f) => ({ ...f, priceRange: [PRICE_MIN, PRICE_MAX] }));
    } else if (key === "inStock") {
      setFilters((f) => ({ ...f, inStockOnly: false }));
    }
  }, []);

  // Active pill: null = All Products
  const activeCategory: Category | null =
    filters.categories.length === 1 ? filters.categories[0] : null;

  const selectCategory = (cat: Category | null) =>
    setFilters((f) => ({ ...f, categories: cat ? [cat] : [] }));

  const pillBase =
    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all";
  const pillActive =
    "border-accent bg-accent text-white shadow-[0_0_14px_rgba(255,45,120,0.22)]";
  const pillIdle =
    "border-border bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Catalog</p>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
            {activeCategory ?? "All Products"}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            {visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}
            {filters.categories.length > 0 || filters.inStockOnly || filters.priceRange[0] > PRICE_MIN || filters.priceRange[1] < PRICE_MAX ? " found" : " available"}
          </p>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 lg:hidden"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeTags.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
              {activeTags.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Category pills ───────────────────────────────────── */}
      <div className="-mx-4 mb-7 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <button
          onClick={() => selectCategory(null)}
          className={[pillBase, activeCategory === null ? pillActive : pillIdle].join(" ")}
        >
          All Products
        </button>

        {shopCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => selectCategory(cat)}
            className={[pillBase, activeCategory === cat ? pillActive : pillIdle].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Non-category active filter tags ─────────────────── */}
      {activeTags.filter((t) => !t.key.startsWith("cat:")).length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400">Filtered by:</span>
          {activeTags
            .filter((t) => !t.key.startsWith("cat:"))
            .map((tag) => (
              <button
                key={tag.key}
                onClick={() => removeTag(tag.key)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-zinc-600 transition-all hover:border-accent/40 hover:text-zinc-900"
              >
                {tag.label}
                <X size={11} className="shrink-0" />
              </button>
            ))}
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="ml-1 text-xs font-semibold text-accent hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── CTA boxes ───────────────────────────────────────── */}
      <div className="-mx-4 mb-10 sm:mx-0">
        <CTABoxes />
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="flex items-start gap-8">

        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-surface-1 p-5">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Product grid */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <ProductGridSkeleton />
          ) : visibleProducts.length === 0 ? (
            <EmptyState onClear={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────── */}
      <div
        aria-hidden={!drawerOpen}
        className={["fixed inset-0 z-50 lg:hidden", drawerOpen ? "visible" : "invisible pointer-events-none"].join(" ")}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={["absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300", drawerOpen ? "opacity-100" : "opacity-0"].join(" ")}
        />
        <div
          className={["absolute inset-y-0 left-0 flex w-[17rem] flex-col bg-surface-1 shadow-2xl transition-transform duration-300 ease-out", drawerOpen ? "translate-x-0" : "-translate-x-full"].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-zinc-900">Filters</h2>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close filters" className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
          <div className="border-t border-border px-5 py-4">
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
            >
              View {visibleProducts.length} {visibleProducts.length === 1 ? "Product" : "Products"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
