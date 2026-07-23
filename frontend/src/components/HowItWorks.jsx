import { motion } from "framer-motion";
import { UserCircle, Scissors, ClockCountdown, CheckCircle } from "@phosphor-icons/react";

const STEPS = [
  { n: "01", icon: UserCircle, title: "Escolha o barbeiro", desc: "Marcos ou Kauan — cada um com agenda própria." },
  { n: "02", icon: Scissors, title: "Escolha o serviço", desc: "Corte, barba, freestyle e mais 8 opções." },
  { n: "03", icon: ClockCountdown, title: "Escolha o horário", desc: "Veja os horários livres em tempo real." },
  { n: "04", icon: CheckCircle, title: "Confirme", desc: "Deixe nome e telefone. Pronto, tá marcado." },
];

export default function HowItWorks({ onBook }) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow">Como funciona</div>
          <h2>Agendar leva menos<br />de um minuto.</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, position: "relative" }} className="howitworks-grid">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className="glass"
              style={{ padding: 24, position: "relative" }}
            >
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "var(--gold)", marginBottom: 14 }}>{s.n}</div>
              <s.icon size={30} weight="duotone" color="var(--gold-2)" style={{ marginBottom: 14 }} />
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "var(--silver-dim)", lineHeight: 1.55 }}>{s.desc}</div>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="btn btn-gold" onClick={onBook}>
            Começar agendamento
          </motion.button>
        </div>
      </div>
      <style>{`
        .step-connector{
          display:none;
        }
        @media (min-width: 981px){
          .step-connector{
            display:block; position:absolute; top:50%; right:-18px; width:18px; height:1px;
            background:linear-gradient(90deg, var(--line-gold), transparent);
          }
        }
        @media (max-width: 980px){ .howitworks-grid{ grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width: 600px){ .howitworks-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </section>
  );
}
