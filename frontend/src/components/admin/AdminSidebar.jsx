import { NavLink, useNavigate } from "react-router-dom";
import { House, CalendarBlank, Users, Scissors, Wallet, ChartBar, Gear, SignOut, ArrowLeft, List, X, Crown } from "@phosphor-icons/react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSiteData } from "../../context/SiteDataContext";

const NAV = [
  { to: "/admin", label: "Início", icon: House, end: true },
  { to: "/admin/agenda", label: "Agenda", icon: CalendarBlank },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/mensalistas", label: "Mensalistas", icon: Crown },
  { to: "/admin/servicos", label: "Serviços", icon: Scissors },
  { to: "/admin/caixa", label: "Caixa", icon: Wallet },
  { to: "/admin/relatorios", label: "Relatórios", icon: ChartBar },
  { to: "/admin/configuracoes", label: "Configurações", icon: Gear },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const { settings } = useSiteData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="admin-burger" onClick={() => setOpen(true)}>
        <List size={18} />
      </button>
      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 20px", borderBottom: "1px solid var(--line)", marginBottom: 14, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {settings?.logo && <img src={settings.logo} style={{ height: 28, width: 28 }} alt="logo" />}
            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 17 }}>{settings?.name?.split(" ")[0]} Admin</span>
          </div>
          <button className="admin-burger-close" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `side-link ${isActive ? "active" : ""}`}
          >
            <n.icon size={17} className="ic" /> {n.label}
          </NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); navigate("/admin/login"); }} className="side-link">
          <SignOut size={17} className="ic" /> Sair
        </a>
        <a href="/" className="side-link" style={{ fontSize: 12, opacity: 0.7 }}>
          <ArrowLeft size={15} className="ic" /> Ver site
        </a>
      </aside>

      <style>{`
        .admin-sidebar{
          width:230px; flex:none; background:var(--ink-2); border-right:1px solid var(--line);
          padding:22px 14px; display:flex; flex-direction:column; gap:5px; position:sticky; top:0; height:100vh;
        }
        .side-link{
          display:flex; align-items:center; gap:12px; padding:11px 12px; border-radius:10px; color:var(--silver-dim);
          font-size:14px; font-weight:600; transition:all .15s;
        }
        .side-link:hover{ background:rgba(255,255,255,0.04); color:var(--off); }
        .side-link.active{ background:linear-gradient(90deg,rgba(205,164,78,0.16),rgba(205,164,78,0.02)); color:var(--gold-2); border:1px solid var(--line-gold); }
        .admin-burger, .admin-burger-close, .sidebar-scrim{ display:none; }
        @media (max-width: 980px){
          .admin-burger{
            display:flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:10px;
            border:1px solid var(--line); background:var(--ink-2); color:var(--off); position:fixed; top:16px; left:16px; z-index:120;
          }
          .admin-burger-close{ display:flex; align-items:center; justify-content:center; background:none; border:1px solid var(--line); border-radius:8px; width:28px; height:28px; color:var(--off); }
          .admin-sidebar{ position:fixed; left:-250px; z-index:130; transition:left .2s; box-shadow:20px 0 40px rgba(0,0,0,0.4); }
          .admin-sidebar.open{ left:0; }
          .sidebar-scrim{ display:block; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:125; }
        }
      `}</style>
    </>
  );
}
