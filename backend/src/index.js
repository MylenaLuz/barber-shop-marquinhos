require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db"); // roda a migração idempotente (CREATE TABLE IF NOT EXISTS) na subida

const User = require("./models/user.model");
const Barbers = require("./models/barbers.model");
const Services = require("./models/services.model");
const Plans = require("./models/plans.model");
User.ensureSeeded();
Barbers.ensureSeeded();
Services.ensureSeeded();
Plans.ensureSeeded();

const authRoutes = require("./routes/auth.routes");
const barbersRoutes = require("./routes/barbers.routes");
const servicesRoutes = require("./routes/services.routes");
const appointmentsRoutes = require("./routes/appointments.routes");
const clientsRoutes = require("./routes/clients.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const settingsRoutes = require("./routes/settings.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const plansRoutes = require("./routes/plans.routes");
const clientPlansRoutes = require("./routes/clientPlans.routes");
const planRequestsRoutes = require("./routes/planRequests.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/barbers", barbersRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/client-plans", clientPlansRoutes);
app.use("/api/plan-requests", planRequestsRoutes);

// handler de erro genérico (evita vazar stack trace pro cliente)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API da Barbearia Marquinhos rodando em http://localhost:${PORT}`);
});

module.exports = app;
