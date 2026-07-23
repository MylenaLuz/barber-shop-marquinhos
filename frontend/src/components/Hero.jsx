import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, Scissors } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
};

export default function Hero({ onBook }) {
  const { settings } = useSiteData();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]); // efeito parallax simples no vídeo
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} style={{ position: "relative", height: "100vh", minHeight: 640, overflow: "hidden", display: "flex", alignItems: "center" }}>
      {/* -------------------------------------------------------------
          Vídeo de fundo do Hero.
          Para trocar o vídeo, substitua o arquivo hero.mp4 dentro da
          pasta public/video — não precisa mexer neste código.
          Se preferir usar GIF, troque a tag <video> por <img src="/video/hero.gif">.
         ------------------------------------------------------------- */}
      <motion.video
        style={{ y, position: "absolute", inset: 0, width: "100%", height: "130%", objectFit: "cover", filter: "grayscale(0.2) contrast(1.05) brightness(0.55)" }}
        autoPlay
        muted
        loop
        playsInline
        poster="/images/gallery/gallery-2.jpg"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </motion.video>

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,10,12,0.55) 0%, rgba(10,10,12,0.35) 40%, rgba(10,10,12,0.92) 100%), radial-gradient(700px 400px at 15% 20%, rgba(205,164,78,0.16), transparent 60%)",
        }}
      />

      <motion.div className="wrap" style={{ position: "relative", zIndex: 2, opacity }} variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="eyebrow">
          <Scissors size={14} weight="bold" /> Seja Você Mesmo, a Gente Cuida do Resto
        </motion.div>
        <motion.h1 variants={item} style={{ fontSize: "clamp(48px,7.5vw,96px)", marginBottom: 22, maxWidth: 780 }}>
          A Arte de
          <br />
          Cuidar de você.
        </motion.h1>
        <motion.p variants={item} style={{ fontSize: 18, color: "var(--silver)", maxWidth: 480, lineHeight: 1.7, marginBottom: 36 }}>
          Fade, risco e navalha com precisão. Na {settings?.name}, cada cliente sai com um corte pensado pra sua
          cara — do clássico ao freestyle.
        </motion.p>
        <motion.div variants={item} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="btn btn-gold" onClick={onBook}>
            Agendar horário
          </motion.button>
          <motion.a whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} href="#servicos" className="btn btn-ghost">
            Ver serviços
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#sobre"
        style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", zIndex: 2, color: "var(--silver-dim)" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={22} />
      </motion.a>
    </section>
  );
}
