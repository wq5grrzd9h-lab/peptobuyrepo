"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronDown,
  Truck,
  Zap,
  ShoppingBag,
  ArrowRight,
  Loader2,
  CreditCard,
  Bitcoin,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import CardPreview, { detectCardType } from "./CardPreview";
import CheckoutSummary from "./CheckoutSummary";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactForm { email: string; phone: string }
interface ShippingForm {
  firstName: string; lastName: string;
  address: string; city: string;
  state: string; zip: string; country: string;
}
interface PaymentForm {
  cardNumber: string; expiry: string; cvv: string; nameOnCard: string;
}
type ShippingMethod = "standard" | "express";
type Errors = Record<string, string>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Contact", "Shipping", "Method", "Payment"];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
];

function generateOrderNumber(): string {
  return Array.from({ length: 8 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// ─── Shared field component ───────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
  onChange: (v: string) => void;
  className?: string;
  rightElement?: React.ReactNode;
}

function Field({
  label, name, type = "text", value, error,
  placeholder, autoComplete, maxLength,
  onChange, className = "", rightElement,
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-[11px] font-bold uppercase tracking-widest text-white/35">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full rounded-xl border bg-surface-2 px-4 py-3 text-sm text-white placeholder:text-white/18 transition-all duration-150 focus:outline-none focus:ring-1",
            rightElement ? "pr-10" : "",
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : "border-border focus:border-accent focus:ring-accent/20",
          ].join(" ")}
        />
        {rightElement && (
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-400">
          <span>↑</span> {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label, name, value, error, children, onChange, className = "",
}: {
  label: string; name: string; value: string;
  error?: string; children: React.ReactNode;
  onChange: (v: string) => void; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-[11px] font-bold uppercase tracking-widest text-white/35">
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full appearance-none rounded-xl border bg-surface-2 px-4 py-3 pr-9 text-sm text-white transition-all duration-150 focus:outline-none focus:ring-1",
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : "border-border focus:border-accent focus:ring-accent/20",
          ].join(" ")}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <ChevronDown size={14} className="text-white/30" />
        </div>
      </div>
      {error && <p className="flex items-center gap-1 text-[11px] text-red-400"><span>↑</span> {error}</p>}
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
            <div className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
              i < current
                ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                : i === current
                ? "bg-accent text-white shadow-[0_0_12px_rgba(255,45,120,0.4)]"
                : "border border-border bg-surface-2 text-white/25",
            ].join(" ")}>
              {i < current ? <Check size={13} /> : i + 1}
            </div>
            <span className={[
              "text-[9px] font-bold uppercase tracking-[0.15em]",
              i <= current ? "text-white/55" : "text-white/20",
            ].join(" ")}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={[
              "mb-[22px] mx-2 mt-4 h-px flex-1 transition-colors duration-500",
              i < current ? "bg-emerald-500" : "bg-border",
            ].join(" ")} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ─── Step 1 — Contact ─────────────────────────────────────────────────────────

function ContactStep({
  data, errors, onChange,
}: { data: ContactForm; errors: Errors; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <Field
        label="Email Address"
        name="email"
        type="email"
        value={data.email}
        error={errors.email}
        placeholder="you@example.com"
        autoComplete="email"
        onChange={(v) => onChange("email", v)}
      />
      <Field
        label="Phone Number"
        name="phone"
        type="tel"
        value={data.phone}
        error={errors.phone}
        placeholder="+1 (555) 000-0000"
        autoComplete="tel"
        onChange={(v) => onChange("phone", v)}
      />
      <p className="text-[11px] text-white/25">
        We&apos;ll only use these to send your order confirmation and shipping updates.
      </p>
    </div>
  );
}

// ─── Step 2 — Shipping address ────────────────────────────────────────────────

function ShippingStep({
  data, errors, onChange,
}: { data: ShippingForm; errors: Errors; onChange: (f: string, v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" name="firstName" value={data.firstName} error={errors.firstName} placeholder="John" autoComplete="given-name" onChange={(v) => onChange("firstName", v)} />
        <Field label="Last Name" name="lastName" value={data.lastName} error={errors.lastName} placeholder="Doe" autoComplete="family-name" onChange={(v) => onChange("lastName", v)} />
      </div>
      <Field label="Street Address" name="address" value={data.address} error={errors.address} placeholder="123 Main Street, Apt 4B" autoComplete="street-address" onChange={(v) => onChange("address", v)} />
      <div className="grid grid-cols-3 gap-4">
        <Field label="City" name="city" value={data.city} error={errors.city} placeholder="New York" autoComplete="address-level2" onChange={(v) => onChange("city", v)} className="col-span-2" />
        <Field label="State / Province" name="state" value={data.state} error={errors.state} placeholder="NY" autoComplete="address-level1" onChange={(v) => onChange("state", v)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="ZIP / Postal Code" name="zip" value={data.zip} error={errors.zip} placeholder="10001" autoComplete="postal-code" onChange={(v) => onChange("zip", v)} />
        <SelectField label="Country" name="country" value={data.country} error={errors.country} onChange={(v) => onChange("country", v)}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </SelectField>
      </div>
    </div>
  );
}

// ─── Step 3 — Shipping method ─────────────────────────────────────────────────

function MethodStep({
  method, setMethod, subtotal,
}: { method: ShippingMethod; setMethod: (m: ShippingMethod) => void; subtotal: number }) {
  const freeStandard = subtotal >= 75;
  const options: {
    id: ShippingMethod;
    icon: React.ElementType;
    label: string;
    sub: string;
    price: string;
    priceNum: number;
  }[] = [
    {
      id: "standard",
      icon: Truck,
      label: "Standard Shipping",
      sub: "3–5 business days",
      price: freeStandard ? "Free" : "$9.99",
      priceNum: freeStandard ? 0 : 9.99,
    },
    {
      id: "express",
      icon: Zap,
      label: "Express Shipping",
      sub: "1–2 business days",
      price: "$19.99",
      priceNum: 19.99,
    },
  ];

  return (
    <div className="space-y-3">
      {options.map((opt) => {
        const selected = method === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setMethod(opt.id)}
            className={[
              "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150",
              selected
                ? "border-accent bg-accent/5 shadow-[0_0_16px_rgba(255,45,120,0.1)]"
                : "border-border bg-surface-2 hover:border-white/20",
            ].join(" ")}
          >
            {/* Radio */}
            <div className={[
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
              selected ? "border-accent" : "border-border",
            ].join(" ")}>
              {selected && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
            </div>

            {/* Icon */}
            <div className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              selected ? "bg-accent/15 text-accent" : "bg-surface-1 text-white/30",
            ].join(" ")}>
              <opt.icon size={17} />
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${selected ? "text-white" : "text-white/70"}`}>
                {opt.label}
              </p>
              <p className="text-xs text-white/35">{opt.sub}</p>
            </div>

            {/* Price */}
            <div className={[
              "text-right text-sm font-bold tabular-nums",
              opt.priceNum === 0 ? "text-emerald-400" : selected ? "text-white" : "text-white/60",
            ].join(" ")}>
              {opt.price}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 4 — Payment ─────────────────────────────────────────────────────────

function PaymentStep({
  data, errors, onChange, onCardFlip,
}: {
  data: PaymentForm;
  errors: Errors;
  onChange: (f: string, v: string) => void;
  onCardFlip: (flipped: boolean) => void;
}) {
  const [showCvv, setShowCvv] = useState(false);
  const cardType = detectCardType(data.cardNumber);

  const cardTypeLabel =
    cardType === "visa" ? "Visa"
    : cardType === "mastercard" ? "Mastercard"
    : cardType === "amex" ? "Amex"
    : null;

  return (
    <div className="space-y-5">
      {/* Card number */}
      <Field
        label="Card Number"
        name="cardNumber"
        value={data.cardNumber}
        error={errors.cardNumber}
        placeholder="0000 0000 0000 0000"
        autoComplete="cc-number"
        maxLength={19}
        onChange={(v) => onChange("cardNumber", formatCardNumber(v))}
        rightElement={
          cardTypeLabel ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
              {cardTypeLabel}
            </span>
          ) : (
            <CreditCard size={15} className="text-white/20" />
          )
        }
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Expiry */}
        <Field
          label="Expiry Date"
          name="expiry"
          value={data.expiry}
          error={errors.expiry}
          placeholder="MM/YY"
          autoComplete="cc-exp"
          maxLength={5}
          onChange={(v) => onChange("expiry", formatExpiry(v))}
        />

        {/* CVV */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cvv" className="text-[11px] font-bold uppercase tracking-widest text-white/35">
            CVV
          </label>
          <div className="relative">
            <input
              id="cvv"
              name="cvv"
              type={showCvv ? "text" : "password"}
              value={data.cvv}
              placeholder="•••"
              autoComplete="cc-csc"
              maxLength={4}
              onFocus={() => onCardFlip(true)}
              onBlur={() => onCardFlip(false)}
              onChange={(e) => onChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
              className={[
                "w-full rounded-xl border bg-surface-2 px-4 py-3 pr-10 text-sm text-white placeholder:text-white/18 transition-all focus:outline-none focus:ring-1",
                errors.cvv
                  ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                  : "border-border focus:border-accent focus:ring-accent/20",
              ].join(" ")}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowCvv((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-white/30 hover:text-white/60"
            >
              {showCvv ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.cvv && (
            <p className="flex items-center gap-1 text-[11px] text-red-400"><span>↑</span> {errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Name on card */}
      <Field
        label="Name on Card"
        name="nameOnCard"
        value={data.nameOnCard}
        error={errors.nameOnCard}
        placeholder="John Doe"
        autoComplete="cc-name"
        onChange={(v) => onChange("nameOnCard", v)}
      />

      {/* Alternative payment methods */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/25">
          Also accepted
        </p>
        <div className="flex gap-2">
          {[
            { icon: Bitcoin, label: "Crypto", note: "BTC / ETH" },
            { icon: Building2, label: "Bank", note: "Wire transfer" },
          ].map(({ icon: Icon, label, note }) => (
            <div
              key={label}
              title="Coming soon"
              className="flex flex-1 cursor-not-allowed items-center gap-2.5 rounded-xl border border-dashed border-border/60 px-3 py-2.5 opacity-35"
            >
              <Icon size={16} className="text-white/50 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white/60">{label}</p>
                <p className="text-[10px] text-white/30">{note}</p>
              </div>
              <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/30">
                Soon
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CheckoutClient() {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  const [contact, setContact] = useState<ContactForm>({ email: "", phone: "" });
  const [shipping, setShipping] = useState<ShippingForm>({
    firstName: "", lastName: "", address: "",
    city: "", state: "", zip: "", country: "US",
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [payment, setPayment] = useState<PaymentForm>({
    cardNumber: "", expiry: "", cvv: "", nameOnCard: "",
  });

  const shippingCost =
    shippingMethod === "express" ? 19.99 : subtotal >= 75 ? 0 : 9.99;

  const clearFieldError = (field: string) =>
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });

  const updateContact = (field: string, value: string) => {
    setContact((p) => ({ ...p, [field]: value } as ContactForm));
    clearFieldError(field);
  };

  const updateShipping = (field: string, value: string) => {
    setShipping((p) => ({ ...p, [field]: value } as ShippingForm));
    clearFieldError(field);
  };

  const updatePayment = (field: string, value: string) => {
    setPayment((p) => ({ ...p, [field]: value } as PaymentForm));
    clearFieldError(field);
  };

  // Validation
  function validateContact(): Errors {
    const e: Errors = {};
    if (!contact.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
      e.email = "Please enter a valid email address";
    if (!contact.phone) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s()\-.]{7,}$/.test(contact.phone))
      e.phone = "Please enter a valid phone number";
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
    else if (!/^\d{4,10}$/.test(shipping.zip.replace(/\s/g, "")))
      e.zip = "Please enter a valid postal code";
    return e;
  }

  function validatePayment(): Errors {
    const e: Errors = {};
    const digits = payment.cardNumber.replace(/\s/g, "");
    if (!digits) e.cardNumber = "Card number is required";
    else if (digits.length !== 16) e.cardNumber = "Card number must be 16 digits";

    if (!payment.expiry) {
      e.expiry = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) {
      e.expiry = "Enter a valid expiry (MM/YY)";
    } else {
      const [mm, yy] = payment.expiry.split("/").map(Number);
      const exp = new Date(2000 + yy, mm - 1, 1);
      if (exp < new Date()) e.expiry = "This card has expired";
    }

    if (!payment.cvv) e.cvv = "CVV is required";
    else if (!/^\d{3,4}$/.test(payment.cvv)) e.cvv = "Enter a valid CVV";

    if (!payment.nameOnCard.trim()) e.nameOnCard = "Name on card is required";
    return e;
  }

  const handleNext = () => {
    const errs =
      step === 0 ? validateContact()
      : step === 1 ? validateShipping()
      : {};
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    const errs = validatePayment();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1600));

    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      email: contact.email,
      placedAt: new Date().toISOString(),
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
        category: i.product.category,
      })),
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      shippingAddress: shipping,
      shippingMethod,
    };

    try {
      localStorage.setItem("peptobuy-last-order", JSON.stringify(orderData));
    } catch { /* ignore */ }

    clearCart();
    router.push("/order-confirmation");
  };

  // ── Empty cart guard ───────────────────────────────
  if (hydrated && items.length === 0 && !submitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface-1">
          <ShoppingBag size={28} className="text-white/15" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Your cart is empty</h2>
        <p className="mb-6 text-sm text-white/40">Add products before checking out.</p>
        <Link href="/shop" className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-hover">
          Browse Products <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const stepTitles = [
    "Contact Information",
    "Shipping Address",
    "Shipping Method",
    "Payment Details",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back to cart */}
      <Link href="/cart" className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white">
        <ChevronLeft size={15} /> Back to Cart
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* ── Left: form ──────────────────────────────── */}
        <div>
          <StepIndicator current={step} />

          {/* Section heading */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
              Step {step + 1} of {STEPS.length}
            </p>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {stepTitles[step]}
            </h1>
          </div>

          {/* Card preview (payment step only) */}
          {step === 3 && (
            <div className="mb-6">
              <CardPreview
                cardNumber={payment.cardNumber}
                nameOnCard={payment.nameOnCard}
                expiry={payment.expiry}
                cvv={payment.cvv}
                isFlipped={cardFlipped}
              />
            </div>
          )}

          {/* Step forms */}
          <div className="rounded-2xl border border-border bg-surface-1 p-6">
            {step === 0 && (
              <ContactStep data={contact} errors={errors} onChange={updateContact} />
            )}
            {step === 1 && (
              <ShippingStep data={shipping} errors={errors} onChange={updateShipping} />
            )}
            {step === 2 && (
              <MethodStep method={shippingMethod} setMethod={setShippingMethod} subtotal={subtotal} />
            )}
            {step === 3 && (
              <PaymentStep
                data={payment}
                errors={errors}
                onChange={updatePayment}
                onCardFlip={setCardFlipped}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="mt-5 flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-white/60 transition-colors hover:border-white/20 hover:text-white"
              >
                <ChevronLeft size={15} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-[0_0_16px_rgba(255,45,120,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(255,45,120,0.4)] active:scale-[0.98]"
              >
                Continue <ChevronLeft size={15} className="rotate-180" />
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.3)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.45)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <ChevronLeft size={15} className="rotate-180" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Right: summary ───────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <CheckoutSummary shippingCost={shippingCost} />
        </div>
      </div>
    </div>
  );
}
