"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Are your products third-party tested?",
    a: "Yes — every product in our catalog is tested by an independent, ISO-17025 accredited lab before it leaves the warehouse. You can find the Certificates of Analysis on each product page.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders placed before 3 PM EST ship the same business day. Standard delivery is 3–5 business days across the US. Expedited (1–2 day) options are available at checkout. Orders over $200 ship free.",
  },
  {
    q: "Can I order multiple peptides together?",
    a: "Yes. Our Combos category offers pre-mixed research-grade blend formulations for studying multiple signaling pathways simultaneously. Individual peptides can also be ordered separately and combined per your lab protocol. BAC Water for reconstitution is available in the Essentials section.",
  },
  {
    q: "What is your return policy?",
    a: "All sales are final. We do not accept returns or exchanges, and no refunds will be issued after purchase. Please review product details carefully before ordering. If you received a damaged or incorrect item, contact us at peptobuy@gmail.com within 48 hours of delivery.",
  },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button onClick={onToggle} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-5 text-left">
        <span className="text-base font-semibold text-zinc-900">{q}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400">
          {isOpen ? <Minus size={14} className="text-accent" /> : <Plus size={14} />}
        </span>
      </button>
      <div className={["grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"].join(" ")}>
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-zinc-500">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Got Questions?</p>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">Frequently Asked</h2>
          <p className="mt-3 text-sm text-zinc-500">
            Can&apos;t find an answer?{" "}
            <a href="mailto:peptobuy@gmail.com" className="text-accent underline underline-offset-2 hover:no-underline">
              Email our team
            </a>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white px-6 shadow-sm">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openIndex === i} onToggle={() => setOpenIndex((p) => (p === i ? null : i))} />
          ))}
        </div>
      </div>
    </section>
  );
}
