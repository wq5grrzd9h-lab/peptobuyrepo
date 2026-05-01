import { HTMLAttributes } from "react";

type BadgeVariant = "accent" | "neutral" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent: "bg-accent/10 text-accent border-accent/25",
  neutral: "bg-zinc-100 text-zinc-600 border-zinc-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
};

const badgeVariantMap: Record<string, BadgeVariant> = {
  "Best Seller": "accent",
  Sale: "warning",
  New: "success",
};

export function resolveBadgeVariant(label: string): BadgeVariant {
  return badgeVariantMap[label] ?? "neutral";
}

export default function Badge({ variant = "neutral", label, className = "", ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {label}
    </span>
  );
}
