import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useSiteData } from "../context/SiteDataContext";

export default function Login() {
  const { login } = useAuth();
  const { settings } = useSiteData();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/admin");
    } catch (e) {
      setError(e?.response?.data?.error || "Senha incorreta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong"
        style={{ width: "100%", maxWidth: 380, padding: 36, textAlign: "center" }}
      >
        {settings?.logo && <img src={settings.logo} alt="logo" style={{ height: 52, margin: "0 auto 18px" }} />}
        <h3 style={{ margin: "0 0 4px" }}>Painel administrativo</h3>
        <p style={{ color: "var(--silver-dim)", fontSize: 13, marginBottom: 22 }}>{settings?.name}</p>
        <div className="field" style={{ textAlign: "left" }}>
          <label>Senha</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </div>
        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <button className="btn btn-gold btn-block" disabled={loading || !password}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <div style={{ marginTop: 16 }}>
          <a href="/" style={{ fontSize: 12.5, color: "var(--silver-dim)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={13} /> Voltar ao site
          </a>
        </div>
      </motion.form>
    </div>
  );
}
