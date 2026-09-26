import fs from "fs";
import path from "path";
import seedInvoices from "../data/invoices.json";

const SEED = Array.isArray(seedInvoices) ? seedInvoices : [];
const writableDir = process.env.VERCEL
  ? path.join("/tmp", "tehseel-data")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(writableDir, "invoices.json");

let writeQueue = Promise.resolve();
let memoryStore = null;

function cloneSeed() {
  return JSON.parse(JSON.stringify(SEED));
}

function ensureDataFile() {
  if (memoryStore) return;
  try {
    fs.mkdirSync(writableDir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(cloneSeed(), null, 2), "utf-8");
    }
  } catch (err) {
    console.error("invoiceStorage: using in-memory store", err);
    memoryStore = cloneSeed();
  }
}

function readAllSync() {
  ensureDataFile();
  if (memoryStore) return memoryStore;
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("invoiceStorage: failed to parse invoices.json", err);
    memoryStore = cloneSeed();
    return memoryStore;
  }
}

function writeAllSync(invoices) {
  if (memoryStore) {
    memoryStore = invoices;
    return;
  }
  try {
    fs.mkdirSync(writableDir, { recursive: true });
    const tmpFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(invoices, null, 2), "utf-8");
    fs.renameSync(tmpFile, DATA_FILE);
  } catch (err) {
    console.error("invoiceStorage: write failed, switching to memory", err);
    memoryStore = invoices;
  }
}

function runExclusive(fn) {
  const result = writeQueue.then(() => fn());
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
      id: existing.id,
      invoiceNumber: updates.invoiceNumber || existing.invoiceNumber,
      qrPayload: existing.qrPayload,
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
