import { useEffect, useState, useCallback } from "react";
import { CaretLeft, CaretRight, Plus, Check, PencilSimple, X as XIcon, Prohibit } from "@phosphor-icons/react";
import { AppointmentsAPI, ClientPlansAPI } from "../../services/resources";
import { useSiteData } from "../../context/SiteDataContext";
import { Panel, Toast } from "../../components/admin/Widgets";
import { useToast } from "../../hooks/useToast";
import NewAppointmentModal from "../../components/admin/NewAppointmentModal";
import CompleteAppointmentFlow from "../../components/admin/CompleteAppointmentFlow";
import { todayISO, addDaysISO, isoToDate, statusLabel } from "../../services/format";

export default function Agenda() {
  const { barbers, getBarberName, getServiceName } = useSiteData();
  const [mode, setMode] = useState("day");
  const [filter, setFilter] = useState("all");
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [activeClientIds, setActiveClientIds] = useState([]);
  const { message, show } = useToast();

  useEffect(() => { ClientPlansAPI.activeIds().then(setActiveClientIds).catch(() => {}); }, []);

  const load = useCallback(async () => {
    let params = {};
    if (mode === "day") params = { date };
    else if (mode === "week") {
      const d = isoToDate(date);
      const day = d.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      const start = addDaysISO(date, diffToMonday);
      params = { dateFrom: start, dateTo: addDaysISO(start, 6) };
    } else {
      const d = isoToDate(date);
      const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const end = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      params = { dateFrom: start, dateTo: end };
    }
    if (filter !== "all") params.barberId = filter;
    const data = await AppointmentsAPI.list(params);
    setItems(data.filter((a) => a.status !== "cancelado"));
  }, [mode, filter, date]);

  useEffect(() => { load(); }, [load]);

  async function cancel(id) { await AppointmentsAPI.cancel(id); show("Agendamento cancelado."); load(); }
  function openEdit(item) { setEditing(item); setModalOpen(true); }
  function openNew() { setEditing(null); setModalOpen(true); }
  function openBlock() {
    setEditing({ isBlock: true, barberId: barbers[0]?.id, date, time: "09:00", clientName: "" });
    setModalOpen(true);
  }

  function nav(dir) {
    if (mode === "day") setDate(addDaysISO(date, dir));
    else if (mode === "week") setDate(addDaysISO(date, dir * 7));
    else {
      const d = isoToDate(date);
      d.setMonth(d.getMonth() + dir);
      setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`);
    }
  }

  // Drag and drop simples: arrasta um card e solta em outro horário/coluna (view dia/semana)
  async function handleDrop(newDate, newTime) {
    if (!dragId) return;
    const item = items.find((i) => i.id === dragId);
    setDragId(null);
    if (!item || (item.date === newDate && item.time === newTime)) return;
    try {
      await AppointmentsAPI.update(item.id, { date: newDate, time: newTime });
      show("Agendamento reagendado.");
      load();
    } catch (e) {
      show(e?.response?.data?.error || "Não foi possível mover.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div><h2 style={{ fontSize: 30 }}>Agenda</h2><div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>Gerencie os horários de {barbers.map((b) => b.name.split(" ")[0]).join(" e ")}</div></div>
        <button className="btn btn-gold" onClick={openNew}><Plus size={15} /> Novo agendamento</button>
      </div>

      <Panel>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[["day", "Dia"], ["week", "Semana"], ["month", "Mês"]].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)} className={`tab-btn ${mode === v ? "active" : ""}`}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setFilter("all")} className={`tab-btn ${filter === "all" ? "active" : ""}`}>Todos</button>
            {barbers.map((b) => (
              <button key={b.id} onClick={() => setFilter(b.id)} className={`tab-btn ${filter === b.id ? "active" : ""}`}>{b.name.split(" ")[0]}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <button className="icon-btn" onClick={() => nav(-1)}><CaretLeft size={14} /></button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="icon-btn" onClick={() => nav(1)}><CaretRight size={14} /></button>
          <button className="btn btn-ghost btn-sm" onClick={openBlock}><Prohibit size={14} /> Bloquear horário</button>
        </div>

        {mode === "day" && (
          <DayView items={items} onComplete={(a) => setCompleting(a)} onCancel={cancel} onEdit={openEdit} getBarberName={getBarberName} getServiceName={getServiceName}
            onDragStart={setDragId} onDrop={(t) => handleDrop(date, t)} activeClientIds={activeClientIds} />
        )}
        {mode === "week" && (
          <WeekView items={items} baseDate={date} getBarberName={getBarberName} getServiceName={getServiceName} onEdit={openEdit}
            onDragStart={setDragId} onDrop={handleDrop} activeClientIds={activeClientIds} />
        )}
        {mode === "month" && <MonthView items={items} baseDate={date} onGotoDay={(d) => { setDate(d); setMode("day"); }} />}
      </Panel>

      <NewAppointmentModal
        open={modalOpen}
        editing={editing}
        defaultDate={date}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); show(editing?.id ? "Agendamento atualizado." : "Agendamento salvo."); load(); }}
      />
      {completing && (
        <CompleteAppointmentFlow
          appointment={completing}
          onClose={() => setCompleting(null)}
          onDone={() => { setCompleting(null); show("Atendimento concluído."); load(); }}
        />
      )}
      <Toast message={message} />

      <style>{`
        .icon-btn{ width:32px; height:32px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; justify-content:center; color:var(--silver); }
        .icon-btn:hover{ border-color:var(--line-gold); color:var(--gold); }
        .tab-btn{ padding:8px 16px; border-radius:999px; border:1px solid var(--line); font-size:13px; font-weight:600; color:var(--silver-dim); background:transparent; }
        .tab-btn.active{ background:var(--gold); color:#191305; border-color:var(--gold); }
      `}</style>
    </div>
  );
}

function AppointmentCard({ a, getBarberName, getServiceName, onComplete, onCancel, onEdit, draggable, onDragStart, isMensalista }) {
  return (
    <div
      className="glass"
      draggable={draggable}
      onDragStart={() => onDragStart && onDragStart(a.id)}
      style={{ padding: 14, cursor: draggable ? "grab" : "default" }}
    >
      <div className="mono" style={{ color: "var(--gold)", fontSize: 15, fontWeight: 700 }}>
        {a.time} <span style={{ color: "var(--silver-dim)", fontSize: 11, fontWeight: 400 }}>· {a.duration}min</span>
      </div>
      <div style={{ fontWeight: 700, margin: "6px 0 2px", fontSize: 14.5, display: "flex", alignItems: "center", gap: 6 }}>
        {a.clientName} {isMensalista && <span title="Mensalista">👑</span>}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--silver-dim)" }}>
        {a.isBlock ? "Bloqueio" : getServiceName(a.serviceId)} — {getBarberName(a.barberId)}
      </div>
      <div style={{ marginTop: 8 }}><span className={`badge badge-${a.status}`}>{statusLabel(a.status)}</span></div>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {a.status === "confirmado" && !a.isBlock && <button className="icon-btn" title="Concluir" onClick={() => onComplete(a)}><Check size={13} /></button>}
        {!a.isBlock && <button className="icon-btn" title="Editar" onClick={() => onEdit(a)}><PencilSimple size={13} /></button>}
        <button className="icon-btn" title="Cancelar" onClick={() => onCancel(a.id)}><XIcon size={13} /></button>
      </div>
    </div>
  );
}

function DayView({ items, onComplete, onCancel, onEdit, getBarberName, getServiceName, onDragStart, onDrop, activeClientIds }) {
  const sorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
  if (sorted.length === 0) return <div className="empty-state">Nenhum agendamento nesse dia.</div>;
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(null)}
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14 }}
    >
      {sorted.map((a) => (
        <div key={a.id} draggable onDragStart={() => onDragStart(a.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.stopPropagation(); onDrop(a.time); }}>
          <AppointmentCard a={a} getBarberName={getBarberName} getServiceName={getServiceName} onComplete={onComplete} onCancel={onCancel} onEdit={onEdit} draggable onDragStart={onDragStart} isMensalista={activeClientIds?.includes(a.clientId)} />
        </div>
      ))}
      <div style={{ fontSize: 11.5, color: "var(--silver-dim)", gridColumn: "1/-1", marginTop: 4 }}>
        Dica: arraste um card sobre outro para trocar o horário entre os dois agendamentos.
      </div>
    </div>
  );
}

function WeekView({ items, baseDate, getBarberName, getServiceName, onEdit, onDragStart, onDrop, activeClientIds }) {
  const d = isoToDate(baseDate);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = addDaysISO(baseDate, diffToMonday);
  const days = Array.from({ length: 7 }).map((_, i) => addDaysISO(start, i));
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }}>
      {days.map((dt, i) => {
        const dayItems = items.filter((a) => a.date === dt).sort((a, b) => a.time.localeCompare(b.time));
        return (
          <div key={dt} className="week-col" onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(dt, dayItems[0]?.time || "09:00")}
            style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 10, minHeight: 120 }}>
            <h4 style={{ fontSize: 12, color: "var(--silver-dim)", textTransform: "uppercase", margin: "0 0 10px", paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
              {labels[i]} {dt.slice(8, 10)}/{dt.slice(5, 7)}
            </h4>
            {dayItems.length === 0 ? <div style={{ fontSize: 11, color: "var(--silver-dim)" }}>—</div> : dayItems.map((a) => (
              <div key={a.id} draggable onDragStart={() => onDragStart(a.id)} onClick={() => onEdit(a)}
                className="mini-booking" style={{ fontSize: 11.5, padding: "6px 8px", borderRadius: 7, background: "rgba(205,164,78,0.1)", border: "1px solid var(--line-gold)", marginBottom: 6, cursor: "pointer" }}>
                <b>{a.time}</b> {a.clientName}{activeClientIds?.includes(a.clientId) ? " 👑" : ""}{a.isBlock ? " (bloq.)" : ""}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function MonthView({ items, baseDate, onGotoDay }) {
  const d = isoToDate(baseDate);
  const year = d.getFullYear(), month = d.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const today = todayISO();

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
        {labels.map((l) => <div key={l} style={{ fontSize: 11, color: "var(--silver-dim)", textAlign: "center", paddingBottom: 4 }}>{l}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} style={{ border: "1px solid var(--line)", borderRadius: 10, opacity: 0.25, minHeight: 78 }} />;
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = items.filter((a) => a.date === iso).length;
          return (
            <div key={idx} onClick={() => onGotoDay(iso)}
              style={{ border: `1px solid ${iso === today ? "var(--gold)" : "var(--line)"}`, borderRadius: 10, padding: 8, minHeight: 78, fontSize: 11.5, cursor: "pointer" }}>
              <div style={{ color: "var(--silver-dim)", fontWeight: 700, marginBottom: 4 }}>{day}</div>
              {count > 0 && <div className="mono" style={{ color: "var(--gold)", fontSize: 11 }}>{count} agend.</div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
