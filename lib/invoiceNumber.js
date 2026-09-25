// lib/invoiceNumber.js
//
// Generates the next sequential invoice number based on EXISTING records,
// not randomly - so numbering survives restarts and stays gapless-ish
// (INV-000001, INV-000002, ...).

const PREFIX = "INV-";
const PAD_LENGTH = 6;

export function getNextInvoiceNumber(existingInvoices) {
  let maxNumber = 0;

  for (const inv of existingInvoices) {
    const match = /^INV-(\d+)$/.exec(inv.invoiceNumber || "");
    if (match) {
      const n = parseInt(match[1], 10);
      if (!Number.isNaN(n) && n > maxNumber) {
        maxNumber = n;
      }
    }
  }

  const next = maxNumber + 1;
  return `${PREFIX}${String(next).padStart(PAD_LENGTH, "0")}`;
}
