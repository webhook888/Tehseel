import fs from "fs";
import path from "path";
import seedInvoices from "../data/invoices.json";

const SEED = Array.isArray(seedInvoices) ? seedInvoices : [];
const writableDir = process.env.VERCEL
  ? path.join("/tmp", "tehseel-data")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(writableDir, "invoices.json");
const JOURNAL_FILE = path.join(writableDir, "invoices.journal.jsonl");

let writeQueue = Promise.resolve();
let memoryStore = null;

function cloneSeed() {
  return JSON.parse(JSON.stringify(SEED));
}

function byIdMap(invoices) {
  const map = new Map();
  for (const invoice of invoices) {
    if (invoice?.id) map.set(invoice.id, invoice);
  }
  return map;
}

function readJsonArray(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("invoiceStorage: failed to read", filePath, err);
    return [];
  }
}

function readJournal() {
  try {
    if (!fs.existsSync(JOURNAL_FILE)) return [];
    return fs
      .readFileSync(JOURNAL_FILE, "utf-8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((invoice) => invoice?.id);
  } catch (err) {
    console.error("invoiceStorage: failed to read journal", err);
    return [];
  }
}

function persistFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpFile = `${filePath}.tmp`;
  fs.writeFileSync(tmpFile, contents, "utf-8");
  try {
    fs.renameSync(tmpFile, filePath);
  } catch {
    fs.writeFileSync(filePath, contents, "utf-8");
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      // tmp leftover is harmless
    }
  }
}

function writeJournal(invoices) {
  const body = invoices.length
    ? `${invoices.map((invoice) => JSON.stringify(invoice)).join("\n")}\n`
    : "";
  persistFile(JOURNAL_FILE, body);
}

function mergeInvoices() {
  const map = byIdMap(cloneSeed());
  for (const invoice of readJsonArray(DATA_FILE)) map.set(invoice.id, invoice);
  for (const invoice of readJournal()) map.set(invoice.id, invoice);
  if (memoryStore) {
    for (const invoice of memoryStore) map.set(invoice.id, invoice);
  }
  return Array.from(map.values());
}

function ensureDataFile() {
  try {
    fs.mkdirSync(writableDir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      persistFile(DATA_FILE, JSON.stringify(cloneSeed(), null, 2));
    }
  } catch (err) {
    console.error("invoiceStorage: could not ensure data file", err);
  }
}

function readAllSync() {
  ensureDataFile();
  if (memoryStore) return memoryStore;
  const invoices = mergeInvoices();
  memoryStore = invoices;
  return invoices;
}

function writeAllSync(invoices) {
  memoryStore = invoices;
  try {
    persistFile(DATA_FILE, JSON.stringify(invoices, null, 2));
    writeJournal(invoices);
  } catch (err) {
    console.error("invoiceStorage: write failed, keeping in-memory copy", err);
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

function normalizeLookupId(id) {
  if (id == null) return "";
  try {
    return decodeURIComponent(String(id)).trim();
  } catch {
    return String(id).trim();
  }
}

function findInvoice(invoices, id) {
  const target = normalizeLookupId(id);
  if (!target) return null;
  return (
    invoices.find(
      (inv) =>
        inv.id === target ||
        inv.invoiceNumber === target ||
        inv.receipt?.receiptNumber === target,
    ) || null
  );
}

export async function getInvoiceById(id) {
  return runExclusive(() => {
    const invoices = readAllSync();
    return findInvoice(invoices, id);
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
    const index = invoices.findIndex((inv) => inv.id === normalizeLookupId(id));
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
    const index = invoices.findIndex((inv) => inv.id === normalizeLookupId(id));
    if (index === -1) return false;
    invoices.splice(index, 1);
    writeAllSync(invoices);
    return true;
  });
}
