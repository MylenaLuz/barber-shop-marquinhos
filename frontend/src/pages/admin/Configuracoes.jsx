import { useEffect, useState } from "react";
import { SettingsAPI, BarbersAPI, AuthAPI } from "../../services/resources";
import { Panel, Toast } from "../../components/admin/Widgets";
import { useToast } from "../../hooks/useToast";
import { WEEKDAY_ORDER, WEEKDAY_LABELS } from "../../services/format";
import { useSiteData } from "../../context/SiteDataContext";

export default function Configuracoes() {
  const { reload } = useSiteData();
  const [form, setForm] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [passForm, setPassForm] = useState({ current: "", next: "" });
  const { message, show } = useToast();

  useEffect(() => {
    SettingsAPI.get().then(setForm);
    BarbersAPI.list().then(setBarbers);
  }, []);

  function updateHour(day, field, value) {
    setForm({ ...form, hours: { ...form.hours, [day]: { ...form.hours[day], [field]: value } } });
  }

  async function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, logo: reader.result });
    reader.readAsDataURL(file);
  }

  async function saveSettings() {
    await SettingsAPI.update(form);
    show("Configurações salvas.");
    reload();
  }

  async function saveBarber(b) {
    await BarbersAPI.update(b.id, b);
    show("Barbeiro atualizado.");
    reload();
  }

  async function changePassword() {
    if (!passForm.current || !passForm.next) { show("Preencha os dois campos."); return; }
    try {
      await AuthAPI.changePassword(passForm.current, passForm.next);
      setPassForm({ current: "", next: "" });
      show("Senha alterada.");
    } catch (e) {
      show(e?.response?.data?.error || "Não foi possível alterar a senha.");
    }
  }

  if (!form) return null;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 30 }}>Configurações</h2>
        <div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>Dados da barbearia</div>
      </div>

      <Panel title="Identidade">
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 18 }}>
          <img src={form.logo} style={{ height: 56, width: 56, objectFit: "contain", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(255,255,255,0.03)" }} alt="logo" />
          <div>
            <input type="file" id="logo-input" accept="image/*" style={{ display: "none" }} onChange={handleLogoChange} />
            <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById("logo-input").click()}>Trocar logo</button>
          </div>
        </div>
        <div className="field-row">
          <div className="field"><label>Nome da barbearia</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Telefone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>WhatsApp (só números, com DDI)</label><input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
          <div className="field"><label>Instagram (usuário)</label><input type="text" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
        </div>
        <div className="field"><label>Endereço</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
      </Panel>

      <Panel title="Horário de funcionamento">
        {WEEKDAY_ORDER.map((k) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "110px 1fr 1fr 110px", gap: 12, alignItems: "center", marginBottom: 10 }} className="hour-row">
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{WEEKDAY_LABELS[k]}</div>
            <input type="time" value={form.hours[k].open} disabled={form.hours[k].closed} onChange={(e) => updateHour(k, "open", e.target.value)} />
            <input type="time" value={form.hours[k].close} disabled={form.hours[k].closed} onChange={(e) => updateHour(k, "close", e.target.value)} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--silver-dim)" }}>
              <input type="checkbox" checked={form.hours[k].closed} onChange={(e) => updateHour(k, "closed", e.target.checked)} /> Fechado
            </label>
          </div>
        ))}
      </Panel>

      <Panel title="Barbeiros">
        {barbers.map((b) => (
          <BarberEditRow key={b.id} barber={b} onSave={saveBarber} />
        ))}
      </Panel>

      <Panel title="Segurança">
        <div className="field-row">
          <div className="field"><label>Senha atual</label><input type="password" value={passForm.current} onChange={(e) => setPassForm({ ...passForm, current: e.target.value })} /></div>
          <div className="field"><label>Nova senha</label><input type="password" value={passForm.next} onChange={(e) => setPassForm({ ...passForm, next: e.target.value })} /></div>
        </div>
        <button className="btn btn-ghost" onClick={changePassword}>Alterar senha</button>
      </Panel>

      <button className="btn btn-gold" onClick={saveSettings}>Salvar alterações</button>
      <Toast message={message} />
      <style>{`@media (max-width: 700px){ .hour-row{ grid-template-columns:90px 1fr 1fr !important; } }`}</style>
    </div>
  );
}

function BarberEditRow({ barber, onSave }) {
  const [b, setB] = useState(barber);
  const [dirty, setDirty] = useState(false);

  function set(field, value) { setB({ ...b, [field]: value }); setDirty(true); }
  function setTags(value) { setB({ ...b, tags: value.split(",").map((t) => t.trim()).filter(Boolean) }); setDirty(true); }

  return (
    <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: 18, marginBottom: 18 }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 12 }}>
        <img src={b.photo} alt={b.name} style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover" }} />
        <div style={{ fontWeight: 700 }}>{b.name}</div>
      </div>
      <div className="field-row">
        <div className="field"><label>Nome</label><input type="text" value={b.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="field"><label>Cargo</label><input type="text" value={b.role} onChange={(e) => set("role", e.target.value)} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Anos de experiência</label><input type="number" value={b.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} /></div>
        <div className="field"><label>Instagram (opcional)</label><input type="text" value={b.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
      </div>
      <div className="field"><label>Especialidades (separadas por vírgula)</label><input type="text" value={(b.tags || []).join(", ")} onChange={(e) => setTags(e.target.value)} /></div>
      <div className="field"><label>Foto (caminho em /public/images/barbers)</label><input type="text" value={b.photo} onChange={(e) => set("photo", e.target.value)} /></div>
      {dirty && <button className="btn btn-ghost btn-sm" onClick={() => { onSave(b); setDirty(false); }}>Salvar {b.name.split(" ")[0]}</button>}
    </div>
  );
}
