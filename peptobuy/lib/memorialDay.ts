// Flash Sale — rolls over at midnight EST each night through May 31 2026
// After May 31 23:59:59 EDT — permanently over, all promo UI removed

// Final hard stop — May 31 2026 11:59:59 PM EDT (UTC-4)
export const FLASH_SALE_FINAL_END = new Date("2026-05-31T23:59:59-04:00");

/**
 * Free shipping ends TONIGHT May 26 2026 at 11:59:59 PM EDT.
 * Independent of the flash sale which runs through May 31.
 * After midnight: $300 threshold resumes.
 */
export const FREE_SHIPPING_END = new Date("2026-05-26T23:59:59-04:00");

/** @deprecated Use FLASH_SALE_FINAL_END */
export const MEMORIAL_DAY_END = FLASH_SALE_FINAL_END;

/**
 * Returns tonight's 23:59:59 EST — or FLASH_SALE_FINAL_END if that's sooner.
 * Handles DST correctly via the toLocaleString/diff trick.
 */
export function getSaleEndDate(): Date {
  const now = new Date();
  if (now >= FLASH_SALE_FINAL_END) return FLASH_SALE_FINAL_END;

  // Get "now" expressed as a wall-clock Date in New York, parsed as local time
  const nyNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  // Difference between actual UTC time and NY wall-clock-as-local — the DST-safe offset
  const nyDiff = now.getTime() - nyNow.getTime();

  // Advance nyNow to 23:59:59 tonight (NY wall clock)
  const nyMidnight = new Date(nyNow);
  nyMidnight.setHours(23, 59, 59, 0);

  // Convert back to real UTC
  const todayEndUTC = new Date(nyMidnight.getTime() + nyDiff);

  return todayEndUTC < FLASH_SALE_FINAL_END ? todayEndUTC : FLASH_SALE_FINAL_END;
}

/** Promo is active until May 31 — so banners/gifts stay on all month. */
export function isPromoActive(): boolean {
  return Date.now() < FLASH_SALE_FINAL_END.getTime();
}

/**
 * Free shipping active until FREE_SHIPPING_END (tonight May 26 11:59:59 PM EDT).
 * After midnight: falls back to $300 threshold in cart/checkout.
 */
export function isFreeShippingWeekend(): boolean {
  return Date.now() < FREE_SHIPPING_END.getTime();
}

export interface TimeRemaining {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  expired: boolean;
}

/** Countdown to tonight's midnight (rolls over automatically). */
export function getTimeRemaining(): TimeRemaining {
  const ms = Math.max(0, getSaleEndDate().getTime() - Date.now());
  if (ms === 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: !isPromoActive() };
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  return { days, hours, mins, secs, expired: false };
}

/**
 * Dynamic urgency copy based on hours remaining tonight.
 * Used next to the countdown timer.
 */
export function getUrgencyText(): string {
  if (!isPromoActive()) return "";
  const ms = Math.max(0, getSaleEndDate().getTime() - Date.now());
  if (ms === 0) return "";
  const totalMins = ms / (1000 * 60);
  const totalHours = totalMins / 60;
  const wholeHours = Math.floor(totalHours);

  if (totalHours > 12) return "Sale ends tonight at midnight";
  if (totalHours >= 6) return "Less than 12 hours left!";
  if (totalHours >= 1) return `Only ${wholeHours} hour${wholeHours !== 1 ? "s" : ""} left!`;
  return "Less than 1 hour left — order NOW!";
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Minimum subtotal to unlock free GHK-Cu gift
export const FREE_GHKCU_THRESHOLD = 250;
