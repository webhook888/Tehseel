const prefix = "tehseel.invoice.";

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

export function readCachedInvoice(id) {
  if (!canUseStorage() || !id) return null;
  try {
    const raw = window.localStorage.getItem(prefix + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCachedInvoice(invoice) {
  if (!canUseStorage() || !invoice?.id) return;
  try {
    window.localStorage.setItem(prefix + invoice.id, JSON.stringify(invoice));
  } catch {
    // quota or private mode
  }
}
