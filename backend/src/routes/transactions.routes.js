const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Transactions = require("../models/transactions.model");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const { dateFrom, dateTo, type } = req.query;
  res.json(Transactions.listTransactions({ dateFrom, dateTo, type }));
});

router.post("/", requireAuth, (req, res) => {
  const { description, value, date } = req.body || {};
  if (!description || !value || !date) {
    return res.status(400).json({ error: "Descrição, valor e data são obrigatórios." });
  }
  const tx = Transactions.createTransaction({ type: "despesa", description, value, date });
  res.status(201).json(tx);
});

router.delete("/:id", requireAuth, (req, res) => {
  Transactions.deleteTransaction(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
