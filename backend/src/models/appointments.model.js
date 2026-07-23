const db = require("../db");
const { uid } = require("../utils/id");
const { upsertClient, normalizePhone } = require("./clients.model");

async function listAppointments({ date, dateFrom, dateTo, barberId, status } = {}) {
  let sql = "SELECT * FROM appointments WHERE 1=1";
  const params = [];
  if (date) {
    sql += " AND date = ?";
    params.push(date);
  }
  if (dateFrom) {
    sql += " AND date >= ?";
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += " AND date <= ?";
    params.push(dateTo);
  }
  if (barberId && barberId !== "all") {
    sql += " AND barberId = ?";
    params.push(barberId);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY date ASC, time ASC";
  return await db.all(sql, params);
}
async function getAppointment(id) {
  return await db.get("SELECT * FROM appointments WHERE id = ?", [id]);
}
async function activeForBarberOnDate(barberId, date) {
  return await db.all(
    "SELECT * FROM appointments WHERE barberId = ? AND date = ? AND status != 'cancelado'",
    [barberId, date]
  );
}
async function createAppointment(data) {
  const id = uid("appt");
  let clientId = null;
  if (!data.isBlock && data.clientPhone) {
    const client = await upsertClient({ name: data.clientName, phone: data.clientPhone });
    clientId = client?.id || null;
  }
  await db.run(
    `INSERT INTO appointments
      (id, barberId, serviceId, clientId, clientName, clientPhone, date, time, duration, price, status, isBlock, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.barberId,
      data.serviceId || null,
      clientId,
      data.clientName || "",
      normalizePhone(data.clientPhone || ""),
      data.date,
      data.time,
      data.duration,
      data.price || 0,
      data.status || "confirmado",
      data.isBlock ? 1 : 0,
      data.note || "",
    ]
  );
  return await getAppointment(id);
}
async function updateAppointment(id, data) {
  const current = await getAppointment(id);
  if (!current) return null;
  let clientId = current.clientId;
  if (data.clientPhone) {
    const client = await upsertClient({ name: data.clientName ?? current.clientName, phone: data.clientPhone });
    clientId = client?.id || clientId;
  }
  const next = { ...current, ...data, clientId };
  await db.run(
    `UPDATE appointments SET barberId=?, serviceId=?, clientId=?, clientName=?, clientPhone=?, date=?, time=?,
      duration=?, price=?, status=?, note=?, updatedAt=datetime('now') WHERE id=?`,
    [
      next.barberId,
      next.serviceId,
      next.clientId,
      next.clientName,
      normalizePhone(next.clientPhone || ""),
      next.date,
      next.time,
      next.duration,
      next.price,
      next.status,
      next.note,
      id,
    ]
  );
  return await getAppointment(id);
}
async function deleteAppointment(id) {
  await db.run("DELETE FROM appointments WHERE id = ?", [id]);
}

module.exports = {
  listAppointments,
  getAppointment,
  activeForBarberOnDate,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
