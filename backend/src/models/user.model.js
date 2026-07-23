const bcrypt = require("bcryptjs");
const db = require("../db");

function getAdmin() {
  return db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
}
function ensureSeeded() {
  const existing = getAdmin();
  if (!existing) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || "marquinhos123";
    const hash = bcrypt.hashSync(defaultPassword, 10);
    db.prepare("INSERT INTO users (username, passwordHash) VALUES ('admin', ?)").run(hash);
  }
}
function verifyPassword(plain) {
  const admin = getAdmin();
  if (!admin) return false;
  return bcrypt.compareSync(plain, admin.passwordHash);
}
function changePassword(newPlain) {
  const hash = bcrypt.hashSync(newPlain, 10);
  db.prepare("UPDATE users SET passwordHash = ? WHERE username = 'admin'").run(hash);
}

module.exports = { getAdmin, ensureSeeded, verifyPassword, changePassword };
