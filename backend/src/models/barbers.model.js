const db = require("../db");
const { uid } = require("../utils/id");

function rowToBarber(row) {
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags || "[]") };
}

function listBarbers() {
  const rows = db.prepare("SELECT * FROM barbers ORDER BY sortOrder ASC, createdAt ASC").all();
  return rows.map(rowToBarber);
}
function getBarber(id) {
  return rowToBarber(db.prepare("SELECT * FROM barbers WHERE id = ?").get(id));
}
function createBarber(data) {
  const id = data.id || uid("barber");
  db.prepare(
    `INSERT INTO barbers (id, name, role, tags, photo, instagram, experienceYears, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.name,
    data.role || "",
    JSON.stringify(data.tags || []),
    data.photo || "",
    data.instagram || "",
    data.experienceYears || 0,
    data.sortOrder || 0
  );
  return getBarber(id);
}
function updateBarber(id, data) {
  const current = getBarber(id);
  if (!current) return null;
  const next = { ...current, ...data };
  db.prepare(
    `UPDATE barbers SET name=?, role=?, tags=?, photo=?, instagram=?, experienceYears=?, sortOrder=? WHERE id=?`
  ).run(
    next.name,
    next.role,
    JSON.stringify(next.tags || []),
    next.photo,
    next.instagram,
    next.experienceYears,
    next.sortOrder,
    id
  );
  return getBarber(id);
}
function deleteBarber(id) {
  db.prepare("DELETE FROM barbers WHERE id = ?").run(id);
}
function ensureSeeded() {
  const count = db.prepare("SELECT COUNT(*) as c FROM barbers").get().c;
  if (count === 0) {
    createBarber({
      id: "marcos",
      name: "Marcos Alexandre",
      role: "Barbeiro & Fundador",
      tags: ["Fade", "Freestyle", "Pigmentação"],
      photo: "/images/barbers/marcos.jpg",
      instagram: "",
      experienceYears: 6,
      sortOrder: 1,
    });
    createBarber({
      id: "kauan",
      name: "Kauan",
      role: "Barbeiro",
      tags: ["Corte", "Barba", "Infantil"],
      photo: "/images/barbers/kauan.jpg",
      instagram: "",
      experienceYears: 3,
      sortOrder: 2,
    });
  }
}

module.exports = { listBarbers, getBarber, createBarber, updateBarber, deleteBarber, ensureSeeded };
