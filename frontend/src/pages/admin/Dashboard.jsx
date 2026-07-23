import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarBlank, Clock, CurrencyDollar, Users, Plus, Check, X as XIcon } from "@phosphor-icons/react";
import { DashboardAPI, AppointmentsAPI } from "../../services/resources";
import { StatCard, Panel } from "../../components/admin/Widgets";
import { formatBRL, formatDateLong, statusLabel } from "../../services/format";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../../components/admin/Widgets";
import NewAppointmentModal from "../../components/admin/NewAppointmentModal";
import CompleteAppointmentFlow from "../../components/admin/CompleteAppointmentFlow";
import { useSiteData } from "../../context/SiteDataContext";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [completing, setCompleting] = useState(null);
  const { message, show } = useToast();
  const { getBarberName, getServiceName } = useSiteData();

  async function load() {
    const d = await DashboardAPI.home();
    setData(d);
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    await AppointmentsAPI.cancel(id);
    show("Agendamento cancelado.");
    load();
  }

  if (!data) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 30 }}>Olá 👋</h2>
          <div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>{formatDateLong(data.today)}</div>
        </div>
        <button className="btn btn-gold" onClick={() => setNewOpen(true)}><Plus size={15} /> Novo agendamento</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }} className="stat-grid">
        <StatCard label="Agendamentos hoje" value={data.count} icon={CalendarBlank} />
        <StatCard label="Próximo atendimento" value={data.next ? `${data.next.time} · ${data.next.clientName}` : "—"} small icon={Clock} />
        <StatCard label="Previsto para hoje" value={formatBRL(data.previsto)} icon={CurrencyDollar} />
        <StatCard label="Clientes cadastrados" value={data.clientsCount} icon={Users} />
      </div>

      <Panel title="Agenda de hoje" action={<Link to="/admin/agenda" style={{ fontSize: 13, color: "var(--gold)" }}>Ver agenda completa →</Link>}>
        {data.appointments.length === 0 ? (
          <div className="empty-state">Nenhum agendamento para hoje.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {["Hora", "Cliente", "Serviço", "Barbeiro", "Status", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{a.time}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{a.clientName}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{a.isBlock ? "Bloqueio" : getServiceName(a.serviceId)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{getBarberName(a.barberId)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}><span className={`badge badge-${a.status}`}>{statusLabel(a.status)}</span></td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                    {a.status === "confirmado" && !a.isBlock && (
                      <button className="icon-btn" title="Concluir" onClick={() => setCompleting(a)}><Check size={13} /></button>
                    )}
                    {a.status !== "cancelado" && (
                      <button className="icon-btn" title="Cancelar" onClick={() => cancel(a.id)}><XIcon size={13} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      <NewAppointmentModal open={newOpen} onClose={() => setNewOpen(false)} onSaved={() => { setNewOpen(false); load(); show("Agendamento criado."); }} />
      {completing && (
        <CompleteAppointmentFlow
          appointment={completing}
          onClose={() => setCompleting(null)}
          onDone={() => { setCompleting(null); show("Atendimento concluído."); load(); }}
        />
      )}
      <Toast message={message} />

      <style>{`
        .icon-btn{ width:30px; height:30px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; justify-content:center; color:var(--silver); margin-right:4px; }
        .icon-btn:hover{ border-color:var(--line-gold); color:var(--gold); }
        @media (max-width: 980px){ .stat-grid{ grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
