// lib/id.js
// Small dependency-free unique id generator (timestamp + random base36).
// Good enough for invoice/customer/item ids in a file-based system.

export function generateId(prefix = "id") {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${time}${rand}`;
}
