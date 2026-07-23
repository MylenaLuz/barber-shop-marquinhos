const express = require("express");
const { requireAuth } = require("../middleware/auth");
const PlanRequests = require("../models/planRequests.model");

const router = express.Router();

// Público: cliente demonstra interesse em um plano direto pelo site.
// Isso NÃO ativa nada — só registra o pedido pro admin ver e ativar
// depois de receber o pagamento presencialmente.
router.post("/", (req, res) => {
  const { name, phone, planId } = req.body || {};
  if (!name || !phone || !planId) {
    return res.status(400).json({ error: "Nome, telefone e plano são obrigatórios." });
  }
  try {
    res.status(201).json(PlanRequests.createRequest({ name, phone, planId }));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Não foi possível registrar seu interesse." });
  }
});

router.get("/", requireAuth, (req, res) => {
  res.json(PlanRequests.listRequests({ status: req.query.status }));
});

router.post("/:id/activate", requireAuth, (req, res) => {
  try {
    res.json(PlanRequests.activateRequest(req.params.id));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Não foi possível ativar o plano." });
  }
});

router.post("/:id/dismiss", requireAuth, (req, res) => {
  try {
    res.json(PlanRequests.dismissRequest(req.params.id));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Não foi possível recusar a solicitação." });
  }
});

module.exports = router;
