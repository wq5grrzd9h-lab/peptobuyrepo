import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle2, XCircle, FlaskConical, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { products } from "@/lib/products";
import Badge, { resolveBadgeVariant } from "@/components/ui/Badge";
import ProductActions from "@/components/product/ProductActions";
import ProductTabs from "@/components/product/ProductTabs";
import COASection from "@/components/product/COASection";
import ProductCard from "@/components/ui/ProductCard";
import { TestimonialsCompact } from "@/components/sections/Testimonials";

export function generateStaticParams() { return products.map((p) => ({ id: p.id })); }

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = products.find((p) => p.id === params.id);
  if (!product) return {};
  const url = `https://peptobuy.com/shop/${product.id}`;
  return {
    title: `${product.name} Research Peptide`,
    description: product.description,
    openGraph: {
      title: `${product.name} Research Peptide | PeptoBuy`,
      description: product.description,
      url,
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: {
      card: "summary",
      title: `${product.name} Research Peptide | PeptoBuy`,
      description: product.description,
    },
  };
}

const TRUST = [
  { icon: FlaskConical, label: "Lab Tested", sub: "Third-party certified" },
  { icon: Truck, label: "Fast Shipping", sub: "Same-day before 3 PM" },
  { icon: ShieldCheck, label: "All Sales Final", sub: "No returns or refunds" },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();

  // Peptide research products do not carry sale/discount pricing
  const discount = null;
  const related = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `https://peptobuy.com${product.image}`,
    brand: { "@type": "Brand", name: "PeptoBuy" },
    offers: product.doses.map((d) => ({
      "@type": "Offer",
      name: d.size,
      price: d.price.toFixed(2),
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://peptobuy.com/shop/${product.id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-900">Home</Link>
            <span>/</span>
            <Link href="/shop" className="transition-colors hover:text-zinc-900">Shop</Link>
            <span>/</span>
            <span className="text-zinc-600">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/shop" className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-900">
          <ChevronLeft size={15} /> Back to Shop
        </Link>

        {/* Product layout */}
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image */}
          <div className="lg:sticky lg:top-24">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
              {product.badge && <div className="absolute left-4 top-4"><Badge label={product.badge} variant={resolveBadgeVariant(product.badge)} /></div>}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{product.category}</p>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 lg:text-[2.5rem]">{product.name}</h1>

            <p className="text-sm leading-relaxed text-zinc-600">{product.description}</p>
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <><CheckCircle2 size={15} className="text-emerald-600" /><span className="text-sm font-semibold text-emerald-600">In Stock — Ready to Ship</span></>
              ) : (
                <><XCircle size={15} className="text-zinc-400" /><span className="text-sm font-semibold text-zinc-400">Currently Out of Stock</span></>
              )}
            </div>
            <div className="h-px bg-zinc-200" />
            <ProductActions product={product} />

            {/* Research disclaimer */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[11px] leading-relaxed text-amber-800">
                <span className="font-bold">Research Use Only.</span> This product is intended for in vitro research and laboratory use only. It is not approved by the FDA for human use. By purchasing, you confirm you are a qualified researcher acting in compliance with all applicable laws.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3.5 text-center">
                  <Icon size={17} className="text-accent" />
                  <div><p className="text-[12px] font-bold text-zinc-800">{label}</p><p className="text-[10px] leading-tight text-zinc-400">{sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-zinc-200 pt-12">
          <ProductTabs product={product} />
        </div>

        {/* COA */}
        <div className="border-t border-zinc-200 pt-4">
          <COASection />
        </div>

        {/* Testimonials */}
        <div className="mt-16 border-t border-zinc-200 pt-10">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Researcher Reviews</p>
          <h2 className="mb-6 text-2xl font-black tracking-tight text-zinc-900">What Researchers Are Saying</h2>
          <TestimonialsCompact />
        </div>

        {/* Related */}
        <div className="mt-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900">You May Also Like</h2>
            <Link href="/shop" className="hidden items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-900 sm:flex">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
