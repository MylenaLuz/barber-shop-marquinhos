import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { Star } from "@phosphor-icons/react";
import { initials } from "../services/format";
import "swiper/css";
import "swiper/css/pagination";

/**
 * TESTEMUNHOS — CONTEÚDO PLACEHOLDER.
 * Não temos avaliações reais de clientes ainda. Troque os itens abaixo
 * pelos depoimentos de verdade (nome, texto e nota de 1 a 5) assim que
 * vocês tiverem — não precisa mexer em mais nada além deste array.
 */
const TESTIMONIALS = [
{

    name: "Matheus Oliveira",

    text: "A experiência foi impecável do começo ao fim. Ambiente moderno, atendimento de primeira e um resultado que superou minhas expectativas.",

    rating: 5

  },

  {

    name: "Gabriel Santos",

    text: "Sempre volto porque sei que vou sair satisfeito. Excelente atendimento, pontualidade e profissionais que realmente entendem do assunto.",

    rating: 5

  },

  {

    name: "Rafael Costa",

    text: "Lugar confortável, equipe muito qualificada e um serviço que vale cada centavo. Recomendo para quem busca qualidade e estilo.",

    rating: 5

  }];

export default function Testimonials() {
  return (
    <section className="section">
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow">Avaliações</div>
          <h2>O que dizem<br />sobre a gente.</h2>
        </motion.div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          loop
          autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          breakpoints={{ 768: { slidesPerView: 2 }, 1100: { slidesPerView: 3 } }}
          style={{ paddingBottom: 44 }}
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="glass" style={{ padding: 26, height: "100%" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={15} weight="fill" color="var(--gold)" />
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: "var(--silver)", lineHeight: 1.7, marginBottom: 20 }}>“{t.text}”</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--gold-2),var(--gold-deep))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Bebas Neue'", fontSize: 14, color: "#191305",
                  }}>
                    {initials(t.name)}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <style>{`
        .swiper-pagination-bullet{ background:var(--silver-dim); opacity:0.5; }
        .swiper-pagination-bullet-active{ background:var(--gold); opacity:1; }
      `}</style>
    </section>
  );
}
