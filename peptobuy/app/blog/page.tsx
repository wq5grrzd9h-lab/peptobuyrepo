import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { posts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Research Blog | PeptoBuy",
  description:
    "In-depth research guides covering BPC-157, TB-500, RTGLP3, MOTS-C, NAD+, and other research peptides. For qualified researchers and laboratory professionals.",
  openGraph: {
    title: "Research Blog | PeptoBuy",
    description: "Research guides on peptides for qualified researchers.",
    url: "https://peptobuy.com/blog",
  },
};

const CATEGORY_COLOR: Record<string, string> = {
  "Recovery & Healing": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "Weight Loss":        "text-rose-600   bg-rose-50   border-rose-200",
  "Muscle Growth":      "text-blue-600   bg-blue-50   border-blue-200",
  "Essentials":         "text-violet-600 bg-violet-50 border-violet-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <FlaskConical size={20} className="text-accent" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Research Library</p>
          </div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            Peptide Research Guides
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-500">
            Educational overviews of research-grade peptide compounds — mechanisms, study models, and laboratory protocols. For qualified researchers and institutional buyers.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const catStyle = CATEGORY_COLOR[post.category] ?? "text-zinc-600 bg-zinc-50 border-zinc-200";
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
              >
                {/* Accent bar */}
                <div className="h-1 w-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${catStyle}`}>
                      {post.category}
                    </span>
                  </div>

                  <h2 className="text-base font-bold leading-snug text-zinc-900 transition-colors group-hover:text-accent">
                    {post.title}
                  </h2>

                  <p className="flex-1 text-sm leading-relaxed text-zinc-500 line-clamp-3">
                    {post.metaDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <span className="text-[11px] text-zinc-400">{formatDate(post.publishedAt)}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent">
                      Read <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="border-t border-border bg-surface-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs leading-relaxed text-zinc-400 max-w-3xl">
            All articles on this site are for informational and educational purposes only. None of the content constitutes medical advice or implies clinical efficacy. All referenced compounds are intended for in vitro research use only and are not approved by the FDA for human use.
          </p>
        </div>
      </div>
    </div>
  );
}
