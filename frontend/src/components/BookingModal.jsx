import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, CheckCircle, Clock } from "@phosphor-icons/react";
import { useSiteData } from "../context/SiteDataContext";
import { AppointmentsAPI } from "../services/resources";
import { formatBRL, formatDateLong, formatDuration, todayISO } from "../services/format";

const TOTAL_STEPS = 6;

export default function BookingModal({ open, onClose, initialBarberId }) {
  const { barbers, services } = useSiteData();
  const [step, setStep] = useState(1);
  const [barberId, setBarberId] = useState(null);
  const [serviceId, setServiceId] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(initialBarberId ? 2 : 1);
      setBarberId(initialBarberId || null);
      setServiceId(null);
      setDate(todayISO());
      setTime(null);
      setName("");
      setPhone("");
      setError("");
      setDone(false);
    }
  }, [open, initialBarberId]);

  const service = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);
  const barber = useMemo(() => barbers.find((b) => b.id === barberId), [barbers, barberId]);

  useEffect(() => {
    if (step === 4 && barberId && serviceId && date) {
      setLoadingSlots(true);
      setError("");
      AppointmentsAPI.slots(barberId, date, serviceId)
        .then(setSlots)
        .catch(() => setError("Não foi possível carregar os horários. Tente novamente."))
        .finally(() => setLoadingSlots(false));
    }
  }, [step, barberId, serviceId, date]);

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      await AppointmentsAPI.createPublic({ barberId, serviceId, date, time, clientName: name, clientPhone: phone });
      setDone(true);
    } catch (e) {
      setError(e?.response?.data?.error || "Não foi possível confirmar o agendamento.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(6,6,8,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong"
          style={{ width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", padding: 30, position: "relative" }}
        >
          <button onClick={onClose} className="glass" style={{ position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>

          {!done ? (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 26 }}>
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 3, background: i < step ? "linear-gradient(90deg,var(--gold-2),var(--gold))" : "var(--line)" }} />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <StepWrap key="s1" label="Passo 1 de 6" title="Escolha o barbeiro">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {barbers.map((b) => (
                        <OptionBtn key={b.id} selected={barberId === b.id} onClick={() => { setBarberId(b.id); setStep(2); }} title={b.name} sub={b.role} right={<ArrowRight size={15} />} />
                      ))}
                    </div>
                  </StepWrap>
                )}

                {step === 2 && (
                  <StepWrap key="s2" label="Passo 2 de 6" title="Escolha o serviço">
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 360, overflowY: "auto" }}>
                      {services.map((s) => (
                        <OptionBtn key={s.id} selected={serviceId === s.id} onClick={() => { setServiceId(s.id); setStep(3); }} title={s.name} sub={formatDuration(s.duration)} right={formatBRL(s.price)} />
                      ))}
                    </div>
                    <Actions onBack={() => setStep(1)} />
                  </StepWrap>
                )}

                {step === 3 && (
                  <StepWrap key="s3" label="Passo 3 de 6" title="Escolha a data">
                    <div className="field">
                      <label>Data do atendimento</label>
                      <input type="date" value={date} min={todayISO()} onChange={(e) => { setDate(e.target.value); setTime(null); }} />
                    </div>
                    <Actions onBack={() => setStep(2)} onNext={() => setStep(4)} />
                  </StepWrap>
                )}

                {step === 4 && (
                  <StepWrap key="s4" label="Passo 4 de 6" title={`Horários — ${formatDateLong(date)}`}>
                    {loadingSlots ? (
                      <div className="empty-state">Carregando horários…</div>
                    ) : slots.length === 0 ? (
                      <div className="empty-state">
                        <Clock size={30} style={{ marginBottom: 8, opacity: 0.6 }} />
                        <br />Nenhum horário livre nesse dia.<br />Tente escolher outra data.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9 }}>
                        {slots.map((t) => (
                          <button key={t} onClick={() => setTime(t)} className="mono"
                            style={{ padding: "11px 6px", borderRadius: 9, border: `1px solid ${time === t ? "var(--gold)" : "var(--line)"}`, background: time === t ? "var(--gold)" : "rgba(255,255,255,0.02)", color: time === t ? "#191305" : "var(--off)", fontWeight: time === t ? 700 : 400, fontSize: 13 }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                    <Actions onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!time} />
                  </StepWrap>
                )}

                {step === 5 && (
                  <StepWrap key="s5" label="Passo 5 de 6" title="Seus dados">
                    <div className="field">
                      <label>Nome completo</label>
                      <input type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Telefone / WhatsApp</label>
                      <input type="tel" placeholder="(41) 90000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <Actions onBack={() => setStep(4)} onNext={() => setStep(6)} nextDisabled={!name.trim() || !phone.trim()} nextLabel="Revisar" />
                  </StepWrap>
                )}

                {step === 6 && (
                  <StepWrap key="s6" label="Passo 6 de 6" title="Confirme seu agendamento">
                    <div className="glass" style={{ padding: 18, background: "rgba(205,164,78,0.07)", borderColor: "var(--line-gold)", marginBottom: 20 }}>
                      <SummaryRow k="Barbeiro" v={barber?.name} />
                      <SummaryRow k="Serviço" v={service?.name} />
                      <SummaryRow k="Data" v={formatDateLong(date)} />
                      <SummaryRow k="Horário" v={time} />
                      <SummaryRow k="Duração" v={formatDuration(service?.duration)} />
                      <SummaryRow k="Valor" v={formatBRL(service?.price)} />
                      <SummaryRow k="Nome" v={name} />
                      <SummaryRow k="Telefone" v={phone} />
                    </div>
                    {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 14 }}>{error}</div>}
                    <Actions onBack={() => setStep(5)} onNext={handleConfirm} nextLabel={submitting ? "Confirmando..." : "Confirmar agendamento"} nextDisabled={submitting} noArrow />
                  </StepWrap>
                )}
              </AnimatePresence>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "10px 0 4px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(111,174,124,0.15)", border: "1px solid var(--ok)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <CheckCircle size={30} color="var(--ok)" weight="bold" />
              </div>
              <h3>Agendamento confirmado!</h3>
              <p style={{ color: "var(--silver-dim)", fontSize: 14.5 }}>Seu horário está reservado. Chegue com 5 minutos de antecedência.</p>
              <button className="btn btn-gold" style={{ marginTop: 14 }} onClick={onClose}>Fechar</button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StepWrap({ label, title, children }) {
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
      <div style={{ fontSize: 12, color: "var(--gold)", fontFamily: "'JetBrains Mono'", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <h3 style={{ fontSize: 26, marginBottom: 22 }}>{title}</h3>
      {children}
    </motion.div>
  );
}

function OptionBtn({ selected, onClick, title, sub, right }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px", borderRadius: 12,
      border: `1px solid ${selected ? "var(--gold)" : "var(--line)"}`, background: selected ? "rgba(205,164,78,0.12)" : "rgba(255,255,255,0.02)",
      textAlign: "left", width: "100%", color: "var(--off)",
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--silver-dim)", marginTop: 2 }}>{sub}</div>
      </div>
      <div className="mono" style={{ color: "var(--gold)", fontSize: 14, whiteSpace: "nowrap" }}>{right}</div>
    </button>
  );
}

function Actions({ onBack, onNext, nextDisabled, nextLabel = "Continuar", noArrow }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26, gap: 10 }}>
      <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={15} /> Voltar</button>
      {onNext && (
        <button className="btn btn-gold" onClick={onNext} disabled={nextDisabled}>
          {nextLabel} {!noArrow && <ArrowRight size={15} />}
        </button>
      )}
    </div>
  );
}

function SummaryRow({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "6px 0", color: "var(--silver)" }}>
      <span>{k}</span>
      <b style={{ color: "var(--off)" }}>{v}</b>
    </div>
  );
}
