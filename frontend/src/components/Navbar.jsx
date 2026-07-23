import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { List, X } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";

const LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#espaco", label: "Espaço" },
  { href: "#galeria", label: "Galeria" },
  { href: "#barbeiros", label: "Barbeiros" },
  { href: "#servicos", label: "Serviços" },
  { href: "#club", label: "Clube" },
  { href: "#local", label: "Localização" },
];

export default function Navbar({ onBook }) {
  const { settings } = useSiteData();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        transition: "all .3s ease",
        background: scrolled ? "rgba(10,10,12,0.75)" : "rgba(10,10,12,0.3)",
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <div className="wrap nav-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
        <a href="#" className="nav-brand" style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {settings?.logo && (
            <img src={settings.logo} alt="logo" className="nav-logo-img" style={{ height: 42, width: 42, objectFit: "contain", filter: "drop-shadow(0 0 10px rgba(205,164,78,0.25))", flex: "none" }} />
          )}
          <span className="nav-brand-text" style={{ fontFamily: "'Bebas Neue'", fontSize: 23, letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {settings?.name?.split(" ")[0]} <span style={{ color: "var(--gold)" }}>{settings?.name?.split(" ").slice(1).join(" ")}</span>
          </span>
        </a>

        <nav style={{ display: "flex", gap: 26 }} className="nav-desktop">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} style={{ fontSize: 14, color: "var(--silver-dim)", fontWeight: 600, whiteSpace: "nowrap" }}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
          <button className="btn btn-gold nav-desktop" onClick={onBook}>
            Agendar
          </button>
          <button
            className="btn btn-ghost nav-mobile-toggle"
            style={{ padding: 10, display: "none" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-strong"
          style={{ margin: "0 16px 16px", padding: 18, borderRadius: 14 }}
        >
          <div className="nav-mobile-list" style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto" }}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} style={{ fontSize: 15, fontWeight: 600 }}>
                {l.label}
              </a>
            ))}
            <button
              className="btn btn-gold btn-block"
              onClick={() => {
                setMobileOpen(false);
                onBook();
              }}
            >
              Agendar horário
            </button>
          </div>
        </motion.div>
      )}

      <style>{`
        /* Tablets (retrato e paisagem) e celulares caem no menu hambúrguer,
           evitando que os links da navbar espremam ou quebrem linha. */
        @media (max-width: 1080px){
          .nav-desktop{ display:none !important; }
          .nav-mobile-toggle{ display:flex !important; }
        }
        @media (max-width: 480px){
          .nav-row{ padding-top:10px !important; padding-bottom:10px !important; }
          .nav-brand-text{ font-size:19px !important; }
          .nav-logo-img{ height:34px !important; width:34px !important; }
        }
        @media (max-width: 360px){
          .nav-brand-text{ max-width:150px; }
        }
      `}</style>
    </header>
  );
}
