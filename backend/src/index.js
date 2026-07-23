require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./db");

const User = require("./models/user.model");
const Barbers = require("./models/barbers.model");
const Services = require("./models/services.model");
const Plans = require("./models/plans.model");
const Settings = require("./models/settings.model");

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

// Sobe o servidor só depois que o schema (CREATE TABLE IF NOT EXISTS) e os
// dados padrão (barbeiros, serviços, planos, admin) estiverem prontos —
// necessário agora porque o cliente do Turso/libSQL é assíncrono (antes,
// com better-sqlite3, tudo isso rodava de forma síncrona antes do listen).
async function start() {
  await db.migrate();
  await User.ensureSeeded();
  await Barbers.ensureSeeded();
  await Services.ensureSeeded();
  await Plans.ensureSeeded();
  await Settings.ensureSeeded();

  app.listen(PORT, () => {
    console.log(`API da Barbearia Marquinhos rodando em http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});

module.exports = app;
