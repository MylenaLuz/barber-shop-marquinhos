import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, MagnifyingGlass, Warning, ClockCounterClockwise, ArrowsClockwise, Crown } from "@phosphor-icons/react";
import { ClientPlansAPI, PlansAPI, PlanRequestsAPI } from "../../services/resources";
import { Panel, Toast } from "../../components/admin/Widgets";
import { useToast } from "../../hooks/useToast";
import ActivatePlanModal from "../../components/admin/ActivatePlanModal";
import PlanHistoryModal from "../../components/admin/PlanHistoryModal";
import PlansManager from "../../components/admin/PlansManager";
import PlanRequestsManager from "../../components/admin/PlanRequestsManager";
import { formatDateBR } from "../../services/format";

export default function Mensalistas() {
  const [tab, setTab] = useState("mensalistas"); // mensalistas | solicitacoes | planos
  const [items, setItems] = useState([]);
  const [plans, setPlans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");
  const [creditsFilter, setCreditsFilter] = useState("all");
  const [activateOpen, setActivateOpen] = useState(false);
  const [historyFor, setHistoryFor] = useState(null);
  const { message, show } = useToast();

  const load = useCallback(async () => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (planFilter !== "all") params.planId = planFilter;
    if (dueFilter !== "all") params.dueFilter = dueFilter;
    if (creditsFilter !== "all") params.creditsFilter = creditsFilter;
    const [list, alertList, planList, pending] = await Promise.all([
      ClientPlansAPI.list(params),
      ClientPlansAPI.alerts(),
      PlansAPI.list(),
      PlanRequestsAPI.list("pendente"),
    ]);
    setItems(list);
    setAlerts(alertList);
    setPlans(planList);
    setPendingCount(pending.length);
  }, [search, planFilter, dueFilter, creditsFilter]);

  useEffect(() => { load(); }, [load]);

  async function renew(id) {
    try {
      await ClientPlansAPI.renew(id);
      show("Plano renovado.");
      load();
    } catch (e) {
      show(e?.response?.data?.error || "Não foi possível renovar.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 30, display: "flex", alignItems: "center", gap: 10 }}><Crown size={26} color="var(--gold)" weight="fill" /> Mensalistas</h2>
          <div style={{ color: "var(--silver-dim)", fontSize: 13, marginTop: 4 }}>Controle de planos e créditos — pagamento sempre presencial</div>
        </div>
        {tab === "mensalistas" && (
          <button className="btn btn-gold" onClick={() => setActivateOpen(true)}><Plus size={15} /> Ativar plano</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className={`tab-btn ${tab === "mensalistas" ? "active" : ""}`} onClick={() => setTab("mensalistas")}>Mensalistas</button>
        <button className={`tab-btn ${tab === "solicitacoes" ? "active" : ""}`} onClick={() => setTab("solicitacoes")}>
          Solicitações {pendingCount > 0 && <span style={{ marginLeft: 6, background: tab === "solicitacoes" ? "rgba(25,19,5,0.25)" : "var(--gold)", color: tab === "solicitacoes" ? "#191305" : "#191305", borderRadius: 999, padding: "1px 7px", fontSize: 11 }}>{pendingCount}</span>}
        </button>
        <button className={`tab-btn ${tab === "planos" ? "active" : ""}`} onClick={() => setTab("planos")}>Planos</button>
      </div>

      {tab === "planos" ? (
        <PlansManager onToast={show} />
      ) : tab === "solicitacoes" ? (
        <PlanRequestsManager onToast={show} onActivated={load} />
      ) : (
        <>
          {alerts.length > 0 && (
            <div className="glass" style={{ padding: 18, marginBottom: 20, borderColor: "rgba(201,88,79,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontWeight: 700, fontSize: 13.5, color: "#f0b3ad" }}>
                <Warning size={16} weight="fill" /> Avisos
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{ fontSize: 13, color: "var(--silver)" }}>⚠ {a.message}</div>
                ))}
              </div>
            </div>
          )}

          <Panel>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ position: "relative", flex: "1 1 220px" }}>
                <input type="text" placeholder="Buscar por nome" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: "100%", padding: "12px 14px 12px 36px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(255,255,255,0.03)", color: "var(--off)" }} />
                <MagnifyingGlass size={15} style={{ position: "absolute", left: 12, top: 14, color: "var(--silver-dim)" }} />
              </div>
              <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(255,255,255,0.03)", color: "var(--off)" }}>
                <option value="all">Todos os planos</option>
                {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value)} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(255,255,255,0.03)", color: "var(--off)" }}>
                <option value="all">Qualquer vencimento</option>
                <option value="ativos">Ativos</option>
                <option value="vencendo">Vencendo em 7 dias</option>
                <option value="vencidos">Vencidos</option>
              </select>
              <select value={creditsFilter} onChange={(e) => setCreditsFilter(e.target.value)} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "rgba(255,255,255,0.03)", color: "var(--off)" }}>
                <option value="all">Qualquer crédito</option>
                <option value="baixo">Créditos baixos (≤1)</option>
                <option value="zerado">Créditos zerados</option>
              </select>
            </div>

            {items.length === 0 ? (
              <div className="empty-state">Nenhum cliente mensalista encontrado.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
                {items.map((cp) => (
                  <MensalistaCard key={cp.id} cp={cp} onRenew={() => renew(cp.id)} onHistory={() => setHistoryFor(cp)} />
                ))}
              </div>
            )}
          </Panel>
        </>
      )}

      <ActivatePlanModal open={activateOpen} onClose={() => setActivateOpen(false)} onActivated={() => { setActivateOpen(false); show("Plano ativado."); load(); }} />
      {historyFor && <PlanHistoryModal clientPlanId={historyFor.id} clientName={historyFor.clientName} onClose={() => setHistoryFor(null)} />}
      <Toast message={message} />

      <style>{`.tab-btn{ padding:8px 16px; border-radius:999px; border:1px solid var(--line); font-size:13px; font-weight:600; color:var(--silver-dim); background:transparent; } .tab-btn.active{ background:var(--gold); color:#191305; border-color:var(--gold); }`}</style>
    </div>
  );
}

