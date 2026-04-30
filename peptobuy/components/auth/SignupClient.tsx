"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center text-2xl font-black tracking-tight">
      <span className="text-white">Pepto</span>
      <span className="text-accent">Buy</span>
    </Link>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

type Errors = Record<string, string>;

function Field({
  label, name, type = "text", value, error, placeholder, autoComplete, onChange, rightElement, className = "",
}: {
  label: string; name: string; type?: string; value: string; error?: string;
  placeholder?: string; autoComplete?: string; onChange: (v: string) => void;
  rightElement?: React.ReactNode; className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-[11px] font-bold uppercase tracking-widest text-white/40">
        {label}
      </label>
      <div className="relative">
        <input
          id={name} name={name} type={type} value={value}
          placeholder={placeholder} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full rounded-xl border bg-surface-2 px-4 py-3 text-sm text-white placeholder:text-white/18 transition-all focus:outline-none focus:ring-1",
            rightElement ? "pr-11" : "",
            error
              ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
              : "border-border focus:border-accent focus:ring-accent/20",
          ].join(" ")}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-3 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-[11px] text-red-400">↑ {error}</p>}
    </div>
  );
}

function Checkbox({
  checked, onChange, children,
}: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <div
        onClick={() => onChange(!checked)}
        className={[
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
          checked ? "border-accent bg-accent" : "border-border bg-surface-2 hover:border-white/30",
        ].join(" ")}
      >
        {checked && <Check size={10} className="text-white" />}
      </div>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} className="sr-only" />
      <span className="text-sm leading-relaxed text-white/55">{children}</span>
    </label>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { min: 1, label: "Weak", bars: 1, color: "bg-red-500" },
    { min: 2, label: "Fair", bars: 2, color: "bg-amber-500" },
    { min: 3, label: "Strong", bars: 3, color: "bg-emerald-500" },
  ];
  const level = levels.filter((l) => score >= l.min).at(-1) ?? levels[0];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={[
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= level.bars ? level.color : "bg-surface-2",
            ].join(" ")}
          />
        ))}
      </div>
      <p className="text-[11px] text-white/35">
        Strength:{" "}
        <span className={`font-semibold ${level.color.replace("bg-", "text-")}`}>
          {level.label}
        </span>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SignupClient() {
  const { signup } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (v: string) => {
    setForm((f) => ({ ...f, [field]: v }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  function validate(): Errors {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Please enter a valid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) e.terms = "You must agree to the terms to continue";
    return e;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      await signup({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      router.push("/");
    } catch {
      setErrors({ _form: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="text-white/30 transition-colors hover:text-white/60"
      tabIndex={-1}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 20%, rgba(255,45,120,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="mt-3 text-2xl font-black tracking-tight text-white">
            Create your account
          </h1>
          <p className="text-sm text-white/40">
            Join 12,000+ athletes on PeptoBuy
          </p>
        </div>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface-1 p-7 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Google button */}
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm font-semibold text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium text-white/25">or with email</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Global error */}
            {errors._form && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {errors._form}
              </p>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First name"
                name="firstName"
                value={form.firstName}
                error={errors.firstName}
                placeholder="John"
                autoComplete="given-name"
                onChange={set("firstName")}
              />
              <Field
                label="Last name"
                name="lastName"
                value={form.lastName}
                error={errors.lastName}
                placeholder="Doe"
                autoComplete="family-name"
                onChange={set("lastName")}
              />
            </div>

            {/* Email */}
            <Field
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              onChange={set("email")}
            />

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Field
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                error={errors.password}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                onChange={set("password")}
                rightElement={eyeBtn(showPassword, () => setShowPassword((s) => !s))}
              />
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <Field
              label="Confirm password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={form.confirmPassword}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
              autoComplete="new-password"
              onChange={set("confirmPassword")}
              rightElement={eyeBtn(showConfirm, () => setShowConfirm((s) => !s))}
            />

            {/* Terms */}
            <div className="flex flex-col gap-1.5">
              <Checkbox checked={agreedToTerms} onChange={(v) => {
                setAgreedToTerms(v);
                if (v) setErrors((e) => { const n = { ...e }; delete n.terms; return n; });
              }}>
                I agree to the{" "}
                <Link href="/terms" className="text-accent underline underline-offset-2 hover:no-underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-accent underline underline-offset-2 hover:no-underline">
                  Privacy Policy
                </Link>
              </Checkbox>
              {errors.terms && (
                <p className="text-[11px] text-red-400">↑ {errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,45,120,0.25)] transition-all hover:bg-accent-hover hover:shadow-[0_0_28px_rgba(255,45,120,0.4)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-white transition-colors hover:text-accent">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
