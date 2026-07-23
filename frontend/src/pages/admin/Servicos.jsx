import { useEffect, useState } from "react";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import { ServicesAPI } from "../../services/resources";
import { Panel, Toast } from "../../components/admin/Widgets";
import { formatBRL } from "../../services/format";
import { useToast } from "../../hooks/useToast";

const EMPTY = { name: "", description: "", price: "", duration: "", image: "/images/services/default.jpg" };

export default function Servicos() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null); // objeto do form, ou null
  const { message, show } = useToast();

  async function load() { setServices(await ServicesAPI.list()); }
  useEffect(() => { load(); }, []);

  function startNew() { setEditing({ ...EMPTY }); }
  function startEdit(s) { setEditing({ ...s }); }

  async function save() {
    if (!editing.name || !editing.price || !editing.duration) { show("Preencha nome, valor e duração."); return; }
    if (editing.id) await ServicesAPI.update(editing.id, editing);
    else await ServicesAPI.create(editing);
    setEditing(null);
    show("Serviço salvo.");
    load();
  }
  async function remove(id) {
    await ServicesAPI.remove(id);
    show("Serviço removido.");
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div><h2 style={{ fontSize: 30 }}>Serviços</h2><div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>Edite nome, valor, duração e imagem</div></div>
        <button className="btn btn-gold" onClick={startNew}><Plus size={15} /> Novo serviço</button>
      </div>

      {editing && (
        <Panel title={editing.id ? "Editar serviço" : "Novo serviço"}>
          <div className="field-row">
            <div className="field"><label>Nome</label><input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="field"><label>Imagem (caminho em /public)</label><input type="text" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></div>
          </div>
          <div className="field"><label>Descrição</label><input type="text" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div className="field-row">
            <div className="field"><label>Valor (R$)</label><input type="number" step="0.01" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} /></div>
            <div className="field"><label>Duração (min)</label><input type="number" step="5" value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="btn btn-gold" onClick={save}>Salvar</button>
          </div>
        </Panel>
      )}

      <Panel>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr>
              {["", "Nome", "Valor", "Duração", ""].map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "10px 12px", color: "var(--silver-dim)", fontSize: 11.5, textTransform: "uppercase", borderBottom: "1px solid var(--line)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.05)", width: 56 }}>
                  <img src={s.image} alt={s.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{s.name}</td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{formatBRL(s.price)}</td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }} className="mono">{s.duration} min</td>
                <td style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                  <button className="icon-btn" title="Editar" onClick={() => startEdit(s)}><PencilSimple size={13} /></button>
                  <button className="icon-btn" title="Excluir" onClick={() => remove(s.id)}><Trash size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Toast message={message} />
      <style>{`.icon-btn{ width:30px; height:30px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,0.02); display:inline-flex; align-items:center; justify-content:center; color:var(--silver); margin-right:4px; } .icon-btn:hover{ border-color:var(--line-gold); color:var(--gold); }`}</style>
    </div>
  );
}
