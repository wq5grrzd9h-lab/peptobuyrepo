import { Star } from "lucide-react";

export const TESTIMONIALS = [
  {
    quote: "Ordered BPC-157 for our lab and the COA matched exactly what was advertised. Purity was confirmed at 99.2% on our end. Will be ordering again.",
    initials: "RM",
    name: "R.M.",
    title: "Research Associate",
  },
  {
    quote: "Finally a peptide supplier that actually provides third-party testing documentation without me having to chase them down. Fast shipping too.",
    initials: "JT",
    name: "J.T.",
    title: "Laboratory Professional",
  },
  {
    quote: "Ordered RTGLP3 — quality was consistent with the batch COA on request. Responsive support and discreet packaging. Exactly what I needed.",
    initials: "KL",
    name: "K.L.",
    title: "Independent Researcher",
  },
  {
    quote: "Tesamorelin arrived well packaged, lyophilized as described. COA available immediately on request. This is how a research supplier should operate.",
    initials: "DA",
    name: "D.A.",
    title: "Biotech Professional",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className="fill-accent text-accent" />
      ))}
    </div>
  );
}

function TestimonialCard({ quote, initials, name, title }: (typeof TESTIMONIALS)[number]) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm border-l-4 border-l-accent">
      <Stars />
      <p className="flex-1 text-sm leading-relaxed text-zinc-600 italic">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-black text-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{name}</p>
          <p className="text-[11px] text-zinc-400">{title}</p>
        </div>
      </div>
    </div>
  );
}

/** Full 2×2 grid — for homepage */
export default function Testimonials() {
  return (
    <section className="border-b border-border bg-surface-1 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Trusted by laboratory professionals
          </p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
            What Researchers Are Saying
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <TestimonialCard key={t.initials} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Compact 2-card strip — for product pages */
export function TestimonialsCompact() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {TESTIMONIALS.slice(0, 2).map((t) => (
        <TestimonialCard key={t.initials} {...t} />
      ))}
    </div>
  );
}
