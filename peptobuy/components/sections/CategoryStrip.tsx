import Link from "next/link";
import { ArrowRight, LayoutGrid, Flame, HeartPulse, Dumbbell } from "lucide-react";
import { products, shopCategories, categoryToSlug, type Category } from "@/lib/products";

const CATEGORY_META: Record<Category, { icon: React.ElementType; description: string }> = {
  "Weight Loss": {
    icon: Flame,
    description: "GLP receptor agonist peptides",
  },
  "Recovery & Healing": {
    icon: HeartPulse,
    description: "BPC-157, TB-500, GHK-Cu, MOTS-C",
  },
  "Muscle Growth": {
    icon: Dumbbell,
    description: "Tesamorelin / TESA",
  },
  Essentials: {
    icon: LayoutGrid,
    description: "",
  },
};

const CARD =
  "group flex min-w-[160px] flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-accent/50 hover:shadow-[0_4px_24px_rgba(255,45,120,0.08)] sm:min-w-0";

export default function CategoryStrip() {
  const totalProducts = products.length;
  const countByCategory = (cat: Category) =>
    products.filter((p) => p.category === cat).length;

  return (
    <section className="border-y border-border bg-surface-1 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              Explore
            </p>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-900 sm:flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* All Products + 3 shopCategories = 4 cards */}
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">

          {/* All Products card */}
          <Link href="/shop" className={CARD}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/8 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
              <LayoutGrid size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-900">All Products</p>
              <p className="mt-0.5 text-xs text-zinc-500">Full catalog</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {totalProducts} items
              </span>
              <ArrowRight
                size={13}
                className="text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </div>
          </Link>

          {shopCategories.map((cat) => {
            const { icon: Icon, description } = CATEGORY_META[cat];
            const count = countByCategory(cat);
            const slug = categoryToSlug(cat);
            return (
              <Link key={cat} href={`/shop?category=${slug}`} className={CARD}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/8 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-900">{cat}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {count} item{count !== 1 ? "s" : ""}
                  </span>
                  <ArrowRight
                    size={13}
                    className="text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
