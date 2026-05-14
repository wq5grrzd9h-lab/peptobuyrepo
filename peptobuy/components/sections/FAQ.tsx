"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Who are your products intended for?",
    a: "PeptoBuy products are strictly intended for qualified researchers, licensed scientists, academic institutions, and biotech professionals conducting legitimate in vitro laboratory research. Our compounds are not for personal use, human consumption, or veterinary use. By purchasing, you confirm you are acting in a research capacity and in full compliance with all applicable laws.",
  },
  {
    q: "Are your products for human consumption?",
    a: "No. All PeptoBuy products are for research use only and are not approved by the FDA for human use. They are not intended to diagnose, treat, cure, or prevent any disease or condition in humans or animals.",
  },
  {
    q: "What is your return policy?",
    a: "All sales are final. We do not accept returns or issue refunds under any circumstances. Please review your order carefully before completing checkout. If there is an issue with your order, email us at peptobuy@gmail.com within 48 hours of receiving your shipment.",
  },
  {
    q: "How do I request a Certificate of Analysis (COA)?",
    a: "COAs are available upon request for every batch we carry. Email peptobuy@gmail.com with your order number and the compound you need the COA for and we will send it promptly.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit and debit cards via Stripe, cryptocurrency via Plisio, and Zelle. For Zelle payments, include only your order number in the memo field — your order will be fulfilled once payment is confirmed.",
  },
  {
    q: "Do you offer any discount codes?",
    a: "Yes — new customers can use code FIRST20 at checkout for 20% off their first order. Enter the code in the promo code field in your cart before proceeding to checkout. FIRST20 is valid once per device for first-time orders only.",
  },
  {
    q: "How are products packaged and stored?",
    a: "All peptides are supplied as lyophilized (freeze-dried) powder unless reconstitution service is selected at checkout. Lyophilized compounds are stable at room temperature for short-term storage and should be kept refrigerated or frozen for long-term use. Avoid repeated freeze-thaw cycles.",
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
