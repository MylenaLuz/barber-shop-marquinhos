import { useEffect, useState } from "react";
import { Check, X as XIcon, Phone } from "@phosphor-icons/react";
import { PlanRequestsAPI } from "../../services/resources";
import { Panel } from "./Widgets";
import { formatBRL, formatDateBR } from "../../services/format";

export default function PlanRequestsManager({ onToast, onActivated }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pendente");

  async function load() {
    setRequests(await PlanRequestsAPI.list(filter === "all" ? undefined : filter));
  }
  useEffect(() => { load(); }, [filter]);

  async function activate(id) {
    try {
      await PlanRequestsAPI.activate(id);
      onToast("Plano ativado a partir da solicitação.");
      load();
      onActivated?.();
    } catch (e) {
      onToast(e?.response?.data?.error || "Não foi possível ativar.");
    }
  }
  async function dismiss(id) {
    await PlanRequestsAPI.dismiss(id);
    onToast("Solicitação recusada.");
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["pendente", "Pendentes"], ["ativado", "Ativadas"], ["recusado", "Recusadas"], ["all", "Todas"]].map(([v, l]) => (
          <button key={v} className={`tab-btn ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      <Panel>
        {requests.length === 0 ? (
          <div className="empty-state">Nenhuma solicitação {filter === "pendente" ? "pendente" : ""} no momento.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {["Cliente", "Plano", "Valor", "Data", "Status", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontWeight: 700 }}>{r.name}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--silver-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone size={11} /> {r.phone}
                    </div>
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{r.planName}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{formatBRL(r.planPrice)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{formatDateBR(r.createdAt.slice(0, 10))}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className={`badge ${r.status === "ativado" ? "badge-concluido" : r.status === "recusado" ? "badge-cancelado" : "badge-confirmado"}`}>
                      {r.status === "ativado" ? "Ativado" : r.status === "recusado" ? "Recusado" : "Pendente"}
                    </span>
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                    {r.status === "pendente" && (
                      <>
                        <button className="icon-btn" title="Ativar (já recebi o pagamento)" onClick={() => activate(r.id)}><Check size={13} /></button>
                        <button className="icon-btn" title="Recusar" onClick={() => dismiss(r.id)}><XIcon size={13} /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <style>{`
        .icon-btn{ width:30px; height:30px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; justify-content:center; color:var(--silver); margin-right:4px; }
        .icon-btn:hover{ border-color:var(--line-gold); color:var(--gold); }
        .tab-btn{ padding:8px 16px; border-radius:999px; border:1px solid var(--line); font-size:13px; font-weight:600; color:var(--silver-dim); background:transparent; }
        .tab-btn.active{ background:var(--gold); color:#191305; border-color:var(--gold); }
      `}</style>
    </div>
  );
}
