import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Subscribe & Save 10% — Research Peptides",
  description:
    "Subscribe to your research compounds and save 10% every month. Minimum 3 month commitment. ISO 9001 certified quality every shipment.",
};

const ELIGIBLE_PRODUCTS = products.filter(
  (p) => p.inStock && p.category !== "Essentials"
);

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 px-4 py-20 text-center sm:px-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
          Subscribe & Save
        </p>
        <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
          Never run out of your research compounds
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-zinc-400">
          Subscribe to any product and save <strong className="text-white">10% every month</strong>.
          Same ISO 9001 certified quality, delivered automatically.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-bold text-white shadow-[0_0_32px_rgba(255,45,120,0.4)] transition-all hover:bg-accent-hover"
        >
          Browse & Subscribe <ArrowRight size={18} />
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        {/* Benefits */}
        <div className="mb-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: <RefreshCw size={24} className="text-accent" />,
              title: "10% Off Every Month",
              body: "Automatic 10% discount applied to every monthly shipment. No code needed.",
            },
            {
              icon: <ShieldCheck size={24} className="text-accent" />,
              title: "Same Certified Quality",
              body: "Every batch ISO 9001 certified, third-party tested with COA available on request.",
            },
            {
              icon: <CheckCircle2 size={24} className="text-accent" />,
              title: "Cancel After 3 Months",
              body: "Minimum 3 month commitment. Cancel anytime after by emailing peptobuy@gmail.com",
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                {icon}
              </div>
              <h3 className="mb-2 font-bold text-zinc-900">{title}</h3>
              <p className="text-sm leading-relaxed text-zinc-500">{body}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-black tracking-tight text-zinc-900">
            How subscriptions work
          </h2>
          <ol className="space-y-4">
            {[
              "Select any eligible product and choose \"Subscribe & Save 10% 🔄\" instead of One-Time Purchase",
              "Complete checkout — your first month is charged immediately",
              "Your order ships automatically each month on the same date",
              "After 3 months, email peptobuy@gmail.com to cancel anytime",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-zinc-600">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Eligible products */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-black tracking-tight text-zinc-900">
            Eligible products
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ELIGIBLE_PRODUCTS.map((p) => (
              <div key={p.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {p.category}
                </p>
                <h3 className="mb-2 font-bold text-zinc-900">{p.name}</h3>
                <p className="mb-4 text-sm text-zinc-400">{p.doses[0].size}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-400 line-through">${p.doses[0].price.toFixed(2)}/mo</p>
                    <p className="text-lg font-black text-accent">
                      ${(p.doses[0].price * 0.9).toFixed(2)}/mo
                    </p>
                  </div>
                  <Link
                    href={`/shop/${p.id}`}
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
                  >
                    Subscribe →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment notice */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="mb-2 font-bold text-amber-800">📋 Subscription Commitment</h3>
          <p className="text-sm leading-relaxed text-amber-700">
            All subscriptions require a minimum 3 month commitment. By subscribing you agree to be
            charged monthly for at least 3 months. After 3 successful payments, you may cancel by
            emailing{" "}
            <a href="mailto:peptobuy@gmail.com" className="font-semibold underline">
              peptobuy@gmail.com
            </a>
            . All products are for in vitro research use only — not for human consumption.
          </p>
        </div>
      </div>
    </div>
  );
}
