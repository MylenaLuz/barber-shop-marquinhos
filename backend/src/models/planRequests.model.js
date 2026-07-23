const db = require("../db");
const { uid } = require("../utils/id");
const Clients = require("./clients.model");
const Plans = require("./plans.model");

async function enrich(row) {
  if (!row) return null;
  const plan = await Plans.getPlan(row.planId);
  return { ...row, phone: row.phone, planName: plan?.name || "—", planPrice: plan?.price };
}

async function listRequests({ status } = {}) {
  const rows = status
    ? await db.all("SELECT * FROM plan_requests WHERE status = ? ORDER BY createdAt DESC", [status])
    : await db.all("SELECT * FROM plan_requests ORDER BY createdAt DESC");
  return await Promise.all(rows.map(enrich));
}

async function getRequest(id) {
  const row = await db.get("SELECT * FROM plan_requests WHERE id = ?", [id]);
  return await enrich(row);
}

async function createRequest({ name, phone, planId }) {
  const plan = await Plans.getPlan(planId);
  if (!plan) throw Object.assign(new Error("Plano não encontrado."), { status: 404 });
  const id = uid("preq");
  await db.run(
    "INSERT INTO plan_requests (id, name, phone, planId, status) VALUES (?, ?, ?, ?, 'pendente')",
    [id, name, Clients.normalizePhone(phone), planId]
  );
  return await getRequest(id);
}

// Ativa a solicitação: cadastra (ou reaproveita) o cliente pelo nome+telefone
// e ativa o plano de verdade. É aqui que o pagamento presencial já confirmado
// vira, de fato, um plano ativo nos Mensalistas.
async function activateRequest(id) {
  const req = await db.get("SELECT * FROM plan_requests WHERE id = ?", [id]);
  if (!req) throw Object.assign(new Error("Solicitação não encontrada."), { status: 404 });
  if (req.status !== "pendente") throw Object.assign(new Error("Essa solicitação já foi processada."), { status: 409 });

  const client = await Clients.upsertClient({ name: req.name, phone: req.phone });
  // Import tardio pra evitar dependência circular (clientPlans.model já importa clients/plans)
  const ClientPlans = require("./clientPlans.model");
  const clientPlan = await ClientPlans.activatePlan({ clientId: client.id, planId: req.planId });

  await db.run("UPDATE plan_requests SET status = 'ativado', clientPlanId = ? WHERE id = ?", [clientPlan.id, id]);
  return { ...(await getRequest(id)), clientPlan };
}

async function dismissRequest(id) {
  const req = await db.get("SELECT * FROM plan_requests WHERE id = ?", [id]);
  if (!req) throw Object.assign(new Error("Solicitação não encontrada."), { status: 404 });
  await db.run("UPDATE plan_requests SET status = 'recusado' WHERE id = ?", [id]);
  return await getRequest(id);
}

module.exports = { listRequests, getRequest, createRequest, activateRequest, dismissRequest };
