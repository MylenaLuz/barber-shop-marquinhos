import { motion } from "framer-motion";
import { MapPin, Phone, WhatsappLogo, InstagramLogo, ArrowSquareOut } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";
import { WEEKDAY_ORDER, WEEKDAY_LABELS } from "../services/format";

export default function MapContact() {
  const { settings } = useSiteData();
  if (!settings) return null;
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(settings.address);
  const mapsEmbed = "https://maps.google.com/maps?q=" + encodeURIComponent(settings.address) + "&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const waUrl = "https://wa.me/" + settings.whatsapp.replace(/\D/g, "");
  const igUrl = "https://www.instagram.com/" + settings.instagram.replace(/^@/, "") + "/";

  return (
    <section id="local" className="section">
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }} id="local-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass" style={{ padding: 30 }}>
          <div className="section-head" style={{ marginBottom: 22 }}>
            <div className="eyebrow">Localização &amp; contato</div>
            <h2 style={{ fontSize: 32 }}>Onde estamos.</h2>
          </div>

          <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 22, border: "1px solid var(--line)" }}>
            <iframe
              title="Mapa"
              src={mapsEmbed}
              width="100%"
              height="220"
              style={{ border: 0, filter: "grayscale(0.4) invert(0.92) contrast(0.9)" }}
              loading="lazy"
            />
          </div>

          <Row icon={<MapPin size={17} />} label="Endereço" value={settings.address} />
          <Row icon={<Phone size={17} />} label="Telefone" value={settings.phone} />
          <Row icon={<WhatsappLogo size={17} />} label="WhatsApp" value={settings.whatsapp} last />

          <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
            <a className="btn btn-gold" href={waUrl} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
            <a className="btn btn-ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
              Abrir no mapa <ArrowSquareOut size={14} />
            </a>
            <a className="btn btn-ghost" href={igUrl} target="_blank" rel="noopener noreferrer">
              <InstagramLogo size={15} /> Instagram
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass" style={{ padding: 30 }}>
          <div className="section-head" style={{ marginBottom: 22 }}>
            <div className="eyebrow">Horário de funcionamento</div>
            <h2 style={{ fontSize: 32 }}>Quando abrimos.</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              {WEEKDAY_ORDER.map((k) => {
                const h = settings.hours[k];
                return (
                  <tr key={k} style={{ borderBottom: "1px dashed var(--line)" }}>
                    <td style={{ padding: "11px 0", color: "var(--off)", fontWeight: 700, width: 120 }}>{WEEKDAY_LABELS[k]}</td>
                    <td style={{ padding: "11px 0", color: "var(--silver)" }}>
                      {h.closed ? <span style={{ color: "var(--danger)", fontWeight: 700, fontSize: 12.5 }}>Fechado</span> : `${h.open} – ${h.close}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
      <style>{`@media (max-width: 900px){ #local-grid{ grid-template-columns:1fr !important; } }`}</style>
    </section>
  );
}

function Row({ icon, label, value, last }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: last ? 0 : 16, paddingBottom: last ? 0 : 16, borderBottom: last ? "none" : "1px dashed var(--line)" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(205,164,78,0.1)", border: "1px solid var(--line-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flex: "none" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11.5, color: "var(--silver-dim)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14.5, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}
