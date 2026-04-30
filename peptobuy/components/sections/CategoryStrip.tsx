import Link from "next/link";
import { ArrowRight, FlaskConical, HeartPulse, Package, Leaf } from "lucide-react";
import { categories, products, type Category } from "@/lib/products";

const CATEGORY_META: Record<
  Category,
  { icon: React.ElementType; description: string; href: string }
> = {
  Supplements: {
    icon: FlaskConical,
    description: "Protein, creatine & more",
    href: "/shop/supplements",
  },
  Recovery: {
    icon: HeartPulse,
    description: "Sleep, joints & inflammation",
    href: "/shop/recovery",
  },
  Bundles: {
    icon: Package,
    description: "Save up to 25% with stacks",
    href: "/shop/bundles",
  },
  Essentials: {
    icon: Leaf,
    description: "Daily vitamins & omegas",
    href: "/shop/essentials",
  },
};

export default function CategoryStrip() {
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
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-white/40 transition-colors hover:text-white sm:flex"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Scrollable strip */}
        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {categories.map((cat) => {
            const { icon: Icon, description, href } = CATEGORY_META[cat];
            const count = countByCategory(cat);

            return (
              <Link
                key={cat}
                href={href}
                className="group flex min-w-[200px] flex-col gap-4 rounded-2xl border border-border bg-surface-2 p-6 transition-all duration-200 hover:border-accent/50 hover:shadow-[0_0_24px_rgba(255,45,120,0.1)] sm:min-w-0"
              >
                {/* Icon circle */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <Icon size={20} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="font-bold text-white">{cat}</p>
                  <p className="mt-0.5 text-xs text-white/40">{description}</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-white/25">
                    {count} product{count !== 1 ? "s" : ""}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-white/25 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
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
