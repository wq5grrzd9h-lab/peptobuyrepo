// Memorial Day promotion constants & helpers
// Promo expires: Monday May 26 2026 11:59:59 PM Eastern Time (EST = UTC-5)

// 2026-05-26T23:59:59-05:00 == 2026-05-27T04:59:59.000Z
export const MEMORIAL_DAY_END = new Date("2026-05-26T23:59:59-05:00");

export function isPromoActive(): boolean {
  return Date.now() < MEMORIAL_DAY_END.getTime();
}

/** Free shipping on ALL orders during Memorial Day weekend (same deadline as the promo). */
export function isFreeShippingWeekend(): boolean {
  return Date.now() < MEMORIAL_DAY_END.getTime();
}

export interface TimeRemaining {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  expired: boolean;
}

export function getTimeRemaining(): TimeRemaining {
  const ms = Math.max(0, MEMORIAL_DAY_END.getTime() - Date.now());
  if (ms === 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  return { days, hours, mins, secs, expired: false };
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Minimum subtotal to unlock free GHK-Cu gift
export const FREE_GHKCU_THRESHOLD = 250;
