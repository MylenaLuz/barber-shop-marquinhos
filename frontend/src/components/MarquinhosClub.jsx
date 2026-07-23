import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check } from "@phosphor-icons/react";
import { PlansAPI } from "../services/resources";
import { formatBRL } from "../services/format";

export default function MarquinhosClub({ onJoin }) {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    PlansAPI.listPublic().then(setPlans).catch(() => setPlans([]));
  }, []);

  if (plans.length === 0) return null;

  return (
    <section id="club" className="section">
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow"><Crown size={13} weight="fill" style={{ marginRight: 4, verticalAlign: "-1px" }} /> Marquinhos Club</div>
          <h2 className="h-serif">Assinatura pra quem vem sempre</h2>
          <p>
            Feche um pacote de créditos e economize em cada visita. A contratação é feita aqui pelo site — o
            pagamento é sempre presencial, direto na barbearia.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="club-grid">
          {plans.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass club-card-hover"
              style={{ padding: 24, display: "flex", flexDirection: "column" }}
            >
              <div className="h-serif" style={{ fontSize: 21, marginBottom: 6 }}>{p.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 18 }}>
                <span style={{ fontFamily: "'Bebas Neue'", fontSize: 30, color: "var(--gold)" }}>{formatBRL(p.price)}</span>
                <span style={{ fontSize: 11.5, color: "var(--silver-dim)" }}>/ {p.validityDays} dias</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22, flex: 1 }}>
                {p.credits.map((c) => (
                  <div key={c.serviceType} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--silver)" }}>
                    <Check size={14} color="var(--gold)" weight="bold" /> {c.quantity}x {c.serviceType}
                  </div>
                ))}
              </div>
              <button className="btn btn-gold btn-block" onClick={() => onJoin(p)}>Quero contratar</button>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 12.5, color: "var(--silver-dim)" }}>
          * O pagamento da mensalidade é feito presencialmente na barbearia, direto com o Marcos.
        </div>
      </div>
      <style>{`
        @media (max-width: 980px){ .club-grid{ grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width: 620px){ .club-grid{ grid-template-columns:1fr !important; } }
        .club-card-hover{ transition: transform .2s ease, border-color .2s ease; }
        .club-card-hover:hover{ transform: translateY(-4px); border-color: var(--line-gold); }
      `}</style>
    </section>
  );
}
