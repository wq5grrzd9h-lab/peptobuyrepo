import { HTMLAttributes } from "react";

type BadgeVariant = "accent" | "neutral" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  label: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  accent: "bg-accent/15 text-accent border-accent/30",
  neutral: "bg-white/10 text-white/80 border-white/10",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
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
