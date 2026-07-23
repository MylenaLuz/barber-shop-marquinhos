import { Link } from "react-router-dom";
import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";

export default function Footer() {
  const { settings } = useSiteData();
  if (!settings) return null;
  const waUrl = "https://wa.me/" + settings.whatsapp.replace(/\D/g, "");
  const igUrl = "https://www.instagram.com/" + settings.instagram.replace(/^@/, "") + "/";

  return (
    <footer style={{ padding: "56px 0 30px", borderTop: "1px solid var(--line)" }}>
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={settings.logo} alt="logo" style={{ height: 34, width: 34, objectFit: "contain" }} />
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18 }}>{settings.name}</span>
          </div>
          <div style={{ display: "flex", gap: 22, fontSize: 13, color: "var(--silver-dim)", flexWrap: "wrap" }}>
            <a href="#sobre">Sobre</a>
            <a href="#servicos">Serviços</a>
            <a href="#local">Contato</a>
            <a href={igUrl} target="_blank" rel="noopener noreferrer"><InstagramLogo size={15} style={{ verticalAlign: "-2px" }} /> Instagram</a>
            <a href={waUrl} target="_blank" rel="noopener noreferrer"><WhatsappLogo size={15} style={{ verticalAlign: "-2px" }} /> WhatsApp</a>
            <Link to="/admin/login" style={{ opacity: 0.7 }}>Acesso administrativo</Link>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#55565c", marginTop: 26, textAlign: "center" }}>
          © {new Date().getFullYear()} {settings.name}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
