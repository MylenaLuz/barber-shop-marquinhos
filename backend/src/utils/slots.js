const WEEKDAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

function weekdayKey(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return WEEKDAY_KEYS[new Date(y, m - 1, d).getDay()];
}
function timeToMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minToTime(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
function overlaps(aS, aE, bS, bE) {
  return aS < bE && bS < aE;
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Gera os horários disponíveis para um barbeiro em uma data, considerando:
 * - horário de funcionamento do dia da semana
 * - duração do serviço escolhido
 * - agendamentos já existentes (e bloqueios) daquele barbeiro naquele dia
 */
function generateSlots({ hours, dateISO, durationMin, existingAppointments, stepMin = 30 }) {
  const key = weekdayKey(dateISO);
  const dayHours = hours[key];
  if (!dayHours || dayHours.closed) return [];

  const openMin = timeToMin(dayHours.open);
  const closeMin = timeToMin(dayHours.close);
  const busy = existingAppointments.map((a) => ({
    s: timeToMin(a.time),
    e: timeToMin(a.time) + Number(a.duration),
  }));

  const isToday = dateISO === todayISO();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots = [];
  for (let t = openMin; t + Number(durationMin) <= closeMin; t += stepMin) {
    if (isToday && t <= nowMin + 10) continue;
    const clash = busy.some((b) => overlaps(t, t + Number(durationMin), b.s, b.e));
    if (!clash) slots.push(minToTime(t));
  }
  return slots;
}

module.exports = { generateSlots, weekdayKey, timeToMin, minToTime, overlaps, todayISO, WEEKDAY_KEYS };
