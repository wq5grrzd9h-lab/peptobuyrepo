"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { X, SlidersHorizontal, Search, PackageX } from "lucide-react";
import { products, categories, type Category } from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";
import PriceRangeSlider from "@/components/shop/PriceRangeSlider";

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
const PRICE_MAX = 100;

const DEFAULT_FILTERS: Filters = {
  categories: [],
  priceRange: [PRICE_MIN, PRICE_MAX],
  inStockOnly: false,
  sortBy: "featured",
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

const CATEGORY_COUNTS = Object.fromEntries(
  categories.map((cat) => [cat, products.filter((p) => p.category === cat).length])
) as Record<Category, number>;

// ─── FilterPanel (shared by sidebar + drawer) ────────────────────────────────

function FilterPanel({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
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
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/35">
          Sort By
        </p>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ ...filters, sortBy: e.target.value as SortOption })
            }
            className="w-full appearance-none rounded-lg border border-border bg-surface-2 py-2.5 pl-3 pr-8 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path
                d="M1 1l4 4 4-4"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Categories */}
      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/35">
          Categories
        </p>
        <ul className="flex flex-col gap-3">
          {categories.map((cat) => {
            const checked = filters.categories.includes(cat);
            return (
              <li key={cat}>
                <label className="group flex cursor-pointer items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Custom checkbox */}
                    <div
                      className={[
                        "flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded border transition-all duration-150",
                        checked
                          ? "border-accent bg-accent"
                          : "border-border group-hover:border-white/30",
                      ].join(" ")}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path
                            d="M1 3.5l2.5 2.5 4.5-5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span
                      className={[
                        "text-sm transition-colors",
                        checked
                          ? "font-medium text-white"
                          : "text-white/55 group-hover:text-white/90",
                      ].join(" ")}
                    >
                      {cat}
                    </span>
                  </div>
                  <span className="text-[11px] tabular-nums text-white/20">
                    {CATEGORY_COUNTS[cat]}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-px bg-border" />

      {/* Price Range */}
      <div>
        <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-white/35">
          Price Range
        </p>
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
        <p className="text-sm font-medium text-white/70">In Stock Only</p>
        <button
          role="switch"
          aria-checked={filters.inStockOnly}
          onClick={() =>
            onChange({ ...filters, inStockOnly: !filters.inStockOnly })
          }
          className={[
            "relative inline-flex h-[22px] w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
            filters.inStockOnly
              ? "bg-accent"
              : "border border-border bg-surface-2",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-[15px] w-[15px] transform rounded-full bg-white shadow transition-transform duration-200",
              filters.inStockOnly ? "translate-x-[21px]" : "translate-x-[3px]",
            ].join(" ")}
          />
        </button>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-left text-xs font-semibold text-accent hover:underline"
        >
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
        <PackageX size={22} className="text-white/20" />
      </div>
      <h3 className="mb-2 text-base font-bold text-white">
        No products found
      </h3>
      <p className="mb-7 max-w-xs text-sm text-white/40">
        No products match your current filters. Try broadening your search or
        clearing the filters.
      </p>
      <button
        onClick={onClear}
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Clear all filters
      </button>
    </div>
  );
}

// ─── Product grid skeleton ────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-1"
        >
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

export default function ShopClient() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  // Close drawer on lg breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setDrawerOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Filtered + sorted products
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(p.category as Category)
      )
        return false;
      if (
        p.price < filters.priceRange[0] ||
        p.price > filters.priceRange[1]
      )
        return false;
      if (filters.inStockOnly && !p.inStock) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest": {
          const ai = products.findIndex((p) => p.id === a.id);
          const bi = products.findIndex((p) => p.id === b.id);
          return bi - ai;
        }
        default:
          return 0;
      }
    });
  }, [filters]);

  // Active filter tags
  const activeTags = useMemo(() => {
    const tags: { key: string; label: string }[] = [];
    filters.categories.forEach((cat) =>
      tags.push({ key: `cat:${cat}`, label: cat })
    );
    if (
      filters.priceRange[0] > PRICE_MIN ||
      filters.priceRange[1] < PRICE_MAX
    ) {
      tags.push({
        key: "price",
        label: `$${filters.priceRange[0]} – $${filters.priceRange[1]}`,
      });
    }
    if (filters.inStockOnly) {
      tags.push({ key: "inStock", label: "In Stock" });
    }
    return tags;
  }, [filters]);

  const removeTag = useCallback(
    (key: string) => {
      if (key.startsWith("cat:")) {
        const cat = key.slice(4) as Category;
        setFilters((f) => ({
          ...f,
          categories: f.categories.filter((c) => c !== cat),
        }));
      } else if (key === "price") {
        setFilters((f) => ({
          ...f,
          priceRange: [PRICE_MIN, PRICE_MAX],
        }));
      } else if (key === "inStock") {
        setFilters((f) => ({ ...f, inStockOnly: false }));
      }
    },
    []
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Catalog
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            All Products
          </h1>
          <p className="mt-1.5 text-sm text-white/40">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
            {activeTags.length > 0 ? " found" : " available"}
          </p>
        </div>

        {/* Mobile filter trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface-1 px-4 py-2.5 text-sm font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white lg:hidden"
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

      {/* ── Active filter tags ───────────────────────────── */}
      {activeTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/25">Filtered by:</span>
          {activeTags.map((tag) => (
            <button
              key={tag.key}
              onClick={() => removeTag(tag.key)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs font-medium text-white/65 transition-all hover:border-accent/40 hover:text-white"
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

      {/* ── Main layout ──────────────────────────────────── */}
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

      {/* ── Mobile filter drawer ─────────────────────────── */}
      <div
        aria-hidden={!drawerOpen}
        className={[
          "fixed inset-0 z-50 lg:hidden",
          drawerOpen ? "visible" : "invisible pointer-events-none",
        ].join(" ")}
      >
        {/* Backdrop */}
        <div
          onClick={() => setDrawerOpen(false)}
          className={[
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        {/* Drawer panel */}
        <div
          className={[
            "absolute inset-y-0 left-0 flex w-[17rem] flex-col bg-surface-1 shadow-2xl transition-transform duration-300 ease-out",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-white">Filters</h2>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable filter content */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>

          {/* Sticky apply button */}
          <div className="border-t border-border px-5 py-4">
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
            >
              View {visibleProducts.length}{" "}
              {visibleProducts.length === 1 ? "Product" : "Products"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