function MensalistaCard({ cp, onRenew, onHistory }) {
  const isExpired = cp.status === "expirado";
  const dueSoon = !isExpired && cp.daysRemaining <= 7;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: 20, borderColor: isExpired ? "rgba(201,88,79,0.35)" : dueSoon ? "rgba(205,164,78,0.5)" : undefined }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <Crown size={15} color="var(--gold)" weight="fill" /> {cp.clientName}
        </div>
        <span className={`badge ${isExpired ? "badge-cancelado" : "badge-concluido"}`}>{isExpired ? "Expirado" : "Ativo"}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--gold-2)", fontWeight: 600, marginBottom: 4 }}>{cp.planName}</div>
      <div style={{ fontSize: 12, color: isExpired ? "var(--danger)" : "var(--silver-dim)", marginBottom: 14 }}>
        {isExpired ? `Venceu em ${formatDateBR(cp.endDate)}` : cp.daysRemaining === 0 ? "Vence hoje" : `Vence em ${cp.daysRemaining} dia${cp.daysRemaining === 1 ? "" : "s"}`}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {cp.credits.map((c) => (
          <div key={c.serviceType} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: "var(--silver)" }}>{c.serviceType}</span>
            <span className="mono" style={{ fontSize: 12.5, color: c.remainingQuantity === 0 ? "var(--danger)" : "var(--gold)" }}>
              {c.remainingQuantity} / {c.totalQuantity}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onHistory} style={{ flex: 1 }}><ClockCounterClockwise size={13} /> Histórico</button>
        <button className="btn btn-gold btn-sm" onClick={onRenew} style={{ flex: 1 }}><ArrowsClockwise size={13} /> Renovar</button>
      </div>
    </motion.div>
  );
}
