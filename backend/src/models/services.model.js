const db = require("../db");
const { uid } = require("../utils/id");

const DEFAULT_SERVICES = [
  {
    id: "svc_corte",
    name: "Corte",
    description: "Corte na tesoura e máquina, acabamento na navalha.",
    price: 40,
    duration: 35,
    image: "/images/services/corte.jpg",
  },
  {
    id: "svc_luzes",
    name: "Luzes",
    description: "Mechas e luzes personalizadas.",
    price: 100,
    duration: 120,
    image: "/images/services/luzes.jpg",
  },
  {
    id: "svc_platinado",
    name: "Platinado",
    description: "Descoloração e tonalização para visual platinado.",
    price: 100,
    duration: 120,
    image: "/images/services/luzes.jpg",
  },
  {
    id: "svc_limpeza_pele",
    name: "Limpeza de Pele",
    description: "Limpeza facial rápida para renovar a pele.",
    price: 15,
    duration: 10,
    image: "/images/services/limpezadepele.jpg",
  },
  {
    id: "svc_barba_terapia",
    name: "Barba Terapia",
    description: "Tratamento relaxante para barba com produtos específicos.",
    price: 25,
    duration: 10,
    image: "/images/services/barbaterapia.jpg",
  },
  {
    id: "svc_sobrancelha",
    name: "Sobrancelha",
    description: "Alinhamento e acabamento da sobrancelha.",
    price: 10,
    duration: 5,
    image: "/images/services/sobrancelha.jpg",
  },
  {
    id: "svc_pigmentacao",
    name: "Pigmentação",
    description: "Aplicação de pigmento para realçar acabamento e falhas.",
    price: 10,
    duration: 5,
    image: "/images/services/pigmentacao.jpg",
  },
  {
    id: "svc_infantil",
    name: "Infantil",
    description: "Corte para crianças até 12 anos.",
    price: 40,
    duration: 35,
    image: "/images/services/infantil.jpg",
  },
  {
    id: "svc_depilacao_nasal",
    name: "Depilação Nasal",
    description: "Remoção rápida e cuidadosa dos pelos nasais.",
    price: 20,
    duration: 10,
    image: "/images/services/depilacaonasal.jpg",
  },
];

const LEGACY_DEFAULT_SERVICE_NAMES = [
  "Barba",
  "Corte + Barba",
  "Penteado",
  "Penteado com Pigmentação",
  "Freestyle",
];

function serviceKey(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

async function listServices() {
  return await db.all("SELECT * FROM services WHERE active = 1 ORDER BY sortOrder ASC, createdAt ASC");
}
async function getService(id) {
  return await db.get("SELECT * FROM services WHERE id = ?", [id]);
}
async function createService(data) {
  const id = data.id || uid("svc");
  await db.run(
    `INSERT INTO services (id, name, description, price, duration, image, active, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.description || "", data.price, data.duration, data.image || "", data.active === undefined ? 1 : data.active ? 1 : 0, data.sortOrder || 0]
  );
  return await getService(id);
}
async function updateService(id, data) {
  const current = await getService(id);
  if (!current) return null;
  const next = { ...current, ...data };
  await db.run(
    `UPDATE services SET name=?, description=?, price=?, duration=?, image=?, active=?, sortOrder=? WHERE id=?`,
    [next.name, next.description, next.price, next.duration, next.image, next.active === undefined ? 1 : next.active ? 1 : 0, next.sortOrder, id]
  );
  return await getService(id);
}
async function deleteService(id) {
  await db.run("DELETE FROM services WHERE id = ?", [id]);
}
async function ensureSeeded() {
  const rows = await db.all("SELECT * FROM services ORDER BY sortOrder ASC, createdAt ASC");
  const byName = new Map(rows.map((service) => [serviceKey(service.name), service]));
  const defaultKeys = new Set(DEFAULT_SERVICES.map((service) => serviceKey(service.name)));
  const legacyKeys = new Set(LEGACY_DEFAULT_SERVICE_NAMES.map(serviceKey));

  for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
    const service = { ...DEFAULT_SERVICES[i], active: 1, sortOrder: i };
    const existing = byName.get(serviceKey(service.name));

    if (existing) {
      await updateService(existing.id, service);
    } else {
      await createService(service);
    }
  }

  for (const service of rows) {
    const key = serviceKey(service.name);
    if (defaultKeys.has(key) || !legacyKeys.has(key)) continue;

    const usage = await db.get("SELECT COUNT(*) as c FROM appointments WHERE serviceId = ?", [service.id]);
    if (usage.c === 0) {
      await deleteService(service.id);
    } else {
      await updateService(service.id, { active: 0, sortOrder: 100 + Number(service.sortOrder || 0) });
    }
  }
}

module.exports = { listServices, getService, createService, updateService, deleteService, ensureSeeded };
