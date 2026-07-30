const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Appointments = require("../models/appointments.model");
const Transactions = require("../models/transactions.model");
const Barbers = require("../models/barbers.model");
const Services = require("../models/services.model");
const Clients = require("../models/clients.model");
const { todayISO, timeToMin, nowMinutesOfDay } = require("../utils/slots");
const { periodRange } = require("../utils/period");

const router = express.Router();

router.get("/home", requireAuth, async (req, res) => {
  const today = todayISO();
  const allToday = await Appointments.listAppointments({ date: today });
  const todays = allToday.filter((a) => a.status !== "cancelado");
  const nowMin = nowMinutesOfDay();
  const next = todays
    .filter((a) => a.status === "confirmado" && timeToMin(a.time) >= nowMin)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  const previsto = todays.filter((a) => !a.isBlock).reduce((s, a) => s + Number(a.price || 0), 0);
  const clients = await Clients.listClients();

  res.json({
    today,
    count: todays.length,
    next: next ? { time: next.time, clientName: next.clientName } : null,
    previsto,
    clientsCount: clients.length,
    appointments: todays.sort((a, b) => a.time.localeCompare(b.time)),
  });
});

router.get("/caixa", requireAuth, async (req, res) => {
  const today = todayISO();
  const [mStart, mEnd] = periodRange("mes");
  const all = await Transactions.listTransactions({});
  const sum = (list, type) => list.filter((t) => t.type === type).reduce((s, t) => s + Number(t.value), 0);
  const hoje = all.filter((t) => t.date === today);
  const mes = all.filter((t) => t.date >= mStart && t.date <= mEnd);
  res.json({
    receitasHoje: sum(hoje, "receita"),
    despesasHoje: sum(hoje, "despesa"),
    receitasMes: sum(mes, "receita"),
    despesasMes: sum(mes, "despesa"),
    saldoTotal: sum(all, "receita") - sum(all, "despesa"),
    entries: all,
  });
});

router.get("/reports", requireAuth, async (req, res) => {
  const period = req.query.period || "hoje";
  const [start, end] = periodRange(period);
  const concluded = await Appointments.listAppointments({ dateFrom: start, dateTo: end, status: "concluido" });
  const receitas = await Transactions.listTransactions({ dateFrom: start, dateTo: end, type: "receita" });
  const receitaTotal = receitas.reduce((s, t) => s + Number(t.value), 0);

  const porBarbeiro = {};
  const barbers = await Barbers.listBarbers();
  barbers.forEach((b) => (porBarbeiro[b.id] = { name: b.name, total: 0 }));
  receitas.forEach((t) => {
    if (t.barberId && porBarbeiro[t.barberId]) porBarbeiro[t.barberId].total += Number(t.value);
  });

  const porServico = {};
  for (const a of concluded) {
    const svc = await Services.getService(a.serviceId);
    const key = svc?.name || "—";
    porServico[key] = (porServico[key] || 0) + 1;
  }

  res.json({ start, end, count: concluded.length, receitaTotal, porBarbeiro, porServico });
});

module.exports = router;