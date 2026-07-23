const db = require("../db");
const { uid } = require("../utils/id");

function listTransactions({ dateFrom, dateTo, type } = {}) {
  let sql = "SELECT * FROM transactions WHERE 1=1";
  const params = [];
  if (dateFrom) {
    sql += " AND date >= ?";
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += " AND date <= ?";
    params.push(dateTo);
  }
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  sql += " ORDER BY date DESC, createdAt DESC";
  return db.prepare(sql).all(...params);
}
function createTransaction(data) {
  const id = uid("tx");
  db.prepare(
    `INSERT INTO transactions (id, type, description, value, date, barberId, serviceId, appointmentId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.type,
    data.description,
    data.value,
    data.date,
    data.barberId || null,
    data.serviceId || null,
    data.appointmentId || null
  );
  return db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
}
function findByAppointment(appointmentId) {
  return db.prepare("SELECT * FROM transactions WHERE appointmentId = ? AND type = 'receita'").get(appointmentId);
}
function deleteTransaction(id) {
  db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
}

module.exports = { listTransactions, createTransaction, findByAppointment, deleteTransaction };
