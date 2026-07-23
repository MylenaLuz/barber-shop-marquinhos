const db = require("../db");
const { uid } = require("../utils/id");
const Clients = require("./clients.model");
const Plans = require("./plans.model");

function enrich(row) {
  if (!row) return null;
  const plan = Plans.getPlan(row.planId);
  return { ...row, phone: row.phone, planName: plan?.name || "—", planPrice: plan?.price };
}

function listRequests({ status } = {}) {
  const rows = status
    ? db.prepare("SELECT * FROM plan_requests WHERE status = ? ORDER BY createdAt DESC").all(status)
    : db.prepare("SELECT * FROM plan_requests ORDER BY createdAt DESC").all();
  return rows.map(enrich);
}

function getRequest(id) {
  return enrich(db.prepare("SELECT * FROM plan_requests WHERE id = ?").get(id));
}

function createRequest({ name, phone, planId }) {
  const plan = Plans.getPlan(planId);
  if (!plan) throw Object.assign(new Error("Plano não encontrado."), { status: 404 });
  const id = uid("preq");
  db.prepare("INSERT INTO plan_requests (id, name, phone, planId, status) VALUES (?, ?, ?, ?, 'pendente')").run(
    id,
    name,
    Clients.normalizePhone(phone),
    planId
  );
  return getRequest(id);
}

// Ativa a solicitação: cadastra (ou reaproveita) o cliente pelo nome+telefone
// e ativa o plano de verdade. É aqui que o pagamento presencial já confirmado
// vira, de fato, um plano ativo nos Mensalistas.
function activateRequest(id) {
  const req = db.prepare("SELECT * FROM plan_requests WHERE id = ?").get(id);
  if (!req) throw Object.assign(new Error("Solicitação não encontrada."), { status: 404 });
  if (req.status !== "pendente") throw Object.assign(new Error("Essa solicitação já foi processada."), { status: 409 });

  const client = Clients.upsertClient({ name: req.name, phone: req.phone });
  // Import tardio pra evitar dependência circular (clientPlans.model já importa clients/plans)
  const ClientPlans = require("./clientPlans.model");
  const clientPlan = ClientPlans.activatePlan({ clientId: client.id, planId: req.planId });

  db.prepare("UPDATE plan_requests SET status = 'ativado', clientPlanId = ? WHERE id = ?").run(clientPlan.id, id);
  return { ...getRequest(id), clientPlan };
}

function dismissRequest(id) {
  const req = db.prepare("SELECT * FROM plan_requests WHERE id = ?").get(id);
  if (!req) throw Object.assign(new Error("Solicitação não encontrada."), { status: 404 });
  db.prepare("UPDATE plan_requests SET status = 'recusado' WHERE id = ?").run(id);
  return getRequest(id);
}

module.exports = { listRequests, getRequest, createRequest, activateRequest, dismissRequest };
