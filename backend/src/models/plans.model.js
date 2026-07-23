const db = require("../db");
const { uid } = require("../utils/id");

function listPlans({ includeInactive = false } = {}) {
  const rows = includeInactive
    ? db.prepare("SELECT * FROM plans ORDER BY sortOrder ASC, createdAt ASC").all()
    : db.prepare("SELECT * FROM plans WHERE active = 1 ORDER BY sortOrder ASC, createdAt ASC").all();
  return rows.map(withCredits);
}

function withCredits(plan) {
  if (!plan) return null;
  const credits = db
    .prepare("SELECT serviceType, quantity FROM plan_template_credits WHERE planId = ?")
    .all(plan.id);
  return { ...plan, credits };
}

function getPlan(id) {
  return withCredits(db.prepare("SELECT * FROM plans WHERE id = ?").get(id));
}

function createPlan({ name, price, validityDays, credits }) {
  const id = uid("plan");
  db.prepare("INSERT INTO plans (id, name, price, validityDays, active, sortOrder) VALUES (?, ?, ?, ?, 1, ?)").run(
    id,
    name,
    price,
    validityDays || 30,
    db.prepare("SELECT COALESCE(MAX(sortOrder),0) as m FROM plans").get().m + 1
  );
  (credits || []).forEach((c) => {
    db.prepare("INSERT INTO plan_template_credits (id, planId, serviceType, quantity) VALUES (?, ?, ?, ?)").run(
      uid("ptc"),
      id,
      c.serviceType,
      c.quantity
    );
  });
  return getPlan(id);
}

function updatePlan(id, { name, price, validityDays, active, credits }) {
  const current = getPlan(id);
  if (!current) return null;
  db.prepare("UPDATE plans SET name=?, price=?, validityDays=?, active=? WHERE id=?").run(
    name ?? current.name,
    price ?? current.price,
    validityDays ?? current.validityDays,
    active === undefined ? current.active : active ? 1 : 0,
    id
  );
  if (credits) {
    db.prepare("DELETE FROM plan_template_credits WHERE planId = ?").run(id);
    credits.forEach((c) => {
      db.prepare("INSERT INTO plan_template_credits (id, planId, serviceType, quantity) VALUES (?, ?, ?, ?)").run(
        uid("ptc"),
        id,
        c.serviceType,
        c.quantity
      );
    });
  }
  return getPlan(id);
}

function isPlanInUse(id) {
  const row = db.prepare("SELECT COUNT(*) as c FROM client_plans WHERE planId = ?").get(id);
  return row.c > 0;
}

function deletePlan(id) {
  if (isPlanInUse(id)) return { ok: false, reason: "in_use" };
  db.prepare("DELETE FROM plan_template_credits WHERE planId = ?").run(id);
  db.prepare("DELETE FROM plans WHERE id = ?").run(id);
  return { ok: true };
}

function ensureSeeded() {
  const count = db.prepare("SELECT COUNT(*) as c FROM plans").get().c;
  if (count === 0) {
    createPlan({ name: "2 Cortes", price: 59.99, validityDays: 30, credits: [{ serviceType: "Corte", quantity: 2 }] });
    createPlan({ name: "4 Cortes", price: 80.0, validityDays: 30, credits: [{ serviceType: "Corte", quantity: 4 }] });
    createPlan({
      name: "4 Cortes + 4 Sobrancelhas",
      price: 90.0,
      validityDays: 30,
      credits: [
        { serviceType: "Corte", quantity: 4 },
        { serviceType: "Sobrancelha", quantity: 4 },
      ],
    });
    createPlan({
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
