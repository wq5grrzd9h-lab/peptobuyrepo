import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft, FlaskConical } from "lucide-react";
import { posts, getPost } from "@/lib/blog";
import { products } from "@/lib/products";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    openGraph: {
      title: `${post.title} | PeptoBuy`,
      description: post.metaDescription,
      url: `https://peptobuy.com/blog/${post.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${post.title} | PeptoBuy`,
      description: post.metaDescription,
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const CATEGORY_COLOR: Record<string, string> = {
  "Recovery & Healing": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Weight Loss":        "text-rose-600   bg-rose-50   border-rose-200",
  "Muscle Growth":      "text-blue-600   bg-blue-50   border-blue-200",
  "Essentials":         "text-violet-600 bg-violet-50 border-violet-200",
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const product = post.productId ? products.find((p) => p.id === post.productId) : null;
  const catStyle = CATEGORY_COLOR[post.category] ?? "text-zinc-600 bg-zinc-50 border-zinc-200";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    publisher: {
      "@type": "Organization",
      name: "PeptoBuy",
      url: "https://peptobuy.com",
    },
    mainEntityOfPage: `https://peptobuy.com/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Link href="/" className="transition-colors hover:text-zinc-900">Home</Link>
            <span>/</span>
            <Link href="/blog" className="transition-colors hover:text-zinc-900">Blog</Link>
            <span>/</span>
            <span className="text-zinc-600 line-clamp-1">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Back */}
        <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-900">
          <ChevronLeft size={15} /> Back to Research Library
        </Link>

        {/* Header */}
        <header className="mb-10 border-b border-zinc-100 pb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${catStyle}`}>
              {post.category}
            </span>
            <span className="text-[11px] text-zinc-400">{formatDate(post.publishedAt)}</span>
          </div>
          <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.5rem]">
            {post.title}
          </h1>
          <p className="text-base leading-relaxed text-zinc-500">{post.metaDescription}</p>
        </header>

        {/* Body */}
        <div className="space-y-8 text-sm leading-relaxed text-zinc-600">
          {post.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="mb-3 text-xl font-bold tracking-tight text-zinc-900">
                  {section.heading}
                </h2>
              )}
              <p>{section.body}</p>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-start gap-4 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
              <FlaskConical size={20} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-sm font-bold text-zinc-900">Available at PeptoBuy — For Research Use Only</p>
              <p className="mb-4 text-sm leading-relaxed text-zinc-500">
                {product
                  ? `Research-grade ${product.name} supplied as lyophilized powder. Third-party tested, COA available on request. Minimum purity ≥98%.`
                  : "Research-grade compounds supplied as lyophilized powder. Third-party tested, COA available on request."}
              </p>
              <div className="flex flex-wrap gap-3">
                {product && (
                  <Link
                    href={`/shop/${product.id}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover"
                  >
                    View Product <ArrowRight size={14} />
                  </Link>
                )}
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition-all hover:border-zinc-300 hover:text-zinc-900"
                >
                  Browse All Compounds <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-100 bg-zinc-50/60 px-6 py-3">
            <p className="text-[11px] leading-relaxed text-zinc-400">
              ⚠ All products are for in vitro research use only. Not intended for human or animal consumption. Not approved by the FDA. By purchasing, you confirm compliance with all applicable laws.
            </p>
          </div>
        </div>

        {/* Other articles */}
        <div className="mt-12 border-t border-zinc-100 pt-10">
          <h2 className="mb-6 text-lg font-bold text-zinc-900">More Research Guides</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {posts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 4)
              .map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-zinc-200 p-4 transition-all hover:border-zinc-300 hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/8">
                    <FlaskConical size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 transition-colors group-hover:text-accent">
                      {related.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{formatDate(related.publishedAt)}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}
