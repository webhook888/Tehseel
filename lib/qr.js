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

function reconstructInvoice({
  id,
  invoiceNumber = "",
  invoiceDate = "",
  receipt = {},
  customer,
} = {}) {
  const safeReceipt = receipt || {};
  return {
    id: id || "",
    invoiceNumber,
    invoiceDate,
    receipt: safeReceipt,
    customer: customer || {
      name: safeReceipt.owner || "",
      phone: "",
      address: safeReceipt.vehicle || "",
    },
    items: [],
    subtotal: Number(safeReceipt.amount) || 0,
    discount: 0,
    taxPercent: 0,
    tax: 0,
    grandTotal: Number(safeReceipt.amount) || 0,
  };
}

export function decodeQrInvoice(payload) {
  if (!payload) return null;
  const candidates = [String(payload)];
  try {
    candidates.push(decodeURIComponent(String(payload)));
  } catch {
    // already decoded
  }

  for (const candidate of candidates) {
    if (!candidate || /^inv_[a-z0-9]+$/i.test(candidate)) continue;
    try {
      const json = JSON.parse(base64UrlToUtf8(candidate));
      if (!json?.id && !json?.r && !json?.receipt) continue;
      const receipt = json.r || json.receipt || {};
      return reconstructInvoice({
        id: json.id,
        invoiceNumber: json.n || json.invoiceNumber || "",
        invoiceDate: json.d || json.invoiceDate || "",
        receipt,
      });
    } catch {
      // try the next encoding
    }
  }
  return null;
}

export function parseScanRequest(idParam, search = "") {
  const rawId = String(idParam || "").trim();
  let queryP = "";
  let pathId = rawId;

  try {
    const href = rawId.includes("://")
      ? rawId
      : rawId.startsWith("/")
        ? `http://local${rawId}`
        : "";
    if (href) {
      const url = new URL(href);
      const parts = url.pathname.split("/").filter(Boolean);
      pathId = parts[parts.length - 1] || rawId;
      queryP = url.searchParams.get("p") || "";
    }
  } catch {
    pathId = rawId;
  }

  const params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  const snapshot =
    decodeQrInvoice(params.get("p") || queryP) || decodeQrInvoice(pathId);
  return {
    invoiceId: snapshot?.id || pathId,
    snapshot,
  };
}

export function invoiceScanPath(invoice) {
  // Keep the encoded value deliberately small so the printed QR looks the
  // same as before.  The invoice ID is the permanent lookup key; scanning
  // it never consumes or changes the invoice.
  return `/invoices/${encodeURIComponent(invoice.id)}`;
}

export function invoiceScanUrl(invoice, origin) {
  const path = invoiceScanPath(invoice);
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function buildQrPayload(invoice) {
  return invoiceScanPath(invoice);
}
