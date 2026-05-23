// Memorial Day promotion constants & helpers
// Promo expires: Monday May 26 2026 11:59 PM Eastern Time

export const MEMORIAL_DAY_END = new Date("2026-05-27T04:59:00.000Z"); // 11:59 PM EST = 04:59 UTC next day

export function isPromoActive(): boolean {
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
