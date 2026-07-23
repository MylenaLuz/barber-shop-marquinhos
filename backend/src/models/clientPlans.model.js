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
async function recomputeStatus(clientPlan) {
  if (clientPlan.status === "ativo" && clientPlan.endDate < todayISO()) {
    await db.run("UPDATE client_plans SET status = 'expirado' WHERE id = ?", [clientPlan.id]);
    return { ...clientPlan, status: "expirado" };
  }
  return clientPlan;
}

async function getCredits(clientPlanId) {
  return await db.all("SELECT * FROM plan_credits WHERE clientPlanId = ?", [clientPlanId]);
}

async function getClientPlan(id) {
  const row = await db.get("SELECT * FROM client_plans WHERE id = ?", [id]);
  return row ? await recomputeStatus(row) : null;
}

async function getActiveForClient(clientId) {
  const rawRows = await db.all("SELECT * FROM client_plans WHERE clientId = ? ORDER BY createdAt DESC", [clientId]);
  const rows = await Promise.all(rawRows.map(recomputeStatus));
  const active = rows.find((r) => r.status === "ativo");
  if (!active) return null;
  const plan = await Plans.getPlan(active.planId);
  const credits = await getCredits(active.id);
  return { clientPlan: active, plan, credits };
}

async function getActiveClientIds() {
  const rawRows = await db.all("SELECT id, clientId, status, endDate FROM client_plans");
  const rows = await Promise.all(rawRows.map(recomputeStatus));
  return [...new Set(rows.filter((r) => r.status === "ativo").map((r) => r.clientId))];
}

async function enrich(clientPlan) {
  const client = await Clients.getClient(clientPlan.clientId);
  const plan = await Plans.getPlan(clientPlan.planId);
  const credits = await getCredits(clientPlan.id);
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

async function listAll({ search, planId, dueFilter, creditsFilter } = {}) {
  const rawRows = await db.all("SELECT * FROM client_plans ORDER BY createdAt DESC");
  const withStatus = await Promise.all(rawRows.map(recomputeStatus));
  let rows = await Promise.all(withStatus.map(enrich));

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

async function activatePlan({ clientId, planId }) {
  const client = await Clients.getClient(clientId);
  if (!client) throw Object.assign(new Error("Cliente não encontrado."), { status: 404 });
  const plan = await Plans.getPlan(planId);
  if (!plan) throw Object.assign(new Error("Plano não encontrado."), { status: 404 });

  const existingActive = await getActiveForClient(clientId);
  if (existingActive) {
    throw Object.assign(
      new Error("Este cliente já possui um plano ativo. Aguarde o vencimento ou renove o plano atual."),
      { status: 409 }
    );
  }

  const id = uid("cp");
  const startDate = todayISO();
  const endDate = addDays(startDate, plan.validityDays);
  await db.run(
    "INSERT INTO client_plans (id, clientId, planId, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, 'ativo')",
    [id, clientId, planId, startDate, endDate]
  );

  for (const c of plan.credits) {
    await db.run(
      "INSERT INTO plan_credits (id, clientPlanId, serviceType, totalQuantity, remainingQuantity) VALUES (?, ?, ?, ?, ?)",
      [uid("pc"), id, c.serviceType, c.quantity, c.quantity]
    );
  }

  await Transactions.createTransaction({
    type: "receita",
    description: `Plano ${plan.name} — ${client.name}`,
    value: plan.price,
    date: startDate,
  });

  return await enrich(await getClientPlan(id));
}

async function renewPlan(clientPlanId) {
  const clientPlan = await getClientPlan(clientPlanId);
  if (!clientPlan) throw Object.assign(new Error("Plano do cliente não encontrado."), { status: 404 });
  const plan = await Plans.getPlan(clientPlan.planId);
  const client = await Clients.getClient(clientPlan.clientId);

  const previousEndDate = clientPlan.endDate;
  const newEndDate = addDays(todayISO(), plan.validityDays);

  await db.run("UPDATE client_plans SET endDate = ?, status = 'ativo' WHERE id = ?", [newEndDate, clientPlanId]);

  // Reinicia todos os créditos (volta pro total original do plano)
  const credits = await getCredits(clientPlanId);
  for (const c of credits) {
    await db.run("UPDATE plan_credits SET remainingQuantity = totalQuantity WHERE id = ?", [c.id]);
  }

  await db.run(
    "INSERT INTO plan_renewals (id, clientPlanId, previousEndDate, newEndDate) VALUES (?, ?, ?, ?)",
    [uid("ren"), clientPlanId, previousEndDate, newEndDate]
  );

  await Transactions.createTransaction({
    type: "receita",
    description: `Renovação — Plano ${plan.name} — ${client?.name || ""}`,
    value: plan.price,
    date: todayISO(),
  });

  return await enrich(await getClientPlan(clientPlanId));
}

async function consumeCredit(clientPlanId, serviceType, appointmentId) {
  const credit = await db.get(
    "SELECT * FROM plan_credits WHERE clientPlanId = ? AND serviceType = ?",
    [clientPlanId, serviceType]
  );
  if (!credit) throw Object.assign(new Error("Esse tipo de crédito não existe nesse plano."), { status: 400 });
  if (credit.remainingQuantity <= 0)
    throw Object.assign(new Error("Não há créditos restantes desse tipo."), { status: 400 });

  await db.run("UPDATE plan_credits SET remainingQuantity = remainingQuantity - 1 WHERE id = ?", [credit.id]);
  await db.run(
    "INSERT INTO plan_consumption_history (id, clientPlanId, serviceType, appointmentId) VALUES (?, ?, ?, ?)",
    [uid("pch"), clientPlanId, serviceType, appointmentId || null]
  );

  return await enrich(await getClientPlan(clientPlanId));
}

async function getHistory(clientPlanId) {
  return await db.all(
    `SELECT h.*, a.date as appointmentDate FROM plan_consumption_history h
     LEFT JOIN appointments a ON a.id = h.appointmentId
     WHERE h.clientPlanId = ? ORDER BY h.consumedAt DESC`,
    [clientPlanId]
  );
}

async function getAlerts() {
  const rawRows = await db.all("SELECT * FROM client_plans");
  const withStatus = await Promise.all(rawRows.map(recomputeStatus));
  const rows = withStatus.filter((r) => r.status === "ativo");
  const alerts = [];
  for (const r of rows) {
    const client = await Clients.getClient(r.clientId);
    const name = client?.name || "Cliente";
    const daysRemaining = daysBetween(todayISO(), r.endDate);
    const credits = await getCredits(r.id);
    for (const c of credits) {
      if (c.remainingQuantity === 1) {
        alerts.push({
          type: "credito",
          clientPlanId: r.id,
          message: `${name} possui apenas 1 ${c.serviceType.toLowerCase()} restante.`,
        });
      }
    }
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
  }
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
