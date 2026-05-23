import Link from "next/link";

const WHOLESALE_HREF =
  "mailto:peptobuy@gmail.com?subject=Bulk%20Order%20Inquiry&body=Hi%2C%20I%20am%20interested%20in%20wholesale%20pricing%20for%20the%20following%20compounds%3A%0A%0ACompound%3A%0AQuantity%3A%0AInstitution%2FLab%3A%0A%0APlease%20send%20me%20your%20wholesale%20pricing.";

const CUSTOM_HREF =
  "mailto:peptobuy@gmail.com?subject=Custom%20Compound%20Request&body=Hi%2C%20I%20am%20looking%20for%20the%20following%20compound%20that%20I%20don%27t%20see%20on%20your%20website%3A%0A%0ACompound%20Name%3A%0AQuantity%20Needed%3A%0APurity%20Requirements%3A%0AResearch%20Application%3A%0A%0AThank%20you.";

const WHOLESALE_BULLETS = [
  { icon: "💰", text: "Dramatically reduced per-vial pricing on bulk orders" },
  { icon: "📋", text: "COA provided for every batch — no exceptions" },
  { icon: "🔬", text: "Same research-grade quality at a fraction of the cost" },
  { icon: "⚡", text: "Priority fulfillment for wholesale accounts" },
  { icon: "🤝", text: "Dedicated support for institutional orders" },
];

const CUSTOM_BULLETS = [
  { icon: "🧪", text: "Wide sourcing network — most compounds available" },
  { icon: "📋", text: "Third-party tested to our same ISO 9001 standards" },
  { icon: "⚡", text: "Fast turnaround on custom sourcing requests" },
  { icon: "🔒", text: "Research use only — qualified researchers only" },
];

// ─── Wholesale card ───────────────────────────────────────────────────────────

function WholesaleCard() {
  return (
    <div
      className="group relative flex h-full flex-col rounded-2xl border border-[#ff2d78]/40 bg-[#0a0a0a] p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,45,120,0.15)]"
    >
      {/* WHOLESALE badge */}
      <span
        className="absolute right-5 top-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
        style={{ background: "#FFD700", color: "#0a0a0a" }}
      >
        Wholesale
      </span>

      {/* Top label */}
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#ff2d78]">
        Buying in Bulk? 📦
      </p>

      {/* Headline */}
      <h2 className="mb-4 text-2xl font-black leading-tight tracking-tight text-white lg:text-3xl">
        Wholesale Pricing Available
      </h2>

      {/* Subtext */}
      <p className="mb-6 text-sm leading-relaxed text-zinc-400">
        Researchers and institutions ordering in volume get access to significantly lower
        per-unit pricing. The more you order, the more you save — wholesale rates available
        on all compounds. Don&apos;t pay retail when you don&apos;t have to.
      </p>

      {/* Bullets */}
      <ul className="mb-8 flex flex-col gap-3">
        {WHOLESALE_BULLETS.map(({ icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-zinc-300">
            <span className="mt-0.5 text-base leading-none">{icon}</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* Spacer pushes CTA to bottom */}
      <div className="flex-1" />

      {/* CTA */}
      <Link
        href={WHOLESALE_HREF}
        className="flex w-full items-center justify-center rounded-xl bg-[#ff2d78] px-6 py-3.5 text-sm font-black text-white shadow-[0_0_24px_rgba(255,45,120,0.3)] transition-all hover:bg-[#e0256a] hover:shadow-[0_0_36px_rgba(255,45,120,0.45)] active:scale-[0.98]"
      >
        Get Wholesale Pricing →
      </Link>
      <p className="mt-3 text-center text-[11px] text-zinc-500">
        Email us directly at{" "}
        <span className="text-zinc-400">peptobuy@gmail.com</span>{" "}
        — we respond within 12 hours
      </p>
    </div>
  );
}

// ─── Custom compound card ─────────────────────────────────────────────────────

function CustomCard() {
  return (
    <div
      className="group relative flex h-full flex-col rounded-2xl border border-[#ff2d78]/30 bg-[#f5f5f5] p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
    >
      {/* CUSTOM ORDER badge */}
      <span className="absolute right-5 top-5 rounded-full bg-[#ff2d78] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
        Custom Order
      </span>

      {/* Top label */}
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#ff2d78]">
        Don&apos;t See What You Need? 🔬
      </p>

      {/* Headline */}
      <h2 className="mb-4 text-2xl font-black leading-tight tracking-tight text-zinc-900 lg:text-3xl">
        Request Any Compound
      </h2>

      {/* Subtext */}
      <p className="mb-6 text-sm leading-relaxed text-zinc-600">
        We carry the most in-demand research peptides — but our catalog is always growing.
        If you&apos;re looking for a specific compound you don&apos;t see listed, reach out.
        We source on request and can likely get you exactly what your research requires.
      </p>

      {/* Bullets */}
      <ul className="mb-8 flex flex-col gap-3">
        {CUSTOM_BULLETS.map(({ icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-zinc-700">
            <span className="mt-0.5 text-base leading-none">{icon}</span>
            <span>{text}</span>
          </li>
        ))}
      </ul>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
      <Link
        href={CUSTOM_HREF}
        className="flex w-full items-center justify-center rounded-xl bg-[#ff2d78] px-6 py-3.5 text-sm font-black text-white shadow-[0_0_24px_rgba(255,45,120,0.25)] transition-all hover:bg-[#e0256a] hover:shadow-[0_0_36px_rgba(255,45,120,0.4)] active:scale-[0.98]"
      >
        Request a Compound →
      </Link>
      <p className="mt-3 text-center text-[11px] text-zinc-500">
        Email{" "}
        <span className="text-zinc-600">peptobuy@gmail.com</span>{" "}
        — tell us what you need
      </p>
    </div>
  );
}

// ─── Exported section ─────────────────────────────────────────────────────────

export default function CTABoxes({ showHeading = false }: { showHeading?: boolean }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="mb-10 text-center">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff2d78]">
              We go beyond the catalog
            </p>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Need Something More?
            </h2>
          </div>
        )}
        <div className="grid items-stretch gap-6 sm:grid-cols-2">
          <WholesaleCard />
          <CustomCard />
        </div>
      </div>
    </section>
  );
}
