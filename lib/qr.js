export function buildQrPayload({ id }) {
  return `/invoices/${id}`;
}

export function invoiceScanUrl(id, origin) {
  const path = `/invoices/${id}`;
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}
