// ─── Shared order email HTML builders ────────────────────────────────────────
// Used by send-order-emails, confirm-and-email, and test-order-email.
// DO NOT change styling — only structure/data changes allowed here.

export const RECON_PRICE = 29.99;
export const FREE_GHKCU_THRESHOLD = 250;

export interface EmailItem {
  name: string;
  dose: string;
  quantity: number;
  price: number;       // unit price (already includes recon if applicable)
  reconstitution: boolean;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: EmailItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  shipping: number;
  taxAmount?: number;
  total: number;
  paymentMethodLabel: string;
  shippingAddress: ShippingAddress;
  freeGifts?: string[];  // e.g. ["BAC Water + Syringes", "GHK-Cu 100mg"]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function itemRowsHtml(items: EmailItem[]): string {
  return items.map((i) => {
    const reconLabel = i.reconstitution
      ? ` <span style="font-size:11px;color:#ff2d78;font-weight:600;">(pre-mixed +$${RECON_PRICE.toFixed(2)})</span>`
      : "";
    return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#18181b;">${i.name}${reconLabel}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${i.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`;
  }).join("");
}

function freeGiftRowsHtml(gifts: string[]): string {
  return gifts.map((g) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#16a34a;font-weight:600;">🎁 ${g} <span style="font-size:11px;font-weight:400;color:#52525b;">(Flash Sale Gift)</span></td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">—</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#52525b;text-align:center;">1</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#16a34a;text-align:right;">$0.00</td>
    </tr>`).join("");
}

// ─── Internal email (peptobuy@gmail.com) ─────────────────────────────────────

export function buildInternalHtml(d: OrderEmailData, timestamp: string): string {
  const addr = d.shippingAddress;
  const allItemRows = itemRowsHtml(d.items) + (d.freeGifts?.length ? freeGiftRowsHtml(d.freeGifts) : "");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>New Order</title></head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;background:#f9f9f9;color:#18181b;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#ff2d78;padding:20px 28px;">
      <h1 style="margin:0;font-size:18px;font-weight:800;color:#fff;">🧪 New Order — ${d.orderNumber}</h1>
      <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">${timestamp}</p>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;width:130px;">Order #</td><td style="padding:6px 0;font-size:13px;font-weight:700;font-family:monospace;color:#18181b;">${d.orderNumber}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Payment</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.paymentMethodLabel}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Customer</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerName}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Email</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerEmail}</td></tr>
        <tr><td style="padding:6px 0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a1a1aa;">Ship to</td><td style="padding:6px 0;font-size:13px;color:#18181b;">${d.customerName}<br>${addr.address}<br>${addr.city}, ${addr.state} ${addr.zip}${addr.country ? `, ${addr.country}` : ""}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Product</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Dose</th>
            <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Qty</th>
            <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>${allItemRows}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Subtotal</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#18181b;">$${d.subtotal.toFixed(2)}</td></tr>
        ${d.discountCode && d.discountAmount ? `<tr><td style="padding:4px 0;font-size:13px;color:#16a34a;font-weight:600;">Discount (${d.discountCode})</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#16a34a;font-weight:600;">-$${d.discountAmount.toFixed(2)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Shipping</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#18181b;">${d.shipping === 0 ? "Free" : `$${d.shipping.toFixed(2)}`}</td></tr>
        ${(d.taxAmount ?? 0) > 0 ? `<tr><td style="padding:4px 0;font-size:13px;color:#71717a;">Tax</td><td style="padding:4px 0;font-size:13px;text-align:right;color:#18181b;">$${(d.taxAmount ?? 0).toFixed(2)}</td></tr>` : ""}
        <tr style="border-top:1px solid #e5e5e5;">
          <td style="padding:10px 0 4px;font-size:14px;font-weight:700;color:#18181b;">Total</td>
          <td style="padding:10px 0 4px;font-size:16px;font-weight:800;text-align:right;color:#ff2d78;">$${d.total.toFixed(2)}</td>
        </tr>
      </table>
    </div>
  </div>
</body></html>`;
}

// ─── Customer confirmation email ──────────────────────────────────────────────

export function buildCustomerHtml(d: OrderEmailData, zelleBlock = ""): string {
  const addr = d.shippingAddress;
  const allItemRows = itemRowsHtml(d.items) + (d.freeGifts?.length ? freeGiftRowsHtml(d.freeGifts) : "");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
  <div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Research-Grade Peptides</p>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;color:#18181b;">${zelleBlock ? "Order Placed" : "Order Confirmed"} ✓</h1>
      <p style="margin:0 0 24px;font-size:14px;color:#71717a;">${zelleBlock ? "Your order has been placed. Complete your Zelle payment to confirm it." : "Thank you for your order. We will ship promptly."}</p>
      <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Order Number</p>
        <p style="margin:0 0 8px;font-size:20px;font-weight:800;font-family:monospace;color:#ff2d78;letter-spacing:.04em;">${d.orderNumber}</p>
        <p style="margin:0 0 2px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Payment Method</p>
        <p style="margin:0;font-size:13px;color:#18181b;">${d.paymentMethodLabel}</p>
      </div>
      ${zelleBlock}
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin-bottom:16px;">
        <thead>
          <tr style="background:#f4f4f5;">
            <th style="padding:9px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Product</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Dose</th>
            <th style="padding:9px 12px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Qty</th>
            <th style="padding:9px 12px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#71717a;">Total</th>
          </tr>
        </thead>
        <tbody>${allItemRows}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Subtotal</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">$${d.subtotal.toFixed(2)}</td></tr>
        ${d.discountCode && d.discountAmount ? `<tr><td style="padding:3px 0;font-size:13px;color:#16a34a;font-weight:600;">Discount (${d.discountCode})</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#16a34a;font-weight:600;">-$${d.discountAmount.toFixed(2)}</td></tr>` : ""}
        <tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Shipping</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">${d.shipping === 0 ? "Free" : `$${d.shipping.toFixed(2)}`}</td></tr>
        ${(d.taxAmount ?? 0) > 0 ? `<tr><td style="padding:3px 0;font-size:13px;color:#71717a;">Tax</td><td style="padding:3px 0;font-size:13px;text-align:right;color:#18181b;">$${(d.taxAmount ?? 0).toFixed(2)}</td></tr>` : ""}
        <tr style="border-top:2px solid #e5e5e5;">
          <td style="padding:10px 0 0;font-size:14px;font-weight:700;color:#18181b;">Total</td>
          <td style="padding:10px 0 0;font-size:17px;font-weight:800;text-align:right;color:#ff2d78;">$${d.total.toFixed(2)}</td>
        </tr>
      </table>
      <div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#a1a1aa;">Ships To</p>
        <p style="margin:0;font-size:13px;color:#18181b;line-height:1.7;">
          ${addr.firstName} ${addr.lastName}<br>
          ${addr.address}<br>
          ${addr.city}, ${addr.state} ${addr.zip}
        </p>
      </div>
      <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
        Questions? Email us at
        <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
      </p>
    </div>
    <div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
      <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
        ⚠ All products are for in vitro research use only. Not intended for human consumption.
      </p>
    </div>
  </div>
</body></html>`;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Derive free gifts from order totals (flash sale always on). */
export function deriveFreeGifts(discountedSubtotal: number): string[] {
  const gifts = ["Syringes (BAC Water: SOLD OUT)"];
  if (discountedSubtotal >= FREE_GHKCU_THRESHOLD) gifts.push("GHK-Cu 100mg");
  return gifts;
}

/** Map Stripe PM type → human-readable label. */
export function stripepmLabel(type: string): string {
  switch (type) {
    case "affirm": return "Affirm (Buy Now, Pay Later)";
    case "klarna": return "Klarna (Buy Now, Pay Later)";
    case "card":   return "Credit / Debit Card (Stripe)";
    default:       return "Credit / Debit Card (Stripe)";
  }
}
