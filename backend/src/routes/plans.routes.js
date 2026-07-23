const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Plans = require("../models/plans.model");

const router = express.Router();

// Público: catálogo de planos pra área "Marquinhos Club" do site
// (só os ativos, sem exigir login).
router.get("/public", (req, res) => {
  res.json(Plans.listPlans({}));
});

// Todas as rotas de gestão de planos são admin-only (só o Marcos ativa planos).
router.get("/", requireAuth, (req, res) => {
  res.json(Plans.listPlans({ includeInactive: req.query.all === "1" }));
});

router.post("/", requireAuth, (req, res) => {
  const { name, price, validityDays, credits } = req.body || {};
  if (!name || !price || !credits || !credits.length) {
    return res.status(400).json({ error: "Nome, valor e ao menos um crédito são obrigatórios." });
  }
  res.status(201).json(Plans.createPlan({ name, price, validityDays, credits }));
});

router.put("/:id", requireAuth, (req, res) => {
  const updated = Plans.updatePlan(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: "Plano não encontrado." });
  res.json(updated);
});

router.delete("/:id", requireAuth, (req, res) => {
  const result = Plans.deletePlan(req.params.id);
  if (!result.ok) {
    return res.status(409).json({ error: "Esse plano já foi usado por algum cliente e não pode ser excluído. Você pode desativá-lo em vez de excluir." });
  }
  res.json({ ok: true });
});

module.exports = router;
