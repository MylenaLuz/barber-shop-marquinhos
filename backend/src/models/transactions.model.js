const db = require("../db");
const { uid } = require("../utils/id");

async function listTransactions({ dateFrom, dateTo, type } = {}) {
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
  return await db.all(sql, params);
}
async function createTransaction(data) {
  const id = uid("tx");
  await db.run(
    `INSERT INTO transactions (id, type, description, value, date, barberId, serviceId, appointmentId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.type,
      data.description,
      data.value,
      data.date,
      data.barberId || null,
      data.serviceId || null,
      data.appointmentId || null,
    ]
  );
  return await db.get("SELECT * FROM transactions WHERE id = ?", [id]);
}
async function findByAppointment(appointmentId) {
  return await db.get("SELECT * FROM transactions WHERE appointmentId = ? AND type = 'receita'", [appointmentId]);
}
async function deleteTransaction(id) {
  await db.run("DELETE FROM transactions WHERE id = ?", [id]);
}

module.exports = { listTransactions, createTransaction, findByAppointment, deleteTransaction };
