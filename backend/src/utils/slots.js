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

// Pega a hora/data "de verdade" no fuso da barbearia (America/Sao_Paulo),
// não importa em qual fuso o servidor (Render, Vercel etc.) esteja rodando.
// Isso evita o bug de "sumiço de horários" quando o servidor roda em UTC.
function nowInSaoPaulo() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function todayISO() {
  const n = nowInSaoPaulo();
  return `${n.year}-${String(n.month).padStart(2, "0")}-${String(n.day).padStart(2, "0")}`;
}

function nowMinutesOfDay() {
  const n = nowInSaoPaulo();
  return n.hour * 60 + n.minute;
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
  const nowMin = nowMinutesOfDay();

  const slots = [];
  for (let t = openMin; t + Number(durationMin) <= closeMin; t += stepMin) {
    if (isToday && t <= nowMin + 10) continue;
    const clash = busy.some((b) => overlaps(t, t + Number(durationMin), b.s, b.e));
    if (!clash) slots.push(minToTime(t));
  }
  return slots;
}

module.exports = {
  generateSlots,
  weekdayKey,
  timeToMin,
  minToTime,
  overlaps,
  todayISO,
  nowMinutesOfDay,
  WEEKDAY_KEYS,
};