-- Barbearia Marquinhos — schema SQLite
-- Executado automaticamente na subida do servidor (idempotente).

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS barbers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',      -- JSON array
  photo TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  experienceYears INTEGER NOT NULL DEFAULT 0,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL,
  duration INTEGER NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  barberId TEXT NOT NULL REFERENCES barbers(id),
  serviceId TEXT REFERENCES services(id),
  clientId TEXT REFERENCES clients(id),
  clientName TEXT NOT NULL DEFAULT '',
  clientPhone TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,     -- YYYY-MM-DD
  time TEXT NOT NULL,     -- HH:MM
  duration INTEGER NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmado', -- confirmado | concluido | cancelado | bloqueado
  isBlock INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_appt_barber_date ON appointments(barberId, date);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- receita | despesa
  description TEXT NOT NULL,
  value REAL NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  barberId TEXT REFERENCES barbers(id),
  serviceId TEXT REFERENCES services(id),
  appointmentId TEXT REFERENCES appointments(id),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tx_date ON transactions(date);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  heroVideo TEXT NOT NULL DEFAULT '/video/hero.mp4',
  hours TEXT NOT NULL DEFAULT '{}' -- JSON
);

-- ============================================================
-- Módulo de Mensalistas (planos/assinaturas com créditos de serviço)
-- Tabelas novas e independentes — nada acima foi alterado.
-- ============================================================

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  validityDays INTEGER NOT NULL DEFAULT 30,
  active INTEGER NOT NULL DEFAULT 1,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Molde de créditos de cada plano (o que ele concede ao ser ativado).
-- serviceType é um texto livre (ex: "Corte", "Barba", "Sobrancelha"),
-- não depende da tabela services — assim dá pra criar planos novos com
-- qualquer combinação de tipos, sem precisar mexer em código.
CREATE TABLE IF NOT EXISTS plan_template_credits (
  id TEXT PRIMARY KEY,
  planId TEXT NOT NULL REFERENCES plans(id),
  serviceType TEXT NOT NULL,
  quantity INTEGER NOT NULL
);

-- Uma instância de um cliente com um plano ativo (ou expirado/cancelado).
CREATE TABLE IF NOT EXISTS client_plans (
  id TEXT PRIMARY KEY,
  clientId TEXT NOT NULL REFERENCES clients(id),
  planId TEXT NOT NULL REFERENCES plans(id),
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo', -- ativo | expirado | cancelado
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_clientplans_client ON client_plans(clientId);

-- Créditos restantes por tipo de serviço, de um client_plan específico.
CREATE TABLE IF NOT EXISTS plan_credits (
  id TEXT PRIMARY KEY,
  clientPlanId TEXT NOT NULL REFERENCES client_plans(id),
  serviceType TEXT NOT NULL,
  totalQuantity INTEGER NOT NULL,
  remainingQuantity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_credits_clientplan ON plan_credits(clientPlanId);

-- Histórico de consumo (para a aba "Histórico de Consumo" na ficha do cliente).
CREATE TABLE IF NOT EXISTS plan_consumption_history (
  id TEXT PRIMARY KEY,
  clientPlanId TEXT NOT NULL REFERENCES client_plans(id),
  serviceType TEXT NOT NULL,
  appointmentId TEXT REFERENCES appointments(id),
  consumedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Histórico de renovações.
CREATE TABLE IF NOT EXISTS plan_renewals (
  id TEXT PRIMARY KEY,
  clientPlanId TEXT NOT NULL REFERENCES client_plans(id),
  previousEndDate TEXT NOT NULL,
  newEndDate TEXT NOT NULL,
  renewedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Solicitações de interesse feitas pelo cliente direto no site público
-- (área "Marquinhos Club"). O pagamento nunca acontece aqui — isso só
-- registra o interesse, pra o admin ativar o plano depois de receber o
-- pagamento presencialmente.
CREATE TABLE IF NOT EXISTS plan_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  planId TEXT NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente | ativado | recusado
  clientPlanId TEXT REFERENCES client_plans(id),
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_planrequests_status ON plan_requests(status);
