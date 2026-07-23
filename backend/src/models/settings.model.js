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

async function ensureSeeded() {
  const row = await db.get("SELECT id FROM settings WHERE id = 1");
  if (!row) {
    await db.run(
      `INSERT INTO settings (id, name, whatsapp, instagram, phone, address, logo, heroVideo, hours)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Barbearia Marquinhos",
        "5541999999999",
        "barbeariamarquinhos",
        "(41) 99999-9999",
        "Rua Exemplo, 123 - Curitiba, PR",
        "/images/logo.svg",
        "/video/hero.mp4",
        JSON.stringify(DEFAULT_HOURS),
      ]
    );
  }
}

async function getSettings() {
  await ensureSeeded();
  const row = await db.get("SELECT * FROM settings WHERE id = 1");
  return { ...row, hours: JSON.parse(row.hours) };
}

async function updateSettings(patch) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await db.run(
    `UPDATE settings SET name=?, whatsapp=?, instagram=?, phone=?, address=?, logo=?, heroVideo=?, hours=? WHERE id=1`,
    [next.name, next.whatsapp, next.instagram, next.phone, next.address, next.logo, next.heroVideo, JSON.stringify(next.hours)]
  );
  return await getSettings();
}

module.exports = { getSettings, updateSettings, ensureSeeded, DEFAULT_HOURS };
