const bcrypt = require("bcryptjs");
const db = require("../db");

async function getAdmin() {
  return await db.get("SELECT * FROM users WHERE username = 'admin'");
}
async function ensureSeeded() {
  const existing = await getAdmin();
  if (!existing) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "marquinhos123";
    const hash = bcrypt.hashSync(defaultPassword, 10);
    await db.run("INSERT INTO users (username, passwordHash) VALUES ('admin', ?)", [hash]);
  }
}
async function verifyPassword(plain) {
  const admin = await getAdmin();
  if (!admin) return false;
  return bcrypt.compareSync(plain, admin.passwordHash);
}
async function changePassword(newPlain) {
  const hash = bcrypt.hashSync(newPlain, 10);
  await db.run("UPDATE users SET passwordHash = ? WHERE username = 'admin'", [hash]);
}

module.exports = { getAdmin, ensureSeeded, verifyPassword, changePassword };
