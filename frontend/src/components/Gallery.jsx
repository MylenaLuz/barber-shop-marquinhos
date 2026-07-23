import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { motion } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Adicione novas imagens nesta pasta: public/images/gallery
// e inclua o nome do arquivo aqui embaixo — o carrossel carrega essa lista.
const GALLERY_IMAGES = [
  { src: "/images/gallery/gallery-1.jpg", caption: "Freestyle " },
  { src: "/images/gallery/gallery-2.jpg", caption: "Desgradê" },
  { src: "/images/gallery/gallery-3.jpg", caption: "Desgradê com pigmentação" },
  { src: "/images/gallery/gallery-4.jpg", caption: "luzes" },
  { src: "/images/gallery/gallery-5.jpg", caption: "Freestyle" },
  { src: "/images/gallery/gallery-6.jpg", caption: "Freestyle geométrico" },
  { src: "/images/gallery/gallery-7.jpg", caption: "Desgradê" },
  { src: "/images/gallery/gallery-8.jpg", caption: "Luzes" },
  { src: "/images/gallery/gallery-9.jpg", caption: "Infantil" },
];

export default function Gallery() {
  return (
    <section id="galeria" className="section">
      <div className="wrap">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-head">
          <div className="eyebrow">Galeria</div>
          <h2>
            O trabalho fala
            <br />
            por si.
          </h2>
          <p>Uma amostra dos cortes e acabamentos feitos aqui dentro — do clássico ao design autoral.</p>
        </motion.div>
      </div>

      <div className="wrap" style={{ position: "relative" }}>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={18}
          slidesPerView={1.15}
          loop
          autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
          navigation={{ prevEl: ".gal-prev", nextEl: ".gal-next" }}
          pagination={{ clickable: true, el: ".gal-pagination" }}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            980: { slidesPerView: 3.2 },
            1280: { slidesPerView: 4 },
          }}
          style={{ paddingBottom: 46 }}
        >
          {GALLERY_IMAGES.map((it, i) => (
            <SwiperSlide key={i}>
              <div className="glass" style={{ borderRadius: 16, overflow: "hidden", position: "relative", aspectRatio: "3/4" }}>
                <img src={it.src} alt={it.caption} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.8))" }} />
                <div style={{ position: "absolute", left: 14, bottom: 12, fontSize: 13, fontWeight: 700 }}>{it.caption}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="gal-pagination" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: -30 }} />
        <button className="gal-prev btn btn-ghost btn-sm" style={{ position: "absolute", left: 4, top: "38%", zIndex: 5, padding: 10 }} aria-label="Anterior">
          <CaretLeft size={16} />
        </button>
        <button className="gal-next btn btn-ghost btn-sm" style={{ position: "absolute", right: 4, top: "38%", zIndex: 5, padding: 10 }} aria-label="Próximo">
          <CaretRight size={16} />
        </button>
      </div>

      <style>{`
        .gal-pagination .swiper-pagination-bullet{ background:var(--silver-dim); opacity:0.5; }
        .gal-pagination .swiper-pagination-bullet-active{ background:var(--gold); opacity:1; }
      `}</style>
    </section>
  );
}
