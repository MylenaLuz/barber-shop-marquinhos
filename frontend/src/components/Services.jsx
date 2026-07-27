import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Clock } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";
import { formatBRL, formatDuration } from "../services/format";

function ServiceCard({ svc, onBook, index }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="glass service-card"
    >
      <div style={{ position: "relative", height: 170, overflow: "hidden", borderRadius: 14, marginBottom: 16 }}>
        <img src={svc.image} alt={svc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(10,10,12,0.85))" }} />
        <div style={{ position: "absolute", left: 14, bottom: 12, fontFamily: "'Bebas Neue'", fontSize: 22 }}>{svc.name}</div>
      </div>
      <p style={{ fontSize: 13, color: "var(--silver-dim)", lineHeight: 1.6, minHeight: 40 }}>{svc.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "14px 0 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--silver-dim)" }}>
          <Clock size={14} /> {formatDuration(svc.duration)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'Bebas Neue'", fontSize: 26, color: "var(--gold)" }}>
          {formatBRL(svc.price)}
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-gold btn-block" onClick={() => onBook(svc.id)}>
        Agendar
      </motion.button>
    </motion.div>
  );
}

export default function Services({ onBook }) {
  const { services } = useSiteData();
  return (
    <section id="servicos" className="section">
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow">Serviços</div>
          <h2>Tabela de preços.</h2>
          <p>Valores e duração de cada atendimento — tudo combinado antes de sentar na cadeira.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="services-grid">
          {services.map((s, i) => (
            <ServiceCard key={s.id} svc={s} onBook={onBook} index={i} />
          ))}
        </div>
      </div>
      <style>{`
        .service-card{ padding:18px; display:flex; flex-direction:column; }
        @media (max-width: 980px){ .services-grid{ grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width: 620px){ .services-grid{ grid-template-columns:1fr !important; } }
      `}</style>
    </section>
  );
}
