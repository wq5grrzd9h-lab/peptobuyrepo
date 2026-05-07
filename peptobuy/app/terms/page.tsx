import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions — PeptoBuy",
  description: "PeptoBuy Terms & Conditions for research-grade peptide purchases.",
};

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or purchasing from PeptoBuy, you agree to be bound by these Terms & Conditions. If you do not agree, do not use this site or place an order.",
  },
  {
    title: "Research Use Only",
    body: "All products sold by PeptoBuy are strictly for in vitro laboratory and scientific research purposes only. They are not intended for human or animal consumption, medical diagnosis, treatment, or prevention of any disease or condition. By purchasing, you confirm that you are a qualified researcher or authorized agent of a recognized laboratory, institution, or business, and that you are acting in full compliance with all applicable local, state, and federal laws.",
  },
  {
    title: "Eligible Purchasers",
    body: "Our products are intended solely for licensed researchers, academic institutions, biotech companies, and qualified research professionals. We reserve the right to refuse service to anyone we believe is not purchasing for legitimate research purposes.",
  },
  {
    title: "All Sales Final",
    body: "All purchases are final. We do not accept returns or issue refunds under any circumstances. Please review your order carefully before completing checkout. If you believe there is an error with your order, contact us at peptobuy@gmail.com within 48 hours of receiving your shipment.",
  },
  {
    title: "Payment",
    body: "We accept credit and debit card payments via Stripe, cryptocurrency via Plisio, and Zelle. For Zelle payments, orders are fulfilled only after payment is confirmed. When paying via Zelle, include only your order number in the memo field — no other information is needed.",
  },
  {
    title: "Intellectual Property",
    body: "All content on PeptoBuy including logos, product images, descriptions, and text is the exclusive property of PeptoBuy. Unauthorized reproduction, distribution, or use of any site content is strictly prohibited.",
  },
  {
    title: "Limitation of Liability",
    body: "PeptoBuy is not liable for any misuse of products purchased through this site, including but not limited to use for human or animal consumption. PeptoBuy is not responsible for any indirect, incidental, special, or consequential damages arising from the purchase or use of our compounds. Our total liability shall not exceed the amount paid for the order in question.",
  },
  {
    title: "Governing Law",
    body: "These Terms & Conditions are governed by and construed in accordance with the laws of the United States. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located within the United States.",
  },
  {
    title: "Contact",
    body: null,
    email: true,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Legal</p>
          <h1 className="mb-3 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-zinc-400">Last updated: May 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {SECTIONS.map(({ title, body, email }) => (
            <section key={title}>
              <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
                <span className="mr-2 text-accent">—</span>
                {title}
              </h2>
              {email ? (
                <p className="text-sm leading-relaxed text-zinc-600">
                  For any questions regarding these terms, contact us at{" "}
                  <a href="mailto:peptobuy@gmail.com" className="font-semibold text-accent underline underline-offset-2 hover:no-underline">
                    peptobuy@gmail.com
                  </a>
                  .
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-zinc-600">{body}</p>
              )}
            </section>
          ))}
        </div>

        {/* Research disclaimer */}
        <div className="mt-14 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
          <p className="text-xs font-semibold leading-relaxed text-amber-800">
            ⚠ All products are for in vitro research use only. Not for human or animal consumption,
            not approved by the FDA, and not intended for therapeutic use. By purchasing, you
            confirm compliance with all applicable laws.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/privacy" className="text-accent underline underline-offset-2 hover:no-underline">
            Privacy Policy
          </Link>
          <Link href="/shop" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-700 hover:no-underline">
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
