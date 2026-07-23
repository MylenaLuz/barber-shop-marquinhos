const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Barbers = require("../models/barbers.model");

const router = express.Router();

router.get("/", (req, res) => res.json(Barbers.listBarbers()));

router.post("/", requireAuth, (req, res) => {
  const b = Barbers.createBarber(req.body || {});
  res.status(201).json(b);
});

router.put("/:id", requireAuth, (req, res) => {
  const b = Barbers.updateBarber(req.params.id, req.body || {});
  if (!b) return res.status(404).json({ error: "Barbeiro não encontrado." });
  res.json(b);
});

router.delete("/:id", requireAuth, (req, res) => {
  Barbers.deleteBarber(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
