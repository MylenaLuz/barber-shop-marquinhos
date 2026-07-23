const db = require("../db");
const { uid } = require("../utils/id");

function normalizePhone(s) {
  return String(s || "").replace(/\D/g, "");
}

async function listClients() {
  return await db.all(
    `SELECT c.*,
      (SELECT COUNT(*) FROM appointments a WHERE a.clientId = c.id AND a.isBlock = 0) as appointmentCount,
      (SELECT MAX(a.date) FROM appointments a WHERE a.clientId = c.id AND a.isBlock = 0) as lastVisit
     FROM clients c ORDER BY lastVisit DESC`
  );
}
async function findByPhone(phone) {
  return await db.get("SELECT * FROM clients WHERE phone = ?", [normalizePhone(phone)]);
}
async function getClient(id) {
  return await db.get("SELECT * FROM clients WHERE id = ?", [id]);
}
async function upsertClient({ name, phone }) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const existing = await findByPhone(normalized);
  if (existing) {
    await db.run("UPDATE clients SET name=?, updatedAt=datetime('now') WHERE id=?", [name, existing.id]);
    return { ...existing, name };
  }
  const id = uid("cli");
  await db.run("INSERT INTO clients (id, name, phone) VALUES (?, ?, ?)", [id, name, normalized]);
  return { id, name, phone: normalized };
}

module.exports = { listClients, findByPhone, getClient, upsertClient, normalizePhone };
