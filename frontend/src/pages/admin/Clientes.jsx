import { useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { ClientsAPI } from "../../services/resources";
import { Panel } from "../../components/admin/Widgets";
import { formatDateBR } from "../../services/format";

export default function Clientes() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => { ClientsAPI.list().then(setClients); }, []);

  const filtered = clients.filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || (c.phone || "").includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 30 }}>Clientes</h2>
        <div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>Cadastro automático a partir dos agendamentos</div>
      </div>

      <Panel>
        <div className="field" style={{ maxWidth: 340, position: "relative" }}>
          <input type="text" placeholder="Buscar por nome ou telefone" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
          <MagnifyingGlass size={15} style={{ position: "absolute", left: 12, top: 38, color: "var(--silver-dim)" }} />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">Nenhum cliente encontrado.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {["Nome", "Telefone", "Último atendimento", "Agendamentos"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{c.name}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{c.phone || "—"}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{formatDateBR(c.lastVisit)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{c.appointmentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
