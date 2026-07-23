import { motion } from "framer-motion";
import { Trophy, Scissors, CalendarBlank } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";

const stats = [
  { icon: Trophy, n: "+4 anos", l: "Experiência" },
  { icon: Scissors, n: "11", l: "Serviços" },
  { icon: CalendarBlank, n: "6", l: "Dias por semana" },
];

function LineMotif() {
  const cx = 210, cy = 210, rInner = 68, rOuter = 190;
  const lines = [];
  for (let i = 0; i < 30; i++) {
    const a = (Math.PI * 2 * i) / 30;
    const x1 = cx + rInner * Math.cos(a), y1 = cy + rInner * Math.sin(a);
    const x2 = cx + rOuter * Math.cos(a), y2 = cy + rOuter * Math.sin(a);
    const strong = i % 4 === 0;
    lines.push(
      <motion.line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="url(#gGold)"
        strokeWidth={strong ? 2 : 1}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: strong ? 0.6 : 0.18 }}
        transition={{ duration: 0.6, delay: i * 0.02 }}
        viewport={{ once: true }}
      />
    );
  }
  return (
    <svg viewBox="0 0 420 420" width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0cf82" />
          <stop offset="100%" stopColor="#8a6a2c" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="210" r="68" fill="none" stroke="url(#gGold)" strokeWidth="1.4" opacity="0.7" />
      <circle cx="210" cy="210" r="190" fill="none" stroke="url(#gGold)" strokeWidth="1" opacity="0.22" />
      {lines}
      <circle cx="210" cy="210" r="4" fill="#f0cf82" />
    </svg>
  );
}

export default function About() {
  const { settings } = useSiteData();
  return (
    <section id="sobre" className="section">
      <div className="wrap about-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 64, alignItems: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <LineMotif />
        </motion.div>
        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="eyebrow">
            Sobre a barbearia
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} style={{ fontSize: 44, marginBottom: 18 }}>
            Tradição de barba,
            <br />
            técnica de estúdio.
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.18 }} style={{ color: "var(--silver)", lineHeight: 1.75, fontSize: 15.5, marginBottom: 14 }}>
            A {settings?.name} nasceu da vontade de unir o clima de barbearia de bairro com o nível de detalhe de um
            estúdio de design. Aqui o corte é conversa, é referência trazida no celular, é risco desenhado à mão.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.24 }} style={{ color: "var(--silver)", lineHeight: 1.75, fontSize: 15.5 }}>
            Cada atendimento é pensado do início ao fim: diagnóstico do tipo de cabelo, referência combinada com o
            cliente e acabamento na navalha.
          </motion.p>

          <div className="about-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 30 }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                whileHover={{ y: -4, boxShadow: "0 12px 30px rgba(205,164,78,0.18)" }}
                className="glass"
                style={{ padding: "20px 12px", textAlign: "center" }}
              >
                <s.icon size={22} weight="duotone" color="var(--gold)" style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, color: "var(--gold)" }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "var(--silver-dim)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px){
          .about-grid{ grid-template-columns:1fr !important; gap:40px !important; }
        }
        @media (max-width: 420px){
          .about-stats{ grid-template-columns:1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
}
