const { todayISO } = require("./slots");

function addDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function periodRange(period, refISO = todayISO()) {
  if (period === "hoje") return [refISO, refISO];
  if (period === "semana") {
    const [y, m, d] = refISO.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = addDays(refISO, diffToMonday);
    const end = addDays(start, 6);
    return [start, end];
  }
  if (period === "mes") {
    const [y, m] = refISO.split("-").map(Number);
    const start = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return [start, end];
  }
  return [refISO, refISO];
}

module.exports = { periodRange, addDays };
