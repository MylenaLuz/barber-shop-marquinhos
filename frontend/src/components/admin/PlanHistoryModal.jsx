import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle } from "@phosphor-icons/react";
import { ClientPlansAPI } from "../../services/resources";
import { formatDateBR } from "../../services/format";

export default function PlanHistoryModal({ clientPlanId, clientName, onClose }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    if (clientPlanId) ClientPlansAPI.history(clientPlanId).then(setHistory);
  }, [clientPlanId]);

  if (!clientPlanId) return null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(6,6,8,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong"
        style={{ width: "100%", maxWidth: 460, maxHeight: "80vh", overflowY: "auto", padding: 28, position: "relative" }}
      >
        <button onClick={onClose} className="glass" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={15} />
        </button>
        <div style={{ fontSize: 12, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Histórico de consumo</div>
        <h3 style={{ marginBottom: 20 }}>{clientName}</h3>

        {history === null ? null : history.length === 0 ? (
          <div className="empty-state">Nenhum crédito consumido ainda.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {history.map((h) => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(255,255,255,0.02)" }}>
                <CheckCircle size={18} color="var(--ok)" weight="fill" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{h.serviceType}</div>
                  <div style={{ fontSize: 11.5, color: "var(--silver-dim)" }}>{formatDateBR(h.appointmentDate || h.consumedAt.slice(0, 10))}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
