const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

// Em produção (Vercel, Railway etc.) defina TURSO_DATABASE_URL e
// TURSO_AUTH_TOKEN (veja o painel do Turso: turso db show <nome> --url
// e turso db tokens create <nome>). Sem essas variáveis, cai para um
// arquivo local (bom para rodar o backend na sua máquina).
const remoteUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

let client;
if (remoteUrl) {
  client = createClient({ url: remoteUrl, authToken });
} else {
  const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/marquinhos.db");
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  client = createClient({ url: `file:${DB_PATH}` });
}

// Helpers assíncronos que os models usam no lugar do antigo
// db.prepare(sql).all/get/run(...) do better-sqlite3.
// `params` é sempre um array de valores posicionais (parâmetros "?").
async function all(sql, params = []) {
  const res = await client.execute({ sql, args: params });
  return res.rows;
}

async function get(sql, params = []) {
  const res = await client.execute({ sql, args: params });
  return res.rows[0];
}

async function run(sql, params = []) {
  const res = await client.execute({ sql, args: params });
  return { lastInsertRowid: res.lastInsertRowid, changes: res.rowsAffected };
}

// Roda o schema.sql inteiro na subida — todos os CREATE TABLE são
// "IF NOT EXISTS", então isso funciona como uma migração idempotente
// bem simples (sem necessidade de uma ferramenta externa de migração).
async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await client.executeMultiple(schema);
}

module.exports = { all, get, run, migrate, client };
