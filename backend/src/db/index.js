const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "../../data/marquinhos.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Roda o schema.sql inteiro na subida — todos os CREATE TABLE são
// "IF NOT EXISTS", então isso funciona como uma migração idempotente
// bem simples (sem necessidade de uma ferramenta externa de migração).
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

module.exports = db;
