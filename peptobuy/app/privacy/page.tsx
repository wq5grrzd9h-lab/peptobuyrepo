import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PeptoBuy Privacy Policy — how we collect, use, and protect your information.",
};

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect your name, email address, shipping address, and payment information when you place an order. We do not store full payment card details — card payments are processed securely by Stripe. Cryptocurrency payments are handled by Plisio. We collect only the minimum data necessary to fulfill your order.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process and fulfill your orders, send order confirmations and shipping updates, respond to inquiries and support requests, and comply with applicable legal obligations. We do not use your data for advertising or marketing purposes.",
  },
  {
    title: "Data Sharing",
    body: "We do not sell, rent, or share your personal information with third parties for commercial purposes. We may share your shipping details with our shipping carriers solely for order fulfillment. We may disclose information as required by law or legal process.",
  },
  {
    title: "Cookies",
    body: "We use minimal cookies strictly for site functionality — including session management and cart state. We do not use third-party tracking cookies, analytics cookies, or advertising cookies.",
  },
  {
    title: "Data Retention",
    body: "Order and account information is retained as required for business operations and legal compliance. We do not retain data longer than necessary for these purposes.",
  },
  {
    title: "Your Rights",
    body: null,
    email: true,
  },
  {
    title: "Contact",
    body: null,
    email: true,
    isContact: true,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-border bg-surface-1">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Legal</p>
          <h1 className="mb-3 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400">Last updated: May 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>Information We Collect
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              We collect your name, email address, shipping address, and payment information when
              you place an order. We do not store full payment card details — card payments are
              processed securely by Stripe. Cryptocurrency payments are handled by Plisio. We
              collect only the minimum data necessary to fulfill your order.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>How We Use Your Information
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Your information is used to process and fulfill orders, send order confirmations and
              shipping updates, respond to inquiries, and comply with legal obligations. We do not
              use your data for advertising or marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>Data Sharing
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              We do not sell, rent, or share your personal information with third parties for
              commercial purposes. We may share your shipping details with our shipping carriers
              solely for order fulfillment. We may disclose information as required by law or legal
              process.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>Cookies
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              We use minimal cookies strictly for site functionality — including session management
              and cart state. We do not use third-party tracking cookies, analytics cookies, or
              advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>Data Retention
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              Order information is retained as required for business operations and legal compliance.
              We do not retain data longer than necessary for these purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>Your Rights
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              You may contact us at{" "}
              <a href="mailto:peptobuy@gmail.com" className="font-semibold text-accent underline underline-offset-2 hover:no-underline">
                peptobuy@gmail.com
              </a>{" "}
              to request access to, correction of, or deletion of your personal data. We will
              respond to all requests within a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-black tracking-tight text-zinc-900">
              <span className="mr-2 text-accent">—</span>Contact
            </h2>
            <p className="text-sm leading-relaxed text-zinc-600">
              For any privacy-related questions or requests, contact us at{" "}
              <a href="mailto:peptobuy@gmail.com" className="font-semibold text-accent underline underline-offset-2 hover:no-underline">
                peptobuy@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-accent underline underline-offset-2 hover:no-underline">
            Terms &amp; Conditions
          </Link>
          <Link href="/shop" className="text-zinc-400 underline underline-offset-2 hover:text-zinc-700 hover:no-underline">
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
