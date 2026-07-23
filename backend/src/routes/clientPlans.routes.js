const express = require("express");
const { requireAuth } = require("../middleware/auth");
const ClientPlans = require("../models/clientPlans.model");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const { search, planId, dueFilter, creditsFilter } = req.query;
  res.json(ClientPlans.listAll({ search, planId, dueFilter, creditsFilter }));
});

router.get("/active-ids", requireAuth, (req, res) => {
  res.json(ClientPlans.getActiveClientIds());
});

router.get("/alerts", requireAuth, (req, res) => {
  res.json(ClientPlans.getAlerts());
});

router.get("/active/:clientId", requireAuth, (req, res) => {
  const active = ClientPlans.getActiveForClient(req.params.clientId);
  res.json(active); // null se não tiver plano ativo
});

router.get("/:id/history", requireAuth, (req, res) => {
  res.json(ClientPlans.getHistory(req.params.id));
});

router.post("/", requireAuth, (req, res) => {
  const { clientId, planId } = req.body || {};
  if (!clientId || !planId) return res.status(400).json({ error: "Cliente e plano são obrigatórios." });
  try {
    const created = ClientPlans.activatePlan({ clientId, planId });
    res.status(201).json(created);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Não foi possível ativar o plano." });
  }
});

router.post("/:id/renew", requireAuth, (req, res) => {
  try {
    res.json(ClientPlans.renewPlan(req.params.id));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || "Não foi possível renovar o plano." });
  }
});

module.exports = router;
