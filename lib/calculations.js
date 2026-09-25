// lib/calculations.js
//
// All money math is done in integer "cents" (or fils, for AED - 2 decimal
// places) to avoid floating point rounding issues, then converted back to
// a normal decimal number only for display/storage.

const DECIMALS = 2;
const FACTOR = 10 ** DECIMALS;

/** Convert a decimal amount (e.g. 12.5) to integer cents (1250). */
export function toCents(amount) {
  const n = Number(amount);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * FACTOR);
}

/** Convert integer cents back to a decimal number rounded to 2 dp. */
export function fromCents(cents) {
  return Math.round(cents) / FACTOR;
}

/** Sum an array of integer cents. */
export function sumCents(centsArray) {
  return centsArray.reduce((sum, c) => sum + c, 0);
}

/**
 * Compute a single line item's total in cents.
 * quantity is treated as an integer/decimal multiplier, price is a decimal
 * amount (e.g. 45.5) which we convert to cents first for precision.
 */
export function lineItemTotalCents(quantity, price) {
  const qty = Number(quantity) || 0;
  const priceCents = toCents(price);
  return Math.round(priceCents * qty);
}

/**
 * Recompute subtotal, discount, tax and grand total (all in cents),
 * given line items and discount/tax settings.
 *
 * discount: { type: 'flat' | 'percent', value: number }
 * taxPercent: number (e.g. 5 for 5% VAT)
 */
export function computeInvoiceTotals({ items, discount, taxPercent }) {
  const itemCentsList = items.map((it) =>
    lineItemTotalCents(it.quantity, it.price)
  );
  const subtotalCents = sumCents(itemCentsList);

  let discountCents = 0;
  if (discount && discount.value) {
    if (discount.type === "percent") {
      discountCents = Math.round((subtotalCents * Number(discount.value)) / 100);
    } else {
      discountCents = toCents(discount.value);
    }
  }
  discountCents = Math.min(discountCents, subtotalCents);

  const taxableCents = subtotalCents - discountCents;
  const taxCents =
    taxPercent && Number(taxPercent) > 0
      ? Math.round((taxableCents * Number(taxPercent)) / 100)
      : 0;

  const grandTotalCents = taxableCents + taxCents;

  return {
    itemTotals: itemCentsList.map(fromCents),
    subtotal: fromCents(subtotalCents),
    discount: fromCents(discountCents),
    tax: fromCents(taxCents),
    grandTotal: fromCents(grandTotalCents),
  };
}

export function formatMoney(amount, currency = "AED") {
  const n = Number(amount) || 0;
  return `${n.toFixed(DECIMALS)} ${currency}`;
}
