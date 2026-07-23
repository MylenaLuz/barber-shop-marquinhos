const db = require("../db");
const { uid } = require("../utils/id");

function normalizePhone(s) {
  return String(s || "").replace(/\D/g, "");
}

function listClients() {
  return db
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM appointments a WHERE a.clientId = c.id AND a.isBlock = 0) as appointmentCount,
        (SELECT MAX(a.date) FROM appointments a WHERE a.clientId = c.id AND a.isBlock = 0) as lastVisit
       FROM clients c ORDER BY lastVisit DESC`
    )
    .all();
}
function findByPhone(phone) {
  return db.prepare("SELECT * FROM clients WHERE phone = ?").get(normalizePhone(phone));
}
function getClient(id) {
  return db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
}
function upsertClient({ name, phone }) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const existing = findByPhone(normalized);
  if (existing) {
    db.prepare("UPDATE clients SET name=?, updatedAt=datetime('now') WHERE id=?").run(name, existing.id);
    return { ...existing, name };
  }
  const id = uid("cli");
  db.prepare("INSERT INTO clients (id, name, phone) VALUES (?, ?, ?)").run(id, name, normalized);
  return { id, name, phone: normalized };
}

module.exports = { listClients, findByPhone, getClient, upsertClient, normalizePhone };
