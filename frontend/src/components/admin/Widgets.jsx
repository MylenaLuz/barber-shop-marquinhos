import { motion } from "framer-motion";

export function StatCard({ label, value, small, icon: Icon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 12, color: "var(--silver-dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</div>
        {Icon && <Icon size={16} color="var(--gold)" />}
      </div>
      <div style={{ fontFamily: "'Bebas Neue'", fontSize: small ? 20 : 30, color: small ? "var(--off)" : "var(--gold)" }}>{value}</div>
    </motion.div>
  );
}

export function Panel({ title, action, children }) {
  return (
    <div className="glass" style={{ padding: 24, marginBottom: 22 }}>
      {(title || action) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
          {title && <h3 style={{ fontSize: 19, margin: 0, fontFamily: "Manrope", fontWeight: 800 }}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-strong"
      style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "14px 22px", zIndex: 300, fontSize: 14, fontWeight: 700, color: "var(--gold-2)" }}
    >
      {message}
    </motion.div>
  );
}
