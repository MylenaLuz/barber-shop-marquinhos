const db = require("../db");

const DEFAULT_HOURS = {
  seg: { open: "09:00", close: "20:00", closed: false },
  ter: { open: "09:00", close: "20:00", closed: false },
  qua: { open: "09:00", close: "20:00", closed: false },
  qui: { open: "09:00", close: "20:00", closed: false },
  sex: { open: "09:00", close: "20:00", closed: false },
  sab: { open: "09:00", close: "18:00", closed: false },
  dom: { open: "09:00", close: "13:00", closed: true },
};

function ensureSeeded() {
  const row = db.prepare("SELECT id FROM settings WHERE id = 1").get();
  if (!row) {
    db.prepare(
      `INSERT INTO settings (id, name, whatsapp, instagram, phone, address, logo, heroVideo, hours)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      "Barbearia Marquinhos",
      "5541999999999",
      "barbeariamarquinhos",
      "(41) 99999-9999",
      "Rua Exemplo, 123 - Curitiba, PR",
      "/images/logo.svg",
      "/video/hero.mp4",
      JSON.stringify(DEFAULT_HOURS)
    );
  }
}

function getSettings() {
  ensureSeeded();
  const row = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  return { ...row, hours: JSON.parse(row.hours) };
}

function updateSettings(patch) {
  const current = getSettings();
  const next = { ...current, ...patch };
  db.prepare(
    `UPDATE settings SET name=?, whatsapp=?, instagram=?, phone=?, address=?, logo=?, heroVideo=?, hours=? WHERE id=1`
  ).run(
    next.name,
    next.whatsapp,
    next.instagram,
    next.phone,
    next.address,
    next.logo,
    next.heroVideo,
    JSON.stringify(next.hours)
  );
  return getSettings();
}

module.exports = { getSettings, updateSettings, DEFAULT_HOURS };
