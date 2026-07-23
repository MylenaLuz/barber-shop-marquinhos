import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { X, MagnifyingGlass, UserPlus } from "@phosphor-icons/react";
import { ClientsAPI, PlansAPI, ClientPlansAPI } from "../../services/resources";
import { formatBRL } from "../../services/format";

export default function ActivatePlanModal({ open, onClose, onActivated }) {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cadastro de cliente novo direto aqui (mensalista que ainda não tem
  // nenhum agendamento no sistema).
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (open) {
      ClientsAPI.list().then(setClients);
      PlansAPI.list().then(setPlans);
      setQuery(""); setClientId(null); setPlanId(null); setError("");
      setCreatingNew(false); setNewName(""); setNewPhone("");
    }
  }, [open]);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients.slice(0, 8);
    return clients.filter((c) => c.name.toLowerCase().includes(q) || (c.phone || "").includes(q)).slice(0, 8);
  }, [clients, query]);

  const selectedClient = clients.find((c) => c.id === clientId);

  async function handleActivate() {
    setSubmitting(true);
    setError("");
    try {
      let finalClientId = clientId;
      if (creatingNew) {
        if (!newName.trim() || !newPhone.trim()) {
          setError("Preencha nome e telefone do cliente.");
          setSubmitting(false);
          return;
        }
        const created = await ClientsAPI.create({ name: newName, phone: newPhone });
        finalClientId = created.id;
      }
      await ClientPlansAPI.activate(finalClientId, planId);
      onActivated();
    } catch (e) {
      setError(e?.response?.data?.error || "Não foi possível ativar o plano.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(6,6,8,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong"
        style={{ width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", padding: 28, position: "relative" }}
      >
        <button onClick={onClose} className="glass" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={15} />
        </button>
        <h3 style={{ marginBottom: 20 }}>Ativar plano para cliente</h3>

        <div className="field" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <label style={{ margin: 0 }}>Cliente</label>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setCreatingNew((v) => !v); setClientId(null); }}
              style={{ padding: "5px 11px" }}
            >
              <UserPlus size={13} /> {creatingNew ? "Buscar existente" : "Cliente novo"}
            </button>
          </div>

          {creatingNew ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input type="text" placeholder="Nome completo" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <input type="tel" placeholder="Telefone / WhatsApp" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            </div>
          ) : selectedClient ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--gold)", background: "rgba(205,164,78,0.1)" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedClient.name}</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--silver-dim)" }}>{selectedClient.phone}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setClientId(null)}>Trocar</button>
            </div>
          ) : (
            <>
              <input type="text" placeholder="Buscar por nome ou telefone" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
              <MagnifyingGlass size={15} style={{ position: "absolute", left: 12, top: 46, color: "var(--silver-dim)" }} />
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {filteredClients.length === 0 && (
                  <div style={{ fontSize: 12.5, color: "var(--silver-dim)", padding: "8px 4px" }}>
                    Nenhum cliente encontrado. Use "Cliente novo" acima pra cadastrar sem precisar de um agendamento.
                  </div>
                )}
                {filteredClients.map((c) => (
                  <button key={c.id} onClick={() => setClientId(c.id)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)", color: "var(--off)" }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: "var(--silver-dim)" }}>{c.phone}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="field">
          <label>Plano</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {plans.map((p) => (
              <button key={p.id} onClick={() => setPlanId(p.id)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10,
                border: `1px solid ${planId === p.id ? "var(--gold)" : "var(--line)"}`,
                background: planId === p.id ? "rgba(205,164,78,0.12)" : "rgba(255,255,255,0.02)", color: "var(--off)", textAlign: "left",
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--silver-dim)" }}>{p.credits.map((c) => `${c.quantity}x ${c.serviceType}`).join(" · ")} — {p.validityDays} dias</div>
                </div>
                <div className="mono" style={{ color: "var(--gold)", fontSize: 14 }}>{formatBRL(p.price)}</div>
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className="btn btn-gold"
            onClick={handleActivate}
            disabled={submitting || !planId || (creatingNew ? (!newName.trim() || !newPhone.trim()) : !clientId)}
          >
            {submitting ? "Ativando..." : "Ativar plano"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
