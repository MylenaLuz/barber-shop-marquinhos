const db = require("../db");
const { uid } = require("../utils/id");
const { upsertClient, normalizePhone } = require("./clients.model");

function listAppointments({ date, dateFrom, dateTo, barberId, status } = {}) {
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
  return db.prepare(sql).all(...params);
}
function getAppointment(id) {
  return db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
}
function activeForBarberOnDate(barberId, date) {
  return db
    .prepare("SELECT * FROM appointments WHERE barberId = ? AND date = ? AND status != 'cancelado'")
    .all(barberId, date);
}
function createAppointment(data) {
  const id = uid("appt");
  let clientId = null;
  if (!data.isBlock && data.clientPhone) {
    const client = upsertClient({ name: data.clientName, phone: data.clientPhone });
    clientId = client?.id || null;
  }
  db.prepare(
    `INSERT INTO appointments
      (id, barberId, serviceId, clientId, clientName, clientPhone, date, time, duration, price, status, isBlock, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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
    data.note || ""
  );
  return getAppointment(id);
}
function updateAppointment(id, data) {
  const current = getAppointment(id);
  if (!current) return null;
  let clientId = current.clientId;
  if (data.clientPhone) {
    const client = upsertClient({ name: data.clientName ?? current.clientName, phone: data.clientPhone });
    clientId = client?.id || clientId;
  }
  const next = { ...current, ...data, clientId };
  db.prepare(
    `UPDATE appointments SET barberId=?, serviceId=?, clientId=?, clientName=?, clientPhone=?, date=?, time=?,
      duration=?, price=?, status=?, note=?, updatedAt=datetime('now') WHERE id=?`
  ).run(
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
    id
  );
  return getAppointment(id);
}
function deleteAppointment(id) {
  db.prepare("DELETE FROM appointments WHERE id = ?").run(id);
}

module.exports = {
  listAppointments,
  getAppointment,
  activeForBarberOnDate,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
