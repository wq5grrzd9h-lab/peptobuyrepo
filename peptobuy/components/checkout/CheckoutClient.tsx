"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check, ChevronLeft, ChevronDown, Truck, Zap, ShoppingBag,
  ArrowRight, Loader2, CreditCard, Bitcoin,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCart, lineUnitPrice } from "@/context/CartContext";
import CheckoutSummary from "./CheckoutSummary";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentMethod = "card" | "crypto" | "zelle";

interface ContactForm { email: string; phone: string }
interface ShippingForm { firstName: string; lastName: string; address: string; city: string; state: string; zip: string; country: string }
type ShippingMethod = "standard" | "express";
type Errors = Record<string, string>;

const STEPS = ["Contact", "Shipping", "Method", "Payment"];
const COUNTRIES = [
  { code: "US", name: "United States" }, { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" }, { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" }, { code: "JP", name: "Japan" },
];
const CRYPTO_COINS = ["BTC", "ETH", "USDT", "LTC", "BNB", "XMR"] as const;

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `PB-${y}${m}${d}-${suffix}`;
}

// ─── Shared research-confirm ──────────────────────────────────────────────────

function ResearchConfirm({ confirmed, error, onChange }: {
  confirmed: boolean; error: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <div className={["mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
          confirmed ? "border-amber-600 bg-amber-600" : error ? "border-red-400 bg-white" : "border-amber-400 bg-white"].join(" ")}>
          {confirmed && <Check size={10} className="text-white" strokeWidth={3} />}
        </div>
        <input type="checkbox" className="sr-only" checked={confirmed} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-xs leading-relaxed text-amber-800">
          I confirm these products are for research use only and I am a qualified researcher.
        </span>
      </label>
      {error && <p className="mt-2 text-[11px] text-red-500">↑ You must confirm research use to place your order.</p>}
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({ label, name, type = "text", value, error, placeholder, autoComplete, maxLength, onChange, className = "", rightElement }: {
  label: string; name: string; type?: string; value: string; error?: string; placeholder?: string;
  autoComplete?: string; maxLength?: number; onChange: (v: string) => void; className?: string; rightElement?: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
      <div className="relative">
        <input id={name} name={name} type={type} value={value} placeholder={placeholder} autoComplete={autoComplete} maxLength={maxLength} onChange={(e) => onChange(e.target.value)}
          className={["w-full rounded-xl border bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-1", rightElement ? "pr-10" : "",
            error ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-zinc-200 focus:border-accent focus:ring-accent/20"].join(" ")} />
        {rightElement && <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">{rightElement}</div>}
      </div>
      {error && <p className="flex items-center gap-1 text-[11px] text-red-500">↑ {error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, error, children, onChange, className = "" }: {
  label: string; name: string; value: string; error?: string; children: React.ReactNode; onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{label}</label>
      <div className="relative">
        <select id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)}
          className={["w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-9 text-sm text-zinc-900 transition-all focus:outline-none focus:ring-1",
            error ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-zinc-200 focus:border-accent focus:ring-accent/20"].join(" ")}>{children}</select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center"><ChevronDown size={14} className="text-zinc-400" /></div>
      </div>
      {error && <p className="flex items-center gap-1 text-[11px] text-red-500">↑ {error}</p>}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-start">
      {STEPS.map((label, i) => (
        <Fragment key={label}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
              i < current ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(52,211,153,0.25)]"
                : i === current ? "bg-accent text-white shadow-[0_0_12px_rgba(255,45,120,0.3)]"
                : "border border-zinc-200 bg-zinc-50 text-zinc-400"].join(" ")}>
              {i < current ? <Check size={13} /> : i + 1}
            </div>
            <span className={["text-[9px] font-bold uppercase tracking-[0.15em]", i <= current ? "text-zinc-600" : "text-zinc-400"].join(" ")}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={["mb-[22px] mx-2 mt-4 h-px flex-1 transition-colors duration-500", i < current ? "bg-emerald-500" : "bg-zinc-200"].join(" ")} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ─── Steps 0–2 ───────────────────────────────────────────────────────────────

function ContactStep({ data, errors, onChange }: { data: ContactForm; errors: Errors; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Email Address" name="email" type="email" value={data.email} error={errors.email} placeholder="you@example.com" autoComplete="email" onChange={(v) => onChange("email", v)} />
      <Field label="Phone Number" name="phone" type="tel" value={data.phone} error={errors.phone} placeholder="+1 (555) 000-0000" autoComplete="tel" onChange={(v) => onChange("phone", v)} />
      <p className="text-[11px] text-zinc-400">We&apos;ll only use these to send your order confirmation and shipping updates.</p>
    </div>
  );
}

function ShippingStep({ data, errors, onChange }: { data: ShippingForm; errors: Errors; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" name="firstName" value={data.firstName} error={errors.firstName} placeholder="John" autoComplete="given-name" onChange={(v) => onChange("firstName", v)} />
        <Field label="Last Name" name="lastName" value={data.lastName} error={errors.lastName} placeholder="Doe" autoComplete="family-name" onChange={(v) => onChange("lastName", v)} />
      </div>
      <Field label="Street Address" name="address" value={data.address} error={errors.address} placeholder="123 Main Street, Apt 4B" autoComplete="street-address" onChange={(v) => onChange("address", v)} />
      <div className="grid grid-cols-3 gap-4">
        <Field label="City" name="city" value={data.city} error={errors.city} placeholder="New York" autoComplete="address-level2" onChange={(v) => onChange("city", v)} className="col-span-2" />
        <Field label="State" name="state" value={data.state} error={errors.state} placeholder="NY" autoComplete="address-level1" onChange={(v) => onChange("state", v)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="ZIP / Postal Code" name="zip" value={data.zip} error={errors.zip} placeholder="10001" autoComplete="postal-code" onChange={(v) => onChange("zip", v)} />
        <SelectField label="Country" name="country" value={data.country} error={errors.country} onChange={(v) => onChange("country", v)}>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </SelectField>
      </div>
    </div>
  );
}

function MethodStep({ method, setMethod, subtotal }: { method: ShippingMethod; setMethod: (m: ShippingMethod) => void; subtotal: number }) {
  const freeStandard = subtotal >= 200;
  const options = [
    { id: "standard" as ShippingMethod, icon: Truck, label: "Standard Shipping", sub: "3–5 business days", price: freeStandard ? "Free" : "$9.99", priceNum: freeStandard ? 0 : 9.99 },
    { id: "express" as ShippingMethod, icon: Zap, label: "Express Shipping", sub: "1–2 business days", price: "$19.99", priceNum: 19.99 },
  ];
  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const selected = method === opt.id;
        return (
          <button key={opt.id} type="button" onClick={() => setMethod(opt.id)} className={["flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150",
            selected ? "border-accent bg-accent/3 shadow-[0_0_16px_rgba(255,45,120,0.08)]" : "border-zinc-200 bg-white hover:border-zinc-300"].join(" ")}>
            <div className={["flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors", selected ? "border-accent" : "border-zinc-300"].join(" ")}>
              {selected && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
            </div>
            <div className={["flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", selected ? "bg-accent/10 text-accent" : "bg-zinc-100 text-zinc-400"].join(" ")}>
              <opt.icon size={17} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${selected ? "text-zinc-900" : "text-zinc-700"}`}>{opt.label}</p>
              <p className="text-xs text-zinc-400">{opt.sub}</p>
            </div>
            <div className={["text-right text-sm font-bold tabular-nums", opt.priceNum === 0 ? "text-emerald-600" : selected ? "text-zinc-900" : "text-zinc-500"].join(" ")}>{opt.price}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Payment method toggle (3 tabs) ──────────────────────────────────────────

function PaymentMethodToggle({ active, onChange }: { active: PaymentMethod; onChange: (m: PaymentMethod) => void }) {
  const tabs: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    {
      id: "card",
      label: "Card",
      icon: <CreditCard size={14} />,
    },
    {
      id: "crypto",
      label: "Crypto",
      icon: <Bitcoin size={14} />,
    },
    {
      id: "zelle",
      label: "Zelle",
      icon: (
        <span className={["flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black transition-colors",
          active === "zelle" ? "bg-white/25 text-white" : "bg-purple-100 text-purple-700"].join(" ")}>
          Z
        </span>
      ),
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-3 gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-50 p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={["flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200",
            active === tab.id ? "bg-accent text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"].join(" ")}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}

      {/* Crypto coin badges — shown below toggle when crypto is selected */}
      {active === "crypto" && (
        <div className="col-span-3 -mt-0.5 flex flex-wrap justify-center gap-1 px-2 pb-1">
          {CRYPTO_COINS.map((coin) => (
            <span key={coin} className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold text-accent">
              {coin}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stripe payment form ──────────────────────────────────────────────────────

function StripePaymentForm({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return;
    if (!confirmed) { setConfirmError(true); return; }
    setSubmitting(true);
    setStripeError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order-confirmation` },
      redirect: "if_required",
    });

    if (error) {
      setStripeError(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }
    onSuccess();
  };

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      {stripeError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{stripeError}</div>
      )}
      <ResearchConfirm confirmed={confirmed} error={confirmError} onChange={(v) => { setConfirmed(v); setConfirmError(false); }} />
      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={onBack} type="button" className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={handlePlaceOrder} disabled={submitting || !stripe} type="button"
          className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? <><Loader2 size={16} className="animate-spin" />Processing…</> : <>Place Order <ChevronLeft size={15} className="rotate-180" /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Crypto payment form ──────────────────────────────────────────────────────

function CryptoPaymentForm({ onBack, onPay, submitting, error }: {
  onBack: () => void; onPay: () => void; submitting: boolean; error: string | null;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Bitcoin size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="mb-1 font-semibold text-zinc-900">Pay with Cryptocurrency</p>
            <p className="text-sm leading-relaxed text-zinc-500">
              You&apos;ll be redirected to a secure Plisio checkout page to complete your payment with your preferred cryptocurrency.
            </p>
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Accepted Currencies</p>
          <div className="flex flex-wrap gap-2">
            {CRYPTO_COINS.map((coin) => (
              <span key={coin} className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />{coin}
              </span>
            ))}
          </div>
        </div>
      </div>
      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <ResearchConfirm confirmed={confirmed} error={confirmError} onChange={(v) => { setConfirmed(v); setConfirmError(false); }} />
      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={onBack} type="button" className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={() => { if (!confirmed) { setConfirmError(true); return; } onPay(); }} disabled={submitting} type="button"
          className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? <><Loader2 size={16} className="animate-spin" />Creating Invoice…</> : <>Pay with Crypto <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Zelle payment form ───────────────────────────────────────────────────────

function ZellePaymentForm({ onBack, onPay, submitting, error, total }: {
  onBack: () => void; onPay: () => void; submitting: boolean; error: string | null; total: number;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const steps = [
    <>Click <strong>&ldquo;Place Order&rdquo;</strong> below — you&apos;ll receive your order number immediately.</>,
    <>Open your bank app and start a Zelle payment.</>,
    <>Send <strong className="text-zinc-900">${total.toFixed(2)}</strong> to <strong className="font-mono text-zinc-900">peptobuy@gmail.com</strong>.</>,
    <>In the Zelle <strong>memo / comments</strong> field, enter <em>only</em> your order number.</>,
    <>Your order will be confirmed via email once payment is received.</>,
  ];

  return (
    <div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50">
            <span className="text-lg font-black text-purple-600">Z</span>
          </div>
          <div>
            <p className="mb-1 font-semibold text-zinc-900">Pay with Zelle</p>
            <p className="text-sm leading-relaxed text-zinc-500">
              Place your order now, then complete payment via Zelle. No additional fees.
            </p>
          </div>
        </div>

        {/* Steps */}
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-zinc-600">{step}</span>
            </li>
          ))}
        </ol>

        {/* Zelle address callout */}
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Zelle Address</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-purple-900">peptobuy@gmail.com</p>
          </div>
          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <ResearchConfirm confirmed={confirmed} error={confirmError} onChange={(v) => { setConfirmed(v); setConfirmError(false); }} />

      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={onBack} type="button" className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900">
          <ChevronLeft size={15} /> Back
        </button>
        <button onClick={() => { if (!confirmed) { setConfirmError(true); return; } onPay(); }} disabled={submitting} type="button"
          className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.35)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
          {submitting ? <><Loader2 size={16} className="animate-spin" />Processing…</> : <>Place Order <ArrowRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Main checkout orchestrator ───────────────────────────────────────────────

export default function CheckoutClient() {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [contact, setContact] = useState<ContactForm>({ email: "", phone: "" });
  const [shipping, setShipping] = useState<ShippingForm>({ firstName: "", lastName: "", address: "", city: "", state: "", zip: "", country: "US" });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  // Crypto
  const [cryptoSubmitting, setCryptoSubmitting] = useState(false);
  const [cryptoError, setCryptoError] = useState<string | null>(null);

  // Zelle
  const [zelleSubmitting, setZelleSubmitting] = useState(false);
  const [zelleError, setZelleError] = useState<string | null>(null);

  const shippingCost = shippingMethod === "express" ? 19.99 : subtotal >= 200 ? 0 : 9.99;
  const total = subtotal + shippingCost;

  // Fetch Stripe intent only when card is selected at step 3
  useEffect(() => {
    if (step !== 3 || paymentMethod !== "card" || clientSecret || intentLoading || total <= 0) return;
    setIntentLoading(true);
    setIntentError(null);
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch((err: Error) => setIntentError(err.message))
      .finally(() => setIntentLoading(false));
  }, [step, paymentMethod, clientSecret, intentLoading, total]);

  const clearFieldError = (f: string) => setErrors((e) => { const n = { ...e }; delete n[f]; return n; });
  const updateContact = (f: string, v: string) => { setContact((p) => ({ ...p, [f]: v } as ContactForm)); clearFieldError(f); };
  const updateShipping = (f: string, v: string) => { setShipping((p) => ({ ...p, [f]: v } as ShippingForm)); clearFieldError(f); };

  function validateContact(): Errors {
    const e: Errors = {};
    if (!contact.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = "Please enter a valid email address";
    if (!contact.phone) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s()\-.]{7,}$/.test(contact.phone)) e.phone = "Please enter a valid phone number";
    return e;
  }
  function validateShipping(): Errors {
    const e: Errors = {};
    if (!shipping.firstName.trim()) e.firstName = "First name is required";
    if (!shipping.lastName.trim()) e.lastName = "Last name is required";
    if (!shipping.address.trim()) e.address = "Street address is required";
    if (!shipping.city.trim()) e.city = "City is required";
    if (!shipping.state.trim()) e.state = "State is required";
    if (!shipping.zip.trim()) e.zip = "ZIP code is required";
    else if (!/^\d{4,10}$/.test(shipping.zip.replace(/\s/g, ""))) e.zip = "Please enter a valid postal code";
    return e;
  }

  const handleNext = () => {
    const errs = step === 0 ? validateContact() : step === 1 ? validateShipping() : {};
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleBack = () => { setErrors({}); setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const saveOrder = (orderNumber: string, extraFields: Record<string, unknown> = {}) => {
    try {
      localStorage.setItem("peptobuy-last-order", JSON.stringify({
        orderNumber, email: contact.email, placedAt: new Date().toISOString(),
        items: items.map((i) => ({ productId: i.product.id, name: i.product.name, price: lineUnitPrice(i), quantity: i.quantity, image: i.product.image, category: i.product.category, selectedDose: i.selectedDose.size, reconstitution: i.reconstitution })),
        subtotal, shippingCost, total, shippingAddress: shipping, shippingMethod,
        ...extraFields,
      }));
    } catch { /* ignore */ }
  };

  // Fire-and-forget — never blocks navigation
  const sendOrderEmail = (orderNumber: string, method: PaymentMethod) => {
    fetch("/api/send-order-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderNumber,
        customerEmail: contact.email,
        customerName: `${shipping.firstName} ${shipping.lastName}`,
        items: items.map(i => ({
          name: i.product.name,
          dose: i.selectedDose.size,
          quantity: i.quantity,
          price: lineUnitPrice(i),
          reconstitution: i.reconstitution ?? false,
        })),
        subtotal,
        shipping: shippingCost,
        total,
        paymentMethod: method,
        shippingAddress: shipping,
      }),
    }).catch(err => console.error("[sendOrderEmail]", err));
  };

  const handleStripeSuccess = () => {
    const orderNumber = generateOrderNumber();
    saveOrder(orderNumber, { paymentMethod: "card" });
    sendOrderEmail(orderNumber, "card");
    clearCart();
    router.push("/order-confirmation");
  };

  const handleCryptoPay = async () => {
    setCryptoSubmitting(true);
    setCryptoError(null);
    const orderNumber = generateOrderNumber();
    saveOrder(orderNumber, { paymentMethod: "crypto", paymentStatus: "pending" });
    sendOrderEmail(orderNumber, "crypto");
    try {
      const res = await fetch("/api/create-plisio-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, email: contact.email, orderId: orderNumber }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      clearCart();
      window.location.href = data.invoiceUrl;
    } catch (err: unknown) {
      setCryptoError(err instanceof Error ? err.message : "Failed to create invoice. Please try again.");
      setCryptoSubmitting(false);
    }
  };

  const handleZellePay = () => {
    setZelleSubmitting(true);
    setZelleError(null);
    const orderNumber = generateOrderNumber();
    saveOrder(orderNumber, { paymentMethod: "zelle", paymentStatus: "pending_payment" });
    sendOrderEmail(orderNumber, "zelle");
    clearCart();
    router.push("/order-confirmation");
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50">
          <ShoppingBag size={28} className="text-zinc-300" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-zinc-900">Your cart is empty</h2>
        <p className="mb-6 text-sm text-zinc-500">Add products before checking out.</p>
        <Link href="/shop" className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-hover">
          Browse Products <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const stepTitles = ["Contact Information", "Shipping Address", "Shipping Method", "Payment Details"];

  const stripeAppearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#ff2d78", colorBackground: "#ffffff", colorText: "#18181b",
      colorDanger: "#ef4444", fontFamily: "system-ui, -apple-system, sans-serif",
      borderRadius: "12px", spacingUnit: "4px",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/cart" className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-900">
        <ChevronLeft size={15} /> Back to Cart
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <StepIndicator current={step} />
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Step {step + 1} of {STEPS.length}</p>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">{stepTitles[step]}</h1>
          </div>

          {/* Steps 0–2 */}
          {step < 3 && (
            <>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                {step === 0 && <ContactStep data={contact} errors={errors} onChange={updateContact} />}
                {step === 1 && <ShippingStep data={shipping} errors={errors} onChange={updateShipping} />}
                {step === 2 && <MethodStep method={shippingMethod} setMethod={setShippingMethod} subtotal={subtotal} />}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button onClick={handleBack} className="flex items-center gap-1.5 rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900">
                    <ChevronLeft size={15} /> Back
                  </button>
                ) : <div />}
                <button onClick={handleNext} className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_0_16px_rgba(255,45,120,0.2)] transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(255,45,120,0.3)] active:scale-[0.98]">
                  Continue <ChevronLeft size={15} className="rotate-180" />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <>
              <PaymentMethodToggle active={paymentMethod} onChange={setPaymentMethod} />

              {/* Card / Stripe */}
              {paymentMethod === "card" && (
                <>
                  {intentLoading && (
                    <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
                      <Loader2 size={24} className="animate-spin text-accent" />
                    </div>
                  )}
                  {intentError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
                      Failed to initialize payment: {intentError}
                      <button onClick={() => setIntentError(null)} className="ml-2 underline">Retry</button>
                    </div>
                  )}
                  {clientSecret && !intentLoading && (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                      <StripePaymentForm onBack={handleBack} onSuccess={handleStripeSuccess} />
                    </Elements>
                  )}
                </>
              )}

              {/* Crypto / Plisio */}
              {paymentMethod === "crypto" && (
                <CryptoPaymentForm onBack={handleBack} onPay={handleCryptoPay} submitting={cryptoSubmitting} error={cryptoError} />
              )}

              {/* Zelle */}
              {paymentMethod === "zelle" && (
                <ZellePaymentForm onBack={handleBack} onPay={handleZellePay} submitting={zelleSubmitting} error={zelleError} total={total} />
              )}
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutSummary shippingCost={shippingCost} />
        </div>
      </div>
    </div>
  );
}
