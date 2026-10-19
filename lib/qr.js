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

const SEP = "\t";

function compactParts(invoice) {
  const r = invoice.receipt || {};
  return [
    invoice.id || "",
    invoice.invoiceNumber || "",
    invoice.invoiceDate || "",
    r.gate || "",
    r.trn || "",
    r.time || "",
    r.meridian || "",
    r.receiptNumber || "",
    r.service || "",
    r.owner || "",
    r.vehicle || "",
    r.amount || "",
    r.researchFee || "",
    r.collectionFee || "",
    r.vatFee || "",
    r.tollGate || "",
  ];
}

export function encodeQrInvoice(invoice) {
  return utf8ToBase64Url(`1${SEP}${compactParts(invoice).join(SEP)}`);
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

function decodeCompact(text) {
  const parts = String(text).split(SEP);
  if (parts[0] !== "1" || parts.length < 12) return null;
  const [
    ,
    id,
    invoiceNumber,
    invoiceDate,
    gate,
    trn,
    time,
    meridian,
    receiptNumber,
    service,
    owner,
    vehicle,
    amount,
    researchFee,
    collectionFee,
    vatFee,
    tollGate,
  ] = parts;
  return reconstructInvoice({
    id,
    invoiceNumber,
    invoiceDate,
    receipt: {
      gate,
      trn,
      time,
      meridian,
      receiptNumber,
      service,
      owner,
      vehicle,
      amount,
      researchFee,
      collectionFee,
      vatFee,
      tollGate,
    },
  });
}

function decodeJsonPayload(text) {
  const json = JSON.parse(text);
  if (!json?.id && !json?.r && !json?.receipt) return null;
  const receipt = json.r || json.receipt || {};
  return reconstructInvoice({
    id: json.id,
    invoiceNumber: json.n || json.invoiceNumber || "",
    invoiceDate: json.d || json.invoiceDate || "",
    receipt,
  });
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
      const text = base64UrlToUtf8(candidate);
      const compact = decodeCompact(text);
      if (compact?.id) return compact;
      const json = decodeJsonPayload(text);
      if (json) return json;
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
  // Keep the QR payload short so the printed code matches the original
  // sparse design.  The invoice ID is the permanent lookup key.
  return `/invoices/${encodeURIComponent(invoice.id)}`;
}

export function invoiceScanUrl(invoice, origin) {
  const path = invoiceScanPath(invoice);
  if (!origin) return path;
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function withPrintFlag(path) {
  return path.includes("?") ? `${path}&print=1` : `${path}?print=1`;
}

export function buildQrPayload(invoice) {
  return invoiceScanPath(invoice);
}
