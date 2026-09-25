# Invoice Management / Billing System

Next.js 14 (App Router) + React + Chakra UI, JavaScript only (no TypeScript,
no Tailwind). File-based storage — no database required.

## Stack
- Next.js 14.2.35 (App Router, JS/JSX only)
- React 18
- Chakra UI 2 (all dashboard/forms/buttons/layout)
- Plain CSS Module for the invoice document itself (screen + print, single
  source of truth — see `components/Invoice/Invoice.module.css`)
- `qrcode.react` for dynamic, vector (SVG) QR codes — sharp at any print
  resolution
- File-based JSON storage at `data/invoices.json`, accessed only through
  `lib/invoiceStorage.js`

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/invoices`.

For a production build:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  page.jsx                     -> redirects to /invoices
  layout.jsx, providers.jsx    -> Chakra provider + global print CSS
  invoices/
    page.jsx                   -> invoice list / records page
    new/page.jsx                -> create invoice
    [id]/page.jsx                -> view + print an invoice
    [id]/edit/page.jsx           -> edit an invoice
  api/
    invoices/route.js           -> GET (list), POST (create)
    invoices/[id]/route.js       -> GET, PUT, DELETE

components/
  Invoice/                      -> the ONE invoice document component tree,
                                    used for screen preview, view, and print
    InvoicePreview.jsx
    InvoiceHeader.jsx
    InvoiceCustomer.jsx
    InvoiceItems.jsx
    InvoiceTotals.jsx
    InvoiceFooter.jsx
    InvoiceQRCode.jsx
    Invoice.module.css          -> screen + @media print rules, single
                                    source of truth for the visual design
  InvoiceForm/
    InvoiceForm.jsx             -> shared create/edit form with live preview
    ItemsFieldArray.jsx
  Dashboard/
    InvoiceList.jsx             -> records table: view/edit/print/delete

lib/
  invoiceStorage.js             -> file read/write layer (the only place
                                    that touches data/invoices.json)
  invoiceNumber.js               -> sequential INV-000001 numbering
  qr.js                          -> builds the QR payload string, stored
                                    once per invoice
  calculations.js                -> integer-cents money math (no float bugs)
  id.js                          -> unique id generator

data/
  invoices.json                  -> the "database" (a JSON array)
```

## How the key requirements are implemented

**Single invoice component for screen, print and view** — every page renders
`<InvoicePreview invoice={...} />`. There is no separate print template;
`Invoice.module.css` has an `@media print` block plus an `@page` rule that
fixes the printed page size and removes browser margins. The `Print Invoice`
button and all dashboard navigation carry the plain `no-print` class, hidden
via `@media print { .no-print { display: none !important; } }` (see
`app/globals.css`), so nothing but the invoice itself is printed.

**Print page size** — the reference receipt is a narrow, single-column
document, so the invoice page is modeled as a fixed 100mm × 160mm sheet
(`@page { size: 100mm 160mm; margin: 0; }`). If your real paper size differs
(A4, A5, 80mm thermal roll, etc.), change the `size` value in `Invoice.module.css`
and the matching `.page` width — that's the only place print dimensions live.

**Dynamic QR code, stable per invoice** — `lib/qr.js` builds a JSON payload
(invoice id, number, date, customer, total) exactly once, in the `POST
/api/invoices` handler, and it's saved as `qrPayload` on the record. The `PUT`
handler never touches `qrPayload`, and `invoiceStorage.updateInvoice`
explicitly preserves the existing value even if a client tried to send a new
one — so re-opening or editing an invoice always reproduces the same QR
code. `qrcode.react`'s `QRCodeSVG` renders it as vector SVG, so it stays
crisp at any print DPI.

**No database, but API-based** — the UI never touches the filesystem
directly. Every page calls `fetch('/api/invoices...')`; the API routes are
the only callers of `lib/invoiceStorage.js`, which is the only module that
reads/writes `data/invoices.json`. Swapping in a real database later means
rewriting `invoiceStorage.js` only.

**Invoice numbering** — `lib/invoiceNumber.js` scans existing records for the
highest `INV-XXXXXX` number and increments it, so numbering is based on
persisted data and survives restarts (never random).

**Money math** — `lib/calculations.js` converts every amount to integer
cents before adding/subtracting/multiplying, then converts back only for
display, avoiding floating-point rounding errors.

**Validation & errors** — both the API (`validateInvoicePayload` in
`app/api/invoices/route.js`) and the form (`InvoiceForm.jsx`) validate
customer name, invoice date, and each item (name, quantity > 0, price ≥ 0).
API errors surface as Chakra `useToast` notifications; list/view/edit pages
show a Chakra `Alert` on load failure and a `Spinner` while loading.

## Notes / assumptions
- The two reference images differ (a Laravel admin form vs. a Tahseel toll
  payment receipt). The receipt image was treated as the visual source of
  truth for borders, label:value rows, header layout and QR placement; the
  underlying data model was kept as the generic customer + line-items +
  subtotal/discount/tax/total invoice described in the written spec, since
  the receipt has no items table. Adjust `InvoiceHeader`, `InvoiceCustomer`
  and `Invoice.module.css` if you want it to match a different reference
  more literally (e.g. an itemized A4/A5 tax invoice instead of a receipt).
- `data/invoices.json` ships as `[]`. Delete its contents any time to reset.
