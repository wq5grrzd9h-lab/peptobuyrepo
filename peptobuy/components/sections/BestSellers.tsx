import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { products } from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";

const BEST_SELLER_IDS = ["p1", "p2", "p4", "p7"];

export default function BestSellers() {
  const featured = BEST_SELLER_IDS.map(
    (id) => products.find((p) => p.id === id)!
  );

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5">
              <Flame size={13} className="text-accent" />
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                Most Popular
              </p>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Best Sellers
            </h2>
            <p className="mt-2 text-sm text-white/40">
              The products athletes keep coming back for.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-1 text-sm font-medium text-white/40 transition-colors hover:text-white sm:flex"
          >
            Shop all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile "see all" link */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/shop"
            className="flex items-center gap-1 text-sm font-medium text-white/50 hover:text-white"
          >
            Shop all products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
