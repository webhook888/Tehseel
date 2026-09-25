// app/api/invoices/route.js
// Collection endpoint: GET /api/invoices (list), POST /api/invoices (create)

import { NextResponse } from "next/server";
import {
  getAllInvoices,
  createInvoice,
} from "@/lib/invoiceStorage";
import { getNextInvoiceNumber } from "@/lib/invoiceNumber";
import { buildQrPayload } from "@/lib/qr";
import { computeInvoiceTotals } from "@/lib/calculations";
import { generateId } from "@/lib/id";

export async function GET() {
  try {
    const invoices = await getAllInvoices();
    // Newest first for the records list.
    const sorted = [...invoices].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return NextResponse.json({ data: sorted }, { status: 200 });
  } catch (err) {
    console.error("GET /api/invoices failed", err);
    return NextResponse.json(
      { error: "Failed to load invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const errors = validateInvoicePayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const existing = await getAllInvoices();
    const invoiceNumber = getNextInvoiceNumber(existing);

    const items = body.items.map((it) => ({
      id: it.id || generateId("item"),
      name: it.name,
      quantity: Number(it.quantity),
      price: Number(it.price),
    }));

    const totals = computeInvoiceTotals({
      items,
      discount: body.discount || { type: "flat", value: 0 },
      taxPercent: Number(body.taxPercent) || 0,
    });

    const itemsWithTotals = items.map((it, i) => ({
      ...it,
      total: totals.itemTotals[i],
    }));

    const id = generateId("inv");
    const now = new Date().toISOString();

    const qrPayload = buildQrPayload({
      id,
      invoiceNumber,
      invoiceDate: body.invoiceDate,
      customerName: body.customer?.name,
      grandTotal: totals.grandTotal,
    });

    const invoice = {
      id,
      invoiceNumber,
      invoiceDate: body.invoiceDate,
      customer: {
        name: body.customer?.name || "",
        phone: body.customer?.phone || "",
        address: body.customer?.address || "",
      },
      items: itemsWithTotals,
      subtotal: totals.subtotal,
      discount: totals.discount,
      discountInput: body.discount || { type: "flat", value: 0 },
      taxPercent: Number(body.taxPercent) || 0,
      tax: totals.tax,
      grandTotal: totals.grandTotal,
      // The receipt metadata drives the Tahseel-style printed document.
      receipt: body.receipt || null,
      qrPayload,
      createdAt: now,
      updatedAt: now,
    };

    const created = await createInvoice(invoice);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/invoices failed", err);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}

export function validateInvoicePayload(body) {
  const errors = [];
  if (!body) return ["Invalid request body."];
  if (!body.customer || !body.customer.name || !body.customer.name.trim()) {
    errors.push("Customer name is required.");
  }
  if (!body.invoiceDate) {
    errors.push("Invoice date is required.");
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push("At least one item is required.");
  } else {
    body.items.forEach((it, i) => {
      if (!it.name || !it.name.trim()) {
        errors.push(`Item ${i + 1}: name is required.`);
      }
      if (it.quantity === undefined || Number(it.quantity) <= 0) {
        errors.push(`Item ${i + 1}: quantity must be greater than 0.`);
      }
      if (it.price === undefined || Number(it.price) < 0) {
        errors.push(`Item ${i + 1}: price cannot be negative.`);
      }
    });
  }
  return errors;
}
