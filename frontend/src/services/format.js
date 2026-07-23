export function formatBRL(n) {
  return "R$ " + Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isoToDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysISO(iso, n) {
  const d = isoToDate(iso);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDateBR(iso) {
  if (!iso) return "";
  return isoToDate(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateLong(iso) {
  if (!iso) return "";
  return isoToDate(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
}

export function statusLabel(s) {
  return { confirmado: "Confirmado", concluido: "Concluído", cancelado: "Cancelado", bloqueado: "Bloqueado" }[s] || s;
}

export function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const WEEKDAY_LABELS = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
export const WEEKDAY_ORDER = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
