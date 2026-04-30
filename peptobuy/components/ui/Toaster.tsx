"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  XCircle,
  Info,
  ShoppingCart,
  X,
} from "lucide-react";
import { useToast, type ToastItem, type ToastType } from "@/context/ToastContext";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    barClass: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-400",
    barClass: "bg-red-500",
  },
  info: {
    icon: Info,
    iconClass: "text-blue-400",
    barClass: "bg-blue-500",
  },
  cart: {
    icon: ShoppingCart,
    iconClass: "text-accent",
    barClass: "bg-accent",
  },
};

// ─── Single toast ─────────────────────────────────────────────────────────────

function Toast({
  item,
  exiting,
  onDismiss,
}: {
  item: ToastItem;
  exiting: boolean;
  onDismiss: () => void;
}) {
  const { icon: Icon, iconClass, barClass } = TYPE_CONFIG[item.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        animation: exiting
          ? "toast-out 0.32s cubic-bezier(0.4,0,1,1) forwards"
          : "toast-in 0.32s cubic-bezier(0,0,0.2,1) both",
      }}
      className="relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-border bg-surface-1 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
    >
      {/* Left accent bar */}
      <div className={`absolute inset-y-0 left-0 w-[3px] ${barClass}`} />

      {/* Icon */}
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconClass}`} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5 text-xs text-white/45 leading-snug line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="mt-0.5 shrink-0 rounded p-0.5 text-white/25 transition-colors hover:text-white/60"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

function ToastContainer() {
  const { toasts, exiting, dismiss } = useToast();

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-4 z-[200] flex flex-col-reverse gap-3 sm:right-6"
      style={{ width: "min(calc(100vw - 32px), 360px)" }}
    >
      {toasts.map((item) => (
        <Toast
          key={item.id}
          item={item}
          exiting={exiting.has(item.id)}
          onDismiss={() => dismiss(item.id)}
        />
      ))}
    </div>
  );
}

// ─── Portal wrapper ───────────────────────────────────────────────────────────

export default function Toaster() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<ToastContainer />, document.body);
}
