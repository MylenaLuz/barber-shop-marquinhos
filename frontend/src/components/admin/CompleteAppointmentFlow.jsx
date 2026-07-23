import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Crown } from "@phosphor-icons/react";
import { ClientPlansAPI, AppointmentsAPI } from "../../services/resources";

/**
 * Ao clicar em "Concluir" num agendamento, primeiro checamos se o cliente
 * tem um plano de mensalista ativo. Se tiver, mostramos este modal
 * perguntando qual crédito consumir (ou nenhum). Se não tiver plano,
 * concluímos direto sem mostrar nada — comportamento idêntico ao anterior.
 */
export default function CompleteAppointmentFlow({ appointment, onDone, onClose }) {
  const [checking, setChecking] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!appointment?.clientId) {
        // sem clientId (ex: registrado só com telefone antigo) — conclui direto
        const result = await AppointmentsAPI.complete(appointment.id);
        if (!cancelled) onDone(result);
        return;
      }
      try {
        const active = await ClientPlansAPI.activeForClient(appointment.clientId);
        if (cancelled) return;
        if (!active) {
          const result = await AppointmentsAPI.complete(appointment.id);
          if (!cancelled) onDone(result);
        } else {
          setActivePlan(active);
          setChecking(false);
        }
      } catch (e) {
        if (!cancelled) {
          const result = await AppointmentsAPI.complete(appointment.id);
          onDone(result);
        }
      }
    }
    check();
    return () => { cancelled = true; };
  }, [appointment]);

  async function confirmConsume() {
    setSubmitting(true);
    setError("");
    try {
      const result = await AppointmentsAPI.complete(appointment.id, selected);
      onDone(result);
    } catch (e) {
      setError(e?.response?.data?.error || "Não foi possível concluir.");
      setSubmitting(false);
    }
  }

  async function skipCredit() {
    setSubmitting(true);
    setError("");
    try {
      const result = await AppointmentsAPI.complete(appointment.id);
      onDone(result);
    } catch (e) {
      setError(e?.response?.data?.error || "Não foi possível concluir.");
      setSubmitting(false);
    }
  }

  if (checking) return null; // resolve sozinho sem UI na maioria dos casos

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(6,6,8,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 220, padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong"
        style={{ width: "100%", maxWidth: 440, padding: 28, position: "relative" }}
      >
        <button onClick={onClose} className="glass" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <Crown size={18} color="var(--gold)" weight="fill" />
          <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Cliente possui plano ativo</span>
        </div>
        <h3 style={{ marginBottom: 18 }}>Qual serviço deseja consumir?</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
          {activePlan.credits.map((c) => {
            const disabled = c.remainingQuantity <= 0;
            return (
              <button
                key={c.serviceType}
                disabled={disabled}
                onClick={() => setSelected(c.serviceType)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px", borderRadius: 11,
                  border: `1px solid ${selected === c.serviceType ? "var(--gold)" : "var(--line)"}`,
                  background: selected === c.serviceType ? "rgba(205,164,78,0.12)" : "rgba(255,255,255,0.02)",
                  opacity: disabled ? 0.4 : 1, color: "var(--off)", textAlign: "left",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14.5 }}>{c.serviceType}</span>
                <span className="mono" style={{ fontSize: 13, color: "var(--gold)" }}>{c.remainingQuantity} / {c.totalQuantity}</span>
              </button>
            );
          })}
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button className="btn btn-ghost" onClick={skipCredit} disabled={submitting}>Concluir sem consumir</button>
          <button className="btn btn-gold" onClick={confirmConsume} disabled={submitting || !selected}>
            {submitting ? "Confirmando..." : "Consumir crédito"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
