import { Mail } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="border-t border-border bg-white py-20">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          Get in Touch
        </p>
        <h2 className="mb-4 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
          Questions about our compounds?
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-zinc-500">
          Our team is available to answer questions about product specifications,
          COA data, or order inquiries. Reach us directly.
        </p>
        <a
          href="mailto:peptobuy@gmail.com"
          className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(255,45,120,0.22)] transition-all hover:bg-accent-hover hover:shadow-[0_0_32px_rgba(255,45,120,0.35)] active:scale-[0.98]"
        >
          <Mail size={15} />
          peptobuy@gmail.com
        </a>
      </div>
    </section>
  );
}
