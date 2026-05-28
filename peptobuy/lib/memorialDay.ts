// Flash Sale — runs indefinitely, resets every night at midnight EST.
// No fixed end date. isPromoActive() and isFreeShippingWeekend() always return true.
// To turn off the sale: change SALE_ENABLED to false and redeploy.

const SALE_ENABLED = true;

/**
 * Returns tonight's 11:59:59 PM EST as a UTC Date.
 * DST-safe via the toLocaleString / offset-diff trick.
 * Automatically rolls over to the next night after midnight.
 */
export function getSaleEndDate(): Date {
  const now = new Date();
  // Wall-clock "now" in New York, parsed as if it were local time
  const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  // DST-safe offset between real UTC and NY wall clock
  const offset = now.getTime() - estNow.getTime();
  // Advance the NY wall clock to 23:59:59 tonight
  const endOfToday = new Date(estNow);
  endOfToday.setHours(23, 59, 59, 999);
  // Shift back to real UTC
  return new Date(endOfToday.getTime() + offset);
}

/** Always true — sale resets daily, never expires automatically. */
export function isPromoActive(): boolean {
  return SALE_ENABLED;
}

/** Always true — free shipping on every order while sale is enabled. */
export function isFreeShippingWeekend(): boolean {
  return SALE_ENABLED;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  mins: number;
  secs: number;
  expired: boolean;
}

/**
 * Countdown to tonight's EST midnight.
 * expired is always false — when ms hits 0 the next tick recalculates
 * against the NEW tonight's midnight automatically.
 */
export function getTimeRemaining(): TimeRemaining {
  if (!SALE_ENABLED) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  const ms = Math.max(0, getSaleEndDate().getTime() - Date.now());
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  // expired never set to true while SALE_ENABLED — timer resets at midnight automatically
  return { days, hours, mins, secs, expired: false };
}

/**
 * Dynamic urgency copy. Updates every 30 s in the UI.
 */
export function getUrgencyText(): string {
  if (!SALE_ENABLED) return "";
  const ms = Math.max(0, getSaleEndDate().getTime() - Date.now());
  const totalHours = ms / (1000 * 60 * 60);
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

// Legacy exports — kept so existing imports don't break
/** @deprecated Sale has no fixed end. Use isPromoActive() */
export const FLASH_SALE_FINAL_END = new Date("2099-12-31T23:59:59Z");
/** @deprecated Sale has no fixed end. Use isFreeShippingWeekend() */
export const FREE_SHIPPING_END = new Date("2099-12-31T23:59:59Z");
/** @deprecated Use FLASH_SALE_FINAL_END */
export const MEMORIAL_DAY_END = FLASH_SALE_FINAL_END;
