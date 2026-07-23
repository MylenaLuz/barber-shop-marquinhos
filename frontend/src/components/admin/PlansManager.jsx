import { useEffect, useState } from "react";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { PlansAPI } from "../../services/resources";
import { Panel } from "./Widgets";
import { formatBRL } from "../../services/format";

const EMPTY = { name: "", price: "", validityDays: 30, credits: [{ serviceType: "Corte", quantity: 1 }] };

export default function PlansManager({ onToast }) {
  const [plans, setPlans] = useState([]);
  const [editing, setEditing] = useState(null);

  async function load() { setPlans(await PlansAPI.list(true)); }
  useEffect(() => { load(); }, []);

  function startNew() { setEditing({ ...EMPTY, credits: [{ serviceType: "Corte", quantity: 1 }] }); }
  function startEdit(p) { setEditing({ ...p, price: p.price, credits: p.credits.map((c) => ({ ...c })) }); }

  function updateCredit(idx, field, value) {
    const credits = [...editing.credits];
    credits[idx] = { ...credits[idx], [field]: value };
    setEditing({ ...editing, credits });
  }
  function addCreditRow() {
    setEditing({ ...editing, credits: [...editing.credits, { serviceType: "", quantity: 1 }] });
  }
  function removeCreditRow(idx) {
    setEditing({ ...editing, credits: editing.credits.filter((_, i) => i !== idx) });
  }

  async function save() {
    const credits = editing.credits.filter((c) => c.serviceType.trim() && c.quantity > 0);
    if (!editing.name || !editing.price || credits.length === 0) {
      onToast("Preencha nome, valor e ao menos um crédito válido.");
      return;
    }
    const payload = { name: editing.name, price: Number(editing.price), validityDays: Number(editing.validityDays) || 30, credits };
    if (editing.id) await PlansAPI.update(editing.id, payload);
    else await PlansAPI.create(payload);
    setEditing(null);
    onToast("Plano salvo.");
    load();
  }

  async function toggleActive(p) {
    await PlansAPI.update(p.id, { active: !p.active });
    load();
  }

  async function remove(id) {
    try {
      await PlansAPI.remove(id);
      onToast("Plano removido.");
      load();
    } catch (e) {
      onToast(e?.response?.data?.error || "Não foi possível remover este plano.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn btn-gold" onClick={startNew}><Plus size={15} /> Novo plano</button>
      </div>

      {editing && (
        <Panel title={editing.id ? "Editar plano" : "Novo plano"}>
          <div className="field-row">
            <div className="field"><label>Nome do plano</label><input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
          </div>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Validade (dias)</label>
            <input type="number" step="1" value={editing.validityDays} onChange={(e) => setEditing({ ...editing, validityDays: e.target.value })} />
          </div>

          <label style={{ display: "block", fontSize: 12.5, color: "var(--silver-dim)", marginBottom: 8, fontWeight: 600 }}>Créditos incluídos</label>
          {editing.credits.map((c, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px 34px", gap: 10, marginBottom: 10, alignItems: "center" }}>
              <input type="text" placeholder="Ex: Corte, Barba, Sobrancelha" value={c.serviceType} onChange={(e) => updateCredit(idx, "serviceType", e.target.value)} />
              <input type="number" min="1" value={c.quantity} onChange={(e) => updateCredit(idx, "quantity", Number(e.target.value))} />
              <button className="icon-btn" onClick={() => removeCreditRow(idx)} title="Remover"><Trash size={13} /></button>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" onClick={addCreditRow} style={{ marginBottom: 18 }}>+ Adicionar crédito</button>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn btn-gold" onClick={save}>Salvar</button>
          </div>
        </Panel>
      )}

      <Panel>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr>
              {["Nome", "Créditos", "Valor", "Validade", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} style={{ opacity: p.active ? 1 : 0.5 }}>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{p.name}</td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 12.5, color: "var(--silver-dim)" }}>
                  {p.credits.map((c) => `${c.quantity}x ${c.serviceType}`).join(" · ")}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{formatBRL(p.price)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{p.validityDays}d</td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <button className="tag" style={{ cursor: "pointer" }} onClick={() => toggleActive(p)}>{p.active ? "Ativo" : "Inativo"}</button>
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                  <button className="icon-btn" title="Editar" onClick={() => startEdit(p)}><PencilSimple size={13} /></button>
                  <button className="icon-btn" title="Excluir" onClick={() => remove(p.id)}><Trash size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <style>{`.icon-btn{ width:30px; height:30px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; justify-content:center; color:var(--silver); margin-right:4px; } .icon-btn:hover{ border-color:var(--line-gold); color:var(--gold); }`}</style>
    </div>
  );
}
