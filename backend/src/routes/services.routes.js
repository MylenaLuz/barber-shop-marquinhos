const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Services = require("../models/services.model");

const router = express.Router();

router.get("/", async (req, res) => res.json(await Services.listServices()));

router.post("/", requireAuth, async (req, res) => {
  const { name, price, duration } = req.body || {};
  if (!name || !price || !duration)
    return res.status(400).json({ error: "Nome, valor e duração são obrigatórios." });
  const s = await Services.createService(req.body);
  res.status(201).json(s);
});

router.put("/:id", requireAuth, async (req, res) => {
  const s = await Services.updateService(req.params.id, req.body || {});
  if (!s) return res.status(404).json({ error: "Serviço não encontrado." });
  res.json(s);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await Services.deleteService(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
