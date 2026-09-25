// app/api/invoices/[id]/route.js
// Item endpoint: GET/PUT/DELETE /api/invoices/:id

import { NextResponse } from "next/server";
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "@/lib/invoiceStorage";
import { computeInvoiceTotals } from "@/lib/calculations";
import { generateId } from "@/lib/id";
import { validateInvoicePayload } from "../route";

export async function GET(request, { params }) {
  try {
    const invoice = await getInvoiceById(params.id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ data: invoice }, { status: 200 });
  } catch (err) {
    console.error("GET /api/invoices/:id failed", err);
    return NextResponse.json(
      { error: "Failed to load invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const existing = await getInvoiceById(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const body = await request.json();
    const errors = validateInvoicePayload(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

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

    const updates = {
      // Invoice number stays the same unless the user explicitly changed it.
      invoiceNumber: body.invoiceNumber || existing.invoiceNumber,
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
      receipt: body.receipt || existing.receipt || null,
      // qrPayload is intentionally NOT included - storage layer preserves it.
    };

    const updated = await updateInvoice(params.id, updates);
    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/invoices/:id failed", err);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const ok = await deleteInvoice(params.id);
    if (!ok) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ data: { id: params.id } }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/invoices/:id failed", err);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
