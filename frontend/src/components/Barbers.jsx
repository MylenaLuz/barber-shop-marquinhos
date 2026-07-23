import { motion } from "framer-motion";
import { InstagramLogo, Trophy } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";

export default function Barbers({ onBookWith }) {
  const { barbers } = useSiteData();
  return (
    <section id="barbeiros" className="section">
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow">Nossos barbeiros</div>
          <h2>
            Escolha quem vai
            <br />
            cuidar do seu corte.
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 26 }} className="barbers-grid">
          {barbers.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -6 }}
              className="glass"
              style={{ overflow: "hidden", position: "relative" }}
            >
              <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
                <img src={b.photo} alt={b.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(10,10,12,0.92) 100%)" }} />
                <div style={{ position: "absolute", left: 20, bottom: 16 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26 }}>{b.name}</div>
                  <div style={{ fontSize: 12.5, color: "var(--gold)", fontWeight: 700 }}>{b.role}</div>
                </div>
                {b.instagram && (
                  <a href={`https://www.instagram.com/${b.instagram.replace(/^@/, "")}/`} target="_blank" rel="noopener noreferrer"
                    className="glass" style={{ position: "absolute", top: 16, right: 16, padding: 9, borderRadius: 10 }}>
                    <InstagramLogo size={16} color="var(--gold-2)" />
                  </a>
                )}
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--silver-dim)", fontSize: 13 }}>
                  <Trophy size={15} color="var(--gold)" /> {b.experienceYears}+ anos de experiência
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                  {(b.tags || []).map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-gold btn-block" onClick={() => onBookWith(b.id)}>
                  Agendar com {b.name.split(" ")[0]}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width:900px){ .barbers-grid{ grid-template-columns:1fr !important; } }`}</style>
    </section>
  );
}
