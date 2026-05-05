import { FlaskConical, Mail } from "lucide-react";

export default function COASection() {
  return (
    <section className="mt-16">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/8">
          <FlaskConical size={18} className="text-accent" />
        </div>
        <h2 className="text-xl font-black tracking-tight text-zinc-900">
          Lab Testing &amp; Certificate of Analysis
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1.5 text-sm font-semibold text-zinc-900">
              Certificate of Analysis (COA) available upon request
            </p>
            <p className="max-w-md text-xs leading-relaxed text-zinc-500">
              Email{" "}
              <span className="font-medium text-zinc-700">peptobuy@gmail.com</span>{" "}
              to request the COA for this compound. All batches are independently
              third-party tested before shipment.
            </p>
          </div>
          <a
            href="mailto:peptobuy@gmail.com"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_16px_rgba(255,45,120,0.18)] transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(255,45,120,0.28)] active:scale-[0.98]"
          >
            <Mail size={13} />
            Request COA →
          </a>
        </div>
      </div>
    </section>
  );
}
