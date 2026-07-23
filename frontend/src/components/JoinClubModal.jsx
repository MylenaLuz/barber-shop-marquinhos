import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, Crown } from "@phosphor-icons/react";
import { PlanRequestsAPI } from "../services/resources";
import { formatBRL } from "../services/format";

export default function JoinClubModal({ plan, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setName("");
    setPhone("");
    setError("");
    setDone(false);
  }, [plan]);

  if (!plan) return null;

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      await PlanRequestsAPI.createPublic({ name, phone, planId: plan.id });
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.error || "Não foi possível enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(6,6,8,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong"
        style={{ width: "100%", maxWidth: 440, padding: 30, position: "relative" }}
      >
        <button onClick={onClose} className="glass" style={{ position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={16} />
        </button>

        {!done ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Crown size={16} color="var(--gold)" weight="fill" />
              <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Marquinhos Club</span>
            </div>
            <h3 style={{ marginBottom: 6 }}>{plan.name}</h3>
            <div style={{ fontSize: 13, color: "var(--silver-dim)", marginBottom: 22 }}>{formatBRL(plan.price)} — pagamento presencial na barbearia</div>

            <div className="field">
              <label>Nome completo</label>
              <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Telefone / WhatsApp</label>
              <input type="tel" placeholder="(41) 90000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <p style={{ fontSize: 12, color: "var(--silver-dim)", lineHeight: 1.6, marginBottom: 18 }}>
              Ao confirmar, o Marcos recebe seu interesse e finaliza a contratação com você — o pagamento é feito
              direto na barbearia.
            </p>
            {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}
            <button className="btn btn-gold btn-block" onClick={submit} disabled={!name.trim() || !phone.trim() || submitting}>
              {submitting ? "Enviando..." : "Confirmar interesse"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(111,174,124,0.15)", border: "1px solid var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <CheckCircle size={30} color="var(--ok)" weight="bold" />
            </div>
            <h3>Interesse recebido!</h3>
            <p style={{ color: "var(--silver-dim)", fontSize: 14.5 }}>Em breve entramos em contato pra finalizar a contratação e o pagamento na barbearia.</p>
            <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={onClose}>Fechar</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
