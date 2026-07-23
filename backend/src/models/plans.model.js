const db = require("../db");
const { uid } = require("../utils/id");

async function listPlans({ includeInactive = false } = {}) {
  const rows = includeInactive
    ? await db.all("SELECT * FROM plans ORDER BY sortOrder ASC, createdAt ASC")
    : await db.all("SELECT * FROM plans WHERE active = 1 ORDER BY sortOrder ASC, createdAt ASC");
  return await Promise.all(rows.map(withCredits));
}

async function withCredits(plan) {
  if (!plan) return null;
  const credits = await db.all("SELECT serviceType, quantity FROM plan_template_credits WHERE planId = ?", [plan.id]);
  return { ...plan, credits };
}

async function getPlan(id) {
  const plan = await db.get("SELECT * FROM plans WHERE id = ?", [id]);
  return await withCredits(plan);
}

async function createPlan({ name, price, validityDays, credits }) {
  const id = uid("plan");
  const maxRow = await db.get("SELECT COALESCE(MAX(sortOrder),0) as m FROM plans");
  await db.run(
    "INSERT INTO plans (id, name, price, validityDays, active, sortOrder) VALUES (?, ?, ?, ?, 1, ?)",
    [id, name, price, validityDays || 30, maxRow.m + 1]
  );
  for (const c of credits || []) {
    await db.run(
      "INSERT INTO plan_template_credits (id, planId, serviceType, quantity) VALUES (?, ?, ?, ?)",
      [uid("ptc"), id, c.serviceType, c.quantity]
    );
  }
  return await getPlan(id);
}

async function updatePlan(id, { name, price, validityDays, active, credits }) {
  const current = await getPlan(id);
  if (!current) return null;
  await db.run(
    "UPDATE plans SET name=?, price=?, validityDays=?, active=? WHERE id=?",
    [
      name ?? current.name,
      price ?? current.price,
      validityDays ?? current.validityDays,
      active === undefined ? current.active : active ? 1 : 0,
      id,
    ]
  );
  if (credits) {
    await db.run("DELETE FROM plan_template_credits WHERE planId = ?", [id]);
    for (const c of credits) {
      await db.run(
        "INSERT INTO plan_template_credits (id, planId, serviceType, quantity) VALUES (?, ?, ?, ?)",
        [uid("ptc"), id, c.serviceType, c.quantity]
      );
    }
  }
  return await getPlan(id);
}

async function isPlanInUse(id) {
  const row = await db.get("SELECT COUNT(*) as c FROM client_plans WHERE planId = ?", [id]);
  return row.c > 0;
}

async function deletePlan(id) {
  if (await isPlanInUse(id)) return { ok: false, reason: "in_use" };
  await db.run("DELETE FROM plan_template_credits WHERE planId = ?", [id]);
  await db.run("DELETE FROM plans WHERE id = ?", [id]);
  return { ok: true };
}

async function ensureSeeded() {
  const row = await db.get("SELECT COUNT(*) as c FROM plans");
  if (row.c === 0) {
    await createPlan({ name: "2 Cortes", price: 59.99, validityDays: 30, credits: [{ serviceType: "Corte", quantity: 2 }] });
    await createPlan({ name: "4 Cortes", price: 80.0, validityDays: 30, credits: [{ serviceType: "Corte", quantity: 4 }] });
    await createPlan({
      name: "4 Cortes + 4 Sobrancelhas",
      price: 90.0,
      validityDays: 30,
      credits: [
        { serviceType: "Corte", quantity: 4 },
        { serviceType: "Sobrancelha", quantity: 4 },
      ],
    });
    await createPlan({
      name: "Completo",
      price: 120.0,
      validityDays: 30,
      credits: [
        { serviceType: "Corte", quantity: 4 },
        { serviceType: "Barba", quantity: 4 },
        { serviceType: "Sobrancelha", quantity: 4 },
      ],
    });
  }
}

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan, isPlanInUse, ensureSeeded };
