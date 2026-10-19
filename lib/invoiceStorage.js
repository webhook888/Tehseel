import fs from "fs";
import os from "os";
import path from "path";
import seedInvoices from "../data/invoices.json";

const SEED = Array.isArray(seedInvoices) ? seedInvoices : [];

function storageDirs() {
  const dirs = [path.join(process.cwd(), "data")];
  const tmpDir = path.join(os.tmpdir(), "tehseel-data");
  if (path.resolve(tmpDir) !== path.resolve(dirs[0])) dirs.push(tmpDir);
  return dirs;
}

function getGlobalState() {
  if (!globalThis.__tehseelInvoiceStore) {
    globalThis.__tehseelInvoiceStore = { invoices: [] };
  }
  return globalThis.__tehseelInvoiceStore;
}

let writeQueue = Promise.resolve();

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

function readSidecars(dir) {
  const storeDir = path.join(dir, "invoice-records");
  try {
    if (!fs.existsSync(storeDir)) return [];
    return fs
      .readdirSync(storeDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        try {
          return JSON.parse(fs.readFileSync(path.join(storeDir, name), "utf-8"));
        } catch {
          return null;
        }
      })
      .filter((invoice) => invoice?.id);
  } catch {
    return [];
  }
}

function persistFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpFile = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, contents, "utf-8");
  try {
    const fd = fs.openSync(tmpFile, "r+");
    fs.fsyncSync(fd);
    fs.closeSync(fd);
  } catch {
    // fsync is best-effort
  }
  try {
    fs.renameSync(tmpFile, filePath);
  } catch {
    fs.writeFileSync(filePath, contents, "utf-8");
    try {
      fs.unlinkSync(tmpFile);
    } catch {
      // leftover tmp is harmless
    }
  }
}

function writeInvoiceSidecar(dir, invoice) {
  const filePath = path.join(dir, "invoice-records", `${invoice.id}.json`);
  persistFile(filePath, JSON.stringify(invoice));
}

function removeInvoiceSidecar(dir, id) {
  const filePath = path.join(dir, "invoice-records", `${id}.json`);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

function mergeInvoices() {
  const map = byIdMap(cloneSeed());
  for (const dir of storageDirs()) {
    for (const invoice of readJsonArray(path.join(dir, "invoices.json"))) {
      map.set(invoice.id, invoice);
    }
    for (const invoice of readSidecars(dir)) {
      map.set(invoice.id, invoice);
    }
  }
  for (const invoice of getGlobalState().invoices || []) {
    map.set(invoice.id, invoice);
  }
  return Array.from(map.values());
}

function readAllSync() {
  const invoices = mergeInvoices();
  getGlobalState().invoices = invoices;
  return invoices;
}

function writeAllSync(invoices) {
  getGlobalState().invoices = invoices;
  const payload = JSON.stringify(invoices, null, 2);
  for (const dir of storageDirs()) {
    try {
      persistFile(path.join(dir, "invoices.json"), payload);
      const existing = new Set(invoices.map((invoice) => invoice.id));
      const storeDir = path.join(dir, "invoice-records");
      if (fs.existsSync(storeDir)) {
        for (const name of fs.readdirSync(storeDir)) {
          const id = name.replace(/\.json$/, "");
          if (!existing.has(id)) removeInvoiceSidecar(dir, id);
        }
      }
      for (const invoice of invoices) writeInvoiceSidecar(dir, invoice);
    } catch (err) {
      console.error("invoiceStorage: write failed for", dir, err);
    }
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
  return runExclusive(() => findInvoice(readAllSync(), id));
}

export async function createInvoice(invoice) {
  return runExclusive(() => {
    const invoices = readAllSync();
    invoices.push(invoice);
    writeAllSync(invoices);
    return invoice;
  });
}

export async function upsertInvoice(invoice) {
  if (!invoice?.id) return null;
  return runExclusive(() => {
    const invoices = readAllSync();
    const index = invoices.findIndex((inv) => inv.id === invoice.id);
    if (index === -1) {
      invoices.push(invoice);
    } else {
      invoices[index] = {
        ...invoices[index],
        ...invoice,
        id: invoices[index].id,
      };
    }
    writeAllSync(invoices);
    return findInvoice(invoices, invoice.id);
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
