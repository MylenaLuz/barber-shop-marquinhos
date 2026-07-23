import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { useSiteData } from "../../context/SiteDataContext";
import { AppointmentsAPI } from "../../services/resources";
import { todayISO } from "../../services/format";

export default function NewAppointmentModal({ open, onClose, onSaved, editing, defaultDate }) {
  const { barbers, services } = useSiteData();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        id: editing.id,
        barberId: editing.barberId,
        serviceId: editing.serviceId || services[0]?.id,
        date: editing.date,
        time: editing.time,
        clientName: editing.clientName,
        clientPhone: editing.clientPhone,
        isBlock: !!editing.isBlock,
        note: editing.note || "",
      });
    } else {
      setForm({
        barberId: barbers[0]?.id,
        serviceId: services[0]?.id,
        date: defaultDate || todayISO(),
        time: "",
        clientName: "",
        clientPhone: "",
        isBlock: false,
        note: "",
      });
    }
    setError("");
  }, [open, editing, defaultDate, barbers, services]);

  if (!open || !form) return null;

  async function handleSave() {
    setError("");
    if (!form.time || (!form.isBlock && !form.clientName.trim())) {
      setError("Preencha horário e nome do cliente.");
      return;
    }
    setSaving(true);
    try {
      if (form.id) {
        await AppointmentsAPI.update(form.id, {
          barberId: form.barberId,
          serviceId: form.isBlock ? null : form.serviceId,
          date: form.date,
          time: form.time,
          clientName: form.clientName,
          clientPhone: form.clientPhone,
        });
      } else {
        await AppointmentsAPI.createAdmin({
          barberId: form.barberId,
          serviceId: form.isBlock ? null : form.serviceId,
          date: form.date,
          time: form.time,
          clientName: form.isBlock ? form.clientName || "Bloqueado" : form.clientName,
          clientPhone: form.clientPhone,
          isBlock: form.isBlock,
          duration: form.isBlock ? 30 : undefined,
          note: form.note,
        });
      }
      onSaved();
    } catch (e) {
      setError(e?.response?.data?.error || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(6,6,8,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong"
        style={{ width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", padding: 28, position: "relative" }}
      >
        <button onClick={onClose} className="glass" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={15} />
        </button>
        <h3 style={{ marginBottom: 20 }}>{form.id ? "Editar agendamento" : "Novo agendamento"}</h3>

        {!form.id && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--silver-dim)", marginBottom: 16, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isBlock} onChange={(e) => setForm({ ...form, isBlock: e.target.checked })} />
            Isto é um bloqueio de horário (sem cliente)
          </label>
        )}

        <div className="field">
          <label>Barbeiro</label>
          <select value={form.barberId} onChange={(e) => setForm({ ...form, barberId: e.target.value })}>
            {barbers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {!form.isBlock && (
          <div className="field">
            <label>Serviço</label>
            <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.duration}min</option>)}
            </select>
          </div>
        )}

        <div className="field-row">
          <div className="field"><label>Data</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="field"><label>Horário</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
        </div>

        {form.isBlock ? (
          <div className="field">
            <label>Motivo (opcional)</label>
            <input type="text" placeholder="Ex: Almoço, compromisso pessoal" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        ) : (
          <div className="field-row">
            <div className="field"><label>Nome do cliente</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} /></div>
            <div className="field"><label>Telefone</label><input type="text" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} /></div>
          </div>
        )}

        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : (form.isBlock ? "Bloquear" : "Salvar")}</button>
        </div>
      </motion.div>
    </div>
  );
}
