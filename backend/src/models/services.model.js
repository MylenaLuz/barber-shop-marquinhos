const db = require("../db");
const { uid } = require("../utils/id");

async function listServices() {
  return await db.all("SELECT * FROM services ORDER BY sortOrder ASC, createdAt ASC");
}
async function getService(id) {
  return await db.get("SELECT * FROM services WHERE id = ?", [id]);
}
async function createService(data) {
  const id = data.id || uid("svc");
  await db.run(
    `INSERT INTO services (id, name, description, price, duration, image, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.description || "", data.price, data.duration, data.image || "", data.sortOrder || 0]
  );
  return await getService(id);
}
async function updateService(id, data) {
  const current = await getService(id);
  if (!current) return null;
  const next = { ...current, ...data };
  await db.run(
    `UPDATE services SET name=?, description=?, price=?, duration=?, image=?, sortOrder=? WHERE id=?`,
    [next.name, next.description, next.price, next.duration, next.image, next.sortOrder, id]
  );
  return await getService(id);
}
async function deleteService(id) {
  await db.run("DELETE FROM services WHERE id = ?", [id]);
}
async function ensureSeeded() {
  const row = await db.get("SELECT COUNT(*) as c FROM services");
  if (row.c === 0) {
    const defaults = [
      ["Corte", "Corte na tesoura e máquina, acabamento na navalha.", 45, 40],
      ["Barba", "Modelagem completa com toalha quente e navalha.", 30, 25],
      ["Corte + Barba", "Combo completo: corte e barba no mesmo atendimento.", 65, 60],
      ["Penteado", "Finalização e penteado para ocasiões especiais.", 40, 30],
      ["Penteado com Pigmentação", "Penteado com aplicação de pigmento para disfarçar falhas.", 70, 50],
      ["Pigmentação", "Aplicação de pigmento capilar.", 50, 40],
      ["Luzes", "Mechas e luzes personalizadas.", 90, 60],
      ["Freestyle", "Design autoral com risco e desenho na navalha.", 80, 60],
      ["Barba Terapia", "Tratamento relaxante para barba com produtos específicos.", 45, 35],
      ["Limpeza de Pele", "Limpeza facial completa.", 60, 40],
      ["Infantil", "Corte para crianças até 12 anos.", 35, 30],
    ];
    for (let i = 0; i < defaults.length; i++) {
      const [name, description, price, duration] = defaults[i];
      await createService({ name, description, price, duration, image: "/images/services/default.jpg", sortOrder: i });
    }
  }
}

module.exports = { listServices, getService, createService, updateService, deleteService, ensureSeeded };
