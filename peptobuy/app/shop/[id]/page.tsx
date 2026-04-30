import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Truck,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { products } from "@/lib/products";
import Badge, { resolveBadgeVariant } from "@/components/ui/Badge";
import ProductActions from "@/components/product/ProductActions";
import ProductTabs from "@/components/product/ProductTabs";
import ProductCard from "@/components/ui/ProductCard";

// ─── Static generation ────────────────────────────────────────────────────────

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = products.find((p) => p.id === params.id);
  if (!product) return {};
  return {
    title: `${product.name} — PeptoBuy`,
    description: product.description,
  };
}

// ─── Trust badges ─────────────────────────────────────────────────────────────

const TRUST = [
  { icon: FlaskConical, label: "Lab Tested", sub: "Third-party certified" },
  { icon: Truck, label: "Fast Shipping", sub: "Same-day before 3 PM" },
  { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free policy" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  // Related: same category first, then fill from others
  const related = [
    ...products.filter(
      (p) => p.id !== product.id && p.category === product.category
    ),
    ...products.filter(
      (p) => p.id !== product.id && p.category !== product.category
    ),
  ].slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-white/35">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="transition-colors hover:text-white">
              Shop
            </Link>
            <span>/</span>
            <span className="text-white/60">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ChevronLeft size={15} />
          Back to Shop
        </Link>

        {/* ── Product layout ──────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left — image */}
          <div className="lg:sticky lg:top-24">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-surface-1">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              {/* Overlays */}
              {product.badge && (
                <div className="absolute left-4 top-4">
                  <Badge
                    label={product.badge}
                    variant={resolveBadgeVariant(product.badge)}
                  />
                </div>
              )}
              {discount && (
                <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                  -{discount}% off
                </div>
              )}
            </div>
          </div>

          {/* Right — details */}
          <div className="flex flex-col gap-5">
            {/* Category */}
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white lg:text-[2.5rem]">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-white/35 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {discount && (
                <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-sm font-bold text-accent">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short description */}
            <p className="text-sm leading-relaxed text-white/55">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    In Stock — Ready to Ship
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={15} className="text-white/30" />
                  <span className="text-sm font-semibold text-white/30">
                    Currently Out of Stock
                  </span>
                </>
              )}
            </div>

            <div className="h-px bg-border" />

            {/* Quantity + CTA (interactive — client component) */}
            <ProductActions product={product} />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-1 px-3 py-3.5 text-center"
                >
                  <Icon size={17} className="text-accent" />
                  <div>
                    <p className="text-[12px] font-bold text-white">{label}</p>
                    <p className="text-[10px] leading-tight text-white/30">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <div className="mt-16 border-t border-border pt-12">
          <ProductTabs product={product} />
        </div>

        {/* ── You May Also Like ─────────────────────────────── */}
        <div className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white">
              You May Also Like
            </h2>
            <Link
              href="/shop"
              className="hidden items-center gap-1 text-sm font-medium text-white/40 transition-colors hover:text-white sm:flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
