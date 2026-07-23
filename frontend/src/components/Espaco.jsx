import { motion } from "framer-motion";
import { Play } from "@phosphor-icons/react";

export default function Espaco() {
  return (
    <section id="espaco" className="section" style={{ paddingBottom: 80 }}>
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow">Nosso espaço</div>
          <h2>
            Conheça o ambiente
            <br />
            por dentro.
          </h2>
          <p>Um tour rápido pela barbearia — a estrutura, o acabamento e o clima de quem trabalha com cuidado.</p>
        </motion.div>
      </div>

      <div className="wrap">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass espaco-video-frame"
          style={{ position: "relative", borderRadius: 20, overflow: "hidden", aspectRatio: "16/9" }}
        >
          {/* -------------------------------------------------------------
              Vídeo do espaço.
              Para trocar, substitua o arquivo espaco.mp4 dentro da pasta
              public/video pelo vídeo definitivo — não precisa mexer neste
              código. O nome do arquivo e o caminho devem continuar os
              mesmos (public/video/espaco.mp4).
             ------------------------------------------------------------- */}
          <video
            controls
            playsInline
            preload="metadata"
            poster="/images/gallery/espaco.jpg"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", background: "#000" }}
          >
            <source src="/video/espaco.mp4" type="video/mp4" />
          </video>

          <div className="espaco-play-hint glass" style={{ position: "absolute", left: 16, bottom: 16, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", pointerEvents: "none" }}>
            <Play size={14} weight="fill" color="var(--gold)" />
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Vídeo do espaço</span>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 620px){
          .espaco-video-frame{ border-radius:14px !important; aspect-ratio: 4/3 !important; }
          .espaco-play-hint{ left:10px !important; bottom:10px !important; padding:6px 10px !important; }
        }
      `}</style>
    </section>
  );
}
