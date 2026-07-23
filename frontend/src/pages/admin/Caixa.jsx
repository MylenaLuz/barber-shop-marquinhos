import { useEffect, useState } from "react";
import { Trash } from "@phosphor-icons/react";
import { DashboardAPI, TransactionsAPI } from "../../services/resources";
import { StatCard, Panel, Toast } from "../../components/admin/Widgets";
import { formatBRL, formatDateBR, todayISO } from "../../services/format";
import { useToast } from "../../hooks/useToast";

const EMPTY = { desc: "", value: "", date: todayISO() };

export default function Caixa() {
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const { message, show } = useToast();

  async function load() { setSummary(await DashboardAPI.caixa()); }
  useEffect(() => { load(); }, []);

  async function addExpense() {
    if (!form.desc || !form.value) { show("Preencha descrição e valor."); return; }
    await TransactionsAPI.createExpense({ description: form.desc, value: Number(form.value), date: form.date });
    setForm(EMPTY);
    show("Despesa lançada.");
    load();
  }
  async function remove(id) { await TransactionsAPI.remove(id); load(); }

  if (!summary) return null;

  const entries = [...summary.entries].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 30 }}>Caixa</h2>
        <div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>Controle de receitas e despesas</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }} className="stat-grid">
        <StatCard label="Saldo do dia" value={formatBRL(summary.receitasHoje - summary.despesasHoje)} />
        <StatCard label="Saldo do mês" value={formatBRL(summary.receitasMes - summary.despesasMes)} />
        <StatCard label="Despesas do mês" value={formatBRL(summary.despesasMes)} small />
        <StatCard label="Saldo total" value={formatBRL(summary.saldoTotal)} />
      </div>

      <Panel title="Lançar despesa">
        <div className="field-row">
          <div className="field"><label>Descrição</label><input type="text" placeholder="Ex: Produtos de limpeza" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></div>
          <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <div className="field"><label>Data</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        </div>
        <button className="btn btn-gold" onClick={addExpense}>+ Adicionar despesa</button>
      </Panel>

      <Panel title="Movimentações">
        {entries.length === 0 ? (
          <div className="empty-state">Nenhuma movimentação ainda.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {["Data", "Tipo", "Descrição", "Valor", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((c) => (
                <tr key={c.id}>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{formatDateBR(c.date)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span className={`badge ${c.type === "receita" ? "badge-concluido" : "badge-cancelado"}`}>{c.type === "receita" ? "Receita" : "Despesa"}</span>
                  </td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{c.description}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{c.type === "receita" ? "+" : "-"} {formatBRL(c.value)}</td>
                  <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {c.type === "despesa" && <button className="icon-btn" title="Excluir" onClick={() => remove(c.id)}><Trash size={13} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      <Toast message={message} />
      <style>{`
        .icon-btn{ width:30px; height:30px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; justify-content:center; color:var(--silver); }
        .icon-btn:hover{ border-color:var(--line-gold); color:var(--gold); }
        @media (max-width: 980px){ .stat-grid{ grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
