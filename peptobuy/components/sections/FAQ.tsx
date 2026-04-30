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
    a: "Orders placed before 3 PM EST ship the same business day. Standard delivery is 3–5 business days across the US. Expedited (1–2 day) options are available at checkout. Orders over $75 ship free.",
  },
  {
    q: "Can I stack multiple supplements together?",
    a: "Most of our products are designed to work together. Our Bundles category has pre-configured stacks vetted by sports dietitians. When in doubt, check the 'Pairs Well With' section on each product page or reach out to our support team.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day money-back guarantee on all products — even opened ones. If you're not satisfied for any reason, contact us at support@peptobuy.com and we'll process your full refund within 3 business days.",
  },
  {
    q: "Are these products suitable for vegans?",
    a: "Many are, but not all. Products like our Omega-3 Fish Oil and Whey Protein Isolate are animal-derived. Each product page clearly lists dietary flags (vegan, gluten-free, soy-free). Filter by 'Vegan' in the shop to see only plant-based options.",
  },
];

function FAQItem({
  q,
  a,
  isOpen,
  onToggle,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-white">{q}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-white/40 transition-colors group-hover:border-accent">
          {isOpen ? (
            <Minus size={14} className="text-accent" />
          ) : (
            <Plus size={14} />
          )}
        </span>
      </button>

      {/* CSS grid trick — no JS height calculation needed */}
      <div
        className={[
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-sm leading-relaxed text-white/50">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
            Got Questions?
          </p>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Frequently Asked
          </h2>
          <p className="mt-3 text-sm text-white/40">
            Can&apos;t find an answer?{" "}
            <a
              href="mailto:support@peptobuy.com"
              className="text-accent underline underline-offset-2 hover:no-underline"
            >
              Email our team
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="rounded-2xl border border-border bg-surface-1 px-6">
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
