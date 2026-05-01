import { FlaskConical, Truck, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: FlaskConical,
    heading: "Lab Verified",
    body: "Every batch third-party tested for purity and potency. Certificates available on request.",
  },
  {
    icon: Truck,
    heading: "Ships in 24hrs",
    body: "Orders placed before 3 PM EST dispatched same business day. Free on orders over $200.",
  },
  {
    icon: ShieldCheck,
    heading: "All Sales Final",
    body: "All purchases are final. We do not accept returns or issue refunds. Please review your order carefully before completing checkout.",
  },
  {
    icon: ShieldCheck,
    heading: "Secure Checkout",
    body: "256-bit SSL encryption on every transaction. We never store your card details.",
  },
];

export default function TrustBar() {
  return (
    <section className="border-y border-border bg-surface-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, heading, body }, i) => (
            <div
              key={heading}
              className={["flex flex-col gap-4 px-8 py-10", i > 0 && i % 2 === 0 ? "sm:border-t sm:border-border lg:border-t-0" : ""].join(" ")}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/8">
                <Icon size={22} className="text-accent" />
              </div>
              <div>
                <h3 className="mb-2 text-base font-bold text-zinc-900">{heading}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
