const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Clients = require("../models/clients.model");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  res.json(await Clients.listClients());
});

// Admin: cadastrar um cliente manualmente (ex: mensalista que ainda não
// tem nenhum agendamento no sistema). Reaproveita o cliente se o telefone
// já existir, do mesmo jeito que um agendamento faria.
router.post("/", requireAuth, async (req, res) => {
  const { name, phone } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "Nome e telefone são obrigatórios." });
  res.status(201).json(await Clients.upsertClient({ name, phone }));
});

module.exports = router;
