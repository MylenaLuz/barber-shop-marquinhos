const db = require("../db");
const { uid } = require("../utils/id");

function rowToBarber(row) {
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags || "[]") };
}

async function listBarbers() {
  const rows = await db.all("SELECT * FROM barbers ORDER BY sortOrder ASC, createdAt ASC");
  return rows.map(rowToBarber);
}
async function getBarber(id) {
  const row = await db.get("SELECT * FROM barbers WHERE id = ?", [id]);
  return rowToBarber(row);
}
async function createBarber(data) {
  const id = data.id || uid("barber");
  await db.run(
    `INSERT INTO barbers (id, name, role, tags, photo, instagram, experienceYears, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      data.role || "",
      JSON.stringify(data.tags || []),
      data.photo || "",
      data.instagram || "",
      data.experienceYears || 0,
      data.sortOrder || 0,
    ]
  );
  return await getBarber(id);
}
async function updateBarber(id, data) {
  const current = await getBarber(id);
  if (!current) return null;
  const next = { ...current, ...data };
  await db.run(
    `UPDATE barbers SET name=?, role=?, tags=?, photo=?, instagram=?, experienceYears=?, sortOrder=? WHERE id=?`,
    [
      next.name,
      next.role,
      JSON.stringify(next.tags || []),
      next.photo,
      next.instagram,
      next.experienceYears,
      next.sortOrder,
      id,
    ]
  );
  return await getBarber(id);
}
async function deleteBarber(id) {
  await db.run("DELETE FROM barbers WHERE id = ?", [id]);
}
async function ensureSeeded() {
  const row = await db.get("SELECT COUNT(*) as c FROM barbers");
  if (row.c === 0) {
    await createBarber({
      id: "marcos",
      name: "Marcos Alexandre",
      role: "Barbeiro & Fundador",
      tags: ["Fade", "Freestyle", "Pigmentação"],
      photo: "/images/barbers/marcos.jpg",
      instagram: "",
      experienceYears: 6,
      sortOrder: 1,
    });
    await createBarber({
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
