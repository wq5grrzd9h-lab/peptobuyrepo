// Memorial Day promotion constants & helpers
// Phase 1: ends May 25 2026 11:59:59 PM EST
// Phase 2: auto-extends to May 26 2026 11:59:59 PM EST if visited after phase 1 ends

const PHASE_1 = new Date("2026-05-25T23:59:59-05:00"); // May 25 11:59:59 PM EST
const PHASE_2 = new Date("2026-05-26T23:59:59-05:00"); // May 26 11:59:59 PM EST

export function getSaleEndDate(): Date {
  const now = Date.now();
  if (now < PHASE_1.getTime()) return PHASE_1; // before tonight — end tonight
  if (now < PHASE_2.getTime()) return PHASE_2; // past tonight, before tomorrow — extended
  return PHASE_2;                               // fully expired — return final date
}

// Derived constant for server-side code that needs a fixed value at module load time
// (abandoned email routes, etc.) — these run at request time so getSaleEndDate() is fine,
// but MEMORIAL_DAY_END is kept for backward compat with existing imports.
export const MEMORIAL_DAY_END = PHASE_2;

export function isPromoActive(): boolean {
  return Date.now() < getSaleEndDate().getTime();
}

/** Free shipping on ALL orders during Memorial Day weekend. */
export function isFreeShippingWeekend(): boolean {
  return Date.now() < getSaleEndDate().getTime();
}

export interface TimeRemaining {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  expired: boolean;
}

export function getTimeRemaining(): TimeRemaining {
  const ms = Math.max(0, getSaleEndDate().getTime() - Date.now());
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
