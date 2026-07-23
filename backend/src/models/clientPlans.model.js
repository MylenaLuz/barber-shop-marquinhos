const db = require("../db");
const { uid } = require("../utils/id");
const { todayISO } = require("../utils/slots");
const { addDays } = require("../utils/period");
const Plans = require("./plans.model");
const Clients = require("./clients.model");
const Transactions = require("./transactions.model");

function daysBetween(fromISO, toISO) {
  const [y1, m1, d1] = fromISO.split("-").map(Number);
  const [y2, m2, d2] = toISO.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b - a) / 86400000);
}

// Garante que o status reflita a data atual (expira sozinho quando vence).
// Feito de forma preguiçosa (a cada leitura), sem precisar de um job agendado.
function recomputeStatus(clientPlan) {
  if (clientPlan.status === "ativo" && clientPlan.endDate < todayISO()) {
    db.prepare("UPDATE client_plans SET status = 'expirado' WHERE id = ?").run(clientPlan.id);
    return { ...clientPlan, status: "expirado" };
  }
  return clientPlan;
}

function getCredits(clientPlanId) {
  return db.prepare("SELECT * FROM plan_credits WHERE clientPlanId = ?").all(clientPlanId);
}

function getClientPlan(id) {
  const row = db.prepare("SELECT * FROM client_plans WHERE id = ?").get(id);
  return row ? recomputeStatus(row) : null;
}

function getActiveForClient(clientId) {
  const rows = db
    .prepare("SELECT * FROM client_plans WHERE clientId = ? ORDER BY createdAt DESC")
    .all(clientId)
    .map(recomputeStatus);
  const active = rows.find((r) => r.status === "ativo");
  if (!active) return null;
  const plan = Plans.getPlan(active.planId);
  const credits = getCredits(active.id);
  return { clientPlan: active, plan, credits };
}

function getActiveClientIds() {
  const rows = db.prepare("SELECT id, clientId, status, endDate FROM client_plans").all().map(recomputeStatus);
  return [...new Set(rows.filter((r) => r.status === "ativo").map((r) => r.clientId))];
}

function enrich(clientPlan) {
  const client = Clients.getClient(clientPlan.clientId);
  const plan = Plans.getPlan(clientPlan.planId);
  const credits = getCredits(clientPlan.id);
  const daysRemaining = daysBetween(todayISO(), clientPlan.endDate);
  return {
    ...clientPlan,
    clientName: client?.name || "—",
    clientPhone: client?.phone || "",
    planName: plan?.name || "—",
    daysRemaining,
    credits,
  };
}

function listAll({ search, planId, dueFilter, creditsFilter } = {}) {
  let rows = db.prepare("SELECT * FROM client_plans ORDER BY createdAt DESC").all().map(recomputeStatus).map(enrich);

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    rows = rows.filter((r) => r.clientName.toLowerCase().includes(q) || r.clientPhone.includes(q));
  }
  if (planId && planId !== "all") {
    rows = rows.filter((r) => r.planId === planId);
  }
  if (dueFilter === "vencendo") {
    rows = rows.filter((r) => r.status === "ativo" && r.daysRemaining <= 7 && r.daysRemaining >= 0);
  } else if (dueFilter === "vencidos") {
    rows = rows.filter((r) => r.status === "expirado");
  } else if (dueFilter === "ativos") {
    rows = rows.filter((r) => r.status === "ativo");
  }
  if (creditsFilter === "baixo") {
    rows = rows.filter((r) => r.credits.some((c) => c.remainingQuantity <= 1));
  } else if (creditsFilter === "zerado") {
    rows = rows.filter((r) => r.credits.every((c) => c.remainingQuantity === 0));
  }
  return rows;
}

function activatePlan({ clientId, planId }) {
  const client = Clients.getClient(clientId);
  if (!client) throw Object.assign(new Error("Cliente não encontrado."), { status: 404 });
  const plan = Plans.getPlan(planId);
  if (!plan) throw Object.assign(new Error("Plano não encontrado."), { status: 404 });

  const existingActive = getActiveForClient(clientId);
  if (existingActive) {
    throw Object.assign(
      new Error("Este cliente já possui um plano ativo. Aguarde o vencimento ou renove o plano atual."),
      { status: 409 }
    );
  }

  const id = uid("cp");
  const startDate = todayISO();
  const endDate = addDays(startDate, plan.validityDays);
  db.prepare(
    "INSERT INTO client_plans (id, clientId, planId, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, 'ativo')"
  ).run(id, clientId, planId, startDate, endDate);

  plan.credits.forEach((c) => {
    db.prepare(
      "INSERT INTO plan_credits (id, clientPlanId, serviceType, totalQuantity, remainingQuantity) VALUES (?, ?, ?, ?, ?)"
    ).run(uid("pc"), id, c.serviceType, c.quantity, c.quantity);
  });

  Transactions.createTransaction({
    type: "receita",
    description: `Plano ${plan.name} — ${client.name}`,
    value: plan.price,
    date: startDate,
  });

  return enrich(getClientPlan(id));
}

