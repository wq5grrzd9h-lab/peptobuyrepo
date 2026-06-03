// Shared HTML builders for abandoned cart / checkout emails

import { MEMORIAL_DAY_END } from "@/lib/memorialDay";

export interface CartEmailItem {
  name: string;
  dose: string;
  price: number;
  quantity: number;
}

function itemRows(items: CartEmailItem[]): string {
  return items
    .map(
      (i) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#18181b;">${i.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;">${i.dose}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#52525b;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f5f5f5;font-size:13px;font-weight:600;color:#18181b;text-align:right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`,
    )
    .join("");
}

const TABLE_HEADER = `
<table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;margin-bottom:20px;">
  <thead>
    <tr style="background:#f4f4f5;">
      <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Product</th>
      <th style="padding:10px 14px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Dose</th>
      <th style="padding:10px 14px;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Qty</th>
      <th style="padding:10px 14px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#71717a;">Total</th>
    </tr>
  </thead>
  <tbody>`;

const TRUST_BADGES = `
<div style="display:flex;gap:12px;margin-bottom:24px;justify-content:center;flex-wrap:wrap;">
  <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">🔒 Secure Checkout</div>
  <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">🏅 ISO 9001 Tested</div>
  <div style="background:#f4f4f5;border-radius:8px;padding:10px 16px;font-size:12px;color:#52525b;font-weight:600;">📋 COA On Request</div>
</div>`;

const FIRST20_NUDGE = `
<div style="background:#fff5f8;border:2px solid #ffb3cb;border-radius:10px;padding:14px 18px;margin-bottom:20px;text-align:center;">
  <p style="margin:0;font-size:13px;color:#cc1155;font-weight:600;">
    🧪 First order? Use code <strong style="font-family:monospace;font-size:15px;letter-spacing:.06em;">FIRST20</strong> for 20% off
  </p>
  <p style="margin:4px 0 0;font-size:12px;color:#cc1155;opacity:.8;">Apply at checkout before completing your order.</p>
</div>`;

const DISCLAIMER = `
<div style="background:#f4f4f5;padding:16px 32px;border-top:1px solid #e5e5e5;">
  <p style="margin:0 0 8px;font-size:11px;color:#a1a1aa;line-height:1.6;text-align:center;">
    ⚠ All products are for in vitro research use only. Not intended for human or animal consumption.
    Not approved by the FDA. By purchasing, you confirm compliance with all applicable laws.
  </p>`;

function memorialBlock(): string {
  if (Date.now() >= MEMORIAL_DAY_END.getTime()) return "";
  return `
<div style="background:#8B0000;border-radius:10px;padding:14px 18px;margin-bottom:20px;text-align:center;">
  <p style="margin:0;font-size:13px;font-weight:800;color:#fff;">🇺🇸 Memorial Day Sale — Ends Monday Midnight</p>
  <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.85);line-height:1.5;">
    🚨 STOCK UPDATE: ⚠️ BAC Water — Low Quantity — Act Fast! · ⚠️ Syringes almost gone<br/>
    ⚠️ RTGLP3 (Reta) — Only 6 left · ⚠️ Free GHK-Cu — Only 3 left (orders $250+)
  </p>
</div>`;
}

function emailShell(title: string, bodyContent: string, footerNote: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#f4f4f5;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#ff2d78;padding:28px 32px;text-align:center;">
    <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.03em;">PeptoBuy</p>
    <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);font-weight:500;">Research-Grade Peptides</p>
  </div>
  <div style="padding:32px;">${bodyContent}</div>
  ${DISCLAIMER}
  <p style="margin:8px 0 0;font-size:11px;color:#a1a1aa;text-align:center;">
    ${footerNote} &nbsp;
    <a href="mailto:peptobuy@gmail.com?subject=Unsubscribe" style="color:#a1a1aa;">Unsubscribe</a>
  </p>
  </div>
</div>
</body></html>`;
}

export function buildCartAbandonedHtml(items: CartEmailItem[], cartTotal: number): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
      You left your cart 🧪
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      Hey! You just left PeptoBuy with items still in your cart. They're saved and ready — come back and complete your order.
    </p>
    ${TABLE_HEADER}${itemRows(items)}</tbody></table>
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #e5e5e5;margin-bottom:24px;">
      <span style="font-size:15px;font-weight:700;color:#18181b;">Cart Total</span>
      <span style="font-size:18px;font-weight:800;color:#ff2d78;">$${cartTotal.toFixed(2)}</span>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://peptobuy.com/cart"
        style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:-0.01em;box-shadow:0 0 28px rgba(255,45,120,0.3);">
        Return to My Cart →
      </a>
    </div>
    ${memorialBlock()}
    ${FIRST20_NUDGE}
    ${TRUST_BADGES}
    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
      Questions? <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
    </p>`;
  return emailShell("Come back to your cart", body, "You received this because you saved your cart at peptobuy.com.");
}

export function buildCheckoutAbandonedHtml(items: CartEmailItem[], cartTotal: number): string {
  const body = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">
      Complete your order 🧪
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
      Hey! You were so close — you started checkout at PeptoBuy but didn't complete your order. Your cart is still saved.
    </p>
    ${TABLE_HEADER}${itemRows(items)}</tbody></table>
    <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #e5e5e5;margin-bottom:24px;">
      <span style="font-size:15px;font-weight:700;color:#18181b;">Cart Total</span>
      <span style="font-size:18px;font-weight:800;color:#ff2d78;">$${cartTotal.toFixed(2)}</span>
    </div>
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://peptobuy.com/checkout"
        style="display:inline-block;background:#ff2d78;color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:-0.01em;box-shadow:0 0 28px rgba(255,45,120,0.3);">
        Complete My Order →
      </a>
    </div>
    <div style="background:#f5f3ff;border:2px solid #c4b5fd;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;font-weight:700;color:#4c1d95;">💜 Payment options</p>
      <p style="margin:6px 0 0;font-size:12px;color:#5b21b6;line-height:1.5;">
        Pay by <strong>Card</strong>, <strong>Crypto</strong>, or <strong>Zelle</strong>.<br/>
        Prefer Zelle? Send to <strong style="font-family:monospace;">peptobuy@gmail.com</strong> with your order number as the memo.
      </p>
    </div>
    ${memorialBlock()}
    ${FIRST20_NUDGE}
    ${TRUST_BADGES}
    <p style="margin:0;font-size:13px;color:#71717a;line-height:1.6;">
      Questions? <a href="mailto:peptobuy@gmail.com" style="color:#ff2d78;text-decoration:none;font-weight:600;">peptobuy@gmail.com</a>
    </p>`;
  return emailShell("Complete your PeptoBuy order", body, "You received this because you started a checkout at peptobuy.com.");
}
