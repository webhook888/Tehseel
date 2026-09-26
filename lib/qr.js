function utf8ToBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(value) {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeQrInvoice(invoice) {
  return utf8ToBase64Url(
    JSON.stringify({
      id: invoice.id,
      n: invoice.invoiceNumber,
      d: invoice.invoiceDate,
      r: invoice.receipt || {},
    }),
  );
}

export function decodeQrInvoice(payload) {
  if (!payload) return null;
  try {
    const json = JSON.parse(base64UrlToUtf8(payload));
    if (!json?.id) return null;
    const receipt = json.r || json.receipt || {};
    return {
      id: json.id,
      invoiceNumber: json.n || json.invoiceNumber || "",
      invoiceDate: json.d || json.invoiceDate || "",
      receipt,
      customer: {
        name: receipt.owner || "",
        phone: "",
        address: receipt.vehicle || "",
      },
    };
  } catch {
    return null;
  }
}

export function invoiceScanPath(invoice) {
  return `/invoices/${invoice.id}?p=${encodeQrInvoice(invoice)}`;
}

export function invoiceScanUrl(invoice, origin) {
  const path = invoiceScanPath(invoice);
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function buildQrPayload(invoice) {
  return invoiceScanPath(invoice);
}
