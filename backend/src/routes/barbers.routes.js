const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Barbers = require("../models/barbers.model");

const router = express.Router();

router.get("/", async (req, res) => res.json(await Barbers.listBarbers()));

router.post("/", requireAuth, async (req, res) => {
  const b = await Barbers.createBarber(req.body || {});
  res.status(201).json(b);
});

router.put("/:id", requireAuth, async (req, res) => {
  const b = await Barbers.updateBarber(req.params.id, req.body || {});
  if (!b) return res.status(404).json({ error: "Barbeiro não encontrado." });
  res.json(b);
});

router.delete("/:id", requireAuth, async (req, res) => {
  await Barbers.deleteBarber(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