function renewPlan(clientPlanId) {
  const clientPlan = getClientPlan(clientPlanId);
  if (!clientPlan) throw Object.assign(new Error("Plano do cliente não encontrado."), { status: 404 });
  const plan = Plans.getPlan(clientPlan.planId);
  const client = Clients.getClient(clientPlan.clientId);

  const previousEndDate = clientPlan.endDate;
  const newEndDate = addDays(todayISO(), plan.validityDays);

  db.prepare("UPDATE client_plans SET endDate = ?, status = 'ativo' WHERE id = ?").run(newEndDate, clientPlanId);

  // Reinicia todos os créditos (volta pro total original do plano)
  const credits = getCredits(clientPlanId);
  credits.forEach((c) => {
    db.prepare("UPDATE plan_credits SET remainingQuantity = totalQuantity WHERE id = ?").run(c.id);
  });

  db.prepare(
    "INSERT INTO plan_renewals (id, clientPlanId, previousEndDate, newEndDate) VALUES (?, ?, ?, ?)"
  ).run(uid("ren"), clientPlanId, previousEndDate, newEndDate);

  Transactions.createTransaction({
    type: "receita",
    description: `Renovação — Plano ${plan.name} — ${client?.name || ""}`,
    value: plan.price,
    date: todayISO(),
  });

  return enrich(getClientPlan(clientPlanId));
}

function consumeCredit(clientPlanId, serviceType, appointmentId) {
  const credit = db
    .prepare("SELECT * FROM plan_credits WHERE clientPlanId = ? AND serviceType = ?")
    .get(clientPlanId, serviceType);
  if (!credit) throw Object.assign(new Error("Esse tipo de crédito não existe nesse plano."), { status: 400 });
  if (credit.remainingQuantity <= 0)
    throw Object.assign(new Error("Não há créditos restantes desse tipo."), { status: 400 });

  db.prepare("UPDATE plan_credits SET remainingQuantity = remainingQuantity - 1 WHERE id = ?").run(credit.id);
  db.prepare(
    "INSERT INTO plan_consumption_history (id, clientPlanId, serviceType, appointmentId) VALUES (?, ?, ?, ?)"
  ).run(uid("pch"), clientPlanId, serviceType, appointmentId || null);

  return enrich(getClientPlan(clientPlanId));
}

function getHistory(clientPlanId) {
  return db
    .prepare(
      `SELECT h.*, a.date as appointmentDate FROM plan_consumption_history h
       LEFT JOIN appointments a ON a.id = h.appointmentId
       WHERE h.clientPlanId = ? ORDER BY h.consumedAt DESC`
    )
    .all(clientPlanId);
}

function getAlerts() {
  const rows = db.prepare("SELECT * FROM client_plans").all().map(recomputeStatus).filter((r) => r.status === "ativo");
  const alerts = [];
  rows.forEach((r) => {
    const client = Clients.getClient(r.clientId);
    const name = client?.name || "Cliente";
    const daysRemaining = daysBetween(todayISO(), r.endDate);
    const credits = getCredits(r.id);
    credits.forEach((c) => {
      if (c.remainingQuantity === 1) {
        alerts.push({
          type: "credito",
          clientPlanId: r.id,
          message: `${name} possui apenas 1 ${c.serviceType.toLowerCase()} restante.`,
        });
      }
    });
    if (daysRemaining < 7 && daysRemaining >= 0) {
      alerts.push({
        type: "vencimento",
        clientPlanId: r.id,
        message:
          daysRemaining === 0
            ? `O plano de ${name} vence hoje.`
            : `O plano de ${name} vence em ${daysRemaining} dia${daysRemaining === 1 ? "" : "s"}.`,
      });
    }
  });
  return alerts;
}

module.exports = {
  getActiveForClient,
  getActiveClientIds,
  listAll,
  activatePlan,
  renewPlan,
  consumeCredit,
  getHistory,
  getAlerts,
  getClientPlan,
};
