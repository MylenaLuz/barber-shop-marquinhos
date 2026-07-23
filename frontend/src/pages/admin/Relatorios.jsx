import { useEffect, useState } from "react";
import { DashboardAPI } from "../../services/resources";
import { Panel } from "../../components/admin/Widgets";
import { formatBRL, formatDateBR } from "../../services/format";

export default function Relatorios() {
  const [period, setPeriod] = useState("hoje");
  const [data, setData] = useState(null);

  useEffect(() => { DashboardAPI.reports(period).then(setData); }, [period]);

  if (!data) return null;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 30 }}>Relatórios</h2>
        <div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>{formatDateBR(data.start)} — {formatDateBR(data.end)}</div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
        {[["hoje", "Hoje"], ["semana", "Semana"], ["mes", "Mês"]].map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} className={`tab-btn ${period === v ? "active" : ""}`}>{l}</button>
        ))}
      </div>

      <Panel title="Resumo">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <tbody>
            <Row k="Quantidade de atendimentos concluídos" v={data.count} />
            <Row k="Receita total" v={formatBRL(data.receitaTotal)} />
            {Object.values(data.porBarbeiro).map((b) => (
              <Row key={b.name} k={`Receita — ${b.name}`} v={formatBRL(b.total)} />
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="Serviços realizados">
        {Object.keys(data.porServico).length === 0 ? (
          <div className="empty-state">Nenhum atendimento concluído no período.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>Serviço</th>
                <th style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.porServico).map(([name, count]) => (
                <tr key={name}>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{name}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <style>{`.tab-btn{ padding:8px 16px; border-radius:999px; border:1px solid var(--line); font-size:13px; font-weight:600; color:var(--silver-dim); background:transparent; } .tab-btn.active{ background:var(--gold); color:#191305; border-color:var(--gold); }`}</style>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <tr>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "var(--silver)" }}>{k}</td>
      <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{v}</td>
    </tr>
  );
}
