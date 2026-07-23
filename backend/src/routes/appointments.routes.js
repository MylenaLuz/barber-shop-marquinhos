const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Appointments = require("../models/appointments.model");
const Services = require("../models/services.model");
const Barbers = require("../models/barbers.model");
const Transactions = require("../models/transactions.model");
const Settings = require("../models/settings.model");
const ClientPlans = require("../models/clientPlans.model");
const { generateSlots } = require("../utils/slots");

const router = express.Router();

// Público: horários disponíveis para um barbeiro/serviço/data
router.get("/slots", (req, res) => {
  const { barberId, date, serviceId } = req.query;
  if (!barberId || !date || !serviceId) {
    return res.status(400).json({ error: "barberId, date e serviceId são obrigatórios." });
  }
  const service = Services.getService(serviceId);
  if (!service) return res.status(404).json({ error: "Serviço não encontrado." });
  const settings = Settings.getSettings();
  const existing = Appointments.activeForBarberOnDate(barberId, date);
  const slots = generateSlots({
    hours: settings.hours,
    dateISO: date,
    durationMin: service.duration,
    existingAppointments: existing,
  });
  res.json({ slots });
});

// Público: criar agendamento
router.post("/", (req, res) => {
  const { barberId, serviceId, date, time, clientName, clientPhone } = req.body || {};
  if (!barberId || !serviceId || !date || !time || !clientName || !clientPhone) {
    return res.status(400).json({ error: "Preencha todos os campos do agendamento." });
  }
  const service = Services.getService(serviceId);
  if (!service) return res.status(404).json({ error: "Serviço não encontrado." });
  const barber = Barbers.getBarber(barberId);
  if (!barber) return res.status(404).json({ error: "Barbeiro não encontrado." });

  // Revalida colisão de horário no servidor (nunca confia só no frontend)
  const existing = Appointments.activeForBarberOnDate(barberId, date);
  const settings = Settings.getSettings();
  const validSlots = generateSlots({
    hours: settings.hours,
    dateISO: date,
    durationMin: service.duration,
    existingAppointments: existing,
  });
  if (!validSlots.includes(time)) {
    return res.status(409).json({ error: "Esse horário não está mais disponível. Escolha outro." });
  }

  const appt = Appointments.createAppointment({
    barberId,
    serviceId,
    date,
    time,
    duration: service.duration,
    price: service.price,
    clientName,
    clientPhone,
    status: "confirmado",
  });
  res.status(201).json(appt);
});

// Protegido: listar (agenda do admin)
router.get("/", requireAuth, (req, res) => {
  const { date, dateFrom, dateTo, barberId, status } = req.query;
  res.json(Appointments.listAppointments({ date, dateFrom, dateTo, barberId, status }));
});

// Protegido: criar via admin (permite bloqueio de horário)
router.post("/admin", requireAuth, (req, res) => {
  const { barberId, serviceId, date, time, clientName, clientPhone, isBlock, duration, note } = req.body || {};
  if (!barberId || !date || !time) return res.status(400).json({ error: "Barbeiro, data e horário são obrigatórios." });

  let price = 0;
  let finalDuration = duration || 30;
  if (!isBlock) {
    const service = Services.getService(serviceId);
    if (!service) return res.status(404).json({ error: "Serviço não encontrado." });
    price = service.price;
    finalDuration = service.duration;
  }
  const appt = Appointments.createAppointment({
    barberId,
    serviceId: isBlock ? null : serviceId,
    date,
    time,
    duration: finalDuration,
    price,
    clientName: isBlock ? clientName || "Bloqueado" : clientName,
    clientPhone: isBlock ? "" : clientPhone,
    status: isBlock ? "bloqueado" : "confirmado",
    isBlock: !!isBlock,
    note,
  });
  res.status(201).json(appt);
});

// Protegido: editar/reagendar
router.put("/:id", requireAuth, (req, res) => {
  const current = Appointments.getAppointment(req.params.id);
  if (!current) return res.status(404).json({ error: "Agendamento não encontrado." });
  const patch = { ...req.body };
  if (patch.serviceId && patch.serviceId !== current.serviceId) {
    const service = Services.getService(patch.serviceId);
    if (service) {
      patch.duration = service.duration;
      patch.price = service.price;
    }
  }
  const updated = Appointments.updateAppointment(req.params.id, patch);
  res.json(updated);
});

// Protegido: concluir atendimento -> gera receita automaticamente
// (ou consome um crédito de mensalista, se o admin escolher isso no modal do front)
router.post("/:id/complete", requireAuth, (req, res) => {
  const { consumeCreditType } = req.body || {};
  const appt = Appointments.getAppointment(req.params.id);
  if (!appt) return res.status(404).json({ error: "Agendamento não encontrado." });
  if (appt.isBlock) return res.status(400).json({ error: "Bloqueios não podem ser concluídos." });

  Appointments.updateAppointment(req.params.id, { status: "concluido" });

  // Mensalista consumindo crédito do plano: não gera lançamento novo no caixa
  // (o valor já entrou como receita quando o plano foi ativado/renovado).
  if (consumeCreditType && appt.clientId) {
    const active = ClientPlans.getActiveForClient(appt.clientId);
    if (active) {
      try {
        ClientPlans.consumeCredit(active.clientPlan.id, consumeCreditType, appt.id);
        return res.json({ ...Appointments.getAppointment(req.params.id), creditConsumed: true });
      } catch (e) {
        return res.status(e.status || 500).json({ error: e.message || "Não foi possível consumir o crédito." });
      }
    }
  }

  const already = Transactions.findByAppointment(appt.id);
  if (!already) {
    const service = Services.getService(appt.serviceId);
    Transactions.createTransaction({
      type: "receita",
      description: `${service?.name || "Serviço"} — ${appt.clientName}`,
      value: appt.price,
      date: appt.date,
      barberId: appt.barberId,
      serviceId: appt.serviceId,
      appointmentId: appt.id,
    });
  }
  res.json(Appointments.getAppointment(req.params.id));
});

// Protegido: cancelar
router.post("/:id/cancel", requireAuth, (req, res) => {
  const appt = Appointments.updateAppointment(req.params.id, { status: "cancelado" });
  if (!appt) return res.status(404).json({ error: "Agendamento não encontrado." });
  res.json(appt);
});

module.exports = router;
