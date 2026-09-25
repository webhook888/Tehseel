// lib/invoiceStorage.js
//
// File-based storage layer. This is the ONLY module that touches the
// filesystem for invoice data. API routes call these functions instead of
// reading/writing data/invoices.json directly, so a real database can be
// dropped in later behind the same function signatures.

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "invoices.json");

// Serialize writes so two near-simultaneous requests can't clobber each
// other's changes (important since this runs on a single Node process).
let writeQueue = Promise.resolve();

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function readAllSync() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("invoiceStorage: failed to parse invoices.json", err);
    return [];
  }
}

function writeAllSync(invoices) {
  ensureDataFile();
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(invoices, null, 2), "utf-8");
  fs.renameSync(tmpFile, DATA_FILE); // atomic-ish replace
}

function runExclusive(fn) {
  const result = writeQueue.then(() => fn());
  // Keep the queue alive even if fn() rejects, so later writes still run.
  writeQueue = result.catch(() => {});
  return result;
}

export async function getAllInvoices() {
  return runExclusive(() => readAllSync());
}

export async function getInvoiceById(id) {
  return runExclusive(() => {
    const invoices = readAllSync();
    return invoices.find((inv) => inv.id === id) || null;
  });
}

export async function createInvoice(invoice) {
  return runExclusive(() => {
    const invoices = readAllSync();
    invoices.push(invoice);
    writeAllSync(invoices);
    return invoice;
  });
}

export async function updateInvoice(id, updates) {
  return runExclusive(() => {
    const invoices = readAllSync();
    const index = invoices.findIndex((inv) => inv.id === id);
    if (index === -1) return null;

    const existing = invoices[index];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // id is immutable
      invoiceNumber: updates.invoiceNumber || existing.invoiceNumber,
      qrPayload: existing.qrPayload, // QR payload never changes on edit
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    invoices[index] = updated;
    writeAllSync(invoices);
    return updated;
  });
}

export async function deleteInvoice(id) {
  return runExclusive(() => {
    const invoices = readAllSync();
    const index = invoices.findIndex((inv) => inv.id === id);
    if (index === -1) return false;
    invoices.splice(index, 1);
    writeAllSync(invoices);
    return true;
  });
}
